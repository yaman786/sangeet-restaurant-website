import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  await prisma.tables.upsert({
    where: { table_number: 'E2E-1' },
    update: { qr_code_url: `${baseUrl}/qr/E2E-1`, qr_code_data: 'E2E-1' },
    create: {
      table_number: 'E2E-1',
      qr_code_url: `${baseUrl}/qr/E2E-1`,
      qr_code_data: 'E2E-1'
    }
  });
  console.log('Created E2E test table');
}

main().catch(console.error).finally(() => prisma.$disconnect());
