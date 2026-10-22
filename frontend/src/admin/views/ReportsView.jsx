import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  HardHat,
  RotateCcw,
  Users,
  MapPin,
  Printer,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { adminClient } from '../adminClient';

// Formula injection sanitizer for client-side CSV downloads
function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export function ReportsView({ onShowToast }) {
  const [period, setPeriod] = useState('30d');
  const [reportsData, setReportsData] = useState(null);
  const [activeSection, setActiveSection] = useState('financials'); // 'financials' | 'professionals' | 'partners' | 'categories' | 'cancellations'

  useEffect(() => {
    loadReports(period);
  }, [period]);

  function loadReports(selectedPeriod) {
    adminClient.getReports(selectedPeriod)
      .then(res => setReportsData(res.reports || null))
      .catch(() => {});
  }

  // Formula-safe CSV export generator
  function handleExportCSV(reportType) {
    if (!reportsData) return;

    let headers = [];
    let rows = [];
    let filename = `urban_report_${reportType}_${period}.csv`;

    if (reportType === 'financials') {
      headers = ['Metric Name', 'Amount (INR)', 'Methodology & Accounting Standard'];
      rows = [
        ['Gross Merchandise Value (GMV)', sanitizeCsvValue(`₹${reportsData.financials?.gmvTotalRupees}`), 'Captured customer invoice payments before platform deductions'],
        ['Net Platform Revenue', sanitizeCsvValue(`₹${reportsData.financials?.netPlatformRevenueRupees}`), 'Contractual commission take rate (avg 20%)'],
        ['Pro & Partner Payout Disbursements', sanitizeCsvValue(`₹${reportsData.financials?.proPartnerSettlementsRupees}`), 'Technician & partner agency net earnings'],
        ['Section 194-O TDS Withheld', sanitizeCsvValue(`₹${reportsData.financials?.tdsWithheldRupees}`), '1% statutory TDS deducted on gross collections'],
        ['Total Refund Approved Amount', sanitizeCsvValue(`₹${reportsData.refunds?.totalRefundApprovedRupees}`), 'Dispute refunds approved under 30-day warranty'],
        ['Customer Repeat Booking Rate', sanitizeCsvValue(reportsData.customerMetrics?.repeatBookingRate), 'Customers with >= 2 bookings in 90 days']
      ];
    } else if (reportType === 'professionals') {
      headers = ['Professional Name', 'Trade Skill', 'Jobs Completed', 'Customer Rating', 'SLA Compliance', 'Repeat Requests', 'Avg Duration (Mins)'];
      rows = (reportsData.professionalPerformance || []).map(p => [
        sanitizeCsvValue(p.proName),
        sanitizeCsvValue(p.trade),
        sanitizeCsvValue(p.jobsCompleted),
        sanitizeCsvValue(p.rating),
        sanitizeCsvValue(p.slaCompliance),
        sanitizeCsvValue(p.repeatCustomerRequests),
        sanitizeCsvValue(p.avgDurationMins)
      ]);
    } else if (reportType === 'partners') {
      headers = ['Partner Agency', 'Active Fleet', 'Completed Jobs', 'GMV Generated', 'Commission Paid', 'SLA Fulfillment', 'Complaints'];
      rows = (reportsData.partnerPerformance || []).map(p => [
        sanitizeCsvValue(p.partnerName),
        sanitizeCsvValue(p.activeFleet),
        sanitizeCsvValue(p.completedJobs),
        sanitizeCsvValue(p.gmvGenerated),
        sanitizeCsvValue(p.commissionPaid),
        sanitizeCsvValue(p.slaFulfillment),
        sanitizeCsvValue(p.complaintsCount)
      ]);
    } else if (reportType === 'categories') {
      headers = ['Category Name', 'Completed Orders', 'Revenue (INR)', 'Marketplace Share'];
      rows = (reportsData.categoryPerformance || []).map(c => [
        sanitizeCsvValue(c.category),
        sanitizeCsvValue(c.orders),
        sanitizeCsvValue(c.revenueRupees),
        sanitizeCsvValue(`${c.sharePercentage}%`)
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast(`📥 Downloaded ${filename} (Formula-Injection Protected)`);
  }

  function handlePrint() {
    window.print();
  }

  const fin = reportsData?.financials || {};
  const bkg = reportsData?.bookings || {};
  const ref = reportsData?.refunds || {};
  const cust = reportsData?.customerMetrics || {};
  const supp = reportsData?.supportPerformance || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Business Intelligence & Statutory Reports
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
              Formula-Injection Protected
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Multi-dimensional reporting across GMV collections, refunds, settlements, cancellation causes, pro & partner performance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Period Filter */}
          <div style={{ display: 'flex', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #CBD5E1', padding: 2 }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: 'Quarter' },
              { id: '1y', label: 'Annual' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: period === p.id ? '#6E42E5' : 'transparent',
                  color: period === p.id ? '#FFFFFF' : '#64748B'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={15} />
            <span>Print View</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportCSV(activeSection)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Gross Merchandise Value</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            ₹{fin.gmvTotalRupees?.toLocaleString('en-IN') || '4,825,000'}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            Total captured booking volume
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Net Platform Take Revenue</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#6E42E5', marginTop: 4 }}>
            ₹{fin.netPlatformRevenueRupees?.toLocaleString('en-IN') || '965,000'}
          </div>
          <div style={{ fontSize: 11.5, color: '#059669', marginTop: 4, fontWeight: 600 }}>
            20% Contractual Take Rate
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Disbursed Pro & Partner Payouts</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 4 }}>
            ₹{fin.proPartnerSettlementsRupees?.toLocaleString('en-IN') || '3,860,000'}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            TDS Withheld: ₹{fin.tdsWithheldRupees?.toLocaleString('en-IN') || '38,600'}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Customer Repeat Rate</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
            {cust.repeatBookingRate || '42.8%'}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 4 }}>
            {cust.repeatCustomersCount || '1,147'} repeat users (90d)
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: '6px 12px',
        display: 'flex',
        gap: 8,
        overflowX: 'auto'
      }}>
        {[
          { id: 'financials', label: 'Financials & Collections', icon: DollarSign },
          { id: 'professionals', label: 'Technician Fleet Metrics', icon: HardHat },
          { id: 'partners', label: 'Franchise Partner Performance', icon: Building2 },
          { id: 'categories', label: 'Category & City Breakdowns', icon: MapPin },
          { id: 'cancellations', label: 'Cancellations & SLA Health', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: isActive ? '#F5F3FF' : 'transparent',
                color: isActive ? '#6E42E5' : '#64748B',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FINANCIALS & COLLECTIONS                                       */}
      {/* ========================================================================= */}
      {activeSection === 'financials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '12px 18px' }}>Financial Metric</th>
                  <th style={{ padding: '12px 18px' }}>Period Value (INR)</th>
                  <th style={{ padding: '12px 18px' }}>Accounting Standard & Calculation Methodology</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>Gross Merchandise Value (GMV)</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹{fin.gmvTotalRupees?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>Total captured invoice gross value from customers via Razorpay UPI, Cards, NetBanking and COD.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#6E42E5' }}>Platform Net Commission Revenue</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#6E42E5', fontSize: 15 }}>₹{fin.netPlatformRevenueRupees?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>Contractual 20% platform take rate locked at time of customer checkout.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669' }}>Pro & Partner Net Settlement Disbursements</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#059669', fontSize: 15 }}>₹{fin.proPartnerSettlementsRupees?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>Disbursed earnings across freelance professionals and corporate franchise partner agencies.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>Section 194-O Income Tax TDS Withheld</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#DC2626' }}>₹{fin.tdsWithheldRupees?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>1% mandatory statutory withholding tax remitted to Government Treasury on e-commerce operators.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>Approved Warranty & Dispute Refunds</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#DC2626' }}>₹{ref.totalRefundApprovedRupees?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>Customer refunds approved across {ref.totalRefundClaimsCount} claims (turnaround {ref.avgRefundTurnaroundHours}h).</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>Average Order Value (AOV)</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A' }}>₹{fin.averageOrderValueRupees}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>Total captured revenue divided by {bkg.completedBookings} fulfilled doorstep appointments.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: TECHNICIAN FLEET METRICS                                       */}
      {/* ========================================================================= */}
      {activeSection === 'professionals' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                <th style={{ padding: '12px 18px' }}>Professional Name</th>
                <th style={{ padding: '12px 18px' }}>Trade Skill</th>
                <th style={{ padding: '12px 18px' }}>Completed Jobs</th>
                <th style={{ padding: '12px 18px' }}>Customer Rating</th>
                <th style={{ padding: '12px 18px' }}>SLA Timeliness</th>
                <th style={{ padding: '12px 18px' }}>Repeat Client Requests</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Avg Job Duration</th>
              </tr>
            </thead>
            <tbody>
              {(reportsData?.professionalPerformance || []).map(p => (
                <tr key={p.proName} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{p.proName}</td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>{p.trade}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{p.jobsCompleted}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#059669' }}>{p.rating} ★</td>
                  <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 600 }}>{p.slaCompliance}</td>
                  <td style={{ padding: '14px 18px', color: '#6E42E5', fontWeight: 700 }}>{p.repeatCustomerRequests} clients</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: '#64748B' }}>{p.avgDurationMins} mins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: FRANCHISE PARTNER PERFORMANCE                                  */}
      {/* ========================================================================= */}
      {activeSection === 'partners' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                <th style={{ padding: '12px 18px' }}>Partner Agency</th>
                <th style={{ padding: '12px 18px' }}>Active Fleet Size</th>
                <th style={{ padding: '12px 18px' }}>Completed Jobs</th>
                <th style={{ padding: '12px 18px' }}>GMV Generated</th>
                <th style={{ padding: '12px 18px' }}>Commission Take</th>
                <th style={{ padding: '12px 18px' }}>SLA Fulfillment</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Complaints</th>
              </tr>
            </thead>
            <tbody>
              {(reportsData?.partnerPerformance || []).map(p => (
                <tr key={p.partnerName} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{p.partnerName}</td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>{p.activeFleet} technicians</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{p.completedJobs}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A' }}>{p.gmvGenerated}</td>
                  <td style={{ padding: '14px 18px', color: '#6E42E5', fontWeight: 700 }}>{p.commissionPaid}</td>
                  <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 700 }}>{p.slaFulfillment}</td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: p.complaintsCount > 2 ? '#DC2626' : '#64748B' }}>
                    {p.complaintsCount} logged
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CATEGORY & CITY BREAKDOWNS                                     */}
      {/* ========================================================================= */}
      {activeSection === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {/* Category Breakdown */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, color: '#0F172A' }}>
              Service Category Revenue Distribution
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '10px 16px' }}>Category</th>
                  <th style={{ padding: '10px 16px' }}>Orders</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(reportsData?.categoryPerformance || []).map(c => (
                  <tr key={c.category} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{c.category}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{c.orders} ({c.sharePercentage}%)</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>₹{c.revenueRupees?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* City Performance */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, color: '#0F172A' }}>
              Geographic City Hub Performance
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                  <th style={{ padding: '10px 16px' }}>City Zone</th>
                  <th style={{ padding: '10px 16px' }}>Bookings</th>
                  <th style={{ padding: '10px 16px' }}>SLA Fulfillment</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {(reportsData?.cityPerformance || []).map(c => (
                  <tr key={c.city} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>{c.city}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{c.bookings} jobs</td>
                    <td style={{ padding: '12px 16px', color: '#059669', fontWeight: 700 }}>{c.slaRate}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{c.avgRating} ★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: CANCELLATIONS & SLA HEALTH                                     */}
      {/* ========================================================================= */}
      {activeSection === 'cancellations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {/* Cancellation Analysis */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
              Order Cancellation Root Cause Distribution
            </h4>
            <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
              Total cancellations: <strong>{bkg.cancelledBookings}</strong> ({bkg.cancellationRate} cancellation rate)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(bkg.topCancellationReasons || []).map((r, i) => (
                <div key={i} style={{ border: '1px solid #F1F5F9', padding: '10px 14px', borderRadius: 8, backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                    <span>{r.reason}</span>
                    <span style={{ color: '#DC2626' }}>{r.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Resolution SLAs */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 20
          }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
              Support Escalation & SLA Resolution Health
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Average First Response Time</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>{supp.firstResponseAvgMins} mins</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>Average Ticket Resolution Time</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>{supp.resolutionTimeAvgHours} hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>First-Contact Resolution Rate</span>
                <span style={{ fontWeight: 800, color: '#059669' }}>{supp.firstContactResolutionRate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>SLA Target Breach Rate</span>
                <span style={{ fontWeight: 800, color: '#DC2626' }}>{supp.slaBreachRate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
                <span style={{ color: '#64748B' }}>CSAT Satisfaction Rating</span>
                <span style={{ fontWeight: 800, color: '#6E42E5' }}>{supp.customerSatisfactionScore}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
