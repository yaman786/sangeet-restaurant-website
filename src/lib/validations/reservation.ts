import { z } from 'zod';

export const reservationSchema = z.object({
  date: z.string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((val) => {
      const today = new Date().toISOString().split('T')[0];
      return val >= today;
    }, 'Cannot book a date in the past')
    .refine((val) => {
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90);
      return val <= maxDate.toISOString().split('T')[0];
    }, 'Cannot book more than 90 days in advance'),
  time: z.string().min(1, 'Time is required'),
  guests: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 guest required').max(20, 'Maximum party size is 20 guests')),
  customer_name: z.string().min(2, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Valid email is required').max(100, 'Email too long'),
  phone: z.string()
    .min(5, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d][\d\s\-()]{4,19}$/, 'Please enter a valid phone number'),
  special_requests: z.string().max(500, 'Special requests too long').optional()
});

export const updateReservationSchema = reservationSchema.partial().extend({
  table_id: z.preprocess((val) => (val !== undefined && val !== null ? Number(val) : null), z.number().nullable().optional()),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).optional()
});

