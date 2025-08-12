import type { ParserInitOptions, LanguageConfig } from './types';
import { Parser, Language, type Tree } from 'web-tree-sitter';
import path from 'node:path';
import { languages } from './languages';

let initializePromise: Promise<void> | null = null;
let isInitialized = false;

const doInitialize = async (options: ParserInitOptions): Promise<void> => {
    await Parser.init({
        locateFile: (scriptName: string, _scriptDirectory: string) => {
            return path.join(options.wasmBaseUrl, scriptName);
        }
    });

    const languageLoaders = languages
        .filter(lang => lang.wasmPath)
        .map(async (lang: LanguageConfig) => {
            const wasmPath = path.join(options.wasmBaseUrl, lang.wasmPath);
            try {
                const loadedLang = await Language.load(wasmPath);
                const parser = new Parser();
                parser.setLanguage(loadedLang);
                lang.parser = parser;
                lang.loadedLanguage = loadedLang;
            } catch (error) {
                console.error(`Failed to load parser for ${lang.name} from ${wasmPath}`, error);
                throw error;
            }
        });
    
    await Promise.all(languageLoaders);
    isInitialized = true;
};

export const initializeParser = (options: ParserInitOptions): Promise<void> => {
    if (initializePromise) {
        return initializePromise;
    }
    initializePromise = doInitialize(options);
    return initializePromise;
};

export const parse = (sourceCode: string, lang: LanguageConfig): Tree | null => {
    if (!isInitialized || !lang.parser) {
        return null;
    }
    return lang.parser.parse(sourceCode);
};