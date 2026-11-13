import DeviceToken from '../models/DeviceToken.js';
import { sendFcmNotification, sendFcmMulticast } from '../config/firebaseAdmin.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Dispatch notification to a device token (supports both Expo push tokens and Firebase FCM tokens)
 */
export async function dispatchDeviceMessage(token, { title, body, data = {}, sound = 'default', channelId = 'default' }) {
  if (!token) return { success: false, reason: 'No token' };

  if (token.startsWith('ExponentPushToken') || token.startsWith('ExpoPushToken')) {
    return await sendExpoPushBatch([{
      to: token,
      sound,
      title,
      body,
      data,
      priority: 'high',
      channelId
    }]);
  } else {
    // Native Firebase Cloud Messaging token
    return await sendFcmNotification(token, { title, body, data });
  }
}

/**
 * Send raw push notification payload to Expo Push Server
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */
export async function sendExpoPushBatch(messages) {
  if (!messages || messages.length === 0) return { success: true, count: 0 };

  const validMessages = messages.filter(m => m && m.to);
  if (validMessages.length === 0) return { success: true, count: 0 };

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMessages),
    });

    const result = await response.json();

    // Check for tickets to clean up invalid/unregistered tokens
    if (result && Array.isArray(result.data)) {
      result.data.forEach((ticket, idx) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          const badToken = validMessages[idx]?.to;
          if (badToken) {
            DeviceToken.deleteOne({ token: badToken }).catch(() => {});
          }
        }
      });
    }

    return {
      success: true,
      count: validMessages.length,
      result
    };
  } catch (err) {
    console.error('Expo Push Notification Dispatch Error:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send notification to a specific user across all their registered devices (Android app + Web)
 */
export async function sendNotificationToUser(userId, { title, body, data = {}, sound = 'default', channelId = 'default' }) {
  if (!userId) return { success: false, reason: 'No userId provided' };

  try {
    const devices = await DeviceToken.find({
      $or: [
        { userId: String(userId) },
        { userId: { $regex: new RegExp(String(userId).replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\\\$&'), 'i') } }
      ],
      isActive: true
    });

    if (!devices || devices.length === 0) {
      return { success: true, count: 0, note: 'No active device tokens found for user' };
    }

    const expoMessages = [];
    const fcmTokens = [];

    devices.forEach(d => {
      if (d.token.startsWith('ExponentPushToken') || d.token.startsWith('ExpoPushToken')) {
        expoMessages.push({
          to: d.token,
          sound,
          title,
          body,
          data: {
            ...data,
            notificationId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            timestamp: Date.now()
          },
          priority: 'high',
          channelId: channelId || 'default'
        });
      } else {
        fcmTokens.push(d.token);
      }
    });

    const results = [];
    if (expoMessages.length > 0) {
      results.push(await sendExpoPushBatch(expoMessages));
    }
    if (fcmTokens.length > 0) {
      results.push(await sendFcmMulticast(fcmTokens, {
        title,
        body,
        data: {
          ...data,
          notificationId: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now()
        }
      }));
    }

    return {
      success: true,
      count: devices.length,
      expoCount: expoMessages.length,
      fcmCount: fcmTokens.length,
      results
    };
  } catch (err) {
    console.error(`Error notifying user ${userId}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Broadcast notification to all active devices of a given role (e.g. 'worker', 'customer', 'admin')
 */
export async function sendNotificationToRole(role, { title, body, data = {}, channelId = 'default' }) {
  try {
    const targetRoles = role === 'worker' ? ['worker', 'professional'] : [role];
    const devices = await DeviceToken.find({
      role: { $in: targetRoles },
      isActive: true
    });

    if (!devices || devices.length === 0) {
      return { success: true, count: 0, note: `No active tokens for role: ${role}` };
    }

    const expoMessages = [];
    const fcmTokens = [];

    devices.forEach(d => {
      if (d.token.startsWith('ExponentPushToken') || d.token.startsWith('ExpoPushToken')) {
        expoMessages.push({
          to: d.token,
          sound: 'default',
          title,
          body,
          data: {
            ...data,
            role,
            timestamp: Date.now()
          },
          priority: 'high',
          channelId
        });
      } else {
        fcmTokens.push(d.token);
      }
    });

    const results = [];
    if (expoMessages.length > 0) {
      results.push(await sendExpoPushBatch(expoMessages));
    }
    if (fcmTokens.length > 0) {
      results.push(await sendFcmMulticast(fcmTokens, {
        title,
        body,
        data: {
          ...data,
          role,
          timestamp: Date.now()
        }
      }));
    }

    return {
      success: true,
      count: devices.length,
      expoCount: expoMessages.length,
      fcmCount: fcmTokens.length,
      results
    };
  } catch (err) {
    console.error(`Error notifying role ${role}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Automated push trigger based on booking lifecycle events
 */
export async function sendBookingPushEvent(booking, eventType, extra = {}) {
  if (!booking) return;

  const customerId = booking.userId || booking.userPhone || booking.customerPhone;
  const workerId = booking.workerId || booking.technicianId || (booking.technician && booking.technician.id);
  const serviceName = booking.serviceName || 'Home Service';
  const bookingRef = booking.bookingRef || booking.id || booking._id || 'UC-Booking';

  switch (eventType) {
    case 'BOOKING_CREATED': {
      // Notify customer
      if (customerId) {
        sendNotificationToUser(customerId, {
          title: '✅ Booking Confirmed!',
          body: `Your booking for ${serviceName} (#${bookingRef}) is confirmed. We are assigning a top technician.`,
          data: { bookingId: bookingRef, screen: 'booking-details', stage: 1 },
          channelId: 'bookings'
        }).catch(() => {});
      }
      // Broadcast to available technicians
      sendNotificationToRole('worker', {
        title: '🔔 New Job Opportunity Available!',
        body: `New ${serviceName} booking in ${booking.address?.city || 'Krishnagiri'}. Tap to review and accept!`,
        data: { bookingId: bookingRef, screen: 'leads', payout: booking.pricing?.finalTotal || 699 },
        channelId: 'dispatch'
      }).catch(() => {});
      break;
    }

    case 'STAGE_EN_ROUTE': {
      if (customerId) {
        sendNotificationToUser(customerId, {
          title: '🛵 Technician is En Route!',
          body: `${booking.technician?.name || 'Your technician'} is on the way to your address. ETA: ~8 mins.`,
          data: { bookingId: bookingRef, screen: 'order-tracking', stage: 3 },
          channelId: 'tracking'
        }).catch(() => {});
      }
      break;
    }

    case 'STAGE_ARRIVED': {
      if (customerId) {
        sendNotificationToUser(customerId, {
          title: '📍 Technician has Arrived!',
          body: `Your technician is at your doorstep. Please share Start OTP (${booking.safetyPin || '4829'}) to begin work.`,
          data: { bookingId: bookingRef, screen: 'order-tracking', otp: booking.safetyPin || '4829', stage: 4 },
          channelId: 'tracking'
        }).catch(() => {});
      }
      break;
    }

    case 'STAGE_IN_PROGRESS': {
      if (customerId) {
        sendNotificationToUser(customerId, {
          title: '⚡ Work in Progress',
          body: `Technician pre-work verification selfie verified. Service is actively being performed.`,
          data: { bookingId: bookingRef, screen: 'order-tracking', stage: 5 },
          channelId: 'bookings'
        }).catch(() => {});
      }
      break;
    }

    case 'STAGE_COMPLETED': {
      if (customerId) {
        sendNotificationToUser(customerId, {
          title: '🎉 Service Completed!',
          body: `Your ${serviceName} service has been completed. View warranty card and rate your experience.`,
          data: { bookingId: bookingRef, screen: 'rating', stage: 6 },
          channelId: 'bookings'
        }).catch(() => {});
      }
      if (workerId) {
        sendNotificationToUser(workerId, {
          title: '💰 Payout Settled & Credited!',
          body: `₹${booking.pricing?.finalTotal || booking.totalAmount || 699} has been credited to your technician wallet for #${bookingRef}.`,
          data: { bookingId: bookingRef, screen: 'wallet' },
          channelId: 'payouts'
        }).catch(() => {});
      }
      break;
    }

    case 'CHAT_MESSAGE': {
      const recipientId = extra.recipientId;
      if (recipientId) {
        sendNotificationToUser(recipientId, {
          title: `💬 New message from ${extra.senderName || 'Urban Company'}`,
          body: extra.text || 'Sent an attachment',
          data: { bookingId: bookingRef, screen: 'chat' },
          channelId: 'messages'
        }).catch(() => {});
      }
      break;
    }

    default:
      break;
  }
}

