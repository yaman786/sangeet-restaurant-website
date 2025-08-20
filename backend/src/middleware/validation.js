const Joi = require('joi');

// Menu item validation schema
const menuItemSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().positive().precision(2).required(),
  category: Joi.string().min(2).max(100).required(),
  image_url: Joi.string().uri().optional(),
  is_vegetarian: Joi.boolean().default(false),
  is_spicy: Joi.boolean().default(false),
  is_popular: Joi.boolean().default(false),
  allergens: Joi.array().items(Joi.string()).optional(),
  preparation_time: Joi.number().integer().min(1).max(120).default(15)
});

// Reservation validation schema
const reservationSchema = Joi.object({
  customer_name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  date: Joi.date().iso().min('now').required(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  guests: Joi.number().integer().min(1).max(20).required(),
  special_requests: Joi.string().max(500).optional()
});

// Review validation schema
const reviewSchema = Joi.object({
  customer_name: Joi.string().min(2).max(255).required(),
  review_text: Joi.string().min(10).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  image_url: Joi.string().uri().optional(),
  order_id: Joi.alternatives().try(Joi.number().integer(), Joi.string().pattern(/^\d+$/), Joi.allow(null)).optional(),
  table_number: Joi.alternatives().try(Joi.string().max(10), Joi.allow(null)).optional()
});

// Event validation schema
const eventSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  description: Joi.string().min(10).max(1000).required(),
  date: Joi.date().iso().min('now').required(),
  image_url: Joi.string().uri().optional(),
  is_featured: Joi.boolean().default(false)
});

// Table validation schema
const tableSchema = Joi.object({
  table_number: Joi.string().min(1).max(50).required(),
  capacity: Joi.number().integer().min(1).max(20).required(),
  qr_code: Joi.string().optional(),
  location: Joi.string().max(100).optional()
});

// Validation middleware function
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Specific validation middlewares
const validateMenuItem = validateRequest(menuItemSchema);
const validateReservation = validateRequest(reservationSchema);
const validateReview = validateRequest(reviewSchema);
const validateEvent = validateRequest(eventSchema);
const validateTableData = validateRequest(tableSchema);

// ID validation middleware
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid ID parameter' });
  }
  next();
};

// Date validation middleware for reservations
const validateReservationDate = (req, res, next) => {
  const { date, time } = req.body;
  const reservationDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  
  // Check if reservation is at least 2 hours in the future
  const minReservationTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  if (reservationDateTime < minReservationTime) {
    return res.status(400).json({ 
      error: 'Reservations must be made at least 2 hours in advance' 
    });
  }
  
  // Check if reservation is within 3 months
  const maxReservationTime = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (reservationDateTime > maxReservationTime) {
    return res.status(400).json({ 
      error: 'Reservations cannot be made more than 3 months in advance' 
    });
  }
  
  next();
};

module.exports = {
  validateMenuItem,
  validateReservation,
  validateReview,
  validateEvent,
  validateTableData,
  validateId,
  validateReservationDate
}; 