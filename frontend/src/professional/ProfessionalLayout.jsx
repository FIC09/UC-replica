import React, { useState, useEffect } from 'react';
import { OfflineBanner } from './views/StateViews';

export function ProfessionalLayout({
  currentPath,
  onNavigate,
  professional,
  profile,
  onLogout,
  onExitToMarketplace,
  onToggleOnline,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = profile?.isOnline !== false;
  const isApproved = profile?.status === 'Approved';

  // Desktop Navigation Menu
  const primaryNavItems = [
    { path: '/professional', label: 'Today (Dashboard)', icon: '🏠' },
    { path: '/professional/jobs', label: 'Jobs & Dispatches', icon: '📋' },
    { path: '/professional/calendar', label: 'Calendar & Slots', icon: '📅' },
    { path: '/professional/earnings', label: 'Money & Ledgers', icon: '💰' },
    { path: '/professional/account', label: 'Account & Hub', icon: '👤' }
  ];

  const secondaryNavItems = [
    { path: '/professional/onboarding', label: 'Onboarding Status', icon: '📝' },
    { path: '/professional/documents', label: 'KYC & Documents', icon: '📄' },
    { path: '/professional/training', label: 'Academy & Safety SOPs', icon: '🎓' },
    { path: '/professional/performance', label: 'Partner Scorecard', icon: '💎' },
    { path: '/professional/reviews', label: 'Customer Reviews', icon: '⭐' },
    { path: '/professional/availability', label: 'Shift Availability', icon: '⏱️' },
    { path: '/professional/payouts', label: 'Payouts & Banking', icon: '🏦' },
    { path: '/professional/inventory', label: 'Inventory & Parts', icon: '🧰' },
    { path: '/professional/shop', label: 'Pro Shop & Uniform', icon: '👕' },
    { path: '/professional/support', label: 'Helpdesk & SOS', icon: '🚨' },
    { path: '/professional/notifications', label: 'Alerts & Broadcasts', icon: '🔔' },
    { path: '/professional/settings', label: 'App Settings', icon: '⚙️' }
  ];

  // Mobile Bottom Navigation Tabs (Strictly matching user spec)
  const mobileTabs = [
    { path: '/professional', label: 'Today', icon: '🏠', exact: true },
    { path: '/professional/jobs', label: 'Jobs', icon: '📋' },
    { path: '/professional/calendar', label: 'Calendar', icon: '📅' },
    { path: '/professional/earnings', label: 'Money', icon: '💰' },
    { path: '/professional/account', label: 'Account', icon: '👤' }
  ];

  const handleNav = (p) => {
    onNavigate(p);
    setMobileMenuOpen(false);
    setShowProfileDropdown(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Offline Connectivity Banner */}
      <OfflineBanner isOffline={isOffline} />

      {/* Top Mobile/Desktop Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Brand & Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation drawer"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: '#334155',
              padding: 6,
              borderRadius: 8,
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="pro-hamburger-btn"
          >
            ☰
          </button>

          <div
            onClick={() => handleNav('/professional')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#7c3aed',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
            }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                Urban Pro
              </div>
              <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 800, letterSpacing: 0.6 }}>
                PARTNER PORTAL
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Duty Status, Wallet, SOS & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Duty Online / Offline Toggle */}
          {isApproved && (
            <button
              onClick={onToggleOnline}
              aria-label={isOnline ? 'Toggle duty offline' : 'Toggle duty online'}
              style={{
                background: isOnline ? '#faf5ff' : '#f1f5f9',
                border: `1.5px solid ${isOnline ? '#c084fc' : '#cbd5e1'}`,
                color: isOnline ? '#6b21a8' : '#64748b',
                padding: '7px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                minHeight: 38
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#94a3b8',
                boxShadow: isOnline ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
              }} />
              <span>{isOnline ? 'Duty Online' : 'Duty Off'}</span>
            </button>
          )}

          {/* Wallet Balance Pill */}
          <div
            onClick={() => handleNav('/professional/payouts')}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minHeight: 38
            }}
            title="Wallet Balance • Click to manage payouts"
          >
            <span style={{ color: '#7c3aed', fontWeight: 800 }}>₹</span>
            <span>{(profile?.walletBalance || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* SOS Emergency Button */}
          <button
            onClick={() => handleNav('/professional/support')}
            title="Emergency SOS Support"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '6px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minHeight: 38
            }}
          >
            <span>🚨</span>
            <span className="pro-sos-text">SOS</span>
          </button>

          {/* Profile Dropdown Trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-label="Open profile menu"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
              }}
            >
              {profile?.avatar || 'VS'}
            </button>

            {showProfileDropdown && (
              <div style={{
                position: 'absolute',
                top: 48,
                right: 0,
                background: '#ffffff',
                borderRadius: 16,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                width: 250,
                padding: '12px 0',
                zIndex: 100
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    {profile?.applicantName || 'Vikram Salvi'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    ID: <strong>{profile?.id || 'PRO-8841'}</strong>
                  </div>
                  <div style={{
                    marginTop: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    display: 'inline-block',
                    background: profile?.status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                    color: profile?.status === 'Approved' ? '#065f46' : '#b45309'
                  }}>
                    {profile?.status || 'Approved'}
                  </div>
                </div>

                <div
                  onClick={() => handleNav('/professional/account')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  👤 My Profile & Account
                </div>
                <div
                  onClick={() => handleNav('/professional/onboarding')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  📋 Onboarding Checklist
                </div>
                <div
                  onClick={() => handleNav('/professional/documents')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  📄 KYC Documents
                </div>
                <div
                  onClick={() => handleNav('/professional/settings')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  ⚙️ App Settings
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />

                <div
                  onClick={onExitToMarketplace}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🏪 Exit to Marketplace
                </div>
                <div
                  onClick={onLogout}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar (visible on screens >= 900px) */}
        <aside
          className={`pro-desktop-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
          style={{
            width: 250,
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ overflowY: 'auto' }}>
            {/* Primary Section */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.8, padding: '0 10px', marginBottom: 8 }}>
              Core Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
              {primaryNavItems.map(item => {
                const active = currentPath === item.path || (item.path !== '/professional' && currentPath.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      width: '100%',
                      background: active ? '#faf5ff' : 'transparent',
                      color: active ? '#7c3aed' : '#334155',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 13,
                      fontWeight: active ? 800 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 17 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Secondary Modules Section */}
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, padding: '0 10px', marginBottom: 8 }}>
              Account & Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {secondaryNavItems.map(item => {
                const active = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      width: '100%',
                      background: active ? '#faf5ff' : 'transparent',
                      color: active ? '#7c3aed' : '#475569',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hub Summary Box */}
          <div style={{
            background: '#faf5ff',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid #ede9fe',
            marginTop: 18
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
              Base Operational Hub
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {profile?.operationalHub || 'Bandra West Central'}
            </div>
            <button
              onClick={onExitToMarketplace}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '6px 0',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                marginTop: 8,
                cursor: 'pointer'
              }}
            >
              Exit to Marketplace
            </button>
          </div>
        </aside>

        {/* Content Viewport */}
        <main style={{ flex: 1, minWidth: 0, paddingBottom: 72 }}>
          {children}
        </main>
      </div>

      {/* Persistent Mobile Bottom Navigation Bar (5 Primary Tabs) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pro-mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 50,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.04)'
        }}
      >
        {mobileTabs.map(tab => {
          const active = tab.exact
            ? currentPath === tab.path
            : currentPath === tab.path || currentPath.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => handleNav(tab.path)}
              aria-label={tab.label}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: active ? '#7c3aed' : '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                fontSize: 11,
                fontWeight: active ? 800 : 600,
                cursor: 'pointer',
                padding: '8px 0',
                minHeight: 48,
                position: 'relative'
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  width: 24,
                  height: 3,
                  borderRadius: 3,
                  background: '#7c3aed'
                }} />
              )}
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Responsive Inline CSS Styles */}
      <style>{`
        @media (max-width: 899px) {
          .pro-desktop-sidebar {
            position: fixed;
            top: 64px;
            bottom: 60px;
            left: -260px;
            z-index: 49;
            transition: left 0.25s ease-in-out;
            box-shadow: 4px 0 20px rgba(0,0,0,0.1);
          }
          .pro-desktop-sidebar.mobile-open {
            left: 0;
          }
          .pro-hamburger-btn {
            display: flex !important;
          }
          .pro-sos-text {
            display: none;
          }
        }
        @media (min-width: 900px) {
          .pro-hamburger-btn {
            display: none !important;
          }
          .pro-mobile-bottom-nav {
            display: none !important;
          }
          main {
            padding-bottom: 24px !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
