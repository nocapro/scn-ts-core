import { useState, useEffect, useCallback, useRef } from 'react';
import * as Comlink from 'comlink';
import type { Remote } from 'comlink';
import type { SourceFile } from 'scn-ts-core';
import type { LogEntry, ProgressData } from '../types';
import type { WorkerApi } from '../worker';

export function useAnalysis() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SourceFile[] | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysisTime, setAnalysisTime] = useState<number | null>(null);
  const workerRef = useRef<Remote<WorkerApi> | null>(null);

  const onLog = useCallback((log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const onLogPartial = useCallback((log: Pick<LogEntry, 'level' | 'message'>) => {
    onLog({ ...log, timestamp: Date.now() });
  }, [onLog]);

  useEffect(() => {
    const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });
    const wrappedWorker = Comlink.wrap<WorkerApi>(worker);
    workerRef.current = wrappedWorker;

    const initializeWorker = async () => {
      try {
        await wrappedWorker.init();
        setIsInitialized(true);
        onLogPartial({ level: 'info', message: 'Analysis worker ready.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        onLogPartial({ level: 'error', message: `Worker failed to initialize: ${message}` });
      }
    };

    initializeWorker();

    return () => {
      wrappedWorker[Comlink.releaseProxy]();
      worker.terminate();
    };
  }, [onLogPartial]);

  const resetAnalysisState = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisTime(null);
    setProgress(null);
    setLogs([]);
  }, []);

  const handleAnalyze = useCallback(async (filesInput: string) => {
    if (!isInitialized || !workerRef.current) {
      onLogPartial({ level: 'warn', message: 'Analysis worker not ready.' });
      return;
    }
    
    if (isLoading) {
      return; // Prevent multiple concurrent analyses
    }
    
    setIsLoading(true);
    resetAnalysisState();
    
    try {
      const { result, analysisTime } = await workerRef.current.analyze(
        { filesInput, logLevel: 'debug' },
        Comlink.proxy(setProgress),
        Comlink.proxy(onLog)
      );
      setAnalysisResult(result);
      setAnalysisTime(analysisTime);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if ((error as Error).name === 'AbortError') {
        onLogPartial({ level: 'warn', message: 'Analysis canceled by user.' });
      } else {
        onLogPartial({ level: 'error', message: `Analysis error: ${message}` });
      }
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  }, [isInitialized, isLoading, resetAnalysisState, onLog, onLogPartial]);

  const handleStop = useCallback(() => {
    if (isLoading && workerRef.current) {
      workerRef.current.cancel();
    }
  }, [isLoading]);

  return {
    isInitialized,
    isLoading,
    analysisResult,
    progress,
    logs,
    analysisTime,
    handleAnalyze,
    handleStop,
    onLogPartial,
  };
}