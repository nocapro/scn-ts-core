# Directory Structure
```
scripts/
  prepare-wasm.cjs
src/
  components/
    ui/
      button.tsx
      card.tsx
      textarea.tsx
    LogViewer.tsx
  lib/
    utils.ts
  App.tsx
  default-files.ts
  index.css
  main.tsx
index.html
package.json
postcss.config.js
tailwind.config.js
tsconfig.json
tsconfig.node.json
vite.config.ts
```

# Files

## File: scripts/prepare-wasm.cjs
```
const fs = require('fs/promises');
const path = require('path');
const { exec: execCallback } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const exec = promisify(execCallback);

const wasmFilesToCopy = {
  'web-tree-sitter': ['tree-sitter.wasm'],
  'tree-sitter-c': ['tree-sitter-c.wasm'],
  'tree-sitter-c-sharp': ['tree-sitter-c_sharp.wasm'],
  'tree-sitter-cpp': ['tree-sitter-cpp.wasm'],
  'tree-sitter-css': ['tree-sitter-css.wasm'],
  'tree-sitter-go': ['tree-sitter-go.wasm'],
  'tree-sitter-java': ['tree-sitter-java.wasm'],
  'tree-sitter-php': ['tree-sitter-php.wasm'],
  'tree-sitter-python': ['tree-sitter-python.wasm'],
  'tree-sitter-ruby': ['tree-sitter-ruby.wasm'],
  'tree-sitter-rust': ['tree-sitter-rust.wasm'],
  'tree-sitter-solidity': ['tree-sitter-solidity.wasm'],
  // 'tree-sitter-swift': ['tree-sitter-swift.wasm'], // WASM file not available in this package
  'tree-sitter-typescript': [
    'tree-sitter-typescript.wasm',
    'tree-sitter-tsx.wasm'
  ],
  // 'tree-sitter-vue': ['tree-sitter-vue.wasm'], // WASM file not available in this package
};

// We don't want to list web-tree-sitter here because it's a real dependency
// and we'll get its wasm file via require.resolve.
const treeSitterGrammars = {
  "tree-sitter-c": "^0.24.1",
  "tree-sitter-c-sharp": "^0.23.1",
  "tree-sitter-cpp": "^0.23.4",
  "tree-sitter-css": "^0.23.2",
  "tree-sitter-go": "^0.23.4",
  "tree-sitter-java": "^0.23.5",
  "tree-sitter-php": "^0.23.12",
  "tree-sitter-python": "^0.23.6",
  "tree-sitter-ruby": "^0.23.1",
  "tree-sitter-rust": "^0.24.0",
  "tree-sitter-solidity": "^1.2.11",
  "tree-sitter-typescript": "^0.23.2",
};

async function runCommand(command, options) {
  console.log(`> ${command}`);
  try {
    const { stdout, stderr } = await exec(command, options);
    // Many commands log status to stderr, so we show it but don't treat as an error unless exec throws.
    if (stderr) console.log(stderr.trim());
    return stdout.trim();
  } catch (error) {
    console.error(`\n[ERROR] Command failed: ${command}`);
    if (error.stdout) console.error('STDOUT:', error.stdout);
    if (error.stderr) console.error('STDERR:', error.stderr);
    throw error;
  }
}

async function prepareWasm() {
  const publicWasmDir = path.resolve(process.cwd(), 'public/wasm');
  console.log(`Ensuring public/wasm directory exists at: ${publicWasmDir}`);
  await fs.mkdir(publicWasmDir, { recursive: true });

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repograph-wasm-'));
  console.log(`Created temporary directory: ${tempDir}`);

  try {
    // --- Step 1: Copy from direct dependencies ---
    console.log('\nCopying WASM from direct dependencies...');
    const webTreeSitterWasm = wasmFilesToCopy['web-tree-sitter'];
    if (webTreeSitterWasm) {
      for (const wasmFileName of webTreeSitterWasm) {
        try {
          const sourcePath = require.resolve(`web-tree-sitter/${wasmFileName}`);
          const destPath = path.join(publicWasmDir, wasmFileName);
          await fs.copyFile(sourcePath, destPath);
          console.log(`Copied ${wasmFileName} from web-tree-sitter to public/wasm/`);
        } catch (error) {
           console.error(`\n[ERROR] Could not copy ${wasmFileName} from web-tree-sitter.`);
           console.error(error.message);
        }
      }
    }

    // --- Step 2: Fetch and extract from temporary grammar packages ---
    console.log('\nFetching and extracting WASM from grammar packages...');
    const grammarPackages = Object.entries(treeSitterGrammars);

    for (const [packageName, version] of grammarPackages) {
      const packageSpec = `${packageName}@${version}`;
      const wasmFileNames = wasmFilesToCopy[packageName];

      if (!wasmFileNames) {
        console.warn(`[WARN] No WASM files configured for ${packageName}, skipping.`);
        continue;
      }
      
      console.log(`\nProcessing ${packageSpec}...`);
      try {
        // `npm pack` downloads a tarball and prints its name to stdout. --silent reduces verbosity.
        const tarballName = await runCommand(`npm pack ${packageSpec} --silent`, { cwd: tempDir });
        const tarballPath = path.join(tempDir, tarballName);
        
        // Extract the tarball. The contents will be in a 'package' directory.
        await runCommand(`tar -xzf "${tarballPath}" -C "${tempDir}"`);

        for (const wasmFileName of wasmFileNames) {
          const sourcePath = path.join(tempDir, 'package', wasmFileName);
          const destPath = path.join(publicWasmDir, wasmFileName);
          await fs.copyFile(sourcePath, destPath);
          console.log(`Copied ${wasmFileName} to public/wasm/`);
        }
      } catch (error) {
        console.error(`\n[ERROR] Failed to process ${packageSpec}.`);
        // Continue to the next package
      }
    }
  } finally {
    // --- Step 3: Cleanup temp dir ---
    console.log(`\nCleaning up temporary directory: ${tempDir}`);
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  // --- Step 4: Clean up dependencies from package.json by direct file modification ---
  console.log('\nChecking for temporary grammar dependencies to remove from package.json...');
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    const depsToRemove = Object.keys(treeSitterGrammars).filter(
      (pkg) => packageJson.dependencies && packageJson.dependencies[pkg]
    );

    if (depsToRemove.length > 0) {
      console.log(`Found and will remove temporary dependencies: ${depsToRemove.join(', ')}`);
      
      for (const pkg of depsToRemove) {
        delete packageJson.dependencies[pkg];
      }

      const newPackageJsonContent = JSON.stringify(packageJson, null, 2) + '\n';
      await fs.writeFile(packageJsonPath, newPackageJsonContent, 'utf8');
      console.log('✅ package.json has been rewritten. The slow package manager interaction is no longer needed.');
      console.log('The temporary packages will be removed from node_modules on the next `bun install`.');
    } else {
      console.log('No temporary grammar dependencies found in package.json. Nothing to do.');
    }
  } catch (error) {
    console.error(`\n[ERROR] Could not read or modify package.json at ${packageJsonPath}`);
    console.error(error.message);
    // Don't rethrow, as the main goal (copying wasm) was successful.
  }

  console.log('\n✅ WASM file preparation complete.');
}

prepareWasm().catch(err => {
  console.error('\n[FATAL] Failed to prepare WASM files.', err);
  process.exit(1);
});
```

