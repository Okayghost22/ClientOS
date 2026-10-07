import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getDashboard); // GET /api/dashboard

export default router;
