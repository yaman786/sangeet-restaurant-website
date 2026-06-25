const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin, requireAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

// Public routes
router.post('/login', loginLimiter, authController.login);

// Protected routes
router.get('/profile', authenticateToken, requireAuth, authController.getProfile);
router.put('/change-password', authenticateToken, requireAuth, authController.changePassword);

// Admin only routes
router.get('/users/stats', authenticateToken, requireAdmin, authController.getUserStats);
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.post('/users', authenticateToken, requireAdmin, authController.createUser);
router.put('/users/:id', authenticateToken, requireAdmin, authController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, authController.deleteUser);
router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, authController.toggleUserStatus);

module.exports = router; 