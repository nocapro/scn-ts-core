import * as Comlink from 'comlink';
import { initializeParser, analyzeProject, logger } from 'scn-ts-core';
import type { FileContent, LogLevel, SourceFile } from 'scn-ts-core';
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
const workerApi = {
  isInitialized: false,
  abortController: null as AbortController | null,

  async init() {
    if (this.isInitialized) return;
    await initializeParser({ wasmBaseUrl: '/wasm/' });
    this.isInitialized = true;
  },

  async analyze(
    { filesInput, logLevel }: { filesInput: string; logLevel: LogLevel },
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void
  ): Promise<{ result: SourceFile[], analysisTime: number }> {
    if (!this.isInitialized) {
      throw new Error('Worker not initialized.');
    }

    this.abortController = new AbortController();

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

      const { sourceFiles: analysisResult, analysisTime } = await analyzeProject({
        files,
        onProgress,
        logLevel,
        signal: this.abortController.signal,
      });

      return { result: sanitizeAnalysisResult(analysisResult), analysisTime };
    } finally {
      logger.setLogHandler(null);
      this.abortController = null;
    }
  },

  cancel() {
    this.abortController?.abort();
  },
};

Comlink.expose(workerApi);

export type WorkerApi = typeof workerApi;