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
  Hammer, 
  X,
  ChevronRight,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  Award
} from 'lucide-react';

export function CarpenterServicePage({
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
    { id: 'all', title: 'All Carpentry Services' },
    { id: 'locks', title: 'Door Locks & Latches' },
    { id: 'doors', title: 'Door & Window Repair' },
    { id: 'cupboards', title: 'Cupboards & Drawer Channels' },
    { id: 'drill', title: 'Drill & Hang (Wall Mounting)' },
    { id: 'assembly', title: 'Furniture Assembly & Repair' }
  ];

  const PRODUCTS = [
    {
      id: 'door-lock-repair',
      sectionId: 'locks',
      title: 'Door Lock Repair & Mortise Lock Installation',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.79',
      reviewsCount: '185K reviews',
      price: 149,
      originalPrice: 249,
      duration: '30 mins',
      badge: 'HIGH SECURITY',
      tag: 'Master Locksmith',
      image: '/images/door_lock_mortise.jpg',
      description: 'Fix sticking handles, install cylinder locks, deadbolts, mortise locks, and latch adjustments.',
      inclusions: [
        'Mortise chiseled fitting & wooden jamb cutting',
        'Strike plate precision alignment',
        '3-key mechanism smooth rotation test',
        'Lubrication with graphite powder'
      ],
      exclusions: ['Cost of new brass or stainless steel mortise lock set']
    },
    {
      id: 'door-repair',
      sectionId: 'doors',
      title: 'Door Repair, Trimming & Hinge Alignment',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.78',
      reviewsCount: '134K reviews',
      price: 199,
      originalPrice: 299,
      duration: '40 mins',
      badge: 'PERFECT CLOSING',
      tag: 'Master Carpenter',
      image: '/images/door_repair_wood.jpg',
      description: 'Plane door bottom rubbing on floor, fix sagging hinges, soundproofing, and smooth latching.',
      inclusions: [
        'Bottom edge planing with electric planer',
        'Heavy-duty screw tightening in door jamb',
        'Hinge pin realignment',
        'Smooth non-rubbing swing test'
      ],
      exclusions: ['New wood/plywood replacement for water-damaged doors']
    },
    {
      id: 'cupboard-drawer-repair',
      sectionId: 'cupboards',
      title: 'Cupboard Hinges, Telescopic Channels & Drawer Repair',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.82',
      reviewsCount: '98K reviews',
      price: 149,
      originalPrice: 229,
      duration: '30 mins',
      badge: 'SOFT CLOSE',
      tag: 'Master Carpenter',
      image: '/images/cupboard_hinge.jpg',
      description: 'Fix sticking wardrobe doors, replace worn-out soft-close hydraulic hinges and ball-bearing channels.',
      inclusions: [
        'Screw hole filling and re-drilling in MDF/plywood',
        'Hydraulic hinge angle calibration',
        'Telescopic drawer smooth slide check',
        'Cabinet door magnet catch alignment'
      ],
      exclusions: ['Cost of replacement hydraulic hinges/telescopic channels']
    },
    {
      id: 'drill-and-hang',
      sectionId: 'drill',
      title: 'Drill & Hang - Floating Shelves, Mirrors & Racks',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.86',
      reviewsCount: '210K reviews',
      price: 129,
      originalPrice: 199,
      duration: '25 mins',
      badge: 'LEVEL CHECKED',
      tag: 'Master Carpenter',
      image: '/images/shelf_install.jpg',
      description: 'Precision bracket mounting for heavy mirrors, wooden wall shelves, key holders, and bathroom accessories.',
      inclusions: [
        'Laser spirit level horizontal alignment',
        'Rawl plugs and high-tensile anchor screws',
        'Weight load bearing safety test',
        'Clean dust sweep after drilling'
      ],
      exclusions: ['Wall shelf wooden material or decorative brackets']
    },
    {
      id: 'decor-installation',
      sectionId: 'drill',
      title: 'Wall Decor, Clocks & Hanging Frame Installation',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.84',
      reviewsCount: '52K reviews',
      price: 99,
      originalPrice: 169,
      duration: '20 mins',
      badge: 'ZERO DAMAGE',
      tag: 'Master Carpenter',
      image: '/images/decor_abstract_frame.jpg',
      description: 'Safe and damage-free hanging of abstract canvas art, family photo collages, metal wall sculptures, and wall clocks.',
      inclusions: [
        'Precision drill & picture hook fitting',
        'Horizontal level alignment',
        'Dry wall anchor fitting',
        'Clean dust sweep'
      ],
      exclusions: ['Photo frames, canvases or clock units']
    },
    {
      id: 'furniture-assembly',
      sectionId: 'assembly',
      title: 'Bed, Table & Wardrobe Furniture Assembly (IKEA / Pepperfry)',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.90',
      reviewsCount: '73K reviews',
      price: 349,
      originalPrice: 599,
      duration: '60 mins',
      badge: 'FLATPACK PRO',
      tag: 'Master Carpenter',
      image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
      description: 'Expert assembly of flat-pack furniture (IKEA, Pepperfry, Urban Ladder) including beds, computer desks, dining tables, and wardrobes.',
      inclusions: [
        'Cam-lock and dowel assembly according to manual',
        'Drawer & hinge alignment',
        'Weight stability and wobble test',
        'Packaging waste consolidation'
      ],
      exclusions: ['Wall fixing anchor hardware if not provided in flatpack kit']
    },
    {
      id: 'furniture-repair',
      sectionId: 'assembly',
      title: 'Furniture Repair, Chair Wobble & Table Leg Fixing',
      category: 'quick-repairs',
      subcategory: 'Carpenter',
      rating: '4.76',
      reviewsCount: '64K reviews',
      price: 199,
      originalPrice: 299,
      duration: '35 mins',
      badge: 'STURDY FIX',
      tag: 'Master Carpenter',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
      description: 'Fix loose chair legs, strengthen dining table joints, reinforce sagging bed slats with corner brackets.',
      inclusions: [
        'L-bracket corner reinforcement',
        'Wood adhesive (Fevicol SH) injection into loose joints',
        'Level and stability check'
      ],
      exclusions: ['Major wood replacement or complete polishing/varnishing']
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
    <div className="carpenter-page-wrapper" style={{
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
                <h1 style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Hammer size={18} color="#B45309" />
                  Carpenter Services
                </h1>
                <span style={{
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase'
                }}>
                  In 76 mins
                </span>
              </div>
              <div 
                onClick={onOpenLocationModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12.5,
                  color: '#64748B',
                  marginTop: 2,
                  cursor: 'pointer'
                }}
              >
                <MapPin size={12} color="#B45309" />
                <span>{selectedLocality}, {selectedCity}</span>
                <span style={{ color: '#B45309', fontWeight: 600, marginLeft: 4 }}>Change</span>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div style={{
            flex: '1',
            maxWidth: 420,
            position: 'relative',
            display: 'none',
            minWidth: 220
          }} className="electrician-search-desktop">
            <Search 
              size={16} 
              color="#94A3B8" 
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search locks, doors, drill, shelves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 38px',
                borderRadius: 10,
                border: '1.5px solid #E2E8F0',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#F8FAFC'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Header Cart Button */}
          <button
            type="button"
            onClick={onOpenCart || onOpenCheckout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              backgroundColor: cartItemsCount > 0 ? '#B45309' : '#F1F5F9',
              color: cartItemsCount > 0 ? '#FFFFFF' : '#334155',
              border: 'none',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ShoppingBag size={17} />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span style={{
                backgroundColor: '#FFFFFF',
                color: '#B45309',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* 2. PROMO BANNER / TRUST STRIP */}
      <div style={{
        background: 'linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)',
        borderBottom: '1px solid #FDE68A',
        padding: '12px 24px'
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
          color: '#92400E'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <ShieldCheck size={18} color="#B45309" />
            <span>Urban Company Carpentry Guarantee: 30-day warranty, verified master carpenters & laser level accuracy.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={13} fill="#B45309" color="#B45309" /> 4.82 (1.2M+ Carpentry Jobs)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={13} /> Arrives in 76 mins
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: SIDEBAR + PRODUCTS GRID */}
      <div style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '24px 20px 100px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 28,
        boxSizing: 'border-box'
      }} className="electrician-main-layout">
        
        {/* Left Sticky Sidebar Categories */}
        <aside style={{
          position: 'sticky',
          top: 80,
          height: 'fit-content',
          backgroundColor: '#F8FAFC',
          borderRadius: 16,
          padding: '16px 12px',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#64748B',
            letterSpacing: '0.06em',
            padding: '4px 10px 10px'
          }}>
            Select Category
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTIONS.map((sec) => {
              const count = sec.id === 'all' 
                ? PRODUCTS.length 
                : PRODUCTS.filter(p => p.sectionId === sec.id).length;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(sec.id);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: isActive ? '#B45309' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#1E293B',
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#EEF2F6';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{sec.title}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    opacity: isActive ? 0.9 : 0.6,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                    color: isActive ? '#FFFFFF' : '#475569',
                    padding: '2px 7px',
                    borderRadius: 10
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick UC Promise Box */}
          <div style={{
            marginTop: 20,
            padding: 14,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            fontSize: 12,
            color: '#475569',
            lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              <Award size={15} color="#B45309" />
              <span>Carpentry Assurance</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Verified master carpenters</li>
              <li>30-day service warranty</li>
              <li>Standard transparent rate card</li>
              <li>Precision laser level fittings</li>
            </ul>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main>
          {/* Section Heading & Mobile Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: 14
          }}>
            <div>
              <h2 style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0F172A',
                margin: 0
              }}>
                {SECTIONS.find(s => s.id === activeSection)?.title || 'All Carpentry Services'}
              </h2>
              <p style={{
                fontSize: 13,
                color: '#64748B',
                margin: '4px 0 0'
              }}>
                Showing {filteredProducts.length} verified carpentry {filteredProducts.length === 1 ? 'service' : 'services'}
              </p>
            </div>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: 16,
              border: '1px dashed #CBD5E1'
            }}>
              <Hammer size={36} color="#94A3B8" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155', margin: 0 }}>
                No carpentry services match your search
              </h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: '6px 0 16px' }}>
                Try searching with different keywords like "lock", "door", "shelf", or clear filters.
              </p>
              <button
                type="button"
                onClick={() => { setActiveSection('all'); setSearchQuery(''); }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#B45309',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {filteredProducts.map((product) => {
                const qty = cart[product.id]?.qty || 0;
                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 140px',
                      gap: 20,
                      padding: 20,
                      borderRadius: 16,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'box-shadow 0.15s ease, border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    {/* Left: Product Info */}
                    <div>
                      {/* Badge / Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {product.badge && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: 4,
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            letterSpacing: '0.04em'
                          }}>
                            {product.badge}
                          </span>
                        )}
                        <span style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
                          {product.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: '#0F172A',
                        margin: '0 0 6px 0',
                        lineHeight: 1.3
                      }}>
                        {product.title}
                      </h3>

                      {/* Rating & Reviews */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          padding: '2px 7px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700
                        }}>
                          <Star size={11} fill="#FACC15" color="#FACC15" />
                          <span>{product.rating}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748B' }}>
                          ({product.reviewsCount})
                        </span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                          <Clock size={12} />
                          <span>{product.duration}</span>
                        </div>
                      </div>

                      {/* Pricing Row */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                          ₹{product.price}
                        </span>
                        {product.originalPrice && (
                          <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: 13,
                        color: '#475569',
                        lineHeight: 1.5,
                        margin: '0 0 12px 0'
                      }}>
                        {product.description}
                      </p>

                      {/* Key Inclusions Preview */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                        {product.inclusions.slice(0, 2).map((inc, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
                            <CheckCircle2 size={13} color="#16A34A" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>

                      {/* View Details Link */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailProduct(product)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#B45309',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>View details</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    {/* Right: Image & Quantity / Add Button */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        width: 130,
                        height: 100,
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        position: 'relative'
                      }}>
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      </div>

                      {/* Add or Qty Stepper */}
                      <div style={{ marginTop: 12, width: '100%', maxWidth: 110 }}>
                        {qty > 0 ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid #B45309',
                            borderRadius: 8,
                            padding: '4px 8px',
                            boxShadow: '0 2px 6px rgba(180, 83, 9, 0.12)'
                          }}>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateQty(product.id, qty - 1);
                                showToast(`Updated "${product.title}"`);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#B45309',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 2
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#B45309' }}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateQty(product.id, qty + 1);
                                showToast(`Added more "${product.title}"`);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#B45309',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 2
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart(product);
                              showToast(`Added "${product.title}" to cart`);
                            }}
                            style={{
                              width: '100%',
                              padding: '7px 12px',
                              backgroundColor: '#FFFFFF',
                              color: '#B45309',
                              border: '1.5px solid #B45309',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#B45309';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.color = '#B45309';
                            }}
                          >
                            Add +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 4. DETAIL POPUP MODAL (When clicking "View details") */}
      {selectedDetailProduct && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setSelectedDetailProduct(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedDetailProduct(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <X size={18} color="#0F172A" />
            </button>

            {/* Modal Image */}
            <div style={{ height: 210, width: '100%', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
              <img 
                src={selectedDetailProduct.image} 
                alt={selectedDetailProduct.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  {selectedDetailProduct.badge || 'VERIFIED CARPENTER'}
                </span>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  {selectedDetailProduct.duration}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                {selectedDetailProduct.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>
                  ₹{selectedDetailProduct.price}
                </span>
                {selectedDetailProduct.originalPrice && (
                  <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{selectedDetailProduct.originalPrice}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {selectedDetailProduct.description}
              </p>

              {/* Inclusions */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                  What's included in this service:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDetailProduct.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155' }}>
                      <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              {selectedDetailProduct.exclusions && selectedDetailProduct.exclusions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                    What's not included:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedDetailProduct.exclusions.map((exc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#64748B' }}>
                        <X size={13} color="#EF4444" style={{ flexShrink: 0 }} />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart button in modal */}
              <button
                type="button"
                onClick={() => {
                  onAddToCart(selectedDetailProduct);
                  showToast(`Added "${selectedDetailProduct.title}" to cart`);
                  setSelectedDetailProduct(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#B45309',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 10
                }}
              >
                <Plus size={16} />
                <span>Add Service to Cart • ₹{selectedDetailProduct.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. STICKY BOTTOM CHECKOUT FLOATING BAR */}
      {cartItemsCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: 720,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 16,
          padding: '14px 22px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 99,
          animation: 'slideUp 0.25s ease-out'
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'} in your cart
            </div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>
              ₹{cartTotalAmount}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCheckout || onOpenCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
