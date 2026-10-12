import prisma from '../prisma';
import { publishTaskNotification, TaskNotificationPayload } from './rabbitmqService';

/**
 * Checks database for tasks due tomorrow and queues notifications in RabbitMQ
 */
export const checkAndQueueTomorrowTasks = async (): Promise<{ queuedCount: number; tasks: TaskNotificationPayload[] }> => {
    try {
        const now = new Date();
        // Tomorrow start: 00:00:00.000
        const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        // Tomorrow end: 23:59:59.999
        const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);

        const tasksDueTomorrow = await prisma.task.findMany({
            where: {
                dueDate: {
                    gte: tomorrowStart,
                    lte: tomorrowEnd,
                },
                status: {
                    not: 'COMPLETED',
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        });

        console.log(`[Notification Scheduler] Found ${tasksDueTomorrow.length} task(s) due tomorrow (${tomorrowStart.toLocaleDateString()}).`);

        const queuedTasks: TaskNotificationPayload[] = [];

        for (const task of tasksDueTomorrow) {
            const payload: TaskNotificationPayload = {
                taskId: task.id,
                taskName: task.name,
                dueDate: task.dueDate ? task.dueDate.toISOString() : tomorrowStart.toISOString(),
                userId: task.userId,
                userEmail: task.user.email,
                userName: task.user.fullName,
                projectId: task.projectId,
                timestamp: new Date().toISOString(),
            };

            await publishTaskNotification(payload);
            queuedTasks.push(payload);
        }

        return {
            queuedCount: queuedTasks.length,
            tasks: queuedTasks,
        };
    } catch (err: any) {
        console.error('[Notification Scheduler] Error checking tasks due tomorrow:', err.message);
        return {
            queuedCount: 0,
            tasks: [],
        };
    }
};

/**
 * Starts a background periodic timer to check for tasks due tomorrow
 * Checks once every hour, and runs an initial check after startup
 */
export const startPeriodicNotificationScheduler = (intervalMs = 60 * 60 * 1000): NodeJS.Timeout => {
    console.log('[Notification Scheduler] 🕒 Background scheduler registered (checks every hour).');

    // Run first check after a brief 5-second warm-up
    setTimeout(() => {
        checkAndQueueTomorrowTasks();
    }, 5000);

    const interval = setInterval(() => {
        checkAndQueueTomorrowTasks();
    }, intervalMs);

    return interval;
};
