import { z } from 'zod';

export const createOrderSchema = z.object({
  table_id: z.number().int().positive('Invalid table ID').nullable().optional(),
  customer_name: z.string().min(1, 'Name is required').max(100),
  customer_phone: z.string().max(50).nullable().optional(),
  pickup_time: z.string().max(100).nullable().optional(),
  items: z.array(
    z.object({
      menu_item_id: z.number().int().positive(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1').max(50),
      special_requests: z.string().max(500).nullable().optional(),
    })
  ).min(1, 'At least one item required').max(50),
  special_instructions: z.string().max(1000).nullable().optional(),
  order_type: z.enum(['dine-in', 'takeaway', 'delivery']).optional().default('dine-in'),
  status: z.enum(['pending', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled']).optional()
}).superRefine((data, ctx) => {
  if (data.order_type === 'dine-in' && (!data.table_id || data.table_id <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Valid table ID is required for dine-in orders',
      path: ['table_id'],
    });
  }
});

export const orderStatusSchema = z.enum([
  'pending', 
  'accepted',
  'preparing', 
  'ready', 
  'served',
  'completed', 
  'cancelled'
]);
