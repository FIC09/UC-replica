import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Users,
  FileText,
  Plus,
  X,
  ExternalLink,
  Lock,
  ChevronRight
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function TrainingView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses'); // courses, professionals, sessions, compliance
  const [trainingData, setTrainingData] = useState({
    requiredCourses: [],
    assignedProfessionals: [],
    trainingSessions: [],
    businessDocumentExpiry: [],
    professionalDocumentExpiry: [],
    pendingComplianceActions: [],
    operationalRestrictions: [],
    selfCertificationNotice: ''
  });

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    courseId: 'TRN-102',
    requestedDate: '2026-11-05',
    attendeesCount: 4,
    venueType: 'Service Depot',
    notes: 'Restocking batch for certified AC technicians'
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    loadTraining();
  }, []);

  async function loadTraining() {
    setLoading(true);
    try {
      const res = await partnerClient.getTraining();
      if (res && res.success) {
        setTrainingData({
          requiredCourses: res.requiredCourses || [],
          assignedProfessionals: res.assignedProfessionals || [],
          trainingSessions: res.trainingSessions || [],
          businessDocumentExpiry: res.businessDocumentExpiry || [],
          professionalDocumentExpiry: res.professionalDocumentExpiry || [],
          pendingComplianceActions: res.pendingComplianceActions || [],
          operationalRestrictions: res.operationalRestrictions || [],
          selfCertificationNotice: res.selfCertificationNotice || ''
        });
      }
    } catch (err) {
      showToast?.('Error loading training modules: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestSession(e) {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const res = await partnerClient.requestTrainingSession(requestForm);
      if (res && res.success) {
        showToast?.('Training session requested successfully. Academy will confirm slot within 24h.');
        setRequestModalOpen(false);
        loadTraining();
      } else {
        showToast?.(res?.error || 'Failed to submit training request.');
      }
    } catch (err) {
      showToast?.('Error: ' + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  }

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
            Training, Certifications & Compliance
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Platform-mandated quality standards, technician certification lifecycle, and municipal document compliance
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setRequestModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#0ea5e9',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Request Training Session
          </button>
        </div>
      </div>

      {/* Governance & Self-Certification Guard Banner */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 12,
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ background: '#f1f5f9', color: '#475569', padding: 8, borderRadius: 8 }}>
          <Lock size={18} />
        </div>
        <div style={{ flex: 1, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
          <strong>Policy Guard:</strong> {trainingData.selfCertificationNotice || 'Training completion and certifications are strictly granted by Platform Academy Evaluators. Business partners cannot self-certify technicians or bypass evaluations.'}
        </div>
      </div>

      {/* Operational Restrictions Alert (if any) */}
      {trainingData.operationalRestrictions.length > 0 && (
        <div style={{
          background: '#fff1f2',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid #fecdd3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e11d48', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
            <ShieldAlert size={18} /> Active Compliance Restrictions Caused by Missing Requirements
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trainingData.operationalRestrictions.map((r, i) => (
              <div key={i} style={{ fontSize: 13, color: '#9f1239', background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #ffe4e6' }}>
                <strong>{r.affectedEntity}</strong> — <span style={{ fontWeight: 700, textTransform: 'uppercase', color: '#be123c' }}>{r.restrictionType}:</span> {r.reason}
                <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                  Resolution: <em>{r.actionRequired}</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
        {[
          { id: 'courses', label: `Required Courses (${trainingData.requiredCourses.length})`, icon: BookOpen },
          { id: 'professionals', label: `Assigned Technicians (${trainingData.assignedProfessionals.length})`, icon: Users },
          { id: 'sessions', label: `Training Sessions (${trainingData.trainingSessions.length})`, icon: Calendar },
          { id: 'compliance', label: `Document Expiry & Compliance (${trainingData.businessDocumentExpiry.length + trainingData.professionalDocumentExpiry.length})`, icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 13.5,
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#0ea5e9' : '#64748b',
                background: isSelected ? '#f0f9ff' : 'transparent',
                border: 'none',
                borderBottom: isSelected ? '2px solid #0ea5e9' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          Loading training and compliance data...
        </div>
      ) : (
        <>
          {/* TAB 1: REQUIRED COURSES */}
          {activeTab === 'courses' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
              {trainingData.requiredCourses.map(course => (
                <div
                  key={course.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#7c3aed', background: '#f3e8ff', padding: '3px 8px', borderRadius: 4 }}>
                        {course.category}
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: course.completionRate === 100 ? '#dcfce7' : '#fef3c7',
                        color: course.completionRate === 100 ? '#16a34a' : '#b45309'
                      }}>
                        {course.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {course.title}
                    </h3>

                    <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 14 }}>
                      Mandatory For: <strong>{course.requiredFor}</strong> • Passing Score: <strong>{course.passingThreshold || '80%'}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569', marginBottom: 6 }}>
                        <span>Certified Roster</span>
                        <strong>{course.completedCount} / {course.enrolledCount} ({course.completionRate}%)</strong>
                      </div>
                      <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${course.completionRate}%`,
                          height: '100%',
                          background: course.completionRate === 100 ? '#16a34a' : '#0ea5e9',
                          borderRadius: 4
                        }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
                    <span>Valid Until: <strong>{course.validUntil}</strong></span>
                    <button
                      onClick={() => {
                        setRequestForm(f => ({ ...f, courseId: course.id }));
                        setRequestModalOpen(true);
                      }}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Request Batch Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ASSIGNED PROFESSIONALS */}
          {activeTab === 'professionals' && (
            <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                Technician Training & Certification Status
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px' }}>Technician</th>
                      <th style={{ padding: '12px 16px' }}>Trade</th>
                      <th style={{ padding: '12px 16px' }}>Active Certifications</th>
                      <th style={{ padding: '12px 16px' }}>Latest Expiry</th>
                      <th style={{ padding: '12px 16px' }}>Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingData.assignedProfessionals.map(pro => (
                      <tr key={pro.professionalId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{pro.name}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{pro.professionalId}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{pro.trade}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {pro.certifications.map((c, i) => (
                              <div key={i} style={{ fontSize: 12, color: '#334155' }}>
                                • {c.name}: <span style={{ fontWeight: 600, color: c.status === 'Certified' ? '#16a34a' : '#e11d48' }}>{c.status}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          {pro.certifications[0]?.expiresAt || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            background: pro.overallStatus.includes('Fully') ? '#dcfce7' : '#fee2e2',
                            color: pro.overallStatus.includes('Fully') ? '#16a34a' : '#b91c1c'
                          }}>
                            {pro.overallStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULED SESSIONS */}
          {activeTab === 'sessions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 18 }}>
              {trainingData.trainingSessions.map(sess => (
                <div
                  key={sess.sessionId}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0ea5e9', background: '#e0f2fe', padding: '3px 8px', borderRadius: 4 }}>
                      {sess.mode}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: 4 }}>
                      {sess.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                    {sess.title}
                  </h3>

                  <div style={{ fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    <div><strong>Date & Time:</strong> {sess.date} ({sess.time})</div>
                    <div><strong>Trainer:</strong> {sess.trainer}</div>
                    <div><strong>Location / Venue:</strong> {sess.venue}</div>
                    <div><strong>Seats Enrolled:</strong> {sess.enrolledCount} / {sess.capacity} available</div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, fontSize: 12, color: '#94a3b8' }}>
                    Session Ref: <strong>{sess.sessionId}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: COMPLIANCE & DOCUMENT EXPIRY */}
          {activeTab === 'compliance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Business Document Expiry */}
              <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  Business Licenses & Platform Agreements Expiry
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px' }}>Document Type</th>
                        <th style={{ padding: '12px 16px' }}>Doc Ref / License</th>
                        <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Restriction If Expired</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingData.businessDocumentExpiry.map(doc => (
                        <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{doc.docType}</td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{doc.documentNumber}</td>
                          <td style={{ padding: '12px 16px', color: '#0f172a' }}>{doc.expiryDate}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              background: doc.status === 'Valid' ? '#dcfce7' : '#fef3c7',
                              color: doc.status === 'Valid' ? '#16a34a' : '#b45309'
                            }}>
                              {doc.status} ({doc.daysRemaining}d)
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                            {doc.restrictionIfExpired}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Technician Document Expiry */}
              <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                  Technician Compliance Document Portfolio
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px' }}>Technician</th>
                        <th style={{ padding: '12px 16px' }}>Document Type</th>
                        <th style={{ padding: '12px 16px' }}>Doc Number</th>
                        <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                        <th style={{ padding: '12px 16px' }}>Compliance State</th>
                        <th style={{ padding: '12px 16px' }}>Enforced Restriction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingData.professionalDocumentExpiry.map(doc => (
                        <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{doc.professionalName}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{doc.professionalId}</div>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>{doc.docType}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b' }}>{doc.documentNumber}</td>
                          <td style={{ padding: '12px 16px', color: '#0f172a' }}>{doc.expiryDate}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              background: doc.status === 'Valid' ? '#dcfce7' : (doc.status === 'Expired' ? '#fee2e2' : '#fef3c7'),
                              color: doc.status === 'Valid' ? '#16a34a' : (doc.status === 'Expired' ? '#b91c1c' : '#b45309')
                            }}>
                              {doc.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: doc.status === 'Expired' ? '#b91c1c' : '#64748b' }}>
                            {doc.restrictionIfExpired}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* REQUEST TRAINING SESSION MODAL */}
      {requestModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            width: '100%',
            maxWidth: 500,
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Request Training Session
              </h2>
              <button
                onClick={() => setRequestModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestSession} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Select Course / Module
                </label>
                <select
                  value={requestForm.courseId}
                  onChange={e => setRequestForm({ ...requestForm, courseId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  {trainingData.requiredCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Preferred Session Date
                </label>
                <input
                  type="date"
                  value={requestForm.requestedDate}
                  onChange={e => setRequestForm({ ...requestForm, requestedDate: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Technicians Attending
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={requestForm.attendeesCount}
                    onChange={e => setRequestForm({ ...requestForm, attendeesCount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                    Session Venue
                  </label>
                  <select
                    value={requestForm.venueType}
                    onChange={e => setRequestForm({ ...requestForm, venueType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Service Depot">Bandra Depot (In-Person)</option>
                    <option value="Virtual Classroom">Virtual Classroom</option>
                    <option value="Partner Facility">Partner Agency Facility</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Operational Notes & Fleet Context
                </label>
                <textarea
                  rows="3"
                  value={requestForm.notes}
                  onChange={e => setRequestForm({ ...requestForm, notes: e.target.value })}
                  placeholder="e.g. Technicians need recertification for upcoming festival rush..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0ea5e9',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: submittingRequest ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
