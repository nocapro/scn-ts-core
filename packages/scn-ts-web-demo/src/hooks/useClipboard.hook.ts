import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
      });
    }
  }, [timeout]);

  return { isCopied, handleCopy };
}