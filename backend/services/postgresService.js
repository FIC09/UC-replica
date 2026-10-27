import { query, transaction } from '../config/postgres.js';

/**
 * Synchronize or save a Booking record into PostgreSQL
 */
export async function syncBookingToPostgres(booking) {
  const sql = `
    INSERT INTO bookings (
      id, booking_reference, customer_id, customer_name, customer_phone,
      service_id, service_name, service_category, service_package,
      address, locality, city, latitude, longitude,
      scheduled_date, scheduled_time, status,
      subtotal, discount, tax, surge_fee, total_amount,
      payment_status, payment_method,
      assigned_worker_id, assigned_worker_name, assigned_partner_id,
      safety_pin, notes, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9,
      $10, $11, $12, $13, $14,
      $15, $16, $17,
      $18, $19, $20, $21, $22,
      $23, $24,
      $25, $26, $27,
      $28, $29, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      assigned_worker_id = EXCLUDED.assigned_worker_id,
      assigned_worker_name = EXCLUDED.assigned_worker_name,
      assigned_partner_id = EXCLUDED.assigned_partner_id,
      payment_status = EXCLUDED.payment_status,
      updated_at = NOW()
    RETURNING *;
  `;

  // Validate foreign key references to prevent integrity errors with legacy data
  let validWorkerId = null;
  const candidateWorker = booking.assignedProfessional?.id || booking.assignedWorkerId;
  if (candidateWorker) {
    const wRes = await query('SELECT id FROM workers WHERE id = $1', [String(candidateWorker)]);
    if (wRes.rows.length > 0) {
      validWorkerId = String(candidateWorker);
    }
  }

  let validPartnerId = null;
  const candidatePartner = booking.assignedPartner?.id || booking.assignedPartnerId;
  if (candidatePartner) {
    const pRes = await query('SELECT id FROM business_partners WHERE id = $1', [String(candidatePartner)]);
    if (pRes.rows.length > 0) {
      validPartnerId = String(candidatePartner);
    }
  }

  const primaryId = String(booking.id || booking._id);

  const VALID_STATUSES = ['Pending', 'Assigned', 'Travelling', 'En Route', 'Arrived', 'In Progress', 'Completed', 'Cancelled'];
  let pgStatus = booking.status || 'Pending';
  if (['Confirmed', 'Scheduled', 'Paid'].includes(pgStatus)) {
    pgStatus = 'Pending';
  } else if (!VALID_STATUSES.includes(pgStatus)) {
    pgStatus = 'Pending';
  }

  const params = [
    primaryId,
    String(booking.bookingReference || booking.id || `BK-${Date.now()}`),
    String(booking.userId || booking.userPhone || 'cust-user'),
    booking.userName || 'Customer',
    booking.userPhone || '+91 94432 88124',
    String(booking.serviceId || ''),
    booking.serviceName || 'Home Service',
    booking.serviceCategory || 'General',
    booking.servicePackage || 'Standard',
    booking.address || 'Krishnagiri Town',
    booking.serviceZone || booking.locality || 'Rayakottai Road',
    booking.city || 'Krishnagiri',
    booking.latitude || 12.5200,
    booking.longitude || 78.2090,
    booking.scheduledDate || booking.date || new Date().toISOString().split('T')[0],
    booking.scheduledTime || booking.time || '10:00 AM',
    pgStatus,
    Number(booking.subtotal || booking.price || 499),
    Number(booking.discount || 0),
    Number(booking.tax || 45),
    Number(booking.surgeFee || 0),
    Number(booking.totalAmount || booking.price || 499),
    booking.paymentStatus || 'Pending',
    booking.paymentMethod || 'Cash on Delivery',
    validWorkerId,
    booking.assignedProfessional?.name || booking.assignedWorkerName || null,
    validPartnerId,
    booking.safetyPin || '4829',
    booking.notes || ''
  ];

  const res = await query(sql, params);

  // Also record in booking_status_history
  await query(`
    INSERT INTO booking_status_history (id, booking_id, status, triggered_by, actor_role, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    String(booking.id || booking._id),
    pgStatus,
    'system',
    'customer',
    `Booking status updated to ${pgStatus}`
  ]);

  return res.rows[0];
}

/**
 * Record a worker assignment transactionally with exclusive lock check
 */
export async function assignWorkerTransactionally({ bookingId, workerId, workerName, partnerId, assignedBy = 'auto_dispatch' }) {
  return await transaction(async (client) => {
    // 1. Deactivate any previous active assignment for this booking
    await client.query(`
      UPDATE worker_assignments
      SET status = 'reassigned', unassigned_at = NOW(), reason = 'Replaced by admin/engine'
      WHERE booking_id = $1 AND status = 'active';
    `, [bookingId]);

    // 2. Insert new active assignment (guaranteed exclusive by partial unique index)
    const assignmentId = `asgn-${bookingId}-${workerId}-${Date.now()}`;
    await client.query(`
      INSERT INTO worker_assignments (id, booking_id, worker_id, partner_id, status, assigned_by, assigned_at)
      VALUES ($1, $2, $3, $4, 'active', $5, NOW());
    `, [assignmentId, bookingId, workerId, partnerId, assignedBy]);

    // 3. Update booking table
    await client.query(`
      UPDATE bookings
      SET status = 'Assigned',
          assigned_worker_id = $1,
          assigned_worker_name = $2,
          assigned_partner_id = $3,
          updated_at = NOW()
      WHERE id = $4;
    `, [workerId, workerName, partnerId, bookingId]);

    // 4. Record audit event
    await client.query(`
      INSERT INTO assignment_events (id, booking_id, worker_id, event_type, payload_json)
      VALUES ($1, $2, $3, 'ASSIGNMENT_CONFIRMED', $4);
    `, [
      `evt-${Date.now()}`,
      bookingId,
      workerId,
      JSON.stringify({ workerName, partnerId, assignedBy, timestamp: new Date() })
    ]);

    // 5. Insert outbox event for durable publishing
    await client.query(`
      INSERT INTO outbox_events (id, event_name, aggregate_type, aggregate_id, payload)
      VALUES ($1, 'ASSIGNMENT_ACCEPTED', 'booking', $2, $3);
    `, [
      `outbox-${Date.now()}`,
      bookingId,
      JSON.stringify({ bookingId, workerId, workerName, status: 'Assigned', timestamp: new Date() })
    ]);

    return { success: true, assignmentId, workerId, bookingId };
  });
}

/**
 * Record an assignment offer with expiration countdown
 */
export async function recordAssignmentOffer({ bookingId, workerId, score, etaMinutes, distanceKm, timeoutSeconds = 60 }) {
  const offerId = `off-${bookingId}-${workerId}-${Date.now()}`;
  const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);

  const res = await query(`
    INSERT INTO assignment_offers (
      id, booking_id, worker_id, score, travel_eta_minutes, distance_km, status, offered_at, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 'offered', NOW(), $7)
    RETURNING *;
  `, [offerId, bookingId, workerId, score, etaMinutes, distanceKm, expiresAt]);

  return res.rows[0];
}

/**
 * Record immutable telemetry GPS location event in PostgreSQL
 */
export async function recordLocationEventToPostgres({ trackingSessionId, workerId, bookingId, latitude, longitude, speed = 0, heading = 0, accuracy = 5, deviceTimestamp = new Date() }) {
  const eventId = `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const res = await query(`
    INSERT INTO worker_location_events (
      id, tracking_session_id, worker_id, booking_id, latitude, longitude, speed, heading, accuracy, device_timestamp, server_timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING *;
  `, [
    eventId,
    trackingSessionId || `TRK-${bookingId}`,
    workerId,
    bookingId,
    latitude,
    longitude,
    speed,
    heading,
    accuracy,
    deviceTimestamp
  ]);

  // Update current coordinates in tracking_sessions table
  await query(`
    UPDATE tracking_sessions
    SET current_coords_lat = $1,
        current_coords_lng = $2,
        speed = $3,
        heading = $4,
        accuracy = $5,
        last_ping_at = NOW(),
        updated_at = NOW()
    WHERE booking_id = $6;
  `, [latitude, longitude, speed, heading, accuracy, bookingId]);

  return res.rows[0];
}

/**
 * Record chat message in PostgreSQL
 */
export async function recordChatMessageToPostgres({ conversationId, clientMessageId, senderId, senderRole, senderName, messageText, messageType = 'text', attachmentUrl = null }) {
  const msgId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const res = await query(`
    INSERT INTO chat_messages (
      id, conversation_id, client_message_id, sender_id, sender_role, sender_name, message_text, message_type, attachment_url, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'delivered', NOW())
    RETURNING *;
  `, [
    msgId,
    conversationId,
    clientMessageId || msgId,
    senderId,
    senderRole,
    senderName,
    messageText,
    messageType,
    attachmentUrl
  ]);

  return res.rows[0];
}

/**
 * Record Call Session in PostgreSQL
 */
export async function recordCallSessionToPostgres({ bookingId, callerId, callerRole, recipientId, recipientRole, providerName = 'masked_telephony_bridge', providerReference = null, callStatus = 'initiated' }) {
  const callId = `call-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const res = await query(`
    INSERT INTO call_sessions (
      id, booking_id, caller_id, caller_role, recipient_id, recipient_role, provider_name, provider_reference, call_status, initiated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *;
  `, [
    callId,
    bookingId,
    callerId,
    callerRole,
    recipientId,
    recipientRole,
    providerName,
    providerReference,
    callStatus
  ]);

  return res.rows[0];
}

/**
 * Record Payment in PostgreSQL
 */
export async function recordPaymentToPostgres({ bookingId, orderId, paymentId, signature, amount, currency = 'INR', status = 'pending', paymentMethod = 'UPI', gatewayProvider = 'Razorpay' }) {
  const id = `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const res = await query(`
    INSERT INTO payments (
      id, booking_id, order_id, payment_id, signature, amount, currency, status, payment_method, gateway_provider, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    ON CONFLICT (order_id) DO UPDATE SET
      payment_id = EXCLUDED.payment_id,
      signature = EXCLUDED.signature,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING *;
  `, [
    id,
    bookingId,
    orderId,
    paymentId,
    signature,
    amount,
    currency,
    status,
    paymentMethod,
    gatewayProvider
  ]);

  return res.rows[0];
}

/**
 * Fetch authoritative dashboard operational metrics from PostgreSQL
 */
export async function getDashboardMetricsFromPostgres() {
  const bookingsRes = await query(`
    SELECT
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'Pending') as unassigned_bookings,
      COUNT(*) FILTER (WHERE status = 'Assigned') as assigned_bookings,
      COUNT(*) FILTER (WHERE status IN ('Travelling', 'En Route')) as travelling_bookings,
      COUNT(*) FILTER (WHERE status = 'Arrived') as arrived_bookings,
      COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_bookings,
      COUNT(*) FILTER (WHERE status = 'Completed') as completed_bookings,
      COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled_bookings,
      COALESCE(SUM(total_amount) FILTER (WHERE status = 'Completed'), 0) as total_revenue
    FROM bookings;
  `);

  const workersRes = await query(`
    SELECT
      COUNT(*) as total_workers,
      COUNT(*) FILTER (WHERE online_status = 'online') as online_workers,
      COUNT(*) FILTER (WHERE status = 'Approved') as approved_workers
    FROM workers;
  `);

  return {
    bookings: bookingsRes.rows[0] || {},
    workers: workersRes.rows[0] || {}
  };
}
