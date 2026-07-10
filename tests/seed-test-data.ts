import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.tables.upsert({
    where: { table_number: 'E2E-1' },
    update: { qr_code_url: 'http://localhost:3000/qr/E2E-1', qr_code_data: 'E2E-1' },
    create: {
      table_number: 'E2E-1',
      qr_code_url: 'http://localhost:3000/qr/E2E-1',
      qr_code_data: 'E2E-1'
    }
  });
  console.log('Created E2E test table');
}

main().catch(console.error).finally(() => prisma.$disconnect());
