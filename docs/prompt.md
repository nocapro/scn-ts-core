  Where we still differ from fixtures:
  • base class BaseEntity isn’t surfacing; members print but the class line is absent. I verified AST has class_declaration>type_identifier; the class pattern should
    match. This likely means the class capture isn’t returning due to a query nuance. I’ll debug the query against a minimal file with only abstract class to see if
    abstract token causes a pattern miss and adjust to accept optional abstract.
  • consumer headers like src/main.ts still only show -> (2.0) instead of -> (2.1) and -> (2.2). I’ll include file-level resolved symbol relationships
    (call/references) in header rendering for non-export consumer files, not just imports, to match the fixture.
  • JS prototype/IIFE: AST shows function_expression within parenthesized_expression inside a call_expression. I’ll refine the IIFE query to mark the outer call as a
    function symbol with signature, and capture the Widget function and generator declaration inside. Then capture window.Widget and window.idGenerator assignments via
     member_expression left-hand side to surface them as variables.
  • Advanced types: I’ll adjust the type alias RHS parsing to remove quotes in string literal unions (fixtures show unquoted click|scroll|mousemove), handle mapped
    types to the compact form, and treat satisfies as a reference to User rather than printing the object fields as separate properties.



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
  <- (2.0)
  + {} (1.1) User
    <- (2.2), (2.0)
    + @ id: #number
      <- (2.0)
    + @ name: #string
      <- (2.0)
  + =: (1.2) UserId #number|string
    <- (2.2), (2.0)

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
Received: "§ (1) src/models/user.ts\n  <- (2.0)\n  + {} (1.1) User\n    <- (2.2), (2.0)\n    + @ id: #number\n      <- (2.0)\n    + @ name: #string\n      <- (2.0)\n  + =: (1.2) UserId #number|string\n    <- (2.2), (2.0)\n\n§ (2) src/services/apiClient.ts\n  -> (1.0)\n  <- (3.0)\n  + ◇ (2.1) ApiClient\n    <- (3.0)\n    - @ apiKey: #string\n    + ~ constructor(key: #string)\n      <- (3.0)\n    + ~ (2.2) fetchUser(id: #UserId): #Promise<User> ...!\n      -> (1.1), (1.2)\n      <- (3.0)\n    - ~ (2.3) _log(message: #string): #void\n\n§ (3) src/main.ts\n  -> (2.0)"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 01: Core TypeScript Features (Class, Interface, Qualifiers) [492.97ms]

--- MISMATCH IN FIXTURE: js-syntax ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/es_module.js
  <- (3.0)
  + @ (1.1) esValue
    <- (3.0)
  + ~ (1.2) esFunc()
    <- (3.0)

§ (2) src/cjs_module.js
  <- (3.0)

§ (3) src/consumer.js
  -> (1.0), (2.0)

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/es_module.js\n  <- (3.0)\n  + @ (1.1) esValue\n    <- (3.0)\n  + ~ (1.2) esFunc()\n    <- (3.0)\n\n§ (2) src/cjs_module.js\n  <- (3.0)\n  - ~ (2.1) cjsFunc()\n    <- (2.4)\n  + @ (2.2) module.exports\n  + @ (2.3) value\n  + @ (2.4) run\n    -> (2.1)\n\n§ (3) src/consumer.js\n  -> (1.0), (2.0)\n  -> (1.1)\n  -> (1.2)\n  -> (2.2)"
Received: "§ (1) src/es_module.js\n  <- (3.0)\n  + @ (1.1) esValue\n    <- (3.0)\n  + ~ (1.2) esFunc()\n    <- (3.0)\n\n§ (2) src/cjs_module.js\n  <- (3.0)\n\n§ (3) src/consumer.js\n  -> (1.0), (2.0)"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 04: JavaScript Syntax (ESM & CJS) [268.69ms]

