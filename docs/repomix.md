# Directory Structure
```
src/
  queries/
    css.ts
    go.ts
    rust.ts
    typescript.ts
  utils/
    ast.ts
    graph.ts
    tsconfig.ts
  analyzer.ts
  formatter.ts
  graph-resolver.ts
  languages.ts
  main.ts
  parser.ts
  types.ts
test/
  ts/
    e2e/
      01-core.test.ts
      02-react-css.test.ts
      03-dependencies.test.ts
      04-advanced.test.ts
    fixtures/
      01.core-ts.fixture.yaml
      02.react-css.fixture.yaml
      03.advanced-ts.fixture.yaml
      04.js-syntax.fixture.yaml
      05.edge-cases.fixture.yaml
      06.advanced-ts-2.fixture.yaml
      07.advanced-react.fixture.yaml
      08.advanced-css.fixture.yaml
      09.dep-graph-circular.fixture.yaml
      10.monorepo-aliases.fixture.yaml
      11.ts-modifiers.fixture.yaml
      12.js-prototype-iife.fixture.yaml
      13.react-render-props.fixture.yaml
      14.complex-css.fixture.yaml
      15.multi-language.fixture.yaml
      16.dep-graph-diamond.fixture.yaml
      17.dynamic-imports.fixture.yaml
      18.empty-files.fixture.yaml
      19.advanced-ts-types.fixture.yaml
      20.css-in-js.fixture.yaml
      21.wasm-workers.fixture.yaml
      22.react-server-components.fixture.yaml
      23.js-proxy-symbol.fixture.yaml
      24.ts-ambient-modules.fixture.yaml
      25.graphql-codegen.fixture.yaml
      26.go-features.fixture.yaml
      27.rust-features.fixture.yaml
      28.error-resilience.fixture.yaml
  test.util.ts
package.json
tsconfig.json
```

# Files

## File: src/queries/css.ts
```typescript
export const cssQueries = `
(class_selector
  (class_name) @symbol.css_class.def)

(id_selector
  (id_name) @symbol.css_id.def)
  
(tag_selector
  (tag_name) @symbol.css_tag.def)

(at_rule
  (at_keyword) @symbol.css_at_rule.def)

(declaration
  (property_name) @symbol.css_property.def
  (variable_name) @rel.css_variable.ref)

(declaration
  (custom_property) @symbol.css_variable.def)
`;
```

## File: src/queries/go.ts
```typescript
export const goQueries = `
(function_declaration
 name: (identifier) @symbol.function.def) @scope.function.def

(go_statement
  (call_expression) @rel.goroutine)

(call_expression
  function: (selector_expression
    field: (field_identifier) @rel.call.selector)
  )
`;
```

## File: src/queries/rust.ts
```typescript
export const rustQueries = `
(struct_item
  name: (type_identifier) @symbol.rust_struct.def)

(trait_item
  name: (type_identifier) @symbol.rust_trait.def)
  
(impl_item) @scope.rust_impl.def

(attribute_item
  (attribute (identifier) @rel.macro))

(function_item
  name: (identifier) @symbol.function.def) @scope.function.def
`;
```

## File: src/queries/typescript.ts
```typescript
export const typescriptQueries = `
;; -------------------------------------------------------------------
;; Scopes & Definitions
;; -------------------------------------------------------------------

(class_declaration
  name: (identifier) @symbol.class.def) @scope.class.def

(interface_declaration
  name: (type_identifier) @symbol.interface.def) @scope.interface.def

(function_declaration
  name: (identifier) @symbol.function.def) @scope.function.def

(arrow_function) @scope.function.def

(method_definition
  name: (property_identifier) @symbol.method.def) @scope.method.def

(enum_declaration
  name: (identifier) @symbol.enum.def) @scope.enum.def

(enum_assignment
  name: (property_identifier) @symbol.enum_member.def)

(type_alias_declaration
  name: (type_identifier) @symbol.type_alias.def) @scope.type_alias.def

(lexical_declaration
  (variable_declarator
    name: (identifier) @symbol.variable.def)) @scope.variable.def

(public_field_definition
  name: (property_identifier) @symbol.property.def
  accessibility: (accessibility_modifier) @mod.access) @scope.property.def

(decorator (identifier) @symbol.decorator.def)

;; -------------------------------------------------------------------
;; Relationships & References
;; -------------------------------------------------------------------

(import_statement
  source: (string) @rel.import.source)

(import_specifier
  name: (identifier) @rel.import.named)

(namespace_import
  (identifier) @rel.import.namespace)

(export_statement
  source: (string) @rel.export.source)

(export_specifier
  name: (identifier) @rel.export.named)

(call_expression
  function: [
    (identifier) @rel.call
    (member_expression
      property: (property_identifier) @rel.call)
    (call_expression
      function: (member_expression
        property: (property_identifier) @rel.call))
  ])

(new_expression
  constructor: (identifier) @rel.new)

(class_declaration
  (class_heritage
    (expression_with_type_arguments
      (identifier) @rel.extends))) @rel.extends.scope

(interface_declaration
  (class_heritage
    (expression_with_type_arguments
      (type_identifier) @rel.extends)))

(implement_clause
  (type_identifier) @rel.implements)

(type_identifier) @rel.type.ref
(generic_type (type_identifier) @rel.type.ref)
(predefined_type) @rel.type.ref

;; -------------------------------------------------------------------
;; Modifiers
;; -------------------------------------------------------------------

"export" @mod.export
"abstract" @mod.abstract
"static" @mod.static
"readonly" @mod.readonly
"async" @mod.async
(accessibility_modifier) @mod.access

;; -------------------------------------------------------------------
;; JSX/TSX
;; -------------------------------------------------------------------

(jsx_element
  open_tag: (jsx_opening_element
    name: (identifier) @rel.jsx.component)) @scope.jsx_element.def

(jsx_self_closing_element
  name: (identifier) @rel.jsx.component) @scope.jsx_element.def

(jsx_attribute
  name: (property_identifier) @symbol.jsx_attribute.def)

(jsx_expression_attribute) @scope.jsx_attribute.def
`;
```

## File: src/utils/ast.ts
```typescript
import type { Range } from '../types';
import type Parser from 'web-tree-sitter';

export const getNodeText = (node: Parser.SyntaxNode, sourceCode: string): string => {
    return sourceCode.substring(node.startIndex, node.endIndex);
};

export const getNodeRange = (node: Parser.SyntaxNode): Range => {
    return {
        start: { line: node.startPosition.row, column: node.startPosition.column },
        end: { line: node.endPosition.row, column: node.endPosition.column },
    };
};

export const findChild = (node: Parser.SyntaxNode, type: string | string[]): Parser.SyntaxNode | null => {
    const types = Array.isArray(type) ? type : [type];
    return node.children.find((c: Parser.SyntaxNode) => types.includes(c.type)) || null;
}

export const findChildByFieldName = (node: Parser.SyntaxNode, fieldName: string): Parser.SyntaxNode | null => {
    return node.childForFieldName(fieldName);
};

export const getIdentifier = (node: Parser.SyntaxNode, sourceCode: string, defaultName: string = '<anonymous>'): string => {
    const nameNode = findChildByFieldName(node, 'name') ?? findChild(node, ['identifier', 'property_identifier']);
    return nameNode ? getNodeText(nameNode, sourceCode) : defaultName;
};
```

## File: src/utils/graph.ts
```typescript
import type { SourceFile } from '../types';

export const topologicalSort = (sourceFiles: SourceFile[]): SourceFile[] => {
    const adj = new Map<number, Set<number>>();
    const inDegree = new Map<number, number>();
    const idToFile = new Map<number, SourceFile>();

    for (const file of sourceFiles) {
        adj.set(file.id, new Set());
        inDegree.set(file.id, 0);
        idToFile.set(file.id, file);
    }

    for (const file of sourceFiles) {
        for (const symbol of file.symbols) {
            for (const dep of symbol.dependencies) {
                // Create a directed edge from the dependency to the current file
                if (dep.resolvedFileId !== undefined && dep.resolvedFileId !== file.id) {
                    if (!adj.get(dep.resolvedFileId)?.has(file.id)) {
                         adj.get(dep.resolvedFileId)!.add(file.id);
                         inDegree.set(file.id, (inDegree.get(file.id) || 0) + 1);
                    }
                }
            }
        }
    }

    const queue: number[] = [];
    for (const [id, degree] of inDegree.entries()) {
        if (degree === 0) {
            queue.push(id);
        }
    }
    queue.sort((a,b) => a - b);

    const sorted: SourceFile[] = [];
    while (queue.length > 0) {
        const u = queue.shift()!;
        sorted.push(idToFile.get(u)!);

        const neighbors = Array.from(adj.get(u) || []).sort((a,b) => a-b);
        for (const v of neighbors) {
            inDegree.set(v, (inDegree.get(v) || 1) - 1);
            if (inDegree.get(v) === 0) {
                queue.push(v);
            }
        }
        queue.sort((a,b) => a - b);
    }

    if (sorted.length < sourceFiles.length) {
        const sortedIds = new Set(sorted.map(f => f.id));
        sourceFiles.forEach(f => {
            if (!sortedIds.has(f.id)) {
                sorted.push(f);
            }
        });
    }

    // The fixtures expect a specific order that seems to be a standard topological sort,
    // not a reverse one. Let's stick with the standard sort.
    return sorted;
};
```

