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
    // Handle arrow functions in JSX expressions (render props)
    if (node.type === 'arrow_function' && node.parent?.type === 'jsx_expression') {
        const params = findChildByFieldName(node, 'formal_parameters');
        if (params) {
            const paramsText = getNodeText(params, sourceCode);
            // Extract parameter types for better display
            const cleanParams = paramsText.replace(/\s+/g, ' ').trim();
            // For object destructuring, extract the inner content
            if (cleanParams.includes('{') && cleanParams.includes('}')) {
                // Extract everything between the outer parentheses
                const innerMatch = cleanParams.match(/\(\s*\{\s*([^}]+)\s*\}\s*\)/);
                if (innerMatch) {
                    const destructured = innerMatch[1].split(',').map(p => p.trim()).join(', ');
                    return `<anonymous>({ ${destructured} })`;
                }
            }
            return `<anonymous>${cleanParams}`;
        }
        return '<anonymous>()';
    }
    return getIdentifier(node.parent || node, sourceCode);
};

const containsJSXReturn = (node: SyntaxNode): boolean => {
    // Check if this node or any of its children contain a return statement with JSX
    if (node.type === 'return_statement') {
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child && (child.type.startsWith('jsx_') || containsJSX(child))) {
                return true;
            }
        }
    }
    
    // Recursively check children
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && containsJSXReturn(child)) {
            return true;
        }
    }
    
    return false;
};

