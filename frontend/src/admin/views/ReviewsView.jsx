import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  History,
  Check,
  X
} from 'lucide-react';
import { adminClient } from '../adminClient';

export function ReviewsView({ onShowToast }) {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');

  // Moderation Modal
  const [moderatingReview, setModeratingReview] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [targetVisibility, setTargetVisibility] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    adminClient.getReviews()
      .then(res => setReviews(res.reviews || []))
      .catch(() => {});
  }, []);

  function openModerationModal(review, makeVisible) {
    setModeratingReview(review);
    setTargetVisibility(makeVisible);
    setModerationReason(makeVisible ? 'Verified genuine customer feedback adhering to policy' : 'Hidden due to profanity, spam or pending dispute review');
  }

  async function handleApplyModeration() {
    if (!moderatingReview) return;
    setProcessing(true);

    try {
      const res = await adminClient.moderateReview(moderatingReview.id, targetVisibility, moderationReason);
      if (res.success) {
        setReviews(prev => prev.map(r => r.id === moderatingReview.id ? res.review : r));
        setModeratingReview(null);
        if (onShowToast) onShowToast(res.message);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter !== 'ALL' && r.rating !== parseInt(ratingFilter, 10)) return false;
    if (visibilityFilter !== 'ALL' && (visibilityFilter === 'VISIBLE' ? !r.isPublished : r.isPublished)) return false;
    if (flagFilter === 'FLAGGED' && !r.flagged) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = (r.customerName || '').toLowerCase().includes(q) ||
        (r.professionalName || '').toLowerCase().includes(q) ||
        (r.serviceName || '').toLowerCase().includes(q) ||
        (r.bookingId || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner with Authenticity Notice */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '20px 24px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Ratings & Customer Feedback Moderation
              </h2>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                backgroundColor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0'
              }}>
                Authenticity Protected
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
              Moderation controls for verified customer reviews. Review text is never silently edited or fabricated.
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12.5,
            color: '#334155'
          }}>
            <ShieldCheck size={16} color="#059669" />
            <span>Strict Authenticity: Only verified completed bookings can post reviews.</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          paddingTop: 8,
          borderTop: '1px solid #F1F5F9'
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
              placeholder="Search Customer, Pro, Service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Rating:</span>
            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
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
              <option value="ALL">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Visibility:</span>
            <select
              value={visibilityFilter}
              onChange={e => setVisibilityFilter(e.target.value)}
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
              <option value="ALL">All Reviews</option>
              <option value="VISIBLE">Publicly Visible</option>
              <option value="HIDDEN">Hidden / Moderated</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Flagged:</span>
            <select
              value={flagFilter}
              onChange={e => setFlagFilter(e.target.value)}
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
              <option value="ALL">All</option>
              <option value="FLAGGED">Flagged / Abuse Reported</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredReviews.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '36px',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            color: '#64748B'
          }}>
            No customer reviews match the selected filter.
          </div>
        ) : (
          filteredReviews.map(r => (
            <div
              key={r.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: r.flagged ? '1px solid #FED7AA' : '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Review Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: r.rating >= 4 ? '#FEF3C7' : '#FEE2E2',
                    color: r.rating >= 4 ? '#B45309' : '#DC2626',
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: 13
                  }}>
                    <Star size={14} fill={r.rating >= 4 ? '#D97706' : '#DC2626'} />
                    <span>{r.rating}.0</span>
                  </div>

                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{r.serviceName}</span>
                    <span style={{ fontSize: 12, color: '#64748B', marginLeft: 8 }}>
                      by <strong>{r.customerName}</strong> on {r.date}
                    </span>
                  </div>
                </div>

                {/* Status Badges & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.flagged && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      backgroundColor: '#FFF7ED',
                      color: '#C2410C',
                      border: '1px solid #FFEDD5',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <AlertTriangle size={12} />
                      {r.flaggedReason || 'Flagged for Review'}
                    </span>
                  )}

                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: r.isPublished ? '#ECFDF5' : '#FEF2F2',
                    color: r.isPublished ? '#059669' : '#DC2626'
                  }}>
                    {r.isPublished ? 'Publicly Visible' : 'Hidden from Catalogue'}
                  </span>

                  <button
                    type="button"
                    onClick={() => openModerationModal(r, !r.isPublished)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {r.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{r.isPublished ? 'Moderate / Hide' : 'Approve & Publish'}</span>
                  </button>
                </div>
              </div>

              {/* Exact Unaltered Customer Comment */}
              <div style={{
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.5,
                backgroundColor: '#F8FAFC',
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #E2E8F0'
              }}>
                "{r.comment}"
              </div>

              {/* Verified Booking Associations */}
              <div style={{ fontSize: 12, color: '#64748B', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span>
                    Assigned Professional: <strong style={{ color: '#0F172A' }}>{r.professionalName}</strong>
                  </span>
                  <span>
                    Booking Ref: <strong style={{ color: '#0F172A' }}>{r.bookingId}</strong>
                  </span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>
                    ✓ Confirmed Doorstep Execution
                  </span>
                </div>

                {r.reportedAbuseCount > 0 && (
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>
                    ⚠️ {r.reportedAbuseCount} user abuse report(s)
                  </span>
                )}
              </div>

              {/* Moderation History Audit Log */}
              {r.moderationHistory?.length > 0 && (
                <div style={{
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: 8,
                  fontSize: 11.5,
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <History size={12} color="#6E42E5" />
                  <span>
                    Last moderated by <strong>{r.moderationHistory[r.moderationHistory.length - 1].moderatedBy}</strong>: "{r.moderationHistory[r.moderationHistory.length - 1].reason}"
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: REVIEW MODERATION WITH AUDIT REASON LOGGING                        */}
      {/* ========================================================================= */}
      {moderatingReview && (
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
            maxWidth: 520,
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
                <ShieldCheck size={18} color="#6E42E5" />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                  Moderate Review Visibility #{moderatingReview.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModeratingReview(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                backgroundColor: '#F8FAFC',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                fontSize: 12.5,
                color: '#334155'
              }}>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>Customer: {moderatingReview.customerName} ({moderatingReview.rating}★)</div>
                <div style={{ marginTop: 4, fontStyle: 'italic' }}>"{moderatingReview.comment}"</div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Target Visibility State
                </label>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setTargetVisibility(true)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: targetVisibility ? '1px solid #059669' : '1px solid #D1D5DB',
                      backgroundColor: targetVisibility ? '#ECFDF5' : '#FFFFFF',
                      color: targetVisibility ? '#059669' : '#475569'
                    }}
                  >
                    Publicly Visible
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetVisibility(false)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: !targetVisibility ? '1px solid #DC2626' : '1px solid #D1D5DB',
                      backgroundColor: !targetVisibility ? '#FEF2F2' : '#FFFFFF',
                      color: !targetVisibility ? '#DC2626' : '#475569'
                    }}
                  >
                    Hidden from Catalogue
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Official Moderation Reason & Audit Justification
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record official policy basis for moderating this review..."
                  value={moderationReason}
                  onChange={e => setModerationReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', marginTop: 6, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div style={{ fontSize: 11.5, color: '#64748B' }}>
                🛡️ Note: Review comments are never edited or rewritten. Your action will be permanently recorded in the moderation audit trail.
              </div>
            </div>

            <div style={{
              padding: '14px 24px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10
            }}>
              <button
                type="button"
                onClick={() => setModeratingReview(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing || !moderationReason.trim()}
                onClick={handleApplyModeration}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Saving...' : 'Confirm Moderation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
