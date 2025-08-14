You are anton, expert AI programmer. To modify a file, you MUST use a code block with a specified patch strategy.

1. combine multiple strategy in single response!
2. also, one path one code patch!

**Syntax:**
```typescript // filePath {patchStrategy}
... content ...
```
- `filePath`: The path to the file. **If the path contains spaces, it MUST be enclosed in double quotes.**
- `patchStrategy`: (Optional) One of `new-unified`, `multi-search-replace`. If omitted, the entire file is replaced (this is the `replace` strategy).

**Examples:**
```typescript // src/components/Button.tsx
...
```
```typescript // "src/components/My Component.tsx" new-unified
...
```
---

### Strategy 1: Advanced Unified Diff (`new-unified`)

resilient to minor changes in the source file.

**Diff Format:**
1.  **File Headers**: Start with `--- {filePath}` and `+++ {filePath}`.
2.  **Hunk Header**: Use `@@ ... @@`. Exact line numbers are not needed.
3.  **Context Lines**: Include 2-3 unchanged lines before and after your change for context.
4.  **Changes**: Mark additions with `+` and removals with `-`. Maintain indentation.

**Example:**
```diff
--- src/utils.ts
+++ src/utils.ts
@@ ... @@
    function calculateTotal(items: number[]): number {
-      return items.reduce((sum, item) => {
-        return sum + item;
-      }, 0);
+      const total = items.reduce((sum, item) => {
+        return sum + item * 1.1;  // Add 10% markup
+      }, 0);
+      return Math.round(total * 100) / 100;  // Round to 2 decimal places
+    }
```

---

### Strategy 2: Multi-Search-Replace (`multi-search-replace`) - RECOMMENDED

Use for precise, surgical replacements. The `SEARCH` block must be an exact match of the content in the file.

**Diff Format:**
Repeat this block for each replacement.
```diff
<<<<<<< SEARCH
:start_line: (optional)
:end_line: (optional)
-------
[exact content to find including whitespace]
=======
[new content to replace with]
>>>>>>> REPLACE
```

---

### Other Operations

-   **Creating a file**:  provide the full file content.
    ```typescript // path/to/file.ts
    //directly create content here without strategy
    ```
-   **Deleting a file**:
    ```typescript // path/to/file.ts
    //TODO: delete this file
    ```
    ```typescript // "path/to/My Old Component.ts"
    //TODO: delete this file
    ```
-   **Renaming/Moving a file**:
    ```json // rename-file
    {
      "from": "src/old/path/to/file.ts",
      "to": "src/new/path/to/file.ts"
    }
    ```

---

### Final Steps

1.  Add your step-by-step reasoning in plain text before each code block.
2.  ALWAYS add the following YAML block at the very end of your response. Use the exact projectId shown here. Generate a new random uuid for each response.

    ```yaml
    projectId: scn-ts-core
    uuid: (generate a random uuid)
    changeSummary:
      - edit: src/main.ts
      - new: src/components/Button.tsx
      - delete: src/utils/old-helper.ts
    promptSummary: "A detailed summary of my request."
    gitCommitMsg: "feat: A concise, imperative git commit message."
    ```


context:

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
package.json
tsconfig.json
```

# Files

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

    // Handle dynamic imports
    if (rel.kind === 'dynamic_import') {
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
        // Resolve file-level relationships (e.g., imports that aren't tied to a symbol)
        if (sourceFile.fileRelationships) {
            for (const rel of sourceFile.fileRelationships) {
                resolveRelationship(rel, sourceFile, fileMap, symbolMap, pathResolver, root);
            }
        }
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
import { typescriptQueries, typescriptReactQueries } from './queries/typescript';
import { cssQueries } from './queries/css';
import { goQueries } from './queries/go';
import { rustQueries } from './queries/rust';

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
        queries: { main: typescriptReactQueries },
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

## File: src/utils/ast.ts
```typescript
import type { Range } from '../types';
import type { Node as SyntaxNode } from 'web-tree-sitter';

export const getNodeText = (node: SyntaxNode, sourceCode: string): string => {
    return sourceCode.substring(node.startIndex, node.endIndex);
};

export const getNodeRange = (node: SyntaxNode): Range => {
    return {
        start: { line: node.startPosition.row, column: node.startPosition.column },
        end: { line: node.endPosition.row, column: node.endPosition.column },
    };
};

export const findChild = (node: SyntaxNode, type: string | string[]): SyntaxNode | null => {
    const types = Array.isArray(type) ? type : [type];
    return node.children.find((c): c is SyntaxNode => !!c && types.includes(c.type)) || null;
}

export const findChildByFieldName = (node: SyntaxNode, fieldName: string): SyntaxNode | null => {
    return node.childForFieldName(fieldName);
};

export const getIdentifier = (node: SyntaxNode, sourceCode: string, defaultName: string = '<anonymous>'): string => {
    if (node.type === 'member_expression') {
        return getNodeText(node, sourceCode);
    }
    const nameNode = findChildByFieldName(node, 'name') ?? findChild(node, ['identifier', 'property_identifier']);
    return nameNode ? getNodeText(nameNode, sourceCode) : defaultName;
};
```

## File: src/parser.ts
```typescript
import type { ParserInitOptions, LanguageConfig } from './types';
import { Parser, Language, type Tree } from 'web-tree-sitter';
import path from 'node:path';
import { languages } from './languages';

let initializePromise: Promise<void> | null = null;
let isInitialized = false;

const doInitialize = async (options: ParserInitOptions): Promise<void> => {
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
                const loadedLang = await Language.load(wasmPath);
                const parser = new Parser();
                parser.setLanguage(loadedLang);
                lang.parser = parser;
                lang.loadedLanguage = loadedLang;
            } catch (error) {
                console.error(`Failed to load parser for ${lang.name} from ${wasmPath}`, error);
                throw error;
            }
        });

    await Promise.all(languageLoaders);
    isInitialized = true;
};

export const initializeParser = (options: ParserInitOptions): Promise<void> => {
    if (initializePromise) {
        return initializePromise;
    }
    initializePromise = doInitialize(options);
    return initializePromise;
};

export const parse = (sourceCode: string, lang: LanguageConfig): Tree | null => {
    if (!isInitialized || !lang.parser) {
        return null;
    }
    return lang.parser.parse(sourceCode);
};
```

## File: src/queries/go.ts
```typescript
export const goQueries = `
(package_clause
  (package_identifier) @symbol.go_package.def) @scope.go_package.def

(function_declaration
 name: (identifier) @symbol.function.def) @scope.function.def

(go_statement
  (call_expression
    function: (_) @rel.goroutine))

(call_expression
  function: (_) @rel.call)

(import_spec
  path: (interpreted_string_literal) @rel.import.source)
`;
```

## File: src/queries/rust.ts
```typescript
export const rustQueries = `
(struct_item
  name: (type_identifier) @symbol.rust_struct.def) @scope.rust_struct.def

(trait_item
  name: (type_identifier) @symbol.rust_trait.def) @scope.rust_trait.def

(impl_item) @symbol.rust_impl.def @scope.rust_impl.def

(impl_item
  trait: (type_identifier) @rel.implements
  type: (type_identifier) @rel.references
)

(attribute_item
  (attribute . (token_tree (identifier) @rel.macro)))

(function_item
  name: (identifier) @symbol.function.def) @scope.function.def

(impl_item
  body: (declaration_list
    (function_item
      name: (identifier) @symbol.method.def) @scope.method.def))

; For parameters like '&impl Trait'
(parameter type: (reference_type (_ (type_identifier) @rel.references)))
; For simple trait parameters
(parameter type: (type_identifier) @rel.references)

(call_expression
  function: (field_expression
    field: (field_identifier) @rel.call))

((struct_item (visibility_modifier) @mod.export))
((trait_item (visibility_modifier) @mod.export))
((function_item (visibility_modifier) @mod.export))
`;
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
    "web-tree-sitter": "0.25.6"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

