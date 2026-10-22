import React, { useState } from 'react';

export function SettingsView({ showToast }) {
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [navMap, setNavMap] = useState('Google Maps');
  const [language, setLanguage] = useState('English');
  const [autoAcceptNearJobs, setAutoAcceptNearJobs] = useState(false);

  const handleSave = () => {
    showToast('Preferences and application settings updated');
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Application & Dispatch Settings
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Personalize job dispatch notifications, navigation preferences, and security
        </div>
      </div>

      {/* Notification Preferences */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          Dispatch & Sound Alerts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                Loud Chime on New Booking Dispatch
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Plays a high-priority chime even when the screen is locked
              </div>
            </div>
            <input
              type="checkbox"
              checked={audioAlerts}
              onChange={(e) => setAudioAlerts(e.target.checked)}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                WhatsApp Dispatch Alerts
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Receive customer address pin and booking summary on WhatsApp
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                SMS Dispatch Backup
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Sends SMS fallback when mobile data connection is weak
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              style={{ width: 20, height: 20, cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Navigation & Language */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          Navigation & Localization
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 600 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              Default Maps Navigation App
            </label>
            <select
              value={navMap}
              onChange={(e) => setNavMap(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            >
              <option value="Google Maps">Google Maps (Recommended)</option>
              <option value="Apple Maps">Apple Maps</option>
              <option value="Waze">Waze</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
              App Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        style={{
          background: '#0f172a',
          color: '#ffffff',
          border: 'none',
          padding: '12px 28px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Save All Settings
      </button>
    </div>
  );
}
