import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;
let isConnected = false;

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = parseInt(process.env.REDIS_PORT || '6379', 10);
const username = process.env.REDIS_USERNAME || 'default';
const password = process.env.REDIS_PASSWORD || '';
const isTls = process.env.REDIS_TLS === 'true' || process.env.REDIS_TLS === true;

/**
 * Creates and initializes the official Redis client with TLS support.
 * Never logs or exposes credentials.
 */
export async function connectRedis() {
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    const protocol = isTls ? 'rediss' : 'redis';
    const authPart = password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
    const url = `${protocol}://${authPart}${host}:${port}`;

    redisClient = createClient({
      url,
      socket: {
        tls: isTls,
        rejectUnauthorized: true,
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            console.error('❌ Redis reconnect attempt limit reached (20 attempts).');
            return new Error('Redis reconnection exhausted');
          }
          const delay = Math.min(retries * 200, 3000);
          console.warn(`🔄 Reconnecting to Redis in ${delay}ms (attempt #${retries})...`);
          return delay;
        }
      }
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      console.error(`❌ Redis Client Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      console.log(`🔌 Redis socket connecting to ${host}:${port} (TLS: ${isTls})...`);
    });

    redisClient.on('ready', () => {
      isConnected = true;
      console.log(`✅ Redis Client Ready and Connected (Host: ${host}:${port}, TLS: ${isTls})`);
    });

    redisClient.on('end', () => {
      isConnected = false;
      console.warn('⚠️ Redis Connection Closed.');
    });

    await redisClient.connect();
    isConnected = true;
    return redisClient;
  } catch (error) {
    isConnected = false;
    console.error(`❌ Redis Connection Initialization Error: ${error.message}`);
    console.warn('⚠️ Server will continue running, but temporary real-time caching in Redis will be bypassed until reconnected.');
    return null;
  }
}

/**
 * Test Redis connectivity via PING command.
 * Returns 'PONG' on success.
 */
export async function redisPing() {
  if (!redisClient || !isConnected) {
    await connectRedis();
  }
  if (!redisClient) {
    throw new Error('Redis client is not available');
  }
  return await redisClient.ping();
}

/**
 * Returns the active Redis client instance
 */
export function getRedisClient() {
  return redisClient;
}

/**
 * Check if Redis is currently connected
 */
export function isRedisConnected() {
  return isConnected && redisClient?.isOpen;
}

/* ==========================================================================
   TEMPORARY REAL-TIME STATE MANAGERS (REDIS)
   ========================================================================== */

const WORKER_PRESENCE_KEY_PREFIX = 'presence:worker:';
const WORKER_LOCATION_KEY_PREFIX = 'telemetry:worker:';
const ACTIVE_OFFER_KEY_PREFIX = 'dispatch:offer:';
const SOCKET_USER_KEY_PREFIX = 'socket:user:';

/**
 * Set worker online/offline presence in Redis with heartbeat expiration
 */
export async function setWorkerPresence(workerId, { status = 'online', socketId = null, serviceArea = 'Krishnagiri' } = {}) {
  if (!isRedisConnected()) return null;
  try {
    const key = `${WORKER_PRESENCE_KEY_PREFIX}${workerId}`;
    const data = {
      workerId,
      status,
      socketId: socketId || '',
      serviceArea,
      updatedAt: new Date().toISOString()
    };
    // Keep alive for 2 hours without ping, or persist until explicit offline
    if (status === 'online') {
      await redisClient.set(key, JSON.stringify(data), { EX: 7200 });
      await redisClient.sAdd('presence:online_workers', workerId);
    } else {
      await redisClient.set(key, JSON.stringify(data), { EX: 3600 });
      await redisClient.sRem('presence:online_workers', workerId);
    }
    return data;
  } catch (err) {
    console.warn(`[Redis Presence Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Get worker presence from Redis
 */
export async function getWorkerPresence(workerId) {
  if (!isRedisConnected()) return null;
  try {
    const raw = await redisClient.get(`${WORKER_PRESENCE_KEY_PREFIX}${workerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Get all online worker IDs from Redis set
 */
export async function getOnlineWorkerIds() {
  if (!isRedisConnected()) return [];
  try {
    return await redisClient.sMembers('presence:online_workers');
  } catch (err) {
    return [];
  }
}

/**
 * Cache real-time GPS coordinate ping in Redis (Ephemeral ephemeral storage with 15 min TTL)
 */
export async function setWorkerLiveLocation(workerId, { latitude, longitude, speed = 0, heading = 0, accuracy = 5, bookingId = null } = {}) {
  if (!isRedisConnected()) return null;
  try {
    const key = `${WORKER_LOCATION_KEY_PREFIX}${workerId}`;
    const payload = {
      workerId,
      bookingId: bookingId || '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speed: parseFloat(speed),
      heading: parseFloat(heading),
      accuracy: parseFloat(accuracy),
      timestamp: new Date().toISOString()
    };
    // Cache for 900 seconds (15 minutes)
    await redisClient.set(key, JSON.stringify(payload), { EX: 900 });
    return payload;
  } catch (err) {
    console.warn(`[Redis Telemetry Cache Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Retrieve cached real-time GPS coordinate from Redis
 */
export async function getWorkerLiveLocation(workerId) {
  if (!isRedisConnected()) return null;
  try {
    const raw = await redisClient.get(`${WORKER_LOCATION_KEY_PREFIX}${workerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Cache temporary assignment offer in Redis with strict countdown TTL
 */
export async function cacheActiveOffer(offerId, offerData, ttlSeconds = 60) {
  if (!isRedisConnected()) return null;
  try {
    const key = `${ACTIVE_OFFER_KEY_PREFIX}${offerId}`;
    await redisClient.set(key, JSON.stringify(offerData), { EX: ttlSeconds });
    return offerData;
  } catch (err) {
    return null;
  }
}

/**
 * Get active assignment offer from Redis
 */
export async function getActiveOffer(offerId) {
  if (!isRedisConnected()) return null;
  try {
    const raw = await redisClient.get(`${ACTIVE_OFFER_KEY_PREFIX}${offerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Remove active assignment offer from Redis
 */
export async function deleteActiveOffer(offerId) {
  if (!isRedisConnected()) return false;
  try {
    await redisClient.del(`${ACTIVE_OFFER_KEY_PREFIX}${offerId}`);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Track user active socket mapping in Redis
 */
export async function registerSocketSession(socketId, { userId, role }) {
  if (!isRedisConnected()) return null;
  try {
    const key = `${SOCKET_USER_KEY_PREFIX}${socketId}`;
    const data = { userId, role, connectedAt: new Date().toISOString() };
    await redisClient.set(key, JSON.stringify(data), { EX: 86400 });
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Remove socket session on disconnect
 */
export async function removeSocketSession(socketId) {
  if (!isRedisConnected()) return false;
  try {
    await redisClient.del(`${SOCKET_USER_KEY_PREFIX}${socketId}`);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Graceful shutdown handler
 */
export async function shutdownRedis() {
  if (redisClient && isConnected) {
    try {
      console.log('🛑 Gracefully closing Redis connection...');
      await redisClient.quit();
      isConnected = false;
      console.log('✅ Redis connection closed gracefully.');
    } catch (err) {
      console.error('Error during Redis shutdown:', err.message);
    }
  }
}

// Register process exit listeners for clean shutdown
process.on('SIGINT', async () => {
  await shutdownRedis();
});

process.on('SIGTERM', async () => {
  await shutdownRedis();
});