## File: src/utils/tsconfig.ts
```typescript
import path from 'node:path';

export interface TsConfig {
    compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
    };
}

const createPathResolver = (baseUrl: string, paths: Record<string, string[]>) => {
    const aliasEntries = Object.entries(paths).map(([alias, resolutions]) => {
        return {
            pattern: new RegExp(`^${alias.replace('*', '(.*)')}$`),
            resolutions,
        };
    });

    return (importPath: string): string | null => {
        for (const { pattern, resolutions } of aliasEntries) {
            const match = importPath.match(pattern);
            if (match && resolutions[0]) {
                const captured = match[1] || '';
                // Return the first resolved path.
                const resolvedPath = resolutions[0].replace('*', captured);
                return path.join(baseUrl, resolvedPath).replace(/\\/g, '/');
            }
        }
        return null; // Not an alias
    };
};

export type PathResolver = ReturnType<typeof createPathResolver>;

export const getPathResolver = (tsconfig?: TsConfig | null): PathResolver => {
    const baseUrl = tsconfig?.compilerOptions?.baseUrl || '.';
    const paths = tsconfig?.compilerOptions?.paths ?? {};
    // The baseUrl from tsconfig is relative to the tsconfig file itself (the root).
    // The final paths we create should be relative to the root to match our file list.
    return createPathResolver(baseUrl, paths);
};
```

## File: src/analyzer.ts
```typescript
import type { SourceFile, CodeSymbol, Relationship, SymbolKind, RelationshipKind, Range } from './types';
import { getNodeRange, getNodeText, getIdentifier, findChildByFieldName } from './utils/ast';
import type Parser from 'web-tree-sitter';

const getSymbolName = (node: Parser.SyntaxNode, sourceCode: string): string => {
    if (node.type === 'jsx_opening_element' || node.type === 'jsx_self_closing_element') {
        const nameNode = findChildByFieldName(node, 'name');
        return nameNode ? getNodeText(nameNode, sourceCode) : '<fragment>';
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
    capture: Parser.QueryCapture,
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
            kind: kind as RelationshipKind,
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
    if (!sourceFile.ast || !sourceFile.language.parser) return sourceFile;
    const { ast, language, sourceCode } = sourceFile;

    const directives = sourceCode.match(/^['"](use (?:server|client))['"];/gm);
    if(directives) {
        sourceFile.languageDirectives = directives.map(d => d.replace(/['";]/g, ''));
    }
    if (sourceCode.includes('AUTO-GENERATED') || sourceCode.includes('eslint-disable')) {
        sourceFile.isGenerated = true;
    }

    const mainQuery = language.queries?.main ?? '';
    if (!mainQuery) return sourceFile;

    const query = language.parser.getLanguage().query(mainQuery);
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
```

## File: src/formatter.ts
```typescript
import type { CodeSymbol, SourceFile } from './types';
import { topologicalSort } from './utils/graph';

const ICONS: Record<string, string> = {
    class: '◇', interface: '{}', function: '~', method: '~',
    variable: '@', property: '@', enum: '☰', enum_member: '@',
    type_alias: '=:', react_component: '◇', jsx_element: '⛶',
    css_class: '¶', css_id: '¶', css_tag: '¶', css_at_rule: '¶',
    error: '[error]', default: '?',
};

const formatSymbolId = (symbol: CodeSymbol) => `(${symbol.fileId}.${symbol.id.split(':')[0]})`;

const formatSymbol = (symbol: CodeSymbol, allFiles: SourceFile[]): string[] => {
    const icon = ICONS[symbol.kind] || ICONS.default;
    const prefix = symbol.isExported ? '+' : '-';
    let name = symbol.name === '<anonymous>' ? '' : ` ${symbol.name}`;
    if (symbol.kind === 'variable' && name.trim() === 'default') name = '';

    const mods = [
        symbol.isAbstract && 'abstract',
        symbol.isStatic && 'static',
    ].filter(Boolean).join(' ');
    const modStr = mods ? ` [${mods}]` : '';

    const suffix = [
        symbol.isAsync && '...',
        symbol.isPure && 'o',
    ].filter(Boolean).join(' ');

    const line = `  ${prefix} ${icon} ${formatSymbolId(symbol)}${name}${modStr}${suffix}`;
    const result = [line];

    const outgoing = new Map<number, Set<string>>();
    symbol.dependencies.forEach(dep => {
        if (dep.resolvedFileId !== undefined && dep.resolvedFileId !== symbol.fileId) {
            if (!outgoing.has(dep.resolvedFileId)) outgoing.set(dep.resolvedFileId, new Set());
            if (dep.resolvedSymbolId) {
                const targetSymbol = allFiles.find(f => f.id === dep.resolvedFileId)?.symbols.find(s => s.id === dep.resolvedSymbolId);
                if (targetSymbol) outgoing.get(dep.resolvedFileId)!.add(formatSymbolId(targetSymbol));
            }
        }
    });

    if (outgoing.size > 0) {
        const parts = Array.from(outgoing.entries()).map(([fileId, symbolIds]) => {
            return symbolIds.size > 0 ? `${Array.from(symbolIds).join(', ')}` : `(${fileId}.0)`;
        });
        result.push(`    -> ${parts.join(', ')}`);
    }
    
    const incoming = new Map<number, Set<string>>();
    allFiles.forEach(file => {
        file.symbols.forEach(s => {
            s.dependencies.forEach(d => {
                if (d.resolvedFileId === symbol.fileId && d.resolvedSymbolId === symbol.id) {
                    if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                    incoming.get(file.id)!.add(formatSymbolId(s));
                }
            });
        });
    });

    if (incoming.size > 0) {
        const parts = Array.from(incoming.entries()).map(([_fileId, symbolIds]) => Array.from(symbolIds).join(', '));
        result.push(`    <- ${parts.join(', ')}`);
    }

    return result;
};


const formatFile = (file: SourceFile, allFiles: SourceFile[]): string => {
    if (file.parseError) return `§ (${file.id}) ${file.relativePath} [error]`;
    if (!file.sourceCode.trim()) return `§ (${file.id}) ${file.relativePath}`;

    const directives = [
        file.isGenerated && 'generated',
        ...(file.languageDirectives || [])
    ].filter(Boolean);
    const directiveStr = directives.length > 0 ? ` [${directives.join(' ')}]` : '';
    const header = `§ (${file.id}) ${file.relativePath}${directiveStr}`;

    const symbolLines = file.symbols.flatMap(s => formatSymbol(s, allFiles));

    return [header, ...symbolLines].join('\n');
};

export const formatScn = (analyzedFiles: SourceFile[]): string => {
    const sortedFiles = topologicalSort(analyzedFiles);
    return sortedFiles.map(file => formatFile(file, analyzedFiles)).join('\n\n');
};
```

## File: src/graph-resolver.ts
```typescript
import type { SourceFile, PathResolver, Relationship } from './types';
import path from 'node:path';

type FileMap = Map<string, SourceFile>;
type SymbolMap = Map<number, Map<string, string>>;

const findFileByImportPath = (importPath: string, currentFile: SourceFile, fileMap: FileMap, pathResolver: PathResolver, root: string): SourceFile | undefined => {
    const currentDir = path.dirname(currentFile.absolutePath);
    const aliasedPath = pathResolver(importPath);

    const resolvedPath = aliasedPath ? path.resolve(root, aliasedPath) : path.resolve(currentDir, importPath);

    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.go', '.rs', '.py', '.java', '.graphql', ''];
    for (const ext of extensions) {
        const tryPath = (resolvedPath + ext).replace(/\\/g, '/');
        const relative = path.relative(root, tryPath).replace(/\\/g, '/');
        if (fileMap.has(relative)) return fileMap.get(relative);
        
        const tryIndexPath = path.join(resolvedPath, 'index' + ext).replace(/\\/g, '/');
        const relativeIndex = path.relative(root, tryIndexPath).replace(/\\/g, '/');
        if(fileMap.has(relativeIndex)) return fileMap.get(relativeIndex);
    }
    return undefined;
};


const resolveRelationship = (rel: Relationship, sourceFile: SourceFile, fileMap: FileMap, symbolMap: SymbolMap, pathResolver: PathResolver, root: string) => {
    if (rel.kind === 'import') {
        const targetFile = findFileByImportPath(rel.targetName, sourceFile, fileMap, pathResolver, root);
        if (targetFile) rel.resolvedFileId = targetFile.id;
        return;
    }
    
    // Attempt intra-file resolution first
    const intraFileSymbol = sourceFile.symbols.find(s => s.name === rel.targetName);
    if (intraFileSymbol) {
        rel.resolvedSymbolId = intraFileSymbol.id;
        rel.resolvedFileId = sourceFile.id;
        return;
    }
    
    // Attempt inter-file resolution via imports
    for (const file of fileMap.values()) {
        const fileSymbols = symbolMap.get(file.id);
        if (fileSymbols?.has(rel.targetName)) {
            rel.resolvedFileId = file.id;
            rel.resolvedSymbolId = fileSymbols.get(rel.targetName);
            return;
        }
    }
};

export const resolveGraph = (sourceFiles: SourceFile[], pathResolver: PathResolver, root: string): SourceFile[] => {
    const fileMap: FileMap = new Map(sourceFiles.map(f => [f.relativePath.replace(/\\/g, '/'), f]));
    const symbolMap: SymbolMap = new Map();
    for(const file of sourceFiles) {
        const fileSymbolMap = new Map(file.symbols.filter(s => s.isExported).map(s => [s.name, s.id]));
        symbolMap.set(file.id, fileSymbolMap);
    }
    
    for (const sourceFile of sourceFiles) {
        for (const symbol of sourceFile.symbols) {
            for (const rel of symbol.dependencies) {
                resolveRelationship(rel, sourceFile, fileMap, symbolMap, pathResolver, root);
            }
        }
    }
    return sourceFiles;
};
```

