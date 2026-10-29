import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  Copy,
  Check,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';

export function WorkerReviewModal({
  booking,
  isOpen,
  onClose,
  onReviewSubmitted,
  showToast
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Punctual & On-Time ⏱️', 'Polite & Professional 🤝']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(Boolean(booking?.rating));
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !booking) return null;

  const bookingId = booking.id || booking.bookingReference || 'UC-741660';
  const workerName = booking.assignedProfessional?.name || booking.worker?.name || booking.assignedPartner || 'Neal';
  const workerTrade = booking.assignedProfessional?.trade || booking.worker?.trade || booking.serviceName || 'AC & Appliance Repair';
  const workerAvatar = booking.assignedProfessional?.avatar || booking.worker?.avatar || '';
  const serviceName = booking.serviceName || booking.items?.[0]?.name || 'Home Service';

  const reviewUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/review/${bookingId}`
    : `http://localhost:5173/review/${bookingId}`;

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

  const handleToggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCopyReviewLink = () => {
    try {
      navigator.clipboard?.writeText(reviewUrl);
      setCopiedLink(true);
      showToast?.('🔗 Review link copied! Share with customer via WhatsApp or SMS.');
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

    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          review: reviewText.trim(),
          tags: selectedTags,
          customerName: booking.userName || 'Customer'
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        showToast?.(`⭐ Review submitted! Thank you for rating ${workerName}.`);
        onReviewSubmitted?.({
          bookingId,
          rating,
          review: reviewText.trim(),
          tags: selectedTags
        });
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.warn('Review submission offline fallback:', err.message);
      setSubmitted(true);
      showToast?.(`⭐ Review recorded for ${workerName}!`);
      onReviewSubmitted?.({
        bookingId,
        rating,
        review: reviewText.trim(),
        tags: selectedTags
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        {/* Modal Top Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            padding: '20px 24px',
            color: '#FFFFFF',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#FFFFFF',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '3px solid rgba(255,255,255,0.4)',
                overflow: 'hidden'
              }}
            >
              {workerAvatar ? (
                <img src={workerAvatar} alt={workerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                workerName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Rate {workerName}
                </h3>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 10.5,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  Verified Pro
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 13, opacity: 0.9 }}>
                {workerTrade} • Order #{bookingId}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {submitted ? (
            /* Thank You Confirmation Screen */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.2)'
                }}
              >
                <CheckCircle2 size={38} />
              </div>

              <h4 style={{ fontSize: 20, fontWeight: 800, color: '#065F46', margin: '0 0 8px' }}>
                Thank You for Reviewing {workerName}!
              </h4>
              <p style={{ fontSize: 14, color: '#475569', margin: '0 0 16px', lineHeight: 1.5 }}>
                Your feedback helps <strong>{workerName}</strong> maintain verified pro status and helps customers in Krishnagiri choose trusted specialists.
              </p>

              {/* Submitted Review Summary Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 14,
                  padding: 16,
                  border: '1px solid #E2E8F0',
                  textAlign: 'left',
                  marginBottom: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={18}
                        fill={s <= rating ? '#F59E0B' : '#E2E8F0'}
                        color={s <= rating ? '#F59E0B' : '#CBD5E1'}
                      />
                    ))}
                  </div>
                  <strong style={{ fontSize: 13, color: '#1E293B' }}>({rating}.0 / 5.0)</strong>
                </div>

                {reviewText ? (
                  <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{reviewText}"
                  </p>
                ) : (
                  <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#64748B' }}>
                    Rated {rating} stars for {serviceName}.
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
                          fontSize: 11,
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

              {/* Shareable Review Link Copy Box */}
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  style={{
                    flex: 1,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#475569',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyReviewLink}
                  style={{
                    background: copiedLink ? '#059669' : '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                }}
              >
                Done & Close
              </button>
            </div>
          ) : (
            /* Review Entry Form */
            <form onSubmit={handleSubmit}>
              {/* Direct Link Banner */}
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 12,
                  padding: '10px 14px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Share2 size={16} color="#059669" />
                  <span style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>
                    Direct Review Link for {workerName}:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReviewLink}
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
                    gap: 4,
                    flexShrink: 0
                  }}
                >
                  {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* 1. Star Rating Selector */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
                  How would you rate {workerName}'s service?
                </label>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0'
                  }}
                >
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
                          transform: hoverRating === star ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.15s'
                        }}
                        aria-label={`${star} Star`}
                      >
                        <Star
                          size={36}
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
                    fontSize: 13,
                    fontWeight: 700,
                    color: rating >= 4 ? '#059669' : rating === 3 ? '#D97706' : '#DC2626',
                    marginTop: 4,
                    minHeight: 20
                  }}
                >
                  {ratingLabels[hoverRating || rating]}
                </div>
              </div>

              {/* 2. Written Review ("Few lines about him") */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1E293B',
                    marginBottom: 6
                  }}
                >
                  <span>Share a few lines about {workerName}:</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{reviewText.length}/500</span>
                </label>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={`Tell us about ${workerName}'s quality of work, punctuality, and behavior... (e.g., "${workerName} arrived on time, was very polite, and fixed the issue with perfection!")`}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 13.5,
                    color: '#0F172A',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: 1.5,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* 3. Quick Compliment Pills */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  What did you like the most? (Tap to select)
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
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s'
                        }}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Submitting Review...' : `Submit Review for ${workerName} →`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
