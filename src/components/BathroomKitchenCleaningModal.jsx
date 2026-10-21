import React, { useEffect } from 'react';
import { X, ArrowLeft, Share2 } from 'lucide-react';

export function BathroomKitchenCleaningModal({ isOpen, onClose, onSelectOption }) {
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

  function handleShare(e) {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Bathroom & Kitchen Cleaning - Urban Company',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  // Cleaning Options: Single Bathroom Visit and Kitchen cleaning
  const CLEANING_OPTIONS = [
    {
      id: 'single-bathroom',
      title: 'Single Bathroom Visit',
      subtitle: 'One-time deep cleaning',
      priceText: 'Starts at ₹419/service',
      type: 'toilet-svg'
    },
    {
      id: 'kitchen-cleaning',
      title: 'Kitchen cleaning',
      subtitle: 'For one time kitchen deep cleaning needs',
      priceText: 'Starting at ₹799',
      type: 'image',
      image: '/images/kitchen_stove_clean.jpg'
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
      {/* Centered Modal Wrapper holding Floating Close Button & Modal Card */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: 480 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main White Modal Card */}
        <div
          className="cleaning-modal"
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.3)',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            paddingBottom: 8
          }}
        >
          {/* Header Bar matching Screenshot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 22px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#111827',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2
                }}
                title="Back"
              >
                <ArrowLeft size={20} strokeWidth={2.2} />
              </button>
              <h2 style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: -0.3
              }}>
                Bathroom &amp; Kitchen cleaning
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 6,
                  borderRadius: '50%',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.color = '#0F172A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748B';
                }}
                title="Share"
              >
                <Share2 size={18} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="cleaning-modal-close"
                title="Close"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
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
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Options List */}
          <div style={{ padding: '6px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CLEANING_OPTIONS.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectOption(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '8px 10px',
                  borderRadius: 18,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, transform 0.1s ease',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Left Visual Box */}
                <div style={{
                  width: 96,
                  height: 96,
                  borderRadius: 18,
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  {item.type === 'toilet-svg' ? (
                    /* Minimalist Illustrated Toilet with Left Sparkle matching Screenshot 1:1 */
                    <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Left Subtle Gold Sparkle */}
                      <span style={{ 
                        position: 'absolute', 
                        top: 26, 
                        left: 4, 
                        color: '#F59E0B', 
                        fontSize: 13, 
                        fontWeight: 900,
                        lineHeight: 1
                      }}>
                        ✦
                      </span>

                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Water Tank */}
                        <rect x="22" y="8" width="18" height="17" rx="3" fill="#BFDBFE" />
                        {/* Flush Button */}
                        <circle cx="31" cy="12" r="1.8" fill="#FFFFFF" />
                        {/* Toilet Seat & Lid Rim */}
                        <ellipse cx="31" cy="27" rx="13" ry="4" fill="#93C5FD" />
                        {/* Bowl Front */}
                        <path d="M18 27C18 36 24 41 31 41C38 41 44 36 44 27H18Z" fill="#DBEAFE" />
                        {/* Base Foot */}
                        <path d="M25 41V47H37V41" fill="#BFDBFE" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  )}
                </div>

                {/* Right Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 4px 0',
                    letterSpacing: -0.3
                  }}>
                    {item.title}
                  </h3>

                  <p style={{
                    fontSize: 13.5,
                    color: '#64748B',
                    margin: '0 0 6px 0',
                    lineHeight: 1.35
                  }}>
                    {item.subtitle}
                  </p>

                  <div style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#1E293B'
                  }}>
                    {item.priceText}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
