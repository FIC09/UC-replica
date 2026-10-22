import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function JobsView({ onNavigate, showToast }) {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'action_required' | 'in_progress' | 'completed' | 'cancelled' | 'offers'
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [jobs, setJobs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // OTP Verification Modal
  const [selectedJobForOtp, setSelectedJobForOtp] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Decline Offer Modal
  const [declineOfferModal, setDeclineOfferModal] = useState(null);
  const [declineReason, setDeclineReason] = useState('schedule_conflict');
  const [isDeclining, setIsDeclining] = useState(false);

  useEffect(() => {
    // If URL has ?tab=offers, preselect offers tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'offers') {
      setActiveTab('offers');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, serviceFilter]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'offers') {
        const res = await professionalClient.getJobOffers();
        if (res.success && res.offers) {
          setOffers(res.offers);
        }
      } else {
        const params = { tab: activeTab };
        if (serviceFilter !== 'ALL') params.service = serviceFilter;
        const res = await professionalClient.getJobs(params);
        if (res.success && res.jobs) {
          setJobs(res.jobs);
        }
      }
    } catch (err) {
      console.warn('Load jobs error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Lifecycle Transitions
  const handleLifecycleTransition = async (job, targetStatus, requiresOtp = false) => {
    if (requiresOtp || targetStatus === 'In Progress') {
      setSelectedJobForOtp(job);
      setOtpInput('');
      setOtpError('');
      return;
    }

    try {
      await professionalClient.updateJobStatus(job.id, targetStatus);
      showToast(`Status updated to "${targetStatus}"`);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Status transition failed');
    }
  };

  const handleVerifyStartOtp = async () => {
    if (!selectedJobForOtp) return;
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError('Please enter the 4-digit code provided by the customer.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      await professionalClient.updateJobStatus(selectedJobForOtp.id, 'In Progress', otpInput.trim());
      showToast('Start OTP verified! Job is now In Progress.');
      setSelectedJobForOtp(null);
      setOtpInput('');
      await loadData();
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Offer Accept / Decline
  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await professionalClient.acceptJobOffer(offerId);
      if (res.success) {
        showToast(res.message || 'Offer accepted! Job added to your schedule.');
        setActiveTab('upcoming');
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept offer.');
      loadData();
    }
  };

  const handleConfirmDeclineOffer = async () => {
    if (!declineOfferModal) return;
    setIsDeclining(true);
    try {
      await professionalClient.declineJobOffer(declineOfferModal.id, declineReason);
      showToast('Offer declined.');
      setDeclineOfferModal(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to decline offer.');
    } finally {
      setIsDeclining(false);
    }
  };

  // Client search filtering
  const filteredJobs = jobs.filter(j => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (j.id && j.id.toLowerCase().includes(q)) ||
      (j.bookingReference && j.bookingReference.toLowerCase().includes(q)) ||
      (j.serviceName && j.serviceName.toLowerCase().includes(q)) ||
      (j.customer && j.customer.toLowerCase().includes(q)) ||
      (j.area && j.area.toLowerCase().includes(q))
    );
  });

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Title & Search Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Job Dispatches & Execution Hub
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            View assigned appointments, manage service workflows, and respond to dispatch offers.
          </div>
        </div>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="text"
            placeholder="Search booking ref, customer, area..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              width: 280,
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Primary Lifecycle Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 12,
        marginBottom: 20
      }}>
        {[
          { id: 'upcoming', label: 'Upcoming', badge: null },
          { id: 'action_required', label: 'Action Required', badge: null },
          { id: 'in_progress', label: 'In Progress', badge: null },
          { id: 'completed', label: 'Completed', badge: null },
          { id: 'cancelled', label: 'Cancelled', badge: null },
          { id: 'offers', label: '⚡ Dispatch Offers', badge: 'Active' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            style={{
              background: activeTab === tab.id ? '#7c3aed' : '#f8fafc',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              border: `1px solid ${activeTab === tab.id ? '#7c3aed' : '#cbd5e1'}`,
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span style={{
                background: activeTab === tab.id ? '#ffffff' : '#7c3aed',
                color: activeTab === tab.id ? '#7c3aed' : '#ffffff',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 10,
                fontWeight: 800
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Service Category & Date Filter Row (for jobs tabs) */}
      {activeTab !== 'offers' && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          background: '#f8fafc',
          padding: '10px 16px',
          borderRadius: 10,
          border: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Filter by Service:
          </span>
          {['ALL', 'AC Repair', 'Electrical', 'Deep Cleaning', 'Plumbing', 'Salon for Women'].map(svc => (
            <button
              key={svc}
              onClick={() => {
                setServiceFilter(svc);
                setCurrentPage(1);
              }}
              style={{
                background: serviceFilter === svc ? '#0f172a' : '#ffffff',
                color: serviceFilter === svc ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {svc}
            </button>
          ))}
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          Loading dispatches and appointments...
        </div>
      ) : activeTab === 'offers' ? (
        /* OFFER-AND-ACCEPT DISPATCH OFFERS VIEW */
        <div>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 20,
            fontSize: 13,
            color: '#1e40af'
          }}>
            ℹ️ <strong>Offer-and-Accept Dispatch Model:</strong> Jobs are dispatched as tentative offers. Accept within the countdown window to confirm booking into your schedule.
          </div>

          {offers.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '60px 20px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                No Active Dispatch Offers
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Stay online with active shift duty to receive the next available customer booking offer.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {offers.map(offer => (
                <div
                  key={offer.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 14,
                    border: '1.5px solid #cbd5e1',
                    padding: '20px 24px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                          Offer Ref: {offer.id} ({offer.bookingReference})
                        </span>
                        <span style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          ⏳ Expires in ~{Math.ceil((offer.remainingSeconds || 600) / 60)} mins
                        </span>
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '6px 0 4px 0' }}>
                        {offer.serviceName}
                      </h3>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        Slot: <strong style={{ color: '#0f172a' }}>{offer.slot}</strong> ({offer.estimatedDuration})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
                        ₹{offer.payout}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Technician Payout (Gross ₹{offer.totalAmount})
                      </div>
                    </div>
                  </div>

                  {offer.customerInstructions && (
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: 8,
                      padding: '10px 14px',
                      marginTop: 14,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                      color: '#334155'
                    }}>
                      <strong>Customer Notes:</strong> "{offer.customerInstructions}"
                    </div>
                  )}

                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ fontSize: 13, color: '#475569' }}>
                      📍 <strong>Area:</strong> {offer.area} (Exact house address revealed upon acceptance)
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => setDeclineOfferModal(offer)}
                        style={{
                          background: '#ffffff',
                          color: '#dc2626',
                          border: '1px solid #fca5a5',
                          padding: '9px 18px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Decline with Reason
                      </button>

                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        style={{
                          background: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 22px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.2)'
                        }}
                      >
                        ✓ Accept Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : paginatedJobs.length === 0 ? (
        /* EMPTY STATE */
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
            There are no booking dispatches under the "{activeTab.replace('_', ' ')}" tab.
          </p>
        </div>
      ) : (
        /* REGULAR JOB LIST */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {paginatedJobs.map(job => (
            <div
              key={job.id}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: job.status === 'In Progress' ? '2px solid #059669' :
                  job.status === 'Arrived' ? '2px solid #7c3aed' :
                  job.status === 'En Route' ? '2px solid #d97706' : '1px solid #e2e8f0',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                      Ref: {job.bookingReference}
                    </span>
                    <span style={{
                      background: job.status === 'Completed' ? '#ecfdf5' :
                        job.status === 'In Progress' ? '#dbeafe' :
                        job.status === 'Arrived' ? '#ede9fe' :
                        job.status === 'En Route' ? '#fef3c7' : '#f1f5f9',
                      color: job.status === 'Completed' ? '#059669' :
                        job.status === 'In Progress' ? '#1e40af' :
                        job.status === 'Arrived' ? '#6b21a8' :
                        job.status === 'En Route' ? '#92400e' : '#475569',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {job.status}
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      {job.serviceCategory}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '6px 0 4px 0' }}>
                    {job.serviceName}
                  </h3>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    Slot: <strong style={{ color: '#0f172a' }}>{job.slot}</strong> ({job.timeZone || 'Asia/Kolkata (IST)'})
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Est Duration: <strong>{job.estimatedDuration}</strong>
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

              {/* Customer instructions if present */}
              {job.customerInstructions && (
                <div style={{
                  background: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#334155',
                  border: '1px solid #e2e8f0'
                }}>
                  <strong>Customer Instructions:</strong> "{job.customerInstructions}"
                </div>
              )}

              {/* Customer & Location (Booking Access Policy: phone & full address masked unless en route) */}
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
                  {job.isPhoneMasked && (
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      (Masked per Access Policy until En Route)
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Service Location</div>
                  <div style={{ fontSize: 13, color: '#334155', fontWeight: 500, marginTop: 2 }}>{job.address}</div>
                  <div style={{ fontSize: 12, color: '#059669', marginTop: 2, fontWeight: 600 }}>📍 Area: {job.area}</div>
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
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
                    View Job Detail & SOP →
                  </button>

                  {!job.preciseAddressHidden && (
                    <button
                      onClick={() => {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(job.fullAddress || job.address)}`, '_blank');
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
                      🧭 Maps
                    </button>
                  )}
                </div>

                {/* Primary Next Action following valid lifecycle */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {job.status === 'Assigned' && (
                    <button
                      onClick={() => handleLifecycleTransition(job, 'En Route')}
                      style={{
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🚗 Start Travel (En Route)
                    </button>
                  )}

                  {job.status === 'En Route' && (
                    <button
                      onClick={() => handleLifecycleTransition(job, 'Arrived')}
                      style={{
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      📍 Confirm Arrival at Doorstep
                    </button>
                  )}

                  {job.status === 'Arrived' && (
                    <button
                      onClick={() => handleLifecycleTransition(job, 'In Progress', true)}
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
                      🔑 Verify OTP & Begin Service
                    </button>
                  )}

                  {job.status === 'In Progress' && (
                    <button
                      onClick={() => onNavigate(`/professional/jobs/${job.id}`)}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '9px 20px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Complete Checklist & Finalize
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customer Start OTP Verification Modal */}
      {selectedJobForOtp && (
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
              Ask customer {selectedJobForOtp.customer} for their 4-digit service verification code.
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
                  setSelectedJobForOtp(null);
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
                onClick={handleVerifyStartOtp}
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

      {/* Decline Offer Modal */}
      {declineOfferModal && (
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
              Decline Dispatch Offer
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Please select a policy reason to decline this service offer ({declineOfferModal.id}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { key: 'schedule_conflict', label: 'Existing schedule conflict / slot overlap' },
                { key: 'outside_preferred_zone', label: 'Service location outside preferred operating zone' },
                { key: 'vehicle_breakdown', label: 'Vehicle transit or equipment malfunction' },
                { key: 'emergency_unavailability', label: 'Emergency medical or family unavailability' }
              ].map(opt => (
                <label
                  key={opt.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: declineReason === opt.key ? '#faf5ff' : '#f8fafc',
                    border: `1px solid ${declineReason === opt.key ? '#c084fc' : '#e2e8f0'}`,
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#1e293b'
                  }}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    checked={declineReason === opt.key}
                    onChange={() => setDeclineReason(opt.key)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeclineOfferModal(null)}
                disabled={isDeclining}
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
                Back
              </button>
              <button
                onClick={handleConfirmDeclineOffer}
                disabled={isDeclining}
                style={{
                  flex: 1.5,
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isDeclining ? 'Submitting...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
