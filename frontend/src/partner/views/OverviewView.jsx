import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Calendar, Briefcase, TrendingUp, CheckCircle2, 
  Clock, AlertCircle, ArrowUpRight, ShieldCheck, ChevronRight, HardHat,
  Filter, RefreshCw, AlertTriangle, Package, Award, CreditCard, Star,
  Info, Shield, UserCheck, XCircle, ChevronDown
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function OverviewView({ onNavigate, showToast, staff }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Filters
  const [dateRange, setDateRange] = useState('all');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [proFilter, setProFilter] = useState('ALL');

  useEffect(() => {
    loadSummary();
  }, [dateRange, cityFilter, categoryFilter, proFilter]);

  async function loadSummary() {
    setLoading(true);
    try {
      const params = {};
      if (dateRange !== 'all') params.dateRange = dateRange;
      if (cityFilter !== 'ALL') params.city = cityFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (proFilter !== 'ALL') params.proId = proFilter;

      const res = await partnerClient.getDashboardSummary(params);
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      showToast?.('Error loading dashboard summary: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const partner = data?.partner || partnerClient.getStoredPartner();
  const metrics = data?.metrics || {
    todayBookings: 0,
    upcomingBookings: 0,
    ongoingBookings: 0,
    unassignedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    activeProfessionals: 0,
    professionalsAvailableToday: 0,
    grossBookingValue: 0,
    platformDeductions: 0,
    netBusinessEarnings: 0,
    pendingSettlementAmount: 0,
    settledAmount: 0,
    openDisputes: 0,
    averageRating: 0,
    growth: {
      grossBookingValueGrowth: '0%',
      bookingVolumeGrowth: '0%'
    },
    teamUtilisation: '0%'
  };

  const definitions = data?.definitions || {};
  const queues = data?.queues || {};
  const trends = data?.trends || {};
  const recentBookings = data?.recentBookings || [];
  const teamSnapshot = data?.teamStatusSnapshot || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filter Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '14px 20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13, fontWeight: 600 }}>
          <Filter size={16} color="#7c3aed" /> Filter Analytics:
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          {/* Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>Period:</span>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, background: '#fff' }}
            >
              <option value="all">All Stored Records</option>
              <option value="today">Today's Appointments</option>
              <option value="week">Past 7 Days</option>
              <option value="month">This Month (30d)</option>
            </select>
          </div>

          {/* City */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>City:</span>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, background: '#fff' }}
            >
              <option value="ALL">All Authorized Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Krishnagiri">Krishnagiri</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
            </select>
          </div>

          {/* Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, background: '#fff' }}
            >
              <option value="ALL">All Service Categories</option>
              <option value="ac-appliances">AC & Appliances</option>
              <option value="cleaning-pest">Cleaning & Pest Control</option>
              <option value="electrician-plumbing">Electrician & Plumbing</option>
            </select>
          </div>

          <button
            onClick={loadSummary}
            title="Refresh dashboard summary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              color: '#475569',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS: 15 Precise Indicators Calculated from Stored Records */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Operational & Financial Performance Metrics
          </h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Click any metric card to view filtered records
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14
        }}>
          {/* 1. Today's Bookings */}
          <div
            onClick={() => onNavigate('/partner/bookings')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Today's Bookings</span>
              <Calendar size={16} color="#7c3aed" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              {metrics.todayBookings}
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a' }}>Scheduled for today</div>
          </div>

          {/* 2. Upcoming Bookings */}
          <div
            onClick={() => onNavigate('/partner/bookings')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Upcoming Bookings</span>
              <Clock size={16} color="#2563eb" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              {metrics.upcomingBookings}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Future appointments</div>
          </div>

          {/* 3. Ongoing Bookings */}
          <div
            onClick={() => onNavigate('/partner/bookings')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Ongoing Bookings</span>
              <HardHat size={16} color="#059669" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#059669', margin: '8px 0 2px' }}>
              {metrics.ongoingBookings}
            </div>
            <div style={{ fontSize: 11.5, color: '#059669' }}>En Route or In Progress</div>
          </div>

          {/* 4. Unassigned Bookings */}
          <div
            onClick={() => onNavigate('/partner/bookings')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: metrics.unassignedBookings > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0',
              background: metrics.unassignedBookings > 0 ? '#fffbeb' : '#ffffff',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Unassigned Bookings</span>
              <AlertCircle size={16} color="#d97706" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: metrics.unassignedBookings > 0 ? '#b45309' : '#0f172a', margin: '8px 0 2px' }}>
              {metrics.unassignedBookings}
            </div>
            <div style={{ fontSize: 11.5, color: metrics.unassignedBookings > 0 ? '#b45309' : '#64748b' }}>
              {metrics.unassignedBookings > 0 ? 'Action required: Dispatch pro' : 'All jobs allocated'}
            </div>
          </div>

          {/* 5. Completed Bookings */}
          <div
            onClick={() => onNavigate('/partner/bookings')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Completed Bookings</span>
              <CheckCircle2 size={16} color="#16a34a" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              {metrics.completedBookings}
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a' }}>Doorstep work fulfilled</div>
          </div>

          {/* 6. Cancelled Bookings */}
          <div
            onClick={() => onNavigate('/partner/bookings')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Cancelled Bookings</span>
              <XCircle size={16} color="#ef4444" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              {metrics.cancelledBookings}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Cancellations tracked</div>
          </div>

          {/* 7. Active Professionals */}
          <div
            onClick={() => onNavigate('/partner/team')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Active Professionals</span>
              <Users size={16} color="#7c3aed" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              {metrics.activeProfessionals}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748b' }}>Verified in business fleet</div>
          </div>

          {/* 8. Available Today */}
          <div
            onClick={() => onNavigate('/partner/calendar')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Available Today</span>
              <UserCheck size={16} color="#16a34a" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', margin: '8px 0 2px' }}>
              {metrics.professionalsAvailableToday}
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a' }}>Ready for dispatch</div>
          </div>

          {/* 9. Gross Booking Value */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Gross Booking Value</span>
              <CreditCard size={16} color="#475569" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              ₹{Number(metrics.grossBookingValue || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Gross customer paid (Not take-home)
            </div>
          </div>

          {/* 10. Platform Deductions */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Platform Deductions</span>
              <Building2 size={16} color="#dc2626" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', margin: '8px 0 2px' }}>
              -₹{Number(metrics.platformDeductions || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: '#dc2626' }}>
              Platform fee & commission (18%)
            </div>
          </div>

          {/* 11. Net Business Earnings */}
          <div
            onClick={() => onNavigate('/partner/earnings')}
            style={{
              background: '#f0fdf4',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #bbf7d0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontSize: 12.5, fontWeight: 700 }}>
              <span>Net Business Earnings</span>
              <TrendingUp size={16} color="#16a34a" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: '8px 0 2px' }}>
              ₹{Number(metrics.netBusinessEarnings || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: '#166534' }}>
              Take-home business agency revenue
            </div>
          </div>

          {/* 12. Pending Settlement Amount */}
          <div
            onClick={() => onNavigate('/partner/settlements')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Pending Settlement</span>
              <Clock size={16} color="#d97706" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              ₹{Number(metrics.pendingSettlementAmount || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11.5, color: '#d97706' }}>Awaiting upcoming cycle</div>
          </div>

          {/* 13. Settled Amount */}
          <div
            onClick={() => onNavigate('/partner/settlements')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Settled Payouts</span>
              <ShieldCheck size={16} color="#16a34a" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              ₹{Number(metrics.settledAmount || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a' }}>Disbursed to bank account</div>
          </div>

          {/* 14. Open Disputes */}
          <div
            onClick={() => onNavigate('/partner/refunds-disputes')}
            style={{
              background: metrics.openDisputes > 0 ? '#fff7ed' : '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: metrics.openDisputes > 0 ? '1px solid #fed7aa' : '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Open Disputes</span>
              <AlertTriangle size={16} color={metrics.openDisputes > 0 ? '#ea580c' : '#94a3b8'} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: metrics.openDisputes > 0 ? '#c2410c' : '#0f172a', margin: '8px 0 2px' }}>
              {metrics.openDisputes}
            </div>
            <div style={{ fontSize: 11.5, color: metrics.openDisputes > 0 ? '#c2410c' : '#64748b' }}>
              Refunds / customer disputes
            </div>
          </div>

          {/* 15. Average Rating */}
          <div
            onClick={() => onNavigate('/partner/reviews')}
            style={{
              background: '#ffffff',
              borderRadius: 12,
              padding: '16px 18px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 12.5, fontWeight: 600 }}>
              <span>Average Rating</span>
              <Star size={16} color="#eab308" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
              ⭐ {metrics.averageRating}
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a' }}>Team utilisation: {metrics.teamUtilisation}</div>
          </div>
        </div>
      </div>

      {/* REVENUE BREAKDOWN & DEFINITIONS CALLOUT */}
      <div style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Info size={18} color="#7c3aed" />
          <span style={{ fontSize: 13, color: '#475569' }}>
            <strong>Revenue Accounting Note:</strong> Gross Booking Value (₹{Number(metrics.grossBookingValue || 0).toLocaleString('en-IN')}) represents total customer price inclusive of taxes. Net Business Earnings (₹{Number(metrics.netBusinessEarnings || 0).toLocaleString('en-IN')}) is your agency take-home after platform commission and GST deductions.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 600 }}>
          <span style={{ color: '#16a34a' }}>Growth: {metrics.growth?.grossBookingValueGrowth || 'N/A (Baseline)'}</span>
          <span style={{ color: '#2563eb' }}>Volume: {metrics.growth?.bookingVolumeGrowth || 'N/A (Baseline)'}</span>
        </div>
      </div>

      {/* QUEUES & ALERTS SECTION (Assignment Queue, Expiring Docs, Training, Low Stock, Disputes) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Assignment Queue */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#d97706" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Unassigned Jobs Queue
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/partner/bookings')}
              style={{ fontSize: 12.5, fontWeight: 600, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>

          {(queues.assignmentQueue || []).length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              All appointments currently assigned to technicians.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(queues.assignmentQueue || []).map(q => (
                <div
                  key={q.id}
                  onClick={() => onNavigate('/partner/bookings')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>#{q.id} • {q.serviceName}</strong>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{q.customerName} • {q.zone}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 8px', borderRadius: 4 }}>
                    Dispatch
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Documents & Training Alerts */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="#7c3aed" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Compliance & Training Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/partner/documents')}
              style={{ fontSize: 12.5, fontWeight: 600, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              KYC Hub
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(queues.expiringDocuments || []).length === 0 && (queues.trainingAlerts || []).length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                All compliance records and training certifications are up to date.
              </div>
            )}
            {(queues.expiringDocuments || []).map(doc => (
              <div
                key={doc.id}
                onClick={() => onNavigate(doc.link)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <strong style={{ fontSize: 12.5, color: '#991b1b' }}>{doc.title}</strong>
                  <div style={{ fontSize: 11.5, color: '#b91c1c' }}>Expires in {doc.expiresDays} days ({doc.expiryDate})</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626' }}>Renew</span>
              </div>
            ))}

            {(queues.trainingAlerts || []).slice(0, 1).map((tr, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate(tr.link)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <strong style={{ fontSize: 12.5, color: '#92400e' }}>{tr.proName} ({tr.module})</strong>
                  <div style={{ fontSize: 11.5, color: '#b45309' }}>{tr.status}</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#d97706' }}>SOP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock & Settlement Exceptions */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#2563eb" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Inventory & Settlement Exceptions
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(queues.lowStockAlerts || []).length === 0 && (queues.settlementExceptions || []).length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No inventory shortages or pending settlement exceptions.
              </div>
            )}
            {(queues.lowStockAlerts || []).map(stk => (
              <div
                key={stk.sku}
                onClick={() => onNavigate(stk.link)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <strong style={{ fontSize: 12.5, color: '#1e40af' }}>{stk.name}</strong>
                  <div style={{ fontSize: 11.5, color: '#2563eb' }}>Current stock: {stk.currentStock} units (Threshold: {stk.minThreshold})</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1d4ed8' }}>Reorder</span>
              </div>
            ))}

            {(queues.settlementExceptions || []).slice(0, 1).map(dsp => (
              <div
                key={dsp.id}
                onClick={() => onNavigate(dsp.link)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <strong style={{ fontSize: 12.5, color: '#9a3412' }}>Dispute #{dsp.id} • {dsp.bookingRef}</strong>
                  <div style={{ fontSize: 11.5, color: '#c2410c' }}>Customer: {dsp.customer} (₹{dsp.amount})</div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ea580c' }}>Respond</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS & TEAM SNAPSHOT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: 20 }}>
        {/* Recent Bookings Table */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Bookings & Appointments
            </h3>
            <button
              onClick={() => onNavigate('/partner/bookings')}
              style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              View All <ChevronRight size={14} style={{ display: 'inline' }} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '8px 10px' }}>Reference</th>
                  <th style={{ padding: '8px 10px' }}>Customer</th>
                  <th style={{ padding: '8px 10px' }}>Service</th>
                  <th style={{ padding: '8px 10px' }}>Assigned Pro</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '28px 10px', textAlign: 'center', color: '#94a3b8' }}>
                      No booking records found for this partner account.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#0f172a' }}>#{b.id}</td>
                      <td style={{ padding: '10px' }}>{b.userName}</td>
                      <td style={{ padding: '10px', color: '#475569' }}>{b.serviceName}</td>
                      <td style={{ padding: '10px' }}>
                        {b.assignedProfessional ? (
                          <span style={{ color: '#0f172a', fontWeight: 500 }}>{b.assignedProfessional.name}</span>
                        ) : (
                          <span style={{ color: '#d97706', fontWeight: 600 }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: b.status === 'Completed' ? '#ecfdf5' : b.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                          color: b.status === 'Completed' ? '#16a34a' : b.status === 'In Progress' ? '#1e40af' : '#b45309'
                        }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Snapshot */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Technician Fleet Snapshot
            </h3>
            <button
              onClick={() => onNavigate('/partner/team')}
              style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Manage Fleet <ChevronRight size={14} style={{ display: 'inline' }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {teamSnapshot.length === 0 ? (
              <div style={{ padding: '28px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No active technicians assigned to fleet.
              </div>
            ) : (
              teamSnapshot.map(tech => (
                <div
                  key={tech.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a' }}>{tech.name}</strong>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{tech.trade}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: tech.attendanceToday?.includes('Available') ? '#ecfdf5' : '#eff6ff',
                      color: tech.attendanceToday?.includes('Available') ? '#16a34a' : '#1d4ed8'
                    }}>
                      {tech.attendanceToday || 'Active'}
                    </span>
                    <div style={{ fontSize: 11.5, color: '#eab308', marginTop: 2 }}>⭐ {tech.rating}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