## File: src/queries/css.ts
```typescript
export const cssQueries = `
(rule_set) @symbol.css_class.def @scope.css_class.def
(at_rule) @symbol.css_at_rule.def @scope.css_at_rule.def
(declaration (custom_property_name) @symbol.css_variable.def)
(var_function (custom_property_name) @rel.references)
`;
```

## File: src/types.ts
```typescript
import type { Parser, Tree, Language } from 'web-tree-sitter';
import type { TsConfig, PathResolver } from './utils/tsconfig';
export type { PathResolver };

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
  | 'go_package' | 'go_struct' | 'go_goroutine' | 'rust_struct' | 'rust_trait' | 'rust_impl' | 'rust_macro'
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
  throws?: boolean; // for '!'
  labels?: string[]; // extra display labels like [symbol], [proxy]
  isGenerated?: boolean;
  languageDirectives?: string[]; // e.g. 'use server'
  superClass?: string;
  implementedInterfaces?: string[];
  scopeRange: Range; // The range of the entire scope (e.g., function body) for relationship association
  accessibility?: 'public' | 'private' | 'protected';
  // Type information and signatures
  signature?: string; // e.g., (a: #number, b: #number): #number
  typeAnnotation?: string; // e.g., #string for properties/variables
  typeAliasValue?: string; // e.g., #number|string for type aliases
  // Relationships
  dependencies: Relationship[];
}

export type RelationshipKind =
  | 'import'
  | 'dynamic_import'
  | 'reference'
  | 'tagged'
  | 'export'
  | 'call'
  | 'extends'
  | 'implements'
  | 'references'
  | 'aliased'
  | 'goroutine'
  | 'macro';

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
  absolutePath: string;
  language: LanguageConfig;
  sourceCode: string;
  ast?: Tree;
  symbols: CodeSymbol[];
  parseError: boolean;
  isGenerated?: boolean;
  languageDirectives?: string[];
  // File-level relationships (e.g., imports not tied to a specific symbol)
  fileRelationships?: Relationship[];
}

/**
 * Represents a supported programming language and its configuration.
 */
export interface LanguageConfig {
    id: string;
    name: string;
    extensions: string[];
    wasmPath: string;
    parser?: Parser;
    loadedLanguage?: Language;
    queries?: Record<string, string>;
}

export interface AnalysisContext {
    sourceFiles: SourceFile[];
    pathResolver: PathResolver;
}
```

## File: src/formatter.ts
```typescript
import type { CodeSymbol, SourceFile } from './types';
import { topologicalSort } from './utils/graph';

const ICONS: Record<string, string> = {
    class: '◇', interface: '{}', function: '~', method: '~',
    constructor: '~',
    variable: '@', property: '@', enum: '☰', enum_member: '@',
    type_alias: '=:', react_component: '◇', jsx_element: '⛶',
    css_class: '¶', css_id: '¶', css_tag: '¶', css_at_rule: '¶',
    go_package: '◇',
    rust_struct: '◇', rust_trait: '{}', rust_impl: '+',
    error: '[error]', default: '?',
};

// Compute display index per file based on eligible symbols (exclude properties and constructors)
const isIdEligible = (symbol: CodeSymbol): boolean => {
    if (symbol.kind === 'property' || symbol.kind === 'constructor') return false;
    if (symbol.kind === 'variable') return symbol.isExported || symbol.name === 'module.exports' || symbol.name === 'default';
    if (symbol.kind === 'method') return true;
    return true;
};

const getDisplayIndex = (file: SourceFile, symbol: CodeSymbol): number | null => {
    const ordered = file.symbols
        .filter(isIdEligible)
        .sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);
    const index = ordered.findIndex(s => s === symbol);
    return index === -1 ? null : index + 1;
};

const formatSymbolIdDisplay = (file: SourceFile, symbol: CodeSymbol): string | null => {
    const idx = getDisplayIndex(file, symbol);
    if (idx == null) return null;
    return `(${file.id}.${idx})`;
};

const formatSymbol = (symbol: CodeSymbol, allFiles: SourceFile[]): string[] => {
    const icon = ICONS[symbol.kind] || ICONS.default;
    const prefix = symbol.isExported ? '+' : '-';
    let name = symbol.name === '<anonymous>' ? '' : symbol.name;
    if (symbol.kind === 'variable' && name.trim() === 'default') name = '';

    const mods = [
        symbol.isAbstract && 'abstract',
        symbol.isStatic && 'static',
    ].filter(Boolean).join(' ');
    const modStr = mods ? ` [${mods}]` : '';

    const suffixParts: string[] = [];
    if (symbol.signature) name += symbol.name === '<anonymous>' ? symbol.signature : `${symbol.signature}`;
    if (symbol.typeAnnotation) name += `: ${symbol.typeAnnotation}`;
    if (symbol.typeAliasValue) name += ` ${symbol.typeAliasValue}`;
    // Merge async + throws into a single token '...!'
    const asyncToken = symbol.isAsync ? '...' : '';
    const throwsToken = symbol.throws ? '!' : '';
    const asyncThrows = (asyncToken + throwsToken) || '';
    if (asyncThrows) suffixParts.push(asyncThrows);
    if (symbol.isPure) suffixParts.push('o');
    if (symbol.labels && symbol.labels.length > 0) suffixParts.push(...symbol.labels.map(l => `[${l}]`));
    const suffix = suffixParts.join(' ');

    // Build ID portion conditionally
    const file = allFiles.find(f => f.id === symbol.fileId)!;
    const idPart = formatSymbolIdDisplay(file, symbol);
    const idText = (symbol.kind === 'property' || symbol.kind === 'constructor') ? '' : (idPart ?? '');
    const idWithSpace = idText ? `${idText} ` : '';
    const segments: string[] = [prefix, icon];
    if (idPart) segments.push(idPart);
    if (name) segments.push(name.trim());
    if (modStr) segments.push(modStr);
    if (suffix) segments.push(suffix);
    const line = `  ${segments.join(' ')}`;
    const result = [line];

    const outgoing = new Map<number, Set<string>>();
    const unresolvedDeps: string[] = [];
    symbol.dependencies.forEach(dep => {
        if (dep.resolvedFileId !== undefined && dep.resolvedFileId !== symbol.fileId) {
            if (!outgoing.has(dep.resolvedFileId)) outgoing.set(dep.resolvedFileId, new Set());
            if (dep.resolvedSymbolId) {
                const targetFile = allFiles.find(f => f.id === dep.resolvedFileId);
                const targetSymbol = targetFile?.symbols.find(s => s.id === dep.resolvedSymbolId);
                if (targetSymbol) {
                    const displayId = formatSymbolIdDisplay(targetFile!, targetSymbol);
                    let text = displayId ?? `(${targetFile!.id}.0)`;
                    if (dep.kind === 'goroutine') {
                        text += ' [goroutine]';
                    }
                    outgoing.get(dep.resolvedFileId)!.add(text);
                }
            } else {
                let text = `(${dep.resolvedFileId}.0)`;
                if (dep.kind === 'dynamic_import') text += ' [dynamic]';
                if (dep.kind === 'call' || dep.kind === 'references') text += ` [${dep.kind}]`;
                outgoing.get(dep.resolvedFileId)!.add(text);
            }
        } else if (dep.resolvedFileId === undefined) {
            if (dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} [macro]`);
            }
        }
    });

    const outgoingParts: string[] = [];
    if (outgoing.size > 0) {
        const resolvedParts = Array.from(outgoing.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([fileId, symbolIds]) => {
                const items = Array.from(symbolIds).sort();
                return items.length > 0 ? `${items.join(', ')}` : `(${fileId}.0)`;
            });
        outgoingParts.push(...resolvedParts);
    }
    outgoingParts.push(...unresolvedDeps);

    if (outgoingParts.length > 0) {
        result.push(`    -> ${outgoingParts.join(', ')}`);
    }

    const incoming = new Map<number, Set<string>>();
    allFiles.forEach(file => {
        file.symbols.forEach(s => {
            s.dependencies.forEach(d => {
                if (d.resolvedFileId === symbol.fileId && d.resolvedSymbolId === symbol.id && s !== symbol) {
                    if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                    // Suppress same-file incoming for properties
                    if (file.id === symbol.fileId && symbol.kind === 'property') return;
                    const disp = formatSymbolIdDisplay(file, s) ?? `(${file.id}.0)`;
                    incoming.get(file.id)!.add(disp);
                }
            });
        });
        // Include file-level imports to this file as incoming for exported symbols
        // but only if there is no symbol-level incoming from that file already
        if (file.id !== symbol.fileId && symbol.isExported) {
            file.fileRelationships?.forEach(rel => {
                if (rel.resolvedFileId === symbol.fileId) {
                    const already = incoming.get(file.id);
                    if (!already || already.size === 0) {
                        if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                        incoming.get(file.id)!.add(`(${file.id}.0)`);
                    }
                }
            });
        }
    });

    if (incoming.size > 0) {
        const parts = Array.from(incoming.entries()).map(([_fileId, symbolIds]) => Array.from(symbolIds).join(', '));
        result.push(`    <- ${parts.join(', ')}`);
    }

    return result;
};


