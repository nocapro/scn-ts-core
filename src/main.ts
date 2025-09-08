import { initializeParser as init } from './parser';
import type { ParserInitOptions, SourceFile, InputFile, ScnTsConfig, AnalyzeProjectOptions, FormattingOptions, FormattingOptionsTokenImpact, SymbolKind } from './types';
import { formatScn } from './formatter';
import { logger } from './logger';
import { initializeTokenizer as initTokenizer, countTokens as countTokensInternal } from './tokenizer';
import { getFormattingOptionsForPreset, calculateTokenImpact } from './options';
import { analyzeProject } from './project-analyzer';

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
export { analyzeProject, getFormattingOptionsForPreset, calculateTokenImpact };

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