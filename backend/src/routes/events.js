const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getFeaturedEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getEventStats
} = require('../controllers/eventController');
const {
  validateEvent,
  validateId
} = require('../middleware/validation');

// Public routes
router.get('/', getAllEvents);
router.get('/featured', getFeaturedEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', validateId, getEventById);

// Admin routes
router.get('/stats', getEventStats);
router.get('/by-date-range', getEventsByDateRange);
router.post('/', validateEvent, createEvent);
router.put('/:id', validateId, validateEvent, updateEvent);
router.delete('/:id', validateId, deleteEvent);

module.exports = router; 