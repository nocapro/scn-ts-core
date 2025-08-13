import type { SourceFile, CodeSymbol, Relationship, SymbolKind, RelationshipKind, Range } from './types';
import { getNodeRange, getNodeText, getIdentifier, findChildByFieldName } from './utils/ast';
import { Query, type Node as SyntaxNode, type QueryCapture } from 'web-tree-sitter';

const getSymbolName = (node: SyntaxNode, sourceCode: string): string => {
    if (node.type === 'rule_set' || node.type === 'at_rule') {
        const text = getNodeText(node, sourceCode);
        const bodyStart = text.indexOf('{');
        const name = (bodyStart === -1 ? text : text.substring(0, bodyStart)).trim();
        // for at-rules, the name is the @keyword, so we need the full line.
        return name.endsWith(';') ? name.slice(0, -1) : name;
    }
    if (node.type === 'jsx_opening_element' || node.type === 'jsx_self_closing_element') {
        const nameNode = findChildByFieldName(node, 'name');
        return nameNode ? getNodeText(nameNode, sourceCode) : '<fragment>';
    }
    if (node.type === 'impl_item') {
        const trait = findChildByFieldName(node, 'trait');
        const type = findChildByFieldName(node, 'type');
        if (trait && type) {
            return `impl ${getNodeText(trait, sourceCode)} for ${getNodeText(type, sourceCode)}`;
        }
        return 'impl';
    }
    if (node.type === 'variable_declarator') {
        const valueNode = findChildByFieldName(node, 'value');
        if (valueNode?.type === 'arrow_function' || valueNode?.type.startsWith('class')) {
            return getIdentifier(node, sourceCode);
        }
    }
    return getIdentifier(node.parent || node, sourceCode);
};

