class WebNotificationService {
  constructor() {
    this.token = null;
  }

  async requestPermissionAndRegister(userId = 'customer', role = 'customer') {
    if (typeof window === 'undefined' || !('Notification' in window)) return null;

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        let token = localStorage.getItem('uc_web_push_token');
        if (!token) {
          token = `web-cust-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
          localStorage.setItem('uc_web_push_token', token);
        }
        this.token = token;

        // Register token with backend
        await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: String(userId || 'customer'),
            role: String(role || 'customer'),
            token,
            platform: 'web',
            deviceInfo: {
              userAgent: navigator.userAgent
            }
          })
        }).catch(() => {});

        return token;
      }
    } catch (e) {
      console.warn('Web notification registration notice:', e.message);
    }
    return null;
  }

  showNotification(title, body, data = {}) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, {
          body,
          icon: 'https://res.cloudinary.com/dlpzb0td2/image/upload/v1710000000/urban_company/favicon.png',
          badge: 'https://res.cloudinary.com/dlpzb0td2/image/upload/v1710000000/urban_company/favicon.png',
          data,
          tag: data?.tag || 'uc-customer-alert',
          renotify: true
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch (_) {}
    }
  }
}

export const webNotificationService = new WebNotificationService();
export default webNotificationService;

