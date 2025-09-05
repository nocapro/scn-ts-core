# Directory Structure
```
packages/
  scn-ts-web-demo/
    src/
      components/
        OutputOptions.tsx
      hooks/
        useAnalysis.hook.ts
      services/
        analysis.service.ts
      App.tsx
      constants.ts
      types.ts
      worker.ts
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
src/
  constants.ts
  formatter.ts
  index.ts
  main.ts
  tokenizer.ts
  types.ts
test/
  unit/
    calculateTokenImpact.test.ts
package.json
tsconfig.json
```

# Files

## File: test/unit/calculateTokenImpact.test.ts
```typescript
import { describe, it, expect, beforeAll } from 'bun:test';
import { calculateTokenImpact, initializeTokenizer } from '../../src/main';
import type { SourceFile, FormattingOptions, CodeSymbol } from '../../src/types';

const mockFile: SourceFile = {
    id: 1,
    relativePath: 'test.ts',
    absolutePath: '/test.ts',
    sourceCode: `
        export class MyClass {
            myMethod() {}
        }
        export const myVar = 1;
    `,
    language: { id: 'typescript', name: 'TypeScript', extensions: ['.ts'], wasmPath: '' } as any,
    symbols: [
        {
            id: '1.1',
            fileId: 1,
            name: 'MyClass',
            kind: 'class',
            isExported: true,
            dependencies: [],
            range: { start: { line: 1, column: 8 }, end: { line: 1, column: 15 } },
            scopeRange: { start: { line: 1, column: 17 }, end: { line: 3, column: 9 } },
        } as CodeSymbol,
        {
            id: '1.2',
            fileId: 1,
            name: 'myMethod',
            kind: 'method',
            isExported: false,
            dependencies: [],
            range: { start: { line: 2, column: 12 }, end: { line: 2, column: 20 } },
            scopeRange: { start: { line: 2, column: 24 }, end: { line: 2, column: 26 } },
        } as CodeSymbol,
        {
            id: '1.3',
            fileId: 1,
            name: 'myVar',
            kind: 'variable',
            isExported: true,
            dependencies: [],
            range: { start: { line: 4, column: 20 }, end: { line: 4, column: 25 } },
            scopeRange: { start: { line: 4, column: 8 }, end: { line: 4, column: 29 } },
        } as CodeSymbol,
    ],
    parseError: false,
};
const mockSourceFiles: SourceFile[] = [mockFile];

describe('calculateTokenImpact', () => {
    beforeAll(() => {
        initializeTokenizer();
    });

    it('should calculate negative impact for disabling a default-on option (showIcons)', () => {
        const baseOptions: FormattingOptions = {}; // Defaults to true
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);
        
        expect(impact.options.showIcons).toBeDefined();
        expect(impact.options.showIcons).toBeLessThan(0);
    });

    it('should calculate positive impact for enabling an option that was off', () => {
        const baseOptions: FormattingOptions = { showIcons: false };
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        expect(impact.options.showIcons).toBeDefined();
        expect(impact.options.showIcons).toBeGreaterThan(0);
    });

    it('should calculate negative impact for disabling showExportedIndicator', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        expect(impact.options.showExportedIndicator).toBeDefined();
        expect(impact.options.showExportedIndicator).toBeLessThan(0);
    });

    it('should calculate negative impact for disabling groupMembers', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        // Disabling grouping should change whitespace, likely reducing tokens
        expect(impact.options.groupMembers).toBeDefined();
        // The impact could be small, or even zero if whitespace changes don't cross token boundaries, but it shouldn't be positive.
        expect(impact.options.groupMembers).toBeLessThanOrEqual(0);
    });

    it('should calculate impact for displayFilters', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);

        // Hiding a symbol kind should reduce tokens
        expect(impact.displayFilters.class).toBeDefined();
        expect(impact.displayFilters.class).toBeLessThan(0);
        expect(impact.displayFilters.method).toBeDefined();
        expect(impact.displayFilters.method).toBeLessThan(0);
        expect(impact.displayFilters.variable).toBeDefined();
        expect(impact.displayFilters.variable).toBeLessThan(0);
    });

    it('should return zero impact for a symbol kind not present in the source', () => {
        const baseOptions: FormattingOptions = {};
        const impact = calculateTokenImpact(mockSourceFiles, baseOptions);
        
        expect(impact.displayFilters.interface).toBeUndefined();
    });
});
```

## File: packages/scn-ts-web-demo/src/constants.ts
```typescript
import type { LogLevel } from 'scn-ts-core';

export const levelColorMap: Record<Exclude<LogLevel, 'silent'>, string> = {
  error: 'text-red-500',
  warn: 'text-yellow-500',
  info: 'text-blue-400',
  debug: 'text-gray-500',
};
```

## File: packages/scn-ts-web-demo/src/types.ts
```typescript
import type { LogLevel } from 'scn-ts-core';

export interface LogEntry {
  level: Exclude<LogLevel, 'silent'>;
  message: string;
  timestamp: number;
}

export interface ProgressData {
  percentage: number;
  message: string;
}

export interface FormattingOptions {
  showOutgoing?: boolean;
  showIncoming?: boolean;
  showIcons?: boolean;
  showExportedIndicator?: boolean;
  showPrivateIndicator?: boolean;
  showModifiers?: boolean;
  showTags?: boolean;
  showSymbolIds?: boolean;
  groupMembers?: boolean;
  displayFilters?: Partial<Record<string, boolean>>;
  showFilePrefix?: boolean;
  showFileIds?: boolean;
}
```

## File: packages/scn-ts-web-demo/index.html
```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SCN-TS Web Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## File: packages/scn-ts-web-demo/postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## File: packages/scn-ts-web-demo/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
    },
  },
  plugins: [],
}
```

