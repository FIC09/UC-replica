import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Filter, HardHat, Phone, MapPin, Calendar, 
  Clock, CheckCircle, AlertTriangle, X, ChevronRight, MessageSquare, 
  FileText, Plus, UserCheck, Shield, ChevronLeft, Send, AlertCircle,
  HelpCircle, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function BookingsView({ showToast, staff, onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [proFilter, setProFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL'); // ALL, unassigned, assigned
  const [sortBy, setSortBy] = useState('timeDesc'); // timeDesc, timeAsc, amountDesc

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  
  // Drawer / Detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [availablePros, setAvailablePros] = useState([]);
  const [selectedProId, setSelectedProId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  // Modals for Reschedule, Cancel, and Completion Override
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ proposedDate: '', proposedSlot: 'Tomorrow, 10:00 AM - 12:00 PM', reason: '' });

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState('');

  useEffect(() => {
    loadBookings();
  }, [statusFilter, proFilter]);

  async function loadBookings() {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (proFilter !== 'ALL') filters.proId = proFilter;
      const res = await partnerClient.getBookings(filters);
      if (res && res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      showToast?.('Error fetching bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenDetail(b) {
    setSelectedBooking(b);
    setConflictError(null);
    setReassignReason('');
    try {
      const res = await partnerClient.getBookingDetail(b.id);
      if (res && res.success) {
        setSelectedBooking(res.booking);
        setAvailablePros(res.availableProfessionals || []);
        setSelectedProId(res.booking.assignedProfessional?.id || '');
      }
    } catch (err) {
      showToast?.('Could not load detailed booking: ' + err.message);
    }
  }

  async function handleAssignTechnician() {
    if (!selectedProId) {
      showToast?.('Please select a technician to assign.');
      return;
    }
    setActionLoading(true);
    setConflictError(null);
    try {
      const res = await partnerClient.assignBooking(selectedBooking.id, selectedProId, reassignReason);
      if (res && res.success) {
        showToast?.(res.message || 'Assigned successfully!');
        setSelectedBooking(res.booking);
        loadBookings();
      }
    } catch (err) {
      // Check if server returned 409 Conflict with alternative pros
      showToast?.(err.message || 'Assignment failed');
      setConflictError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await partnerClient.addBookingNote(selectedBooking.id, newNote);
      if (res && res.success) {
        showToast?.('Internal business note added.');
        setSelectedBooking(prev => ({
          ...prev,
          businessNotes: res.businessNotes
        }));
        setNewNote('');
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to add note');
    }
  }

  async function handleRescheduleSubmit(e) {
    e.preventDefault();
    if (!rescheduleData.reason.trim()) {
      showToast?.('Please provide a reason for the rescheduling request.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await partnerClient.requestReschedule(selectedBooking.id, rescheduleData);
      if (res && res.success) {
        showToast?.(res.message);
        setSelectedBooking(res.booking);
        setIsRescheduleOpen(false);
        loadBookings();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit reschedule request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelSubmit(e) {
    e.preventDefault();
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      showToast?.('Cancellation reason is required (min 5 characters).');
      return;
    }
    setActionLoading(true);
    try {
      const res = await partnerClient.requestCancellation(selectedBooking.id, { reason: cancelReason });
      if (res && res.success) {
        showToast?.(res.message);
        setSelectedBooking(res.booking);
        setIsCancelOpen(false);
        loadBookings();
      }
    } catch (err) {
      showToast?.(err.message || 'Cancellation request failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOverrideSubmit(e) {
    e.preventDefault();
    if (!overrideJustification.trim() || overrideJustification.trim().length < 15) {
      showToast?.('Explicit justification required (minimum 15 characters).');
      return;
    }
    setActionLoading(true);
    try {
      const res = await partnerClient.overrideCompletion(selectedBooking.id, { justification: overrideJustification });
      if (res && res.success) {
        showToast?.(res.message);
        setSelectedBooking(res.booking);
        setIsOverrideOpen(false);
        loadBookings();
      }
    } catch (err) {
      showToast?.(err.message || 'Override completion failed');
    } finally {
      setActionLoading(false);
    }
  }

  // Filter and sort bookings
  let filtered = bookings.filter(b => {
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch = 
        (b.id || '').toLowerCase().includes(q) ||
        (b.userName || '').toLowerCase().includes(q) ||
        (b.serviceName || '').toLowerCase().includes(q) ||
        (b.serviceZone || '').toLowerCase().includes(q) ||
        (b.assignedProfessional?.name || '').toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    if (categoryFilter !== 'ALL' && b.serviceCategory !== categoryFilter) {
      return false;
    }

    if (assignedFilter === 'unassigned' && b.assignedProfessional) {
      return false;
    }
    if (assignedFilter === 'assigned' && !b.assignedProfessional) {
      return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'amountDesc') return (b.totalAmount || 0) - (a.totalAmount || 0);
    if (sortBy === 'timeAsc') return new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0);
    return new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0);
  });

  // Paginate
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const canAssign = staff?.permissions?.assigning_jobs !== false;
  const canEdit = staff?.permissions?.editing !== false;
  const canViewFinances = staff?.permissions?.viewing_finances !== false;
  const isReadOnlyStaff = staff?.role === 'Read-only Staff';
  const isManagerOrOwner = staff?.role === 'Business Owner' || staff?.role === 'Business Manager';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Filter Controls */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        padding: '20px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Booking Management & Dispatch Queue
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
            Searchable, paginated enterprise jobs with platform compliance & verified technician assignment
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 10 }} />
            <input
              type="text"
              placeholder="Search reference, customer..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Dispatch (Unassigned)</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Assignment Filter */}
          <select
            value={assignedFilter}
            onChange={e => { setAssignedFilter(e.target.value); setCurrentPage(1); }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
          >
            <option value="ALL">All Jobs</option>
            <option value="unassigned">Unassigned Only</option>
            <option value="assigned">Assigned Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
          >
            <option value="timeDesc">Sort: Newest First</option>
            <option value="timeAsc">Sort: Oldest First</option>
            <option value="amountDesc">Sort: Highest Amount</option>
          </select>

          <button
            onClick={loadBookings}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: 13,
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
            Loading bookings from secure agency portfolio...
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
            No bookings matched the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Booking Ref</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Service</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Scheduled Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Area</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Pro</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  {canViewFinances && (
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Business Share</th>
                  )}
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      #{b.id}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.userName}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>
                        {isReadOnlyStaff ? '••••••••' + (b.userPhone ? b.userPhone.slice(-4) : '0000') : b.userPhone}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155' }}>
                      {b.serviceName}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} color="#7c3aed" />
                        <span>{b.slot || '11:00 AM - 01:00 PM'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={13} color="#64748b" />
                        <span>{b.serviceZone || b.city || 'Mumbai Central'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {b.assignedProfessional ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <HardHat size={14} color="#7c3aed" />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{b.assignedProfessional.name}</span>
                        </div>
                      ) : (
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: '#fef3c7',
                          color: '#d97706'
                        }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 9px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: b.status === 'Completed' ? '#ecfdf5' :
                                    b.status === 'In Progress' ? '#dbeafe' :
                                    b.status === 'Assigned' ? '#ede9fe' :
                                    b.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                        color: b.status === 'Completed' ? '#16a34a' :
                               b.status === 'In Progress' ? '#1d4ed8' :
                               b.status === 'Assigned' ? '#7c3aed' :
                               b.status === 'Cancelled' ? '#dc2626' : '#b45309'
                      }}>
                        {b.status}
                      </span>
                    </td>
                    {canViewFinances && (
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#16a34a' }}>
                        ₹{Number(b.netAgencyShare || (b.totalAmount * 0.82) || 0).toLocaleString('en-IN')}
                      </td>
                    )}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenDetail(b)}
                        style={{
                          padding: '6px 12px',
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Manage & Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
          color: '#64748b'
        }}>
          <div>
            Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} bookings
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#fff',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.5 : 1
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: 620,
            height: '100%',
            boxShadow: '-8px 0 25px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              background: '#ffffff',
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Booking #{selectedBooking.id}
                  </h2>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: selectedBooking.status === 'Completed' ? '#ecfdf5' : '#fef3c7',
                    color: selectedBooking.status === 'Completed' ? '#16a34a' : '#b45309'
                  }}>
                    {selectedBooking.status}
                  </span>
                </div>
                <span style={{ fontSize: 12.5, color: '#64748b' }}>
                  {selectedBooking.serviceName}
                </span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Conflict Error Callout (If 409 Conflict occurred) */}
              {conflictError && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: 13
                }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={16} /> Scheduling Conflict Detected:
                  </strong>
                  {conflictError}
                </div>
              )}

              {/* Service Address (Restricted to Authorized Operational Staff) */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Doorstep Customer Details & Address
                </span>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginTop: 4 }}>
                  {selectedBooking.userName}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                  Phone: <strong>{isReadOnlyStaff ? '••••••••' + (selectedBooking.userPhone ? selectedBooking.userPhone.slice(-4) : '0000') : selectedBooking.userPhone}</strong>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 6, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <MapPin size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    {isReadOnlyStaff 
                      ? `${selectedBooking.serviceZone || selectedBooking.city} (Exact doorstep address masked for read-only staff)` 
                      : (selectedBooking.addressDetails?.fullAddress || selectedBooking.address)}
                  </span>
                </div>
                {selectedBooking.customerInstructions && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#ffffff', borderRadius: 6, fontSize: 12.5, color: '#334155', border: '1px solid #e2e8f0' }}>
                    <strong>Customer Instructions:</strong> {selectedBooking.customerInstructions}
                  </div>
                )}
              </div>

              {/* Technician Allocation & Reassignment with Reason */}
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HardHat size={16} color="#7c3aed" /> Dispatch & Technician Assignment
                  </span>
                  {!canAssign && (
                    <span style={{ fontSize: 11, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>
                      Read-only role
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569' }}>
                    Select Team Professional ({availablePros.length} active technicians in fleet)
                  </label>
                  <select
                    disabled={!canAssign || actionLoading}
                    value={selectedProId}
                    onChange={e => setSelectedProId(e.target.value)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      background: '#fff'
                    }}
                  >
                    <option value="">-- Choose Team Member --</option>
                    {availablePros.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) • {p.trade} • {p.status}
                      </option>
                    ))}
                  </select>

                  {/* If reassignment, ask for reason */}
                  {selectedBooking.assignedProfessional && selectedProId && selectedProId !== selectedBooking.assignedProfessional.id && (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#d97706', display: 'block', marginBottom: 4 }}>
                        Reassignment Reason (Preserved in booking history):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Schedule rebalance, technician sick leave..."
                        value={reassignReason}
                        onChange={e => setReassignReason(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                      />
                    </div>
                  )}

                  {canAssign && (
                    <button
                      onClick={handleAssignTechnician}
                      disabled={actionLoading || !selectedProId}
                      style={{
                        padding: '10px 16px',
                        background: '#7c3aed',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 4
                      }}
                    >
                      {actionLoading ? 'Assigning...' : selectedBooking.assignedProfessional ? 'Confirm Reassignment' : 'Confirm Dispatch Assignment'}
                    </button>
                  )}
                </div>
              </div>

              {/* Reassignment History Log */}
              {selectedBooking.reassignmentHistory && selectedBooking.reassignmentHistory.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                    Reassignment Audit Trail:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedBooking.reassignmentHistory.map((rh, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: '#475569', borderLeft: '2px solid #7c3aed', paddingLeft: 8 }}>
                        Reassigned from <strong>{rh.fromProName}</strong> to <strong>{rh.toProName}</strong> by {rh.reassignedBy}
                        <div style={{ fontSize: 11, color: '#64748b' }}>Reason: "{rh.reason}" • {new Date(rh.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial & Agency Earnings Breakdown */}
              {canViewFinances && (
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                    Financial Settlement Breakdown
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 4 }}>
                    <span>Gross Customer Paid Amount:</span>
                    <strong>₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#dc2626', marginBottom: 4 }}>
                    <span>Platform Commission & Deductions (18%):</span>
                    <span>-₹{Number(selectedBooking.platformFee || selectedBooking.agencyCommission || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 700, color: '#16a34a', borderTop: '1px solid #e2e8f0', paddingTop: 6, marginTop: 6 }}>
                    <span>Net Business Share (Agency Take-home):</span>
                    <span>₹{Number(selectedBooking.netAgencyShare || (selectedBooking.totalAmount * 0.82) || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Operational Exception Actions: Reschedule, Cancel, Completion Override */}
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 10 }}>
                  Booking Exception Requests & Audited Overrides
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    onClick={() => setIsRescheduleOpen(true)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    Request Rescheduling
                  </button>
                  <button
                    onClick={() => setIsCancelOpen(true)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #fecaca',
                      background: '#fff',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    Request Cancellation
                  </button>
                  {isManagerOrOwner && selectedBooking.status !== 'Completed' && (
                    <button
                      onClick={() => setIsOverrideOpen(true)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #bbf7d0',
                        background: '#f0fdf4',
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: '#15803d',
                        cursor: 'pointer'
                      }}
                    >
                      Audited Completion Override
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate?.('/partner/support')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Raise Support Case
                  </button>
                </div>

                {/* If Reschedule Request Pending */}
                {selectedBooking.rescheduleRequest && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbeb', borderRadius: 6, fontSize: 12, color: '#92400e', border: '1px solid #fde68a' }}>
                    <strong>Reschedule Request:</strong> Slot "{selectedBooking.rescheduleRequest.proposedSlot}" ({selectedBooking.rescheduleRequest.status})
                  </div>
                )}

                {/* If Cancellation Request Pending */}
                {selectedBooking.cancellationRequest && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 6, fontSize: 12, color: '#991b1b', border: '1px solid #fecaca' }}>
                    <strong>Cancellation Request:</strong> Reason: "{selectedBooking.cancellationRequest.reason}" ({selectedBooking.cancellationRequest.status} • Policy Fee ₹{selectedBooking.cancellationRequest.policyFee})
                  </div>
                )}

                {/* If Completion Override Audited */}
                {selectedBooking.completionAudit && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#166534', border: '1px solid #bbf7d0' }}>
                    <strong>Completion Overridden:</strong> By {selectedBooking.completionAudit.overriddenBy} ({selectedBooking.completionAudit.actorRole}) • Audit ID: {selectedBooking.completionAudit.auditId}
                  </div>
                )}
              </div>

              {/* Internal Business Notes */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <MessageSquare size={15} color="#7c3aed" /> Internal Business Notes (Staff Only)
                </span>

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add operational dispatch note..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                  />
                  <button
                    type="submit"
                    style={{ padding: '8px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Add Note
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(selectedBooking.businessNotes || []).map(bn => (
                    <div key={bn.id} style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                      <div style={{ color: '#0f172a' }}>{bn.note}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {bn.author} • {new Date(bn.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reschedule Request */}
      {isRescheduleOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Request Booking Rescheduling
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Rescheduling requests are subject to platform operations review and customer slot confirmation.
            </p>
            <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Proposed Slot *
                </label>
                <input
                  type="text"
                  value={rescheduleData.proposedSlot}
                  onChange={e => setRescheduleData({ ...rescheduleData, proposedSlot: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Tomorrow, 11:00 AM - 01:00 PM"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Reason for Rescheduling *
                </label>
                <textarea
                  rows={2}
                  value={rescheduleData.reason}
                  onChange={e => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Customer requested evening appointment due to office hours."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cancellation Request */}
      {isCancelOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 480, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#dc2626', margin: '0 0 8px' }}>
              Request Booking Cancellation
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
              Under platform policy, partner-initiated cancellations within 4 hours incur a ₹150 administrative review fee.
            </p>
            <form onSubmit={handleCancelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Reason for Cancellation (Min 5 chars) *
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Severe water outage at customer premises preventing service."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCancelOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Audited Completion Override */}
      {isOverrideOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              Audited Manual Completion Override
            </h3>
            <div style={{ padding: '10px 12px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa', color: '#9a3412', fontSize: 12.5, marginBottom: 14 }}>
              <strong>Platform Policy Guard:</strong> Partner staff cannot arbitrarily mark work completed on behalf of professionals. Overrides must be explicit, justified, verified with customer, and permanently audited.
            </div>
            <form onSubmit={handleOverrideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Audited Justification (Min 15 characters) *
                </label>
                <textarea
                  rows={3}
                  value={overrideJustification}
                  onChange={e => setOverrideJustification(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  placeholder="e.g. Technician mobile device ran out of charge on site; verified completion with customer over phone."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm & Audit Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
