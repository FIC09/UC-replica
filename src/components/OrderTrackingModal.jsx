import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  UserCheck,
  Calendar
} from 'lucide-react';

export function OrderTrackingModal({ booking, onClose }) {
  const [stage, setStage] = useState(2); // 1: Confirmed, 2: Partner Assigned, 3: On The Way, 4: In Progress

  useEffect(() => {
    // Simulate real-time progress update
    const timer = setTimeout(() => {
      setStage(3);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!booking) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="tracker-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="tracker-header-badge">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
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
          <CheckCircle2 size={44} style={{ margin: '0 auto 8px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            Booking Confirmed!
          </h2>
          <p style={{ fontSize: 13, opacity: 0.9 }}>
            Order ID: <strong>{booking.id}</strong> • Total Paid: <strong>₹{booking.totalAmount}</strong>
          </p>
        </div>

        {/* Start OTP Banner */}
        <div style={{
          background: '#EFF6FF',
          borderBottom: '1px solid #BFDBFE',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: 12, color: '#1E40AF', fontWeight: 600, display: 'block' }}>
              Service Start Safety PIN
            </span>
            <span style={{ fontSize: 11.5, color: '#3B82F6' }}>
              Share with partner upon arrival
            </span>
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 4,
            background: '#1E40AF',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 8
          }}>
            4829
          </div>
        </div>

        {/* Real-time Partner Card */}
        <div className="partner-info-box">
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
            alt="Assigned Professional"
            className="partner-avatar"
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                Rajesh Sharma
              </span>
              <span style={{
                background: '#ECFDF5',
                color: '#059669',
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4
              }}>
                Verified
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4B5563', marginTop: 2 }}>
              <Star size={12} fill="#F59E0B" color="#F59E0B" />
              <strong>4.92 ★</strong>
              <span>(1,480+ jobs in Mumbai)</span>
            </div>
            <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>
              Single-use kit ready • Vaccinated
            </div>
          </div>

          <a
            href="tel:+919820000000"
            onClick={(e) => { e.preventDefault(); alert('Connecting call to Rajesh Sharma (+91 98200 00000)...'); }}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#F4F0FF',
              color: '#6E42E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Call Partner"
          >
            <Phone size={18} />
          </a>
        </div>

        {/* Live Tracking Timeline */}
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#4B5563', marginBottom: 14 }}>
            Live Service Status
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stage 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#059669',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={14} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  Booking Placed & Slot Confirmed
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {booking.slot}
                </div>
              </div>
            </div>

            {/* Stage 2 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: stage >= 2 ? '#059669' : '#E5E7EB',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <UserCheck size={14} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  Master Partner Assigned
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  Rajesh Sharma confirmed the job request
                </div>
              </div>
            </div>

            {/* Stage 3 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: stage >= 3 ? '#6E42E5' : '#E5E7EB',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: stage === 3 ? '0 0 0 4px rgba(110, 66, 229, 0.2)' : 'none'
              }}>
                <Clock size={14} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: stage >= 3 ? '#6E42E5' : '#0F172A' }}>
                  {stage >= 3 ? 'Partner On The Way 🛵' : 'Dispatched to Address'}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {stage >= 3 ? 'Estimated arrival in 18 mins at ' + booking.address.split(',')[1] : 'Partner will depart shortly'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address and items summary */}
        <div style={{
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          padding: '16px 20px',
          fontSize: 12.5,
          color: '#4B5563'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <MapPin size={14} color="#6E42E5" />
            <strong style={{ color: '#0F172A' }}>Delivery Address:</strong>
          </div>
          <div style={{ paddingLeft: 20 }}>{booking.address}</div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            className="proceed-checkout-btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Done & Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
