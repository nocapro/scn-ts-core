export {
    initializeParser,
    analyzeProject,
    generateScn,
    generateScnFromConfig,
    logger,
} from './src/main';

export type {
    ParserInitOptions,
    SourceFile,
    LogLevel,
    LogHandler,
    FileContent,
} from './src/main';

export type {
    ScnTsConfig,
    InputFile,
} from './src/types'