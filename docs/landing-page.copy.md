```markdown
# scn-ts – turn your codebase into a 5-line prompt

> “Show me the shape of your repo in 500 tokens or I’m not reading it.”

scn-ts is a zero-config, WASM-powered static analyzer that spits out **SCN** – a dense, emoji-rich, token-counted summary of every symbol, dependency and cross-file call in your project.
Paste the output straight into GPT/Claude and watch it refactor, review or port your code without ever seeing the source.

---

## why

- **Context windows are tiny.** 8 k tokens disappears fast when you paste `/src`.
- **GPT doesn’t need your `node_modules`.** It needs the graph – what talks to what.
- **You don’t need another IDE.** You need a 1-second command that turns *“here’s my repo”* into *“here’s the 400-token cheat-sheet the model actually reads”*.

---

## what you get

`npx scn-ts` →

```
§1 src/main.tsx
  + ◇ App (1)
  + ~button Button
    > 2, 3

§2 src/utils/api.ts
  ~fetchUsers
    < 1
    > 3

§3 src/types.ts
  {} User
```

- every **§** is a file (with ID)
- **+/-** = exported / private
- **◇ {} ~** = class, interface, function
- **>** = calls / imports
- **<** = called-by
- token count printed top-right – aim for < 1 k before you paste.

---

## features that save your tokens

| toggle | tokens saved |
|---|---|
| drop private symbols | –35 % |
| hide method bodies | –22 % |
| collapse React props | –18 % |
| filter out `*.test.ts` | –40 % |

Live slider in the web demo – watch the count drop in real time.

---

## under the hood

- **tree-sitter WASM** parsers for TS/JS/TSX/JSX/CSS/Go/Rust (more PR welcome)
- **topological sort** so GPT sees dependencies in order
- **tiktoken cl100k** – same counter as GPT-4
- **zero npm deps** in the browser build (except tiktoken)
- **WebWorker** – UI stays 60 fps while a 20 k-file monorepo crunches in the background

---

## install / use

```bash
npm i -g scn-ts         # CLI
npx scn-ts              # analyze cwd
npx scn-ts --preset=minimal --exclude="**/*.spec.ts"
```

or drop the **<script>** tag and paste JSON in the [web demo](https://scn-ts.vercel.app) – no build step, no backend, no data leaves your machine.

---

## copy-pasta for HN

- *“This is what I wanted from LSP but readable by a LLM.”*
- *“Finally, a readme that doesn’t make me install Rust nightly.”*
- *“Shipped a React→Svelte port in 30 min using the SCN output as prompt.”*

---

## roadmap / help wanted

- Python, Java, C# parsers
- `--watch` mode (hot-reload SCN on save)
- VS Code extension (right-click → *“Copy SCN to clipboard”*)
- smarter token-impact heuristics (AST-level pruning before format)

PRs = ❤️ – parser queries live in `/src/queries/*.ts`, add yours.

---

MIT – built in public during the 2024 “context-window crunch” weeks.
Star if you hate pasting 3 k lines of code into ChatGPT.
