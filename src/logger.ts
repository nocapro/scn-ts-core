import type { LogLevel, LogHandler } from './types';

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
    if (this.level === 'silent') return false;
    return this.logLevels[level] <= this.logLevels[this.level];
  }

  private log(level: Exclude<LogLevel, 'silent'>, ...args: any[]) {
    if (this.shouldLog(level)) {
      if (this.handler) {
        this.handler(level, ...args);
      } else {
        const consoleMethod = console[level] || console.log;
        consoleMethod(`[scn-ts-core:${level}]`, ...args);
      }
    }
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }
}

export const logger = new Logger();