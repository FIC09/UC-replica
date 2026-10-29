import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_PLATFORM_SETTINGS = {
  // Brand & Business
  platformName: 'Forge India Connect Marketplace',
  companyLegalName: 'Forge India Connect Technologies Pvt. Ltd.',
  supportHelpline: '+91 1800 200 4567',
  supportEmail: 'corporate-ops@forgeindiaconnect.com',
  headquartersAddress: 'Plot 19, Udyog Vihar Phase IV, Gurugram, Haryana - 122015, India',
  gstinNumber: '07AAACU9812K1Z5',

  // Currency & Localization
  currency: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata',
  defaultLocale: 'en-IN',

  // Service Hours & Buffers
  serviceHoursStart: '08:00',
  serviceHoursEnd: '21:00',
  slotDurationMinutes: 60,
  minAdvanceNoticeHours: 2,
  bookingBufferMinutes: 30,
  dispatchRadiusKm: 7.5,

  // Commission & Taxes
  gstRate: 18,
  platformTakeRate: 20,
  agencyTakeRate: 14,
  bookingFee: 49,

  // Cancellation & Refund
  freeCancellationHours: 4,
  customerCancellationFee: 100,
  proCancelPenalty: 150,
  autoRefundThreshold: 500,

  // Security & State
  requireDoorstepFaceAuth: true,
  requireOtpJobCompletion: true,
  maintenanceMode: false,
  maxSurgeMultiplier: 1.5,
  monsoonSurgeActive: false,
  monsoonSurgeAmount: 49,

  // Notification Preferences
  notificationPreferences: {
    smsOrderAlerts: true,
    whatsappDispatch: true,
    emailInvoices: true,
    staffPushAlerts: true
  }
};

// Singleton In-Memory State
let cachedSettings = (() => {
  try {
    const raw = localStorage.getItem('fic_platform_settings');
    if (raw) {
      return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...DEFAULT_PLATFORM_SETTINGS };
})();

const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach(cb => {
    try { cb(cachedSettings); } catch (e) { console.error('Settings subscriber error:', e); }
  });
}

// 1. Cross-Tab Real-time BroadcastChannel Sync
let globalBroadcastChannel = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    globalBroadcastChannel = new BroadcastChannel('uc_sync_channel');
    globalBroadcastChannel.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === 'PLATFORM_SETTINGS_UPDATED' && data.settings) {
        cachedSettings = { ...cachedSettings, ...data.settings };
        try {
          localStorage.setItem('fic_platform_settings', JSON.stringify(cachedSettings));
        } catch (e) {}
        notifySubscribers();
      }
    };
  } catch (e) {}
}

// 2. Window Custom Event Sync
if (typeof window !== 'undefined') {
  window.addEventListener('uc:settings-updated', (event) => {
    if (event.detail) {
      cachedSettings = { ...cachedSettings, ...event.detail };
      try {
        localStorage.setItem('fic_platform_settings', JSON.stringify(cachedSettings));
      } catch (e) {}
      notifySubscribers();
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'fic_platform_settings' && event.newValue) {
      try {
        cachedSettings = { ...cachedSettings, ...JSON.parse(event.newValue) };
        notifySubscribers();
      } catch (e) {}
    }
  });
}

/**
 * Broadcast settings change to all other tabs, windows, and dashboards in 0ms real-time
 */
export function broadcastPlatformSettings(newSettings) {
  cachedSettings = { ...cachedSettings, ...newSettings };
  try {
    localStorage.setItem('fic_platform_settings', JSON.stringify(cachedSettings));
    localStorage.setItem('fic_settings_timestamp', Date.now().toString());
  } catch (e) {}

  // 1. BroadcastChannel to all open browser tabs
  try {
    const channel = new BroadcastChannel('uc_sync_channel');
    channel.postMessage({
      type: 'PLATFORM_SETTINGS_UPDATED',
      settings: cachedSettings,
      timestamp: Date.now()
    });
    setTimeout(() => { try { channel.close(); } catch (e) {} }, 100);
  } catch (e) {}

  // 2. CustomEvent to same window components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uc:settings-updated', { detail: cachedSettings }));
  }

  // 3. Notify in-memory subscribers
  notifySubscribers();
}

/**
 * Fetch authoritative settings from backend
 */
export async function fetchPlatformSettings() {
  try {
    const res = await fetch('/api/services/platform-settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        broadcastPlatformSettings(data.settings);
        return data.settings;
      }
    }
  } catch (e) {
    // Fail silently in development/offline mode
  }
  return cachedSettings;
}

// Auto-fetch on initialization
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fetchPlatformSettings();
  }, 100);
}

/**
 * React Hook for Real-Time Platform Settings
 * Automatically re-renders whenever the admin saves or updates settings anywhere.
 */
export function usePlatformSettings() {
  const [settings, setSettings] = useState(cachedSettings);

  useEffect(() => {
    // Sync current snapshot
    setSettings(cachedSettings);

    // Subscribe to real-time changes
    const handler = (updated) => {
      setSettings({ ...updated });
    };
    subscribers.add(handler);

    return () => {
      subscribers.delete(handler);
    };
  }, []);

  const refreshSettings = useCallback(() => {
    return fetchPlatformSettings();
  }, []);

  return {
    settings,
    isSurgeActive: Boolean(settings.monsoonSurgeActive),
    surgeAmount: settings.monsoonSurgeAmount || 49,
    platformTakeRate: settings.platformTakeRate ?? 20,
    agencyTakeRate: settings.agencyTakeRate ?? 14,
    bookingFee: settings.bookingFee ?? 49,
    gstRate: settings.gstRate ?? 18,
    maintenanceMode: Boolean(settings.maintenanceMode),
    refreshSettings
  };
}
