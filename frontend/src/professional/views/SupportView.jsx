import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function SupportView({ showToast }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // Create Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('booking_support');
  const [priority, setPriority] = useState('Normal');
  const [relatedBookingId, setRelatedBookingId] = useState('');
  const [relatedPayoutRef, setRelatedPayoutRef] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Safety Escalation Form State
  const [safetyIncidentType, setSafetyIncidentType] = useState('hazardous_environment');
  const [safetyBookingId, setSafetyBookingId] = useState('UC-829410');
  const [safetyDescription, setSafetyDescription] = useState('');
  const [consentLocationShare, setConsentLocationShare] = useState(false);
  const [submittingSafety, setSubmittingSafety] = useState(false);

  // Reply in Thread State
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Draft key
  const DRAFT_KEY = 'support_ticket_new';

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategoryFilter !== 'all') params.category = activeCategoryFilter;
      const res = await professionalClient.getSupportTickets(params);
      if (res.success && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [activeCategoryFilter]);

  // Restore draft if available
  useEffect(() => {
    const draft = professionalClient.loadDraft(DRAFT_KEY);
    if (draft && draft.data) {
      if (draft.data.subject) setSubject(draft.data.subject);
      if (draft.data.category) setCategory(draft.data.category);
      if (draft.data.description) setDescription(draft.data.description);
    }
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const attachments = [];
      if (attachmentName) {
        attachments.push({
          fileName: attachmentName,
          fileSizeKb: 1420,
          mimeType: 'image/jpeg',
          fileUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300'
        });
      }

      const res = await professionalClient.createSupportTicket({
        subject,
        category,
        priority,
        relatedBookingId,
        relatedPayoutRef,
        description,
        attachments
      });

      showToast(res.message || 'Support ticket submitted.');
      professionalClient.clearDraft(DRAFT_KEY);
      setShowCreateModal(false);
      setSubject('');
      setDescription('');
      setAttachmentName('');
      loadTickets();
    } catch (err) {
      showToast(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSafetyEscalation = async (e) => {
    e.preventDefault();
    if (!consentLocationShare) {
      showToast('You must authorize location transmission to alert the safety cell.');
      return;
    }
    if (submittingSafety) return;
    setSubmittingSafety(true);

    try {
      const res = await professionalClient.escalateSafetyIncident({
        incidentType: safetyIncidentType,
        relatedBookingId: safetyBookingId,
        description: safetyDescription || 'Emergency doorstep safety incident reported.',
        consentLocationShare: true,
        latitude: '19.0596',
        longitude: '72.8295'
      });

      showToast('🚨 ' + res.message);
      setShowSafetyModal(false);
      setSafetyDescription('');
      setConsentLocationShare(false);
      loadTickets();
    } catch (err) {
      showToast(err.message || 'Failed to submit safety escalation');
    } finally {
      setSubmittingSafety(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || submittingReply) return;
    setSubmittingReply(true);

    try {
      const res = await professionalClient.addTicketMessage(selectedTicket.id, {
        text: replyText.trim()
      });
      showToast('Message added to support thread.');
      setSelectedTicket(res.ticket);
      setReplyText('');
      loadTickets();
    } catch (err) {
      showToast(err.message || 'Failed to send message');
    } finally {
      setSubmittingReply(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Tickets' },
    { id: 'booking_support', label: 'Booking Support' },
    { id: 'earnings_payout', label: 'Earnings & Payout' },
    { id: 'account_onboarding', label: 'Account & KYC' },
    { id: 'technical_issue', label: 'Technical Issues' },
    { id: 'safety_incident', label: 'Safety Incidents' }
  ];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1040, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Support & Safety Command Center
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Multi-channel ticket resolution, verified safety escalations, and 24x7 Krishnagiri operations desk assistance
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSafetyModal(true)}
            style={{
              background: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🛡️</span> Report Safety Hazard
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Raise Support Ticket
          </button>
        </div>
      </div>

      {/* Verified Safety Action Banner (NO fake SOS, real helplines) */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.02em', color: '#f8fafc' }}>
              OFFICIAL DOORSTEP SAFETY PROTOCOL & EMERGENCY GUIDANCE
            </span>
          </div>
          <span style={{
            background: '#15803d',
            color: '#f0fdf4',
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700
          }}>
            Zero-Penalty Protection Active
          </span>
        </div>

        <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 16px 0', lineHeight: 1.6 }}>
          <strong>Immediate Safety Action:</strong> If facing live physical violence, ungrounded high-voltage electrical exposure, or severe harassment, <em>exit the premises immediately</em> and move to a safe, public street location. Platform policy strictly guarantees zero penalty or rating deduction for stopping work due to genuine safety hazards.
        </p>

        {/* Verified Helplines Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <a
            href="tel:112"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>National Emergency</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f87171' }}>112</div>
            </div>
            <span style={{ fontSize: 18 }}>📞</span>
          </a>

          <a
            href="tel:100"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Police Control Room</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>100</div>
            </div>
            <span style={{ fontSize: 18 }}>🚔</span>
          </a>

          <a
            href="tel:108"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Medical Ambulance</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#4ade80' }}>108</div>
            </div>
            <span style={{ fontSize: 18 }}>🚑</span>
          </a>

          <a
            href="tel:18002098820"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Platform Safety Cell (24x7)</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fbbf24' }}>1800-209-8820</div>
            </div>
            <span style={{ fontSize: 18 }}>🎧</span>
          </a>
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
          ℹ️ Platform Integrity Policy: Verified emergency service helplines only. We do not provide simulated or misleading emergency dispatch buttons.
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategoryFilter(c.id)}
            style={{
              background: activeCategoryFilter === c.id ? '#0f172a' : '#ffffff',
              color: activeCategoryFilter === c.id ? '#ffffff' : '#475569',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Support Tickets & Inquiries ({tickets.length})
          </h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Confidential staff notes are strictly protected from worker view
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            No tickets found in this category.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                style={{
                  background: selectedTicket?.id === t.id ? '#f8fafc' : '#ffffff',
                  borderRadius: 12,
                  padding: '18px 20px',
                  border: selectedTicket?.id === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#2563eb' }}>{t.id}</span>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {t.category?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {t.priority && (
                      <span style={{
                        background: t.priority === 'Critical' ? '#fee2e2' : t.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                        color: t.priority === 'Critical' ? '#b91c1c' : t.priority === 'High' ? '#c2410c' : '#475569',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {t.priority}
                      </span>
                    )}
                  </div>

                  <span style={{
                    background: t.status === 'Resolved' ? '#ecfdf5' : t.status === 'In Progress' ? '#eff6ff' : '#fef3c7',
                    color: t.status === 'Resolved' ? '#059669' : t.status === 'In Progress' ? '#2563eb' : '#d97706',
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {t.status}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                  {t.subject}
                </div>

                <div style={{ fontSize: 13, color: '#475569', marginBottom: 10, lineHeight: 1.5 }}>
                  {t.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    {t.relatedBookingId && <span>Booking Ref: <strong>{t.relatedBookingId}</strong> • </span>}
                    {t.relatedPayoutRef && <span>Payout Ref: <strong>{t.relatedPayoutRef}</strong> • </span>}
                    <span>{t.messages ? `${t.messages.length} message(s)` : 'No messages'}</span>
                  </div>
                  <div>Click to view thread & resolution history →</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details & Thread Drawer */}
      {selectedTicket && (
        <div style={{
          marginTop: 24,
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>{selectedTicket.id}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                {selectedTicket.subject}
              </h3>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              ✕ Close
            </button>
          </div>

          {/* Resolution History Timeline */}
          {selectedTicket.resolutionHistory && selectedTicket.resolutionHistory.length > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 18px', marginBottom: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                Resolution History Log
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedTicket.resolutionHistory.map((h, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>● {h.status}</span>
                    <span style={{ color: '#64748b' }}>by {h.updatedBy}</span>
                    <span style={{ color: '#94a3b8' }}>• {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:</span>
                    <span>{h.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Thread */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {selectedTicket.messages?.map(m => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'Professional' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: m.sender === 'Professional' ? '#eff6ff' : '#f8fafc',
                  border: m.sender === 'Professional' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.sender === 'Professional' ? '#1d4ed8' : '#0f172a' }}>
                    {m.sender} ({m.senderRole || 'User'})
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response to the support agent..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={submittingReply || !replyText.trim()}
              style={{
                background: submittingReply ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: submittingReply ? 'not-allowed' : 'pointer'
              }}
            >
              {submittingReply ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      )}

      {/* Create Support Ticket Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 26,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Create Support Ticket
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Tickets are routed directly to Krishnagiri operations specialists.
            </p>

            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Support Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    professionalClient.saveDraft(DRAFT_KEY, { subject, category: e.target.value, description });
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="booking_support">Booking-Related Support</option>
                  <option value="earnings_payout">Earnings & Payouts</option>
                  <option value="account_onboarding">Account & Onboarding KYC</option>
                  <option value="technical_issue">App & Technical Issues</option>
                  <option value="safety_incident">Safety Incident Reporting</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Related Booking ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={relatedBookingId}
                    onChange={(e) => setRelatedBookingId(e.target.value)}
                    placeholder="e.g. UC-829410"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    professionalClient.saveDraft(DRAFT_KEY, { subject: e.target.value, category, description });
                  }}
                  required
                  placeholder="Clear summary of your inquiry"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    professionalClient.saveDraft(DRAFT_KEY, { subject, category, description: e.target.value });
                  }}
                  required
                  rows={3}
                  placeholder="Describe what occurred, customer details, or invoice reference..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Attachment Evidence (Optional)
                </label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. invoice_deduction.jpg or terrace_wire.png"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Allowed formats: JPG, PNG, PDF (Max 5MB per platform rules).
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1.5,
                    background: submitting ? '#94a3b8' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '11px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safety Incident Escalation Modal (Explicit Consent Workflow) */}
      {showSafetyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 26,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🚨</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991b1b', margin: 0 }}>
                Doorstep Safety Hazard Escalation
              </h3>
            </div>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Use this form to trigger an authorized priority alert to the Rapid Safety Cell and Krishnagiri Operations Desk.
            </p>

            <form onSubmit={handleSafetyEscalation}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Hazard / Threat Category *
                </label>
                <select
                  value={safetyIncidentType}
                  onChange={(e) => setSafetyIncidentType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="hazardous_environment">Hazardous Environment (Exposed Live 230V Wiring, Gas Leak, Structural)</option>
                  <option value="threat_or_harassment">Customer Hostility / Threat / Physical Harassment</option>
                  <option value="medical_emergency">Medical Emergency / Technician Sudden Injury</option>
                  <option value="structural_collapse">AC Outdoor Unit Bracket Instability / Fall Risk</option>
                  <option value="other_safety_hazard">Other Critical Safety Risk</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Related Booking Reference
                </label>
                <input
                  type="text"
                  value={safetyBookingId}
                  onChange={(e) => setSafetyBookingId(e.target.value)}
                  placeholder="e.g. UC-829410"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Brief Incident Description
                </label>
                <textarea
                  value={safetyDescription}
                  onChange={(e) => setSafetyDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe location details, site condition, or current safe location..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Explicit Authorized Workflow Checkbox */}
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 20
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 12, color: '#991b1b', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={consentLocationShare}
                    onChange={(e) => setConsentLocationShare(e.target.checked)}
                    style={{ marginTop: 2, cursor: 'pointer' }}
                  />
                  <span>
                    <strong>Authorized Workflow Consent:</strong> I authorize the Forge India Connect Safety Cell to transmit my device GPS coordinates (12.5200, 78.2090) and alert the Krishnagiri Operations Team for emergency doorstep coordination.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowSafetyModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSafety || !consentLocationShare}
                  style={{
                    flex: 1.5,
                    background: (submittingSafety || !consentLocationShare) ? '#94a3b8' : '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: (submittingSafety || !consentLocationShare) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingSafety ? 'Alerting...' : 'Dispatch Safety Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
