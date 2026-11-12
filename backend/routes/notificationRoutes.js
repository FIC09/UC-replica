import express from 'express';
import DeviceToken from '../models/DeviceToken.js';
import {
  sendExpoPushBatch,
  sendNotificationToUser,
  sendNotificationToRole,
  sendBookingPushEvent
} from '../services/pushNotificationService.js';

const router = express.Router();

/**
 * 1. Register or update device push token
 * POST /api/notifications/register-token
 * Body: { userId, role, token, platform, deviceInfo }
 */
router.post('/register-token', async (req, res) => {
  try {
    const { userId, role, token, platform = 'android', deviceInfo = {} } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid device push token is required' });
    }

    const cleanToken = token.trim();
    const cleanUserId = (userId || 'anonymous-user').trim();
    const cleanRole = (role || 'customer').toLowerCase();

    const updated = await DeviceToken.findOneAndUpdate(
      { token: cleanToken },
      {
        userId: cleanUserId,
        role: cleanRole,
        token: cleanToken,
        platform: platform || 'android',
        deviceInfo: deviceInfo || {},
        isActive: true,
        lastUsedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Push token registered successfully',
      device: {
        id: updated._id,
        userId: updated.userId,
        role: updated.role,
        platform: updated.platform
      }
    });
  } catch (err) {
    console.error('Token Registration Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 2. Send targeted notification (to user, role, or explicit token)
 * POST /api/notifications/send
 * Body: { userId, role, token, title, body, data, channelId }
 */
router.post('/send', async (req, res) => {
  try {
    const { userId, role, token, title, body, data = {}, channelId = 'default' } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Notification title and body are required' });
    }

    // Direct token dispatch
    if (token) {
      const result = await sendExpoPushBatch([{
        to: token,
        title,
        body,
        data,
        channelId,
        priority: 'high'
      }]);
      return res.json({ success: true, mode: 'direct-token', result });
    }

    // User-targeted dispatch
    if (userId) {
      const result = await sendNotificationToUser(userId, { title, body, data, channelId });
      return res.json({ success: true, mode: 'user-targeted', result });
    }

    // Role-targeted broadcast
    if (role) {
      const result = await sendNotificationToRole(role, { title, body, data, channelId });
      return res.json({ success: true, mode: 'role-broadcast', result });
    }

    return res.status(400).json({
      success: false,
      message: 'Provide at least one recipient identifier (userId, role, or token)'
    });
  } catch (err) {
    console.error('Notification Send Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 3. Send quick test notification to verify pipeline
 * POST /api/notifications/test
 */
router.post('/test', async (req, res) => {
  try {
    const { token, userId, role = 'customer' } = req.body;

    const payload = {
      title: '🔔 Forge India Connect Live Notification Test',
      body: `Push notification pipeline is operational! Sent at ${new Date().toLocaleTimeString()}`,
      data: { type: 'TEST_PUSH', timestamp: Date.now() },
      channelId: 'default'
    };

    if (token) {
      const result = await sendExpoPushBatch([{ to: token, ...payload }]);
      return res.json({ success: true, message: 'Test sent to token', result });
    }

    if (userId) {
      const result = await sendNotificationToUser(userId, payload);
      return res.json({ success: true, message: `Test sent to user ${userId}`, result });
    }

    const result = await sendNotificationToRole(role, payload);
    return res.json({ success: true, message: `Test broadcast to role ${role}`, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 4. Trigger booking lifecycle notification
 * POST /api/notifications/booking-event
 */
router.post('/booking-event', async (req, res) => {
  try {
    const { booking, eventType, extra = {} } = req.body;
    if (!booking || !eventType) {
      return res.status(400).json({ success: false, message: 'booking and eventType are required' });
    }

    await sendBookingPushEvent(booking, eventType, extra);
    return res.json({ success: true, message: `Triggered ${eventType} notification event` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 5. Registered device count & status
 * GET /api/notifications/status
 */
router.get('/status', async (req, res) => {
  try {
    const totalDevices = await DeviceToken.countDocuments({ isActive: true });
    const androidDevices = await DeviceToken.countDocuments({ platform: 'android', isActive: true });
    const webDevices = await DeviceToken.countDocuments({ platform: 'web', isActive: true });

    return res.json({
      success: true,
      service: 'Forge India Connect Push Notification Dispatcher',
      gateway: 'Expo Push Service / Android FCM v1 API',
      devices: {
        total: totalDevices,
        android: androidDevices,
        web: webDevices
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

