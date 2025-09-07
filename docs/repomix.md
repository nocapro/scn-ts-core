# Directory Structure
```
packages/
  scn-ts-web-demo/
    src/
      components/
        ui/
          accordion.tsx
          button.tsx
          card.tsx
          checkbox.tsx
          label.tsx
          textarea.tsx
        Legend.tsx
        LogViewer.tsx
        OutputOptions.tsx
      hooks/
        useAnalysis.hook.ts
        useClipboard.hook.ts
        useResizableSidebar.hook.ts
      lib/
        utils.ts
      services/
        analysis.service.ts
      stores/
        app.store.ts
      App.tsx
      constants.ts
      default-files.ts
      index.css
      main.tsx
      types.ts
      worker.ts
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

## File: packages/scn-ts-web-demo/src/components/ui/checkbox.tsx
```typescript
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

## File: packages/scn-ts-web-demo/src/components/ui/label.tsx
```typescript
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
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

## File: packages/scn-ts-web-demo/src/components/Legend.tsx
```typescript
import * as React from 'react';
import { Button } from './ui/button';
import { HelpCircle, X } from 'lucide-react';
import { ICONS, SCN_SYMBOLS } from 'scn-ts-core';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

const symbolIconGroups: Record<string, (keyof typeof ICONS)[]> = {
  'Class or Component': ['class', 'react_component'],
  'Interface or Trait': ['interface', 'rust_trait'],
  'Function or Method': ['function', 'method', 'styled_component'],
  'Variable or Property': ['variable', 'property'],
  Enum: ['enum'],
  'Type Alias': ['type_alias'],
  'JSX Element': ['jsx_element'],
  'CSS Selector': ['css_class'],
};

const symbolIcons = Object.entries(symbolIconGroups).flatMap(([description, iconKeys]) =>
  iconKeys.map(key => ({ symbol: ICONS[key], description }))
);

const legendSections = [
  {
    title: 'Prefixes',
    items: [
      { symbol: SCN_SYMBOLS.FILE_PREFIX, description: 'File path' },
      { symbol: SCN_SYMBOLS.EXPORTED_PREFIX, description: 'Exported symbol' },
      { symbol: SCN_SYMBOLS.PRIVATE_PREFIX, description: 'Private/unexported symbol' },
    ],
  },
  {
    title: 'Symbol Icons',
    items: Array.from(new Map(symbolIcons.map(item => [item.symbol, item])).values()),
  },
  {
    title: 'Relationships',
    items: [
      { symbol: SCN_SYMBOLS.OUTGOING_ARROW, description: 'Outgoing dependency' },
      { symbol: SCN_SYMBOLS.INCOMING_ARROW, description: 'Incoming dependency' },
    ],
  },
  {
    title: 'Modifiers & Tags',
    items: [
      { symbol: SCN_SYMBOLS.ASYNC, description: 'Async' },
      { symbol: SCN_SYMBOLS.THROWS, description: 'Throws error' },
      { symbol: SCN_SYMBOLS.PURE, description: 'Pure (no side-effects)' },
      { symbol: SCN_SYMBOLS.TAG_STYLED, description: 'Styled component' },
      { symbol: SCN_SYMBOLS.TAG_DYNAMIC, description: 'Dynamic import' },
      { symbol: SCN_SYMBOLS.TAG_GENERATED, description: 'Generated file' },
    ],
  },
];

const LegendItem: React.FC<{ symbol: string; description: string }> = ({ symbol, description }) => (
  <div className="grid grid-cols-[3rem_1fr] items-center gap-x-3 text-sm">
    <code className="font-mono text-base font-bold text-foreground/90 justify-self-center">{symbol}</code>
    <span className="text-muted-foreground">{description}</span>
  </div>
);

