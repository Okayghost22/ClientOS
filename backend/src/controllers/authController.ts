import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// SIGNUP
export const signup = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash plain text password before saving to Prisma
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName: fullName || 'New User',
                email: cleanEmail,
                passwordHash: hashedPassword,
            },
        });

        const token = jwt.sign(
            { id: user.id, userId: user.id, email: user.email, role: user.role || 'USER' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, userId: user.id, type: 'refresh' },
            process.env.REFRESH_SECRET || JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Audit log
        const { logAudit } = await import('../utils/auditLogger');
        await logAudit(user.id, 'USER_REGISTER', `User registered with email ${user.email}`);

        return res.status(201).json({
            token,
            refreshToken,
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role || 'USER' },
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Registration failed' });
    }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare entered plain text password with stored bcrypt hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, userId: user.id, email: user.email, role: user.role || 'USER' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: user.id, userId: user.id, type: 'refresh' },
            process.env.REFRESH_SECRET || JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Audit log
        const { logAudit } = await import('../utils/auditLogger');
        await logAudit(user.id, 'USER_LOGIN', `User logged in from ${req.ip || 'client'}`);

        return res.status(200).json({
            token,
            refreshToken,
            user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role || 'USER' },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
};

// REFRESH TOKEN
export const handleRefreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken: tokenInput } = req.body;
        if (!tokenInput) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const decoded: any = jwt.verify(tokenInput, process.env.REFRESH_SECRET || JWT_SECRET);
        const userId = decoded.userId || decoded.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(401).json({ message: 'User not found for provided refresh token' });
        }

        const newToken = jwt.sign(
            { id: user.id, userId: user.id, email: user.email, role: user.role || 'USER' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id, userId: user.id, type: 'refresh' },
            process.env.REFRESH_SECRET || JWT_SECRET,
            { expiresIn: '30d' }
        );

        return res.status(200).json({
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

// REGISTER - alias for signup (required API contract)
export const register = signup;

// LOGOUT - client-side token invalidation (JWT is stateless; instruct client to discard token)
export const logout = (req: Request, res: Response) => {
    return res.status(200).json({ message: 'Logged out successfully' });
};

// GET /api/auth/me - return authenticated user profile from JWT
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, fullName: true, email: true, role: true, createdAt: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error: any) {
        console.error('GetMe error:', error);
        return res.status(500).json({ message: 'Failed to fetch user profile' });
    }
};