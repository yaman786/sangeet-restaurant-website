/**
 * Centralised environment configuration for the Sangeet Restaurant API.
 *
 * Every backend module that needs an env var should import from here
 * instead of reading process.env directly. This makes it trivial to
 * see which vars the app depends on, and it validates them at startup.
 *
 * Usage:
 *   import config from '../config/env';
 *   console.log(config.PORT); // 5001
 */

import 'dotenv/config';
import logger from '../utils/logger';

export interface Config {
  // Server
  NODE_ENV: string;
  PORT: number;
  isDev: boolean;
  isProd: boolean;
  // Database
  DATABASE_URL: string | null;
  DB_HOST: string | null;
  DB_USER: string | null;
  DB_PASSWORD: string | null;
  DB_NAME: string | null;
  // Auth
  JWT_SECRET: string | null;
  // CORS / Client
  CLIENT_URL: string;
  FRONTEND_URL: string;
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  // Body Parsing
  BODY_LIMIT: string;
  // Email
  EMAIL_USER: string | undefined;
  BREVO_API_KEY: string;
  // External URLs
  RENDER_EXTERNAL_URL: string;
  // CORS Configuration
  ALLOWED_ORIGINS: (string | RegExp)[];
  // Self-ping
  SELF_PING_INTERVAL_MS: number;
  // Functions
  validateConfig: () => void;
}

const nodeEnv = process.env.NODE_ENV || 'development';

const config: Config = {
  // ── Server ───────────────────────────────────────────────
  NODE_ENV: nodeEnv,
  PORT: parseInt(process.env.PORT || '5001', 10),
  isDev: nodeEnv !== 'production',
  isProd: nodeEnv === 'production',

  // ── Database ─────────────────────────────────────────────
  DATABASE_URL: process.env.DATABASE_URL || null,
  DB_HOST: process.env.DB_HOST || null,
  DB_USER: process.env.DB_USER || null,
  DB_PASSWORD: process.env.DB_PASSWORD || null,
  DB_NAME: process.env.DB_NAME || null,

  // ── Auth ─────────────────────────────────────────────────
  JWT_SECRET: process.env.JWT_SECRET || (
    nodeEnv === 'development'
      ? 'sangeet-restaurant-secret-key'
      : null
  ),

  // ── CORS / Client ───────────────────────────────────────
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000',

  // ── Rate Limiting ───────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 300,

  // ── Body Parsing ────────────────────────────────────────
  BODY_LIMIT: '10mb',

  // ── Email (Brevo) ───────────────────────────────────────
  EMAIL_USER: process.env.EMAIL_USER,
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',

  // ── External URLs ───────────────────────────────────────
  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'https://sangeet-restaurant-api.onrender.com',

  // ── CORS Configuration ──────────────────────────────────
  ALLOWED_ORIGINS: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://localhost:3000',

    'https://frontend-six-xi-10.vercel.app',

    /https:\/\/.*\.onrender\.com$/,
    /https:\/\/.*\.vercel\.app$/,

  ],

  // ── Self-ping (Render free tier keep-alive) ─────────────
  SELF_PING_INTERVAL_MS: 4 * 60 * 1000, // 4 minutes

  /**
   * Validate that critical environment variables are present.
   * Call once at startup — aborts the process on failure in production.
   */
  validateConfig(): void {
    const errors: string[] = [];

    // Database
    const hasDbUrl = !!config.DATABASE_URL;
    const hasIndividualDbVars = !!(config.DB_HOST && config.DB_USER && config.DB_PASSWORD && config.DB_NAME);
    if (!hasDbUrl && !hasIndividualDbVars) {
      errors.push('Missing database configuration: provide DATABASE_URL or DB_HOST + DB_USER + DB_PASSWORD + DB_NAME');
    }

    // JWT
    const KNOWN_WEAK_SECRETS = ['sangeet-restaurant-secret-key', 'your-super-secret-jwt-key-change-this-in-production'];
    if (!config.JWT_SECRET) {
      errors.push('Missing required environment variable: JWT_SECRET');
    } else if (config.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long for security.');
    } else if (KNOWN_WEAK_SECRETS.includes(config.JWT_SECRET)) {
      errors.push('JWT_SECRET is a known default value — set a real secret');
    }

    if (!config.EMAIL_USER) {
      logger.warn('EMAIL_USER is not set. Email notifications will not work.');
    }

    if (errors.length > 0) {
      errors.forEach(e => logger.error(e));
      if (config.isProd || errors.some(e => e.includes('JWT_SECRET'))) {
        process.exit(1);
      }
    }

    // Informational
    if (hasDbUrl) {
      logger.info('Using DATABASE_URL for database connection');
    } else if (hasIndividualDbVars) {
      logger.info('Using individual database variables');
    }

    logger.info('Environment validation passed');
  },
};

export default config;
