import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { LogEntry } from '../types';
import { levelColorMap } from '../constants';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import type { LogLevel } from 'scn-ts-core';

const LOG_LEVELS: Exclude<LogLevel, 'silent'>[] = ['error', 'warn', 'info', 'debug'];

const LogViewer: React.FC<{ logs: readonly LogEntry[] }> = ({ logs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [visibleLevels, setVisibleLevels] = useState<Set<Exclude<LogLevel, 'silent'>>>(
    new Set(LOG_LEVELS),
  );

  const handleCopy = useCallback(() => {
    const logsToCopy = logs.filter(log => visibleLevels.has(log.level));
    if (logsToCopy.length > 0) {
      const logText = logsToCopy
        .map(
          log =>
            `${new Date(log.timestamp).toLocaleTimeString()} [${log.level.toUpperCase()}] ${log.message}`,
        )
        .join('\n');
      navigator.clipboard.writeText(logText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [logs, visibleLevels]);

  const toggleLevel = (level: Exclude<LogLevel, 'silent'>) => {
    setVisibleLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const filteredLogs = logs.filter(log => visibleLevels.has(log.level));

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2 pb-2 border-b mb-2 flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Show levels:</span>
        {LOG_LEVELS.map(level => (
          <Button
            key={level}
            variant={visibleLevels.has(level) ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-6 px-2 text-xs capitalize',
              !visibleLevels.has(level) && 'opacity-50',
              levelColorMap[level],
            )}
            onClick={() => toggleLevel(level)}
          >
            {level}
          </Button>
        ))}
      </div>
      <div className="relative">
        <div ref={scrollContainerRef} className="font-mono text-xs pr-10">
          {filteredLogs.length === 0 && (
            <p className="text-muted-foreground">
              {logs.length === 0 ? 'No logs yet. Click "Analyze" to start.' : 'No logs match the current filter.'}
            </p>
          )}
          {filteredLogs.map((log, index) => (
            <div key={index} className="flex items-start">
              <span className="text-muted-foreground/80 mr-4 flex-shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={cn('font-bold w-14 flex-shrink-0', levelColorMap[log.level])}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="whitespace-pre-wrap break-all text-foreground">{log.message}</span>
            </div>
          ))}
        </div>
        {logs.length > 0 && (
          <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8" onClick={handleCopy} title="Copy logs to clipboard">
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
