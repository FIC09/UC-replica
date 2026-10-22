import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function JobDetailView({ jobId, onNavigate, showToast }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SOP Checklist state
  const [checklist, setChecklist] = useState({
    ppeKit: true,
    initialInspection: true,
    powerjetCleaning: false,
    drainageCheck: false,
    gasPressureTest: false,
    customerWalkthrough: false
  });

  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    setLoading(true);
    setError(null);
    try {
      const data = await professionalClient.getJobDetail(jobId);
      if (data.success && data.job) {
        setJob(data.job);
      }
    } catch (err) {
      setError(err.message || 'Failed to load job details. Unauthorized access.');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (newStatus, otp) => {
    try {
      await professionalClient.updateJobStatus(jobId, newStatus, otp);
      showToast(`Job status updated to ${newStatus}`);
      loadJob();
    } catch (err) {
      showToast(err.message || 'Status transition failed');
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.trim() !== '4829' && otpInput.trim() !== job?.otp) {
      showToast('Invalid customer OTP. Correct code is 4829');
      return;
    }
    await handleUpdateStatus('In Progress', otpInput);
    setShowOtpModal(false);
    setOtpInput('');
  };

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Loading job details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 14,
          padding: 30,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#991b1b', margin: '0 0 8px 0' }}>
            Access Restricted
          </h2>
          <p style={{ fontSize: 14, color: '#7f1d1d', margin: '0 0 20px 0' }}>
            {error || 'You do not have permission to view or manage this service booking.'}
          </p>
          <button
            onClick={() => onNavigate('/professional/jobs')}
            style={{
              background: '#991b1b',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Return to My Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Back button & Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => onNavigate('/professional/jobs')}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          ← Back to All Dispatches
        </button>

        <span style={{
          background: job.status === 'Completed' ? '#ecfdf5' :
            job.status === 'In Progress' ? '#dbeafe' :
            job.status === 'En Route' ? '#fef3c7' : '#f1f5f9',
          color: job.status === 'Completed' ? '#059669' :
            job.status === 'In Progress' ? '#1e40af' :
            job.status === 'En Route' ? '#b45309' : '#475569',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 700
        }}>
          Status: {job.status}
        </span>
      </div>

      {/* Main Job Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
              Job ID: {job.id} • Ref: {job.bookingReference}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 8px 0' }}>
              {job.serviceName}
            </h1>
            <div style={{ fontSize: 14, color: '#334155' }}>
              Scheduled Time Slot: <strong>{job.slot}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>
              ₹{job.payout || Math.round((job.totalAmount || 500) * 0.8)}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Pro Payout (Gross ₹{job.totalAmount})
            </div>
            <div style={{
              display: 'inline-block',
              background: '#ecfdf5',
              color: '#059669',
              padding: '2px 8px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              marginTop: 4
            }}>
              Paid via Online UPI
            </div>
          </div>
        </div>

        {/* Customer & Location */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 18 }}>
          <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Customer Details
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {job.customer}
            </div>
            <div style={{ fontSize: 14, color: '#2563eb', marginTop: 4 }}>
              📞 <a href={`tel:${job.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{job.phone}</a>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              Verified Urban Company Homeowner
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Destination Address
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>
              {job.address}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                📍 {job.distance || '1.2 km away'}
              </span>
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(job.address)}`, '_blank')}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Open in Maps ↗
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {job.status === 'Assigned' && (
            <button
              onClick={() => handleUpdateStatus('En Route')}
              style={{
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🚗 Mark En Route to Customer
            </button>
          )}

          {(job.status === 'Assigned' || job.status === 'En Route') && (
            <button
              onClick={() => setShowOtpModal(true)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔑 Enter Customer OTP & Begin Service
            </button>
          )}

          {job.status === 'In Progress' && (
            <button
              onClick={() => handleUpdateStatus('Completed')}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✅ Complete Job & Finalize Billing
            </button>
          )}

          <button
            onClick={() => onNavigate('/professional/support')}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '12px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            🚨 Report On-Site Issue / SOS
          </button>
        </div>
      </div>

      {/* Service SOP Checklist & Deliverables */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
          Mandatory Safety & Quality SOP Checklist
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
          Check each step as you execute to maintain your Level 5 Diamond Partner compliance.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { key: 'ppeKit', title: 'Uniform & PPE Safety Gear', desc: 'Wearing official Urban Pro polo shirt, safety goggles, rubber insulated gloves, and shoe covers.' },
            { key: 'initialInspection', title: 'Pre-Service Diagnostic Test', desc: 'Checked AC power supply, temperature delta, initial airflow, and noted pre-existing scuffs with homeowner.' },
            { key: 'powerjetCleaning', title: 'Powerjet Deep Foam & Coil Wash', desc: 'Mounted waterproof spill collection bag; applied coil cleaner; blasted with high-pressure powerjet.' },
            { key: 'drainageCheck', title: 'Condensate Drain Pipe Clearance', desc: 'Flushed drain pipe with pressure nozzle; confirmed zero water backflow into bedroom.' },
            { key: 'gasPressureTest', title: 'R32 Refrigerant Pressure Check', desc: 'Connected digital manifold gauge; verified operating suction pressure between 110-125 PSI.' },
            { key: 'customerWalkthrough', title: 'Customer Temperature Demonstration', desc: 'Turned on unit; showed 16°C cool blast to customer; wiped unit and cleaned floor work area.' }
          ].map(item => (
            <div
              key={item.key}
              onClick={() => toggleChecklist(item.key)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                background: checklist[item.key] ? '#ecfdf5' : '#f8fafc',
                border: checklist[item.key] ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => {}}
                style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: checklist[item.key] ? '#065f46' : '#0f172a' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start OTP Modal */}
      {showOtpModal && (
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
            maxWidth: 400,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Verify Customer Start OTP
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Ask homeowner <strong>{job.customer}</strong> for their 4-digit service PIN to begin.
            </p>

            <div style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              color: '#475569',
              marginBottom: 16
            }}>
              💡 Code: <strong>4829</strong>
            </div>

            <input
              type="text"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="4-digit OTP"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 24,
                letterSpacing: 8,
                textAlign: 'center',
                fontWeight: 700,
                border: '2px solid #cbd5e1',
                borderRadius: 10,
                boxSizing: 'border-box',
                marginBottom: 20
              }}
              autoFocus
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowOtpModal(false)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                style={{
                  flex: 1.5,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Verify & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
