import { prisma } from '../src/lib/db';
import analyticsService from '../src/lib/services/analyticsService';

async function run() {
  const result = await analyticsService.getReservationTrends('month');
  console.log('Reservation trends result:', JSON.stringify(result, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
