import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/clients - fetch all clients for current user
export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const clients = await (prisma as any).client.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ clients });
    } catch (error) {
        console.error('getClients error:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

// GET /api/clients/:id - fetch single client
export const getClientById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;
        const client = await (prisma as any).client.findFirst({
            where: { id, userId }
        });

        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }

        res.status(200).json({ client });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch client' });
    }
};

// POST /api/clients - create new client
export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { name, email, phone, company, status } = req.body;

        if (!name || !email) {
            res.status(400).json({ error: 'Name and Email are required' });
            return;
        }

        const client = await (prisma as any).client.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone ? phone.trim() : null,
                company: company ? company.trim() : null,
                status: status || 'ACTIVE',
                userId
            }
        });

        res.status(201).json({ client });
    } catch (error) {
        console.error('createClient error:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
};

// PUT /api/clients/:id - update client
export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;
        const { name, email, phone, company, status } = req.body;

        const existing = await (prisma as any).client.count({ where: { id, userId } });
        if (existing === 0) {
            res.status(404).json({ error: 'Client not found or unauthorized' });
            return;
        }

        const updateData: any = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();
        if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
        if (company !== undefined) updateData.company = company ? company.trim() : null;
        if (status) updateData.status = status;

        const client = await (prisma as any).client.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ client });
    } catch (error) {
        console.error('updateClient error:', error);
        res.status(500).json({ error: 'Failed to update client' });
    }
};

// DELETE /api/clients/:id - delete client
export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.user?.userId;

        const existing = await (prisma as any).client.count({ where: { id, userId } });
        if (existing === 0) {
            res.status(404).json({ error: 'Client not found or unauthorized' });
            return;
        }

        await (prisma as any).client.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete client' });
    }
};