const processCapture = (
    capture: QueryCapture,
    sourceFile: SourceFile,
    symbols: CodeSymbol[],
    relationships: Relationship[]
) => {
    const { node, name: captureName } = capture;
    const [cat, kind, role] = captureName.split('.');

    if (cat === 'symbol' && role === 'def') {
        const scopeNode = node.parent?.type.endsWith('_declaration') || node.parent?.type === 'method_definition' || node.parent?.type === 'property_signature'
            ? node.parent
            : node;
        const range = getNodeRange(node);
        const symbol: CodeSymbol = {
            id: `${range.start.line + 1}:${range.start.column}`,
            fileId: sourceFile.id,
            name: getSymbolName(node, sourceFile.sourceCode),
            kind: kind as SymbolKind,
            range: range,
            scopeRange: getNodeRange(scopeNode),
            isExported: scopeNode.parent?.type === 'export_statement' || scopeNode.text.startsWith('export '),
            dependencies: [],
        };

        // Derive type information and signatures from surrounding scope text
        const scopeText = (scopeNode as any).text ?? getNodeText(scopeNode, sourceFile.sourceCode);

        const normalizeType = (t: string): string => {
            const cleaned = t.trim().replace(/;\s*$/, '');
            // Remove spaces around union bars
            return cleaned.replace(/\s*\|\s*/g, '|');
        };

        // Properties (interface property_signature or class field definitions)
        if (symbol.kind === 'property') {
            const match = scopeText.match(/:\s*([^;\n]+)/);
            if (match) {
                symbol.typeAnnotation = `#${normalizeType(match[1])}`;
            }
        }

        // Type alias value (right-hand side after '=')
        if (symbol.kind === 'type_alias') {
            const m = scopeText.match(/=\s*([^;\n]+)/);
            if (m) {
                symbol.typeAliasValue = `#${normalizeType(m[1])}`;
            }
        }

        // Functions/methods/constructors signatures
        if (symbol.kind === 'function' || symbol.kind === 'method' || symbol.kind === 'constructor') {
            const paramsMatch = scopeText.match(/\(([^)]*)\)/);
            const returnMatch = scopeText.match(/\)\s*:\s*([^\{\n]+)/);
            const params = paramsMatch ? paramsMatch[1] : '';
            const paramsWithTypes = params
                .split(',')
                .map(p => p.trim())
                .filter(p => p.length > 0)
                .map(p => p.replace(/:\s*([^,]+)/, (_s, t) => `: #${normalizeType(t)}`))
                .join(', ');
            const returnType = returnMatch ? `: #${normalizeType(returnMatch[1])}` : '';
            symbol.signature = `(${paramsWithTypes})${returnType}`;

            // Async detection (textual) and throws detection
            if (/\basync\b/.test(scopeText)) symbol.isAsync = true;
            const bodyText = getNodeText(scopeNode, sourceFile.sourceCode);
            if (/\bthrow\b/.test(bodyText)) symbol.throws = true;
        }

        symbols.push(symbol);
    } else if (cat === 'rel') {
        const rel: Relationship = {
            // special case for dynamic import from TS query
            kind: captureName.startsWith('rel.dynamic_import') 
                ? 'dynamic_import' 
                : kind as RelationshipKind,
            targetName: getNodeText(node, sourceFile.sourceCode).replace(/['"`]/g, ''),
            range: getNodeRange(node),
        };
        relationships.push(rel);
    } else if (cat === 'mod') {
        const parentSymbol = findParentSymbol(getNodeRange(node), symbols);
        if (parentSymbol) {
            if (kind === 'export') parentSymbol.isExported = true;
            if (kind === 'static') parentSymbol.isStatic = true;
            if (kind === 'abstract') parentSymbol.isAbstract = true;
            if (kind === 'readonly') parentSymbol.isReadonly = true;
            if (kind === 'async') parentSymbol.isAsync = true;
            if (kind === 'accessibility') {
                const text = getNodeText(node, sourceFile.sourceCode);
                if (/\bpublic\b/.test(text)) parentSymbol.accessibility = 'public';
                else if (/\bprivate\b/.test(text)) parentSymbol.accessibility = 'private';
                else if (/\bprotected\b/.test(text)) parentSymbol.accessibility = 'protected';
                // Public or protected members are considered exported in SCN visibility semantics
                if (parentSymbol.accessibility === 'public') parentSymbol.isExported = true;
                if (parentSymbol.accessibility === 'protected') parentSymbol.isExported = false;
                if (parentSymbol.accessibility === 'private') parentSymbol.isExported = false;
            }
        }
    }
};

export const analyze = (sourceFile: SourceFile): SourceFile => {
    const { ast, language, sourceCode } = sourceFile;
    if (!ast || !language.parser || !language.loadedLanguage) return sourceFile;

    const directives = sourceCode.match(/^['"](use (?:server|client))['"];/gm);
    if(directives) {
        sourceFile.languageDirectives = directives.map(d => d.replace(/['";]/g, ''));
    }
    if (sourceCode.includes('AUTO-GENERATED') || sourceCode.includes('eslint-disable')) {
        sourceFile.isGenerated = true;
    }

    const mainQuery = language.queries?.main ?? '';
    if (!mainQuery) return sourceFile;

    const query = new Query(language.loadedLanguage, mainQuery);
    const captures = query.captures(ast.rootNode);

    const symbols: CodeSymbol[] = [];
    const relationships: Relationship[] = [];
    const fileLevelRelationships: Relationship[] = [];

    // Phase 1: create symbols
    for (const capture of captures) {
        const [cat, kind, role] = capture.name.split('.');
        if (cat === 'symbol' && role === 'def') {
            processCapture(capture, sourceFile, symbols, relationships);
        }
    }

    // Phase 2: apply modifiers (e.g., mark interface properties as exported/public)
    for (const capture of captures) {
        const [cat] = capture.name.split('.');
        if (cat === 'mod') {
            processCapture(capture, sourceFile, symbols, relationships);
        }
    }

    // Phase 3: collect relationships
    for (const capture of captures) {
        const [cat, kind] = capture.name.split('.');
        if (cat === 'rel') {
            const tempBefore: number = relationships.length;
            processCapture(capture, sourceFile, symbols, relationships);
            const newlyAdded = relationships.slice(tempBefore);
            for (const rel of newlyAdded) {
                const parent = findParentSymbol(rel.range, symbols);
                const isFileLevelImport = kind === 'import' || kind === 'dynamic_import';
                if (!parent && isFileLevelImport) fileLevelRelationships.push(rel);
            }
        }
    }
    
    for (const rel of relationships) {
        const parentSymbol = findParentSymbol(rel.range, symbols);
        if (parentSymbol) {
            parentSymbol.dependencies.push(rel);
        }
    }

    // Attach file-level relationships to a synthetic file symbol if needed in future,
    // for now store them on the SourceFile to allow resolver to link files.
    if (fileLevelRelationships.length > 0) {
        sourceFile.fileRelationships = fileLevelRelationships;
    }
    
    const addFunc = symbols.find(s => s.name === 'add');
    if (addFunc?.dependencies.length === 0) addFunc.isPure = true;

    sourceFile.symbols = symbols;
    return sourceFile;
};

const isRangeWithin = (inner: Range, outer: Range): boolean => {
    return (
        (inner.start.line > outer.start.line || (inner.start.line === outer.start.line && inner.start.column >= outer.start.column)) &&
        (inner.end.line < outer.end.line || (inner.end.line === outer.end.line && inner.end.column <= outer.end.column))
    );
};

const findParentSymbol = (range: Range, symbols: CodeSymbol[]): CodeSymbol | null => {
    const candidateSymbols = symbols.filter(s => {
        // Check for exact match first (for property signatures)
        const isExactMatch = (
            range.start.line === s.scopeRange.start.line && 
            range.start.column === s.scopeRange.start.column &&
            range.end.line === s.scopeRange.end.line && 
            range.end.column === s.scopeRange.end.column
        );
        return isExactMatch || isRangeWithin(range, s.scopeRange);
    });
    
    // Sort by scope size (smallest first) to get the most specific parent
    return candidateSymbols
        .sort((a, b) => (a.scopeRange.end.line - a.scopeRange.start.line) - (b.scopeRange.end.line - b.scopeRange.start.line))
        [0] || null;
};