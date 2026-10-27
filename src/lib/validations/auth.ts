import { z } from 'zod';

const USER_ROLES = ['admin', 'waiter', 'kitchen', 'reception'] as const;

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be at most 50 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed');

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(USER_ROLES, {
    message: 'Invalid role'
  }),
  password: passwordSchema,
  full_name: z.string().trim().min(1, 'Name is required').max(100),
  phone: z.string().trim().max(20, 'Phone must be at most 20 characters').optional()
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  email: z.string().email('Invalid email address').toLowerCase().optional(),
  role: z.enum(USER_ROLES, { message: 'Invalid role' }).optional(),
  password: passwordSchema.optional(),
  full_name: z.string().trim().min(1, 'Name is required').max(100).optional(),
  phone: z.string().trim().max(20, 'Phone must be at most 20 characters').nullish(),
  is_active: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from the current password',
  path: ['newPassword']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
