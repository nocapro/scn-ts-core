import type { ParserInitOptions, LanguageConfig } from './types';
import Parser from 'web-tree-sitter';
import path from 'node:path';
import { languages } from './languages';

let isInitialized = false;

const createInitializer = (options: ParserInitOptions) => async (): Promise<void> => {
    if (isInitialized) {
        return;
    }
    
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
                const loadedLang = await Parser.Language.load(wasmPath);
                const parser = new Parser();
                parser.setLanguage(loadedLang);
                lang.parser = parser;
            } catch (error) {
                console.error(`Failed to load parser for ${lang.name} from ${wasmPath}`, error);
            }
        });
    
    await Promise.all(languageLoaders);
    isInitialized = true;
};

let initializeFn: (() => Promise<void>) | null = null;

export const initializeParser = async (options: ParserInitOptions): Promise<void> => {
    if (!initializeFn) {
        initializeFn = createInitializer(options);
    }
    await initializeFn();
};

export const parse = (sourceCode: string, lang: LanguageConfig): Parser.Tree | null => {
    if (!isInitialized || !lang.parser) {
        return null;
    }
    return lang.parser.parse(sourceCode);
};