import { initializeParser, parse } from '../src/parser';
import { getLanguageForFile } from '../src/languages';
import path from 'node:path';

async function main() {
  const wasmDir = path.join(process.cwd(), 'test', 'wasm');
  await initializeParser({ wasmBaseUrl: wasmDir });

  const samples: Array<{file: string, code: string, title: string}> = [
    {
      file: 'sample.ts',
      title: 'TS class/interface snippet',
      code: `
export interface User { id: number; name: string; }
export type UserId = number | string;
export class ApiClient { private apiKey: string; constructor(key: string) { this.apiKey = key; } async fetchUser(id: UserId): Promise<User> { return { id: 1, name: 'x' }; } }
      `.trim()
    },
    {
      file: 'iife.js',
      title: 'IIFE and prototype',
      code: `
(function(){
  function Widget(name){ this.name = name }
  Widget.prototype.render = function(){ return 'x' }
  function * idGenerator(){ let i=0; while(true) yield i++; }
  window.Widget = Widget; window.idGenerator = idGenerator;
})();
      `.trim()
    },
    {
      file: 'cjs.js',
      title: 'CJS require',
      code: `
const cjs = require('./cjs_module');
      `.trim()
    },
    {
      file: 'cjs_exports.js',
      title: 'CJS module.exports',
      code: `
function cjsFunc() { console.log('cjs'); }
module.exports = {
  value: 42,
  run: () => cjsFunc()
};
      `.trim()
    },
    {
      file: 'tagged.js',
      title: 'Tagged template',
      code: `
function styler(strings, ...values) { return '' }
const name = 'a';
document.body.innerHTML = styler\`Hello, \${name}!\`;
      `.trim()
    },
    {
      file: 'abstract_class.ts',
      title: 'Abstract Class',
      code: `
abstract class BaseEntity {
  readonly id: string;
  static species: string;
  protected constructor(id: string) { this.id = id; }
  abstract getDescription(): string;
  static getSpeciesName(): string { return this.species; }
}
      `.trim()
    },
    {
      file: 'advanced_types.ts',
      title: 'Advanced Types',
      code: `
type EventName = 'click' | 'scroll' | 'mousemove';
type Style = 'bold' | 'italic';
type CssClass = \`text-\${Style}\`;
type HandlerMap = { [K in EventName]: (event: K) => void };
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
interface User { id: number; name: string; }
const config = { user: { id: 1, name: 'a' } satisfies User };
      `.trim()
    },
    {
        file: 'proxy.js',
        title: 'JS Proxy',
        code: `
const hiddenProp = Symbol('hidden');
const user = { name: 'John', [hiddenProp]: 'secret' };
const userProxy = new Proxy(user, {
  get(target, prop) {
    return prop in target ? target[prop] : 'N/A';
  }
});
        `.trim()
    },
    {
      file: 'dep_graph_circular.ts',
      title: 'Member Expression Call (dep-graph-circular)',
      code: `
import { funcB } from './moduleB';
import { util } from './utils';

export function funcA() {
  if (util.shouldRun()) funcB();
}
      `.trim()
    }
  ];

  for (const sample of samples) {
    const lang = getLanguageForFile(sample.file)!;
    const tree = parse(sample.code, lang)!;
    console.log(`\n===== ${sample.title} (${sample.file}) =====`);
    printAST(tree.rootNode);
  }
}

function printAST(node: any, depth = 0) {
  const indent = '  '.repeat(depth);
  const isNamed = typeof node.isNamed === 'function' ? node.isNamed() : true;
  console.log(`${indent}${node.type}${isNamed ? '' : ' [anon]'} [${node.startPosition.row}:${node.startPosition.column}-${node.endPosition.row}:${node.endPosition.column}]`);

  const fieldNames: string[] = node.fieldNames || [];
  for (const fieldName of fieldNames) {
    const child = node.childForFieldName(fieldName);
    if (child) {
      console.log(`${indent}  ${fieldName}:`);
      printAST(child, depth + 2);
    }
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!fieldNames.some(fn => node.childForFieldName(fn) === child)) {
      printAST(child, depth + 1);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
