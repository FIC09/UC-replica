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
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'HIDDEN'
  const [flagFilter, setFlagFilter] = useState('ALL');

  // Moderation Modal
  const [moderatingReview, setModeratingReview] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [targetVisibility, setTargetVisibility] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await adminClient.getReviews();
      if (res && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchReviews();

    // 1. Instant Cross-Tab Real-time BroadcastChannel listeners
    let syncChannel = null;
    let reviewsChannel = null;
    try {
      syncChannel = new BroadcastChannel('uc_sync_channel');
      syncChannel.onmessage = (event) => {
        const d = event.data || {};
        if (d.type === 'REVIEW_SUBMITTED' || d.type === 'REVIEW_APPROVED' || d.type === 'BOOKING_UPDATED') {
          fetchReviews();
        }
      };
    } catch (e) {}

    try {
      reviewsChannel = new BroadcastChannel('uc_reviews_channel');
      reviewsChannel.onmessage = (event) => {
        const d = event.data || {};
        if (d.type === 'REVIEW_SUBMITTED' || d.type === 'REVIEW_APPROVED') {
          fetchReviews();
        }
      };
    } catch (e) {}

    // 2. Storage event fallback for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === 'uc_last_review_event') {
        fetchReviews();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. High-frequency polling (2.5 seconds) ensuring real-time responsiveness
    const pollInterval = setInterval(fetchReviews, 2500);

    return () => {
      if (syncChannel) {
        try { syncChannel.close(); } catch (e) {}
      }
      if (reviewsChannel) {
        try { reviewsChannel.close(); } catch (e) {}
      }
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, []);

  function broadcastReviewEvent(type, review) {
    try {
      const syncChannel = new BroadcastChannel('uc_sync_channel');
      syncChannel.postMessage({ type, review, timestamp: Date.now() });
      syncChannel.close();
    } catch (e) {}
    try {
      const revChannel = new BroadcastChannel('uc_reviews_channel');
      revChannel.postMessage({ type, review, timestamp: Date.now() });
      revChannel.close();
    } catch (e) {}
    try {
      localStorage.setItem('uc_last_review_event', JSON.stringify({ type, review, timestamp: Date.now() }));
    } catch (e) {}
  }

  function openModerationModal(review, makeVisible) {
    setModeratingReview(review);
    setTargetVisibility(makeVisible);
    setModerationReason(makeVisible ? 'Verified genuine customer feedback approved for landing page' : 'Hidden due to profanity, spam or pending dispute review');
  }

  async function handleApproveDirectly(review) {
    setProcessing(true);
    try {
      const res = await adminClient.moderateReview(review.id, true, 'Approved by admin for landing page');
      if (res.success) {
        const updated = {
          ...review,
          ...(res.review || {}),
          isPublished: true,
          status: 'Approved'
        };
        setReviews(prev => prev.map(r => r.id === review.id ? updated : r));
        broadcastReviewEvent('REVIEW_APPROVED', updated);
        if (onShowToast) onShowToast(`✓ Review #${review.rawBookingId || review.bookingId} Approved & Published to Landing Page!`);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  async function handleApplyModeration() {
    if (!moderatingReview) return;
    setProcessing(true);

    try {
      const res = await adminClient.moderateReview(moderatingReview.id, targetVisibility, moderationReason);
      if (res.success) {
        const updated = {
          ...moderatingReview,
          ...(res.review || {}),
          isPublished: targetVisibility,
          status: targetVisibility ? 'Approved' : 'Rejected'
        };
        setReviews(prev => prev.map(r => r.id === moderatingReview.id ? updated : r));
        broadcastReviewEvent(targetVisibility ? 'REVIEW_APPROVED' : 'REVIEW_MODERATED', updated);
        setModeratingReview(null);
        if (onShowToast) onShowToast(res.message);
      }
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  const pendingCount = reviews.filter(r => !r.isPublished || r.status === 'Pending').length;
  const approvedCount = reviews.filter(r => r.isPublished && r.status !== 'Pending').length;
  const hiddenCount = reviews.filter(r => !r.isPublished && r.status === 'Rejected').length;

  const filteredReviews = reviews.filter(r => {
    if (ratingFilter !== 'ALL' && r.rating !== parseInt(ratingFilter, 10)) return false;
    
    // Status Tab Filtering
    if (statusTab === 'PENDING' && (r.isPublished || r.status === 'Approved')) return false;
    if (statusTab === 'APPROVED' && (!r.isPublished || r.status === 'Pending')) return false;
    if (statusTab === 'HIDDEN' && (r.isPublished || r.status === 'Pending')) return false;

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
        gap: 16,
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
                Real-Time Moderation
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
              Newly submitted customer reviews enter Pending Approval. Once you click "Approve", the review appears immediately on the main landing page.
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

        {/* Status Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: 10,
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setStatusTab('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: statusTab === 'ALL' ? '#0F172A' : '#F1F5F9',
              color: statusTab === 'ALL' ? '#FFFFFF' : '#475569',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All Reviews ({reviews.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('PENDING')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: statusTab === 'PENDING' ? '1px solid #D97706' : '1px solid #FDE68A',
              backgroundColor: statusTab === 'PENDING' ? '#D97706' : '#FEF3C7',
              color: statusTab === 'PENDING' ? '#FFFFFF' : '#92400E',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>⏳ Pending Approval</span>
            <span style={{
              backgroundColor: statusTab === 'PENDING' ? '#FFFFFF' : '#B45309',
              color: statusTab === 'PENDING' ? '#B45309' : '#FFFFFF',
              borderRadius: 12,
              padding: '1px 6px',
              fontSize: 11,
              fontWeight: 900
            }}>
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('APPROVED')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: statusTab === 'APPROVED' ? '#059669' : '#F1F5F9',
              color: statusTab === 'APPROVED' ? '#FFFFFF' : '#475569',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ✓ Published to Landing Page ({approvedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusTab('HIDDEN')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: statusTab === 'HIDDEN' ? '#DC2626' : '#F1F5F9',
              color: statusTab === 'HIDDEN' ? '#FFFFFF' : '#475569',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Hidden / Rejected ({hiddenCount})
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{
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
          filteredReviews.map(r => {
            const isPending = !r.isPublished || r.status === 'Pending';
            return (
              <div
                key={r.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: isPending ? '2px solid #F59E0B' : (r.flagged ? '1px solid #FED7AA' : '1px solid #E2E8F0'),
                  padding: '20px',
                  boxShadow: isPending ? '0 4px 12px rgba(245, 158, 11, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative'
                }}
              >
                {/* Pending Approval Alert Banner */}
                {isPending && (
                  <div style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: 8,
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#92400E' }}>
                      <span>⏳</span>
                      <span><strong>Pending Approval:</strong> Verified customer submitted this review. Approve below to publish it live on the main landing page.</span>
                    </div>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleApproveDirectly(r)}
                      style={{
                        backgroundColor: '#059669',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5
                      }}
                    >
                      <Check size={14} />
                      <span>Approve & Publish to Landing Page</span>
                    </button>
                  </div>
                )}

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
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 9999,
                      backgroundColor: isPending ? '#FEF3C7' : (r.isPublished ? '#ECFDF5' : '#FEF2F2'),
                      color: isPending ? '#B45309' : (r.isPublished ? '#059669' : '#DC2626'),
                      border: isPending ? '1px solid #FDE68A' : (r.isPublished ? '1px solid #A7F3D0' : '1px solid #FECACA')
                    }}>
                      {isPending ? '⏳ Pending Approval' : (r.isPublished ? '✓ Live on Landing Page' : 'Hidden from Catalogue')}
                    </span>

                    {isPending ? (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() => handleApproveDirectly(r)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: '#059669',
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                    ) : (
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
                    )}
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
          );
        })
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
