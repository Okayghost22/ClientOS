import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import clientRoutes from './routes/clientRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import prisma from './prisma';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for web & mobile applications
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// REST API Route Registration (supporting both /api and root prefixes)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/projects', projectRoutes);
app.use('/projects', projectRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/clients', clientRoutes);
app.use('/clients', clientRoutes);

app.use('/api/audit-logs', auditLogRoutes);
app.use('/audit-logs', auditLogRoutes);

// Health check endpoint
app.get(['/health', '/api/health'], async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
    } catch (err: any) {
        res.status(200).json({ status: 'degraded', database: 'disconnected', error: err?.message, timestamp: new Date() });
    }
});

// Global Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});