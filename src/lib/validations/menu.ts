import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be a positive number')),
  description: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
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
