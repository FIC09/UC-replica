import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { REVIEWS } from '../data/servicesData';

export function CustomerReviewsSection() {
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
              <span>Verified Mumbai Testimonials</span>
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
          {REVIEWS.map((r) => (
            <div key={r.id} className="review-card compact">
              <div>
                {/* Top: Avatar, Name, Locality, Stars */}
                <div className="review-card-top compact">
                  <img src={r.avatar} alt={r.name} className="review-avatar compact" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="reviewer-name compact">{r.name}</span>
                      <div className="review-stars compact">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <div className="reviewer-loc compact">{r.locality}</div>
                  </div>
                </div>

                {/* Compact Truncated/Clamped Review Body */}
                <p className="review-body-text compact">
                  "{r.comment}"
                </p>
              </div>

              {/* Bottom: Service & Verified Tag */}
              <div className="review-card-footer compact">
                <span className="review-service-pill compact" title={r.service}>
                  {r.service}
                </span>
                <span className="review-verified-pill">
                  ✓ {r.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
