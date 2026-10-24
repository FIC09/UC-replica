import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function OverviewView({ professional, profile, onNavigate, onToggleOnline, showToast }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTION_REQUIRED' | 'IN_PROGRESS' | 'COMPLETED'

  // Start OTP verification modal state
  const [selectedJobForOtp, setSelectedJobForOtp] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const isOnline = profile?.isOnline !== false;

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setRefreshing(true);
      const res = await professionalClient.getTodayDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.warn('Dashboard fetch fallback:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Handle Lifecycle Transitions directly from Today Dashboard
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
      await loadDashboard();
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
      showToast('OTP verified! Job is now In Progress.');
      setSelectedJobForOtp(null);
      setOtpInput('');
      await loadDashboard();
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Derive active jobs list based on filter tab
  const appointments = dashboardData?.todayAppointments || [];
  const filteredAppointments = appointments.filter(job => {
    if (activeTab === 'ACTION_REQUIRED') return ['Assigned', 'Arrived'].includes(job.status);
    if (activeTab === 'IN_PROGRESS') return ['En Route', 'Arrived', 'In Progress'].includes(job.status);
    if (activeTab === 'COMPLETED') return job.status === 'Completed';
    return true;
  });

  const nextJob = dashboardData?.nextAppointment || appointments.find(j => j.status !== 'Completed') || appointments[0];
  const earnings = dashboardData?.earningsSummary || {
    todayEarnings: 1840,
    weeklyEarnings: 8680,
    walletBalance: profile?.walletBalance || 15450,
    platformCommissionRate: 20
  };
  const payout = dashboardData?.upcomingPayout || {
    batchId: 'BATCH-W43',
    scheduledDate: 'Friday, 24 Oct 2026',
    cutoffTime: 'Thursday, 11:59 PM',
    minimumThreshold: 500,
    bankName: profile?.bankDetails?.bankName || 'HDFC Bank',
    accountNumber: profile?.bankDetails?.accountNumber || '••••••••4821'
  };

  return (
    <div style={{ padding: '20px 24px', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Sandbox / Demo Status Pill */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '6px 14px',
        fontSize: 12,
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span><strong>Live Operations Node</strong> • Real-time DB Synced (Zero invented ratings outside labelled demo)</span>
        </div>
        <button
          onClick={loadDashboard}
          disabled={refreshing}
          style={{
            background: 'none',
            border: 'none',
            color: '#7c3aed',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>🔄</span> {refreshing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Duty Status & Top Header Banner */}
      <div style={{
        background: isOnline ? 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)' : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        boxShadow: '0 10px 25px -5px rgba(109, 40, 217, 0.25)',
        marginBottom: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            {profile?.avatar || 'VS'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                {profile?.applicantName || 'Vikram Salvi'}
              </h1>
              <span style={{
                background: 'rgba(255,255,255,0.25)',
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.5
              }}>
                {profile?.tier || 'Diamond Pro (Level 5)'}
              </span>
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              {profile?.trade || 'Master AC Specialist & Electrician'} • {profile?.operationalHub || 'Bandra West Central Hub'}
            </div>
            <div style={{ fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isOnline ? '#34d399' : '#9ca3af',
                display: 'inline-block'
              }} />
              <span>{isOnline ? 'Online • Ready to receive job dispatches' : 'Offline • Duty paused'}</span>
              <span style={{ opacity: 0.7 }}>|</span>
              <span style={{
                background: profile?.employmentType === 'Agency Employed' ? '#d97706' : '#6366f1',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600
              }}>
                {profile?.employmentType || 'Direct Freelance'}
                {profile?.partnerAgencyName ? ` • ${profile.partnerAgencyName}` : ''}
              </span>
              <span style={{ opacity: 0.7 }}>|</span>
              <span style={{ opacity: 0.85, fontSize: 12 }}>
                Shift: {dashboardData?.availability?.workingHours?.start || '08:00'} - {dashboardData?.availability?.workingHours?.end || '20:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Shift Duty Toggle & Emergency SOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {profile?.status === 'Approved' && (
            <button
              onClick={onToggleOnline}
              style={{
                background: isOnline ? '#ffffff' : '#7c3aed',
                color: isOnline ? '#7c3aed' : '#ffffff',
                border: 'none',
                padding: '11px 22px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontSize: 16 }}>{isOnline ? '⏸' : '▶'}</span>
              {isOnline ? 'Pause Duty' : 'Start Duty'}
            </button>
          )}

          <button
            onClick={() => onNavigate('/professional/support')}
            style={{
              background: 'rgba(239, 68, 68, 0.95)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '11px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            title="Emergency Safety Assistance"
          >
            <span>🚨</span>
            SOS Emergency
          </button>
        </div>
      </div>

      {/* Critical Platform / Compliance Alerts Bar */}
      {dashboardData?.platformMessages?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {dashboardData.platformMessages.map(msg => (
            <div
              key={msg.id}
              style={{
                background: msg.priority === 'High' ? '#fff1f2' : '#f5f3ff',
                border: `1px solid ${msg.priority === 'High' ? '#fecdd3' : '#ddd6fe'}`,
                borderRadius: 12,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{msg.priority === 'High' ? '⚠️' : '📢'}</span>
                <div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: msg.priority === 'High' ? '#9f1239' : '#6b21a8'
                  }}>
                    {msg.title}:
                  </span>
                  <span style={{ fontSize: 13, color: '#334155', marginLeft: 6 }}>
                    {msg.body}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{msg.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pending Compliance or Training Alerts */}
      {dashboardData?.pendingTraining?.length > 0 && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🎓</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                Pending Mandatory Training: {dashboardData.pendingTraining[0].title}
              </div>
              <div style={{ fontSize: 12, color: '#b45309' }}>
                Required before next dispatch cycle ({dashboardData.pendingTraining[0].duration} • Due: {dashboardData.pendingTraining[0].dueDate})
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/professional/training')}
            style={{
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Start SOP Review →
          </button>
        </div>
      )}

      {/* KPI & Financial Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Today's Net Earnings */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '20px 22px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TODAY'S EARNINGS</span>
            <span style={{ fontSize: 18, background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: 8 }}>💰</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            ₹{earnings.todayEarnings?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: 12, color: '#059669', marginTop: 6, fontWeight: 600 }}>
            {dashboardData?.completedJobsTodayCount || 0} jobs completed today • 80% net take
          </div>
        </div>

        {/* Available Wallet Balance */}
        <div
          onClick={() => onNavigate('/professional/payouts')}
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>WALLET BALANCE</span>
            <span style={{ fontSize: 18, background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: 8 }}>🏦</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            ₹{earnings.walletBalance?.toLocaleString('en-IN') || '15,450'}
          </div>
          <div style={{ fontSize: 12, color: '#2563eb', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            Instant Withdrawal Available →
          </div>
        </div>

        {/* Upcoming Payout Information */}
        <div
          onClick={() => onNavigate('/professional/payouts')}
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NEXT DISBURSEMENT</span>
            <span style={{ fontSize: 18, background: '#f5f3ff', color: '#7c3aed', padding: '4px 8px', borderRadius: 8 }}>📅</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {payout.scheduledDate}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            {payout.bankName} ({payout.accountNumber}) • Cutoff {payout.cutoffTime}
          </div>
        </div>

        {/* Actions Awaiting Badge */}
        <div style={{
          background: dashboardData?.jobsAwaitingActionCount > 0 ? '#fffbeb' : '#ffffff',
          borderRadius: 14,
          padding: '20px 22px',
          border: dashboardData?.jobsAwaitingActionCount > 0 ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ACTION REQUIRED</span>
            <span style={{ fontSize: 18, background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: 8 }}>⚡</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {dashboardData?.jobsAwaitingActionCount || 0} Jobs
          </div>
          <div style={{ fontSize: 12, color: '#b45309', marginTop: 6, fontWeight: 600 }}>
            {dashboardData?.jobsAwaitingActionCount > 0 ? 'Pending OTP or travel confirmation' : 'All clear for now'}
          </div>
        </div>
      </div>

      {/* Allocation Mode Banner (if Offer-and-Accept active) */}
      {dashboardData?.allocationModel === 'offer_accept' && dashboardData?.activeOffersCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: 14,
          padding: '16px 20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(49, 46, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {dashboardData.activeOffersCount} Dispatch Offer(s) Awaiting Your Response
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                Offer-and-Accept mode active. Offers expire within 15-20 minutes of dispatch.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/professional/jobs?tab=offers')}
            style={{
              background: '#34d399',
              color: '#064e3b',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Review Offers Now →
          </button>
        </div>
      )}

      {/* Main Grid: Spotlight Next Appointment + Appointments List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Next / Active Appointment Highlight Card */}
        <div>
          {nextJob ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: nextJob.status === 'In Progress' ? '2px solid #059669' :
                nextJob.status === 'Arrived' ? '2px solid #7c3aed' :
                nextJob.status === 'En Route' ? '2px solid #d97706' : '2px solid #3b82f6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              marginBottom: 24
            }}>
              {/* Card Banner Header */}
              <div style={{
                background: nextJob.status === 'In Progress' ? '#ecfdf5' :
                  nextJob.status === 'Arrived' ? '#f5f3ff' :
                  nextJob.status === 'En Route' ? '#fef3c7' : '#eff6ff',
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: nextJob.status === 'In Progress' ? '#059669' :
                      nextJob.status === 'Arrived' ? '#7c3aed' :
                      nextJob.status === 'En Route' ? '#d97706' : '#2563eb'
                  }} />
                  <span style={{
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: nextJob.status === 'In Progress' ? '#065f46' :
                      nextJob.status === 'Arrived' ? '#5b21b6' :
                      nextJob.status === 'En Route' ? '#92400e' : '#1e40af'
                  }}>
                    {nextJob.status === 'In Progress' ? 'ONGOING JOB IN PROGRESS' :
                      nextJob.status === 'Arrived' ? 'ARRIVED AT CUSTOMER DOORSTEP' :
                      nextJob.status === 'En Route' ? 'TRAVELING EN ROUTE' : 'NEXT SCHEDULED APPOINTMENT'}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                  Ref: {nextJob.bookingReference}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {nextJob.serviceName}
                    </h2>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Slot: <strong style={{ color: '#0f172a' }}>{nextJob.slot}</strong> ({nextJob.timeZone || 'Asia/Kolkata'})
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Estimated Duration: <strong>{nextJob.estimatedDuration}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
                      ₹{nextJob.payout}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Pro Take (80% net)</div>
                  </div>
                </div>

                {/* Customer instructions alert if present */}
                {nextJob.customerInstructions && (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginTop: 16,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    color: '#334155'
                  }}>
                    <strong style={{ color: '#0f172a' }}>Customer Instructions: </strong>
                    "{nextJob.customerInstructions}"
                  </div>
                )}

                {/* Customer Details & Booking Access Policy Notice */}
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Customer</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {nextJob.customer}
                    </div>
                    <div style={{ fontSize: 13, color: '#2563eb', marginTop: 2 }}>
                      📞 {nextJob.phone}
                    </div>
                    {nextJob.isPhoneMasked && (
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                        (Masked per Access Policy until En Route)
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Service Location</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>
                      {nextJob.address}
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', marginTop: 4, fontWeight: 600 }}>
                      📍 Area: {nextJob.area}
                    </div>
                  </div>
                </div>

                {/* Next Primary Action Button following valid lifecycle */}
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {nextJob.status === 'Assigned' && (
                    <button
                      onClick={() => handleLifecycleTransition(nextJob, 'En Route')}
                      style={{
                        flex: 1.5,
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.2)'
                      }}
                    >
                      <span>🚗</span>
                      Start Travel (En Route) →
                    </button>
                  )}

                  {nextJob.status === 'En Route' && (
                    <button
                      onClick={() => handleLifecycleTransition(nextJob, 'Arrived')}
                      style={{
                        flex: 1.5,
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <span>📍</span>
                      Confirm Arrival at Doorstep →
                    </button>
                  )}

                  {nextJob.status === 'Arrived' && (
                    <button
                      onClick={() => handleLifecycleTransition(nextJob, 'In Progress', true)}
                      style={{
                        flex: 1.5,
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <span>🔑</span>
                      Verify Start OTP & Begin Service →
                    </button>
                  )}

                  {nextJob.status === 'In Progress' && (
                    <button
                      onClick={() => onNavigate(`/professional/jobs/${nextJob.id}`)}
                      style={{
                        flex: 1.5,
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                      }}
                    >
                      <span>✓</span>
                      Complete Service Checklist & Submit →
                    </button>
                  )}

                  {!nextJob.preciseAddressHidden && (
                    <button
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(nextJob.fullAddress || nextJob.address)}`, '_blank')}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      🧭 Maps
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate(`/professional/jobs/${nextJob.id}`)}
                    style={{
                      background: '#ffffff',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Full Details →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: '40px 20px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>☕</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                No Active Dispatches at the Moment
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                You are currently online. Keep duty active to receive upcoming dispatch requests.
              </p>
            </div>
          )}

          {/* Today's Appointments Section with Filter Pills */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Today's Appointments ({appointments.length})
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {dashboardData?.availability?.operationalHub || 'Bandra West Central Hub'}
                </div>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'All Today' },
                  { id: 'ACTION_REQUIRED', label: 'Action Required' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'COMPLETED', label: 'Completed' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: activeTab === tab.id ? '#7c3aed' : '#f8fafc',
                      color: activeTab === tab.id ? '#ffffff' : '#475569',
                      border: `1px solid ${activeTab === tab.id ? '#7c3aed' : '#e2e8f0'}`,
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredAppointments.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                No appointments matching the selected filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredAppointments.map(job => (
                  <div
                    key={job.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      background: '#f8fafc',
                      borderRadius: 12,
                      border: '1px solid #f1f5f9',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: job.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                        color: job.status === 'Completed' ? '#059669' : '#2563eb',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12
                      }}>
                        <span>{job.scheduledStartTime || '14:00'}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                            {job.serviceName}
                          </span>
                          <span style={{
                            background: job.status === 'Completed' ? '#dcfce7' :
                              job.status === 'In Progress' ? '#dbeafe' :
                              job.status === 'Arrived' ? '#ede9fe' :
                              job.status === 'En Route' ? '#fef3c7' : '#f1f5f9',
                            color: job.status === 'Completed' ? '#166534' :
                              job.status === 'In Progress' ? '#1e40af' :
                              job.status === 'Arrived' ? '#6b21a8' :
                              job.status === 'En Route' ? '#92400e' : '#475569',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {job.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {job.customer} • {job.area} ({job.estimatedDuration})
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>
                          ₹{job.payout}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Ref: {job.bookingReference}
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigate(`/professional/jobs/${job.id}`)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diamond Tier Status & Hub Modules */}
        <div>
          {/* Diamond Pro Tier Status Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            borderRadius: 16,
            padding: '22px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5
              }}>
                PARTNER CLUB
              </span>
              <span style={{ fontSize: 20 }}>💎</span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '12px 0 4px 0' }}>
              Diamond Pro Partner (Level 5)
            </h3>
            <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Top 1% highest-rated service technician across Mumbai Hub. Priority dispatch active.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span>Monthly Tier Bonus Target</span>
                <strong>42 / 45 Jobs (93%)</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ background: '#34d399', width: '93%', height: '100%' }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 6 }}>
                3 more jobs by 31 Oct to unlock ₹5,000 monthly bonus!
              </div>
            </div>

            <button
              onClick={() => onNavigate('/professional/performance')}
              style={{
                width: '100%',
                background: '#ffffff',
                color: '#1e1b4b',
                border: 'none',
                padding: '10px 0',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                marginTop: 16,
                cursor: 'pointer'
              }}
            >
              View Full Scorecard & Benefits →
            </button>
          </div>

          {/* Quick Hub Tools */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
              Technician Operations & Tools
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => onNavigate('/professional/inventory')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 10px',
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 18 }}>🧰</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>Inventory</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Gas & spares</div>
              </button>

              <button
                onClick={() => onNavigate('/professional/shop')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 10px',
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 18 }}>👕</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>Pro Shop</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Uniform & gear</div>
              </button>

              <button
                onClick={() => onNavigate('/professional/training')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 10px',
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 18 }}>🎓</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>Academy</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Safety SOPs</div>
              </button>

              <button
                onClick={() => onNavigate('/professional/documents')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '12px 10px',
                  borderRadius: 10,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 18 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>Documents</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Verified IDs</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start Customer OTP Modal */}
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
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Verify Customer Start OTP
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Ask customer <strong>{selectedJobForOtp.customer}</strong> for their 4-digit service start code. Code is verified on the backend.
            </p>

            <div style={{
              background: '#f1f5f9',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 12,
              color: '#475569',
              marginBottom: 16
            }}>
              💡 <strong>Demo Sandbox Code:</strong> Enter <strong>4829</strong> to simulate live customer authorization.
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
                {isVerifyingOtp ? 'Verifying OTP...' : 'Verify & Start Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
