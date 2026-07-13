import { z } from 'zod';

export const createOrderSchema = z.object({
  table_id: z.number().int().positive('Invalid table ID'),
  customer_name: z.string().min(1, 'Name is required').max(100),
  items: z.array(
    z.object({
      menu_item_id: z.number().int().positive(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50),
      special_requests: z.string().max(500).nullable().optional(),
    })
  ).min(1, 'At least one item required').max(50),
  special_instructions: z.string().max(1000).nullable().optional(),
  order_type: z.enum(['dine-in', 'takeaway', 'delivery']).optional().default('dine-in'),
});
