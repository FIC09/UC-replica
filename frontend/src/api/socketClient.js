import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Returns the singleton authenticated Socket.IO client instance.
 * Automatically picks up credentials from sessionStorage / localStorage.
 */
export function getSocket(customAuth = {}) {
  if (!socketInstance) {
    const adminToken = sessionStorage.getItem('uc_admin_token') || localStorage.getItem('uc_admin_token');
    const proToken = sessionStorage.getItem('uc_pro_token') || localStorage.getItem('uc_pro_token');
    const proId = localStorage.getItem('uc_pro_id') || 'PRO-8841';
    const partnerToken = sessionStorage.getItem('uc_partner_token') || localStorage.getItem('uc_partner_token');
    const partnerId = localStorage.getItem('uc_partner_id') || 'PTR-90142';

    let user = null;
    try {
      const userStr = localStorage.getItem('uc_user');
      if (userStr) user = JSON.parse(userStr);
    } catch {}

    const token = customAuth.token || adminToken || proToken || partnerToken || '';
    const role = customAuth.role || (adminToken ? 'admin' : proToken ? 'professional' : partnerToken ? 'partner' : 'customer');
    const userId = customAuth.userId || (adminToken ? 'admin' : proToken ? proId : partnerToken ? partnerId : (user?.phone || user?._id || 'guest'));

    socketInstance = io({
      autoConnect: true,
      auth: {
        token,
        userId,
        role,
        proId: proToken ? proId : undefined,
        partnerId: partnerToken ? partnerId : undefined,
        ...customAuth
      },
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log(`⚡ [SocketClient] Connected: id=${socketInstance.id} role=${role}`);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('⚠️ [SocketClient] Connection error:', err.message);
    });

    socketInstance.on('error', (err) => {
      console.warn('⚠️ [SocketClient] Server error event:', err);
    });
  }

  return socketInstance;
}

/**
 * Join an authorized room (e.g. 'booking:UC-123456', 'admin:operations', 'worker:WRK-101')
 */
export function joinRoom(room, token = null) {
  const s = getSocket();
  if (s) {
    s.emit('join_room', { room, token });
    s.emit('join:room', room);
  }
}

/**
 * Leave an active room
 */
export function leaveRoom(room) {
  const s = getSocket();
  if (s) {
    s.emit('leave_room', { room });
    s.emit('leave:room', room);
  }
}

/**
 * Emit real-time GPS telemetry from professional worker device
 */
export function sendWorkerGpsPing(telemetryData) {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('worker_gps_ping', telemetryData);
  }
}

/**
 * Update worker online / offline presence
 */
export function sendWorkerPresence(workerId, status = 'online') {
  const s = getSocket();
  if (s && s.connected) {
    s.emit('worker_presence', { workerId, status });
  }
}

/**
 * Close socket connection cleanly
 */
export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export default getSocket;
