import React, { useState } from 'react';
import { 
  Building2, Users, Calendar, Briefcase, TrendingUp, CreditCard, 
  FileText, AlertTriangle, Star, Award, Package, LifeBuoy, Bell, 
  BarChart3, ShieldCheck, UserCheck, History, Settings, ChevronLeft, 
  ChevronRight, LogOut, Menu, X, ArrowUpRight, CheckCircle2, Shield, RotateCcw,
  Navigation
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
        { path: '/partner/live-tracking', label: 'Live Worker Tracking', icon: Navigation, badge: 'Live' },
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
                        background: isActive ? '#f5f3ff' : 'transparent',
                        color: isActive ? '#7c3aed' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        boxShadow: isActive ? 'inset 3px 0 0 #7c3aed' : 'none'
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
          padding: '12px 14px',
          borderTop: '1px solid #f1f5f9',
          background: '#ffffff'
        }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  color: '#7c3aed',
                  fontWeight: 800,
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid #e9d5ff'
                }}>
                  {(staff?.name || 'Sandeep Patil').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={staff?.name || 'Sandeep Patil'}>
                    {(staff?.name || 'Sandeep Patil').replace(/\s*\(Agency Owner\)/i, '')}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#7c3aed', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {staff?.role || 'Business Owner'}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign out of partner portal"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.12s ease'
                }}
              >
                <LogOut size={15} />
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Partner Portal</span>
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

          {/* Top Actions: Role Switcher & Marketplace Exit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {staff?.role && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 13px',
                height: 36,
                boxSizing: 'border-box',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#334155'
              }}>
                <UserCheck size={14} color="#7c3aed" />
                <span>Role: <strong style={{ color: '#0f172a' }}>{staff?.role}</strong></span>
              </div>
            )}

            {/* Exit to Customer Marketplace */}
            {onExitToMarketplace && (
              <button
                onClick={onExitToMarketplace}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 13px',
                  height: 36,
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                Marketplace <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </header>

        {/* View Content Container */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
