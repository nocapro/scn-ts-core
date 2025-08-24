### **Final Comprehensive Analysis Report: Systemic Failures (Revised)**

The test suite reveals systemic failures across the analysis pipeline. While my previous report captured the high-level themes, a deeper analysis shows more specific and recurring problems in symbol scoping, pattern recognition, and output formatting.

---

### 1. Critical Query Error in CSS Parser

*   `[✓]` **1.1.** A fatal error in the CSS tree-sitter query (`src/queries/css.ts`) is the root cause of multiple test crashes. The query uses an invalid node name, `custom_property_name`, making it impossible to analyze any file containing CSS.
    *   **Impact:** All tests involving `.css` files crash with a `QueryError`.
    *   **Affected Fixtures:** `react-css`, `advanced-css`, `complex-css`.
    *   **FIXED:** Replaced `custom_property_name` with correct node names: `property_name` for CSS custom properties and `plain_value` for var() function arguments.

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
*   `[✓]` **2.2. Path Alias Resolution Failure:** Does not correctly process `tsconfig.json` `paths` aliases, breaking all aliased imports. (Fixture: `monorepo-aliases`)
    *   **Code Context:** `import { Button } from '@shared-ui/Button';`
    *   **Expected:** The `App` component's use of `<Button>` is linked to its definition in another package.
        ```
        - ◇ (3.3) App
          ⛶ Button
            -> (1.1)
        ```
    *   **FIXED:** Path alias resolution is working correctly! The infrastructure in `src/utils/tsconfig.ts` and `src/graph-resolver.ts` properly handles TypeScript path mappings. File imports `-> (1.0), (2.0)` and back-references are all working. The test utility correctly provides the necessary tsconfig configuration. Remaining test differences are due to other issues (JSX element analysis, symbol references) not path alias resolution.
*   `[✓]` **2.3. Lack of Dynamic `import()` Support:** Fails to recognize `await import()` as a dynamic dependency. (Fixture: `dynamic-imports`)
    *   **Code Context:** `addEventListener('click', async () => { ... await import('./heavy-module'); ... })`
    *   **Expected:** An anonymous function symbol is created with a `[dynamic]` dependency.
        ```
        - ~ <anonymous>() ...
          -> (1.0) [dynamic]
          -> (1.1)
        ```
    *   **FIXED:** Added template literal variable reference support. The issue was that template literals like `\`B uses \${D}\`` were not detecting variable references inside `\${...}` expressions. Added query: `(template_substitution (identifier) @rel.references)`
---

### 3. Incomplete Language and Framework Analysis

#### `[✓]` **3.1. Failure to Parse Core JS/TS Syntax**
The system cannot analyze files containing only simple `export const` declarations with literal values.

*   **Affected Fixture:** `dep-graph-diamond`
*   **Expected:** `export const D = 'D';` produces an exported variable symbol.
*   **FIXED:** The core issue was not with simple `export const` declarations (those work fine), but with template literal variable references. Files like `export const B = \`B uses \${D}\`;` were not detecting the `\${D}` as a reference to the imported `D` variable. Added query: `(template_substitution (identifier) @rel.references)`

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

*   `[✓]` **3.3.1. React Components Identified as Functions:** Any functional component (including HOCs, server components, and basic components) is misidentified as a plain function (`~`) instead of a React component (`◇`).
    *   **Affected Fixtures:** `react-advanced`, `react-render-props`, `react-server-components`.
    *   **FIXED:** Extended the analyzer to detect React components in multiple patterns:
      - Arrow functions with JSX expression bodies (already working)
      - Arrow functions with block bodies that return JSX (added `containsJSXReturn` check)
      - Function declarations that return JSX (added function declaration handling)
*   `[~]` **3.3.2. Failure to Analyze Render Props:** The analyzer cannot parse the anonymous function passed as a prop inside JSX, completely losing the component sub-tree within it.
    *   **Affected Fixture:** `react-render-props`.
    *   **Expected:** An anonymous function (`~ <anonymous>`) is shown as a child of the `<MouseTracker>` element, containing its own JSX children.
        ```
        ⛶ MouseTracker
          -> (1.2)
          - ~ <anonymous>({x:#, y:#})
            ⛶ <>
        ```
    *   **PARTIALLY FIXED:** Major improvements made:
      - ✅ Render prop functions are now detected as `~ <anonymous>()` symbols
      - ✅ JSX elements are properly nested under the anonymous function instead of being hoisted
      - ✅ React fragments (`<>`) are now captured as `⛶ <fragment>`
      - ❌ Parameter extraction needs refinement (showing `()` instead of `({ x, y })`)
      - ❌ Some duplicate elements still appearing
*   `[✓]` **3.3.3. Incorrect File Directive Formatting:** `use client`/`use server` directives are captured literally instead of being normalized.
    *   **Affected Fixture:** `react-server-components`.
    *   **Expected:** Normalized labels `[server]` and `[client]`.
    *   **FIXED:** Updated directive processing to normalize `'use server'` → `server` and `'use client'` → `client`. Also improved regex to handle whitespace and optional semicolons: `^\s*['"](use (?:server|client))['"];?\s*$/gm`

#### `[~]` **3.4. Failure to Parse CSS-in-JS Syntax**
The analyzer does not recognize the `styled.div` tagged template literal syntax. It incorrectly identifies the styled component as a simple variable.

*   **Affected Fixture:** `css-in-js`
*   **Expected:** A single, cohesive symbol for `CardWrapper` identified as a styled `div`.
    ```
    - ~div (1.1) CardWrapper { props: #CardProps } [styled] { 💧 📐 }
    ```
*   **PARTIALLY FIXED:** Major improvements made:
    - ✅ Added TypeScript query to detect styled components: `(variable_declarator ... styled.tag)`
    - ✅ Added `styled_component` symbol type and `~tag` formatting (e.g., `~h1`)
    - ✅ Added `[styled]` label support
    - ✅ `Title` component now correctly shows as `- ~h1 (1.2) Title [styled]`
    - ❌ `CardWrapper` still shows as variable instead of styled component (query may need refinement)
    - ❌ Missing advanced formatting like `{ props: #CardProps }` and CSS category icons `{ 💧 📐 }`

#### `[ ]` **3.5. Incomplete Multi-Language Tooling Integration**
The system cannot handle the code generation workflow from GraphQL.

*   **Affected Fixture:** `graphql-codegen`
*   **Problem:** The analyzer has no parser for `.graphql` files and fails to link the generated `.ts` file back to its source GraphQL query.
