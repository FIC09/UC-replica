import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  Bell,
  Cpu,
  Building2,
  Clock,
  Percent,
  ShieldCheck,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
  Calculator,
  Sliders,
  Check,
  Shield,
  Layers,
  MapPin
} from 'lucide-react';
import { adminClient } from '../adminClient';
import { broadcastPlatformSettings } from '../../utils/usePlatformSettings';

// Custom Animated Toggle Switch
function ToggleSwitch({ checked, onChange, disabled, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 9999,
        backgroundColor: checked ? '#6E42E5' : '#CBD5E1',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        padding: 2,
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1
      }}
    >
      <span
        style={{
          display: 'block',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </button>
  );
}

// Reusable Form Field Wrapper
function FormField({ label, helper, badge, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
        {badge && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#6366F1',
            backgroundColor: '#EEF2FF',
            padding: '2px 8px',
            borderRadius: 6,
            border: '1px solid #E0E7FF'
          }}>
            {badge}
          </span>
        )}
      </div>
      {children}
      {helper && <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.35 }}>{helper}</div>}
    </div>
  );
}

const DEFAULT_SETTINGS = {
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
  },

  // Integrations
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
      name: 'Google Maps Geocoding & Leaflet OSM',
      type: 'Maps & Geocoding',
      status: 'Operational (Public OSM)',
      isAvailable: true,
      isSimulated: false,
      notes: 'Operating on OpenStreetMap high-resolution raster tiles. Zero API key requirement.'
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

