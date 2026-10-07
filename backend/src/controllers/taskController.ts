import { Response } from 'express';
import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, title, description, status, priority, dueDate, projectId } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const taskName = name || title;
        if (!taskName || !projectId) {
            res.status(400).json({ error: 'Task name and projectId are required' });
            return;
        }

        let validStatus: TaskStatus = TaskStatus.PENDING;
        if (status === 'IN_PROGRESS') validStatus = TaskStatus.IN_PROGRESS;
        else if (status === 'COMPLETED') validStatus = TaskStatus.COMPLETED;
        else if (status === 'PENDING' || status === 'TODO') validStatus = TaskStatus.PENDING;

        let validPriority: TaskPriority = TaskPriority.MEDIUM;
        if (priority === 'LOW') validPriority = TaskPriority.LOW;
        else if (priority === 'HIGH') validPriority = TaskPriority.HIGH;

        const task = await prisma.task.create({
            data: {
                name: taskName,
                description: description || null,
                status: validStatus,
                priority: validPriority,
                dueDate: dueDate ? new Date(dueDate) : null,
                project: { connect: { id: projectId } },
                user: { connect: { id: userId } }
            }
        });

        res.status(201).json({ message: 'Task created successfully', task });
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task', details: error.message });
    }
};

export const getTasksByProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const userId = req.user?.userId || req.user?.id;
        const { sortBy = 'createdAt', order = 'desc', page, limit } = req.query;

        const validFields = ['name', 'status', 'priority', 'dueDate', 'createdAt'];
        const field = validFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
        const direction = order === 'asc' ? 'asc' : 'desc';

        const pageNum = page ? parseInt(page as string) : undefined;
        const limitNum = limit ? parseInt(limit as string) : undefined;
        const skip = pageNum && limitNum ? (pageNum - 1) * limitNum : undefined;

        // Authorization: only return tasks belonging to projects owned by the authenticated user
        const [totalTasks, tasks] = await Promise.all([
            prisma.task.count({ where: { projectId, userId } }),
            prisma.task.findMany({
                where: { projectId, userId },
                orderBy: { [field]: direction },
                ...(skip !== undefined && limitNum !== undefined ? { skip, take: limitNum } : {})
            })
        ]);

        res.status(200).json({
            tasks,
            pagination: {
                total: totalTasks,
                page: pageNum || 1,
                limit: limitNum || totalTasks,
                totalPages: limitNum ? Math.ceil(totalTasks / limitNum) : 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;
        const { name, title, description, status, priority, dueDate } = req.body;

        // Authorization: verify task belongs to the authenticated user
        const existing = await prisma.task.count({ where: { id, userId } });
        if (existing === 0) {
            res.status(404).json({ error: 'Task not found or unauthorized' });
            return;
        }

        const updateData: any = {};

        const taskName = name || title;
        if (taskName !== undefined) updateData.name = taskName;
        if (description !== undefined) updateData.description = description || null;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

        if (status) {
            if (status === 'IN_PROGRESS') updateData.status = TaskStatus.IN_PROGRESS;
            else if (status === 'COMPLETED') updateData.status = TaskStatus.COMPLETED;
            else if (status === 'PENDING' || status === 'TODO') updateData.status = TaskStatus.PENDING;
        }

        if (priority) {
            if (priority === 'LOW') updateData.priority = TaskPriority.LOW;
            else if (priority === 'MEDIUM') updateData.priority = TaskPriority.MEDIUM;
            else if (priority === 'HIGH') updateData.priority = TaskPriority.HIGH;
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error: any) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
};

export const updateTaskStatus = updateTask;

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

        await prisma.task.deleteMany({
            where: { id, userId }
        });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

// GET /api/tasks — all tasks for the authenticated user (across all their projects)
export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { project: { select: { id: true, name: true } } }
        });

        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// GET /api/tasks/:id — single task by ID (scoped to authenticated user)
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

        const task = await prisma.task.findFirst({
            where: { id, userId },
            include: { project: { select: { id: true, name: true } } }
        });

        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        res.status(200).json({ task });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
};