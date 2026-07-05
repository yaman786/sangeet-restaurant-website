import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be a positive number')),
  description: z.string().optional(),
  category_id: z.preprocess((val) => Number(val), z.number().min(1, 'Please select a category')),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  preparation_time: z.preprocess((val) => Number(val), z.number().min(1, 'Preparation time must be at least 1 minute')),
  is_vegetarian: z.boolean(),
  is_spicy: z.boolean(),
  is_popular: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  description: z.string().optional(),
});

export const reservationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  guests: z.preprocess((val) => Number(val), z.number().min(1, 'At least 1 guest required')),
  customer_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  special_requests: z.string().optional()
});
