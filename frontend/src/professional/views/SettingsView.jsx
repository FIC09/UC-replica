import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function SettingsView({ onLogout, showToast }) {
  const [settings, setSettings] = useState({
    notificationPreferences: {
      jobOffersInApp: true,
      jobOffersSms: true,
      earningsUpdatesPush: true,
      bookingChangesInApp: true,
      safetyAlertsUrgent: true
    },
    appLanguage: 'en',
    availabilityPreferences: {
      autoAcceptRadiusKm: 5,
      maxDailyJobs: 6,
      preferredMap: 'Google Maps'
    },
    sessions: [
      { id: 'SESS-CURR', device: 'Chrome on Windows 11 (Current Active Session)', ip: '127.0.0.1', isCurrent: true, lastActive: 'Active now' }
    ]
  });

  const [loading, setLoading] = useState(true);

  // Security PIN state
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  // Account Closure Modal state
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureReason, setClosureReason] = useState('Relocating to another city');
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [closureError, setClosureError] = useState(null);
  const [submittingClosure, setSubmittingClosure] = useState(false);

  // Confirmed Demo Reset state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemoData = async () => {
    setIsResetting(true);
    try {
      const res = await professionalClient.resetDemoData();
      if (res.success) {
        showToast('Demonstration data has been cleanly reset to default initial state.');
        setShowResetConfirm(false);
        loadSettings();
      } else {
        throw new Error(res.error || 'Failed to reset demo data');
      }
    } catch (err) {
      showToast(err.message || 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await professionalClient.getSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateLanguage = async (lang) => {
    try {
      await professionalClient.updateSettings({ appLanguage: lang });
      setSettings(prev => ({ ...prev, appLanguage: lang }));
      showToast(`Language preference set to ${lang === 'hi' ? 'हिन्दी' : lang === 'mr' ? 'मराठी' : 'English'}`);
    } catch (err) {
      showToast(err.message || 'Failed to update language');
    }
  };

  const handleTogglePref = async (key) => {
    try {
      const updated = {
        ...settings.notificationPreferences,
        [key]: !settings.notificationPreferences[key]
      };
      await professionalClient.updateSettings({ notificationPreferences: updated });
      setSettings(prev => ({ ...prev, notificationPreferences: updated }));
      showToast('Notification preferences updated.');
    } catch (err) {
      showToast(err.message || 'Failed to update preferences');
    }
  };

  const handleUpdateAvailability = async (key, val) => {
    try {
      const updated = {
        ...settings.availabilityPreferences,
        [key]: val
      };
      await professionalClient.updateSettings({ availabilityPreferences: updated });
      setSettings(prev => ({ ...prev, availabilityPreferences: updated }));
      showToast('Availability settings saved.');
    } catch (err) {
      showToast(err.message || 'Failed to update availability');
    }
  };

  const handleRevokeSessions = async () => {
    try {
      await professionalClient.revokeOtherSessions();
      setSettings(prev => ({
        ...prev,
        sessions: (prev.sessions || []).filter(s => s.isCurrent)
      }));
      showToast('All other remote devices logged out successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to revoke sessions');
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (savingPin) return;
    setSavingPin(true);
    try {
      await professionalClient.updateSecurityPin({ currentPin, newPin });
      showToast('Security PIN updated successfully.');
      setShowPinModal(false);
      setCurrentPin('');
      setNewPin('');
    } catch (err) {
      showToast(err.message || 'Failed to update PIN');
    } finally {
      setSavingPin(false);
    }
  };

  const handleRequestClosure = async (e) => {
    e.preventDefault();
    if (!confirmUnderstood) {
      setClosureError('You must confirm that you understand account closure implications before proceeding.');
      return;
    }

    setSubmittingClosure(true);
    setClosureError(null);

    try {
      const res = await professionalClient.requestAccountClosure({
        reason: closureReason,
        detailedFeedback,
        confirmUnderstood: true
      });

      showToast(res.message || 'Account closure request submitted.');
      setShowClosureModal(false);
    } catch (err) {
      setClosureError(err.message || 'Failed to submit closure request');
    } finally {
      setSubmittingClosure(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 960, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Platform Settings & Privacy
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Language localization, dispatch radius, active session revocation, and security
        </div>
      </div>

      {/* Language Selection */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 20
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
          🌐 App Language Localization
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { code: 'en', label: 'English' },
            { code: 'hi', label: 'हिन्दी (Hindi)' },
            { code: 'mr', label: 'मराठी (Marathi)' }
          ].map(l => (
            <button
              key={l.code}
              onClick={() => handleUpdateLanguage(l.code)}
              style={{
                background: settings.appLanguage === l.code ? '#0f172a' : '#f8fafc',
                color: settings.appLanguage === l.code ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 20
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          🔔 Dispatch Notification Preferences
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Loud In-App Chime on New Booking Dispatch</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Plays a high-priority chime alert when assigned</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences?.jobOffersInApp}
              onChange={() => handleTogglePref('jobOffersInApp')}
              style={{ width: 18, height: 18 }}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>SMS Dispatch Notification Fallback</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Simulated local outbox delivery when mobile data is weak</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences?.jobOffersSms}
              onChange={() => handleTogglePref('jobOffersSms')}
              style={{ width: 18, height: 18 }}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Earnings Credited & Payout Batch Releases</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Weekly bank transfer confirmation alerts</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences?.earningsUpdatesPush}
              onChange={() => handleTogglePref('earningsUpdatesPush')}
              style={{ width: 18, height: 18 }}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Customer Schedule Revisions</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Immediate alert when customer adjusts appointment window</div>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationPreferences?.bookingChangesInApp}
              onChange={() => handleTogglePref('bookingChangesInApp')}
              style={{ width: 18, height: 18 }}
            />
          </label>
        </div>
      </div>

      {/* Availability Preferences */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 20
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          ⏱️ Dispatch & Navigation Preferences
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
              Maximum Dispatch Radius (km)
            </label>
            <select
              value={settings.availabilityPreferences?.autoAcceptRadiusKm || 5}
              onChange={(e) => handleUpdateAvailability('autoAcceptRadiusKm', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="3">3 km (Hyper-local neighborhood)</option>
              <option value="5">5 km (Standard Hub Radius)</option>
              <option value="10">10 km (Extended Western Suburbs)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
              Maximum Daily Dispatches
            </label>
            <select
              value={settings.availabilityPreferences?.maxDailyJobs || 6}
              onChange={(e) => handleUpdateAvailability('maxDailyJobs', parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="4">4 jobs per day (Reduced pace)</option>
              <option value="6">6 jobs per day (Recommended)</option>
              <option value="8">8 jobs per day (High volume)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
              Preferred Map App
            </label>
            <select
              value={settings.availabilityPreferences?.preferredMap || 'Google Maps'}
              onChange={(e) => handleUpdateAvailability('preferredMap', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="Google Maps">Google Maps</option>
              <option value="Apple Maps">Apple Maps</option>
              <option value="Waze">Waze</option>
            </select>
          </div>
        </div>
      </div>

      {/* Local Demo Sandbox Management */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🧪</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Local Demo Sandbox Management
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.45 }}>
              Operating with persistent synthetic data. Reset will restore demo dispatches, tickets, and ledgers to initial state. Live production records are never modified.
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1.5px solid #fecaca',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🔄</span>
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Confirmed Demo Reset Modal */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: '28px 24px',
            maxWidth: 420,
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Reset Synthetic Demo Data?
            </h3>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              This will restore all demo bookings, extra work proposals, notifications, support tickets, and earnings back to their initial seed state.
              <br /><br />
              <strong style={{ color: '#059669' }}>✓ Live records are completely segregated and unaffected.</strong>
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '11px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                disabled={isResetting}
                style={{
                  flex: 1.5,
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isResetting ? 'wait' : 'pointer'
                }}
              >
                {isResetting ? 'Resetting...' : 'Confirm Demo Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security & Sessions */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            🛡️ Security Credentials & Active Sessions
          </h3>
          <button
            onClick={() => setShowPinModal(true)}
            style={{
              background: '#ffffff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Change Security PIN
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {(settings.sessions || []).map(sess => (
            <div
              key={sess.id}
              style={{
                background: sess.isCurrent ? '#f0fdf4' : '#f8fafc',
                border: sess.isCurrent ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{sess.device}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>IP: {sess.ip} • Last active: {sess.lastActive}</div>
              </div>
              {sess.isCurrent ? (
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                  Current Device
                </span>
              ) : (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Remote Device</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleRevokeSessions}
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            border: 'none',
            padding: '9px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Revoke All Other Remote Sessions
        </button>
      </div>

      {/* Statutory Privacy & DPDP Notice */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 14,
        padding: '18px 22px',
        border: '1px solid #e2e8f0',
        marginBottom: 24,
        fontSize: 12,
        color: '#475569',
        lineHeight: 1.6
      }}>
        <strong>Statutory Privacy Notice (DPDP Act 2023):</strong> Professional earnings, customer doorstep reviews, and safety logs are stored under Indian regulatory data protection compliance. Financial ledgers are preserved for statutory 7-year audit retention. Masked telephony guarantees customer and technician phone numbers remain private on both applications.
      </div>

      {/* Account Closure Section */}
      <div style={{
        background: '#fff1f2',
        border: '1px solid #fecdd3',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#9f1239', margin: '0 0 4px 0' }}>
            Voluntary Account Closure Request
          </h3>
          <div style={{ fontSize: 13, color: '#881337', maxWidth: 600 }}>
            Close your professional account. Requires zero active dispatches and zero open financial disputes. Statutory financial and audit records will be preserved in accordance with regulatory laws.
          </div>
        </div>

        <button
          onClick={() => {
            setClosureError(null);
            setShowClosureModal(true);
          }}
          style={{
            background: '#be123c',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Request Account Closure
        </button>
      </div>

      {/* Change PIN Modal */}
      {showPinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 26,
            width: '100%',
            maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Update Security PIN
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Used to authenticate profile changes and bank payout requests.
            </p>

            <form onSubmit={handleUpdatePin}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Current PIN (Default: 4829) *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  required
                  placeholder="••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, textAlign: 'center', letterSpacing: '0.4em' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New 4-Digit PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                  placeholder="••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, textAlign: 'center', letterSpacing: '0.4em' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPin || !currentPin || !newPin}
                  style={{ flex: 1.5, background: '#0f172a', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {savingPin ? 'Updating...' : 'Save PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Closure Modal */}
      {showClosureModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 28,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#9f1239', margin: '0 0 6px 0' }}>
              Request Account Closure
            </h3>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Please review the prerequisites before submitting your closure application.
            </p>

            {closureError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#991b1b',
                fontSize: 13,
                marginBottom: 16,
                lineHeight: 1.5
              }}>
                <strong>Action Required:</strong> {closureError}
              </div>
            )}

            <form onSubmit={handleRequestClosure}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reason for Closure *
                </label>
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Relocating to another city">Relocating to another city</option>
                  <option value="Taking full-time corporate employment">Taking full-time corporate employment</option>
                  <option value="Personal / Family exigency">Personal / Family exigency</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Additional Feedback
                </label>
                <textarea
                  value={detailedFeedback}
                  onChange={(e) => setDetailedFeedback(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your experience..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Confirmation terms */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 20
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={confirmUnderstood}
                    onChange={(e) => setConfirmUnderstood(e.target.checked)}
                    style={{ marginTop: 2, cursor: 'pointer' }}
                  />
                  <span>
                    I confirm that I understand:
                    <br />• All assigned dispatches must be completed or formally reassigned.
                    <br />• All open financial disputes must be resolved before closure.
                    <br />• Historical booking records and tax invoices will be permanently retained in the compliance vault (no silent deletion).
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowClosureModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClosure || !confirmUnderstood}
                  style={{
                    flex: 1.5,
                    background: (submittingClosure || !confirmUnderstood) ? '#94a3b8' : '#be123c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: (submittingClosure || !confirmUnderstood) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingClosure ? 'Validating...' : 'Submit Closure Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
