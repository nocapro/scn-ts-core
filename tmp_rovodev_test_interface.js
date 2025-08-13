import { initializeParser, parse } from './src/parser.ts';
import { analyze } from './src/analyzer.ts';
import { getLanguageForFile } from './src/languages.ts';
import path from 'node:path';

const wasmDir = path.join(process.cwd(), 'test', 'wasm');
await initializeParser({ wasmBaseUrl: wasmDir });

const testCode = `
export interface User {
  id: number;
  name: string;
}
`;

const language = getLanguageForFile('test.ts');
const tree = parse(testCode, language);

const sourceFile = {
  id: 1,
  relativePath: 'test.ts',
  absolutePath: '/test.ts',
  language,
  sourceCode: testCode,
  ast: tree,
  symbols: [],
  parseError: false
};

const analyzed = analyze(sourceFile);

console.log('Interface properties:');
analyzed.symbols.filter(s => s.kind === 'property').forEach(symbol => {
  console.log(`${symbol.name}: isExported = ${symbol.isExported} (should be true)`);
});