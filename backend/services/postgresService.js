/**
 * PostgreSQL Sync Service Stub (Pure MongoDB Atlas Mode)
 * All persistence is handled directly and authoritatively by MongoDB Atlas.
 */

export async function syncBookingToPostgres(booking) {
  return { success: true, bookingId: booking?.id || booking?._id };
}

export async function assignWorkerTransactionally({ bookingId, workerId, workerName, partnerId, assignedBy = 'auto_dispatch' }) {
  return { success: true, bookingId, workerId, workerName };
}

export async function recordAssignmentOffer({ bookingId, workerId, score, etaMinutes, distanceKm, timeoutSeconds = 60 }) {
  return { success: true, offerId: `off-${bookingId}-${workerId}` };
}

export async function recordLocationEventToPostgres({ trackingSessionId, workerId, bookingId, latitude, longitude, speed = 0, heading = 0, accuracy = 5, deviceTimestamp = new Date() }) {
  return { success: true, telemetryEventId: `tel-${Date.now()}` };
}

export async function recordChatMessageToPostgres({ conversationId, clientMessageId, senderId, senderRole, senderName, messageText, messageType = 'text', attachmentUrl = null }) {
  return { success: true, messageId: clientMessageId || `msg-${Date.now()}` };
}

export async function recordCallSessionToPostgres({ bookingId, callerId, callerRole, recipientId, recipientRole, providerName = 'masked_telephony_bridge', providerReference = null, callStatus = 'initiated' }) {
  return { success: true, callId: `call-${Date.now()}` };
}

export async function recordPaymentToPostgres({ bookingId, orderId, paymentId, signature, amount, currency = 'INR', status = 'pending', paymentMethod = 'UPI', gatewayProvider = 'Razorpay' }) {
  return { success: true, paymentId };
}

export async function getDashboardMetricsFromPostgres() {
  return {
    success: true,
    source: 'mongodb_atlas',
    metrics: {}
  };
}

export default {
  syncBookingToPostgres,
  assignWorkerTransactionally,
  recordAssignmentOffer,
  recordLocationEventToPostgres,
  recordChatMessageToPostgres,
  recordCallSessionToPostgres,
  recordPaymentToPostgres,
  getDashboardMetricsFromPostgres
};
