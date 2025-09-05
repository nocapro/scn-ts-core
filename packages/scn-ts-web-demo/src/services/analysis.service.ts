import * as Comlink from 'comlink';
import type { Remote } from 'comlink';
import type { WorkerApi } from '../worker';
import type { LogEntry, ProgressData } from '../types';
import type { LogLevel, SourceFile } from 'scn-ts-core';

export class AnalysisService {
  private worker: Worker;
  private workerApi: Remote<WorkerApi>;

  constructor() {
    this.worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
    this.workerApi = Comlink.wrap<WorkerApi>(this.worker);
  }

  async init(): Promise<void> {
    return this.workerApi.init();
  }

  async analyze(
    filesInput: string,
    logLevel: LogLevel,
    onProgress: (progress: ProgressData) => void,
    onLog: (log: LogEntry) => void
  ): Promise<{ result: SourceFile[], analysisTime: number }> {
    return this.workerApi.analyze(
      { filesInput, logLevel },
      Comlink.proxy(onProgress),
      Comlink.proxy(onLog)
    );
  }

  cancel(): Promise<void> {
    return this.workerApi.cancel();
  }

  cleanup(): void {
    this.workerApi[Comlink.releaseProxy]();
    this.worker.terminate();
  }
}