/**
 * Centralised environment configuration for the Sangeet Restaurant API.
 *
 * Every backend module that needs an env var should import from here
 * instead of reading process.env directly. This makes it trivial to
 * see which vars the app depends on, and it validates them at startup.
 *
 * Usage:
 *   const config = require('../config/env');
 *   console.log(config.PORT); // 5001
 */

require('dotenv').config();

const config = {
  // ── Server ───────────────────────────────────────────────
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5001,
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
  isProd: (process.env.NODE_ENV || 'development') === 'production',

  // ── Database ─────────────────────────────────────────────
  DATABASE_URL: process.env.DATABASE_URL || null,
  DB_HOST: process.env.DB_HOST || null,
  DB_USER: process.env.DB_USER || null,
  DB_PASSWORD: process.env.DB_PASSWORD || null,
  DB_NAME: process.env.DB_NAME || null,

  // ── Auth ─────────────────────────────────────────────────
  JWT_SECRET: process.env.JWT_SECRET || (
    (process.env.NODE_ENV || 'development') === 'development'
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
  EMAIL_USER: process.env.EMAIL_USER || 'ranayaman66@gmail.com',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',

  // ── External URLs ───────────────────────────────────────
  RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL || 'https://sangeet-restaurant-api.onrender.com',

  // ── Self-ping (Render free tier keep-alive) ─────────────
  SELF_PING_INTERVAL_MS: 4 * 60 * 1000, // 4 minutes
};

/**
 * Validate that critical environment variables are present.
 * Call once at startup — aborts the process on failure in production.
 */
const validateConfig = () => {
  const logger = require('../utils/logger');
  const errors = [];

  // Database
  const hasDbUrl = !!config.DATABASE_URL;
  const hasIndividualDbVars = config.DB_HOST && config.DB_USER && config.DB_PASSWORD && config.DB_NAME;
  if (!hasDbUrl && !hasIndividualDbVars) {
    errors.push('Missing database configuration: provide DATABASE_URL or DB_HOST + DB_USER + DB_PASSWORD + DB_NAME');
  }

  // JWT
  if (!config.JWT_SECRET) {
    errors.push('Missing required environment variable: JWT_SECRET');
  } else if (config.JWT_SECRET.length < 32) {
    logger.warn('JWT_SECRET should be at least 32 characters long for security.');
  }

  if (errors.length > 0) {
    errors.forEach(e => logger.error(e));
    if (config.isProd) {
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
};

module.exports = { ...config, validateConfig };
