import { getLanguageForFile } from './languages';
import { initializeParser as init, parse } from './parser';
import type { ParserInitOptions, SourceFile, InputFile, ScnTsConfig, AnalyzeProjectOptions, FormattingOptions, FormattingOptionsTokenImpact, SymbolKind } from './types';
import { analyze } from './analyzer';
import { formatScn } from './formatter';
import path from './utils/path';
import { getPathResolver } from './utils/tsconfig';
import { resolveGraph } from './graph-resolver';
import { logger } from './logger';
import { initializeTokenizer as initTokenizer, countTokens as countTokensInternal } from './tokenizer';

import type { FormattingPreset } from './types';

/**
 * Public API to initialize the parser. Must be called before any other APIs.
 */
export const initializeParser = (options: ParserInitOptions): Promise<void> => init(options);

/**
 * Initializes the tokenizer. Call this for consistency, although `countTokens` will auto-initialize on first use.
 * It's a synchronous and lightweight operation.
 */
export const initializeTokenizer = (): boolean => initTokenizer();

// Types for web demo
export type { ParserInitOptions, SourceFile, LogLevel, InputFile, TsConfig, ScnTsConfig, AnalyzeProjectOptions, LogHandler, FormattingOptions, FormattingPreset, FormattingOptionsTokenImpact, CodeSymbol, SymbolKind } from './types';
export type FileContent = InputFile;

// Exports for web demo. The constants are exported from index.ts directly.
export { logger };

const defaultFormattingOptions: Omit<FormattingOptions, 'preset'> = {
  showOutgoing: true,
  showIncoming: true,
  showIcons: true,
  showExportedIndicator: true,
  showPrivateIndicator: true,
  showModifiers: true,
  showTags: true,
  showSymbolIds: true,
  groupMembers: true,
  displayFilters: {},
  showFilePrefix: true,
  showFileIds: true,
  showOnlyExports: false,
};

export function getFormattingOptionsForPreset(preset: FormattingPreset): FormattingOptions {
  switch (preset) {
    case 'minimal':
      return {
        preset: 'minimal',
        ...defaultFormattingOptions,
        showIcons: false,
        showExportedIndicator: false,
        showPrivateIndicator: false,
        showModifiers: false,
        showTags: false,
        showSymbolIds: false,
        groupMembers: false,
        displayFilters: { '*': false },
      };
    case 'compact':
      return {
        preset: 'compact',
        ...defaultFormattingOptions,
        showPrivateIndicator: false,
        showModifiers: false,
        showTags: false,
        showSymbolIds: false,
        displayFilters: {
          'property': false,
          'method': false,
          'constructor': false,
          'enum_member': false,
          'import_specifier': false,
        },
        showOnlyExports: true,
      };
    case 'detailed':
      return {
        preset: 'detailed',
        ...defaultFormattingOptions,
        groupMembers: false,
      };
    case 'verbose':
      return {
        preset: 'verbose',
        ...defaultFormattingOptions,
        groupMembers: false,
        displayFilters: { '*': true },
      };
    case 'default':
    default:
      return {
        preset: 'default',
        ...defaultFormattingOptions,
      };
  }
}

/**
 * Counts tokens in a string using the cl100k_base model.
 */
export const countTokens = (text: string): number => countTokensInternal(text);

/**
 * Generate SCN from analyzed source files
 */
export const generateScn = (analyzedFiles: SourceFile[], options: FormattingOptions = {}): string => {
    const formattingOptions = options.preset
        ? { ...getFormattingOptionsForPreset(options.preset), ...options }
        : options;
    return formatScn(analyzedFiles, formattingOptions);
};

/**
 * Calculates the token impact of toggling each formatting option.
 * This can be slow as it re-generates the SCN for each option.
 * @param analyzedFiles The result from `analyzeProject`.
 * @param baseOptions The formatting options to calculate deltas from.
 * @returns An object detailing the token change for toggling each option.
 */
export const calculateTokenImpact = (
    analyzedFiles: SourceFile[],
    baseOptions: FormattingOptions
): FormattingOptionsTokenImpact => {
    logger.debug('Calculating token impact...');
    const startTime = performance.now();

    const resolvedBaseOptions = baseOptions.preset
        ? { ...getFormattingOptionsForPreset(baseOptions.preset), ...baseOptions }
        : baseOptions;

    const baseScn = formatScn(analyzedFiles, resolvedBaseOptions);
    const baseTokens = countTokensInternal(baseScn);

    const impact: FormattingOptionsTokenImpact = {
        options: {},
        displayFilters: {},
    };

    const simpleOptionKeys: Array<keyof Omit<FormattingOptions, 'displayFilters'>> = [
        'showOutgoing', 'showIncoming', 'showIcons', 'showExportedIndicator',
        'showPrivateIndicator', 'showModifiers', 'showTags', 'showSymbolIds',
        'groupMembers', 'showFilePrefix', 'showFileIds'
    ];

    for (const key of simpleOptionKeys) {
        // All boolean options default to true.
        const currentValue = resolvedBaseOptions[key] ?? true;
        const newOptions = { ...resolvedBaseOptions, [key]: !currentValue };
        const newScn = formatScn(analyzedFiles, newOptions);
        const newTokens = countTokensInternal(newScn);
        impact.options[key] = newTokens - baseTokens;
    }

    const allSymbolKinds = new Set<SymbolKind>(analyzedFiles.flatMap(file => file.symbols.map(s => s.kind)));

    for (const kind of allSymbolKinds) {
        const currentFilterValue = resolvedBaseOptions.displayFilters?.[kind] ?? true;
        const newOptions = {
            ...resolvedBaseOptions,
            displayFilters: { ...(resolvedBaseOptions.displayFilters ?? {}), [kind]: !currentFilterValue }
        };
        const newScn = formatScn(analyzedFiles, newOptions);
        const newTokens = countTokensInternal(newScn);
        impact.displayFilters[kind] = newTokens - baseTokens;
    }

    const duration = performance.now() - startTime;
    logger.debug(`Token impact calculation finished in ${duration.toFixed(2)}ms`);

    return impact;
};

/**
 * Legacy API: Generate SCN from config (for backward compatibility)
 */
export const generateScnFromConfig = async (config: ScnTsConfig): Promise<string> => {
    const { sourceFiles: analyzedFiles } = await analyzeProject({
        files: config.files,
        tsconfig: config.tsconfig,
        root: config.root,
    });
    return formatScn(analyzedFiles, config.formattingOptions);
};

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
    const sourceFiles = files.map((file) => {
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

    logger.debug(`Created ${sourceFiles.length} SourceFile objects.`);
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