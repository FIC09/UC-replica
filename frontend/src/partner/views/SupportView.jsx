import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  PhoneCall,
  Plus,
  MessageSquare,
  Clock,
  ShieldCheck,
  X,
  Paperclip,
  Send,
  AlertCircle,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
  ChevronRight,
  FileText
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function SupportView({ showToast, staff }) {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New ticket form
  const [form, setForm] = useState({
    category: 'Dispatch & Slot Allocation',
    priority: 'Medium',
    linkedEntityType: 'None',
    linkedEntityId: '',
    subject: '',
    message: '',
    evidenceNote: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    try {
      const res = await partnerClient.getSupportTickets();
      if (res && res.success) {
        setTickets(res.tickets || []);
        if (selectedTicket) {
          const updated = (res.tickets || []).find(t => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      showToast?.('Error loading support tickets: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTicket(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      showToast?.('Subject and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category: form.category,
        priority: form.priority,
        subject: form.subject.trim(),
        message: form.message.trim(),
        linkedEntity: form.linkedEntityType !== 'None' && form.linkedEntityId ? {
          type: form.linkedEntityType,
          id: form.linkedEntityId.trim()
        } : null,
        evidence: form.evidenceNote.trim() ? [
          {
            name: form.evidenceNote.trim(),
            type: 'attachment/proof',
            uploadedAt: new Date().toISOString()
          }
        ] : []
      };

      const res = await partnerClient.createSupportTicket(payload);
      if (res && res.success) {
        showToast?.('Support ticket logged with platform operations.');
        setIsModalOpen(false);
        setForm({
          category: 'Dispatch & Slot Allocation',
          priority: 'Medium',
          linkedEntityType: 'None',
          linkedEntityId: '',
          subject: '',
          message: '',
          evidenceNote: ''
        });
        loadTickets();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit support ticket');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const res = await partnerClient.addSupportTicketMessage(selectedTicket.id, replyText.trim());
      if (res && res.success) {
        showToast?.('Reply submitted to platform operations.');
        setReplyText('');
        if (res.ticket) {
          setSelectedTicket(res.ticket);
        }
        loadTickets();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  }

  const filteredTickets = statusFilter === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === statusFilter);

  const priorityColors = {
    'Urgent': { bg: '#fee2e2', text: '#dc2626' },
    'High': { bg: '#ffedd5', text: '#ea580c' },
    'Medium': { bg: '#fef3c7', text: '#d97706' },
    'Low': { bg: '#f1f5f9', text: '#475569' }
  };

  const statusColors = {
    'Open': { bg: '#fef3c7', text: '#b45309' },
    'In Progress': { bg: '#e0f2fe', text: '#0284c7' },
    'Resolved': { bg: '#dcfce7', text: '#16a34a' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
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
            Partner Helpdesk & Operational Support
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Track business tickets, link bookings, professionals or settlements, and collaborate with platform desk
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Open Priority Ticket
        </button>
      </div>

      {/* Emergency Field Hotline Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #ddd6fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PhoneCall size={20} />
          </div>
          <div>
            <strong style={{ fontSize: 14.5, color: '#0f172a', display: 'block' }}>
              Urgent On-Site Field Emergency Helpline
            </strong>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              For field technician safety, electrical hazards, or severe doorstep disputes (24/7 Priority Desk)
            </span>
          </div>
        </div>
        <a
          href="tel:+9118002081122"
          style={{
            background: '#7c3aed',
            color: '#fff',
            textDecoration: 'none',
            padding: '9px 18px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13.5
          }}
        >
          Call 1800-208-1122 (Toll Free)
        </a>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'Open', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: statusFilter === st ? 700 : 500,
                background: statusFilter === st ? '#7c3aed' : '#ffffff',
                color: statusFilter === st ? '#ffffff' : '#64748b',
                border: '1px solid #cbd5e1',
                cursor: 'pointer'
              }}
            >
              {st} ({st === 'ALL' ? tickets.length : tickets.filter(t => t.status === st).length})
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748b' }}>
          <Lock size={14} color="#64748b" /> Internal Platform Notes strictly separated & confidential
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading support tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', color: '#64748b' }}>
            No support tickets match the selected filter.
          </div>
        ) : (
          filteredTickets.map(tck => (
            <div
              key={tck.id}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>{tck.subject}</h3>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>#{tck.id}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                    <span>Category: <strong>{tck.category}</strong></span>
                    <span>•</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: priorityColors[tck.priority]?.bg || '#f1f5f9',
                      color: priorityColors[tck.priority]?.text || '#475569'
                    }}>
                      {tck.priority} Priority
                    </span>
                    {tck.linkedEntity && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7c3aed', fontWeight: 600 }}>
                          <LinkIcon size={12} /> {tck.linkedEntity.type}: {tck.linkedEntity.id}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    background: statusColors[tck.status]?.bg || '#fef3c7',
                    color: statusColors[tck.status]?.text || '#b45309'
                  }}>
                    {tck.status}
                  </span>

                  <button
                    onClick={() => setSelectedTicket(tck)}
                    style={{
                      padding: '6px 14px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    View Thread <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Latest message snippet */}
              {tck.messages && tck.messages.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 13, border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <strong style={{ color: '#0f172a', fontSize: 12 }}>
                      {tck.messages[tck.messages.length - 1].sender}
                    </strong>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      {new Date(tck.messages[tck.messages.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div style={{ color: '#475569', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tck.messages[tck.messages.length - 1].text}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TICKET THREAD & RESOLUTION MODAL                                  */}
      {/* ----------------------------------------------------------------- */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 680,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Thread Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {selectedTicket.subject}
                  </h2>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: statusColors[selectedTicket.status]?.bg || '#fef3c7',
                    color: statusColors[selectedTicket.status]?.text || '#b45309'
                  }}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                  Ticket #{selectedTicket.id} • Category: <strong>{selectedTicket.category}</strong> • Priority: <strong>{selectedTicket.priority}</strong>
                </div>
                {selectedTicket.linkedEntity && (
                  <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 3, fontWeight: 600 }}>
                    Linked Context: {selectedTicket.linkedEntity.type} #{selectedTicket.linkedEntity.id}
                  </div>
                )}
              </div>

              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Privacy Guarantee Banner */}
            <div style={{ background: '#f8fafc', padding: '10px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
              <Lock size={14} color="#7c3aed" />
              <span>
                <strong>Confidential Channel:</strong> All visible messages are business-facing. Platform internal desk notes are strictly partitioned and non-accessible to partner accounts.
              </span>
            </div>

            {/* Evidence Attachments if any */}
            {selectedTicket.evidence && selectedTicket.evidence.length > 0 && (
              <div style={{ padding: '12px 24px', background: '#faf5ff', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Paperclip size={14} color="#7c3aed" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8' }}>Attached Evidence:</span>
                {selectedTicket.evidence.map((ev, idx) => (
                  <span key={idx} style={{ fontSize: 12, color: '#581c87', background: '#ede9fe', padding: '2px 8px', borderRadius: 4 }}>
                    {typeof ev === 'string' ? ev : ev.name || 'File proof'}
                  </span>
                ))}
              </div>
            )}

            {/* Messages Thread Scrollable */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {selectedTicket.messages?.map((msg, idx) => {
                const isPartner = msg.sender?.includes('(') || msg.sender?.includes('Partner');
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isPartner ? 'flex-end' : 'flex-start',
                      gap: 4
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#64748b' }}>
                      <strong style={{ color: isPartner ? '#7c3aed' : '#0f172a' }}>{msg.sender}</strong>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                    </div>

                    <div style={{
                      background: isPartner ? '#f5f3ff' : '#f8fafc',
                      border: isPartner ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '12px 16px',
                      maxWidth: '85%',
                      color: '#1e293b',
                      fontSize: 13.5,
                      lineHeight: 1.5
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 10, background: '#ffffff' }}>
              <input
                type="text"
                placeholder="Type your reply to platform operations..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, outline: 'none' }}
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: sendingReply || !replyText.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={15} /> {sendingReply ? 'Sending...' : 'Reply'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: OPEN NEW PRIORITY TICKET                                   */}
      {/* ----------------------------------------------------------------- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 540,
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Open Priority Support Ticket
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Dispatch & Slot Allocation">Dispatch & Slot Allocation</option>
                    <option value="Payout & Financial Settlements">Payout & Financial Settlements</option>
                    <option value="Customer Dispute Arbitration">Customer Dispute Arbitration</option>
                    <option value="Technician Compliance & KYC">Technician Compliance & KYC</option>
                    <option value="Hardware Tools & Chemicals">Hardware Tools & Chemicals</option>
                    <option value="Account & Platform Policies">Account & Platform Policies</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Priority *</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (SLA: 2h)</option>
                  </select>
                </div>
              </div>

              {/* Linked Entity Selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Link Context</label>
                  <select
                    value={form.linkedEntityType}
                    onChange={e => setForm({ ...form, linkedEntityType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="None">None (General Inquiry)</option>
                    <option value="Booking">Booking Order</option>
                    <option value="Professional">Fleet Technician</option>
                    <option value="Settlement">Settlement Cycle</option>
                    <option value="Document">Compliance Document</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Reference ID</label>
                  <input
                    type="text"
                    disabled={form.linkedEntityType === 'None'}
                    placeholder={form.linkedEntityType === 'Booking' ? 'e.g. ORD-9841' : form.linkedEntityType === 'Professional' ? 'e.g. PRO-8841' : 'e.g. SETTL-2026-W42'}
                    value={form.linkedEntityId}
                    onChange={e => setForm({ ...form, linkedEntityId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: form.linkedEntityType === 'None' ? '#f8fafc' : '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue or operational escalation"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Description / Message *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detailed breakdown of incident, affected order, or clarification required..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Attach Evidence / Reference File</label>
                <input
                  type="text"
                  placeholder="e.g. Job completion sheet signed by customer / WhatsApp chat screenshot proof"
                  value={form.evidenceNote}
                  onChange={e => setForm({ ...form, evidenceNote: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: 8, color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
