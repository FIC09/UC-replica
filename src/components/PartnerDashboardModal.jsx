import React, { useState } from 'react';
import { 
  X, 
  Briefcase, 
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
  DollarSign
} from 'lucide-react';

export function PartnerDashboardModal({
  isOpen,
  onClose,
  onShowToast,
  onOpenPartnerOnboarding
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, wallet, quality

  // Partner profile
  const partnerProfile = {
    name: 'Vikram Salvi',
    trade: 'Master AC Specialist & Electrician',
    rating: 4.92,
    jobsCount: 1480,
    zone: 'Bandra & Khar Zone, Mumbai',
    level: 'Elite Master Partner (Level 5)'
  };

  // State for incoming job lead
  const [hasNewLead, setHasNewLead] = useState(true);
  const [activeJob, setActiveJob] = useState({
    id: 'JOB-7721',
    customer: 'Rohan Kapoor',
    address: 'Flat 402, Sea Face Apartments, Pali Hill, Bandra West',
    phone: '+91 98200 12345',
    service: 'Powerjet AC Servicing (Split) + Gas Leak Test',
    payout: 720,
    distance: '1.4 km away',
    otp: '4829',
    status: 'In Progress', // 'Assigned', 'In Progress', 'Completed'
    checklist: [
      { id: 1, text: 'Verify 4-digit start OTP with customer', done: true },
      { id: 2, text: 'Wear UC branded uniform, shoe covers & mask', done: true },
      { id: 3, text: 'Perform pre-service cooling baseline inspection', done: true },
      { id: 4, text: 'Fit waterproof AC jacket to protect customer wall', done: false },
      { id: 5, text: 'Deep PowerJet water wash of cooling coils & filters', done: false },
      { id: 6, text: 'Post-service temperature test & mess-free cleanup', done: false },
    ]
  });

  // Wallet state
  const [walletBalance, setWalletBalance] = useState(14200);
  const [todayEarnings, setTodayEarnings] = useState(2850);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [completedJobsCount, setCompletedJobsCount] = useState(3);

  if (!isOpen) return null;

  function toggleChecklistItem(id) {
    if (!activeJob) return;
    setActiveJob(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, done: !item.done } : item)
    }));
  }

  function handleAcceptNewLead() {
    setHasNewLead(false);
    if (onShowToast) onShowToast('⚡ Job Accepted! Navigate to Bandra West.');
  }

  function handleCompleteJob() {
    if (!activeJob) return;
    const earned = activeJob.payout;
    setWalletBalance(prev => prev + earned);
    setTodayEarnings(prev => prev + earned);
    setCompletedJobsCount(prev => prev + 1);
    setActiveJob(null);
    if (onShowToast) onShowToast(`🎉 Job completed! ₹${earned} credited to your wallet.`);
  }

  function handleWithdrawFunds() {
    if (walletBalance <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      const amount = walletBalance;
      setWalletBalance(0);
      setIsWithdrawing(false);
      if (onShowToast) onShowToast(`💸 ₹${amount.toLocaleString('en-IN')} transferred to your HDFC Bank account!`);
    }, 1200);
  }

  return (
    <div className="partner-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: '#0F172A',
        color: '#F8FAFC',
        width: '100%',
        maxWidth: 960,
        height: '88vh',
        borderRadius: 20,
        border: '1px solid #334155',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Partner Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#090D16'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Avatar */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}>
              VS
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {partnerProfile.name}
                </h3>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FBBF24',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <Star size={12} fill="#FBBF24" />
                  {partnerProfile.rating} ★
                </span>
                <span style={{
                  background: 'rgba(110, 66, 229, 0.2)',
                  color: '#A78BFA',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999
                }}>
                  {partnerProfile.level}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                {partnerProfile.trade} • 📍 {partnerProfile.zone}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onOpenPartnerOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPartnerOnboarding();
                }}
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#A78BFA',
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span>+ Onboard Pro</span>
              </button>
            )}

            {/* Online / Offline switch */}
            <button
              type="button"
              onClick={() => {
                setIsOnline(!isOnline);
                if (onShowToast) onShowToast(isOnline ? '🔴 You are now Offline' : '🟢 You are now Online & Receiving Jobs');
              }}
              style={{
                background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isOnline ? '#10B981' : '#EF4444',
                border: isOnline ? '1px solid #10B981' : '1px solid #EF4444',
                padding: '7px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Power size={13} />
              <span>{isOnline ? '● Online (Jobs On)' : '○ Offline'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#94A3B8',
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Performance Top Ticker */}
        <div style={{
          background: '#0D1424',
          borderBottom: '1px solid #1E293B',
          padding: '12px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>TODAY'S EARNINGS</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#10B981' }}>₹{todayEarnings}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>WALLET BALANCE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#F8FAFC' }}>₹{walletBalance.toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>COMPLETED TODAY</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#A78BFA' }}>{completedJobsCount} Jobs</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>ACCEPTANCE RATE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FBBF24' }}>98.4%</div>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{
          padding: '8px 24px',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          gap: 10,
          background: '#0F172A'
        }}>
          {[
            { id: 'jobs', label: 'Active Jobs & Leads', icon: Briefcase },
            { id: 'wallet', label: 'My Wallet & Payouts', icon: Wallet },
            { id: 'quality', label: 'Skill Badges & Audits', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #10B981' : '1px solid transparent',
                  background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? '#10B981' : '#94A3B8'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* TAB 1: JOBS */}
          {activeTab === 'jobs' && (
            <div>
              {/* New Incoming Job Alert Banner */}
              {hasNewLead && (
                <div style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  border: '1.5px solid #8B5CF6',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: '#10B981',
                        color: '#fff',
                        fontSize: 10.5,
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 4,
                        letterSpacing: 0.5
                      }}>
                        NEW LEAD • 45s EXPIRES
                      </span>
                      <span style={{ fontSize: 13, color: '#CBD5E1' }}>1.4 km from your current location</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#34D399' }}>
                      Earn ₹720
                    </div>
                  </div>

                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    Powerjet AC Servicing (Split) + Gas Leak Test
                  </h4>
                  <p style={{ fontSize: 13, color: '#CBD5E1', margin: '0 0 16px 0' }}>
                    📍 Pali Hill, Bandra West • Customer prefers slot between 11:30 AM - 12:30 PM
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={handleAcceptNewLead}
                      style={{
                        background: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Check size={16} />
                      <span>Accept Job (Earn ₹720)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasNewLead(false)}
                      style={{
                        background: 'transparent',
                        color: '#94A3B8',
                        border: '1px solid #334155',
                        padding: '10px 18px',
                        borderRadius: 10,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Active Ongoing Job Card */}
              {activeJob ? (
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 18,
                  padding: 22
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38BDF8',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6
                      }}>
                        ACTIVE JOB #{activeJob.id}
                      </span>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#FFFFFF', margin: '8px 0 4px' }}>
                        {activeJob.service}
                      </h3>
                      <div style={{ fontSize: 13, color: '#94A3B8' }}>
                        Customer: <strong style={{ color: '#F8FAFC' }}>{activeJob.customer}</strong>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#CBD5E1', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} color="#6E42E5" />
                        <span>{activeJob.address}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Start OTP</div>
                      <div style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: '#FBBF24',
                        background: '#0F172A',
                        padding: '4px 10px',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        display: 'inline-block',
                        letterSpacing: 2
                      }}>
                        {activeJob.otp}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#10B981', marginTop: 8 }}>
                        Payout: ₹{activeJob.payout}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Navigation Row */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <a
                      href={`tel:${activeJob.phone}`}
                      style={{
                        background: '#1E293B',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        textDecoration: 'none'
                      }}
                    >
                      <Phone size={14} color="#10B981" />
                      <span>Call Customer</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        if (onShowToast) onShowToast('📍 Google Maps opened: 1.4 km via Linking Road.');
                      }}
                      style={{
                        background: '#1E293B',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <Navigation size={14} color="#38BDF8" />
                      <span>Navigate (1.4 km)</span>
                    </button>
                  </div>

                  {/* Standard Operating Checklist */}
                  <div style={{
                    background: '#0F172A',
                    borderRadius: 12,
                    padding: 16,
                    border: '1px solid #1E293B',
                    marginBottom: 20
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#A78BFA', marginBottom: 12 }}>
                      Standard SOP Service Checklist
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
                            fontSize: 12.5,
                            color: item.done ? '#E2E8F0' : '#94A3B8',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        >
                          {item.done ? (
                            <CheckSquare size={16} color="#10B981" />
                          ) : (
                            <Square size={16} color="#64748B" />
                          )}
                          <span style={{ textDecoration: item.done ? 'line-through' : 'none' }}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompleteJob}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Complete Service & Collect Payment (₹{activeJob.payout})</span>
                  </button>
                </div>
              ) : (
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 18,
                  padding: 40,
                  textAlign: 'center'
                }}>
                  <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>All Done for Now!</h4>
                  <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 20px' }}>
                    You are online. New nearby customer service bookings will sound here automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => setHasNewLead(true)}
                    style={{
                      background: '#1E293B',
                      color: '#A78BFA',
                      border: '1px solid #334155',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Simulate Incoming Job Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WALLET */}
          {activeTab === 'wallet' && (
            <div>
              {/* Wallet Card */}
              <div style={{
                background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 18,
                padding: 24,
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <div style={{ fontSize: 12, color: '#34D399', fontWeight: 700 }}>AVAILABLE WITHDRAWABLE BALANCE</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#FFFFFF', margin: '4px 0' }}>
                    ₹{walletBalance.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>
                    Linked: HDFC Bank (A/C: •••• 4921) • IFSC: HDFC0000085
                  </div>
                </div>

                <button
                  type="button"
                  disabled={walletBalance <= 0 || isWithdrawing}
                  onClick={handleWithdrawFunds}
                  style={{
                    background: walletBalance > 0 ? '#10B981' : '#334155',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: walletBalance > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Wallet size={16} />
                  <span>{isWithdrawing ? 'Processing...' : 'Instant Withdraw to Bank'}</span>
                </button>
              </div>

              {/* Weekly Incentive Tracker */}
              <div style={{
                background: '#131D33',
                border: '1px solid #1E293B',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: '#F1F5F9' }}>🎯 Weekly Target Bonus: 15 Jobs</span>
                  <span style={{ fontWeight: 800, color: '#FBBF24' }}>13 / 15 Jobs Done</span>
                </div>
                <div style={{ height: 10, background: '#1E293B', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: '86%', height: '100%', background: '#F59E0B', borderRadius: 999 }} />
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  Complete <strong>2 more jobs</strong> by Sunday midnight to unlock <strong>₹1,500 cash incentive</strong>!
                </div>
              </div>

              {/* Recent Payout History */}
              <div style={{
                background: '#131D33',
                border: '1px solid #1E293B',
                borderRadius: 16,
                padding: 20
              }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px', color: '#F1F5F9' }}>
                  Recent Payout & Job Credits
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { id: 'TXN-91', title: 'Powerjet AC Service (Split)', time: 'Today, 09:30 AM', amount: '+₹720', tip: '+₹50 tip' },
                    { id: 'TXN-90', title: 'Switchboard Socket Replacement', time: 'Yesterday, 04:15 PM', amount: '+₹140', tip: '' },
                    { id: 'TXN-89', title: 'Drill & Hang Curtain Rods (4 pcs)', time: 'Yesterday, 01:20 PM', amount: '+₹220', tip: '+₹30 tip' },
                    { id: 'TXN-88', title: 'Weekly Bank Payout to HDFC Bank', time: '12 Oct, 11:00 AM', amount: '-₹18,500', tip: 'Settled' },
                  ].map(tx => (
                    <div key={tx.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#0F172A',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #1E293B'
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{tx.title}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{tx.time} • Ref: {tx.id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: tx.amount.startsWith('+') ? '#10B981' : '#CBD5E1'
                        }}>
                          {tx.amount}
                        </div>
                        {tx.tip && <div style={{ fontSize: 10.5, color: '#FBBF24' }}>{tx.tip}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUALITY & CERTIFICATIONS */}
          {activeTab === 'quality' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 16,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <ShieldCheck size={24} color="#10B981" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>Police Background Verification</div>
                      <div style={{ fontSize: 11.5, color: '#10B981', fontWeight: 700 }}>VERIFIED & CLEAN RECORD</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                    Clearance verified by Mumbai Police records. Next annual renewal scheduled for Nov 2026.
                  </p>
                </div>

                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 16,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Award size={24} color="#A78BFA" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>Master Technical Certification</div>
                      <div style={{ fontSize: 11.5, color: '#A78BFA', fontWeight: 700 }}>LEVEL 5 MASTER PRO</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                    Certified in PowerJet high-pressure AC flushing, R32/R410A refrigeration cycle & inverter circuit boards.
                  </p>
                </div>

                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 16,
                  padding: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <CheckCircle2 size={24} color="#FBBF24" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>Tool & Safety Kit Audit</div>
                      <div style={{ fontSize: 11.5, color: '#FBBF24', fontWeight: 700 }}>100% COMPLIANT</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                    All mono-dose authentic chemicals, certified pressure gauges, insulation mats, and safety harnesses present.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