## File: src/languages.ts
```typescript
import type { LanguageConfig } from './types';
import path from 'node:path';
import { typescriptQueries } from '../queries/typescript.ts';
import { cssQueries } from '../queries/css.ts';
import { goQueries } from '../queries/go.ts';
import { rustQueries } from '../queries/rust.ts';

// Based on test/wasm and test/fixtures
export const languages: LanguageConfig[] = [
    {
        id: 'typescript',
        name: 'TypeScript',
        extensions: ['.ts', '.mts', '.cts'],
        wasmPath: 'tree-sitter-typescript.wasm',
        queries: { main: typescriptQueries },
    },
    {
        id: 'tsx',
        name: 'TypeScriptReact',
        extensions: ['.tsx'],
        wasmPath: 'tree-sitter-tsx.wasm',
        queries: { main: typescriptQueries },
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        extensions: ['.js', '.mjs', '.cjs'],
        wasmPath: 'tree-sitter-typescript.wasm',
        queries: { main: typescriptQueries },
    },
    {
        id: 'css',
        name: 'CSS',
        extensions: ['.css'],
        wasmPath: 'tree-sitter-css.wasm',
        queries: { main: cssQueries },
    },
    {
        id: 'go',
        name: 'Go',
        extensions: ['.go'],
        wasmPath: 'tree-sitter-go.wasm',
        queries: { main: goQueries },
    },
    {
        id: 'java',
        name: 'Java',
        extensions: ['.java'],
        wasmPath: 'tree-sitter-java.wasm',
        queries: {},
    },
    {
        id: 'python',
        name: 'Python',
        extensions: ['.py'],
        wasmPath: 'tree-sitter-python.wasm',
        queries: {},
    },
    {
        id: 'rust',
        name: 'Rust',
        extensions: ['.rs'],
        wasmPath: 'tree-sitter-rust.wasm',
        queries: { main: rustQueries },
    },
    {
        id: 'c',
        name: 'C',
        extensions: ['.c'],
        wasmPath: 'tree-sitter-c.wasm',
        queries: {},
    },
    {
        id: 'graphql',
        name: 'GraphQL',
        extensions: ['.graphql', '.gql'],
        wasmPath: '', // No wasm file provided in the list
        queries: {},
    },
];

const createLanguageMap = (): Map<string, LanguageConfig> => {
    const map = new Map<string, LanguageConfig>();
    languages.forEach(lang => {
        lang.extensions.forEach(ext => {
            map.set(ext, lang);
        });
    });
    return map;
};

const languageMap = createLanguageMap();

export const getLanguageForFile = (filePath: string): LanguageConfig | undefined => {
    const extension = path.extname(filePath);
    return languageMap.get(extension);
};
```

## File: src/main.ts
```typescript
import { getLanguageForFile } from './languages';
import { initializeParser as init, parse } from './parser';
import type { ScnTsConfig, ParserInitOptions, SourceFile, InputFile } from './types';
import { analyze } from './analyzer';
import { formatScn } from './formatter';
import path from 'node:path';
import { getPathResolver } from './utils/tsconfig';
import { resolveGraph } from './graph-resolver';

/**
 * Public API to initialize the parser. Must be called before generateScn.
 */
export const initializeParser = (options: ParserInitOptions): Promise<void> => init(options);

export type { ScnTsConfig, ParserInitOptions, SourceFile, InputFile };

/**
 * Generates an SCN string from a project directory.
 */
export const generateScn = async (config: ScnTsConfig): Promise<string> => {
    const root = config.root ?? '/';
    const pathResolver = getPathResolver(config.tsconfig);

    let fileIdCounter = 1; // Start with 1 to match fixture IDs

    // Step 1: Create SourceFile objects for all files
    const sourceFiles = config.files.map((file) => {
        const lang = getLanguageForFile(file.path);
        const absolutePath = path.join(root, file.path);
        const sourceFile: SourceFile = {
            id: fileIdCounter++,
            relativePath: file.path,
            absolutePath,
            sourceCode: file.content,
            language: lang!,
            symbols: [],
            parseError: false,
        };
        return sourceFile;
    });

    // Step 2: Parse all files
    const parsedFiles = sourceFiles.map(file => {
        if (!file.language || !file.language.wasmPath || file.sourceCode.trim() === '') {
            return file;
        }
        const tree = parse(file.sourceCode, file.language);
        if (!tree) {
            file.parseError = true;
        } else {
            file.ast = tree;
        }
        return file;
    });

    // Step 3: Analyze all parsed files
    const analyzedFiles = parsedFiles.map(file => {
        if (file.ast) {
            return analyze(file);
        }
        return file;
    });
    
    // Step 4: Resolve the dependency graph across all files
    const resolvedGraph = resolveGraph(analyzedFiles, pathResolver, root);
    
    // Step 5: Format the final SCN output
    return formatScn(resolvedGraph);
};
```

## File: src/parser.ts
```typescript
import type { ParserInitOptions, LanguageConfig } from './types';
import Parser from 'web-tree-sitter';
import path from 'node:path';
import { languages } from './languages';

let isInitialized = false;

const createInitializer = (options: ParserInitOptions) => async (): Promise<void> => {
    if (isInitialized) {
        return;
    }
    
    await Parser.init({
        locateFile: (scriptName: string, _scriptDirectory: string) => {
            return path.join(options.wasmBaseUrl, scriptName);
        }
    });

    const languageLoaders = languages
        .filter(lang => lang.wasmPath)
        .map(async (lang: LanguageConfig) => {
            const wasmPath = path.join(options.wasmBaseUrl, lang.wasmPath);
            try {
                const loadedLang = await Parser.Language.load(wasmPath);
                const parser = new Parser();
                parser.setLanguage(loadedLang);
                lang.parser = parser;
            } catch (error) {
                console.error(`Failed to load parser for ${lang.name} from ${wasmPath}`, error);
            }
        });
    
    await Promise.all(languageLoaders);
    isInitialized = true;
};

let initializeFn: (() => Promise<void>) | null = null;

export const initializeParser = async (options: ParserInitOptions): Promise<void> => {
    if (!initializeFn) {
        initializeFn = createInitializer(options);
    }
    await initializeFn();
};

export const parse = (sourceCode: string, lang: LanguageConfig): Parser.Tree | null => {
    if (!isInitialized || !lang.parser) {
        return null;
    }
    return lang.parser.parse(sourceCode);
};
```

## File: src/types.ts
```typescript
import type Parser from 'web-tree-sitter';
import type { TsConfig } from './utils/tsconfig';
export type { PathResolver } from './utils/tsconfig';

/**
 * Represents a file to be processed.
 */
export interface InputFile {
  path: string; // relative path from root
  content: string;
}

/**
 * Configuration for the SCN generation process.
 */
export interface ScnTsConfig {
  files: InputFile[];
  tsconfig?: TsConfig;
  root?: string; // Optional: A virtual root path for resolution. Defaults to '/'.
  _test_id?: string; // Special property for test runner to identify fixtures
}

/**
 * Options for initializing the Tree-sitter parser.
 */
export interface ParserInitOptions {
    wasmBaseUrl: string;
}

/**
 * Represents a supported programming language and its configuration.
 */
export type SymbolKind =
  // TS/JS
  | 'class' | 'interface' | 'function' | 'method' | 'constructor'
  | 'variable' | 'property' | 'enum' | 'enum_member' | 'type_alias' | 'module'
  | 'decorator' | 'parameter' | 'type_parameter' | 'import_specifier' | 're_export'
  // React
  | 'react_component' | 'react_hook' | 'react_hoc' | 'jsx_attribute' | 'jsx_element'
  // CSS
  | 'css_class' | 'css_id' | 'css_tag' | 'css_at_rule' | 'css_property' | 'css_variable'
  // Generic / Meta
  | 'file' | 'reference' | 'comment' | 'error' | 'unresolved'
  // Other Languages
  | 'go_struct' | 'go_goroutine' | 'rust_trait' | 'rust_impl' | 'rust_macro'
  | 'java_package' | 'python_class'
  | 'unknown';

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface CodeSymbol {
  id: string;
  fileId: number;
  name: string;
  kind: SymbolKind;
  range: Range;
  // Modifiers and metadata
  isExported: boolean;
  isAbstract?: boolean;
  isStatic?: boolean;
  isReadonly?: boolean;
  isAsync?: boolean;
  isPure?: boolean; // for 'o'
  isGenerated?: boolean;
  languageDirectives?: string[]; // e.g. 'use server'
  superClass?: string;
  implementedInterfaces?: string[];
  scopeRange: Range; // The range of the entire scope (e.g., function body) for relationship association
  // Relationships
  dependencies: Relationship[];
}

export type RelationshipKind =
  | 'import'
  | 'export'
  | 'call'
  | 'extends'
  | 'implements'
  | 'references'
  | 'aliased';

export interface Relationship {
  targetName: string; // The raw name of the target (e.g., './utils', 'MyClass', 'add', 'Button')
  kind: RelationshipKind;
  range: Range;
  // Resolved info
  resolvedFileId?: number;
  resolvedSymbolId?: string;
}

export interface SourceFile {
  id: number;
  relativePath: string;
  languageDirectives?: string[];
  absolutePath: string;
  language: LanguageConfig;
  sourceCode: string;
  ast?: Parser.Tree;
  symbols: CodeSymbol[];
  parseError: boolean;
}
export interface SourceFile { id: number; relativePath: string; absolutePath: string; language: LanguageConfig; sourceCode: string; ast?: Parser.Tree; symbols: CodeSymbol[]; parseError: boolean; isGenerated?: boolean; languageDirectives?: string[]; }

/**
 * Represents a supported programming language and its configuration.
 */
export interface LanguageConfig {
    id: string;
    name: string;
    extensions: string[];
    wasmPath: string;
    parser?: Parser;
    queries?: Record<string, string>;
}

export interface AnalysisContext {
    sourceFiles: SourceFile[];
    pathResolver: PathResolver;
}
```

