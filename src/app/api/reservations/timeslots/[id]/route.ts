import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { AppError } from '@/lib/errors';
import { authenticateToken } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateToken(req);
    if (auth.errorResponse || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const result = await reservationService.updateTimeSlot(params.id, data);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authenticateToken(req);
    if (auth.errorResponse || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await reservationService.deleteTimeSlot(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
