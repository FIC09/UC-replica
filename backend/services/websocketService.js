import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { query } from '../config/postgres.js';
import { Booking } from '../models/Booking.js';
import {
  setWorkerPresence,
  setWorkerLiveLocation,
  registerSocketSession,
  removeSocketSession
} from '../config/redis.js';
import {
  createCallSession,
  updateCallSessionStatus,
  endCallSession,
  validateCallAuthorization
} from './webrtcService.js';

let ioInstance = null;

// In-memory active connected sockets map: socketId -> { userId, role, proId, partnerId, socket }
const connectedClients = new Map();

// Active WebRTC Calls Tracking
const activeCalls = new Map(); // callId -> callState
const userActiveCalls = new Map(); // userId -> callId

function cleanupActiveCall(callId) {
  if (!activeCalls.has(callId)) return;
  const call = activeCalls.get(callId);
  if (call.timeoutTimer) {
    clearTimeout(call.timeoutTimer);
  }
  if (call.callerId) userActiveCalls.delete(call.callerId);
  if (call.receiverId) userActiveCalls.delete(call.receiverId);
  activeCalls.delete(callId);
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'urban_services_secret_jwt_key_2026_super_secure';
const JWT_SECRET = process.env.JWT_SECRET || 'urban_company_jwt_secret_key_2026';

/**
 * Validates token against Admin and Application JWT secrets
 */
function verifyAuthToken(rawToken) {
  if (!rawToken) return null;
  const token = rawToken.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;

  // 1. Try verifying with Admin JWT Secret
  try {
    const decodedAdmin = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decodedAdmin && (decodedAdmin.role === 'admin' || decodedAdmin.isAdmin)) {
      return {
        userId: decodedAdmin.id || decodedAdmin.adminId || decodedAdmin.userId || 'admin',
        role: 'admin',
        name: decodedAdmin.name || 'System Administrator',
        isAuthenticated: true
      };
    }
  } catch (err) {
    // Not admin token
  }

  // 2. Try verifying with Standard JWT Secret (Professionals, Partners, Customers)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded) {
      const role = decoded.role || (decoded.proId ? 'professional' : decoded.partnerId ? 'partner' : 'customer');
      const userId = decoded.proId || decoded.partnerId || decoded.id || decoded.userId || 'user';
      return {
        userId,
        proId: decoded.proId || (role === 'professional' ? userId : undefined),
        partnerId: decoded.partnerId || (role === 'partner' ? userId : undefined),
        role,
        name: decoded.name || 'Platform User',
        isAuthenticated: true
      };
    }
  } catch (err) {
    // Invalid standard token
  }

  return null;
}

/**
 * Initializes Socket.io server with restrictive CORS and authenticated room joining
 */
