import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  price: z.preprocess((val) => Number(val) || 0, z.number().min(0, 'Price must be a positive number')),
  description: z.preprocess((val) => val ?? '', z.string().optional()),
  category: z.preprocess((val) => val ?? '', z.string().min(1, 'Please select a category')),
  image_url: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return '';
    return String(val);
  }, z.string().url('Must be a valid URL').or(z.literal('')).optional()),
  preparation_time: z.preprocess((val) => Number(val) || 15, z.number().min(1, 'Preparation time must be at least 1 minute')),
  is_vegetarian: z.preprocess((val) => val === true || val === 'true', z.boolean()),
  is_spicy: z.preprocess((val) => val === true || val === 'true', z.boolean()),
  is_popular: z.preprocess((val) => val === true || val === 'true', z.boolean()),
  allergens: z.preprocess((val) => val ?? [], z.array(z.string()).optional()),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  description: z.preprocess((val) => val ?? '', z.string().optional()),
  parent_id: z.preprocess((val) => (val === '' || val === undefined || val === null) ? null : Number(val), z.number().nullable().optional()),
  display_order: z.preprocess((val) => Number(val) || 0, z.number().optional())
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
