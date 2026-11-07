import { Platform } from 'react-native';

// Localhost Configuration matching the backend running locally on port 5000
export const LOCAL_PORT = process.env.EXPO_PUBLIC_PORT || 5000;
export const LOCAL_DEV_IP = process.env.EXPO_PUBLIC_LOCAL_DEV_IP || '192.168.1.2';

// Localhost API URL variants depending on platform/device
export const LOCALHOST_API_URL = process.env.EXPO_PUBLIC_API_URL || `http://localhost:${LOCAL_PORT}/api`;
export const ANDROID_EMULATOR_API_URL = process.env.EXPO_PUBLIC_ANDROID_API_URL || `http://10.0.2.2:${LOCAL_PORT}/api`;
export const LAN_API_URL = process.env.EXPO_PUBLIC_LAN_API_URL || `http://${LOCAL_DEV_IP}:${LOCAL_PORT}/api`;

// Secondary Cloud Fallbacks (kept as graceful failovers if local backend is stopped)
export const RENDER_API_URL = process.env.EXPO_PUBLIC_RENDER_API_URL || 'https://uc-replica.onrender.com/api';
export const CLOUD_API_URL = process.env.EXPO_PUBLIC_CLOUD_API_URL || 'https://urban-rosy.vercel.app/api';

/**
 * Resolves the active backend API URL for local testing:
 * - On Web & iOS: connects to http://localhost:5000/api
 * - On Android Emulator: connects to http://10.0.2.2:5000/api (alias for host machine localhost)
 * - On Physical Devices on LAN: can use http://192.168.1.2:5000/api
 */
export function getBaseApiUrl() {
  if (Platform.OS === 'android') {
    // Android emulator cannot reach 'localhost' directly; 10.0.2.2 routes to the host's localhost
    return ANDROID_EMULATOR_API_URL;
  }

  // Web, iOS simulators, and standard localhost
  return LOCALHOST_API_URL;
}

export const API_BASE_URL = getBaseApiUrl();

export default {
  API_BASE_URL,
  LOCALHOST_API_URL,
  ANDROID_EMULATOR_API_URL,
  LAN_API_URL,
  RENDER_API_URL,
  CLOUD_API_URL,
  LOCAL_DEV_IP,
  PORT: LOCAL_PORT,
  getBaseApiUrl,
};
