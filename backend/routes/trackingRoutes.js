import express from 'express';
import { TrackingSession } from '../models/TrackingSession.js';
import { Booking } from '../models/Booking.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { calculateDistanceKm, resolveCoordinates, fetchRoadRouteWaypoints } from '../services/assignmentEngine.js';
import { query } from '../config/postgres.js';
import { emitEvent } from '../services/websocketService.js';
import { setWorkerLiveLocation } from '../config/redis.js';

const router = express.Router();

// In-memory active SSE clients by bookingId
const sseClients = new Map();

export function broadcastTrackingUpdate(bookingId, data) {
  const clients = sseClients.get(bookingId);
  if (clients && clients.length > 0) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    clients.forEach(clientRes => {
      try {
        clientRes.write(payload);
      } catch (err) {
        // Ignored disconnected client
      }
    });
  }
}

// Handler for fetching active tracking session for a booking
async function getTrackingSessionHandler(req, res) {
  try {
    const bookingId = req.params.bookingId || req.params.id;
    let session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });

    if (!session) {
      // Check if booking exists and synthesize a tracking session if needed
      const booking = await Booking.findOne({
        $or: [{ id: bookingId }, { bookingReference: bookingId }]
      });

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Tracking session and booking not found' });
      }

      // Default Krishnagiri Town coordinates
      const customerCoords = resolveCoordinates(booking.address, booking.serviceZone, booking.city || 'Krishnagiri');
      const workerCoords = {
        lat: parseFloat((customerCoords.lat + 0.0055).toFixed(6)),
        lng: parseFloat((customerCoords.lng - 0.0045).toFixed(6))
      };
      const roadRoute = await fetchRoadRouteWaypoints(workerCoords, customerCoords);

      session = await TrackingSession.create({
        id: `TRK-${booking.id}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference || booking.id,
        workerId: booking.assignedProfessional?.id || 'PRO-KRI-101',
        workerName: booking.assignedProfessional?.name || 'V. Saravanan',
        workerPhone: booking.assignedProfessional?.phone || '+91 94432 10850',
        workerTrade: booking.assignedProfessional?.trade || 'AC Technician',
        workerRating: 4.95,
        customerAddress: booking.address,
        customerCoords,
        currentCoords: roadRoute.origin || workerCoords,
        status: booking.status === 'Completed' ? 'completed' :
                booking.status === 'In Progress' ? 'in_progress' :
                booking.status === 'Arrived' ? 'arrived' :
                booking.status === 'En Route' ? 'en_route' : 'assigned',
        routePolyline: roadRoute.waypoints,
        currentWaypointIndex: 0,
        remainingDistanceKm: roadRoute.distanceKm || 2.4,
        remainingEtaMinutes: roadRoute.etaMinutes || 6,
        safetyPin: '4829',
        lastPingAt: new Date()
      });
    }

    res.json({ success: true, tracking: session, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

router.get('/session/:bookingId', getTrackingSessionHandler);
router.get('/:bookingId', getTrackingSessionHandler);

// GET Server-Sent Events (SSE) live telemetry stream for customer tracking map
router.get('/stream/:bookingId', async (req, res) => {
  const { bookingId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', bookingId, timestamp: new Date() })}\n\n`);

  // Add to active clients map
  if (!sseClients.has(bookingId)) {
    sseClients.set(bookingId, []);
  }
  sseClients.get(bookingId).push(res);

  // Send immediate latest state
  try {
    const session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });
    if (session) {
      res.write(`data: ${JSON.stringify({ type: 'update', tracking: session })}\n\n`);
    }
  } catch (e) {
    console.error('SSE initial send error:', e.message);
  }

  // Heartbeat to keep connection active
  const keepAlive = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(keepAlive);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    const existing = sseClients.get(bookingId) || [];
    sseClients.set(bookingId, existing.filter(c => c !== res));
  });
});


