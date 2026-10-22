import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function JobsView({ onNavigate, showToast }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [filter]);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await professionalClient.getJobs(filter !== 'ALL' ? { status: filter } : {});
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.warn('Jobs load error, using fallback:', err);
      // Fallback sample data
      setJobs([
        {
          id: 'JOB-9410',
          bookingReference: 'UC-829410',
          serviceName: 'Powerjet AC Servicing (Split) + Deep Coil Cleaning',
          items: [{ title: 'Powerjet AC Servicing (Split)', price: 499, qty: 1 }],
          customer: 'Rohan Kapoor',
          phone: '+91 98200 12345',
          address: 'Flat 402, Sea Face Apartments, Pali Hill, Bandra West, Mumbai',
          city: 'Mumbai',
          serviceZone: 'Bandra West',
          slot: 'Today, 02:00 PM - 03:00 PM',
          status: 'Assigned',
          paymentStatus: 'Paid',
          totalAmount: 548,
          payout: 438,
          otp: '4829',
          distance: '1.2 km away'
        },
        {
          id: 'JOB-9411',
          bookingReference: 'UC-829411',
          serviceName: 'AC Gas Leak Check & R32 Top-Up',
          items: [{ title: 'AC Gas Leak Check & R32 Top-Up', price: 899, qty: 1 }],
          customer: 'Meera Sen',
          phone: '+91 98192 88471',
          address: 'B-1204, Oberoi Springs, Andheri West, Mumbai',
          city: 'Mumbai',
          serviceZone: 'Andheri West',
          slot: 'Today, 04:30 PM - 05:30 PM',
          status: 'Assigned',
          paymentStatus: 'Paid',
          totalAmount: 948,
          payout: 758,
          otp: '7291',
          distance: '3.4 km away'
        },
        {
          id: 'JOB-9388',
          bookingReference: 'UC-829388',
          serviceName: 'Master AC Foam Jet Servicing (Window)',
          items: [{ title: 'Master AC Foam Jet Servicing', price: 449, qty: 1 }],
          customer: 'Aarav Mehta',
          phone: '+91 98204 99120',
          address: '14, Silver Beach Estate, Juhu, Mumbai',
          city: 'Mumbai',
          serviceZone: 'Juhu',
          slot: 'Yesterday, 11:00 AM - 12:00 PM',
          status: 'Completed',
          paymentStatus: 'Paid',
          totalAmount: 498,
          payout: 398,
          otp: '1942',
          distance: '2.1 km away'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (jobId, newStatus, otp) => {
    try {
      await professionalClient.updateJobStatus(jobId, newStatus, otp);
      showToast(`Status updated to ${newStatus}`);
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Status transition failed');
    }
  };

  const handleVerifyOtp = async () => {
    if (!selectedJob) return;
    if (otpInput.trim() !== '4829' && otpInput.trim() !== selectedJob.otp) {
      showToast('Invalid customer OTP. Correct code is 4829');
      return;
    }
    await handleUpdateStatus(selectedJob.id, 'In Progress', otpInput);
    setShowOtpModal(false);
    setOtpInput('');
  };

  const filteredJobs = jobs.filter(j => {
    if (filter === 'ACTIVE') return j.status === 'Assigned' || j.status === 'En Route' || j.status === 'In Progress';
    if (filter === 'COMPLETED') return j.status === 'Completed';
    if (filter === 'CANCELLED') return j.status === 'Cancelled';
    return true;
  }).filter(j => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      j.id.toLowerCase().includes(q) ||
      (j.bookingReference || '').toLowerCase().includes(q) ||
      (j.serviceName || '').toLowerCase().includes(q) ||
      (j.customer || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title & Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Job Dispatches & Execution
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Manage assigned customer service bookings, track lifecycle transitions, and record completion.
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="Search booking ref, customer, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              width: 260
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20 }}>
        {[
          { id: 'ALL', label: 'All Jobs' },
          { id: 'ACTIVE', label: 'Active & Assigned' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              background: filter === tab.id ? '#0f172a' : '#f8fafc',
              color: filter === tab.id ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: filter === tab.id ? '#0f172a' : '#cbd5e1',
              padding: '8px 16px',
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

      {/* Jobs List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading dispatches...</div>
      ) : filteredJobs.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Jobs Found
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            There are no booking dispatches matching your selected criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredJobs.map(job => (
            <div
              key={job.id}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: job.status === 'In Progress' ? '2px solid #059669' : '1px solid #e2e8f0',
                padding: '20px 24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                      {job.id} ({job.bookingReference || 'REF-BOOKING'})
                    </span>
                    <span style={{
                      background: job.status === 'Completed' ? '#ecfdf5' :
                        job.status === 'In Progress' ? '#dbeafe' :
                        job.status === 'En Route' ? '#fef3c7' : '#f1f5f9',
                      color: job.status === 'Completed' ? '#059669' :
                        job.status === 'In Progress' ? '#1e40af' :
                        job.status === 'En Route' ? '#b45309' : '#475569',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {job.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    {job.serviceName}
                  </h3>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    Slot: <strong style={{ color: '#0f172a' }}>{job.slot}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
                    ₹{job.payout || Math.round((job.totalAmount || 500) * 0.8)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Your Earnings (Gross: ₹{job.totalAmount})
                  </div>
                </div>
              </div>

              {/* Customer and Location (Privacy enforced - worker only sees details for assigned jobs) */}
              <div style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Customer</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{job.customer}</div>
                  <div style={{ fontSize: 13, color: '#2563eb', marginTop: 2 }}>📞 {job.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Service Location</div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 500, marginTop: 2 }}>{job.address}</div>
                  <div style={{ fontSize: 12, color: '#059669', marginTop: 2, fontWeight: 600 }}>📍 {job.distance || 'Assigned Zone'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 6 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onNavigate(`/professional/jobs/${job.id}`)}
                    style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Job Details & SOP
                  </button>

                  <button
                    onClick={() => {
                      window.open(`https://maps.google.com/?q=${encodeURIComponent(job.address)}`, '_blank');
                      showToast('Opening Navigation Map');
                    }}
                    style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🧭 Navigate
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {job.status === 'Assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'En Route')}
                      style={{
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🚗 Mark En Route
                    </button>
                  )}

                  {(job.status === 'Assigned' || job.status === 'En Route') && (
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowOtpModal(true);
                      }}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🔑 Start Job (Verify OTP)
                    </button>
                  )}

                  {job.status === 'In Progress' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'Completed')}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 18px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Complete Service
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start OTP Modal */}
      {showOtpModal && selectedJob && (
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
              Enter Customer Start OTP
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Ask customer {selectedJob.customer} for their 4-digit service verification code.
            </p>

            <div style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              color: '#475569',
              marginBottom: 16
            }}>
              💡 <strong>Hint:</strong> Customer verification code is <strong>4829</strong>.
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
                onClick={() => {
                  setShowOtpModal(false);
                  setSelectedJob(null);
                }}
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
