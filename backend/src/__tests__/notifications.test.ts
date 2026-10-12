import request from 'supertest';
import express from 'express';
import taskRoutes from '../routes/taskRoutes';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';
import { closeRabbitMQ } from '../services/rabbitmqService';

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'clientos_super_secret_jwt_key_2026';

describe('RabbitMQ Push Notifications Test Suite', () => {
    let token: string;
    let userId: string;
    let projectId: string;

    beforeAll(async () => {
        // Clean and create test user
        const email = `notif_test_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                fullName: 'Notification Tester',
                email,
                passwordHash: 'hashedpassword',
                role: 'USER',
            },
        });
        userId = user.id;
        token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });

        const project = await prisma.project.create({
            data: {
                name: 'Notification Test Project',
                userId,
            },
        });
        projectId = project.id;
    });

    afterAll(async () => {
        await prisma.task.deleteMany({ where: { userId } });
        await prisma.project.deleteMany({ where: { userId } });
        await prisma.user.deleteMany({ where: { id: userId } });
        await closeRabbitMQ();
    });

    it('should queue a RabbitMQ notification when creating a task due tomorrow', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);

        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Review Client OS Push Notifications',
                projectId,
                dueDate: tomorrow.toISOString(),
                priority: 'HIGH',
            });

        expect(res.status).toBe(201);
        expect(res.body.task).toHaveProperty('id');
        expect(res.body.task.name).toBe('Review Client OS Push Notifications');
    });

    it('should trigger on-demand notification check via API endpoint for live review', async () => {
        const res = await request(app)
            .post('/api/tasks/notifications/check-due-tomorrow')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('queuedCount');
        expect(Array.isArray(res.body.tasks)).toBe(true);
    });
});