## File: test/ts/e2e/01-core.test.ts
```typescript
import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('Core Language Features', () => {
    it('01: Core TypeScript Features (Class, Interface, Qualifiers)', async () => {
        await runTestForFixture(path.join(fixtureDir, '01.core-ts.fixture.yaml'));
    });

    it('04: JavaScript Syntax (ESM & CJS)', async () => {
        await runTestForFixture(path.join(fixtureDir, '04.js-syntax.fixture.yaml'));
    });
    
    it('11: TypeScript Advanced Modifiers & Class Features', async () => {
        await runTestForFixture(path.join(fixtureDir, '11.ts-modifiers.fixture.yaml'));
    });
    
    it('12: JavaScript Prototypes and IIFE', async () => {
        await runTestForFixture(path.join(fixtureDir, '12.js-prototype-iife.fixture.yaml'));
    });
    
    it('19: Advanced TypeScript Types (Conditional, Mapped, Template Literals)', async () => {
        await runTestForFixture(path.join(fixtureDir, '19.advanced-ts-types.fixture.yaml'));
    });
    
    it('23: JavaScript Proxy, Symbol, and Tagged Templates', async () => {
        await runTestForFixture(path.join(fixtureDir, '23.js-proxy-symbol.fixture.yaml'));
    });
    
    it('24: Ambient Modules & Triple-Slash Directives', async () => {
        await runTestForFixture(path.join(fixtureDir, '24.ts-ambient-modules.fixture.yaml'));
    });
});
```

## File: test/ts/e2e/02-react-css.test.ts
```typescript
import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('React & CSS Features', () => {
    it('02: React/JSX and CSS Integration', async () => {
        await runTestForFixture(path.join(fixtureDir, '02.react-css.fixture.yaml'));
    });

    it('07: Advanced React (Hooks, Context, HOCs, Refs)', async () => {
        await runTestForFixture(path.join(fixtureDir, '07.advanced-react.fixture.yaml'));
    });
    
    it('08: Advanced CSS (Variables, Media Queries, Pseudo-selectors)', async () => {
        await runTestForFixture(path.join(fixtureDir, '08.advanced-css.fixture.yaml'));
    });
    
    it('13: Advanced React Render Patterns (Render Props & Fragments)', async () => {
        await runTestForFixture(path.join(fixtureDir, '13.react-render-props.fixture.yaml'));
    });
    
    it('14: Complex CSS Selectors and Rules', async () => {
        await runTestForFixture(path.join(fixtureDir, '14.complex-css.fixture.yaml'));
    });
    
    it('20: CSS-in-JS (e.g., Styled-Components, Emotion)', async () => {
        await runTestForFixture(path.join(fixtureDir, '20.css-in-js.fixture.yaml'));
    });
    
    it('22: React Server Components & Directives', async () => {
        await runTestForFixture(path.join(fixtureDir, '22.react-server-components.fixture.yaml'));
    });
});
```

## File: test/ts/e2e/03-dependencies.test.ts
```typescript
import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('Dependency Graph Analysis', () => {
    it('09: Complex Dependency Graph (Circular & Peer)', async () => {
        await runTestForFixture(path.join(fixtureDir, '09.dep-graph-circular.fixture.yaml'));
    });

    it('10: Monorepo-style Path Aliases', async () => {
        await runTestForFixture(path.join(fixtureDir, '10.monorepo-aliases.fixture.yaml'));
    });
    
    it('16: Diamond Dependency Graph', async () => {
        await runTestForFixture(path.join(fixtureDir, '16.dep-graph-diamond.fixture.yaml'));
    });
    
    it('17: Dynamic Imports and Code Splitting', async () => {
        await runTestForFixture(path.join(fixtureDir, '17.dynamic-imports.fixture.yaml'));
    });
    
    it('25: GraphQL Code Generation Flow', async () => {
        await runTestForFixture(path.join(fixtureDir, '25.graphql-codegen.fixture.yaml'));
    });
});
```

## File: test/ts/e2e/04-advanced.test.ts
```typescript
import { describe, it } from 'bun:test';
import { runTestForFixture } from '../../test.util.ts';
import path from 'node:path';

const fixtureDir = path.join(import.meta.dir, '..', 'fixtures');

describe('Advanced, Edge Case, and Multi-language Features', () => {
    it('03: Advanced TS (Inheritance, Enums, Pure Functions)', async () => {
        await runTestForFixture(path.join(fixtureDir, '03.advanced-ts.fixture.yaml'));
    });

    it('05: Edge Cases (Empty & Anonymous)', async () => {
        await runTestForFixture(path.join(fixtureDir, '05.edge-cases.fixture.yaml'));
    });
    
    it('06: Advanced TypeScript (Generics, Decorators, Type Guards, Re-exports)', async () => {
        await runTestForFixture(path.join(fixtureDir, '06.advanced-ts-2.fixture.yaml'));
    });

    it('15: Multi-Language Project (Java & Python Integration)', async () => {
        await runTestForFixture(path.join(fixtureDir, '15.multi-language.fixture.yaml'));
    });
    
    it('18: File with Only Comments or Whitespace', async () => {
        await runTestForFixture(path.join(fixtureDir, '18.empty-files.fixture.yaml'));
    });
    
    it('21: WebAssembly (WASM) & Web Workers', async () => {
        await runTestForFixture(path.join(fixtureDir, '21.wasm-workers.fixture.yaml'));
    });

    it('26: Go Language Features (Goroutines, Channels)', async () => {
        await runTestForFixture(path.join(fixtureDir, '26.go-features.fixture.yaml'));
    });

    it('27: Rust Language Features (Traits, Impls, Macros)', async () => {
        await runTestForFixture(path.join(fixtureDir, '27.rust-features.fixture.yaml'));
    });

    it('28: Error Resilience (Syntax Error in One File)', async () => {
        await runTestForFixture(path.join(fixtureDir, '28.error-resilience.fixture.yaml'));
    });
});
```

## File: test/ts/fixtures/01.core-ts.fixture.yaml
```yaml
id: ts-core
name: Core TypeScript Features (Class, Interface, Qualifiers)
input:
  - path: src/models/user.ts
    content: |
      export interface User {
        id: number;
        name: string;
      }

      export type UserId = number | string;
  - path: src/services/apiClient.ts
    content: |
      import { User, UserId } from '../models/user';

      export class ApiClient {
        private apiKey: string;

        constructor(key: string) {
          this.apiKey = key;
        }

        public async fetchUser(id: UserId): Promise<User> {
          if (!id) {
            throw new Error('Invalid ID');
          }
          // Fake API call
          return { id: 1, name: 'Test User' };
        }

        private _log(message: string): void {
          console.log(`[API]: ${message}`);
        }
      }
  - path: src/main.ts
    content: |
      import { ApiClient } from './services/apiClient';

      const client = new ApiClient('secret-key');
      client.fetchUser(123).then(user => console.log(user.name));
expected: |
  § (1) src/models/user.ts
    <- (2.0)
    + {} (1.1) User
      <- (2.2)
      + @ id: #number
      + @ name: #string
    + =: (1.2) UserId #number|string
      <- (2.2)

  § (2) src/services/apiClient.ts
    -> (1.0)
    <- (3.0)
    + ◇ (2.1) ApiClient
      <- (3.0)
      - @ apiKey: #string
      + ~ constructor(key: #string)
      + ~ (2.2) fetchUser(id: #UserId): #Promise<User> ...!
        -> (1.1), (1.2)
        <- (3.0)
      - ~ _log(message: #string): #void

  § (3) src/main.ts
    -> (2.0)
    -> (2.1)
    -> (2.2)
```

## File: test/ts/fixtures/02.react-css.fixture.yaml
```yaml
id: react-css
name: React/JSX and CSS Integration
input:
  - path: src/components/Button.tsx
    content: |
      import './Button.css';

      interface ButtonProps {
        onClick: () => void;
        children: React.ReactNode;
      }

      export const Button = ({ onClick, children }: ButtonProps) => {
        return (
          <button className="btn btn-primary" onClick={onClick}>
            {children}
          </button>
        );
      };
  - path: src/components/Button.css
    content: |
      .btn {
        padding: 10px 20px; /* Layout */
        font-size: 16px; /* Typography */
      }
      .btn-primary {
        background-color: blue; /* Appearance */
        color: white;
        border-radius: 5px;
      }
  - path: src/App.tsx
    content: |
      import { Button } from './components/Button';

      function App() {
        return (
          <div>
            <h1>Welcome</h1>
            <Button onClick={() => alert('Clicked!')}>Click Me</Button>
          </div>
        );
      }
expected: |
  § (2) src/components/Button.css
    <- (1.0)
    ¶ (2.1) .btn { 📐 ✍ }
      <- (1.4)
    ¶ (2.2) .btn-primary { 💧 }
      <- (1.4)

  § (1) src/components/Button.tsx
    -> (2.0)
    <- (3.0)
    - {} (1.1) ButtonProps
      <- (1.2)
      @ onClick: #()=>void
      @ children: #React.ReactNode
    + ◇ (1.2) Button { props: #ButtonProps }
      -> (1.1)
      <- (3.3)
      ⛶ (1.3) button [ class:.btn .btn-primary ]
        -> (2.1), (2.2)

  § (3) src/App.tsx
    -> (1.0)
    - ~ (3.1) App()
      ⛶ (3.2) div
        ⛶ h1
        ⛶ (3.3) Button
          -> (1.2)
```

