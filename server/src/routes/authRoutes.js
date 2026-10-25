// server/src/routes/authRoutes.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/login', loginLimiter, login);

// Protected — only existing admins can create new users
router.post('/register', protect, requireAdmin, register);

// Protected — get current user
router.get('/me', protect, getMe);

export default router;
