import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';
import { REVIEWS } from '../data/servicesData';

const AVATAR_PALETTES = [
  { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' }, // Indigo
  { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' }, // Purple
  { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' }, // Emerald
  { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' }, // Amber
  { bg: '#FDF2F8', text: '#BE185D', border: '#FBCFE8' }, // Pink
  { bg: '#ECFEFF', text: '#0E7490', border: '#A5F3FC' }, // Cyan
  { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' }, // Sky
];

function getCustomerAvatarTheme(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getCustomerInitials(name = '') {
  const clean = name.trim();
  if (!clean || clean.toLowerCase() === 'customer' || clean.toLowerCase() === 'verified customer') {
    return 'C';
  }
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CustomerReviewsSection() {
  const [publishedReviews, setPublishedReviews] = useState([]);

  const fetchPublishedReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
        setPublishedReviews(data.reviews);
        return;
      }
    } catch (e) {}

    try {
      const altRes = await fetch('/api/bookings/reviews/published');
      const altData = await altRes.json();
      if (altData && altData.success && Array.isArray(altData.reviews)) {
        setPublishedReviews(altData.reviews);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchPublishedReviews();

    // 1. Cross-Tab Real-time BroadcastChannel listeners (Instant 0ms update upon Admin Approval)
    let syncChannel = null;
    let reviewsChannel = null;
    try {
      syncChannel = new BroadcastChannel('uc_sync_channel');
      syncChannel.onmessage = (event) => {
        const d = event.data || {};
        if (d.type === 'REVIEW_APPROVED' || d.type === 'REVIEW_MODERATED') {
          fetchPublishedReviews();
        }
      };
    } catch (e) {}

    try {
      reviewsChannel = new BroadcastChannel('uc_reviews_channel');
      reviewsChannel.onmessage = (event) => {
        const d = event.data || {};
        if (d.type === 'REVIEW_APPROVED' || d.type === 'REVIEW_MODERATED') {
          fetchPublishedReviews();
        }
      };
    } catch (e) {}

    // 2. Storage event fallback for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === 'uc_last_review_event') {
        fetchPublishedReviews();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Periodic real-time poll (every 3 seconds)
    const pollInterval = setInterval(fetchPublishedReviews, 3000);

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

  // Merge real approved customer reviews (at the very top) with standard testimonials
  const allReviews = [...publishedReviews, ...REVIEWS];

  return (
    <section className="reviews-section compact">
      <div className="container-custom">
        {/* Compact Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 800,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 2
            }}>
              <ShieldCheck size={13} />
              <span>Verified Customer Testimonials</span>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 800,
              color: '#0F172A',
              margin: 0
            }}>
              Loved by 12 Million+ Customers
            </h3>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            padding: '6px 14px',
            borderRadius: 20
          }}>
            <Star size={15} fill="#16A34A" color="#16A34A" />
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#166534' }}>4.82 / 5</span>
            <span style={{ fontSize: 11.5, color: '#15803D' }}>• 1.2M+ reviews</span>
          </div>
        </div>

        {/* Compact Reviews Grid */}
        <div className="reviews-slider-grid compact">
          {allReviews.map((r) => {
            const isLiveReview = Boolean(r.isApproved || r.isLiveApproved);
            return (
              <div
                key={r.id}
                className="review-card compact"
                style={{
                  border: isLiveReview ? '2px solid #10B981' : undefined,
                  backgroundColor: isLiveReview ? '#F0FDF4' : '#FFFFFF',
                  position: 'relative'
                }}
              >
                {isLiveReview && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    right: 12,
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: '#FFFFFF',
                    fontSize: 9.5,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 12,
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Sparkles size={10} />
                    <span>Live Customer Review</span>
                  </div>
                )}

                <div>
                  {/* Top: Avatar, Name, Locality, Stars */}
                  <div className="review-card-top compact">
                    {(() => {
                      const isMockPhoto = !r.avatar || r.avatar.includes('unsplash.com') || r.avatar.includes('randomuser.me') || r.avatar.includes('placeholder');
                      const avatarTheme = getCustomerAvatarTheme(r.name);
                      const initials = getCustomerInitials(r.name);

                      if (!isMockPhoto) {
                        return (
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className="review-avatar compact"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        );
                      }

                      return (
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          backgroundColor: avatarTheme.bg,
                          color: avatarTheme.text,
                          border: `1.5px solid ${avatarTheme.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 12.5,
                          letterSpacing: '0.5px',
                          flexShrink: 0
                        }}>
                          {initials}
                        </div>
                      );
                    })()}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="reviewer-name compact" style={{ fontWeight: 800 }}>
                          {r.name}
                        </span>
                        <div className="review-stars compact" style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <Star
                              key={starIdx}
                              size={12}
                              fill={starIdx <= Number(r.rating) ? '#F59E0B' : '#E2E8F0'}
                              color={starIdx <= Number(r.rating) ? '#F59E0B' : '#CBD5E1'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="reviewer-loc compact">{r.locality}</div>
                    </div>
                  </div>

                  {/* Compact Truncated/Clamped Review Body */}
                  <p className="review-body-text compact" style={{ fontStyle: 'italic', color: '#1E293B', marginTop: 8 }}>
                    "{r.comment}"
                  </p>
                </div>

                {/* Bottom: Service & Verified Tag */}
                <div className="review-card-footer compact" style={{ marginTop: 10 }}>
                  <span className="review-service-pill compact" title={r.service}>
                    {r.service}
                  </span>
                  <span className="review-verified-pill" style={{ color: '#059669', fontWeight: 700 }}>
                    ✓ {r.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
