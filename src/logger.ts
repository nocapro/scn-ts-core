import type { LogLevel } from './types';

export type LogHandler = (level: Exclude<LogLevel, 'silent'>, ...args: any[]) => void;

class Logger {
  private handler: LogHandler | null = null;
  private level: LogLevel = 'info';

  private logLevels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    silent: -1,
  };

  setLogHandler(handler: LogHandler | null) {
    this.handler = handler;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: Exclude<LogLevel, 'silent'>): boolean {
    if (this.level === 'silent' || !this.handler) return false;
    return this.logLevels[level] <= this.logLevels[this.level];
  }

  error(...args: any[]) {
    if (this.shouldLog('error')) {
      this.handler!('error', ...args);
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      this.handler!('warn', ...args);
    }
  }

  info(...args: any[]) {
    if (this.shouldLog('info')) {
      this.handler!('info', ...args);
    }
  }

  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      this.handler!('debug', ...args);
    }
  }
}

export const logger = new Logger();