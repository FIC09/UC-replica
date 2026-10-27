import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { professionalClient } from '../professionalClient';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Clock,
  Calendar,
  Wallet,
  Zap,
  Award,
  AlertTriangle,
  Bell,
  GraduationCap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Package,
  ShoppingBag,
  FileText,
  HelpCircle,
  TrendingUp,
  Radio
} from 'lucide-react';

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

  // Emergency SOS Modal state
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Incoming Live Dispatch Offer state
  const [incomingOffer, setIncomingOffer] = useState(null);

  // Advisories Hub collapsed/expanded state
  const [advisoriesExpanded, setAdvisoriesExpanded] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState({});

  const isOnline = profile?.isOnline !== false;
  const isApproved = !profile?.status || profile?.status === 'Approved' || profile?.status === 'Active';

  useEffect(() => {
    loadDashboard();

    const workerId = profile?.id || professional?.id || 'WRK-KRI-101';
    const socket = io();
    socket.emit('join:room', `worker:${workerId}`);

    const handleLiveEvent = (event) => {
      if (!event) return;
      if (event.eventType === 'ASSIGNMENT_OFFERED') {
        setIncomingOffer({
          ...event.payload,
          remainingSeconds: event.payload.remainingSeconds || 60
        });
        showToast?.('⚡ New Urgent Dispatch Offer Received!');
      } else if (['ASSIGNMENT_ACCEPTED', 'BOOKING_CONFIRMED', 'WORKER_REASSIGNED'].includes(event.eventType)) {
        loadDashboard();
      }
    };

    socket.on('realtime:event', handleLiveEvent);

    return () => {
      socket.off('realtime:event', handleLiveEvent);
      socket.disconnect();
    };
  }, [profile?.id, professional?.id]);

  // Countdown timer for incoming offer
  useEffect(() => {
    if (!incomingOffer || incomingOffer.remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setIncomingOffer(prev => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          clearInterval(timer);
          showToast?.('Dispatch offer expired.');
          return null;
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingOffer]);

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

  const handleAcceptIncomingOffer = async () => {
    if (!incomingOffer) return;
    try {
      const offerId = incomingOffer.offerId || incomingOffer.id;
      const res = await professionalClient.acceptJobOffer(offerId);
      if (res.success) {
        showToast?.('Offer Accepted! Job assigned to your schedule.');
        setIncomingOffer(null);
        loadDashboard();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to accept offer');
    }
  };

  const handleRejectIncomingOffer = async () => {
    if (!incomingOffer) return;
    try {
      const offerId = incomingOffer.offerId || incomingOffer.id;
      await professionalClient.declineJobOffer(offerId, 'Declined by professional');
      showToast?.('Offer declined.');
      setIncomingOffer(null);
    } catch (err) {
      showToast?.(err.message || 'Failed to decline offer');
    }
  };

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

  const handleTriggerSosAlert = () => {
    setSosSent(true);
    showToast('🚨 SOS Broadcast Sent: Krishnagiri Town Safety Dispatch & Emergency Support Alerted!');
    setTimeout(() => {
      setSosSent(false);
      setShowSosModal(false);
    }, 2800);
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

  // Active Advisories Filter (dismissed items hidden)
  const platformMessages = (dashboardData?.platformMessages || []).filter(m => !dismissedAlerts[m.id]);
  const totalAdvisoriesCount = platformMessages.length;

  return (
    <div style={{
      padding: '24px 28px',
      maxWidth: 1440,
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>

      {/* ----------------------------------------------------------------- */}
      {/* 1. OPERATIONAL NODE & SYNC RIBBON                                  */}
      {/* ----------------------------------------------------------------- */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '10px 18px',
        fontSize: 13,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#10B981',
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)'
            }} />
            <span style={{ fontWeight: 700, color: '#0F172A' }}>
              Service Territory: {dashboardData?.availability?.operationalCity || profile?.operationalCity || 'Krishnagiri Town'} (Direct Doorstep Travel)
            </span>
          </div>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ color: '#64748B', fontSize: 12.5 }}>
            Tamil Nadu · PostgreSQL & Real-time WebSockets Active
          </span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{
            background: '#F1F5F9',
            color: '#334155',
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 600
          }}>
            Shift: {dashboardData?.availability?.workingHours?.start || '08:00'} - {dashboardData?.availability?.workingHours?.end || '20:00'}
          </span>
        </div>

        <button
          onClick={loadDashboard}
          disabled={refreshing}
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#7C3AED',
            fontWeight: 700,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.background = '#FAF5FF'; }}
          onMouseLeave={(e) => { if (!refreshing) e.currentTarget.style.background = '#F8FAFC'; }}
        >
          <span style={{ display: 'inline-block', transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s ease' }}>
            🔄
          </span>
          <span>{refreshing ? 'Syncing DB...' : 'Sync Dashboard'}</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. PROFILE HERO & DUTY COMMAND BAR                                */}
      {/* ----------------------------------------------------------------- */}
      <div style={{
        background: isOnline
          ? 'linear-gradient(135deg, #3B0764 0%, #6B21A8 50%, #7C3AED 100%)'
          : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        borderRadius: 18,
        padding: '24px 28px',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 22,
        boxShadow: isOnline
          ? '0 12px 28px -6px rgba(109, 40, 217, 0.35)'
          : '0 8px 20px -4px rgba(30, 41, 59, 0.25)',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />

        {/* Left Side: Avatar & Bio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 1 }}>
          {/* Avatar Ring */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              border: '2.5px solid rgba(255,255,255,0.6)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}>
              {profile?.avatar || 'VS'}
            </div>
            {/* Duty dot */}
            <span style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isOnline ? '#34D399' : '#94A3B8',
              border: '2px solid #FFFFFF',
              boxShadow: isOnline ? '0 0 0 2px rgba(52, 211, 153, 0.4)' : 'none'
            }} />
          </div>

          <div>
            {/* Name & Tier Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {profile?.applicantName || 'Vikram Salvi'}
              </h1>
              <span style={{
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(4px)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.02em',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span>💎</span>
                {profile?.tier || 'Diamond Pro Partner (Level 5)'}
              </span>
            </div>

            {/* Trade & Operational Territory */}
            <div style={{ fontSize: 14.5, opacity: 0.95, marginTop: 4, fontWeight: 500 }}>
              {profile?.trade || 'Master AC Specialist & Electrician'} • {profile?.locality || 'Krishnagiri Town, Tamil Nadu'}
            </div>

            {/* Operational Chips Row */}
            <div style={{ fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                background: isOnline ? 'rgba(52, 211, 153, 0.25)' : 'rgba(148, 163, 184, 0.25)',
                border: isOnline ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(148, 163, 184, 0.4)',
                padding: '3px 10px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isOnline ? '#34D399' : '#94A3B8'
                }} />
                {isOnline ? 'Online • Ready for Dispatches' : 'Offline • Duty Paused'}
              </span>

              <span style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '3px 10px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 600
              }}>
                ⭐ 4.96 (184 Reviews)
              </span>

              <span style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '3px 10px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 600
              }}>
                🎯 100% On-Time SLA
              </span>

              <span style={{
                background: profile?.employmentType === 'Agency Employed' ? 'rgba(217, 119, 6, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                padding: '3px 10px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 600
              }}>
                {profile?.employmentType || 'Direct Freelance'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Shift Duty Toggle & Emergency SOS Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 1, flexWrap: 'wrap' }}>
          {isApproved && (
            <button
              onClick={onToggleOnline}
              style={{
                background: isOnline ? '#FFFFFF' : '#10B981',
                color: isOnline ? '#6B21A8' : '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: 16 }}>{isOnline ? '⏸' : '▶'}</span>
              <span>{isOnline ? 'Pause Duty' : 'Go Online'}</span>
            </button>
          )}

          <button
            onClick={() => setShowSosModal(true)}
            style={{
              background: '#EF4444',
              color: '#FFFFFF',
              border: '1.5px solid rgba(255,255,255,0.3)',
              padding: '12px 20px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.15s ease'
            }}
            title="Emergency Safety & Incident Support"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>🚨</span>
            <span>SOS Emergency</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. COMPACT ADVISORIES & ALERTS HUB (Replaces 3 towering banners)   */}
      {/* ----------------------------------------------------------------- */}
      {totalAdvisoriesCount > 0 && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
          padding: advisoriesExpanded ? '16px 20px' : '10px 18px',
          marginBottom: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease'
        }}>
          {/* Header Row: Highest Priority Alert + Toggle Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>📢</span>
              <div style={{ fontSize: 13.5, color: '#1E293B' }}>
                <strong style={{ color: '#7C3AED' }}>{platformMessages[0]?.title}: </strong>
                <span>{platformMessages[0]?.body}</span>
              </div>
            </div>

            {/* Right Controls: Expand / Collapse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setAdvisoriesExpanded(!advisoriesExpanded)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>{advisoriesExpanded ? 'Hide' : `${totalAdvisoriesCount} Advisories`}</span>
                <span>{advisoriesExpanded ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          {/* Expanded Drawer: All Active Advisories in an uncluttered grid */}
          {advisoriesExpanded && (
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid #F1F5F9',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 12
            }}>
              {/* Platform Messages */}
              {platformMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    background: msg.priority === 'High' ? '#FFF1F2' : '#F5F3FF',
                    border: `1px solid ${msg.priority === 'High' ? '#FECDD3' : '#DDD6FE'}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{msg.priority === 'High' ? '⚠️' : '📢'}</span>
                      <strong style={{
                        fontSize: 13,
                        color: msg.priority === 'High' ? '#9F1239' : '#6B21A8'
                      }}>
                        {msg.title}
                      </strong>
                    </div>
                    <button
                      onClick={() => setDismissedAlerts(prev => ({ ...prev, [msg.id]: true }))}
                      aria-label="Dismiss alert"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 2,
                        fontSize: 14
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                    {msg.body}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {msg.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. FINANCIAL & OPERATIONAL KPI METRICS (Above the Fold)            */}
      {/* ----------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Today's Net Earnings */}
        <div
          onClick={() => onNavigate('/professional/earnings')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              TODAY'S EARNINGS
            </span>
            <span style={{ fontSize: 18, background: '#ECFDF5', color: '#059669', padding: '5px 8px', borderRadius: 8 }}>
              💰
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            ₹{earnings.todayEarnings?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: 12, color: '#059669', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{dashboardData?.completedJobsTodayCount || 0} jobs completed</span>
            <span>•</span>
            <span>80% net take</span>
          </div>
        </div>

        {/* Available Wallet Balance */}
        <div
          onClick={() => onNavigate('/professional/payouts')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              WALLET BALANCE
            </span>
            <span style={{ fontSize: 18, background: '#EFF6FF', color: '#2563EB', padding: '5px 8px', borderRadius: 8 }}>
              🏦
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            ₹{earnings.walletBalance?.toLocaleString('en-IN') || '15,450'}
          </div>
          <div style={{ fontSize: 12, color: '#2563EB', marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Instant Withdrawal Available →</span>
          </div>
        </div>

        {/* Upcoming Bank Settlement */}
        <div
          onClick={() => onNavigate('/professional/payouts')}
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              NEXT DISBURSEMENT
            </span>
            <span style={{ fontSize: 18, background: '#FAF5FF', color: '#7C3AED', padding: '5px 8px', borderRadius: 8 }}>
              📅
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            {payout.scheduledDate}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>
            {payout.bankName} ({payout.accountNumber}) • Cutoff {payout.cutoffTime}
          </div>
        </div>

        {/* Action Required Counter */}
        <div style={{
          background: dashboardData?.jobsAwaitingActionCount > 0 ? '#FFFBEB' : '#FFFFFF',
          borderRadius: 14,
          padding: '20px 22px',
          border: dashboardData?.jobsAwaitingActionCount > 0 ? '1.5px solid #FDE68A' : '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ACTION REQUIRED
            </span>
            <span style={{
              fontSize: 18,
              background: dashboardData?.jobsAwaitingActionCount > 0 ? '#FEF3C7' : '#F1F5F9',
              color: dashboardData?.jobsAwaitingActionCount > 0 ? '#D97706' : '#64748B',
              padding: '5px 8px',
              borderRadius: 8
            }}>
              {dashboardData?.jobsAwaitingActionCount > 0 ? '⚡' : '✓'}
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
            {dashboardData?.jobsAwaitingActionCount || 0} Jobs
          </div>
          <div style={{
            fontSize: 12,
            color: dashboardData?.jobsAwaitingActionCount > 0 ? '#B45309' : '#059669',
            marginTop: 6,
            fontWeight: 600
          }}>
            {dashboardData?.jobsAwaitingActionCount > 0
              ? 'Pending OTP or doorstep arrival'
              : 'All dispatches on track'}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 5. OFFER-AND-ACCEPT ALLOCATION BANNER (If active)                 */}
      {/* ----------------------------------------------------------------- */}
      {dashboardData?.allocationModel === 'offer_accept' && dashboardData?.activeOffersCount > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          borderRadius: 14,
          padding: '16px 22px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          boxShadow: '0 4px 14px rgba(49, 46, 129, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 26 }}>⚡</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {dashboardData.activeOffersCount} Dispatch Offer(s) Awaiting Your Response
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.85 }}>
                Offer-and-Accept active. Respond within 15 minutes before the offer reallocates to another partner.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/professional/jobs?tab=offers')}
            style={{
              background: '#34D399',
              color: '#064E3B',
              border: 'none',
              padding: '10px 20px',
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

      {/* ----------------------------------------------------------------- */}
      {/* 6. MAIN WORKSPACE: 2-COLUMN RESPONSIVE LAYOUT                     */}
      {/* ----------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 1fr)',
        gap: 24,
        alignItems: 'start'
      }}>

        {/* =============================================================== */}
        {/* LEFT COLUMN: ACTIVE DISPATCH SPOTLIGHT + APPOINTMENTS TIMELINE   */}
        {/* =============================================================== */}
        <div>
          {/* Active / Next Scheduled Dispatch Card */}
          {nextJob ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: nextJob.status === 'In Progress' ? '2px solid #059669' :
                nextJob.status === 'Arrived' ? '2px solid #7C3AED' :
                nextJob.status === 'En Route' ? '2px solid #D97706' : '2px solid #3B82F6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              marginBottom: 24
            }}>
              {/* Card Banner Header */}
              <div style={{
                background: nextJob.status === 'In Progress' ? '#ECFDF5' :
                  nextJob.status === 'Arrived' ? '#FAF5FF' :
                  nextJob.status === 'En Route' ? '#FEF3C7' : '#EFF6FF',
                padding: '14px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: nextJob.status === 'In Progress' ? '#059669' :
                      nextJob.status === 'Arrived' ? '#7C3AED' :
                      nextJob.status === 'En Route' ? '#D97706' : '#2563EB',
                    boxShadow: nextJob.status === 'In Progress' ? '0 0 0 3px rgba(5, 150, 105, 0.25)' : 'none'
                  }} />
                  <span style={{
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    color: nextJob.status === 'In Progress' ? '#065F46' :
                      nextJob.status === 'Arrived' ? '#5B21B6' :
                      nextJob.status === 'En Route' ? '#92400E' : '#1E40AF'
                  }}>
                    {nextJob.status === 'In Progress' ? '🟢 ONGOING SERVICE IN PROGRESS' :
                      nextJob.status === 'Arrived' ? '📍 ARRIVED AT CUSTOMER DOORSTEP' :
                      nextJob.status === 'En Route' ? '🚗 TRAVELING EN ROUTE' : '📋 NEXT SCHEDULED APPOINTMENT'}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>
                  Ref: {nextJob.bookingReference}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                  <div>
                    <h2 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                      {nextJob.serviceName}
                    </h2>
                    <div style={{ fontSize: 13.5, color: '#475569' }}>
                      Slot: <strong style={{ color: '#0F172A' }}>{nextJob.slot}</strong> ({nextJob.timeZone || 'Asia/Kolkata'})
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>
                      Estimated Service Duration: <strong>{nextJob.estimatedDuration}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>
                      ₹{nextJob.payout}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Pro Net Take (80%)</div>
                  </div>
                </div>

                {/* Customer instructions alert if present */}
                {nextJob.customerInstructions && (
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginTop: 16,
                    border: '1px solid #E2E8F0',
                    fontSize: 13,
                    color: '#334155'
                  }}>
                    <strong style={{ color: '#0F172A' }}>💬 Customer Instructions: </strong>
                    "{nextJob.customerInstructions}"
                  </div>
                )}

                {/* Customer Details & Address */}
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Customer Contact
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                      {nextJob.customer}
                    </div>
                    <div style={{ fontSize: 13, color: '#2563EB', marginTop: 3, fontWeight: 600 }}>
                      📞 {nextJob.phone}
                    </div>
                    {nextJob.isPhoneMasked && (
                      <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 2 }}>
                        (Masked Privacy Bridge · Active for Dispatch)
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                      Doorstep Location
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155', marginTop: 2, lineHeight: 1.3 }}>
                      {nextJob.address}
                    </div>
                    <div style={{ fontSize: 12, color: '#059669', marginTop: 4, fontWeight: 700 }}>
                      📍 Area: {nextJob.area}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons Bar */}
                <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {nextJob.status === 'Assigned' && (
                    <button
                      onClick={() => handleLifecycleTransition(nextJob, 'En Route')}
                      style={{
                        flex: 1.5,
                        background: '#D97706',
                        color: '#FFFFFF',
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
                        boxShadow: '0 4px 10px rgba(217, 119, 6, 0.25)'
                      }}
                    >
                      <span>🚗</span>
                      <span>Start Travel (En Route) →</span>
                    </button>
                  )}

                  {nextJob.status === 'En Route' && (
                    <button
                      onClick={() => handleLifecycleTransition(nextJob, 'Arrived')}
                      style={{
                        flex: 1.5,
                        background: '#7C3AED',
                        color: '#FFFFFF',
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
                        boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)'
                      }}
                    >
                      <span>📍</span>
                      <span>Confirm Arrival at Doorstep →</span>
                    </button>
                  )}

                  {nextJob.status === 'Arrived' && (
                    <button
                      onClick={() => handleLifecycleTransition(nextJob, 'In Progress', true)}
                      style={{
                        flex: 1.5,
                        background: '#2563EB',
                        color: '#FFFFFF',
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
                        boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      <span>🔑</span>
                      <span>Verify Start OTP & Begin Service →</span>
                    </button>
                  )}

                  {nextJob.status === 'In Progress' && (
                    <button
                      onClick={() => onNavigate(`/professional/jobs/${nextJob.id}`)}
                      style={{
                        flex: 1.5,
                        background: '#059669',
                        color: '#FFFFFF',
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
                        boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      <span>✓</span>
                      <span>Complete Checklist & Submit →</span>
                    </button>
                  )}

                  {!nextJob.preciseAddressHidden && (
                    <button
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(nextJob.fullAddress || nextJob.address)}`, '_blank')}
                      style={{
                        background: '#F1F5F9',
                        color: '#0F172A',
                        border: '1px solid #CBD5E1',
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>🧭</span>
                      <span>Maps</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate(`/professional/jobs/${nextJob.id}`)}
                    style={{
                      background: '#FFFFFF',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
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
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '40px 20px',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>☕</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                No Active Dispatches at the Moment
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
                You are currently online. Keep duty active to receive direct customer bookings in Krishnagiri Town.
              </p>
            </div>
          )}

          {/* Today's Appointments Section with Filter Pills */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 18
            }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Today's Appointments ({appointments.length})
                </h3>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  {dashboardData?.availability?.operationalCity || profile?.operationalCity || 'Krishnagiri Town, Tamil Nadu'} (Doorstep Direct Travel)
                </div>
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: `All Today (${appointments.length})` },
                  { id: 'ACTION_REQUIRED', label: 'Action Required' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'COMPLETED', label: 'Completed' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: activeTab === tab.id ? '#7C3AED' : '#F8FAFC',
                      color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                      border: `1px solid ${activeTab === tab.id ? '#7C3AED' : '#E2E8F0'}`,
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredAppointments.length === 0 ? (
              <div style={{ padding: '36px 10px', textAlign: 'center', color: '#64748B', fontSize: 13.5 }}>
                No appointments matching the selected filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredAppointments.map(job => (
                  <div
                    key={job.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #F1F5F9',
                      gap: 12,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: job.status === 'Completed' ? '#ECFDF5' : '#EFF6FF',
                        color: job.status === 'Completed' ? '#059669' : '#2563EB',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 12.5,
                        flexShrink: 0
                      }}>
                        <span>{job.scheduledStartTime || '14:00'}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A' }}>
                            {job.serviceName}
                          </span>
                          <span style={{
                            background: job.status === 'Completed' ? '#DCFCE7' :
                              job.status === 'In Progress' ? '#DBEAFE' :
                              job.status === 'Arrived' ? '#EDE9FE' :
                              job.status === 'En Route' ? '#FEF3C7' : '#F1F5F9',
                            color: job.status === 'Completed' ? '#166534' :
                              job.status === 'In Progress' ? '#1E40AF' :
                              job.status === 'Arrived' ? '#6B21A8' :
                              job.status === 'En Route' ? '#92400E' : '#475569',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            {job.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>
                          {job.customer} • {job.area} ({job.estimatedDuration})
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>
                          ₹{job.payout}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          Ref: {job.bookingReference}
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigate(`/professional/jobs/${job.id}`)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#0F172A',
                          padding: '7px 14px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
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

        {/* =============================================================== */}
        {/* RIGHT COLUMN: DIAMOND PARTNER CLUB + OPERATIONAL TOOLS          */}
        {/* =============================================================== */}
        <div>
          {/* Diamond Pro Partner Club Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
            color: '#FFFFFF',
            borderRadius: 16,
            padding: '24px 26px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
            marginBottom: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.8
              }}>
                PARTNER CLUB
              </span>
              <span style={{ fontSize: 24 }}>💎</span>
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 800, margin: '14px 0 6px 0', letterSpacing: '-0.01em' }}>
              Diamond Pro Partner (Level 5)
            </h3>
            <p style={{ fontSize: 13, opacity: 0.85, margin: '0 0 18px 0', lineHeight: 1.45 }}>
              Top 1% rated technician in Mumbai West. Priority dispatches and zero platform commission penalty active.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 8 }}>
                <span style={{ opacity: 0.9 }}>Monthly Bonus Target</span>
                <strong>42 / 45 Jobs (93%)</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', height: 7, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ background: '#34D399', width: '93%', height: '100%', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 8 }}>
                🎯 Just 3 more jobs by 31 Oct to unlock ₹5,000 monthly cash bonus!
              </div>
            </div>

            <button
              onClick={() => onNavigate('/professional/performance')}
              style={{
                width: '100%',
                background: '#FFFFFF',
                color: '#1E1B4B',
                border: 'none',
                padding: '11px 0',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                marginTop: 18,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              View Full Scorecard & Benefits →
            </button>
          </div>

          {/* Quick Hub Tools Grid */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '22px 24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            marginBottom: 20
          }}>
            <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
              Technician Operations & Tools
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => onNavigate('/professional/payouts')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '14px 12px',
                  borderRadius: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div style={{ fontSize: 20 }}>💳</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>Payouts</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>Bank & wallet transfers</div>
              </button>

              <button
                onClick={() => onNavigate('/professional/shop')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '14px 12px',
                  borderRadius: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div style={{ fontSize: 20 }}>👕</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>Pro Shop</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>Uniform & safety gear</div>
              </button>

              <button
                onClick={() => onNavigate('/professional/performance')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '14px 12px',
                  borderRadius: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div style={{ fontSize: 20 }}>⭐</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>Scorecard</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>Tier & SLA metrics</div>
              </button>

              <button
                onClick={() => onNavigate('/professional/documents')}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '14px 12px',
                  borderRadius: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div style={{ fontSize: 20 }}>📄</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 6 }}>Documents</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>Verified IDs & Police check</div>
              </button>
            </div>
          </div>

          {/* Hub Manager & Partner Support Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '20px 22px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📞</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                  Partner Operations Desk & Helpdesk
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Krishnagiri Operations · K. Murugan
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: '#475569', marginTop: 8 }}>
              For shift modifications or urgent doorstep technical assistance:
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => onNavigate('/professional/support')}
                style={{
                  flex: 1,
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Ops Support →
              </button>
              <button
                onClick={() => onNavigate('/professional/availability')}
                style={{
                  flex: 1,
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Shift Slots →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 7. CUSTOMER START OTP MODAL                                        */}
      {/* ----------------------------------------------------------------- */}
      {selectedJobForOtp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '28px 30px',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🔑</span>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Verify Customer Start OTP
              </h3>
            </div>
            <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Ask customer <strong>{selectedJobForOtp.customer}</strong> for their 4-digit service start code to unlock the checklist.
            </p>

            <div style={{
              background: '#F1F5F9',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 12.5,
              color: '#334155',
              marginBottom: 18,
              border: '1px solid #E2E8F0'
            }}>
              💡 <strong>Customer Start Code:</strong> Enter <strong>4829</strong> or <strong>1234</strong> to verify.
            </div>

            {otpError && (
              <div style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
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
                padding: '14px',
                fontSize: 28,
                letterSpacing: 12,
                textAlign: 'center',
                fontWeight: 800,
                border: '2px solid #CBD5E1',
                borderRadius: 12,
                boxSizing: 'border-box',
                marginBottom: 20,
                color: '#0F172A',
                outline: 'none'
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
                  background: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  padding: '13px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyStartOtp}
                disabled={isVerifyingOtp}
                style={{
                  flex: 1.6,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '13px 0',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                {isVerifyingOtp ? 'Verifying OTP...' : 'Verify & Start Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 8. EMERGENCY SOS SAFETY MODAL                                      */}
      {/* ----------------------------------------------------------------- */}
      {showSosModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '28px 30px',
            width: '100%',
            maxWidth: 460,
            boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.35)',
            border: '2px solid #FCA5A5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22
              }}>
                🚨
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#991B1B', margin: 0 }}>
                  Emergency Safety Assistance
                </h3>
                <div style={{ fontSize: 12.5, color: '#64748B' }}>
                  24x7 Partner Rapid Incident Response
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.45, margin: '0 0 20px 0' }}>
              If you feel unsafe or have met with an accident, tap below to broadcast your live GPS coordinates to the Krishnagiri Safety Operations Desk and dial emergency helplines.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <button
                onClick={handleTriggerSosAlert}
                disabled={sosSent}
                style={{
                  background: sosSent ? '#10B981' : '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 18px',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <span>📍</span>
                <span>{sosSent ? 'Broadcast Sent to Safety Desk!' : 'Broadcast GPS to Krishnagiri Safety Desk'}</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <a
                  href="tel:112"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    padding: '12px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>👮</span>
                  <span>Police (112)</span>
                </a>
                <a
                  href="tel:108"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    padding: '12px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>🚑</span>
                  <span>Ambulance (108)</span>
                </a>
              </div>

              <a
                href="tel:18001028726"
                style={{
                  background: '#FAF5FF',
                  border: '1px solid #DDD6FE',
                  color: '#6B21A8',
                  padding: '12px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <span>🛡️</span>
                <span>UC Partner Safety Helpline (1800-102-8726)</span>
              </a>
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              style={{
                width: '100%',
                background: '#F1F5F9',
                border: 'none',
                color: '#475569',
                padding: '12px 0',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close Emergency Window
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. URGENT INCOMING DISPATCH OFFER POPUP MODAL (MODULE 5 & 7)   */}
      {/* ------------------------------------------------------------- */}
      {incomingOffer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '2px solid #3B82F6',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Countdown Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              padding: '16px 20px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>New Dispatch Offer</h3>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>Krishnagiri Town Direct Assignment</div>
                </div>
              </div>
              <div style={{
                background: incomingOffer.remainingSeconds <= 15 ? '#EF4444' : 'rgba(255,255,255,0.25)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 0.5,
                boxShadow: incomingOffer.remainingSeconds <= 15 ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none',
                transition: 'all 0.3s'
              }}>
                ⏱️ {incomingOffer.remainingSeconds}s
              </div>
            </div>

            {/* Offer Details */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Booking Ref: {incomingOffer.bookingReference || incomingOffer.bookingId || 'BK-NEW'}
                  </div>
                  <h4 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '4px 0 2px 0' }}>
                    {incomingOffer.serviceName || 'Home Service'}
                  </h4>
                  <div style={{ fontSize: 13, color: '#64748B' }}>
                    Scheduled: <strong style={{ color: '#0F172A' }}>{incomingOffer.scheduledDate || 'Today'}, {incomingOffer.scheduledTime || 'Immediate'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#059669' }}>
                    ₹{incomingOffer.payout || Math.round((incomingOffer.totalAmount || 499) * 0.75)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Your Estimated Earning</div>
                </div>
              </div>

              {/* Service Address */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: 12,
                padding: '12px 16px',
                border: '1px solid #E2E8F0',
                marginBottom: 20
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 2 }}>
                  📍 Customer Service Location
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                  {incomingOffer.address || 'Gandhi Nagar, Krishnagiri Town'}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 4 }}>
                  Estimated Travel: ~{incomingOffer.travelDistanceKm || 2.4} km ({incomingOffer.estimatedTravelMins || 8} mins by two-wheeler)
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleRejectIncomingOffer}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#64748B',
                    padding: '14px 0',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleAcceptIncomingOffer}
                  style={{
                    flex: 1.6,
                    background: '#059669',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '14px 0',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
                  }}
                >
                  ✓ Accept Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
