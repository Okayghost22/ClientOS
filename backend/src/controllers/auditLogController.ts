import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma';

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const role = req.user.role || 'USER';

        // Admins can see all audit logs, regular users see their own audit logs
        const whereClause = role === 'ADMIN' ? {} : { userId };

        const logs = await (prisma as any).auditLog.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });

        res.json({ logs });
    } catch (err: any) {
        console.error('Fetch audit logs error:', err);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};
