/**
 * iOS Notification Service (Graceful No-Op)
 * Per user requirement: iOS push notifications disabled; Android and Web only.
 * Avoids expo-notifications module resolution failures on iOS.
 */
class IOSNotificationService {
  constructor() {
    this.pushToken = null;
    this.isRegistered = false;
  }

  async initialize() {
    // iOS push notifications intentionally bypassed
    return null;
  }

  async registerTokenWithBackend() {
    return null;
  }

  showNativeWebNotification() {}

  async sendSelfTest() {
    return { success: true, message: 'Push notifications configured for Android & Web.' };
  }

  cleanup() {}
}

export const mobileNotificationService = new IOSNotificationService();
export default mobileNotificationService;