## File: packages/scn-ts-web-demo/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "noEmit": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "scn-ts-core": ["../../src/index.ts"],
      "scn-ts-core/*": ["../../src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

## File: packages/scn-ts-web-demo/tsconfig.node.json
```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

## File: src/constants.ts
```typescript
export const ICONS: Record<string, string> = {
    class: '◇', interface: '{}', function: '~', method: '~',
    constructor: '~',
    variable: '@', property: '@', enum: '☰', enum_member: '@',
    type_alias: '=:', react_component: '◇', jsx_element: '⛶', styled_component: '~',
    css_class: '¶', css_id: '¶', css_tag: '¶', css_at_rule: '¶',
    go_package: '◇',
    rust_struct: '◇', rust_trait: '{}', rust_impl: '+',
    error: '[error]', default: '?',
};

export const SCN_SYMBOLS = {
    FILE_PREFIX: '§',
    EXPORTED_PREFIX: '+',
    PRIVATE_PREFIX: '-',
    OUTGOING_ARROW: '->',
    INCOMING_ARROW: '<-',
    ASYNC: '...',
    THROWS: '!',
    PURE: 'o',
    TAG_GENERATED: '[generated]',
    TAG_DYNAMIC: '[dynamic]',
    TAG_GOROUTINE: '[goroutine]',
    TAG_MACRO: '[macro]',
    TAG_SYMBOL: '[symbol]',
    TAG_PROXY: '[proxy]',
    TAG_ABSTRACT: '[abstract]',
    TAG_STATIC: '[static]',
    TAG_STYLED: '[styled]',
};

export const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.go', '.rs', '.py', '.java', '.graphql', ''];
```

## File: src/tokenizer.ts
```typescript
import { Tiktoken } from "js-tiktoken/lite";
import cl100k_base from "js-tiktoken/ranks/cl100k_base";
import { logger } from './logger';

let encoder: Tiktoken | null = null;

/**
 * Initializes the tokenizer. This is a lightweight, synchronous operation for the pure JS version.
 * It's safe to call this multiple times.
 * @returns {boolean} - True if initialization was successful, false otherwise.
 */
export function initializeTokenizer(): boolean {
    if (encoder) {
        return true;
    }
    try {
        encoder = new Tiktoken(cl100k_base);
        logger.debug('Tokenizer initialized.');
        return true;
    } catch (e) {
        logger.error("Failed to initialize tokenizer:", e);
        return false;
    }
}

/**
 * Counts the number of tokens in a given text string using the cl100k_base model.
 * The tokenizer will be initialized on the first call if it hasn't been already.
 *
 * @param {string} text - The text to count tokens for.
 * @returns {number} - The number of tokens, or 0 if tokenization fails.
 */
export function countTokens(text: string): number {
    if (!encoder) {
        const success = initializeTokenizer();
        if (!success) {
            return 0;
        }
    }

    if (!text || !encoder) {
        return 0;
    }

    try {
        return encoder.encode(text).length;
    } catch (e) {
        logger.error("Tokenization error:", e);
        return 0;
    }
}
```

## File: packages/scn-ts-web-demo/src/services/analysis.service.ts
```typescript
import * as Comlink from 'comlink';
import type { WorkerApi } from '../worker';
import type { LogEntry, ProgressData } from '../types';
import type { LogLevel, SourceFile, FormattingOptions, FormattingOptionsTokenImpact } from 'scn-ts-core';

export type AnalysisServiceAPI = {
  init: () => Promise<void>;
  analyze: (
    filesInput: string,
    logLevel: LogLevel,
    formattingOptions: FormattingOptions,
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void,
  ) => Promise<{ result: SourceFile[]; analysisTime: number, tokenImpact: FormattingOptionsTokenImpact }>;
  cancel: () => Promise<void>;
  cleanup: () => void;
};

export function createAnalysisService(): AnalysisServiceAPI {
  const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
  const workerApi = Comlink.wrap<WorkerApi>(worker);

  const init = async (): Promise<void> => {
    return workerApi.init();
  };

  const analyze = async (
    filesInput: string,
    logLevel: LogLevel,
    formattingOptions: FormattingOptions,
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void,
  ): Promise<{ result: SourceFile[]; analysisTime: number, tokenImpact: FormattingOptionsTokenImpact }> => {
    return workerApi.analyze({ filesInput, logLevel, formattingOptions }, Comlink.proxy(onProgress), Comlink.proxy(onLog));
  };

  const cancel = async (): Promise<void> => {
    return workerApi.cancel();
  };

  const cleanup = (): void => {
    workerApi[Comlink.releaseProxy]();
    worker.terminate();
  };

  return {
    init,
    analyze,
    cancel,
    cleanup,
  };
}
```

## File: packages/scn-ts-web-demo/src/worker.ts
```typescript
import * as Comlink from 'comlink';
import { initializeParser, analyzeProject, logger, calculateTokenImpact } from 'scn-ts-core';
import type { FileContent, LogLevel, SourceFile, FormattingOptions, FormattingOptionsTokenImpact } from 'scn-ts-core';
import type { LogEntry, ProgressData } from './types';

function sanitizeAnalysisResult(result: SourceFile[]): SourceFile[] {
  // Sanitize the result to make it structured-clonable for Comlink.
  result.forEach(file => {
    delete file.ast;
    if (file.language) {
      // The language object on the source file is a reference to a global
      // singleton. We must clone it before deleting non-serializable properties,
      // otherwise the parser state is destroyed for subsequent analysis runs.
      const sanitizedLanguage = { ...file.language };
      delete sanitizedLanguage.parser;
      delete sanitizedLanguage.loadedLanguage;
      file.language = sanitizedLanguage;
    }
  });
  return result;
}

// Define the API the worker will expose
function createWorkerApi() {
  let isInitialized = false;
  let abortController: AbortController | null = null;

  async function init() {
    if (isInitialized) return;
    await initializeParser({ wasmBaseUrl: '/wasm/' });
    isInitialized = true;
  }

  async function analyze(
    { filesInput, logLevel, formattingOptions }: { filesInput: string; logLevel: LogLevel, formattingOptions: FormattingOptions },
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void
  ): Promise<{ result: SourceFile[], analysisTime: number, tokenImpact: FormattingOptionsTokenImpact }> {
    if (!isInitialized) {
      throw new Error('Worker not initialized.');
    }

    abortController = new AbortController();

    logger.setLogHandler((level, ...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      onLog({ level, message, timestamp: Date.now() });
    });
    logger.setLevel(logLevel);

    try {
      let files: FileContent[] = [];
      try {
        files = JSON.parse(filesInput);
        if (!Array.isArray(files)) throw new Error("Input is not an array.");
      } catch (error) {
        throw new Error(`Invalid JSON input: ${error instanceof Error ? error.message : String(error)}`);
      }

      const { sourceFiles: analysisResult, analysisTime } = await analyzeProject({
        files,
        onProgress,
        logLevel,
        signal: abortController.signal,
      });

      const tokenImpact = calculateTokenImpact(analysisResult, formattingOptions);

      return { result: sanitizeAnalysisResult(analysisResult), analysisTime, tokenImpact };
    } finally {
      logger.setLogHandler(null);
      abortController = null;
    }
  }

  function cancel() {
    abortController?.abort();
  }
  
  return { init, analyze, cancel };
}

const workerApi = createWorkerApi();

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;
```

## File: packages/scn-ts-web-demo/package.json
```json
{
  "name": "scn-ts-web-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "check": "tsc --noEmit",
    "preview": "vite preview",
    "prepare": "node scripts/prepare-wasm.cjs"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "comlink": "^4.4.1",
    "js-tiktoken": "^1.0.21",
    "lucide-react": "^0.379.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vite": "^5.2.12",
    "vite-plugin-top-level-await": "^1.4.1",
    "vite-plugin-wasm": "^3.3.0"
  }
}
```

## File: packages/scn-ts-web-demo/src/components/OutputOptions.tsx
```typescript
import * as React from 'react';
import type { FormattingOptions } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FormattingOptionsTokenImpact } from 'scn-ts-core';

import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface OutputOptionsProps {
  options: FormattingOptions;
  setOptions: React.Dispatch<React.SetStateAction<FormattingOptions>>;
  tokenImpact: FormattingOptionsTokenImpact | null;
}


export interface OutputOptionsHandle {
  expandAll: () => void;
  collapseAll: () => void;
}

type RegularOptionKey = keyof Omit<FormattingOptions, 'displayFilters'>;
type OptionItem = RegularOptionKey | string | { name: string; children: OptionItem[] };

const symbolKindLabels: Record<string, string> = {
  // TS/JS
  class: 'Classes',
  interface: 'Interfaces',
  function: 'Functions',
  method: 'Methods',
  constructor: 'Constructors',
  variable: 'Variables',
  property: 'Properties',
  enum: 'Enums',
  enum_member: 'Enum Members',
  type_alias: 'Type Aliases',
  module: 'Modules',
  // React
  react_component: 'React Components',
  styled_component: 'Styled Components',
  jsx_element: 'JSX Elements',
  // CSS
  css_class: 'CSS Classes',
  css_id: 'CSS IDs',
  css_tag: 'CSS Tags',
  css_at_rule: 'CSS At-Rules',
  css_variable: 'CSS Variables',
  // Go
  go_package: 'Go Packages',
  // Rust
  rust_struct: 'Rust Structs',
  rust_trait: 'Rust Traits',
  rust_impl: 'Rust Impls',
};

