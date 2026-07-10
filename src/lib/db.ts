import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

export const prisma = globalThis._prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma;
}

export default pool;
