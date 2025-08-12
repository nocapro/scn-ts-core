# Directory Structure
```
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

## File: test/ts/e2e/01-core.test.ts
```typescript
import { describe, it } from 'bun:test';
import { runTestForFixture } from '../test.util';
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
import { runTestForFixture } from '../test.util';
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
import { runTestForFixture } from '../test.util';
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
import { runTestForFixture } from '../test.util';
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
import { generateScn, initializeParser, type ScnTsConfig } from '../src/main';
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
    const id = fileContent.match(/^id: (.*)$/m)?.[1].trim() ?? '';
    const name = fileContent.match(/^name: (.*)$/m)?.[1].trim() ?? '';
    
    const [inputSection, expectedSection] = fileContent.split(/\nexpected:\s*\|?\n/);
    if (!expectedSection) throw new Error(`Could not parse fixture: ${id || fileContent.slice(0, 100)}`);

    const expected = expectedSection.replace(/^  /gm, '').trim();

    const inputFiles = [];
    const fileChunks = inputSection.split(/-\s*path:\s*/).slice(1);

    for (const chunk of fileChunks) {
        const lines = chunk.split('\n');
        const filePath = lines[0].trim();
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

  const tempDir = await fs.mkdtemp(path.join(rootDir, 'test', `temp-${fixture.id}-`));

  try {
    for (const file of fixture.input) {
      const filePath = path.join(tempDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);
    }
    
    const tsconfigPath = path.join(tempDir, 'tsconfig.json');
    let tsconfigContent: Record<string, unknown> = {
        compilerOptions: {
            jsx: 'react-jsx',
            allowJs: true,
            moduleResolution: "node",
            module: 'ESNext',
        }
    };

    if (fixture.id === 'monorepo-aliases') {
      tsconfigContent = {
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
    await fs.writeFile(tsconfigPath, JSON.stringify(tsconfigContent, null, 2));

    const config: ScnTsConfig = {
      root: tempDir,
      include: ['**/*.*'],
      exclude: ['tsconfig.json'],
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
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
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
    "@types/bun": "latest"
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
