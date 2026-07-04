const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: (config.isProd || (config.DATABASE_URL && config.DATABASE_URL.includes('supabase'))) 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection error:', err.message);
  } else {
    logger.info('✅ Database connected successfully');
  }
});

module.exports = pool;