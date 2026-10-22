import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  MapPin, 
  Clock, 
  Globe, 
  Building2, 
  Bell, 
  RotateCcw, 
  AlertCircle,
  Cpu,
  Layers,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function SettingsView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('brand');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Brand & Business
    platformName: 'Urban Company Marketplace',
    companyLegalName: 'Urban Marketplace Services India Pvt. Ltd.',
    supportHelpline: '+91 1800 200 4567',
    supportEmail: 'corporate-ops@urbancompany.com',
    headquartersAddress: 'Plot 19, Udyog Vihar Phase IV, Gurugram, Haryana - 122015, India',
    gstinNumber: '07AAACU9812K1Z5',

    // Currency & Time Zone
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
    },

    // Integrations
    integrations: []
  });

  useEffect(() => {
    adminClient.getSettings()
      .then(res => {
        if (res.settings) {
          setSettings(prev => ({
            ...prev,
            ...res.settings,
            notificationPreferences: {
              ...prev.notificationPreferences,
              ...(res.settings.notificationPreferences || {})
            }
          }));
        }
      })
      .catch(() => {});
  }, []);

  function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    adminClient.updateSettings(settings)
      .then(res => {
        setSaving(false);
        if (res.settings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
        }
        if (onShowToast) onShowToast('Platform parameters successfully updated and audit logged');
      })
      .catch(err => {
        setSaving(false);
        if (onShowToast) onShowToast(`Error saving settings: ${err.message}`);
      });
  }

  const TABS = [
    { id: 'brand', label: 'Brand & Business', icon: Building2 },
    { id: 'localization', label: 'Currency & Time Zone', icon: Globe },
    { id: 'hours', label: 'Operating Hours & Buffers', icon: Clock },
    { id: 'finance', label: 'Taxes & Commission', icon: Percent },
    { id: 'rules', label: 'Cancellation & Refunds', icon: RotateCcw },
    { id: 'security', label: 'Security & Safety', icon: ShieldCheck },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
    { id: 'integrations', label: 'Integration Status', icon: Cpu }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Platform Configuration & Governance</h3>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0 0' }}>Configure marketplace parameters, commission schedules, operating zones and integrations</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#6E42E5',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 4,
        overflowX: 'auto'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '2px solid #6E42E5' : '2px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#6E42E5' : '#64748B',
                fontSize: 12.5,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} color={isActive ? '#6E42E5' : '#64748B'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: 24,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {/* 1. Brand & Business Info */}
        {activeTab === 'brand' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} color="#6E42E5" /> Legal Entity & Customer Helpline Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Platform Marketplace Brand Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Displayed on consumer app headers & invoices</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Registered Legal Entity Name</label>
                <input
                  type="text"
                  value={settings.companyLegalName}
                  onChange={e => setSettings({ ...settings, companyLegalName: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Corporate name for contracts & tax filings</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Customer Support Helpline</label>
                <input
                  type="text"
                  value={settings.supportHelpline}
                  onChange={e => setSettings({ ...settings, supportHelpline: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Toll-free customer assistance line</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Operations & Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Corporate escalation address</span>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Registered Corporate Headquarters Address</label>
                <input
                  type="text"
                  value={settings.headquartersAddress}
                  onChange={e => setSettings({ ...settings, headquartersAddress: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Corporate GSTIN Number</label>
                <input
                  type="text"
                  value={settings.gstinNumber}
                  onChange={e => setSettings({ ...settings, gstinNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Currency & Time Zone */}
        {activeTab === 'localization' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={16} color="#6E42E5" /> Explicit Currency & Business Time Zone
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Marketplace Operating Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                >
                  <option value="INR">INR — Indian Rupee (₹)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="AED">AED — UAE Dirham (AED)</option>
                  <option value="SGD">SGD — Singapore Dollar (S$)</option>
                </select>
                <span style={{ fontSize: 11, color: '#64748B' }}>Primary currency for checkout, billing and partner payouts</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Business Time Zone</label>
                <select
                  value={settings.timeZone}
                  onChange={e => setSettings({ ...settings, timeZone: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+05:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST — UTC+04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT — UTC+08:00)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </select>
                <span style={{ fontSize: 11, color: '#64748B' }}>All booking slots, timestamps and audit trails sync to this time zone</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Default System Locale</label>
                <input
                  type="text"
                  value={settings.defaultLocale}
                  onChange={e => setSettings({ ...settings, defaultLocale: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Standard formatting for numbers, dates and currencies (e.g. en-IN)</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Operating Hours & Buffers */}
        {activeTab === 'hours' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#6E42E5" /> Service Hours, Appointment Slots & Dispatch Buffers
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Service Hours Start (Daily)</label>
                <input
                  type="time"
                  value={settings.serviceHoursStart}
                  onChange={e => setSettings({ ...settings, serviceHoursStart: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Earliest appointment slot available for customer booking</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Service Hours End (Daily)</label>
                <input
                  type="time"
                  value={settings.serviceHoursEnd}
                  onChange={e => setSettings({ ...settings, serviceHoursEnd: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Latest slot booking cutoff</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Standard Slot Duration (Minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="240"
                  value={settings.slotDurationMinutes}
                  onChange={e => setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Calendar booking intervals</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Dispatch Travel Buffer (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={settings.bookingBufferMinutes}
                  onChange={e => setSettings({ ...settings, bookingBufferMinutes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Buffer time enforced between consecutive bookings for pro commute</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Minimum Advance Notice (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={settings.minAdvanceNoticeHours}
                  onChange={e => setSettings({ ...settings, minAdvanceNoticeHours: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Lead time before customer can book an immediate slot</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Technician Geo-Scan Radius (km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.dispatchRadiusKm}
                  onChange={e => setSettings({ ...settings, dispatchRadiusKm: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Maximum radius to auto-assign technicians</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Taxes & Commission */}
        {activeTab === 'finance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Percent size={16} color="#6E42E5" /> Commission Structures, Platform Take Rates & Statutory GST
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Statutory GST Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={settings.gstRate}
                  onChange={e => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Statutory goods & services tax applied on platform fees</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Solo Professional Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={settings.platformTakeRate}
                  onChange={e => setSettings({ ...settings, platformTakeRate: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Marketplace take rate for independent technicians</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Agency Partner Fleet Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.agencyTakeRate}
                  onChange={e => setSettings({ ...settings, agencyTakeRate: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Volume-discounted take rate for registered agency fleets</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Customer Booking Convenience Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.bookingFee}
                  onChange={e => setSettings({ ...settings, bookingFee: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Standard convenience & safety insurance fee per order</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Cancellation & Refunds */}
        {activeTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={16} color="#6E42E5" /> Cancellation Policies & Refund Thresholds
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Free Cancellation Window (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={settings.freeCancellationHours}
                  onChange={e => setSettings({ ...settings, freeCancellationHours: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Customers can cancel free up to this many hours before slot</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Late Customer Cancellation Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.customerCancellationFee}
                  onChange={e => setSettings({ ...settings, customerCancellationFee: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Charged if customer cancels within the 4-hour window</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Professional Unexcused Cancellation Penalty (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.proCancelPenalty}
                  onChange={e => setSettings({ ...settings, proCancelPenalty: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Auto-debited from pro ledger upon no-show or unexcused drop</span>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Automatic Refund Processing Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.autoRefundThreshold}
                  onChange={e => setSettings({ ...settings, autoRefundThreshold: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', marginTop: 4, fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>Instant reversal limit; refunds above this require supervisor review</span>
              </div>
            </div>
          </div>
        )}

        {/* 6. Security & Safety Checkpoints */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#6E42E5" /> Doorstep Safety, Verification Checkpoints & System State
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Customer OTP Verification for Job Completion</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Professional must obtain the customer's 4-digit secret OTP to mark service as completed</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireOtpJobCompletion}
                  onChange={e => setSettings({ ...settings, requireOtpJobCompletion: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#6E42E5', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Doorstep Selfie & Uniform Verification</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Technician must snap selfie wearing official badge before initiating doorstep work</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireDoorstepFaceAuth}
                  onChange={e => setSettings({ ...settings, requireDoorstepFaceAuth: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#6E42E5', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>Global Marketplace Maintenance Mode</div>
                  <div style={{ fontSize: 12, color: '#991B1B' }}>Immediately disables new order bookings across both customer web & mobile apps</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#DC2626', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* 7. Notification Rules */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="#6E42E5" /> Automated Notification Channels & Dispatches
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Customer SMS Order Confirmations & OTPs</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Sends instant SMS on booking confirmation, OTP generation and job start</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences?.smsOrderAlerts}
                  onChange={e => setSettings({
                    ...settings,
                    notificationPreferences: { ...settings.notificationPreferences, smsOrderAlerts: e.target.checked }
                  })}
                  style={{ width: 18, height: 18, accentColor: '#6E42E5', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>WhatsApp Dispatch & Location Updates</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Sends technician en-route alert and live location link to customer WhatsApp</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences?.whatsappDispatch}
                  onChange={e => setSettings({
                    ...settings,
                    notificationPreferences: { ...settings.notificationPreferences, whatsappDispatch: e.target.checked }
                  })}
                  style={{ width: 18, height: 18, accentColor: '#6E42E5', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Automated Email Invoices & Tax Receipts</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Emails GST-compliant tax invoice PDF to customer upon job completion</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences?.emailInvoices}
                  onChange={e => setSettings({
                    ...settings,
                    notificationPreferences: { ...settings.notificationPreferences, emailInvoices: e.target.checked }
                  })}
                  style={{ width: 18, height: 18, accentColor: '#6E42E5', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Staff Push Alerts for SLA Breaches</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Alerts operations managers when support tickets or revisits near breach deadline</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences?.staffPushAlerts}
                  onChange={e => setSettings({
                    ...settings,
                    notificationPreferences: { ...settings.notificationPreferences, staffPushAlerts: e.target.checked }
                  })}
                  style={{ width: 18, height: 18, accentColor: '#6E42E5', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* 8. Third-Party Integrations Status Dashboard */}
        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={16} color="#6E42E5" /> Third-Party Integrations & Gateway Status Dashboard
              </h4>
              <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                Clear operational status of external APIs. All simulated sandbox gateways and unconfigured third-party providers are explicitly identified.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(settings.integrations || []).map(intg => (
                <div key={intg.id} style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: intg.isAvailable ? '#F5F3FF' : '#F1F5F9',
                      color: intg.isAvailable ? '#6E42E5' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      <Cpu size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 13.5 }}>{intg.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{intg.notes}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: intg.isSimulated ? '#FEF3C7' : intg.isAvailable ? '#DCFCE7' : '#F1F5F9',
                      color: intg.isSimulated ? '#B45309' : intg.isAvailable ? '#15803D' : '#64748B'
                    }}>
                      {intg.status}
                    </span>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: intg.isAvailable ? '#16A34A' : '#64748B'
                    }}>
                      {intg.isAvailable ? '● Operational (Local)' : '○ Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
