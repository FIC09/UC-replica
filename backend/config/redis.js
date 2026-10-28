/**
 * In-Memory State Manager (Pure MongoDB Mode - Redis Deactivated)
 * Provides in-memory caches and fast temporary states without requiring an external Redis server.
 */

// In-memory state collections
const memoryStore = new Map();
const onlineWorkersSet = new Set();
const timeoutHandles = new Map();

export async function connectRedis() {
  console.log('⚡ Redis disabled per user configuration (Pure MongoDB Mode)');
  return null;
}

export async function redisPing() {
  return 'DISABLED';
}

export function getRedisClient() {
  return null;
}

export function isRedisConnected() {
  return false;
}

export async function setWorkerPresence(workerId, { status = 'online', socketId = null, serviceArea = 'Krishnagiri' } = {}) {
  const data = {
    workerId,
    status,
    socketId: socketId || '',
    serviceArea,
    updatedAt: new Date().toISOString()
  };
  memoryStore.set(`presence:${workerId}`, data);
  if (status === 'online') {
    onlineWorkersSet.add(workerId);
  } else {
    onlineWorkersSet.delete(workerId);
  }
  return data;
}

export async function getWorkerPresence(workerId) {
  return memoryStore.get(`presence:${workerId}`) || null;
}

export async function getOnlineWorkerIds() {
  return Array.from(onlineWorkersSet);
}

export async function setWorkerLiveLocation(workerId, { latitude, longitude, speed = 0, heading = 0, accuracy = 5, bookingId = null } = {}) {
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
  memoryStore.set(`telemetry:${workerId}`, payload);
  return payload;
}

export async function getWorkerLiveLocation(workerId) {
  return memoryStore.get(`telemetry:${workerId}`) || null;
}

export async function cacheActiveOffer(offerId, offerData, ttlSeconds = 60) {
  memoryStore.set(`offer:${offerId}`, offerData);
  if (timeoutHandles.has(offerId)) {
    clearTimeout(timeoutHandles.get(offerId));
  }
  const timer = setTimeout(() => {
    memoryStore.delete(`offer:${offerId}`);
    timeoutHandles.delete(offerId);
  }, ttlSeconds * 1000);
  timeoutHandles.set(offerId, timer);
  return offerData;
}

export async function getActiveOffer(offerId) {
  return memoryStore.get(`offer:${offerId}`) || null;
}

export async function deleteActiveOffer(offerId) {
  if (timeoutHandles.has(offerId)) {
    clearTimeout(timeoutHandles.get(offerId));
    timeoutHandles.delete(offerId);
  }
  return memoryStore.delete(`offer:${offerId}`);
}

export async function registerSocketSession(socketId, { userId, role }) {
  const data = { userId, role, connectedAt: new Date().toISOString() };
  memoryStore.set(`socket:${socketId}`, data);
  return data;
}

export async function removeSocketSession(socketId) {
  return memoryStore.delete(`socket:${socketId}`);
}

export async function shutdownRedis() {
  memoryStore.clear();
  onlineWorkersSet.clear();
  timeoutHandles.forEach(timer => clearTimeout(timer));
  timeoutHandles.clear();
}

export default {
  connectRedis,
  redisPing,
  getRedisClient,
  isRedisConnected,
  setWorkerPresence,
  getWorkerPresence,
  getOnlineWorkerIds,
  setWorkerLiveLocation,
  getWorkerLiveLocation,
  cacheActiveOffer,
  getActiveOffer,
  deleteActiveOffer,
  registerSocketSession,
  removeSocketSession,
  shutdownRedis
};
