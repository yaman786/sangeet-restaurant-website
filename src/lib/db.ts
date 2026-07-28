import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

declare global {
   
  var _prisma: PrismaClient | undefined;
   
  var _pool: Pool | undefined;
}

const pool = globalThis._pool || new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

export const prisma = globalThis._prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma;
  globalThis._pool = pool;
}

