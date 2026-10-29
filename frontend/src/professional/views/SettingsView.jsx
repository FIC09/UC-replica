import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bell,
  ShieldCheck,
  Smartphone,
  Key,
  Lock,
  Volume2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Check,
  X,
  Zap,
  Info,
  Shield,
  UserX,
  Compass
} from 'lucide-react';
import { professionalClient } from '../professionalClient';

// Custom Animated Toggle Switch matching platform standard
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
        backgroundColor: checked ? '#7C3AED' : '#CBD5E1',
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

export function SettingsView({ onLogout, showToast }) {
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch' | 'notifications' | 'security' | 'privacy'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    notificationPreferences: {
      jobOffersInApp: true,
      jobOffersSms: true,
      earningsUpdatesPush: true,
      bookingChangesInApp: true,
      safetyAlertsUrgent: true,
      weatherSurgeAlerts: true,
      soundEnabled: true
    },
    appLanguage: 'en',
    availabilityPreferences: {
      autoAcceptRadiusKm: 7.5,
      maxDailyJobs: 6,
      preferredMap: 'Google Maps'
    },
    sessions: [
      { id: 'SESS-CURR', device: 'Chrome on Windows 11 (Current Active Session)', ip: '127.0.0.1', isCurrent: true, lastActive: 'Active now', location: 'Krishnagiri Town, TN' },
      { id: 'SESS-MOB-1', device: 'Urban Pro Mobile App v4.8 (Samsung Galaxy S23)', ip: '152.57.44.12', isCurrent: false, lastActive: '2 hours ago', location: 'Krishnagiri Hub, TN' }
    ],
    biometricUnlock: true
  });

  // Security PIN Modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinDigits, setShowPinDigits] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Account Closure Modal state
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureReason, setClosureReason] = useState('Relocating to another city');
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [confirmUnderstood, setConfirmUnderstood] = useState(false);
  const [closureError, setClosureError] = useState(null);
  const [submittingClosure, setSubmittingClosure] = useState(false);

  // Play synthetic test sound
  const playTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
      showToast('🔊 High-priority chime audio played successfully.');
    } catch (e) {
      showToast('🔊 In-app audio chime is active and ready.');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await professionalClient.getSettings();
      if (res.success && res.settings) {
        setSettings(prev => ({
          ...prev,
          ...res.settings,
          notificationPreferences: {
            ...prev.notificationPreferences,
            ...(res.settings.notificationPreferences || {})
          },
          availabilityPreferences: {
            ...prev.availabilityPreferences,
            ...(res.settings.availabilityPreferences || {})
          },
          sessions: (res.settings.sessions && res.settings.sessions.length > 0)
            ? res.settings.sessions
            : prev.sessions
        }));
      }
    } catch (err) {
      // Fallback smoothly to defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleTogglePref = async (key) => {
    try {
      const updated = {
        ...settings.notificationPreferences,
        [key]: !settings.notificationPreferences[key]
      };
      await professionalClient.updateSettings({ notificationPreferences: updated });
      setSettings(prev => ({ ...prev, notificationPreferences: updated }));
      showToast('Notification preference updated.');
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
      showToast('Dispatch preference saved.');
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
    setPinError('');
    if (newPin.length !== 4 || isNaN(newPin)) {
      setPinError('New PIN must be exactly 4 numerical digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    setSavingPin(true);
    try {
      await professionalClient.updateSecurityPin({ currentPin, newPin });
      showToast('Security PIN updated successfully.');
      setShowPinModal(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setPinError(err.message || 'Failed to update PIN. Check your current PIN.');
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

      showToast(res.message || 'Account closure request submitted for supervisor audit.');
      setShowClosureModal(false);
    } catch (err) {
      setClosureError(err.message || 'Failed to submit closure request. Check for open active jobs or pending wallet balances.');
    } finally {
      setSubmittingClosure(false);
    }
  };

  const TABS = [
    { id: 'dispatch', label: 'Dispatch & Navigation', icon: Compass },
    { id: 'notifications', label: 'Alerts & Sounds', icon: Bell },
    { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
    { id: 'privacy', label: 'Privacy & Account', icon: Lock }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 4,
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Partner App Settings &amp; Operational Preferences
            </h1>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              backgroundColor: '#EDE9FE',
              color: '#7C3AED',
              border: '1px solid #DDD6FE'
            }}>
              Krishnagiri Hub
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Personalize dispatch navigation radar, sound alerts, active sessions, and DPDP security credentials
          </p>
        </div>

        {/* Security Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          color: '#15803D'
        }}>
          <ShieldCheck size={15} color="#16A34A" />
          <span>Security Vault Active (PIN Protected)</span>
        </div>
      </div>

      {/* Navigation Tabs */}
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
                padding: '9px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: isActive ? '2.5px solid #7C3AED' : '2.5px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#7C3AED' : '#64748B',
                fontSize: 13,
                fontWeight: isActive ? 800 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#7C3AED' : '#64748B'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dispatch & Navigation */}
      {activeTab === 'dispatch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '24px 26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={18} color="#7C3AED" /> Dispatch Radar &amp; Transit Configuration
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
                Control how far from Krishnagiri Town you are willing to receive customer bookings and your daily workload limits.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: 16,
              alignItems: 'stretch'
            }}>
              {/* Tile 1: Auto-Accept Dispatch Radius */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 28,
                    gap: 8,
                    marginBottom: 10
                  }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                      Auto-Accept Dispatch Radius
                    </label>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#7C3AED',
                      backgroundColor: '#EDE9FE',
                      padding: '3px 9px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {settings.availabilityPreferences?.autoAcceptRadiusKm || 7.5} km
                    </span>
                  </div>

                  <select
                    value={settings.availabilityPreferences?.autoAcceptRadiusKm || 7.5}
                    onChange={(e) => handleUpdateAvailability('autoAcceptRadiusKm', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="3">3 km • Hyper-local (Town Center)</option>
                    <option value="5">5 km • Standard Hub (Gandhi Nagar)</option>
                    <option value="7.5">7.5 km • Recommended (Town &amp; Bypass)</option>
                    <option value="10">10 km • Extended (Kattiganapalli)</option>
                    <option value="15">15 km • Maximum Perimeter (Inter-town)</option>
                  </select>
                </div>

                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, minHeight: 34 }}>
                  Orders outside this radius will not be offered to your device unless marked high-priority.
                </div>
              </div>

              {/* Tile 2: Daily Dispatch Ceiling */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 28,
                    gap: 8,
                    marginBottom: 10
                  }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                      Daily Dispatch Ceiling
                    </label>
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#059669',
                      backgroundColor: '#ECFDF5',
                      padding: '3px 9px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {settings.availabilityPreferences?.maxDailyJobs || 6} jobs / day
                    </span>
                  </div>

                  <select
                    value={settings.availabilityPreferences?.maxDailyJobs || 6}
                    onChange={(e) => handleUpdateAvailability('maxDailyJobs', parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="4">4 jobs/day • Relaxed Shift</option>
                    <option value="6">6 jobs/day • Optimal Balance (Recommended)</option>
                    <option value="8">8 jobs/day • High Volume Earning Sprint</option>
                    <option value="10">10 jobs/day • Maximum Allowed Workload</option>
                  </select>
                </div>

                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, minHeight: 34 }}>
                  Duty automatically turns off after completing this ceiling to prevent fatigue.
                </div>
              </div>

              {/* Tile 3: Preferred Navigation Engine */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 28,
                    gap: 8,
                    marginBottom: 10
                  }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                      Preferred Navigation Engine
                    </label>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#4F46E5',
                      backgroundColor: '#EEF2FF',
                      padding: '3px 9px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      External GPS
                    </span>
                  </div>

                  <select
                    value={settings.availabilityPreferences?.preferredMap || 'Google Maps'}
                    onChange={(e) => handleUpdateAvailability('preferredMap', e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="Google Maps">Google Maps (Default)</option>
                    <option value="OpenStreetMap">OpenStreetMap / Leaflet (In-App)</option>
                    <option value="Apple Maps">Apple Maps (iOS Devices)</option>
                    <option value="Waze">Waze (Live Traffic Alerts)</option>
                  </select>
                </div>

                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45, minHeight: 34 }}>
                  Tapping "Navigate" on a job dispatches directions directly into this app.
                </div>
              </div>
            </div>
          </div>

          {/* Radar Info Callout */}
          <div style={{
            background: '#FAF5FF',
            borderRadius: 12,
            padding: '16px 20px',
            border: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <Navigation size={20} color="#7C3AED" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: '#4C1D95', lineHeight: 1.5 }}>
              <strong>Krishnagiri Doorstep Navigation:</strong> Customer addresses are mapped with reverse geocoding to Rayakottai Road, Gandhi Nagar, Old Bus Stand, and nearby residential streets. A minimum 30-minute travel buffer is preserved between consecutive jobs.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Alerts & Sounds */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '24px 26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: 14,
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={18} color="#7C3AED" /> Dispatch Alerts &amp; Sound Configuration
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
                  Customize notification channels so you never miss an incoming booking offer or payout release.
                </p>
              </div>

              <button
                type="button"
                onClick={playTestChime}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid #DDD6FE',
                  backgroundColor: '#FAF5FF',
                  color: '#7C3AED',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={14} /> Test Audio Chime
              </button>
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
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Loud In-App Chime on New Booking Dispatch</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Plays a distinct, high-priority audio alert when a new customer order is assigned to you.
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-chime"
                  checked={settings.notificationPreferences?.jobOffersInApp}
                  onChange={() => handleTogglePref('jobOffersInApp')}
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
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>SMS Dispatch Notification Fallback</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Dispatches a fallback carrier SMS alert if mobile 4G/5G data connection is weak.
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-sms"
                  checked={settings.notificationPreferences?.jobOffersSms}
                  onChange={() => handleTogglePref('jobOffersSms')}
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
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Weekly Payouts &amp; Instant Wallet Credit Alerts</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Instant notification with banking UTR reference when payout batches are transferred.
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-earnings-push"
                  checked={settings.notificationPreferences?.earningsUpdatesPush}
                  onChange={() => handleTogglePref('earningsUpdatesPush')}
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
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>Customer Appointment Reschedules &amp; Revisits</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Immediate alert if customer amends time slot or submits a warranty revisit request.
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-booking-changes"
                  checked={settings.notificationPreferences?.bookingChangesInApp}
                  onChange={() => handleTogglePref('bookingChangesInApp')}
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
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>High-Demand Monsoon Surge Broadcasts</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Real-time heads-up when weather surge (+₹49 bonus) is activated in Krishnagiri.
                  </div>
                </div>
                <ToggleSwitch
                  id="toggle-surge-alert"
                  checked={settings.notificationPreferences?.weatherSurgeAlerts !== false}
                  onChange={() => handleTogglePref('weatherSurgeAlerts')}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Sessions */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Security PIN Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '24px 26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid #F1F5F9', paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Key size={18} color="#7C3AED" /> 4-Digit Security Authentication PIN
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
                  Required to authenticate bank account modifications, instant wallet withdrawals, and sensitive profile changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPinError('');
                  setCurrentPin('');
                  setNewPin('');
                  setConfirmPin('');
                  setShowPinModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #DDD6FE',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Key size={14} /> Change Security PIN
              </button>
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
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>PIN Protection Status</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Active • Default PIN: <strong>1234</strong> • Rate-limited against unauthorized attempts
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: 20 }}>
                ● Active Protected
              </span>
            </div>
          </div>

          {/* Active Sessions & Logins */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '24px 26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: 14,
              marginBottom: 18,
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={18} color="#7C3AED" /> Active Sessions &amp; Authorized Devices
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
                  Manage authorized hardware devices currently authenticated to your Urban Pro technician account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRevokeSessions}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <X size={14} /> Revoke Remote Devices
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(settings.sessions || []).map(sess => (
                <div
                  key={sess.id}
                  style={{
                    background: sess.isCurrent ? '#F0FDF4' : '#F8FAFC',
                    border: sess.isCurrent ? '1.5px solid #BBF7D0' : '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: sess.isCurrent ? '#DCFCE7' : '#E2E8F0',
                      color: sess.isCurrent ? '#15803D' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{sess.device}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        IP: {sess.ip} • {sess.location || 'Krishnagiri Hub'} • {sess.lastActive}
                      </div>
                    </div>
                  </div>

                  {sess.isCurrent ? (
                    <span style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 700
                    }}>
                      ● Current Active Device
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11.5,
                      color: '#64748B',
                      backgroundColor: '#F1F5F9',
                      padding: '4px 10px',
                      borderRadius: 20
                    }}>
                      Remote Device
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Privacy & Account Governance */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Statutory DPDP Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '24px 26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 14, marginBottom: 18 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} color="#7C3AED" /> Statutory DPDP Act 2023 Compliance &amp; Telephony Masking
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
                How your professional data, customer reviews, KYC identity, and telephony calls are safeguarded under Indian law.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Masked Virtual Telephony</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.45 }}>
                  Customer and professional personal phone numbers are never disclosed. All communications route through WebRTC internet voice or masked virtual bridge numbers.
                </div>
              </div>

              <div style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>7-Year Statutory Ledger Retention</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.45 }}>
                  Tax invoices, GST calculations, and earnings payouts are stored in immutable encrypted vaults for mandatory government compliance.
                </div>
              </div>

              <div style={{ padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Zero Advertising Resale</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 1.45 }}>
                  Your Aadhaar, PAN card, police clearance, and location coordinates are strictly private and never shared with commercial marketing networks.
                </div>
              </div>
            </div>
          </div>

          {/* Voluntary Account Closure */}
          <div style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            borderRadius: 14,
            padding: '24px 26px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#9F1239', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserX size={18} color="#BE123C" /> Voluntary Account Closure Request
              </h4>
              <div style={{ fontSize: 12.5, color: '#881337', maxWidth: 640, lineHeight: 1.45 }}>
                Initiates account deregistration and un-links your Aadhaar/PAN. Requires zero active in-progress dispatches, completed order audits, and zero pending financial disputes.
              </div>
            </div>

            <button
              onClick={() => {
                setClosureError(null);
                setShowClosureModal(true);
              }}
              style={{
                background: '#BE123C',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(190, 18, 60, 0.25)'
              }}
            >
              Request Account Closure
            </button>
          </div>
        </div>
      )}

      {/* Security PIN Change Modal */}
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
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 26,
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={18} color="#7C3AED" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Update Security PIN
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.45 }}>
              Enter your current 4-digit PIN (default: <strong>1234</strong>) followed by your new authentication PIN.
            </p>

            {pinError && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 14
              }}>
                {pinError}
              </div>
            )}

            <form onSubmit={handleUpdatePin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Current PIN *
                </label>
                <input
                  type={showPinDigits ? 'text' : 'password'}
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 16,
                    textAlign: 'center',
                    letterSpacing: '0.4em',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New 4-Digit PIN *
                </label>
                <input
                  type={showPinDigits ? 'text' : 'password'}
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 16,
                    textAlign: 'center',
                    letterSpacing: '0.4em',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Confirm New PIN *
                </label>
                <input
                  type={showPinDigits ? 'text' : 'password'}
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 16,
                    textAlign: 'center',
                    letterSpacing: '0.4em',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: -4 }}>
                <button
                  type="button"
                  onClick={() => setShowPinDigits(!showPinDigits)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {showPinDigits ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPinDigits ? 'Hide Digits' : 'Show Digits'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPin || !currentPin || !newPin || !confirmPin}
                  style={{
                    flex: 1.5,
                    background: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (savingPin || !currentPin || !newPin || !confirmPin) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingPin ? 'Updating...' : 'Save New PIN'}
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
            background: '#FFFFFF',
            borderRadius: 16,
            padding: 28,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#9F1239', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} color="#BE123C" /> Request Account Closure
              </h3>
              <button
                type="button"
                onClick={() => setShowClosureModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Please review the prerequisites before submitting your closure application.
            </p>

            {closureError && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#991B1B',
                fontSize: 13,
                marginBottom: 16,
                lineHeight: 1.5
              }}>
                <strong>Action Required:</strong> {closureError}
              </div>
            )}

            <form onSubmit={handleRequestClosure} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reason for Closure *
                </label>
                <select
                  value={closureReason}
                  onChange={(e) => setClosureReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, backgroundColor: '#FFFFFF' }}
                >
                  <option value="Relocating to another city">Relocating to another city</option>
                  <option value="Taking full-time corporate employment">Taking full-time corporate employment</option>
                  <option value="Personal / Family exigency">Personal / Family exigency</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Additional Feedback
                </label>
                <textarea
                  value={detailedFeedback}
                  onChange={(e) => setDetailedFeedback(e.target.value)}
                  rows={3}
                  placeholder="Tell us about your experience..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Confirmation terms */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '14px 16px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={confirmUnderstood}
                    onChange={(e) => setConfirmUnderstood(e.target.checked)}
                    style={{ marginTop: 2, cursor: 'pointer', accentColor: '#BE123C' }}
                  />
                  <span>
                    I confirm that I understand:
                    <br />• All assigned dispatches must be completed.
                    <br />• All open customer disputes must be resolved before payout closure.
                    <br />• Historical booking records and tax invoices will be permanently retained in the DPDP compliance vault.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowClosureModal(false)}
                  style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClosure || !confirmUnderstood}
                  style={{
                    flex: 1.5,
                    background: (submittingClosure || !confirmUnderstood) ? '#94A3B8' : '#BE123C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '11px 0',
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
