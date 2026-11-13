import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp = null;
let messaging = null;

try {
  const serviceAccountPath = path.resolve(__dirname, './firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    if (getApps().length === 0) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log(`[Firebase Admin] Successfully initialized for project: ${serviceAccount.project_id}`);
    } else {
      firebaseApp = getApps()[0];
    }

    messaging = getMessaging(firebaseApp);
  } else {
    console.warn('[Firebase Admin] Service account file not found at:', serviceAccountPath);
  }
} catch (error) {
  console.error('[Firebase Admin] Initialization failed:', error.message);
}

/**
 * Send FCM Push Notification directly via Firebase Cloud Messaging
 * @param {string} token Device FCM Registration Token
 * @param {object} payload { title, body, data }
 */
export async function sendFcmNotification(token, { title, body, data = {} }) {
  if (!messaging) {
    console.warn('[Firebase Admin] Messaging service not initialized');
    return { success: false, error: 'Firebase messaging not initialized' };
  }

  // Stringify nested data values as required by FCM specification
  const stringifiedData = {};
  for (const [key, value] of Object.entries(data)) {
    stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }

  const message = {
    token,
    notification: {
      title,
      body
    },
    data: stringifiedData,
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
        sound: 'default',
        priority: 'high',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
      }
    }
  };

  try {
    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('[Firebase Admin] Send notification error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send FCM Multicast to multiple registration tokens
 * @param {string[]} tokens List of FCM tokens
 * @param {object} payload { title, body, data }
 */
export async function sendFcmMulticast(tokens, { title, body, data = {} }) {
  if (!messaging) {
    return { success: false, error: 'Firebase messaging not initialized' };
  }
  if (!tokens || tokens.length === 0) {
    return { success: true, count: 0 };
  }

  const stringifiedData = {};
  for (const [key, value] of Object.entries(data)) {
    stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
  }

  const message = {
    tokens,
    notification: {
      title,
      body
    },
    data: stringifiedData,
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
        sound: 'default',
        priority: 'high'
      }
    }
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('[Firebase Admin] Multicast error:', error.message);
    return { success: false, error: error.message };
  }
}

export { firebaseApp, messaging };
export default firebaseApp;