## File: src/components/ui/button.tsx
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-primary-foreground hover:bg-blue-700 text-white",
        destructive:
          "bg-red-500 text-destructive-foreground hover:bg-red-600",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-gray-200 text-secondary-foreground hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## File: src/components/ui/card.tsx
```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm", className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"


const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"


export { Card, CardHeader, CardTitle, CardContent }
```

## File: src/components/ui/textarea.tsx
```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-gray-600 dark:bg-gray-900",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

## File: src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* For custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

## File: src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## File: index.html
```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SCN-TS Web Demo</title>
  </head>
  <body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## File: postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## File: tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
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
  },  "include": ["src"]
}
```

## File: tsconfig.node.json
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

## File: vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
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
    include: ['repograph-core', 'repograph-browser', 'scn-ts-core', 'scn-ts-browser'],
  },
  server: {
    headers: {
      // These headers are required for SharedArrayBuffer, which is used by
      // web-tree-sitter and is good practice for applications using wasm
      // with threading or advanced memory features.
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    watch: {
      // The wasm files are not directly imported, so Vite doesn't watch them by default.
      // We need to explicitly tell Vite to watch them to trigger a reload on change.
      include: ['public/wasm/**']
    },
    mime: {
      'application/wasm': ['wasm']
    }
  },
})
```

## File: src/components/LogViewer.tsx
```typescript
import React from 'react';
import { LogLevel } from 'scn-ts-browser';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

export interface LogEntry {
  level: Exclude<LogLevel, 'silent'>;
  message: string;
  timestamp: number;
}

const levelColorMap: Record<Exclude<LogLevel, 'silent'>, string> = {
  error: 'text-red-500',
  warn: 'text-yellow-500',
  info: 'text-blue-400',
  debug: 'text-gray-500',
};

const LogViewer: React.FC<{ logs: readonly LogEntry[] }> = ({ logs }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto p-0">
        <div className="p-4 font-mono text-xs">
          {logs.length === 0 && <p className="text-gray-500">No logs yet. Click "Analyze" to start.</p>}
          {logs.map((log, index) => (
            <div key={index} className="flex items-start">
              <span className={cn("font-bold w-12 flex-shrink-0", levelColorMap[log.level])}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="whitespace-pre-wrap break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogViewer;
```

## File: src/default-files.ts
```typescript
import { FileContent } from "scn-ts-browser";

const files: FileContent[] = [
  {
    path: "src/main.ts",
    content: `import { formatMessage } from './utils/formatter';
import { createButton } from './ui/button';
import { Greeter } from './services/greeter.py';

console.log('App starting...');

