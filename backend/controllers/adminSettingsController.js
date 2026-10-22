import { AdminSetting } from '../models/AdminSetting.js';
import { recordAuditTrail } from './adminAuditController.js';

// Default platform governance configuration
let platformSettings = {
  // 1. Brand and Business Information
  platformName: 'Urban Company Marketplace',
  companyLegalName: 'Urban Marketplace Services India Pvt. Ltd.',
  supportHelpline: '+91 1800 200 4567',
  supportEmail: 'corporate-ops@urbancompany.com',
  headquartersAddress: 'Plot 19, Udyog Vihar Phase IV, Gurugram, Haryana - 122015, India',
  gstinNumber: '07AAACU9812K1Z5',

  // 2. Explicit Currency & Time Zone
  currency: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata',
  defaultLocale: 'en-IN',

  // 3. Service Operating Hours
  serviceHoursStart: '08:00',
  serviceHoursEnd: '21:00',
  slotDurationMinutes: 60,
  minAdvanceNoticeHours: 2,

  // 4. Booking Buffers
  bookingBufferMinutes: 30, // travel buffer between consecutive bookings
  dispatchRadiusKm: 7.5, // geo-fence scan radius for technician clusters

  // 5. Tax and Commission Configuration
  gstRate: 18, // 18% GST on services and fees
  platformTakeRate: 20, // 20% for solo professionals
  agencyTakeRate: 14, // 14% for agency fleet partners
  bookingFee: 49, // standard convenience fee (₹)

  // 6. Cancellation and Refund Rules
  freeCancellationHours: 4, // cancellations free up to 4h before slot
  customerCancellationFee: 100, // fee if customer cancels within 4h
  proCancelPenalty: 150, // penalty if technician cancels without emergency excuse
  autoRefundThreshold: 500, // automatic refund processing threshold without manual manager override

  // 7. Security and Safety Checkpoints
  requireDoorstepFaceAuth: true,
  requireOtpJobCompletion: true,
  maintenanceMode: false,
  maxSurgeMultiplier: 1.5,
  monsoonSurgeActive: false,
  monsoonSurgeAmount: 49,

  // 8. Notification Preferences
  notificationPreferences: {
    smsOrderAlerts: true,
    whatsappDispatch: true,
    emailInvoices: true,
    staffPushAlerts: true
  },

  // 9. Integration Status Dashboard
  integrations: [
    {
      id: 'intg-razorpay',
      name: 'Razorpay Payment Gateway',
      type: 'Payments & UPI',
      status: 'Sandbox Simulated',
      isAvailable: true,
      isSimulated: true,
      notes: 'Local test mode active. No live credit card or bank debit charges.'
    },
    {
      id: 'intg-sms',
      name: 'Gupshup / Twilio SMS Gateway',
      type: 'SMS OTP & Dispatch',
      status: 'Local Outbox Queue',
      isAvailable: true,
      isSimulated: true,
      notes: 'Carrier gateway unconfigured. Messages safely routed to Local Notification Outbox.'
    },
    {
      id: 'intg-whatsapp',
      name: 'WhatsApp Business API',
      type: 'Customer Messaging',
      status: 'Local Outbox Queue',
      isAvailable: true,
      isSimulated: true,
      notes: 'Meta Cloud API credentials unconfigured. Dispatches saved in internal outbox queue.'
    },
    {
      id: 'intg-maps',
      name: 'Google Maps Geocoding & Places',
      type: 'Maps & Distance Matrix',
      status: 'Offline / Internal Geocoder',
      isAvailable: false,
      isSimulated: false,
      notes: 'Operating on internal zone boundaries & pincode polygons. External API disabled.'
    },
    {
      id: 'intg-s3',
      name: 'AWS S3 Cloud Buckets',
      type: 'Media & Document Storage',
      status: 'Local Disk Storage',
      isAvailable: true,
      isSimulated: true,
      notes: 'Uploaded documents and photos are preserved on local protected filesystem.'
    }
  ]
};

