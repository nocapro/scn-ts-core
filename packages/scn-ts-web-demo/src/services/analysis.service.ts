import * as Comlink from 'comlink';
import type { WorkerApi } from '../worker';
import type { LogEntry, ProgressData } from '../types';
import type { LogLevel, SourceFile } from 'scn-ts-core';

export type AnalysisServiceAPI = {
  init: () => Promise<void>;
  analyze: (
    filesInput: string,
    logLevel: LogLevel,
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void,
  ) => Promise<{ result: SourceFile[]; analysisTime: number }>;
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
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void,
  ): Promise<{ result: SourceFile[]; analysisTime: number }> => {
    return workerApi.analyze({ filesInput, logLevel }, Comlink.proxy(onProgress), Comlink.proxy(onLog));
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
