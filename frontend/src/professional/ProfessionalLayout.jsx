import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Wallet,
  UserCheck,
  FileCheck,
  ShieldCheck,
  GraduationCap,
  Award,
  Star,
  Clock,
  Landmark,
  Package,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  MapPin,
  Power,
  Menu,
  X,
  Zap,
  ChevronRight
} from 'lucide-react';
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (showProfileDropdown && !e.target.closest('.pro-profile-menu-container')) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const isOnline = profile?.isOnline !== false;
  const isApproved = profile?.status === 'Approved' || profile?.status === 'Active';

  // Desktop Navigation Menu (Crisp Lucide React Icons)
  const primaryNavItems = [
    { path: '/professional', label: 'Today (Dashboard)', icon: LayoutDashboard },
    { path: '/professional/jobs', label: 'Jobs & Dispatches', icon: Briefcase },
    { path: '/professional/calendar', label: 'Calendar & Slots', icon: Calendar },
    { path: '/professional/earnings', label: 'Money & Ledgers', icon: Wallet },
    { path: '/professional/account', label: 'Account & Hub', icon: UserCheck }
  ];

  const secondaryNavItems = [
    { path: '/professional/onboarding', label: 'Onboarding Status', icon: FileCheck },
    { path: '/professional/documents', label: 'KYC & Documents', icon: ShieldCheck },
    { path: '/professional/training', label: 'Academy & Safety SOPs', icon: GraduationCap },
    { path: '/professional/performance', label: 'Partner Scorecard', icon: Award },
    { path: '/professional/reviews', label: 'Customer Reviews', icon: Star },
    { path: '/professional/availability', label: 'Shift Availability', icon: Clock },
    { path: '/professional/payouts', label: 'Payouts & Banking', icon: Landmark },
    { path: '/professional/inventory', label: 'Inventory & Parts', icon: Package },
    { path: '/professional/notifications', label: 'Alerts & Broadcasts', icon: Bell },
    { path: '/professional/settings', label: 'App Settings', icon: Settings }
  ];

  // Mobile Bottom Navigation Tabs (5 Primary Tabs)
  const mobileTabs = [
    { path: '/professional', label: 'Today', icon: LayoutDashboard, exact: true },
    { path: '/professional/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/professional/calendar', label: 'Calendar', icon: Calendar },
    { path: '/professional/earnings', label: 'Money', icon: Wallet },
    { path: '/professional/account', label: 'Account', icon: UserCheck }
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
        padding: '0 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Brand & Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation drawer"
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: 18,
              cursor: 'pointer',
              color: '#334155',
              padding: 8,
              borderRadius: 8,
              minWidth: 40,
              minHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="pro-hamburger-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div
            onClick={() => handleNav('/professional')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
            }}>
              <Zap size={20} fill="#ffffff" color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  Urban Pro
                </span>
                <span style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '1px 6px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.3
                }}>
                  DEMO MODE
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 800, letterSpacing: 0.6 }}>
                PARTNER PORTAL
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Duty Status, Wallet, & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Duty Online / Offline Toggle */}
          {isApproved && (
            <button
              onClick={onToggleOnline}
              aria-label={isOnline ? 'Toggle duty offline' : 'Toggle duty online'}
              style={{
                background: isOnline ? '#ecfdf5' : '#f1f5f9',
                border: `1.5px solid ${isOnline ? '#a7f3d0' : '#cbd5e1'}`,
                color: isOnline ? '#065f46' : '#64748b',
                padding: '7px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                cursor: 'pointer',
                minHeight: 38,
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#94a3b8',
                boxShadow: isOnline ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none'
              }} />
              <span>{isOnline ? 'Duty Online' : 'Duty Off'}</span>
            </button>
          )}

          {/* Wallet Balance Pill */}
          <div
            onClick={() => handleNav('/professional/payouts')}
            style={{
              background: '#faf5ff',
              border: '1px solid #ede9fe',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              color: '#6b21a8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 38,
              transition: 'all 0.15s ease'
            }}
            title="Wallet Balance • Click to manage payouts"
            onMouseEnter={(e) => e.currentTarget.style.background = '#f3e8ff'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#faf5ff'}
          >
            <Wallet size={15} color="#7c3aed" />
            <span>₹{(profile?.walletBalance || 0).toLocaleString('en-IN')}</span>
          </div>

          {/* Profile Dropdown Container */}
          <div className="pro-profile-menu-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-label="Open profile menu"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
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
                width: 260,
                padding: '12px 0',
                zIndex: 100
              }}>
                <div style={{ padding: '8px 16px 12px 16px', borderBottom: '1px solid #f1f5f9' }}>
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
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <UserCheck size={16} color="#7c3aed" />
                  <span>My Profile & Account</span>
                </div>
                <div
                  onClick={() => handleNav('/professional/onboarding')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <FileCheck size={16} color="#7c3aed" />
                  <span>Onboarding Checklist</span>
                </div>
                <div
                  onClick={() => handleNav('/professional/documents')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ShieldCheck size={16} color="#7c3aed" />
                  <span>KYC Documents</span>
                </div>
                <div
                  onClick={() => handleNav('/professional/settings')}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf5ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={16} color="#7c3aed" />
                  <span>App Settings</span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />

                <div
                  onClick={onExitToMarketplace}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#475569', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <ExternalLink size={16} color="#64748b" />
                  <span>Exit to Marketplace</span>
                </div>
                <div
                  onClick={onLogout}
                  style={{ padding: '10px 16px', fontSize: 13, color: '#dc2626', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} color="#dc2626" />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px)' }}>
        {/* Desktop Sidebar (visible on screens >= 900px, sticky with pinned controls) */}
        <aside
          className={`pro-desktop-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
          style={{
            width: 260,
            minWidth: 260,
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            zIndex: 40
          }}
        >
          {/* Scrollable Navigation Area */}
          <div style={{ overflowY: 'auto', padding: '16px 12px 10px 12px', flex: 1 }} className="pro-sidebar-scroll">
            {/* Primary Section */}
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#7c3aed',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              padding: '0 10px',
              marginBottom: 8
            }}>
              Core Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 18 }}>
              {primaryNavItems.map(item => {
                const IconComponent = item.icon;
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
                      padding: '9px 12px',
                      fontSize: 13,
                      fontWeight: active ? 800 : 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderLeft: active ? '3px solid #7c3aed' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <IconComponent size={18} color={active ? '#7c3aed' : '#64748b'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Modules Section */}
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              padding: '0 10px',
              marginBottom: 8
            }}>
              Account & Credentials
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {secondaryNavItems.map(item => {
                const IconComponent = item.icon;
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
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <IconComponent size={16} color={active ? '#7c3aed' : '#94a3b8'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Sidebar Footer */}
          <div style={{
            padding: '12px 14px 14px 14px',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}>
            {/* Hub Summary Box */}
            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <MapPin size={16} color="#7c3aed" />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Operational Hub
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {profile?.operationalHub || 'Bandra West Central'}
                </div>
              </div>
            </div>

            {/* Exit to Marketplace Button */}
            <button
              onClick={onExitToMarketplace}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '7px 0',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <ExternalLink size={14} color="#64748b" />
              <span>Exit to Marketplace</span>
            </button>

            {/* Prominent Red Log Out Button */}
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '7px 0',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
            >
              <LogOut size={14} color="#dc2626" />
              <span>Log Out</span>
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
          const IconComponent = tab.icon;
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
                gap: 4,
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
              <IconComponent size={20} color={active ? '#7c3aed' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Responsive Styles & Scrollbar */}
      <style>{`
        .pro-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .pro-sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .pro-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @media (max-width: 899px) {
          .pro-desktop-sidebar {
            position: fixed !important;
            top: 64px !important;
            bottom: 60px !important;
            left: -280px !important;
            height: calc(100vh - 124px) !important;
            z-index: 49;
            transition: left 0.25s ease-in-out;
            box-shadow: 4px 0 20px rgba(0,0,0,0.1);
          }
          .pro-desktop-sidebar.mobile-open {
            left: 0 !important;
          }
          .pro-hamburger-btn {
            display: flex !important;
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
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
