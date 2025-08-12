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
        const scopeNode = node.parent?.type.endsWith('_declaration') || node.parent?.type === 'method_definition'
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

    for (const capture of captures) {
        processCapture(capture, sourceFile, symbols, relationships);
    }
    
    for (const rel of relationships) {
        const parentSymbol = findParentSymbol(rel.range, symbols);
        if (parentSymbol) {
            parentSymbol.dependencies.push(rel);
        }
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
    return symbols
        .filter(s => isRangeWithin(range, s.scopeRange))
        .sort((a, b) => (a.scopeRange.end.line - a.scopeRange.start.line) - (b.scopeRange.end.line - b.scopeRange.start.line))
        [0] || null;
};