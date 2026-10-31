import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  ShoppingBag, 
  Check, 
  Star, 
  ChevronDown, 
  Percent, 
  X, 
  Plus, 
  Minus,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function NativeWaterPurifierPage({
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
  const [selectedDetailModel, setSelectedDetailModel] = useState(null);

  // Native Water Purifier Models matching official Urban Company screenshot
  const PURIFIER_MODELS = [
    {
      id: 'native-m1',
      title: 'Native M1',
      subtitle: 'RO + UV Multi-Stage Filtration',
      rating: '4.86',
      reviews: '162K reviews',
      price: 13499,
      originalPrice: 17499,
      offerPrice: 11799,
      offerBanner: 'Get it at ₹11,799',
      optionsText: '2 options',
      image: '/images/native_m1_purifier.jpg',
      description: 'Revolutionary water purifier with Rapid Reverse Rinse technology. Needs zero filter replacement for 2 whole years.',
      features: [
        'Needs no filter service for 2 years',
        'In-built RO + UV multi-stage filtration',
        'Smart LED ring indicator for real-time filter life',
        '8 Litre food-grade antibacterial tank',
        'Free VIP installation by UC certified master technician'
      ]
    },
    {
      id: 'native-m0',
      title: 'Native M0',
      subtitle: 'Essential RO + UV Protection',
      rating: '4.85',
      reviews: '12K reviews',
      price: 11799,
      originalPrice: 14999,
      offerPrice: 10269,
      offerBanner: 'Get it at ₹10,269',
      optionsText: '2 options',
      image: '/images/native_purifier.jpg',
      description: 'Affordable, premium water purification designed for Indian tap & tanker water with 10-stage RO filtration.',
      features: [
        'Needs no filter service for 2 years',
        'Multi-stage RO + UV purification with mineral retainer',
        'Compact wall-mount design with drip tray',
        '7.5 Litre storage capacity',
        '2-Year comprehensive warranty on all parts & filters'
      ]
    },
    {
      id: 'native-m2-copper',
      title: 'Native M2 Copper',
      subtitle: 'RO + UV + UF + Copper + Alkaline Flagship',
      rating: '4.92',
      reviews: '62K reviews',
      price: 15499,
      originalPrice: 19999,
      offerPrice: 13999,
      offerBanner: 'Get it at ₹13,999',
      optionsText: 'Alkaline + Copper',
      image: '/images/native_m1_purifier.jpg',
      description: 'Top-of-the-line water purifier with Active Copper & Alkaline infusion for optimum immunity, digestion, and pH 8.5 balance.',
      features: [
        'Needs no filter service for 2 years',
        'Active Copper & Alkaline mineral balance technology',
        'Stainless steel UV chamber & real-time TDS tracker',
        '8 Litre food grade tank',
        'Free doorstep installation & 2-year zero maintenance warranty'
      ]
    }
  ];

  // Filter models by search query
  const filteredModels = PURIFIER_MODELS.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart calculations
  const cartItems = Object.values(cart);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'inherit' }}>
      {/* 1. Header Bar matching Screenshot exactly */}
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
                placeholder="Search in Native Water Purifier"
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

          {/* Right: Cart & User Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: 6
              }}
              title="View Cart"
            >
              <ShoppingBag size={22} color="#1E293B" />
              {totalCartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: -2,
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontSize: 10.5,
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile avatar */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#334155',
              border: '1px solid #E2E8F0'
            }}>
              S
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Page 3-Column Content Layout */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px minmax(0, 1fr) 300px',
          gap: 32,
          alignItems: 'start'
        }}>
          {/* =========================================================
              COLUMN 1: LEFT HERO TITLE & VIEW SERVICES BUTTON
              ========================================================= */}
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 12px 0',
              lineHeight: 1.15,
              letterSpacing: '-0.5px'
            }}>
              Native Water<br />Purifier
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
                4.84 (321K bookings)
              </span>
            </div>

            {/* View Services Purple Action Button */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('native-models-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                showToast('Viewing Native Water Purifier models & services');
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

          {/* =========================================================
              COLUMN 2: MIDDLE MAIN CATALOGUE (MODELS LIST)
              ========================================================= */}
          <div id="native-models-section">
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 20px 0',
              letterSpacing: '-0.4px'
            }}>
              Models
            </h2>

            {/* List of Models */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredModels.map((model, idx) => {
                const qtyInCart = cart[model.id]?.qty || 0;

                return (
                  <div
                    key={model.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 24,
                      padding: '24px 0',
                      borderBottom: idx !== filteredModels.length - 1 ? '1px solid #F1F5F9' : 'none'
                    }}
                  >
                    {/* Left: Model Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: '#0F172A',
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.3px'
                      }}>
                        {model.title}
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
                        <span>{model.rating} ({model.reviews})</span>
                      </div>

                      {/* Price row */}
                      <div style={{
                        fontSize: 14.5,
                        fontWeight: 800,
                        color: '#0F172A',
                        marginBottom: 12
                      }}>
                        Starts at ₹{model.price.toLocaleString('en-IN')}
                      </div>

                      {/* View details link */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailModel(model)}
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

                    {/* Right: Product Image Box with Discount Banner & Add button */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: 125,
                        height: 120,
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
                        {/* Purple Offer Pill Banner at Top of Image */}
                        {model.offerBanner && (
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
                            <span>{model.offerBanner}</span>
                          </div>
                        )}

                        <img
                          src={model.image}
                          alt={model.title}
                          style={{
                            maxWidth: '90%',
                            maxHeight: '85%',
                            objectFit: 'contain',
                            display: 'block',
                            marginTop: model.offerBanner ? 12 : 0
                          }}
                        />
                      </div>

                      {/* Add Button or Quantity Stepper */}
                      {qtyInCart === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart({
                              id: model.id,
                              title: model.title,
                              price: model.offerPrice || model.price,
                              originalPrice: model.originalPrice,
                              category: 'native-ro',
                              image: model.image
                            });
                          }}
                          style={{
                            width: 105,
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
                          width: 105,
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
                            onClick={() => onUpdateQty(model.id, qtyInCart - 1)}
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
                            onClick={() => onUpdateQty(model.id, qtyInCart + 1)}
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
                      {model.optionsText && (
                        <span style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#64748B',
                          fontWeight: 500
                        }}>
                          {model.optionsText}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              COLUMN 3: RIGHT SIDEBAR (BANK OFFER, UC PROMISE, CART)
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
                    Flat ₹1250 off
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    HDFC Bank CC, No cost EMI
                  </div>
                </div>
              </div>

              {/* Carousel indicator */}
              <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                <div>6/9</div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 3 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
                  <span style={{ width: 8, height: 4, borderRadius: 2, backgroundColor: '#6E42E5' }} />
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

            {/* 3. Cart Preview Box */}
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
                      {/* Basket handle */}
                      <path d="M22 20C22 12 42 12 42 20" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Little purple bird/tag on top left */}
                      <ellipse cx="20" cy="14" rx="4" ry="2.5" fill="#7C3AED" />
                      <circle cx="18" cy="13" r="1" fill="#FFFFFF" />
                      <path d="M16 14L13 15" stroke="#F59E0B" strokeWidth="1.2" />
                      {/* Basket main body */}
                      <path d="M14 20H50L45 42H19L14 20Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" strokeLinejoin="round" />
                      {/* Grid slats */}
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

      {/* 3. Detail Modal for Purifier Model */}
      {selectedDetailModel && (
        <div
          onClick={() => setSelectedDetailModel(null)}
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
              onClick={() => setSelectedDetailModel(null)}
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
                src={selectedDetailModel.image}
                alt={selectedDetailModel.title}
                style={{ width: 80, height: 80, objectFit: 'contain', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 6 }}
              />
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {selectedDetailModel.title}
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
                  {selectedDetailModel.subtitle}
                </p>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>
                  ₹{(selectedDetailModel.offerPrice || selectedDetailModel.price).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, marginBottom: 18 }}>
              {selectedDetailModel.description}
            </p>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
              Key Highlights:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {selectedDetailModel.features.map((feat, idx) => (
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
                  id: selectedDetailModel.id,
                  title: selectedDetailModel.title,
                  price: selectedDetailModel.offerPrice || selectedDetailModel.price,
                  originalPrice: selectedDetailModel.originalPrice,
                  category: 'native-ro',
                  image: selectedDetailModel.image
                });
                setSelectedDetailModel(null);
                showToast(`Added ${selectedDetailModel.title} to cart!`);
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