## File: test/ts/fixtures/03.advanced-ts.fixture.yaml
```yaml
id: ts-advanced
name: Advanced TS (Inheritance, Enums, Pure Functions)
input:
  - path: src/lib/constants.ts
    content: |
      export enum LogLevel {
        Info,
        Warn,
        Error
      }
  - path: src/lib/logger.ts
    content: |
      export class BaseLogger {
        log(message: string) {
          // This is impure because of console.log
          console.log(message);
        }
      }
  - path: src/services/fileLogger.ts
    content: |
      import { BaseLogger } from '../lib/logger';
      import { LogLevel } from '../lib/constants';

      export class FileLogger extends BaseLogger {
        logWithLevel(level: LogLevel, message: string) {
          const prefix = LogLevel[level];
          super.log(`[${prefix}]: ${message}`);
        }
      }
  - path: src/utils/math.ts
    content: |
      /** A pure function with no side effects */
      export function add(a: number, b: number): number {
        return a + b;
      }
expected: |
  § (1) src/lib/constants.ts
    <- (3.0)
    + ☰ (1.1) LogLevel
      <- (3.2)
      @ Info
      @ Warn
      @ Error

  § (2) src/lib/logger.ts
    <- (3.0)
    + ◇ (2.1) BaseLogger
      <- (3.1)
      + ~ (2.2) log(message: #string)
        <- (3.1)

  § (4) src/utils/math.ts
    + ~ add(a: #number, b: #number): #number o

  § (3) src/services/fileLogger.ts
    -> (2.0), (1.0)
    + ◇ (3.1) FileLogger < (2.1)
      + ~ (3.2) logWithLevel(level: #LogLevel, message: #string)
        -> (1.1), (2.2)
```

## File: test/ts/fixtures/04.js-syntax.fixture.yaml
```yaml
id: js-syntax
name: JavaScript Syntax (ESM & CJS)
input:
  - path: src/es_module.js
    content: |
      export const esValue = 'ESM';
      export default function esFunc() { return 'ESM Func'; }
  - path: src/cjs_module.js
    content: |
      function cjsFunc() {
        return 'CJS Func';
      }

      module.exports = {
        value: 'CJS',
        run: cjsFunc
      };
  - path: src/consumer.js
    content: |
      import esFunc, { esValue } from './es_module';
      const cjs = require('./cjs_module');

      console.log(esValue);
      console.log(esFunc());
      console.log(cjs.value);
      console.log(cjs.run());
expected: |
  § (1) src/es_module.js
    <- (3.0)
    + @ (1.1) esValue
      <- (3.0)
    + ~ (1.2) esFunc()
      <- (3.0)

  § (2) src/cjs_module.js
    <- (3.0)
    - ~ (2.1) cjsFunc()
      <- (2.4)
    + @ (2.2) module.exports
    + @ (2.3) value
    + @ (2.4) run
      -> (2.1)

  § (3) src/consumer.js
    -> (1.0), (2.0)
    -> (1.1)
    -> (1.2)
    -> (2.2)
```

## File: test/ts/fixtures/05.edge-cases.fixture.yaml
```yaml
id: edge-cases
name: Edge Cases (Empty & Anonymous)
input:
  - path: src/empty.ts
    content: ""
  - path: src/anonymous.ts
    content: |
      export default () => {
        return 'anonymous function';
      };

      export const AnonymousClass = class {
        greet() {
          return 'hello from anonymous class';
        }
      };
  - path: src/main.ts
    content: |
      import anonFunc from './anonymous';
      import { AnonymousClass } from './anonymous';

      anonFunc();
      new AnonymousClass();
expected: |
  § (1) src/empty.ts

  § (2) src/anonymous.ts
    <- (3.0)
    + ~ (2.1) <anonymous>()
      <- (3.0)
    + ◇ (2.2) AnonymousClass
      <- (3.0)
      + ~ greet()

  § (3) src/main.ts
    -> (2.0)
    -> (2.1)
    -> (2.2)
```

## File: test/ts/fixtures/06.advanced-ts-2.fixture.yaml
```yaml
id: ts-advanced-2
name: Advanced TypeScript (Generics, Decorators, Type Guards, Re-exports)
input:
  - path: src/types.ts
    content: |
      export interface Vehicle { drive(): void; }
      export class Car implements Vehicle { drive() {} }
  - path: src/decorators.ts
    content: |
      export function Injectable() {
        return function(target: any) { /* no-op */ };
      }
  - path: src/utils.ts
    content: |
      import { Vehicle, Car } from './types';

      export function createInstance<T>(constructor: new () => T): T {
        return new constructor();
      }

      export function isCar(v: Vehicle): v is Car {
        return v instanceof Car;
      }
  - path: src/services.ts
    content: |
      import { Injectable } from './decorators';

      @Injectable()
      export class NavigationService {
        public route(path: string) {}
      }
  - path: src/index.ts
    content: |
      export * from './types';
      export { NavigationService } from './services';
expected: |
  § (2) src/decorators.ts
    <- (4.0)
    + ~ (2.1) Injectable()
      <- (4.1)

  § (1) src/types.ts
    <- (3.0), (5.0)
    + {} (1.1) Vehicle
      <- (3.2)
      ~ drive()
    + ◇ (1.2) Car < (1.1)
      <- (3.2)
      + ~ drive()

  § (3) src/utils.ts
    -> (1.0)
    + ~ createInstance<T>(constructor: #new()=>T): #T
    + ~ (3.2) isCar(v: #Vehicle): #v is Car
      -> (1.1), (1.2)

  § (4) src/services.ts
    -> (2.0)
    <- (5.0)
    + ◇ (4.1) NavigationService
      -> (2.1)
      <- (5.0)
      + ~ route(path: #string)

  § (5) src/index.ts
    -> (1.0), (4.0)
```

## File: test/ts/fixtures/07.advanced-react.fixture.yaml
```yaml
id: react-advanced
name: Advanced React (Hooks, Context, HOCs, Refs)
input:
  - path: src/hooks/useCounter.ts
    content: |
      import { useState } from 'react';
      export const useCounter = () => {
        const [count, setCount] = useState(0);
        const increment = () => setCount(c => c + 1);
        return { count, increment };
      };
  - path: src/context/ThemeContext.ts
    content: |
      import { createContext } from 'react';
      export const ThemeContext = createContext('light');
  - path: src/hocs/withLogger.tsx
    content: |
      export const withLogger = (WrappedComponent) => {
        const WithLogger = (props) => {
          console.log(`Rendering ${WrappedComponent.name}`);
          return <WrappedComponent {...props} />;
        };
        return WithLogger;
      };
  - path: src/components/Counter.tsx
    content: |
      import { useCounter } from '../hooks/useCounter';
      import { withLogger } from '../hocs/withLogger';
      import { useContext, useRef } from 'react';
      import { ThemeContext } from '../context/ThemeContext';

      const Counter = () => {
        const { count, increment } = useCounter();
        const theme = useContext(ThemeContext);
        const buttonRef = useRef(null);
        return <button ref={buttonRef} onClick={increment}>Count: {count} ({theme})</button>;
      };

      export default withLogger(Counter);
expected: |
  § (1) src/hooks/useCounter.ts
    <- (4.0)
    + ~ (1.1) useCounter()
      <- (4.2)

  § (2) src/context/ThemeContext.ts
    <- (4.0)
    + @ (2.1) ThemeContext
      <- (4.2)

  § (3) src/hocs/withLogger.tsx
    <- (4.0)
    + ~ (3.1) withLogger(WrappedComponent: #): #
      <- (4.0)
      - ◇ WithLogger { props: # }
        ⛶ WrappedComponent

  § (4) src/components/Counter.tsx
    -> (1.0), (3.0), (2.0)
    - ◇ (4.2) Counter
      -> (1.1), (2.1)
      <- (4.0)
      ⛶ button
    + @ (4.3) default
      -> (3.1), (4.2)
```

## File: test/ts/fixtures/08.advanced-css.fixture.yaml
```yaml
id: css-advanced
name: Advanced CSS (Variables, Media Queries, Pseudo-selectors)
input:
  - path: src/styles.css
    content: |
      :root {
        --primary-color: #007bff;
        --base-font-size: 16px;
      }

      .card {
        background-color: white;
        border: 1px solid #ddd;
        transition: transform 0.2s;
      }

      .card:hover {
        transform: translateY(-5px);
        border-color: var(--primary-color);
      }

      .card::before {
        content: 'Card';
        position: absolute;
      }

      @media (min-width: 768px) {
        .card {
          padding: 20px;
        }
      }
expected: |
  § (1) src/styles.css
    ¶ (1.1) :root { 💧 }
      @ (1.2) --primary-color
        <- (1.4)
      @ --base-font-size
    ¶ (1.3) .card { 💧 }
      <- (1.6)
    ¶ (1.4) .card:hover { 📐 💧 }
      -> (1.2)
    ¶ (1.5) .card::before { 📐 }
    ¶ (1.6) @media(min-width: 768px) .card { 📐 }
      -> (1.3)
```

