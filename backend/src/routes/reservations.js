const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { reservationLimiter } = require('../middleware/rateLimiter');
const { validateReservation, validateReservationDate } = require('../middleware/validation');

// Public routes (no authentication required)
router.get('/availability', reservationController.checkAvailability);
router.get('/available-tables', reservationController.getAvailableTables);
router.get('/available-time-slots', reservationController.getAvailableTimeSlots);
router.post('/', reservationLimiter, validateReservation, validateReservationDate, reservationController.createReservation);
// Protected routes (require authentication)
router.get('/', authenticateToken, requireRole(['reception']), reservationController.getAllReservations);
router.get('/stats', authenticateToken, requireRole(['reception']), reservationController.getReservationStats);
router.get('/:id', authenticateToken, requireRole(['reception']), reservationController.getReservationById);
router.put('/:id', authenticateToken, requireRole(['reception']), reservationController.updateReservation);
router.patch('/:id/status', authenticateToken, requireRole(['reception']), reservationController.updateReservationStatus);
router.delete('/:id', authenticateToken, requireRole(['reception']), reservationController.deleteReservation);

module.exports = router; 