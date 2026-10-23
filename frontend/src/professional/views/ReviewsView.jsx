import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function ReviewsView({ showToast }) {
  const [starFilter, setStarFilter] = useState('ALL');
  const [reviewsData, setReviewsData] = useState({
    averageRating: 4.94,
    totalReviews: 1520,
    breakdown: { '5': 94, '4': 5, '3': 1, '2': 0, '1': 0 },
    reviews: []
  });

  const [selectedReviewForFlag, setSelectedReviewForFlag] = useState(null);
  const [flagReason, setFlagReason] = useState('customer_scope_dispute');
  const [flagExplanation, setFlagExplanation] = useState('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      const data = await professionalClient.getReviews();
      if (data.success && data.reviews) {
        setReviewsData({
          averageRating: data.averageRating || 4.94,
          totalReviews: data.totalReviewsCount || data.reviews.length,
          breakdown: data.breakdown || { '5': 94, '4': 5, '3': 1, '2': 0, '1': 0 },
          reviews: data.reviews
        });
      }
    } catch (err) {
      console.warn('Reviews load warning:', err);
    }
  }

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReviewForFlag) return;

    setIsSubmittingFlag(true);
    try {
      const res = await professionalClient.flagReview(selectedReviewForFlag.id, {
        reason: flagReason,
        explanation: flagExplanation
      });

      if (res.success) {
        if (showToast) showToast('Review flagged for moderation audit. Trust & Safety team will review within 24h.');
        setReviewsData(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r.id === selectedReviewForFlag.id ? {
            ...r,
            flagged: true,
            flagStatus: 'Pending Moderation Review',
            flagReason,
            flagExplanation
          } : r)
        }));
        setSelectedReviewForFlag(null);
        setFlagExplanation('');
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to flag review');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const filteredReviews = reviewsData.reviews.filter(r => {
    if (starFilter === 'ALL') return true;
    return String(Math.floor(r.rating)) === starFilter;
  });

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Customer Ratings & Reviews
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Real feedback from homeowners serviced across Mumbai • Rolling 30-day quality window
        </div>
      </div>

      {/* Policy Guard Banner */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '12px 18px',
        fontSize: 12,
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20
      }}>
        <span style={{ fontSize: 18 }}>🛡️</span>
        <div>
          <strong>Platform Integrity Policy:</strong> Professionals may read verified customer feedback and flag abusive or inaccurate reviews for moderation audit. Customer ratings and criticism cannot be edited or deleted by professionals.
        </div>
      </div>

      {/* Hero Rating Scorecard */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '24px 28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: 32,
        alignItems: 'center',
        marginBottom: 24
      }}>
        {/* Left Big Number */}
        <div style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0', paddingRight: 24 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {reviewsData.averageRating}
          </div>
          <div style={{ fontSize: 20, color: '#f59e0b', margin: '8px 0' }}>
            ★★★★★
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
            {reviewsData.totalReviews} Verified Customer Ratings
          </div>
          <div style={{
            display: 'inline-block',
            background: '#ecfdf5',
            color: '#059669',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 700,
            marginTop: 8
          }}>
            Top 2% in Mumbai Hub
          </div>
        </div>

        {/* Right Star Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['5', '4', '3', '2', '1'].map(stars => {
            const count = reviewsData.breakdown[stars] || 0;
            const pct = reviewsData.totalReviews > 0 ? Math.round((count / reviewsData.totalReviews) * 100) : 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 45, fontWeight: 600, color: '#334155' }}>{stars} Star</span>
                <div style={{ flex: 1, background: '#f1f5f9', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ background: '#f59e0b', width: `${pct}%`, height: '100%' }} />
                </div>
                <span style={{ width: 40, textAlign: 'right', color: '#64748b', fontWeight: 600 }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20 }}>
        {['ALL', '5', '4', '3'].map(tab => (
          <button
            key={tab}
            onClick={() => setStarFilter(tab)}
            style={{
              background: starFilter === tab ? '#0f172a' : '#f8fafc',
              color: starFilter === tab ? '#ffffff' : '#475569',
              border: `1px solid ${starFilter === tab ? '#0f172a' : '#cbd5e1'}`,
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab === 'ALL' ? 'All Reviews' : `${tab} Stars Only`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredReviews.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 32, textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
            No reviews found matching filter.
          </div>
        ) : (
          filteredReviews.map(r => (
            <div
              key={r.id}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: '20px 24px',
                border: `1px solid ${r.flagged ? '#fde68a' : '#e2e8f0'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14
                  }}>
                    {r.customer ? r.customer.split(' ').map(n => n[0]).join('') : 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {r.customer}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {r.date} • {r.service}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <span style={{ color: '#f59e0b', fontSize: 15, fontWeight: 700 }}>
                      {'★'.repeat(r.rating || 5)}
                    </span>
                    <span style={{ color: '#cbd5e1', fontSize: 15 }}>
                      {'★'.repeat(5 - (r.rating || 5))}
                    </span>
                  </div>

                  {r.flagged ? (
                    <span style={{
                      background: '#fffbeb',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      ⏳ {r.flagStatus || 'Pending Moderation'}
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedReviewForFlag(r)}
                      style={{
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      🚩 Flag Inaccurate / Abusive
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                "{r.comment}"
              </p>

              {r.flagged && (
                <div style={{
                  background: '#fffbeb',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginTop: 10,
                  fontSize: 12,
                  color: '#92400e'
                }}>
                  <strong>Flagged by Professional ({r.flagReason?.replace(/_/g, ' ')}):</strong> {r.flagExplanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Flag Review Modal */}
      {selectedReviewForFlag && (
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
              Flag Customer Review for Moderation
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0' }}>
              Audited by Customer Trust & Safety Cell. Ratings cannot be removed without verifiable proof of policy violation.
            </p>

            <form onSubmit={handleFlagSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Reason for Moderation Flag
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="customer_scope_dispute">Customer Scope Dispute (Demanded free extra work)</option>
                  <option value="inaccurate_feedback">Inaccurate / Untruthful claims</option>
                  <option value="abusive_language">Abusive language or profanity</option>
                  <option value="safety_threat">Safety threat or harassment</option>
                  <option value="unrelated_issue">Unrelated to service (e.g. city electricity outage)</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Provide Specific Context / Evidence Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this review violates platform feedback policy (e.g. customer refused to book outdoor bracket replacement and blamed technician)..."
                  value={flagExplanation}
                  onChange={(e) => setFlagExplanation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedReviewForFlag(null)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFlag}
                  style={{ flex: 1.5, background: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmittingFlag ? 'Submitting...' : 'Submit Flag for Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
