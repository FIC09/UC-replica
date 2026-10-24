import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Star, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Filter,
  Building2,
  HardHat,
  HelpCircle,
  CreditCard,
  Wallet,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function OverviewView({ onNavigate, onShowToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filter state
  const [dateRange, setDateRange] = useState('30d');
  const [city, setCity] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [partner, setPartner] = useState('ALL');
  const [showCalculationGuide, setShowCalculationGuide] = useState(false);

  const fetchOverview = React.useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await adminClient.getOverview({ dateRange, city, category, partner });
      if (res && res.data) {
        setData(res.data);
        const timestamp = res.data.lastUpdated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setLastSyncTime(timestamp);
        window.dispatchEvent(new CustomEvent('uc:admin-stats-updated', { detail: res.data }));
      }
    } catch (err) {
      console.error('Error fetching real-time admin overview:', err);
    } finally {
      if (isInitial) setLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, city, category, partner]);

  // Initial fetch and re-fetch when filters change
  useEffect(() => {
    fetchOverview(true);
  }, [fetchOverview]);

  // Real-time live background polling interval (every 5 seconds)
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      fetchOverview(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoSync, fetchOverview]);

  const metrics = data?.metrics || {};
  const trends = data?.trends || {};
  const operationalAlerts = data?.operationalAlerts || [];
  const pendingQueues = data?.pendingQueues || {};
  const recentBookings = data?.recentBookings || [];

  function handleMetricClick(clickTarget) {
    if (clickTarget && onNavigate) {
      onNavigate(clickTarget);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. Global Filter Bar (Flush Sub-Header Toolbar) */}
      <div className="admin-overview-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#334155', flexShrink: 0 }}>
            <Filter size={15} color="#6E42E5" />
            <span>Filters:</span>
          </div>

          {/* Date Range Selector */}
          <div style={{ display: 'flex', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #CBD5E1', padding: 2, flexShrink: 0 }}>
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1Y' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setDateRange(r.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: dateRange === r.id ? '#6E42E5' : 'transparent',
                  color: dateRange === r.id ? '#FFFFFF' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* City Filter */}
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              flex: '1 1 115px',
              maxWidth: 155,
              minWidth: 110
            }}
          >
            <option value="ALL">All Hubs</option>
            <option value="Mumbai">Mumbai Metro</option>
            <option value="Bengaluru">Bengaluru Hub</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Krishnagiri">Krishnagiri Cluster</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              flex: '1 1 115px',
              maxWidth: 155,
              minWidth: 110
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="salon">Salon for Women</option>
            <option value="ac">AC & Appliances</option>
            <option value="cleaning">Cleaning & Pest</option>
            <option value="repairs">Quick Repairs</option>
          </select>

          {/* Business Partner Filter */}
          <select
            value={partner}
            onChange={e => setPartner(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              flex: '1 1 125px',
              maxWidth: 165,
              minWidth: 115
            }}
          >
            <option value="ALL">All Supply</option>
            <option value="direct">Direct Freelance</option>
            <option value="agency">Agency Fleet</option>
          </select>
        </div>

        {/* Real-time Status Badge & Sync Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {/* Live indicator badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11.5,
            fontWeight: 700,
            color: '#15803D'
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#16A34A',
              boxShadow: autoSync ? '0 0 0 3px rgba(22, 163, 74, 0.25)' : 'none',
              display: 'inline-block',
              animation: autoSync ? 'livePulse 2s infinite ease-in-out' : 'none'
            }} />
            <span style={{ letterSpacing: '0.02em' }}>{autoSync ? 'LIVE STREAM' : 'PAUSED'}</span>
            <span style={{ color: '#86EFAC', fontWeight: 400 }}>•</span>
            <span style={{ color: '#166534', fontWeight: 600 }}>{lastSyncTime || data?.lastUpdated || 'Syncing...'}</span>
          </div>

          {/* Auto-Sync Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !autoSync;
              setAutoSync(next);
              if (onShowToast) {
                onShowToast(next ? '🟢 Real-time sync resumed (5s interval)' : '⏸️ Real-time sync paused');
              }
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: autoSync ? '#FFFFFF' : '#FFFBEB',
              fontSize: 11.5,
              fontWeight: 700,
              color: autoSync ? '#475569' : '#B45309',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title={autoSync ? 'Click to pause automatic polling' : 'Click to resume automatic polling'}
          >
            <span>Auto:</span>
            <strong style={{ color: autoSync ? '#16A34A' : '#D97706' }}>{autoSync ? 'ON' : 'OFF'}</strong>
          </button>

          {/* Refresh Now Button */}
          <button
            type="button"
            onClick={() => {
              fetchOverview(false);
              if (onShowToast) onShowToast('⚡ Operational metrics updated in real time');
            }}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#6E42E5',
              cursor: isRefreshing ? 'wait' : 'pointer'
            }}
            title="Recalculate all metrics immediately"
          >
            <RotateCcw
              size={13}
              style={{
                animation: isRefreshing ? 'spin 0.7s linear infinite' : 'none'
              }}
            />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* Calculation Definitions Toggle Button */}
          <button
            type="button"
            onClick={() => setShowCalculationGuide(!showCalculationGuide)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              backgroundColor: showCalculationGuide ? '#EDE9FE' : '#FFFFFF',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#6E42E5',
              cursor: 'pointer',
              padding: '5px 10px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Info size={14} />
            <span>{showCalculationGuide ? 'Hide Rules' : 'Definitions'}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes livePulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>

      {/* Main Content Body */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Calculation Guide Banner (Explaining GBV vs Collected vs Revenue vs Pro Earnings) */}
      {showCalculationGuide && (
        <div style={{
          backgroundColor: '#EDE9FE',
          borderRadius: 12,
          border: '1px solid #DDD6FE',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          fontSize: 12
        }}>
          <div>
            <div style={{ fontWeight: 800, color: '#5B21B6', marginBottom: 2 }}>Gross Booking Value (GBV)</div>
            <div style={{ color: '#4C1D95' }}>Sum of total order values for all scheduled & completed bookings (excludes cancellations).</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#5B21B6', marginBottom: 2 }}>Collected Payments</div>
            <div style={{ color: '#4C1D95' }}>Settled funds received through UPI, Cards, NetBanking, or collected cash from customers.</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#5B21B6', marginBottom: 2 }}>Platform Net Revenue</div>
            <div style={{ color: '#4C1D95' }}>Marketplace take-rate (20% solo / 14-18% partner) + convenience booking fees.</div>
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#5B21B6', marginBottom: 2 }}>Professional & Partner Earnings</div>
            <div style={{ color: '#4C1D95' }}>GBV minus platform commission, credited to technician & agency fleet wallets.</div>
          </div>
        </div>
      )}

      {/* 2. Top Financial & Platform KPIs (Clickable) */}
      <div className="admin-kpi-grid">
        {/* Metric 1: GBV */}
        <div
          onClick={() => handleMetricClick(metrics.grossBookingValue?.clickTarget)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '16px 18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            minWidth: 0
          }}
          title="Click to view full payment transactions"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>Gross Booking Value (GBV)</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IndianRupee size={16} color="#6E42E5" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, whiteSpace: 'nowrap' }}>
            {metrics.grossBookingValue?.formatted || '₹0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11.5, fontWeight: 700, color: metrics.grossBookingValue?.isPositive ? '#16A34A' : '#DC2626', whiteSpace: 'nowrap' }}>
            <span>{metrics.grossBookingValue?.isPositive ? '↑' : '↓'} {metrics.grossBookingValue?.change || 18.2}%</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>vs previous {dateRange}</span>
          </div>
        </div>

        {/* Metric 2: Collected Payments */}
        <div
          onClick={() => handleMetricClick(metrics.collectedPayments?.clickTarget)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '16px 18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            minWidth: 0
          }}
          title="Click to view settled gateway payments"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>Collected Payments</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CreditCard size={16} color="#16A34A" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, whiteSpace: 'nowrap' }}>
            {metrics.collectedPayments?.formatted || '₹0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11.5, fontWeight: 700, color: '#16A34A', whiteSpace: 'nowrap' }}>
            <span>↑ {metrics.collectedPayments?.change || 17.8}%</span>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>settled in bank</span>
          </div>
        </div>

        {/* Metric 3: Platform Net Revenue */}
        <div
          onClick={() => handleMetricClick(metrics.platformRevenue?.clickTarget)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '16px 18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            minWidth: 0
          }}
          title="Click to view financial BI report"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>Platform Net Revenue</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={16} color="#6E42E5" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#6E42E5', letterSpacing: -0.5, whiteSpace: 'nowrap' }}>
            {metrics.platformRevenue?.formatted || '₹0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11.5, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
            <span>Take rate: <strong>{metrics.platformRevenue?.takeRate || '20.0%'}</strong></span>
            <span style={{ color: '#16A34A', fontWeight: 700 }}>+{metrics.platformRevenue?.change || 19.4}%</span>
          </div>
        </div>

        {/* Metric 4: Pro & Partner Pool */}
        <div
          onClick={() => handleMetricClick(metrics.outstandingPayouts?.clickTarget)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '16px 18px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            minWidth: 0
          }}
          title="Click to view pending payout batches"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>Technician & Partner Pool</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5, whiteSpace: 'nowrap' }}>
            {metrics.proEarnings?.formatted || '₹0'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap' }}>
            <span>Ready for payout: <strong>{metrics.outstandingPayouts?.formatted || '₹0'}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Operational Orders & Fulfillment KPIs (Clickable) */}
      <div className="admin-subkpi-grid">
        <div
          onClick={() => handleMetricClick(metrics.totalBookings?.clickTarget)}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0', cursor: 'pointer' }}
          title="View all bookings"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>Total Bookings</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {(metrics.totalBookings?.value ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>
            ↑ {metrics.totalBookings?.change || 16.4}%
          </div>
        </div>

        <div
          onClick={() => handleMetricClick(metrics.todayBookings?.clickTarget)}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0', cursor: 'pointer' }}
          title="View today's bookings"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>Today's Orders</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {metrics.todayBookings?.value ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Scheduled slots</div>
        </div>

        <div
          onClick={() => handleMetricClick(metrics.upcomingAndOngoing?.clickTarget)}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0', cursor: 'pointer' }}
          title="View in-transit orders"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>In-Transit / Active</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0284C7', marginTop: 4 }}>
            {metrics.upcomingAndOngoing?.value ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Ongoing visits</div>
        </div>

        <div
          onClick={() => handleMetricClick(metrics.unassignedBookings?.clickTarget)}
          style={{
            backgroundColor: (metrics.unassignedBookings?.value || 0) > 0 ? '#FEF2F2' : '#FFFFFF',
            borderRadius: 10,
            padding: 14,
            border: (metrics.unassignedBookings?.value || 0) > 0 ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
            cursor: 'pointer'
          }}
          title="Click to auto-dispatch pros"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: (metrics.unassignedBookings?.value || 0) > 0 ? '#DC2626' : '#64748B' }}>
            Unassigned Orders
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: (metrics.unassignedBookings?.value || 0) > 0 ? '#DC2626' : '#0F172A', marginTop: 4 }}>
            {metrics.unassignedBookings?.value ?? 0}
          </div>
          <div style={{ fontSize: 11, color: (metrics.unassignedBookings?.value || 0) > 0 ? '#DC2626' : '#64748B', fontWeight: 600, marginTop: 2 }}>
            Requires pro assign
          </div>
        </div>

        <div
          onClick={() => handleMetricClick(metrics.pendingApplications?.clickTarget)}
          style={{
            backgroundColor: (metrics.pendingApplications?.value || 0) > 0 ? '#FFFBEB' : '#FFFFFF',
            borderRadius: 10,
            padding: 14,
            border: (metrics.pendingApplications?.value || 0) > 0 ? '1px solid #FCD34D' : '1px solid #E2E8F0',
            cursor: 'pointer'
          }}
          title="Review pending partner/pro KYC"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#B45309' }}>Pending Applications</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#B45309', marginTop: 4 }}>
            {metrics.pendingApplications?.value ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>KYC verification</div>
        </div>

        <div
          onClick={() => handleMetricClick(metrics.refunds?.clickTarget)}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0', cursor: 'pointer' }}
          title="View refunds and dispute claims"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>Refunds Issued</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {metrics.refunds?.formatted || '₹0'}
          </div>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>-4.2% dispute rate</div>
        </div>

        <div
          onClick={() => handleMetricClick(metrics.openSupportTickets?.clickTarget)}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0', cursor: 'pointer' }}
          title="View helpdesk support tickets"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>Open Helpdesk</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {metrics.openSupportTickets?.value ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Under 15m SLA</div>
        </div>

        <div
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, border: '1px solid #E2E8F0' }}
          title="Average customer satisfaction rating"
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>Average Rating</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {metrics.averageCustomerRating?.formatted || '⭐ 4.88'}
          </div>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>1.2M+ verified reviews</div>
        </div>
      </div>

      {/* 4. Operational Alerts & Action Notice */}
      {operationalAlerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {operationalAlerts.map(alert => (
            <div
              key={alert.id}
              style={{
                backgroundColor: alert.severity === 'critical' ? '#FEF2F2' : alert.severity === 'warning' ? '#FFFBEB' : '#F0F9FF',
                border: alert.severity === 'critical' ? '1px solid #FCA5A5' : alert.severity === 'warning' ? '1px solid #FDE68A' : '1px solid #BAE6FD',
                borderRadius: 10,
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {alert.severity === 'critical' ? (
                  <AlertCircle size={18} color="#DC2626" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle size={18} color="#D97706" />
                ) : (
                  <Sparkles size={18} color="#0284C7" />
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{alert.title}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{alert.message}</div>
                </div>
              </div>

              <button
                onClick={() => onNavigate(alert.link)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'warning' ? '#D97706' : '#0284C7',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {alert.actionText} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 5. Booking & Revenue Trends Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Booking Volume Trend */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>Daily Booking Volume Trend</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, gap: 12, paddingTop: 10 }}>
            {(() => {
              const bTrends = trends.bookingTrends || [];
              const maxOrders = Math.max(1, ...bTrends.map(b => b.orders || 1));
              return bTrends.map(b => {
                const heightPercent = Math.max(18, Math.min(100, Math.round(((b.orders || 1) / maxOrders) * 100)));
                return (
                  <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{b.orders}</span>
                    <div style={{ width: '100%', height: `${heightPercent}%`, backgroundColor: '#EDE9FE', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                      <div style={{ width: '100%', height: '35%', backgroundColor: '#6E42E5', borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>{b.label}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Status Distribution */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>Order Fulfillment Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(trends.statusDistribution || []).map(s => (
              <div key={s.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{s.status}</span>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{s.count.toLocaleString()} ({s.percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: 7, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${s.percentage}%`, height: '100%', backgroundColor: s.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Top Categories & Metro Zone Fulfillment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Categories */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>Category GMV Contribution</h4>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 11.5 }}>
                <th style={{ padding: '10px 16px' }}>Category</th>
                <th style={{ padding: '10px 16px' }}>Orders</th>
                <th style={{ padding: '10px 16px' }}>GMV Volume</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {(trends.topCategories || []).map(cat => (
                <tr key={cat.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0F172A' }}>{cat.name}</td>
                  <td style={{ padding: '10px 16px', color: '#475569' }}>{cat.orders}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 800, color: '#6E42E5' }}>{cat.revenue}</td>
                  <td style={{ padding: '10px 16px', color: '#16A34A', fontWeight: 700, textAlign: 'right' }}>{cat.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* City Performance */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>Operational Hub Performance</h4>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: 11.5 }}>
                <th style={{ padding: '10px 16px' }}>Metro Hub</th>
                <th style={{ padding: '10px 16px' }}>Active Pros</th>
                <th style={{ padding: '10px 16px' }}>On-Time SLA</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {(trends.cityPerformance || []).map(cp => (
                <tr key={cp.city} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0F172A' }}>{cp.city}</td>
                  <td style={{ padding: '10px 16px', color: '#475569' }}>{cp.activePros} technicians</td>
                  <td style={{ padding: '10px 16px', color: '#16A34A', fontWeight: 700 }}>{cp.slaRate}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700 }}>⭐ {cp.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Recent Dispatches Stream (Click to view order detail) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Dispatches & Live Orders</h4>
            <span style={{ fontSize: 11.5, color: '#64748B' }}>Real-time service orders streaming across active city hubs</span>
          </div>
          <button
            onClick={() => onNavigate('/admin/bookings')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6E42E5',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            View All Orders →
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', fontSize: 11.5, fontWeight: 700 }}>
              <th style={{ padding: '12px 18px' }}>Order ID & Service</th>
              <th style={{ padding: '12px 18px' }}>Customer</th>
              <th style={{ padding: '12px 18px' }}>Slot Time</th>
              <th style={{ padding: '12px 18px' }}>Assigned Pro</th>
              <th style={{ padding: '12px 18px' }}>Amount</th>
              <th style={{ padding: '12px 18px' }}>Status</th>
              <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{b.serviceName || 'Home Service'}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace' }}>{b.id}</div>
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.customerName}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>{b.locality}, {b.city}</div>
                </td>
                <td style={{ padding: '12px 18px', color: '#475569', fontSize: 12.5 }}>
                  {b.slot}
                </td>
                <td style={{ padding: '12px 18px' }}>
                  {b.assignedPartner ? (
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{b.assignedPartner}</span>
                  ) : (
                    <span style={{ color: '#DC2626', fontWeight: 700, fontSize: 12 }}>Unassigned</span>
                  )}
                </td>
                <td style={{ padding: '12px 18px', fontWeight: 800, color: '#0F172A' }}>
                  ₹{b.totalAmount}
                </td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    backgroundColor: b.status === 'Completed' ? '#DCFCE7' : b.status === 'In Progress' ? '#E0F2FE' : b.status === 'Cancelled' ? '#FEE2E2' : '#EDE9FE',
                    color: b.status === 'Completed' ? '#15803D' : b.status === 'In Progress' ? '#0369A1' : b.status === 'Cancelled' ? '#DC2626' : '#6E42E5'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                  <button
                    onClick={() => onNavigate('/admin/bookings')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
