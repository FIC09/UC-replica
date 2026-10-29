import React, { useState } from 'react';
import { 
  X, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Navigation, 
  Wallet, 
  Star, 
  ShieldCheck, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  Power, 
  ArrowRight, 
  Check, 
  CheckSquare, 
  Square,
  DollarSign,
  UserCheck,
  Sparkles,
  Zap,
  HardHat,
  ExternalLink
} from 'lucide-react';

export function ProfessionalDashboardModal({
  isOpen,
  onClose,
  onShowToast,
  user,
  onOpenFullPortal
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'wallet' | 'quality'
  const [otpInput, setOtpInput] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Professional profile
  const proProfile = {
    name: user?.name || 'Vikram Salvi (Senior Technician)',
    trade: user?.trade || 'Master AC Specialist & Electrician',
    rating: 4.94,
    jobsCount: 1520,
    zone: 'Bandra & Khar Zone, Mumbai',
    level: 'Diamond Pro Partner (Level 5)',
    id: 'PRO-8841'
  };

  // State for incoming job lead
  const [hasNewLead, setHasNewLead] = useState(true);
  const [activeJob, setActiveJob] = useState({
    id: 'JOB-9410',
    customer: 'Rohan Kapoor',
    address: 'Flat 402, Sea Face Apartments, Pali Hill, Bandra West, Mumbai',
    phone: '+91 98200 12345',
    service: 'Powerjet AC Servicing (Split) + Deep Coil Cleaning',
    payout: 750,
    distance: '1.2 km away',
    otp: '4829',
    status: 'Assigned', // 'Assigned' | 'In Progress' | 'Completed'
    checklist: [
      { id: 1, text: 'Verify 4-digit start OTP with customer', done: false },
      { id: 2, text: 'Wear UC branded uniform, shoe covers & safety mask', done: false },
      { id: 3, text: 'Pre-service cooling baseline & electrical inspection', done: false },
      { id: 4, text: 'Fit waterproof AC jacket to protect customer wall', done: false },
      { id: 5, text: 'Deep PowerJet water wash of cooling coils & fan blades', done: false },
      { id: 6, text: 'Post-service temperature test & mess-free cleanup', done: false },
    ]
  });

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);

  if (!isOpen) return null;

  function toggleChecklistItem(id) {
    if (!activeJob) return;
    setActiveJob(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  }

  function handleVerifyOtp() {
    if (otpInput === activeJob?.otp || otpInput === '1234') {
      setIsOtpVerified(true);
      setActiveJob(prev => ({
        ...prev,
        status: 'In Progress',
        checklist: prev.checklist.map(i => i.id === 1 ? { ...i, done: true } : i)
      }));
      if (onShowToast) onShowToast('✅ Customer OTP Verified! Job status marked IN PROGRESS.');
    } else {
      if (onShowToast) onShowToast('❌ Invalid OTP. Enter customer 4-digit start OTP (Hint: 4829)');
    }
  }

  function handleAcceptNewLead() {
    setHasNewLead(false);
    if (onShowToast) onShowToast('⚡ Job Accepted! Navigate to customer location in Bandra West.');
  }

  function handleCompleteJob() {
    if (!activeJob) return;
    const earned = activeJob.payout;
    setWalletBalance(prev => prev + earned);
    setTodayEarnings(prev => prev + earned);
    setCompletedJobsCount(prev => prev + 1);
    setActiveJob(null);
    if (onShowToast) onShowToast(`🎉 Service completed! ₹${earned} credited to your UC Pro wallet.`);
  }

  function handleWithdrawFunds() {
    if (walletBalance <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      const amount = walletBalance;
      setWalletBalance(0);
      setIsWithdrawing(false);
      if (onShowToast) onShowToast(`💸 ₹${amount.toLocaleString('en-IN')} transferred to your verified bank account!`);
    }, 1200);
  }

  return (
    <div className="professional-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#FFFFFF',
        color: '#0F172A',
        width: '100%',
        maxWidth: 1040,
        height: '90vh',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        {/* Header (Clean white toolbar matching admin design) */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#EDE9FE',
              color: '#6E42E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              border: '1px solid #DDD6FE'
            }}>
              <HardHat size={22} color="#6E42E5" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {proProfile.name}
                </h3>
                <span style={{
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  border: '1px solid #FDE68A'
                }}>
                  <Star size={12} fill="#D97706" color="#D97706" />
                  {proProfile.rating} ★
                </span>
                <span style={{
                  background: '#EDE9FE',
                  color: '#6E42E5',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: '1px solid #DDD6FE'
                }}>
                  {proProfile.level}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                {proProfile.trade} • 📍 {proProfile.zone} • ID: {proProfile.id}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Online / Offline switch */}
            <button
              type="button"
              onClick={() => {
                setIsOnline(!isOnline);
                if (onShowToast) onShowToast(isOnline ? '🔴 You are now Offline' : '🟢 You are now Online & Receiving Dispatches');
              }}
              style={{
                background: isOnline ? '#ECFDF5' : '#FEF2F2',
                color: isOnline ? '#065F46' : '#991B1B',
                border: `1px solid ${isOnline ? '#86EFAC' : '#FCA5A5'}`,
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Power size={13} color={isOnline ? '#059669' : '#DC2626'} />
              <span>{isOnline ? '● Online (Ready for Jobs)' : '○ Offline'}</span>
            </button>

            {/* Expand to Full-Page Portal Button */}
            {onOpenFullPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullPortal();
                }}
                style={{
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(110,66,229,0.3)'
                }}
                title="Open as full dedicated page"
              >
                <span>Full Portal</span>
                <ExternalLink size={12} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                width: 34,
                height: 34,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close Portal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Matching Admin/Partner tabs style) */}
        <div style={{
          display: 'flex',
          gap: 6,
          padding: '8px 24px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0'
        }}>
          {[
            { id: 'jobs', label: 'Assigned Jobs & Leads', icon: Wrench, count: activeJob ? 1 : 0 },
            { id: 'wallet', label: 'Wallet & Daily Payouts', icon: Wallet, count: `₹${walletBalance.toLocaleString('en-IN')}` },
            { id: 'quality', label: 'Quality & Rating Score', icon: Award, count: '4.94 ★' },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: active ? '#FFFFFF' : 'transparent',
                  color: active ? '#6E42E5' : '#64748B',
                  border: active ? '1px solid #E2E8F0' : '1px solid transparent',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} color={active ? '#6E42E5' : '#94A3B8'} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span style={{
                    fontSize: 11,
                    background: active ? '#EDE9FE' : '#E2E8F0',
                    color: active ? '#6E42E5' : '#475569',
                    padding: '2px 7px',
                    borderRadius: 999,
                    fontWeight: 800
                  }}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area with Clean Light Background */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: '#F8FAFC' }}>
          {activeTab === 'jobs' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
              {/* Left Column: Active Job */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                  Current Active Dispatch
                </h4>

                {activeJob ? (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    padding: 20,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                      <div>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          background: isOtpVerified ? '#DCFCE7' : '#FEF3C7',
                          color: isOtpVerified ? '#15803D' : '#92400E',
                          padding: '3px 10px',
                          borderRadius: 999,
                          display: 'inline-block',
                          marginBottom: 6,
                          border: `1px solid ${isOtpVerified ? '#BBF7D0' : '#FDE68A'}`
                        }}>
                          {activeJob.status === 'In Progress' ? '● IN PROGRESS' : '🕒 DISPATCHED - AWAITING START'}
                        </span>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                          {activeJob.service}
                        </h3>
                        <div style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>Customer: <strong style={{ color: '#0F172A' }}>{activeJob.customer}</strong></span>
                          <span>•</span>
                          <span style={{ color: '#6E42E5', fontWeight: 600 }}>{activeJob.distance}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#16A34A' }}>
                          ₹{activeJob.payout}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Pro Payout</div>
                      </div>
                    </div>

                    {/* Address & Call */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                      border: '1px solid #E2E8F0',
                      gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin size={17} color="#6E42E5" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 500 }}>{activeJob.address}</span>
                      </div>
                      <a
                        href={`tel:${activeJob.phone}`}
                        style={{
                          background: '#6E42E5',
                          color: '#fff',
                          textDecoration: 'none',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0
                        }}
                      >
                        <Phone size={13} />
                        <span>Call</span>
                      </a>
                    </div>

                    {/* Customer Start OTP verification */}
                    {!isOtpVerified && (
                      <div style={{
                        background: '#EDE9FE',
                        border: '1px solid #DDD6FE',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#6E42E5', marginBottom: 6 }}>
                          🔐 Enter Customer 4-Digit Start OTP:
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 4829"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              color: '#0F172A',
                              borderRadius: 8,
                              padding: '8px 14px',
                              fontSize: 16,
                              fontWeight: 800,
                              letterSpacing: 4,
                              width: 140,
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            style={{
                              background: '#6E42E5',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 18px',
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            Verify & Start Job
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
                          Customer receives this OTP via SMS upon booking confirmation (Test OTP: <strong>4829</strong>).
                        </div>
                      </div>
                    )}

                    {/* Service Checklist */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#334155', marginBottom: 10 }}>
                        Professional Service Standard Checklist:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeJob.checklist.map(item => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '9px 12px',
                              borderRadius: 8,
                              background: item.done ? '#ECFDF5' : '#FFFFFF',
                              border: `1px solid ${item.done ? '#A7F3D0' : '#E2E8F0'}`,
                              cursor: 'pointer',
                              fontSize: 12.5,
                              color: item.done ? '#065F46' : '#334155',
                              fontWeight: item.done ? 600 : 500,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {item.done ? <CheckSquare size={16} color="#10B981" /> : <Square size={16} color="#94A3B8" />}
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Complete Job Button */}
                    <button
                      type="button"
                      onClick={handleCompleteJob}
                      style={{
                        width: '100%',
                        background: '#10B981',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: 10,
                        padding: '13px 20px',
                        fontSize: 13.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <CheckCircle2 size={18} />
                      <span>Mark Service Completed & Collect Payout (₹{activeJob.payout})</span>
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: 14,
                    padding: 36,
                    textAlign: 'center',
                    border: '1px dashed #CBD5E1'
                  }}>
                    <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                      All Dispatches Completed!
                    </h3>
                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px 0' }}>
                      Great work Vikram! You have completed all scheduled tasks for this slot. Keep your status online for new incoming leads.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveJob({
                        id: 'JOB-9412',
                        customer: 'Pooja Deshmukh',
                        address: 'Bunglow 12, Carter Road, Bandra West, Mumbai',
                        phone: '+91 98330 99881',
                        service: 'Split AC Deep Clean + Antibacterial Sanitization',
                        payout: 850,
                        distance: '2.1 km away',
                        otp: '1234',
                        status: 'Assigned',
                        checklist: [
                          { id: 1, text: 'Verify 4-digit start OTP with customer', done: false },
                          { id: 2, text: 'Wear UC branded uniform, shoe covers & safety mask', done: false },
                          { id: 3, text: 'Pre-service cooling inspection', done: false },
                          { id: 4, text: 'Pressure jet wash of filters and coils', done: false },
                          { id: 5, text: 'Post-service test & cleanup', done: false },
                        ]
                      })}
                      style={{
                        background: '#6E42E5',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Simulate New Incoming Job
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Incoming Leads & Quick Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Available Instant Leads
                </h4>

                {hasNewLead ? (
                  <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: 14,
                    padding: 18,
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(110, 66, 229, 0.08)'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      background: '#EDE9FE',
                      color: '#6E42E5',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 999,
                      textTransform: 'uppercase',
                      border: '1px solid #DDD6FE'
                    }}>
                      ⚡ Hot Lead (15 Mins)
                    </span>

                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                      AC Gas Leak Repair & Refill
                    </h4>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 12px 0' }}>
                      📍 Perry Cross Rd, Bandra West • 0.8 km
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Guaranteed Payout</div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#16A34A' }}>₹1,250</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Slot</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Immediate</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        onClick={handleAcceptNewLead}
                        style={{
                          flex: 1,
                          background: '#6E42E5',
                          border: 'none',
                          color: '#fff',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Accept Lead
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasNewLead(false)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#64748B',
                          borderRadius: 8,
                          padding: '10px 14px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Pass
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 18, textAlign: 'center', border: '1px solid #E2E8F0' }}>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
                      No more pending leads in Bandra Zone. Checking Khar & Santacruz...
                    </p>
                  </div>
                )}

                {/* Day Summary Card */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: 18,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                    📊 Today's Field Activity
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: '#64748B' }}>Jobs Completed Today</span>
                    <span style={{ fontWeight: 800, color: '#0F172A' }}>{completedJobsCount} jobs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: '#64748B' }}>Today's Net Earnings</span>
                    <span style={{ fontWeight: 800, color: '#16A34A' }}>₹{todayEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748B' }}>Customer Rating Avg</span>
                    <span style={{ fontWeight: 800, color: '#D97706' }}>4.96 ★ (5 ratings)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
              <div style={{
                background: 'linear-gradient(135deg, #6E42E5 0%, #4F46E5 100%)',
                borderRadius: 16,
                padding: 28,
                marginBottom: 24,
                boxShadow: '0 10px 25px -5px rgba(110, 66, 229, 0.3)',
                color: '#FFFFFF'
              }}>
                <div style={{ fontSize: 13, color: '#E0E7FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  Total Withdrawable Balance
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF', marginBottom: 18 }}>
                  ₹{walletBalance.toLocaleString('en-IN')}
                </div>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleWithdrawFunds}
                    disabled={walletBalance <= 0 || isWithdrawing}
                    style={{
                      background: walletBalance > 0 ? '#10B981' : '#94A3B8',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 8,
                      padding: '11px 22px',
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: walletBalance > 0 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                    }}
                  >
                    <Wallet size={16} />
                    <span>{isWithdrawing ? 'Transferring...' : 'Instant Bank Transfer'}</span>
                  </button>

                  <div style={{ alignSelf: 'center', fontSize: 12, color: '#E0E7FF' }}>
                    Linked: HDFC Bank A/C ending in <strong>*4821</strong>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                Recent Payout Ledger
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'TXN-9812', title: 'Powerjet AC Servicing - Pali Hill', amount: '+₹750', date: 'Today, 10:15 AM', status: 'Credited' },
                  { id: 'TXN-9808', title: 'Electrical Switchboard Repair - Khar', amount: '+₹420', date: 'Today, 08:30 AM', status: 'Credited' },
                  { id: 'TXN-9799', title: 'Instant Bank Withdrawal to HDFC', amount: '-₹8,500', date: 'Yesterday, 06:45 PM', status: 'Transferred' },
                  { id: 'TXN-9781', title: 'Chimney Deep Clean - Bandra West', amount: '+₹1,180', date: 'Yesterday, 03:20 PM', status: 'Credited' }
                ].map(tx => (
                  <div
                    key={tx.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 12,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{tx.title}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B' }}>{tx.id} • {tx.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: tx.amount.startsWith('+') ? '#16A34A' : '#DC2626' }}>
                        {tx.amount}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                  Professional Compliance & Trust Score
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'On-Time Arrival Rate', val: '99.4%', status: 'Excellent' },
                    { label: 'Customer Satisfaction Score', val: '4.94 / 5.0', status: 'Elite' },
                    { label: 'SOP & Uniform Protocol', val: '100%', status: 'Compliant' },
                    { label: 'Re-work / Repeat Rate', val: '0.4%', status: 'Lowest in Mumbai' },
                    { label: 'Background Check & Police Clearance', val: 'Verified', status: 'Green' }
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#64748B' }}>{m.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#16A34A' }}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: 14, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                  Recent Customer Praise
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { comment: 'Vikram was exceptionally polite, wore shoe covers, and did a spotless job on our split AC.', author: 'Aarti S., Bandra', rating: 5 },
                    { comment: 'Super quick diagnosis of gas pressure. Cooling is 100% restored like brand new.', author: 'Farhan K., Pali Hill', rating: 5 },
                    { comment: 'Punctual, professional tools, mess-free work. Highly recommended pro.', author: 'Sunil M., Khar West', rating: 5 }
                  ].map((c, i) => (
                    <div key={i} style={{ background: '#F8FAFC', borderRadius: 10, padding: 12, border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                        {[...Array(c.rating)].map((_, s) => <Star key={s} size={11} fill="#D97706" color="#D97706" />)}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#334155', fontStyle: 'italic', marginBottom: 4 }}>
                        "{c.comment}"
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                        — {c.author}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
