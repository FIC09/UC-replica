import express from 'express';
import { Booking } from '../models/Booking.js';
import { CallSession } from '../models/CallSession.js';
import { initiateMaskedCall, processTelephonyWebhook } from '../services/telephonyService.js';
import { getIceServers, validateCallAuthorization } from '../services/webrtcService.js';
import { query } from '../config/postgres.js';

const router = express.Router();

// High-speed In-Memory Active VoIP Call Cache for 0ms multi-device synchronization
const activeVoipCalls = new Map();

// Helper to sanitize & register active call in memory
function registerActiveCall(session) {
  if (!session || !session.callId) return;
  const data = typeof session.toObject === 'function' ? session.toObject() : { ...session };
  const cleanBookingId = String(data.bookingId || '').replace(/^#/, '').trim();
  const bare = cleanBookingId.replace(/^(UC|JOB|LEAD)[-_]?/i, '');

  activeVoipCalls.set(data.callId, data);
  if (cleanBookingId) activeVoipCalls.set(cleanBookingId, data);
  if (bare) {
    activeVoipCalls.set(bare, data);
    activeVoipCalls.set(`UC-${bare}`, data);
    activeVoipCalls.set(`JOB-${bare}`, data);
  }
  activeVoipCalls.set('latest', data);
}

function updateActiveCallStatus(callId, newStatus, extra = {}) {
  const existing = activeVoipCalls.get(callId) || activeVoipCalls.get('latest');
  if (existing) {
    const updated = { ...existing, status: newStatus, ...extra };
    registerActiveCall(updated);
    if (newStatus === 'ended' || newStatus === 'rejected') {
      setTimeout(() => {
        if (activeVoipCalls.get(callId)?.status === newStatus) {
          activeVoipCalls.delete(callId);
        }
      }, 5000);
    }
    return updated;
  }
  return null;
}

// GET ICE Servers configuration for WebRTC (STUN + authenticated TURN)
router.get('/ice-servers', async (req, res) => {
  try {
    const iceServers = getIceServers();
    res.json({
      success: true,
      iceServers,
      webrtcEnabled: true,
      hasTurn: iceServers.some(s => {
        const u = Array.isArray(s.urls) ? s.urls[0] : s.urls;
        return typeof u === 'string' && u.startsWith('turn:');
      })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Real-time VoIP Call: Start outgoing internet call
router.post('/start', async (req, res) => {
  try {
    const {
      bookingId,
      callerId,
      callerRole = 'customer',
      callerName,
      callerPhone,
      receiverId,
      receiverRole,
      receiverName,
      receiverPhone,
      service
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const cleanBookingId = String(bookingId).replace(/^#/, '').trim();
    const bare = cleanBookingId.replace(/^(UC|JOB|LEAD)[-_]?/i, '');
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // End any stale active calls on this booking
    await CallSession.updateMany(
      {
        $or: [
          { bookingId: cleanBookingId },
          { bookingId: `UC-${bare}` },
          { bookingId: `JOB-${bare}` },
          { bookingId: bare }
        ],
        status: { $in: ['initiated', 'ringing', 'connected'] }
      },
      { $set: { status: 'ended', endedAt: new Date(), disconnectReason: 'superseded_by_new_call' } }
    );

    let resolvedCallerName = callerName;
    let resolvedReceiverName = receiverName;
    let resolvedService = service;

    try {
      const bDoc = await Booking.findOne({
        $or: [
          { id: cleanBookingId },
          { id: `UC-${bare}` },
          { id: `JOB-${bare}` },
          { id: bare },
          { bookingReference: cleanBookingId },
          { bookingReference: `UC-${bare}` }
        ]
      });

      if (bDoc) {
        resolvedService = bDoc.serviceName || bDoc.service || resolvedService || 'Doorstep Service';
        const realCustomer = bDoc.userName || bDoc.customerName || bDoc.customer;
        const realPro = bDoc.assignedPartner || bDoc.assignedProfessional?.name || (bDoc.technician && bDoc.technician.name);

        if (callerRole === 'customer') {
          if (!resolvedCallerName || resolvedCallerName === 'Rahul Sharma' || resolvedCallerName === 'Customer') {
            if (realCustomer) resolvedCallerName = realCustomer;
          }
          if ((!resolvedReceiverName || resolvedReceiverName === 'Specialist') && realPro) {
            resolvedReceiverName = realPro;
          }
        } else {
          if ((!resolvedCallerName || resolvedCallerName === 'Specialist') && realPro) {
            resolvedCallerName = realPro;
          }
          if ((!resolvedReceiverName || resolvedReceiverName === 'Customer' || resolvedReceiverName === 'Rahul Sharma') && realCustomer) {
            resolvedReceiverName = realCustomer;
          }
        }
      }
    } catch (e) {
      console.warn('Booking lookup in VoIP start warning:', e.message);
    }

    const callPayload = {
      callId,
      bookingId: cleanBookingId,
      callerId: String(callerId || callerPhone || 'cust-user'),
      callerRole: callerRole === 'worker' ? 'professional' : callerRole,
      callerName: resolvedCallerName || (callerRole === 'customer' ? 'Customer' : 'Specialist'),
      receiverId: String(receiverId || receiverPhone || 'worker-user'),
      receiverRole: receiverRole === 'worker' ? 'professional' : (receiverRole || (callerRole === 'customer' ? 'professional' : 'customer')),
      receiverName: resolvedReceiverName || (callerRole === 'customer' ? 'Specialist' : 'Customer'),
      status: 'ringing',
      callType: 'webrtc_audio',
      startedAt: new Date(),
      metadata: {
        callerPhone,
        receiverPhone,
        bookingRef: cleanBookingId,
        service: resolvedService || 'Doorstep Service'
      }
    };

    const session = await CallSession.create(callPayload);
    // Instant in-memory cache update
    registerActiveCall(session);

    console.log(`📞 [VoIP Call Started] ${callId} on Booking #${cleanBookingId} (${session.callerName} -> ${session.receiverName})`);
    res.json({ success: true, callId, session });
  } catch (error) {
    console.error('VoIP call start error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

async function enrichCallSessionWithBooking(callData) {
  if (!callData) return callData;
  const targetBookingId = callData.bookingId || '';
  const cleanId = String(targetBookingId).replace(/^#/, '').trim();
  const bare = cleanId.replace(/^(UC|JOB|LEAD)[-_]?/i, '');

  try {
    const bDoc = await Booking.findOne({
      $or: [
        { id: cleanId },
        { id: `UC-${bare}` },
        { id: `JOB-${bare}` },
        { id: bare },
        { bookingReference: cleanId },
        { bookingReference: `UC-${bare}` }
      ]
    });
    if (bDoc) {
      const realCustomer = bDoc.userName || bDoc.customerName || bDoc.customer;
      const realPro = bDoc.assignedPartner || bDoc.assignedProfessional?.name || (bDoc.technician && bDoc.technician.name);
      if (realCustomer && (callData.callerName === 'Rahul Sharma' || callData.callerName === 'Customer' || !callData.callerName)) {
        callData.callerName = realCustomer;
      }
      if (realCustomer && (callData.receiverName === 'Rahul Sharma' || callData.receiverName === 'Customer' || !callData.receiverName)) {
        callData.receiverName = realCustomer;
      }
      if (realPro && (callData.receiverName === 'Specialist' || !callData.receiverName)) {
        callData.receiverName = realPro;
      }
      if (realPro && (callData.callerName === 'Specialist' || !callData.callerName)) {
        callData.callerName = realPro;
      }
      if (bDoc.serviceName || bDoc.service) {
        callData.service = bDoc.serviceName || bDoc.service;
      }
    }
  } catch (_) {}
  return callData;
}

// GET Real-time VoIP Call: Check for active/incoming call (general or query param)
router.get('/active', async (req, res) => {
  try {
    const bookingId = req.query.bookingId || req.query.id;
    const cleanBookingId = bookingId ? String(bookingId).replace(/^#/, '').trim() : '';
    const bare = cleanBookingId ? cleanBookingId.replace(/^(UC|JOB|LEAD)[-_]?/i, '') : '';
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);

    // 1. Check in-memory cache first (0ms latency)
    let cached = null;
    if (cleanBookingId) {
      cached = activeVoipCalls.get(cleanBookingId) || activeVoipCalls.get(bare) || activeVoipCalls.get(`UC-${bare}`) || activeVoipCalls.get(`JOB-${bare}`);
    }
    if (!cached) {
      cached = activeVoipCalls.get('latest');
    }

    if (cached && (cached.status === 'ringing' || cached.status === 'connected')) {
      const callStarted = new Date(cached.startedAt || Date.now()).getTime();
      if (Date.now() - callStarted < 95 * 1000) {
        await enrichCallSessionWithBooking(cached);
        return res.json({ success: true, activeCall: cached });
      }
    }

    // 2. Query MongoDB fallback
    const queryCond = cleanBookingId
      ? {
          $or: [
            { bookingId: cleanBookingId },
            { bookingId: `UC-${bare}` },
            { bookingId: `JOB-${bare}` },
            { bookingId: bare }
          ]
        }
      : {};

    const session = await CallSession.findOne({
      ...queryCond,
      status: { $in: ['initiated', 'ringing', 'connected'] },
      startedAt: { $gte: ninetySecondsAgo }
    }).sort({ startedAt: -1 });

    if (session) {
      const enriched = await enrichCallSessionWithBooking(session.toObject ? session.toObject() : session);
      registerActiveCall(enriched);
      return res.json({ success: true, activeCall: enriched });
    }

    res.json({ success: true, activeCall: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Real-time VoIP Call: Check for active/incoming call on booking param
router.get('/active/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const cleanBookingId = String(bookingId).replace(/^#/, '').trim();
    const bare = cleanBookingId.replace(/^(UC|JOB|LEAD)[-_]?/i, '');
    const ninetySecondsAgo = new Date(Date.now() - 90 * 1000);

    // 1. In-memory check first (0ms latency)
    let cached = activeVoipCalls.get(cleanBookingId) ||
                 activeVoipCalls.get(bare) ||
                 activeVoipCalls.get(`UC-${bare}`) ||
                 activeVoipCalls.get(`JOB-${bare}`) ||
                 (cleanBookingId === 'latest' ? activeVoipCalls.get('latest') : null);

    if (cached && (cached.status === 'ringing' || cached.status === 'connected')) {
      const callStarted = new Date(cached.startedAt || Date.now()).getTime();
      if (Date.now() - callStarted < 95 * 1000) {
        await enrichCallSessionWithBooking(cached);
        return res.json({ success: true, activeCall: cached });
      }
    }

    // 2. MongoDB check
    const session = await CallSession.findOne({
      $or: [
        { bookingId: cleanBookingId },
        { bookingId: `UC-${bare}` },
        { bookingId: `JOB-${bare}` },
        { bookingId: bare }
      ],
      status: { $in: ['initiated', 'ringing', 'connected'] },
      startedAt: { $gte: ninetySecondsAgo }
    }).sort({ startedAt: -1 });

    if (session) {
      const enriched = await enrichCallSessionWithBooking(session.toObject ? session.toObject() : session);
      registerActiveCall(enriched);
      return res.json({ success: true, activeCall: enriched });
    }

    res.json({ success: true, activeCall: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Real-time VoIP Call: Accept or Decline call
router.post('/respond', async (req, res) => {
  try {
    const { callId, action } = req.body; // action: 'accept' | 'decline'
    if (!callId) {
      return res.status(400).json({ success: false, message: 'callId is required' });
    }

    if (action === 'accept') {
      const session = await CallSession.findOneAndUpdate(
        { callId },
        { $set: { status: 'connected', connectedAt: new Date() } },
        { new: true }
      );
      updateActiveCallStatus(callId, 'connected', { connectedAt: new Date() });
      console.log(`📞 [VoIP Call Connected] ${callId}`);
      return res.json({ success: true, session });
    } else {
      const session = await CallSession.findOneAndUpdate(
        { callId },
        { $set: { status: 'rejected', endedAt: new Date(), disconnectReason: 'declined_by_receiver' } },
        { new: true }
      );
      updateActiveCallStatus(callId, 'rejected', { endedAt: new Date(), disconnectReason: 'declined_by_receiver' });
      console.log(`📞 [VoIP Call Declined] ${callId}`);
      return res.json({ success: true, session });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Real-time VoIP Call: End call
router.post('/end', async (req, res) => {
  try {
    const { callId, durationSeconds, reason = 'normal_hangup' } = req.body;
    if (!callId) {
      return res.status(400).json({ success: false, message: 'callId is required' });
    }

    const existing = activeVoipCalls.get(callId) || await CallSession.findOne({ callId });
    const now = new Date();
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
          disconnectReason: reason
        }
      },
      { new: true }
    );
    updateActiveCallStatus(callId, 'ended', { endedAt: now, durationSeconds: Math.max(0, calculatedDuration || 0), disconnectReason: reason });
    console.log(`📞 [VoIP Call Ended] ${callId} (Duration: ${session?.durationSeconds || 0}s, Reason: ${reason})`);
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// In-memory real-time signaling buffer for WebRTC exchange
const webrtcSignalBuffer = new Map();

// POST WebRTC Signaling: SDP Offer / Answer / ICE Candidates
router.post('/signal', async (req, res) => {
  try {
    const { callId, senderRole, type, payload } = req.body;
    if (!callId || !type || !payload) {
      return res.status(400).json({ success: false, message: 'callId, type, and payload are required' });
    }

    if (!webrtcSignalBuffer.has(callId)) {
      webrtcSignalBuffer.set(callId, []);
    }

    const signalItem = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      callId,
      senderRole,
      type,
      payload,
      timestamp: Date.now()
    };

    const list = webrtcSignalBuffer.get(callId);
    list.push(signalItem);

    if (list.length > 60) {
      webrtcSignalBuffer.set(callId, list.slice(-60));
    }

    res.json({ success: true, signalId: signalItem.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET WebRTC Signaling: Retrieve peer signals
router.get('/signals/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const { since = 0, role } = req.query;
    const sinceNum = parseInt(since, 10) || 0;

    const list = webrtcSignalBuffer.get(callId) || [];
    const signals = list.filter(s => {
      const isNew = s.timestamp > sinceNum;
      const isFromPeer = !role || s.senderRole !== role;
      return isNew && isFromPeer;
    });

    res.json({ success: true, count: signals.length, signals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Real-time VoIP Call: Single call status polling
router.get('/call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const cached = activeVoipCalls.get(callId);
    if (cached) {
      return res.json({ success: true, session: cached });
    }
    const session = await CallSession.findOne({ callId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }
    registerActiveCall(session);
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Validate participant authorization for booking voice call
router.post('/validate', async (req, res) => {
  try {
    const { bookingId, callerRole = 'customer' } = req.body;
    const callerId = req.headers['x-user-id'] || req.headers['x-professional-id'] || req.body.callerId;

    const validation = await validateCallAuthorization({ bookingId, callerId, callerRole });
    if (!validation.authorized) {
      return res.status(403).json({ success: false, message: validation.reason });
    }

    res.json({
      success: true,
      bookingId: validation.bookingId,
      caller: validation.caller,
      receiver: validation.receiver
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Booking WebRTC Call Sessions from MongoDB
router.get('/sessions/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const sessions = await CallSession.find({
      bookingId: String(bookingId)
    }).sort({ startedAt: -1 }).limit(50);

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Initiate privacy-protected masked call (Legacy Telephony bridge fallback)
router.post('/initiate', async (req, res) => {
  try {
    const { bookingId, callerRole = 'customer' } = req.body;
    const callerId = req.headers['x-user-id'] || req.headers['x-professional-id'] || 'cust-user';

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const booking = await Booking.findOne({
      $or: [{ id: bookingId }, { bookingReference: bookingId }]
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: `Booking ${bookingId} not found` });
    }

    const result = await initiateMaskedCall({ booking, callerId, callerRole });

    if (!result.success && result.status === 'BLOCKED_CREDENTIALS_MISSING') {
      return res.status(503).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Telephony Provider Status Webhook
router.post('/webhook', async (req, res) => {
  try {
    const result = await processTelephonyWebhook(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Call Status (PostgreSQL legacy telephony session)
router.get('/status/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const result = await query('SELECT * FROM call_sessions WHERE id = $1', [callId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }
    res.json({ success: true, callSession: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET Booking Call History
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await query(
      'SELECT * FROM call_sessions WHERE booking_id = $1 ORDER BY initiated_at DESC',
      [bookingId]
    );
    res.json({ success: true, calls: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
