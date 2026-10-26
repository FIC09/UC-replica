import React from 'react';
import { Check, ArrowRight, Award } from 'lucide-react';

export function NativeSpotlightSection({ onExploreNative }) {
  return (
    <section style={{
      padding: '20px 0',
      background: 'transparent'
    }}>
      <div className="container-custom">
        <div style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #1e1b4b 100%)',
          borderRadius: 16,
          border: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          padding: '22px 28px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.35fr 1fr',
            gap: 28,
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              {/* Award Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(251, 191, 36, 0.12)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                padding: '4px 11px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800,
                color: '#FBBF24',
                marginBottom: 10,
                letterSpacing: 0.3
              }}>
                <Award size={13} />
                <span>RED DOT DESIGN AWARD WINNER</span>
              </div>

              {/* Compact Title */}
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 23,
                fontWeight: 800,
                letterSpacing: -0.5,
                lineHeight: 1.25,
                margin: '0 0 6px 0'
              }}>
                Meet Native by UC.{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Needs no filter change for 2 years.
                </span>
              </h3>

              {/* Concise Subtitle */}
              <p style={{
                fontSize: 13,
                color: '#CBD5E1',
                lineHeight: 1.45,
                margin: '0 0 14px 0',
                maxWidth: 520
              }}>
                Rapid Reverse Rinse tech eliminates frequent servicing. Pure mineral water infused with Copper & Alkaline minerals.
              </p>

              {/* Compact 4 Features Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '8px 16px',
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: '#6E42E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>
                    Zero filter cost for 2 yrs
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: '#6E42E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>
                    10-Stage RO+UV+Copper
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: '#6E42E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>
                    Smart IoT Filter display
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: '#6E42E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>
                    Free VIP installation in 2 hrs
                  </span>
                </div>
              </div>

              {/* Compact CTA Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={onExploreNative}
                  style={{
                    background: 'linear-gradient(135deg, #6E42E5 0%, #8B5CF6 100%)',
                    color: '#fff',
                    padding: '8px 20px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(110, 66, 229, 0.4)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span>View Native Purifiers</span>
                  <ArrowRight size={14} />
                </button>

                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  Starts at <strong style={{ color: '#F1F5F9' }}>₹13,499</strong> (Includes 2-Yr Warranty)
                </span>
              </div>
            </div>

            {/* Right Visual Image */}
            <div style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              height: 190
            }}>
              <img
                src="/images/native_purifier.jpg"
                alt="Native Water Purifier"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                right: 10,
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                borderRadius: 8,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F8FAFC' }}>Native M2 Copper RO</div>
                  <div style={{ fontSize: 10.5, color: '#94A3B8' }}>Rated 4.92 ★ by 62K Indian homes</div>
                </div>
                <span style={{
                  background: '#059669',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6
                }}>
                  In Stock in Mumbai
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
