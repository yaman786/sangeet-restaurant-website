import { Router } from 'express';
import * as reservationController from '../controllers/reservationController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { reservationLimiter } from '../middleware/rateLimiter';
import { validateReservation, validateReservationDate } from '../middleware/validation';

const router = Router();

// Public routes (no authentication required)
router.get('/availability', reservationController.checkAvailability);
router.get('/available-tables', reservationController.getAvailableTables);
router.get('/available-time-slots', reservationController.getAvailableTimeSlots);
router.post('/', reservationLimiter, validateReservation, validateReservationDate, reservationController.createReservation);

// Protected routes (require authentication)
router.get('/', authenticateToken, requireRole(['reception', 'admin']), reservationController.getAllReservations);
router.get('/stats', authenticateToken, requireRole(['reception', 'admin']), reservationController.getReservationStats);
router.get('/:id', authenticateToken, requireRole(['reception', 'admin']), reservationController.getReservationById);
router.put('/:id', authenticateToken, requireRole(['reception', 'admin']), validateReservation, validateReservationDate, reservationController.updateReservation);
router.patch('/:id/status', authenticateToken, requireRole(['reception', 'admin']), reservationController.updateReservationStatus);
router.delete('/:id', authenticateToken, requireRole(['reception', 'admin']), reservationController.deleteReservation);

export default router;