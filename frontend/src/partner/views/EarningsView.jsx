import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, PieChart, ShieldCheck, AlertCircle, 
  ArrowUpRight, Download, Calendar, CheckCircle2, ListFilter, FileText, Layers 
} from 'lucide-react';
import { partnerClient } from '../partnerClient';
import { usePlatformSettings } from '../../utils/usePlatformSettings';

export function EarningsView({ showToast }) {
  const { agencyTakeRate } = usePlatformSettings();
  const effectiveAgencyTake = agencyTakeRate ?? 14;
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'ledger'

  useEffect(() => {
    loadEarningsAndLedger();
  }, []);

  async function loadEarningsAndLedger() {
    setLoading(true);
    try {
      const [earnRes, ledgRes] = await Promise.all([
        partnerClient.getEarnings(),
        partnerClient.getEarningsLedger()
      ]);
      if (earnRes && earnRes.success) {
        setEarningsData(earnRes);
      }
      if (ledgRes && ledgRes.success) {
        setLedgerTransactions(ledgRes.ledger || []);
      }
    } catch (err) {
      showToast?.('Error loading earnings and ledger: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const summary = earningsData?.financialSummary || {
    totalGrossTurnover: 0,
    totalGrossTurnoverPaise: 0,
    totalPlatformCommission: 0,
    totalPlatformCommissionPaise: 0,
    commissionPercentage: `${effectiveAgencyTake}%`,
    totalNetAgencyPayouts: 0,
    totalNetAgencyPayoutsPaise: 0,
    pendingSettlement: 0,
    processingSettlement: 0,
    paidSettlement: 0,
    failedSettlement: 0,
    completedJobsCount: 0
  };

  const isModeB = earningsData?.settlementModel === 'direct_to_professional';
  const settlements = earningsData?.settlements || [];

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
            Business Earnings, Settlements & Revenue Ledger
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Consolidated gross customer bookings, taxes, discount sources, platform commission, and itemized ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: isModeB ? '#ecfdf5' : '#ede9fe',
            color: isModeB ? '#059669' : '#6d28d9',
            padding: '6px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700
          }}>
            {isModeB ? 'Mode B: 15% Business Override' : 'Mode A: Full Agency Entitlement (18% Commission)'}
          </div>
        </div>
      </div>

      {/* Mandatory Settlement Mode Banner & Anti-Double-Counting Notice */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${isModeB ? '#059669' : '#7c3aed'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14
      }}>
        <ShieldCheck size={24} color={isModeB ? '#059669' : '#7c3aed'} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>
          <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>
            Configured Settlement Mode: {earningsData?.configuredMode || (isModeB ? 'Mode B: Direct to Professionals' : 'Mode A: Platform to Business Partner')}
          </strong>
          {earningsData?.settlementDisclaimer || (isModeB
            ? 'Platform settles directly to individual professionals. The Business Partner receives only its configured 15% business override commission.'
            : 'Platform settles directly to Agency Corporate Current Account. Internal technician payroll and wages are administered independently by the agency.')}
          <div style={{ marginTop: 4, fontWeight: 600, color: '#0f172a' }}>
            Anti-Double-Counting Rule: Only the configured mode is enabled. No payable amount is counted twice between technician and partner ledgers.
          </div>
        </div>
      </div>

      {/* Sandbox Notice & Integer Minor Unit Callout */}
      <div style={{
        background: '#eff6ff',
        borderRadius: 10,
        padding: '12px 18px',
        border: '1px solid #bfdbfe',
        fontSize: 13,
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div>
          <strong>Sandbox Simulated Environment:</strong> RBI/NPCI NEFT/RTGS gateway simulated for partner verification.
          <em> "Earnings" represent contractual entitlement and do not equate to "money already transferred" until cleared in a Paid cycle.</em>
        </div>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#1d4ed8' }}>
          Minor Currency Unit: Paise (1 INR = 100 Paise)
        </span>
      </div>

      {/* Financial Metric Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16
      }}>
        {/* Gross Billing */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Gross Customer Bookings</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '6px 0 2px 0' }}>
            ₹{summary.totalGrossTurnover.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>
            {summary.totalGrossTurnoverPaise?.toLocaleString('en-IN') || 0} paise • {summary.completedJobsCount} jobs
          </span>
        </div>

        {/* Platform Fee */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Platform Commission ({effectiveAgencyTake}%)</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', margin: '6px 0 2px 0' }}>
            - ₹{summary.totalPlatformCommission.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11.5, color: '#dc2626' }}>
            {summary.totalPlatformCommissionPaise?.toLocaleString('en-IN') || 0} paise
          </span>
        </div>

        {/* Net Business Entitlement */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Net Business Entitlement</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a', margin: '6px 0 2px 0' }}>
            ₹{summary.totalNetAgencyPayouts.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11.5, color: '#16a34a' }}>
            {summary.totalNetAgencyPayoutsPaise?.toLocaleString('en-IN') || 0} paise
          </span>
        </div>

        {/* Processing Settlement */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Processing (Active Batch)</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706', margin: '6px 0 2px 0' }}>
            ₹{(summary.processingSettlement || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11.5, color: '#d97706' }}>Scheduled for batch clearing</span>
        </div>

        {/* Paid / Settled */}
        <div style={{ background: '#ffffff', borderRadius: 12, padding: '18px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Disbursed to Bank (Paid)</span>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#059669', margin: '6px 0 2px 0' }}>
            ₹{(summary.paidSettlement || 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11.5, color: '#059669' }}>Transferred with UTR reference</span>
        </div>
      </div>

      {/* Tabs Switcher: Revenue Cycles vs Itemized Ledger */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            fontSize: 13.5,
            fontWeight: 700,
            background: activeTab === 'summary' ? '#7c3aed' : 'transparent',
            color: activeTab === 'summary' ? '#ffffff' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Settlement Batches ({settlements.length})
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            fontSize: 13.5,
            fontWeight: 700,
            background: activeTab === 'ledger' ? '#7c3aed' : 'transparent',
            color: activeTab === 'ledger' ? '#ffffff' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Itemized Earnings Ledger ({ledgerTransactions.length})
        </button>
      </div>

      {/* View 1: Settlement Batches */}
      {activeTab === 'summary' && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
            Weekly Settlement Batches & Reconciliation
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Cycle Reference</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Gross Turnover</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Platform Fee</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>GST / Deductions</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Adjustments</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Net Disbursed</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {st.cycle}
                      <div style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 400 }}>
                        Ref: {st.settlementReference} • Mode: {st.settlementModel}
                      </div>
                    </td>
                    <td style={{ padding: '14px', color: '#0f172a', fontWeight: 600 }}>
                      ₹{st.grossTurnover.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px', color: '#dc2626' }}>
                      - ₹{st.platformFee.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px', color: '#dc2626' }}>
                      - ₹{(st.gstDeduction || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px', color: '#16a34a', fontWeight: 600 }}>
                      {st.adjustments > 0 ? `+ ₹${st.adjustments}` : '₹0'}
                    </td>
                    <td style={{ padding: '14px', color: '#16a34a', fontWeight: 700, fontSize: 14 }}>
                      ₹{st.netDisbursed.toLocaleString('en-IN')}
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
                        <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, maxWidth: 200 }}>
                          {st.failureReason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Itemized Earnings Ledger */}
      {activeTab === 'ledger' && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          padding: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
            Itemized Booking & Adjustment Ledger
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Txn ID / Ref</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Service Offering</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Booking Value</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Discount Source</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Taxes (18%)</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Commission</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Net Entitlement</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Settlement Batch</th>
                </tr>
              </thead>
              <tbody>
                {ledgerTransactions.map(tx => (
                  <tr key={tx.transactionId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {tx.transactionId}
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{tx.bookingId}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#334155' }}>
                      {tx.serviceName}
                      <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(tx.date).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      ₹{tx.bookingValue}
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{tx.bookingValuePaise} p</div>
                    </td>
                    <td style={{ padding: '12px', color: '#7c3aed', fontSize: 12 }}>
                      {tx.discounts?.length > 0 ? tx.discounts[0].fundingSource : 'Standard Booking'}
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      ₹{tx.taxes?.totalGst || 0}
                      <div style={{ fontSize: 10.5, color: '#94a3b8' }}>CGST: {tx.taxes?.cgst} | SGST: {tx.taxes?.sgst}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#dc2626' }}>
                      - ₹{tx.platformFee}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#16a34a' }}>
                      ₹{tx.netBusinessEntitlement}
                      <div style={{ fontSize: 11, color: '#16a34a' }}>{tx.netBusinessEntitlementPaise} p</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#475569'
                      }}>
                        {tx.settlementReference} ({tx.settlementStatus})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
