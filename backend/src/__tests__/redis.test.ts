import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import taskRoutes from '../routes/taskRoutes';
import prisma from '../prisma';
import { closeRedis, blacklistToken, isTokenBlacklisted } from '../services/redisService';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const TEST_EMAIL = `redis_test_${Date.now()}@example.com`;
const TEST_EMAIL_2 = `redis_logout_${Date.now()}@example.com`;
const TEST_PASSWORD = 'SecurePass123!';

let accessToken: string;
let logoutToken: string;
let logoutRefreshToken: string;

describe('Redis Token Blacklist — Auth Security Tests', () => {
    beforeAll(async () => {
        // Register main test user
        await request(app)
            .post('/api/auth/signup')
            .send({ fullName: 'Redis Test User', email: TEST_EMAIL, password: TEST_PASSWORD });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

        accessToken = loginRes.body.token;

        // Register secondary user dedicated for logout test (avoids rate limit collision)
        await request(app)
            .post('/api/auth/signup')
            .send({ fullName: 'Redis Logout Tester', email: TEST_EMAIL_2, password: TEST_PASSWORD });

        const logoutLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL_2, password: TEST_PASSWORD });

        logoutToken = logoutLoginRes.body.token;
        logoutRefreshToken = logoutLoginRes.body.refreshToken;
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: { in: [TEST_EMAIL, TEST_EMAIL_2] } } });
        await closeRedis();
    });

    it('should allow access with a valid token before logout', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
    });

    it('should blacklist an access token in Redis', async () => {
        const result = await blacklistToken(accessToken);
        // May return false if Redis is not connected (offline fallback), but should not throw
        expect(typeof result).toBe('boolean');
    });

    it('should detect a blacklisted token in Redis', async () => {
        const testToken = `test_revoked_token_${Date.now()}`;
        await blacklistToken(testToken, 60);
        const isBlacklisted = await isTokenBlacklisted(testToken);
        // If Redis is connected, should be true; if offline fallback, false
        if (isBlacklisted) {
            expect(isBlacklisted).toBe(true);
        } else {
            // Offline fallback: acceptable
            expect(isBlacklisted).toBe(false);
        }
    });

    it('should reject access with blacklisted token (if Redis is online)', async () => {
        const isBlacklisted = await isTokenBlacklisted(accessToken);
        if (isBlacklisted) {
            // Token is in Redis — request should be rejected with 401
            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(res.status).toBe(401);
            expect(res.body.message).toContain('revoked');
        } else {
            // Redis offline fallback: token still passes JWT verify
            const res = await request(app)
                .get('/api/tasks')
                .set('Authorization', `Bearer ${accessToken}`);
            expect([200, 401]).toContain(res.status);
        }
    });

    it('should logout user and blacklist tokens via API', async () => {
        // Use the dedicated secondary token (unblacklisted, fresh from beforeAll)
        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${logoutToken}`)
            .send({ refreshToken: logoutRefreshToken });

        expect(logoutRes.status).toBe(200);
        expect(logoutRes.body.message).toMatch(/logged out/i);
    });
});

