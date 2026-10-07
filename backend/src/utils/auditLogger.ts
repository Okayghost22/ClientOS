import prisma from '../prisma';

export const logAudit = async (userId: string, action: string, details?: string) => {
    try {
        await (prisma as any).auditLog.create({
            data: {
                userId,
                action,
                details: details || null
            }
        });
    } catch (err) {
        console.error(`[AuditLog Error] Failed to log action ${action} for user ${userId}:`, err);
    }
};
