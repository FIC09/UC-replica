/**
 * Android Physical Device & APK Push Notification Service
 * Configured with Android Channel MAX priority, sound, and vibration
 */
import mobileApi from './apiClient';

let Notifications = null;
let Device = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
} catch (e) {
  // Graceful fallback
}

class AndroidNotificationService {
  constructor() {
    this.pushToken = null;
    this.isRegistered = false;
    this.notificationListener = null;
    this.responseListener = null;
    this.onNotificationCallback = null;
  }

  async initialize({ userId = 'worker-8841', role = 'worker', onNotification = null } = {}) {
    this.onNotificationCallback = onNotification;

    if (!Notifications) return null;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      await Notifications.setNotificationChannelAsync('default', {
        name: 'Urgent Service Alerts & Bookings',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F04400',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true
      });

      if (Device && Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus === 'granted') {
          const tokenRes = await Notifications.getExpoPushTokenAsync().catch(() => null);
          if (tokenRes && tokenRes.data) {
            this.pushToken = tokenRes.data;
            await this.registerTokenWithBackend(userId, role, this.pushToken, 'android', {
              modelName: Device.modelName,
              brand: Device.brand,
              osVersion: Device.osVersion
            });
          }
        }
      }

      this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
        if (typeof this.onNotificationCallback === 'function') {
          this.onNotificationCallback(notification);
        }
      });

      this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response?.notification?.request?.content?.data;
        console.log('[Android Push] Notification tapped:', data);
      });

      return this.pushToken;
    } catch (err) {
      console.warn('Android push setup notice:', err.message);
      return null;
    }
  }

  async registerTokenWithBackend(userId, role, token, platform = 'android', deviceInfo = {}) {
    try {
      const res = await fetch(`${mobileApi.baseUrl}/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, token, platform, deviceInfo })
      });
      const data = await res.json();
      if (data && data.success) {
        this.isRegistered = true;
      }
    } catch (e) {
      console.warn('Token registration error:', e.message);
    }
  }

  async sendSelfTest(userId = 'PRO-8841', role = 'worker') {
    try {
      const res = await fetch(`${mobileApi.baseUrl}/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.pushToken, userId, role })
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  cleanup() {
    if (this.notificationListener && Notifications) {
      try { Notifications.removeNotificationSubscription(this.notificationListener); } catch (_) {}
    }
    if (this.responseListener && Notifications) {
      try { Notifications.removeNotificationSubscription(this.responseListener); } catch (_) {}
    }
  }
}

export const mobileNotificationService = new AndroidNotificationService();
export default mobileNotificationService;

