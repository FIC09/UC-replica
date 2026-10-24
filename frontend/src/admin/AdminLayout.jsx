import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  HardHat, 
  Building2, 
  Wrench, 
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
  Key,
  Check
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDemoLoginsModal, setShowDemoLoginsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resettingDemo, setResettingDemo] = useState(false);

  // Global search shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
        setShowNotifications(false);
        setShowUserDropdown(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [bookingBadge, setBookingBadge] = useState('143');

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
        { path: '/admin/bookings', label: 'Bookings', icon: ShoppingBag, badge: bookingBadge },
        { path: '/admin/customers', label: 'Customers', icon: Users },
        { path: '/admin/professionals', label: 'Professionals', icon: HardHat, badge: '5' },
        { path: '/admin/partners', label: 'Business Partners', icon: Building2, badge: '3' }
      ]
    },
    {
      title: 'SERVICES & CATALOGUE',
      items: [
        { path: '/admin/services', label: 'Services Catalogue', icon: Wrench, badge: '51' }
      ]
    },
    {
      title: 'FINANCE & COMMERCE',
      items: [
        { path: '/admin/payments', label: 'Payments', icon: CreditCard },
        { path: '/admin/payouts', label: 'Payouts Ledger', icon: Wallet, badge: 'Due' },
        { path: '/admin/refunds', label: 'Refunds & Disputes', icon: RotateCcw, badge: '1' },
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

  // Derive Breadcrumbs
  const currentItem = allNavItems.find(item => item.path === currentPath) || { label: 'Overview' };
  const currentSection = NAV_SECTIONS.find(s => s.items.some(i => i.path === currentPath))?.title || 'OPERATIONS';

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
            padding: sidebarCollapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: 12
          }}>
            <div 
              onClick={() => onNavigate('/admin')}
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
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                    Forge India Connect
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6E42E5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Admin Operations
                  </div>
                </div>
              )}
            </div>
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
            padding: sidebarCollapsed ? '12px 8px' : '12px 14px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <button
              type="button"
              onClick={onLogout}
              title="Log Out Session"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #FEE2E2',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: 12.5,
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
              <LogOut size={16} color="#DC2626" />
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

      {/* DEMO LOGINS DOCUMENTATION MODAL */}
      {showDemoLoginsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: 600,
            maxWidth: '92vw',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Key size={18} color="#6E42E5" /> Local Demo Administrator Logins
                </h4>
                <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0 0' }}>
                  Pre-configured accounts for testing role-based access control and dashboard capabilities
                </p>
              </div>
              <button
                onClick={() => setShowDemoLoginsModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 22, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD6FE',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12.5,
                color: '#5B21B6'
              }}>
                <strong>Common Password:</strong> All demo accounts use <code>admin123</code> (or <code>admin@123</code>).
              </div>

              {[
                { role: 'Super Admin', email: 'admin@urbancompany.com', desc: 'Unrestricted full access across all operations, financial releases, settings & team controls' },
                { role: 'Operations Manager', email: 'ops@urbancompany.com', desc: 'Dispatches, technician allocations, partner verifications and coverage zones' },
                { role: 'Finance Manager', email: 'finance@urbancompany.com', desc: 'NEFT weekly payout batches, refund processing, settlement accounts & financial analytics' },
                { role: 'Support Agent', email: 'support@urbancompany.com', desc: 'Customer escalation tickets, internal notes, revisits and review moderation' },
                { role: 'Catalogue Manager', email: 'catalogue@urbancompany.com', desc: 'Service offerings, pricing, promotional coupons, warehouse spare parts & marketing CMS' },
                { role: 'Read-only Analyst', email: 'analyst@urbancompany.com', desc: 'Read-only business analytics, SLA dashboards, CSV exports and audit inspection' }
              ].map((acc, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>{acc.role}</span>
                      <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, backgroundColor: '#F1F5F9', color: '#475569', fontFamily: 'monospace' }}>
                        {acc.email}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{acc.desc}</div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(acc.email);
                      alert(`Copied ${acc.email} to clipboard!`);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Copy Email
                  </button>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDemoLoginsModal(false)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET DEMO CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: 480,
            maxWidth: '92vw',
            padding: 24,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#DC2626', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={18} color="#DC2626" /> Reset Demo Sandbox Data
            </h4>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to reset the demonstration sandbox? This action will:
            </p>

            <ul style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6, paddingLeft: 20, margin: '0 0 20px 0' }}>
              <li>Reset all 6 administrative accounts to active status with default credentials</li>
              <li>Re-establish baseline default booking states and dispatch assignments</li>
              <li>Revert any temporary stock deductions or surge fee overrides</li>
              <li>Write an immutable entry to the system audit trail</li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={resettingDemo}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resettingDemo}
                onClick={() => {
                  setResettingDemo(true);
                  adminClient.resetDemoData()
                    .then(() => {
                      setResettingDemo(false);
                      setShowResetConfirm(false);
                      window.location.reload();
                    })
                    .catch(() => {
                      setResettingDemo(false);
                      setShowResetConfirm(false);
                      window.location.reload();
                    });
                }}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', cursor: 'pointer', fontWeight: 700 }}
              >
                {resettingDemo ? 'Resetting Sandbox...' : 'Confirm Demo Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
