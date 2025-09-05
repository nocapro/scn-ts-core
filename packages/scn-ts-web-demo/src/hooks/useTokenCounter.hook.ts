import { useState, useEffect } from 'react';
import { Tiktoken } from "js-tiktoken/lite";
import cl100k_base from "js-tiktoken/ranks/cl100k_base";
import type { LogEntry } from '../types';

export function useTokenCounter(
  filesInput: string,
  scnOutput: string,
  onLog: (log: Pick<LogEntry, 'level' | 'message'>) => void
) {
  const [encoder, setEncoder] = useState<Tiktoken | null>(null);
  const [tokenCounts, setTokenCounts] = useState({ input: 0, output: 0 });

  useEffect(() => {
    try {
      const enc = new Tiktoken(cl100k_base);
      setEncoder(enc);
    } catch (e) {
      console.error("Failed to initialize tokenizer:", e);
      onLog({ level: 'error', message: 'Failed to initialize tokenizer.' });
    }
  }, [onLog]);

  useEffect(() => {
    if (!encoder) return;
    try {
      const inputTokens = encoder.encode(filesInput).length;
      const outputTokens = encoder.encode(scnOutput).length;
      setTokenCounts({ input: inputTokens, output: outputTokens });
    } catch (e) {
      console.error("Tokenization error:", e);
      setTokenCounts({ input: 0, output: 0 });
    }
  }, [filesInput, scnOutput, encoder]);

  return tokenCounts;
}