// POST worker GPS ping (live coordinate submission from device or simulation)
router.post('/ping', async (req, res) => {
  try {
    const { bookingId, lat, lng, latitude, longitude, speed = 22, heading = 0, accuracy = 4 } = req.body;
    const latVal = lat ?? latitude;
    const lngVal = lng ?? longitude;
    const workerId = req.body.workerId || 'WRK-KRI-101';

    if (!bookingId || latVal == null || lngVal == null) {
      return res.status(400).json({ success: false, message: 'bookingId, lat/latitude and lng/longitude are required' });
    }

    let session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });

    if (!session) {
      const booking = await Booking.findOne({
        $or: [{ id: bookingId }, { bookingReference: bookingId }]
      });

      if (booking) {
        const customerCoords = resolveCoordinates(booking.address, booking.serviceZone, booking.city || 'Krishnagiri');
        const workerCoords = { lat: parseFloat(latVal), lng: parseFloat(lngVal) };
        const roadRoute = await fetchRoadRouteWaypoints(workerCoords, customerCoords);

        session = await TrackingSession.create({
          id: `TRK-${booking.id}`,
          bookingId: booking.id,
          bookingReference: booking.bookingReference || booking.id,
          workerId: booking.assignedProfessional?.id || workerId,
          workerName: booking.assignedProfessional?.name || 'A. Kumar',
          workerPhone: booking.assignedProfessional?.phone || '+91 94432 10850',
          workerTrade: booking.assignedProfessional?.trade || 'AC Technician',
          workerRating: 4.95,
          workerAvatar: 'AK',
          customerName: booking.userName || 'Customer',
          customerPhone: booking.userPhone || '+91 94432 88124',
          customerAddress: booking.address,
          serviceName: booking.serviceName,
          safetyPin: booking.safetyPin || '4829',
          status: 'en_route',
          customerCoords,
          currentCoords: workerCoords,
          speed: parseFloat(speed),
          heading: parseFloat(heading),
          accuracy: parseFloat(accuracy),
          routePolyline: roadRoute.waypoints,
          remainingDistanceKm: roadRoute.distanceKm,
          remainingEtaMinutes: roadRoute.durationMinutes,
          lastPingAt: new Date()
        });
      } else {
        return res.status(404).json({ success: false, message: 'Tracking session not found' });
      }
    }

    // Update coordinates & metrics
    session.currentCoords = { lat: parseFloat(latVal), lng: parseFloat(lngVal) };
    session.speed = parseFloat(speed);
    session.heading = parseFloat(heading);
    session.accuracy = parseFloat(accuracy);
    session.lastPingAt = new Date();
    session.staleStatus = false;

    // Recalculate remaining distance & ETA
    const dist = calculateDistanceKm(session.currentCoords, session.customerCoords);
    session.remainingDistanceKm = dist;
    session.remainingEtaMinutes = Math.max(1, Math.round(dist * 3.5));

    // Append to location events
    session.locationEvents.push({
      lat: parseFloat(latVal),
      lng: parseFloat(lngVal),
      speed: parseFloat(speed),
      heading: parseFloat(heading),
      accuracy: parseFloat(accuracy),
      timestamp: new Date()
    });

    // Auto-detect arrival if within 50 meters
    if (dist <= 0.05 && session.status === 'en_route') {
      session.status = 'arrived';
      await Booking.findOneAndUpdate(
        { $or: [{ id: session.bookingId }, { bookingReference: session.bookingId }] },
        { status: 'Arrived' }
      );
    }

    await session.save();

    // Ephemeral real-time telemetry cache in Redis
    try {
      await setWorkerLiveLocation(workerId, {
        latitude: parseFloat(latVal),
        longitude: parseFloat(lngVal),
        speed: parseFloat(speed),
        heading: parseFloat(heading),
        accuracy: parseFloat(accuracy),
        bookingId: session.bookingId
      });
    } catch {}

    // Persist immutable telemetry event in PostgreSQL
    const telemetryId = `tele-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    try {
      // Ensure tracking session exists in PostgreSQL
      await query(`
        INSERT INTO tracking_sessions (
          id, booking_id, worker_id, customer_coords_lat, customer_coords_lng,
          current_coords_lat, current_coords_lng, speed, heading, accuracy, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          current_coords_lat = EXCLUDED.current_coords_lat,
          current_coords_lng = EXCLUDED.current_coords_lng,
          speed = EXCLUDED.speed,
          heading = EXCLUDED.heading,
          accuracy = EXCLUDED.accuracy,
          last_ping_at = NOW(),
          updated_at = NOW();
      `, [
        session.id,
        session.bookingId,
        workerId,
        session.customerCoords?.lat || 12.5235,
        session.customerCoords?.lng || 78.2195,
        parseFloat(latVal),
        parseFloat(lngVal),
        parseFloat(speed),
        parseFloat(heading),
        parseFloat(accuracy),
        session.status || 'en_route'
      ]);

      await query(`
        INSERT INTO worker_location_events (
          id, tracking_session_id, worker_id, booking_id, latitude, longitude, speed, heading, accuracy, device_timestamp, server_timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        telemetryId,
        session.id,
        workerId,
        session.bookingId,
        parseFloat(latVal),
        parseFloat(lngVal),
        parseFloat(speed),
        parseFloat(heading),
        parseFloat(accuracy)
      ]);
    } catch (err) {
      console.warn('[PostgreSQL Telemetry Warning]:', err.message);
    }

    // Broadcast WebSocket events
    emitEvent('WORKER_LOCATION_UPDATED', {
      entityId: session.bookingId,
      room: `booking:${session.bookingId}`,
      payload: {
        bookingId: session.bookingId,
        workerId,
        latitude: parseFloat(latVal),
        longitude: parseFloat(lngVal),
        speed: parseFloat(speed),
        heading: parseFloat(heading),
        remainingEtaMinutes: session.remainingEtaMinutes,
        remainingDistanceKm: session.remainingDistanceKm,
        timestamp: new Date().toISOString()
      }
    });

    // Broadcast SSE update
    broadcastTrackingUpdate(session.bookingId, { type: 'update', tracking: session });

    res.json({
      success: true,
      tracking: session,
      session,
      telemetryEventId: telemetryId,
      remainingEtaMinutes: session.remainingEtaMinutes,
      remainingDistanceKm: session.remainingDistanceKm
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Advance simulation step along route (for testing and demo interactive tracking)
router.post('/advance-step/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Tracking session not found' });
    }

    const waypoints = session.routePolyline || [];
    if (waypoints.length === 0) {
      return res.status(400).json({ success: false, message: 'No route waypoints configured' });
    }

    let nextIndex = (session.currentWaypointIndex || 0) + 1;
    if (nextIndex >= waypoints.length) {
      if (session.status === 'arrived') {
        // Replay loop from start for testing/demo
        nextIndex = 0;
        session.status = 'en_route';
        session.currentCoords = waypoints[0];
        const dist = calculateDistanceKm(session.currentCoords, session.customerCoords);
        session.remainingDistanceKm = dist;
        session.remainingEtaMinutes = Math.max(1, Math.round(dist * 3.5));
        session.speed = 24;
      } else {
        nextIndex = waypoints.length - 1;
        session.status = 'arrived';
        session.remainingDistanceKm = 0.02;
        session.remainingEtaMinutes = 0;
        session.speed = 0;
        await Booking.findOneAndUpdate(
          { $or: [{ id: session.bookingId }, { bookingReference: session.bookingId }] },
          { status: 'Arrived' }
        );
      }
    } else {
      session.status = 'en_route';
      session.currentCoords = waypoints[nextIndex];
      const dist = calculateDistanceKm(session.currentCoords, session.customerCoords);
      session.remainingDistanceKm = dist;
      session.remainingEtaMinutes = Math.max(1, Math.round(dist * 3.5));
      session.speed = Math.floor(22 + Math.random() * 8);

      // Dynamic directional bearing
      if (nextIndex > 0) {
        const prev = waypoints[nextIndex - 1];
        const curr = waypoints[nextIndex];
        const dLng = (curr.lng - prev.lng) * (Math.PI / 180);
        const lat1 = prev.lat * (Math.PI / 180);
        const lat2 = curr.lat * (Math.PI / 180);
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        session.heading = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
      }
    }

    session.currentWaypointIndex = nextIndex;
    session.lastPingAt = new Date();
    await session.save();

    broadcastTrackingUpdate(session.bookingId, { type: 'update', tracking: session });

    res.json({ success: true, tracking: session, step: nextIndex, totalSteps: waypoints.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST verify Safety PIN / Start OTP
router.post('/verify-pin/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { pin } = req.body;

    const session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Tracking session not found' });
    }

    if (String(pin).trim() !== String(session.safetyPin).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Safety PIN. Please verify the 4-digit code provided on the customer tracking screen.'
      });
    }

    session.pinVerified = true;
    session.pinVerifiedAt = new Date();
    session.status = 'in_progress';
    session.serviceStartedAt = new Date();
    await session.save();

    // Update booking status in database
    await Booking.findOneAndUpdate(
      { $or: [{ id: session.bookingId }, { bookingReference: session.bookingId }] },
      {
        status: 'In Progress',
        $push: {
          timeline: {
            id: `tl-${Date.now()}`,
            status: 'In Progress',
            title: 'Service Started',
            description: `Safety PIN verified by ${session.workerName}. Work in progress.`,
            actor: session.workerName,
            actorRole: 'Service Professional',
            timestamp: new Date()
          }
        }
      }
    );

    broadcastTrackingUpdate(session.bookingId, { type: 'update', tracking: session });

    res.json({
      success: true,
      message: 'Safety PIN verified successfully! Service is now In Progress.',
      tracking: session
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST Complete Service
router.post('/complete-service/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { notes = '', rating = 5 } = req.body;

    const session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Tracking session not found' });
    }

    session.status = 'completed';
    session.serviceCompletedAt = new Date();
    if (session.serviceStartedAt) {
      session.serviceDurationMinutes = Math.round((session.serviceCompletedAt - session.serviceStartedAt) / 60000);
    }
    await session.save();

    const booking = await Booking.findOneAndUpdate(
      { $or: [{ id: session.bookingId }, { bookingReference: session.bookingId }] },
      {
        status: 'Completed',
        rating: Number(rating) || 5,
        review: notes || 'Service completed thoroughly and sanitized.',
        $push: {
          timeline: {
            id: `tl-${Date.now()}`,
            status: 'Completed',
            title: 'Service Completed',
            description: 'Professional finished service. Customer review recorded.',
            actor: session.workerName,
            actorRole: 'Service Professional',
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    // Free worker back to 'Available' and dynamically update rating from real customer review
    if (session.workerId) {
      const worker = await WorkerApplication.findOne({ id: session.workerId });
      if (worker) {
        const newJobs = (worker.jobsCompleted || 0) + 1;
        const currentRating = worker.rating || 0;
        const incomingRating = Number(rating) || 5;
        // First job sets rating; subsequent jobs compute cumulative moving average
        const updatedRating = currentRating === 0
          ? incomingRating
          : Number(((currentRating * (newJobs - 1) + incomingRating) / newJobs).toFixed(2));

        worker.dispatchState = 'Available';
        worker.activeBookingId = '';
        worker.jobsCompleted = newJobs;
        worker.rating = updatedRating;
        await worker.save();
      }
    }

    broadcastTrackingUpdate(session.bookingId, { type: 'update', tracking: session });

    res.json({
      success: true,
      message: 'Service marked as completed successfully!',
      tracking: session,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET All Operations Tracking Sessions (For Admin & Partner Live Maps)
router.get('/operations/all', async (req, res) => {
  try {
    const { partnerId, status } = req.query;
    let query = {};
    if (partnerId) {
      query.partnerId = partnerId;
    }
    if (status) {
      query.status = status;
    }

    const sessions = await TrackingSession.find(query).sort({ updatedAt: -1 }).limit(50);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