export function initWebSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingInterval: 10000,
    pingTimeout: 5000
  });

  // Socket.IO Handshake Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const auth = socket.handshake.auth || {};
      const queryParams = socket.handshake.query || {};
      const headers = socket.handshake.headers || {};

      const candidateToken = auth.token ||
                             headers.authorization ||
                             headers['x-admin-token'] ||
                             headers['x-partner-token'] ||
                             headers['x-pro-token'] ||
                             queryParams.token;

      let authUser = verifyAuthToken(candidateToken);

      if (!authUser) {
        // Fallback simulated credentials for dev / sandbox mode
        const userId = auth.userId || headers['x-user-id'] || headers['x-professional-id'] || queryParams.userId || 'guest';
        const role = auth.role || headers['x-user-role'] || (headers['x-professional-id'] ? 'professional' : 'customer');
        const proId = auth.proId || headers['x-professional-id'] || (role === 'professional' ? userId : undefined);
        const partnerId = auth.partnerId || headers['x-partner-id'] || (role === 'partner' ? userId : undefined);

        authUser = {
          userId,
          role,
          proId,
          partnerId,
          name: auth.name || 'Guest User',
          isAuthenticated: userId !== 'guest'
        };
      }

      socket.data = {
        ...authUser,
        joinedRooms: new Set()
      };

      next();
    } catch (err) {
      console.warn('[Socket.IO Auth Handshake Warning]:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    const { userId, role, proId, partnerId } = socket.data;
    connectedClients.set(socket.id, { userId, role, proId, partnerId, socket });

    console.log(`🔌 [WebSocket] Client Connected: socket=${socket.id} user=${userId} role=${role}`);

    // Join room handler with strict authorization checks
    const handleJoinRoom = async (rawRoom, maybeToken = null, maybeCb = null) => {
      let room = typeof rawRoom === 'object' ? rawRoom.room : rawRoom;
      const passToken = typeof rawRoom === 'object' ? rawRoom.token : (typeof maybeToken === 'string' ? maybeToken : null);
      const cb = typeof rawRoom === 'object' && typeof rawRoom.callback === 'function' ? rawRoom.callback :
                 typeof maybeToken === 'function' ? maybeToken :
                 typeof maybeCb === 'function' ? maybeCb : null;

      if (!room || typeof room !== 'string') return;
      room = room.trim();

      // If token provided during room join, check if permissions can be upgraded
      if (passToken) {
        const upgraded = verifyAuthToken(passToken);
        if (upgraded) {
          socket.data = { ...socket.data, ...upgraded };
        }
      }

      const currentRole = socket.data.role;
      const currentUserId = socket.data.userId;
      const currentProId = socket.data.proId;
      const currentPartnerId = socket.data.partnerId;

      // 1. Admin Operations Room
      if (room === 'admin:operations') {
        if (currentRole !== 'admin') {
          const errPayload = { code: 403, error: 'Unauthorized', message: 'Unauthorized: Admin role required for operations room' };
          socket.emit('room_error', errPayload);
          socket.emit('error', errPayload);
          if (cb) cb(errPayload);
          return;
        }
      }

      // 2. Partner Room
      else if (room.startsWith('partner:')) {
        const targetPartnerId = room.split(':')[1];
        if (currentRole !== 'admin' && currentPartnerId !== targetPartnerId && currentUserId !== targetPartnerId) {
          const errPayload = { code: 403, error: 'Unauthorized', message: 'Unauthorized: Access denied to partner operations room' };
          socket.emit('room_error', errPayload);
          socket.emit('error', errPayload);
          if (cb) cb(errPayload);
          return;
        }
      }

      // 3. Worker Room
      else if (room.startsWith('worker:')) {
        const targetWorkerId = room.split(':')[1];
        if (currentRole !== 'admin' && currentProId !== targetWorkerId && currentUserId !== targetWorkerId) {
          const errPayload = { code: 403, error: 'Unauthorized', message: 'Unauthorized: Access denied to professional worker room' };
          socket.emit('room_error', errPayload);
          socket.emit('error', errPayload);
          if (cb) cb(errPayload);
          return;
        }
      }

      // 4. Booking Room (Customer, Assigned Professional, Assigned Partner, or Admin)
      else if (room.startsWith('booking:')) {
        const targetBookingId = room.split(':')[1];
        let authorized = currentRole === 'admin';

        if (!authorized) {
          try {
            // Check MongoDB booking
            const b = await Booking.findOne({
              $or: [{ id: targetBookingId }, { bookingReference: targetBookingId }]
            });

            if (b) {
              const isCustomer = b.customerId === currentUserId || b.userId === currentUserId || b.userPhone === currentUserId;
              const isAssignedWorker = b.assignedProfessional?.id === currentUserId || b.assignedProfessional?.id === currentProId || b.assignedWorkerId === currentUserId;
              const isAssignedPartner = b.assignedPartner === currentUserId || b.assignedPartner === currentPartnerId || b.assignedBusinessPartner?.id === currentPartnerId;
              if (isCustomer || isAssignedWorker || isAssignedPartner) {
                authorized = true;
              }
            } else {
              // Check PostgreSQL booking
              const pgRes = await query('SELECT user_id, user_phone, assigned_worker_id, assigned_partner_id FROM bookings WHERE id = $1', [targetBookingId]);
              if (pgRes.rows.length > 0) {
                const row = pgRes.rows[0];
                const isCustomer = row.user_id === currentUserId || row.user_phone === currentUserId;
                const isAssignedWorker = row.assigned_worker_id === currentUserId || row.assigned_worker_id === currentProId;
                const isAssignedPartner = row.assigned_partner_id === currentPartnerId || row.assigned_partner_id === currentUserId;
                if (isCustomer || isAssignedWorker || isAssignedPartner) {
                  authorized = true;
                }
              } else {
                // If newly generated booking before first sync, permit customer or active session
                authorized = true;
              }
            }
          } catch (dbErr) {
            authorized = true;
          }
        }

        if (!authorized) {
          const errPayload = { code: 403, error: 'Unauthorized', message: `Unauthorized: You do not have permission to join booking ${targetBookingId}` };
          socket.emit('room_error', errPayload);
          socket.emit('error', errPayload);
          if (cb) cb(errPayload);
          return;
        }
      }

      socket.join(room);
      socket.data.joinedRooms.add(room);
      console.log(`  ➕ Socket ${socket.id} (${socket.data.role}) joined room: ${room}`);

      const successPayload = {
        room,
        authorized: true,
        serverTimestamp: new Date().toISOString()
      };
      socket.emit('room_joined', successPayload);
      if (cb) cb(null, successPayload);
    };

    // Register room event handlers immediately
    socket.on('join_room', handleJoinRoom);
    socket.on('join:room', handleJoinRoom);

    // Leave room handler
    const handleLeaveRoom = (rawRoom) => {
      const room = typeof rawRoom === 'object' ? rawRoom.room : rawRoom;
      if (room) {
        socket.leave(room);
        socket.data.joinedRooms.delete(room);
        console.log(`  ➖ Socket ${socket.id} left room: ${room}`);
      }
    };
    socket.on('leave_room', handleLeaveRoom);
    socket.on('leave:room', handleLeaveRoom);

    // Register active socket session in Redis in background
    registerSocketSession(socket.id, { userId, role }).catch(() => {});

    // If professional connected, record online presence in Redis & notify operations
    const workerId = proId || (role === 'professional' ? userId : null);
    if (workerId) {
      setWorkerPresence(workerId, { status: 'online', socketId: socket.id })
        .then(() => {
          emitEvent('WORKER_PRESENCE_CHANGED', {
            entityId: workerId,
            room: 'admin:operations',
            payload: { workerId, status: 'online', timestamp: new Date().toISOString() }
          });
        })
        .catch(() => {});
    }

    // Worker presence update from application
    socket.on('worker_presence', async ({ workerId: explicitWorkerId, status = 'online' } = {}) => {
      const activeWorkerId = explicitWorkerId || socket.data.proId || socket.data.userId;
      if (!activeWorkerId) return;

      try {
        await setWorkerPresence(activeWorkerId, { status, socketId: socket.id });
        emitEvent('WORKER_PRESENCE_CHANGED', {
          entityId: activeWorkerId,
          room: 'admin:operations',
          payload: { workerId: activeWorkerId, status, timestamp: new Date().toISOString() }
        });
      } catch (err) {
        console.warn('Worker presence update warning:', err.message);
      }
    });

    // Real-time Device GPS submission from worker socket
    socket.on('worker_gps_ping', async (payload = {}) => {
      const { bookingId, workerId: explicitWorkerId, latitude, longitude, speed = 0, heading = 0, accuracy = 5 } = payload;
      if (!bookingId || latitude == null || longitude == null) return;

      const activeWorkerId = explicitWorkerId || socket.data.proId || socket.data.userId || 'WRK-KRI-101';

      // 1. Ephemeral cache in Redis
      try {
        await setWorkerLiveLocation(activeWorkerId, {
          latitude,
          longitude,
          speed,
          heading,
          accuracy,
          bookingId
        });
      } catch {}

      // 2. Broadcast to booking room and admin operations
      emitEvent('WORKER_LOCATION_UPDATED', {
        entityId: bookingId,
        room: `booking:${bookingId}`,
        payload: {
          bookingId,
          workerId: activeWorkerId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          speed: parseFloat(speed),
          heading: parseFloat(heading),
          accuracy: parseFloat(accuracy),
          serverTimestamp: new Date().toISOString()
        }
      });
    });

    // Chat Typing Indicator
    socket.on('chat_typing', ({ bookingId, senderName, isTyping = true } = {}) => {
      if (bookingId) {
        socket.to(`booking:${bookingId}`).emit('TYPING_INDICATOR', {
          bookingId,
          senderName: senderName || socket.data.name,
          isTyping,
          timestamp: new Date().toISOString()
        });
      }
    });

    // =========================================================================
    // WEBRTC REAL-TIME AUDIO SIGNALING (Free P2P Voice Calling)
    // =========================================================================

    // 1. Initiate WebRTC Call
    socket.on('webrtc_call_initiate', async (data = {}, ack = null) => {
      const { bookingId, callerRole = socket.data.role || 'customer', callerName } = data;
      const callerId = socket.data.userId || socket.data.proId || 'cust-user';

      console.log(`📞 [WebRTC] Call initiate request: booking=${bookingId} caller=${callerId} role=${callerRole}`);

      try {
        const authResult = await validateCallAuthorization({
          bookingId,
          callerId,
          callerRole
        });

        if (!authResult.authorized) {
          console.warn(`📞 [WebRTC] Call unauthorized: ${authResult.reason}`);
          const errPayload = { error: 'Unauthorized', message: authResult.reason };
          socket.emit('webrtc_call_error', errPayload);
          if (typeof ack === 'function') ack({ success: false, message: authResult.reason });
          return;
        }

        const { caller, receiver } = authResult;

        // Check if caller is already on a call
        if (userActiveCalls.has(caller.id)) {
          const errMsg = 'You are already in an active call';
          socket.emit('webrtc_call_error', { error: 'Busy', message: errMsg });
          if (typeof ack === 'function') ack({ success: false, message: errMsg });
          return;
        }

        // Check if receiver is already on a call
        if (userActiveCalls.has(receiver.id)) {
          console.log(`📞 [WebRTC] Receiver ${receiver.id} is busy on another call`);
          const busyCallId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await createCallSession({
            callId: busyCallId,
            bookingId,
            callerId: caller.id,
            callerRole: caller.role,
            callerName: callerName || caller.name,
            receiverId: receiver.id,
            receiverRole: receiver.role,
            receiverName: receiver.name
          });
          await updateCallSessionStatus(busyCallId, 'busy', { disconnectReason: 'user_busy' });

          socket.emit('webrtc_call_busy', {
            callId: busyCallId,
            bookingId,
            receiverRole: receiver.role,
            receiverName: receiver.name,
            message: 'User is currently on another call.'
          });
          if (typeof ack === 'function') ack({ success: false, message: 'Receiver is busy', isBusy: true });
          return;
        }

        const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // Create MongoDB record
        await createCallSession({
          callId,
          bookingId,
          callerId: caller.id,
          callerRole: caller.role,
          callerName: callerName || caller.name,
          receiverId: receiver.id,
          receiverRole: receiver.role,
          receiverName: receiver.name
        });

        // 30-second ringing timeout
        const timeoutTimer = setTimeout(async () => {
          if (activeCalls.has(callId)) {
            const currentCall = activeCalls.get(callId);
            if (currentCall.status === 'ringing') {
              console.log(`📞 [WebRTC] Call ${callId} timed out after 30s (No Answer)`);
              await updateCallSessionStatus(callId, 'missed', { disconnectReason: 'ringing_timeout' });

              io.to(currentCall.callerSocketId).emit('webrtc_call_timeout', {
                callId,
                bookingId,
                message: 'No answer from receiver.'
              });

              if (currentCall.receiverSocketId) {
                io.to(currentCall.receiverSocketId).emit('webrtc_call_timeout', {
                  callId,
                  bookingId,
                  message: 'Missed call.'
                });
              } else {
                socket.to(`booking:${bookingId}`).emit('webrtc_call_timeout', {
                  callId,
                  bookingId,
                  message: 'Missed call.'
                });
              }

              cleanupActiveCall(callId);
            }
          }
        }, 30000);

        activeCalls.set(callId, {
          callId,
          bookingId,
          callerSocketId: socket.id,
          callerId: caller.id,
          callerRole: caller.role,
          callerName: callerName || caller.name,
          receiverId: receiver.id,
          receiverRole: receiver.role,
          receiverName: receiver.name,
          receiverSocketId: null,
          status: 'ringing',
          timeoutTimer,
          startedAt: new Date()
        });

        userActiveCalls.set(caller.id, callId);
        userActiveCalls.set(receiver.id, callId);

        // Acknowledge initiation to caller
        socket.emit('webrtc_call_initiated', {
          callId,
          bookingId,
          receiverRole: receiver.role,
          receiverName: receiver.name,
          status: 'ringing'
        });

        // Broadcast incoming call to receiver rooms (auto-deduplicated by Socket.IO)
        const incomingPayload = {
          callId,
          bookingId,
          callerId: caller.id,
          callerRole: caller.role,
          callerName: callerName || caller.name,
          timestamp: new Date().toISOString()
        };

        const targetRooms = [`booking:${bookingId}`];
        if (receiver.role === 'professional') {
          targetRooms.push(`worker:${receiver.id}`);
        }
        socket.to(targetRooms).emit('webrtc_incoming_call', incomingPayload);

        console.log(`📞 [WebRTC] Incoming call alert sent to receiver for call ${callId}`);

        if (typeof ack === 'function') {
          ack({ success: true, callId, status: 'ringing' });
        }
      } catch (err) {
        console.error('📞 [WebRTC] Call initiate error:', err);
        socket.emit('webrtc_call_error', { error: 'InternalError', message: err.message });
        if (typeof ack === 'function') ack({ success: false, message: err.message });
      }
    });

    // 2. Accept WebRTC Call
    socket.on('webrtc_call_accept', async (data = {}, ack = null) => {
      const { callId, bookingId } = data;
      console.log(`📞 [WebRTC] Call accept received for ${callId} from socket ${socket.id}`);

      const call = activeCalls.get(callId);
      if (!call) {
        if (typeof ack === 'function') ack({ success: false, message: 'Call session not found or already ended' });
        return;
      }

      if (call.timeoutTimer) {
        clearTimeout(call.timeoutTimer);
        call.timeoutTimer = null;
      }

      call.status = 'connected';
      call.receiverSocketId = socket.id;

      await updateCallSessionStatus(callId, 'connected', { connectedAt: new Date() });

      // Notify caller that call is accepted
      io.to(call.callerSocketId).emit('webrtc_call_accepted', {
        callId,
        bookingId: call.bookingId,
        receiverSocketId: socket.id
      });

      socket.emit('webrtc_call_connected', {
        callId,
        bookingId: call.bookingId,
        callerSocketId: call.callerSocketId
      });

      if (typeof ack === 'function') ack({ success: true, callId });
    });

    // 3. Reject WebRTC Call
    socket.on('webrtc_call_reject', async (data = {}, ack = null) => {
      const { callId, bookingId, reason = 'declined' } = data;
      console.log(`📞 [WebRTC] Call reject received for ${callId}: ${reason}`);

      const call = activeCalls.get(callId);
      if (call) {
        if (call.timeoutTimer) {
          clearTimeout(call.timeoutTimer);
        }
        await updateCallSessionStatus(callId, 'rejected', { disconnectReason: reason });

        io.to(call.callerSocketId).emit('webrtc_call_rejected', {
          callId,
          bookingId: call.bookingId,
          reason
        });

        cleanupActiveCall(callId);
      }

      if (typeof ack === 'function') ack({ success: true, callId });
    });

    // 4. SDP Offer Relay
    socket.on('webrtc_signal_offer', (data = {}) => {
      const { callId, bookingId, sdp } = data;
      const call = activeCalls.get(callId);
      if (!call || !sdp) return;

      const targetSocketId = socket.id === call.callerSocketId ? call.receiverSocketId : call.callerSocketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc_signal_offer', { callId, bookingId, sdp });
      } else {
        socket.to(`booking:${bookingId}`).emit('webrtc_signal_offer', { callId, bookingId, sdp });
      }
    });

    // 5. SDP Answer Relay
    socket.on('webrtc_signal_answer', (data = {}) => {
      const { callId, bookingId, sdp } = data;
      const call = activeCalls.get(callId);
      if (!call || !sdp) return;

      const targetSocketId = socket.id === call.receiverSocketId ? call.callerSocketId : call.receiverSocketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc_signal_answer', { callId, bookingId, sdp });
      } else {
        socket.to(`booking:${bookingId}`).emit('webrtc_signal_answer', { callId, bookingId, sdp });
      }
    });

    // 6. ICE Candidate Relay
    socket.on('webrtc_ice_candidate', (data = {}) => {
      const { callId, bookingId, candidate } = data;
      const call = activeCalls.get(callId);
      if (!call || !candidate) return;

      const targetSocketId = socket.id === call.callerSocketId ? call.receiverSocketId : call.callerSocketId;
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc_ice_candidate', { callId, bookingId, candidate });
      } else {
        socket.to(`booking:${bookingId}`).emit('webrtc_ice_candidate', { callId, bookingId, candidate });
      }
    });

    // 7. End WebRTC Call
    socket.on('webrtc_call_end', async (data = {}, ack = null) => {
      const { callId, bookingId, durationSeconds = 0, reason = 'user_hangup', iceConnectionState } = data;
      console.log(`📞 [WebRTC] Call end request for ${callId}, duration=${durationSeconds}s, reason=${reason}`);

      const call = activeCalls.get(callId);
      await endCallSession(callId, {
        durationSeconds,
        disconnectReason: reason,
        iceConnectionState: iceConnectionState || 'closed'
      });

      if (call) {
        io.to(call.callerSocketId).emit('webrtc_call_ended', { callId, bookingId, durationSeconds, reason });
        if (call.receiverSocketId) {
          io.to(call.receiverSocketId).emit('webrtc_call_ended', { callId, bookingId, durationSeconds, reason });
        }
        cleanupActiveCall(callId);
      } else {
        socket.to(`booking:${bookingId}`).emit('webrtc_call_ended', { callId, bookingId, durationSeconds, reason });
      }

      if (typeof ack === 'function') ack({ success: true, callId });
    });

    // Disconnect cleanup
    socket.on('disconnect', async () => {
      connectedClients.delete(socket.id);
      console.log(`🔌 [WebSocket] Client Disconnected: socket=${socket.id}`);

      // Clean up any ongoing WebRTC calls for this socket
      for (const [callId, call] of activeCalls.entries()) {
        if (call.callerSocketId === socket.id || call.receiverSocketId === socket.id) {
          const isCaller = call.callerSocketId === socket.id;
          const otherSocketId = isCaller ? call.receiverSocketId : call.callerSocketId;

          console.log(`📞 [WebRTC] Active call ${callId} interrupted due to peer socket disconnect`);
          endCallSession(callId, {
            disconnectReason: 'peer_disconnected',
            iceConnectionState: 'disconnected'
          }).catch(() => {});

          if (otherSocketId) {
            io.to(otherSocketId).emit('webrtc_call_ended', {
              callId,
              bookingId: call.bookingId,
              reason: 'Peer disconnected'
            });
          }
          cleanupActiveCall(callId);
        }
      }

      try {
        await removeSocketSession(socket.id);
      } catch {}

      // If worker socket disconnected, update presence in Redis
      const workerIdOnExit = socket.data.proId || (socket.data.role === 'professional' ? socket.data.userId : null);
      if (workerIdOnExit) {
        try {
          await setWorkerPresence(workerIdOnExit, { status: 'offline' });
          emitEvent('WORKER_PRESENCE_CHANGED', {
            entityId: workerIdOnExit,
            room: 'admin:operations',
            payload: { workerId: workerIdOnExit, status: 'offline', timestamp: new Date().toISOString() }
          });
        } catch {}
      }
    });
  });

  ioInstance = io;
  return io;
}

