import { Router } from 'express';
import { login, getProfile, changePassword, getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus, getUserStats } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';
import { validateLogin, validateCreateUser, validateUpdateUser, validateChangePassword } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/login', loginLimiter, validateLogin, login);

// Protected routes (require authentication)
router.use(authenticateToken);

// User self-service routes
router.get('/profile', getProfile);
router.post('/change-password', validateChangePassword, changePassword);

// Admin only routes
router.get('/users/stats', requireAdmin, getUserStats);
router.get('/users', requireAdmin, getAllUsers);
router.post('/users', requireAdmin, validateCreateUser, createUser);
router.put('/users/:id', requireAdmin, validateUpdateUser, updateUser);
router.delete('/users/:id', requireAdmin, deleteUser);
router.patch('/users/:id/status', requireAdmin, toggleUserStatus);

export default router;