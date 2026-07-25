import { prisma } from '../src/lib/db';

async function check() {
  const count = await prisma.reservations.count();
  console.log('Total Reservations Count:', count);
  const sample = await prisma.reservations.findMany({ take: 10, orderBy: { created_at: 'desc' } });
  console.log('Sample Reservations:', sample);
}

check().catch(console.error).finally(() => prisma.$disconnect());
