/**
 * Universal Notification Service Dispatcher
 * Automatically routes to Android, Web, or iOS platform implementations
 */
import { Platform } from 'react-native';

let service = null;

if (Platform.OS === 'android') {
  try {
    service = require('./notificationService.android').default;
  } catch (_) {
    service = require('./notificationService.web').default;
  }
} else if (Platform.OS === 'web') {
  service = require('./notificationService.web').default;
} else {
  // iOS or other platforms (graceful no-op)
  service = require('./notificationService.ios').default;
}

export const mobileNotificationService = service;
export default mobileNotificationService;
