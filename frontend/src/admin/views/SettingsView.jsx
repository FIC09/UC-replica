import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Bell, 
  Cpu
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function SettingsView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('notifications');
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
    { id: 'notifications', label: 'Notification Rules', icon: Bell },
    { id: 'integrations', label: 'Integration Status', icon: Cpu }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#F8FAFC',
        padding: '10px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
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
        {/* Notification Rules */}
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
