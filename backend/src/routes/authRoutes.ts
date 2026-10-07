import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, register, logout, getMe, handleRefreshToken } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Rate limiting middleware for authentication endpoints (prevents brute-force attacks)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 15, // limit each IP to 15 auth requests per 15 minutes
    message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);       // POST /api/auth/signup (original)
router.post('/register', authLimiter, register);   // POST /api/auth/register (required API contract)
router.post('/login', authLimiter, login);         // POST /api/auth/login
router.post('/refresh', handleRefreshToken);       // POST /api/auth/refresh
router.post('/logout', authenticateToken, logout); // POST /api/auth/logout
router.get('/me', authenticateToken, getMe);       // GET  /api/auth/me

export default router;