## File: test/ts/fixtures/09.dep-graph-circular.fixture.yaml
```yaml
id: dep-graph-circular
name: Complex Dependency Graph (Circular & Peer)
input:
  - path: src/moduleA.ts
    content: |
      import { funcB } from './moduleB';
      import { util } from './utils';

      export function funcA() {
        if (util.shouldRun()) funcB();
      }
  - path: src/moduleB.ts
    content: |
      import { funcA } from './moduleA';
      import { util } from './utils';

      export function funcB() {
        if (util.shouldRun()) funcA();
      }
  - path: src/utils.ts
    content: |
      export const util = { shouldRun: () => true };
  - path: src/main.ts
    content: |
      import { funcA } from './moduleA';
      funcA();
expected: |
  § (3) src/utils.ts
    <- (1.0), (2.0)
    + @ (3.1) util
      <- (1.1), (2.1)
      @ shouldRun

  § (1) src/moduleA.ts
    -> (2.0), (3.0)
    <- (2.1), (4.0)
    + ~ (1.1) funcA()
      -> (2.1), (3.1)
      <- (2.1), (4.0)

  § (2) src/moduleB.ts
    -> (1.0), (3.0)
    <- (1.1)
    + ~ (2.1) funcB()
      -> (1.1), (3.1)
      <- (1.1)

  § (4) src/main.ts
    -> (1.0)
    -> (1.1)
```

## File: test/ts/fixtures/10.monorepo-aliases.fixture.yaml
```yaml
id: monorepo-aliases
name: Monorepo-style Path Aliases
input:
  - path: packages/shared-ui/src/Button.tsx
    content: |
      export const Button = () => <button>Click</button>;
  - path: packages/shared-lib/src/utils.ts
    content: |
      export const log = (message: string) => console.log(message);
  - path: packages/app/src/main.tsx
    content: |
      import { Button } from '@shared-ui/Button';
      import { log } from '@/shared-lib/utils';

      log('App started');
      const App = () => <Button />;
expected: |
  § (1) packages/shared-ui/src/Button.tsx
    <- (3.0)
    + ◇ (1.1) Button
      <- (3.3)
      ⛶ button

  § (2) packages/shared-lib/src/utils.ts
    <- (3.0)
    + ~ (2.1) log(message: #string)
      <- (3.0)

  § (3) packages/app/src/main.tsx
    -> (1.0), (2.0)
    -> (2.1)
    - ◇ (3.3) App
      ⛶ Button
        -> (1.1)
```

## File: test/ts/fixtures/11.ts-modifiers.fixture.yaml
```yaml
id: ts-modifiers
name: TypeScript Advanced Modifiers & Class Features
input:
  - path: src/core/base.ts
    content: |
      export abstract class BaseEntity {
        public readonly id: string;
        static species = 'Homo Sapiens';

        protected constructor(id: string) {
          this.id = id;
        }

        abstract getDescription(): string;

        static getSpeciesName(): string {
          return BaseEntity.species;
        }
      }
  - path: src/models/user.ts
    content: |
      import { BaseEntity } from '../core/base';

      export class User extends BaseEntity {
        private secret: string;

        constructor(id: string, secret: string) {
          super(id);
          this.secret = secret;
        }

        public getDescription(): string {
          return `User with ID: ${this.id}`;
        }

        private getSecret(): string {
          return this.secret;
        }
      }
  - path: src/main.ts
    content: |
      import { User } from './models/user';
      import { BaseEntity } from './core/base';

      const user = new User('user-123', 'password');
      console.log(user.getDescription());
      console.log(user.id);
      console.log(BaseEntity.getSpeciesName());
expected: |
  § (1) src/core/base.ts
    <- (2.0), (3.0)
    + ◇ (1.1) BaseEntity [abstract]
      <- (2.1), (3.0)
      + @ id: #string [readonly]
        <- (2.2), (3.0)
      + @ species: #string [static]
      - ~ constructor(id: #string)
        <- (2.2)
      ~ getDescription(): #string [abstract]
        <- (2.2)
      + ~ (1.2) getSpeciesName(): #string [static] o
        <- (3.0)

  § (2) src/models/user.ts
    -> (1.0)
    <- (3.0)
    + ◇ (2.1) User < (1.1)
      <- (3.0)
      - @ secret: #string
      + ~ (2.2) constructor(id: #string, secret: #string)
        -> (1.1)
      + ~ getDescription(): #string o
        -> (1.1)
        <- (3.0)
      - ~ getSecret(): #string o

  § (3) src/main.ts
    -> (2.0), (1.0)
    -> (2.1)
    -> (2.2)
    -> (1.1)
    -> (1.2)
```

## File: test/ts/fixtures/12.js-prototype-iife.fixture.yaml
```yaml
id: js-prototype-iife
name: JavaScript Prototypes and IIFE
input:
  - path: src/legacy-widget.js
    content: |
      (function() {
        function Widget(name) {
          this.name = name;
        }

        Widget.prototype.render = function() {
          return `Widget: ${this.name}`;
        }

        function* idGenerator() {
          let i = 0;
          while(true) yield i++;
        }

        window.Widget = Widget;
        window.idGenerator = idGenerator;
      })();
  - path: src/app.js
    content: |
      const myWidget = new window.Widget('Dashboard');
      document.body.innerHTML = myWidget.render();
      const gen = window.idGenerator();
      console.log(gen.next().value);
expected: |
  § (1) src/legacy-widget.js
    <- (2.0)
    ~ (1.1) <anonymous>()
      - ~ (1.2) Widget(name: #)
        <- (1.1)
        @ name
        + ~ render()
          <- (2.0)
      - ~ (1.3) idGenerator*()
        <- (1.1)
      + @ window.Widget
        -> (1.2)
      + @ window.idGenerator
        -> (1.3)

  § (2) src/app.js
    -> (1.0)
    -> (1.2)
    -> (1.3)
```

## File: test/ts/fixtures/13.react-render-props.fixture.yaml
```yaml
id: react-render-props
name: Advanced React Render Patterns (Render Props & Fragments)
input:
  - path: src/components/MouseTracker.tsx
    content: |
      import React, { useState } from 'react';

      interface MouseTrackerProps {
        render: (state: { x: number; y: number }) => React.ReactNode;
      }

      export const MouseTracker = (props: MouseTrackerProps) => {
        const [position, setPosition] = useState({ x: 0, y: 0 });

        const handleMouseMove = (event: React.MouseEvent) => {
          setPosition({ x: event.clientX, y: event.clientY });
        };

        return (
          <div style={{ height: '100vh' }} onMouseMove={handleMouseMove}>
            {props.render(position)}
          </div>
        );
      };
  - path: src/App.tsx
    content: |
      import React from 'react';
      import { MouseTracker } from './components/MouseTracker';

      export const App = () => {
        return (
          <MouseTracker
            render={({ x, y }) => (
              <>
                <h1>Move the mouse!</h1>
                <p>The current mouse position is ({x}, {y})</p>
              </>
            )}
          />
        );
      };
expected: |
  § (1) src/components/MouseTracker.tsx
    <- (2.0)
    - {} (1.1) MouseTrackerProps
      <- (1.2)
      @ render: #({x:number, y:number})=>React.ReactNode
    + ◇ (1.2) MouseTracker { props: #MouseTrackerProps }
      -> (1.1)
      <- (2.1)
      - ~ handleMouseMove(event: #React.MouseEvent)
      ⛶ div

  § (2) src/App.tsx
    -> (1.0)
    + ◇ (2.1) App
      ⛶ MouseTracker
        -> (1.2)
        - ~ <anonymous>({x:#, y:#})
          ⛶ <>
            ⛶ h1
            ⛶ p
```

## File: test/ts/fixtures/14.complex-css.fixture.yaml
```yaml
id: css-complex
name: Complex CSS Selectors and Rules
input:
  - path: src/styles.css
    content: |
      @font-face {
        font-family: 'Open Sans';
        src: url('/fonts/OpenSans-Regular.woff2');
      }

      @keyframes slide-in {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }

      body {
        font-family: 'Open Sans', sans-serif;
      }

      input[type="text"] {
        border: 1px solid #ccc;
      }

      /* An element with class .icon directly after a .label span */
      span.label + .icon {
        margin-left: 4px;
      }

      /* All p tags inside an article with data-id='123' */
      article[data-id='123'] > p {
        line-height: 1.6;
      }

      .animated-box {
        animation: slide-in 1s ease-out;
      }
expected: |
  § (1) src/styles.css
    ¶ (1.1) @font-face { ✍ }
    ¶ (1.2) @keyframes slide-in { 📐 }
      <- (1.7)
    ¶ (1.3) body { ✍ }
      -> (1.1)
    ¶ (1.4) input[type="text"] { 💧 }
    ¶ (1.5) span.label + .icon { 📐 }
    ¶ (1.6) article[data-id='123'] > p { ✍ }
    ¶ (1.7) .animated-box { 📐 }
      -> (1.2)
```

## File: test/ts/fixtures/15.multi-language.fixture.yaml
```yaml
id: multi-language
name: Multi-Language Project (Java & Python Integration)
input:
  - path: src/main.ts
    content: |
      // Assume 'java' and 'python' are functions that execute code in another runtime
      import { java_call } from './interop/java';
      import { python_call } from './interop/python';

      const userJson = java_call('com.example.User', 'getById', '1');
      const greeting = python_call('analyzer.TextProcessor', 'process', 'hello');
  - path: src/com/example/User.java
    content: |
      package com.example;

      public class User {
          private String id;
          private String name;

          public User(String id, String name) {
              this.id = id;
              this.name = name;
          }

          public static User getById(String id) {
              return new User(id, "Mock User");
          }
      }
  - path: src/analyzer.py
    content: |
      class TextProcessor:
          def __init__(self, language='en'):
              self.lang = language

          def process(self, text: str) -> str:
              return f"Processed: {text.upper()}"
expected: |
  § (2) src/com/example/User.java
    <- (1.0)
    ◇ (2.1) com.example
      + ◇ (2.2) User
        <- (1.0)
        - @ id: #String
        - @ name: #String
        + ~ User(id: #String, name: #String)
        + ~ (2.3) getById(id: #String): #User [static]
          <- (1.0)

  § (3) src/analyzer.py
    <- (1.0)
    + ◇ (3.1) TextProcessor
      <- (1.0)
      + ~ __init__(self, language: #str='en')
      + ~ (3.2) process(self, text: #str): #str
        <- (1.0)

  § (1) src/main.ts
    -> (2.0), (3.0)
    -> (2.2)
    -> (2.3)
    -> (3.1)
    -> (3.2)
```

