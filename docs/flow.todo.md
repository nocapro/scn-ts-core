=== DONE

update prepare-wasm.cjs
1. to make it parallel,
2. add progress indicator
3. also should check for existing so no need to redownload

=== DONE

1. add timetook stat. from core api level to ui
2. disable scrollable to log
3. add de/expand iconbutton formatting options to de/collapse all tree

=== DONE

disable scrollable to log

=== DONE

after clicking analyze, the button should change to loading state UI with progress percentage also have stop button to stop processing

=== DONE

web log; add multi toggle to show log levels

=== DONE

add copy button to log

=== DONE

fix doubling log

=== DONE

add copy button for output

=== DONE

sidebar: make the input, format options, and log to be as accordion. just like in vscode

=== DONE

this § and file index should also configurable in formatting options

=== DONE

expand the formatting control to AST based granularity control

we need super nested formatting options.

===

web; input , format options, log should be as sidebar... so the output is the main dominant area. also remove header

===

is scnable

=== DONE

web; show llm token counter both in input and output

===

scn-ts-web-demo; please make the UX is super cohesive

===

scn-ts-core should be ready for this

import {
  initializeParser,
  logger,
  analyzeProject,
  FileContent,
  LogHandler,
  generateScn,
} from '';//todo


    "package.json",
    "tsconfig.json",
    "src",


    "packages/scn-ts-web-demo/index.html",
    "packages/scn-ts-web-demo/package.json",
    "packages/scn-ts-web-demo/postcss.config.js",
    "packages/scn-ts-web-demo/tailwind.config.js",
    "packages/scn-ts-web-demo/tsconfig.json",
    "packages/scn-ts-web-demo/tsconfig.node.json",
    "packages/scn-ts-web-demo/vite.config.ts",
    "packages/scn-ts-web-demo/src"

===


if you given 2.1 fix plan

what would scripts/ast.ts edit to run for explore the parse in to support the context of task above?

beware, do not fix 2.1 yet. just modify ast.ts first!


=== DONE

no need fs, this is in-memory based programmatic api

===

** SCN is A hyper-efficient, language-agnostic representation of your codebase's structure, API, and inter-file relationships. Unlock unparalleled context for Large Language Models (LLMs) and advanced code analysis, using a fraction of the tokens.**

please develop the `src` logic files in production ready manner, also follow below rules;

1. no type any, unknown or even casting as
2. no OOP and classes
3. use HOF
4. DRY

realme-book@realme-book:~/Project/code/scn-ts-core$ ls wasm
tree-sitter-cpp.wasm      tree-sitter-java.wasm    tree-sitter-solidity.wasm
tree-sitter-c_sharp.wasm  tree-sitter-php.wasm     tree-sitter-tsx.wasm
tree-sitter-css.wasm      tree-sitter-python.wasm  tree-sitter-typescript.wasm
tree-sitter-c.wasm        tree-sitter-ruby.wasm    tree-sitter.wasm
tree-sitter-go.wasm       tree-sitter-rust.wasm


give me transaction in four phase, now go for first phase, ask me later for next phase

===

turn test.plan.md into *.fixture.yaml files

give me transaction in four phase, now go for first phase, ask me later for next phase

===

aim for src improvement for passed test

if you need to have repograph-core improvement/modification, just add something to docs/todo.repograph.md

===

extract out types and constants to types.ts and constants.ts

===

all test fail because

`WASM file not found`

I have added wasm files

realme-book@realme-book:~/Project/code/scn-ts/packages/scn-ts-core$ ls test/wasm
tree-sitter-cpp.wasm      tree-sitter-python.wasm
tree-sitter-c_sharp.wasm  tree-sitter-ruby.wasm
tree-sitter-css.wasm      tree-sitter-rust.wasm
tree-sitter-c.wasm        tree-sitter-solidity.wasm
tree-sitter-go.wasm       tree-sitter-tsx.wasm
tree-sitter-java.wasm     tree-sitter-typescript.wasm
tree-sitter-php.wasm      tree-sitter.wasm

===

create e2e test

based on  "test/fixtures", please follow 1-11 below rules;

1. implement test/e2e/[categories]/*.test.ts files and test/test.util.ts
2. Test cases should be isolated and clean no left over even on sigterm
3. Test should use bun:test describe,it,afterAll,beforeAll,afterEach,beforeEach without mock
4.
5. Test cases should match expected requirements
6. Do not create test of tricks, simulation, stub, mock, etc. you should produce code of real algorithm
7. Do not create any new file for helper,script etc. just do what prompted.
8. test expectation; do not use `contain`, should use exact match!!
9. type of any, unknown, casting as: they are strictly forbidden!!!
10.
11. the test files should be clean minimal as the complexity at test.util.ts

the wasm files already copied to test/wasm/ as flat files.

realme-book@realme-book:~/Project/code/scn-ts-core$ ls test/wasm
tree-sitter-cpp.wasm      tree-sitter-java.wasm    tree-sitter-solidity.wasm
tree-sitter-c_sharp.wasm  tree-sitter-php.wasm     tree-sitter-tsx.wasm
tree-sitter-css.wasm      tree-sitter-python.wasm  tree-sitter-typescript.wasm
tree-sitter-c.wasm        tree-sitter-ruby.wasm    tree-sitter.wasm
tree-sitter-go.wasm       tree-sitter-rust.wasm
realme-book@realme-book:~/Project/code/scn-ts-core$


see examples for wasm initialization and matching versions


    "package.json",
    "tsconfig.json",
    "tsup.config.ts",
    "docs/test.plan.md",
    "src"

===

user of scn-ts-web-demo want while click analyze, in the log they see the current progress like percentage, current processing path files etc. also in the button UI state

===
