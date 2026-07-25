import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pusherServer } from '@/lib/services/pusherServer';

export async function GET(request: Request) {
  // 1. Authenticate the Cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // --- 1. Sweep Unacknowledged Pending Orders (Older than 30 mins) ---
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
    
    // Get them first to trigger pusher events
    const ignoredOrders = await prisma.orders.findMany({
      where: {
        status: 'pending',
        created_at: { lt: thirtyMinsAgo },
        is_archived: false
      },
      select: { id: true }
    });
    
    const ignoredOrderIds = ignoredOrders.map(o => o.id);
    
    let cancelledOrdersCount = 0;
    if (ignoredOrderIds.length > 0) {
      const updateResult = await prisma.orders.updateMany({
        where: { id: { in: ignoredOrderIds } },
        data: { 
          status: 'cancelled',
          updated_at: new Date()
        }
      });
      cancelledOrdersCount = updateResult.count;
      
      // Trigger pusher events so kitchen/admin UIs update in real-time
      for (const id of ignoredOrderIds) {
        await pusherServer.trigger('admin-channel', 'order-status-update', {
          orderId: id,
          status: 'cancelled'
        });
        await pusherServer.trigger('kitchen-channel', 'order-status-update', {
          orderId: id,
          status: 'cancelled'
        });
      }
    }

    // --- 2. Sweep No-Show Reservations (More than 45 mins late) ---
    const activeReservations = await prisma.reservations.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
        is_archived: false
      }
    });

    const fortyFiveMinsAgo = new Date(now.getTime() - 45 * 60000);
    const noShowIds: number[] = [];

    for (const res of activeReservations) {
      if (!res.date || !res.time) continue;
      
      const dateStr = new Date(res.date).toISOString().split('T')[0];
      const timeObj = new Date(res.time);
      const hours = String(timeObj.getUTCHours()).padStart(2, '0');
      const mins = String(timeObj.getUTCMinutes()).padStart(2, '0');
      
      const scheduledAt = new Date(`${dateStr}T${hours}:${mins}:00.000Z`);

      // If scheduled time is older than 45 mins ago, mark as no-show
      if (scheduledAt < fortyFiveMinsAgo) {
        noShowIds.push(res.id);
      }
    }

    let noShowReservationsCount = 0;
    if (noShowIds.length > 0) {
      const updateResResult = await prisma.reservations.updateMany({
        where: { id: { in: noShowIds } },
        data: {
          status: 'no-show',
          updated_at: new Date()
        }
      });
      noShowReservationsCount = updateResResult.count;
      
      // Trigger pusher events for real-time UI updates
      for (const id of noShowIds) {
        await pusherServer.trigger('admin-channel', 'reservation-status-update', {
          id: id,
          status: 'no-show'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Real-time sweep completed.',
      cancelled_orders: cancelledOrdersCount,
      no_show_reservations: noShowReservationsCount
    });
  } catch (error) {
    console.error('Realtime Sweep Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
