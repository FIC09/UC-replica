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
  Paintbrush, 
  X,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Check,
  ThumbsUp,
  Award,
  Zap,
  Droplets
} from 'lucide-react';

export function PaintingServicePage({
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
    { id: 'all', title: 'All Painting & Waterproofing' },
    { id: 'consultation', title: 'Laser Consultation & Quote' },
    { id: 'full-home', title: 'Full Home Painting' },
    { id: 'waterproofing', title: 'Waterproofing & Dampness' },
    { id: 'accent', title: 'Accent Walls & Textures' },
    { id: 'rental', title: 'Rental & Quick Repaint' }
  ];

  const PRODUCTS = [
    {
      id: 'express-home-painting-consult',
      sectionId: 'consultation',
      title: 'Express Home Painting & Laser Consultation',
      category: 'painting-decor',
      subcategory: 'Full Home Painting',
      rating: '4.86',
      reviewsCount: '78K reviews',
      price: 49,
      originalPrice: 299,
      duration: '45 mins visit',
      badge: 'BOOKING TOKEN • REFUNDABLE',
      tag: 'Laser Measurement',
      image: '/images/home_festive.jpg',
      description: 'Senior painting specialist visit with laser room measuring tool, Asian Paints & Berger shade catalogs, wall moisture scanning, and spot digital quote.',
      inclusions: [
        'Laser measurement of wall square footage with 100% precision',
        'Wall moisture meter assessment to detect dampness & seepage',
        'Digital 3D color preview with shade catalogs (Asian Paints, Berger, Dulux)',
        '₹49 token fee fully deducted from final bill or 100% refunded if not booked'
      ],
      exclusions: ['Actual painting execution (starts after quotation approval)'],
      steps: [
        'Wall moisture analysis using digital thermal scanner',
        'Laser scanning of all rooms & ceiling square footage',
        'Color shade card & texture selection with specialist',
        'Instant transparent digital estimate on your phone'
      ]
    },
    {
      id: 'full-home-interior-painting',
      sectionId: 'full-home',
      title: 'Full Home Interior Painting (1BHK / 2BHK / 3BHK)',
      category: 'painting-decor',
      subcategory: 'Full Home Painting',
      rating: '4.89',
      reviewsCount: '42K reviews',
      price: 4999,
      originalPrice: 7499,
      duration: '3-5 days delivery',
      badge: '100% DUST-FREE MECHANIZED',
      tag: 'Asian Paints Royale',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
      description: 'End-to-end premium interior home painting. Complete furniture masking, vacuum-powered sanding, 2 coats premium emulsion, and deep post-paint cleanup.',
      inclusions: [
        'Complete masking of furniture, electronics, flooring & switches with protective sheets',
        'Mechanized vacuum sanders ensuring 100% dust-free sanding',
        '1 coat primer + 2 coats premium Asian Paints / Berger washable luxury emulsion',
        'Deep chemical post-paint floor cleanup & furniture repositioning'
      ],
      exclusions: ['Civil plastering work for structural wall cracks'],
      steps: [
        'Protective masking of home furnishings',
        'Surface preparation & putty smoothing',
        'Vacuum-assisted sanding & primer coat',
        'Two coats of premium emulsion + final inspection'
      ]
    },
    {
      id: 'wall-dampness-waterproof',
      sectionId: 'waterproofing',
      title: 'Wall Dampness & Terrace Waterproofing Inspection',
      category: 'painting-decor',
      subcategory: 'Waterproofing',
      rating: '4.83',
      reviewsCount: '39K reviews',
      price: 199,
      originalPrice: 499,
      duration: '45 mins visit',
      badge: 'THERMAL SCANNING',
      tag: 'Long Lasting Fix',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      description: 'Diagnose peeling paint, fungal efflorescence, ceiling leaks, and bathroom seepage using scientific thermal moisture meters.',
      inclusions: [
        'Thermal imaging inspection to locate hidden water ingress paths & plumbing leaks',
        'Masonry moisture percentage diagnosis with pin-less radar meter',
        'Written 3-year warranty plan with Dr. Fixit & Asian Paints SmartCare chemicals',
        'Detailed cost estimate with zero obligation'
      ],
      exclusions: ['Scaffolding erection for exterior high-rise testing'],
      steps: [
        'Moisture mapping of affected areas',
        'Source identification (pipe joint vs terrace seepage)',
        'Detailed waterproofing solution roadmap & quotation'
      ]
    },
    {
      id: 'accent-wall-royale-play',
      sectionId: 'accent',
      title: 'Single Accent Wall / Royale Play Texture Painting',
      category: 'painting-decor',
      subcategory: 'Accent Walls',
      rating: '4.88',
      reviewsCount: '19K reviews',
      price: 1899,
      originalPrice: 2499,
      duration: '4 hours',
      badge: 'DESIGNER WALL',
      tag: 'Metallic & Stencil Finish',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      description: 'Transform your living room or master bedroom with designer texture finishes, metallic glazes, or geometric stencils.',
      inclusions: [
        'Designer stencil, metallic glaze, or marble finish texture',
        'Premium Asian Paints Royale Play or Berger Silk Glamour',
        'Surface putty preparation, primer & protective clear topcoat',
        'Furniture covering & spotless clean finish'
      ],
      exclusions: ['Wallpaper peeling / extensive wall reconstruction'],
      steps: [
        'Base coat smoothing & masking',
        'Texture applicator trowel application',
        'Metallic topcoat glaze detailing'
      ]
    },
    {
      id: 'rental-move-in-repaint',
      sectionId: 'rental',
      title: 'Quick Move-In / Rental Whitewash & Touchup',
      category: 'painting-decor',
      subcategory: 'Rental Repaint',
      rating: '4.79',
      reviewsCount: '28K reviews',
      price: 2499,
      originalPrice: 3499,
      duration: '1-2 days',
      badge: 'FAST TURNAROUND',
      tag: 'Deposit Friendly',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
      description: 'Ideal for tenant move-in or security deposit handover. Fast, clean whitewashing and color touchup with minimal fuss.',
      inclusions: [
        'Nail hole filling, spot puttying, and minor crack sealing',
        'Fresh double-coat repaint with clean, odorless tractor emulsion',
        'Floor border masking & fast turnaround within 24-48 hours',
        'Guaranteed landlord deposit clearance standard'
      ],
      exclusions: ['Major dampness chemical waterproofing'],
      steps: [
        'Nail hole & crack patching',
        'Fast single-day double coat application',
        'Tidy cleanup'
      ]
    }
  ];

  // Filtered products based on search query and active section tab
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchSection = activeSection === 'all' || p.sectionId === activeSection;
      const matchQuery = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tag?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSection && matchQuery;
    });
  }, [activeSection, searchQuery]);

  // Calculate cart total and items count for painting services
  const totalCartItems = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  }, [cart]);

  const totalCartPrice = useMemo(() => {
    return Object.values(cart).reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
  }, [cart]);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
      {/* 1. Header Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div className="container-custom" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
          gap: 16
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 18 }}>🎨</span>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3 }}>
                  Home Painting & Waterproofing
                </h1>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>
                Festive Home Makeovers • Laser Precision • 100% Dust-Free
              </div>
            </div>
          </div>

          {/* Location Selector Chip */}
          <div
            onClick={onOpenLocationModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#F8FAFC',
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid #E2E8F0',
              cursor: 'pointer'
            }}
            title="Change service location"
          >
            <MapPin size={14} color="#059669" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
              {selectedLocality}, {selectedCity}
            </span>
          </div>

          {/* Cart Trigger */}
          {totalCartItems > 0 && (
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
              }}
            >
              <ShoppingBag size={15} />
              <span>{totalCartItems} Item{totalCartItems > 1 ? 's' : ''} • ₹{totalCartPrice}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Hero Festive Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #451A03 0%, #78350F 50%, #1E1B4B 100%)',
        color: '#FFFFFF',
        padding: '36px 0 32px'
      }}>
        <div className="container-custom">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24
          }}>
            <div style={{ maxWidth: 560 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(251, 191, 36, 0.2)',
                color: '#FDE68A',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 800,
                marginBottom: 12
              }}>
                <Sparkles size={14} /> FESTIVE HOME MAKEOVER SEASON
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px 0', letterSpacing: -0.5 }}>
                Elevate your home this festive season
              </h2>
              <p style={{ fontSize: 14, color: '#FDE68A', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                Laser room measurement, moisture scanner diagnosis, genuine Asian Paints & Berger shades,
                and zero airborne dust with mechanized vacuum sanding.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Star size={14} fill="#FACC15" color="#FACC15" /> <strong>4.86 ★</strong> (78K reviews)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <ShieldCheck size={14} color="#34D399" /> 1-Year Painting Warranty
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={14} color="#60A5FA" /> Consultation @ ₹49 (Refundable)
                </span>
              </div>
            </div>

            {/* Quick Consultation Booking Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '20px 24px',
              color: '#0F172A',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              width: 320,
              boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                POPULAR STARTING STEP
              </div>
              <h3 style={{ margin: '4px 0 8px 0', fontSize: 16, fontWeight: 800 }}>
                Book Laser Consultation
              </h3>
              <p style={{ margin: '0 0 14px 0', fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>
                Specialist visits with laser room measuring tool, moisture reader, & digital shade book.
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#0F172A' }}>₹49</span>
                <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through' }}>₹299</span>
                <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 700 }}>83% OFF</span>
              </div>
              {cart['express-home-painting-consult'] ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F1F5F9',
                  borderRadius: 8,
                  padding: '6px 12px'
                }}>
                  <button
                    type="button"
                    onClick={() => onUpdateQty('express-home-painting-consult', (cart['express-home-painting-consult'].qty || 1) - 1)}
                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 4, width: 26, height: 26, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{cart['express-home-painting-consult'].qty} in Cart</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty('express-home-painting-consult', (cart['express-home-painting-consult'].qty || 1) + 1)}
                    style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 4, width: 26, height: 26, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const consultProd = PRODUCTS.find(p => p.id === 'express-home-painting-consult');
                    onAddToCart(consultProd);
                    showToast('🎨 Added Laser Painting Consultation to cart!');
                  }}
                  style={{
                    width: '100%',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Plus size={15} /> Book Consultation Token @ ₹49
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Filter Strip & Search */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 68,
        zIndex: 90
      }}>
        <div className="container-custom" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            {/* Horizontal Sub-sections */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {SECTIONS.map(s => {
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    style={{
                      background: isActive ? '#0F172A' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#475569',
                      border: 'none',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: 12.5,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {s.title}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search painting services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  border: '1px solid #CBD5E1',
                  borderRadius: 20,
                  fontSize: 12,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Products Listing Grid */}
      <div className="container-custom" style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
          {SECTIONS.find(s => s.id === activeSection)?.title || 'All Painting Services'} ({filteredProducts.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20
        }}>
          {filteredProducts.map(product => {
            const inCart = cart[product.id];
            return (
              <div
                key={product.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Product Image Box */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#0F172A' }}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {product.badge && (
                    <div style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#FACC15',
                      backdropFilter: 'blur(4px)',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5
                    }}>
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Product Content Body */}
                <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Star size={13} fill="#FACC15" color="#FACC15" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>{product.rating}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>({product.reviewsCount})</span>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                    {product.title}
                  </h4>

                  <p style={{ margin: '0 0 12px 0', fontSize: 12.5, color: '#64748B', lineHeight: 1.5, flex: 1 }}>
                    {product.description}
                  </p>

                  <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {product.duration}
                  </div>

                  {/* Pricing and Action Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 19, fontWeight: 800, color: '#0F172A' }}>₹{product.price}</span>
                        {product.originalPrice && (
                          <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailProduct(product)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: 0,
                          cursor: 'pointer',
                          marginTop: 2
                        }}
                      >
                        View details & inclusions ➔
                      </button>
                    </div>

                    {/* Add to Cart / Qty Controls */}
                    {inCart ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#0F172A',
                        borderRadius: 8,
                        padding: '4px 8px'
                      }}>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, (inCart.qty || 1) - 1)}
                          style={{
                            background: '#1E293B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 4,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 13, minWidth: 16, textAlign: 'center' }}>
                          {inCart.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, (inCart.qty || 1) + 1)}
                          style={{
                            background: '#1E293B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 4,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(product);
                          showToast(`🎨 Added "${product.title}" to cart!`);
                        }}
                        style={{
                          background: '#0F172A',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky Floating Bottom Checkout Bar */}
      {totalCartItems > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 620,
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 14,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          zIndex: 1000
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {totalCartItems} Service{totalCartItems > 1 ? 's' : ''} Selected • ₹{totalCartPrice}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>
              Includes 30-Day Painting Guarantee & Free Touchups
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                background: '#1E293B',
                color: '#CBD5E1',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Cart
            </button>
            <button
              type="button"
              onClick={onOpenCheckout}
              style={{
                background: '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>Book Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 6. Product Detail Inclusions Modal */}
      {selectedDetailProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setSelectedDetailProduct(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              maxWidth: 520,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: 24,
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
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
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: 17, fontWeight: 800, color: '#0F172A', paddingRight: 32 }}>
              {selectedDetailProduct.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12 }}>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>★ {selectedDetailProduct.rating}</span>
              <span style={{ color: '#94A3B8' }}>({selectedDetailProduct.reviewsCount})</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>• {selectedDetailProduct.duration}</span>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {selectedDetailProduct.description}
            </p>

            {/* Inclusions */}
            {selectedDetailProduct.inclusions && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  What is Included:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailProduct.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#334155' }}>
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            {selectedDetailProduct.steps && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  Service Execution Process:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailProduct.steps.map((st, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#475569' }}>
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 11
                      }}>
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid #E2E8F0'
            }}>
              <div>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>₹{selectedDetailProduct.price}</span>
                {selectedDetailProduct.originalPrice && (
                  <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through', marginLeft: 6 }}>
                    ₹{selectedDetailProduct.originalPrice}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddToCart(selectedDetailProduct);
                  showToast(`🎨 Added "${selectedDetailProduct.title}" to cart!`);
                  setSelectedDetailProduct(null);
                }}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Plus size={14} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
