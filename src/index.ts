export {
    initializeParser,
    generateScn,
    generateScnFromConfig,
    analyzeProject,
    logger,
    ICONS,
    SCN_SYMBOLS
} from './main';

export type {
    ParserInitOptions,
    SourceFile,
    LogLevel,
    InputFile,
    TsConfig,
    ScnTsConfig,
    AnalyzeProjectOptions,
    LogHandler,
    FormattingOptions,
    FileContent
} from './main';