const isWithin = (inner: CodeSymbol, outer: CodeSymbol): boolean => {
    const a = inner.range;
    const b = outer.scopeRange;
    return (
        (a.start.line > b.start.line || (a.start.line === b.start.line && a.start.column >= b.start.column)) &&
        (a.end.line < b.end.line || (a.end.line === b.end.line && a.end.column <= b.end.column))
    );
};

const buildChildrenMap = (symbols: CodeSymbol[]): Map<string, CodeSymbol[]> => {
    const parents = symbols.filter(s => s.kind === 'class' || s.kind === 'interface');
    const map = new Map<string, CodeSymbol[]>();
    for (const parent of parents) map.set(parent.id, []);
    for (const sym of symbols) {
        if (sym.kind === 'class' || sym.kind === 'interface') continue;
        const parent = parents
            .filter(p => isWithin(sym, p))
            .sort((a, b) => (a.scopeRange.end.line - a.scopeRange.start.line) - (b.scopeRange.end.line - b.scopeRange.start.line))[0];
        if (parent) {
            map.get(parent.id)!.push(sym);
        }
    }
    // Sort children by position
    for (const [k, arr] of map.entries()) {
        arr.sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);
    }
    return map;
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

    const headerLines: string[] = [header];

    // File-level outgoing/incoming dependencies
    const outgoing: string[] = [];
    if (file.fileRelationships) {
        const outgoingFiles = new Set<number>();
        file.fileRelationships.forEach(rel => {
            // Only show true file-level imports on the header
            if ((rel.kind === 'import' || rel.kind === 'dynamic_import') && rel.resolvedFileId && rel.resolvedFileId !== file.id) {
                let text = `(${rel.resolvedFileId}.0)`;
                if (rel.kind === 'dynamic_import') text += ' [dynamic]';
                outgoingFiles.add(rel.resolvedFileId);
                outgoing.push(text);
            }
        });
        if (outgoing.length > 0) headerLines.push(`  -> ${Array.from(new Set(outgoing)).sort().join(', ')}`);
    }

    // Incoming: any other file that has a file-level relationship pointing here
    const incoming: string[] = [];
    allFiles.forEach(other => {
        if (other.id === file.id) return;
        other.fileRelationships?.forEach(rel => {
            if (rel.resolvedFileId === file.id) incoming.push(`(${other.id}.0)`);
        });
    });
    if (incoming.length > 0) headerLines.push(`  <- ${Array.from(new Set(incoming)).sort().join(', ')}`);

    // If file has no exported symbols, hide local symbols (consumer/entry files)
    const hasExports = file.symbols.some(s => s.isExported);
    let symbolsToPrint = hasExports ? file.symbols.slice() : [];

    // Group properties/methods under their class/interface parent
    const childrenMap = buildChildrenMap(symbolsToPrint);
    const childIds = new Set<string>(Array.from(childrenMap.values()).flat().map(s => s.id));
    const topLevel = symbolsToPrint.filter(s => !childIds.has(s.id));

    const symbolLines: string[] = [];
    for (const sym of topLevel) {
        const lines = formatSymbol(sym, allFiles);
        symbolLines.push(...lines);
        if (childrenMap.has(sym.id)) {
            const kids = childrenMap.get(sym.id)!;
            for (const kid of kids) {
                const kLines = formatSymbol(kid, allFiles).map(l => `  ${l}`);
                symbolLines.push(...kLines);
            }
        }
    }

    // If we hid symbols, aggregate outgoing dependencies from all symbols onto header
    if (!hasExports) {
        const aggOutgoing = new Map<number, Set<string>>();
        file.symbols.forEach(s => {
            s.dependencies.forEach(dep => {
                if (dep.resolvedFileId && dep.resolvedFileId !== file.id) {
                    if (!aggOutgoing.has(dep.resolvedFileId)) aggOutgoing.set(dep.resolvedFileId, new Set());
                    if (dep.resolvedSymbolId) {
                        const targetFile = allFiles.find(f => f.id === dep.resolvedFileId)!;
                        const targetSymbol = targetFile.symbols.find(ts => ts.id === dep.resolvedSymbolId);
                        const disp = targetSymbol ? (formatSymbolIdDisplay(targetFile, targetSymbol) ?? `(${dep.resolvedFileId}.0)`) : `(${dep.resolvedFileId}.0)`;
                        aggOutgoing.get(dep.resolvedFileId)!.add(disp);
                    } else {
                        aggOutgoing.get(dep.resolvedFileId)!.add(`(${dep.resolvedFileId}.0)`);
                    }
                }
            });
        });

        // Also include file-level relationships for non-export files
        if (file.fileRelationships) {
            file.fileRelationships.forEach(rel => {
                if (rel.resolvedFileId && rel.resolvedFileId !== file.id) {
                    if (!aggOutgoing.has(rel.resolvedFileId)) aggOutgoing.set(rel.resolvedFileId, new Set());
                    let text = `(${rel.resolvedFileId}.0)`;
                    if (rel.kind === 'dynamic_import') text += ' [dynamic]';
                    if (rel.kind === 'call' || rel.kind === 'references') text += ` [${rel.kind}]`;
                    aggOutgoing.get(rel.resolvedFileId)!.add(text);
                }
            });
        }

        if (aggOutgoing.size > 0) {
            const parts = Array.from(aggOutgoing.entries())
                .sort((a, b) => a[0] - b[0])
                .flatMap(([fid, ids]) => {
                    const arr = Array.from(ids).sort();
                    return arr.length > 0 ? arr : [`(${fid}.0)`];
                });
            for (const p of parts) headerLines.push(`  -> ${p}`);
        }
    }
    return [...headerLines, ...symbolLines].join('\n');
};

