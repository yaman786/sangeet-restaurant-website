/**
 * Structured logging utility for Sangeet Restaurant API.
 *
 * In production only warnings and errors are emitted.
 * In development all levels (debug, info, warn, error) are printed.
 *
 * Usage:
 *   const logger = require('../utils/logger');
 *   logger.info('Server started', { port: 5001 });
 *   logger.error('DB query failed', error);
 */

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV !== 'production';

/**
 * Format a log line with a timestamp and level tag.
 * Keeps output human-readable in the Render log viewer.
 */
const formatArgs = (level, args) => {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level}]`, ...args];
};

const logger = {
  /** Verbose debugging — silenced in production */
  debug: (...args) => {
    if (isDev) console.debug(...formatArgs('DEBUG', args));
  },

  /** General operational info — silenced in production */
  info: (...args) => {
    if (isDev) console.log(...formatArgs('INFO', args));
  },

  /** Warnings — always visible */
  warn: (...args) => {
    console.warn(...formatArgs('WARN', args));
  },

  /** Errors — always visible */
  error: (...args) => {
    console.error(...formatArgs('ERROR', args));
  },
};

module.exports = logger;
