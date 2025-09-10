import { getLanguageForFile } from './languages';
import { parse } from './parser';
import type { SourceFile, AnalyzeProjectOptions } from './types';
import { analyze } from './analyzer';
import path from './utils/path';
import { getPathResolver } from './utils/tsconfig';
import { resolveGraph } from './graph-resolver';
import { logger } from './logger';
import picomatch from 'picomatch';

/**
 * Parses and analyzes a project's files to build a dependency graph.
 */
export const analyzeProject = async (
    {
        files,
        tsconfig,
        root = '/',
        onProgress,
        logLevel,
        signal,
        include,
        exclude,
    }: AnalyzeProjectOptions
): Promise<{ sourceFiles: SourceFile[], analysisTime: number }> => {
    const startTime = performance.now();
    if (logLevel) {
        logger.setLevel(logLevel);
    }
    logger.info(`Starting analysis of ${files.length} files...`);
    const pathResolver = getPathResolver(tsconfig);

    const checkAborted = () => { if (signal?.aborted) throw new DOMException('Aborted', 'AbortError'); };
    let fileIdCounter = 1;

    onProgress?.({ percentage: 0, message: 'Creating source files...' });

    // Step 1: Create SourceFile objects for all files
    let sourceFiles = files.map((file) => {
        checkAborted();
        const absolutePath = path.join(root, file.path);
        const sourceFile: SourceFile = {
            id: fileIdCounter++,
            relativePath: file.path,
            absolutePath,
            sourceCode: file.content,
            language: getLanguageForFile(file.path)!,
            symbols: [],
            parseError: false,
        };
        return sourceFile;
    });

    if (include?.length || exclude?.length) {
        const originalCount = sourceFiles.length;
        logger.info(`Applying glob filters. Initial file count: ${originalCount}`);
        const isIncluded = include?.length ? picomatch(include, { dot: true }) : () => true;
        const isExcluded = exclude?.length ? picomatch(exclude, { dot: true }) : () => false;

        sourceFiles = sourceFiles.filter(file => {
            const included = isIncluded(file.relativePath);
            const excluded = isExcluded(file.relativePath);
            return included && !excluded;
        });
        logger.info(`Files after filtering: ${sourceFiles.length} (${originalCount - sourceFiles.length} removed)`);
    }

    logger.debug(`Processing ${sourceFiles.length} files.`);
    onProgress?.({ percentage: 10, message: `Parsing ${sourceFiles.length} files...` });

    // Step 2: Parse all files
    const parsedFiles = sourceFiles.map((file, i) => {
        checkAborted();
        if (!file.language || !file.language.wasmPath || file.sourceCode.trim() === '') {
            return file;
        }
        logger.debug(`Parsing ${file.relativePath}`);
        const tree = parse(file.sourceCode, file.language);
        if (!tree) {
            file.parseError = true;
            logger.warn(`Failed to parse ${file.relativePath}`);
        } else {
            file.ast = tree;
        }
        const percentage = 10 + (40 * (i + 1) / sourceFiles.length);
        onProgress?.({ percentage, message: `Parsing ${file.relativePath}` });
        return file;
    });

    onProgress?.({ percentage: 50, message: 'Analyzing files...' });
    logger.info(`Parsing complete. Analyzing symbols and relationships...`);

    // Step 3: Analyze all parsed files
    const analyzedFiles = parsedFiles.map((file, i) => {
        checkAborted();
        if (file.ast) {
            logger.debug(`Analyzing ${file.relativePath}`);
            const analyzed = analyze(file);
            const percentage = 50 + (40 * (i + 1) / sourceFiles.length);
            onProgress?.({ percentage, message: `Analyzing ${file.relativePath}` });
            return analyzed;
        }
        return file;
    });
    
    onProgress?.({ percentage: 90, message: 'Resolving dependency graph...' });
    logger.info('Analysis complete. Resolving dependency graph...');

    // Step 4: Resolve the dependency graph across all files
    checkAborted();
    const resolvedGraph = resolveGraph(analyzedFiles, pathResolver, root);
    
    onProgress?.({ percentage: 100, message: 'Analysis complete.' });
    logger.info('Graph resolution complete. Project analysis finished.');
    const analysisTime = performance.now() - startTime;
    return { sourceFiles: resolvedGraph, analysisTime };
};