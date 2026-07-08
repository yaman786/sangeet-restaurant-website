import { Pool, PoolConfig } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _dbPool: Pool | undefined;
}

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')))
    ? { rejectUnauthorized: false }
    : false,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// In Next.js dev mode, cache the pool in global object to avoid exhausting connections on hot reloads
const pool = globalThis._dbPool || new Pool(config);

if (process.env.NODE_ENV !== 'production') {
  globalThis._dbPool = pool;
}

// Test database connection on initialization
pool.query('SELECT NOW()', (err: Error | null) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully (Next.js serverless)');
  }
});

export default pool;
