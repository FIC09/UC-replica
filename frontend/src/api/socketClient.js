/**
 * Socket Client Stub (Pure MongoDB REST Mode)
 * WebSockets removed per user specification.
 * Provides a safe no-op socket interface so components render and operate smoothly via REST APIs.
 */

const noopSocket = {
  id: 'rest_mode',
  connected: false,
  on: () => noopSocket,
  off: () => noopSocket,
  emit: () => noopSocket,
  join: () => noopSocket,
  leave: () => noopSocket,
  disconnect: () => {}
};

export function getSocket(customAuth = {}) {
  return noopSocket;
}

export function joinRoom(room, token = null) {}

export function leaveRoom(room) {}

export function sendWorkerGpsPing(telemetryData) {}

export function sendWorkerPresence(workerId, status = 'online') {}

export function disconnectSocket() {}

export default getSocket;
