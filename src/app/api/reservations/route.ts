export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';
import { reservationSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const reservations = await reservationService.getAllReservations(query);
    return NextResponse.json(reservations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const body = reservationSchema.parse(rawBody);
    const reservation = await reservationService.createReservation(body);
    return NextResponse.json({ message: 'Reservation created successfully', reservation }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