const message = formatMessage('World');
const button = createButton('Click Me');
const greeter = new Greeter();

document.body.innerHTML = \`<h1>\${message}</h1>\`;
document.body.appendChild(button);
console.log(greeter.greet());
`
  },
  {
    path: "src/utils/formatter.ts",
    content: `/**
 * Formats a message with a greeting.
 * @param name The name to include in the message.
 * @returns The formatted message.
 */
export const formatMessage = (name: string): string => {
  return \`Hello, \${name}!\`;
};
`
  },
  {
    path: "src/ui/button.ts",
    content: `import { formatMessage } from '../utils/formatter';

export function createButton(text: string) {
  const btn = document.createElement('button');
  btn.textContent = text;
  // This is a contrived call to create a graph edge
  btn.ariaLabel = formatMessage('Button');
  return btn;
}
`
  },
  {
    path: "src/styles.css",
    content: `body {
  font-family: sans-serif;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
}`
  },
  {
    path: 'src/services/greeter.py',
    content: `class Greeter:
    def __init__(self):
        self.message = "Hello from Python"

    def greet(self):
        return self.message
`
  },
  {
    path: 'src/data/user.java',
    content: `package com.example.data;

public class User {
    private String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
`
  }
];

export const defaultFilesJSON = JSON.stringify(files, null, 2);
```

## File: src/App.tsx
```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  initializeParser,
  logger,
  analyzeProject,
  FileContent,
  LogHandler,
  generateScn,
} from 'scn-ts-browser';
import { defaultFilesJSON } from './default-files';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import LogViewer, { LogEntry } from './components/LogViewer';
import { Play, Loader } from 'lucide-react';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filesInput, setFilesInput] = useState(defaultFilesJSON);
  const [scnOutput, setScnOutput] = useState('');
  const [progress, setProgress] = useState<{ percentage: number; message: string } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeParser({ wasmBaseUrl: '/wasm/' });
        setIsInitialized(true);
        setLogs(prev => [...prev, { level: 'info', message: 'Parser initialized.', timestamp: Date.now() }]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setLogs(prev => [...prev, { level: 'error', message: `Failed to initialize parser: ${message}`, timestamp: Date.now() }]);
      }
    };
    init();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!isInitialized) {
      setLogs(prev => [...prev, { level: 'warn', message: 'Parser not ready.', timestamp: Date.now() }]);
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setScnOutput('');
    setProgress(null);

    const logHandler: LogHandler = (level, ...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      setLogs(prev => [...prev, { level, message, timestamp: Date.now() }]);
    };
    logger.setLogHandler(logHandler);
    logger.setLevel('debug');

    const onProgress = (progressData: { percentage: number; message: string }) => {
      setProgress(progressData);
      logger.info(`[${Math.round(progressData.percentage)}%] ${progressData.message}`);
    };

    try {
      let files: FileContent[] = [];
      try {
        files = JSON.parse(filesInput);
        if (!Array.isArray(files)) throw new Error("Input is not an array.");
      } catch (error) {
        throw new Error(`Invalid JSON input: ${error instanceof Error ? error.message : String(error)}`);
      }

      const rankedGraph = await analyzeProject({ files, onProgress, logLevel: 'debug' });
      const scn = generateScn(rankedGraph, files);
      setScnOutput(scn);
      logger.info('Analysis complete.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Analysis failed:', message);
    } finally {
      setIsLoading(false);
      setProgress(null);
      logger.setLogHandler(null);
    }
  }, [filesInput, isInitialized]);

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4">
      <header className="flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SCN-TS Web Demo</h1>
        <Button onClick={handleAnalyze} disabled={isLoading || !isInitialized} className="w-32 justify-center">
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              <span>{progress ? `${Math.round(progress.percentage)}%` : 'Analyzing...'}</span>
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              <span>Analyze</span>
            </>
          )}
        </Button>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-150px)]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Input Files (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              value={filesInput}
              onChange={(e) => setFilesInput(e.target.value)}
              className="h-full w-full font-mono text-xs"
              placeholder="Paste an array of FileContent objects here..."
            />
          </CardContent>
        </Card>
        
        <Card className="flex flex-col overflow-hidden">
           <CardHeader>
            <CardTitle>Output (SCN)</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto p-0">
            <pre className="text-xs whitespace-pre font-mono p-4 h-full w-full">
              <code>
                {scnOutput || (isLoading ? "Generating..." : "Output will appear here.")}
              </code>
            </pre>
          </CardContent>
        </Card>
      </main>

      <footer className="flex-shrink-0 h-[150px]">
        <LogViewer logs={logs} />
      </footer>
    </div>
  );
}

export default App;
```

## File: package.json
```json
{
  "name": "scn-ts-web-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "prepare": "node scripts/prepare-wasm.cjs"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.379.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "scn-ts-browser": "1.0.4",
    "tailwind-merge": "^2.3.0",
    "web-tree-sitter": "^0.25.6"
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
    "vite": "^5.2.12"
  }
}
```
