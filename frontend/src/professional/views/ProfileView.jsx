import React, { useState, useEffect } from 'react';
import { professionalClient, getInitials, getPartnerTier } from '../professionalClient';

export function ProfileView({ profile, onUpdateProfile, showToast }) {
  const [pro, setPro] = useState(profile);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showEditableModal, setShowEditableModal] = useState(false);
  const [showReviewChangeModal, setShowReviewChangeModal] = useState(false);

  // Editable Form State
  const [bio, setBio] = useState(profile?.bio || 'Certified Senior HVAC Specialist with 8+ years experience servicing top split and inverter AC brands across Western Mumbai.');
  const [spokenLanguages, setSpokenLanguages] = useState(profile?.spokenLanguages || ['English', 'Hindi', 'Marathi']);
  const [emergencyContactName, setEmergencyContactName] = useState(profile?.emergencyContact?.name || 'Sunita Salvi');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile?.emergencyContact?.phone || '+91 98205 99881');

  // Review-Required Form State
  const [changeField, setChangeField] = useState('phone');
  const [requestedVal, setRequestedVal] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [submittingChange, setSubmittingChange] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await professionalClient.getProfile();
      if (res.success && res.profile) {
        setPro(res.profile);
        if (res.reviewRequests) setReviewRequests(res.reviewRequests);
        if (res.profile.bio) setBio(res.profile.bio);
        if (res.profile.spokenLanguages) setSpokenLanguages(res.profile.spokenLanguages);
        if (res.profile.emergencyContact) {
          setEmergencyContactName(res.profile.emergencyContact.name || '');
          setEmergencyContactPhone(res.profile.emergencyContact.phone || '');
        }
      }
    } catch (err) {
      // Fallback to prop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveEditable = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bio,
        spokenLanguages,
        emergencyContact: {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relationship: 'Family Member'
        }
      };
      const res = await professionalClient.updateProfile(payload);
      showToast('Editable profile details updated successfully.');
      setPro(res.profile);
      if (onUpdateProfile) onUpdateProfile(res.profile);
      setShowEditableModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile');
    }
  };

  const handleSubmitReviewChange = async (e) => {
    e.preventDefault();
    if (submittingChange) return;
    setSubmittingChange(true);
    try {
      const res = await professionalClient.updateProfile({
        [changeField]: requestedVal,
        changeReason
      });
      showToast(res.message || 'Field change request submitted for KYC verification.');
      setShowReviewChangeModal(false);
      setRequestedVal('');
      setChangeReason('');
      loadProfile();
    } catch (err) {
      showToast(err.message || 'Failed to submit change request');
    } finally {
      setSubmittingChange(false);
    }
  };

  const currentPro = pro || profile || {};

  return (
    <div style={{ padding: '24px 20px', maxWidth: 960, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Professional Identity & Credentials
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Trade authorization, KYC review boundaries, and verified partner credentials
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowReviewChangeModal(true)}
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📋 Request Core Detail Change
          </button>

          <button
            onClick={() => setShowEditableModal(true)}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ✏️ Edit Profile Info
          </button>
        </div>
      </div>

      {/* Main Identity Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '28px 32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
            {getInitials(currentPro.applicantName || currentPro.name, currentPro.avatar)}
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
                {currentPro.applicantName || currentPro.name || 'Professional'}
              </h2>
              <span style={{
                background: '#ecfdf5',
                color: '#059669',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700
              }}>
                {getPartnerTier(currentPro)}
              </span>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700
              }}>
                ID: {currentPro.id || currentPro.applicationNumber || 'WRK-00146'}
              </span>
            </div>

            <div style={{ fontSize: 15, color: '#475569', marginTop: 4, fontWeight: 600 }}>
              {currentPro.tradeName || currentPro.trade || "Women's Salon"}
            </div>

            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
              {currentPro.bio || bio}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Tier Field Distinction Card */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Platform Security & KYC Boundaries
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Legal identity and partner agency associations are platform-controlled. Contact and category updates require KYC review.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
            🟢 Editable
          </span>
          <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
            🟡 Requires Review
          </span>
          <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
            🔒 Platform-Controlled
          </span>
        </div>
      </div>

      {/* Field Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Tier 1: Platform-Controlled (Locked) */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🔒 Platform-Controlled Fields
            </h3>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Immutable by Worker</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Full Legal Name</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentPro.applicantName || currentPro.name || 'Professional'}</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Business Association</div>
              <div style={{ fontWeight: 700, color: currentPro.partnerAgencyName ? '#2563eb' : '#0f172a' }}>
                {currentPro.partnerAgencyName ? `${currentPro.partnerAgencyName} (${currentPro.partnerAgencyId})` : 'Direct Independent Freelance Partner'}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Settlement Model</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                {currentPro.settlementModel === 'settle_to_business' ? 'Settle to Partner Agency Corporate Account' : 'Direct to Professional Personal Account'}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Partner Tier & Rating</div>
              <div style={{ fontWeight: 700, color: '#059669' }}>
                {getPartnerTier(currentPro)} • ⭐ {currentPro.jobsCompleted > 0 ? (currentPro.rating || 5.0) : 'New Partner'} ({currentPro.jobsCompleted != null ? currentPro.jobsCompleted : 0} jobs)
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Police Background Verification Clearance</div>
              <div style={{ fontWeight: 700, color: '#059669' }}>Cleared & Active (Safety Cell Certified)</div>
            </div>
          </div>
        </div>

        {/* Tier 2: Changes Requiring Review */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🟡 Changes Requiring Review
            </h3>
            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>KYC Audit Protocol</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Primary Registered Phone</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentPro.phone || '+91 98205 11982'}</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Registered Work Email</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentPro.email || (currentPro.applicantName ? `${currentPro.applicantName.toLowerCase().replace(/\s+/g, '.')}@urbanpro.com` : 'partner@urbanpro.com')}</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Operational Hub & Locality</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentPro.operationalHub || (currentPro.locality ? `${currentPro.locality} Operational Hub` : 'Regional Operations Hub')} ({currentPro.locality || 'Operational Area'})</div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Approved Service Categories</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {(currentPro.categories || ['AC Repair', 'Electrical', 'Appliances']).map((cat, idx) => (
                  <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Assigned Service Areas</div>
              <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>
                {(currentPro.serviceAreas || ['Bandra West', 'Khar', 'Santacruz West', 'Pali Hill']).join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: Editable Fields */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px 26px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🟢 Directly Editable Fields
            </h3>
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Instant Update</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Spoken Working Languages</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {spokenLanguages.map((l, i) => (
                  <span key={i} style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Emergency Contact</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                {emergencyContactName} ({emergencyContactPhone})
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Specialized Skills</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {(currentPro.skills || ['Inverter Split AC', 'Powerjet Coil Cleaning', 'Gas Leak Detection']).map((s, i) => (
                  <span key={i} style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Work Experience</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentPro.experience || '8+ years'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Change Requests History */}
      {reviewRequests.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
            KYC Field Change Request History
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reviewRequests.map(req => (
              <div
                key={req.id}
                style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{req.id} • {req.fieldLabel || req.field}</div>
                  <div style={{ fontSize: 13, color: '#1e293b', marginTop: 2 }}>
                    Requested: <strong>{req.requestedVal}</strong> (was: {req.currentVal})
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{req.feedback}</div>
                </div>

                <span style={{
                  background: req.status === 'Approved' ? '#ecfdf5' : req.status === 'Rejected' ? '#fef2f2' : '#eff6ff',
                  color: req.status === 'Approved' ? '#059669' : req.status === 'Rejected' ? '#b91c1c' : '#2563eb',
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Directly Editable Modal */}
      {showEditableModal && (
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
            maxWidth: 480,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Edit Profile Info
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Update your public technician introduction, languages, and emergency contacts.
            </p>

            <form onSubmit={handleSaveEditable}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Professional Bio / Introduction
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Spoken Languages (Comma-separated)
                </label>
                <input
                  type="text"
                  value={spokenLanguages.join(', ')}
                  onChange={(e) => setSpokenLanguages(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEditableModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1.5, background: '#0f172a', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Core KYC Detail Change Request Modal */}
      {showReviewChangeModal && (
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
            maxWidth: 480,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Request Core Detail Change
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Core identity and compliance contact fields require compliance team audit before updating.
            </p>

            <form onSubmit={handleSubmitReviewChange}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Field to Modify *
                </label>
                <select
                  value={changeField}
                  onChange={(e) => setChangeField(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="phone">Primary Registered Phone Number</option>
                  <option value="email">Registered Work Email</option>
                  <option value="serviceAreas">Service Area Expansion</option>
                  <option value="categories">Add Service Category</option>
                  <option value="experience">Years of Experience</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New Value Requested *
                </label>
                <input
                  type="text"
                  value={requestedVal}
                  onChange={(e) => setRequestedVal(e.target.value)}
                  required
                  placeholder={changeField === 'phone' ? '+91 98205 99999' : 'Enter new value...'}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reason for Change *
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explain why this core detail is changing..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowReviewChangeModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChange || !requestedVal.trim()}
                  style={{
                    flex: 1.5,
                    background: (submittingChange || !requestedVal.trim()) ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: (submittingChange || !requestedVal.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingChange ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
