import React, { useState, useEffect } from 'react';
import { 
  Users, HardHat, Phone, Plus, Star, CheckCircle2, Clock, 
  MapPin, X, Edit, ShieldCheck, AlertTriangle, Link2, UserPlus, 
  Trash2, Award, Calendar, Shield, Info, ArrowRight, Check
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function TeamView({ showToast, staff }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  // Active / Selected technician for drawer and modals
  const [selectedTech, setSelectedTech] = useState(null);

  // Candidate propose form state
  const [candidateData, setCandidateData] = useState({
    name: '',
    phone: '',
    trade: 'AC Master Specialist',
    skills: 'Split AC Servicing, Gas Refill',
    vehicleNumber: 'MH-02-CP-8812',
    city: 'Mumbai'
  });

  // Link existing pro state
  const [linkData, setLinkData] = useState({ phone: '', workerId: '' });
  const [linkSuccessResponse, setLinkSuccessResponse] = useState(null);

  // Skill request state
  const [skillData, setSkillData] = useState({ requestedSkills: 'Inverter PCB Diagnostics, Gas Leak Detection', justification: 'Completed 40h authorized HVAC manufacturing practical workshop.' });

  // Availability state
  const [availData, setAvailData] = useState({ operatingHours: '08:00 - 18:00', attendanceToday: 'Present (Available)', leaveDates: '' });

  // Remove association state
  const [removeReason, setRemoveReason] = useState('');
  const [removeError, setRemoveError] = useState(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    setLoading(true);
    try {
      const res = await partnerClient.getTeam();
      if (res && res.success) {
        setTeam(res.team || []);
      }
    } catch (err) {
      showToast?.('Error loading team: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 1. Propose candidate
  async function handleProposeCandidate(e) {
    e.preventDefault();
    if (!candidateData.name || !candidateData.phone) {
      showToast?.('Name and phone number are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: candidateData.name,
        phone: candidateData.phone,
        trade: candidateData.trade,
        skills: candidateData.skills.split(',').map(s => s.trim()),
        vehicleNumber: candidateData.vehicleNumber,
        city: candidateData.city
      };
      const res = await partnerClient.proposeTeamMember(payload);
      if (res && res.success) {
        showToast?.(res.message);
        setIsAddModalOpen(false);
        setCandidateData({
          name: '',
          phone: '',
          trade: 'AC Master Specialist',
          skills: 'Split AC Servicing',
          vehicleNumber: 'MH-02-NEW',
          city: 'Mumbai'
        });
        loadTeam();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to propose candidate');
    } finally {
      setSaving(false);
    }
  }

  // 2. Controlled linking
  async function handleLinkExisting(e) {
    e.preventDefault();
    if (!linkData.phone && !linkData.workerId) {
      showToast?.('Phone number or Worker ID is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await partnerClient.linkExistingPro(linkData);
      if (res && res.success) {
        setLinkSuccessResponse(res.consentRequest);
        showToast?.('Controlled consent request dispatched!');
      }
    } catch (err) {
      showToast?.(err.message || 'Linking request failed');
    } finally {
      setSaving(false);
    }
  }

  // 3. Request skill change
  async function handleSkillChangeSubmit(e) {
    e.preventDefault();
    if (!skillData.justification.trim()) {
      showToast?.('Certification justification is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await partnerClient.requestSkillChange(selectedTech.id, {
        requestedSkills: skillData.requestedSkills.split(',').map(s => s.trim()),
        justification: skillData.justification
      });
      if (res && res.success) {
        showToast?.(res.message);
        setIsSkillModalOpen(false);
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to request skill change');
    } finally {
      setSaving(false);
    }
  }

  // 4. Update availability
  async function handleAvailabilitySubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await partnerClient.updateProAvailability(selectedTech.id, {
        operatingHours: availData.operatingHours,
        attendanceToday: availData.attendanceToday,
        leaveDates: availData.leaveDates ? availData.leaveDates.split(',').map(s => s.trim()) : []
      });
      if (res && res.success) {
        showToast?.(res.message);
        setIsAvailabilityModalOpen(false);
        loadTeam();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  }

  // 5. Remove association
  async function handleRemoveAssociationSubmit(e) {
    e.preventDefault();
    if (!removeReason.trim() || removeReason.trim().length < 5) {
      showToast?.('Mandatory reason required (minimum 5 characters).');
      return;
    }
    setSaving(true);
    setRemoveError(null);
    try {
      const res = await partnerClient.removeTeamMember(selectedTech.id, { reason: removeReason });
      if (res && res.success) {
        showToast?.(res.message);
        setIsRemoveModalOpen(false);
        setSelectedTech(null);
        setRemoveReason('');
        loadTeam();
      }
    } catch (err) {
      showToast?.(err.message || 'Could not end association');
      setRemoveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const canManageTeam = staff?.permissions?.managing_team !== false;
  const isReadOnlyStaff = staff?.role === 'Read-only Staff';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            Technician Fleet & Team Management
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
            Directory of affiliated service professionals, controlled consent linking, availability limits & skills
          </p>
        </div>

        {canManageTeam && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setIsLinkModalOpen(true); setLinkSuccessResponse(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 15px',
                background: '#ffffff',
                border: '1px solid #7c3aed',
                color: '#7c3aed',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Link2 size={15} /> Link Existing Professional
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <UserPlus size={15} /> Propose Candidate
            </button>
          </div>
        )}
      </div>

      {/* Policy Notice: Platform Certification & Controlled Linking */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 10,
        padding: '12px 18px',
        border: '1px solid #e2e8f0',
        fontSize: 12.5,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <Info size={18} color="#7c3aed" style={{ flexShrink: 0 }} />
        <span>
          <strong>Platform Governance Rule:</strong> Partners cannot unilaterally verify identity, approve platform certification, or claim another professional simply by entering a phone number. All associations require explicit professional consent; skill upgrades require platform practical assessment.
        </span>
      </div>

      {/* Fleet Cards Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
          Loading team fleet roster...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 18
        }}>
          {team.map(tech => (
            <div
              key={tech.id}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16
                    }}>
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {tech.name}
                      </h3>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        ID: {tech.id} • {tech.trade}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: tech.status === 'Active' ? '#ecfdf5' : '#fffbeb',
                    color: tech.status === 'Active' ? '#16a34a' : '#d97706'
                  }}>
                    {tech.status}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#475569', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} color="#64748b" />
                    <span>{isReadOnlyStaff ? '••••••••' + (tech.phone ? tech.phone.slice(-4) : '0000') : tech.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={13} color="#64748b" />
                    <span>{tech.currentLocation || 'Assigned Operational Cluster'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={13} color="#64748b" />
                    <span>Joined: {tech.joinedDate || '2026-01-15'}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {(tech.skills || []).map((sk, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#f1f5f9',
                        color: '#334155'
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Rating & Performance Snapshot */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  marginBottom: 14
                }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Rating:</span> <strong>{tech.rating ? `⭐ ${tech.rating}` : 'Unrated'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Jobs:</span> <strong>{tech.jobsCompleted || 0} completed</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Status:</span> <strong style={{ color: '#16a34a' }}>{tech.attendanceToday || 'Available'}</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {canManageTeam && (
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <button
                    onClick={() => { setSelectedTech(tech); setIsAvailabilityModalOpen(true); }}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Availability
                  </button>
                  <button
                    onClick={() => { setSelectedTech(tech); setIsSkillModalOpen(true); }}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Request Skills
                  </button>
                  <button
                    onClick={() => { setSelectedTech(tech); setRemoveError(null); setRemoveReason(''); setIsRemoveModalOpen(true); }}
                    title="End business association"
                    style={{
                      padding: '7px 10px',
                      borderRadius: 6,
                      border: '1px solid #fecaca',
                      background: '#fff',
                      color: '#dc2626',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Propose New Candidate */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Propose New Field Technician Candidate
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Propose a candidate for platform background verification and safety certification.
            </p>
            <form onSubmit={handleProposeCandidate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={candidateData.name}
                  onChange={e => setCandidateData({ ...candidateData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Ramesh Kadam"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={candidateData.phone}
                  onChange={e => setCandidateData({ ...candidateData, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="+91 98200 44551"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Primary Trade *
                </label>
                <input
                  type="text"
                  required
                  value={candidateData.trade}
                  onChange={e => setCandidateData({ ...candidateData, trade: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Master AC Specialist"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={candidateData.skills}
                  onChange={e => setCandidateData({ ...candidateData, skills: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="Split AC, Gas Leakage, Inverter PCB"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Controlled Linking of Existing Pro */}
      {isLinkModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Link Existing Professional (Controlled Consent)
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              To prevent unauthorized claiming of independent professionals, a digital consent request token is dispatched. The association will activate only when confirmed by the professional on their portal.
            </p>

            {linkSuccessResponse ? (
              <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, marginBottom: 6 }}>
                  <CheckCircle2 size={18} /> Consent Request Dispatched!
                </div>
                <div>Invitation Token: <strong>{linkSuccessResponse.invitationToken}</strong></div>
                <div>Status: <span style={{ color: '#d97706', fontWeight: 600 }}>{linkSuccessResponse.status}</span></div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                  The technician must log into their Urban Pro dashboard and approve the agency association before assignment privileges activate.
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  style={{ marginTop: 14, padding: '7px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleLinkExisting} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Registered Professional Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={linkData.phone}
                    onChange={e => setLinkData({ ...linkData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    placeholder="+91 98205 11982"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Urban Pro Worker ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkData.workerId}
                    onChange={e => setLinkData({ ...linkData, workerId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    placeholder="e.g. PRO-8841"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsLinkModalOpen(false)}
                    style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Send Consent Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Manage Availability */}
      {isAvailabilityModalOpen && selectedTech && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 460, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Manage Availability: {selectedTech.name}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              Adjust operational duty hours and leave schedule within platform policies.
            </p>
            <form onSubmit={handleAvailabilitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Daily Shift Hours
                </label>
                <input
                  type="text"
                  value={availData.operatingHours}
                  onChange={e => setAvailData({ ...availData, operatingHours: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="08:00 - 18:00"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Today's Attendance Status
                </label>
                <select
                  value={availData.attendanceToday}
                  onChange={e => setAvailData({ ...availData, attendanceToday: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Present (Available)">Present (Available)</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Training / Assessment">Training / Assessment</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Scheduled Leave Dates (YYYY-MM-DD, comma separated)
                </label>
                <input
                  type="text"
                  value={availData.leaveDates}
                  onChange={e => setAvailData({ ...availData, leaveDates: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="2026-10-25, 2026-10-26"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsAvailabilityModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Request Skill Enhancement */}
      {isSkillModalOpen && selectedTech && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
              Request Skill Upgrade: {selectedTech.name}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              Submits request to platform certification desk. A practical verification test will be assigned.
            </p>
            <form onSubmit={handleSkillChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Requested Skills (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={skillData.requestedSkills}
                  onChange={e => setSkillData({ ...skillData, requestedSkills: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Certification / Workshop Justification *
                </label>
                <textarea
                  rows={2}
                  required
                  value={skillData.justification}
                  onChange={e => setSkillData({ ...skillData, justification: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Skill Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Remove Business Association with Reason & Active Assignments Guard */}
      {isRemoveModalOpen && selectedTech && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%', padding: 24 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#dc2626', margin: '0 0 6px' }}>
              End Business Association: {selectedTech.name}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
              Ending association detaches the professional from your agency fleet. Historical bookings and financial records remain preserved under your entity. The technician's platform account will NOT be deleted.
            </p>

            {removeError && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 12.5, marginBottom: 14 }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>Action Blocked:</strong>
                {removeError}
              </div>
            )}

            <form onSubmit={handleRemoveAssociationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Mandatory Association Removal Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={removeReason}
                  onChange={e => setRemoveReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Professional relocated to another city; mutual agreement."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsRemoveModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm End of Association
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
