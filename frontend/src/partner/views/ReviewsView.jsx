import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Reply,
  CheckCircle2,
  UserCheck,
  HardHat,
  X,
  Flag,
  AlertTriangle,
  Info
} from 'lucide-react';
import { partnerClient } from '../partnerClient';

export function ReviewsView({ showToast, staff }) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Flag review state
  const [flaggingReview, setFlaggingReview] = useState(null);
  const [flagCategory, setFlagCategory] = useState('Abusive Language');
  const [flagReason, setFlagReason] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [submittingFlag, setSubmittingFlag] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await partnerClient.getReviews();
      if (res && res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      showToast?.('Error loading reviews: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !replyingReview) return;
    setSubmittingReply(true);
    try {
      const res = await partnerClient.replyToReview(replyingReview.id, replyText);
      if (res && res.success) {
        showToast?.('Official partner response published to customer review.');
        setReplyingReview(null);
        setReplyText('');
        loadReviews();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleFlagReview(e) {
    e.preventDefault();
    if (!flagReason.trim() || !flaggingReview) {
      showToast?.('Flag reason is required.');
      return;
    }
    setSubmittingFlag(true);
    try {
      const res = await partnerClient.flagReview(flaggingReview.id, {
        flagCategory,
        reason: flagReason,
        evidenceNote: evidenceNote.trim() || null
      });

      if (res && res.success) {
        showToast?.('Review flagged for Trust & Safety investigation.');
        setFlaggingReview(null);
        setFlagReason('');
        setEvidenceNote('');
        loadReviews();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to flag review');
    } finally {
      setSubmittingFlag(false);
    }
  }

  const canReply = staff?.permissions?.editing !== false;
  const flaggedCount = reviews.filter(r => r.flaggedForModeration).length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(2)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            Customer Feedback & Technician Ratings
          </h1>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0 0' }}>
            Verified customer ratings, technician badges, and official partner management replies
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef3c7', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#b45309' }}>
            <Star size={16} fill="#b45309" color="#b45309" /> Agency Rating: {avgRating ? `${avgRating} / 5.0` : 'No ratings yet'}
          </div>
          {flaggedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fee2e2', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#991b1b' }}>
              <Flag size={14} /> {flaggedCount} Under Moderation
            </div>
          )}
        </div>
      </div>

      {/* Reviews Cards List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          Loading customer reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
          No customer reviews received yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map(rev => (
            <div
              key={rev.id}
              style={{
                background: '#ffffff',
                borderRadius: 12,
                border: rev.flaggedForModeration ? '1px solid #fecaca' : '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 15, color: '#0f172a' }}>{rev.customerName}</strong>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>• Booking #{rev.bookingId}</span>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      • {new Date(rev.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(rev.rating) ? '#f59e0b' : '#e2e8f0'}
                        color={i < Math.floor(rev.rating) ? '#f59e0b' : '#cbd5e1'}
                      />
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginLeft: 4 }}>
                      {rev.rating}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#ede9fe',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6d28d9'
                  }}>
                    <HardHat size={14} /> Tech: {rev.technicianName}
                  </div>

                  {!rev.flaggedForModeration && (
                    <button
                      onClick={() => {
                        setFlaggingReview(rev);
                        setFlagReason('');
                        setEvidenceNote('');
                      }}
                      title="Flag review for Trust & Safety moderation"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontSize: 11.5,
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      <Flag size={12} /> Flag
                    </button>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: '10px 0 14px 0' }}>
                "{rev.comment}"
              </p>

              {/* Moderation Badge if flagged */}
              {rev.flaggedForModeration && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#991b1b',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertTriangle size={15} color="#dc2626" />
                  <div>
                    <strong>Flagged for Platform Trust & Safety Moderation</strong>
                    <div style={{ fontSize: 11.5, color: '#b91c1c' }}>
                      Category: {rev.flagDetails?.category || 'Compliance Flag'} • Reason: {rev.flagDetails?.reason || 'Under investigation'}
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Partner Reply */}
              {rev.partnerReply ? (
                <div style={{
                  background: '#f8fafc',
                  borderLeft: '3px solid #7c3aed',
                  padding: '12px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#475569',
                  marginTop: 8
                }}>
                  <strong style={{ color: '#7c3aed', display: 'block', marginBottom: 2 }}>
                    Official Response ({rev.repliedBy || 'Business Partner'}):
                  </strong>
                  {rev.partnerReply}
                </div>
              ) : (
                canReply && (
                  <button
                    onClick={() => {
                      setReplyingReview(rev);
                      setReplyText('');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '5px 12px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    <Reply size={13} /> Post Official Partner Reply
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      {replyingReview && (
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
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Reply to {replyingReview.customerName}'s Review
              </h2>
              <button
                onClick={() => setReplyingReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendReply} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Response Message (Visible to Customer & Platform QA)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thank the customer or address their concern constructively..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
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
                  disabled={submittingReply}
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
                  {submittingReply ? 'Posting...' : 'Publish Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag Review Dialog */}
      {flaggingReview && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag size={18} color="#dc2626" />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Flag Review for Compliance Moderation
                </h2>
              </div>
              <button
                onClick={() => setFlaggingReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFlagReview} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                Flagging review #{flaggingReview.id} on Booking #{flaggingReview.bookingId} by "{flaggingReview.customerName}"
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Violation Category *
                </label>
                <select
                  value={flagCategory}
                  onChange={e => setFlagCategory(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                >
                  <option value="Abusive Language">Abusive / Inappropriate Language</option>
                  <option value="Inaccurate Service Details">Inaccurate Service Details</option>
                  <option value="Wrong Business">Wrong Business / Service Mismatch</option>
                  <option value="Competitor Sabotage">Competitor Sabotage or Extortion</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Detailed Reason for Flagging *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this review violates platform terms or contains inaccurate statements..."
                  value={flagReason}
                  onChange={e => setFlagReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Evidence / Job Sheet Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Job sheet photo #JS-9821, Customer signature on work order"
                  value={evidenceNote}
                  onChange={e => setEvidenceNote(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setFlaggingReview(null)}
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
                  disabled={submittingFlag}
                  style={{
                    flex: 2,
                    padding: '10px 16px',
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {submittingFlag ? 'Flagging...' : 'Submit to Trust & Safety'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