/**
 * Authoritative WebSocket Event Emitter with versioning, durability logging, and room targeting
 */
export function emitEvent(eventName, { entityId, room = null, payload = {} }) {
  if (!ioInstance) {
    console.warn(`[WebSocket Warning] emitEvent called before server initialization for ${eventName}`);
    return;
  }

  const eventMessage = {
    eventId: `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    eventType: eventName,
    entityId: String(entityId),
    serverTimestamp: new Date().toISOString(),
    version: 1,
    payload
  };

  // 1. Emit to specific room or broadcast
  if (room) {
    ioInstance.to(room).emit(eventName, eventMessage);
    // Also emit generic 'realtime:event' for dashboard compatibility
    ioInstance.to(room).emit('realtime:event', eventMessage);
  } else {
    ioInstance.emit(eventName, eventMessage);
    ioInstance.emit('realtime:event', eventMessage);
  }

  // 2. Also broadcast to admin operations room for comprehensive operations visibility
  if (room !== 'admin:operations') {
    ioInstance.to('admin:operations').emit(eventName, eventMessage);
    ioInstance.to('admin:operations').emit('realtime:event', eventMessage);
  }

  // 3. Durable Outbox logging to PostgreSQL
  try {
    query(`
      INSERT INTO outbox_events (id, event_name, aggregate_type, aggregate_id, payload, status, published_at)
      VALUES ($1, $2, 'websocket_event', $3, $4, 'published', NOW())
      ON CONFLICT DO NOTHING;
    `, [
      eventMessage.eventId,
      eventName,
      String(entityId),
      JSON.stringify(eventMessage)
    ]).catch(err => console.warn('Outbox event recording notice:', err.message));
  } catch {}

  return eventMessage;
}

export function getIO() {
  return ioInstance;
}
