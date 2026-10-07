import { Response } from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, clientName, status, startDate, endDate } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!name) {
            res.status(400).json({ error: 'Project name is required' });
            return;
        }

        let validStatus: ProjectStatus = ProjectStatus.NOT_STARTED;
        if (status === 'IN_PROGRESS') validStatus = ProjectStatus.IN_PROGRESS;
        else if (status === 'COMPLETED') validStatus = ProjectStatus.COMPLETED;
        else if (status === 'NOT_STARTED') validStatus = ProjectStatus.NOT_STARTED;

        let clientId: string | null = null;
        let finalClientName: string | null = clientName ? clientName.trim() : null;

        if (finalClientName) {
            const existingClient = await (prisma as any).client.findFirst({
                where: {
                    userId,
                    name: { equals: finalClientName, mode: 'insensitive' }
                }
            });

            if (existingClient) {
                clientId = existingClient.id;
                finalClientName = existingClient.name;
            } else {
                const newClient = await (prisma as any).client.create({
                    data: {
                        name: finalClientName,
                        status: 'PENDING',
                        userId
                    }
                });
                clientId = newClient.id;
            }
        }

        const project = await (prisma as any).project.create({
            data: {
                name: name.trim(),
                description: description ? description.trim() : null,
                clientName: finalClientName,
                clientId,
                status: validStatus,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                userId
            }
        });

        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error: any) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project', details: error.message });
    }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { sortBy = 'createdAt', order = 'desc', page, limit } = req.query;

        const validFields = ['name', 'status', 'createdAt', 'startDate', 'endDate'];
        const field = validFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
        const direction = order === 'asc' ? 'asc' : 'desc';

        const pageNum = page ? parseInt(page as string) : 1;
        const limitNum = limit ? parseInt(limit as string) : 50;
        const skip = (pageNum - 1) * limitNum;

        const [totalProjects, projects] = await Promise.all([
            (prisma as any).project.count({ where: { userId } }),
            (prisma as any).project.findMany({
                where: { userId },
                include: { tasks: true, client: true },
                orderBy: { [field]: direction },
                skip,
                take: limitNum
            })
        ]);

        res.status(200).json({
            projects,
            pagination: {
                total: totalProjects,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalProjects / limitNum) || 1
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

        const project = await (prisma as any).project.findFirst({
            where: { id, userId },
            include: { tasks: true, client: true }
        });

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        res.status(200).json({ project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;
        const { name, description, clientName, status, startDate, endDate } = req.body;

        const count = await prisma.project.count({ where: { id, userId } });
        if (count === 0) {
            res.status(404).json({ error: 'Project not found or unauthorized' });
            return;
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

        if (clientName !== undefined) {
            const trimmedClientName = clientName ? clientName.trim() : null;
            updateData.clientName = trimmedClientName;

            if (trimmedClientName) {
                const existingClient = await (prisma as any).client.findFirst({
                    where: {
                        userId,
                        name: { equals: trimmedClientName, mode: 'insensitive' }
                    }
                });

                if (existingClient) {
                    updateData.clientId = existingClient.id;
                } else {
                    const newClient = await (prisma as any).client.create({
                        data: {
                            name: trimmedClientName,
                            status: 'PENDING',
                            userId
                        }
                    });
                    updateData.clientId = newClient.id;
                }
            } else {
                updateData.clientId = null;
            }
        }

        if (status) {
            if (status === 'IN_PROGRESS') updateData.status = ProjectStatus.IN_PROGRESS;
            else if (status === 'COMPLETED') updateData.status = ProjectStatus.COMPLETED;
            else if (status === 'NOT_STARTED') updateData.status = ProjectStatus.NOT_STARTED;
        }

        const project = await (prisma as any).project.update({
            where: { id },
            data: updateData,
            include: { client: true }
        });

        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error: any) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project', details: error.message });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!id) {
            res.status(400).json({ error: 'Project ID is required' });
            return;
        }

        // First check if project exists and belongs to user
        const existing = await (prisma as any).project.findFirst({
            where: { id, userId }
        });

        if (!existing) {
            // Still return 200 (idempotent delete) — already gone
            res.status(200).json({ message: 'Project deleted successfully' });
            return;
        }

        await (prisma as any).project.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project', details: error.message });
    }
};