import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function FullHomeCleaningModal({ isOpen, onClose, onSelectOption }) {
  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const OPTIONS = [
    {
      id: 'full-home',
      name: 'Full Home/ By Room Cleaning',
      line1: 'Full Home/ By Room',
      line2: 'Cleaning',
      renderIcon: () => (
        <svg width="68" height="52" viewBox="0 0 68 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Ground base */}
          <rect x="8" y="44" width="52" height="2" rx="1" fill="#94A3B8" opacity="0.6" />
          
          {/* Main 2-story building body */}
          <rect x="14" y="16" width="40" height="28" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
          
          {/* Flat modern cantilever roof */}
          <rect x="11" y="13" width="46" height="4" rx="1.5" fill="#475569" />
          
          {/* Balcony divider line */}
          <rect x="14" y="27" width="22" height="2" fill="#94A3B8" />
          
          {/* Upper floor panoramic window */}
          <rect x="17" y="19" width="16" height="7" rx="1" fill="#93C5FD" stroke="#3B82F6" strokeWidth="0.8" />
          <line x1="25" y1="19" x2="25" y2="26" stroke="#3B82F6" strokeWidth="0.8" />
          <line x1="19" y1="21" x2="22" y2="25" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          
          {/* Right vertical warm accent wall */}
          <rect x="36" y="17" width="16" height="26" fill="#B45309" stroke="#78350F" strokeWidth="0.8" opacity="0.9" />
          <line x1="36" y1="23" x2="52" y2="23" stroke="#78350F" strokeWidth="0.5" />
          <line x1="36" y1="30" x2="52" y2="30" stroke="#78350F" strokeWidth="0.5" />
          <line x1="36" y1="37" x2="52" y2="37" stroke="#78350F" strokeWidth="0.5" />
          
          {/* Ground floor window */}
          <rect x="17" y="31" width="9" height="11" rx="1" fill="#93C5FD" stroke="#3B82F6" strokeWidth="0.8" />
          <line x1="18.5" y1="33" x2="21" y2="38" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          
          {/* Entrance Door */}
          <rect x="28" y="31" width="7" height="13" rx="1" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
          <circle cx="33.5" cy="38" r="0.8" fill="#FCD34D" />
          
          {/* Small garden bush */}
          <circle cx="12" cy="42" r="3" fill="#22C55E" />
        </svg>
      )
    },
    {
      id: 'cockroach-control',
      name: 'Cockroach Control',
      line1: 'Cockroach Control',
      line2: '',
      renderIcon: () => (
        <svg width="68" height="52" viewBox="0 0 68 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(34, 26)">
            {/* Antennae */}
            <path d="M-2 -9C-6 -15 -12 -17 -15 -18" stroke="#78350F" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M2 -9C6 -15 12 -17 15 -18" stroke="#78350F" strokeWidth="1" strokeLinecap="round" fill="none" />
            
            {/* 6 Legs */}
            <path d="M-4 -4L-9 -7L-13 -5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M4 -4L9 -7L13 -5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M-5 1L-11 1L-14 5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M5 1L11 1L14 5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M-4 6L-10 9L-12 14" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M4 6L10 9L12 14" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Cockroach Head & Shield */}
            <ellipse cx="0" cy="-7.5" rx="2.5" ry="1.8" fill="#78350F" />
            <ellipse cx="0" cy="-4.5" rx="4.5" ry="3" fill="#92400E" stroke="#78350F" strokeWidth="0.8" />
            
            {/* Cockroach Wings / Body */}
            <path d="M0 -2.5C-4.5 -0.5 -5 8 0 13C5 8 4.5 -0.5 0 -2.5Z" fill="#B45309" stroke="#78350F" strokeWidth="0.8" />
            <line x1="0" y1="-1.5" x2="0" y2="12" stroke="#78350F" strokeWidth="0.8" />
            
            {/* Red Prohibition Circle and Diagonal Slash over Cockroach */}
            <circle cx="0" cy="0" r="16.5" stroke="#DC2626" strokeWidth="2.8" fill="none" />
            <line x1="-11.5" y1="-11.5" x2="11.5" y2="11.5" stroke="#DC2626" strokeWidth="2.8" strokeLinecap="round" />
          </g>
        </svg>
      )
    }
  ];

  return (
    <div 
      className="cleaning-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Centered Modal Wrapper holding Floating Close Button & Modal Box */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: 490 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main White Modal Card */}
        <div
          className="cleaning-modal-card"
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.3)',
            width: '100%',
            padding: '28px 28px 32px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Modal Header with Title & Cancel Button on Right Side */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>
              Cleaning
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="cleaning-modal-close"
              title="Close"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                border: 'none',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E5E7EB';
                e.currentTarget.style.color = '#111827';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={20} strokeWidth={2.4} />
            </button>
          </div>

          {/* 2-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            columnGap: 16
          }}>
            {OPTIONS.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectOption(item)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  textAlign: 'center'
                }}
              >
                {/* Light Gray Rounded Tile Box */}
                <div
                  className="cleaning-tile-box"
                  style={{
                    width: '100%',
                    height: 86,
                    backgroundColor: '#F8F9FA',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    boxSizing: 'border-box',
                    transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease, box-shadow 0.18s ease',
                    border: '1px solid #F1F3F5'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.backgroundColor = '#F0F3F6';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#F1F3F5';
                  }}
                >
                  {item.renderIcon()}
                </div>

                {/* Text Label Below Tile */}
                <div style={{
                  marginTop: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#1F2937',
                  textAlign: 'center',
                  lineHeight: 1.3
                }}>
                  <div>{item.line1}</div>
                  {item.line2 && <div>{item.line2}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
