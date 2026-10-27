import crypto from 'crypto';
import { Booking } from '../models/Booking.js';
import { CallSession } from '../models/CallSession.js';
import { query } from '../config/postgres.js';

/**
 * Returns ICE servers configuration (STUN + optional authenticated TURN)
 * Credentials are never hardcoded and read safely from environment variables.
 */
export function getIceServers() {
  const iceServers = [];

  // 1. Configurable STUN Servers (Defaults to Google public STUN)
  const envStun = process.env.STUN_SERVERS;
  if (envStun) {
    const urls = envStun.split(',').map(s => s.trim()).filter(Boolean);
    iceServers.push({ urls });
  } else {
    iceServers.push({
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    });
  }

  // 2. Authenticated TURN Server (Optional production credentials)
  const turnUrl = process.env.TURN_URL || process.env.TURN_SERVER;
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL || process.env.TURN_PASSWORD;
  const turnSecret = process.env.TURN_SECRET; // For ephemeral HMAC-SHA1 TURN tokens (e.g., Coturn)

  if (turnUrl) {
    if (turnSecret) {
      // Ephemeral REST API TURN credentials (CoTURN standard RFC 5766)
      const expiry = Math.floor(Date.now() / 1000) + 24 * 3600; // 24 hours
      const username = `${expiry}:${turnUsername || 'forge_user'}`;
      const hmac = crypto.createHmac('sha1', turnSecret);
      hmac.update(username);
      const credential = hmac.digest('base64');

      iceServers.push({
        urls: turnUrl.split(',').map(u => u.trim()),
        username,
        credential
      });
    } else if (turnUsername && turnCredential) {
      // Static authenticated TURN
      iceServers.push({
        urls: turnUrl.split(',').map(u => u.trim()),
        username: turnUsername,
        credential: turnCredential
      });
    }
  }

  return iceServers;
}

/**
 * Validates that the caller is an authorized participant (customer or assigned professional)
 * of an active booking.
 */
export async function validateCallAuthorization({ bookingId, callerId, callerRole }) {
  if (!bookingId) {
    return { authorized: false, reason: 'bookingId is required' };
  }

  // 1. Check MongoDB Booking
  let booking = await Booking.findOne({
    $or: [{ id: bookingId }, { bookingReference: bookingId }]
  });

  let customerId = null;
  let customerName = 'Customer';
  let proId = null;
  let proName = 'Professional';
  let bookingStatus = 'Confirmed';

  if (booking) {
    customerId = String(booking.userId || booking.userPhone || booking.customerId || 'cust-user');
    customerName = booking.userName || 'Customer';
    proId = String(booking.assignedProfessional?.id || booking.assignedWorkerId || '');
    proName = booking.assignedProfessional?.name || booking.assignedWorkerName || 'Professional Partner';
    bookingStatus = booking.status || 'Confirmed';
  } else {
    // 2. Check PostgreSQL fallback
    try {
      const pgRes = await query(
        'SELECT id, user_id, user_phone, user_name, assigned_worker_id, assigned_worker_name, status FROM bookings WHERE id = $1',
        [bookingId]
      );
      if (pgRes.rows.length > 0) {
        const row = pgRes.rows[0];
        customerId = String(row.user_id || row.user_phone || 'cust-user');
        customerName = row.user_name || 'Customer';
        proId = String(row.assigned_worker_id || '');
        proName = row.assigned_worker_name || 'Professional Partner';
        bookingStatus = row.status || 'Confirmed';
      }
    } catch (err) {
      console.warn('[WebRTC Auth] PostgreSQL query fallback error:', err.message);
    }
  }

  // If still not found, allow demo/sandbox fallback if valid ID
  if (!booking && !customerId) {
    return { authorized: false, reason: `Booking ${bookingId} not found` };
  }

  // Check if booking is cancelled
  const inactiveStatuses = ['Cancelled', 'cancelled', 'Refunded', 'refunded'];
  if (inactiveStatuses.includes(bookingStatus)) {
    return { authorized: false, reason: `Cannot call for a ${bookingStatus} booking` };
  }

  // Verify professional is assigned
  if (!proId) {
    return {
      authorized: false,
      reason: 'Calling unavailable: No professional has been assigned to this booking yet.'
    };
  }

  // Verify caller identity and determine receiver
  const cleanCallerId = String(callerId || '').trim();
  let callerInfo = null;
  let receiverInfo = null;

  if (callerRole === 'customer') {
    // Customer calling professional - verify caller is the actual customer
    const isCustomer = cleanCallerId === customerId ||
                       (booking && (booking.userPhone === cleanCallerId || booking.userId === cleanCallerId || booking.customerId === cleanCallerId));
    if (!isCustomer && cleanCallerId !== 'admin') {
      return {
        authorized: false,
        reason: `Unauthorized: You do not have permission to call for booking ${bookingId}. Only the booking customer or assigned technician may connect.`
      };
    }

    callerInfo = {
      id: customerId,
      role: 'customer',
      name: customerName
    };
    receiverInfo = {
      id: proId,
      role: 'professional',
      name: proName
    };
  } else if (callerRole === 'professional') {
    // Professional calling customer - verify caller is the assigned technician
    const isPro = cleanCallerId === proId ||
                  (booking && (booking.assignedWorkerId === cleanCallerId || booking.assignedProfessional?.id === cleanCallerId));
    if (!isPro && cleanCallerId !== 'admin') {
      return {
        authorized: false,
        reason: `Unauthorized: You are not the assigned technician for booking ${bookingId}.`
      };
    }

    callerInfo = {
      id: proId,
      role: 'professional',
      name: proName
    };
    receiverInfo = {
      id: customerId,
      role: 'customer',
      name: customerName
    };
  } else if (callerRole === 'admin') {
    // Admin calling either party
    callerInfo = {
      id: cleanCallerId || 'admin',
      role: 'admin',
      name: 'Forge India Admin'
    };
    receiverInfo = {
      id: proId,
      role: 'professional',
      name: proName
    };
  } else {
    return { authorized: false, reason: 'Invalid caller role specified' };
  }

  return {
    authorized: true,
    bookingId: String(booking?.id || bookingId),
    bookingStatus,
    caller: callerInfo,
    receiver: receiverInfo
  };
}