const tsDeclarationKinds = ['class', 'interface', 'function', 'variable', 'enum', 'type_alias', 'module'];
const tsMemberKinds = ['method', 'constructor', 'property', 'enum_member'];
const reactKinds = ['react_component', 'styled_component', 'jsx_element'];
const cssKinds = ['css_class', 'css_id', 'css_tag', 'css_at_rule', 'css_variable'];
const goKinds = ['go_package'];
const rustKinds = ['rust_struct', 'rust_trait', 'rust_impl'];

const toFilter = (kind: string): string => `filter:${kind}`;

const symbolVisibilityTree: OptionItem = {
  name: 'Symbol Visibility',
  children: [
    {
      name: 'TypeScript/JavaScript',
      children: [
        { name: 'Declarations', children: tsDeclarationKinds.map(toFilter) },
        { name: 'Members', children: tsMemberKinds.map(toFilter) },
      ],
    },
    { name: 'React', children: reactKinds.map(toFilter) },
    { name: 'CSS', children: cssKinds.map(toFilter) },
    {
      name: 'Other Languages',
      children: [
        { name: 'Go', children: goKinds.map(toFilter) },
        { name: 'Rust', children: rustKinds.map(toFilter) },
      ],
    },
  ],
};

const optionTree: OptionItem[] = [
  {
    name: 'Display Elements',
    children: [
      'showIcons',
      {
        name: 'Indicators',
        children: ['showExportedIndicator', 'showPrivateIndicator'],
      },
      'showModifiers',
      'showTags',
      {
        name: 'Identifiers',
        children: ['showFilePrefix', 'showFileIds', 'showSymbolIds'],
      },
    ],
  },
  {
    name: 'Relationships',
    children: ['showOutgoing', 'showIncoming'],
  },
  {
    name: 'Structure',
    children: ['groupMembers'],
  },
  symbolVisibilityTree,
];

const optionLabels: Record<RegularOptionKey, string> & Record<string, string> = {
  ...symbolKindLabels,
  showIcons: 'Icons',
  showExportedIndicator: 'Exported (+)',
  showPrivateIndicator: 'Private (-)',
  showModifiers: 'Modifiers',
  showTags: 'Tags',
  showSymbolIds: 'Symbol IDs',
  showFilePrefix: 'File Prefix (§)',
  showFileIds: 'File IDs',
  showOutgoing: 'Outgoing',
  showIncoming: 'Incoming',
  groupMembers: 'Group Members',
};

function getAllKeys(item: OptionItem): string[] {
  if (typeof item === 'string') {
    return [item];
  }
  return item.children.flatMap(getAllKeys);
}

const getAllGroupNames = (items: OptionItem[]): string[] => {
  return items.flatMap(item => {
    if (typeof item === 'object' && 'name' in item) {
      return [item.name, ...getAllGroupNames(item.children)];
    }
    return [];
  });
}

