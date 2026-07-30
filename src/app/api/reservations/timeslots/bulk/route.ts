import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError, ForbiddenError } from '@/lib/errors';
import { authenticateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateToken(req);
    if (auth.errorResponse || !auth.user || auth.user.role !== 'admin') {
      throw new ForbiddenError('Unauthorized');
    }

    const data = await req.json();
    const result = await reservationService.bulkCreateTimeSlots(data);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
