import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pusherServer } from '@/lib/services/pusherServer';
import reservationService from '@/lib/services/reservationService';
import { handleApiError, UnauthorizedError } from '@/lib/errors';

export async function GET(request: Request) {
  // 1. Authenticate the Cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  try {
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      throw new UnauthorizedError('Unauthorized cron access');
    }
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

    // --- 2. Sweep No-Show Reservations (More than 45 mins late) via shared On-Demand Service ---
    const noShowReservationsCount = await reservationService.sweepOverdueReservations();

    return NextResponse.json({ 
      success: true, 
      message: 'Real-time sweep completed.',
      cancelled_orders: cancelledOrdersCount,
      no_show_reservations: noShowReservationsCount
    });
  } catch (error) {
    console.error('Realtime Sweep Error:', error);
    return handleApiError(error);
  }
}
