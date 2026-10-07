import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import projectRoutes from '../routes/projectRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

describe('Projects & Workspaces API & Integration Tests', () => {
    let token = '';
    let projectId = '';
    const testEmail = `proj_test_${Date.now()}@example.com`;

    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Project Tester',
                email: testEmail,
                password: 'Password123!'
            });
        token = res.body.token;
    });

    it('should fail to create project without auth token (401)', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({ name: 'Unauthenticated Workspace' });

        expect(res.status).toBe(401);
    });

    it('should create a project successfully when authenticated (201)', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'E-Commerce Platform',
                description: 'Full stack shopping app',
                clientName: 'Acme Corp',
                status: 'IN_PROGRESS'
            });

        expect(res.status).toBe(201);
        expect(res.body.project).toHaveProperty('id');
        expect(res.body.project).toHaveProperty('name', 'E-Commerce Platform');
        projectId = res.body.project.id;
    });

    it('should fetch user projects with pagination and sorting metadata (200)', async () => {
        const res = await request(app)
            .get('/api/projects?page=1&limit=10&sortBy=name&order=asc')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.projects)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('total');
        expect(res.body.pagination).toHaveProperty('page', 1);
    });

    it('should fetch project by ID (200)', async () => {
        const res = await request(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.project).toHaveProperty('id', projectId);
    });

    it('should update project details (200)', async () => {
        const res = await request(app)
            .put(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'E-Commerce Platform v2',
                status: 'COMPLETED'
            });

        expect(res.status).toBe(200);
        expect(res.body.project).toHaveProperty('name', 'E-Commerce Platform v2');
    });

    it('should delete project (200)', async () => {
        const res = await request(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
    });
});
