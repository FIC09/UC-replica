import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Search,
  Plus,
  FileText,
  Video,
  AlertCircle,
  Calendar,
  UserCheck,
  X
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function TrainingView({ onShowToast }) {
  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);

  // Assign Pro Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetModule, setTargetModule] = useState(null);
  const [assignForm, setAssignForm] = useState({
    professionalId: '',
    professionalName: '',
    trade: 'AC Technician'
  });

  useEffect(() => {
    adminClient.getTrainingModules()
      .then(res => setModules(res.modules || []))
      .catch(() => {});
  }, []);

  function openAssignModal(mod) {
    setTargetModule(mod);
    setShowAssignModal(true);
  }

  async function handleAssignSubmit(e) {
    e.preventDefault();
    if (!targetModule || !assignForm.professionalName) return;

    try {
      const res = await adminClient.assignTraining(targetModule.id, {
        professionalId: assignForm.professionalId || `PRO-${Date.now().toString().slice(-4)}`,
        professionalName: assignForm.professionalName,
        trade: assignForm.trade
      });

      if (res.success) {
        setModules(prev => prev.map(m => m.id === targetModule.id ? res.module : m));
        setShowAssignModal(false);
        setAssignForm({ professionalId: '', professionalName: '', trade: 'AC Technician' });
        if (onShowToast) onShowToast(res.message);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  }

  const filtered = modules.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (m.title || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q) ||
      (m.badgeAwarded || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Professional Academy & Safety SOP Training
            </h2>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              border: '1px solid #C7D2FE'
            }}>
              12-Month Certification Renewal Cycle
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Mandatory doorstep safety certifications, syllabus materials, pro fleet assignments, and expiry reminders.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#F8FAFC',
          border: '1px solid #D1D5DB',
          borderRadius: 8,
          padding: '8px 12px',
          width: 280
        }}>
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="Search Courses, SOPs, Badges..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(m => (
          <div
            key={m.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, backgroundColor: '#F5F3FF', color: '#6E42E5' }}>
                  {m.category}
                </span>
                {m.mandatory && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                    Mandatory SOP
                  </span>
                )}
              </div>

              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 6, lineHeight: 1.35 }}>
                {m.title}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #F1F5F9', fontSize: 12.5 }}>
                <span style={{ color: '#64748B' }}>Duration</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{m.durationMins} minutes</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                <span style={{ color: '#64748B' }}>Passing Score</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{m.passingScore}% minimum</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                <span style={{ color: '#64748B' }}>Fleet Completion Rate</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>{m.completionRate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                <span style={{ color: '#64748B' }}>Assigned Professionals</span>
                <span style={{ fontWeight: 700, color: '#6E42E5' }}>{m.assignedProfessionals?.length || 0} technicians</span>
              </div>

              {/* Training Materials */}
              {m.materials?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    COURSE MATERIALS & GUIDELINES:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {m.materials.map((mat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
                        {mat.type === 'Video' ? <Video size={13} color="#6E42E5" /> : <FileText size={13} color="#0284C7" />}
                        <span>{mat.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer: Badge & Action */}
            <div style={{
              paddingTop: 12,
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6E42E5', fontWeight: 700 }}>
                <Award size={15} />
                <span>{m.badgeAwarded}</span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedModule(m)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Roster
                </button>
                <button
                  type="button"
                  onClick={() => openAssignModal(m)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  Assign Pro
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ROSTER VIEW / ATTENDANCE & CERTIFICATION EXPIRY                    */}
      {/* ========================================================================= */}
      {selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 680,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GraduationCap size={20} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Assigned Fleet Roster: {selectedModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>Professional</th>
                    <th style={{ padding: '10px 14px' }}>Trade</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Completed Date</th>
                    <th style={{ padding: '10px 14px' }}>Expiry / Renewal</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Field Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedModule.assignedProfessionals?.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>{p.name}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{p.trade}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          backgroundColor: p.status === 'Certified' ? '#ECFDF5' : '#FEF3C7',
                          color: p.status === 'Certified' ? '#059669' : '#92400E'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12 }}>{p.completedAt || 'In Progress'}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B', fontSize: 12 }}>{p.expiresAt || 'N/A'}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                        {p.fieldScore ? `${p.fieldScore} ★` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN PROFESSIONAL TO TRAINING                                    */}
      {/* ========================================================================= */}
      {showAssignModal && targetModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserCheck size={18} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Assign Pro to Course
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 13, color: '#64748B' }}>
                  Enrolling technician into: <strong style={{ color: '#0F172A' }}>{targetModule.title}</strong>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Professional Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Shinde"
                    value={assignForm.professionalName}
                    onChange={e => setAssignForm({ ...assignForm, professionalName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Trade Skill / Category</label>
                  <select
                    value={assignForm.trade}
                    onChange={e => setAssignForm({ ...assignForm, trade: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                  >
                    <option value="AC Technician">AC Specialist</option>
                    <option value="Cleaning Pro">Deep Cleaning Pro</option>
                    <option value="Salon Specialist">Salon at Home Expert</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                  </select>
                </div>
              </div>

              <div style={{
                padding: '14px 24px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Enroll Pro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
