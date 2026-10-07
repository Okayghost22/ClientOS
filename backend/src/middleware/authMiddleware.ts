import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Role-Based Access Control (RBAC) middleware
export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userRole = req.user.role || 'USER';
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Privileged role required: [${allowedRoles.join(', ')}]`
            });
        }
        next();
    };
};

// Alias for backward compatibility
export const authenticate = authenticateToken;