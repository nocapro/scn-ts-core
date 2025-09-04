# Directory Structure
```
packages/
  scn-ts-web-demo/
    src/
      components/
        ui/
          button.tsx
          card.tsx
          textarea.tsx
        LogViewer.tsx
        OutputOptions.tsx
      lib/
        utils.ts
      App.tsx
      constants.ts
      default-files.ts
      index.css
      main.tsx
      types.ts
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    tsconfig.json
    tsconfig.node.json
    vite.config.ts
package.json
tsconfig.json
```

# Files

## File: packages/scn-ts-web-demo/src/components/ui/button.tsx
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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

## File: packages/scn-ts-web-demo/src/components/ui/card.tsx
```typescript
import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
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
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"


const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"


export { Card, CardHeader, CardTitle, CardContent }
```

## File: packages/scn-ts-web-demo/src/components/ui/textarea.tsx
```typescript
import * as React from "react"
import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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

## File: packages/scn-ts-web-demo/src/components/LogViewer.tsx
```typescript
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';
import type { LogEntry } from '../types';
import { levelColorMap } from '../constants';

const LogViewer: React.FC<{ logs: readonly LogEntry[] }> = ({ logs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-4">
        <CardTitle>Logs</CardTitle>
      </CardHeader>
      <CardContent ref={scrollContainerRef} className="flex-grow overflow-auto p-0">
        <div className="px-4 pb-4 pt-0 font-mono text-xs">
          {logs.length === 0 && <p className="text-muted-foreground">No logs yet. Click "Analyze" to start.</p>}
          {logs.map((log, index) => (
            <div key={index} className="flex items-start">
              <span className="text-muted-foreground/80 mr-4 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn("font-bold w-14 flex-shrink-0", levelColorMap[log.level])}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="whitespace-pre-wrap break-all text-foreground">{log.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogViewer;
```

## File: packages/scn-ts-web-demo/src/components/OutputOptions.tsx
```typescript
import * as React from 'react';
import type { FormattingOptions } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface OutputOptionsProps {
  options: FormattingOptions;
  setOptions: React.Dispatch<React.SetStateAction<FormattingOptions>>;
}

const OptionCheckbox: React.FC<{
  id: keyof FormattingOptions;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center space-x-1.5">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-muted-foreground/50 bg-transparent text-primary focus:ring-primary"
    />
    <label htmlFor={id} className="cursor-pointer select-none text-sm text-muted-foreground">
      {label}
    </label>
  </div>
);

const optionGroups = {
  'Display Elements': ['showIcons', 'showExportedIndicator', 'showPrivateIndicator', 'showModifiers', 'showTags', 'showSymbolIds'],
  'Relationships': ['showOutgoing', 'showIncoming'],
  'Structure': ['groupMembers'],
} as const;

const optionLabels: Record<keyof FormattingOptions, string> = {
  showIcons: 'Icons',
  showExportedIndicator: 'Exported (+)',
  showPrivateIndicator: 'Private (-)',
  showModifiers: 'Modifiers',
  showTags: 'Tags',
  showSymbolIds: 'Symbol IDs',
  showOutgoing: 'Outgoing',
  showIncoming: 'Incoming',
  groupMembers: 'Group Members',
};


const OutputOptions: React.FC<OutputOptionsProps> = ({ options, setOptions }) => {
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () => new Set(Object.keys(optionGroups))
  );

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

  const handleChange = (option: keyof FormattingOptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, [option]: e.target.checked }));
  };

  const handleGroupChange = (keys: ReadonlyArray<keyof FormattingOptions>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setOptions(prev => {
      const newOptions = { ...prev };
      for (const key of keys) {
        newOptions[key] = isChecked;
      }
      return newOptions;
    });
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Formatting Options</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4 space-y-1">
        {Object.entries(optionGroups).map(([groupName, keys]) => {
          const allChecked = keys.every(key => options[key] ?? true);
          const isExpanded = expandedGroups.has(groupName);

          return (
            <div key={groupName}>
              <div
                className="flex items-center justify-between py-1 rounded-md hover:bg-accent/50 cursor-pointer select-none -mx-2 px-2"
                onClick={() => toggleGroup(groupName)}
              >
                <div className="flex items-center space-x-1.5">
                  {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                  <span className="font-semibold text-sm">{groupName}</span>
                </div>
                <input
                  type="checkbox"
                  id={`group-${groupName.replace(/\s+/g, '-')}`}
                  title={`Toggle all in ${groupName}`}
                  checked={allChecked}
                  onChange={handleGroupChange(keys)}
                  onClick={(e) => e.stopPropagation()} // Prevent row click from firing
                  className="h-4 w-4 rounded border-muted-foreground/50 bg-transparent text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              {isExpanded && (
                <div className="pl-6 space-y-1.5 py-1">
                  {keys.map(key => (
                    <OptionCheckbox
                      key={key}
                      id={key}
                      label={optionLabels[key]}
                      checked={options[key] ?? true}
                      onChange={handleChange(key)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default OutputOptions;
```

## File: packages/scn-ts-web-demo/src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: packages/scn-ts-web-demo/src/App.tsx
```typescript
import { useState, useEffect, useCallback } from 'react';
import { get_encoding, type Tiktoken } from 'tiktoken';
import {
  initializeParser,
  logger,
  analyzeProject,
  generateScn,
} from '../../../index';
import type { FileContent, LogHandler, SourceFile } from '../../../index';
import { defaultFilesJSON } from './default-files';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import LogViewer from './components/LogViewer';
import OutputOptions from './components/OutputOptions';
import { Play, Loader } from 'lucide-react';
import type { LogEntry, ProgressData, FormattingOptions } from './types';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filesInput, setFilesInput] = useState(defaultFilesJSON);
  const [scnOutput, setScnOutput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<SourceFile[] | null>(null);
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    showOutgoing: true,
    showIncoming: true,
    showIcons: true,    showExportedIndicator: true,
    showPrivateIndicator: true,
    showModifiers: true,
    showTags: true,
    showSymbolIds: true,
    groupMembers: true,
  });
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [encoder, setEncoder] = useState<Tiktoken | null>(null);
  const [tokenCounts, setTokenCounts] = useState({ input: 0, output: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        await initializeParser({ wasmBaseUrl: '/wasm/' });
        const enc = get_encoding("cl100k_base");
        setEncoder(enc);
        setIsInitialized(true);
        setLogs(prev => [...prev, { level: 'info', message: 'Parser and tokenizer initialized.', timestamp: Date.now() }]);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setLogs(prev => [...prev, { level: 'error', message: `Failed to initialize: ${message}`, timestamp: Date.now() }]);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!encoder) return;
    try {
      const inputTokens = encoder.encode(filesInput).length;
      const outputTokens = encoder.encode(scnOutput).length;
      setTokenCounts({ input: inputTokens, output: outputTokens });
    } catch (e) {
      console.error("Tokenization error:", e);
      setTokenCounts({ input: 0, output: 0 });
    }
  }, [filesInput, scnOutput, encoder]);

  useEffect(() => {
    if (analysisResult) {
      const scn = generateScn(analysisResult, formattingOptions);
      setScnOutput(scn);
    }
  }, [analysisResult, formattingOptions]);

  const handleAnalyze = useCallback(async () => {
    if (!isInitialized) {
      setLogs(prev => [...prev, { level: 'warn', message: 'Parser not ready.', timestamp: Date.now() }]);
      return;
    }

    setIsLoading(true);
    setLogs([]);
    setScnOutput('');
    setAnalysisResult(null);
    setProgress(null);

    const logHandler: LogHandler = (level, ...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
      setLogs(prev => [...prev, { level, message, timestamp: Date.now() }]);
    };
    logger.setLogHandler(logHandler);
    logger.setLevel('debug');

    const onProgress = (progressData: ProgressData) => {
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
      setAnalysisResult(rankedGraph);
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
    <div className="h-screen w-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-[30rem] max-w-[40%] flex-shrink-0 flex flex-col border-r">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold tracking-tight">SCN-TS Web Demo</h1>
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
        </div>

        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
          <Card className="flex flex-col min-h-96">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Input Files (JSON)</span>
                <span className="text-sm font-normal text-muted-foreground">{tokenCounts.input.toLocaleString()} tokens</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <Textarea
                value={filesInput}
                onChange={(e) => setFilesInput(e.currentTarget.value)}
                className="h-full w-full font-mono text-xs resize-none"
                placeholder="Paste an array of FileContent objects here..."
              />
            </CardContent>
          </Card>
          <OutputOptions options={formattingOptions} setOptions={setFormattingOptions} />
          <div className="min-h-60">
            <LogViewer logs={logs} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <CardTitle>Output (SCN)</CardTitle>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">{tokenCounts.output.toLocaleString()} tokens</span>
        </div>
        <div className="p-4 flex-grow overflow-auto font-mono text-xs">
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

## File: packages/scn-ts-web-demo/src/default-files.ts
```typescript
import type { FileContent } from "scn-ts-core";

const files: FileContent[] = [
  {
    path: "src/main.tsx",
    content: `import React from 'react';
import { Page } from './components/layout/Page';
import { UserProfile } from './components/UserProfile';
import { getUser } from './api/client';
import { Log } from './services/logger';
import { TokenProvider } from './auth/token';
import './styles/main.css';

async function main() {
    Log('App starting...');

    const tokenProvider = new TokenProvider();
    console.log('Auth token:', tokenProvider.getToken());

    const user = await getUser('1');
    
    const App = () => (
        <Page>
            <UserProfile initialUser={user} />
        </Page>
    );
    
    console.log('App ready to be rendered.');
    // The existence of <App /> is enough for analysis.
    // In a real app: ReactDOM.render(<App />, document.getElementById('root'));
    Log('App finished setup.');
}

main();
`
  },
  {
    path: "src/api/client.ts",
    content: `import type { User } from '../types';
import { capitalize } from '../utils/string';

const API_BASE = '/api/v1';

export async function getUser(id: string): Promise<User> {
    console.log(\`Fetching user \${id} from \${API_BASE}\`);
    await new Promise(res => setTimeout(res, 100));
    return {
        id,
        name: capitalize('john doe'),
        email: 'john.doe@example.com',
    };
}

export const updateUser = async (user: Partial<User> & { id: string }): Promise<User> => {
    console.log(\`Updating user \${user.id}\`);
    await new Promise(res => setTimeout(res, 100));
    const fullUser = await getUser(user.id);
    return { ...fullUser, ...user };
};
`
  },
  {
    path: "src/components/Button.tsx",
    content: `import React from 'react';
import './../styles/components/button.css';

type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps {
    text: string;
    variant?: ButtonVariant;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ text, variant = 'primary', onClick }) => {
    return (
        <button className={\`btn btn-\${variant}\`} onClick={onClick}>
            {text}
        </button>
    );
};
`
  },
  {
    path: "src/components/UserProfile.tsx",
    content: `import React from 'react';
import type { User } from '../types';
import { useUser } from '../hooks/useUser';

// Fake styled-component to test parser. In a real app this would be \`import styled from 'styled-components';\`
const styled = {
  div: (template: TemplateStringsArray) => (props: any) => React.createElement('div', props)
};

const UserCard = styled.div\`
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
\`;

interface UserProfileProps {
    initialUser: User;
}

export function UserProfile({ initialUser }: UserProfileProps): React.ReactElement {
    const { user, updateUser } = useUser(initialUser.id, initialUser);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <UserCard>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <button onClick={() => updateUser({ name: 'Jane Doe' })}>
                Change Name
            </button>
        </UserCard>
    );
}
`
  },
  {
    path: "src/components/layout/Page.tsx",
    content: `import React from 'react';
import { Button } from '../Button';
import type { Theme } from '../../types';

interface PageProps {
    children: React.ReactNode;
}

const theme: Theme = 'light';

export const Page = ({ children }: PageProps): React.ReactElement => {
    return (
        <div className={\`page-container theme-\${theme}\`}>
            <header>
                <h1>My App</h1>
                <Button text="Logout" />
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};
`
  },
  {
    path: "src/hooks/useUser.ts",
    content: `import { getUser, updateUser as apiUpdateUser } from '../api/client';
import type { User } from '../types';

// This is a fake hook for dependency analysis purposes.
export function useUser(userId: string, initialUser?: User) {
    let user: User | null = initialUser || null;

    const fetchUser = async () => {
        user = await getUser(userId);
    };

    if (!user) {
        fetchUser();
    }

    const updateUser = async (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = await apiUpdateUser({ ...data, id: userId });
        user = updatedUser;
    };

    return { user, updateUser };
}
`
  },
  {
    path: "src/styles/main.css",
    content: `@import url('./components/button.css');

:root {
    --primary-color: #007bff;
}

body {
    font-family: sans-serif;
    background-color: #f0f0f0;
}

.page-container {
    max-width: 960px;
    margin: 0 auto;
}
`
  },
  {
    path: "src/styles/components/button.css",
    content: `.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-secondary {
    background-color: gray;
    color: white;
}
`
  },
  {
    path: "src/types/index.ts",
    content: `export interface User {
    id: string;
    name: string;
    email: string;
}

export type Theme = 'light' | 'dark';
`
  },
  {
    path: "src/utils/string.ts",
    content: `/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
`
  },
  {
    path: "src/auth/token.ts",
    content: `import { generate_secret } from '../services/auth'; // fake import from .rs

export class TokenProvider {
    private secret: string;
    constructor() {
        this.secret = generate_secret();
    }

    getToken(): string {
        return \`fake-token-with-\${this.secret}\`;
    }
}
`
  },
  {
    path: "src/services/logger.go",
    content: `package services

import "fmt"

// Log prints a message to the console.
func Log(message string) {
	fmt.Println("[Go Logger]", message)
}
`
  },
  {
    path: "src/services/auth.rs",
    content: `// A simple auth service mock
pub struct AuthService {
    secret_key: String,
}

impl AuthService {
    pub fn new(secret: &str) -> Self {
        AuthService {
            secret_key: secret.to_string(),
        }
    }

    pub fn verify_token(&self, token: &str) -> bool {
        // In a real app, you'd have complex logic here.
        token.len() > 10 && self.secret_key != ""
    }
}

pub fn generate_secret() -> String {
    "super_secret_key_from_rust".to_string()
}
`
  },
];

export const defaultFilesJSON = JSON.stringify(files, null, 2);
```

## File: packages/scn-ts-web-demo/src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 215.4 16.3% 46.9%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* For custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--accent-foreground));
}
```

## File: packages/scn-ts-web-demo/src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
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
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
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

## File: package.json
```json
{
  "name": "scn-ts-core",
  "module": "src/main.ts",
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