// 1. Get Platform Settings
export async function getPlatformSettings(req, res) {
  try {
    let stored = null;
    try {
      const dbSetting = await AdminSetting.findOne({ key: 'global_platform_settings' });
      if (dbSetting?.value) {
        stored = dbSetting.value;
      }
    } catch {}

    const result = { ...platformSettings, ...(stored || {}) };
    return res.json({ success: true, settings: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Update Platform Settings with Server-Side Validation & Audit Trail
export async function updatePlatformSettings(req, res) {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings payload.' });
    }

    // Validation of numerical bounds
    if (updates.gstRate !== undefined) {
      const gst = Number(updates.gstRate);
      if (isNaN(gst) || gst < 0 || gst > 40) {
        return res.status(400).json({ success: false, error: 'Statutory GST rate must be between 0% and 40%.' });
      }
    }

    if (updates.platformTakeRate !== undefined) {
      const takeRate = Number(updates.platformTakeRate);
      if (isNaN(takeRate) || takeRate < 0 || takeRate > 60) {
        return res.status(400).json({ success: false, error: 'Solo Pro commission rate must be between 0% and 60%.' });
      }
    }

    if (updates.agencyTakeRate !== undefined) {
      const agencyRate = Number(updates.agencyTakeRate);
      if (isNaN(agencyRate) || agencyRate < 0 || agencyRate > 50) {
        return res.status(400).json({ success: false, error: 'Agency commission rate must be between 0% and 50%.' });
      }
    }

    if (updates.bookingBufferMinutes !== undefined) {
      const buffer = Number(updates.bookingBufferMinutes);
      if (isNaN(buffer) || buffer < 0 || buffer > 180) {
        return res.status(400).json({ success: false, error: 'Booking buffer time must be between 0 and 180 minutes.' });
      }
    }

    const beforeState = { ...platformSettings };
    platformSettings = {
      ...platformSettings,
      ...updates,
      // Ensure explicit currency and time zone are retained
      currency: updates.currency || platformSettings.currency,
      timeZone: updates.timeZone || platformSettings.timeZone
    };

    // Save to DB if available
    try {
      await AdminSetting.findOneAndUpdate(
        { key: 'global_platform_settings' },
        { value: platformSettings, description: 'Global platform governance parameters' },
        { upsert: true, new: true }
      );
    } catch {}

    // Record Immutable Audit Trail
    await recordAuditTrail({
      actor: req.admin,
      action: 'SETTINGS_UPDATED',
      entityType: 'PlatformSettings',
      entityId: 'SETTINGS-GLOBAL',
      reason: updates.reason || 'Platform operational parameters updated via Admin Governance Console',
      severity: 'Info',
      beforeSummary: beforeState,
      afterSummary: platformSettings,
      ipAddress: req.ip || req.connection?.remoteAddress
    });

    return res.json({
      success: true,
      message: 'Platform configuration updated and saved successfully.',
      settings: platformSettings
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Toggle Weather / Monsoon Surge with Audit Trail
export async function toggleSurgeSetting(req, res) {
  try {
    const { active, amount = 49 } = req.body;
    const beforeState = {
      monsoonSurgeActive: platformSettings.monsoonSurgeActive,
      monsoonSurgeAmount: platformSettings.monsoonSurgeAmount
    };

    platformSettings.monsoonSurgeActive = Boolean(active);
    platformSettings.monsoonSurgeAmount = Number(amount);

    try {
      await AdminSetting.findOneAndUpdate(
        { key: 'global_platform_settings' },
        { value: platformSettings },
        { upsert: true }
      );
    } catch {}

    // Record Immutable Audit Trail
    await recordAuditTrail({
      actor: req.admin,
      action: active ? 'PRICE_SURGE_ENABLED' : 'PRICE_SURGE_DISABLED',
      entityType: 'PlatformSettings',
      entityId: 'SETTINGS-SURGE',
      reason: active ? `Weather/monsoon surge enabled (+₹${amount})` : 'Weather surge deactivated',
      severity: 'Warning',
      beforeSummary: beforeState,
      afterSummary: {
        monsoonSurgeActive: platformSettings.monsoonSurgeActive,
        monsoonSurgeAmount: platformSettings.monsoonSurgeAmount
      },
      ipAddress: req.ip || req.connection?.remoteAddress
    });

    return res.json({
      success: true,
      monsoonSurgeActive: platformSettings.monsoonSurgeActive,
      monsoonSurgeAmount: platformSettings.monsoonSurgeAmount,
      message: active ? 'Monsoon surge pricing activated across high-demand clusters.' : 'Monsoon surge deactivated.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
