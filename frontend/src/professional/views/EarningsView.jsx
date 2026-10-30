import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Radio, CheckCircle2, ArrowRight } from 'lucide-react';
import { professionalClient } from '../professionalClient';

export function EarningsView({ onNavigate, showToast }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const mountedRef = useRef(true);

  const loadEarnings = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const data = await professionalClient.getEarnings();
      if (!mountedRef.current) return;
      if (data.success && data.earnings) {
        setEarnings(data.earnings);
        setLastSyncedAt(new Date());

        // Real-time synchronization of wallet balance with header and parent layout
        if (data.earnings.walletBalance != null) {
          try {
            window.dispatchEvent(new CustomEvent('uc:wallet-updated', {
              detail: { walletBalance: data.earnings.walletBalance }
            }));
            const stored = localStorage.getItem('uc_pro_user');
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.walletBalance = data.earnings.walletBalance;
              localStorage.setItem('uc_pro_user', JSON.stringify(parsed));
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      if (!isSilent) {
        console.warn('Earnings load error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    loadEarnings(false);
    return () => {
      mountedRef.current = false;
    };
  }, [loadEarnings]);

  // Real-time listener: BroadcastChannel for cross-tab & in-app action sync
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('uc_sync_channel');
      bc.onmessage = (msg) => {
        const type = msg?.data?.type;
        if (['STATUS_UPDATED', 'BOOKING_COMPLETED', 'EARNINGS_UPDATED', 'PAYOUT_REQUESTED'].includes(type)) {
          loadEarnings(true);
        }
      };
    } catch (e) {}
    return () => {
      if (bc) bc.close();
    };
  }, [loadEarnings]);

  // Real-time polling timer: Refresh every 4 seconds to reflect MongoDB Atlas completions immediately
  useEffect(() => {
    const timer = setInterval(() => {
      loadEarnings(true);
    }, 4000);
    return () => clearInterval(timer);
  }, [loadEarnings]);

  // Refresh upon browser window focus or visibility restore
  useEffect(() => {
    const handleFocus = () => loadEarnings(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadEarnings(true);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadEarnings]);

  if (loading && !earnings) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px auto', display: 'block', color: '#2563eb' }} />
        <div style={{ fontSize: 15, fontWeight: 600 }}>Loading comprehensive real-time earnings ledger...</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Connecting to MongoDB Atlas shared ledger</div>
      </div>
    );
  }

  const formatAmount = (rupees) => {
    return `₹${(rupees || 0).toLocaleString('en-IN')}`;
  };

  const stages = earnings?.financialStages || {
    earned: earnings?.thisMonth || 0,
    earnedPaisa: (earnings?.thisMonth || 0) * 100,
    earnedNet: earnings?.thisMonth || 0,
    pendingConfirmation: 0,
    pendingConfirmationPaisa: 0,
    availableForSettlement: earnings?.walletBalance != null ? earnings.walletBalance : 0,
    availableForSettlementPaisa: (earnings?.walletBalance != null ? earnings.walletBalance : 0) * 100,
    processing: 0,
    processingPaisa: 0,
    paid: 0,
    paidPaisa: 0,
    disputed: 0,
    disputedPaisa: 0
  };

  return (
    <div style={{ padding: '20px 24px', width: '100%', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Earnings Ledger & Financial Settlement
            </h1>
            {/* Live Real-Time Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              padding: '3px 9px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)'
              }} />
              <span>Real-Time MongoDB Atlas</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Shared backend accounting • 80% professional entitlement + 100% customer tips retained
            {lastSyncedAt && (
              <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 11.5 }}>
                • Synced {lastSyncedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => loadEarnings(false)}
            disabled={refreshing}
            title="Refresh database records"
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '9px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => onNavigate('/professional/payouts')}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span>🏦</span>
            Withdraw Balance →
          </button>
        </div>
      </div>

      {/* Completed != Disbursed Clarification Banner */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        padding: '14px 18px',
        borderRadius: 12,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 1.5,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <div style={{ fontSize: 20 }}>⚖️</div>
        <div>
          <strong>Financial Distinction Rule:</strong> Do not confuse a completed job with money already received in your bank account. Completed services represent earned technician entitlement. Amounts move into <em>Available for Settlement</em> after audit, then into <em>Processing</em>, and finally <em>Paid</em> once a banking UTR settlement batch is executed.
        </div>
      </div>

      {/* 6 Separate Financial Stages Grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Financial Stages Breakdown (Preserved Historical Records)
          </div>
          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
            ● Dynamic Live Calculation
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14
        }}>
          {/* 1. Earned (This Month) */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderTop: '4px solid #2563eb' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>1. EARNED (THIS MONTH)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {formatAmount(stages.earned, stages.earnedPaisa)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {stages.earnedNet != null && stages.earnedNet !== stages.earned 
                ? `Net: ${formatAmount(stages.earnedNet)} • Gross: ${formatAmount(stages.earned)}`
                : 'Gross completed jobs value'}
            </div>
          </div>

          {/* 2. Pending Confirmation */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderTop: '4px solid #d97706' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>2. PENDING AUDIT</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', marginTop: 4 }}>
              {formatAmount(stages.pendingConfirmation, stages.pendingConfirmationPaisa)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {stages.pendingConfirmation > 0 ? 'Awaiting completion / OTP sign-off' : 'Awaiting OTP / customer sign-off'}
            </div>
          </div>

          {/* 3. Available for Settlement */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderTop: '4px solid #059669' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>3. AVAILABLE SETTLEMENT</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {formatAmount(stages.availableForSettlement, stages.availableForSettlementPaisa)}
            </div>
            <div style={{ fontSize: 11, color: '#059669', marginTop: 4, fontWeight: 600 }}>Ready to withdraw</div>
          </div>

          {/* 4. Processing */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderTop: '4px solid #7c3aed' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>4. PROCESSING</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
              {formatAmount(stages.processing, stages.processingPaisa)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>In NEFT / IMPS batch queue</div>
          </div>

          {/* 5. Paid */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>5. PAID (LIFETIME)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
              {formatAmount(stages.paid, stages.paidPaisa)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
              {stages.paid > 0 ? 'Settled with verified UTRs' : 'No withdrawals settled yet'}
            </div>
          </div>

          {/* 6. Disputed */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '16px 18px', border: '1px solid #e2e8f0', borderTop: '4px solid #94a3b8' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>6. DISPUTED / ON HOLD</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#64748b', marginTop: 4 }}>
              {formatAmount(stages.disputed, stages.disputedPaisa)}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Quality dispute hold</div>
          </div>
        </div>
      </div>

      {/* Recipient Snapshot Box */}
      {earnings?.recipientSnapshot && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '18px 22px',
          border: '1px solid #e2e8f0',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              VERIFIED SETTLEMENT RECIPIENT SNAPSHOT
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {earnings.recipientSnapshot.bankName} • Account: {earnings.recipientSnapshot.accountNumberMasked}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              IFSC: <strong>{earnings.recipientSnapshot.ifscCode}</strong> • Account Holder: <strong>{earnings.recipientSnapshot.accountHolderName}</strong> • UPI: {earnings.recipientSnapshot.upiId}
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: 8 }}>
            ✓ Verified for Auto-Disbursement
          </span>
        </div>
      )}

      {/* Itemized Ledger Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Itemized Service Ledger (Full Audit Trail)
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing completed bookings with commission, tip pass-through & recipient snapshots
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>REF / DATE</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>SERVICE NAME</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>GROSS FARE</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>COMMISSION (20%)</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>PRO ENTITLEMENT</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>APPROVED TIPS</th>
                <th style={{ padding: '12px 10px', fontWeight: 700, color: '#059669' }}>NET EARNINGS</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>STAGE</th>
              </tr>
            </thead>
            <tbody>
              {(earnings?.itemizedLedger || []).length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8' }}>
                    No completed bookings in database yet. Completed dispatches will appear here in real time.
                  </td>
                </tr>
              ) : (
                (earnings?.itemizedLedger || []).map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontWeight: 700, color: '#2563eb' }}>{tx.bookingReference}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{tx.serviceDate}</div>
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{tx.service}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{tx.settlementEligibility}</div>
                    </td>
                    <td style={{ padding: '14px 10px', color: '#334155' }}>
                      {formatAmount(tx.grossFare, tx.grossFarePaisa)}
                    </td>
                    <td style={{ padding: '14px 10px', color: '#dc2626' }}>
                      - {formatAmount(tx.platformCommission, tx.platformCommissionPaisa)}
                    </td>
                    <td style={{ padding: '14px 10px', color: '#0f172a', fontWeight: 600 }}>
                      {formatAmount(tx.professionalEntitlement, tx.professionalEntitlementPaisa)}
                    </td>
                    <td style={{ padding: '14px 10px', color: '#059669' }}>
                      {tx.approvedTips > 0 ? `+ ${formatAmount(tx.approvedTips, tx.approvedTipsPaisa)}` : '—'}
                    </td>
                    <td style={{ padding: '14px 10px', fontWeight: 800, color: '#059669', fontSize: 14 }}>
                      {formatAmount(tx.netEarnings, tx.netEarningsPaisa)}
                    </td>
                    <td style={{ padding: '14px 10px' }}>
                      <span style={{
                        background: tx.settlementStatus === 'Paid' ? '#ecfdf5' : '#eff6ff',
                        color: tx.settlementStatus === 'Paid' ? '#059669' : '#2563eb',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {tx.settlementStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
