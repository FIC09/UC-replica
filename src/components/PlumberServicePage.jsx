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
  Droplet, 
  X,
  ChevronRight,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  Award
} from 'lucide-react';

export function PlumberServicePage({
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
    { id: 'all', title: 'All Plumbing Services' },
    { id: 'taps', title: 'Taps, Mixers & Showers' },
    { id: 'toilet', title: 'Toilet & Flush Tank' },
    { id: 'drain', title: 'Drain & Basin Blockages' },
    { id: 'hose', title: 'Hose & Pipe Connections' },
    { id: 'tank', title: 'Water Tank Deep Cleaning' }
  ];

  const PRODUCTS = [
    {
      id: 'tap-repair-replacement',
      sectionId: 'taps',
      title: 'Water Tap Repair & Mixer Leak Fix',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.83',
      reviewsCount: '240K reviews',
      price: 149,
      originalPrice: 249,
      duration: '30 mins',
      badge: 'LEAK PROOF',
      tag: 'Experienced Plumber',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
      description: 'Stop dripping faucets, replace faulty ceramic cartridges, Teflon sealing, and pressure adjustments.',
      inclusions: [
        'Washer or ceramic spindle replacement',
        'Teflon tape re-threading to stop wall seepage',
        'Aerator descaling to restore water flow'
      ],
      exclusions: ['Cost of new brass tap/mixer unit']
    },
    {
      id: 'flush-tank-repair',
      sectionId: 'toilet',
      title: 'Toilet Flush Tank Repair & Ball Valve Fix',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.75',
      reviewsCount: '112K reviews',
      price: 149,
      originalPrice: 249,
      duration: '30 mins',
      badge: 'NO OVERFLOW',
      tag: 'Master Plumber',
      image: '/images/flush_tank.jpg',
      description: 'Stop continuous water running, fix push button, float valve, syphon kit, or inlet valve leakage.',
      inclusions: [
        'Syphon mechanism adjustment',
        'Ball valve float calibration',
        'Washer leak check'
      ],
      exclusions: ['Cost of new internal syphon kit if cracked']
    },
    {
      id: 'drain-blockage',
      sectionId: 'drain',
      title: 'Drain & Basin Blockage Removal',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.77',
      reviewsCount: '168K reviews',
      price: 199,
      originalPrice: 349,
      duration: '35 mins',
      badge: 'RAPID CLEAR',
      tag: 'Specialist Tools',
      image: '/images/drain_blockage.jpg',
      description: 'Heavy duty auger snake clearing for clogged kitchen sinks, wash basins, or bathroom floor traps.',
      inclusions: [
        'Mechanical auger clearing',
        'P-trap dismantling & sludge cleanout',
        'High-flow drain test'
      ],
      exclusions: ['Main sewer line blockage outside home premises']
    },
    {
      id: 'wash-basin-leakage',
      sectionId: 'drain',
      title: 'Wash Basin Leakage & Waste Pipe Repair',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.78',
      reviewsCount: '92K reviews',
      price: 129,
      originalPrice: 219,
      duration: '25 mins',
      badge: 'ZERO LEAK',
      tag: 'Master Plumber',
      image: '/images/wash_basin.jpg',
      description: 'Fix dripping bottle traps, replace broken corrugated waste pipes, and reseal silicone edges.',
      inclusions: [
        'Waste coupling tightening',
        'Teflon threading & silicone sealing',
        'Water flow test'
      ],
      exclusions: ['Cost of replacement ceramic basin']
    },
    {
      id: 'connection-hose',
      sectionId: 'hose',
      title: 'Connection Hose & Angle Valve Replacement',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.78',
      reviewsCount: '76K reviews',
      price: 129,
      originalPrice: 199,
      duration: '20 mins',
      badge: 'HIGH PRESSURE',
      tag: 'Certified Plumber',
      image: '/images/connection_hose.jpg',
      description: 'Install stainless steel braided connection pipe for geysers, toilet health faucets, or basins.',
      inclusions: [
        'Thread sealing with premium Teflon',
        'Pressure seal testing',
        'Old hose removal'
      ],
      exclusions: ['Cost of new SS braided hose or angle valve']
    },
    {
      id: 'shower-install-repair',
      sectionId: 'taps',
      title: 'Shower Head Installation & Descaling',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.81',
      reviewsCount: '83K reviews',
      price: 119,
      originalPrice: 199,
      duration: '25 mins',
      badge: 'HIGH FLOW',
      tag: 'Certified Plumber',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
      description: 'Install new rainfall or handheld shower head, fix loose shower arms, and descale clogged nozzles for maximum spray.',
      inclusions: [
        'Shower arm mounting and Teflon thread seal',
        'Silicone ring replacement',
        'Water spray balance test'
      ],
      exclusions: ['Cost of new shower head unit']
    },
    {
      id: 'water-tank-cleaning',
      sectionId: 'tank',
      title: 'Overhead Water Tank Deep Cleaning (up to 1000L)',
      category: 'quick-repairs',
      subcategory: 'Plumber',
      rating: '4.89',
      reviewsCount: '47K reviews',
      price: 699,
      originalPrice: 999,
      duration: '60 mins',
      badge: 'GERM FREE',
      tag: 'Hygienic Pro',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
      description: '6-stage deep cleaning of rooftop plastic or concrete water tank: sludge de-watering, high-pressure jetting, vacuuming, and UV antibacterial treatment.',
      inclusions: [
        'Sludge & sediment pump evacuation',
        'Anti-algae scrubbing',
        'UV lamp disinfection scan'
      ],
      exclusions: ['Water distribution pipe flushing inside flat walls']
    }
  ];

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
    <div className="plumber-page-wrapper" style={{
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
          {/* Back & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              title="Return to home"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: 10,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1E293B'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💧</span>
                <h1 style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: -0.3
                }}>
                  Plumbing Services
                </h1>
                <span style={{
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Droplet size={11} fill="#2563EB" color="#2563EB" />
                  <span>Arriving in ~45 mins • Leak Proof</span>
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Certified Master Plumbers • 30-Day Leak Warranty • Genuine Fittings
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
              <MapPin size={14} color="#2563EB" />
              <span>{selectedLocality}, {selectedCity}</span>
            </button>

            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 11 }} />
              <input
                type="text"
                placeholder="Search plumbing..."
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
                  background: '#2563EB',
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
            Plumbing Categories
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
                    background: isActive ? '#2563EB' : 'transparent',
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
            background: '#EFF6FF',
            borderRadius: 10,
            border: '1px solid #BFDBFE',
            fontSize: 11.5,
            color: '#1E40AF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
              <ShieldCheck size={14} />
              <span>UC Leak-Proof Cover</span>
            </div>
            Zero seepage warranty on all tap, waste pipe &amp; flush tank repairs.
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
              {SECTIONS.find(s => s.id === activeSection)?.title || 'All Plumbing Services'}
            </h2>
            <span style={{ fontSize: 12.5, color: '#64748B' }}>
              {filteredProducts.length} verified plumbing services
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
                          background: '#EFF6FF',
                          color: '#2563EB',
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
                        color: '#2563EB',
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
                        background: '#2563EB',
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
                          color: '#2563EB',
                          border: '1.5px solid #2563EB',
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
                background: '#2563EB',
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
            <div style={{ fontSize: 11, color: '#93C5FD' }}>
              Plumbing leak-proof warranty applied
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            style={{
              background: '#2563EB',
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
export default PlumberServicePage;
