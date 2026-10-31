import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  ShoppingBag, 
  Star, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ArrowRight, 
  Zap, 
  X,
  ChevronRight,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  Award
} from 'lucide-react';

export function ElectricianServicePage({
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
  const [activeSection, setActiveSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  const SECTIONS = [
    { id: 'all', title: 'All Electrical Services' },
    { id: 'fans', title: 'Ceiling & Exhaust Fans' },
    { id: 'switches', title: 'Switchboards & Sockets' },
    { id: 'lighting', title: 'Lights, Batten & Bulbs' },
    { id: 'wiring', title: 'Wiring, MCB & Fuse' },
    { id: 'inverter', title: 'Inverter & Battery Setup' }
  ];

  const PRODUCTS = [
    {
      id: 'fan-install-repair',
      sectionId: 'fans',
      title: 'Ceiling Fan Installation / Replacement',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.85',
      reviewsCount: '315K reviews',
      price: 149,
      originalPrice: 249,
      duration: '25 mins',
      badge: 'INSTANT SERVICE',
      tag: 'Verified Electrician',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
      description: 'Safe ceiling fan assembly, hook mounting, capacitor check, and blade balancing with zero wobble.',
      inclusions: [
        'Dismantling old fan if replacement needed',
        'Blade balancing and silent rotation check',
        'Regulator switch speed test',
        'Insulation tape and safety bolt tightening'
      ],
      exclusions: ['New fan unit or additional hook anchor fabrication']
    },
    {
      id: 'fan-repair',
      sectionId: 'fans',
      title: 'Ceiling & Exhaust Fan Repair',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.80',
      reviewsCount: '142K reviews',
      price: 149,
      originalPrice: 229,
      duration: '30 mins',
      badge: 'QUICK FIX',
      tag: 'Verified Electrician',
      image: '/images/fan_repair.jpg',
      description: 'Diagnose noise, slow speeds, coil heating, or replace faulty capacitor with genuine parts.',
      inclusions: [
        'Capacitor check & replacement',
        'Bearing oiling & noise reduction',
        'Blade realignment'
      ],
      exclusions: ['Motor rewinding if coil burnt out']
    },
    {
      id: 'switchboard-repair',
      sectionId: 'switches',
      title: 'Switchboard Repair & Socket Replacement',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.80',
      reviewsCount: '194K reviews',
      price: 99,
      originalPrice: 199,
      duration: '20 mins',
      badge: 'SUPER SAVER',
      tag: 'Safety Tested',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      description: 'Fix sparking switches, burnt sockets, loose wiring, or install new modular switch plates.',
      inclusions: [
        'Multi-meter circuit continuity test',
        'Safe wire crimping and earthing check',
        'Replacement of damaged switch/socket unit'
      ],
      exclusions: ['Cost of new modular switches if needed']
    },
    {
      id: 'tubelight-install',
      sectionId: 'lighting',
      title: 'Tubelight & Batten LED Installation',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.86',
      reviewsCount: '98K reviews',
      price: 119,
      originalPrice: 199,
      duration: '20 mins',
      badge: 'SAME DAY',
      tag: 'Verified Electrician',
      image: '/images/tubelight.jpg',
      description: 'Safe mounting and wiring of LED batten lights, conventional tubelights, and chokes.',
      inclusions: [
        'Wall clip drilling & mounting',
        'Safe wiring connection with wire caps',
        'Illumination & choke test'
      ],
      exclusions: ['Cost of LED tubelight unit']
    },
    {
      id: 'bulb-installation',
      sectionId: 'lighting',
      title: 'Bulb & Spot Light Installation',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.84',
      reviewsCount: '87K reviews',
      price: 49,
      originalPrice: 99,
      duration: '15 mins',
      badge: 'SUPER SAVER',
      tag: 'Safety Tested',
      image: '/images/bulb_install.jpg',
      description: 'Quick installation or replacement of ceiling bulbs, track lights, and spotlight fixtures.',
      inclusions: [
        'Holder connection check',
        'Safe step-ladder assistance',
        'Illumination verification'
      ],
      exclusions: ['Cost of new bulb / spotlight fixture']
    },
    {
      id: 'internal-wiring',
      sectionId: 'wiring',
      title: 'New Internal Wiring & Safety Conduit Pull',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.73',
      reviewsCount: '45K reviews',
      price: 199,
      originalPrice: 299,
      duration: '45 mins',
      badge: 'FIRE SAFE',
      tag: 'Certified Wireman',
      image: '/images/internal_wiring.jpg',
      description: 'FR/FRLS insulated wire pulling through PVC conduits, junction boxes, and distribution panels.',
      inclusions: [
        'Conduit wire pulling (up to 5 meters)',
        'Terminal crimping & insulation tape wrap',
        'Circuit continuity test'
      ],
      exclusions: ['Wall groove cutting / channelling if needed']
    },
    {
      id: 'mcb-fuse-repair',
      sectionId: 'wiring',
      title: 'MCB Fuse Replacement & Tripping Fix',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.88',
      reviewsCount: '68K reviews',
      price: 149,
      originalPrice: 249,
      duration: '30 mins',
      badge: 'SAFETY CERTIFIED',
      tag: 'Certified Wireman',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      description: 'Fix frequent MCB tripping, replace burnt circuit breakers, and balance household electrical phase load.',
      inclusions: [
        'Single / Double pole MCB replacement',
        'Terminal torque tightening',
        'Short circuit load testing'
      ],
      exclusions: ['Cost of new MCB unit']
    },
    {
      id: 'inverter-service',
      sectionId: 'inverter',
      title: 'Inverter & Battery Terminal Servicing',
      category: 'quick-repairs',
      subcategory: 'Electrician',
      rating: '4.82',
      reviewsCount: '54K reviews',
      price: 249,
      originalPrice: 399,
      duration: '35 mins',
      badge: 'BACKUP POWER',
      tag: 'Power Specialist',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
      description: 'Complete home inverter checkup, battery distilled water top-up, lead terminal desulfation, and voltage regulation.',
      inclusions: [
        'Acid terminal cleaning & petroleum jelly coat',
        'Distilled water top up (up to 6 cells)',
        'Backup output voltage check'
      ],
      exclusions: ['Cost of distilled water if not supplied by customer', 'Battery replacement']
    }
  ];

  // Filtered by section & search
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchSection = activeSection === 'all' || p.sectionId === activeSection;
      const matchQuery = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchQuery;
    });
  }, [activeSection, searchQuery]);

  const cartValues = Object.values(cart || {}).filter(item => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return q > 0;
  });
  const cartItemsCount = cartValues.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return sum + q;
  }, 0);
  const cartTotalAmount = cartValues.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return sum + ((item.price || 0) * q);
  }, 0);

  return (
    <div className="electrician-page-wrapper" style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#0F172A'
    }}>
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <h1 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: -0.3
                }}>
                  Electrician Services
                </h1>
                <span style={{
                  background: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #A7F3D0',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Zap size={11} fill="#10B981" color="#10B981" />
                  <span>Arriving in ~71 mins</span>
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Certified Electricians • 30-Day Warranty • Background Verified
              </div>
            </div>
          </div>

          {/* Location & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={onOpenLocationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <MapPin size={14} color="#6E42E5" />
              <span>{selectedLocality}, {selectedCity}</span>
            </button>

            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 11 }} />
              <input
                type="text"
                placeholder="Search electrical..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  fontSize: 12.5,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="button"
              onClick={onOpenCart}
              style={{
                position: 'relative',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 10,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={18} color="#0F172A" />
              {cartItemsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. MAIN 2-COLUMN BODY */}
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '24px 20px 80px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 28,
        alignItems: 'start'
      }}>
        {/* LEFT STICKY SIDEBAR */}
        <aside style={{
          position: 'sticky',
          top: 80,
          background: '#F8FAFC',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #E2E8F0'
        }}>
          <h4 style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: '#64748B',
            margin: '0 0 12px 6px'
          }}>
            Categories
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTIONS.map(sec => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: isActive ? '#6E42E5' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#334155',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{sec.title}</span>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>

          <div style={{
            marginTop: 20,
            padding: 12,
            background: '#ECFDF5',
            borderRadius: 10,
            border: '1px solid #A7F3D0',
            fontSize: 11.5,
            color: '#065F46'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <ShieldCheck size={14} />
              <span>UC Electrician Cover</span>
            </div>
            30-day service warranty on all capacitor, switchboard &amp; fan repairs.
          </div>
        </aside>

        {/* RIGHT CATALOGUE GRID */}
        <main>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A' }}>
              {SECTIONS.find(s => s.id === activeSection)?.title || 'All Electrical Services'}
            </h2>
            <span style={{ fontSize: 12.5, color: '#64748B' }}>
              {filteredProducts.length} verified products
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredProducts.map(product => {
              const qtyInCart = cart[product.id]?.qty || 0;
              return (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    gap: 18,
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    padding: 18,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* Left Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {product.badge && (
                        <span style={{
                          background: '#F5F3FF',
                          color: '#6E42E5',
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          {product.badge}
                        </span>
                      )}
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#D97706'
                      }}>
                        <Star size={12} fill="#F59E0B" color="#F59E0B" />
                        <span>{product.rating}</span>
                        <span style={{ color: '#94A3B8', fontWeight: 500 }}>({product.reviewsCount})</span>
                      </span>
                    </div>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedDetailProduct(product)}
                    >
                      {product.title}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through' }}>
                          ₹{product.originalPrice}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#64748B' }}>• {product.duration}</span>
                    </div>

                    <p style={{
                      fontSize: 13,
                      color: '#475569',
                      lineHeight: 1.45,
                      margin: '0 0 10px'
                    }}>
                      {product.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedDetailProduct(product)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6E42E5',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View details &amp; inclusions →
                    </button>
                  </div>

                  {/* Right Image & Add Button */}
                  <div style={{
                    width: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0
                  }}>
                    <div style={{
                      width: 140,
                      height: 110,
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#F1F5F9'
                    }}>
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {qtyInCart > 0 ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#6E42E5',
                        color: '#FFFFFF',
                        borderRadius: 10,
                        padding: '6px 14px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQty(product.id, -1);
                            showToast(`Removed 1 "${product.title}"`);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                        >
                          <Minus size={15} strokeWidth={2.5} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{qtyInCart}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateQty(product.id, 1);
                            showToast(`Added 1 "${product.title}"`);
                          }}
                          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                        >
                          <Plus size={15} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(product);
                          showToast(`🛒 Added "${product.title}" to cart`);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 0',
                          borderRadius: 10,
                          background: '#FFFFFF',
                          color: '#6E42E5',
                          border: '1.5px solid #6E42E5',
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* 3. PRODUCT DETAILS POPUP */}
      {selectedDetailProduct && (
        <div 
          onClick={() => setSelectedDetailProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 500,
              width: '100%',
              padding: '24px 26px',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedDetailProduct(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#F1F5F9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
              {selectedDetailProduct.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', marginBottom: 14 }}>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {selectedDetailProduct.rating}</span>
              <span>•</span>
              <span>{selectedDetailProduct.duration}</span>
              <span>•</span>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{selectedDetailProduct.price}</span>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              {selectedDetailProduct.description}
            </p>

            {selectedDetailProduct.inclusions && (
              <div style={{ marginBottom: 16 }}>
                <h5 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#065F46', margin: '0 0 8px' }}>
                  ✓ Included
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailProduct.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#334155' }}>
                      <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onAddToCart(selectedDetailProduct);
                setSelectedDetailProduct(null);
                showToast(`🛒 Added "${selectedDetailProduct.title}" to cart`);
              }}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 12,
                background: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Add to Cart • ₹{selectedDetailProduct.price}
            </button>
          </div>
        </div>
      )}

      {/* 4. STICKY BOTTOM BAR */}
      {cartItemsCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 16,
          padding: '12px 20px',
          boxShadow: '0 12px 35px rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          width: '90%',
          maxWidth: 720
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              {cartItemsCount} {cartItemsCount === 1 ? 'service' : 'services'} added • ₹{cartTotalAmount}
            </div>
            <div style={{ fontSize: 11, color: '#A7F3D0' }}>
              Auto-coupon ₹100 saving applied at checkout
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            style={{
              background: '#5E3BEE',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>View Cart</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
export default ElectricianServicePage;
