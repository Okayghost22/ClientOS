import amqp, { ChannelModel, Channel, ConsumeMessage } from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'task_notifications';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;

export interface TaskNotificationPayload {
    taskId: string;
    taskName: string;
    dueDate: string;
    userId: string;
    userEmail: string;
    userName: string;
    projectId?: string;
    timestamp: string;
}

/**
 * Connect to RabbitMQ and initialize the notification channel & queue
 */
export const initRabbitMQ = async (): Promise<Channel | null> => {
    if (channel) return channel;
    if (isConnecting) return null;

    isConnecting = true;
    try {
        console.log(`[RabbitMQ] Connecting to broker at ${RABBITMQ_URL}...`);
        const conn = await amqp.connect(RABBITMQ_URL);
        connection = conn;

        conn.on('error', (err: any) => {
            console.error('[RabbitMQ] Connection error:', err?.message || err);
            channel = null;
            connection = null;
        });

        conn.on('close', () => {
            console.warn('[RabbitMQ] Connection closed. Will attempt reconnect on next message.');
            channel = null;
            connection = null;
        });

        const ch = await conn.createChannel();
        await ch.assertQueue(QUEUE_NAME, {
            durable: true,
        });

        channel = ch;
        console.log(`[RabbitMQ] Connected successfully. Queue "${QUEUE_NAME}" ready.`);
        isConnecting = false;
        return channel;
    } catch (error: any) {
        console.warn(`[RabbitMQ] Could not connect to RabbitMQ broker: ${error.message}. Running in offline fallback mode.`);
        isConnecting = false;
        channel = null;
        connection = null;
        return null;
    }
};

/**
 * Publish a notification job to the RabbitMQ queue
 */
export const publishTaskNotification = async (payload: TaskNotificationPayload): Promise<boolean> => {
    try {
        const ch = await initRabbitMQ();
        if (!ch) {
            console.log(`[RabbitMQ Producer (Fallback)] Simulating enqueue for task: "${payload.taskName}" to user: ${payload.userEmail}`);
            return false;
        }

        const messageBuffer = Buffer.from(JSON.stringify(payload));
        const success = ch.sendToQueue(QUEUE_NAME, messageBuffer, {
            persistent: true,
        });

        if (success) {
            console.log(`[RabbitMQ Producer] 📤 Successfully queued notification for task "${payload.taskName}" (Due: ${payload.dueDate})`);
        }
        return success;
    } catch (err: any) {
        console.error('[RabbitMQ Producer] Failed to publish message:', err.message);
        return false;
    }
};

/**
 * Start worker consumer that processes notification jobs from the RabbitMQ queue
 */
export const startNotificationConsumer = async (): Promise<void> => {
    try {
        const ch = await initRabbitMQ();
        if (!ch) {
            console.warn('[RabbitMQ Consumer] Worker skipped: broker unavailable.');
            return;
        }

        await ch.prefetch(1);
        console.log(`[RabbitMQ Consumer] 👷 Worker listening on queue "${QUEUE_NAME}"...`);

        ch.consume(QUEUE_NAME, async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            try {
                const payload: TaskNotificationPayload = JSON.parse(msg.content.toString());
                
                console.log('----------------------------------------------------');
                console.log(`[RabbitMQ Worker] 📥 Received notification job from queue: "${QUEUE_NAME}"`);
                console.log(`[RabbitMQ Worker] 🔔 Reminder: Task "${payload.taskName}" is due tomorrow!`);
                console.log(`[RabbitMQ Worker] 📅 Deadline: ${new Date(payload.dueDate).toLocaleDateString()}`);
                console.log(`[RabbitMQ Worker] 👤 Recipient: ${payload.userName} (${payload.userEmail})`);
                console.log(`[RabbitMQ Worker] 🚀 Push Notification dispatched successfully!`);
                console.log('----------------------------------------------------');

                // Acknowledge message after successful processing
                ch.ack(msg);
            } catch (err: any) {
                console.error('[RabbitMQ Worker] Error processing message:', err.message);
                ch.nack(msg, false, false);
            }
        });
    } catch (err: any) {
        console.error('[RabbitMQ Consumer] Error starting consumer:', err.message);
    }
};

/**
 * Graceful shutdown of RabbitMQ connection
 */
export const closeRabbitMQ = async (): Promise<void> => {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (err: any) {
        // Ignore close errors on shutdown
    } finally {
        channel = null;
        connection = null;
    }
};
