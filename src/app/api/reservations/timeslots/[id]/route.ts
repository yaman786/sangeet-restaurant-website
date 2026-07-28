import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError, ForbiddenError } from '@/lib/errors';
import { authenticateToken } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await authenticateToken(req);
    if (auth.errorResponse || !auth.user || auth.user.role !== 'admin') {
      throw new ForbiddenError('Unauthorized');
    }

    const data = await req.json();
    const result = await reservationService.updateTimeSlot(params.id, data);
    return NextResponse.json(result);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const auth = await authenticateToken(req);
    if (auth.errorResponse || !auth.user || auth.user.role !== 'admin') {
      throw new ForbiddenError('Unauthorized');
    }

    await reservationService.deleteTimeSlot(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}