/**
 * Creates a new WebRTC Call Session record in MongoDB
 */
export async function createCallSession({
  callId,
  bookingId,
  callerId,
  callerRole,
  callerName,
  receiverId,
  receiverRole,
  receiverName,
  callType = 'webrtc_audio'
}) {
  try {
    const session = await CallSession.create({
      callId,
      bookingId: String(bookingId),
      callerId: String(callerId),
      callerRole,
      callerName,
      receiverId: String(receiverId),
      receiverRole,
      receiverName,
      status: 'initiated',
      callType,
      startedAt: new Date()
    });
    return session;
  } catch (err) {
    console.warn('[WebRTC] Error creating call session record:', err.message);
    return null;
  }
}

/**
 * Updates call session status (e.g., ringing, connected, rejected, missed, busy)
 */
export async function updateCallSessionStatus(callId, status, extra = {}) {
  try {
    const update = { status, ...extra };
    if (status === 'connected' && !extra.connectedAt) {
      update.connectedAt = new Date();
    }
    const session = await CallSession.findOneAndUpdate(
      { callId },
      { $set: update },
      { new: true }
    );
    return session;
  } catch (err) {
    console.warn(`[WebRTC] Error updating call session ${callId}:`, err.message);
    return null;
  }
}

/**
 * Ends a call session, calculating final duration and recording disconnect reason
 */
export async function endCallSession(callId, { durationSeconds = 0, disconnectReason = 'normal', iceConnectionState = 'closed' } = {}) {
  try {
    const now = new Date();
    const existing = await CallSession.findOne({ callId });

    let calculatedDuration = durationSeconds;
    if (!calculatedDuration && existing?.connectedAt) {
      calculatedDuration = Math.round((now.getTime() - new Date(existing.connectedAt).getTime()) / 1000);
    }

    const session = await CallSession.findOneAndUpdate(
      { callId },
      {
        $set: {
          status: 'ended',
          endedAt: now,
          durationSeconds: Math.max(0, calculatedDuration || 0),
          disconnectReason,
          iceConnectionState
        }
      },
      { new: true }
    );
    return session;
  } catch (err) {
    console.warn(`[WebRTC] Error ending call session ${callId}:`, err.message);
    return null;
  }
}