const OutputOptions = React.forwardRef<OutputOptionsHandle, OutputOptionsProps>(({ options, setOptions, tokenImpact }, ref) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () =>
      new Set([
        'Display Elements', 'Indicators', 'Relationships', 'Structure',
        'TypeScript/JavaScript',
        'React', 'Identifiers',
      ])
  );

  const allGroupNames = React.useMemo(() => getAllGroupNames(optionTree), []);

  const expandAll = React.useCallback(() => {
    setExpandedGroups(new Set(allGroupNames));
  }, [allGroupNames]);

  const collapseAll = React.useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  React.useImperativeHandle(ref, () => ({
    expandAll,
    collapseAll,
  }), [expandAll, collapseAll]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleChange = (optionKey: string) => (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    if (optionKey.startsWith('filter:')) {
      const kind = optionKey.substring('filter:'.length);
      setOptions(prev => ({
        ...prev,
        displayFilters: { ...(prev.displayFilters ?? {}), [kind]: isChecked },
      }));
    } else {
      setOptions(prev => ({ ...prev, [optionKey]: isChecked }));
    }
  };

  const handleGroupChange = (keys: ReadonlyArray<string>) => (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setOptions(prev => {
      const newOptions: FormattingOptions = { ...prev };
      const newDisplayFilters = { ...(prev.displayFilters ?? {}) };

      for (const key of keys) {
        if (key.startsWith('filter:')) {
          newDisplayFilters[key.substring('filter:'.length)] = isChecked;
        } else {
          newOptions[key as RegularOptionKey] = isChecked;
        }
      }
      newOptions.displayFilters = newDisplayFilters;
      return newOptions;
    });
  };

  const renderItem = (item: OptionItem, level: number): React.ReactNode => {
    if (typeof item === 'string') {
      const key = item as string;
      const isFilter = key.startsWith('filter:');
      const filterKind = isFilter ? key.substring('filter:'.length) : null;
      const labelKey = filterKind ?? key;

      return (
        <div key={key} style={{ paddingLeft: `${level * 1.5}rem` }} className="flex items-center space-x-1.5">
          <Checkbox
            id={key}
            checked={
              isFilter ? options.displayFilters?.[filterKind!] ?? true : options[key as RegularOptionKey] ?? true
            }
            onCheckedChange={handleChange(key)}
          />
          <Label htmlFor={key} className="flex-1 cursor-pointer select-none text-sm text-muted-foreground font-normal">
            <div className="flex justify-between items-center">
              <span>{optionLabels[labelKey as keyof typeof optionLabels] ?? labelKey}</span>
              {tokenImpact && (
                <span className="text-xs font-mono tabular-nums text-foreground/50">
                  {(() => {
                    const impact = isFilter
                      ? tokenImpact.displayFilters?.[filterKind!]
                      : tokenImpact.options?.[key as RegularOptionKey];
                    if (impact === undefined) return null;
                    return `${impact > 0 ? '+' : ''}${impact}`;
                  })()}
                </span>
              )}
            </div>
          </Label>
        </div>
      );
    }

    const { name, children } = item;
    const isExpanded = expandedGroups.has(name);
    const allKeys = getAllKeys(item);
    const allChecked = allKeys.every(key => {
      if (key.startsWith('filter:')) {
        return options.displayFilters?.[key.substring('filter:'.length)] ?? true;
      }
      return options[key as RegularOptionKey] ?? true;
    });
    const groupTokenImpact = tokenImpact ? allKeys.reduce((sum, key) => {
      let impact: number | undefined;
      if (key.startsWith('filter:')) {
        const kind = key.substring('filter:'.length);
        impact = tokenImpact.displayFilters?.[kind];
      } else {
        impact = tokenImpact.options?.[key as RegularOptionKey];
      }
      return sum + (impact ?? 0);
    }, 0) : null;

    const impactDisplay = tokenImpact && groupTokenImpact !== null ? (
      <span className="text-xs font-mono tabular-nums text-foreground/50 ml-auto mr-2">
        {(() => {
          const impact = groupTokenImpact;
          if (impact === undefined) return null;
          return `${impact > 0 ? '+' : ''}${impact}`;
        })()}
      </span>
    ) : null;

    return (
      <div key={name}>
        <div
          className="flex items-center space-x-1.5 py-1 rounded-md hover:bg-accent/50 cursor-pointer select-none -mx-2 px-2"
          style={{ paddingLeft: `calc(${level * 1.5}rem + 0.5rem)` }}
          onClick={() => toggleGroup(name)}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          <Checkbox
            id={`group-${name.replace(/\s+/g, '-')}`}
            title={`Toggle all in ${name}`}
            checked={allChecked}
            onCheckedChange={handleGroupChange(allKeys)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent row click from firing
          />
          <Label
            htmlFor={`group-${name.replace(/\s+/g, '-')}`} // The label itself is clickable
            className="flex-1 font-semibold text-sm cursor-pointer select-none"
          >
            <div className="flex justify-between items-center">
              <span>{name}</span> {impactDisplay}</div>
          </Label>
        </div>
        {isExpanded && (
          <div className="pt-1.5 space-y-1.5">
            {children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {optionTree.map(item => renderItem(item, 0))}
    </div>
  );
});

export default OutputOptions;
```

## File: packages/scn-ts-web-demo/src/hooks/useAnalysis.hook.ts
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import type { SourceFile, FormattingOptions, FormattingOptionsTokenImpact } from 'scn-ts-core';
import type { LogEntry, ProgressData } from '../types';
import { createAnalysisService, type AnalysisServiceAPI } from '../services/analysis.service';

export function useAnalysis() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SourceFile[] | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysisTime, setAnalysisTime] = useState<number | null>(null);
  const [tokenImpact, setTokenImpact] = useState<FormattingOptionsTokenImpact | null>(null);
  const serviceRef = useRef<AnalysisServiceAPI | null>(null);

  const onLog = useCallback((log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const onLogPartial = useCallback((log: Pick<LogEntry, 'level' | 'message'>) => {
    onLog({ ...log, timestamp: Date.now() });
  }, [onLog]);

  useEffect(() => {
    const service = createAnalysisService();
    serviceRef.current = service;

    const initializeWorker = async () => {
      try {
        await service.init();
        setIsInitialized(true);
        onLogPartial({ level: 'info', message: 'Analysis worker ready.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        onLogPartial({ level: 'error', message: `Worker failed to initialize: ${message}` });
      }
    };

    initializeWorker();

    return () => {
      service.cleanup();
      serviceRef.current = null;
    };
  }, [onLogPartial]);

  const resetAnalysisState = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisTime(null);
    setProgress(null);
    setTokenImpact(null);
    setLogs([]);
  }, []);

  const handleAnalyze = useCallback(async (filesInput: string, formattingOptions: FormattingOptions) => {
    if (!isInitialized || !serviceRef.current) {
      onLogPartial({ level: 'warn', message: 'Analysis worker not ready.' });
      return;
    }
    
    if (isLoading) {
      return; // Prevent multiple concurrent analyses
    }
    
    setIsLoading(true);
    resetAnalysisState();
    
    try {
      const { result, analysisTime, tokenImpact } = await serviceRef.current.analyze(
        filesInput,
        'debug',
        formattingOptions,
        setProgress,
        onLog
      );
      setAnalysisResult(result);
      setAnalysisTime(analysisTime);
      setTokenImpact(tokenImpact);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if ((error as Error).name === 'AbortError') {
        onLogPartial({ level: 'warn', message: 'Analysis canceled by user.' });
      } else {
        onLogPartial({ level: 'error', message: `Analysis error: ${message}` });
      }
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  }, [isInitialized, isLoading, resetAnalysisState, onLog, onLogPartial]);

  const handleStop = useCallback(() => {
    if (isLoading && serviceRef.current) {
      serviceRef.current.cancel();
    }
  }, [isLoading]);

  return {
    isInitialized,
    isLoading,
    analysisResult,
    progress,
    logs,
    analysisTime,
    tokenImpact,
    handleAnalyze,
    handleStop,
    onLogPartial,
  };
}
```

## File: packages/scn-ts-web-demo/vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "scn-ts-core": path.resolve(__dirname, "../../src/index.ts"),
    },
  },
  optimizeDeps: {
    // Exclude packages that have special loading mechanisms (like wasm)
    // to prevent Vite from pre-bundling them and causing issues.
    exclude: ['web-tree-sitter'],
    // Force pre-bundling of our monorepo packages. As linked dependencies,
    // Vite doesn't optimize it by default. We need to include it so Vite
    // discovers its deep CJS dependencies (like graphology) and converts
    // them to ESM for the dev server. We specifically `exclude` 'web-tree-sitter'
    // above to prevent Vite from interfering with its unique WASM loading mechanism.
    include: ['scn-ts-core'],
  },
  server: {
    headers: {
      // These headers are required for SharedArrayBuffer, which is used by
      // web-tree-sitter and is good practice for applications using wasm
      // with threading or advanced memory features.
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
```

## File: src/index.ts
```typescript
export {
    initializeParser,
    generateScn,
    generateScnFromConfig,
    calculateTokenImpact,
    analyzeProject,
    logger,
    initializeTokenizer,
    countTokens,
} from './main';

export { ICONS, SCN_SYMBOLS } from './constants';

export type {
    ParserInitOptions,
    SourceFile,
    LogLevel,
    InputFile,
    TsConfig,
    ScnTsConfig,
    AnalyzeProjectOptions,
    LogHandler,
    FormattingOptions,
    FormattingOptionsTokenImpact,
    FileContent,
    CodeSymbol,
    SymbolKind
} from './main';
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "composite": true,
    // Environment setup & latest features
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",

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
  },
  "include": ["src"]
}
```

## File: packages/scn-ts-web-demo/src/App.tsx
```typescript
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { generateScn, initializeTokenizer, countTokens } from 'scn-ts-core';
import { Button } from './components/ui/button';
import { Textarea } from './components/ui/textarea';
import LogViewer from './components/LogViewer';
import OutputOptions, { type OutputOptionsHandle } from './components/OutputOptions';
import { Legend } from './components/Legend'; 
import { Play, Loader, Copy, Check, StopCircle, ChevronsDown, ChevronsUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionHeader, AccordionTrigger } from './components/ui/accordion';
import { useAnalysis } from './hooks/useAnalysis.hook';
import { useClipboard } from './hooks/useClipboard.hook';
import { useResizableSidebar } from './hooks/useResizableSidebar.hook';
import { useAppStore } from './stores/app.store';
import { cn } from './lib/utils';
import type { CodeSymbol } from 'scn-ts-core';

function App() {
  const {
    filesInput,
    setFilesInput,
    scnOutput,
    setScnOutput,
    formattingOptions,
    setFormattingOptions,
  } = useAppStore();

  const {
    isInitialized,
    isLoading,
    analysisResult,
    progress,
    logs,
    analysisTime,
    tokenImpact,
    handleAnalyze: performAnalysis,
    handleStop,
    onLogPartial,
  } = useAnalysis();

  const outputOptionsRef = useRef<OutputOptionsHandle>(null);

  const { sidebarWidth, handleMouseDown } = useResizableSidebar(480);
  const { isCopied, handleCopy: performCopy } = useClipboard();

  useEffect(() => {
    if (!initializeTokenizer()) {
      onLogPartial({ level: 'error', message: 'Failed to initialize tokenizer.' });
    }
  }, [onLogPartial]);

  useEffect(() => {
    if (analysisResult) {
      setScnOutput(generateScn(analysisResult, formattingOptions));
    } else {
      setScnOutput('');
    }
  }, [analysisResult, formattingOptions]);

  const { tokenCounts, tokenReductionPercent } = useMemo(() => {
    const input = countTokens(filesInput);
    const output = countTokens(scnOutput);
    let reductionPercent: number | null = null;
    if (input > 0) {
      reductionPercent = ((input - output) / input) * 100;
    }
    return {
      tokenCounts: { input, output },
      tokenReductionPercent: reductionPercent,
    };
  }, [filesInput, scnOutput]);

  const handleCopy = useCallback(() => {
    performCopy(scnOutput);
  }, [performCopy, scnOutput]);

  const handleAnalyze = useCallback(async () => {
    performAnalysis(filesInput, formattingOptions);
  }, [performAnalysis, filesInput, formattingOptions]);

  const handleExpandOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    outputOptionsRef.current?.expandAll();
  };

  const handleCollapseOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    outputOptionsRef.current?.collapseAll();
  };

  const { totalSymbols, visibleSymbols } = useMemo(() => {
    if (!analysisResult) {
      return { totalSymbols: 0, visibleSymbols: 0 };
    }
    const allSymbols: CodeSymbol[] = analysisResult.flatMap(file => file.symbols);
    const total = allSymbols.length;
    const visible = allSymbols.filter(symbol => {
      return formattingOptions.displayFilters?.[symbol.kind] !== false;
    }).length;
    return { totalSymbols: total, visibleSymbols: visible };
  }, [analysisResult, formattingOptions.displayFilters]);

  return (
    <div className="h-screen w-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside style={{ width: `${sidebarWidth}px` }} className="max-w-[80%] min-w-[320px] flex-shrink-0 flex flex-col border-r">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background relative z-20">
          <h1 className="text-xl font-bold tracking-tight">SCN-TS Web Demo</h1>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <>
                <Button disabled className="w-32 justify-center">
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  <span>{progress ? `${Math.round(progress.percentage)}%` : 'Analyzing...'}</span>
                </Button>
                <Button onClick={handleStop} variant="outline" size="icon" title="Stop analysis">
                  <StopCircle className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleAnalyze} disabled={!isInitialized} className="w-32 justify-center">
                <Play className="mr-2 h-4 w-4" />
                <span>Analyze</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <Accordion type="multiple" defaultValue={['input', 'options', 'logs']} className="w-full">
            <AccordionItem value="input">
              <AccordionHeader>
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                  <div className="flex w-full justify-between items-center">
                    <span>Input Files (JSON)</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums">
                      {tokenCounts.input.toLocaleString()} tokens
                    </span>
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <div className="px-4 pb-4 h-96">
                  <Textarea
                    value={filesInput}
                    onChange={(e) => setFilesInput(e.currentTarget.value)}
                    className="h-full w-full font-mono text-xs resize-none"
                    placeholder="Paste an array of FileContent objects here..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="options">
              <AccordionHeader className="items-center">
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">
                  <div className="flex w-full items-center justify-between">
                    <span>Formatting Options</span>
                      {analysisResult && (
                        <span className="text-xs font-normal text-muted-foreground tabular-nums">
                          {visibleSymbols} / {totalSymbols} symbols
                        </span>
                      )}
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2 pr-4">
                  <Button variant="ghost" size="icon" onClick={handleExpandOptions} title="Expand all" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <ChevronsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCollapseOptions} title="Collapse all" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <ChevronsUp className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionHeader>
              <AccordionContent className="px-4">
                <OutputOptions ref={outputOptionsRef} options={formattingOptions} setOptions={setFormattingOptions} tokenImpact={tokenImpact} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="logs">
              <AccordionHeader>
                <AccordionTrigger className="px-4 text-sm font-semibold hover:no-underline">Logs</AccordionTrigger>
              </AccordionHeader>
              <AccordionContent className="px-4">
                <LogViewer logs={logs} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </aside>

      {/* Resizer */}
      <div
        role="separator"
        onMouseDown={handleMouseDown}
        className="w-1.5 flex-shrink-0 cursor-col-resize hover:bg-primary/20 transition-colors duration-200"
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Output (SCN)</h2>
          <div className="flex items-center gap-4">
            {analysisTime !== null && (
              <span className="text-sm text-muted-foreground">
                Analyzed in {(analysisTime / 1000).toFixed(2)}s
              </span>
            )}
            <span className="text-sm font-normal text-muted-foreground tabular-nums">{tokenCounts.output.toLocaleString()} tokens</span>
            {tokenReductionPercent !== null && analysisResult && (
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  tokenReductionPercent >= 0 ? "text-green-500" : "text-red-500"
                )}
                title="Token count change from input to output"
              >
                {tokenReductionPercent >= 0 ? '▼' : '▲'}{' '}
                {Math.abs(tokenReductionPercent).toFixed(0)}%
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!scnOutput} title="Copy to clipboard">
              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="p-4 flex-grow overflow-auto font-mono text-xs relative">
          <Legend />
          <pre className="whitespace-pre-wrap">
            {scnOutput || (isLoading ? "Generating..." : "Output will appear here.")}
          </pre>
        </div>
      </main>
    </div>
  );
}

