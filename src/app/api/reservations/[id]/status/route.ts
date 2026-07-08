export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const body = await req.json();
    const reservation = await reservationService.updateReservationStatus(params.id, body.status);
    
    return NextResponse.json({ message: 'Reservation status updated successfully', reservation });
  } catch (error) {
    return handleApiError(error);
  }
}
