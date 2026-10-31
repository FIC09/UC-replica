import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  ShoppingCart,
  CircleUserRound,
  Check, 
  Star, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Percent, 
  X, 
  Plus, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export function NativeSmartLocksPage({
  onBackHome,
  selectedCity = 'Mumbai',
  selectedLocality = 'Bandra West',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailLock, setSelectedDetailLock] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Exact 3 Smart Lock Models matching Urban Company Screenshots 2 & 3
  const LOCK_MODELS = [
    {
      id: 'native-lock-pro',
      title: 'Native Lock Pro',
      rating: '4.80',
      reviews: '22K reviews',
      price: 15000,
      originalPrice: 18999,
      offerPrice: 13500,
      offerBanner: 'Get it at ₹13,500',
      optionsText: '2 options',
      bullets: [
        '7 ways to unlock',
        'Unlock request with visitor photo on every doorbell press'
      ],
      image: '/images/native_smart_lock.jpg',
      description: 'Comprehensive 7-in-1 smart lock with built-in wide-angle HD camera doorbell, visitor snapshot alert, instant app unlock, and anti-tamper alarm.',
      features: [
        'Built-in HD camera doorbell with two-way audio',
        'Visitor photo sent straight to your phone',
        '7 Unlocking modes: Fingerprint, Passcode, App, RFID, OTP, Key & Bluetooth',
        'Bank-grade AES 128-bit encryption',
        'Free doorstep installation by UC certified master carpenter',
        '2-Year on-site replacement warranty'
      ]
    },
    {
      id: 'native-lock-ultra',
      title: 'Native Lock Ultra',
      rating: '4.67',
      reviews: '2K reviews',
      price: 22499,
      originalPrice: 26999,
      offerPrice: 20499,
      offerBanner: 'Get it at ₹20,499',
      optionsText: '2 options',
      hasFaceScanIcon: true,
      bullets: [
        '9 ways to unlock including face unlock',
        'Unlock request with visitor photo on every doorbell press'
      ],
      image: '/images/native_smart_lock_fill.jpg',
      description: 'Flagship smart lock with 3D Structured Light Facial Recognition. Touchless instant unlocking as you approach the door, even in pitch dark.',
      features: [
        '3D Structured Light Face Unlock (0.4 sec recognition)',
        'Built-in HD video doorbell with live streaming',
        '9 Unlocking modes including Face, Palm, Fingerprint & App',
        'Lithium-ion rechargeable battery with 8-month standby',
        'Free VIP installation & 3-year doorstep replacement guarantee'
      ]
    },
    {
      id: 'native-lock-s',
      title: 'Native Lock S',
      rating: '4.68',
      reviews: '2K reviews',
      price: 8999,
      originalPrice: 11999,
      offerPrice: 8999,
      offerBanner: null,
      optionsText: null,
      bullets: [
        '5 ways to unlock',
        'Install on any door & go keyless'
      ],
      image: '/images/native_lock_s.jpg',
      description: 'Ultra-sleek, minimalist smart lock designed to fit on any wooden or metal door without changing existing handles. 100% keyless convenience.',
      features: [
        '5 Unlocking modes: Fast Biometric Fingerprint, Backlit PIN, RFID, App & Mechanical Key',
        'Fits on any door (30mm - 70mm thickness)',
        'Anti-peep fake PIN protection to keep password secret',
        'Free doorstep installation within 2 hours'
      ]
    }
  ];

  // Filter models based on search
  const filteredLocks = LOCK_MODELS.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.bullets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cart calculations
  const cartItems = Object.values(cart);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'inherit' }}>
      {/* 1. Exact Header Bar matching Screenshot */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #F1F5F9',
        padding: '12px 24px'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20
        }}>
          {/* Left: Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div 
              onClick={onBackHome}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                cursor: 'pointer' 
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: -0.5
              }}>
                UC
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: -0.4, color: '#0F172A' }}>
                  Urban
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: -0.3, color: '#0F172A' }}>
                  Company
                </div>
              </div>
            </div>
          </div>

          {/* Center: Location dropdown + Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 620 }}>
            {/* Location Pill */}
            <div
              onClick={onOpenLocationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                whiteSpace: 'nowrap'
              }}
              title="Change Delivery Location"
            >
              <MapPin size={15} color="#64748B" />
              <span style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                4744+HMQ, {selectedLocality}
              </span>
              <ChevronDown size={14} color="#64748B" />
            </div>

            {/* Search Input Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              flex: 1
            }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in Native Smart Locks"
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  width: '100%',
                  fontSize: 13,
                  color: '#1E293B',
                  fontWeight: 500
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Cart & User Account (Matches Screenshot) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              title="View Cart"
            >
              <ShoppingCart size={19} color="#111827" strokeWidth={1.8} />
              {totalCartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 800,
                  minWidth: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '2px solid #FFFFFF'
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile button */}
            <div style={{
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }} title="User Account">
              <CircleUserRound size={26} color="#111827" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Top Hero Section with Video Showcase Banner (Matches Screenshot 1 exactly) */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 32,
          alignItems: 'start'
        }}>
          {/* Left Title & Action Button */}
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 12px 0',
              lineHeight: 1.15,
              letterSpacing: '-0.5px'
            }}>
              Native Smart<br />Locks
            </h1>

            {/* Rating badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 24,
              fontSize: 14,
              fontWeight: 600,
              color: '#475569'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                fontSize: 10
              }}>
                ★
              </span>
              <span style={{
                borderBottom: '1px dashed #94A3B8',
                cursor: 'pointer'
              }}>
                4.77 (28K bookings)
              </span>
            </div>

            {/* View Services Purple Action Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('native-locks-catalogue');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showToast('Viewing Native Smart Locks models & features');
              }}
              style={{
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '10px 22px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, transform 0.1s ease',
                boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#582BE8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6E42E5'}
            >
              View Services
            </button>
          </div>

          {/* Right: Big Showcase / Video Banner with Carousel Nav Arrows (Matches Screenshot 1) */}
          <div style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            height: 340,
            backgroundColor: '#0F172A',
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
          }}>
            <img
              src="/images/native_lock_video_banner.jpg"
              alt="Native Smart Locks Video Demonstration"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            {/* Subtle dark vignette overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.2) 100%)'
            }} />

            {/* Center Play Button Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 54,
              height: 54,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
            onClick={() => showToast('Playing Native Smart Lock 6-in-1 Unlocking Video')}
            >
              <Play size={22} fill="#0F172A" color="#0F172A" style={{ marginLeft: 3 }} />
            </div>

            {/* Left Circular Carousel Nav Arrow */}
            <button
              type="button"
              onClick={() => showToast('Previous feature video')}
              style={{
                position: 'absolute',
                top: '50%',
                left: 16,
                transform: 'translateY(-50%)',
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
            >
              <ChevronLeft size={20} color="#0F172A" strokeWidth={2.4} />
            </button>

            {/* Right Circular Carousel Nav Arrow */}
            <button
              type="button"
              onClick={() => showToast('Next feature video')}
              style={{
                position: 'absolute',
                top: '50%',
                right: 16,
                transform: 'translateY(-50%)',
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
            >
              <ChevronRight size={20} color="#0F172A" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Catalogue & Sidebar Layout (Matches Screenshots 2 & 3) */}
      <main id="native-locks-catalogue" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 36,
          alignItems: 'start'
        }}>
          {/* =========================================================
              MAIN COLUMN: FEATURE LOCK LIST (Screenshots 2 & 3)
              ========================================================= */}
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 20px 0',
              letterSpacing: '-0.4px'
            }}>
              Feature lock
            </h2>

            {/* List of Lock Models */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredLocks.map((lock, idx) => {
                const qtyInCart = cart[lock.id]?.qty || 0;

                return (
                  <div
                    key={lock.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 24,
                      padding: '28px 0',
                      borderBottom: idx !== filteredLocks.length - 1 ? '1px solid #F1F5F9' : 'none'
                    }}
                  >
                    {/* Left: Lock Info & Bullets */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0F172A',
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.3px'
                      }}>
                        {lock.title}
                      </h3>

                      {/* Rating row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 10,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#6E42E5'
                      }}>
                        <span>★</span>
                        <span style={{ borderBottom: '1px dashed #CBD5E1' }}>
                          {lock.rating} ({lock.reviews})
                        </span>
                      </div>

                      {/* Price row */}
                      <div style={{
                        fontSize: 14.5,
                        fontWeight: 800,
                        color: '#0F172A',
                        marginBottom: 12
                      }}>
                        {lock.price >= 15000 ? `Starts at ₹${lock.price.toLocaleString('en-IN')}` : `₹${lock.price.toLocaleString('en-IN')}`}
                      </div>

                      {/* Feature Bullet Points matching Screenshot */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                        {lock.bullets.map((b, bIdx) => (
                          <div
                            key={bIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8,
                              fontSize: 13,
                              color: '#475569',
                              lineHeight: 1.35
                            }}
                          >
                            <span style={{ color: '#64748B', fontSize: 14 }}>•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>

                      {/* View details link */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailLock(lock)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: '#6E42E5',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>View details</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                    {/* Right: Product Image Box with Purple Discount Banner & Add button */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: 140,
                        height: 130,
                        borderRadius: 12,
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10
                      }}>
                        {/* Purple Offer Banner at Top of Image */}
                        {lock.offerBanner && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#6E42E5',
                            color: '#FFFFFF',
                            fontSize: 9.5,
                            fontWeight: 800,
                            textAlign: 'center',
                            padding: '3px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            zIndex: 2
                          }}>
                            <Percent size={10} strokeWidth={3} />
                            <span>{lock.offerBanner}</span>
                          </div>
                        )}

                        {/* Optional 3D Face Scan overlay graphic on Ultra */}
                        {lock.hasFaceScanIcon && (
                          <div style={{
                            position: 'absolute',
                            left: 8,
                            top: 32,
                            zIndex: 3,
                            opacity: 0.85
                          }}>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 8V4H8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                              <path d="M24 8V4H20" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                              <path d="M4 20V24H8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                              <path d="M24 20V24H20" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                              <circle cx="10" cy="12" r="1.5" fill="#38BDF8" />
                              <circle cx="18" cy="12" r="1.5" fill="#38BDF8" />
                              <path d="M11 17C12 18.5 16 18.5 17 17" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        )}

                        <img
                          src={lock.image}
                          alt={lock.title}
                          style={{
                            maxWidth: '90%',
                            maxHeight: '85%',
                            objectFit: 'contain',
                            display: 'block',
                            marginTop: lock.offerBanner ? 12 : 0
                          }}
                        />
                      </div>

                      {/* Add Button or Quantity Stepper */}
                      {qtyInCart === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart({
                              id: lock.id,
                              title: lock.title,
                              price: lock.offerPrice || lock.price,
                              originalPrice: lock.originalPrice,
                              category: 'native-ro',
                              image: lock.image
                            });
                          }}
                          style={{
                            width: 110,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid #7C3AED',
                            color: '#7C3AED',
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F5F3FF';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Add
                        </button>
                      ) : (
                        <div style={{
                          width: 110,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 8px',
                          color: '#FFFFFF'
                        }}>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(lock.id, qtyInCart - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 2
                            }}
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span style={{ fontSize: 13.5, fontWeight: 800 }}>{qtyInCart}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(lock.id, qtyInCart + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 2
                            }}
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      )}

                      {/* Options subtitle below Add button */}
                      {lock.optionsText && (
                        <span style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#64748B',
                          fontWeight: 500
                        }}>
                          {lock.optionsText}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              SIDEBAR COLUMN: BANK OFFER, UC PROMISE, CART PREVIEW
              ========================================================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 1. Bank Offer Promo Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 14
                }}>
                  %
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                    Flat 10% off upto ₹1250
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    HDFC Bank Full Swipe Offer
                  </div>
                </div>
              </div>

              {/* Carousel indicator */}
              <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                <div>1/7</div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 3 }}>
                  <span style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: '#6E42E5' }} />
                  <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
                  <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
                </div>
              </div>
            </div>

            {/* 2. UC Promise Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '18px 18px 20px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0
                }}>
                  UC Promise
                </h3>

                {/* Quality Assured Rainbow / Holographic Seal */}
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #BAE6FD 0%, #E9D5FF 50%, #FBCFE8 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <Check size={14} color="#0369A1" strokeWidth={3} />
                  <span style={{ fontSize: 6.5, fontWeight: 900, color: '#0369A1', textTransform: 'uppercase', letterSpacing: -0.2 }}>
                    Assured
                  </span>
                </div>
              </div>

              {/* Bullet list of promises */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <Check size={16} color="#0F172A" strokeWidth={2.5} />
                  <span>Verified Professionals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <Check size={16} color="#0F172A" strokeWidth={2.5} />
                  <span>Hassle Free Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <Check size={16} color="#0F172A" strokeWidth={2.5} />
                  <span>Transparent Pricing</span>
                </div>
              </div>
            </div>

            {/* 3. Cart Summary Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '24px 18px',
              textAlign: 'center'
            }}>
              {totalCartCount === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Shopping Basket Vector Icon matching Screenshot */}
                  <div style={{
                    width: 72,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                    opacity: 0.8
                  }}>
                    <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 20C22 12 42 12 42 20" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                      <ellipse cx="20" cy="14" rx="4" ry="2.5" fill="#7C3AED" />
                      <circle cx="18" cy="13" r="1" fill="#FFFFFF" />
                      <path d="M16 14L13 15" stroke="#F59E0B" strokeWidth="1.2" />
                      <path d="M14 20H50L45 42H19L14 20Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" strokeLinejoin="round" />
                      <line x1="22" y1="20" x2="25" y2="42" stroke="#E2E8F0" strokeWidth="2" />
                      <line x1="32" y1="20" x2="32" y2="42" stroke="#E2E8F0" strokeWidth="2" />
                      <line x1="42" y1="20" x2="39" y2="42" stroke="#E2E8F0" strokeWidth="2" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: '#64748B', fontWeight: 600 }}>
                    No items in your cart
                  </span>
                </div>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>Cart ({totalCartCount} items)</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#6E42E5' }}>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenCheckout}
                    style={{
                      width: '100%',
                      backgroundColor: '#6E42E5',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 13.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)'
                    }}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. Detail Modal for Smart Lock Model */}
      {selectedDetailLock && (
        <div
          onClick={() => setSelectedDetailLock(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 13, 22, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              padding: 28,
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedDetailLock(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <img
                src={selectedDetailLock.image}
                alt={selectedDetailLock.title}
                style={{ width: 80, height: 80, objectFit: 'contain', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 6 }}
              />
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {selectedDetailLock.title}
                </h3>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6E42E5', marginTop: 3 }}>
                  ★ {selectedDetailLock.rating} ({selectedDetailLock.reviews})
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
                  ₹{(selectedDetailLock.offerPrice || selectedDetailLock.price).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, marginBottom: 18 }}>
              {selectedDetailLock.description}
            </p>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
              Key Features:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {selectedDetailLock.features.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <Check size={14} color="#16A34A" strokeWidth={2.5} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToCart({
                  id: selectedDetailLock.id,
                  title: selectedDetailLock.title,
                  price: selectedDetailLock.offerPrice || selectedDetailLock.price,
                  originalPrice: selectedDetailLock.originalPrice,
                  category: 'native-ro',
                  image: selectedDetailLock.image
                });
                setSelectedDetailLock(null);
                showToast(`Added ${selectedDetailLock.title} to cart!`);
              }}
              style={{
                width: '100%',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
