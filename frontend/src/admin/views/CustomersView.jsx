import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  UserCheck, 
  ShieldAlert, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  X, 
  User, 
  CreditCard, 
  AlertTriangle, 
  Star, 
  Calendar, 
  MessageSquare, 
  RotateCcw, 
  History, 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  CheckCircle2, 
  Ban, 
  Sparkles,
  Download,
  Trash2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function CustomersView({ onShowToast, onNavigate }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Active Drawers & Modals
  const [selectedCust, setSelectedCust] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'ledger' | 'support' | 'notes'

  // Modal Dialogs
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('Suspicious fraudulent booking activity');
  const [showAnonymiseModal, setShowAnonymiseModal] = useState(false);
  const [confirmAnonymiseText, setConfirmAnonymiseText] = useState('');
  const [newCustomerNote, setNewCustomerNote] = useState('');

  // Fetch Customers
  const fetchCustomersList = () => {
    setLoading(true);
    adminClient.getCustomers({
      search,
      status: statusFilter,
      city: cityFilter,
      page,
      limit: 10
    })
      .then(res => {
        setCustomers(res.customers || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomersList();
  }, [search, statusFilter, cityFilter, page]);

  // Fetch Full Customer Detail Profile when selected
  useEffect(() => {
    if (!selectedCust) {
      setCustomerDetail(null);
      return;
    }

    setLoadingDetail(true);
    adminClient.getCustomerDetail(selectedCust.id || selectedCust._id)
      .then(res => {
        if (res.customer) {
          setCustomerDetail(res.customer);
        } else {
          // Fallback structure
          setCustomerDetail({
            ...selectedCust,
            metrics: {
              totalSpend: 5490,
              totalOrders: 6,
              completedOrders: 5,
              cancelledOrders: 1,
              averageOrderValue: 915
            },
            bookings: [
              { id: 'ORD-9841', serviceName: 'Powerjet AC Servicing', slot: '14 Oct, 02:00 PM', amount: 922, status: 'In Progress', proName: 'Vikram Salvi' },
              { id: 'ORD-9810', serviceName: 'Bathroom Deep Cleaning', slot: '22 Sep, 10:00 AM', amount: 499, status: 'Completed', proName: 'Sunil V.' }
            ],
            payments: [
              { id: 'TXN-9021', date: '14 Oct 2026', method: 'Google Pay (UPI)', amount: 922, type: 'Payment', status: 'Success' },
              { id: 'TXN-8840', date: '22 Sep 2026', method: 'Credit Card (Visa)', amount: 499, type: 'Payment', status: 'Success' }
            ],
            supportTickets: [
              { id: 'TCK-201', subject: 'Inquiry regarding seasonal monsoon discounts', status: 'Resolved', date: '12 Sep 2026' }
            ],
            reviews: [
              { id: 'REV-101', rating: 5, service: 'Bathroom Deep Cleaning', text: 'Excellent technician, arrived right on time and cleaned thoroughly.', date: '23 Sep 2026' }
            ]
          });
        }
        setLoadingDetail(false);
      })
      .catch(() => {
        setLoadingDetail(false);
      });
  }, [selectedCust]);

  // Handle Suspend / Reactivate
  function handleSuspendSubmit() {
    if (!selectedCust) return;
    const isSuspending = selectedCust.status === 'Active';
    const nextStatus = isSuspending ? 'Suspended' : 'Active';

    adminClient.updateCustomerStatus(selectedCust.id || selectedCust._id, nextStatus, suspendReason)
      .then(() => {
        onShowToast && onShowToast(`✓ Customer account status set to ${nextStatus}`);
        setCustomers(prev => prev.map(c => (c.id === selectedCust.id || c._id === selectedCust.id) ? { ...c, status: nextStatus } : c));
        if (customerDetail) {
          setCustomerDetail(prev => ({
            ...prev,
            status: nextStatus,
            suspendHistory: [
              ...(prev.suspendHistory || []),
              {
                status: nextStatus,
                reason: suspendReason,
                changedBy: 'Super Administrator',
                timestamp: new Date()
              }
            ]
          }));
        }
        setSelectedCust(prev => ({ ...prev, status: nextStatus }));
        setShowSuspendModal(false);
      })
      .catch(err => {
        onShowToast && onShowToast(`Error updating status: ${err.message}`);
      });
  }

  // Handle GDPR Anonymisation / Account Erasure
  function handleAnonymiseSubmit() {
    if (!selectedCust || confirmAnonymiseText.trim().toUpperCase() !== 'ANONYMISE') {
      onShowToast && onShowToast("Please type 'ANONYMISE' exactly to confirm.");
      return;
    }

    adminClient.anonymiseCustomer(selectedCust.id || selectedCust._id)
      .then(() => {
        onShowToast && onShowToast(`✓ Customer PII erased and account anonymised (financial records preserved).`);
        setShowAnonymiseModal(false);
        setConfirmAnonymiseText('');
        fetchCustomersList();
        setSelectedCust(null);
      })
      .catch(err => {
        onShowToast && onShowToast(`Anonymisation notice: ${err.message}`);
      });
  }

  // Handle Add Internal Customer Note
  function handleAddNote(e) {
    e.preventDefault();
    if (!newCustomerNote.trim() || !selectedCust) return;

    adminClient.addCustomerNote(selectedCust.id || selectedCust._id, newCustomerNote)
      .then(() => {
        const noteObj = {
          id: 'note-' + Date.now(),
          note: newCustomerNote,
          author: 'Admin Support Lead',
          authorRole: 'Support Operations',
          createdAt: new Date()
        };
        if (customerDetail) {
          setCustomerDetail(prev => ({
            ...prev,
            internalNotes: [...(prev.internalNotes || []), noteObj]
          }));
        }
        setNewCustomerNote('');
        onShowToast && onShowToast('✓ Internal customer note recorded');
      })
      .catch(err => {
        onShowToast && onShowToast(`Error adding note: ${err.message}`);
      });
  }

  // Status Badge
  function renderStatusBadge(status) {
    const s = (status || 'Active').toLowerCase();
    if (s === 'active') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: '#F0FDF4',
          color: '#16A34A',
          border: '1px solid #BBF7D0'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16A34A' }} />
          Active Account
        </span>
      );
    }
    if (s === 'suspended') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#DC2626' }} />
          Suspended
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        border: '1px solid #CBD5E1'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#64748B' }} />
        Anonymised (GDPR)
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0', lineHeight: 1.25 }}>
            Customer Management &amp; Privacy Control
          </h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.2 }}>
            Manage verified client accounts, saved address directories, LTV spend summaries, and GDPR privacy workflows
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={fetchCustomersList}
            title="Refresh List"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '10px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="admin-page-body">
        {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
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
            placeholder="Search by customer name, email, phone, city or locality..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status Filter */}
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
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active Customers</option>
            <option value="Suspended">Suspended</option>
            <option value="Anonymised">Anonymised (Erased)</option>
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

          {(statusFilter !== 'ALL' || cityFilter !== 'ALL' || search) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setCityFilter('ALL');
                setSearch('');
                setPage(1);
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6E42E5',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
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
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Customer Profile</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Contact Info</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>City & Locality</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Membership</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Account Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Saved Addresses</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      Loading customer directory...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                    <User size={28} color="#94A3B8" style={{ marginBottom: 8, display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#334155' }}>No customers found matching filter criteria</div>
                  </td>
                </tr>
              ) : (
                customers.map(c => {
                  const isAnonymised = c.status === 'Anonymised';

                  return (
                    <tr
                      key={c.id || c._id}
                      onClick={() => setSelectedCust(c)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Name & ID */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: isAnonymised ? '#E2E8F0' : '#EDE9FE',
                            color: isAnonymised ? '#64748B' : '#6E42E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13
                          }}>
                            {isAnonymised ? '?' : (c.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: '#64748B' }}>ID: {c.id || c._id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#1E293B', fontWeight: 500 }}>{c.phone}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{c.email}</div>
                      </td>

                      {/* City */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{c.city || 'Mumbai'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{c.locality || 'Bandra West'}</div>
                      </td>

                      {/* Membership */}
                      <td style={{ padding: '14px 16px' }}>
                        {c.isPlusMember ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: 11,
                            fontWeight: 700
                          }}>
                            <Sparkles size={11} color="#D97706" /> UC Plus VIP
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#64748B' }}>Standard</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderStatusBadge(c.status)}
                      </td>

                      {/* Saved Addresses count */}
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} color="#64748B" />
                          <span>{c.savedAddresses?.length || 1} saved locations</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCust(c);
                            }}
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 12,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            Profile
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
            Showing <strong style={{ color: '#0F172A' }}>{customers.length}</strong> of{' '}
            <strong style={{ color: '#0F172A' }}>{pagination.total || customers.length}</strong> customers
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
      {/* CUSTOMER DETAIL PROFILE DRAWER (RIGHT SLIDE-OVER)         */}
      {/* ======================================================== */}
      {selectedCust && (
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
            maxWidth: 640,
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
              position: 'sticky',
              top: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {selectedCust.name}
                  </h3>
                  {renderStatusBadge(selectedCust.status)}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Client since {selectedCust.joinedDate || 'Jan 2026'} • ID: {selectedCust.id || selectedCust._id}
                </div>
              </div>

              <button
                onClick={() => setSelectedCust(null)}
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

            {/* Navigation Tabs in Drawer */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              padding: '0 24px'
            }}>
              {[
                { id: 'overview', label: 'Overview & Spending' },
                { id: 'bookings', label: 'Booking History' },
                { id: 'addresses', label: 'Saved Addresses' },
                { id: 'notes', label: 'Notes & Support' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #6E42E5' : '2px solid transparent',
                    color: activeTab === tab.id ? '#6E42E5' : '#64748B',
                    fontSize: 12,
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Account Actions Bar */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowSuspendModal(true)}
                  style={{
                    flex: '1 1 auto',
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: selectedCust.status === 'Active' ? '#FFFBEB' : '#F0FDF4',
                    color: selectedCust.status === 'Active' ? '#B45309' : '#16A34A',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {selectedCust.status === 'Active' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                  {selectedCust.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                </button>

                {selectedCust.status !== 'Anonymised' && (
                  <button
                    onClick={() => setShowAnonymiseModal(true)}
                    style={{
                      flex: '1 1 auto',
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: '1px solid #FECACA',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Trash2 size={14} />
                    GDPR Anonymise / Erase PII
                  </button>
                )}
              </div>

              {/* TAB 1: OVERVIEW & SPENDING SUMMARY */}
              {activeTab === 'overview' && (
                <>
                  {/* Spending Summary Cards */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 12
                  }}>
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '16px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Lifetime Value (LTV)</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                        ₹{customerDetail?.metrics?.totalSpend || 5490}
                      </div>
                      <div style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>Statutory GST Recorded</div>
                    </div>

                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '16px',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings Placed</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#6E42E5', marginTop: 4 }}>
                        {customerDetail?.metrics?.totalOrders || 6} Orders
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        {customerDetail?.metrics?.completedOrders || 5} Delivered • {customerDetail?.metrics?.cancelledOrders || 1} Cancelled
                      </div>
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
                      Verified Client Contact Profile
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Primary Mobile:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedCust.phone}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Email Address:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedCust.email}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Primary City:</span>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginTop: 2 }}>{selectedCust.city || 'Mumbai'}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>VIP Subscription:</span>
                        <div style={{ fontWeight: 600, color: selectedCust.isPlusMember ? '#D97706' : '#64748B', marginTop: 2 }}>
                          {selectedCust.isPlusMember ? 'UC Plus Subscriber' : 'Standard Tier'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suspend Audit History if any */}
                  {selectedCust.suspendHistory && selectedCust.suspendHistory.length > 0 && (
                    <div style={{
                      backgroundColor: '#FFFBEB',
                      borderRadius: 10,
                      padding: '14px 16px',
                      border: '1px solid #FDE68A'
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
                        Account Status Audit History
                      </div>
                      {selectedCust.suspendHistory.map((ev, i) => (
                        <div key={i} style={{ fontSize: 11, color: '#78350F', marginTop: 4 }}>
                          • <strong>{ev.status}</strong> by {ev.changedBy || 'Admin'}: "{ev.reason}" ({new Date(ev.timestamp).toLocaleDateString()})
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: BOOKING HISTORY */}
              {activeTab === 'bookings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Past & Active Service Orders ({customerDetail?.bookings?.length || 0})
                  </div>

                  {(!customerDetail?.bookings || customerDetail.bookings.length === 0) ? (
                    <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '30px' }}>
                      No past bookings found for this customer.
                    </div>
                  ) : (
                    customerDetail.bookings.map(bk => (
                      <div
                        key={bk.id}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: '#6E42E5', fontSize: 12 }}>{bk.id}</span>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                              backgroundColor: bk.status === 'Completed' ? '#DCFCE7' : bk.status === 'Cancelled' ? '#FEE2E2' : '#EFF6FF',
                              color: bk.status === 'Completed' ? '#15803D' : bk.status === 'Cancelled' ? '#B91C1C' : '#1D4ED8'
                            }}>
                              {bk.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 2 }}>
                            {bk.serviceName}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                            Slot: {bk.slot} • Pro: <strong>{bk.proName || 'Rajesh K.'}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>₹{bk.amount || 699}</div>
                          <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>Settled</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Saved Doorstep Addresses
                  </div>

                  {(selectedCust.savedAddresses || [
                    { id: '1', type: 'Home', buildingName: 'Sea Green Apts', streetAddress: 'Perry Cross Road', locality: 'Bandra West', city: 'Mumbai', pincode: '400050', isDefault: true }
                  ]).map(addr => (
                    <div
                      key={addr.id || addr.type}
                      style={{
                        padding: '14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>{addr.type}</span>
                        {addr.isDefault && (
                          <span style={{ backgroundColor: '#EDE9FE', color: '#6E42E5', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                            Default Address
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#334155' }}>
                        {addr.buildingName}, {addr.streetAddress}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        {addr.locality}, {addr.city} - {addr.pincode}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: INTERNAL NOTES & SUPPORT */}
              {activeTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    Internal Operational Notes ({selectedCust.internalNotes?.length || 0})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                    {(!customerDetail?.internalNotes || customerDetail.internalNotes.length === 0) ? (
                      <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                        No internal notes recorded for this customer account.
                      </div>
                    ) : (
                      customerDetail.internalNotes.map((nt, idx) => (
                        <div key={idx} style={{
                          padding: '10px 12px',
                          borderRadius: 6,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0'
                        }}>
                          <div style={{ fontSize: 12, color: '#1E293B' }}>{nt.note}</div>
                          <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span>By <strong>{nt.author}</strong> ({nt.authorRole || 'Support Lead'})</span>
                            <span>{new Date(nt.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <input
                      type="text"
                      placeholder="Add an internal note or VIP service preference..."
                      value={newCustomerNote}
                      onChange={e => setNewCustomerNote(e.target.value)}
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
              )}

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUSPEND / REACTIVATE MODAL                                */}
      {/* ======================================================== */}
      {showSuspendModal && selectedCust && (
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
              <h3 style={{ fontSize: 16, fontWeight: 700, color: selectedCust.status === 'Active' ? '#DC2626' : '#16A34A', margin: 0 }}>
                {selectedCust.status === 'Active' ? 'Suspend Customer Account' : 'Reactivate Customer Account'}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowSuspendModal(false)} />
            </div>

            <p style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
              Customer: <strong>{selectedCust.name}</strong> ({selectedCust.phone})
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                Reason for Status Change:
              </label>
              <select
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  boxSizing: 'border-box'
                }}
              >
                <option value="Suspicious fraudulent booking activity">Suspicious fraudulent booking activity</option>
                <option value="Policy violation / Technician harassment report">Policy violation / Technician harassment</option>
                <option value="Repeated bogus cancellations at doorstep">Repeated bogus cancellations at doorstep</option>
                <option value="Payment dispute / Chargeback fraud">Payment dispute / Chargeback fraud</option>
                <option value="Customer request for temporary freeze">Customer request for temporary freeze</option>
                <option value="Account re-instated after investigation">Account re-instated after investigation</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowSuspendModal(false)}
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
                onClick={handleSuspendSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: selectedCust.status === 'Active' ? '#DC2626' : '#16A34A',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {selectedCust.status === 'Active' ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* GDPR ANONYMISATION / PII ERASURE MODAL                    */}
      {/* ======================================================== */}
      {showAnonymiseModal && selectedCust && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
            maxWidth: 520,
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={18} /> GDPR Data Erasure & Anonymisation
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowAnonymiseModal(false)} />
            </div>

            <div style={{
              padding: '12px 14px',
              borderRadius: 8,
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              fontSize: 12,
              color: '#991B1B',
              lineHeight: 1.5,
              marginBottom: 16
            }}>
              <strong>Irreversible Action:</strong> This will erase all Personally Identifiable Information (Name, Mobile, Email, Saved Delivery Addresses) in compliance with data privacy regulations.
              <br /><br />
              <strong>Financial Integrity:</strong> Historic booking references, invoice sums, and tax ledgers are preserved strictly for statutory audit and GST reporting.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                Type <span style={{ color: '#DC2626', fontWeight: 800 }}>ANONYMISE</span> to confirm data erasure:
              </label>
              <input
                type="text"
                placeholder="ANONYMISE"
                value={confirmAnonymiseText}
                onChange={e => setConfirmAnonymiseText(e.target.value)}
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => {
                  setShowAnonymiseModal(false);
                  setConfirmAnonymiseText('');
                }}
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
                Abort
              </button>
              <button
                disabled={confirmAnonymiseText.trim().toUpperCase() !== 'ANONYMISE'}
                onClick={handleAnonymiseSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: confirmAnonymiseText.trim().toUpperCase() === 'ANONYMISE' ? '#DC2626' : '#CBD5E1',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: confirmAnonymiseText.trim().toUpperCase() === 'ANONYMISE' ? 'pointer' : 'not-allowed'
                }}
              >
                Permanently Anonymise Data
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
