import { getLanguageForFile } from './languages';
import { initializeParser as init, parse } from './parser';
import type { ParserInitOptions, SourceFile, InputFile, ScnTsConfig, AnalyzeProjectOptions } from './types';
import { analyze } from './analyzer';
import { formatScn } from './formatter';
import path from './utils/path';
import { getPathResolver } from './utils/tsconfig';
import { resolveGraph } from './graph-resolver';
import { logger } from './logger';

/**
 * Public API to initialize the parser. Must be called before any other APIs.
 */
export const initializeParser = (options: ParserInitOptions): Promise<void> => init(options);

// Types for web demo
export type { ParserInitOptions, SourceFile, LogLevel, InputFile, TsConfig, ScnTsConfig, AnalyzeProjectOptions, LogHandler } from './types';
export type FileContent = InputFile;

// Exports for web demo
export { logger };

/**
 * Generate SCN from analyzed source files
 */
export const generateScn = (analyzedFiles: SourceFile[]): string => {
    return formatScn(analyzedFiles);
};

/**
 * Legacy API: Generate SCN from config (for backward compatibility)
 */
export const generateScnFromConfig = async (config: ScnTsConfig): Promise<string> => {
    const analyzedFiles = await analyzeProject({
        files: config.files,
        tsconfig: config.tsconfig,
        root: config.root
    });
    return formatScn(analyzedFiles);
};

/**
 * Parses and analyzes a project's files to build a dependency graph.
 */
export const analyzeProject = async ({
    files,
    tsconfig,
    root = '/',
    onProgress,
    logLevel
}: AnalyzeProjectOptions): Promise<SourceFile[]> => {
    if (logLevel) {
        logger.setLevel(logLevel);
    }
    const pathResolver = getPathResolver(tsconfig);

    let fileIdCounter = 1;

    onProgress?.({ percentage: 0, message: 'Creating source files...' });
    logger.debug('Creating source files...');

    // Step 1: Create SourceFile objects for all files
    const sourceFiles = files.map((file) => {
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

    onProgress?.({ percentage: 10, message: `Parsing ${sourceFiles.length} files...` });
    logger.debug(`Parsing ${sourceFiles.length} files...`);

    // Step 2: Parse all files
    const parsedFiles = sourceFiles.map((file, i) => {
        if (!file.language || !file.language.wasmPath || file.sourceCode.trim() === '') {
            return file;
        }
        const tree = parse(file.sourceCode, file.language);
        if (!tree) {
            file.parseError = true;
            logger.warn(`Failed to parse ${file.relativePath}`);
        } else {
            file.ast = tree;
        }
        const percentage = 10 + (40 * (i + 1) / sourceFiles.length);
        onProgress?.({ percentage, message: `Parsing ${file.relativePath}` });
        logger.debug(`[${Math.round(percentage)}%] Parsed ${file.relativePath}`);
        return file;
    });

    onProgress?.({ percentage: 50, message: 'Analyzing files...' });
    logger.debug('Analyzing files...');

    // Step 3: Analyze all parsed files
    const analyzedFiles = parsedFiles.map((file, i) => {
        if (file.ast) {
            const analyzed = analyze(file);
            const percentage = 50 + (40 * (i + 1) / sourceFiles.length);
            onProgress?.({ percentage, message: `Analyzing ${file.relativePath}` });
            logger.debug(`[${Math.round(percentage)}%] Analyzed ${file.relativePath}`);
            return analyzed;
        }
        return file;
    });
    
    onProgress?.({ percentage: 90, message: 'Resolving dependency graph...' });
    logger.debug('Resolving dependency graph...');

    // Step 4: Resolve the dependency graph across all files
    const resolvedGraph = resolveGraph(analyzedFiles, pathResolver, root);
    
    onProgress?.({ percentage: 100, message: 'Analysis complete.' });
    logger.debug('Analysis complete.');
    return resolvedGraph;
};