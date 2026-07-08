import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const stats = await reservationService.getReservationStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
