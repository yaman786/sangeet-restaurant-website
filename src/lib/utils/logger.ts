/**
 * Structured logging utility for Sangeet Restaurant API.
 *
 * In production only warnings and errors are emitted.
 * In development all levels (debug, info, warn, error) are printed.
 *
 * Usage:
 *   import logger from '../utils/logger';
 *   logger.info('Server started', { port: 5001 });
 *   logger.error('DB query failed', error);
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV !== 'production';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * Format a log line with a timestamp and level tag.
 * Keeps output human-readable in the log viewer.
 */
const formatArgs = (level: string, args: unknown[]): unknown[] => {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level}]`, ...args];
};

const logger: Logger = {
  /** Verbose debugging — silenced in production */
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...formatArgs('DEBUG', args));
  },

  /** General operational info — silenced in production */
  info: (...args: unknown[]) => {
    if (isDev) console.log(...formatArgs('INFO', args));
  },

  /** Warnings — always visible */
  warn: (...args: unknown[]) => {
    console.warn(...formatArgs('WARN', args));
  },

  /** Errors — always visible */
  error: (...args: unknown[]) => {
    console.error(...formatArgs('ERROR', args));
  },
};

export default logger;
