import type { LogLevel } from 'scn-ts-core';

export interface LogEntry {
  level: Exclude<LogLevel, 'silent'>;
  message: string;
  timestamp: number;
}

export interface ProgressData {
  percentage: number;
  message: string;
}

export interface FormattingOptions {
  showOutgoing?: boolean;
  showIncoming?: boolean;
  showIcons?: boolean;
  showExportedIndicator?: boolean;
  showPrivateIndicator?: boolean;
  showModifiers?: boolean;
  showTags?: boolean;
  showSymbolIds?: boolean;
  groupMembers?: boolean;
  displayFilters?: Partial<Record<string, boolean>>;
  showFilePrefix?: boolean;
  showFileIds?: boolean;
}