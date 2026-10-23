import React, { useState } from 'react';
import { 
  Building2, Users, Calendar, Briefcase, TrendingUp, CreditCard, 
  FileText, AlertTriangle, Star, Award, Package, LifeBuoy, Bell, 
  BarChart3, ShieldCheck, UserCheck, History, Settings, ChevronLeft, 
  ChevronRight, LogOut, Menu, X, ArrowUpRight, CheckCircle2, Shield, RotateCcw
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
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const handleConfirmReset = async () => {
    try {
      setResetting(true);
      const res = await partnerClient.resetDemoData({ confirmReset: true });
      if (res.success) {
        setResetMessage('Demo sandbox records have been cleanly reset to default baseline state.');
        setTimeout(() => {
          setShowResetModal(false);
          setResetMessage(null);
          window.location.reload();
        }, 1200);
      } else {
        alert(res.error || 'Failed to reset demo data');
      }
    } catch (err) {
      alert('Reset error: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { path: '/partner', label: 'Overview', icon: Building2 },
        { path: '/partner/bookings', label: 'Bookings & Dispatch', icon: Briefcase, badge: 'Active' },
        { path: '/partner/calendar', label: 'Schedule Board', icon: Calendar },
        { path: '/partner/team', label: 'Technician Fleet', icon: Users },
        { path: '/partner/services', label: 'Service Catalogue', icon: CheckCircle2 },
        { path: '/partner/coverage', label: 'Coverage Zones', icon: ShieldCheck }
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
      group: 'Quality & Growth',
      items: [
        { path: '/partner/reviews', label: 'Customer Reviews', icon: Star },
        { path: '/partner/training', label: 'SOP Training', icon: Award },
        { path: '/partner/inventory', label: 'Consumables Stock', icon: Package },
        { path: '/partner/support', label: 'Priority Support', icon: LifeBuoy }
      ]
    },
    {
      group: 'Administration & RBAC',
      items: [
        { path: '/partner/notifications', label: 'Alerts', icon: Bell },
        { path: '/partner/reports', label: 'Performance Reports', icon: BarChart3 },
        { path: '/partner/documents', label: 'KYC Documents', icon: Shield },
        { path: '/partner/staff', label: 'Staff Accounts', icon: UserCheck },
        { path: '/partner/activity', label: 'Activity Audit Log', icon: History },
        { path: '/partner/settings', label: 'Business Settings', icon: Settings }
      ]
    }
  ];

  // Quick testing demo accounts
  const demoAccounts = [
    { role: 'Business Owner', name: 'Sandeep Patil', email: 'contact@apexhome.in', partnerId: 'PTR-90142' },
    { role: 'Business Manager', name: 'Pooja Patil', email: 'pooja@apexhome.in', partnerId: 'PTR-90142' },
    { role: 'Dispatcher', name: 'Rahul Dev', email: 'dispatcher@apexhome.in', partnerId: 'PTR-90142' },
    { role: 'Finance Staff', name: 'Anand Kulkarni', email: 'finance@apexhome.in', partnerId: 'PTR-90142' },
    { role: 'Read-only Staff', name: 'Meera Joshi', email: 'analyst@apexhome.in', partnerId: 'PTR-90142' },
    { role: 'Business Owner', name: 'M. Selvam', email: 'selvam@quickfixcare.com', partnerId: 'PTR-90143' }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Sidebar for Desktop */}
      <aside style={{
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
      }}>
        {/* Brand Header */}
        <div style={{
          padding: sidebarCollapsed ? '18px 12px' : '20px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 16
              }}>
                UC
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block' }}>
                  Urban Partner
                </span>
                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                  Franchise Portal
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#7c3aed',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              margin: '0 auto'
            }}>
              UC
            </div>
          )}

          <button
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
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Business Badge */}
        {!sidebarCollapsed && (
          <div style={{
            margin: '14px 16px 8px',
            padding: '10px 12px',
            background: '#faf5ff',
            borderRadius: 8,
            border: '1px solid #f3e8ff'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {partner?.businessName || 'Apex Home Solutions LLP'}
            </div>
            <div style={{ fontSize: 11.5, color: '#7c3aed', fontWeight: 600, marginTop: 2 }}>
              ID: {partner?.id || 'PTR-90142'} • {partner?.city || 'Mumbai'}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {navGroups.map(grp => (
            <div key={grp.group}>
              {!sidebarCollapsed && (
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, padding: '0 8px 6px' }}>
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
                      onClick={() => onNavigate(item.path)}
                      title={sidebarCollapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                        padding: sidebarCollapsed ? '10px' : '9px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: isActive ? '#f3e8ff' : 'transparent',
                        color: isActive ? '#7c3aed' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 13.5,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={18} color={isActive ? '#7c3aed' : '#64748b'} />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge && (
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: '#7c3aed',
                          color: '#fff',
                          padding: '1px 6px',
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

        {/* Bottom User Card */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #f1f5f9',
          background: '#ffffff'
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {staff?.name || 'Sandeep Patil'}
                </div>
                <div style={{ fontSize: 11.5, color: '#7c3aed', fontWeight: 600 }}>
                  {staff?.role || 'Business Owner'}
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out of partner portal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                margin: '0 auto'
              }}
            >
              <LogOut size={18} />
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
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          {/* Breadcrumb / Path Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Partner Portal</span>
            <span style={{ fontSize: 13, color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
              {currentPath.replace('/partner/', '').replace('/partner', 'Overview').toUpperCase()}
            </span>
          </div>

          {/* Top Actions: Role Switcher & Marketplace Exit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Demo Role Switcher Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={14} color="#7c3aed" />
                <span>Simulate Role: <strong>{staff?.role}</strong></span>
              </button>

              {roleMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: 260,
                  background: '#ffffff',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  padding: 6,
                  zIndex: 99
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '6px 10px', textTransform: 'uppercase' }}>
                    Switch Demo Business Staff
                  </div>
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.email}
                      onClick={() => {
                        onSwitchRole(acc);
                        setRoleMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: '100%',
                        padding: '8px 10px',
                        background: staff?.email === acc.email ? '#f3e8ff' : 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <strong style={{ fontSize: 13, color: '#0f172a' }}>{acc.role}</strong>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>{acc.name} ({acc.partnerId})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Exit to Customer Marketplace */}
            {onExitToMarketplace && (
              <button
                onClick={onExitToMarketplace}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Marketplace <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </header>

        {/* Visible Demo Mode Persistent Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdf4 100%)',
          borderBottom: '1px solid #bfdbfe',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12.5,
          color: '#1e3a8a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              padding: '2px 8px',
              borderRadius: 12
            }}>
              Demo Sandbox
            </span>
            <span>
              <strong>Persistent Synthetic Sandbox:</strong> Active business: <strong>{partner?.businessName || 'Apex Home Solutions'}</strong> ({partner?.id || 'PTR-90142'}). Isolated from production banking and live customers.
            </span>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #93c5fd',
              color: '#1d4ed8',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <RotateCcw size={13} />
            Reset Demo Data
          </button>
        </div>

        {/* View Content Container */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* Confirmed Demo Reset Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            maxWidth: 480,
            width: '100%',
            padding: 24,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Confirm Demo Sandbox Reset
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                  Affects strictly simulated partner records
                </p>
              </div>
            </div>

            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 20 }}>
              <p style={{ margin: '0 0 10px' }}>
                This will restore all demo bookings, inventory counts, supply orders, technician allocations, support tickets, and activity logs for <strong>PTR-90142</strong> and <strong>PTR-90143</strong> back to default baseline verification records.
              </p>
              <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#475569' }}>
                ✓ Live production records remain completely unaffected.<br />
                ✓ Demo authentication and staff accounts will be refreshed.
              </div>
            </div>

            {resetMessage ? (
              <div style={{ padding: 12, background: '#dcfce7', color: '#166534', borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
                {resetMessage}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setShowResetModal(false)}
                  disabled={resetting}
                  style={{
                    padding: '8px 16px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  disabled={resetting}
                  style={{
                    padding: '8px 18px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {resetting ? 'Resetting...' : 'Yes, Reset Demo Records'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
