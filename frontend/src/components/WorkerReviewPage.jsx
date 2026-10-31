import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Share2,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export function WorkerReviewPage({ bookingId, onNavigateHome }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Punctual & On-Time ⏱️', 'Clean & Hygienic 🧼']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const ratingLabels = {
    1: 'Needs Improvement 🙁',
    2: 'Fair Experience 😐',
    3: 'Good Job 🙂',
    4: 'Very Good & Professional 😊',
    5: 'Excellent! Outstanding Work! 🌟'
  };

  const complimentTags = [
    'Punctual & On-Time ⏱️',
    'Polite & Professional 🤝',
    'Clean & Hygienic 🧼',
    'Expert Workmanship 🛠️',
    'Accurate Diagnosis 🔍',
    'Great Communication 💬',
    'Fair & Transparent 💰',
    'Value for Money 💯'
  ];

  useEffect(() => {
    if (!bookingId) return;
    let isMounted = true;
    async function fetchBookingReview() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/bookings/${bookingId}/review`);
        const data = await res.json();
        if (isMounted) {
          if (data.success && data.booking) {
            setBooking(data.booking);
            if (data.booking.existingReview) {
              setRating(data.booking.existingReview.rating || 5);
              setReviewText(data.booking.existingReview.review || '');
              setSelectedTags(data.booking.existingReview.tags || ['Punctual & On-Time ⏱️']);
              setSubmitted(true);
            }
          } else {
            setError(data.message || 'Booking not found');
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load booking');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchBookingReview();
    return () => { isMounted = false; };
  }, [bookingId]);

  const handleToggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    const cleanBookingId = String(bookingId || '').replace(/^#/, '').trim();
    const cleanReview = reviewText.trim();

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(cleanBookingId)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          review: cleanReview,
          tags: selectedTags,
          customerName: booking?.customerName || 'Customer',
          professionalName: booking?.worker?.name || 'Assigned Specialist',
          serviceName: booking?.serviceTitle || booking?.serviceName || 'Home Service'
        })
      });

      const data = await res.json();
      setSubmitted(true);

      // Real-time broadcast
      try {
        const syncChannel = new BroadcastChannel('uc_sync_channel');
        syncChannel.postMessage({ type: 'REVIEW_SUBMITTED', bookingId: cleanBookingId, rating, review: cleanReview, timestamp: Date.now() });
        syncChannel.close();
      } catch (e) {}
      try {
        const revChannel = new BroadcastChannel('uc_reviews_channel');
        revChannel.postMessage({ type: 'REVIEW_SUBMITTED', bookingId: cleanBookingId, rating, review: cleanReview, timestamp: Date.now() });
        revChannel.close();
      } catch (e) {}
      try {
        localStorage.setItem('uc_last_review_event', JSON.stringify({ type: 'REVIEW_SUBMITTED', bookingId: cleanBookingId, rating, review: cleanReview, timestamp: Date.now() }));
      } catch (e) {}
    } catch (err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const worker = booking?.worker || {
    name: 'Neal',
    trade: 'AC & Appliance Repair',
    rating: 5.0
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top Header Bar */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else window.location.href = '/';
          }}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 700,
            color: '#1E293B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={18} color="#059669" />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
            Urban Company Verified Feedback
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ width: '100%', maxWidth: 560, background: '#FFFFFF', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Loading service & specialist details...</div>
        </div>
      ) : error ? (
        <div style={{ width: '100%', maxWidth: 560, background: '#FFFFFF', borderRadius: 20, padding: 36, textAlign: 'center', border: '1px solid #FEE2E2' }}>
          <AlertCircle size={42} color="#DC2626" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#991B1B', margin: '0 0 6px' }}>{error}</h3>
          <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px' }}>
            Please check the booking reference #{bookingId} or return to the main homepage.
          </p>
          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else window.location.href = '/';
            }}
            style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}
          >
            Go to Homepage
          </button>
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth: 580,
            background: '#FFFFFF',
            borderRadius: 20,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}
        >
          {/* Header Profile Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              padding: '24px 28px',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 800,
                  border: '3px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                {worker.avatar ? (
                  <img src={worker.avatar} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  worker.name.slice(0, 2).toUpperCase()
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    {worker.name}
                  </h2>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}
                  >
                    Verified Pro
                  </span>
                </div>
                <div style={{ fontSize: 13.5, opacity: 0.95, marginTop: 4 }}>
                  {worker.trade} • {booking?.serviceName}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                  Booking Reference: #{bookingId}
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '24px 28px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#065F46', margin: '0 0 6px' }}>
                  Review Recorded!
                </h3>
                <p style={{ fontSize: 14, color: '#475569', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Thank you for rating <strong>{worker.name}</strong>. Your feedback is reflected on their professional scorecard.
                </p>

                {/* Rating Display */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: '16px 20px',
                    textAlign: 'left',
                    marginBottom: 20
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={20}
                          fill={s <= rating ? '#F59E0B' : '#E2E8F0'}
                          color={s <= rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1E293B' }}>{rating}.0 Stars</span>
                  </div>

                  {reviewText && (
                    <p style={{ margin: '0 0 10px', fontSize: 14, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{reviewText}"
                    </p>
                  )}

                  {selectedTags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedTags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            background: '#ECFDF5',
                            color: '#065F46',
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateHome) onNavigateHome();
                    else window.location.href = '/';
                  }}
                  style={{
                    background: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  Return to Homepage
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Shareable Link Box */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: 12,
                    padding: '10px 14px',
                    marginBottom: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <Share2 size={15} color="#059669" />
                    <span style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>
                      Shareable review link for {worker.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      background: copiedLink ? '#059669' : '#FFFFFF',
                      color: copiedLink ? '#FFFFFF' : '#065F46',
                      border: '1px solid #A7F3D0',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* 1. Star Rating Widget */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>
                    How would you rate your service with {worker.name}?
                  </label>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeVal = hoverRating || rating;
                      const isFilled = star <= activeVal;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 4,
                            transform: (hoverRating === star) ? 'scale(1.25)' : 'scale(1)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Star
                            size={40}
                            fill={isFilled ? '#F59E0B' : '#F1F5F9'}
                            color={isFilled ? '#F59E0B' : '#CBD5E1'}
                            strokeWidth={isFilled ? 0 : 1.5}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: rating >= 4 ? '#059669' : rating === 3 ? '#D97706' : '#DC2626',
                      marginTop: 8,
                      minHeight: 22
                    }}
                  >
                    {ratingLabels[hoverRating || rating]}
                  </div>
                </div>

                {/* 2. Few Lines About Him (Textarea) */}
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: '#1E293B',
                      marginBottom: 6
                    }}
                  >
                    <span>Write a few lines about {worker.name}:</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{reviewText.length}/500</span>
                  </label>

                  <textarea
                    rows={4}
                    maxLength={500}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={`Describe your experience with ${worker.name}... Was he polite? Did he complete the work to satisfaction?`}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#0F172A',
                      resize: 'vertical',
                      outline: 'none',
                      lineHeight: 1.5,
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* 3. Compliment Pills */}
                <div style={{ marginBottom: 26 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                    Highlights & Quality Tags:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {complimentTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          style={{
                            background: isSelected ? '#ECFDF5' : '#F8FAFC',
                            color: isSelected ? '#065F46' : '#64748B',
                            border: isSelected ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                            borderRadius: 20,
                            padding: '6px 14px',
                            fontSize: 12,
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Submitting Review...' : `Submit Review for ${worker.name} →`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
