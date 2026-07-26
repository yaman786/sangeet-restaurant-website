import { z } from 'zod';

export const reservationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  guests: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 guest required')),
  customer_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  special_requests: z.string().optional()
});

export const updateReservationSchema = reservationSchema.partial().extend({
  table_id: z.preprocess((val) => (val !== undefined && val !== null ? Number(val) : null), z.number().nullable().optional()),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional()
});
