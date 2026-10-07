import request from 'supertest';
import express, { Request, Response } from 'express';
import authRoutes from '../routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API & Integration Tests', () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    let authToken = '';
    let refreshToken = '';

    it('should register a new user successfully (201)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test User',
                email: testEmail,
                password: testPassword
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body.user).toHaveProperty('email', testEmail);
    });

    it('should reject registration with duplicate email (400)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                fullName: 'Test Duplicate',
                email: testEmail,
                password: testPassword
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should login user with correct credentials (200)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');
        authToken = res.body.token;
        refreshToken = res.body.refreshToken;
    });

    it('should reject login with incorrect password (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testEmail,
                password: 'WrongPassword!'
            });

        expect(res.status).toBe(401);
    });

    it('should refresh access token using valid refresh token (200)', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({ refreshToken });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject refresh token endpoint with missing payload (400)', async () => {
        const res = await request(app)
            .post('/api/auth/refresh')
            .send({});

        expect(res.status).toBe(400);
    });
});
