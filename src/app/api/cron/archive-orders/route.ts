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

    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

    const rule2Result = await prisma.orders.updateMany({
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

    return NextResponse.json({ 
      success: true, 
      message: 'End of day sweep completed successfully.',
      archived_completed_orders: rule1Result.count,
      swept_ghost_orders: rule2Result.count
    });
  } catch (error) {
    console.error('Cron Archive Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
