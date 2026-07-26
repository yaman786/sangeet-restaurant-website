export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import reservationService from '@/lib/services/reservationService';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const guestsParam = searchParams.get('guests');
    
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    const guests = guestsParam ? parseInt(guestsParam, 10) : 2;
    const slots = await reservationService.getAvailableTimeSlots(date, isNaN(guests) ? 2 : guests);
    
    return NextResponse.json(slots);
  } catch (error) {
    return handleApiError(error);
  }
}
