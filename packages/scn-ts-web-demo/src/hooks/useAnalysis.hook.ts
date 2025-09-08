import { useState, useEffect, useCallback, useRef } from 'react';
import type { SourceFile, FormattingOptions, FormattingOptionsTokenImpact } from 'scn-ts-core';
import type { LogEntry, ProgressData } from '../types';
import { createAnalysisService, type AnalysisServiceAPI } from '../services/analysis.service';

export function useAnalysis() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SourceFile[] | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analysisTime, setAnalysisTime] = useState<number | null>(null);
  const [tokenImpact, setTokenImpact] = useState<FormattingOptionsTokenImpact | null>(null);
  const serviceRef = useRef<AnalysisServiceAPI | null>(null);

  const onLog = useCallback((log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const onLogPartial = useCallback((log: Pick<LogEntry, 'level' | 'message'>) => {
    onLog({ ...log, timestamp: Date.now() });
  }, [onLog]);

  useEffect(() => {
    const service = createAnalysisService();
    serviceRef.current = service;

    const initializeWorker = async () => {
      try {
        await service.init();
        setIsInitialized(true);
        onLogPartial({ level: 'info', message: 'Analysis worker ready.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        onLogPartial({ level: 'error', message: `Worker failed to initialize: ${message}` });
      }
    };

    initializeWorker();

    return () => {
      service.cleanup();
      serviceRef.current = null;
    };
  }, [onLogPartial]);

  const resetAnalysisState = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisTime(null);
    setProgress(null);
    setTokenImpact(null);
    setLogs([]);
  }, []);

  const handleAnalyze = useCallback(async (
    filesInput: string,
    formattingOptions: FormattingOptions,
    includePattern: string,
    excludePattern: string,
  ) => {
    if (!isInitialized || !serviceRef.current) {
      onLogPartial({ level: 'warn', message: 'Analysis worker not ready.' });
      return;
    }
    
    if (isLoading) {
      return; // Prevent multiple concurrent analyses
    }
    
    setIsLoading(true);
    resetAnalysisState();
    
    try {
      const { result, analysisTime, tokenImpact } = await serviceRef.current.analyze(
        filesInput,
        'debug',
        formattingOptions,
        setProgress,
        onLog,
        includePattern,
        excludePattern,
      );
      setAnalysisResult(result);
      setAnalysisTime(analysisTime);
      setTokenImpact(tokenImpact);
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
    if (isLoading && serviceRef.current) {
      serviceRef.current.cancel();
    }
  }, [isLoading]);

  return {
    isInitialized,
    isLoading,
    analysisResult,
    progress,
    logs,
    analysisTime,
    tokenImpact,
    handleAnalyze,
    handleStop,
    onLogPartial,
  };
}