export default App;
```

## File: package.json
```json
{
  "name": "scn-ts-core",
  "module": "src/index.ts",
  "type": "module",
  "private": true,
  "dependencies": {
    "js-tiktoken": "^1.0.21"
  },
  "scripts": {
    "check": "tsc --build",
    "test": "bun test"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "web-tree-sitter": "0.25.6",
    "typescript": "^5.4.5"
  },
  "peerDependencies": {
    "typescript": "^5"
  }
}
```

## File: src/main.ts
```typescript
import { getLanguageForFile } from './languages';
import { initializeParser as init, parse } from './parser';
import type { ParserInitOptions, SourceFile, InputFile, ScnTsConfig, AnalyzeProjectOptions, FormattingOptions, FormattingOptionsTokenImpact, SymbolKind } from './types';
import { analyze } from './analyzer';
import { formatScn } from './formatter';
import path from './utils/path';
import { getPathResolver } from './utils/tsconfig';
import { resolveGraph } from './graph-resolver';
import { logger } from './logger';
import { initializeTokenizer as initTokenizer, countTokens as countTokensInternal } from './tokenizer';

/**
 * Public API to initialize the parser. Must be called before any other APIs.
 */
export const initializeParser = (options: ParserInitOptions): Promise<void> => init(options);

/**
 * Initializes the tokenizer. Call this for consistency, although `countTokens` will auto-initialize on first use.
 * It's a synchronous and lightweight operation.
 */
export const initializeTokenizer = (): boolean => initTokenizer();

// Types for web demo
export type { ParserInitOptions, SourceFile, LogLevel, InputFile, TsConfig, ScnTsConfig, AnalyzeProjectOptions, LogHandler, FormattingOptions, FormattingOptionsTokenImpact, CodeSymbol, SymbolKind } from './types';
export type FileContent = InputFile;

// Exports for web demo. The constants are exported from index.ts directly.
export { logger };

/**
 * Counts tokens in a string using the cl100k_base model.
 */
export const countTokens = (text: string): number => countTokensInternal(text);

/**
 * Generate SCN from analyzed source files
 */
export const generateScn = (analyzedFiles: SourceFile[], options?: FormattingOptions): string => {
    return formatScn(analyzedFiles, options);
};

/**
 * Calculates the token impact of toggling each formatting option.
 * This can be slow as it re-generates the SCN for each option.
 * @param analyzedFiles The result from `analyzeProject`.
 * @param baseOptions The formatting options to calculate deltas from.
 * @returns An object detailing the token change for toggling each option.
 */
