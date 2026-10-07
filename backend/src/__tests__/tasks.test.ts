import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import projectRoutes from '../routes/projectRoutes';
import taskRoutes from '../routes/taskRoutes';
import auditLogRoutes from '../routes/auditLogRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/audit-logs', auditLogRoutes);

describe('Tasks & Audit Logs API & Integration Tests', () => {
    let token = '';
    let projectId = '';
    let taskId = '';
    const testEmail = `task_test_${Date.now()}@example.com`;

    beforeAll(async () => {
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Task Tester',
                email: testEmail,
                password: 'Password123!'
            });
        token = regRes.body.token;

        const projRes = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Mobile App Project' });
        projectId = projRes.body.project.id;
    });

    it('should create a new task under project (201)', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Setup Push Notifications',
                description: 'Configure push alerts for tasks due tomorrow',
                priority: 'HIGH',
                status: 'PENDING',
                projectId
            });

        expect(res.status).toBe(201);
        expect(res.body.task).toHaveProperty('id');
        expect(res.body.task).toHaveProperty('name', 'Setup Push Notifications');
        taskId = res.body.task.id;
    });

    it('should fetch tasks under project with pagination & sorting (200)', async () => {
        const res = await request(app)
            .get(`/api/tasks/project/${projectId}?page=1&limit=5&sortBy=priority`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.tasks)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
    });

    it('should update task status (200)', async () => {
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'COMPLETED' });

        expect(res.status).toBe(200);
        expect(res.body.task).toHaveProperty('status', 'COMPLETED');
    });

    it('should fetch system audit logs for user (200)', async () => {
        const res = await request(app)
            .get('/api/audit-logs')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.logs)).toBe(true);
        expect(res.body.logs.length).toBeGreaterThan(0);
    });

    it('should delete task (200)', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
    });
});
