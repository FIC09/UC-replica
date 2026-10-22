import React, { useState, useEffect } from 'react';
import { professionalClient } from '../professionalClient';

export function ReviewsView() {
  const [starFilter, setStarFilter] = useState('ALL');
  const [reviewsData, setReviewsData] = useState({
    averageRating: 4.94,
    totalReviews: 1520,
    breakdown: { '5': 94, '4': 5, '3': 1, '2': 0, '1': 0 },
    reviews: [
      {
        id: 'REV-101',
        customer: 'Rohan Kapoor',
        rating: 5,
        date: 'Today, 03:15 PM',
        service: 'Powerjet AC Servicing (Split)',
        comment: 'Outstanding job by Vikram! AC is cooling like brand new. He carried proper waterproof drop sheets, foam blasted the indoor coils, and explained the refrigerant pressure readings. Very professional.',
        verified: true
      },
      {
        id: 'REV-102',
        customer: 'Pooja Bhatia',
        rating: 5,
        date: '21 Oct 2026',
        service: 'AC Foam Jet Deep Cleaning',
        comment: 'Punctual, polite, and very methodical. Cleaned up the floor completely before leaving. Highly recommend Vikram for any AC servicing.',
        verified: true
      },
      {
        id: 'REV-103',
        customer: 'Karan Mehra',
        rating: 5,
        date: '19 Oct 2026',
        service: 'Inverter AC PCB Diagnosis',
        comment: 'Fixed an inverter tripping issue that two other local technicians could not diagnose. Saved me the cost of buying a new AC. Excellent technical knowledge!',
        verified: true
      },
      {
        id: 'REV-104',
        customer: 'Meera Sen',
        rating: 4,
        date: '17 Oct 2026',
        service: 'AC Gas Leak Check & R32 Top-Up',
        comment: 'Very good work and timely completion. Cooling restored immediately.',
        verified: true
      }
    ]
  });

  useEffect(() => {
    professionalClient.getReviews().then(data => {
      if (data.success && data.reviews) {
        setReviewsData(prev => ({ ...prev, ...data }));
      }
    }).catch(() => {});
  }, []);

  const filteredReviews = reviewsData.reviews.filter(r => {
    if (starFilter === 'ALL') return true;
    return String(r.rating) === starFilter;
  });

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Customer Ratings & Reviews
        </h1>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Real feedback from homeowners serviced across Mumbai
        </div>
      </div>

      {/* Hero Rating Scorecard */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: '28px 32px',
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
          <div style={{ fontSize: 52, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
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
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            marginTop: 8
          }}>
            Top 1% Rated Pro
          </div>
        </div>

        {/* Right Star Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[5, 4, 3, 2, 1].map(stars => {
            const pct = reviewsData.breakdown[String(stars)] || 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{ width: 45, fontWeight: 600, color: '#475569' }}>{stars} Star</span>
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
        {filteredReviews.map(r => (
          <div
            key={r.id}
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '20px 24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14
                }}>
                  {r.customer.split(' ').map(n => n[0]).join('')}
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

              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#f59e0b', fontSize: 15, fontWeight: 700 }}>
                  {'★'.repeat(r.rating)}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: 15 }}>
                  {'★'.repeat(5 - r.rating)}
                </span>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.5, margin: '8px 0 0 0' }}>
              "{r.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