export const calculateTokenImpact = (
    analyzedFiles: SourceFile[],
    baseOptions: FormattingOptions
): FormattingOptionsTokenImpact => {
    logger.debug('Calculating token impact...');
    const startTime = performance.now();

    const baseScn = formatScn(analyzedFiles, baseOptions);
    const baseTokens = countTokensInternal(baseScn);

    const impact: FormattingOptionsTokenImpact = {
        options: {},
        displayFilters: {},
    };

    const simpleOptionKeys: Array<keyof Omit<FormattingOptions, 'displayFilters'>> = [
        'showOutgoing', 'showIncoming', 'showIcons', 'showExportedIndicator',
        'showPrivateIndicator', 'showModifiers', 'showTags', 'showSymbolIds',
        'groupMembers', 'showFilePrefix', 'showFileIds'
    ];

    for (const key of simpleOptionKeys) {
        // All boolean options default to true.
        const currentValue = baseOptions[key] ?? true;
        const newOptions = { ...baseOptions, [key]: !currentValue };
        const newScn = formatScn(analyzedFiles, newOptions);
        const newTokens = countTokensInternal(newScn);
        impact.options[key] = newTokens - baseTokens;
    }

    const allSymbolKinds = new Set<SymbolKind>(analyzedFiles.flatMap(file => file.symbols.map(s => s.kind)));

    for (const kind of allSymbolKinds) {
        const currentFilterValue = baseOptions.displayFilters?.[kind] ?? true;
        const newOptions = {
            ...baseOptions,
            displayFilters: { ...(baseOptions.displayFilters ?? {}), [kind]: !currentFilterValue }
        };
        const newScn = formatScn(analyzedFiles, newOptions);
        const newTokens = countTokensInternal(newScn);
        impact.displayFilters[kind] = newTokens - baseTokens;
    }

    const duration = performance.now() - startTime;
    logger.debug(`Token impact calculation finished in ${duration.toFixed(2)}ms`);

    return impact;
};

/**
 * Legacy API: Generate SCN from config (for backward compatibility)
 */
export const generateScnFromConfig = async (config: ScnTsConfig): Promise<string> => {
    const { sourceFiles: analyzedFiles } = await analyzeProject({
        files: config.files,
        tsconfig: config.tsconfig,
        root: config.root,
    });
    return formatScn(analyzedFiles, config.formattingOptions);
};

/**
 * Parses and analyzes a project's files to build a dependency graph.
 */
export const analyzeProject = async (
    {
        files,
        tsconfig,
        root = '/',
        onProgress,
        logLevel,
        signal,
    }: AnalyzeProjectOptions
): Promise<{ sourceFiles: SourceFile[], analysisTime: number }> => {
    const startTime = performance.now();
    if (logLevel) {
        logger.setLevel(logLevel);
    }
    logger.info(`Starting analysis of ${files.length} files...`);
    const pathResolver = getPathResolver(tsconfig);

    const checkAborted = () => { if (signal?.aborted) throw new DOMException('Aborted', 'AbortError'); };
    let fileIdCounter = 1;

    onProgress?.({ percentage: 0, message: 'Creating source files...' });

    // Step 1: Create SourceFile objects for all files
    const sourceFiles = files.map((file) => {
        checkAborted();
        const absolutePath = path.join(root, file.path);
        const sourceFile: SourceFile = {
            id: fileIdCounter++,
            relativePath: file.path,
            absolutePath,
            sourceCode: file.content,
            language: getLanguageForFile(file.path)!,
            symbols: [],
            parseError: false,
        };
        return sourceFile;
    });

    logger.debug(`Created ${sourceFiles.length} SourceFile objects.`);
    onProgress?.({ percentage: 10, message: `Parsing ${sourceFiles.length} files...` });

    // Step 2: Parse all files
    const parsedFiles = sourceFiles.map((file, i) => {
        checkAborted();
        if (!file.language || !file.language.wasmPath || file.sourceCode.trim() === '') {
            return file;
        }
        logger.debug(`Parsing ${file.relativePath}`);
        const tree = parse(file.sourceCode, file.language);
        if (!tree) {
            file.parseError = true;
            logger.warn(`Failed to parse ${file.relativePath}`);
        } else {
            file.ast = tree;
        }
        const percentage = 10 + (40 * (i + 1) / sourceFiles.length);
        onProgress?.({ percentage, message: `Parsing ${file.relativePath}` });
        return file;
    });

    onProgress?.({ percentage: 50, message: 'Analyzing files...' });
    logger.info(`Parsing complete. Analyzing symbols and relationships...`);

    // Step 3: Analyze all parsed files
    const analyzedFiles = parsedFiles.map((file, i) => {
        checkAborted();
        if (file.ast) {
            logger.debug(`Analyzing ${file.relativePath}`);
            const analyzed = analyze(file);
            const percentage = 50 + (40 * (i + 1) / sourceFiles.length);
            onProgress?.({ percentage, message: `Analyzing ${file.relativePath}` });
            return analyzed;
        }
        return file;
    });
    
    onProgress?.({ percentage: 90, message: 'Resolving dependency graph...' });
    logger.info('Analysis complete. Resolving dependency graph...');

    // Step 4: Resolve the dependency graph across all files
    checkAborted();
    const resolvedGraph = resolveGraph(analyzedFiles, pathResolver, root);
    
    onProgress?.({ percentage: 100, message: 'Analysis complete.' });
    logger.info('Graph resolution complete. Project analysis finished.');
    const analysisTime = performance.now() - startTime;
    return { sourceFiles: resolvedGraph, analysisTime };
};
```

## File: src/types.ts
```typescript
import type { Parser, Tree, Language } from 'web-tree-sitter';
import type { PathResolver } from './utils/tsconfig';
export type { PathResolver };

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'silent';

export type LogHandler = (level: Exclude<LogLevel, 'silent'>, ...args: any[]) => void;

export interface TsConfig {
    compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
    };
}

export interface AnalyzeProjectOptions {
    files: InputFile[];
    tsconfig?: TsConfig;
    root?: string;
    onProgress?: (progress: { percentage: number; message: string }) => void;
    logLevel?: LogLevel;
    signal?: AbortSignal;
}

/**
 * Options to control the SCN output format.
 */
export interface FormattingOptions {
    showOutgoing?: boolean;
    showIncoming?: boolean;
    showIcons?: boolean;
    showExportedIndicator?: boolean; // + prefix
    showPrivateIndicator?: boolean; // - prefix
    showModifiers?: boolean; // ..., !, o
    showTags?: boolean;      // [generated], [styled], etc.
    showSymbolIds?: boolean; // (1.2) identifiers
    groupMembers?: boolean;  // group class/interface members under parent
    displayFilters?: Partial<Record<SymbolKind, boolean>>;
    showFilePrefix?: boolean; // § prefix, defaults to true
    showFileIds?: boolean;    // (1) file identifiers in headers and references, defaults to true
}

/**
 * Represents the token cost of toggling each formatting option.
 * The value is the delta when an option is toggled from its state in the `baseOptions`.
 * e.g. `new_token_count - base_token_count`.
 */
