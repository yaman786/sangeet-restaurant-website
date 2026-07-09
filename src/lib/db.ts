import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

export const prisma = globalThis._prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
console.log("DB URL in db.ts is:", process.env.DATABASE_URL ? "defined" : "undefined");

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma;
}
