import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  GraduationCap,
  Award,
  Star,
  Clock,
  Package,
  Landmark,
  Wallet,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Copy,
  Check,
  Zap,
  Phone,
  Shield,
  Briefcase,
  ArrowUpRight,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { professionalClient } from '../professionalClient';

export function AccountHubView({ profile, onNavigate, onLogout, onToggleOnline, showToast, onUpdateProfile }) {
  const [copiedId, setCopiedId] = useState(false);
  const [switchingPersona, setSwitchingPersona] = useState(false);

  const isOnline = profile?.isOnline !== false;
  const isApproved = profile?.status === 'Approved' || profile?.status === 'Active';

  const handleCopyId = (e) => {
    e.stopPropagation();
    const idToCopy = profile?.id || 'PRO-8841';
    navigator.clipboard?.writeText(idToCopy).catch(() => {});
    setCopiedId(true);
    if (showToast) showToast(`Partner ID "${idToCopy}" copied to clipboard!`);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSwitchPersona = (demo) => {
    setSwitchingPersona(true);
    try {
      const updatedUser = {
        id: demo.id,
        applicantName: demo.name,
        phone: demo.phone,
        email: demo.email,
        avatar: demo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        trade: demo.role,
        tier: demo.tier,
        employmentType: demo.type.includes('Agency') ? 'Agency Employed' : 'Direct Freelance',
        partnerAgencyName: demo.type.includes('Agency') ? 'Apex Home Solutions LLP' : undefined,
        status: demo.status,
        walletBalance: demo.status === 'Approved' ? 15450 : 0,
        rating: demo.status === 'Approved' ? 4.94 : 0,
        jobsCompleted: demo.status === 'Approved' ? 1520 : 0,
        operationalHub: 'Bandra West Central Hub',
        isOnline: true
      };

      professionalClient.setAuth('simulated-pro-jwt-token', updatedUser);
      if (onUpdateProfile) {
        onUpdateProfile(updatedUser);
      }
      if (showToast) {
        showToast(`Switched active persona to ${demo.name} (${demo.role})`);
      }
    } catch (err) {
      if (showToast) showToast('Failed to switch persona');
    } finally {
      setTimeout(() => setSwitchingPersona(false), 300);
    }
  };

  const menuSections = [
    {
      title: 'Compliance & Verification',
      items: [
        {
          label: 'KYC Documents & Verification',
          desc: 'Aadhaar, PAN, Police clearance, Trade licenses',
          icon: ShieldCheck,
          iconColor: '#059669',
          iconBg: '#ecfdf5',
          path: '/professional/documents',
          badge: profile?.documents?.pan?.status === 'Changes Requested' ? 'Action Needed' : 'Verified',
          badgeType: profile?.documents?.pan?.status === 'Changes Requested' ? 'warning' : 'success'
        },
        {
          label: 'Onboarding & Application Status',
          desc: 'Progress checklist, review notes, and submission audit',
          icon: FileCheck,
          iconColor: '#2563eb',
          iconBg: '#eff6ff',
          path: '/professional/onboarding',
          badge: profile?.status === 'Approved' ? 'Active' : (profile?.status || 'In Review'),
          badgeType: profile?.status === 'Approved' ? 'success' : 'neutral'
        }
      ]
    },
    {
      title: 'Skill Development & Reputation',
      items: [
        {
          label: 'Academy & Safety SOPs',
          desc: 'Mandatory hygiene protocols and skill certifications',
          icon: GraduationCap,
          iconColor: '#7c3aed',
          iconBg: '#f5f3ff',
          path: '/professional/training',
          badge: 'SOPs Active',
          badgeType: 'purple'
        },
        {
          label: 'Partner Scorecard & Tier',
          desc: 'On-time arrival, revisit rate, cancellation metrics',
          icon: Award,
          iconColor: '#d97706',
          iconBg: '#fffbeb',
          path: '/professional/performance',
          badge: profile?.tier ? profile.tier.split('(')[0].trim() : 'Diamond Pro',
          badgeType: 'amber'
        },
        {
          label: 'Customer Ratings & Reviews',
          desc: 'Doorstep feedback, tip bonuses, and 5-star badges',
          icon: Star,
          iconColor: '#ca8a04',
          iconBg: '#fefce8',
          path: '/professional/reviews',
          badge: `${profile?.rating || '4.94'} ★`,
          badgeType: 'amber'
        }
      ]
    },
    {
      title: 'Operations & Equipment',
      items: [
        {
          label: 'Shift Availability & Slot Booking',
          desc: 'Working hours, weekly calendar, and leave requests',
          icon: Clock,
          iconColor: '#0284c7',
          iconBg: '#f0f9ff',
          path: '/professional/availability',
          badge: 'Slots Open',
          badgeType: 'neutral'
        },
        {
          label: 'Inventory & Consumables',
          desc: 'Spare parts, cleaning solutions, chemical kits',
          icon: Package,
          iconColor: '#64748b',
          iconBg: '#f8fafc',
          path: '/professional/inventory',
          badge: 'In Stock',
          badgeType: 'neutral'
        }
      ]
    },
    {
      title: 'Finance & Banking',
      items: [
        {
          label: 'Payouts & Bank Accounts',
          desc: 'Weekly settlement accounts, instant withdrawals, UTRs',
          icon: Landmark,
          iconColor: '#059669',
          iconBg: '#ecfdf5',
          path: '/professional/payouts',
          badge: `₹${(profile?.walletBalance || 0).toLocaleString('en-IN')}`,
          badgeType: 'success'
        },
        {
          label: 'Earnings & Ledgers',
          desc: 'Daily breakdown, incentives, customer tips, deductions',
          icon: Wallet,
          iconColor: '#7c3aed',
          iconBg: '#f5f3ff',
          path: '/professional/earnings',
          badge: 'View Ledger',
          badgeType: 'purple'
        }
      ]
    },
    {
      title: 'Safety & Support',
      items: [
        {
          label: 'Dispatch Broadcasts & Alerts',
          desc: 'System notifications, route updates, SLA reminders',
          icon: Bell,
          iconColor: '#ea580c',
          iconBg: '#fff7ed',
          path: '/professional/notifications',
          badge: '3 Alerts',
          badgeType: 'amber'
        },
        {
          label: 'App Settings & Preferences',
          desc: 'Language, sound alerts, notification preferences',
          icon: Settings,
          iconColor: '#475569',
          iconBg: '#f1f5f9',
          path: '/professional/settings'
        }
      ]
    }
  ];

  const quickActions = [
    {
      label: "Today's Jobs",
      desc: 'Active dispatches & OTP',
      icon: Briefcase,
      color: '#7c3aed',
      bg: '#faf5ff',
      borderColor: '#ede9fe',
      path: '/professional/jobs'
    },
    {
      label: 'Instant Payout',
      desc: 'Withdraw ₹15,450 to bank',
      icon: Landmark,
      color: '#059669',
      bg: '#ecfdf5',
      borderColor: '#d1fae5',
      path: '/professional/payouts'
    },
    {
      label: 'Shift Availability',
      desc: 'Manage weekly slots',
      icon: Clock,
      color: '#2563eb',
      bg: '#eff6ff',
      borderColor: '#dbeafe',
      path: '/professional/availability'
    },
    {
      label: 'Safety SOPs',
      desc: 'Hygiene & protocols',
      icon: GraduationCap,
      color: '#d97706',
      bg: '#fffbeb',
      borderColor: '#fef3c7',
      path: '/professional/training'
    }
  ];

  const demoAccounts = [
    {
      id: 'PRO-8841',
      name: 'Vikram Salvi',
      role: 'Master AC Specialist & Electrician',
      tier: 'Diamond Pro Partner (Level 5)',
      status: 'Approved',
      type: 'Direct Freelance (Independent)',
      phone: '+91 98205 11982',
      email: 'vikram.salvi@urbanpro.com'
    },
    {
      id: 'PRO-8842',
      name: 'Rajesh Kumar',
      role: 'Appliance Repair Specialist',
      tier: 'Platinum Pro Partner (Level 4)',
      status: 'Approved',
      type: 'Independent Professional',
      phone: '+91 98201 44521',
      email: 'rajesh.kumar@urbanpro.com'
    },
    {
      id: 'PRO-8843',
      name: 'Sunil Vishwakarma',
      role: 'Cleaning & Housekeeping Specialist',
      tier: 'Gold Pro Partner (Level 3)',
      status: 'Approved',
      type: 'Agency Employed (Apex Home Solutions LLP)',
      phone: '+91 98332 10984',
      email: 'sunil.v@urbanpro.com'
    },
    {
      id: 'PRO-8845',
      name: 'Kavita Sharma',
      role: 'Salon & Skin Care Specialist',
      tier: 'Onboarding Partner',
      status: 'Under Review',
      type: 'Direct Freelance',
      phone: '+91 98209 88123',
      email: 'kavita.sharma@urbanpro.com'
    }
  ];

  const renderBadge = (badge, badgeType) => {
    if (!badge) return null;
    let bg = '#f1f5f9';
    let color = '#475569';
    let border = '#e2e8f0';

    if (badgeType === 'success') {
      bg = '#ecfdf5';
      color = '#065f46';
      border = '#a7f3d0';
    } else if (badgeType === 'warning') {
      bg = '#fef2f2';
      color = '#991b1b';
      border = '#fecaca';
    } else if (badgeType === 'amber') {
      bg = '#fffbeb';
      color = '#92400e';
      border = '#fde68a';
    } else if (badgeType === 'purple') {
      bg = '#faf5ff';
      color = '#6b21a8';
      border = '#e9d5ff';
    }

    return (
      <span style={{
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        padding: '3px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.2
      }}>
        {badge}
      </span>
    );
  };

  return (
    <div style={{
      maxWidth: 1040,
      margin: '0 auto',
      padding: '24px 20px 90px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Top Breadcrumb & Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
          <span
            onClick={() => onNavigate('/professional')}
            style={{ cursor: 'pointer', color: '#7c3aed', fontWeight: 600 }}
          >
            Dashboard
          </span>
          <span>/</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Account & Partner Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span>Real-time DB Synced</span>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 25%, #4c1d95 65%, #6d28d9 100%)',
        borderRadius: 24,
        padding: '28px 26px',
        color: '#ffffff',
        boxShadow: '0 16px 36px -8px rgba(76, 29, 149, 0.45)',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background circles */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          position: 'relative',
          zIndex: 1
        }}>
          {/* Pro Identity Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#ffffff',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                border: '3px solid rgba(255,255,255,0.3)'
              }}>
                {profile?.avatar || 'VS'}
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} title="Verified Master Pro">
                <Check size={13} color="#ffffff" strokeWidth={3} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.2 }}>
                  {profile?.applicantName || 'Vikram Salvi (Master Pro)'}
                </h1>

                {/* Copyable ID Badge */}
                <button
                  onClick={handleCopyId}
                  title="Click to copy Partner ID"
                  style={{
                    background: 'rgba(255,255,255,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: 14,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    backdropFilter: 'blur(4px)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                >
                  <span>{profile?.id || 'PRO-8841'}</span>
                  {copiedId ? <Check size={12} color="#86efac" /> : <Copy size={12} color="rgba(255,255,255,0.8)" />}
                </button>
              </div>

              {/* Trade & Certification Subtitle */}
              <div style={{ fontSize: 13, opacity: 0.95, marginTop: 5, fontWeight: 500 }}>
                {profile?.trade || 'Master AC Specialist & Electrician'}
              </div>

              {/* Badges Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '2px 9px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <Award size={13} color="#fde047" />
                  <span>{profile?.tier ? profile.tier.split('(')[0].trim() : 'Diamond Pro'}</span>
                </span>

                <span style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '2px 9px',
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <Zap size={13} color="#93c5fd" />
                  <span>
                    {profile?.employmentType === 'Agency Employed'
                      ? `Employed by ${profile?.partnerAgencyName || 'Apex Home Solutions'}`
                      : 'Direct Independent Freelancer'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Top Banner Actions: Duty Toggle & Instant Payout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isApproved && (
              <button
                onClick={onToggleOnline}
                style={{
                  background: isOnline ? '#10b981' : 'rgba(255,255,255,0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '9px 18px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: isOnline ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isOnline ? '#ffffff' : '#94a3b8',
                  boxShadow: isOnline ? '0 0 0 3px rgba(255, 255, 255, 0.4)' : 'none'
                }} />
                <span>{isOnline ? 'Duty Online' : 'Duty Paused'}</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/professional/payouts')}
              style={{
                background: '#ffffff',
                color: '#6d28d9',
                border: 'none',
                padding: '9px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <Wallet size={14} color="#6d28d9" />
              <span>Instant Payout</span>
            </button>
          </div>
        </div>

        {/* 4 Frosted Glass Metric Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 24,
          position: 'relative',
          zIndex: 1
        }}>
          {/* Metric 1: Rating */}
          <div
            onClick={() => onNavigate('/professional/reviews')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: '14px 16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>Customer Rating</div>
              <Star size={14} color="#fde047" fill="#fde047" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              ★ {profile?.rating || '4.94'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
              Top 1% rated in Bandra
            </div>
          </div>

          {/* Metric 2: Jobs Done */}
          <div
            onClick={() => onNavigate('/professional/jobs')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: '14px 16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>Jobs Done</div>
              <Briefcase size={14} color="#93c5fd" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              {(profile?.jobsCompleted || 1520).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
              99.4% Fulfillment SLA
            </div>
          </div>

          {/* Metric 3: Wallet Balance */}
          <div
            onClick={() => onNavigate('/professional/payouts')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: '14px 16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>Wallet Balance</div>
              <Wallet size={14} color="#86efac" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              ₹{(profile?.walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
              Instant payout ready
            </div>
          </div>

          {/* Metric 4: Punctuality */}
          <div
            onClick={() => onNavigate('/professional/performance')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: '14px 16px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>On-Time Rate</div>
              <Clock size={14} color="#fca5a5" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
              99.1%
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
              Average arrival -4 mins
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts (4 Cards Grid) */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          color: '#64748b',
          marginBottom: 12,
          paddingLeft: 4
        }}>
          Quick Actions & Operations
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12
        }}>
          {quickActions.map((qa, i) => {
            const Icon = qa.icon;
            return (
              <div
                key={i}
                onClick={() => onNavigate(qa.path)}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${qa.borderColor}`,
                  borderRadius: 16,
                  padding: '16px 16px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                }}
              >
                <div>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: qa.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12
                  }}>
                    <Icon size={20} color={qa.color} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    {qa.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                    {qa.desc}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  color: qa.color,
                  marginTop: 12
                }}>
                  <span>Open</span>
                  <ArrowUpRight size={14} color={qa.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categorized Menu Modules */}
      {menuSections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: '#7c3aed',
            marginBottom: 10,
            paddingLeft: 4
          }}>
            {section.title}
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {section.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <div
                  key={itemIdx}
                  onClick={() => onNavigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderBottom: itemIdx < section.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'all 0.15s ease',
                    minHeight: 52
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#faf5ff';
                    const chevron = e.currentTarget.querySelector('.pro-menu-chevron');
                    if (chevron) chevron.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    const chevron = e.currentTarget.querySelector('.pro-menu-chevron');
                    if (chevron) chevron.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}>
                      <Icon size={20} color={item.iconColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {renderBadge(item.badge, item.badgeType)}
                    <span
                      className="pro-menu-chevron"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#94a3b8',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Safety & SOS Dispatch Hotline Banner */}
      <div style={{
        background: '#fff1f2',
        border: '1px solid #fecdd3',
        borderRadius: 18,
        padding: '18px 22px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#e11d48',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Phone size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#881337' }}>
              24x7 Partner Safety & Supervisor Dispatch Hotline
            </div>
            <div style={{ fontSize: 12, color: '#9f1239', marginTop: 2 }}>
              Emergency assistance guaranteed within 7 minutes in Bandra West Central zone.
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (showToast) showToast('Connecting to 24x7 Partner Safety Desk (Priority Line: 1800-URBAN-SOS)...');
          }}
          style={{
            background: '#e11d48',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Phone size={14} color="#ffffff" />
          <span>Call Safety Hotline</span>
        </button>
      </div>

      {/* Persona Switcher & Session Controls */}
      <div style={{
        background: '#ffffff',
        borderRadius: 18,
        border: '1px solid #e2e8f0',
        padding: '22px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
              Evaluation & Persona Switcher
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Instant one-click profile switching to test different partner trades and approval stages.
            </div>
          </div>
          <span style={{
            background: '#f1f5f9',
            padding: '3px 10px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            color: '#475569'
          }}>
            Demo Sandbox
          </span>
        </div>

        {/* Persona Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          marginBottom: 18
        }}>
          {demoAccounts.map(demo => {
            const isCurrent = profile?.id === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => handleSwitchPersona(demo)}
                disabled={switchingPersona}
                style={{
                  background: isCurrent ? '#faf5ff' : '#f8fafc',
                  border: isCurrent ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  textAlign: 'left',
                  cursor: isCurrent ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = '#f8fafc';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? '#7c3aed' : '#0f172a' }}>
                      {demo.name}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 6,
                      background: demo.status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                      color: demo.status === 'Approved' ? '#065f46' : '#b45309'
                    }}>
                      {demo.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {demo.role}
                  </div>
                </div>

                {isCurrent && (
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#7c3aed',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid #f1f5f9'
        }}>
          <button
            onClick={() => onNavigate('/professional/login')}
            style={{
              flex: 1,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '11px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
          >
            <UserCheck size={16} color="#475569" />
            <span>Open Login Portal</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              flex: 1,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '11px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
          >
            <LogOut size={16} color="#b91c1c" />
            <span>Log Out of Partner Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
