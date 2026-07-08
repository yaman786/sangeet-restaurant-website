'use server';

import reservationService from '@/lib/services/reservationService';
import { reservationSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createReservationAction(data: z.infer<typeof reservationSchema>) {
  try {
    const parsedData = reservationSchema.parse(data);
    
    const reservation = await reservationService.createReservation(parsedData);
    
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/dashboard');
    
    return { success: true, reservation };
  } catch (error: any) {
    console.error('Error in createReservationAction:', error);
    return { success: false, error: error.message || 'Failed to create reservation' };
  }
}
