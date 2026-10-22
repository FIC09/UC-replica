import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  User,
  Search,
  Filter,
  Lock,
  Send,
  X,
  FileText,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Building2,
  HardHat,
  ChevronRight,
  Plus
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function SupportView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'revisits'
  const [tickets, setTickets] = useState([]);
  const [revisits, setRevisits] = useState([]);

  // Ticket filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Selected ticket drawer
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Status update modal / controls
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [closureReason, setClosureReason] = useState('');

  // Revisit modal
  const [showRevisitModal, setShowRevisitModal] = useState(false);
  const [revisitForm, setRevisitForm] = useState({
    originalBookingId: '',
    serviceTitle: '',
    customerName: '',
    professionalName: '',
    issueCategory: 'Technician Workmanship Fault',
    evidenceSummary: '',
    responsibilityReview: 'Technician Workmanship Fault',
    resolutionAction: 'Free Redo Visit Scheduled',
    costCoveredBy: 'Company Warranty Guarantee Pool'
  });

  useEffect(() => {
    loadTickets();
    loadRevisits();
  }, []);

  function loadTickets() {
    adminClient.getSupportTickets()
      .then(res => setTickets(res.tickets || []))
      .catch(() => {});
  }

  function loadRevisits() {
    adminClient.getRevisits()
      .then(res => setRevisits(res.revisits || []))
      .catch(() => {});
  }

  // Handle adding reply or internal note
  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);

    try {
      const res = await adminClient.addTicketMessage(selectedTicket.id, replyText, isInternalNote);
      if (res.success) {
        setSelectedTicket(res.ticket);
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? res.ticket : t));
        setReplyText('');
        if (onShowToast) {
          onShowToast(isInternalNote ? '🔒 Internal note recorded' : '✓ Reply sent to user');
        }
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  }

  // Handle updating ticket status & closure reason
  async function handleUpdateStatus(statusValue) {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      const res = await adminClient.updateTicketStatus(
        selectedTicket.id,
        statusValue,
        statusValue === 'Resolved' || statusValue === 'Closed' ? closureReason : undefined
      );
      if (res.success) {
        setSelectedTicket(res.ticket);
        setTickets(prev => prev.map(t => t.id === selectedTicket.id ? res.ticket : t));
        if (onShowToast) onShowToast(`Ticket marked as ${statusValue}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Handle creating a revisit warranty dispute
  async function handleCreateRevisit(e) {
    e.preventDefault();
    if (!revisitForm.originalBookingId || !revisitForm.customerName) return;

    try {
      const res = await adminClient.createRevisit(revisitForm);
      if (res.success) {
        setRevisits(prev => [res.revisit, ...prev]);
        setShowRevisitModal(false);
        setRevisitForm({
          originalBookingId: '',
          serviceTitle: '',
          customerName: '',
          professionalName: '',
          issueCategory: 'Technician Workmanship Fault',
          evidenceSummary: '',
          responsibilityReview: 'Technician Workmanship Fault',
          resolutionAction: 'Free Redo Visit Scheduled',
          costCoveredBy: 'Company Warranty Guarantee Pool'
        });
        if (onShowToast) onShowToast('Warranty revisit dispute registered');
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  }

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (roleFilter !== 'ALL' && t.callerRole !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (t.id || '').toLowerCase().includes(q) ||
        (t.callerName || '').toLowerCase().includes(q) ||
        (t.bookingId || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.assignedOwner || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Tabs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Support, Quality & Warranty Disputes
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE'
              }}>
                Strict SLA Tracking
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
              Manage customer, pro, and partner support tickets, conversation threads, internal staff notes, and warranty revisits.
            </p>
          </div>

          {activeTab === 'revisits' && (
            <button
              type="button"
              onClick={() => setShowRevisitModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 8,
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Log Warranty Revisit Dispute
            </button>
          )}
        </div>

        {/* Sub-Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E2E8F0', paddingBottom: 2 }}>
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'tickets' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'tickets' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <HelpCircle size={16} />
            <span>Support Tickets</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: activeTab === 'tickets' ? '#F3E8FF' : '#F1F5F9',
              color: activeTab === 'tickets' ? '#6E42E5' : '#64748B'
            }}>
              {tickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revisits')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'revisits' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'revisits' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <RotateCcw size={16} />
            <span>Revisits & Warranty Disputes</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: activeTab === 'revisits' ? '#F3E8FF' : '#F1F5F9',
              color: activeTab === 'revisits' ? '#6E42E5' : '#64748B'
            }}>
              {revisits.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUPPORT TICKETS HELPDESK                                            */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter Bar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '14px 20px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#F8FAFC',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '8px 12px',
                width: 280
              }}>
                <Search size={16} color="#64748B" />
                <input
                  type="text"
                  placeholder="Search Ticket, Customer, Booking..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Role:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 12.5,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                >
                  <option value="ALL">All Callers</option>
                  <option value="Customer">Customer</option>
                  <option value="Professional">Professional</option>
                  <option value="Business Partner">Business Partner</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 12.5,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 12.5,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontWeight: 600
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>Ticket Ref & Booking</th>
                  <th style={{ padding: '12px 18px' }}>Caller & Association</th>
                  <th style={{ padding: '12px 18px' }}>Issue Category</th>
                  <th style={{ padding: '12px 18px' }}>Priority & SLA Status</th>
                  <th style={{ padding: '12px 18px' }}>Assigned Agent</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Thread</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      No tickets match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#6E42E5' }}>{t.referenceNumber}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                          Order: <strong style={{ color: '#0F172A' }}>{t.bookingId}</strong>
                        </div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.serviceTitle}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{t.callerName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            backgroundColor: t.callerRole === 'Customer' ? '#EFF6FF' : t.callerRole === 'Professional' ? '#ECFDF5' : '#F5F3FF',
                            color: t.callerRole === 'Customer' ? '#1D4ED8' : t.callerRole === 'Professional' ? '#047857' : '#6D28D9'
                          }}>
                            {t.callerRole}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{t.callerPhone}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{t.category}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                          {t.conversation?.length || 0} messages logged
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            width: 'fit-content',
                            backgroundColor: t.priority === 'Urgent' || t.priority === 'High' ? '#FEE2E2' : t.priority === 'Medium' ? '#FEF3C7' : '#F1F5F9',
                            color: t.priority === 'Urgent' || t.priority === 'High' ? '#DC2626' : t.priority === 'Medium' ? '#92400E' : '#475569'
                          }}>
                            {t.priority}
                          </span>

                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: t.slaStatus === 'Breached' ? '#DC2626' : '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}>
                            <Clock size={10} />
                            SLA: {t.slaStatus}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: 12.5 }}>
                        {t.assignedOwner}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          backgroundColor: t.status === 'Resolved' ? '#ECFDF5' : t.status === 'In Progress' ? '#FFFBEB' : '#EFF6FF',
                          color: t.status === 'Resolved' ? '#059669' : t.status === 'In Progress' ? '#D97706' : '#2563EB'
                        }}>
                          {t.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(t)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#FFFFFF',
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Open</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REVISITS & WARRANTY DISPUTES                                        */}
      {/* ========================================================================= */}
      {activeTab === 'revisits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>Dispute Ref & Original Order</th>
                  <th style={{ padding: '12px 18px' }}>Customer & Service</th>
                  <th style={{ padding: '12px 18px' }}>Issue & Evidence Summary</th>
                  <th style={{ padding: '12px 18px' }}>Responsibility Review</th>
                  <th style={{ padding: '12px 18px' }}>Resolution & Warranty Cost</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {revisits.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: '#6E42E5' }}>{r.id}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        Original: <strong style={{ color: '#0F172A' }}>{r.originalBookingId}</strong>
                      </div>
                      {r.revisitBookingId && (
                        <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                          Redo: {r.revisitBookingId}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.customerName}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{r.serviceTitle}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Original Pro: {r.professionalName}</div>
                    </td>

                    <td style={{ padding: '14px 18px', maxWidth: 280 }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 12 }}>{r.issueCategory}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>
                        {r.evidenceSummary}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FDE68A'
                      }}>
                        {r.responsibilityReview}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#059669' }}>{r.resolutionAction}</div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                        Covered By: {r.costsIncurred?.costCoveredBy || r.costCoveredBy}
                      </div>
                      {r.costsIncurred?.redoServiceCost > 0 && (
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>
                          Warranty Cost: ₹{r.costsIncurred?.redoServiceCost} (Pro deduction: ₹{r.costsIncurred?.proDeduction})
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        backgroundColor: '#ECFDF5',
                        color: '#059669'
                      }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: TICKET CONVERSATION & INTERNAL NOTES                       */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            width: '100%',
            maxWidth: 600,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                    {selectedTicket.referenceNumber}
                  </h3>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: selectedTicket.priority === 'High' || selectedTicket.priority === 'Urgent' ? '#FEE2E2' : '#FEF3C7',
                    color: selectedTicket.priority === 'High' || selectedTicket.priority === 'Urgent' ? '#DC2626' : '#92400E'
                  }}>
                    {selectedTicket.priority} Priority
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Booking: <strong>{selectedTicket.bookingId}</strong> • {selectedTicket.serviceTitle}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            {/* Caller Info & Status Controls */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ fontSize: 12.5 }}>
                <span style={{ color: '#64748B' }}>Caller:</span>{' '}
                <strong style={{ color: '#0F172A' }}>{selectedTicket.callerName}</strong>{' '}
                <span style={{ color: '#64748B' }}>({selectedTicket.callerRole})</span>
              </div>

              {/* Status Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={e => handleUpdateStatus(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Feed */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              backgroundColor: '#F8FAFC'
            }}>
              {selectedTicket.conversation?.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: msg.isInternal ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                    backgroundColor: msg.isInternal ? '#FFFBEB' : '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {msg.isInternal ? (
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}>
                          <Lock size={10} /> Internal Staff Note (Hidden from Customer)
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>
                          {msg.sender}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>
                      {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                    {msg.text}
                  </p>

                  {msg.attachments?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {msg.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 11, color: '#6E42E5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <FileText size={12} /> Attachment #{i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Composer Box */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF'
            }}>
              {/* Internal Note vs Customer Reply Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(false)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: !isInternalNote ? '1px solid #6E42E5' : '1px solid #E2E8F0',
                      backgroundColor: !isInternalNote ? '#F5F3FF' : '#FFFFFF',
                      color: !isInternalNote ? '#6E42E5' : '#64748B'
                    }}
                  >
                    Reply to Customer / Pro
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInternalNote(true)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isInternalNote ? '1px solid #D97706' : '1px solid #E2E8F0',
                      backgroundColor: isInternalNote ? '#FFFBEB' : '#FFFFFF',
                      color: isInternalNote ? '#92400E' : '#64748B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Lock size={12} /> Internal Staff Note
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendReply} style={{ display: 'flex', gap: 8 }}>
                <textarea
                  rows={2}
                  placeholder={isInternalNote ? 'Type an internal note visible only to admins...' : 'Type a reply visible to the customer...'}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: isInternalNote ? '1px solid #FDE68A' : '1px solid #D1D5DB',
                    backgroundColor: isInternalNote ? '#FFFDF5' : '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none'
                  }}
                />

                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  style={{
                    padding: '0 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: isInternalNote ? '#D97706' : '#6E42E5',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: sendingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Send size={15} />
                  <span>{isInternalNote ? 'Save Note' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG REVISIT WARRANTY DISPUTE                                       */}
      {/* ========================================================================= */}
      {showRevisitModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 540,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RotateCcw size={18} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Log 30-Day Warranty Revisit Dispute
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisitModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleCreateRevisit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Original Booking ID</label>
                    <input
                      type="text"
                      placeholder="e.g. ORD-9841"
                      required
                      value={revisitForm.originalBookingId}
                      onChange={e => setRevisitForm({ ...revisitForm, originalBookingId: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Customer Name</label>
                    <input
                      type="text"
                      placeholder="Customer full name"
                      required
                      value={revisitForm.customerName}
                      onChange={e => setRevisitForm({ ...revisitForm, customerName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Service Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Powerjet AC Servicing"
                      value={revisitForm.serviceTitle}
                      onChange={e => setRevisitForm({ ...revisitForm, serviceTitle: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Assigned Original Pro</label>
                    <input
                      type="text"
                      placeholder="Technician name"
                      value={revisitForm.professionalName}
                      onChange={e => setRevisitForm({ ...revisitForm, professionalName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Responsibility Review</label>
                  <select
                    value={revisitForm.responsibilityReview}
                    onChange={e => setRevisitForm({ ...revisitForm, responsibilityReview: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                  >
                    <option value="Technician Workmanship Fault">Technician Workmanship Fault</option>
                    <option value="Customer Misuse">Customer Misuse</option>
                    <option value="Manufacturer Part Defect">Manufacturer Part Defect</option>
                    <option value="Platform Goodwill">Platform Goodwill</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Evidence & Defect Summary</label>
                  <textarea
                    rows={3}
                    placeholder="Describe recurring issue, customer complaint and photographic evidence..."
                    value={revisitForm.evidenceSummary}
                    onChange={e => setRevisitForm({ ...revisitForm, evidenceSummary: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 4, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{
                padding: '14px 24px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}>
                <button
                  type="button"
                  onClick={() => setShowRevisitModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Register Warranty Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
