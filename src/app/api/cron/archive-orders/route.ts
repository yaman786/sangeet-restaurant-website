import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  // 1. Authenticate the Cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rule1Result = await prisma.orders.updateMany({
      where: {
        status: { in: ['completed', 'served', 'cancelled'] },
        is_archived: false
      },
      data: { is_archived: true }
    });

    const rule2Result = await prisma.reservations.updateMany({
      where: {
        status: { in: ['completed', 'cancelled'] },
        is_archived: false
      },
      data: { is_archived: true }
    });

    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    const rule3Result = await prisma.orders.updateMany({
      where: {
        status: { in: ['pending', 'confirmed', 'preparing', 'ready'] },
        created_at: { lt: twelveHoursAgo },
        is_archived: false
      },
      data: { 
        status: 'cancelled',
        is_archived: true,
        updated_at: new Date()
      }
    });

    // Rule 4: Sweep overdue unseated pending/confirmed reservations to 'no-show'
    const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60000);
    const activeReservations = await prisma.reservations.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        is_archived: false
      }
    });

    const noShowIds: number[] = [];
    for (const res of activeReservations) {
      if (!res.date || !res.time) continue;
      const dateStr = new Date(res.date).toISOString().split('T')[0];
      const timeObj = new Date(res.time);
      const hours = String(timeObj.getUTCHours()).padStart(2, '0');
      const mins = String(timeObj.getUTCMinutes()).padStart(2, '0');
      const scheduledAt = new Date(`${dateStr}T${hours}:${mins}:00.000Z`);

      if (scheduledAt < fortyFiveMinsAgo) {
        noShowIds.push(res.id);
      }
    }

    let sweptReservationsCount = 0;
    if (noShowIds.length > 0) {
      const rule4Result = await prisma.reservations.updateMany({
        where: { id: { in: noShowIds } },
        data: {
          status: 'no-show',
          is_archived: true,
          updated_at: new Date()
        }
      });
      sweptReservationsCount = rule4Result.count;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'End of day sweep completed successfully.',
      archived_completed_orders: rule1Result.count,
      archived_completed_reservations: rule2Result.count,
      swept_abandoned_orders: rule3Result.count,
      swept_no_show_reservations: sweptReservationsCount
    });
  } catch (error) {
    console.error('Cron Archive Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