export const formatScn = (analyzedFiles: SourceFile[]): string => {
    const sortedFiles = topologicalSort(analyzedFiles);
    return sortedFiles.map(file => formatFile(file, analyzedFiles)).join('\n\n');
};
```

## File: src/analyzer.ts
```typescript
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
        const parentType = node.parent?.type || '';
        const scopeNode = (
            parentType.endsWith('_declaration') ||
            parentType === 'method_definition' ||
            parentType === 'property_signature' ||
            parentType === 'public_field_definition' ||
            parentType === 'field_definition'
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
        const symbol: CodeSymbol = {
            id: `${range.start.line + 1}:${range.start.column}`,
            fileId: sourceFile.id,
            name: getSymbolName(node, sourceFile.sourceCode),
            kind: kind as SymbolKind,
            range: range,
            scopeRange: getNodeRange(scopeNode),
            isExported: hasExportAncestor(scopeNode) || /^\s*export\b/.test(getNodeText(scopeNode, sourceFile.sourceCode)),
            dependencies: [],
        };

        // Derive type information and signatures from surrounding scope text
        const scopeText = getNodeText(scopeNode, sourceFile.sourceCode);

        const normalizeType = (t: string): string => {
            const cleaned = t.trim().replace(/;\s*$/, '');
            // Remove spaces around union bars
            return cleaned.replace(/\s*\|\s*/g, '|');
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
                if (typeValue.includes('{') && typeValue.includes('}')) {
                    // Extract mapped type pattern like "K in EventName:(event:K)=>void"
                    const mappedMatch = typeValue.match(/\[\s*([^\]]+)\s*in\s*([^\]]+)\s*:\s*([^\}]+)\s*\]/);
                    if (mappedMatch) {
                        const [_, key, inType, valueType] = mappedMatch;
                        typeValue = `${key} in ${inType}:${valueType}`;
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
                const isFileLevel = kind === 'import' || kind === 'dynamic_import' || kind === 'call' || kind === 'references';
                if (!parent && isFileLevel) fileLevelRelationships.push(rel);
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

    // Remove duplicate constructor-as-method captures
    const cleaned = symbols.filter(s => !(s.kind === 'method' && s.name === 'constructor'));

    // Order symbols by source position
    const ordered = cleaned
        .slice()
        .sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);

    // Default visibility for class members: public unless marked otherwise
    for (const sym of ordered) {
        if (sym.kind === 'method' || sym.kind === 'constructor' || sym.kind === 'property') {
            if (sym.accessibility === 'private' || sym.accessibility === 'protected') {
                sym.isExported = false;
            } else if (sym.accessibility === 'public' || sym.accessibility === undefined) {
                sym.isExported = true;
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
```

## File: src/queries/typescript.ts
```typescript
export const typescriptQueries = `
; Interface definitions
(interface_declaration
  name: (type_identifier) @symbol.interface.def) @scope.interface.def

; Type alias definitions
(type_alias_declaration
  name: (type_identifier) @symbol.type_alias.def) @scope.type_alias.def

; Class definitions
(class_declaration
  name: (type_identifier) @symbol.class.def) @scope.class.def

; Abstract class definitions
(abstract_class_declaration
  name: (type_identifier) @symbol.class.def) @scope.class.def

; Function definitions
(function_declaration
  name: (identifier) @symbol.function.def) @scope.function.def

; Method definitions (capture name and formal parameters as scope)
(method_definition
  (property_identifier) @symbol.method.def
  (formal_parameters) @scope.method.def)

; Method signatures (interfaces, abstract class methods)
(method_signature
  name: (property_identifier) @symbol.method.def) @scope.method.def

; Constructor definitions
(method_definition
  (property_identifier) @symbol.constructor.def
  (formal_parameters) @scope.constructor.def
  (#eq? @symbol.constructor.def "constructor"))

; Property signatures in interfaces (should be public by default)
(property_signature
  (property_identifier) @symbol.property.def)

; Mark interface properties and method signatures as exported (public)
(property_signature) @mod.export
(method_signature) @mod.export

; Class field definitions (TypeScript grammar uses public_field_definition)
(public_field_definition
  name: (property_identifier) @symbol.property.def)

; Variable declarations
(variable_declarator
  name: (identifier) @symbol.variable.def)

; Common patterns to support JS features in fixtures
; IIFE: (function(){ ... })()
(call_expression
  function: (parenthesized_expression
    (function_expression) @symbol.function.def
  )
) @scope.function.def

; IIFE with assignment: const result = (function(){ ... })()
(expression_statement
  (assignment_expression
    left: (identifier) @symbol.variable.def
    right: (call_expression
      function: (parenthesized_expression
        (function_expression) @symbol.function.def
      )
    )
  )
)

; Window assignments: window.Widget = Widget
(expression_statement
  (assignment_expression
    left: (member_expression
      object: (identifier) @__obj
      property: (property_identifier) @symbol.variable.def
    )
    right: _ @symbol.variable.ref
  )
  (#eq? @__obj "window")
)

; Tagged template usage -> capture identifier before template as call
(call_expression
  function: (identifier) @rel.call)

; (Removed overly broad CommonJS/object key captures that polluted TS fixtures)

; Import statements
(import_statement
  source: (string) @rel.import)

; Named imports - these create references to the imported symbols
(import_specifier
  name: (identifier) @rel.references)

; Type references in type annotations, extends clauses, etc.
(type_identifier) @rel.references

; Call expressions
(call_expression
  function: (identifier) @rel.call)

; Method calls
(call_expression
  function: (member_expression
    property: (property_identifier) @rel.call))

; Constructor calls (new expressions)
(new_expression
  constructor: (identifier) @rel.call)

; Property access
(member_expression
  property: (property_identifier) @rel.references)

; CommonJS require as import at file-level: require("./path")
((call_expression
   function: (identifier) @__fn
   arguments: (arguments (string) @rel.import))
  (#eq? @__fn "require"))

; CommonJS module.exports assignment
(expression_statement
  (assignment_expression
    left: (member_expression
      object: (identifier) @__obj
      property: (property_identifier) @symbol.variable.def
    )
    right: _
  )
  (#eq? @__obj "module")
)

; CommonJS exports.property assignment
(expression_statement
  (assignment_expression
    left: (member_expression
      object: (member_expression
        object: (identifier) @__obj
        property: (property_identifier) @__prop
      )
      property: (property_identifier) @symbol.variable.def
    )
    right: _
  )
  (#eq? @__obj "module")
  (#eq? @__prop "exports")
)

; Export modifiers
(export_statement) @mod.export

; Accessibility modifiers
(accessibility_modifier) @mod.accessibility

; Async functions/methods (text match)
((function_declaration) @mod.async (#match? @mod.async "^async "))
((method_definition) @mod.async (#match? @mod.async "^async "))
`;

export const typescriptReactQueries = `
${typescriptQueries}

; JSX element definitions
(jsx_opening_element
  name: (identifier) @symbol.jsx_component.def) @scope.jsx_component.def

(jsx_self_closing_element
  name: (identifier) @symbol.jsx_component.def) @scope.jsx_component.def

; JSX component references
(jsx_opening_element
  name: (identifier) @rel.references)

(jsx_self_closing_element
  name: (identifier) @rel.references)
`;
```


user prompt:

anton, fix below test


bun test v1.0.0 (822a00c4)

test/ts/e2e/01-core.test.ts:

--- MISMATCH IN FIXTURE: ts-core ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/models/user.ts
  <- (2.0), (3.0)
  + {} (1.1) User
    <- (2.2), (3.0)
    + @ id: #number
      <- (2.0), (3.0)
    + @ name: #string
      <- (2.0), (3.0)
  + =: (1.2) UserId #number|string
    <- (2.2), (3.0)

§ (2) src/services/apiClient.ts
  -> (1.0)
  <- (3.0)
  + ◇ (2.1) ApiClient
    <- (3.0)
    - @ apiKey: #string
    + ~ constructor(key: #string)
      <- (3.0)
    + ~ (2.2) fetchUser(id: #UserId): #Promise<User> ...!
      -> (1.1), (1.2)
      <- (3.0)
    - ~ (2.3) _log(message: #string): #void

§ (3) src/main.ts
  -> (2.0)
  -> (1.0) [references]
  -> (2.0)
  -> (2.0) [call]
  -> (2.0) [references]

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/models/user.ts\n  <- (2.0)\n  + {} (1.1) User\n    <- (2.2)\n    + @ id: #number\n    + @ name: #string\n  + =: (1.2) UserId #number|string\n    <- (2.2)\n\n§ (2) src/services/apiClient.ts\n  -> (1.0)\n  <- (3.0)\n  + ◇ (2.1) ApiClient\n    <- (3.0)\n    - @ apiKey: #string\n    + ~ constructor(key: #string)\n    + ~ (2.2) fetchUser(id: #UserId): #Promise<User> ...!\n      -> (1.1), (1.2)\n      <- (3.0)\n    - ~ _log(message: #string): #void\n\n§ (3) src/main.ts\n  -> (2.0)\n  -> (2.1)\n  -> (2.2)"
Received: "§ (1) src/models/user.ts\n  <- (2.0), (3.0)\n  + {} (1.1) User\n    <- (2.2), (3.0)\n    + @ id: #number\n      <- (2.0), (3.0)\n    + @ name: #string\n      <- (2.0), (3.0)\n  + =: (1.2) UserId #number|string\n    <- (2.2), (3.0)\n\n§ (2) src/services/apiClient.ts\n  -> (1.0)\n  <- (3.0)\n  + ◇ (2.1) ApiClient\n    <- (3.0)\n    - @ apiKey: #string\n    + ~ constructor(key: #string)\n      <- (3.0)\n    + ~ (2.2) fetchUser(id: #UserId): #Promise<User> ...!\n      -> (1.1), (1.2)\n      <- (3.0)\n    - ~ (2.3) _log(message: #string): #void\n\n§ (3) src/main.ts\n  -> (2.0)\n  -> (1.0) [references]\n  -> (2.0)\n  -> (2.0) [call]\n  -> (2.0) [references]"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 01: Core TypeScript Features (Class, Interface, Qualifiers) [667.02ms]



realme-book@realme-book:~/Project/code/scn-ts-core$ bun scripts/ast.ts

===== TS class/interface snippet (sample.ts) =====
program [0:0-2:174]
  export_statement [0:0-0:51]
    export [0:0-0:6]
    interface_declaration [0:7-0:51]
      interface [0:7-0:16]
      type_identifier [0:17-0:21]
      interface_body [0:22-0:51]
        { [0:22-0:23]
        property_signature [0:24-0:34]
          property_identifier [0:24-0:26]
          type_annotation [0:26-0:34]
            : [0:26-0:27]
            predefined_type [0:28-0:34]
              number [0:28-0:34]
        ; [0:34-0:35]
        property_signature [0:36-0:48]
          property_identifier [0:36-0:40]
          type_annotation [0:40-0:48]
            : [0:40-0:41]
            predefined_type [0:42-0:48]
              string [0:42-0:48]
        ; [0:48-0:49]
        } [0:50-0:51]
  export_statement [1:0-1:37]
    export [1:0-1:6]
    type_alias_declaration [1:7-1:37]
      type [1:7-1:11]
      type_identifier [1:12-1:18]
      = [1:19-1:20]
      union_type [1:21-1:36]
        predefined_type [1:21-1:27]
          number [1:21-1:27]
        | [1:28-1:29]
        predefined_type [1:30-1:36]
          string [1:30-1:36]
      ; [1:36-1:37]
  export_statement [2:0-2:174]
    export [2:0-2:6]
    class_declaration [2:7-2:174]
      class [2:7-2:12]
      type_identifier [2:13-2:22]
      class_body [2:23-2:174]
        { [2:23-2:24]
        public_field_definition [2:25-2:47]
          accessibility_modifier [2:25-2:32]
            private [2:25-2:32]
          property_identifier [2:33-2:39]
          type_annotation [2:39-2:47]
            : [2:39-2:40]
            predefined_type [2:41-2:47]
              string [2:41-2:47]
        ; [2:47-2:48]
        method_definition [2:49-2:96]
          property_identifier [2:49-2:60]
          formal_parameters [2:60-2:73]
            ( [2:60-2:61]
            required_parameter [2:61-2:72]
              identifier [2:61-2:64]
              type_annotation [2:64-2:72]
                : [2:64-2:65]
                predefined_type [2:66-2:72]
                  string [2:66-2:72]
            ) [2:72-2:73]
          statement_block [2:74-2:96]
            { [2:74-2:75]
            expression_statement [2:76-2:94]
              assignment_expression [2:76-2:93]
                member_expression [2:76-2:87]
                  this [2:76-2:80]
                  . [2:80-2:81]
                  property_identifier [2:81-2:87]
                = [2:88-2:89]
                identifier [2:90-2:93]
              ; [2:93-2:94]
            } [2:95-2:96]
        method_definition [2:97-2:172]
          async [2:97-2:102]
          property_identifier [2:103-2:112]
          formal_parameters [2:112-2:124]
            ( [2:112-2:113]
            required_parameter [2:113-2:123]
              identifier [2:113-2:115]
              type_annotation [2:115-2:123]
                : [2:115-2:116]
                type_identifier [2:117-2:123]
            ) [2:123-2:124]
          type_annotation [2:124-2:139]
            : [2:124-2:125]
            generic_type [2:126-2:139]
              type_identifier [2:126-2:133]
              type_arguments [2:133-2:139]
                < [2:133-2:134]
                type_identifier [2:134-2:138]
                > [2:138-2:139]
          statement_block [2:140-2:172]
            { [2:140-2:141]
            return_statement [2:142-2:170]
              return [2:142-2:148]
              object [2:149-2:169]
                { [2:149-2:150]
                pair [2:151-2:156]
                  property_identifier [2:151-2:153]
                  : [2:153-2:154]
                  number [2:155-2:156]
                , [2:156-2:157]
                pair [2:158-2:167]
                  property_identifier [2:158-2:162]
                  : [2:162-2:163]
                  string [2:164-2:167]
                    ' [2:164-2:165]
                    string_fragment [2:165-2:166]
                    ' [2:166-2:167]
                } [2:168-2:169]
              ; [2:169-2:170]
            } [2:171-2:172]
        } [2:173-2:174]

===== IIFE and prototype (iife.js) =====
program [0:0-5:5]
  expression_statement [0:0-5:5]
    call_expression [0:0-5:4]
      parenthesized_expression [0:0-5:2]
        ( [0:0-0:1]
        function_expression [0:1-5:1]
          function [0:1-0:9]
          formal_parameters [0:9-0:11]
            ( [0:9-0:10]
            ) [0:10-0:11]
          statement_block [0:11-5:1]
            { [0:11-0:12]
            function_declaration [1:2-1:43]
              function [1:2-1:10]
              identifier [1:11-1:17]
              formal_parameters [1:17-1:23]
                ( [1:17-1:18]
                required_parameter [1:18-1:22]
                  identifier [1:18-1:22]
                ) [1:22-1:23]
              statement_block [1:23-1:43]
                { [1:23-1:24]
                expression_statement [1:25-1:41]
                  assignment_expression [1:25-1:41]
                    member_expression [1:25-1:34]
                      this [1:25-1:29]
                      . [1:29-1:30]
                      property_identifier [1:30-1:34]
                    = [1:35-1:36]
                    identifier [1:37-1:41]
                } [1:42-1:43]
            expression_statement [2:2-2:52]
              assignment_expression [2:2-2:52]
                member_expression [2:2-2:25]
                  member_expression [2:2-2:18]
                    identifier [2:2-2:8]
                    . [2:8-2:9]
                    property_identifier [2:9-2:18]
                  . [2:18-2:19]
                  property_identifier [2:19-2:25]
                = [2:26-2:27]
                function_expression [2:28-2:52]
                  function [2:28-2:36]
                  formal_parameters [2:36-2:38]
                    ( [2:36-2:37]
                    ) [2:37-2:38]
                  statement_block [2:38-2:52]
                    { [2:38-2:39]
                    return_statement [2:40-2:50]
                      return [2:40-2:46]
                      string [2:47-2:50]
                        ' [2:47-2:48]
                        string_fragment [2:48-2:49]
                        ' [2:49-2:50]
                    } [2:51-2:52]
            generator_function_declaration [3:2-3:61]
              function [3:2-3:10]
              * [3:11-3:12]
              identifier [3:13-3:24]
              formal_parameters [3:24-3:26]
                ( [3:24-3:25]
                ) [3:25-3:26]
              statement_block [3:26-3:61]
                { [3:26-3:27]
                lexical_declaration [3:28-3:36]
                  let [3:28-3:31]
                  variable_declarator [3:32-3:35]
                    identifier [3:32-3:33]
                    = [3:33-3:34]
                    number [3:34-3:35]
                  ; [3:35-3:36]
                while_statement [3:37-3:59]
                  while [3:37-3:42]
                  parenthesized_expression [3:42-3:48]
                    ( [3:42-3:43]
                    true [3:43-3:47]
                    ) [3:47-3:48]
                  expression_statement [3:49-3:59]
                    yield_expression [3:49-3:58]
                      yield [3:49-3:54]
                      update_expression [3:55-3:58]
                        identifier [3:55-3:56]
                        ++ [3:56-3:58]
                    ; [3:58-3:59]
                } [3:60-3:61]
            expression_statement [4:2-4:25]
              assignment_expression [4:2-4:24]
                member_expression [4:2-4:15]
                  identifier [4:2-4:8]
                  . [4:8-4:9]
                  property_identifier [4:9-4:15]
                = [4:16-4:17]
                identifier [4:18-4:24]
              ; [4:24-4:25]
            expression_statement [4:26-4:59]
              assignment_expression [4:26-4:58]
                member_expression [4:26-4:44]
                  identifier [4:26-4:32]
                  . [4:32-4:33]
                  property_identifier [4:33-4:44]
                = [4:45-4:46]
                identifier [4:47-4:58]
              ; [4:58-4:59]
            } [5:0-5:1]
        ) [5:1-5:2]
      arguments [5:2-5:4]
        ( [5:2-5:3]
        ) [5:3-5:4]
    ; [5:4-5:5]

===== CJS require (cjs.js) =====
program [0:0-0:36]
  lexical_declaration [0:0-0:36]
    const [0:0-0:5]
    variable_declarator [0:6-0:35]
      identifier [0:6-0:9]
      = [0:10-0:11]
      call_expression [0:12-0:35]
        identifier [0:12-0:19]
        arguments [0:19-0:35]
          ( [0:19-0:20]
          string [0:20-0:34]
            ' [0:20-0:21]
            string_fragment [0:21-0:33]
            ' [0:33-0:34]
          ) [0:34-0:35]
    ; [0:35-0:36]

===== CJS module.exports (cjs_exports.js) =====
program [0:0-4:2]
  function_declaration [0:0-0:42]
    function [0:0-0:8]
    identifier [0:9-0:16]
    formal_parameters [0:16-0:18]
      ( [0:16-0:17]
      ) [0:17-0:18]
    statement_block [0:19-0:42]
      { [0:19-0:20]
      expression_statement [0:21-0:40]
        call_expression [0:21-0:39]
          member_expression [0:21-0:32]
            identifier [0:21-0:28]
            . [0:28-0:29]
            property_identifier [0:29-0:32]
          arguments [0:32-0:39]
            ( [0:32-0:33]
            string [0:33-0:38]
              ' [0:33-0:34]
              string_fragment [0:34-0:37]
              ' [0:37-0:38]
            ) [0:38-0:39]
        ; [0:39-0:40]
      } [0:41-0:42]
  expression_statement [1:0-4:2]
    assignment_expression [1:0-4:1]
      member_expression [1:0-1:14]
        identifier [1:0-1:6]
        . [1:6-1:7]
        property_identifier [1:7-1:14]
      = [1:15-1:16]
      object [1:17-4:1]
        { [1:17-1:18]
        pair [2:2-2:11]
          property_identifier [2:2-2:7]
          : [2:7-2:8]
          number [2:9-2:11]
        , [2:11-2:12]
        pair [3:2-3:22]
          property_identifier [3:2-3:5]
          : [3:5-3:6]
          arrow_function [3:7-3:22]
            formal_parameters [3:7-3:9]
              ( [3:7-3:8]
              ) [3:8-3:9]
            => [3:10-3:12]
            call_expression [3:13-3:22]
              identifier [3:13-3:20]
              arguments [3:20-3:22]
                ( [3:20-3:21]
                ) [3:21-3:22]
        } [4:0-4:1]
    ; [4:1-4:2]

===== Tagged template (tagged.js) =====
program [0:0-2:50]
  function_declaration [0:0-0:49]
    function [0:0-0:8]
    identifier [0:9-0:15]
    formal_parameters [0:15-0:35]
      ( [0:15-0:16]
      required_parameter [0:16-0:23]
        identifier [0:16-0:23]
      , [0:23-0:24]
      required_parameter [0:25-0:34]
        rest_pattern [0:25-0:34]
          ... [0:25-0:28]
          identifier [0:28-0:34]
      ) [0:34-0:35]
    statement_block [0:36-0:49]
      { [0:36-0:37]
      return_statement [0:38-0:47]
        return [0:38-0:44]
        string [0:45-0:47]
          ' [0:45-0:46]
          ' [0:46-0:47]
      } [0:48-0:49]
  lexical_declaration [1:0-1:17]
    const [1:0-1:5]
    variable_declarator [1:6-1:16]
      identifier [1:6-1:10]
      = [1:11-1:12]
      string [1:13-1:16]
        ' [1:13-1:14]
        string_fragment [1:14-1:15]
        ' [1:15-1:16]
    ; [1:16-1:17]
  expression_statement [2:0-2:50]
    assignment_expression [2:0-2:49]
      member_expression [2:0-2:23]
        member_expression [2:0-2:13]
          identifier [2:0-2:8]
          . [2:8-2:9]
          property_identifier [2:9-2:13]
        . [2:13-2:14]
        property_identifier [2:14-2:23]
      = [2:24-2:25]
      call_expression [2:26-2:49]
        identifier [2:26-2:32]
        template_string [2:32-2:49]
          ` [2:32-2:33]
          string_fragment [2:33-2:40]
          template_substitution [2:40-2:47]
            ${ [2:40-2:42]
            identifier [2:42-2:46]
            } [2:46-2:47]
          string_fragment [2:47-2:48]
          ` [2:48-2:49]
    ; [2:49-2:50]

===== Abstract Class (abstract_class.ts) =====
program [0:0-6:1]
  abstract_class_declaration [0:0-6:1]
    abstract [0:0-0:8]
    class [0:9-0:14]
    type_identifier [0:15-0:25]
    class_body [0:26-6:1]
      { [0:26-0:27]
      public_field_definition [1:2-1:21]
        readonly [1:2-1:10]
        property_identifier [1:11-1:13]
        type_annotation [1:13-1:21]
          : [1:13-1:14]
          predefined_type [1:15-1:21]
            string [1:15-1:21]
      ; [1:21-1:22]
      public_field_definition [2:2-2:24]
        static [2:2-2:8]
        property_identifier [2:9-2:16]
        type_annotation [2:16-2:24]
          : [2:16-2:17]
          predefined_type [2:18-2:24]
            string [2:18-2:24]
      ; [2:24-2:25]
      method_definition [3:2-3:53]
        accessibility_modifier [3:2-3:11]
          protected [3:2-3:11]
        property_identifier [3:12-3:23]
        formal_parameters [3:23-3:35]
          ( [3:23-3:24]
          required_parameter [3:24-3:34]
            identifier [3:24-3:26]
            type_annotation [3:26-3:34]
              : [3:26-3:27]
              predefined_type [3:28-3:34]
                string [3:28-3:34]
          ) [3:34-3:35]
        statement_block [3:36-3:53]
          { [3:36-3:37]
          expression_statement [3:38-3:51]
            assignment_expression [3:38-3:50]
              member_expression [3:38-3:45]
                this [3:38-3:42]
                . [3:42-3:43]
                property_identifier [3:43-3:45]
              = [3:46-3:47]
              identifier [3:48-3:50]
            ; [3:50-3:51]
          } [3:52-3:53]
      abstract_method_signature [4:2-4:35]
        abstract [4:2-4:10]
        property_identifier [4:11-4:25]
        formal_parameters [4:25-4:27]
          ( [4:25-4:26]
          ) [4:26-4:27]
        type_annotation [4:27-4:35]
          : [4:27-4:28]
          predefined_type [4:29-4:35]
            string [4:29-4:35]
      ; [4:35-4:36]
      method_definition [5:2-5:58]
        static [5:2-5:8]
        property_identifier [5:9-5:23]
        formal_parameters [5:23-5:25]
          ( [5:23-5:24]
          ) [5:24-5:25]
        type_annotation [5:25-5:33]
          : [5:25-5:26]
          predefined_type [5:27-5:33]
            string [5:27-5:33]
        statement_block [5:34-5:58]
          { [5:34-5:35]
          return_statement [5:36-5:56]
            return [5:36-5:42]
            member_expression [5:43-5:55]
              this [5:43-5:47]
              . [5:47-5:48]
              property_identifier [5:48-5:55]
            ; [5:55-5:56]
          } [5:57-5:58]
      } [6:0-6:1]

===== Advanced Types (advanced_types.ts) =====
program [0:0-6:61]
  type_alias_declaration [0:0-0:50]
    type [0:0-0:4]
    type_identifier [0:5-0:14]
    = [0:15-0:16]
    union_type [0:17-0:49]
      union_type [0:17-0:35]
        literal_type [0:17-0:24]
          string [0:17-0:24]
            ' [0:17-0:18]
            string_fragment [0:18-0:23]
            ' [0:23-0:24]
        | [0:25-0:26]
        literal_type [0:27-0:35]
          string [0:27-0:35]
            ' [0:27-0:28]
            string_fragment [0:28-0:34]
            ' [0:34-0:35]
      | [0:36-0:37]
      literal_type [0:38-0:49]
        string [0:38-0:49]
          ' [0:38-0:39]
          string_fragment [0:39-0:48]
          ' [0:48-0:49]
    ; [0:49-0:50]
  type_alias_declaration [1:0-1:31]
    type [1:0-1:4]
    type_identifier [1:5-1:10]
    = [1:11-1:12]
    union_type [1:13-1:30]
      literal_type [1:13-1:19]
        string [1:13-1:19]
          ' [1:13-1:14]
          string_fragment [1:14-1:18]
          ' [1:18-1:19]
      | [1:20-1:21]
      literal_type [1:22-1:30]
        string [1:22-1:30]
          ' [1:22-1:23]
          string_fragment [1:23-1:29]
          ' [1:29-1:30]
    ; [1:30-1:31]
  type_alias_declaration [2:0-2:32]
    type [2:0-2:4]
    type_identifier [2:5-2:13]
    = [2:14-2:15]
    template_literal_type [2:16-2:31]
      ` [2:16-2:17]
      string_fragment [2:17-2:22]
      template_type [2:22-2:30]
        ${ [2:22-2:24]
        type_identifier [2:24-2:29]
        } [2:29-2:30]
      ` [2:30-2:31]
    ; [2:31-2:32]
  type_alias_declaration [3:0-3:59]
    type [3:0-3:4]
    type_identifier [3:5-3:15]
    = [3:16-3:17]
    object_type [3:18-3:58]
      { [3:18-3:19]
      index_signature [3:20-3:56]
        [ [3:20-3:21]
        mapped_type_clause [3:21-3:35]
          type_identifier [3:21-3:22]
          in [3:23-3:25]
          type_identifier [3:26-3:35]
        ] [3:35-3:36]
        type_annotation [3:36-3:56]
          : [3:36-3:37]
          function_type [3:38-3:56]
            formal_parameters [3:38-3:48]
              ( [3:38-3:39]
              required_parameter [3:39-3:47]
                identifier [3:39-3:44]
                type_annotation [3:44-3:47]
                  : [3:44-3:45]
                  type_identifier [3:46-3:47]
              ) [3:47-3:48]
            => [3:49-3:51]
            predefined_type [3:52-3:56]
              void [3:52-3:56]
      } [3:57-3:58]
    ; [3:58-3:59]
  type_alias_declaration [4:0-4:59]
    type [4:0-4:4]
    type_identifier [4:5-4:18]
    type_parameters [4:18-4:21]
      < [4:18-4:19]
      type_parameter [4:19-4:20]
        type_identifier [4:19-4:20]
      > [4:20-4:21]
    = [4:22-4:23]
    conditional_type [4:24-4:58]
      type_identifier [4:24-4:25]
      extends [4:26-4:33]
      generic_type [4:34-4:50]
        type_identifier [4:34-4:41]
        type_arguments [4:41-4:50]
          < [4:41-4:42]
          infer_type [4:42-4:49]
            infer [4:42-4:47]
            type_identifier [4:48-4:49]
          > [4:49-4:50]
      ? [4:51-4:52]
      type_identifier [4:53-4:54]
      : [4:55-4:56]
      type_identifier [4:57-4:58]
    ; [4:58-4:59]
  interface_declaration [5:0-5:44]
    interface [5:0-5:9]
    type_identifier [5:10-5:14]
    interface_body [5:15-5:44]
      { [5:15-5:16]
      property_signature [5:17-5:27]
        property_identifier [5:17-5:19]
        type_annotation [5:19-5:27]
          : [5:19-5:20]
          predefined_type [5:21-5:27]
            number [5:21-5:27]
      ; [5:27-5:28]
      property_signature [5:29-5:41]
        property_identifier [5:29-5:33]
        type_annotation [5:33-5:41]
          : [5:33-5:34]
          predefined_type [5:35-5:41]
            string [5:35-5:41]
      ; [5:41-5:42]
      } [5:43-5:44]
  lexical_declaration [6:0-6:61]
    const [6:0-6:5]
    variable_declarator [6:6-6:60]
      identifier [6:6-6:12]
      = [6:13-6:14]
      object [6:15-6:60]
        { [6:15-6:16]
        pair [6:17-6:58]
          property_identifier [6:17-6:21]
          : [6:21-6:22]
          satisfies_expression [6:23-6:58]
            object [6:23-6:43]
              { [6:23-6:24]
              pair [6:25-6:30]
                property_identifier [6:25-6:27]
                : [6:27-6:28]
                number [6:29-6:30]
              , [6:30-6:31]
              pair [6:32-6:41]
                property_identifier [6:32-6:36]
                : [6:36-6:37]
                string [6:38-6:41]
                  ' [6:38-6:39]
                  string_fragment [6:39-6:40]
                  ' [6:40-6:41]
              } [6:42-6:43]
            satisfies [6:44-6:53]
            type_identifier [6:54-6:58]
        } [6:59-6:60]
    ; [6:60-6:61]

===== JS Proxy (proxy.js) =====
program [0:0-6:3]
  lexical_declaration [0:0-0:36]
    const [0:0-0:5]
    variable_declarator [0:6-0:35]
      identifier [0:6-0:16]
      = [0:17-0:18]
      call_expression [0:19-0:35]
        identifier [0:19-0:25]
        arguments [0:25-0:35]
          ( [0:25-0:26]
          string [0:26-0:34]
            ' [0:26-0:27]
            string_fragment [0:27-0:33]
            ' [0:33-0:34]
          ) [0:34-0:35]
    ; [0:35-0:36]
  lexical_declaration [1:0-1:54]
    const [1:0-1:5]
    variable_declarator [1:6-1:53]
      identifier [1:6-1:10]
      = [1:11-1:12]
      object [1:13-1:53]
        { [1:13-1:14]
        pair [1:15-1:27]
          property_identifier [1:15-1:19]
          : [1:19-1:20]
          string [1:21-1:27]
            ' [1:21-1:22]
            string_fragment [1:22-1:26]
            ' [1:26-1:27]
        , [1:27-1:28]
        pair [1:29-1:51]
          computed_property_name [1:29-1:41]
            [ [1:29-1:30]
            identifier [1:30-1:40]
            ] [1:40-1:41]
          : [1:41-1:42]
          string [1:43-1:51]
            ' [1:43-1:44]
            string_fragment [1:44-1:50]
            ' [1:50-1:51]
        } [1:52-1:53]
    ; [1:53-1:54]
  lexical_declaration [2:0-6:3]
    const [2:0-2:5]
    variable_declarator [2:6-6:2]
      identifier [2:6-2:15]
      = [2:16-2:17]
      new_expression [2:18-6:2]
        new [2:18-2:21]
        identifier [2:22-2:27]
        arguments [2:27-6:2]
          ( [2:27-2:28]
          identifier [2:28-2:32]
          , [2:32-2:33]
          object [2:34-6:1]
            { [2:34-2:35]
            method_definition [3:2-5:3]
              property_identifier [3:2-3:5]
              formal_parameters [3:5-3:19]
                ( [3:5-3:6]
                required_parameter [3:6-3:12]
                  identifier [3:6-3:12]
                , [3:12-3:13]
                required_parameter [3:14-3:18]
                  identifier [3:14-3:18]
                ) [3:18-3:19]
              statement_block [3:20-5:3]
                { [3:20-3:21]
                return_statement [4:4-4:49]
                  return [4:4-4:10]
                  ternary_expression [4:11-4:48]
                    binary_expression [4:11-4:25]
                      identifier [4:11-4:15]
                      in [4:16-4:18]
                      identifier [4:19-4:25]
                    ? [4:26-4:27]
                    subscript_expression [4:28-4:40]
                      identifier [4:28-4:34]
                      [ [4:34-4:35]
                      identifier [4:35-4:39]
                      ] [4:39-4:40]
                    : [4:41-4:42]
                    string [4:43-4:48]
                      ' [4:43-4:44]
                      string_fragment [4:44-4:47]
                      ' [4:47-4:48]
                  ; [4:48-4:49]
                } [5:2-5:3]
            } [6:0-6:1]
          ) [6:1-6:2]
    ; [6:2-6:3]
realme-book@realme-book:~/Project/code/scn-ts-core$