--- MISMATCH IN FIXTURE: ts-modifiers ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/core/base.ts
  <- (2.0), (3.0)
  + @ id: #string
    <- (2.2), (2.0), (3.0)
  + @ species  [static]
    <- , (2.0), (3.0)
  - ~ constructor(id: #string)
  + ~ (1.1) getSpeciesName(): #string  [static]
    <- (2.0), (3.0)

§ (2) src/models/user.ts
  -> (1.0)
  <- (3.0)
  + ◇ (2.1) User
    <- (3.0)
    - @ secret: #string
      <-
    + ~ constructor(id: #string, secret: #string)
      <- (3.0)
    + ~ (2.2) getDescription(): #string
      -> (1.0)
      <- (3.0)
    - ~ (2.3) getSecret(): #string

§ (3) src/main.ts
  -> (1.0), (2.0)

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/core/base.ts\n  <- (2.0), (3.0)\n  + ◇ (1.1) BaseEntity [abstract]\n    <- (2.1), (3.0)\n    + @ id: #string [readonly]\n      <- (2.2), (3.0)\n    + @ species: #string [static]\n    - ~ constructor(id: #string)\n      <- (2.2)\n    ~ getDescription(): #string [abstract]\n      <- (2.2)\n    + ~ (1.2) getSpeciesName(): #string [static] o\n      <- (3.0)\n\n§ (2) src/models/user.ts\n  -> (1.0)\n  <- (3.0)\n  + ◇ (2.1) User < (1.1)\n    <- (3.0)\n    - @ secret: #string\n    + ~ (2.2) constructor(id: #string, secret: #string)\n      -> (1.1)\n    + ~ getDescription(): #string o\n      -> (1.1)\n      <- (3.0)\n    - ~ getSecret(): #string o\n\n§ (3) src/main.ts\n  -> (2.0), (1.0)\n  -> (2.1)\n  -> (2.2)\n  -> (1.1)\n  -> (1.2)"
Received: "§ (1) src/core/base.ts\n  <- (2.0), (3.0)\n  + @ id: #string\n    <- (2.2), (2.0), (3.0)\n  + @ species  [static]\n    <- , (2.0), (3.0)\n  - ~ constructor(id: #string)\n  + ~ (1.1) getSpeciesName(): #string  [static]\n    <- (2.0), (3.0)\n\n§ (2) src/models/user.ts\n  -> (1.0)\n  <- (3.0)\n  + ◇ (2.1) User\n    <- (3.0)\n    - @ secret: #string\n      <- \n    + ~ constructor(id: #string, secret: #string)\n      <- (3.0)\n    + ~ (2.2) getDescription(): #string\n      -> (1.0)\n      <- (3.0)\n    - ~ (2.3) getSecret(): #string\n\n§ (3) src/main.ts\n  -> (1.0), (2.0)"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 11: TypeScript Advanced Modifiers & Class Features [276.98ms]

--- MISMATCH IN FIXTURE: js-prototype-iife ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/legacy-widget.js

§ (2) src/app.js

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/legacy-widget.js\n  <- (2.0)\n  ~ (1.1) <anonymous>()\n    - ~ (1.2) Widget(name: #)\n      <- (1.1)\n      @ name\n      + ~ render()\n        <- (2.0)\n    - ~ (1.3) idGenerator*()\n      <- (1.1)\n    + @ window.Widget\n      -> (1.2)\n    + @ window.idGenerator\n      -> (1.3)\n\n§ (2) src/app.js\n  -> (1.0)\n  -> (1.2)\n  -> (1.3)"
Received: "§ (1) src/legacy-widget.js\n\n§ (2) src/app.js"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 12: JavaScript Prototypes and IIFE [161.35ms]

--- MISMATCH IN FIXTURE: ts-advanced-types ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/types.ts
  - =: (1.1) EventName #'click'|'scroll'|'mousemove'
    <- (1.4)
  - =: (1.2) Style #'bold'|'italic'
    <- (1.3)
  + =: (1.3) CssClass #`text-${Style}`
  + =: (1.4) HandlerMap #{
  + =: (1.5) UnpackPromise #T extends Promise<infer U> ? U : T
  + {} (1.6) User
    <- (1.0)
    + @ id: #number
    + @ name: #string
  - @ config
  + @ user: #User
  + @ (1.7) getUserId

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/types.ts\n  - =: EventName #click|scroll|mousemove\n    <- (1.2)\n  - =: Style #bold|italic\n    <- (1.1)\n  - {} User\n    <- (1.4)\n    @ id: #number\n    @ name: #string\n  + =: (1.1) CssClass #`text-${Style}`\n  + =: (1.2) HandlerMap #K in EventName:(event:K)=>void\n  + =: (1.3) UnpackPromise<T> #T extends Promise<infer U>?U:T\n    <- (1.5)\n  - @ (1.4) config\n    -> User\n  + ~ (1.5) getUserId(): #UnpackPromise<Promise<number>> o\n    -> (1.3), (1.4)"
Received: "§ (1) src/types.ts\n  - =: (1.1) EventName #'click'|'scroll'|'mousemove'\n    <- (1.4)\n  - =: (1.2) Style #'bold'|'italic'\n    <- (1.3)\n  + =: (1.3) CssClass #`text-${Style}`\n  + =: (1.4) HandlerMap #{\n  + =: (1.5) UnpackPromise #T extends Promise<infer U> ? U : T\n  + {} (1.6) User\n    <- (1.0)\n    + @ id: #number\n    + @ name: #string\n  - @ config\n  + @ user: #User\n  + @ (1.7) getUserId"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 19: Advanced TypeScript Types (Conditional, Mapped, Template Literals) [83.02ms]

--- MISMATCH IN FIXTURE: js-proxy-symbol ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/utils.js
  <- (2.0), (3.0)
  + @ (1.1) hiddenProp [symbol]
    <- (2.0), (3.0)
  + ~ (1.2) styler(strings, ...values)
    <- (2.0), (3.0)
  + @ (1.3) result
    <- (2.0), (3.0)

§ (2) src/model.js
  -> (1.0)
  <- (3.0)
  - @ user
  + @ (2.1) userProxy
    <- (3.0)
  + ~ (2.2) get(target, prop)
    <- (3.0)

§ (3) src/main.js
  -> (1.0), (2.0)

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/utils.js\n  <- (2.0), (3.0)\n  + @ (1.1) hiddenProp [symbol]\n    <- (2.0)\n  + ~ (1.2) styler(strings: #, ...values: #)\n    <- (3.0)\n\n§ (2) src/model.js\n  -> (1.0)\n  <- (3.0)\n  - @ user\n    -> (1.1)\n  + @ (2.1) userProxy [proxy]\n    <- (3.0)\n    - ~ get(target: #, prop: #)\n\n§ (3) src/main.js\n  -> (2.0), (1.0)\n  -> (2.1)\n  -> (1.2) [tagged]"
Received: "§ (1) src/utils.js\n  <- (2.0), (3.0)\n  + @ (1.1) hiddenProp [symbol]\n    <- (2.0), (3.0)\n  + ~ (1.2) styler(strings, ...values)\n    <- (2.0), (3.0)\n  + @ (1.3) result\n    <- (2.0), (3.0)\n\n§ (2) src/model.js\n  -> (1.0)\n  <- (3.0)\n  - @ user\n  + @ (2.1) userProxy\n    <- (3.0)\n  + ~ (2.2) get(target, prop)\n    <- (3.0)\n\n§ (3) src/main.js\n  -> (1.0), (2.0)"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 23: JavaScript Proxy, Symbol, and Tagged Templates [225.19ms]

--- MISMATCH IN FIXTURE: ts-ambient-modules ---

--- EXPECTED ---

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

--- ACTUAL ---

§ (1) src/types/global.d.ts
  - {} (1.1) Window
    + @ uuid: #string

§ (2) src/main.ts

------------------

89 |       console.error('\n--- ACTUAL ---\n');
90 |       console.error(scnOutput.trim());
91 |       console.error('\n------------------\n');
92 |   }
93 |
94 |   expect(scnOutput.trim()).toBe(fixture.expected);
      ^
error: expect(received).toBe(expected)

Expected: "§ (1) src/types/global.d.ts\n  <- (2.0)\n  {} (1.1) Window\n    <- (2.0)\n    @ uuid: #string\n\n§ (2) src/main.ts\n  -> (1.0) [reference]\n  ◇ 'virtual-logger' [ambient]\n    + ~ (2.2) log(message: #string): #void\n      <- (2.0)\n  -> (2.2)\n  -> (1.1)"
Received: "§ (1) src/types/global.d.ts\n  - {} (1.1) Window\n    + @ uuid: #string\n\n§ (2) src/main.ts"

      at /home/realme-book/Project/code/scn-ts-core/test/test.util.ts:94:2
✗ Core Language Features > 24: Ambient Modules & Triple-Slash Directives [145.82ms]

 0 pass
 7 fail
 7 expect() calls
Ran 7 tests across 1 files. [1.72s]



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

===== Tagged template (tagged.js) =====
program [0:0-2:53]
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
  expression_statement [2:0-2:48]
    sequence_expression [2:0-2:48]
      assignment_expression [2:0-2:32]
        member_expression [2:0-2:23]
          member_expression [2:0-2:13]
            identifier [2:0-2:8]
            . [2:8-2:9]
            property_identifier [2:9-2:13]
          . [2:13-2:14]
          property_identifier [2:14-2:23]
        = [2:24-2:25]
        identifier [2:26-2:32]
      ERROR [2:32-2:39]
        escape_sequence [2:32-2:34]
        identifier [2:34-2:39]
      , [2:39-2:40]
      ERROR [2:41-2:44]
        ERROR [2:41-2:42]
        ${ [2:42-2:44]
      identifier [2:44-2:48]
  ERROR [2:48-2:52]
    } [2:48-2:49]
    ! [2:49-2:50]
    escape_sequence [2:50-2:52]
  empty_statement [2:52-2:53]
    ; [2:52-2:53]
