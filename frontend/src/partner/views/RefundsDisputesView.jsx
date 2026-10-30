import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Plus,
  X,
  Clock,
  MessageSquare,
  FileText,
  User,
  ArrowRight,
  Send,
  Paperclip,
  Check,
  DollarSign
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function RefundsDisputesView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Message reply in dispute thread
  const [threadMessage, setThreadMessage] = useState('');
  const [threadEvidence, setThreadEvidence] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bookingId: '',
    issueType: 'Service Warranty Claim',
    claimAmount: '',
    reason: '',
    evidence: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDisputes();
  }, []);

  async function loadDisputes() {
    setLoading(true);
    try {
      const res = await partnerClient.getRefundsDisputes();
      if (res && res.success) {
        setDisputes(res.disputes || []);
      }
    } catch (err) {
      showToast?.('Error loading disputes: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openDisputeDetail(disputeId) {
    setDetailLoading(true);
    try {
      const res = await partnerClient.getDisputeDetail(disputeId);
      if (res && res.success && res.dispute) {
        setSelectedDispute(res.dispute);
      } else {
        const found = disputes.find(d => d.id === disputeId);
        setSelectedDispute(found || null);
      }
    } catch (err) {
      const found = disputes.find(d => d.id === disputeId);
      setSelectedDispute(found || null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSubmitDispute(e) {
    e.preventDefault();
    if (!formData.bookingId || !formData.reason) {
      showToast?.('Booking ID and dispute reason are mandatory.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        bookingId: formData.bookingId,
        issueType: formData.issueType,
        claimAmount: Number(formData.claimAmount) || 0,
        reason: formData.reason,
        evidence: formData.evidence ? formData.evidence.split(',').map(s => s.trim()) : []
      };
      const res = await partnerClient.submitDispute(payload);
      if (res && res.success) {
        showToast?.('Dispute submitted successfully for operations team review.');
        setIsSubmitModalOpen(false);
        setFormData({
          bookingId: '',
          issueType: 'Service Warranty Claim',
          claimAmount: '',
          reason: '',
          evidence: ''
        });
        loadDisputes();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!threadMessage.trim() || !selectedDispute) return;

    setSendingMessage(true);
    try {
      const res = await partnerClient.addDisputeMessage(selectedDispute.id, {
        message: threadMessage.trim(),
        evidence: threadEvidence.trim() || null
      });

      if (res && res.success) {
        showToast?.('Response posted to dispute arbitration thread.');
        setThreadMessage('');
        setThreadEvidence('');
        if (res.dispute) {
          setSelectedDispute(res.dispute);
        } else {
          openDisputeDetail(selectedDispute.id);
        }
        loadDisputes();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }

  const activeDisputes = disputes.filter(d => d.disputeStatus !== 'Resolved');
  const totalContested = disputes.reduce((sum, d) => sum + (Number(d.claimAmount) || 0), 0);
  const resolvedCount = disputes.filter(d => d.disputeStatus === 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Action */}
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
            Customer Deductions, SLA Penalties & Traceable Disputes
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Review warranty claim deductions, submit supporting evidence, and track arbitration timelines
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
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
          <Plus size={16} /> Raise New Dispute
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16
      }}>
        <div style={{ background: '#ffffff', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Active Escalations</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', margin: '4px 0 2px' }}>
            {activeDisputes.length} Cases
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Under platform arbitration</span>
        </div>

        <div style={{ background: '#ffffff', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Total Contested Value</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px' }}>
            ₹{totalContested.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Across all historical claims</span>
        </div>

        <div style={{ background: '#ffffff', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600 }}>Resolved Adjustments</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', margin: '4px 0 2px' }}>
            {resolvedCount} Cases
          </div>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Traceable credits issued</span>
        </div>
      </div>

      {/* Disputes Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            Loading disputes and arbitration claims...
          </div>
        ) : disputes.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            No active customer disputes or quality escalations on record.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Dispute Ref</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Related Booking</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Issue Type</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Contested Amount</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Assigned Owner</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Financial Adjustment</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                      #{d.id}
                      <div style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 400 }}>
                        {new Date(d.filedDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#0f172a' }}>{d.bookingId}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Pro: {d.technicianName}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>Cust: {d.customerName}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#334155'
                      }}>
                        {d.issueType || 'Warranty Claim'}
                      </span>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.reason}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#dc2626' }}>
                      ₹{(Number(d.claimAmount) || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5 }}>
                      {d.owner || 'Platform Dispute Desk'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: d.disputeStatus === 'Resolved' ? '#dcfce7' : '#fef3c7',
                        color: d.disputeStatus === 'Resolved' ? '#16a34a' : '#b45309'
                      }}>
                        {d.disputeStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {d.financialAdjustment ? (
                        <div style={{
                          padding: '4px 8px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 6,
                          fontSize: 12,
                          color: '#166534'
                        }}>
                          <strong>+{d.financialAdjustment.type} ₹{d.financialAdjustment.amount}</strong>
                          <div style={{ fontSize: 11, color: '#15803d' }}>
                            Settled in: {d.financialAdjustment.settledIn || 'Pending Cycle'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Pending arbitration</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => openDisputeDetail(d.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        View & Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispute Detail & Thread Modal */}
      {selectedDispute && (
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
            borderRadius: 14,
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Dispute #{selectedDispute.id}
                  </h2>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    background: selectedDispute.disputeStatus === 'Resolved' ? '#dcfce7' : '#fef3c7',
                    color: selectedDispute.disputeStatus === 'Resolved' ? '#16a34a' : '#b45309'
                  }}>
                    {selectedDispute.disputeStatus}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  Booking Ref: <strong>{selectedDispute.bookingId}</strong> • Assigned Desk: {selectedDispute.owner}
                </div>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Dispute Metadata Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                background: '#f8fafc',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Issue Type</span>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{selectedDispute.issueType}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Contested Amount</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>₹{selectedDispute.claimAmount}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Pro</span>
                  <div style={{ fontSize: 13.5, color: '#334155' }}>{selectedDispute.technicianName}</div>
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Customer</span>
                  <div style={{ fontSize: 13.5, color: '#334155' }}>{selectedDispute.customerName}</div>
                </div>
              </div>

              {/* Reason & Evidence */}
              <div>
                <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Dispute Reason / Claim
                </strong>
                <p style={{ fontSize: 13.5, color: '#334155', background: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', margin: 0 }}>
                  {selectedDispute.reason}
                </p>
              </div>

              {/* Supporting Evidence Chips */}
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                    Submitted Evidence & Documents:
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedDispute.evidence.map((ev, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: '#f1f5f9',
                          borderRadius: 6,
                          fontSize: 12.5,
                          color: '#475569',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <FileText size={14} color="#7c3aed" /> {ev}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Traceable Financial Adjustment Card */}
              <div style={{
                background: selectedDispute.financialAdjustment ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${selectedDispute.financialAdjustment ? '#86efac' : '#fde68a'}`,
                borderRadius: 10,
                padding: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <DollarSign size={18} color={selectedDispute.financialAdjustment ? '#16a34a' : '#d97706'} />
                  <strong style={{ fontSize: 14, color: selectedDispute.financialAdjustment ? '#166534' : '#92400e' }}>
                    Traceable Financial Adjustment Status
                  </strong>
                </div>
                {selectedDispute.financialAdjustment ? (
                  <div>
                    <div style={{ fontSize: 13.5, color: '#166534' }}>
                      Credit of <strong>₹{selectedDispute.financialAdjustment.amount}</strong> approved.
                      Ledger settlement reference: <strong>{selectedDispute.financialAdjustment.settledIn}</strong>.
                    </div>
                    <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>
                      {selectedDispute.financialAdjustment.description}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#92400e' }}>
                    Arbitration in progress. Approved adjustments will be posted as traceable ledger entries without rewriting past records.
                  </div>
                )}
                {selectedDispute.adminResolution && (
                  <div style={{ fontSize: 12.5, color: '#475569', marginTop: 8, fontStyle: 'italic' }}>
                    Platform Notes: "{selectedDispute.adminResolution}"
                  </div>
                )}
              </div>

              {/* Chronological Timeline */}
              {selectedDispute.timeline && selectedDispute.timeline.length > 0 && (
                <div>
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block', marginBottom: 10 }}>
                    Investigation Timeline
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 12, borderLeft: '2px solid #e2e8f0' }}>
                    {selectedDispute.timeline.map((step, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingLeft: 16 }}>
                        <div style={{
                          position: 'absolute',
                          left: -21,
                          top: 4,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#7c3aed'
                        }} />
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {new Date(step.timestamp).toLocaleString('en-GB')} • <strong>{step.actor}</strong>
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>
                          {step.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Thread */}
              <div>
                <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block', marginBottom: 10 }}>
                  Arbitration Thread & Platform Messages
                </strong>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxHeight: 220,
                  overflowY: 'auto'
                }}>
                  {(selectedDispute.messages || []).map((msg, idx) => {
                    const isPartner = msg.senderRole === 'Business Owner' || msg.senderRole?.includes('Partner');
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isPartner ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          background: isPartner ? '#7c3aed' : '#ffffff',
                          color: isPartner ? '#ffffff' : '#0f172a',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: isPartner ? 'none' : '1px solid #e2e8f0',
                          fontSize: 13
                        }}
                      >
                        <div style={{ fontSize: 11, color: isPartner ? '#e9d5ff' : '#64748b', marginBottom: 4 }}>
                          {msg.sender} ({msg.senderRole}) • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>{msg.message}</div>
                        {msg.evidence && (
                          <div style={{ fontSize: 11.5, marginTop: 4, color: isPartner ? '#ddd6fe' : '#7c3aed' }}>
                            Attachment: {msg.evidence}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Respond to Platform Form */}
                {selectedDispute.disputeStatus !== 'Resolved' && (
                  <form onSubmit={handleSendMessage} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Reply to Platform Operations questions..."
                        value={threadMessage}
                        onChange={e => setThreadMessage(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: 13.5
                        }}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !threadMessage.trim()}
                        style={{
                          padding: '9px 18px',
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Send size={15} /> Send
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Paperclip size={14} color="#64748b" />
                      <input
                        type="text"
                        placeholder="Optional evidence link or file name..."
                        value={threadEvidence}
                        onChange={e => setThreadEvidence(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontSize: 12
                        }}
                      />
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f8fafc'
            }}>
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                style={{
                  padding: '8px 18px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Dispute Modal */}
      {isSubmitModalOpen && (
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
            borderRadius: 14,
            width: '100%',
            maxWidth: 540,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Raise Deduction or Penalty Dispute
              </h2>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Related Booking ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD-9821"
                  value={formData.bookingId}
                  onChange={e => setFormData({ ...formData, bookingId: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Issue Type *
                </label>
                <select
                  value={formData.issueType}
                  onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  <option value="Service Warranty Claim">Service Warranty Claim</option>
                  <option value="Customer No-Show / Delay">Customer No-Show / Delay</option>
                  <option value="Billing Discrepancy">Billing Discrepancy</option>
                  <option value="Damage Claim">Damage Claim</option>
                  <option value="SLA Penalty Waiver">SLA Penalty Waiver</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Contested Penalty / Claim Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="450"
                  value={formData.claimAmount}
                  onChange={e => setFormData({ ...formData, claimAmount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Dispute Reason & Grounds *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the technical facts, technician route log, or client interaction..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Supporting Evidence (Comma-separated filenames or URLs)
                </label>
                <input
                  type="text"
                  placeholder="e.g. drain_pipe_photo.jpg, gps_route_log.pdf"
                  value={formData.evidence}
                  onChange={e => setFormData({ ...formData, evidence: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit to Arbitration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
