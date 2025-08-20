const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/availability', reservationController.checkAvailability);
router.get('/available-tables', reservationController.getAvailableTables);
router.get('/available-time-slots', reservationController.getAvailableTimeSlots);
router.post('/', reservationController.createReservation);

// Protected routes (require authentication)
router.get('/', authenticateToken, requireAuth, reservationController.getAllReservations);
router.get('/stats', authenticateToken, requireAuth, reservationController.getReservationStats);
router.get('/:id', authenticateToken, requireAuth, reservationController.getReservationById);
router.put('/:id', authenticateToken, requireAuth, reservationController.updateReservation);
router.patch('/:id/status', authenticateToken, requireAuth, reservationController.updateReservationStatus);
router.delete('/:id', authenticateToken, requireAuth, reservationController.deleteReservation);

module.exports = router; 