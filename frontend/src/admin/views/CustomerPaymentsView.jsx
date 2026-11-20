import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  ShieldCheck,
  Tag,
  Copy,
  ExternalLink,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  X,
  Printer
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function CustomerPaymentsView({ onShowToast, onNavigate }) {
  const [payments, setPayments] = useState([]);
  const [kpis, setKpis] = useState({
    totalCollectedRupees: 0,
    pendingCodRupees: 0,
    totalDiscountRupees: 0,
    totalTaxesRupees: 0,
    totalConvenienceFeesRupees: 0,
    totalRefundedRupees: 0,
    totalTransactionsCount: 0,
    paidCount: 0,
    pendingCount: 0,
    refundedCount: 0,
    failedCount: 0,
    avgOrderValueRupees: 0
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchPayments = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await adminClient.getCustomerPayments({
        search,
        status: statusFilter,
        paymentMethod: methodFilter
      });
      if (res && res.success) {
        setPayments(res.payments || []);
        if (res.kpis) setKpis(res.kpis);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn('Failed to load customer payments:', err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
        if (onShowToast) onShowToast('Customer payments refreshed with live data', 'success');
      }
    }
  }, [search, statusFilter, methodFilter, onShowToast]);

  // Initial load
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Real-Time auto sync every 4 seconds + event listener for booking/payment changes
  useEffect(() => {
    const timer = setInterval(() => {
      fetchPayments(false);
    }, 4000);

    function handleRealtimeEvent() {
      fetchPayments(false);
    }

    window.addEventListener('uc:booking-created', handleRealtimeEvent);
    window.addEventListener('uc:payment-updated', handleRealtimeEvent);
    window.addEventListener('booking_status_updated', handleRealtimeEvent);
    window.addEventListener('payment_completed', handleRealtimeEvent);

    return () => {
      clearInterval(timer);
      window.removeEventListener('uc:booking-created', handleRealtimeEvent);
      window.removeEventListener('uc:payment-updated', handleRealtimeEvent);
      window.removeEventListener('booking_status_updated', handleRealtimeEvent);
      window.removeEventListener('payment_completed', handleRealtimeEvent);
    };
  }, [fetchPayments]);

  function handleCopy(text, id) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      if (onShowToast) onShowToast(`Copied ${text}`, 'success');
    }
  }

  function handleExportCsv() {
    if (!payments.length) {
      if (onShowToast) onShowToast('No customer payment records to export', 'error');
      return;
    }

    const headers = [
      'Transaction ID',
      'Booking ID',
      'Date & Time',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Customer Address',
      'Service Booked',
      'Payment Method',
      'Payment Status',
      'Subtotal (INR)',
      'Discount (INR)',
      'Coupon Code',
      'Convenience Fee (INR)',
      'Taxes & GST (INR)',
      'Net Paid Amount (INR)',
      'Gateway Ref'
    ];

    const rows = payments.map(p => [
      `"${p.transactionId || ''}"`,
      `"${p.bookingId || ''}"`,
      `"${new Date(p.paidAt || p.createdAt).toLocaleString()}"`,
      `"${p.customer?.name || ''}"`,
      `"${p.customer?.phone || ''}"`,
      `"${p.customer?.email || ''}"`,
      `"${(p.customer?.address || '').replace(/"/g, '""')}"`,
      `"${p.service?.name || ''}"`,
      `"${p.paymentMethod || ''}"`,
      `"${p.paymentStatus || ''}"`,
      p.financials?.subtotal || 0,
      p.financials?.discount || 0,
      `"${p.financials?.couponCode || ''}"`,
      p.financials?.convenienceFee || 0,
      p.financials?.taxes || 0,
      p.financials?.totalAmount || 0,
      `"${p.gatewayRef || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FIC_Customer_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Customer payments CSV exported successfully', 'success');
  }

  // Filter payments by date range if selected
  const filteredPayments = payments.filter(p => {
    if (dateFilter === 'ALL') return true;
    const pDate = new Date(p.paidAt || p.createdAt);
    const now = new Date();
    if (dateFilter === 'TODAY') {
      return pDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600000);
      return pDate >= oneWeekAgo;
    }
    if (dateFilter === 'MONTH') {
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        paddingBottom: 4
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: -0.5 }}>
              Customer Payments & Billing
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              fontSize: 11,
              fontWeight: 700,
              color: '#065F46'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              Live Real-Time Sync
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Real-time customer checkout payments, gateway confirmations, pricing calculations & tax invoice records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchPayments(true)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: 13,
              fontWeight: 600,
              cursor: isRefreshing ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Real-Time KPI Metric Cards */}
      <div className="admin-kpi-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16
      }}>
        {/* KPI 1: Total Customer Payments Collected */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Paid & Settled
            </span>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <CheckCircle2 size={16} />
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>
            ₹{kpis.totalCollectedRupees.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#059669' }}>{kpis.paidCount} Transactions</span>
            <span>• 100% captured online</span>
          </div>
        </div>

        {/* KPI 2: Pending / COD Payments */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Pending / COD Payments
            </span>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: '#FFFBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}>
              <Clock size={16} />
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>
            ₹{kpis.pendingCodRupees.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#D97706' }}>{kpis.pendingCount} Pending</span>
            <span>• Due upon service completion</span>
          </div>
        </div>

        {/* KPI 3: Real Customer Discounts Given */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Customer Promo Savings
            </span>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366F1'
            }}>
              <Tag size={16} />
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>
            ₹{kpis.totalDiscountRupees.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B' }}>
            DIL DIWALI 250 & festive discounts applied
          </div>
        </div>

        {/* KPI 4: Taxes & Convenience Fees */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Taxes (GST) & Safety Fees
            </span>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}>
              <Receipt size={16} />
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>
            ₹{(kpis.totalTaxesRupees + kpis.totalConvenienceFeesRupees).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B' }}>
            GST 18% (₹{kpis.totalTaxesRupees.toLocaleString('en-IN')}) + Fees (₹{kpis.totalConvenienceFeesRupees.toLocaleString('en-IN')})
          </div>
        </div>
      </div>

      {/* 3. Search & Interactive Filter Controls */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: '16px 18px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Top Filter Row: Search Input + Status Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <div style={{
            position: 'relative',
            flex: '1 1 260px',
            minWidth: 220
          }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by customer name, phone, booking ID, or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 9,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 9,
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginRight: 4 }}>Status:</span>
            {['ALL', 'Paid', 'Pending', 'Refunded', 'Failed'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: statusFilter === st ? 700 : 500,
                  border: statusFilter === st ? '1px solid #4F46E5' : '1px solid #E2E8F0',
                  backgroundColor: statusFilter === st ? '#EEF2FF' : '#FFFFFF',
                  color: statusFilter === st ? '#4F46E5' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Second Filter Row: Payment Method + Date Range Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 8,
          borderTop: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginRight: 4 }}>Method:</span>
            {[
              { id: 'ALL', label: 'All Methods' },
              { id: 'UPI', label: 'UPI (GPay/PhonePe)' },
              { id: 'Card', label: 'Cards' },
              { id: 'COD', label: 'Cash on Delivery' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMethodFilter(m.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: methodFilter === m.id ? 700 : 500,
                  border: methodFilter === m.id ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  backgroundColor: methodFilter === m.id ? '#0F172A' : '#FFFFFF',
                  color: methodFilter === m.id ? '#FFFFFF' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginRight: 4 }}>Date Range:</span>
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'WEEK', label: 'This Week' },
              { id: 'MONTH', label: 'This Month' }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDateFilter(d.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: dateFilter === d.id ? 700 : 500,
                  border: dateFilter === d.id ? '1px solid #6366F1' : '1px solid #E2E8F0',
                  backgroundColor: dateFilter === d.id ? '#EEF2FF' : '#FFFFFF',
                  color: dateFilter === d.id ? '#4F46E5' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Transactions List (Responsive Table on Desktop, Cards on Mobile) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={16} color="#4F46E5" />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              Customer Transactions Ledger
            </span>
            <span style={{
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: '#E2E8F0',
              fontSize: 11,
              fontWeight: 700,
              color: '#475569'
            }}>
              {filteredPayments.length} records
            </span>
          </div>

          <span style={{ fontSize: 11, color: '#94A3B8' }}>
            Auto-syncs every 4s • Last: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
            <div style={{
              width: 24,
              height: 24,
              border: '3px solid #4F46E5',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite'
            }} />
            Loading customer payment records...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
            <Receipt size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              No customer payments found
            </div>
            <p style={{ fontSize: 13, margin: 0 }}>
              Try adjusting your search terms or filters to view records.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on Small Mobile Screens via CSS) */}
            <div className="admin-desktop-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 880 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    <th style={{ padding: '12px 16px' }}>Transaction ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Service Booked</th>
                    <th style={{ padding: '12px 16px' }}>Financial Breakdown</th>
                    <th style={{ padding: '12px 16px' }}>Total Amount</th>
                    <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: 12.5, color: '#334155' }}>
                  {filteredPayments.map((p, idx) => {
                    const isPaid = p.paymentStatus === 'Paid';
                    const isPending = p.paymentStatus === 'Pending';
                    const isRefunded = p.paymentStatus === 'Refunded';

                    return (
                      <tr
                        key={p.id || idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => setSelectedPayment(p)}
                      >
                        {/* Transaction & Booking Ref */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>
                              {p.transactionId}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(p.transactionId, p.id); }}
                              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: copiedId === p.id ? '#059669' : '#94A3B8' }}
                              title="Copy Transaction ID"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 600, marginTop: 2 }}>
                            {p.bookingId}
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.customer?.name}</div>
                          <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Phone size={10} />
                            <span>{p.customer?.phone}</span>
                          </div>
                          <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1 }}>{p.customer?.city}</div>
                        </td>

                        {/* Service Booked */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1E293B', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.service?.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {p.service?.category} • {p.service?.itemCount || 1} item
                          </div>
                        </td>

                        {/* Financial Breakdown */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 11.5, color: '#475569' }}>
                            Subtotal: ₹{p.financials?.subtotal || 0}
                          </div>
                          {p.financials?.discount > 0 && (
                            <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                              Discount: -₹{p.financials.discount} ({p.financials.couponCode || 'Promo'})
                            </div>
                          )}
                          <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            Taxes: ₹{p.financials?.taxes || 0} • Fee: ₹{p.financials?.convenienceFee || 49}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: isPaid ? '#059669' : (isPending ? '#D97706' : '#DC2626') }}>
                            ₹{p.financials?.totalAmount?.toLocaleString('en-IN') || 0}
                          </div>
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>
                            {isPaid ? 'Captured & Settled' : (isPending ? 'Cash / UPI at Doorstep' : 'Processed')}
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: '#F1F5F9',
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: '#334155'
                          }}>
                            <CreditCard size={12} color="#64748B" />
                            <span>{p.paymentMethod}</span>
                          </div>
                        </td>

                        {/* Payment Status Pill */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor: isPaid ? '#ECFDF5' : (isPending ? '#FFFBEB' : (isRefunded ? '#F5F3FF' : '#FEF2F2')),
                            color: isPaid ? '#065F46' : (isPending ? '#B45309' : (isRefunded ? '#6D28D9' : '#991B1B')),
                            border: `1px solid ${isPaid ? '#A7F3D0' : (isPending ? '#FDE68A' : (isRefunded ? '#DDD6FE' : '#FECACA'))}`
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isPaid ? '#10B981' : (isPending ? '#F59E0B' : (isRefunded ? '#8B5CF6' : '#EF4444')) }} />
                            {p.paymentStatus}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '14px 16px', fontSize: 11.5, color: '#64748B', whiteSpace: 'nowrap' }}>
                          {new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                          <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            {new Date(p.paidAt || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedPayment(p); }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#4F46E5',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Eye size={12} />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Optimized for Small Screens / Mobile View of Web App) */}
            <div className="admin-mobile-cards-list" style={{ display: 'none', padding: 12, flexDirection: 'column', gap: 12 }}>
              {filteredPayments.map((p, idx) => {
                const isPaid = p.paymentStatus === 'Paid';
                const isPending = p.paymentStatus === 'Pending';
                const isRefunded = p.paymentStatus === 'Refunded';

                return (
                  <div
                    key={p.id || idx}
                    onClick={() => setSelectedPayment(p)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1' }}>
                        {p.bookingId}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 10.5,
                        fontWeight: 700,
                        backgroundColor: isPaid ? '#ECFDF5' : (isPending ? '#FFFBEB' : '#FEF2F2'),
                        color: isPaid ? '#065F46' : (isPending ? '#B45309' : '#991B1B')
                      }}>
                        {p.paymentStatus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{p.customer?.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{p.service?.name}</div>
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: isPaid ? '#059669' : (isPending ? '#D97706' : '#DC2626') }}>
                        ₹{p.financials?.totalAmount?.toLocaleString('en-IN') || 0}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      borderTop: '1px solid #F1F5F9',
                      fontSize: 11,
                      color: '#64748B'
                    }}>
                      <span>{p.paymentMethod}</span>
                      <span style={{ color: '#4F46E5', fontWeight: 700 }}>View Receipt & Breakdown →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 5. Detailed Payment & Tax Invoice Breakdown Modal */}
      {selectedPayment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Customer Payment Receipt
                  </h3>
                  <span style={{ fontSize: 11, color: '#64748B' }}>
                    Reference: {selectedPayment.transactionId}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Complete Calculation Breakdown */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status Banner */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                backgroundColor: selectedPayment.paymentStatus === 'Paid' ? '#ECFDF5' : '#FFFBEB',
                border: `1px solid ${selectedPayment.paymentStatus === 'Paid' ? '#A7F3D0' : '#FDE68A'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color={selectedPayment.paymentStatus === 'Paid' ? '#059669' : '#D97706'} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: selectedPayment.paymentStatus === 'Paid' ? '#065F46' : '#92400E' }}>
                      {selectedPayment.paymentStatus === 'Paid' ? 'Payment Captured & Verified by NPCI' : 'Payment Awaiting Settlement at Doorstep'}
                    </div>
                    <div style={{ fontSize: 10.5, color: selectedPayment.paymentStatus === 'Paid' ? '#047857' : '#B45309' }}>
                      Gateway ID: {selectedPayment.gatewayRef}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    ₹{selectedPayment.financials?.totalAmount?.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#4F46E5' }}>{selectedPayment.paymentMethod}</span>
                </div>
              </div>

              {/* Customer & Service Info 2-Col Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                fontSize: 12
              }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Customer Details</span>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{selectedPayment.customer?.name}</div>
                  <div style={{ color: '#475569', marginTop: 1 }}>{selectedPayment.customer?.phone}</div>
                  <div style={{ color: '#64748B', fontSize: 11 }}>{selectedPayment.customer?.email}</div>
                  <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>{selectedPayment.customer?.address}</div>
                </div>

                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Booking Details</span>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{selectedPayment.bookingId}</div>
                  <div style={{ color: '#475569', marginTop: 1 }}>{selectedPayment.service?.name}</div>
                  <div style={{ color: '#64748B', fontSize: 11 }}>Category: {selectedPayment.service?.category}</div>
                  <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Technician: {selectedPayment.assignedProfessional}</div>
                </div>
              </div>

              {/* Real Calculation Breakdown Table */}
              <div style={{
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#F1F5F9', fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                  Real-Time Price Calculation Breakdown
                </div>
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                    <span>Service Subtotal (Catalog MRP)</span>
                    <span style={{ fontWeight: 600 }}>₹{selectedPayment.financials?.subtotal || 0}</span>
                  </div>

                  {selectedPayment.financials?.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                      <span>Coupon Discount ({selectedPayment.financials?.couponCode || 'PROMO'})</span>
                      <span>-₹{selectedPayment.financials?.discount}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Platform Convenience & Safety Fee</span>
                    <span>₹{selectedPayment.financials?.convenienceFee || 49}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>Taxes & GST (18%)</span>
                    <span>₹{selectedPayment.financials?.taxes || 0}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid #E2E8F0',
                    fontSize: 15,
                    fontWeight: 800,
                    color: '#0F172A'
                  }}>
                    <span>Net Amount Charged to Customer</span>
                    <span style={{ color: '#059669' }}>₹{selectedPayment.financials?.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Escrow & Security Notice */}
              <div style={{
                fontSize: 11,
                color: '#64748B',
                lineHeight: 1.45,
                backgroundColor: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #E2E8F0'
              }}>
                🔒 <strong>Escrow & SafePay:</strong> Customer payments made online are held securely in the Forge India Connect SafePay escrow and are only settled to the technician following the 4-digit completion safety PIN approval.
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              backgroundColor: '#F8FAFC'
            }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Printer size={13} />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedPayment(null)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