export function SettingsView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingSurge, setTogglingSurge] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULT_SETTINGS);
  const [simCalcAmount, setSimCalcAmount] = useState(1000);

  // Load settings from backend on mount
  useEffect(() => {
    adminClient.getSettings()
      .then(res => {
        if (res.settings) {
          const merged = {
            ...DEFAULT_SETTINGS,
            ...res.settings,
            notificationPreferences: {
              ...DEFAULT_SETTINGS.notificationPreferences,
              ...(res.settings.notificationPreferences || {})
            },
            integrations: (res.settings.integrations && res.settings.integrations.length > 0)
              ? res.settings.integrations
              : DEFAULT_SETTINGS.integrations
          };
          setSettings(merged);
          setOriginalSettings(merged);
        }
      })
      .catch(err => {
        console.warn('Using default platform settings:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Check if form has unsaved modifications
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  // Handle Save
  function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    adminClient.updateSettings(settings)
      .then(res => {
        setSaving(false);
        if (res.settings) {
          const updated = {
            ...settings,
            ...res.settings,
            notificationPreferences: {
              ...settings.notificationPreferences,
              ...(res.settings.notificationPreferences || {})
            }
          };
          setSettings(updated);
          setOriginalSettings(updated);
          broadcastPlatformSettings(updated);
        } else {
          setOriginalSettings(settings);
          broadcastPlatformSettings(settings);
        }
        if (onShowToast) onShowToast('Platform governance parameters updated and broadcast to all dashboards in real-time.');
      })
      .catch(err => {
        setSaving(false);
        if (onShowToast) onShowToast(`Error saving settings: ${err.message}`);
      });
  }

  // Handle Quick Surge Pricing Toggle
  function handleToggleSurge() {
    setTogglingSurge(true);
    const newSurgeActive = !settings.monsoonSurgeActive;
    adminClient.toggleSurge(newSurgeActive, settings.monsoonSurgeAmount || 49)
      .then(res => {
        setTogglingSurge(false);
        const updated = {
          ...settings,
          monsoonSurgeActive: res.monsoonSurgeActive !== undefined ? res.monsoonSurgeActive : newSurgeActive
        };
        setSettings(updated);
        setOriginalSettings(prev => ({ ...prev, monsoonSurgeActive: updated.monsoonSurgeActive }));
        broadcastPlatformSettings(updated);
        if (onShowToast) {
          onShowToast(newSurgeActive
            ? `⚡ Weather Surge Activated (+₹${settings.monsoonSurgeAmount || 49}) & broadcast to all dashboards`
            : 'Weather Surge Deactivated across all dashboards');
        }
      })
      .catch(err => {
        setTogglingSurge(false);
        if (onShowToast) onShowToast(`Failed to toggle surge: ${err.message}`);
      });
  }

  // Reset to original values
  function handleReset() {
    setSettings(originalSettings);
    if (onShowToast) onShowToast('Reverted modifications back to active system values');
  }

  const TABS = [
    { id: 'general', label: 'General & Branding', icon: Building2 },
    { id: 'hours_dispatch', label: 'Hours & Dispatch', icon: Clock },
    { id: 'commissions', label: 'Commissions & Fees', icon: Percent },
    { id: 'cancellations', label: 'Cancellations & Refunds', icon: RotateCcw },
    { id: 'safety_surge', label: 'Safety, Security & Surge', icon: ShieldCheck },
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
    { id: 'integrations', label: 'Integrations & APIs', icon: Cpu }
  ];

  const inputStyle = {
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid #CBD5E1',
    fontSize: 13.5,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar aligned to admin header standards */}
      <div className="admin-page-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '16px 24px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Platform Configuration &amp; Governance
            </h3>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0'
            }}>
              ● Production Engine Live
            </span>
            {settings.monsoonSurgeActive && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FDE68A',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <Zap size={11} fill="#B45309" /> Monsoon Surge Active (+₹{settings.monsoonSurgeAmount})
              </span>
            )}
            {settings.maintenanceMode && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 6,
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FECACA'
              }}>
                🔒 Maintenance Lockdown Active
              </span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
            Configure marketplace parameters, commission take schedules, dispatch geofences, and external integrations
          </p>
        </div>

        {/* Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} /> Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSurge}
            disabled={togglingSurge}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 8,
              border: settings.monsoonSurgeActive ? '1px solid #F59E0B' : '1px solid #E2E8F0',
              backgroundColor: settings.monsoonSurgeActive ? '#FFFBEB' : '#F8FAFC',
              color: settings.monsoonSurgeActive ? '#B45309' : '#475569',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: togglingSurge ? 'not-allowed' : 'pointer'
            }}
          >
            <Zap size={14} fill={settings.monsoonSurgeActive ? '#B45309' : 'none'} color={settings.monsoonSurgeActive ? '#B45309' : '#64748B'} />
            {togglingSurge ? 'Toggling...' : settings.monsoonSurgeActive ? 'Disable Surge' : 'Quick Surge (+₹49)'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: hasUnsavedChanges ? '#6E42E5' : '#94A3B8',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: hasUnsavedChanges && !saving ? 'pointer' : 'not-allowed',
              boxShadow: hasUnsavedChanges ? '0 2px 6px rgba(110, 66, 229, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Save size={15} /> {saving ? 'Recording Audit...' : hasUnsavedChanges ? 'Save Configuration' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="admin-page-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div style={{
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 8,
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12.5,
            color: '#92400E'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#D97706" />
              <span><strong>Unsaved modifications:</strong> You have adjusted governance settings. Remember to click <strong>Save Configuration</strong> to apply and record to the audit trail.</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#B45309',
                color: '#FFFFFF',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 11.5,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
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
                  padding: '9px 15px',
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #6E42E5' : '2px solid transparent',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#6E42E5' : '#64748B',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isActive ? '#6E42E5' : '#64748B'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels Container */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 24,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>

          {/* TAB 1: GENERAL & BRANDING */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={18} color="#6E42E5" /> Marketplace Identity &amp; Corporate Legal Entity
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Statutory brand information printed on customer tax invoices, pro commission receipts, and SMS/WhatsApp header sender IDs.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                <FormField label="Platform Marketplace Name" required helper="Displayed across customer booking apps, technician portal and invoice headers.">
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={e => setSettings({ ...settings, platformName: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Corporate Legal Entity Name" required helper="Registered statutory name used in GST invoices, vendor contracts, and bank settlements.">
                  <input
                    type="text"
                    value={settings.companyLegalName}
                    onChange={e => setSettings({ ...settings, companyLegalName: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Toll-Free Customer Support Helpline" required helper="Direct customer emergency assistance line displayed in mobile app support section.">
                  <input
                    type="text"
                    value={settings.supportHelpline}
                    onChange={e => setSettings({ ...settings, supportHelpline: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Corporate Operations & Support Email" required helper="Official mailbox for enterprise billing, legal inquiries, and disputes.">
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Statutory GSTIN Number" badge="15-Digit GST" required helper="Mandatory government GST registration number for tax compliance.">
                  <input
                    type="text"
                    value={settings.gstinNumber}
                    onChange={e => setSettings({ ...settings, gstinNumber: e.target.value.toUpperCase() })}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </FormField>

                <FormField label="Platform Currency & Localization" badge="INR / India" helper="Explicit primary billing currency and locale convention.">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      disabled
                      value={`${settings.currency} (${settings.currencySymbol})`}
                      style={{ ...inputStyle, backgroundColor: '#F8FAFC', cursor: 'not-allowed', width: '40%' }}
                    />
                    <input
                      type="text"
                      disabled
                      value={`${settings.timeZone} (IST)`}
                      style={{ ...inputStyle, backgroundColor: '#F8FAFC', cursor: 'not-allowed', width: '60%' }}
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Headquarters & Registered Operating Office" required helper="Physical company address printed in compliance sections and tax invoices.">
                <textarea
                  rows={2}
                  value={settings.headquartersAddress}
                  onChange={e => setSettings({ ...settings, headquartersAddress: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </FormField>

              {/* Live Preview Card */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Invoice &amp; Receipt Header Preview</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{settings.platformName}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>Operated by: {settings.companyLegalName} • GSTIN: <span style={{ fontFamily: 'monospace' }}>{settings.gstinNumber}</span></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#64748B' }}>
                  <div>Helpline: <strong>{settings.supportHelpline}</strong></div>
                  <div>Support: <strong>{settings.supportEmail}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOURS & DISPATCH */}
          {activeTab === 'hours_dispatch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={18} color="#6E42E5" /> Service Operating Windows &amp; Dispatch Radar
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Control available customer booking slot times, technician travel buffers, and geo-fence broadcast scan radius.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                <FormField label="Service Hours Window Start" badge="24-Hour Format" required helper="Earliest appointment slot available for customer booking.">
                  <input
                    type="time"
                    value={settings.serviceHoursStart}
                    onChange={e => setSettings({ ...settings, serviceHoursStart: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Service Hours Window End" badge="24-Hour Format" required helper="Latest appointment slot available for customer booking.">
                  <input
                    type="time"
                    value={settings.serviceHoursEnd}
                    onChange={e => setSettings({ ...settings, serviceHoursEnd: e.target.value })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Default Slot Duration" badge="Minutes" required helper="Standard time allocation scheduled per technician appointment.">
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={settings.slotDurationMinutes}
                    onChange={e => setSettings({ ...settings, slotDurationMinutes: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Minimum Advance Notice" badge="Hours" required helper="Lead time required before the nearest booking time slot opens.">
                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={settings.minAdvanceNoticeHours}
                    onChange={e => setSettings({ ...settings, minAdvanceNoticeHours: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Inter-Job Travel Buffer" badge="Minutes" required helper="Reserved travel and transition buffer between consecutive jobs for each technician.">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    step={5}
                    value={settings.bookingBufferMinutes}
                    onChange={e => setSettings({ ...settings, bookingBufferMinutes: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Technician Dispatch Geo-Fence Radius" badge="Kilometers" required helper="Scan radius around the customer location to ring nearby solo pros and fleet partners.">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={0.5}
                    value={settings.dispatchRadiusKm}
                    onChange={e => setSettings({ ...settings, dispatchRadiusKm: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </FormField>
              </div>

              {/* Operating Radius Visualizer */}
              <div style={{
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14
              }}>
                <MapPin size={22} color="#4F46E5" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: '#312E81', lineHeight: 1.45 }}>
                  <strong>Operating Radar in Krishnagiri &amp; Tier-2 Zones:</strong>
                  <div style={{ marginTop: 4, color: '#4338CA' }}>
                    With a <strong>{settings.dispatchRadiusKm} km radius</strong>, customer requests will broadcast to verified technicians within Rayakottai Road, Gandhi Nagar, Old Bus Stand, and nearby residential clusters. Consecutive jobs enforce a mandatory <strong>{settings.bookingBufferMinutes} min buffer</strong> to prevent transit delays.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMISSIONS & FEES */}
          {activeTab === 'commissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Percent size={18} color="#6E42E5" /> Commission Take Rates &amp; Convenience Fees
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Govern platform take percentages, agency partner overrides, GST rates, and customer convenience fees.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                <FormField label="Statutory GST Rate" badge="18% Standard" required helper="Statutory GST percentage automatically added to service orders and commission take.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      step={1}
                      value={settings.gstRate}
                      onChange={e => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingRight: 32 }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>%</span>
                  </div>
                </FormField>

                <FormField label="Solo Professional Platform Take Rate" badge="FIC Take" required helper="Marketplace commission deducted from independent freelance technicians.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      step={1}
                      value={settings.platformTakeRate}
                      onChange={e => setSettings({ ...settings, platformTakeRate: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingRight: 32 }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>%</span>
                  </div>
                </FormField>

                <FormField label="Agency Fleet Partner Take Rate" badge="Partner Tier" required helper="Discounted take rate for registered franchise partners with assigned technician fleets.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={settings.agencyTakeRate}
                      onChange={e => setSettings({ ...settings, agencyTakeRate: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingRight: 32 }}
                    />
                    <span style={{ position: 'absolute', right: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>%</span>
                  </div>
                </FormField>

                <FormField label="Customer Platform Booking Fee" badge="INR (₹)" required helper="Fixed convenience & safety insurance fee applied per booking checkout.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={settings.bookingFee}
                      onChange={e => setSettings({ ...settings, bookingFee: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingLeft: 28 }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>₹</span>
                  </div>
                </FormField>
              </div>

              {/* Interactive Revenue Simulation Calculator */}
              <div style={{
                backgroundColor: '#FAF5FF',
                border: '1px solid #E9D5FF',
                borderRadius: 12,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calculator size={18} color="#7C3AED" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#4C1D95' }}>Live Settlement Simulator</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B21A8', fontWeight: 600 }}>Simulate Order Amount:</span>
                    <input
                      type="number"
                      min={100}
                      max={50000}
                      step={100}
                      value={simCalcAmount}
                      onChange={e => setSimCalcAmount(Number(e.target.value) || 0)}
                      style={{ width: 110, padding: '4px 8px', borderRadius: 6, border: '1px solid #C084FC', fontWeight: 700, fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: 8, border: '1px solid #F3E8FF' }}>
                    <div style={{ fontSize: 11, color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase' }}>Customer Total Paid</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                      ₹{(simCalcAmount + settings.bookingFee).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 2 }}>Base: ₹{simCalcAmount} + Fee: ₹{settings.bookingFee}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: 8, border: '1px solid #F3E8FF' }}>
                    <div style={{ fontSize: 11, color: '#6E42E5', fontWeight: 700, textTransform: 'uppercase' }}>FIC Platform Take ({settings.platformTakeRate}%)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#6E42E5', marginTop: 4 }}>
                      ₹{((simCalcAmount * settings.platformTakeRate) / 100).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: '#6E42E5', marginTop: 2 }}>+ Convenience Fee: ₹{settings.bookingFee}</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: 8, border: '1px solid #F3E8FF' }}>
                    <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Solo Pro Net Payout</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                      ₹{(simCalcAmount - (simCalcAmount * settings.platformTakeRate) / 100).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>{100 - settings.platformTakeRate}% direct worker share</div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', borderRadius: 8, border: '1px solid #F3E8FF' }}>
                    <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Agency Fleet Payout</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', marginTop: 4 }}>
                      ₹{(simCalcAmount - (simCalcAmount * settings.agencyTakeRate) / 100).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>At {settings.agencyTakeRate}% agency discount rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CANCELLATIONS & REFUNDS */}
          {activeTab === 'cancellations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={18} color="#6E42E5" /> Cancellation Rules &amp; Instant Auto-Refund Thresholds
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Protect technician scheduling while guaranteeing fair customer dispute policies and automatic settlement thresholds.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                <FormField label="Free Cancellation Window" badge="Hours Before Slot" required helper="Customers can cancel freely with zero penalty up to this time before appointment.">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={settings.freeCancellationHours}
                    onChange={e => setSettings({ ...settings, freeCancellationHours: Number(e.target.value) })}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Late Customer Cancellation Fee" badge="INR (₹)" required helper="Fee charged if customer cancels within the restricted free cancellation window.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={settings.customerCancellationFee}
                      onChange={e => setSettings({ ...settings, customerCancellationFee: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingLeft: 28 }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>₹</span>
                  </div>
                </FormField>

                <FormField label="Technician No-Show / Late Cancel Penalty" badge="INR (₹)" required helper="Penalty levied on technician earnings for unexcused cancellations or doorstep no-shows.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={settings.proCancelPenalty}
                      onChange={e => setSettings({ ...settings, proCancelPenalty: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingLeft: 28 }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>₹</span>
                  </div>
                </FormField>

                <FormField label="Instant Auto-Refund Threshold" badge="INR (₹)" required helper="Refund requests up to this amount are approved immediately without requiring supervisor review.">
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={5000}
                      value={settings.autoRefundThreshold}
                      onChange={e => setSettings({ ...settings, autoRefundThreshold: Number(e.target.value) })}
                      style={{ ...inputStyle, paddingLeft: 28 }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>₹</span>
                  </div>
                </FormField>
              </div>

              {/* Policy Explanation Banner */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}>
                <Info size={20} color="#64748B" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>
                  <strong>Dispute &amp; Cancellation Policy Summary:</strong> If a customer cancels within {settings.freeCancellationHours} hours of the scheduled time, ₹{settings.customerCancellationFee} is deducted from the refund and 50% is credited directly to the allocated technician as trip compensation. Customer refunds under ₹{settings.autoRefundThreshold} are disbursed back to the source method instantly.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY, SECURITY & SURGE */}
          {activeTab === 'safety_surge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="#6E42E5" /> Safety Checkpoints, Doorstep Verification &amp; Surge
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Manage mandatory job start/completion verification gates and emergency weather surge surcharges.
                </p>
              </div>

              {/* Security & Verification Gateways */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Doorstep Facial / Photo Verification Requirement</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Requires technician to capture an arrival selfie at the customer doorstep before tapping "Arrived".
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-face-auth"
                    checked={settings.requireDoorstepFaceAuth}
                    onChange={v => setSettings({ ...settings, requireDoorstepFaceAuth: v })}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Customer 4-Digit Completion OTP Gate</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Technicians cannot mark an order complete without the customer providing their 4-digit verification code.
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-otp-finish"
                    checked={settings.requireOtpJobCompletion}
                    onChange={v => setSettings({ ...settings, requireOtpJobCompletion: v })}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: settings.maintenanceMode ? '#FEF2F2' : '#F8FAFC',
                  borderRadius: 10,
                  border: settings.maintenanceMode ? '1px solid #FECACA' : '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: settings.maintenanceMode ? '#DC2626' : '#0F172A' }}>
                      Global Customer Portal Maintenance Lockdown
                    </div>
                    <div style={{ fontSize: 12, color: settings.maintenanceMode ? '#B91C1C' : '#64748B', marginTop: 2 }}>
                      Temporarily halts new customer checkouts with a friendly maintenance notice. (Admin &amp; Pro Portals remain fully accessible).
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-maintenance"
                    checked={settings.maintenanceMode}
                    onChange={v => setSettings({ ...settings, maintenanceMode: v })}
                  />
                </div>
              </div>

              {/* Weather / Monsoon Surge Pricing */}
              <div style={{
                backgroundColor: settings.monsoonSurgeActive ? '#FFFBEB' : '#F8FAFC',
                border: settings.monsoonSurgeActive ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: settings.monsoonSurgeActive ? '#B45309' : '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={16} fill={settings.monsoonSurgeActive ? '#B45309' : 'none'} color="#B45309" />
                      Weather &amp; Monsoon Dynamic Surcharge
                    </div>
                    <div style={{ fontSize: 12, color: settings.monsoonSurgeActive ? '#92400E' : '#64748B', marginTop: 2 }}>
                      Applies an additional surcharge during heavy rainfall, storms, or severe weather to compensate field technicians.
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-monsoon-surge"
                    checked={settings.monsoonSurgeActive}
                    onChange={v => setSettings({ ...settings, monsoonSurgeActive: v })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <FormField label="Monsoon Surcharge Amount" badge="INR (₹)" helper="Added to customer bill and passed directly to the assigned professional.">
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={settings.monsoonSurgeAmount}
                        onChange={e => setSettings({ ...settings, monsoonSurgeAmount: Number(e.target.value) })}
                        style={{ ...inputStyle, paddingLeft: 28 }}
                      />
                      <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>₹</span>
                    </div>
                  </FormField>

                  <FormField label="Maximum Allowed Surge Multiplier" badge="Multiplier" helper="Hard regulatory ceiling for high-demand slot price increases.">
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min={1.0}
                        max={3.0}
                        step={0.1}
                        value={settings.maxSurgeMultiplier}
                        onChange={e => setSettings({ ...settings, maxSurgeMultiplier: Number(e.target.value) })}
                        style={{ ...inputStyle, paddingRight: 32 }}
                      />
                      <span style={{ position: 'absolute', right: 12, top: 10, fontSize: 13, fontWeight: 700, color: '#64748B' }}>x</span>
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATION RULES */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={18} color="#6E42E5" /> Automated Notification Channels &amp; Dispatches
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Enable or silence automated dispatch alerts, OTP SMS dispatches, WhatsApp live tracking links, and staff SLA warnings.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Customer SMS Order Confirmations &amp; OTPs</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Sends instant SMS upon order booking confirmation, 4-digit arrival OTP, and status changes.
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-sms-alerts"
                    checked={settings.notificationPreferences?.smsOrderAlerts}
                    onChange={v => setSettings({
                      ...settings,
                      notificationPreferences: { ...settings.notificationPreferences, smsOrderAlerts: v }
                    })}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>WhatsApp Dispatch &amp; Live Location Tracking Updates</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Dispatches live WhatsApp message with technician profile, ETA, and real-time Leaflet tracking URL.
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-whatsapp"
                    checked={settings.notificationPreferences?.whatsappDispatch}
                    onChange={v => setSettings({
                      ...settings,
                      notificationPreferences: { ...settings.notificationPreferences, whatsappDispatch: v }
                    })}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Automated Email Invoices &amp; Tax Receipts</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Generates and emails PDF tax receipt containing statutory GSTIN and breakdown immediately upon job completion.
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-email-invoices"
                    checked={settings.notificationPreferences?.emailInvoices}
                    onChange={v => setSettings({
                      ...settings,
                      notificationPreferences: { ...settings.notificationPreferences, emailInvoices: v }
                    })}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Operations Staff Push Alerts for SLA Breaches</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      Alerts operations control managers when support tickets or revisit requests near breach deadline.
                    </div>
                  </div>
                  <ToggleSwitch
                    id="toggle-staff-alerts"
                    checked={settings.notificationPreferences?.staffPushAlerts}
                    onChange={v => setSettings({
                      ...settings,
                      notificationPreferences: { ...settings.notificationPreferences, staffPushAlerts: v }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INTEGRATIONS & APIS */}
          {activeTab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14 }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={18} color="#6E42E5" /> Third-Party Integrations &amp; Gateway Status Dashboard
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0' }}>
                  Live operational health of external APIs. All simulated test gateways, local queues, and public OSM tile providers are transparently audited.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(settings.integrations || []).map(intg => (
                  <div key={intg.id} style={{
                    padding: '16px 20px',
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        backgroundColor: intg.isAvailable ? '#F5F3FF' : '#F1F5F9',
                        color: intg.isAvailable ? '#6E42E5' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        <Cpu size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>{intg.name}</span>
                          <span style={{ fontSize: 11, color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>
                            {intg.type}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{intg.notes}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11.5,
                        fontWeight: 700,
                        backgroundColor: intg.isSimulated ? '#FEF3C7' : intg.isAvailable ? '#DCFCE7' : '#F1F5F9',
                        color: intg.isSimulated ? '#B45309' : intg.isAvailable ? '#15803D' : '#64748B'
                      }}>
                        {intg.status}
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: intg.isAvailable ? '#16A34A' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {intg.isAvailable ? '● Active' : '○ Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