export interface FormattingOptionsTokenImpact {
    options: Partial<{ [K in keyof Omit<FormattingOptions, 'displayFilters'>]: number }>;
    displayFilters: Partial<Record<string, number>>;
}

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
  formattingOptions?: FormattingOptions;
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
  | 'react_component' | 'react_hook' | 'react_hoc' | 'jsx_attribute' | 'jsx_element' | 'styled_component'
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
import type { CodeSymbol, SourceFile, FormattingOptions } from './types';
import { topologicalSort } from './utils/graph';
import { ICONS, SCN_SYMBOLS } from './constants';

// Compute display index per file based on eligible symbols (exclude properties and constructors)
const isIdEligible = (symbol: CodeSymbol): boolean => {
    if (symbol.kind === 'property' || symbol.kind === 'constructor') return false;
    if (symbol.kind === 'variable') return symbol.isExported || symbol.name === 'module.exports' || symbol.name === 'default';
    if (symbol.kind === 'method') return !!symbol.isExported;
    return true;
};

const getDisplayIndex = (file: SourceFile, symbol: CodeSymbol): number | null => {
    const ordered = file.symbols
        .filter(isIdEligible)
        .sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);
    const index = ordered.findIndex(s => s === symbol);
    return index === -1 ? null : index + 1;
};

const formatFileIdDisplay = (fileId: number, options: FormattingOptions): string => {
    const { showFileIds = true } = options;
    const fileIdPart = showFileIds ? fileId : '';
    return `(${fileIdPart}.0)`;
};

const formatSymbolIdDisplay = (file: SourceFile, symbol: CodeSymbol, options: FormattingOptions): string | null => {
    const { showFileIds = true } = options;
    const idx = getDisplayIndex(file, symbol);
    if (idx == null) return null;
    const fileIdPart = showFileIds ? file.id : '';
    return `(${fileIdPart}.${idx})`;
};

