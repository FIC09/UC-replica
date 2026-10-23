import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function PerformanceView({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    tier: 'Diamond Pro Partner (Level 5)',
    reviewPeriod: 'Rolling 30-Day Evaluation Window (23 Sep 2026 – 23 Oct 2026)',
    reviewCycleExplanation: 'Performance metrics are evaluated continuously over a rolling 30-day window. Tier promotions and guaranteed monthly bonus payouts execute on the 1st of every calendar month.',
    insufficientData: false,
    insufficientDataNotice: null,
    scorecard: {
      averageRating: { value: 4.94, target: 4.90, unit: 'Stars', definition: 'Weighted average of 1-to-5 star customer ratings received across verified completed jobs during the rolling 30-day review period.' },
      reviewCount: { value: 1520, target: 10, unit: 'Reviews', definition: 'Total number of verified homeowner service ratings registered on platform.' },
      completionRate: { value: 99.4, target: 98.0, unit: '%', definition: 'Percentage of accepted service dispatches completed successfully without cancellation: (Completed Jobs / Total Accepted Jobs) × 100.' },
      cancellationRate: { value: 0.6, target: 1.0, unit: '%', definition: 'Percentage of accepted bookings initiated for cancellation by the professional: (Cancelled by Worker / Total Accepted) × 100.' },
      onTimeArrivalRate: { value: 99.2, target: 98.0, unit: '%', definition: 'Percentage of bookings where the technician arrived at the doorstep on or before the scheduled service window start time based on GPS geo-fence timestamp.' },
      revisitRate: { value: 0.4, target: 0.5, unit: '%', definition: 'Percentage of completed jobs requiring a customer-initiated rework or warranty revisit within 14 days of original service.' },
      jobsCompleted: { value: 42, target: 45, unit: 'Jobs', definition: 'Total completed service dispatches executed in current rolling calendar month.' }
    },
    trainingRecommendations: [
      { courseId: 'TRN-103', title: 'Inverter PCB Diagnostics & High-Voltage Safety', reason: 'Recommended based on seasonal inverter split AC maintenance demand in Mumbai region.' },
      { courseId: 'TRN-104', title: 'R32 / R410A Eco Refrigerant Safe Recovery & Vacuum SOP', reason: 'Recommended for Diamond Pro Partners to qualify for zero-emission eco-refrigerant premium bonuses.' }
    ],
    tierEligibility: {
      currentTier: 'Diamond Pro Partner (Level 5)',
      nextTier: 'Master Elite Partner (Level 6)',
      progressPercent: 93,
      thresholds: { minRating: 4.90, minCompletionRate: 98.0, maxCancellationRate: 1.0, minOnTimeArrival: 98.0 }
    },
    appeals: []
  });

  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealForm, setAppealForm] = useState({
    metric: 'cancellation_rate',
    incidentBookingRef: '',
    explanation: '',
    evidenceRef: ''
  });
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  useEffect(() => {
    loadPerformance();
  }, []);

  async function loadPerformance() {
    try {
      const data = await professionalClient.getPerformance();
      if (data.success) {
        setPerformanceData(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err) {
      console.warn('Performance load warning:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingAppeal(true);
    try {
      const res = await professionalClient.submitPerformanceAppeal(appealForm);
      if (res.success) {
        if (showToast) showToast('Performance appeal registered with Senior Dispatch Cell (48h SLA).');
        setPerformanceData(prev => ({
          ...prev,
          appeals: [res.appeal, ...(prev.appeals || [])]
        }));
        setShowAppealModal(false);
        setAppealForm({
          metric: 'cancellation_rate',
          incidentBookingRef: '',
          explanation: '',
          evidenceRef: ''
        });
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Appeal submission failed');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const sc = performanceData.scorecard || {};

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1020, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title & Review Period Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Performance & Quality Scorecard
          </h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {performanceData.reviewPeriod} • Configured Platform Standards
          </div>
        </div>

        <button
          onClick={() => setShowAppealModal(true)}
          style={{
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ⚖️ File Decision / SLA Appeal
        </button>
      </div>

      {/* Insufficient Data Callout Banner if applicable */}
      {performanceData.insufficientData ? (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <span style={{ fontSize: 32 }}>📊</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
              Insufficient Data for Tier Ranking
            </div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              {performanceData.insufficientDataNotice || 'A minimum of 10 completed dispatches within the 30-day evaluation cycle is required to generate reliable quality ratings and tier ranking. Continue accepting service dispatches to establish your verified performance benchmark.'}
            </div>
          </div>
        </div>
      ) : (
        /* Hero Tier Card */
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: 16,
          padding: '26px 30px',
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
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5
              }}>
                CURRENT PARTNER TIER
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '10px 0 4px 0' }}>
                💎 {performanceData.tier}
              </h2>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                Eligible for priority dispatch in Bandra Central Operational Hub
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#34d399' }}>
                ₹5,000
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Monthly Diamond Bonus Tier</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              <span>Rolling Target: {sc.jobsCompleted?.value || 42} / {sc.jobsCompleted?.target || 45} Jobs Completed</span>
              <span style={{ color: '#34d399' }}>{performanceData.tierEligibility?.progressPercent || 93}% Achieved</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ background: '#34d399', width: `${performanceData.tierEligibility?.progressPercent || 93}%`, height: '100%' }} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>
              3 more completed bookings required by 31 Oct to lock in your Level 5 partner cash incentive.
            </div>
          </div>
        </div>
      )}

      {/* Review Cycle Explanation Callout */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '14px 18px',
        fontSize: 13,
        color: '#475569',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <span style={{ fontSize: 18 }}>🗓️</span>
        <div>
          <strong>Review Cycle Policy:</strong> {performanceData.reviewCycleExplanation}
        </div>
      </div>

      {/* Core SLA Metrics Grid with Explicit Definitions */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
          Configured SLA Metrics & Definitions
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16
        }}>
          {/* Average Rating */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Average Rating</span>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Target: ≥ {sc.averageRating?.target || 4.90}
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
              {sc.averageRating?.value || 4.94} <span style={{ fontSize: 16, color: '#f59e0b' }}>★</span>
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginTop: 6, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <strong>Definition:</strong> {sc.averageRating?.definition}
            </div>
          </div>

          {/* Completion Rate */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Completion Rate</span>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Target: ≥ {sc.completionRate?.target || 98.0}%
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
              {sc.completionRate?.value || 99.4}%
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginTop: 6, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <strong>Definition:</strong> {sc.completionRate?.definition}
            </div>
          </div>

          {/* Cancellation Rate */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cancellation Rate</span>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Target: ≤ {sc.cancellationRate?.target || 1.0}%
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
              {sc.cancellationRate?.value || 0.6}%
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginTop: 6, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <strong>Definition:</strong> {sc.cancellationRate?.definition}
            </div>
          </div>

          {/* On-Time Arrival Rate */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>On-Time Arrival Rate</span>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Target: ≥ {sc.onTimeArrivalRate?.target || 98.0}%
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
              {sc.onTimeArrivalRate?.value || 99.2}%
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginTop: 6, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <strong>Definition:</strong> {sc.onTimeArrivalRate?.definition}
            </div>
          </div>

          {/* Revisit Rate */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Warranty Revisit Rate</span>
              <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Target: ≤ {sc.revisitRate?.target || 0.5}%
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
              {sc.revisitRate?.value || 0.4}%
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginTop: 6, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <strong>Definition:</strong> {sc.revisitRate?.definition}
            </div>
          </div>

          {/* Total Reviews */}
          <div style={{ background: '#ffffff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Review Count</span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Baseline: ≥ 10
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
              {sc.reviewCount?.value || 1520}
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4, marginTop: 6, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <strong>Definition:</strong> {sc.reviewCount?.definition}
            </div>
          </div>
        </div>
      </div>

      {/* Training Recommendations Section */}
      {performanceData.trainingRecommendations?.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: 24
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Personalized Training & Certification Recommendations
          </h3>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Recommended skill upgrades based on your service category and regional customer demand
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {performanceData.trainingRecommendations.map(rec => (
              <div
                key={rec.courseId}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px 18px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ background: '#2563eb', color: '#ffffff', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                    {rec.courseId}
                  </span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    {rec.title}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  {rec.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Appeals History */}
      {performanceData.appeals?.length > 0 && (
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
            Logged Performance & SLA Appeals
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {performanceData.appeals.map(app => (
              <div
                key={app.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                    {app.id} • Metric: {app.metric?.replace(/_/g, ' ')} • Ref: {app.incidentBookingRef}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Reason: {app.explanation}
                  </div>
                </div>
                <span style={{
                  background: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  ⏳ {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {showAppealModal && (
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
            maxWidth: 480,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              File Performance / SLA Strike Appeal
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0' }}>
              Appeals are audited by the Senior Dispatch Operations Cell with geofence and chat logs.
            </p>

            <form onSubmit={handleAppealSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Disputed Metric / Decision
                </label>
                <select
                  value={appealForm.metric}
                  onChange={(e) => setAppealForm({ ...appealForm, metric: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="cancellation_rate">Cancellation Strike</option>
                  <option value="on_time_arrival">Late Arrival Strike</option>
                  <option value="revisit_strike">Warranty Revisit Penalty</option>
                  <option value="tier_downgrade">Tier Downgrade Assessment</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Incident Booking Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UC-829100"
                  value={appealForm.incidentBookingRef}
                  onChange={(e) => setAppealForm({ ...appealForm, incidentBookingRef: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Appeal Justification & Circumstances
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide verifiable reason (e.g. official traffic police waterlogging advisory or customer locked doorstep)..."
                  value={appealForm.explanation}
                  onChange={(e) => setAppealForm({ ...appealForm, explanation: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAppeal}
                  style={{ flex: 1.5, background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmittingAppeal ? 'Submitting...' : 'Submit Formal Appeal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
