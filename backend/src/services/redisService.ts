import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

/**
 * Initialize connection to Redis server
 */
export const initRedis = async (): Promise<RedisClientType | null> => {
    if (redisClient && redisClient.isOpen) return redisClient;
    if (isConnecting) return null;

    isConnecting = true;
    try {
        const client = createClient({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries: number) => {
                    if (retries > 5) {
                        return new Error('Max reconnect attempts reached');
                    }
                    return Math.min(retries * 500, 2000);
                },
            },
        });

        client.on('error', (err: any) => {
            // Log quietly to avoid spamming console if Redis is offline
            if (process.env.NODE_ENV !== 'test') {
                console.warn('[Redis] Connection warning:', err?.message || err);
            }
        });

        await client.connect();
        redisClient = client as RedisClientType;
        console.log(`[Redis] Connected successfully to ${REDIS_URL}. Token blacklisting active.`);
        isConnecting = false;
        return redisClient;
    } catch (err: any) {
        console.warn(`[Redis] Could not connect to Redis at ${REDIS_URL}: ${err.message}. Running in offline fallback mode (blacklisting skipped).`);
        isConnecting = false;
        redisClient = null;
        return null;
    }
};

/**
 * Add a token to the blacklist with an expiration TTL
 * @param token The JWT access or refresh token
 * @param expirySeconds Expiration TTL in seconds (default: 86400s / 24 hours)
 */
export const blacklistToken = async (token: string, expirySeconds = 86400): Promise<boolean> => {
    try {
        const client = await initRedis();
        if (!client || !client.isOpen) {
            console.log('[Redis Fallback] Redis offline: skipping token blacklisting.');
            return false;
        }

        const key = `blacklist:${token}`;
        await client.set(key, 'revoked', { EX: expirySeconds });
        console.log(`[Redis] 🚫 Token successfully blacklisted (TTL: ${expirySeconds}s).`);
        return true;
    } catch (err: any) {
        console.error('[Redis] Error blacklisting token:', err.message);
        return false;
    }
};

/**
 * Check if a token is in the Redis blacklist
 * @param token The JWT token to verify
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    try {
        const client = await initRedis();
        if (!client || !client.isOpen) {
            return false;
        }

        const key = `blacklist:${token}`;
        const result = await client.get(key);
        return result === 'revoked';
    } catch (err: any) {
        // If Redis query fails, fall back gracefully to allow authentication check
        return false;
    }
};

/**
 * Close Redis connection cleanly
 */
export const closeRedis = async (): Promise<void> => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.quit();
        }
    } catch (err) {
        // Ignore quit errors during shutdown
    } finally {
        redisClient = null;
    }
};
