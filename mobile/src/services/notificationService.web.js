/**
 * Web / Mobile Chrome / Desktop PWA Notification Service
 * Uses standard Web Notification API without native module overhead
 */
import mobileApi from './apiClient';

class WebNotificationService {
  constructor() {
    this.pushToken = null;
    this.isRegistered = false;
  }

  async initialize({ userId = 'worker-8841', role = 'worker', onNotification = null } = {}) {
    if (typeof window === 'undefined' || !('Notification' in window)) return null;

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      const storedToken = localStorage.getItem('uc_mobile_web_push_token') ||
        `web-worker-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
      this.pushToken = storedToken;
      localStorage.setItem('uc_mobile_web_push_token', storedToken);

      await this.registerTokenWithBackend(userId, role, this.pushToken, 'web', {
        userAgent: navigator.userAgent
      });

      // Cross-tab notification broadcast channel
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('uc_notifications_channel');
        channel.onmessage = (event) => {
          if (event.data?.title && event.data?.body) {
            this.showNativeWebNotification(event.data.title, event.data.body, event.data.data);
            if (typeof onNotification === 'function') {
              onNotification({
                request: { content: { title: event.data.title, body: event.data.body, data: event.data.data } }
              });
            }
          }
        };
      }
      return this.pushToken;
    } catch (e) {
      console.warn('Web notification init error:', e.message);
      return null;
    }
  }

  async registerTokenWithBackend(userId, role, token, platform = 'web', deviceInfo = {}) {
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

  showNativeWebNotification(title, body, data = {}) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'https://res.cloudinary.com/dlpzb0td2/image/upload/v1710000000/urban_company/favicon.png',
          badge: 'https://res.cloudinary.com/dlpzb0td2/image/upload/v1710000000/urban_company/favicon.png',
          data,
          tag: data?.tag || 'uc-alert',
          renotify: true
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (_) {}
    }
  }

  async sendSelfTest(userId = 'PRO-8841', role = 'worker') {
    try {
      const res = await fetch(`${mobileApi.baseUrl}/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.pushToken, userId, role })
      });
      const data = await res.json();
      this.showNativeWebNotification(
        '🔔 Forge India Connect Push Notification Live!',
        'Push notifications are connected and working in real-time!'
      );
      return data;
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  cleanup() {}
}

export const mobileNotificationService = new WebNotificationService();
export default mobileNotificationService;

