import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z, ZodObject, ZodRawShape } from 'zod';

// Schemas
const menuItemSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().min(10).max(1000),
  price: z.number().positive(),
  category: z.string().min(2).max(100),
  image_url: z.string().url().optional().or(z.literal('')),
  is_vegetarian: z.boolean().default(false),
  is_spicy: z.boolean().default(false),
  is_popular: z.boolean().default(false),
  allergens: z.array(z.string()).optional(),
  preparation_time: z.number().int().min(1).max(120).default(15)
});

const reservationSchema = z.object({
  customer_name: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().min(7).max(20).regex(/^[+\d][\d\s\-().]{6,18}$/, 'Please enter a valid phone number'),
  date: z.string(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  guests: z.number().int().min(1).max(20),
  special_requests: z.string().max(500).nullable().optional(),
  table_id: z.number().int().positive().optional()
});

const reviewSchema = z.object({
  customer_name: z.string().min(2).max(255),
  review_text: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
  image_url: z.string().url().optional().or(z.literal('')),
  order_id: z.union([z.number().int(), z.string().regex(/^\d+$/)]).nullable().optional(),
  table_number: z.string().max(10).nullable().optional()
});

const eventSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(10).max(1000),
  date: z.string(),
  image_url: z.string().url().optional().or(z.literal('')),
  is_featured: z.boolean().default(false)
});

const orderItemSchema = z.object({
  menu_item_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  special_requests: z.string().max(500).nullable().optional()
});

const orderSchema = z.object({
  table_id: z.number().int().positive(),
  customer_name: z.string().min(1).max(255),
  items: z.array(orderItemSchema).min(1).max(50),
  special_instructions: z.string().max(500).nullable().optional(),
  order_type: z.enum(['dine-in', 'takeaway', 'delivery']).default('dine-in')
});

const contactFormSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(20).nullable().optional(),
  subject: z.string().min(2).max(255),
  message: z.string().min(10).max(2000)
});

const tableSchema = z.object({
  table_number: z.string().min(1).max(50),
  capacity: z.number().int().min(1).max(20),
  qr_code: z.string().optional(),
  location: z.string().max(100).optional()
});

const loginSchema = z.object({
  username: z.string().max(100).optional(),
  email: z.string().email().max(100).optional(),
  password: z.string().max(100)
}).refine(data => data.username || data.email, {
  message: "Username or email is required",
  path: ["username"]
});

const createUserSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email().max(100),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, 'Password must be at least 8 characters long and contain at least one letter and one number'),
  role: z.enum(['admin', 'kitchen', 'reception', 'waiter']).optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().max(20).optional()
});

const updateUserSchema = createUserSchema.omit({ password: true }).extend({
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/).optional().or(z.literal('')),
  is_active: z.boolean().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, 'New password must be at least 8 characters long and contain at least one letter and one number')
});

// Validation middleware function for Zod
const validateRequest = (schema: z.ZodTypeAny): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues || [];
        res.status(400).json({
          error: 'Validation error',
          details: issues.map(err => `${err.path ? err.path.join('.') : 'field'}: ${err.message}`)
        });
        return;
      }
      next(error);
    }
  };
};

// Specific validation middlewares
export const validateMenuItem = validateRequest(menuItemSchema);
export const validateReservation = validateRequest(reservationSchema);
export const validateReview = validateRequest(reviewSchema);
export const validateEvent = validateRequest(eventSchema);
export const validateTableData = validateRequest(tableSchema);
export const validateOrder = validateRequest(orderSchema);
export const validateContactForm = validateRequest(contactFormSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateCreateUser = validateRequest(createUserSchema);
export const validateUpdateUser = validateRequest(updateUserSchema);
export const validateChangePassword = validateRequest(changePasswordSchema);

// ID validation middleware
export const validateId: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    res.status(400).json({ error: 'Invalid ID parameter' });
    return;
  }
  next();
};

// Date validation middleware for reservations
export const validateReservationDate: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const { date, time } = req.body as { date?: string; time?: string };
  if (!date || !time) { next(); return; }
  
  const reservationDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  
  const minReservationTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  if (reservationDateTime < minReservationTime) {
    res.status(400).json({ error: 'Reservations must be made at least 2 hours in advance' });
    return;
  }
  
  const maxReservationTime = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (reservationDateTime > maxReservationTime) {
    res.status(400).json({ error: 'Reservations cannot be made more than 3 months in advance' });
    return;
  }
  
  next();
};
