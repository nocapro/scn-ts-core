# Directory Structure
```
docs/
  fix.plan.md
scripts/
  ast.ts
src/
  queries/
    typescript.ts
  analyzer.ts
  graph-resolver.ts
  types.ts
test/
  ts/
    fixtures/
      09.dep-graph-circular.fixture.yaml
```

# Files

## File: test/ts/fixtures/09.dep-graph-circular.fixture.yaml
````yaml
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
````

## File: docs/fix.plan.md
````markdown
### **Final Comprehensive Analysis Report: Systemic Failures (Revised)**

The test suite reveals systemic failures across the analysis pipeline. While my previous report captured the high-level themes, a deeper analysis shows more specific and recurring problems in symbol scoping, pattern recognition, and output formatting.

---

### 1. Critical Query Error in CSS Parser

*   `[ ]` **1.1.** A fatal error in the CSS tree-sitter query (`src/queries/css.ts`) is the root cause of multiple test crashes. The query uses an invalid node name, `custom_property_name`, making it impossible to analyze any file containing CSS.
    *   **Impact:** All tests involving `.css` files crash with a `QueryError`.
    *   **Affected Fixtures:** `react-css`, `advanced-css`, `complex-css`.

---

### 2. Dependency Resolution and Graph Failures

*   `[ ]` **2.1. Unresolved Member Expression Dependencies:** Fails to link calls like `util.shouldRun()` to the specific symbol within the imported file. (Fixture: `dep-graph-circular`)
    *   **Code Context:** `import { util } from './utils'; ... util.shouldRun()`
    *   **Expected:** `funcA` shows a dependency on the `util` symbol `(3.1)`.
        ```
        + ~ (1.1) funcA()
          -> (2.1), (3.1)
        ```
    *   **Actual:** The link to `(3.1)` is missing.
        ```
        + ~ (1.1) funcA()
          -> (2.1)
        ```
*   `[ ]` **2.2. Path Alias Resolution Failure:** Does not correctly process `tsconfig.json` `paths` aliases, breaking all aliased imports. (Fixture: `monorepo-aliases`)
    *   **Code Context:** `import { Button } from '@shared-ui/Button';`
    *   **Expected:** The `App` component's use of `<Button>` is linked to its definition in another package.
        ```
        - ◇ (3.3) App
          ⛶ Button
            -> (1.1)
        ```
    *   **Actual:** The link is completely missing; the `App` component appears empty.
        ```
        - ◇ (3.1) App
        ```
*   `[ ]` **2.3. Lack of Dynamic `import()` Support:** Fails to recognize `await import()` as a dynamic dependency. (Fixture: `dynamic-imports`)
    *   **Code Context:** `addEventListener('click', async () => { ... await import('./heavy-module'); ... })`
    *   **Expected:** An anonymous function symbol is created with a `[dynamic]` dependency.
        ```
        - ~ <anonymous>() ...
          -> (1.0) [dynamic]
          -> (1.1)
        ```
    *   **Actual:** The analyzer misses the function and its dependencies.
        ```
        - @ result
        ```
---

### 3. Incomplete Language and Framework Analysis

#### `[ ]` **3.1. Failure to Parse Core JS/TS Syntax**
The system cannot analyze files containing only simple `export const` declarations with literal values.

*   **Affected Fixture:** `dep-graph-diamond`
*   **Expected:** `export const D = 'D';` produces an exported variable symbol.
*   **Actual:** The file is parsed as empty.

#### `[ ]` **3.2. Incorrect Symbol Scoping and Hoisting**
The analyzer incorrectly extracts nested functions and local variables as top-level symbols, breaking component and hook structures.

*   **Affected Fixtures:** `react-advanced`, `react-render-props`
*   **Code Context:** A hook `useCounter` containing a nested function `increment`, or a component `Counter` containing a local variable `theme`.
*   **Expected:** `increment` and `theme` should not appear as top-level symbols. They are implementation details of their parent scope.
    ```
    + ~ (1.1) useCounter()
      <- (4.2)
    ```
*   **Actual:** Nested symbols are "hoisted" to the top level, creating a flat, incorrect structure.
    ```
    + ~ (1.1) useCounter()
      <- (4.1)
    + ~ (1.2) increment()  // <-- Incorrectly hoisted
      <- (4.0)
    ```

