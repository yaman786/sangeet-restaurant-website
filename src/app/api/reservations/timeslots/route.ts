import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { AppError } from '@/lib/errors';
import { authenticateToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const slots = await reservationService.getAllTimeSlots();
    return NextResponse.json(slots);
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateToken(req);
    if (auth.errorResponse || !auth.user || auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const result = await reservationService.createTimeSlot(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
