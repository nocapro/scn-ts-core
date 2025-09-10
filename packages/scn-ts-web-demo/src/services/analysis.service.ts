import * as Comlink from 'comlink';
import type { WorkerApi } from '../worker';
import type { LogEntry, ProgressData } from '../types';
import type { LogLevel, SourceFile, FormattingOptions, FormattingOptionsTokenImpact } from 'scn-ts-core';

export type AnalysisServiceAPI = {
  init: () => Promise<void>;
  analyze: (
    filesInput: string,
    logLevel: LogLevel,
    formattingOptions: FormattingOptions,
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void,
    includePattern?: string,
    excludePattern?: string,
  ) => Promise<{ result: SourceFile[]; analysisTime: number, tokenImpact: FormattingOptionsTokenImpact }>;
  cancel: () => Promise<void>;
  cleanup: () => void;
};

export function createAnalysisService(): AnalysisServiceAPI {
  const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
  const workerApi = Comlink.wrap<WorkerApi>(worker);

  const init = async (): Promise<void> => {
    return workerApi.init();
  };

  const analyze = async (
    filesInput: string,
    logLevel: LogLevel,
    formattingOptions: FormattingOptions,
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void,
    includePattern?: string,
    excludePattern?: string,
  ): Promise<{ result: SourceFile[]; analysisTime: number, tokenImpact: FormattingOptionsTokenImpact }> => {
    return workerApi.analyze({ filesInput, logLevel, formattingOptions, includePattern, excludePattern }, Comlink.proxy(onProgress), Comlink.proxy(onLog));
  };

  const cancel = async (): Promise<void> => {
    return workerApi.cancel();
  };

  const cleanup = (): void => {
    workerApi[Comlink.releaseProxy]();
    worker.terminate();
  };

  return {
    init,
    analyze,
    cancel,
    cleanup,
  };
}
