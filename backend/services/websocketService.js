/**
 * WebSocket Service Stub (Pure REST Mode - WebSockets Deactivated)
 * WebSockets removed per user specification.
 * Real-time updates operate via HTTP REST APIs and client polling.
 */

export function initWebSocketServer(httpServer) {
  console.log('⚡ WebSockets deactivated (Pure MongoDB Atlas REST Mode active)');
  return null;
}

export function emitEvent(eventName, eventData = {}) {
  // Safe no-op in pure REST mode
}

export function getSocketServer() {
  return null;
}

export default {
  initWebSocketServer,
  emitEvent,
  getSocketServer
};