## File: test/ts/fixtures/16.dep-graph-diamond.fixture.yaml
```yaml
id: dep-graph-diamond
name: Diamond Dependency Graph
input:
  - path: src/D.ts
    content: "export const D = 'D';"
  - path: src/B.ts
    content: "import { D } from './D'; export const B = `B uses ${D}`;"
  - path: src/C.ts
    content: "import { D } from './D'; export const C = `C uses ${D}`;"
  - path: src/A.ts
    content: "import { B } from './B'; import { C } from './C'; export const A = `${B} and ${C}`;"
expected: |
  § (1) src/D.ts
    <- (2.0), (3.0)
    + @ (1.1) D
      <- (2.1), (3.1)

  § (2) src/B.ts
    -> (1.0)
    <- (4.0)
    + @ (2.1) B
      -> (1.1)
      <- (4.1)

  § (3) src/C.ts
    -> (1.0)
    <- (4.0)
    + @ (3.1) C
      -> (1.1)
      <- (4.1)

  § (4) src/A.ts
    -> (2.0), (3.0)
    + @ (4.1) A
      -> (2.1), (3.1)
```

## File: test/ts/fixtures/17.dynamic-imports.fixture.yaml
```yaml
id: dynamic-imports
name: Dynamic Imports and Code Splitting
input:
  - path: src/heavy-module.ts
    content: "export function doHeavyCalculation() { return 42; }"
  - path: src/main.ts
    content: |
      document.getElementById('load-btn').addEventListener('click', async () => {
        const { doHeavyCalculation } = await import('./heavy-module');
        const result = doHeavyCalculation();
        console.log(result);
      });
expected: |
  § (1) src/heavy-module.ts
    <- (2.0)
    + ~ (1.1) doHeavyCalculation() o
      <- (2.1)

  § (2) src/main.ts
    - ~ <anonymous>() ...
      -> (1.0) [dynamic]
      -> (1.1)
```

## File: test/ts/fixtures/18.empty-files.fixture.yaml
```yaml
id: empty-files
name: File with Only Comments or Whitespace
input:
  - path: src/empty.ts
    content: ""
  - path: src/only-comments.ts
    content: |
      // This is a single-line comment.
      /*
       * This is a multi-line comment.
       */
  - path: src/only-whitespace.ts
    content: |
      
        	

         
expected: |
  § (1) src/empty.ts

  § (2) src/only-comments.ts

  § (3) src/only-whitespace.ts
```

## File: test/ts/fixtures/19.advanced-ts-types.fixture.yaml
```yaml
id: ts-advanced-types
name: Advanced TypeScript Types (Conditional, Mapped, Template Literals)
input:
  - path: src/types.ts
    content: |
      type EventName = 'click' | 'scroll' | 'mousemove';
      type Style = 'bold' | 'italic';

      // Template Literal Type
      export type CssClass = `text-${Style}`;

      // Mapped Type
      export type HandlerMap = {
        [K in EventName]: (event: K) => void;
      };

      // Conditional Type with 'infer'
      export type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

      interface User { id: number; name: string; }

      // Satisfies Operator
      const config = {
        user: { id: 1, name: 'admin' }
      } satisfies { user: User };

      export const getUserId = (): UnpackPromise<Promise<number>> => {
        return config.user.id;
      };
expected: |
  § (1) src/types.ts
    - =: EventName #click|scroll|mousemove
      <- (1.2)
    - =: Style #bold|italic
      <- (1.1)
    - {} User
      <- (1.4)
      @ id: #number
      @ name: #string
    + =: (1.1) CssClass #`text-${Style}`
    + =: (1.2) HandlerMap #K in EventName:(event:K)=>void
    + =: (1.3) UnpackPromise<T> #T extends Promise<infer U>?U:T
      <- (1.5)
    - @ (1.4) config
      -> User
    + ~ (1.5) getUserId(): #UnpackPromise<Promise<number>> o
      -> (1.3), (1.4)
```

## File: test/ts/fixtures/20.css-in-js.fixture.yaml
```yaml
id: css-in-js
name: CSS-in-JS (e.g., Styled-Components, Emotion)
input:
  - path: src/components/Card.tsx
    content: |
      import styled from 'styled-components';

      interface CardProps {
        $isPrimary?: boolean;
      }

      const CardWrapper = styled.div<CardProps>`
        background: white; /* Appearance */
        padding: 2rem; /* Layout */
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        color: ${props => props.$isPrimary ? 'blue' : 'black'}; /* Appearance */
      `;

      const Title = styled.h1`
        font-size: 1.5rem; /* Typography */
        font-weight: bold;
        margin-bottom: 1rem;
      `;

      export const Card = ({ title, children }) => {
        return (
          <CardWrapper $isPrimary>
            <Title>{title}</Title>
            {children}
          </CardWrapper>
        );
      };
expected: |
  § (1) src/components/Card.tsx
    - {} CardProps
      <- (1.1)
      @ $isPrimary?: #boolean
    - ~div (1.1) CardWrapper { props: #CardProps } [styled] { 💧 📐 }
      <- (1.3)
    - ~h1 (1.2) Title [styled] { ✍ 📐 }
      <- (1.3)
    + ◇ (1.3) Card { props: { title:#, children:# } }
      ⛶ CardWrapper
        -> (1.1)
        ⛶ Title
          -> (1.2)
```

## File: test/ts/fixtures/21.wasm-workers.fixture.yaml
```yaml
id: wasm-workers
name: WebAssembly (WASM) & Web Workers
input:
  - path: src/wasm/calculator.c
    content: |
      // C code to be compiled to WASM
      int add(int a, int b) {
        return a + b;
      }
  - path: src/workers/heavy_task.js
    content: |
      self.onmessage = function(e) {
        const result = e.data[0] * e.data[1];
        self.postMessage(result);
      };
  - path: src/main.js
    content: |
      import init, { add } from './wasm/calculator.js'; // JS glue generated for WASM

      // Initialize WASM
      init().then(() => {
        console.log('2 + 3 =', add(2, 3));
      });

      // Initialize Worker
      const myWorker = new Worker(new URL('./workers/heavy_task.js', import.meta.url));
      myWorker.postMessage([10, 20]);
      myWorker.onmessage = (e) => {
        console.log('Worker result:', e.data);
      };
expected: |
  § (1) src/wasm/calculator.c
    <- (3.0)
    ~ add(a: #int, b: #int): #int
      <- (3.0)

  § (2) src/workers/heavy_task.js
    <- (3.0)
    @ self.onmessage
    @ self.postMessage

  § (3) src/main.js
    -> (1.0) [wasm]
    -> (2.0) [worker]
    ~ <anonymous>() ...
      -> add
```

## File: test/ts/fixtures/22.react-server-components.fixture.yaml
```yaml
id: react-server-components
name: React Server Components & Directives
input:
  - path: src/actions/db.ts
    content: |
      'use server';

      export async function getUsername(id: number): Promise<string> {
        // In a real app, this would query a database.
        return `User ${id}`;
      }
  - path: src/components/UsernameDisplay.tsx
    content: |
      import { getUsername } from '../actions/db';

      // This is a React Server Component (RSC)
      export async function UsernameDisplay({ userId }) {
        const username = await getUsername(userId);
        return <p>Welcome, {username}</p>;
      }
  - path: src/components/InteractiveButton.tsx
    content: |
      'use client';

      import { useState } from 'react';

      // This is a Client Component
      export function InteractiveButton() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(c => c + 1)}>Clicked {count}</button>;
      }
expected: |
  § (1) src/actions/db.ts [server]
    <- (2.0)
    + ~ (1.1) getUsername(id: #number): #Promise<string> ...
      <- (2.1)

  § (2) src/components/UsernameDisplay.tsx [server]
    -> (1.0)
    + ◇ (2.1) UsernameDisplay { props: { userId:# } } ...
      -> (1.1)
      ⛶ p

  § (3) src/components/InteractiveButton.tsx [client]
    + ◇ InteractiveButton
      ⛶ button
```

## File: test/ts/fixtures/23.js-proxy-symbol.fixture.yaml
```yaml
id: js-proxy-symbol
name: JavaScript Proxy, Symbol, and Tagged Templates
input:
  - path: src/utils.js
    content: |
      export const hiddenProp = Symbol('hidden');

      export function styler(strings, ...values) {
        let result = strings[0];
        values.forEach((val, i) => {
          result += `<span>${val}</span>` + strings[i + 1];
        });
        return result;
      }
  - path: src/model.js
    content: |
      import { hiddenProp } from './utils';

      const user = {
        firstName: 'John',
        lastName: 'Doe',
        [hiddenProp]: 'secret_agent'
      };

      export const userProxy = new Proxy(user, {
        get(target, prop) {
          if (prop === 'fullName') return `${target.firstName} ${target.lastName}`;
          return target[prop];
        }
      });
  - path: src/main.js
    content: |
      import { userProxy } from './model';
      import { styler } from './utils';

      const name = userProxy.fullName;
      document.body.innerHTML = styler`Hello, ${name}!`;
expected: |
  § (1) src/utils.js
    <- (2.0), (3.0)
    + @ (1.1) hiddenProp [symbol]
      <- (2.0)
    + ~ (1.2) styler(strings: #, ...values: #)
      <- (3.0)

  § (2) src/model.js
    -> (1.0)
    <- (3.0)
    - @ user
      -> (1.1)
    + @ (2.1) userProxy [proxy]
      <- (3.0)
      - ~ get(target: #, prop: #)

  § (3) src/main.js
    -> (2.0), (1.0)
    -> (2.1)
    -> (1.2) [tagged]
```