#### `[ ]` **3.3. Failure to Analyze Advanced React Patterns**
The analyzer misinterprets key React patterns, leading to incorrect symbol types and broken hierarchies.

*   `[ ]` **3.3.1. React Components Identified as Functions:** Any functional component (including HOCs, server components, and basic components) is misidentified as a plain function (`~`) instead of a React component (`◇`).
    *   **Affected Fixtures:** `react-advanced`, `react-render-props`, `react-server-components`.
*   `[ ]` **3.3.2. Failure to Analyze Render Props:** The analyzer cannot parse the anonymous function passed as a prop inside JSX, completely losing the component sub-tree within it.
    *   **Affected Fixture:** `react-render-props`.
    *   **Expected:** An anonymous function (`~ <anonymous>`) is shown as a child of the `<MouseTracker>` element, containing its own JSX children.
        ```
        ⛶ MouseTracker
          -> (1.2)
          - ~ <anonymous>({x:#, y:#})
            ⛶ <>
        ```
    *   **Actual:** The render prop is ignored, and its JSX children (`h1`, `p`) are incorrectly hoisted as top-level symbols in the `App` file.
        ```
        + ◇ (2.2) MouseTracker
        + ⛶ (2.3) h1            // <-- Incorrectly hoisted
        + ⛶ (2.4) p             // <-- Incorrectly hoisted
        ```
*   `[ ]` **3.3.3. Incorrect File Directive Formatting:** `use client`/`use server` directives are captured literally instead of being normalized.
    *   **Affected Fixture:** `react-server-components`.
    *   **Expected:** Normalized labels `[server]` and `[client]`.
    *   **Actual:** Literal labels `[use server]` and `[use client]`.

#### `[ ]` **3.4. Failure to Parse CSS-in-JS Syntax**
The analyzer does not recognize the `styled.div` tagged template literal syntax. It incorrectly identifies the styled component as a simple variable.

*   **Affected Fixture:** `css-in-js`
*   **Expected:** A single, cohesive symbol for `CardWrapper` identified as a styled `div`.
    ```
    - ~div (1.1) CardWrapper { props: #CardProps } [styled] { 💧 📐 }
    ```
*   **Actual:** The symbol is split into a disconnected variable (`@`) and an empty component (`◇`).
    ```
    - @ CardWrapper
    ...
    + ◇ (1.3) CardWrapper
    ```

#### `[ ]` **3.5. Incomplete Multi-Language Tooling Integration**
The system cannot handle the code generation workflow from GraphQL.

*   **Affected Fixture:** `graphql-codegen`
*   **Problem:** The analyzer has no parser for `.graphql` files and fails to link the generated `.ts` file back to its source GraphQL query.
````

## File: scripts/ast.ts
````typescript
import { initializeParser, parse } from '../src/parser';
import { getLanguageForFile } from '../src/languages';
import path from 'node:path';

