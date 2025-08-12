import { getLanguageForFile } from './languages';
import { initializeParser as init, parse } from './parser';
import type { ScnTsConfig, ParserInitOptions, SourceFile, InputFile } from './types';
import { analyze } from './analyzer';
import { formatScn } from './formatter';
import path from 'node:path';
import { getPathResolver } from './utils/tsconfig';
import { resolveGraph } from './graph-resolver';

/**
 * Public API to initialize the parser. Must be called before generateScn.
 */
export const initializeParser = (options: ParserInitOptions): Promise<void> => init(options);

export type { ScnTsConfig, ParserInitOptions, SourceFile, InputFile };

/**
 * Generates an SCN string from a project directory.
 */
export const generateScn = async (config: ScnTsConfig): Promise<string> => {
    const root = config.root ?? '/';
    const pathResolver = getPathResolver(config.tsconfig);

    let fileIdCounter = 1; // Start with 1 to match fixture IDs

    // Step 1: Create SourceFile objects for all files
    const sourceFiles = config.files.map((file) => {
        const lang = getLanguageForFile(file.path);
        const absolutePath = path.join(root, file.path);
        const sourceFile: SourceFile = {
            id: fileIdCounter++,
            relativePath: file.path,
            absolutePath,
            sourceCode: file.content,
            language: lang!,
            symbols: [],
            parseError: false,
        };
        return sourceFile;
    });

    // Step 2: Parse all files
    const parsedFiles = sourceFiles.map(file => {
        if (!file.language || !file.language.wasmPath || file.sourceCode.trim() === '') {
            return file;
        }
        const tree = parse(file.sourceCode, file.language);
        if (!tree) {
            file.parseError = true;
        } else {
            file.ast = tree;
        }
        return file;
    });

    // Step 3: Analyze all parsed files
    const analyzedFiles = parsedFiles.map(file => {
        if (file.ast) {
            return analyze(file);
        }
        return file;
    });
    
    // Step 4: Resolve the dependency graph across all files
    const resolvedGraph = resolveGraph(analyzedFiles, pathResolver, root);
    
    // Step 5: Format the final SCN output
    return formatScn(resolvedGraph);
};