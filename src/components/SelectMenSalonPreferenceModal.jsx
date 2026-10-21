import React from 'react';
import { ArrowLeft, ChevronRight, X, Star } from 'lucide-react';

export function SelectMenSalonPreferenceModal({
  isOpen,
  onClose,
  onSelectPreference
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(3px)'
      }}
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: 20,
          padding: '24px 24px 28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeInUp 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating circular close button outside above top-right or inside top-right */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: -44,
            right: 0,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: '#1F2937'
          }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              cursor: 'pointer',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#111827',
            marginBottom: 20,
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          Select your preference
        </h2>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* OPTION 1: ROYALE */}
          <div
            onClick={() => {
              onSelectPreference('royale');
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 14,
              border: '1.5px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7C3AED';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Stylist Thumbnail with Badge */}
            <div
              style={{
                position: 'relative',
                width: 82,
                height: 94,
                borderRadius: 10,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#F3F4F6',
                border: '1px solid #F1F5F9'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  background: '#B45309',
                  color: '#FFFFFF',
                  fontSize: 9,
                  fontWeight: 800,
                  padding: '3px 0',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  letterSpacing: '0.02em',
                  zIndex: 2
                }}
              >
                <Star size={9} fill="#FFFFFF" strokeWidth={0} />
                <span>Top rated pros</span>
              </div>
              <img
                src="/images/men_stylist_royale.jpg"
                alt="Royale Stylist"
                onError={(e) => {
                  e.target.src = '/images/men_royale_card_pro.jpg';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  paddingTop: 16
                }}
              />
            </div>

            {/* Info details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Royale</span>
                <ChevronRight size={18} color="#9CA3AF" />
              </div>

              {/* Brand Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {['INOA', 'REPÊCHAG', 'O3+'].map((brand) => (
                  <span
                    key={brand}
                    style={{
                      background: '#F3F4F6',
                      color: '#4B5563',
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                      letterSpacing: '0.03em'
                    }}
                  >
                    {brand}
                  </span>
                ))}
              </div>

              {/* Subtitle */}
              <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', lineHeight: 1.35 }}>
                <strong style={{ color: '#111827', fontWeight: 600 }}>Starts at ₹449</strong> Only top professionals for advanced cuts, beard styling & facials.
              </p>
            </div>
          </div>

          {/* OPTION 2: PRIME */}
          <div
            onClick={() => {
              onSelectPreference('prime');
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 14,
              border: '1.5px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.18s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7C3AED';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(124, 58, 237, 0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Stylist Thumbnail */}
            <div
              style={{
                position: 'relative',
                width: 82,
                height: 94,
                borderRadius: 10,
                overflow: 'hidden',
                flexShrink: 0,
                background: '#F3F4F6',
                border: '1px solid #F1F5F9'
              }}
            >
              <img
                src="/images/men_stylist_prime.jpg"
                alt="Prime Stylist"
                onError={(e) => {
                  e.target.src = '/images/men_prime_card_pro.jpg';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Info details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Prime</span>
                <ChevronRight size={18} color="#9CA3AF" />
              </div>

              {/* Brand Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {["L'ORÉAL", "BOMBAY SHAVING COMPANY"].map((brand) => (
                  <span
                    key={brand}
                    style={{
                      background: '#F3F4F6',
                      color: '#4B5563',
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                      letterSpacing: '0.03em'
                    }}
                  >
                    {brand}
                  </span>
                ))}
              </div>

              {/* Subtitle */}
              <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', lineHeight: 1.35 }}>
                <strong style={{ color: '#111827', fontWeight: 600 }}>Starts at ₹249</strong> Everyday cuts, color & cleanup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
