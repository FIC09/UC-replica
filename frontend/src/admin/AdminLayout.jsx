import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  HardHat, 
  Building2, 
  Wrench, 
  Navigation,
  CreditCard, 
  Wallet, 
  RotateCcw, 
  HelpCircle, 
  Tag, 
  Sliders, 
  Search, 
  ChevronRight, 
  LogOut, 
  CloudRain, 
  X, 
  Command,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  Key,
  Check,
  Bell,
  ExternalLink
} from 'lucide-react';
import { adminClient } from './adminClient';

export function AdminLayout({
  currentPath = '/admin',
  onNavigate,
  adminUser,
  onLogout,
  onNavigateToMarketplace,
  weatherSurge = false,
  onToggleWeatherSurge,
  children
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Global search shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [bookingBadge, setBookingBadge] = useState(null);

  useEffect(() => {
    function handleStatsUpdate(e) {
      if (e.detail?.metrics?.totalBookings?.value) {
        setBookingBadge(String(e.detail.metrics.totalBookings.value));
      }
    }
    window.addEventListener('uc:admin-stats-updated', handleStatsUpdate);
    return () => window.removeEventListener('uc:admin-stats-updated', handleStatsUpdate);
  }, []);

  // Navigation Items Grouping
  const NAV_SECTIONS = [
    {
      title: 'CORE OPERATIONS',
      items: [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/operations', label: 'Live Operations', icon: Navigation, badge: 'Live' },
        { path: '/admin/bookings', label: 'Bookings', icon: ShoppingBag, badge: bookingBadge },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/professionals', label: 'Professionals', icon: HardHat },
        { path: '/admin/partners', label: 'Business Partners', icon: Building2 }
      ]
    },
    {
      title: 'SERVICES & CATALOGUE',
      items: [
        { path: '/admin/services', label: 'Services Catalogue', icon: Wrench }
      ]
    },
    {
      title: 'FINANCE & COMMERCE',
      items: [
        { path: '/admin/payments', label: 'Payments', icon: CreditCard },
        { path: '/admin/payouts', label: 'Payouts Ledger', icon: Wallet, badge: 'Due' },
        { path: '/admin/refunds', label: 'Refunds & Disputes', icon: RotateCcw },
        { path: '/admin/promotions', label: 'Promotions & Coupons', icon: Tag }
      ]
    },
    {
      title: 'QUALITY & SUPPORT',
      items: [
        { path: '/admin/support', label: 'Support Tickets', icon: HelpCircle, badge: '3' }
      ]
    },
    {
      title: 'PLATFORM MANAGEMENT',
      items: [
        { path: '/admin/settings', label: 'Platform Settings', icon: Sliders }
      ]
    }
  ];

  // Flattened items for global search
  const allNavItems = NAV_SECTIONS.flatMap(s => s.items);
  const searchResults = searchQuery.trim()
    ? allNavItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allNavItems.slice(0, 8);



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
      {/* ---------------------------------------------------- */}
      {/* COLLAPSIBLE LEFT SIDEBAR                              */}
      {/* ---------------------------------------------------- */}
      <aside style={{
        width: sidebarCollapsed ? 74 : 260,
        minWidth: sidebarCollapsed ? 74 : 260,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 50,
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
          {/* Brand Header */}
          <div style={{
            height: 64,
            boxSizing: 'border-box',
            flexShrink: 0,
            padding: sidebarCollapsed ? '0 12px' : '0 14px 0 18px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: 8
          }}>
            <div 
              onClick={() => onNavigate('/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                minWidth: 0
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(110, 66, 229, 0.3)',
                flexShrink: 0
              }}>
                <ShieldCheck size={20} />
              </div>
              {!sidebarCollapsed && (
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                    Forge India Connect
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6E42E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Admin Operations
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: sidebarCollapsed ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EDE9FE';
                e.currentTarget.style.color = '#6E42E5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Navigation Item Scrollable List */}
          <nav style={{
            flex: 1,
            overflowY: 'auto',
            padding: sidebarCollapsed ? '12px 8px' : '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            {NAV_SECTIONS.map((section, sIdx) => (
              <div key={section.title || sIdx}>
                {!sidebarCollapsed && (
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0 8px 6px',
                    userSelect: 'none'
                  }}>
                    {section.title}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => onNavigate(item.path)}
                        title={sidebarCollapsed ? item.label : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          width: '100%',
                          padding: sidebarCollapsed ? '10px 0' : '9px 12px',
                          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                          color: isActive ? '#6E42E5' : '#475569',
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                            e.currentTarget.style.color = '#0F172A';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#475569';
                          }
                        }}
                      >
                        <Icon size={18} color={isActive ? '#6E42E5' : '#64748B'} style={{ flexShrink: 0 }} />
                        {!sidebarCollapsed && (
                          <>
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label}
                            </span>
                            {item.badge && (
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: 9999,
                                backgroundColor: isActive ? '#6E42E5' : '#F1F5F9',
                                color: isActive ? '#FFFFFF' : '#64748B'
                              }}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Collapse Toggle & Footer Actions */}
          <div style={{
            padding: sidebarCollapsed ? '10px 8px' : '12px 14px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                title="Expand sidebar navigation"
                style={{
                  width: '100%',
                  padding: '7px 0',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={14} />
              </button>
            )}


            <button
              type="button"
              onClick={onLogout}
              title="Log Out Session"
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '8px 0' : '8px 12px',
                borderRadius: 8,
                border: '1px solid #FEE2E2',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
                e.currentTarget.style.borderColor = '#FCA5A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
                e.currentTarget.style.borderColor = '#FEE2E2';
              }}
            >
              <LogOut size={14} color="#DC2626" />
              {!sidebarCollapsed && <span>Log Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN APPLICATION CONTAINER                           */}
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


        {/* MAIN BODY CONTENT */}
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

      {/* ---------------------------------------------------- */}
      {/* GLOBAL SEARCH DIALOG (⌘K)                             */}
      {/* ---------------------------------------------------- */}
      {showGlobalSearch && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '15vh'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 540,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 18px',
              borderBottom: '1px solid #E2E8F0'
            }}>
              <Search size={18} color="#6E42E5" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search modules, bookings, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 14,
                  outline: 'none',
                  color: '#0F172A',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowGlobalSearch(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', padding: '6px 10px' }}>
                Quick Navigation
              </div>
              {searchResults.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onClick={() => {
                      onNavigate(item.path);
                      setShowGlobalSearch(false);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1E293B'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F3FF'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Icon size={16} color="#6E42E5" />
                    <span>{item.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8' }}>{item.path}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
