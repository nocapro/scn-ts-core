# Directory Structure
```
packages/
  scn-ts-web-demo/
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
scripts/
  ast.ts
package.json
tsconfig.json
```

# Files

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
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "comlink": "^4.4.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.379.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.3.0",
    "tiktoken": "^1.0.14"
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
    "composite": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [
    { "path": "../../" }
  ]
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
    },
  },
  optimizeDeps: {
    // Exclude packages that have special loading mechanisms (like wasm)
    // to prevent Vite from pre-bundling them and causing issues.
    exclude: ['web-tree-sitter', 'tiktoken'],
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
  "include": ["src"],
  "references": [
    { "path": "packages/scn-ts-web-demo" }
  ]
}
```

## File: scripts/ast.ts
```typescript
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
    
    // Run analysis
    console.log('ANALYSIS:');
    const { analyzeProject, generateScn } = await import('../src/main');
    try {
      const { sourceFiles: analyzedFiles } = await analyzeProject({
        files: [{
          path: sample.file,
          content: sample.code
        }]
      });
      const scnOutput = generateScn(analyzedFiles);
      console.log('SCN Output:');
      console.log(scnOutput);
    } catch (error) {
      console.log('Analysis error:', error);
    }
    
    console.log('\nAST:');
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
```

## File: package.json
```json
{
  "name": "scn-ts-core",
  "module": "src/index.ts",
  "type": "module",
  "private": true,
  "scripts": {
    "check": "tsc --build"
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
