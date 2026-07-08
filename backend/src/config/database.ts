import { Pool } from 'pg';
import config from './env';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: config.DATABASE_URL ?? undefined,
  // TODO: For strict security, use the Supabase/Render CA certificate instead of rejectUnauthorized: false.
  // rejectUnauthorized is set to false here to allow connection to managed databases that use self-signed certs or where the CA isn't in Node's default list.
  ssl: (config.isProd || (config.DATABASE_URL && config.DATABASE_URL.includes('supabase')))
    ? { rejectUnauthorized: false }
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.query('SELECT NOW()', (err: Error | null) => {
  if (err) {
    logger.error('Database connection error:', err.message);
  } else {
    logger.info('✅ Database connected successfully');
  }
});

export default pool;