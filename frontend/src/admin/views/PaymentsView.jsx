import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Wallet,
  RotateCcw,
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Check,
  X,
  ExternalLink,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Eye,
  FlaskConical,
  Copy,
  Building2,
  HardHat,
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function PaymentsView({ defaultTab = 'transactions', onShowToast }) {
  // Navigation tabs: 'transactions' | 'payouts' | 'refunds' | 'reconciliation'
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Synchronize if prop changes (e.g. navigation from sidebar)
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // ==========================================
  // STATE: 1. TRANSACTIONS
  // ==========================================
  const [transactions, setTransactions] = useState([]);
  const [txnSearch, setTxnSearch] = useState('');
  const [txnEnvFilter, setTxnEnvFilter] = useState('ALL'); // ALL, 'Production Settled', 'Sandbox Simulation'
  const [txnMethodFilter, setTxnMethodFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loadingTxns, setLoadingTxns] = useState(false);

  // ==========================================
  // STATE: 2. PAYOUT STATEMENTS
  // ==========================================
  const [payouts, setPayouts] = useState([]);
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutTypeFilter, setPayoutTypeFilter] = useState('ALL');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('ALL');
  const [releasingId, setReleasingId] = useState(null);
  const [batchReleasing, setBatchReleasing] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  // ==========================================
  // STATE: 3. REFUNDS & DISPUTES
  // ==========================================
  const [refunds, setRefunds] = useState([]);
  const [refundSearch, setRefundSearch] = useState('');
  const [refundStatusFilter, setRefundStatusFilter] = useState('ALL');
  const [reviewModalRefund, setReviewModalRefund] = useState(null);
  const [approvedRefundAmount, setApprovedRefundAmount] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);

  // ==========================================
  // STATE: 4. RECONCILIATION EXCEPTIONS
  // ==========================================
  const [exceptions, setExceptions] = useState([]);
  const [loadingExceptions, setLoadingExceptions] = useState(false);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState(null);

  // Load initial data
  useEffect(() => {
    loadTransactions();
    loadPayouts();
    loadRefunds();
    loadExceptions();
  }, []);

  function loadTransactions() {
    setLoadingTxns(true);
    adminClient.getTransactions()
      .then(res => {
        setTransactions(res.transactions || []);
        setLoadingTxns(false);
      })
      .catch(() => setLoadingTxns(false));
  }

  function loadPayouts() {
    adminClient.getPayouts()
      .then(res => setPayouts(res.payouts || []))
      .catch(() => {});
  }

  function loadRefunds() {
    adminClient.getRefunds()
      .then(res => setRefunds(res.refunds || []))
      .catch(() => {});
  }

  function loadExceptions() {
    setLoadingExceptions(true);
    adminClient.getReconciliationExceptions()
      .then(res => {
        setExceptions(res.exceptions || []);
        setLoadingExceptions(false);
      })
      .catch(() => setLoadingExceptions(false));
  }

  function copyToClipboard(text, keyId) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
      if (onShowToast) onShowToast(`Copied ${keyId} to clipboard`);
    }
  }

  // ==========================================
  // HANDLERS: PAYOUT RELEASE
  // ==========================================
  async function handleReleasePayout(payout) {
    if (payout.status === 'Processed') {
      if (onShowToast) onShowToast(`⚠️ Payout #${payout.id} was already disbursed.`);
      return;
    }

    setReleasingId(payout.id);
    const idemKey = `idem_payout_${payout.id}_${Date.now()}`;

    try {
      const res = await adminClient.releasePayout(payout.id, idemKey);
      if (res.success) {
        setPayouts(prev => prev.map(p => p.id === payout.id ? { ...p, status: 'Processed', releasedAt: new Date(), releasedBy: 'Finance Manager' } : p));
        if (onShowToast) onShowToast(`✓ Payout #${payout.id} (₹${payout.netPayoutRupees?.toLocaleString('en-IN')}) successfully disbursed via bank gateway!`);
      } else {
        if (onShowToast) onShowToast(`Error: ${res.error || 'Failed to release payout'}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setReleasingId(null);
    }
  }

  async function handleReleaseBatchW42() {
    const readyList = payouts.filter(p => p.status === 'Ready for Release');
    if (readyList.length === 0) {
      if (onShowToast) onShowToast('No pending payouts in this batch');
      return;
    }

    setBatchReleasing(true);
    let successCount = 0;

    for (const po of readyList) {
      const idemKey = `idem_batch_w42_${po.id}_${Date.now()}`;
      try {
        const res = await adminClient.releasePayout(po.id, idemKey);
        if (res.success) successCount++;
      } catch {}
    }

    setPayouts(prev => prev.map(p => p.status === 'Ready for Release' ? { ...p, status: 'Processed', releasedAt: new Date(), releasedBy: 'Finance Manager' } : p));
    setBatchReleasing(false);
    if (onShowToast) onShowToast(`🎉 Successfully disbursed ${successCount} payout statements in Batch W42!`);
  }

  // ==========================================
  // HANDLERS: REFUND APPROVAL / REJECTION
  // ==========================================
  function openRefundReviewModal(ref) {
    setReviewModalRefund(ref);
    setApprovedRefundAmount(ref.requestedAmount.toString());
    setRejectionReasonInput('');
  }

  async function handleProcessRefund(action) {
    if (!reviewModalRefund) return;
    setProcessingRefund(true);

    const amountNum = parseFloat(approvedRefundAmount);

    if (action === 'approve') {
      if (isNaN(amountNum) || amountNum <= 0) {
        if (onShowToast) onShowToast('Please specify a valid positive refund amount');
        setProcessingRefund(false);
        return;
      }
      if (amountNum > reviewModalRefund.maxRefundableBalance) {
        if (onShowToast) onShowToast(`Refund cannot exceed maximum refundable balance of ₹${reviewModalRefund.maxRefundableBalance}`);
        setProcessingRefund(false);
        return;
      }
    } else if (action === 'reject') {
      if (!rejectionReasonInput.trim()) {
        if (onShowToast) onShowToast('Please provide an operational rejection reason');
        setProcessingRefund(false);
        return;
      }
    }

    try {
      const res = await adminClient.processRefund(
        reviewModalRefund.id,
        action,
        action === 'approve' ? amountNum : undefined,
        action === 'reject' ? rejectionReasonInput : undefined
      );

      if (res.success) {
        setRefunds(prev => prev.map(r => r.id === reviewModalRefund.id ? res.refund : r));
        if (onShowToast) onShowToast(res.message);
        setReviewModalRefund(null);
      } else {
        if (onShowToast) onShowToast(`Error: ${res.error || 'Failed to process refund'}`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setProcessingRefund(false);
    }
  }

  // ==========================================
  // CSV EXPORT GENERATOR
  // ==========================================
  function exportCSV(type) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = 'finance_statement.csv';

    if (type === 'transactions') {
      filename = `customer_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent += 'Transaction ID,Booking ID,Customer,Amount (Rupees),Amount (Paise),Currency,Payment Method,Gateway Ref,Status,Environment,Commission (Paise),Pro Share (Paise),Tax (Paise),Idempotency Key,Date\n';
      filteredTxns.forEach(t => {
        csvContent += `"${t.id}","${t.bookingId}","${t.customerName}",${t.amountRupees},${t.amountPaise},"${t.currency}","${t.paymentMethod}","${t.gatewayRef}","${t.status}","${t.environment}",${t.commissionPaise},${t.proSharePaise},${t.taxPaise},"${t.idempotencyKey}","${new Date(t.paidAt || Date.now()).toISOString()}"\n`;
      });
    } else if (type === 'payouts') {
      filename = `payout_statements_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent += 'Payout ID,Beneficiary Name,Beneficiary Type,Settlement Mode,Account Details,Billing Period,Gross Work (INR),Platform Take (INR),TDS 1% (INR),Net Payout (INR),Currency,Status,Payout Method,Idempotency Key\n';
      filteredPayouts.forEach(p => {
        csvContent += `"${p.id}","${p.beneficiaryName}","${p.beneficiaryType}","${p.settlementMode}","${p.accountInfo}","${p.period}",${p.grossEarningsRupees},${p.platformTakeRupees},${p.tdsDeductionRupees},${p.netPayoutRupees},"${p.currency}","${p.status}","${p.payoutMethod}","${p.idempotencyKey}"\n`;
      });
    } else if (type === 'refunds') {
      filename = `refund_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent += 'Refund ID,Booking ID,Customer,Total Order (INR),Already Refunded (INR),Max Refundable (INR),Requested Amount (INR),Category,Status,Gateway Ref,Requested At,Reviewed By,Rejection Reason\n';
      filteredRefunds.forEach(r => {
        csvContent += `"${r.id}","${r.bookingId}","${r.customerName}",${r.totalOrderAmount},${r.alreadyRefunded},${r.maxRefundableBalance},${r.requestedAmount},"${r.reasonCategory}","${r.status}","${r.gatewayRef}","${new Date(r.requestedAt).toISOString()}","${r.reviewedBy || 'N/A'}","${r.rejectionReason || 'None'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast(`📥 Downloaded ${filename}`);
  }

  // ==========================================
  // FILTERS
  // ==========================================
  const filteredTxns = transactions.filter(t => {
    if (txnEnvFilter !== 'ALL' && t.environment !== txnEnvFilter) return false;
    if (txnMethodFilter !== 'ALL' && !t.paymentMethod.toLowerCase().includes(txnMethodFilter.toLowerCase())) return false;
    if (txnSearch.trim()) {
      const q = txnSearch.toLowerCase();
      const match = (t.id || '').toLowerCase().includes(q) ||
        (t.bookingId || '').toLowerCase().includes(q) ||
        (t.customerName || '').toLowerCase().includes(q) ||
        (t.gatewayRef || '').toLowerCase().includes(q) ||
        (t.invoiceNumber || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const filteredPayouts = payouts.filter(p => {
    if (payoutTypeFilter !== 'ALL' && p.beneficiaryType !== payoutTypeFilter) return false;
    if (payoutStatusFilter !== 'ALL' && p.status !== payoutStatusFilter) return false;
    if (payoutSearch.trim()) {
      const q = payoutSearch.toLowerCase();
      const match = (p.id || '').toLowerCase().includes(q) ||
        (p.beneficiaryName || '').toLowerCase().includes(q) ||
        (p.accountInfo || '').toLowerCase().includes(q) ||
        (p.batchId || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const filteredRefunds = refunds.filter(r => {
    if (refundStatusFilter !== 'ALL' && r.status !== refundStatusFilter) return false;
    if (refundSearch.trim()) {
      const q = refundSearch.toLowerCase();
      const match = (r.id || '').toLowerCase().includes(q) ||
        (r.bookingId || '').toLowerCase().includes(q) ||
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.reasonCategory || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate Metrics
  const prodTxns = transactions.filter(t => t.environment === 'Production Settled');
  const simTxns = transactions.filter(t => t.environment === 'Sandbox Simulation');
  const totalSettledINR = prodTxns.reduce((sum, t) => sum + (t.amountRupees || 0), 0);
  const totalCommissionPaise = prodTxns.reduce((sum, t) => sum + (t.commissionPaise || 0), 0);
  const totalProSharePaise = prodTxns.reduce((sum, t) => sum + (t.proSharePaise || 0), 0);

  const pendingBatchPayout = payouts
    .filter(p => p.status === 'Ready for Release')
    .reduce((sum, p) => sum + (p.netPayoutRupees || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* HEADER & TABS NAVIGATION */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        border: 'none',
        borderBottom: '1px solid #E2E8F0',
        padding: '20px 24px 0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Payments, Commissions & Settlements
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
                Minor Units (Paise) Compliant
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
              Manage customer checkout transactions, franchise & technician payouts, dispute refunds, and gateway reconciliation.
            </p>
          </div>

          {/* Environmental Sandbox Separation Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 14px',
            backgroundColor: '#F8FAFC',
            borderRadius: 8,
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>Gateway Prod Verified</span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: '#CBD5E1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FlaskConical size={14} color="#7C3AED" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>Sandbox Isolated ({simTxns.length} sim test)</span>
            </div>
          </div>
        </div>

        {/* SUB-SCREEN NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: 2,
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'transactions' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'transactions' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CreditCard size={16} />
            <span>Customer Transactions</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: activeTab === 'transactions' ? '#F3E8FF' : '#F1F5F9',
              color: activeTab === 'transactions' ? '#6E42E5' : '#64748B'
            }}>
              {transactions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'payouts' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'payouts' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Wallet size={16} />
            <span>Payout Statements</span>
            {pendingBatchPayout > 0 && (
              <span style={{
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 10,
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                fontWeight: 700
              }}>
                Due
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refunds')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'refunds' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'refunds' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <RotateCcw size={16} />
            <span>Refund Requests</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              fontWeight: 700
            }}>
              {refunds.filter(r => r.status === 'Pending Review').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reconciliation')}
            style={{
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'reconciliation' ? '#6E42E5' : '#64748B',
              borderBottom: activeTab === 'reconciliation' ? '2.5px solid #6E42E5' : '2.5px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ShieldCheck size={16} />
            <span>Reconciliation Exceptions</span>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              backgroundColor: '#EFF6FF',
              color: '#1E40AF'
            }}>
              {exceptions.length}
            </span>
          </button>
        </div>
      </div>

      <div className="admin-page-body">

      {/* ========================================================================= */}
      {/* SCREEN 1: CUSTOMER TRANSACTIONS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gross Captured Volume</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                ₹{totalSettledINR.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11.5, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
                {(totalSettledINR * 100).toLocaleString('en-IN')} minor units (paise)
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Platform Commission Take</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#6E42E5', marginTop: 4 }}>
                ₹{(totalCommissionPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                Preserved historical take rate snapshot (avg 20%)
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pro & Partner Net Share</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 4 }}>
                ₹{(totalProSharePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
                Allocated to freelance pros & partner agencies
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Sandbox / Test Volume</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#7C3AED', marginTop: 4 }}>
                ₹{(simTxns.reduce((s, t) => s + t.amountRupees, 0)).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11.5, color: '#7C3AED', marginTop: 4, fontWeight: 600 }}>
                Strictly non-real, segregated ledger
              </div>
            </div>
          </div>

          {/* Controls: Search, Filters & Export */}
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
              {/* Search */}
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
                  placeholder="Search Txn ID, Order, Gateway Ref..."
                  value={txnSearch}
                  onChange={e => setTxnSearch(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
                />
              </div>

              {/* Environment Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Environment:</span>
                <select
                  value={txnEnvFilter}
                  onChange={e => setTxnEnvFilter(e.target.value)}
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
                  <option value="ALL">All Environments ({transactions.length})</option>
                  <option value="Production Settled">Production Settled ({prodTxns.length})</option>
                  <option value="Sandbox Simulation">Sandbox Simulation ({simTxns.length})</option>
                </select>
              </div>

              {/* Payment Method Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Method:</span>
                <select
                  value={txnMethodFilter}
                  onChange={e => setTxnMethodFilter(e.target.value)}
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
                  <option value="ALL">All Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Cards</option>
                  <option value="NetBanking">NetBanking</option>
                  <option value="COD">Cash After Service</option>
                </select>
              </div>
            </div>

            {/* Export CSV Statement */}
            <button
              type="button"
              onClick={() => exportCSV('transactions')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>Export CSV Statement</span>
            </button>
          </div>

          {/* Transactions Table */}
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
                  <th style={{ padding: '12px 18px' }}>Transaction & Order</th>
                  <th style={{ padding: '12px 18px' }}>Customer</th>
                  <th style={{ padding: '12px 18px' }}>Gross Amount</th>
                  <th style={{ padding: '12px 18px' }}>Minor Units (Paise)</th>
                  <th style={{ padding: '12px 18px' }}>Commission & Pro Share</th>
                  <th style={{ padding: '12px 18px' }}>Method & Provider Ref</th>
                  <th style={{ padding: '12px 18px' }}>Environment & Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Audit</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      No transactions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#6E42E5', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{t.id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(t.id, t.id)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                            title="Copy Transaction ID"
                          >
                            <Copy size={12} color={copiedKey === t.id ? '#10B981' : '#94A3B8'} />
                          </button>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                          Order: <strong style={{ color: '#0F172A' }}>{t.bookingId}</strong>
                        </div>
                        {t.invoiceNumber && (
                          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{t.invoiceNumber}</div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{t.customerName}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.currency} Direct Checkout</div>
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A', fontSize: 14 }}>
                        ₹{t.amountRupees?.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          backgroundColor: '#F1F5F9',
                          padding: '3px 6px',
                          borderRadius: 4,
                          color: '#334155'
                        }}>
                          {t.amountPaise?.toLocaleString('en-IN')}p
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: 12, color: '#6E42E5', fontWeight: 700 }}>
                          UC Take: ₹{(t.commissionPaise / 100).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>
                          Pro Net: ₹{(t.proSharePaise / 100).toFixed(2)}
                        </div>
                        {t.taxPaise > 0 && (
                          <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            GST: ₹{(t.taxPaise / 100).toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{t.paymentMethod}</div>
                        <div style={{
                          fontSize: 11,
                          color: '#64748B',
                          fontFamily: 'monospace',
                          marginTop: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <span>{t.gatewayRef}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(t.gatewayRef, t.gatewayRef)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                            title="Copy Gateway Reference"
                          >
                            <Copy size={11} color={copiedKey === t.gatewayRef ? '#10B981' : '#94A3B8'} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            width: 'fit-content',
                            backgroundColor: t.status === 'Settled' ? '#ECFDF5' : '#FFFBEB',
                            color: t.status === 'Settled' ? '#059669' : '#D97706'
                          }}>
                            {t.status}
                          </span>

                          {t.environment === 'Sandbox Simulation' ? (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: '#F3E8FF',
                              color: '#7C3AED',
                              border: '1px solid #DDD6FE',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              width: 'fit-content'
                            }}>
                              <FlaskConical size={10} />
                              Sandbox Simulation
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#64748B',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3
                            }}>
                              <CheckCircle2 size={10} color="#10B981" />
                              Production Real
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTxn(t)}
                          style={{
                            padding: '6px 10px',
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
                          <Eye size={13} />
                          <span>Ledger</span>
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
      {/* SCREEN 2: PROFESSIONAL & PARTNER PAYOUT STATEMENTS                         */}
      {/* ========================================================================= */}
      {activeTab === 'payouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Release Batch Action Banner */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '20px 24px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#6E42E5', textTransform: 'uppercase' }}>
                  Weekly Partner & Fleet Settlement (Batch W42)
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  backgroundColor: pendingBatchPayout > 0 ? '#FEF3C7' : '#ECFDF5',
                  color: pendingBatchPayout > 0 ? '#92400E' : '#059669'
                }}>
                  {pendingBatchPayout > 0 ? 'Release Pending' : 'All Settled'}
                </span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                ₹{pendingBatchPayout.toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>
                  across {payouts.filter(p => p.status === 'Ready for Release').length} beneficiary statements
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
                🛡️ Prevents double counting: Partner agency statements settle technicians through corporate payroll. Independent pros receive direct freelance settlements.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => exportCSV('payouts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Download size={15} />
                <span>Download Ledger (CSV)</span>
              </button>

              {pendingBatchPayout > 0 && (
                <button
                  type="button"
                  disabled={batchReleasing}
                  onClick={handleReleaseBatchW42}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: batchReleasing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{batchReleasing ? 'Disbursing NEFT / IMPS...' : 'Release Batch Payouts Now'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
                  placeholder="Search beneficiary, account, batch..."
                  value={payoutSearch}
                  onChange={e => setPayoutSearch(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Beneficiary Type:</span>
                <select
                  value={payoutTypeFilter}
                  onChange={e => setPayoutTypeFilter(e.target.value)}
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
                  <option value="ALL">All Beneficiaries ({payouts.length})</option>
                  <option value="Professional">Freelance Professionals</option>
                  <option value="Business Partner Agency">Business Partner Agencies</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Status:</span>
                <select
                  value={payoutStatusFilter}
                  onChange={e => setPayoutStatusFilter(e.target.value)}
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
                  <option value="Ready for Release">Ready for Release</option>
                  <option value="Processed">Processed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payouts Table */}
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
                  <th style={{ padding: '12px 18px' }}>Payout ID</th>
                  <th style={{ padding: '12px 18px' }}>Beneficiary & Settlement Guard</th>
                  <th style={{ padding: '12px 18px' }}>Account & Method</th>
                  <th style={{ padding: '12px 18px' }}>Gross Work</th>
                  <th style={{ padding: '12px 18px' }}>Platform Take</th>
                  <th style={{ padding: '12px 18px' }}>TDS (1%)</th>
                  <th style={{ padding: '12px 18px' }}>Net Disbursement</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      No payout statements match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#6E42E5' }}>{p.id}</div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{p.batchId}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.period}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {p.beneficiaryType === 'Business Partner Agency' ? (
                            <Building2 size={14} color="#6E42E5" />
                          ) : (
                            <HardHat size={14} color="#059669" />
                          )}
                          <span>{p.beneficiaryName}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {p.settlementMode === 'ThroughBusiness' ? (
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: '#EEF2FF',
                              color: '#4F46E5',
                              border: '1px solid #C7D2FE'
                            }}>
                              Through Agency Payroll (Double-Count Guard)
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0'
                            }}>
                              Direct Freelance Professional
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: '#0F172A', fontWeight: 600 }}>{p.payoutMethod}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace' }}>{p.accountInfo}</div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        ₹{p.grossEarningsRupees?.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', color: '#DC2626' }}>
                        -₹{p.platformTakeRupees?.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', color: '#94A3B8' }}>
                        -₹{p.tdsDeductionRupees?.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#059669', fontSize: 14 }}>
                        ₹{p.netPayoutRupees?.toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {p.status === 'Ready for Release' ? (
                          <button
                            type="button"
                            disabled={releasingId === p.id}
                            onClick={() => handleReleasePayout(p)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: 'none',
                              backgroundColor: '#059669',
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: releasingId === p.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {releasingId === p.id ? 'Transferring...' : 'Release Payout'}
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              backgroundColor: '#ECFDF5',
                              color: '#059669'
                            }}>
                              ✓ Disbursed
                            </span>
                            <span style={{ fontSize: 10, color: '#94A3B8' }}>
                              By {p.releasedBy || 'Finance Lead'}
                            </span>
                          </div>
                        )}
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
      {/* SCREEN 3: REFUND REQUESTS & DISPUTES                                       */}
      {/* ========================================================================= */}
      {activeTab === 'refunds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '20px 24px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Disputed Charges & Customer Cancellation Refunds
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B', margin: '4px 0 0 0' }}>
                Automated guard validates maximum refundable balance to strictly prevent over-refunding captured orders.
              </p>
            </div>

            <button
              type="button"
              onClick={() => exportCSV('refunds')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>Export Refund Audit Log</span>
            </button>
          </div>

          {/* Filters */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '14px 20px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}>
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
                placeholder="Search refund ID, booking, customer..."
                value={refundSearch}
                onChange={e => setRefundSearch(e.target.value)}
                style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Status:</span>
              <select
                value={refundStatusFilter}
                onChange={e => setRefundStatusFilter(e.target.value)}
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
                <option value="ALL">All Statuses ({refunds.length})</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Approved & Processed">Approved & Processed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Refunds Table */}
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
                  <th style={{ padding: '12px 18px' }}>Refund & Booking</th>
                  <th style={{ padding: '12px 18px' }}>Customer</th>
                  <th style={{ padding: '12px 18px' }}>Captured vs Max Refundable</th>
                  <th style={{ padding: '12px 18px' }}>Claimed Amount</th>
                  <th style={{ padding: '12px 18px' }}>Dispute Category & Notes</th>
                  <th style={{ padding: '12px 18px' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                      No refund requests match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRefunds.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#6E42E5' }}>{r.id}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                          Order: <strong style={{ color: '#0F172A' }}>{r.bookingId}</strong>
                        </div>
                        <div style={{ fontSize: 10.5, color: '#94A3B8' }}>{r.gatewayRef}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.customerName}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          {new Date(r.requestedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: 12.5, color: '#334155' }}>
                          Captured: <strong>₹{r.totalOrderAmount}</strong>
                        </div>
                        <div style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: r.maxRefundableBalance > 0 ? '#059669' : '#DC2626'
                        }}>
                          Max Refundable: ₹{r.maxRefundableBalance}
                        </div>
                        {r.alreadyRefunded > 0 && (
                          <div style={{ fontSize: 10.5, color: '#94A3B8' }}>
                            Prior refunds: ₹{r.alreadyRefunded}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#DC2626', fontSize: 14 }}>
                        ₹{r.requestedAmount}
                      </td>

                      <td style={{ padding: '14px 18px', maxWidth: 260 }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 12 }}>{r.reasonCategory}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>
                          {r.reasonNotes}
                        </div>
                        {r.rejectionReason && (
                          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4, fontWeight: 600 }}>
                            Rejection Note: {r.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          backgroundColor: r.status === 'Approved & Processed' ? '#ECFDF5' : r.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                          color: r.status === 'Approved & Processed' ? '#059669' : r.status === 'Rejected' ? '#DC2626' : '#D97706'
                        }}>
                          {r.status}
                        </span>
                        {r.reviewedBy && (
                          <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>
                            By {r.reviewedBy}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {r.status === 'Pending Review' ? (
                          <button
                            type="button"
                            onClick={() => openRefundReviewModal(r)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: 'none',
                              backgroundColor: '#6E42E5',
                              color: '#FFFFFF',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Review & Process
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Archived</span>
                        )}
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
      {/* SCREEN 4: RECONCILIATION EXCEPTIONS & GATEWAY AUDIT                        */}
      {/* ========================================================================= */}
      {activeTab === 'reconciliation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: '20px 24px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color="#6E42E5" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Automated Gateway Webhook Reconciliation & Safety Guards
              </h3>
            </div>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              Continuous background daemon monitors payment gateway webhooks, signature integrity (HMAC SHA-256), idempotency token collisions, and enforces sandbox isolation. Never marks orders successful solely based on browser return callbacks.
            </p>
          </div>

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
                  <th style={{ padding: '12px 18px' }}>Exception ID</th>
                  <th style={{ padding: '12px 18px' }}>Anomaly Type</th>
                  <th style={{ padding: '12px 18px' }}>Severity</th>
                  <th style={{ padding: '12px 18px' }}>Gateway & Txn Ref</th>
                  <th style={{ padding: '12px 18px' }}>Order / Payout Ref</th>
                  <th style={{ padding: '12px 18px' }}>Anomaly Description</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Resolution Status</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map(ex => (
                  <tr key={ex.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#6E42E5' }}>{ex.id}</td>

                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{ex.type}</td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 9999,
                        backgroundColor: ex.severity === 'High' ? '#FEE2E2' : ex.severity === 'Medium' ? '#FEF3C7' : '#EFF6FF',
                        color: ex.severity === 'High' ? '#DC2626' : ex.severity === 'Medium' ? '#B45309' : '#1D4ED8'
                      }}>
                        {ex.severity}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#334155', fontWeight: 600 }}>{ex.gateway}</div>
                      <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>{ex.transactionRef}</div>
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>
                      {ex.bookingRef}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: 12.5, maxWidth: 300 }}>
                      {ex.issueDescription}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0'
                      }}>
                        {ex.reconciliationStatus}
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
      {/* MODAL: TRANSACTION DETAIL / LEDGER VIEW                                   */}
      {/* ========================================================================= */}
      {selectedTxn && (
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
            maxWidth: 580,
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
                <CreditCard size={20} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Transaction Accounting Ledger #{selectedTxn.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Order & Customer Summary */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                fontSize: 13
              }}>
                <div>
                  <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700 }}>ORDER REFERENCE</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{selectedTxn.bookingId}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700 }}>CUSTOMER</div>
                  <div style={{ fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{selectedTxn.customerName}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700 }}>GATEWAY TRANSACTION REF</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#334155', marginTop: 2 }}>{selectedTxn.gatewayRef}</div>
                </div>
                <div>
                  <div style={{ color: '#64748B', fontSize: 11, fontWeight: 700 }}>IDEMPOTENCY KEY</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#334155', marginTop: 2 }}>{selectedTxn.idempotencyKey}</div>
                </div>
              </div>

              {/* Financial Snapshot Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 16px', color: '#64748B' }}>Gross Order Value</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                        ₹{selectedTxn.amountRupees} ({selectedTxn.amountPaise} paise)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 16px', color: '#64748B' }}>Platform Commission Snapshot (Locked at booking)</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#6E42E5' }}>
                        ₹{(selectedTxn.commissionPaise / 100).toFixed(2)} ({selectedTxn.commissionPaise} paise)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 16px', color: '#64748B' }}>Professional / Partner Share</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        ₹{(selectedTxn.proSharePaise / 100).toFixed(2)} ({selectedTxn.proSharePaise} paise)
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 16px', color: '#64748B' }}>18% GST Allocation (CGST 9% + SGST 9%)</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#475569' }}>
                        ₹{(selectedTxn.taxPaise / 100).toFixed(2)} ({selectedTxn.taxPaise} paise)
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>Net Settlement Disbursable</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: 15 }}>
                        ₹{(selectedTxn.netSettlementPaise / 100).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status Note */}
              <div style={{
                backgroundColor: selectedTxn.environment === 'Sandbox Simulation' ? '#FAF5FF' : '#F0FDF4',
                padding: '12px 16px',
                borderRadius: 8,
                border: selectedTxn.environment === 'Sandbox Simulation' ? '1px solid #E9D5FF' : '1px solid #BBF7D0',
                fontSize: 12.5,
                color: selectedTxn.environment === 'Sandbox Simulation' ? '#6B21A8' : '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <ShieldCheck size={16} />
                <span>
                  {selectedTxn.environment === 'Sandbox Simulation'
                    ? 'Isolated test simulation. Excluded from real banking and statutory tax filings.'
                    : 'Authenticated & captured via verified webhook callback signature. Bank ledger reconciled.'}
                </span>
              </div>
            </div>

            <div style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REFUND APPROVAL / REJECTION WITH BALANCE VALIDATION                 */}
      {/* ========================================================================= */}
      {reviewModalRefund && (
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
                  Review Refund Claim #{reviewModalRefund.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalRefund(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Order Info */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: '12px 16px',
                border: '1px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                fontSize: 12.5
              }}>
                <div>
                  <span style={{ color: '#64748B' }}>Booking ID:</span>{' '}
                  <strong style={{ color: '#0F172A' }}>{reviewModalRefund.bookingId}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Customer:</span>{' '}
                  <strong style={{ color: '#0F172A' }}>{reviewModalRefund.customerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Captured Order Total:</span>{' '}
                  <strong style={{ color: '#0F172A' }}>₹{reviewModalRefund.totalOrderAmount}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Max Refundable:</span>{' '}
                  <strong style={{ color: '#059669' }}>₹{reviewModalRefund.maxRefundableBalance}</strong>
                </div>
              </div>

              {/* Dispute Reason */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Customer Dispute Category
                </label>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                  {reviewModalRefund.reasonCategory}
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: '#475569',
                  marginTop: 4,
                  padding: '8px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0'
                }}>
                  {reviewModalRefund.reasonNotes}
                </div>
              </div>

              {/* Approval Amount Input with Max Cap Validation */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Refund Approval Amount (₹ INR)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <input
                    type="number"
                    max={reviewModalRefund.maxRefundableBalance}
                    min="1"
                    value={approvedRefundAmount}
                    onChange={e => setApprovedRefundAmount(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #D1D5DB',
                      fontSize: 14,
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setApprovedRefundAmount(reviewModalRefund.maxRefundableBalance.toString())}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#F8FAFC',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Set Max (₹{reviewModalRefund.maxRefundableBalance})
                  </button>
                </div>
                {parseFloat(approvedRefundAmount) > reviewModalRefund.maxRefundableBalance && (
                  <div style={{ color: '#DC2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                    ⚠️ Exceeds maximum refundable balance of ₹{reviewModalRefund.maxRefundableBalance}
                  </div>
                )}
              </div>

              {/* Rejection Reason Input (Optional for Approve, Mandatory for Reject) */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Operational Notes / Rejection Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain resolution basis or rejection grounds..."
                  value={rejectionReasonInput}
                  onChange={e => setRejectionReasonInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    marginTop: 6,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '14px 24px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => setReviewModalRefund(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  disabled={processingRefund}
                  onClick={() => handleProcessRefund('reject')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: processingRefund ? 'not-allowed' : 'pointer'
                  }}
                >
                  Reject Claim
                </button>

                <button
                  type="button"
                  disabled={processingRefund || parseFloat(approvedRefundAmount) > reviewModalRefund.maxRefundableBalance}
                  onClick={() => handleProcessRefund('approve')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: processingRefund ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                  }}
                >
                  {processingRefund ? 'Approving...' : `Approve Refund ₹${approvedRefundAmount || 0}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
