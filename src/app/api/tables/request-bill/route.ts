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

    const { tableNumber } = await req.json();

    if (!tableNumber) {
      throw new ValidationError('tableNumber is required');
    }

    const table = await prisma.tables.findFirst({
      where: { table_number: tableNumber, is_active: true }
    });

    if (!table) {
      throw new NotFoundError('Table');
    }

    await pusherServer.trigger('admin-channel', 'request-bill', {
      type: 'request-bill',
      tableNumber,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: `Bill requested for table ${tableNumber}` });
  } catch (error) {
    return handleApiError(error);
  }
}
