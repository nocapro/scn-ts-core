import { initializeParser, parse } from './src/parser.ts';
import { getLanguageForFile } from './src/languages.ts';
import path from 'node:path';

const wasmDir = path.join(process.cwd(), 'test', 'wasm');
await initializeParser({ wasmBaseUrl: wasmDir });

const code = `
export class ApiClient {
  private apiKey: string;

  constructor(key: string) {
    this.apiKey = key;
  }

  public async fetchUser(id: number): Promise<string> {
    return 'ok';
  }

  private _log(message: string): void {}
}
`;

const language = getLanguageForFile('file.ts');
const tree = parse(code, language);

function print(node, depth = 0) {
  const ind = '  '.repeat(depth);
  const range = `[${node.startPosition.row}:${node.startPosition.column}-${node.endPosition.row}:${node.endPosition.column}]`;
  console.log(`${ind}${node.type} ${range}`);
  for (let i = 0; i < node.namedChildCount; i++) {
    const child = node.namedChild(i);
    print(child, depth + 1);
  }
}

print(tree.rootNode);
