import type { LanguageConfig } from './types';
import path from './utils/path';
import { typescriptQueries, typescriptReactQueries } from './queries/typescript';
import { cssQueries } from './queries/css';
import { goQueries } from './queries/go';
import { rustQueries } from './queries/rust';

// Based on test/wasm and test/fixtures
export const languages: LanguageConfig[] = [
    {
        id: 'typescript',
        name: 'TypeScript',
        extensions: ['.ts', '.mts', '.cts'],
        wasmPath: 'tree-sitter-typescript.wasm',
        queries: { main: typescriptQueries },
    },
    {
        id: 'tsx',
        name: 'TypeScriptReact',
        extensions: ['.tsx'],
        wasmPath: 'tree-sitter-tsx.wasm',
        queries: { main: typescriptReactQueries },
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        extensions: ['.js', '.mjs', '.cjs'],
        wasmPath: 'tree-sitter-typescript.wasm',
        queries: { main: typescriptQueries },
    },
    {
        id: 'css',
        name: 'CSS',
        extensions: ['.css'],
        wasmPath: 'tree-sitter-css.wasm',
        queries: { main: cssQueries },
    },
    {
        id: 'go',
        name: 'Go',
        extensions: ['.go'],
        wasmPath: 'tree-sitter-go.wasm',
        queries: { main: goQueries },
    },
    {
        id: 'java',
        name: 'Java',
        extensions: ['.java'],
        wasmPath: 'tree-sitter-java.wasm',
        queries: {},
    },
    {
        id: 'python',
        name: 'Python',
        extensions: ['.py'],
        wasmPath: 'tree-sitter-python.wasm',
        queries: {},
    },
    {
        id: 'rust',
        name: 'Rust',
        extensions: ['.rs'],
        wasmPath: 'tree-sitter-rust.wasm',
        queries: { main: rustQueries },
    },
    {
        id: 'c',
        name: 'C',
        extensions: ['.c'],
        wasmPath: 'tree-sitter-c.wasm',
        queries: {},
    },
    {
        id: 'graphql',
        name: 'GraphQL',
        extensions: ['.graphql', '.gql'],
        wasmPath: '', // No wasm file provided in the list
        queries: {},
    },
];

const createLanguageMap = (): Map<string, LanguageConfig> => {
    const map = new Map<string, LanguageConfig>();
    languages.forEach(lang => {
        lang.extensions.forEach(ext => {
            map.set(ext, lang);
        });
    });
    return map;
};

const languageMap = createLanguageMap();

export const getLanguageForFile = (filePath: string): LanguageConfig | undefined => {
    const extension = path.extname(filePath);
    return languageMap.get(extension);
};