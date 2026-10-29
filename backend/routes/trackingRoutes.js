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
// Handler for fetching active tracking session for a booking
async function getTrackingSessionHandler(req, res) {
  try {
    const bookingId = req.params.bookingId || req.params.id;
    let session = await TrackingSession.findOne({
      $or: [{ bookingId }, { bookingReference: bookingId }]
    });

    const booking = await Booking.findOne({
      $or: [{ id: bookingId }, { bookingReference: bookingId }]
    });

    if (!session) {
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

      const proAssigned = booking.assignedProfessional?.name || booking.assignedPartner || '';
      const isAssigned = Boolean(proAssigned);

      session = await TrackingSession.create({
        id: `TRK-${booking.id}`,
        bookingId: booking.id,
        bookingReference: booking.bookingReference || booking.id,
        workerId: booking.assignedProfessional?.id || (isAssigned ? 'PRO-KRI-101' : ''),
        workerName: proAssigned,
        workerPhone: booking.assignedProfessional?.phone || '',
        workerTrade: booking.assignedProfessional?.trade || booking.serviceName || 'Home Service Specialist',
        workerRating: booking.assignedProfessional?.rating || 4.95,
        customerAddress: booking.address,
        customerCoords,
        currentCoords: roadRoute.origin || workerCoords,
        status: !isAssigned ? 'unassigned' :
                booking.status === 'Completed' ? 'completed' :
                booking.status === 'In Progress' ? 'in_progress' :
                booking.status === 'Arrived' ? 'arrived' :
                booking.status === 'En Route' ? 'en_route' : 'assigned',
        routePolyline: roadRoute.waypoints,
        currentWaypointIndex: 0,
        remainingDistanceKm: roadRoute.distanceKm || 2.4,
        remainingEtaMinutes: roadRoute.etaMinutes || 6,
        safetyPin: booking.safetyPin || '4829',
        lastPingAt: new Date()
      });
    } else if (booking) {
      // Self-healing synchronization: if booking was assigned or reassigned, sync session
      const proAssigned = booking.assignedProfessional?.name || booking.assignedPartner || '';
      const isAssigned = Boolean(proAssigned);
      let changed = false;

      if (isAssigned) {
        if (session.workerName !== proAssigned) {
          session.workerName = proAssigned;
          session.workerId = booking.assignedProfessional?.id || session.workerId || 'PRO-KRI-101';
          session.workerPhone = booking.assignedProfessional?.phone || session.workerPhone || '';
          session.workerTrade = booking.assignedProfessional?.trade || booking.serviceName || session.workerTrade;
          changed = true;
        }
        const expectedSessionStatus = 
          booking.status === 'Completed' ? 'completed' :
          booking.status === 'In Progress' ? 'in_progress' :
          booking.status === 'Arrived' ? 'arrived' :
          booking.status === 'En Route' ? 'en_route' :
          booking.status === 'Cancelled' ? 'cancelled' : 'assigned';

        if (session.status !== expectedSessionStatus) {
          session.status = expectedSessionStatus;
          if (expectedSessionStatus === 'arrived') {
            session.remainingDistanceKm = 0;
            session.remainingEtaMinutes = 0;
            if (session.routePolyline && session.routePolyline.length > 0) {
              session.currentWaypointIndex = session.routePolyline.length - 1;
            }
          } else if (expectedSessionStatus === 'in_progress' || expectedSessionStatus === 'completed') {
            session.pinVerified = true;
            session.remainingDistanceKm = 0;
            session.remainingEtaMinutes = 0;
          }
          changed = true;
        }
      } else {
        if (session.workerName) {
          session.workerName = '';
          session.workerId = '';
          session.workerPhone = '';
          session.status = 'unassigned';
          changed = true;
        }
      }

      if (booking.safetyPin && session.safetyPin !== booking.safetyPin) {
        session.safetyPin = booking.safetyPin;
        changed = true;
      }

      if (changed) {
        await session.save();
      }
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
          workerName: booking.assignedProfessional?.name || booking.assignedPartner || 'Service Specialist',
          workerPhone: booking.assignedProfessional?.phone || '',
          workerTrade: booking.assignedProfessional?.trade || booking.serviceName || 'Home Service Specialist',
          workerRating: booking.assignedProfessional?.rating || 4.95,
          workerAvatar: (booking.assignedProfessional?.name || 'PR').slice(0, 2).toUpperCase(),
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
        completedAt: new Date(),
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

    // Free worker back to 'Available' and dynamically update rating and wallet earnings
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

        const earned = Math.round((Number(booking?.totalAmount || booking?.price || booking?.amount) || 548) * 0.8);
        worker.walletBalance = (Number(worker.walletBalance) || 0) + earned;
        worker.lifetimeEarnings = (Number(worker.lifetimeEarnings) || 0) + earned;
        worker.earnings = (Number(worker.earnings) || 0) + earned;

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

    // 1. Authoritative Real-Time Reconcile with active Bookings in MongoDB
    try {
      const activeBookings = await Booking.find({
        status: { $in: ['Assigned', 'En Route', 'Arrived', 'In Progress'] }
      }).lean();

      for (const booking of activeBookings) {
        const assignedProName = booking.assignedProfessional?.name || booking.assignedPartner || booking.assignedWorker;
        if (!assignedProName) continue; // Unassigned bookings do not have live worker tracking sessions

        const assignedProId = booking.assignedProfessional?.id || booking.assignedProId || `WRK-${booking.id}`;
        const assignedProTrade = booking.assignedProfessional?.trade || booking.serviceCategory || booking.serviceName || 'Service Specialist';
        const assignedProPhone = booking.assignedProfessional?.phone || '+91 94432 10850';

        const statusMap = {
          'Assigned': 'assigned',
          'En Route': 'en_route',
          'Arrived': 'arrived',
          'In Progress': 'in_progress',
          'Completed': 'completed',
          'Cancelled': 'cancelled'
        };
        const mappedStatus = statusMap[booking.status] || 'assigned';

        let session = await TrackingSession.findOne({
          $or: [{ bookingId: booking.id }, { bookingReference: booking.bookingReference || booking.id }]
        });

        if (!session) {
          const customerCoords = resolveCoordinates(booking.address, booking.serviceZone, booking.city || 'Krishnagiri');
          const workerCoords = {
            lat: parseFloat((customerCoords.lat + 0.0055).toFixed(6)),
            lng: parseFloat((customerCoords.lng - 0.0045).toFixed(6))
          };
          const roadRoute = await fetchRoadRouteWaypoints(workerCoords, customerCoords);

          await TrackingSession.create({
            id: `TRK-${booking.id}`,
            bookingId: booking.id,
            bookingReference: booking.bookingReference || booking.id,
            workerId: assignedProId,
            workerName: assignedProName,
            workerPhone: assignedProPhone,
            workerTrade: assignedProTrade,
            workerRating: 4.95,
            partnerId: booking.partnerAgency || '',
            partnerName: booking.partnerAgency || '',
            customerName: booking.userName || booking.customerName || 'Customer',
            customerPhone: booking.userPhone || '',
            customerAddress: booking.address,
            customerCoords,
            currentCoords: roadRoute.origin || workerCoords,
            status: mappedStatus,
            routePolyline: roadRoute.waypoints,
            currentWaypointIndex: 0,
            remainingDistanceKm: roadRoute.distanceKm || 2.4,
            remainingEtaMinutes: roadRoute.etaMinutes || 6,
            safetyPin: booking.safetyPin || '4829',
            lastPingAt: new Date()
          });
        } else {
          let needsUpdate = false;
          if (session.workerName !== assignedProName) {
            session.workerName = assignedProName;
            session.workerId = assignedProId;
            session.workerTrade = assignedProTrade;
            needsUpdate = true;
          }
          if (session.status !== mappedStatus) {
            session.status = mappedStatus;
            needsUpdate = true;
          }
          if (needsUpdate) {
            await session.save();
          }
        }
      }

      // Update tracking sessions for Cancelled or Completed bookings so they do not linger as active
      const inactiveBookings = await Booking.find({
        status: { $in: ['Cancelled', 'Completed', 'Failed'] }
      }).lean();

      for (const ib of inactiveBookings) {
        const inactiveStatus = ib.status === 'Cancelled' ? 'cancelled' : 'completed';
        await TrackingSession.updateMany(
          {
            $or: [{ bookingId: ib.id }, { bookingReference: ib.bookingReference || ib.id }],
            status: { $nin: ['completed', 'cancelled'] }
          },
          { $set: { status: inactiveStatus } }
        );
      }
    } catch (syncErr) {
      console.warn('Live operations auto-sync notice:', syncErr.message);
    }

    let query = {};
    if (partnerId) {
      query.partnerId = partnerId;
    }
    if (status) {
      query.status = status;
    } else {
      // Return active operations tracking sessions
      query.status = { $nin: ['completed', 'cancelled'] };
    }

    const sessions = await TrackingSession.find(query).sort({ updatedAt: -1 }).limit(50);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
