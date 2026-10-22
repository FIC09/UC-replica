import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function TrainingView({ showToast }) {
  const [courses, setCourses] = useState([
    {
      id: 'TRN-101',
      title: 'Powerjet AC Deep Jet Cleaning SOP',
      category: 'Technical Mastery',
      duration: '45 mins',
      status: 'Completed',
      score: '98%',
      completedDate: '12 Sep 2026',
      badge: 'Certified Powerjet Master',
      description: 'Step-by-step masterclass on mounting indoor leak collection bags, high-pressure foam wash, and drain tray sterilisation.'
    },
    {
      id: 'TRN-102',
      title: 'Customer Home Hygiene & Zero-Spill Protocol',
      category: 'Customer Delight',
      duration: '30 mins',
      status: 'Completed',
      score: '100%',
      completedDate: '28 Sep 2026',
      badge: 'Hygiene & Etiquette Star',
      description: 'Mandatory standard on shoe covers, clean floor sheets, polite greetings, and clean-up before leaving.'
    },
    {
      id: 'TRN-103',
      title: 'Inverter PCB Circuit Diagnostics & Fault Codes',
      category: 'Advanced Electronics',
      duration: '60 mins',
      status: 'In Progress',
      score: null,
      completedDate: null,
      badge: 'Inverter Specialist',
      description: 'Using digital multimeter to trace microcontroller errors, DC motor communication signals, and IPM failure.'
    },
    {
      id: 'TRN-104',
      title: 'R32 / R410A Eco Refrigerant Safe Recovery',
      category: 'Safety & Environment',
      duration: '35 mins',
      status: 'Available',
      score: null,
      completedDate: null,
      badge: 'Green HVAC Technician',
      description: 'Preventing atmospheric venting, flaring copper joints, and digital micron vacuum pump certification.'
    }
  ]);

  useEffect(() => {
    professionalClient.getTrainings().then(data => {
      if (data.success && data.trainings) {
        setCourses(data.trainings);
      }
    }).catch(() => {});
  }, []);

  const handleComplete = async (courseId) => {
    try {
      await professionalClient.completeTraining(courseId);
      setCourses(prev => prev.map(c => c.id === courseId ? {
        ...c,
        status: 'Completed',
        score: '95%',
        completedDate: 'Today'
      } : c));
      showToast('Module completed! Certificate of competence issued.');
    } catch (err) {
      showToast(err.message || 'Failed to complete module');
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Urban Company Academy & Certifications
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Complete technical skill modules and safety certifications to unlock premium job dispatches
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
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9 }}>
            Urban Pro Master Certification
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '6px 0 4px 0' }}>
            Govt-Recognised HVAC & Appliance Expert
          </h2>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            2 of 4 Advanced Masteries Completed • 99% Average Score
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
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>Valid thru Dec 2027</div>
        </div>
      </div>

      {/* Courses List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {courses.map(course => (
          <div
            key={course.id}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  {course.id} • {course.category}
                </span>
                <span style={{
                  background: course.status === 'Completed' ? '#ecfdf5' :
                    course.status === 'In Progress' ? '#eff6ff' : '#f8fafc',
                  color: course.status === 'Completed' ? '#059669' :
                    course.status === 'In Progress' ? '#2563eb' : '#64748b',
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {course.status === 'Completed' ? `✓ Completed (${course.score})` : course.status}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '6px 0 4px 0' }}>
                {course.title}
              </h3>
              <p style={{ fontSize: 13, color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                {course.description}
              </p>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Duration: {course.duration} {course.completedDate ? `• Certified on ${course.completedDate}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {course.status === 'Completed' && (
                <button
                  onClick={() => showToast(`Downloaded competence certificate for ${course.title}`)}
                  style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    padding: '9px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📜 Certificate PDF
                </button>
              )}

              {course.status === 'In Progress' && (
                <button
                  onClick={() => handleComplete(course.id)}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ▶ Finish Module & Take Quiz
                </button>
              )}

              {course.status === 'Available' && (
                <button
                  onClick={() => handleComplete(course.id)}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Start Course →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
