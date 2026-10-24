import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  User, 
  Phone, 
  Mail,
  MapPin, 
  Calendar, 
  CreditCard, 
  Wrench, 
  IndianRupee,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Plus,
  RefreshCw,
  Printer,
  Shield,
  ArrowUpDown,
  MessageSquare,
  FileText,
  Ban,
  RotateCcw,
  Check,
  Sparkles,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { adminClient } from '../adminClient';

// Valid Lifecycle Pipeline definition
const LIFECYCLE_STAGES = ['Pending', 'Confirmed', 'Assigned', 'En Route', 'In Progress', 'Completed'];

const VALID_TRANSITIONS = {
  'Pending': ['Confirmed', 'Cancelled', 'Failed'],
  'Confirmed': ['Assigned', 'Cancelled', 'Failed'],
  'Assigned': ['En Route', 'Assigned', 'Confirmed', 'Cancelled', 'Failed'],
  'En Route': ['In Progress', 'Cancelled', 'Failed'],
  'In Progress': ['Completed', 'Failed', 'Cancelled'],
  'Completed': [],
  'Cancelled': [],
  'Failed': ['Pending', 'Cancelled']
};

export function BookingsView({ onShowToast, onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Active Drawers / Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Action Form States
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedProForAssign, setSelectedProForAssign] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ newDate: '', newSlot: '10:00 AM - 11:30 AM', reason: 'Customer requested schedule adjustment' });
  const [cancelData, setCancelData] = useState({ reason: 'Customer requested cancellation', feeCharged: 0 });
  const [refundData, setRefundData] = useState({ amount: '', reason: 'Service quality dispute' });

  // Fetch bookings with current filters
  const fetchBookingsList = () => {
    setLoading(true);
    const params = {
      search,
      status: statusFilter,
      paymentStatus: paymentFilter,
      city: cityFilter,
      category: categoryFilter,
      partnerAgency: partnerFilter,
      assigned: assignedFilter,
      dateRange: dateRangeFilter,
      sortBy,
      sortOrder,
      page,
      limit: 10
    };

    adminClient.getBookings(params)
      .then(res => {
        setBookings(res.bookings || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookingsList();
  }, [search, statusFilter, paymentFilter, cityFilter, categoryFilter, partnerFilter, assignedFilter, dateRangeFilter, sortBy, sortOrder, page]);

  // Load available professionals for assignment
  useEffect(() => {
    adminClient.getProfessionals({ limit: 50 })
      .then(res => setProfessionals(res.professionals || []))
      .catch(() => {});
  }, []);

  // Update lifecycle transition
  function handleTransition(newStatus) {
    if (!selectedBooking) return;
    adminClient.updateLifecycleStatus(selectedBooking.id, newStatus, `Lifecycle transitioned to ${newStatus}`)
      .then(() => {
        onShowToast && onShowToast(`✓ Booking ${selectedBooking.id} moved to ${newStatus}`);
        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: newStatus } : b));
        setSelectedBooking(prev => ({
          ...prev,
          status: newStatus,
          timeline: [
            ...(prev.timeline || []),
            {
              id: 'tl-' + Date.now(),
              status: newStatus,
              title: `Status set to ${newStatus}`,
              description: `Lifecycle transition triggered by Administrator`,
              actor: 'Administrator',
              actorRole: 'Admin',
              timestamp: new Date()
            }
          ]
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error updating status: ${err.message}`);
      });
  }

  // Handle Assign Professional
  function handleAssignProSubmit() {
    if (!selectedBooking || !selectedProForAssign) return;
    const pro = professionals.find(p => (p.id || p._id) === selectedProForAssign);
    if (!pro) return;

    adminClient.assignProfessional(selectedBooking.id, {
      professionalId: pro.id || pro._id,
      professionalName: pro.applicantName || pro.name,
      professionalPhone: pro.phone,
      trade: pro.trade || pro.tradeName || 'Specialist Technician',
      partnerAgency: pro.partnerAgencyName || ''
    })
      .then(() => {
        onShowToast && onShowToast(`✓ Professional ${pro.applicantName || pro.name} assigned to ${selectedBooking.id}`);
        setShowAssignModal(false);
        fetchBookingsList();
        if (selectedBooking) {
          setSelectedBooking(prev => ({
            ...prev,
            status: 'Assigned',
            assignedPartner: pro.applicantName || pro.name,
            assignedProfessional: {
              id: pro.id || pro._id,
              name: pro.applicantName || pro.name,
              phone: pro.phone,
              trade: pro.trade || pro.tradeName || 'Specialist Technician'
            }
          }));
        }
      })
      .catch(err => {
        onShowToast && onShowToast(`Assignment notice: ${err.message}`);
      });
  }

  // Handle Reschedule
  function handleRescheduleSubmit() {
    if (!selectedBooking) return;
    adminClient.rescheduleBooking(selectedBooking.id, rescheduleData.newSlot, rescheduleData.newDate, rescheduleData.reason)
      .then(() => {
        onShowToast && onShowToast(`✓ Booking ${selectedBooking.id} rescheduled to ${rescheduleData.newDate} (${rescheduleData.newSlot})`);
        setShowRescheduleModal(false);
        fetchBookingsList();
        setSelectedBooking(prev => ({
          ...prev,
          slot: `${rescheduleData.newDate}, ${rescheduleData.newSlot}`
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error rescheduling: ${err.message}`);
      });
  }

  // Handle Cancel
  function handleCancelSubmit() {
    if (!selectedBooking) return;
    adminClient.cancelBooking(selectedBooking.id, cancelData.reason, cancelData.feeCharged)
      .then(() => {
        onShowToast && onShowToast(`✓ Booking ${selectedBooking.id} cancelled`);
        setShowCancelModal(false);
        fetchBookingsList();
        setSelectedBooking(prev => ({ ...prev, status: 'Cancelled' }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error cancelling: ${err.message}`);
      });
  }

  // Handle Refund
  function handleRefundSubmit() {
    if (!selectedBooking) return;
    const amount = parseFloat(refundData.amount) || selectedBooking.totalAmount;
    adminClient.refundBooking(selectedBooking.id, amount, refundData.reason)
      .then(() => {
        onShowToast && onShowToast(`✓ Refund of ₹${amount} initiated for ${selectedBooking.id}`);
        setShowRefundModal(false);
        fetchBookingsList();
        setSelectedBooking(prev => ({
          ...prev,
          paymentStatus: 'Refunded',
          refundDetails: {
            amount,
            status: 'Processed',
            reason: refundData.reason,
            refundedAt: new Date()
          }
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Refund issue: ${err.message}`);
      });
  }

  // Handle Internal Note
  function handleAddNoteSubmit(e) {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedBooking) return;
    adminClient.addBookingNote(selectedBooking.id, newNoteText)
      .then(() => {
        const newNoteObj = {
          id: 'note-' + Date.now(),
          note: newNoteText,
          author: 'Admin Operator',
          authorRole: 'Operations Dispatcher',
          createdAt: new Date()
        };
        setSelectedBooking(prev => ({
          ...prev,
          internalNotes: [...(prev.internalNotes || []), newNoteObj]
        }));
        setNewNoteText('');
        onShowToast && onShowToast('✓ Internal note recorded');
      })
      .catch(err => {
        onShowToast && onShowToast(`Error adding note: ${err.message}`);
      });
  }

  // Export CSV
  function handleExportCSV() {
    const headers = [
      'Booking Reference',
      'Customer Name',
      'Customer Phone',
      'Service Name',
      'Category',
      'Assigned Professional',
      'Partner Agency',
      'City',
      'Zone',
      'Scheduled Slot',
      'Booking Status',
      'Payment Status',
      'Total Amount (INR)',
      'Created Date'
    ];

    const rows = bookings.map(b => [
      `"${b.id || b.bookingReference || ''}"`,
      `"${b.userName || b.customerName || ''}"`,
      `"${b.userPhone || ''}"`,
      `"${b.serviceName || ''}"`,
      `"${b.serviceCategory || ''}"`,
      `"${b.assignedPartner || b.assignedProfessional?.name || 'Unassigned'}"`,
      `"${b.partnerAgency || b.assignedBusinessPartner?.name || 'Direct'}"`,
      `"${b.city || ''}"`,
      `"${b.serviceZone || b.locality || ''}"`,
      `"${b.slot || ''}"`,
      `"${b.status || ''}"`,
      `"${b.paymentStatus || ''}"`,
      `"${b.totalAmount || 0}"`,
      `"${new Date(b.createdAt || Date.now()).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Urban_Bookings_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast && onShowToast('📥 Bookings exported to CSV');
  }

  // Status Badge Helper
  function renderStatusBadge(status) {
    const s = (status || 'Pending').toLowerCase();
    let bg = '#F1F5F9';
    let color = '#475569';
    let border = '#CBD5E1';

    if (s === 'completed') {
      bg = '#F0FDF4'; color = '#16A34A'; border = '#BBF7D0';
    } else if (s === 'in progress') {
      bg = '#EFF6FF'; color = '#0284C7'; border = '#BFDBFE';
    } else if (s === 'en route') {
      bg = '#F5F3FF'; color = '#7C3AED'; border = '#DDD6FE';
    } else if (s === 'assigned') {
      bg = '#FAF5FF'; color = '#6E42E5'; border = '#E9D5FF';
    } else if (s === 'confirmed') {
      bg = '#ECFDF5'; color = '#059669'; border = '#A7F3D0';
    } else if (s === 'pending') {
      bg = '#FFFBEB'; color = '#D97706'; border = '#FDE68A';
    } else if (s === 'cancelled' || s === 'failed') {
      bg = '#FEF2F2'; color = '#DC2626'; border = '#FECACA';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
        {status}
      </span>
    );
  }

  // Payment Badge Helper
  function renderPaymentBadge(status) {
    const s = (status || 'Pending').toLowerCase();
    let bg = '#F1F5F9';
    let color = '#475569';

    if (s === 'paid') {
      bg = '#DCFCE7'; color = '#15803D';
    } else if (s === 'refunded') {
      bg = '#FEF3C7'; color = '#B45309';
    } else if (s === 'failed') {
      bg = '#FEE2E2'; color = '#B91C1C';
    } else {
      bg = '#FEF9C3'; color = '#854D0E';
    }

    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: bg,
        color: color
      }}>
        {status || 'Pending'}
      </span>
    );
  }

  // Check possible next lifecycle transitions
  const currentTransitions = selectedBooking ? (VALID_TRANSITIONS[selectedBooking.status] || []) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Header & Fast Action Bar */}
      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0', lineHeight: 1.25 }}>
            Bookings &amp; Dispatch Control
          </h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.2 }}>
            Real-time home services scheduling, lifecycle management, technician assignment, and billing
          </p>
        </div>
      </div>

      <div className="admin-page-body">
        {/* Comprehensive Filter Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '18px 20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        {/* Search & Main Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: 8,
            padding: '8px 14px',
            flex: '1 1 280px',
            minWidth: 260
          }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search reference, customer, phone, service, pro, address..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                fontSize: 13,
                color: '#0F172A'
              }}
            />
            {search && (
              <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
            )}
          </div>

          {/* Booking Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Booking Statuses</option>
            <option value="Pending">Pending Dispatch</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Assigned">Assigned to Pro</option>
            <option value="En Route">Technician En Route</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Payment Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={e => { setCityFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Cities</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Krishnagiri">Krishnagiri</option>
          </select>

          {/* Assigned vs Unassigned */}
          <select
            value={assignedFilter}
            onChange={e => { setAssignedFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Assignments</option>
            <option value="assigned">Assigned to Professional</option>
            <option value="unassigned">⚠️ Unassigned (Need Pro)</option>
          </select>

          {/* Partner Agency Filter */}
          <select
            value={partnerFilter}
            onChange={e => { setPartnerFilter(e.target.value); setPage(1); }}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Business Partners</option>
            <option value="Direct">Direct Freelance Pro</option>
            <option value="Apex Home Solutions LLP">Apex Home Solutions LLP</option>
            <option value="Selvam Fleet Services">Selvam Fleet Services</option>
            <option value="Urban Clean Tech Agency">Urban Clean Tech Agency</option>
          </select>

          {/* Reset Filters */}
          {(statusFilter !== 'ALL' || paymentFilter !== 'ALL' || cityFilter !== 'ALL' || partnerFilter !== 'ALL' || assignedFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setCityFilter('ALL');
                setCategoryFilter('ALL');
                setPartnerFilter('ALL');
                setAssignedFilter('ALL');
                setSearch('');
                setPage(1);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6E42E5',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Bookings Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Booking Ref</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Customer</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Service & Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Professional</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Partner Agency</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>City & Zone</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Scheduled Slot</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Payment</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Total (₹)</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      Loading bookings records...
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                    <AlertCircle size={28} color="#94A3B8" style={{ marginBottom: 8, display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#334155' }}>No bookings match the selected criteria</div>
                    <div style={{ fontSize: 12, marginTop: 4, marginBottom: 14 }}>Try clearing search keywords or filter dropdowns.</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('ALL');
                        setPaymentFilter('ALL');
                        setCityFilter('ALL');
                        setCategoryFilter('ALL');
                        setPartnerFilter('ALL');
                        setAssignedFilter('ALL');
                        setDateRangeFilter('ALL');
                        setPage(1);
                      }}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#6E42E5',
                        color: '#FFFFFF',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(110,66,229,0.25)'
                      }}
                    >
                      Reset All Filters & Show All Bookings
                    </button>
                  </td>
                </tr>
              ) : (
                bookings.map(b => {
                  const proName = b.assignedPartner || b.assignedProfessional?.name;
                  const isUnassigned = !proName;

                  return (
                    <tr
                      key={b.id || b.bookingReference}
                      onClick={() => setSelectedBooking(b)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Booking Reference */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#6E42E5' }}>
                        {b.id || b.bookingReference}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{b.userName || b.customerName}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{b.userPhone}</div>
                      </td>

                      {/* Service & Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#1E293B' }}>{b.serviceName}</div>
                        <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>
                            {b.serviceCategory || 'Standard'}
                          </span>
                          {b.items && b.items.length > 1 && (
                            <span>+{b.items.length - 1} items</span>
                          )}
                        </div>
                      </td>

                      {/* Professional */}
                      <td style={{ padding: '14px 16px' }}>
                        {isUnassigned ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: 11,
                            fontWeight: 600
                          }}>
                            <AlertTriangle size={12} />
                            Unassigned
                          </span>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{proName}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{b.assignedProfessional?.trade || 'Verified Pro'}</div>
                          </div>
                        )}
                      </td>

                      {/* Partner Agency */}
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {b.partnerAgency || b.assignedBusinessPartner?.name || 'Direct Pro'}
                      </td>

                      {/* City & Zone */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{b.city || 'Mumbai'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{b.serviceZone || b.locality || 'Metro'}</div>
                      </td>

                      {/* Scheduled Slot */}
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} color="#64748B" />
                          <span>{b.slot || 'Pending Slot'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderStatusBadge(b.status)}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderPaymentBadge(b.paymentStatus)}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                        ₹{b.totalAmount || b.amount || 0}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            title="Inspect Booking Details"
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 12,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            Details
                          </button>
                          <ChevronRight size={16} color="#94A3B8" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
          color: '#64748B',
          backgroundColor: '#FFFFFF'
        }}>
          <div>
            Showing <strong style={{ color: '#0F172A' }}>{bookings.length}</strong> of{' '}
            <strong style={{ color: '#0F172A' }}>{pagination.total || bookings.length}</strong> bookings
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: page <= 1 ? '#F1F5F9' : '#FFFFFF',
                color: page <= 1 ? '#94A3B8' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ padding: '0 8px', fontWeight: 600, color: '#0F172A' }}>
              Page {page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage(prev => prev + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: page >= (pagination.totalPages || 1) ? '#F1F5F9' : '#FFFFFF',
                color: page >= (pagination.totalPages || 1) ? '#94A3B8' : '#334155',
                cursor: page >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. BOOKING DETAIL DRAWER (SLIDE-OVER FROM RIGHT)           */}
      {/* ======================================================== */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 680,
            backgroundColor: '#FFFFFF',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            borderLeft: '1px solid #E2E8F0'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {selectedBooking.id || selectedBooking.bookingReference}
                  </h3>
                  {renderStatusBadge(selectedBooking.status)}
                  {renderPaymentBadge(selectedBooking.paymentStatus)}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Created on {new Date(selectedBooking.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} /> Tax Invoice
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} color="#475569" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Lifecycle Interactive Stepper */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Service Dispatch Pipeline</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#6E42E5' }}>Strict State-Machine Enforced</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {LIFECYCLE_STAGES.map((st, i) => {
                    const isPassed = LIFECYCLE_STAGES.indexOf(selectedBooking.status) >= i;
                    const isCurrent = selectedBooking.status === st;

                    return (
                      <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? '#6E42E5' : isPassed ? '#16A34A' : '#E2E8F0',
                          color: isPassed || isCurrent ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 4
                        }}>
                          {isPassed && !isCurrent ? <Check size={14} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#6E42E5' : '#64748B' }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Transition Fast Buttons */}
                {currentTransitions.length > 0 && selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Trigger Next Transition:</span>
                    {currentTransitions.map(nextSt => (
                      <button
                        key={nextSt}
                        onClick={() => handleTransition(nextSt)}
                        style={{
                          backgroundColor: nextSt === 'Cancelled' || nextSt === 'Failed' ? '#FEE2E2' : '#6E42E5',
                          color: nextSt === 'Cancelled' || nextSt === 'Failed' ? '#DC2626' : '#FFFFFF',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Advance to {nextSt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setSelectedProForAssign(selectedBooking.assignedProfessional?.id || '');
                    setShowAssignModal(true);
                  }}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #6E42E5',
                    backgroundColor: '#F5F3FF',
                    color: '#6E42E5',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <UserCheck size={14} />
                  {selectedBooking.assignedPartner ? 'Reassign Pro' : 'Assign Pro'}
                </button>

                <button
                  onClick={() => setShowRescheduleModal(true)}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={14} /> Reschedule
                </button>

                {selectedBooking.paymentStatus === 'Paid' && (
                  <button
                    onClick={() => {
                      setRefundData({ amount: selectedBooking.totalAmount, reason: 'Customer requested refund' });
                      setShowRefundModal(true);
                    }}
                    style={{
                      flex: '1 1 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #FCD34D',
                      backgroundColor: '#FFFBEB',
                      color: '#B45309',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={14} /> Initiate Refund
                  </button>
                )}

                {selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      flex: '1 1 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #FCA5A5',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                )}
              </div>

              {/* Customer and Service Address */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={15} color="#6E42E5" />
                  Customer & Service Location
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Customer Name</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                      {selectedBooking.userName || selectedBooking.customerName}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{selectedBooking.userPhone}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{selectedBooking.userEmail}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Service Address</div>
                    <div style={{ fontSize: 13, color: '#1E293B' }}>
                      {selectedBooking.addressDetails?.fullAddress || selectedBooking.address}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {selectedBooking.serviceZone || selectedBooking.locality}, {selectedBooking.city}
                    </div>
                    {selectedBooking.addressDetails?.landmark && (
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        Landmark: {selectedBooking.addressDetails.landmark}
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.customerInstructions && (
                  <div style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    borderRadius: 6,
                    backgroundColor: '#F8FAFC',
                    borderLeft: '3px solid #6E42E5',
                    fontSize: 12,
                    color: '#334155'
                  }}>
                    <strong>Customer Instructions:</strong> {selectedBooking.customerInstructions}
                  </div>
                )}
              </div>

              {/* Assigned Professional & Business Partner */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wrench size={15} color="#6E42E5" />
                  Assigned Professional & Partner Agency
                </div>

                {selectedBooking.assignedPartner || selectedBooking.assignedProfessional?.name ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        backgroundColor: '#EDE9FE',
                        color: '#6E42E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {((selectedBooking.assignedPartner || selectedBooking.assignedProfessional?.name || 'PR')[0]).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                          {selectedBooking.assignedPartner || selectedBooking.assignedProfessional?.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {selectedBooking.assignedProfessional?.trade || 'Certified Service Professional'}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          {selectedBooking.assignedProfessional?.phone || '+91 98205 11982'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Business Partner</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
                        {selectedBooking.partnerAgency || selectedBooking.assignedBusinessPartner?.name || 'Direct Pro Freelance'}
                      </div>
                      <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>
                        Tier: Diamond Level 5
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    borderRadius: 8,
                    backgroundColor: '#FEF2F2',
                    border: '1px dashed #FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>
                      ⚠️ No technician assigned yet. Overdue dispatch slot alert.
                    </span>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      style={{
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Assign Pro Now
                    </button>
                  </div>
                )}
              </div>

              {/* Service Items and Price Breakdown */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={15} color="#6E42E5" />
                  Service Items & Financial Ledger
                </div>

                {/* Items List */}
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
                  {(selectedBooking.items || [
                    { id: '1', title: selectedBooking.serviceName, qty: 1, price: selectedBooking.totalAmount, durationMins: 60 }
                  ]).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          Qty: {item.qty} × ₹{item.price} • Duration: {item.durationMins || 60} mins
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>₹{item.price * item.qty}</div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedBooking.pricingBreakdown?.subtotal || selectedBooking.totalAmount || 0}</span>
                  </div>
                  {selectedBooking.pricingBreakdown?.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                      <span>Discount / Coupon Applied:</span>
                      <span>-₹{selectedBooking.pricingBreakdown.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Convenience / Service Fee:</span>
                    <span>₹{selectedBooking.pricingBreakdown?.convenienceFee || 49}</span>
                  </div>
                  {selectedBooking.pricingBreakdown?.surgeFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                      <span>Monsoon Surge Fee:</span>
                      <span>+₹{selectedBooking.pricingBreakdown.surgeFee}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Taxes (CGST 9% + SGST 9%):</span>
                    <span>₹{selectedBooking.pricingBreakdown?.taxes || Math.round(selectedBooking.totalAmount * 0.18)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#0F172A',
                    paddingTop: 8,
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#6E42E5' }}>₹{selectedBooking.totalAmount}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: '#F8FAFC',
                  fontSize: 11,
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span>Payment Method: <strong>{selectedBooking.paymentMethod || 'UPI'}</strong></span>
                    {selectedBooking.paymentDetails?.transactionId && (
                      <span style={{ marginLeft: 8 }}>• Txn: <code>{selectedBooking.paymentDetails.transactionId}</code></span>
                    )}
                  </div>
                  <span>Status: <strong>{selectedBooking.paymentStatus}</strong></span>
                </div>

                {selectedBooking.refundDetails && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    fontSize: 11,
                    color: '#92400E'
                  }}>
                    <strong>Refund Processed:</strong> ₹{selectedBooking.refundDetails.amount} ({selectedBooking.refundDetails.reason}) on {new Date(selectedBooking.refundDetails.refundedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Internal Notes Thread & Input */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={15} color="#6E42E5" />
                  Internal Administrative Notes ({selectedBooking.internalNotes?.length || 0})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
                  {(!selectedBooking.internalNotes || selectedBooking.internalNotes.length === 0) ? (
                    <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                      No internal notes recorded yet.
                    </div>
                  ) : (
                    selectedBooking.internalNotes.map((note, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0'
                      }}>
                        <div style={{ fontSize: 12, color: '#1E293B' }}>{note.note}</div>
                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                          <span>By <strong>{note.author}</strong> ({note.authorRole || 'Admin'})</span>
                          <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to append new note */}
                <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Add an internal note or dispatch comment..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      fontSize: 12,
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#6E42E5',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Save Note
                  </button>
                </form>
              </div>

              {/* Complete Event Timeline with Actors */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="#6E42E5" />
                  Audit Trail & Event Timeline
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                  {(selectedBooking.timeline || [
                    { id: '1', title: 'Order Placed', description: 'Customer initiated online checkout', actor: 'Customer', actorRole: 'Customer', timestamp: selectedBooking.createdAt }
                  ]).map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#6E42E5',
                        marginTop: 5,
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{event.title}</span>
                          <span style={{ fontSize: 10, color: '#64748B' }}>
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{event.description}</div>
                        <div style={{ fontSize: 10, color: '#6E42E5', marginTop: 2 }}>
                          Actor: <strong>{event.actor}</strong> ({event.actorRole || 'System'})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ASSIGN / REASSIGN PROFESSIONAL MODAL                   */}
      {/* ======================================================== */}
      {showAssignModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 580,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Assign Qualified Professional to {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowAssignModal(false)} />
            </div>

            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>
              City: <strong>{selectedBooking.city}</strong> • Slot: <strong>{selectedBooking.slot}</strong> • Service: <strong>{selectedBooking.serviceName}</strong>
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Select Active Professional:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {professionals
                  .filter(p => !p.city || p.city.toLowerCase() === (selectedBooking.city || 'mumbai').toLowerCase())
                  .map(p => {
                    const isSelected = selectedProForAssign === (p.id || p._id);
                    return (
                      <div
                        key={p.id || p._id}
                        onClick={() => setSelectedProForAssign(p.id || p._id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #6E42E5' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                            {p.applicantName || p.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>
                            {p.trade || p.tradeName || 'Specialist'} • Rating: ⭐ {p.rating || 4.9} • Hub: {p.locality || p.city}
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 size={18} color="#6E42E5" />}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Overlap & Concurrency Guard Banner */}
            <div style={{
              padding: '10px 12px',
              borderRadius: 8,
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: 11,
              color: '#1E40AF',
              marginBottom: 20
            }}>
              <strong>Concurrency Protection:</strong> Checks working hours, service area coverage, active leaves, and enforces a mandatory 30-minute buffer between appointments to prevent double-booking.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={!selectedProForAssign}
                onClick={handleAssignProSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: selectedProForAssign ? '#6E42E5' : '#CBD5E1',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: selectedProForAssign ? 'pointer' : 'not-allowed'
                }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. RESCHEDULE BOOKING MODAL                               */}
      {/* ======================================================== */}
      {showRescheduleModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 500,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Reschedule Booking {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowRescheduleModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Current Slot:
                </label>
                <div style={{ fontSize: 12, color: '#64748B', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: 6 }}>
                  {selectedBooking.slot}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New Date:
                </label>
                <input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={e => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New Time Slot:
                </label>
                <select
                  value={rescheduleData.newSlot}
                  onChange={e => setRescheduleData(prev => ({ ...prev, newSlot: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM (Morning)</option>
                  <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM (Midday)</option>
                  <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM (Afternoon)</option>
                  <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM (Evening)</option>
                  <option value="06:00 PM - 07:30 PM">06:00 PM - 07:30 PM (Night Slot)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reschedule Reason:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested evening slot, technician delayed"
                  value={rescheduleData.reason}
                  onChange={e => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handleRescheduleSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Rescheduled Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CANCEL BOOKING MODAL                                   */}
      {/* ======================================================== */}
      {showCancelModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', margin: 0 }}>
                Cancel Booking {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowCancelModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Cancellation Reason:
                </label>
                <select
                  value={cancelData.reason}
                  onChange={e => setCancelData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Professional unavailable / No replacement">Professional unavailable / No replacement</option>
                  <option value="Severe weather / Monsoon surge disruption">Severe weather / Monsoon surge disruption</option>
                  <option value="Customer unreachable at service location">Customer unreachable at service location</option>
                  <option value="Duplicate booking order placed">Duplicate booking order placed</option>
                  <option value="Incorrect address / Out of service area">Incorrect address / Out of service area</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Cancellation Fee Charged (₹):
                </label>
                <input
                  type="number"
                  value={cancelData.feeCharged}
                  onChange={e => setCancelData(prev => ({ ...prev, feeCharged: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>0 if cancelled within free cancellation window.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
              <button
                onClick={handleCancelSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. INITIATE REFUND MODAL                                  */}
      {/* ======================================================== */}
      {showRefundModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#B45309', margin: 0 }}>
                Initiate Customer Refund: {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowRefundModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Refund Amount (Max ₹{selectedBooking.totalAmount}):
                </label>
                <input
                  type="number"
                  value={refundData.amount}
                  onChange={e => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Dispute & Refund Reason:
                </label>
                <select
                  value={refundData.reason}
                  onChange={e => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Service quality dispute">Service quality dispute / Substandard cleaning</option>
                  <option value="Professional no-show">Professional no-show</option>
                  <option value="Order cancelled before technician dispatch">Order cancelled before dispatch</option>
                  <option value="Overcharged / Pricing error">Overcharged / Pricing error</option>
                  <option value="Appliance parts unavailable">Appliance parts unavailable</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowRefundModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handleRefundSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Execute Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. TAX INVOICE PRINTABLE MODAL                            */}
      {/* ======================================================== */}
      {showInvoiceModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 680,
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Invoice Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#6E42E5' }}>URBAN SERVICES PLATFORM</span>
                <span style={{ fontSize: 12, color: '#64748B', display: 'block' }}>Tax Invoice & Service Bill</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 6,
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Invoice Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 12 }}>
              <div>
                <strong style={{ fontSize: 13, color: '#0F172A' }}>Billed To:</strong>
                <div style={{ fontWeight: 600, marginTop: 4, color: '#1E293B' }}>
                  {selectedBooking.userName || selectedBooking.customerName}
                </div>
                <div style={{ color: '#64748B' }}>{selectedBooking.userPhone}</div>
                <div style={{ color: '#64748B', marginTop: 2 }}>{selectedBooking.address}</div>
                <div style={{ color: '#64748B' }}>{selectedBooking.city}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div>Invoice Number: <strong>{selectedBooking.invoiceNumber || `INV-2026-${selectedBooking.id?.replace(/\D/g, '') || '9841'}`}</strong></div>
                <div>Date of Issue: <strong>{new Date().toLocaleDateString()}</strong></div>
                <div>Booking Ref: <strong>{selectedBooking.id}</strong></div>
                <div>GSTIN: <strong>27AAACU9821L1ZV</strong></div>
                <div>SAC Code: <strong>998719 (Maintenance & Repair Services)</strong></div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 20 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(selectedBooking.items || [{ title: selectedBooking.serviceName, qty: 1, price: selectedBooking.totalAmount }]).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{it.title}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Certified doorstep execution by {selectedBooking.assignedPartner || 'Urban Technician'}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{it.qty}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>₹{it.price}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>₹{it.price * it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Total Ledger */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12 }}>
              <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Taxable Value:</span>
                  <span>₹{Math.round(selectedBooking.totalAmount / 1.18)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>CGST (9%):</span>
                  <span>₹{Math.round((selectedBooking.totalAmount / 1.18) * 0.09)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>SGST (9%):</span>
                  <span>₹{Math.round((selectedBooking.totalAmount / 1.18) * 0.09)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#0F172A',
                  paddingTop: 8,
                  borderTop: '2px solid #0F172A'
                }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#6E42E5' }}>₹{selectedBooking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #E2E8F0', fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
              This is a computer-generated tax invoice. Authorized by Urban Platform Services Inc.
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
