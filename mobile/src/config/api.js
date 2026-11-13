import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Localhost Configuration matching the backend running locally on port 5000
export const LOCAL_PORT = process.env.EXPO_PUBLIC_PORT || 5000;

/**
 * Automatically resolve developer machine's IP on your local Wi-Fi:
 * 1. Checks EXPO_PUBLIC_LOCAL_DEV_IP or EXPO_PUBLIC_API_URL
 * 2. Extracts from Expo Metro debugger host (auto-detects your computer's Wi-Fi IP on iPhone & Android)
 * 3. Falls back to current PC Wi-Fi IP (192.168.1.27)
 */
function resolveDevHostIp() {
  if (process.env.EXPO_PUBLIC_LOCAL_DEV_IP) {
    return process.env.EXPO_PUBLIC_LOCAL_DEV_IP;
  }
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.manifest?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const extractedIp = hostUri.split(':')[0];
    if (extractedIp && extractedIp !== 'localhost' && extractedIp !== '127.0.0.1') {
      return extractedIp;
    }
  }
  return '192.168.1.27';
}

export const LOCAL_DEV_IP = resolveDevHostIp();

// Localhost API URL variants depending on platform/device
export const LOCALHOST_API_URL = process.env.EXPO_PUBLIC_API_URL || `http://localhost:${LOCAL_PORT}/api`;
export const ANDROID_EMULATOR_API_URL = process.env.EXPO_PUBLIC_ANDROID_API_URL || `http://10.0.2.2:${LOCAL_PORT}/api`;
export const LAN_API_URL = process.env.EXPO_PUBLIC_LAN_API_URL || `http://${LOCAL_DEV_IP}:${LOCAL_PORT}/api`;
export const RENDER_API_URL = process.env.EXPO_PUBLIC_RENDER_API_URL || 'https://uc-replica.onrender.com/api';
export const CLOUD_API_URL = process.env.EXPO_PUBLIC_CLOUD_API_URL || 'https://urban-rosy.vercel.app/api';

/**
 * Resolves Metro-proxied API URL through the active development host.
 * Because the phone is already connected to Metro to download the bundle (over Wi-Fi or Tunnel),
 * forwarding /api through Metro guarantees the mobile client can reach the backend from any network.
 */
export function getMetroApiUrl() {
  if (Platform.OS === 'web') {
    return `http://localhost:${LOCAL_PORT}/api`;
  }

  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.manifest?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const isSecure = hostUri.includes('.exp.direct') || hostUri.includes('ngrok') || hostUri.includes('https');
    const proto = isSecure ? 'https:' : 'http:';
    return `${proto}//${hostUri}/api`;
  }

  return `http://${LOCAL_DEV_IP}:${LOCAL_PORT}/api`;
}

/**
 * Resolves the primary active backend API URL:
 * 1. Checks EXPO_PUBLIC_API_URL environment variable override
 * 2. Connects directly to backend API (localhost:5000)
 * 3. Falls back to direct LAN IP
 */
export function getBaseApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:${LOCAL_PORT}/api`;
    }
    return `http://localhost:${LOCAL_PORT}/api`;
  }
  return LAN_API_URL;
}

/**
 * Returns prioritized list of candidate URLs for seamless failover.
 */
export function getCandidateApiUrls() {
  const directLocalhost = `http://localhost:${LOCAL_PORT}/api`;
  const direct127 = `http://127.0.0.1:${LOCAL_PORT}/api`;
  const lanUrl = LAN_API_URL;
  const webHostUrl = (typeof window !== 'undefined' && window.location && window.location.hostname)
    ? `http://${window.location.hostname}:${LOCAL_PORT}/api`
    : null;

  const candidates = [
    webHostUrl,
    directLocalhost,
    direct127,
    lanUrl,
    ANDROID_EMULATOR_API_URL
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
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
