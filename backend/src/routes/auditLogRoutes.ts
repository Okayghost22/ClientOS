import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', getAuditLogs);

export default router;