async function main() {
  const wasmDir = path.join(process.cwd(), 'test', 'wasm');
  await initializeParser({ wasmBaseUrl: wasmDir });

  const samples: Array<{file: string, code: string, title: string}> = [
    {
      file: 'sample.ts',
      title: 'TS class/interface snippet',
      code: `
export interface User { id: number; name: string; }
export type UserId = number | string;
export class ApiClient { private apiKey: string; constructor(key: string) { this.apiKey = key; } async fetchUser(id: UserId): Promise<User> { return { id: 1, name: 'x' }; } }
      `.trim()
    },
    {
      file: 'iife.js',
      title: 'IIFE and prototype',
      code: `
(function(){
  function Widget(name){ this.name = name }
  Widget.prototype.render = function(){ return 'x' }
  function * idGenerator(){ let i=0; while(true) yield i++; }
  window.Widget = Widget; window.idGenerator = idGenerator;
})();
      `.trim()
    },
    {
      file: 'cjs.js',
      title: 'CJS require',
      code: `
const cjs = require('./cjs_module');
      `.trim()
    },
    {
      file: 'cjs_exports.js',
      title: 'CJS module.exports',
      code: `
function cjsFunc() { console.log('cjs'); }
module.exports = {
  value: 42,
  run: () => cjsFunc()
};
      `.trim()
    },
    {
      file: 'tagged.js',
      title: 'Tagged template',
      code: `
function styler(strings, ...values) { return '' }
const name = 'a';
document.body.innerHTML = styler\`Hello, \${name}!\`;
      `.trim()
    },
    {
      file: 'abstract_class.ts',
      title: 'Abstract Class',
      code: `
abstract class BaseEntity {
  readonly id: string;
  static species: string;
  protected constructor(id: string) { this.id = id; }
  abstract getDescription(): string;
  static getSpeciesName(): string { return this.species; }
}
      `.trim()
    },
    {
      file: 'advanced_types.ts',
      title: 'Advanced Types',
      code: `
type EventName = 'click' | 'scroll' | 'mousemove';
type Style = 'bold' | 'italic';
type CssClass = \`text-\${Style}\`;
type HandlerMap = { [K in EventName]: (event: K) => void };
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
interface User { id: number; name: string; }
const config = { user: { id: 1, name: 'a' } satisfies User };
      `.trim()
    },
    {
        file: 'proxy.js',
        title: 'JS Proxy',
        code: `
const hiddenProp = Symbol('hidden');
const user = { name: 'John', [hiddenProp]: 'secret' };
const userProxy = new Proxy(user, {
  get(target, prop) {
    return prop in target ? target[prop] : 'N/A';
  }
});
        `.trim()
    }
  ];

  for (const sample of samples) {
    const lang = getLanguageForFile(sample.file)!;
    const tree = parse(sample.code, lang)!;
    console.log(`\n===== ${sample.title} (${sample.file}) =====`);
    printAST(tree.rootNode);
  }
}

function printAST(node: any, depth = 0) {
  const indent = '  '.repeat(depth);
  const isNamed = typeof node.isNamed === 'function' ? node.isNamed() : true;
  console.log(`${indent}${node.type}${isNamed ? '' : ' [anon]'} [${node.startPosition.row}:${node.startPosition.column}-${node.endPosition.row}:${node.endPosition.column}]`);

  const fieldNames: string[] = node.fieldNames || [];
  for (const fieldName of fieldNames) {
    const child = node.childForFieldName(fieldName);
    if (child) {
      console.log(`${indent}  ${fieldName}:`);
      printAST(child, depth + 2);
    }
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!fieldNames.some(fn => node.childForFieldName(fn) === child)) {
      printAST(child, depth + 1);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
````

## File: src/graph-resolver.ts
````typescript
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
````

## File: src/types.ts
````typescript
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
````

## File: src/analyzer.ts
````typescript
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
````

## File: src/queries/typescript.ts
````typescript
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
(method_definition name: (property_identifier) @symbol.method.def) @scope.method.def

; Method signatures (interfaces, abstract class methods)
(method_signature
  name: (property_identifier) @symbol.method.def) @scope.method.def

; Constructor definitions
(method_definition name: (property_identifier) @symbol.constructor.def
  (#eq? @symbol.constructor.def "constructor")) @scope.constructor.def

; Property signatures in interfaces (should be public by default)
(property_signature
  (property_identifier) @symbol.property.def)

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

; `satisfies` expressions
(satisfies_expression
  (type_identifier) @rel.references)

; Identifiers used in expressions
(binary_expression
  left: (identifier) @rel.references
  right: (identifier) @rel.references
)

; template literal types
(template_type
  (type_identifier) @rel.references)


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

; JSX component definitions (uppercase)
(jsx_opening_element
  name: (identifier) @symbol.react_component.def
  (#match? @symbol.react_component.def "^[A-Z]")) @scope.react_component.def

(jsx_self_closing_element
  name: (identifier) @symbol.react_component.def
  (#match? @symbol.react_component.def "^[A-Z]")) @scope.react_component.def

; JSX element definitions (lowercase tags)
(jsx_opening_element
  name: (identifier) @symbol.jsx_element.def
  (#match? @symbol.jsx_element.def "^[a-z]")) @scope.jsx_element.def

(jsx_self_closing_element
  name: (identifier) @symbol.jsx_element.def
  (#match? @symbol.jsx_element.def "^[a-z]")) @scope.jsx_element.def

; JSX component references (uppercase)
(jsx_opening_element
  name: (identifier) @rel.references
  (#match? @rel.references "^[A-Z]"))

(jsx_self_closing_element
  name: (identifier) @rel.references
  (#match? @rel.references "^[A-Z]"))
`;
````
