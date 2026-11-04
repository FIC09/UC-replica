import { Platform } from 'react-native';

// Local development IP address of your PC on Wi-Fi
export const LOCAL_DEV_IP = '192.168.1.2';
export const LOCAL_PORT = 5000;

// Deployed HTTPS Cloud Backend connected to MongoDB Atlas
export const CLOUD_API_URL = 'https://urban-rosy.vercel.app/api';

export function getBaseApiUrl() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      // If browser loaded over HTTPS (like *.on.expo.app), use HTTPS Cloud API to prevent Mixed Content warnings
      if (window.location.protocol === 'https:') {
        return CLOUD_API_URL;
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://localhost:${LOCAL_PORT}/api`;
      }
    }
    return CLOUD_API_URL;
  }

  // Native iOS & Android devices in Expo Go
  return `http://${LOCAL_DEV_IP}:${LOCAL_PORT}/api`;
}

export const API_BASE_URL = getBaseApiUrl();

export default {
  API_BASE_URL,
  CLOUD_API_URL,
  LOCAL_DEV_IP,
  PORT: LOCAL_PORT,
};
