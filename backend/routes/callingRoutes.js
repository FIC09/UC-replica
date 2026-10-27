import express from 'express';
import { Booking } from '../models/Booking.js';
import { CallSession } from '../models/CallSession.js';
import { initiateMaskedCall, processTelephonyWebhook } from '../services/telephonyService.js';
import { getIceServers, validateCallAuthorization } from '../services/webrtcService.js';
import { query } from '../config/postgres.js';

const router = express.Router();

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
