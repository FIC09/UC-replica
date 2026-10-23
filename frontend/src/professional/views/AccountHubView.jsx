import React from 'react';

export function AccountHubView({ profile, onNavigate, onLogout, onToggleOnline, showToast }) {
  const isOnline = profile?.isOnline !== false;
  const isApproved = profile?.status === 'Approved';

  const menuSections = [
    {
      title: 'Compliance & Verification',
      items: [
        {
          label: 'KYC Documents & Verification',
          desc: 'Aadhaar, PAN, Police clearance, Trade licenses',
          icon: '📄',
          path: '/professional/documents',
          badge: profile?.documents?.pan?.status === 'Changes Requested' ? 'Action Needed' : 'Verified'
        },
        {
          label: 'Onboarding & Application Status',
          desc: 'Progress checklist, review notes, and submission audit',
          icon: '📋',
          path: '/professional/onboarding',
          badge: profile?.status !== 'Approved' ? profile?.status : null
        }
      ]
    },
    {
      title: 'Skill Development & Reputation',
      items: [
        {
          label: 'Academy & Safety SOPs',
          desc: 'Mandatory hygiene protocols and skill certifications',
          icon: '🎓',
          path: '/professional/training',
          badge: 'SOPs Active'
        },
        {
          label: 'Partner Scorecard & Tier',
          desc: 'On-time arrival, revisit rate, cancellation metrics',
          icon: '💎',
          path: '/professional/performance',
          badge: profile?.tier || 'Diamond Pro'
        },
        {
          label: 'Customer Ratings & Reviews',
          desc: 'Doorstep feedback and 5-star badges',
          icon: '⭐',
          path: '/professional/reviews',
          badge: `${profile?.rating || '4.9'} ★`
        }
      ]
    },
    {
      title: 'Operations & Equipment',
      items: [
        {
          label: 'Shift Availability & Slot Booking',
          desc: 'Working hours, weekly calendar, and leave requests',
          icon: '⏱️',
          path: '/professional/availability'
        },
        {
          label: 'Inventory & Consumables',
          desc: 'Spare parts, cleaning solutions, chemical kits',
          icon: '🧰',
          path: '/professional/inventory'
        }
      ]
    },
    {
      title: 'Finance & Banking',
      items: [
        {
          label: 'Payouts & Bank Accounts',
          desc: 'Weekly settlement accounts, instant withdrawals, UTRs',
          icon: '🏦',
          path: '/professional/payouts',
          badge: `₹${(profile?.walletBalance || 0).toLocaleString('en-IN')}`
        },
        {
          label: 'Earnings & Ledgers',
          desc: 'Daily breakdown, incentives, customer tips, deductions',
          icon: '💰',
          path: '/professional/earnings'
        }
      ]
    },
    {
      title: 'Safety & Support',
      items: [
        {
          label: 'Dispatch Broadcasts & Alerts',
          desc: 'System notifications, route updates, SLA reminders',
          icon: '🔔',
          path: '/professional/notifications'
        },
        {
          label: 'App Settings & Preferences',
          desc: 'Language, dark/light theme, alert sounds',
          icon: '⚙️',
          path: '/professional/settings'
        }
      ]
    }
  ];

  return (
    <div style={{
      maxWidth: 960,
      margin: '0 auto',
      padding: '20px 16px 90px 16px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Profile Summary Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
        borderRadius: 24,
        padding: '24px 20px',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(109, 40, 217, 0.3)',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#ffffff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {profile?.avatar || 'VS'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                  {profile?.applicantName || 'Professional'}
                </h1>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {profile?.id || 'PRO-8841'}
                </span>
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
                {profile?.trade || 'Master AC Specialist'}
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                {profile?.employmentType === 'Agency Employed'
                  ? `🏢 Employed by ${profile?.partnerAgencyName || 'Business Partner Agency'}`
                  : '⚡ Direct Independent Freelancer'}
              </div>
            </div>
          </div>

          {/* Online Duty Pill */}
          {isApproved && (
            <button
              onClick={onToggleOnline}
              style={{
                background: isOnline ? '#10b981' : '#ffffff',
                color: isOnline ? '#ffffff' : '#334155',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? '#ffffff' : '#94a3b8' }} />
              {isOnline ? 'Duty Online' : 'Duty Paused'}
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginTop: 20,
          background: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 16,
          padding: '12px 14px',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>★ {profile?.rating || '4.94'}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Customer Rating</div>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{profile?.jobsCompleted || 1520}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Jobs Done</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>₹{(profile?.walletBalance || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Wallet Balance</div>
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      {menuSections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            color: '#6b21a8',
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
            {section.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                onClick={() => onNavigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  borderBottom: itemIdx < section.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.15s ease',
                  minHeight: 48
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}>
                    {item.icon}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {item.badge && (
                    <span style={{
                      background: item.badge === 'Action Needed' ? '#fef3c7' : '#f5f3ff',
                      color: item.badge === 'Action Needed' ? '#b45309' : '#7c3aed',
                      border: `1px solid ${item.badge === 'Action Needed' ? '#fde68a' : '#ddd6fe'}`,
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {item.badge}
                    </span>
                  )}
                  <span style={{ color: '#94a3b8', fontSize: 16 }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Profile Sign Out & Demo Switcher Section */}
      <div style={{
        background: '#ffffff',
        borderRadius: 18,
        border: '1px solid #e2e8f0',
        padding: '18px 20px',
        marginTop: 20
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
          Developer & Demo Session Control
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={() => onNavigate('/professional/login')}
            style={{
              flex: 1,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44
            }}
          >
            Switch Persona Profile
          </button>
          <button
            onClick={onLogout}
            style={{
              flex: 1,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44
            }}
          >
            Log Out of Professional Portal
          </button>
        </div>
      </div>
    </div>
  );
}
