import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function TrainingView({ showToast }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [trainings, setTrainings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [videoNotice, setVideoNotice] = useState('');
  const [loading, setLoading] = useState(true);

  // Assessment Modal state
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Session Booking Modal state
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookingSession, setBookingSession] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  async function loadTrainings() {
    setLoading(true);
    try {
      const data = await professionalClient.getTrainings();
      if (data.success) {
        if (data.trainings) setTrainings(data.trainings);
        if (data.availableSessions) setSessions(data.availableSessions);
        if (data.externalVideoNotice) setVideoNotice(data.externalVideoNotice);
      }
    } catch (err) {
      console.warn('Trainings load warning:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartAssessment = async (course) => {
    setActiveCourse(course);
    setAssessmentResult(null);
    setSelectedAnswers({});
    try {
      const data = await professionalClient.getTrainingAssessment(course.id);
      if (data.success && data.questions) {
        setAssessmentQuestions(data.questions);
        setAssessmentModalOpen(true);
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to load assessment questions');
    }
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!activeCourse) return;

    if (Object.keys(selectedAnswers).length < assessmentQuestions.length) {
      if (showToast) showToast('Please answer all assessment questions before submitting.');
      return;
    }

    setSubmittingAssessment(true);
    try {
      const res = await professionalClient.submitTrainingAssessment(activeCourse.id, selectedAnswers);
      setAssessmentResult(res);
      if (res.passed) {
        if (showToast) showToast('Congratulations! Verified certification awarded.');
        setTrainings(prev => prev.map(c => c.id === activeCourse.id ? {
          ...c,
          completed: true,
          score: res.score,
          completedAt: new Date().toISOString().split('T')[0],
          certificateId: res.certificate?.certificateId,
          expiryDate: res.certificate?.expiryDate
        } : c));
      }
    } catch (err) {
      if (err.data) {
        setAssessmentResult(err.data);
      } else {
        if (showToast) showToast(err.message || 'Assessment evaluation error');
      }
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const handleBookSession = async (session) => {
    setBookingSession(true);
    try {
      const res = await professionalClient.bookTrainingSession({ sessionId: session.sessionId });
      if (res.success) {
        if (showToast) showToast(`Seat confirmed at ${session.hub}!`);
        setSessions(prev => prev.map(s => s.sessionId === session.sessionId ? {
          ...s,
          bookedByPro: true,
          bookingStatus: 'Confirmed',
          enrolledCount: s.enrolledCount + 1
        } : s));
        setSessionModalOpen(false);
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Booking failed');
    } finally {
      setBookingSession(false);
    }
  };

  const filteredCourses = trainings.filter(c => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'required') return c.courseType === 'required';
    if (activeTab === 'assigned') return c.courseType === 'assigned';
    if (activeTab === 'available') return c.courseType === 'available';
    return true;
  });

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1040, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Urban Company Academy & Verified Certifications
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Mandatory SOP compliance, verified assessment examinations (≥80% required), and practical hub lab bookings
        </div>
      </div>

      {/* External Video Limitation & Sandbox Disclosure */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '12px 18px',
        fontSize: 12,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20
      }}>
        <span style={{ fontSize: 20 }}>🎬</span>
        <div>
          <strong>Curriculum Platform Notice:</strong> {videoNotice || 'Notice: External streaming video player unconfigured in this sandbox; illustrated procedures, module checklists, and verified knowledge assessments are active.'}
        </div>
      </div>

      {/* Hero Certificate Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9 }}>
            Urban Pro Academy Accreditation
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 4px 0' }}>
            Verified Doorstep Master Technician
          </h2>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            {trainings.filter(t => t.completed).length} of {trainings.length} Core Modules Certified • Passing Benchmark: 80%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '10px 18px',
          borderRadius: 10,
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <div style={{ fontSize: 24 }}>🎓</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>Annual Expiry Cycle</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Courses' },
          { id: 'required', label: 'Required (Mandatory for Eligibility)' },
          { id: 'assigned', label: 'Assigned by Manager' },
          { id: 'available', label: 'Elective Skill Upgrades' },
          { id: 'workshops', label: 'In-Person Hub Labs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#0f172a' : '#f8fafc',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              border: `1px solid ${activeTab === tab.id ? '#0f172a' : '#cbd5e1'}`,
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workshop Sessions Tab Content */}
      {activeTab === 'workshops' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Practical Hands-on Hub Masterclasses
          </h3>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            Reserve a workstation at your local logistics depot for physical equipment calibration and practical assessments
          </div>

          {sessions.map(s => (
            <div
              key={s.sessionId}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: '20px 24px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: '#2563eb', color: '#ffffff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                    {s.sessionId}
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    {s.courseTitle}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>
                  📍 {s.hub} • Instructor: {s.instructor}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 2 }}>
                  🗓️ {s.slot} • Capacity: {s.enrolledCount} / {s.capacity} enrolled
                </div>
              </div>

              <div>
                {s.bookedByPro ? (
                  <span style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'inline-block'
                  }}>
                    ✓ Seat Confirmed
                  </span>
                ) : (
                  <button
                    onClick={() => handleBookSession(s)}
                    disabled={bookingSession || s.enrolledCount >= s.capacity}
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
                    {bookingSession ? 'Booking...' : 'Book Hub Seat'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Regular Courses List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredCourses.map(course => (
            <div
              key={course.id}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: '22px 26px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      background: course.courseType === 'required' ? '#fee2e2' : course.courseType === 'assigned' ? '#fef3c7' : '#eff6ff',
                      color: course.courseType === 'required' ? '#b91c1c' : course.courseType === 'assigned' ? '#b45309' : '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {course.courseType}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{course.category} • {course.duration}</span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#475569', margin: '0 0 8px 0', lineHeight: 1.5, maxWidth: 650 }}>
                    {course.description}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {course.completed ? (
                    <div>
                      <span style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-block'
                      }}>
                        ✓ Certified ({course.score})
                      </span>
                      {course.expiryDate && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                          Valid until: {course.expiryDate}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span style={{
                        background: '#fffbeb',
                        color: '#b45309',
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'inline-block'
                      }}>
                        ⏳ {course.completed ? 'Completed' : 'Pending Assessment'}
                      </span>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        Pass mark: ≥ {course.passingScore || 80}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Eligibility Impact Banner */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
                color: '#334155',
                marginBottom: 14
              }}>
                <strong>Eligibility Impact:</strong> {course.eligibilityImpact}
              </div>

              {/* Module Progress Breakdown */}
              {course.modules && (
                <div style={{ background: '#fcfcfc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Syllabus Modules ({course.modules.filter(m => m.completed).length}/{course.modules.length} Completed):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                    {course.modules.map(mod => (
                      <div key={mod.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: mod.completed ? '#059669' : '#64748b' }}>
                        <span>{mod.completed ? '✓' : '○'}</span>
                        <span>{mod.title} ({mod.duration})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                {course.completed ? (
                  <button
                    onClick={() => handleStartAssessment(course)}
                    style={{
                      background: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Retake Knowledge Check
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAssessment(course)}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📝 Take Verified Assessment (≥80% to Pass)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Verified Assessment Quiz Modal */}
      {assessmentModalOpen && activeCourse && (
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
            maxWidth: 580,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <span style={{ background: '#2563eb', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                  {activeCourse.id}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>
                  {activeCourse.title}
                </h3>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  End-of-Module Competence Examination • Minimum 80% passing threshold enforced
                </div>
              </div>
              <button
                onClick={() => setAssessmentModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Assessment Result Banner */}
            {assessmentResult && (
              <div style={{
                background: assessmentResult.passed ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${assessmentResult.passed ? '#a7f3d0' : '#fecaca'}`,
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 16
              }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: assessmentResult.passed ? '#047857' : '#b91c1c',
                  marginBottom: 4
                }}>
                  {assessmentResult.passed ? '🎉 Congratulations! You Passed!' : '❌ Assessment Not Passed'}
                </div>
                <div style={{ fontSize: 13, color: assessmentResult.passed ? '#065f46' : '#991b1b', lineHeight: 1.4 }}>
                  {assessmentResult.message}
                </div>
                {assessmentResult.passed && assessmentResult.certificate && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginTop: 10,
                    fontSize: 12,
                    color: '#065f46'
                  }}>
                    <div>Certificate ID: <strong>{assessmentResult.certificate.certificateId}</strong></div>
                    <div>Valid Through: <strong>{assessmentResult.certificate.expiryDate}</strong></div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleAssessmentSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
                {assessmentQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                      Question {idx + 1}: {q.text}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            borderRadius: 6,
                            background: selectedAnswers[q.id] === optIdx ? '#eff6ff' : '#ffffff',
                            border: `1px solid ${selectedAnswers[q.id] === optIdx ? '#2563eb' : '#cbd5e1'}`,
                            fontSize: 13,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            checked={selectedAnswers[q.id] === optIdx}
                            onChange={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setAssessmentModalOpen(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingAssessment}
                  style={{ flex: 1.5, background: '#2563eb', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingAssessment ? 'Evaluating...' : 'Submit Answers for Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