const formatSymbol = (symbol: CodeSymbol, allFiles: SourceFile[], options: FormattingOptions): string[] => {
    const {
        showOutgoing = true,
        showIncoming = true,
        showIcons = true,
        showExportedIndicator = true,
        showPrivateIndicator = true,
        showModifiers = true,
        showTags = true,
        showSymbolIds = true,
    } = options;
    let icon = showIcons ? (ICONS[symbol.kind] || ICONS.default || '?') : '';
    let prefix = '';
    if (symbol.isExported && showExportedIndicator) {
        prefix = SCN_SYMBOLS.EXPORTED_PREFIX;
    } else if (!symbol.isExported && showPrivateIndicator) {
        prefix = SCN_SYMBOLS.PRIVATE_PREFIX;
    }
    let name = symbol.name === '<anonymous>' ? '' : symbol.name;
    if (symbol.kind === 'variable' && name.trim() === 'default') name = '';
    
    // Handle styled components: ~div ComponentName, ~h1 ComponentName, etc.
    if (showIcons && symbol.kind === 'styled_component' && (symbol as any)._styledTag) {
        const tagName = (symbol as any)._styledTag;
        icon = `~${tagName}`;
    }

    const mods: string[] = [];
    if (showTags) {
        if (symbol.isAbstract) mods.push(SCN_SYMBOLS.TAG_ABSTRACT.slice(1, -1));
        if (symbol.isStatic) mods.push(SCN_SYMBOLS.TAG_STATIC.slice(1, -1));
    }
    const modStr = mods.length > 0 ? ` [${mods.join(' ')}]` : '';

    const suffixParts: string[] = [];
    if (symbol.signature) name += symbol.name === '<anonymous>' ? symbol.signature : `${symbol.signature}`;
    if (symbol.typeAnnotation) name += `: ${symbol.typeAnnotation}`;
    if (symbol.typeAliasValue) name += ` ${symbol.typeAliasValue}`;
    // Merge async + throws into a single token
    if (showModifiers) {
        const asyncToken = symbol.isAsync ? SCN_SYMBOLS.ASYNC : '';
        const throwsToken = symbol.throws ? SCN_SYMBOLS.THROWS : '';
        const asyncThrows = (asyncToken + throwsToken) || '';
        if (asyncThrows) suffixParts.push(asyncThrows);
        if (symbol.isPure) suffixParts.push(SCN_SYMBOLS.PURE);
    }
    if (showTags && symbol.labels && symbol.labels.length > 0) suffixParts.push(...symbol.labels.map(l => `[${l}]`));
    const suffix = suffixParts.join(' ');

    // Build ID portion conditionally
    const file = allFiles.find(f => f.id === symbol.fileId)!;
    const idPart = showSymbolIds ? formatSymbolIdDisplay(file, symbol, options) : null;
    const idText = (symbol.kind === 'property' || symbol.kind === 'constructor') ? null : (idPart ?? null);
    const segments: string[] = [prefix, icon];
    if (idText) segments.push(idText);
    if (name) segments.push(name.trim());
    if (modStr) segments.push(modStr);
    if (suffix) segments.push(suffix);
    const line = `  ${segments.filter(Boolean).join(' ')}`;
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
                    const displayId = showSymbolIds ? formatSymbolIdDisplay(targetFile!, targetSymbol, options) : null;
                    let text = displayId ?? formatFileIdDisplay(targetFile!.id, options);
                    if (dep.kind === 'goroutine') {
                        text += ` ${SCN_SYMBOLS.TAG_GOROUTINE}`;
                    }
                    outgoing.get(dep.resolvedFileId)!.add(text);
                }
            } else {
                let text = formatFileIdDisplay(dep.resolvedFileId, options);
                if (dep.kind === 'dynamic_import') text += ` ${SCN_SYMBOLS.TAG_DYNAMIC}`;
                outgoing.get(dep.resolvedFileId)!.add(text);
            }
        } else if (dep.resolvedFileId === undefined) {
            if (dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} ${SCN_SYMBOLS.TAG_MACRO}`);
            }
        }
    });

    const outgoingParts: string[] = [];
    if (outgoing.size > 0) {
        const resolvedParts = Array.from(outgoing.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([fileId, symbolIds]) => {
                const items = Array.from(symbolIds).sort();
                return items.length > 0 ? `${items.join(', ')}` : formatFileIdDisplay(fileId, options);
            });
        outgoingParts.push(...resolvedParts);
    }
    outgoingParts.push(...unresolvedDeps);

    if (showOutgoing && outgoingParts.length > 0) {
        result.push(`    ${SCN_SYMBOLS.OUTGOING_ARROW} ${outgoingParts.join(', ')}`);
    }
    
    if (!showIncoming) {
        return result;
    }

    const incoming = new Map<number, Set<string>>();
    allFiles.forEach(file => {
        file.symbols.forEach(s => {
            s.dependencies.forEach(d => {
                if (d.resolvedFileId === symbol.fileId && d.resolvedSymbolId === symbol.id && s !== symbol) {
                    if(!incoming.has(file.id)) incoming.set(file.id, new Set());
                    // Suppress same-file incoming for properties
                    if (file.id === symbol.fileId && symbol.kind === 'property') return;
                    const disp = showSymbolIds ? (formatSymbolIdDisplay(file, s, options) ?? formatFileIdDisplay(file.id, options)) : formatFileIdDisplay(file.id, options);
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
                        incoming.get(file.id)!.add(formatFileIdDisplay(file.id, options));
                    }
                }
            });
        }
    });

    if (incoming.size > 0) {
        const parts = Array.from(incoming.entries()).map(([_fileId, symbolIds]) => Array.from(symbolIds).join(', '));
        result.push(`    ${SCN_SYMBOLS.INCOMING_ARROW} ${parts.join(', ')}`);
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
    const parents = symbols.filter(s => s.kind === 'class' || s.kind === 'interface' || s.kind === 'react_component');
    const map = new Map<string, CodeSymbol[]>();
    for (const parent of parents) map.set(parent.id, []);
    for (const sym of symbols) {
        if (sym.kind === 'class' || sym.kind === 'interface' || sym.kind === 'react_component') continue;
        const parent = parents
            .filter(p => isWithin(sym, p))
            .sort((a, b) => (a.scopeRange.end.line - a.scopeRange.start.line) - (b.scopeRange.end.line - b.scopeRange.start.line))[0];
        if (parent) {
            map.get(parent.id)!.push(sym);
        }
    }
    // Sort children by position
    for (const [, arr] of map.entries()) {
        arr.sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.column - b.range.start.column);
    }
    return map;
};

const formatFile = (file: SourceFile, allFiles: SourceFile[], options: FormattingOptions): string => {
    const {
        showOutgoing = true,
        showIncoming = true,
        showTags = true,
        showFilePrefix = true,
        showFileIds = true,
    } = options;

    const headerParts: string[] = [];
    if (showFilePrefix) headerParts.push(SCN_SYMBOLS.FILE_PREFIX);
    if (showFileIds) headerParts.push(`(${file.id})`);
    headerParts.push(file.relativePath);

    if (file.parseError) return `${headerParts.join(' ')} [error]`;
    if (!file.sourceCode.trim()) return headerParts.join(' ');

    const directives = showTags ? [
        file.isGenerated && SCN_SYMBOLS.TAG_GENERATED.slice(1, -1),
        ...(file.languageDirectives || [])
    ].filter(Boolean) : [];
    const directiveStr = directives.length > 0 ? ` [${directives.join(' ')}]` : '';
    const header = `${headerParts.join(' ')}${directiveStr}`;
    const headerLines: string[] = [header];

    // File-level outgoing/incoming dependencies
    const outgoing: string[] = [];
    if (file.fileRelationships) {
        const outgoingFiles = new Set<number>();
        file.fileRelationships.forEach(rel => {
            // Only show true file-level imports on the header
            if ((rel.kind === 'import' || rel.kind === 'dynamic_import') && rel.resolvedFileId && rel.resolvedFileId !== file.id) {
                let text = formatFileIdDisplay(rel.resolvedFileId, options);
                if (rel.kind === 'dynamic_import') text += ` ${SCN_SYMBOLS.TAG_DYNAMIC}`;
                outgoingFiles.add(rel.resolvedFileId);
                outgoing.push(text);
            }
        });
        if (showOutgoing && outgoing.length > 0) {
            headerLines.push(`  ${SCN_SYMBOLS.OUTGOING_ARROW} ${Array.from(new Set(outgoing)).sort().join(', ')}`);
        }
    }

    // Incoming: any other file that has a file-level relationship pointing here
    const incoming: string[] = [];
    if (showIncoming) {
        allFiles.forEach(other => {
            if (other.id === file.id) return;
            other.fileRelationships?.forEach(rel => {
                if (rel.resolvedFileId === file.id) incoming.push(formatFileIdDisplay(other.id, options));
            });
        });
        if (incoming.length > 0) headerLines.push(`  ${SCN_SYMBOLS.INCOMING_ARROW} ${Array.from(new Set(incoming)).sort().join(', ')}`);
    }
    // If file has no exported symbols, only show symbols that are "entry points" for analysis,
    // which we define as having outgoing dependencies.
    const hasExports = file.symbols.some(s => s.isExported);
    let symbolsToPrint = hasExports
        ? file.symbols.slice()
        : file.symbols.filter(s => s.dependencies.length > 0);

    // Apply AST-based display filters
    if (options.displayFilters) {
        symbolsToPrint = symbolsToPrint.filter(s => options.displayFilters![s.kind] !== false);
    }

    // Group properties/methods under their class/interface parent if option is enabled
    const groupMembers = options.groupMembers ?? true;
    const childrenMap = groupMembers ? buildChildrenMap(symbolsToPrint) : new Map();
    const childIds = new Set<string>(Array.from(childrenMap.values()).flat().map(s => s.id));
    const topLevel = symbolsToPrint.filter(s => !childIds.has(s.id));

    const symbolLines: string[] = [];
    for (const sym of topLevel) {
        const lines = formatSymbol(sym, allFiles, options);
        symbolLines.push(...lines);
        if (childrenMap.has(sym.id)) {
            const kids = childrenMap.get(sym.id)!;
            for (const kid of kids) {
                const kLines = formatSymbol(kid, allFiles, options).map(l => `  ${l}`);
                symbolLines.push(...kLines);
            }
        }
    }

    // If we hid symbols (or there were none to begin with for an entry file),
    // aggregate outgoing dependencies from all symbols onto the file header
    if (showOutgoing && symbolLines.length === 0 && (file.symbols.length > 0 || (file.fileRelationships && file.fileRelationships.length > 0))) {
        const aggOutgoing = new Map<number, Set<string>>();
        const unresolvedDeps: string[] = [];

        const processDep = (dep: import('./types').Relationship) => {
            if (dep.resolvedFileId && dep.resolvedFileId !== file.id) {
                if (!aggOutgoing.has(dep.resolvedFileId)) aggOutgoing.set(dep.resolvedFileId, new Set());
                let text = formatFileIdDisplay(dep.resolvedFileId, options); // Default to file-level
                if (dep.resolvedSymbolId) {
                    const targetFile = allFiles.find(f => f.id === dep.resolvedFileId)!;
                    const targetSymbol = targetFile.symbols.find(ts => ts.id === dep.resolvedSymbolId);
                    if (targetSymbol) {
                        text = options.showSymbolIds ? (formatSymbolIdDisplay(targetFile, targetSymbol, options) ?? formatFileIdDisplay(dep.resolvedFileId, options)) : formatFileIdDisplay(dep.resolvedFileId, options);
                    }
                }
                if (dep.kind === 'dynamic_import') text += ` ${SCN_SYMBOLS.TAG_DYNAMIC}`;
                aggOutgoing.get(dep.resolvedFileId)!.add(text);
            } else if (dep.resolvedFileId === undefined && dep.kind === 'macro') {
                unresolvedDeps.push(`${dep.targetName} ${SCN_SYMBOLS.TAG_MACRO}`);
            }
        };

        file.symbols.forEach(s => s.dependencies.forEach(processDep));
        file.fileRelationships?.forEach(processDep);

        const outgoingParts: string[] = [];
        if (aggOutgoing.size > 0) {
            const resolvedParts = Array.from(aggOutgoing.entries())
                .sort((a, b) => a[0] - b[0])
                .flatMap(([, symbolIds]) => Array.from(symbolIds).sort());
            outgoingParts.push(...resolvedParts);
        }
        outgoingParts.push(...unresolvedDeps);

        if (outgoingParts.length > 0) {
            // Some fixtures expect separate -> lines per dependency.
            // This preserves that behavior.
            for (const part of outgoingParts) {
                headerLines.push(`  ${SCN_SYMBOLS.OUTGOING_ARROW} ${part}`);
            }
        }
    }
    return [...headerLines, ...symbolLines].join('\n');
};

export const formatScn = (analyzedFiles: SourceFile[], options: FormattingOptions = {}): string => {
    const sortedFiles = topologicalSort(analyzedFiles);
    return sortedFiles.map(file => formatFile(file, analyzedFiles, options)).join('\n\n');
};
```
