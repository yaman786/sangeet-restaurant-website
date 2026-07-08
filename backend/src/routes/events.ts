import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { validateEvent, validateId } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/:id', validateId, eventController.getEventById);

// Admin routes
router.get('/stats', authenticateToken, requireAdmin, eventController.getEventStats);
router.get('/by-date-range', authenticateToken, requireAdmin, eventController.getEventsByDateRange);
router.post('/', authenticateToken, requireAdmin, validateEvent, eventController.createEvent);
router.put('/:id', authenticateToken, requireAdmin, validateId, validateEvent, eventController.updateEvent);
router.delete('/:id', authenticateToken, requireAdmin, validateId, eventController.deleteEvent);

export default router;