export const Legend: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) {
    return (
      <div className="sticky top-4 right-4 z-30 float-right">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsOpen(true)}
          title="Show Legend"
          className="rounded-full shadow-lg"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky top-4 right-4 z-30 float-right">
      <Card className="w-80 max-h-[80vh] flex flex-col shadow-2xl bg-background/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
          <CardTitle className="text-base">Legend</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto">
          <Accordion type="multiple" defaultValue={legendSections.map(s => s.title)} className="w-full">
            {legendSections.map(({ title, items }) => (
              <AccordionItem key={title} value={title}>
                <AccordionTrigger className="px-4 py-2 text-sm hover:no-underline">{title}</AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-1.5">
                    {items.map(({ symbol, description }) =>
                      symbol && <LegendItem key={`${symbol}-${description}`} symbol={symbol} description={description} />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
```

## File: packages/scn-ts-web-demo/src/components/LogViewer.tsx
```typescript
import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { LogEntry } from '../types';
import { levelColorMap } from '../constants';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import type { LogLevel } from 'scn-ts-core';

const LOG_LEVELS: Exclude<LogLevel, 'silent'>[] = ['error', 'warn', 'info', 'debug'];

const LogViewer: React.FC<{ logs: readonly LogEntry[] }> = ({ logs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [visibleLevels, setVisibleLevels] = useState<Set<Exclude<LogLevel, 'silent'>>>(
    new Set(LOG_LEVELS),
  );

  const handleCopy = useCallback(() => {
    const logsToCopy = logs.filter(log => visibleLevels.has(log.level));
    if (logsToCopy.length > 0) {
      const logText = logsToCopy
        .map(
          log =>
            `${new Date(log.timestamp).toLocaleTimeString()} [${log.level.toUpperCase()}] ${log.message}`,
        )
        .join('\n');
      navigator.clipboard.writeText(logText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [logs, visibleLevels]);

  const toggleLevel = (level: Exclude<LogLevel, 'silent'>) => {
    setVisibleLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const filteredLogs = logs.filter(log => visibleLevels.has(log.level));

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2 pb-2 border-b mb-2 flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Show levels:</span>
        {LOG_LEVELS.map(level => (
          <Button
            key={level}
            variant={visibleLevels.has(level) ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-6 px-2 text-xs capitalize',
              !visibleLevels.has(level) && 'opacity-50',
              levelColorMap[level],
            )}
            onClick={() => toggleLevel(level)}
          >
            {level}
          </Button>
        ))}
      </div>
      <div className="relative">
        <div ref={scrollContainerRef} className="font-mono text-xs pr-10">
          {filteredLogs.length === 0 && (
            <p className="text-muted-foreground">
              {logs.length === 0 ? 'No logs yet. Click "Analyze" to start.' : 'No logs match the current filter.'}
            </p>
          )}
          {filteredLogs.map((log, index) => (
            <div key={index} className="flex items-start">
              <span className="text-muted-foreground/80 mr-4 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn('font-bold w-14 flex-shrink-0', levelColorMap[log.level])}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="whitespace-pre-wrap break-all text-foreground">{log.message}</span>
            </div>
          ))}
        </div>
        {logs.length > 0 && (
          <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8" onClick={handleCopy} title="Copy logs to clipboard">
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
```

## File: packages/scn-ts-web-demo/src/hooks/useClipboard.hook.ts
```typescript
import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
      });
    }
  }, [timeout]);

  return { isCopied, handleCopy };
}
```

## File: packages/scn-ts-web-demo/src/hooks/useResizableSidebar.hook.ts
```typescript
import { useState, useCallback, useRef } from 'react';

export function useResizableSidebar(initialWidth: number, minWidth = 320, maxWidthPercent = 0.8) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (event: MouseEvent) => {
      if (isResizing.current) {
        const newWidth = event.clientX;
        const maxWidth = window.innerWidth * maxWidthPercent;
        setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, maxWidthPercent]);

  return { sidebarWidth, handleMouseDown };
}
```

## File: packages/scn-ts-web-demo/src/lib/utils.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: packages/scn-ts-web-demo/src/stores/app.store.ts
```typescript
import { useState } from 'react';
import { defaultFilesJSON } from '../default-files';
import type { FormattingOptions } from '../types';

export function useAppStore() {
  const [filesInput, setFilesInput] = useState(defaultFilesJSON);
  const [scnOutput, setScnOutput] = useState('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    showOutgoing: true,
    showIncoming: true,
    showIcons: true,
    showExportedIndicator: true,
    showPrivateIndicator: true,
    showModifiers: true,
    showTags: true,
    showSymbolIds: true,
    groupMembers: true,
    displayFilters: {},
    showFilePrefix: true,
    showFileIds: true,
  });

  return {
    filesInput,
    setFilesInput,
    scnOutput,
    setScnOutput,
    formattingOptions,
    setFormattingOptions,
  };
}
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

## File: packages/scn-ts-web-demo/src/components/ui/accordion.tsx
```typescript
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionHeader = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Header>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>
>(({ className, ...props }, ref) => <AccordionPrimitive.Header ref={ref} className={cn("flex sticky top-0 z-10 border-b bg-background", className)} {...props} />);
AccordionHeader.displayName = AccordionPrimitive.Header.displayName;

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>
    {children}
    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
  </AccordionPrimitive.Trigger>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent }
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
import { createTokenProvider } from './auth/token';
import './styles/main.css';

async function main() {
    Log('App starting...');

    const tokenProvider = createTokenProvider();
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

export function createTokenProvider() {
    const secret = generate_secret();
    return {
        getToken(): string {
            return \`fake-token-with-\${secret}\`;
        }
    };
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
    // `js-tiktoken` is another CJS-like dependency that needs to be pre-bundled.
    include: ['scn-ts-core', 'js-tiktoken'],
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
