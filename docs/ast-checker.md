import { initializeParser, parse } from './src/parser.ts';
import { getLanguageForFile } from './src/languages.ts';
import path from 'node:path';

const wasmDir = path.join(process.cwd(), 'test', 'wasm');
await initializeParser({ wasmBaseUrl: wasmDir });

const testCode = `
export interface User {
  id: number;
  name: string;
}

export class ApiClient {
  private apiKey: string;

  constructor(key: string) {
    this.apiKey = key;
  }

  public async fetchUser(id: number): Promise<User> {
    return { id: 1, name: 'Test' };
  }
}
`;

const language = getLanguageForFile('test.ts');
const tree = parse(testCode, language);

function printAST(node, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${node.type} [${node.startPosition.row}:${node.startPosition.column}-${node.endPosition.row}:${node.endPosition.column}]`);

  if (node.fieldNames) {
    for (const fieldName of node.fieldNames) {
      const fieldNode = node.childForFieldName(fieldName);
      if (fieldNode) {
        console.log(`${indent}  ${fieldName}:`);
        printAST(fieldNode, depth + 2);
      }
    }
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!node.fieldNames || !node.fieldNames.some(fn => node.childForFieldName(fn) === child)) {
      printAST(child, depth + 1);
    }
  }
}

printAST(tree.rootNode);
