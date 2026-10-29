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
  Zap,
  Menu,
  X
} from 'lucide-react';
import { OfflineBanner } from './views/StateViews';
import { getInitials } from './professionalClient';
import { usePlatformSettings } from '../utils/usePlatformSettings';

// Dynamic Page Titles & Subtitles matching Admin Dashboard format
const PAGE_METADATA = {
  '/professional': {
    title: "Today's Operations & Live Dispatches",
    subtitle: "Bandra West Hub dispatches, customer OTP verification lifecycle, and shift duty"
  },
  '/professional/jobs': {
    title: "Jobs & Dispatches Management",
    subtitle: "Track upcoming orders, in-progress jobs, and doorstep customer details"
  },
  '/professional/earnings': {
    title: "Money & Financial Ledgers",
    subtitle: "Daily earnings breakdown, platform commission rates, and tax deductions"
  },
  '/professional/account': {
    title: "Partner Account & Operational Hub",
    subtitle: "Manage KYC credentials, performance scorecards, and app preferences"
  },
  '/professional/onboarding': {
    title: "Onboarding & Application Checklist",
    subtitle: "Verification status, background check, and partner agreement audit"
  },
  '/professional/documents': {
    title: "KYC Documents & Verification",
    subtitle: "Aadhaar, PAN card, police verification, and trade certifications"
  },
  '/professional/availability': {
    title: "Shift Availability & Working Hours",
    subtitle: "Weekly slot scheduling, working hours, and emergency leave requests"
  },
  '/professional/payouts': {
    title: "Payouts & Bank Accounts",
    subtitle: "Weekly bank settlements, instant wallet withdrawals, and UTR logs"
  },
  '/professional/notifications': {
    title: "Dispatch Broadcasts & Alerts",
    subtitle: "System notifications, high-demand weather advisories, and SLA reminders"
  },
  '/professional/settings': {
    title: "App Settings & Operational Preferences",
    subtitle: "Dispatch radar, audio alerts, device sessions, and security PIN"
  }
};

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
  const { isSurgeActive, surgeAmount } = usePlatformSettings();

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
  const isApproved = !profile?.status || profile?.status === 'Approved' || profile?.status === 'Active';

  // Desktop Navigation Menu
  const primaryNavItems = [
    { path: '/professional', label: 'Today (Dashboard)', icon: LayoutDashboard },
    { path: '/professional/jobs', label: 'Jobs & Dispatches', icon: Briefcase },
    { path: '/professional/earnings', label: 'Money & Ledgers', icon: Wallet },
    { path: '/professional/account', label: 'Account & Hub', icon: UserCheck }
  ];

  const secondaryNavItems = [
    { path: '/professional/onboarding', label: 'Onboarding Status', icon: FileCheck },
    { path: '/professional/documents', label: 'KYC & Documents', icon: ShieldCheck },
    { path: '/professional/availability', label: 'Shift Availability', icon: Clock },
    { path: '/professional/payouts', label: 'Payouts & Banking', icon: Landmark },
    { path: '/professional/notifications', label: 'Alerts & Broadcasts', icon: Bell },
    { path: '/professional/settings', label: 'App Settings', icon: Settings }
  ];

  // Mobile Bottom Navigation Tabs (Primary Tabs)
  const mobileTabs = [
    { path: '/professional', label: 'Today', icon: LayoutDashboard, exact: true },
    { path: '/professional/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/professional/earnings', label: 'Money', icon: Wallet },
    { path: '/professional/account', label: 'Account', icon: UserCheck }
  ];

  const handleNav = (p) => {
    onNavigate(p);
    setMobileMenuOpen(false);
    setShowProfileDropdown(false);
  };

  // Resolve active page metadata matching Admin Dashboard header
  const matchedKey = Object.keys(PAGE_METADATA).find(k => {
    if (k === '/professional') return currentPath === '/professional' || currentPath === '/professional/';
    return currentPath === k || currentPath.startsWith(k);
  });
  const pageMeta = matchedKey ? {
    ...PAGE_METADATA[matchedKey],
    subtitle: matchedKey === '/professional'
      ? `${profile?.operationalHub || (profile?.locality ? `${profile.locality} Hub` : 'Krishnagiri Hub')} dispatches, customer OTP verification lifecycle, and shift duty`
      : PAGE_METADATA[matchedKey].subtitle
  } : {
    title: "Urban Pro Partner Portal",
    subtitle: "Manage dispatches, shifts, earnings, and operational compliance"
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Offline Connectivity Banner */}
      <OfflineBanner isOffline={isOffline} />

      {/* ---------------------------------------------------- */}
      {/* LEFT SIDEBAR (Starts at top, exactly like Admin)      */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`pro-desktop-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: 260,
          minWidth: 260,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 50,
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          {/* Brand Header (Aligned with main header, height: 64px) */}
          <div style={{
            height: 64,
            boxSizing: 'border-box',
            flexShrink: 0,
            padding: '0 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div
              onClick={() => handleNav('/professional')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                minWidth: 0
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                flexShrink: 0
              }}>
                <Zap size={20} fill="#ffffff" color="#ffffff" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                    Urban Pro
                  </span>
                  <span style={{
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    padding: '1px 5px',
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 0.3
                  }}>
                    DEMO
                  </span>
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Partner Portal
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Item Scrollable List */}
          <nav
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 12px 10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
            className="pro-sidebar-scroll"
          >
            {/* Primary Section */}
            <div style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: '#7C3AED',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              padding: '0 10px',
              marginBottom: 6
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
                      background: active ? '#FAF5FF' : 'transparent',
                      color: active ? '#7C3AED' : '#334155',
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
                      borderLeft: active ? '3px solid #7C3AED' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <IconComponent size={18} color={active ? '#7C3AED' : '#64748B'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Modules Section */}
            <div style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              padding: '0 10px',
              marginBottom: 6
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
                      background: active ? '#FAF5FF' : 'transparent',
                      color: active ? '#7C3AED' : '#475569',
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
                      if (!active) e.currentTarget.style.background = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <IconComponent size={16} color={active ? '#7C3AED' : '#94A3B8'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Pinned Bottom Log Out Footer */}
          <div style={{
            padding: '14px',
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#FFFFFF',
            flexShrink: 0
          }}>
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                padding: '10px 0',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FEF2F2'}
            >
              <LogOut size={16} color="#DC2626" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN APPLICATION CONTAINER (Matches AdminLayout)     */}
      {/* ---------------------------------------------------- */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header Bar (Exact Admin Dashboard Header Style) */}
        <header className="admin-page-header" style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          height: 64,
          minHeight: 64,
          maxHeight: 64,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
        }}>
          {/* Left: Mobile Hamburger + Page Title & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation drawer"
              className="pro-hamburger-btn"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: 18,
                cursor: 'pointer',
                color: '#334155',
                padding: 6,
                borderRadius: 8,
                minWidth: 36,
                minHeight: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div style={{ minWidth: 0 }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 2px 0',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {pageMeta.title}
              </h2>
              <p style={{
                fontSize: 12,
                color: '#64748B',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {pageMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Duty Online Toggle + Wallet Balance + Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {/* Live Weather Surge Alert Pill (Real-Time Synchronized from Admin) */}
            {isSurgeActive && (
              <div style={{
                background: '#FEF3C7',
                border: '1.5px solid #FDE68A',
                color: '#B45309',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}>
                <Zap size={13} fill="#B45309" color="#B45309" />
                <span>Surge Active (+₹{surgeAmount})</span>
              </div>
            )}

            {/* Duty Online / Offline Toggle */}
            {isApproved && (
              <button
                onClick={onToggleOnline}
                aria-label={isOnline ? 'Toggle duty offline' : 'Toggle duty online'}
                style={{
                  background: isOnline ? '#ECFDF5' : '#F1F5F9',
                  border: `1.5px solid ${isOnline ? '#A7F3D0' : '#CBD5E1'}`,
                  color: isOnline ? '#065F46' : '#64748B',
                  padding: '7px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  cursor: 'pointer',
                  minHeight: 36,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isOnline ? '#10B981' : '#94A3B8',
                  boxShadow: isOnline ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none'
                }} />
                <span>{isOnline ? 'Duty Online' : 'Duty Off'}</span>
              </button>
            )}

            {/* Wallet Balance Pill */}
            <div
              onClick={() => handleNav('/professional/payouts')}
              style={{
                background: '#FAF5FF',
                border: '1px solid #EDE9FE',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                color: '#6B21A8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minHeight: 36,
                transition: 'all 0.15s ease'
              }}
              title="Wallet Balance • Click to manage payouts"
              onMouseEnter={(e) => e.currentTarget.style.background = '#F3E8FF'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FAF5FF'}
            >
              <Wallet size={15} color="#7C3AED" />
              <span>₹{(profile?.walletBalance != null ? profile.walletBalance : 0).toLocaleString('en-IN')}</span>
            </div>

            {/* Profile Dropdown Container */}
            <div className="pro-profile-menu-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                aria-label="Open profile menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                }}
              >
                {getInitials(profile?.applicantName || profile?.name, profile?.avatar)}
              </button>

              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  top: 46,
                  right: 0,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E2E8F0',
                  width: 250,
                  padding: '10px 0',
                  zIndex: 100
                }}>
                  <div style={{ padding: '8px 16px 10px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                      {profile?.applicantName || profile?.name || 'Professional'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      ID: <strong>{profile?.id || profile?.workerId || 'Partner'}</strong>
                    </div>
                    <div style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 10,
                      display: 'inline-block',
                      background: profile?.status === 'Approved' ? '#ECFDF5' : '#FFFBEB',
                      color: profile?.status === 'Approved' ? '#065F46' : '#B45309'
                    }}>
                      {profile?.status || 'Approved'}
                    </div>
                  </div>

                  <div
                    onClick={() => handleNav('/professional/account')}
                    style={{ padding: '9px 16px', fontSize: 12.5, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserCheck size={15} color="#7C3AED" />
                    <span>My Profile & Account</span>
                  </div>
                  <div
                    onClick={() => handleNav('/professional/onboarding')}
                    style={{ padding: '9px 16px', fontSize: 12.5, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FileCheck size={15} color="#7C3AED" />
                    <span>Onboarding Checklist</span>
                  </div>
                  <div
                    onClick={() => handleNav('/professional/documents')}
                    style={{ padding: '9px 16px', fontSize: 12.5, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <ShieldCheck size={15} color="#7C3AED" />
                    <span>KYC Documents</span>
                  </div>
                  <div
                    onClick={() => handleNav('/professional/settings')}
                    style={{ padding: '9px 16px', fontSize: 12.5, color: '#334155', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAF5FF'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={15} color="#7C3AED" />
                    <span>App Settings</span>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', margin: '6px 0' }} />

                  <div
                    onClick={onLogout}
                    style={{ padding: '9px 16px', fontSize: 12.5, color: '#DC2626', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={15} color="#DC2626" />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------- */}
        {/* MAIN BODY CONTENT (Matches AdminLayout scroll area)  */}
        {/* ---------------------------------------------------- */}
        <main style={{
          flex: 1,
          minHeight: 0,
          padding: 0,
          overflowY: 'auto',
          backgroundColor: '#F8FAFC'
        }}>
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
          background: #CBD5E1;
          border-radius: 4px;
        }
        .pro-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        @media (max-width: 899px) {
          .pro-desktop-sidebar {
            position: fixed !important;
            top: 0 !important;
            bottom: 60px !important;
            left: -280px !important;
            height: calc(100vh - 60px) !important;
            z-index: 99 !important;
            transition: left 0.25s ease-in-out;
            box-shadow: 4px 0 20px rgba(0,0,0,0.15);
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
        }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
