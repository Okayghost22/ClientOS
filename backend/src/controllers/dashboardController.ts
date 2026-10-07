import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/dashboard — aggregated metrics for the authenticated user
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Fetch all projects with their tasks in a single query
        const projects = await prisma.project.findMany({
            where: { userId },
            include: { tasks: true }
        });

        const allTasks = projects.flatMap(p => p.tasks);

        const totalProjects = projects.length;
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
        const pendingTasks = allTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
        const projectsNotStarted = projects.filter(p => p.status === 'NOT_STARTED').length;
        const projectsInProgress = projects.filter(p => p.status === 'IN_PROGRESS').length;
        const projectsCompleted = projects.filter(p => p.status === 'COMPLETED').length;

        res.status(200).json({
            dashboard: {
                totalProjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                projectsNotStarted,
                projectsInProgress,
                projectsCompleted,
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
