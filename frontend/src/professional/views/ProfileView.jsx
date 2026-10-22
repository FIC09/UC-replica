import React, { useState } from 'react';
import { professionalClient } from '../professionalClient';

export function ProfileView({ profile, onUpdateProfile, showToast }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '+91 98205 11982');
  const [email, setEmail] = useState(profile?.email || 'vikram.salvi@urbanpro.com');
  const [locality, setLocality] = useState(profile?.locality || 'Bandra West');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await professionalClient.updateProfile({ phone, email, locality });
      showToast('Profile information updated successfully');
      if (onUpdateProfile) onUpdateProfile({ phone, email, locality });
      setShowEditModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Professional Identity & Profile
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Technician trade registration, service radius, and public profile credentials
          </div>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          style={{
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ✏️ Edit Contact Info
        </button>
      </div>

      {/* Main Profile Info Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '28px 32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800
          }}>
            {profile?.avatar || 'VS'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {profile?.applicantName || 'Vikram Salvi'}
              </h2>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700
              }}>
                {profile?.tier || 'Diamond Pro Partner (Level 5)'}
              </span>
            </div>

            <div style={{ fontSize: 15, color: '#475569', marginTop: 4, fontWeight: 600 }}>
              {profile?.trade || 'Master AC Specialist & Electrician'}
            </div>

            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              ID: <strong>{profile?.id || 'PRO-8841'}</strong> • Experience: <strong>8+ years</strong> • Rating: <strong>4.94 ★</strong>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginTop: 28, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>EMPLOYMENT MODEL</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {profile?.employmentType || 'Direct Freelance'}
            </div>
            {profile?.partnerAgencyName && (
              <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                Agency: {profile.partnerAgencyName} ({profile.partnerAgencyId})
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>CONTACT NUMBER</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {profile?.phone || '+91 98205 11982'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>REGISTERED EMAIL</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {profile?.email || 'vikram.salvi@urbanpro.com'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>OPERATIONAL BASE HUB</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {profile?.operationalHub || 'Bandra West Central Hub'}
            </div>
          </div>
        </div>

        {/* Service Areas & Specialties */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
            Active Service Areas Covered:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Bandra West', 'Khar', 'Santacruz West', 'Pali Hill', 'Juhu'].map(area => (
              <span key={area} style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600
              }}>
                📍 {area}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginTop: 18, marginBottom: 10 }}>
            Specialised Technical Skills:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Inverter Split AC', 'Powerjet Coil Cleaning', 'Gas Leak Detection', 'PCB Circuit Diagnosis', 'Electrical Safety'].map(skill => (
              <span key={skill} style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600
              }}>
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
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
            padding: 24,
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Edit Contact Information
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Primary Operational Locality
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1.5,
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
