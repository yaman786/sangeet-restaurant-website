import { prisma } from '../src/lib/db';

async function testSweep() {
  const now = new Date();
  const fortyFiveMinsAgo = new Date(now.getTime() - 45 * 60000);

  const activeReservations = await prisma.reservations.findMany({
    where: {
      status: { in: ['pending', 'confirmed'] },
      is_archived: false
    }
  });

  console.log(`Found ${activeReservations.length} pending/confirmed active reservations:`);

  const noShowIds: number[] = [];

  for (const res of activeReservations) {
    const resDate = new Date(res.date);
    const resTime = new Date(res.time);

    // Precise ISO Date string construction (YYYY-MM-DD)
    const dateStr = resDate.toISOString().split('T')[0];
    const hours = String(resTime.getUTCHours()).padStart(2, '0');
    const mins = String(resTime.getUTCMinutes()).padStart(2, '0');
    
    // Construct full ISO datetime string
    const scheduledAt = new Date(`${dateStr}T${hours}:${mins}:00.000Z`);

    console.log(`Res #${res.id} (${res.customer_name}) - Scheduled: ${scheduledAt.toISOString()} | Status: ${res.status}`);

    if (scheduledAt < fortyFiveMinsAgo) {
      noShowIds.push(res.id);
    }
  }

  console.log(`\nIdentified ${noShowIds.length} overdue reservations to mark as 'no-show':`, noShowIds);
}

testSweep().catch(console.error).finally(() => prisma.$disconnect());
