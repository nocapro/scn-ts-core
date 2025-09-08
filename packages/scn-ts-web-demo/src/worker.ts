import * as Comlink from 'comlink';
import { initializeParser, analyzeProject, logger, calculateTokenImpact } from 'scn-ts-core';
import type { FileContent, LogLevel, SourceFile, FormattingOptions, FormattingOptionsTokenImpact } from 'scn-ts-core';
import type { LogEntry, ProgressData } from './types';

function sanitizeAnalysisResult(result: SourceFile[]): SourceFile[] {
  // Sanitize the result to make it structured-clonable for Comlink.
  result.forEach(file => {
    delete file.ast;
    if (file.language) {
      // The language object on the source file is a reference to a global
      // singleton. We must clone it before deleting non-serializable properties,
      // otherwise the parser state is destroyed for subsequent analysis runs.
      const sanitizedLanguage = { ...file.language };
      delete sanitizedLanguage.parser;
      delete sanitizedLanguage.loadedLanguage;
      file.language = sanitizedLanguage;
    }
  });
  return result;
}

// Define the API the worker will expose
function createWorkerApi() {
  let isInitialized = false;
  let abortController: AbortController | null = null;

  async function init() {
    if (isInitialized) return;
    await initializeParser({ wasmBaseUrl: '/wasm/' });
    isInitialized = true;
  }

  async function analyze(
    { filesInput, logLevel, formattingOptions, includePattern, excludePattern }: {
      filesInput: string;
      logLevel: LogLevel;
      formattingOptions: FormattingOptions;
      includePattern?: string;
      excludePattern?: string;
    },
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void
  ): Promise<{ result: SourceFile[], analysisTime: number, tokenImpact: FormattingOptionsTokenImpact }> {
    if (!isInitialized) {
      throw new Error('Worker not initialized.');
    }

    abortController = new AbortController();

    logger.setLogHandler((level, ...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      onLog({ level, message, timestamp: Date.now() });
    });
    logger.setLevel(logLevel);

    try {
      let files: FileContent[] = [];
      try {
        files = JSON.parse(filesInput);
        if (!Array.isArray(files)) throw new Error("Input is not an array.");
      } catch (error) {
        throw new Error(`Invalid JSON input: ${error instanceof Error ? error.message : String(error)}`);
      }

      const include = includePattern?.split('\n').filter(p => p.trim() !== '');
      const exclude = excludePattern?.split('\n').filter(p => p.trim() !== '');

      const { sourceFiles: analysisResult, analysisTime } = await analyzeProject({
        files,
        onProgress,
        logLevel,
        signal: abortController.signal,
        include,
        exclude,
      });

      const tokenImpact = calculateTokenImpact(analysisResult, formattingOptions);

      return { result: sanitizeAnalysisResult(analysisResult), analysisTime, tokenImpact };
    } finally {
      logger.setLogHandler(null);
      abortController = null;
    }
  }

  function cancel() {
    abortController?.abort();
  }
  
  return { init, analyze, cancel };
}

const workerApi = createWorkerApi();

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;