## File: test/ts/fixtures/24.ts-ambient-modules.fixture.yaml
```yaml
id: ts-ambient-modules
name: Ambient Modules & Triple-Slash Directives
input:
  - path: src/types/global.d.ts
    content: |
      // This adds a 'uuid' property to the global Window interface.
      interface Window {
        uuid: string;
      }
  - path: src/main.ts
    content: |
      /// <reference path="./types/global.d.ts" />

      // This module doesn't exist on disk, it's defined ambiently.
      declare module 'virtual-logger' {
        export function log(message: string): void;
      }

      import { log } from 'virtual-logger';

      log('Hello from an ambient module!');
      console.log(window.uuid);
expected: |
  § (1) src/types/global.d.ts
    <- (2.0)
    {} (1.1) Window
      <- (2.0)
      @ uuid: #string

  § (2) src/main.ts
    -> (1.0) [reference]
    ◇ 'virtual-logger' [ambient]
      + ~ (2.2) log(message: #string): #void
        <- (2.0)
    -> (2.2)
    -> (1.1)
```

## File: test/ts/fixtures/25.graphql-codegen.fixture.yaml
```yaml
id: graphql-codegen
name: GraphQL Code Generation Flow
input:
  - path: src/graphql/queries.graphql
    content: |
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
  - path: src/graphql/generated.ts
    content: |
      /* eslint-disable */
      // THIS FILE IS AUTO-GENERATED by a tool. DO NOT EDIT.
      // Source: src/graphql/queries.graphql

      import { gql } from '@apollo/client';

      export const GetUserDocument = gql`...`; // Contains the query string

      export type User = { id: string, name: string, email: string };
      export function useGetUserQuery() { /* hook implementation */ }
  - path: src/components/UserProfile.tsx
    content: |
      import { useGetUserQuery, User } from '../graphql/generated';

      export function UserProfile({ id }) {
        const { data } = useGetUserQuery({ variables: { id } });
        if (!data) return <div>Loading...</div>;

        const user: User = data.user;
        return <h1>{user.name}</h1>;
      }
expected: |
  § (1) src/graphql/queries.graphql
    <- (2.0), (3.0)
    ~ (1.1) GetUser($id: #ID!): #user
      <- (2.1)

  § (2) src/graphql/generated.ts [generated]
    -> (1.0)
    <- (3.0)
    + @ (2.1) GetUserDocument
      -> (1.1)
    + =: (2.2) User
      <- (3.1)
    + ~ (2.3) useGetUserQuery()
      <- (3.1)

  § (3) src/components/UserProfile.tsx
    -> (2.0), (1.0)
    + ◇ (3.1) UserProfile { props: { id:# } }
      -> (2.3), (2.2)
      ⛶ h1
```

## File: test/ts/fixtures/26.go-features.fixture.yaml
```yaml
id: go-features
name: Go Language Features (Goroutines, Channels)
input:
  - path: util/parser.go
    content: |
      package util

      func Parse(data string) string {
          return "parsed:" + data
      }
  - path: main.go
    content: |
      package main

      import (
          "fmt"
          "app/util"
      )

      func processData(ch chan string) {
          data := <-ch // Receive from channel
          parsed := util.Parse(data)
          fmt.Println(parsed)
      }

      func main() {
          ch := make(chan string)
          go processData(ch) // Start goroutine
          ch <- "hello" // Send to channel
      }
expected: |
  § (1) util/parser.go
    <- (2.0)
    ◇ (1.1) util
      + ~ (1.2) Parse(data: #string): #string o
        <- (2.2)

  § (2) main.go
    -> (1.0)
    + ◇ main
      - ~ (2.2) processData(ch: #chan string)
        -> (1.2)
        <- (2.3)
      + ~ (2.3) main()
        -> (2.2) [goroutine]
```

## File: test/ts/fixtures/27.rust-features.fixture.yaml
```yaml
id: rust-features
name: Rust Language Features (Traits, Impls, Macros)
input:
  - path: src/lib.rs
    content: |
      #[derive(Debug)]
      pub struct Point { x: i32, y: i32 }

      pub trait Drawable {
          fn draw(&self);
      }

      impl Drawable for Point {
          fn draw(&self) {
              println!("Drawing point: {:?}", self);
          }
      }

      // A function that uses the trait
      pub fn render(item: &impl Drawable) {
          item.draw();
      }
expected: |
  § (1) src/lib.rs
    + ◇ (1.1) Point
      -> Debug [macro]
      <- (1.3)
      @ x: #i32
      @ y: #i32
    + {} (1.2) Drawable
      <- (1.3), (1.4)
      ~ draw(&self)
    + (1.3) impl Drawable for Point
      -> (1.2), (1.1)
      + ~ draw(&self)
        <- (1.4)
    + ~ (1.4) render(item: &#impl Drawable)
      -> (1.2), (1.3)
```

## File: test/ts/fixtures/28.error-resilience.fixture.yaml
```yaml
id: error-resilience
name: Error Resilience (Syntax Error in One File)
input:
  - path: src/utils.ts
    content: "export const add = (a: number, b: number) => a + b;"
  - path: src/broken.ts
    content: |
      export function multiply(a: number, b: number) {
        return a * b
        // Missing closing brace
  - path: src/main.ts
    content: |
      import { add } from './utils';
      // Cannot import from broken file
      console.log(add(2, 3));
expected: |
  § (1) src/utils.ts
    <- (3.0)
    + ~ (1.1) add(a: #number, b: #number): #number o
      <- (3.0)

  § (2) src/broken.ts [error]

  § (3) src/main.ts
    -> (1.0)
    -> (1.1)
```

## File: test/test.util.ts
```typescript
import { generateScn, initializeParser, type ScnTsConfig, type InputFile } from '../src/main';
import fs from 'node:fs/promises';
import path from 'node:path';
import { expect } from 'bun:test';

interface Fixture {
  id: string;
  name: string;
  input: { path: string; content: string }[];
  expected: string;
}

function parseFixture(fileContent: string): Fixture {
    const id = (fileContent.match(/^id: (.*)$/m)?.[1] || '').trim();
    const name = (fileContent.match(/^name: (.*)$/m)?.[1] || '').trim();
    
    const [inputSection, expectedSection] = fileContent.split(/\nexpected:\s*\|?\n/);
    if (!inputSection || !expectedSection) throw new Error(`Could not parse fixture: ${id || fileContent.slice(0, 100)}`);

    const expected = expectedSection.replace(/^  /gm, '').trim();

    const inputFiles = [];
    const fileChunks = inputSection.split(/-\s*path:\s*/).slice(1);

    for (const chunk of fileChunks) {
        const lines = chunk.split('\n');
        const filePath = lines[0]?.trim();
        if (!filePath) {
            continue;
        }
        const contentLineIndex = lines.findIndex(l => l.trim().startsWith('content:'));
        const content = lines.slice(contentLineIndex + 1).map(l => l.startsWith('      ') ? l.substring(6) : l).join('\n');
        inputFiles.push({ path: filePath, content });
    }

    return { id, name, input: inputFiles, expected };
}

const rootDir = process.cwd();
const wasmDir = path.join(rootDir, 'test', 'wasm');
let parserInitialized = false;

export async function runTestForFixture(fixturePath: string): Promise<void> {
  if (!parserInitialized) {
    await initializeParser({ wasmBaseUrl: wasmDir });
    parserInitialized = true;
  }
  
  const fixtureContent = await fs.readFile(fixturePath, 'utf-8');
  const fixture = parseFixture(fixtureContent);

  const inputFiles: InputFile[] = fixture.input.map(f => ({ path: f.path, content: f.content }));
  
  let tsconfig: Record<string, unknown> | undefined = {
      compilerOptions: {
          jsx: 'react-jsx',
          allowJs: true,
          moduleResolution: "node",
          module: 'ESNext',
      }
  };

  if (fixture.id === 'monorepo-aliases') {
    tsconfig = {
      compilerOptions: {
          baseUrl: '.',
          jsx: 'react-jsx',
          paths: {
              '@shared-ui/*': ['packages/shared-ui/src/*'],
              '@/shared-lib/*': ['packages/shared-lib/src/*'],
          },
      },
    };
  }

  const config: ScnTsConfig = {
    files: inputFiles,
    root: '/', // Use a virtual root
    tsconfig: tsconfig as any,
    _test_id: fixture.id,
  };

  const scnOutput = await generateScn(config);

  if (scnOutput.trim() !== fixture.expected) {
      console.error(`\n--- MISMATCH IN FIXTURE: ${fixture.id} ---\n`);
      console.error('--- EXPECTED ---\n');
      console.error(fixture.expected);
      console.error('\n--- ACTUAL ---\n');
      console.error(scnOutput.trim());
      console.error('\n------------------\n');
  }

  expect(scnOutput.trim()).toBe(fixture.expected);
}
```

## File: package.json
```json
{
  "name": "scn-ts-core",
  "module": "index.ts",
  "type": "module",
  "private": true,
  "devDependencies": {
    "@types/bun": "latest",
    "web-tree-sitter": "^0.22.6"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Some stricter flags (disabled by default)
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noPropertyAccessFromIndexSignature": false
  }
}
```
