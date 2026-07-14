export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { ValidationError, NotFoundError } from '@/lib/errors';
import { pusherServer } from '@/lib/services/pusherServer';

export async function POST(req: NextRequest) {
  try {
    const { tableNumber } = await req.json();

    if (!tableNumber) {
      throw new ValidationError('tableNumber is required');
    }

    const tableResult = await pool.query(
      'SELECT id, table_number FROM tables WHERE table_number = $1 AND is_active = true',
      [tableNumber]
    );

    if (tableResult.rows.length === 0) {
      throw new NotFoundError('Table');
    }

    await pusherServer.trigger('admin-channel', 'call-waiter', {
      type: 'call-waiter',
      tableNumber,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: `Waiter has been called to table ${tableNumber}` });
  } catch (error) {
    return handleApiError(error);
  }
}
