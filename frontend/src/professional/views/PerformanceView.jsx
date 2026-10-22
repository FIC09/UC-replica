import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function PerformanceView() {
  const [performance, setPerformance] = useState({
    tier: 'Diamond Pro Partner (Level 5)',
    rating: 4.94,
    ratingTarget: 4.90,
    onTimeArrivalRate: 99.2,
    onTimeTarget: 98.0,
    cancellationRate: 0.6,
    cancellationTarget: 1.0,
    revisitRate: 0.4,
    revisitTarget: 0.5,
    jobsCompletedMonth: 42,
    monthlyTarget: 45,
    monthlyBonusAmount: 5000,
    rankInCity: 4,
    totalProsInCity: 850
  });

  useEffect(() => {
    professionalClient.getPerformance().then(data => {
      if (data.success && data.performance) {
        setPerformance(prev => ({ ...prev, ...data.performance }));
      }
    }).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Partner Tier & Performance Scorecard
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Live metrics tracked for dispatch priority, bonus qualification, and tier advancement
        </div>
      </div>

      {/* Hero Tier Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.5
            }}>
              HIGHEST TIER STATUS
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '12px 0 4px 0' }}>
              💎 {performance.tier}
            </h2>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              Rank #{performance.rankInCity} out of {performance.totalProsInCity} technicians in Mumbai Hub
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>
              ₹{performance.monthlyBonusAmount?.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Guaranteed Monthly Bonus</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px', marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <span>October Target Progress: {performance.jobsCompletedMonth} / {performance.monthlyTarget} Jobs Serviced</span>
            <span style={{ color: '#34d399' }}>93% Achieved</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ background: '#34d399', width: '93%', height: '100%' }} />
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>
            Complete 3 more customer service bookings by 31 Oct to lock in your ₹5,000 cash bonus!
          </div>
        </div>
      </div>

      {/* 4 Core SLA Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        {/* Rating */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>RATING SLA</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: 12 }}>✓ Passing</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {performance.rating} <span style={{ fontSize: 14, color: '#64748b' }}>/ 5.0</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Target: ≥ {performance.ratingTarget} (Exceeding by +0.04)
          </div>
        </div>

        {/* On-Time Arrival */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>ON-TIME ARRIVAL</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: 12 }}>✓ Passing</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {performance.onTimeArrivalRate}%
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Target: ≥ {performance.onTimeTarget}% (Arriving on time)
          </div>
        </div>

        {/* Cancellation */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>CANCELLATION RATE</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: 12 }}>✓ Passing</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {performance.cancellationRate}%
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Target: &lt; {performance.cancellationTarget}% (Low partner cancels)
          </div>
        </div>

        {/* Revisit */}
        <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>CUSTOMER REVISIT</span>
            <span style={{ color: '#059669', fontWeight: 700, fontSize: 12 }}>✓ Passing</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {performance.revisitRate}%
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Target: &lt; {performance.revisitTarget}% (First-time-fix success)
          </div>
        </div>
      </div>

      {/* Tier Benefits Comparison */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
          Partner Tier Club Privileges
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '12px 10px' }}>BENEFIT</th>
                <th style={{ padding: '12px 10px' }}>SILVER (L2)</th>
                <th style={{ padding: '12px 10px' }}>GOLD (L3)</th>
                <th style={{ padding: '12px 10px' }}>PLATINUM (L4)</th>
                <th style={{ padding: '12px 10px', color: '#1e1b4b', fontWeight: 800 }}>DIAMOND (L5) ★</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', fontWeight: 600 }}>Dispatch Priority</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>Standard</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>Fast</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>Priority</td>
                <td style={{ padding: '12px 10px', color: '#059669', fontWeight: 700 }}>Instant First-Choice</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', fontWeight: 600 }}>Monthly Cash Bonus</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>None</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>₹1,500</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>₹3,000</td>
                <td style={{ padding: '12px 10px', color: '#059669', fontWeight: 700 }}>₹5,000</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', fontWeight: 600 }}>Health Insurance Cover</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>₹1 Lakh</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>₹2 Lakhs</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>₹3 Lakhs</td>
                <td style={{ padding: '12px 10px', color: '#059669', fontWeight: 700 }}>₹5 Lakhs (Full Family)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', fontWeight: 600 }}>Dedicated Hub Helpline</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>Standard queue</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>Standard queue</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>Priority callback</td>
                <td style={{ padding: '12px 10px', color: '#059669', fontWeight: 700 }}>VIP 60-Sec Direct Desk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