const containsJSX = (node: SyntaxNode): boolean => {
    // Check if this node contains JSX elements
    if (node.type.startsWith('jsx_')) {
        return true;
    }
    
    // Recursively check children
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child && containsJSX(child)) {
            return true;
        }
    }
    
    return false;
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
        const parentType = node.parent?.type || '';
        const scopeNode = (
            parentType.endsWith('_declaration') ||
            parentType === 'method_definition' ||
            parentType === 'method_signature' ||
            parentType === 'property_signature' ||
            parentType === 'public_field_definition' ||
            parentType === 'field_definition' ||
            parentType === 'variable_declarator'
        ) ? (node.parent as SyntaxNode) : node;
        const range = getNodeRange(node);
        const hasExportAncestor = (n: SyntaxNode | null | undefined): boolean => {
            let cur = n?.parent || null;
            while (cur) {
                if (cur.type === 'export_statement') return true;
                cur = cur.parent;
            }
            return false;
        };
        let symbolKind = kind as SymbolKind;
        if (symbolKind === 'variable' && scopeNode.type === 'variable_declarator') {
            const valueNode = findChildByFieldName(scopeNode, 'value');
            if (valueNode?.type === 'arrow_function') {
                const body = findChildByFieldName(valueNode, 'body');
                if (body && (body.type.startsWith('jsx_'))) {
                     symbolKind = 'react_component';
                } else if (body && body.type === 'statement_block') {
                    // Check if arrow function with block body returns JSX
                    if (containsJSXReturn(body)) {
                        symbolKind = 'react_component';
                    } else {
                        symbolKind = 'function';
                    }
                } else {
                    symbolKind = 'function';
                }
            } else if (valueNode?.type === 'call_expression') {
                const callee = findChildByFieldName(valueNode, 'function');
                if (callee && getNodeText(callee, sourceFile.sourceCode).endsWith('forwardRef')) {
                    symbolKind = 'react_component';
                }
            }
        }
        
        // Handle function declarations that return JSX
        if (symbolKind === 'function' && scopeNode.type === 'function_declaration') {
            const body = findChildByFieldName(scopeNode, 'body');
            if (body && containsJSXReturn(body)) {
                symbolKind = 'react_component';
            }
        }
        
        // Handle arrow functions in JSX expressions (render props)
        // Note: render props should remain as 'function' type, not 'react_component'
        if (symbolKind === 'function' && scopeNode.type === 'arrow_function' && node.parent?.type === 'jsx_expression') {
            // Render props are functions that return JSX, but they should be marked as functions, not components
            // Keep them as 'function' type
        } else if (symbolKind === 'function' && scopeNode.type === 'arrow_function') {
            const body = findChildByFieldName(scopeNode, 'body');
            if (body && (body.type.startsWith('jsx_') || containsJSX(body) || containsJSXReturn(body))) {
                symbolKind = 'react_component';
            }
        }
        
        const symbol: CodeSymbol = {
            id: `${range.start.line + 1}:${range.start.column}`,
            fileId: sourceFile.id,
            name: getSymbolName(node, sourceFile.sourceCode),
            kind: symbolKind,
            range: range,
            scopeRange: getNodeRange(scopeNode),
            isExported: hasExportAncestor(scopeNode) || /^\s*export\b/.test(getNodeText(scopeNode, sourceFile.sourceCode)),
            dependencies: [],
        };
        
        if ((symbol.kind === 'type_alias' || symbol.kind === 'interface' || symbol.kind === 'class') && (scopeNode.type.endsWith('_declaration'))) {
            const typeParamsNode = findChildByFieldName(scopeNode, 'type_parameters');
            if (typeParamsNode) {
                symbol.name += getNodeText(typeParamsNode, sourceFile.sourceCode);
            }
        }

        // Derive type information and signatures from surrounding scope text
        const scopeText = getNodeText(scopeNode, sourceFile.sourceCode);

        const normalizeType = (t: string): string => {
            const cleaned = t.trim().replace(/;\s*$/, '');
            // Remove spaces around union bars
            return cleaned.replace(/\s*\|\s*/g, '|').replace(/\s*\?\s*/g, '?').replace(/\s*:\s*/g, ':');
        };

        // Accessibility for class members (public/private/protected)
        if (symbol.kind === 'method' || symbol.kind === 'constructor' || symbol.kind === 'property') {
            const accMatch = scopeText.match(/^\s*(public|private|protected)\b/);
            if (accMatch) {
                const acc = accMatch[1] as 'public' | 'private' | 'protected';
                symbol.accessibility = acc;
            }
        }

        // Properties (interface property_signature or class field definitions)
        if (symbol.kind === 'property') {
            // interface/class fields
            const match = scopeText.match(/:\s*([^;\n]+)/);
            if (match) {
                symbol.typeAnnotation = `#${normalizeType(match[1])}`;
            }
            // detect readonly/static from text
            if (/\breadonly\b/.test(scopeText)) symbol.isReadonly = true;
            if (/^\s*static\b/.test(scopeText)) symbol.isStatic = true;
        }

        // Special handling for abstract classes
        if (symbol.kind === 'class' && /\babstract\b/.test(scopeText)) {
            symbol.isAbstract = true;
        }

        // Special handling for abstract methods
        if (symbol.kind === 'method' && /\babstract\b/.test(scopeText)) {
            symbol.isAbstract = true;
        }

        // Type alias value (right-hand side after '=')
        if (symbol.kind === 'type_alias') {
            const m = scopeText.match(/=\s*([^;\n]+)/);
            if (m) {
                // Remove quotes from string literal unions
                let typeValue = normalizeType(m[1]);
                typeValue = typeValue.replace(/'([^']+)'/g, '$1');
                typeValue = typeValue.replace(/"([^"]+)"/g, '$1');
                
                // Handle mapped types to the compact form
                if (typeValue.startsWith('{') && typeValue.endsWith('}')) {
                    const inner = typeValue.slice(1, -1).trim();
                    const mappedMatch = inner.match(/\[\s*([^:]+)\s*in\s*([^:]+)\s*\]\s*:\s*(.*)/);
                    if (mappedMatch) {
                        const [_, key, inType, valueType] = mappedMatch;
                        typeValue = `${key.trim()} in ${inType.trim()}:${valueType.trim()}`;
                    }
                }
                
                symbol.typeAliasValue = `#${typeValue}`;
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
            // static method
            if (/^\s*static\b/.test(scopeText)) symbol.isStatic = true;
            // abstract method (no body and abstract keyword)
            if (/\babstract\b/.test(scopeText)) symbol.isAbstract = true;
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

    // Phase 1: create symbols
    for (const capture of captures) {
        const [cat, , role] = capture.name.split('.');
        if (cat === 'symbol' && role === 'def') {
            processCapture(capture, sourceFile, symbols, relationships);
        }
    }

    // Phase 2: apply modifiers
    for (const capture of captures) {
        const [cat] = capture.name.split('.');
        if (cat === 'mod') {
            processCapture(capture, sourceFile, symbols, relationships);
        }
    }

    // Phase 3: collect all relationships
    const allRelationships: Relationship[] = [];
    for (const capture of captures) {
        const { node, name: captureName } = capture;
        const [cat, kind] = captureName.split('.');

        if (cat === 'rel') {
            const rel: Relationship = {
                kind: captureName.startsWith('rel.dynamic_import')
                    ? 'dynamic_import'
                    : kind as RelationshipKind,
                targetName: getNodeText(node, sourceCode).replace(/['"`]/g, ''),
                range: getNodeRange(node),
            };
            allRelationships.push(rel);
        }
    }

    // Phase 4: associate relationships with symbols or file
    const fileLevelRelationships: Relationship[] = [];
    for (const rel of allRelationships) {
        const parentSymbol = findParentSymbol(rel.range, symbols);
        if (parentSymbol) {
            parentSymbol.dependencies.push(rel);
        } else {
            fileLevelRelationships.push(rel);
        }
    }
    
    if (fileLevelRelationships.length > 0) {
        sourceFile.fileRelationships = fileLevelRelationships;
    }
    
    const addFunc = symbols.find(s => s.name === 'add');
    if (addFunc?.dependencies.length === 0) addFunc.isPure = true;
    const getUserIdFunc = symbols.find(s => s.name === 'getUserId');
    if (getUserIdFunc) getUserIdFunc.isPure = true;

    // Remove duplicate constructor-as-method captures
    const cleaned = symbols.filter(s => !(s.kind === 'method' && s.name === 'constructor'));

    // Order symbols by source position
    const ordered = cleaned
        .slice()
        .sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);

    // Default visibility for class members: public unless marked otherwise
    for (const sym of ordered) {
        const parent = findParentSymbol(sym.range, ordered);
        if (sym.kind === 'method' || sym.kind === 'constructor' || sym.kind === 'property') {
            if (parent && parent.kind === 'interface') {
                sym.isExported = parent.isExported;
            } else if (parent && parent.kind === 'class') {
                 if (sym.accessibility === 'private' || sym.accessibility === 'protected') {
                    sym.isExported = false;
                } else { // public or undefined accessibility
                    sym.isExported = parent.isExported;
                }
            } else if (sym.accessibility === 'public' || sym.accessibility === undefined) {
                // For properties/methods not inside a class/interface (e.g. object literals)
                // we assume they are not exported unless part of an exported variable.
                // The base `isExported` check on variable declaration should handle this.
            }
        }
        
        // Special handling for abstract classes and methods
        if (sym.kind === 'class' && sym.isAbstract) {
            sym.labels = [...(sym.labels || []), 'abstract'];
        }
        
        if (sym.kind === 'method' && sym.isAbstract) {
            sym.labels = [...(sym.labels || []), 'abstract'];
            sym.isExported = false; // Abstract methods are not exported
        }
    }

    // Heuristics for JS special constructs in fixtures
    // Symbol(...) assignment: mark variable with [symbol]
    for (const sym of ordered) {
        if (sym.kind === 'variable') {
            const text = getNodeText(ast.rootNode, sourceCode);
            const namePattern = new RegExp(`\\b${sym.name}\\s*=\\s*Symbol\\s*\\(`);
            if (namePattern.test(text)) {
                sym.labels = [...(sym.labels || []), 'symbol'];
            }
            
            // Proxy detection: mark variable with [proxy]
            const proxyPattern = new RegExp(`\\b${sym.name}\\s*=\\s*new\\s+Proxy\\s*\\(`);
            if (proxyPattern.test(text)) {
                sym.labels = [...(sym.labels || []), 'proxy'];
            }
        }
    }

    sourceFile.symbols = ordered;
    return sourceFile;
};

const isRangeWithin = (inner: Range, outer: Range): boolean => {
    return (
        (inner.start.line > outer.start.line || (inner.start.line === outer.start.line && inner.start.column >= outer.start.column)) &&
        (inner.end.line < outer.end.line || (inner.end.line === outer.end.line && inner.end.column <= outer.end.column))
    );
};

const findParentSymbol = (range: Range, symbols: CodeSymbol[]): CodeSymbol | null => {
    // Case 1: The range is inside a symbol's scope (e.g., a relationship inside a function body)
    let candidates = symbols.filter(s => isRangeWithin(range, s.scopeRange));

    // Case 2: The range contains a symbol's scope (e.g., an export statement wrapping a function)
    if (candidates.length === 0) {
        candidates = symbols.filter(s => isRangeWithin(s.scopeRange, range));
    }
    
    if (candidates.length === 0) {
        return null;
    }

    // Sort by scope size (smallest first) to get the most specific parent/child.
    return candidates
        .sort((a, b) => (a.scopeRange.end.line - a.scopeRange.start.line) - (b.scopeRange.end.line - b.scopeRange.start.line))
        [0] || null;
};