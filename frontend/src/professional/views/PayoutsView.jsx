import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function PayoutsView({ profile, showToast }) {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(profile?.walletBalance || 15450);
  const [settlementModel, setSettlementModel] = useState('direct_to_worker');
  const [isBusinessAssociated, setIsBusinessAssociated] = useState(false);
  const [actualRecipient, setActualRecipient] = useState(null);
  const [settlementNotice, setSettlementNotice] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: profile?.applicantName || 'Vikram Salvi',
    bankName: 'HDFC Bank',
    accountNumber: '••••••••4821',
    ifscCode: 'HDFC0001248',
    upiId: 'vikramsalvi@okaxis',
    status: 'Verified',
    hasPendingChangeRequest: false
  });
  const [payoutStatements, setPayoutStatements] = useState([]);
  const [bankChangeRequests, setBankChangeRequests] = useState([]);
  const [disputes, setDisputes] = useState([]);

  // Modals
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('vikramsalvi@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);

  const [showBankChangeModal, setShowBankChangeModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: profile?.applicantName || 'Vikram Salvi',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
    reason: '',
    documentRef: 'Cancelled_Cheque_Scan.png'
  });
  const [bankFormError, setBankFormError] = useState('');
  const [submittingBankChange, setSubmittingBankChange] = useState(false);

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    category: 'missing_earnings',
    sourceType: 'booking',
    sourceRef: 'UC-829410',
    disputedAmount: '',
    reason: '',
    description: ''
  });
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    loadPayoutsData();
  }, []);

  async function loadPayoutsData() {
    setLoading(true);
    try {
      const data = await professionalClient.getPayouts();
      if (data.success) {
        if (data.balance !== undefined) setBalance(data.balance);
        if (data.settlementModel) setSettlementModel(data.settlementModel);
        if (data.isBusinessAssociated !== undefined) setIsBusinessAssociated(data.isBusinessAssociated);
        if (data.actualRecipient) setActualRecipient(data.actualRecipient);
        if (data.settlementNotice) setSettlementNotice(data.settlementNotice);
        if (data.bankDetails) setBankDetails(data.bankDetails);
        if (data.payoutStatements) setPayoutStatements(data.payoutStatements);
        if (data.bankChangeRequests) setBankChangeRequests(data.bankChangeRequests);
        if (data.financialDisputes) setDisputes(data.financialDisputes);
      }
    } catch (err) {
      console.warn('Payouts load warning:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 500) {
      showToast('Minimum withdrawal amount is ₹500');
      return;
    }
    if (amt > balance) {
      showToast('Withdrawal amount cannot exceed available wallet balance');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await professionalClient.requestWithdrawal({
        amount: amt,
        upiId: withdrawUpi
      });
      showToast(`Success! ₹${amt} transferred to ${withdrawUpi} (Sandbox Demo).`);
      setBalance(prev => prev - amt);
      setPayoutStatements(prev => [
        {
          id: res.payoutId || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          period: 'Today Instant Withdrawal',
          grossFare: amt,
          platformCommission: 0,
          netSettlementAmount: amt,
          actualRecipient: actualRecipient?.label || 'Direct Worker Account',
          status: 'Settled',
          utr: res.utr || `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          disbursementDate: 'Just now',
          isVerifiedPlatformTransfer: true,
          adjustments: []
        },
        ...prev
      ]);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (err) {
      showToast(err.message || 'Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBankChangeSubmit = async (e) => {
    e.preventDefault();
    setBankFormError('');

    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      setBankFormError('Account numbers do not match');
      return;
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankForm.ifscCode.trim().toUpperCase())) {
      setBankFormError('Invalid IFSC code format (must be 11 characters starting with 4 letters, 5th char 0, e.g. HDFC0001248)');
      return;
    }

    setSubmittingBankChange(true);
    try {
      const res = await professionalClient.submitBankChangeRequest({
        ...bankForm,
        ifscCode: bankForm.ifscCode.trim().toUpperCase()
      });

      if (res.success) {
        showToast('Bank change request submitted! Pending compliance penny-drop review.');
        if (res.changeHistory) {
          setBankChangeRequests(res.changeHistory);
        } else if (res.changeRequest) {
          setBankChangeRequests(prev => [res.changeRequest, ...prev]);
        }
        setShowBankChangeModal(false);
        setBankForm({
          accountHolderName: profile?.applicantName || 'Vikram Salvi',
          accountNumber: '',
          confirmAccountNumber: '',
          ifscCode: '',
          bankName: '',
          upiId: '',
          reason: '',
          documentRef: 'Cancelled_Cheque_Scan.png'
        });
      }
    } catch (err) {
      setBankFormError(err.message || 'Submission failed');
    } finally {
      setSubmittingBankChange(false);
    }
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(disputeForm.disputedAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid disputed amount (> ₹0)');
      return;
    }

    setSubmittingDispute(true);
    try {
      const res = await professionalClient.submitFinancialDispute({
        ...disputeForm,
        disputedAmount: amt
      });

      if (res.success) {
        showToast(`Dispute ${res.dispute?.id || ''} registered with Financial Audit Cell.`);
        if (res.disputes) {
          setDisputes(res.disputes);
        } else if (res.dispute) {
          setDisputes(prev => [res.dispute, ...prev]);
        }
        setShowDisputeModal(false);
        setDisputeForm({
          category: 'missing_earnings',
          sourceType: 'booking',
          sourceRef: '',
          disputedAmount: '',
          reason: '',
          description: ''
        });
      }
    } catch (err) {
      showToast(err.message || 'Dispute submission failed');
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1040, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title & Settlement Model Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Payouts & Banking Settlements
            </h1>
            <span style={{
              background: isBusinessAssociated ? '#eff6ff' : '#ecfdf5',
              color: isBusinessAssociated ? '#1d4ed8' : '#047857',
              border: `1px solid ${isBusinessAssociated ? '#bfdbfe' : '#a7f3d0'}`,
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              {isBusinessAssociated ? '🏢 Business-Associated Settlement' : '👤 Direct Professional Settlement'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Multi-tier verified disbursements, change-request audits, and source-linked financial reconciliation
          </div>
        </div>

        {/* Sandbox Indicator */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          color: '#92400e',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🛡️</span>
          <span>Sandbox Mode • Simulated Transactions</span>
        </div>
      </div>

      {/* Business-Associated Settlement Notice Callout (if applicable) */}
      {isBusinessAssociated && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 20 }}>ℹ️</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', marginBottom: 4 }}>
                Settlement Model: Platform Settle to Agency Corporate Account
              </div>
              <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.5 }}>
                {settlementNotice || 'Transfers disbursed to your agency corporate account represent B2B settlements between Urban Company and Apex Home Solutions LLP (PTR-90142). This platform-to-business transfer does NOT represent completed salary payment to you as an employee. Your employer provides your employment contract and salary schedule according to your agency agreement. Platform transfers are distinct from employer-reported wages.'}
              </div>
              <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 8, fontWeight: 600 }}>
                • Anti-Double Counting Guard Active • Workers cannot manually mark platform transfers as paid
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Balance Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.9 }}>
            Available Withdrawable Balance
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, margin: '6px 0 4px 0' }}>
            ₹{balance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Zero withdrawal fees • Disbursed 24x7 via IMPS / UPI (Sandbox Demonstration)
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowDisputeModal(true)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '11px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚖️ Raise Dispute
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{
              background: '#ffffff',
              color: '#065f46',
              border: 'none',
              padding: '11px 22px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            💸 Transfer Funds
          </button>
        </div>
      </div>

      {/* Linked Bank & Actual Recipient Breakdown */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
              Verified Settlement Destination & Banking Details
            </h3>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Transfers route strictly to the verified recipient below. Full account numbers remain encrypted.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700
            }}>
              ✓ KYC Verified
            </span>
            <button
              onClick={() => setShowBankChangeModal(true)}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✏️ Request Bank Change
            </button>
          </div>
        </div>

        {/* Recipient Snapshot Box */}
        <div style={{
          background: isBusinessAssociated ? '#f8fafc' : '#f0fdf4',
          border: `1px solid ${isBusinessAssociated ? '#e2e8f0' : '#bbf7d0'}`,
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Designated Settlement Recipient
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {actualRecipient?.label || (isBusinessAssociated ? 'Apex Home Solutions LLP [PTR-90142]' : `${profile?.applicantName || 'Vikram Salvi'} [Personal Account]`)}
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              Recipient Type: <strong>{actualRecipient?.type === 'partner_business' ? 'Business Entity (Agency Corporate Account)' : 'Individual Professional (Personal Savings Account)'}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Settlement Cycle</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Weekly Automatic Batch (Every Wednesday)</div>
          </div>
        </div>

        {/* Bank & UPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Bank Account (IMPS / NEFT)
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {bankDetails.bankName || 'HDFC Bank'}
            </div>
            <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>
              A/C: {bankDetails.accountNumber} • IFSC: {bankDetails.ifscCode}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Holder: {bankDetails.accountHolderName}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Instant UPI VPA Handle
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              {bankDetails.upiId}
            </div>
            <div style={{ fontSize: 13, color: '#059669', marginTop: 2, fontWeight: 600 }}>
              Primary instant route
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Direct settlement into registered account
            </div>
          </div>
        </div>
      </div>

      {/* Bank Change Request History Timeline */}
      {bankChangeRequests.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
            Bank Change Request History & Verification Status
          </h3>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Audit trail of banking details modifications. Unverified requests are never applied immediately to pending disbursements.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bankChangeRequests.map(req => (
              <div
                key={req.id}
                style={{
                  background: req.status === 'Pending Review' ? '#fffbeb' : '#f8fafc',
                  border: `1px solid ${req.status === 'Pending Review' ? '#fde68a' : '#e2e8f0'}`,
                  borderRadius: 12,
                  padding: '14px 18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{req.id}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Submitted {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                  <span style={{
                    background: req.status === 'Pending Review' ? '#fef3c7' : '#ecfdf5',
                    color: req.status === 'Pending Review' ? '#b45309' : '#047857',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {req.status === 'Pending Review' ? '⏳ Pending Penny-Drop Review' : '✓ Verified & Approved'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                  Requested: <strong>{req.newDetailsMasked?.bankName}</strong> ({req.newDetailsMasked?.accountNumber}) • IFSC: {req.newDetailsMasked?.ifscCode}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Feedback: {req.reviewFeedback}
                </div>
                {req.status === 'Pending Review' && (
                  <div style={{ fontSize: 11, color: '#b45309', marginTop: 6, fontWeight: 600 }}>
                    🛡️ Pending transfers will continue settling to your current verified account until compliance signs off.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Disputes Register */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
              Financial Disputes & Reconciliation Register
            </h3>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Dispute missing earnings, deductions, incentives, or settlement mismatches linked directly to booking source records
            </div>
          </div>

          <button
            onClick={() => setShowDisputeModal(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + File New Dispute
          </button>
        </div>

        {disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b', fontSize: 13 }}>
            No financial disputes on record. All earnings and deductions reconciled.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>DISPUTE ID</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>LINKED SOURCE REF</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>AMOUNT</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>AUDIT RESOLUTION NOTES</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: '#2563eb' }}>{d.id}</td>
                    <td style={{ padding: '10px 8px', textTransform: 'capitalize', color: '#334155' }}>
                      {d.category?.replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f172a' }}>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
                        {d.sourceRef}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 700, color: '#0f172a' }}>
                      ₹{d.disputedAmount}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        background: d.status === 'Resolved' ? '#ecfdf5' : '#fffbeb',
                        color: d.status === 'Resolved' ? '#047857' : '#b45309',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#64748b', fontSize: 12, maxWidth: 300 }}>
                      {d.resolutionNotes || 'Under investigation by Financial Audit Cell.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Statements Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
              Historical Payout Statements & UTR References
            </h3>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Weekly cycle statements showing gross revenue, platform take, adjustments, and recipient accounts
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATEMENT ID</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>PERIOD</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>ACTUAL RECIPIENT</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>GROSS</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>COMMISSION</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>NET SETTLED</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>BANK UTR</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {payoutStatements.map(stmt => (
                <tr key={stmt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#2563eb' }}>{stmt.id}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b' }}>{stmt.period}</td>
                  <td style={{ padding: '12px 10px', color: '#334155', fontSize: 12 }}>
                    <div>{stmt.actualRecipient}</div>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ Verified Platform Transfer</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#64748b' }}>₹{stmt.grossFare?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 10px', color: '#dc2626' }}>-₹{stmt.platformCommission?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                    ₹{stmt.netSettlementAmount?.toLocaleString('en-IN')}
                    {stmt.adjustments?.length > 0 && (
                      <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                        +{stmt.adjustments[0].description} (₹{stmt.adjustments[0].amount})
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 10px', color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>
                    {stmt.utr}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      background: stmt.status === 'Settled' ? '#ecfdf5' : '#fffbeb',
                      color: stmt.status === 'Settled' ? '#059669' : '#b45309',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700
                    }}>
                      {stmt.status === 'Settled' ? '✓ Settled' : '⏳ Ready for Release'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
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
            padding: 24,
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Withdraw Wallet Balance
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Available: <strong>₹{balance.toLocaleString('en-IN')}</strong> • Min ₹500 (Sandbox Demo)
            </p>

            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min={500}
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 16,
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Destination UPI ID / Bank VPA
                </label>
                <input
                  type="text"
                  value={withdrawUpi}
                  onChange={(e) => setWithdrawUpi(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    flex: 1.5,
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Change Request Modal */}
      {showBankChangeModal && (
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Request Bank Details Change
            </h3>
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12,
              color: '#92400e',
              marginBottom: 16,
              lineHeight: 1.4
            }}>
              ⚠️ <strong>Security & Compliance Notice:</strong> Unverified bank changes will NOT be applied immediately to pending disbursements. Scheduled weekly payouts will continue routing to your currently verified account until the Compliance Team completes penny-drop verification (24-48h).
            </div>

            {bankFormError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                {bankFormError}
              </div>
            )}

            <form onSubmit={handleBankChangeSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Account Holder Name (as on Bank Passbook)
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICICI Bank"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ICIC0000104"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    New Account Number
                  </label>
                  <input
                    type="password"
                    placeholder="Enter digits"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Confirm Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Re-enter digits"
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  UPI VPA Handle (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. name@okaxis"
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Reason for Account Change
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Opened new savings account with local branch"
                  value={bankForm.reason}
                  onChange={(e) => setBankForm({ ...bankForm, reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowBankChangeModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBankChange}
                  style={{ flex: 1.5, background: '#2563eb', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingBankChange ? 'Submitting...' : 'Submit Change Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Financial Dispute Modal */}
      {showDisputeModal && (
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
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              File Financial Dispute
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
              Disputes must link to a valid booking reference or transaction ID. Immutability rules prevent direct ledger modification.
            </p>

            <form onSubmit={handleDisputeSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Dispute Category
                </label>
                <select
                  value={disputeForm.category}
                  onChange={(e) => setDisputeForm({ ...disputeForm, category: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                >
                  <option value="missing_earnings">Missing Earnings from Booking</option>
                  <option value="incorrect_deduction">Incorrect Deduction / Unfair Penalty</option>
                  <option value="incorrect_incentive">Incorrect Incentive / Peak Bonus</option>
                  <option value="settlement_mismatch">Settlement Mismatch with Statement</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Source Type
                  </label>
                  <select
                    value={disputeForm.sourceType}
                    onChange={(e) => setDisputeForm({ ...disputeForm, sourceType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                  >
                    <option value="booking">Booking ID</option>
                    <option value="transaction">Transaction ID</option>
                    <option value="payout_batch">Payout Batch / Statement</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Source Reference Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UC-829410"
                    value={disputeForm.sourceRef}
                    onChange={(e) => setDisputeForm({ ...disputeForm, sourceRef: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Disputed Amount (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 250"
                  value={disputeForm.disputedAmount}
                  onChange={(e) => setDisputeForm({ ...disputeForm, disputedAmount: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Short Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Copper piping approved by customer but commission deducted"
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm({ ...disputeForm, reason: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Detailed Explanation & Evidence Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this deduction or missing credit occurred..."
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  style={{ flex: 1.5, background: '#dc2626', color: '#ffffff', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  {submittingDispute ? 'Submitting...' : 'File Audit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
