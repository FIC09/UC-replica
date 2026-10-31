import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Phone,
  Clock,
  Bell,
  Check,
  Shield,
  Lock,
  AlertTriangle,
  Building2,
  Sliders,
  CheckCircle2,
  Layers,
  Palette,
  ExternalLink
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function SettingsView({ showToast, staff }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Immediate operational fields
  const [form, setForm] = useState({
    displayName: '',
    tagline: '',
    phone: '',
    emergencyPhone: '',
    operatingHours: {
      start: '08:00',
      end: '20:00',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    autoDispatch: false,
    notificationPreferences: {
      smsAlerts: false,
      emailAlerts: false,
      dispatchPushes: false,
      whatsappUpdates: false
    },
    branding: {
      brandColor: '#7c3aed',
      coBrandedBadge: ''
    }
  });

  // Locked platform approval required fields
  const [lockedFields, setLockedFields] = useState({
    businessName: '',
    legalEntityName: '',
    gstNumber: '',
    panNumber: '',
    registeredCity: '',
    approvedCoverage: [],
    tier: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await partnerClient.getSettings();
      if (res && res.success && res.settings) {
        const s = res.settings;
        setForm(prev => ({
          ...prev,
          phone: s.immediateEdits?.phone || s.phone || prev.phone,
          emergencyPhone: s.immediateEdits?.emergencyPhone || s.emergencyPhone || prev.emergencyPhone,
          operatingHours: s.immediateEdits?.operatingHours || s.operatingHours || prev.operatingHours,
          autoDispatch: s.immediateEdits?.autoDispatch !== undefined ? s.immediateEdits.autoDispatch : s.autoDispatch !== undefined ? s.autoDispatch : prev.autoDispatch,
          notificationPreferences: s.immediateEdits?.notificationPreferences || s.notificationPreferences || prev.notificationPreferences
        }));

        if (s.platformApprovalRequired) {
          setLockedFields(prev => ({
            ...prev,
            businessName: s.platformApprovalRequired.businessName || s.businessName || prev.businessName,
            gstNumber: s.platformApprovalRequired.gstNumber || prev.gstNumber,
            panNumber: s.platformApprovalRequired.panNumber || prev.panNumber,
            registeredCity: s.platformApprovalRequired.operatingCity || prev.registeredCity
          }));
        }
      }
    } catch (err) {
      showToast?.('Error loading settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveImmediate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await partnerClient.updateSettings({
        phone: form.phone,
        emergencyPhone: form.emergencyPhone,
        operatingHours: form.operatingHours,
        autoDispatch: form.autoDispatch,
        notificationPreferences: form.notificationPreferences
      });

      if (res && res.success) {
        showToast?.('Operational settings updated immediately.');
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  }

  const canEdit = staff?.permissions?.editing !== false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Business Profile & Operational Settings
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Configure operational hours, contacts, and preferences.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: '6px 14px', borderRadius: 8, fontSize: 13, color: '#475569', border: '1px solid #e2e8f0' }}>
          <Clock size={16} color="#7c3aed" /> Timezone: Asia/Kolkata
        </div>
      </div>

      {/* Immediate Edits Form */}
      <form onSubmit={handleSaveImmediate} style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Operational Contact & Working Schedule
            </h2>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 4 }}>
              Applies Immediately
            </span>
          </div>
        </div>

        {/* Contact Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
              Customer Operations Phone *
            </label>
            <input
              type="tel"
              disabled={!canEdit}
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
              Emergency Field Operations Hotline *
            </label>
            <input
              type="tel"
              disabled={!canEdit}
              value={form.emergencyPhone}
              onChange={e => setForm({ ...form, emergencyPhone: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
              Daily Opening Hour
            </label>
            <input
              type="time"
              disabled={!canEdit}
              value={form.operatingHours?.start || '08:00'}
              onChange={e => setForm({
                ...form,
                operatingHours: { ...form.operatingHours, start: e.target.value }
              })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
              Daily Closing Hour
            </label>
            <input
              type="time"
              disabled={!canEdit}
              value={form.operatingHours?.end || '20:00'}
              onChange={e => setForm({
                ...form,
                operatingHours: { ...form.operatingHours, end: e.target.value }
              })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
            />
          </div>
        </div>

        {/* Automated Dispatch Configuration */}
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: canEdit ? 'pointer' : 'default' }}>
            <input
              type="checkbox"
              disabled={!canEdit}
              checked={form.autoDispatch !== false}
              onChange={e => setForm({ ...form, autoDispatch: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ fontSize: 13.5, color: '#0f172a' }}>
              <strong>Enable Intelligent Proximity Auto-Dispatch:</strong> Propose incoming booking slots to nearest available active technicians within approved travel radius.
            </span>
          </label>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
            Operational Notification Preferences
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={form.notificationPreferences?.smsAlerts !== false}
                onChange={e => setForm({
                  ...form,
                  notificationPreferences: { ...form.notificationPreferences, smsAlerts: e.target.checked }
                })}
              />
              SMS Critical Dispatch Alerts
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={form.notificationPreferences?.emailAlerts !== false}
                onChange={e => setForm({
                  ...form,
                  notificationPreferences: { ...form.notificationPreferences, emailAlerts: e.target.checked }
                })}
              />
              Email Settlement Summaries
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={form.notificationPreferences?.dispatchPushes !== false}
                onChange={e => setForm({
                  ...form,
                  notificationPreferences: { ...form.notificationPreferences, dispatchPushes: e.target.checked }
                })}
              />
              Push Notifications for Bookings
            </label>
          </div>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Immediate Changes'}
            </button>
          </div>
        )}
      </form>

      {/* Platform Approval Required Fields (Locked Section) */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #fed7aa',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ffedd5', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#9a3412', margin: 0 }}>
              Statutory Business Details & Coverage
            </h2>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} /> Platform Approval Required
            </span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Modifications to your registered entity name, tax identification (GSTIN/PAN), or operating municipal city require formal documentation review. Submit a change request via the Compliance Desk.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              Legal Entity Name <Lock size={12} color="#94a3b8" />
            </label>
            <input
              type="text"
              disabled
              value={lockedFields.legalEntityName}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              GSTIN Registration <Lock size={12} color="#94a3b8" />
            </label>
            <input
              type="text"
              disabled
              value={lockedFields.gstNumber}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              Registered Operating City <Lock size={12} color="#94a3b8" />
            </label>
            <input
              type="text"
              disabled
              value={lockedFields.registeredCity}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              Franchise Fleet Tier <Lock size={12} color="#94a3b8" />
            </label>
            <input
              type="text"
              disabled
              value={lockedFields.tier}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13.5 }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>
            Approved Coverage Zones:
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {lockedFields.approvedCoverage?.map(z => (
              <span key={z} style={{ fontSize: 12, fontWeight: 600, background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                {z}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
