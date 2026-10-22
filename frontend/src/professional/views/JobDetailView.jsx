import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function JobDetailView({ jobId, onNavigate, showToast }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Start OTP verification modal
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Reassignment Modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignReason, setReassignReason] = useState('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  // Professional Private Note input
  const [newNoteInput, setNewNoteInput] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

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

  // Lifecycle Transitions
  const handleUpdateStatus = async (newStatus, otp) => {
    try {
      await professionalClient.updateJobStatus(jobId, newStatus, otp);
      showToast(`Job status updated to "${newStatus}"`);
      await loadJob();
    } catch (err) {
      showToast(err.message || 'Status transition failed');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter a 4-digit code provided by the customer.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      await professionalClient.updateJobStatus(jobId, 'In Progress', otpInput.trim());
      showToast('Start OTP verified! Job is now In Progress.');
      setShowOtpModal(false);
      setOtpInput('');
      await loadJob();
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP code. Please check with customer.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Interactive Checklist
  const handleToggleChecklist = async (itemId, currentCompleted) => {
    try {
      const nextCompleted = !currentCompleted;
      // Optimistic update
      setJob(prev => ({
        ...prev,
        serviceChecklist: (prev.serviceChecklist || []).map(item =>
          item.id === itemId ? { ...item, completed: nextCompleted } : item
        )
      }));

      await professionalClient.updateJobChecklist(jobId, itemId, nextCompleted);
    } catch (err) {
      showToast('Could not save checklist item change.');
      loadJob();
    }
  };

  // Reassignment Submission
  const handleSubmitReassignment = async () => {
    if (!reassignReason || reassignReason.trim().length < 5) {
      showToast('Please enter a valid reason (min 5 characters).');
      return;
    }

    setIsSubmittingReassign(true);
    try {
      const res = await professionalClient.requestReassignment(jobId, reassignReason);
      showToast(res.message || 'Reassignment request submitted.');
      setShowReassignModal(false);
      setReassignReason('');
      await loadJob();
    } catch (err) {
      showToast(err.message || 'Reassignment request failed.');
    } finally {
      setIsSubmittingReassign(false);
    }
  };

  // Add Professional Private Note
  const handleAddNote = async () => {
    if (!newNoteInput.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await professionalClient.addProfessionalNote(jobId, newNoteInput.trim());
      showToast('Private technician note recorded.');
      setNewNoteInput('');
      // Attach note locally
      if (res.note) {
        setJob(prev => ({
          ...prev,
          professionalNotes: [...(prev.professionalNotes || []), res.note]
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to add note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Loading job specifications and execution checklist...
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
            Access Restricted / Authorization Check Failed
          </h2>
          <p style={{ fontSize: 14, color: '#7f1d1d', margin: '0 0 20px 0' }}>
            {error || 'This service booking is not assigned to your technician account.'}
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
            ← Return to My Dispatches
          </button>
        </div>
      </div>
    );
  }

  // Sequence: Assigned → En Route → Arrived → In Progress → Completed
  const lifecycleSteps = ['Assigned', 'En Route', 'Arrived', 'In Progress', 'Completed'];
  const currentStepIndex = lifecycleSteps.indexOf(job.status);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Breadcrumb & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => onNavigate('/professional/jobs')}
          style={{
            background: 'none',
            border: 'none',
            color: '#7c3aed',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          ← Back to All Dispatches
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {job.reassignmentRequest?.status === 'Pending' && (
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              ⚠️ Reassignment Pending Review
            </span>
          )}

          <span style={{
            background: job.status === 'Completed' ? '#ecfdf5' :
              job.status === 'In Progress' ? '#dbeafe' :
              job.status === 'Arrived' ? '#ede9fe' :
              job.status === 'En Route' ? '#fef3c7' : '#f1f5f9',
            color: job.status === 'Completed' ? '#059669' :
              job.status === 'In Progress' ? '#1e40af' :
              job.status === 'Arrived' ? '#6b21a8' :
              job.status === 'En Route' ? '#92400e' : '#475569',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 800
          }}>
            Status: {job.status}
          </span>
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '18px 24px',
        border: '1px solid #e2e8f0',
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
          Service Execution Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {lifecycleSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCompleted ? '#059669' : isCurrent ? '#7c3aed' : '#f1f5f9',
                  color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(124, 58, 237, 0.2)' : 'none'
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#7c3aed' : isCompleted ? '#059669' : '#64748b',
                  marginTop: 6,
                  textAlign: 'center'
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
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
              Booking Reference: <strong style={{ color: '#0f172a' }}>{job.bookingReference}</strong>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '6px 0 6px 0' }}>
              {job.serviceName}
            </h1>
            <div style={{ fontSize: 14, color: '#334155' }}>
              Scheduled Slot: <strong>{job.slot}</strong> ({job.timeZone || 'Asia/Kolkata (IST)'})
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Estimated Duration: <strong>{job.estimatedDuration}</strong> • Operating Zone: <strong>{job.area}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>
              ₹{job.payout}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Net Professional Payout (80%)
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
              Payment: {job.paymentMethod} ({job.paymentStatus})
            </div>
          </div>
        </div>

        {/* Customer instructions */}
        {job.customerInstructions && (
          <div style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: 10,
            padding: '14px 18px',
            marginTop: 20
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>
              Customer Instructions & Access Notes
            </div>
            <div style={{ fontSize: 14, color: '#3b0764', marginTop: 4, fontStyle: 'italic' }}>
              "{job.customerInstructions}"
            </div>
          </div>
        )}

        {/* Customer & Location Policy (Masked / Unmasked) */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 18 }}>
          <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Customer Contact
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {job.customer}
            </div>
            <div style={{ fontSize: 14, color: '#2563eb', marginTop: 4 }}>
              📞 {job.phone}
            </div>
            {job.isPhoneMasked ? (
              <div style={{ fontSize: 11, color: '#92400e', marginTop: 6 }}>
                🔒 Customer phone masked per Booking Access Policy. Unlocks upon marking "En Route".
              </div>
            ) : (
              <div style={{ fontSize: 11, color: '#059669', marginTop: 6, fontWeight: 600 }}>
                ✓ Live contact access active
              </div>
            )}
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
                📍 Zone: {job.area}
              </span>
              {!job.preciseAddressHidden && (
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(job.fullAddress || job.address)}`, '_blank')}
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
                  Turn-by-turn Navigation ↗
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Button Bar following valid lifecycle */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.2)'
              }}
            >
              🚗 Start Travel (Mark En Route) →
            </button>
          )}

          {job.status === 'En Route' && (
            <button
              onClick={() => handleUpdateStatus('Arrived')}
              style={{
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              📍 Confirm Arrival at Doorstep →
            </button>
          )}

          {job.status === 'Arrived' && (
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              🔑 Enter Customer Start OTP & Begin Service →
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
              }}
            >
              ✓ Complete Service & Credit Wallet (₹{job.payout})
            </button>
          )}

          {/* Reassignment trigger (only if not finished) */}
          {['Assigned', 'En Route', 'Arrived'].includes(job.status) && (
            <button
              onClick={() => setShowReassignModal(true)}
              style={{
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '12px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Request Reassignment
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
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🚨 SOS / Support
          </button>
        </div>
      </div>

      {/* Grid: Scope & Checklist (Left) + Financials & Notes (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left: Package Items, Required Tools & Service Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Service Package & Items */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
              Service Package & Included Scope
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(job.items || []).map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {it.title || it.name} x {it.qty || 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    ₹{it.price}
                  </span>
                </div>
              ))}

              {job.addons && job.addons.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                    Customer Add-ons:
                  </div>
                  {job.addons.map((add, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', padding: '6px 14px' }}>
                      <span>+ {add.title}</span>
                      <span>₹{add.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Required Tools & Supplies */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
              Required Tools & Supplies Checklist
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(job.requiredTools || ['Insulated Toolkit', 'PPE Safety Gear', 'Disposable Shoe Covers']).map((tool, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>🧰</span>
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Applicable Service Checklist */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Service SOP Checklist
              </h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {(job.serviceChecklist || []).filter(c => c.completed).length} of {(job.serviceChecklist || []).length} completed
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(job.serviceChecklist || []).map(item => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id, item.completed)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: item.completed ? '#ecfdf5' : '#f8fafc',
                    border: `1px solid ${item.completed ? '#a7f3d0' : '#e2e8f0'}`,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    onChange={() => {}}
                    style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: item.completed ? '#065f46' : '#0f172a' }}>
                      {item.text}
                    </div>
                    {item.required && (
                      <span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Required for job sign-off
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Financial Breakdown, Strict Notes Separation, & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Financials Worker is Authorized to See */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
              Authorized Financial Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Customer Total Fare:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{job.totalAmount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>Platform Commission (20%):</span>
                <span>- ₹{job.platformCommission || Math.round(job.totalAmount * 0.2)}</span>
              </div>
              <div style={{
                borderTop: '1px dashed #cbd5e1',
                paddingTop: 10,
                marginTop: 4,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 800,
                color: '#059669'
              }}>
                <span>Net Pro Payout:</span>
                <span>₹{job.payout}</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 10 }}>
              🔒 Payout will be credited directly to your registered wallet immediately upon service completion.
            </div>
          </div>

          {/* Strict Notes Separation */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Professional Private Notes
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px 0' }}>
              🔒 Strictly confidential to you. Admin internal and agency notes are separated and never disclosed here.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {(job.professionalNotes || []).length === 0 ? (
                <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                  No private notes recorded for this booking yet.
                </div>
              ) : (
                job.professionalNotes.map(n => (
                  <div
                    key={n.id}
                    style={{
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                      color: '#334155'
                    }}
                  >
                    <div>{n.note}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.author}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add note input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add private technician note..."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={isAddingNote || !newNoteInput.trim()}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isAddingNote ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>

          {/* Job Audit Timeline */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
              Job Audit Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(job.timeline || []).map((tl, idx) => (
                <div key={tl.id || idx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#7c3aed',
                    marginTop: 6
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                      {tl.title}
                    </div>
                    {tl.description && (
                      <div style={{ fontSize: 12, color: '#64748b' }}>{tl.description}</div>
                    )}
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                      {new Date(tl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tl.actor}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              Ask homeowner <strong>{job.customer}</strong> for their 4-digit service PIN to begin. Code is validated on the backend.
            </p>

            <div style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              color: '#475569',
              marginBottom: 16
            }}>
              💡 <strong>Demo Code:</strong> Enter <strong>4829</strong> to simulate live customer authorization.
            </div>

            {otpError && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 14,
                fontWeight: 600
              }}>
                {otpError}
              </div>
            )}

            <input
              type="text"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 26,
                letterSpacing: 10,
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
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpInput('');
                  setOtpError('');
                }}
                disabled={isVerifyingOtp}
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
                disabled={isVerifyingOtp}
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
                {isVerifyingOtp ? 'Verifying...' : 'Verify & Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassignment Request Modal */}
      {showReassignModal && (
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
            maxWidth: 440,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Submit Reassignment Request
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Provide a clear reason why this booking ({job.bookingReference}) needs reassignment by the Dispatch Operations Cell.
            </p>

            <textarea
              rows={4}
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Specialized 3-phase commercial multimeter needed / transit breakdown..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
                marginBottom: 16
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowReassignModal(false)}
                disabled={isSubmittingReassign}
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
                onClick={handleSubmitReassignment}
                disabled={isSubmittingReassign || !reassignReason.trim()}
                style={{
                  flex: 1.5,
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSubmittingReassign ? 'Submitting...' : 'Submit to Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
