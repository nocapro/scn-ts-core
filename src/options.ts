import type { FormattingOptions, FormattingPreset, FormattingOptionsTokenImpact, SourceFile, SymbolKind } from './types';
import { formatScn } from './formatter';
import { countTokens as countTokensInternal } from './tokenizer';
import { logger } from './logger';

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