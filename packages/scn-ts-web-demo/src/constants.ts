import type { LogLevel } from 'scn-ts-core';

export const levelColorMap: Record<Exclude<LogLevel, 'silent'>, string> = {
  error: 'text-red-500',
  warn: 'text-yellow-500',
  info: 'text-blue-400',
  debug: 'text-gray-500',
};