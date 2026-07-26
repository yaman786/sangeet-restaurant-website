export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth, requireRole } from '@/lib/auth';
import { updateReservationSchema } from '@/lib/validations/reservation';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const reservation = await reservationService.getReservationById(params.id);
    return NextResponse.json(reservation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    await reservationService.deleteReservation(params.id);
    return NextResponse.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const rawBody = await req.json();
    const body = updateReservationSchema.parse(rawBody);
    const reservation = await reservationService.updateReservation(params.id, body as any);
    
    return NextResponse.json({ message: 'Reservation updated successfully', reservation });
  } catch (error) {
    return handleApiError(error);
  }
}
