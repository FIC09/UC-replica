import { Platform } from 'react-native';

// Local development IP address for physical phone on Wi-Fi
export const LOCAL_DEV_IP = '192.168.1.2';
export const PORT = 5000;

export function getBaseApiUrl() {
  if (Platform.OS === 'android') {
    // If running in Android Emulator, 10.0.2.2 maps to host localhost.
    // If on physical phone via Expo Go, use the LAN IP.
    return `http://${LOCAL_DEV_IP}:${PORT}/api`;
  }
  if (Platform.OS === 'ios') {
    return `http://${LOCAL_DEV_IP}:${PORT}/api`;
  }
  // Web preview
  return `http://localhost:${PORT}/api`;
}

export const API_BASE_URL = getBaseApiUrl();

export default {
  API_BASE_URL,
  LOCAL_DEV_IP,
  PORT,
};

