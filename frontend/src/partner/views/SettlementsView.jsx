import React, { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, ShieldCheck, CheckCircle2, Clock, 
  AlertCircle, Plus, X, ArrowUpRight, Lock, RefreshCw, Download, FileText, AlertTriangle 
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function SettlementsView({ showToast, staff }) {
  const [loading, setLoading] = useState(true);
  const [settlementData, setSettlementData] = useState(null);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedSettlementForCorrection, setSelectedSettlementForCorrection] = useState(null);
  const [statementPreview, setStatementPreview] = useState(null);

  // Form state for bank change request
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'Current Corporate Account',
    reason: ''
  });

  // Form state for settlement correction
  const [correctionForm, setCorrectionForm] = useState({
    disputedAmount: '',
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSettlements();
  }, []);

  async function loadSettlements() {
    setLoading(true);
    try {
      const res = await partnerClient.getSettlements();
      if (res && res.success) {
        setSettlementData(res);
      }
    } catch (err) {
      showToast?.('Error loading settlements: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBankChangeSubmit(e) {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.ifscCode) {
      showToast?.('Bank name, account number, and IFSC code are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await partnerClient.requestBankChange(bankForm);
      if (res && res.success) {
        showToast?.('Bank change request submitted for compliance verification.');
        setIsChangeModalOpen(false);
        setBankForm({
          bankName: '',
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          accountType: 'Current Corporate Account',
          reason: ''
        });
        loadSettlements();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit bank change request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadStatement(st) {
    try {
      const res = await partnerClient.downloadSettlementStatement(st.id);
      if (res && res.success) {
        setStatementPreview(res);
        showToast?.(`Statement loaded for ${st.id}`);
      }
    } catch (err) {
      showToast?.('Error generating statement: ' + err.message);
    }
  }

  function handleTriggerCorrectionModal(st) {
    setSelectedSettlementForCorrection(st);
    setCorrectionForm({ disputedAmount: '', reason: '' });
    setIsCorrectionModalOpen(true);
  }

  async function handleSubmitCorrection(e) {
    e.preventDefault();
    if (!correctionForm.reason || correctionForm.reason.length < 5) {
      showToast?.('Please enter a detailed correction reason (min 5 characters).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await partnerClient.requestSettlementCorrection(selectedSettlementForCorrection.id, correctionForm);
      if (res && res.success) {
        showToast?.('Settlement correction request submitted to Platform Treasury.');
        setIsCorrectionModalOpen(false);
        loadSettlements();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit correction request');
    } finally {
      setSubmitting(false);
    }
  }

  const currentAcc = settlementData?.currentAccount || {
    bankName: 'ICICI Bank Ltd',
    accountHolderName: 'Apex Home Solutions LLP',
    accountNumber: '••••••••9012',
    ifscCode: 'ICIC0000002',
    accountType: 'Current Corporate Account',
    status: 'Verified'
  };

  const settlements = settlementData?.settlements || [];
  const changeRequests = settlementData?.bankChangeRequests || [];
  const correctionRequests = settlementData?.correctionRequests || [];

  const canRequestBankChange = staff?.permissions?.requesting_bank_changes === true;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
            Settlements, Statements & Corporate Bank Details
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Platform disbursement batches, bank statements, UTR records, and tokenized financial accounts
          </p>
        </div>

        {canRequestBankChange ? (
          <button
            onClick={() => setIsChangeModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Request Bank Detail Change
          </button>
        ) : (
          <span style={{
            fontSize: 12.5,
            color: '#64748b',
            background: '#f1f5f9',
            padding: '6px 12px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Lock size={14} color="#94a3b8" /> Bank changes restricted to Business Owner
          </span>
        )}
      </div>

      {/* Security & Financial Privacy Callout */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 12,
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        fontSize: 13,
        color: '#475569',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <ShieldCheck size={20} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: '#0f172a' }}>Financial Privacy & Tokenization Gateway:</strong> {settlementData?.sandboxDisclaimer || 'Bank account numbers are masked and tokenized under RBI/NPCI compliance.'}
          <div style={{ marginTop: 2, color: '#64748b' }}>
            {settlementData?.payoutRedirectionPolicy || 'Pending payouts will not be redirected to newly submitted accounts until NPCI Penny-drop verification passes compliance.'}
          </div>
        </div>
      </div>

      {/* Corporate Bank Account Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        color: '#fff',
        borderRadius: 16,
        padding: '24px',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 12, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
              Designated Corporate Settlement Account
            </span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 2px 0', color: '#fff' }}>
              {currentAcc.bankName}
            </h2>
            <div style={{ fontSize: 13.5, color: '#cbd5e1' }}>
              Holder: <strong>{currentAcc.accountHolderName}</strong>
            </div>
          </div>

          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12.5,
            fontWeight: 700,
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            <ShieldCheck size={15} /> KYC Verified
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '16px 20px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>Masked Account Number</span>
            <strong style={{ fontSize: 15, letterSpacing: 1.5, color: '#fff' }}>{currentAcc.accountNumber}</strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>IFSC Code</span>
            <strong style={{ fontSize: 15, color: '#fff' }}>{currentAcc.ifscCode}</strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>Account Type</span>
            <strong style={{ fontSize: 14, color: '#fff' }}>{currentAcc.accountType}</strong>
          </div>
        </div>
      </div>

      {/* Pending Change Requests (if any) */}
      {changeRequests.length > 0 && (
        <div style={{
          background: '#fffbeb',
          borderRadius: 12,
          padding: 20,
          border: '1px solid #fde68a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontWeight: 700, fontSize: 14.5, marginBottom: 8 }}>
            <Clock size={18} /> Active Corporate Bank Change Request
          </div>
          {changeRequests.map(r => (
            <div key={r.id} style={{ fontSize: 13.5, color: '#78350f', lineHeight: 1.6 }}>
              Request Ref: <strong>#{r.id}</strong> • Submitted by: <strong>{r.requestedBy}</strong><br />
              Proposed Account: <strong>{r.proposedBank?.bankName} ({r.proposedBank?.accountNumber})</strong> - IFSC: <strong>{r.proposedBank?.ifscCode}</strong><br />
              Verification Status: <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: 4, fontWeight: 700, color: '#92400e' }}>{r.status}</span><br />
              <div style={{ marginTop: 4, fontSize: 12.5, color: '#92400e' }}>
                Note: {r.complianceNote}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settlements Batch Ledger Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        padding: 20,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Platform Settlement Batches, Statements & UTR Tracking
          </h2>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Note: Partners may request corrections; platform disbursement states are managed by Platform Treasury.
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Batch ID & Cycle</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Disbursement Date</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>UTR / Bank Reference</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Beneficiary Account</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Disbursed Amount</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map(st => (
                <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>
                    #{st.id}
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>{st.cycle}</div>
                  </td>
                  <td style={{ padding: '14px', color: '#334155' }}>
                    {new Date(st.payoutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: 12.5, color: '#475569' }}>
                    {st.utrNumber}
                  </td>
                  <td style={{ padding: '14px', color: '#64748b', fontSize: 13 }}>
                    {st.bankAccountMasked}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#16a34a', fontSize: 14 }}>
                    ₹{st.netDisbursed.toLocaleString('en-IN')}
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{st.netDisbursedPaise} p</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: st.status === 'Settled' ? '#dcfce7' : st.status === 'Processing' ? '#fef3c7' : '#fee2e2',
                      color: st.status === 'Settled' ? '#16a34a' : st.status === 'Processing' ? '#b45309' : '#dc2626'
                    }}>
                      {st.status}
                    </span>
                    {st.failureReason && (
                      <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, maxWidth: 180 }}>
                        {st.failureReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => handleDownloadStatement(st)}
                        title="Download / View Statement"
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Download size={13} /> Statement
                      </button>

                      <button
                        onClick={() => handleTriggerCorrectionModal(st)}
                        title="Request Settlement Correction"
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid #fed7aa',
                          background: '#fff7ed',
                          color: '#c2410c',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Correction
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submitted Settlement Corrections List */}
      {correctionRequests.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: 20,
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
            Submitted Settlement Correction Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {correctionRequests.map(cr => (
              <div
                key={cr.id}
                style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13
                }}
              >
                <div>
                  <strong>{cr.settlementId} (Disputed: ₹{cr.disputedAmount})</strong>
                  <div style={{ color: '#64748b', fontSize: 12.5, marginTop: 2 }}>{cr.reason}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: 4, background: '#fef3c7', color: '#b45309', fontWeight: 600, fontSize: 11.5 }}>
                  {cr.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Statement Preview */}
      {statementPreview && (
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
            maxWidth: 640,
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                Settlement Statement Preview ({statementPreview.settlement?.id})
              </h3>
              <button
                onClick={() => setStatementPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: statementPreview.printableHtml }}
              style={{ padding: 20, maxHeight: 420, overflowY: 'auto' }}
            />
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setStatementPreview(null)}
                style={{ padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Settlement Correction */}
      {isCorrectionModalOpen && selectedSettlementForCorrection && (
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
            maxWidth: 500,
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
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Request Settlement Correction
                </h2>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Target Batch: #{selectedSettlementForCorrection.id}
                </span>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Disputed Amount (INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={correctionForm.disputedAmount}
                  onChange={e => setCorrectionForm({ ...correctionForm, disputedAmount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Correction Justification *
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the discrepancy, relevant booking ID, or fee adjustment contested..."
                  value={correctionForm.reason}
                  onChange={e => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  style={{ flex: 1, padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 2, padding: '10px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit to Treasury'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Corporate Bank Detail Change */}
      {isChangeModalOpen && (
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
            maxWidth: 520,
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
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Request Bank Account Change
                </h2>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  Restricted to verified Business Owners only
                </span>
              </div>
              <button
                onClick={() => setIsChangeModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBankChangeSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New Bank Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank Ltd"
                  value={bankForm.bankName}
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Account Holder Name (Must match Entity Legal Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Home Solutions LLP"
                  value={bankForm.accountHolderName}
                  onChange={e => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Corporate Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter full account number"
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="HDFC0000060"
                    value={bankForm.ifscCode}
                    onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reason for Account Modification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corporate treasury consolidation"
                  value={bankForm.reason}
                  onChange={e => setBankForm({ ...bankForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12, color: '#64748b' }}>
                Note: Submissions trigger an automated penny-drop verification and cancelled cheque audit. The existing account remains active until new credentials pass compliance review.
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsChangeModalOpen(false)}
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
                  {submitting ? 'Submitting...' : 'Submit Change Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
