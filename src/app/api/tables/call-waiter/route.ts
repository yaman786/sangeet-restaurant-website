export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { pusherServer } from '@/lib/services/pusherServer';
import { checkRateLimit } from '@/lib/utils/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'table-action');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const tableNumber = body.tableNumber || body.table_number;

    if (!tableNumber) {
      throw new ValidationError('tableNumber is required');
    }

    const table = await prisma.tables.findFirst({
      where: { table_number: String(tableNumber), is_active: true }
    });

    if (!table) {
      throw new NotFoundError('Table');
    }

    try {
      await pusherServer.trigger('admin-channel', 'call-waiter', {
        type: 'call-waiter',
        tableNumber: String(tableNumber),
        reason: body.reason || 'Customer requested assistance',
        timestamp: new Date().toISOString()
      });
    } catch (pushErr) {
      console.warn('Pusher notification for call-waiter failed (non-blocking):', pushErr);
    }

    return NextResponse.json({ success: true, message: `Waiter has been called to table ${tableNumber}` });
  } catch (error) {
    return handleApiError(error);
  }
}
