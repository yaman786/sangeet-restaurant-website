import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { date: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const reservations = await reservationService.getReservationsByDate(params.date);
    return NextResponse.json(reservations);
  } catch (error) {
    return handleApiError(error);
  }
}
