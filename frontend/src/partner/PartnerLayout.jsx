import React, { useState } from 'react';
import { 
  Building2, TrendingUp, CreditCard, 
  FileText, AlertTriangle, Bell, 
  BarChart3, ShieldCheck, History, Settings, ChevronLeft, 
  ChevronRight, LogOut, Menu, X, CheckCircle2, Shield, RotateCcw,
  Briefcase, Users, Calendar, Radio
} from 'lucide-react';
import { partnerClient } from './partnerClient';

export function PartnerLayout({
  children,
  currentPath,
  onNavigate,
  onLogout,
  partner,
  staff,
  onSwitchRole,
  onExitToMarketplace
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { path: '/partner', label: 'Overview', icon: Building2 },
        { path: '/partner/live-tracking', label: 'Live Operations', icon: Radio, badge: 'Live' },
        { path: '/partner/bookings', label: 'Bookings & Dispatch', icon: Briefcase },
        { path: '/partner/team', label: 'Field Professionals', icon: Users },
        { path: '/partner/calendar', label: 'Schedule Calendar', icon: Calendar }
      ]
    },
    {
      group: 'Finance & Ledger',
      items: [
        { path: '/partner/earnings', label: 'Business Earnings', icon: TrendingUp },
        { path: '/partner/settlements', label: 'Settlements & Bank', icon: CreditCard },
        { path: '/partner/invoices', label: 'GST Tax Invoices', icon: FileText },
        { path: '/partner/refunds-disputes', label: 'Refunds & Disputes', icon: AlertTriangle }
      ]
    },
    {
      group: 'Administration & RBAC',
      items: [
        { path: '/partner/notifications', label: 'Alerts', icon: Bell },
        { path: '/partner/reports', label: 'Performance Reports', icon: BarChart3 },
        { path: '/partner/documents', label: 'KYC Documents', icon: Shield },
        { path: '/partner/settings', label: 'Business Settings', icon: Settings }
      ]
    }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Sidebar for Desktop & Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 998
          }}
        />
      )}

      <aside
        className={`partner-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: sidebarCollapsed ? 76 : 260,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto'
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: sidebarCollapsed ? '16px 12px' : '18px 18px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          boxSizing: 'border-box'
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: 0.5,
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                flexShrink: 0
              }}>
                FIC
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', lineHeight: 1.2 }}>
                  Forge Partner
                </span>
                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, letterSpacing: 0.2 }}>
                  Enterprise Portal
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
              margin: '0 auto',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
            }}>
              FIC
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              width: 26,
              height: 26,
              display: sidebarCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>


        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {navGroups.map(grp => (
            <div key={grp.group}>
              {!sidebarCollapsed && (
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, padding: '0 8px 6px' }}>
                  {grp.group}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {grp.items.map(item => {
                  const isActive = currentPath === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        onNavigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      title={sidebarCollapsed ? item.label : undefined}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                        padding: sidebarCollapsed ? '10px' : '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: isActive ? '#f5f3ff' : 'transparent',
                        color: isActive ? '#7c3aed' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = '#1e293b';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#475569';
                        }
                      }}
                    >
                      {isActive && (
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: 6,
                          bottom: 6,
                          width: 3.5,
                          borderRadius: '0 4px 4px 0',
                          background: '#7c3aed'
                        }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={18} color={isActive ? '#7c3aed' : '#64748b'} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge && (
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#7c3aed',
                          color: '#fff',
                          padding: '2px 7px',
                          borderRadius: 10
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom User Card & Logout */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid #f1f5f9',
          background: '#ffffff'
        }}>
          {!sidebarCollapsed ? (
            <div>
              {/* Dedicated Clear Log Out Button */}
              <button
                type="button"
                onClick={onLogout}
                title="Log out of partner portal session"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fee2e2';
                }}
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              title="Log Out"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fee2e2';
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{
          height: 64,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            {/* Left: Mobile Hamburger & Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="partner-hamburger-btn"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="Toggle Navigation Menu"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={15} color="#7c3aed" /> Partner Portal
                </span>
                <span style={{ fontSize: 13, color: '#cbd5e1' }}>/</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                  {(() => {
                    for (const group of navGroups) {
                      const match = group.items.find(i => i.path === currentPath);
                      if (match) return match.label;
                    }
                    if (currentPath === '/partner') return 'Overview';
                    return currentPath.replace('/partner/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  })()}
                </span>
              </div>
            </div>

            {/* Right: User info & Direct Header Log Out */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {staff?.name && (
                <div className="partner-header-staff" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span>{staff.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={onLogout}
                title="Log out of partner portal session"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 7,
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fee2e2';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fef2f2';
                }}
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* View Content Container */}
        <main style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', maxWidth: '100vw', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 899px) {
          .partner-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -280px !important;
            bottom: 0 !important;
            height: 100vh !important;
            z-index: 999 !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.2) !important;
            transition: left 0.25s ease-in-out !important;
            width: 260px !important;
          }
          .partner-sidebar.mobile-open {
            left: 0 !important;
          }
          .partner-hamburger-btn {
            display: flex !important;
          }
          .partner-header-staff {
            display: none !important;
          }
        }
        @media (min-width: 900px) {
          .partner-hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
