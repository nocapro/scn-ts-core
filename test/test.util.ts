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