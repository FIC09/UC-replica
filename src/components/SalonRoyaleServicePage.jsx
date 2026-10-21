import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Search,
  Star,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export function SalonRoyaleServicePage({
  onBackHome,
  selectedCity = 'Krishnagiri',
  selectedLocality = 'Rayakottai Road',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast = () => {}
}) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('packages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailService, setSelectedDetailService] = useState(null);

  // 7 Sidebar Categories (Screenshot 2)
  const SIDEBAR_CATEGORIES = [
    { id: 'packages', title: 'Packages', iconType: 'package' },
    { id: 'pedicure', title: 'Pedicure', img: '/images/men_express_pedicure.jpg' },
    { id: 'hair-care', title: 'Hair care', img: '/images/men_haircut_pro.jpg' },
    { id: 'face-care', title: 'Face care', img: '/images/men_o3_facial.jpg' },
    { id: 'beard-grooming', title: 'Shave/beard grooming', img: '/images/men_beard_trim_pro.jpg' },
    { id: 'hair-color', title: 'Hair color', img: '/images/men_hair_color_only.jpg' },
    { id: 'massage', title: 'Massage', img: '/images/men_head_massage_pro.jpg' }
  ];

  // Full Catalogue matching Screenshots
  const CATALOGUE_SECTIONS = [
    {
      id: 'packages',
      title: 'Packages',
      services: [
        {
          id: 'royale-grooming-essentials',
          title: 'Grooming essentials',
          isPackage: true,
          rating: 4.89,
          reviewsCount: '259K reviews',
          price: 758,
          duration: '1 hr 15 mins',
          packageItems: [
            'Haircut: Haircut for men',
            'Shave/beard grooming: Beard trimming & styling'
          ]
        },
        {
          id: 'royale-complete-care',
          title: 'Complete care',
          isPackage: true,
          rating: 4.89,
          reviewsCount: '216K reviews',
          price: 1158,
          duration: '1 hr 15 mins',
          packageItems: [
            'Haircut: Haircut for men',
            'Detan (O3+): Face & neck detan'
          ]
        },
        {
          id: 'royale-glow-getter',
          title: 'Glow getter',
          isPackage: true,
          rating: 4.89,
          reviewsCount: '218K reviews',
          price: 2798,
          originalPrice: 2858,
          duration: '2 hrs 15 mins',
          packageItems: [
            'Face care: Repechage skin brightening facial',
            'Shave/beard grooming: Beard trimming & styling',
            'Haircut: Haircut for men'
          ]
        },
        {
          id: 'royale-haircut-color',
          title: 'Haircut & color',
          isPackage: true,
          rating: 4.88,
          reviewsCount: '154K reviews',
          price: 1108,
          originalPrice: 1208,
          duration: '1 hr 15 mins',
          packageItems: [
            'Haircut: Haircut for men',
            "Inoa colors (L'Oreal): Dark brown (shade 3)"
          ]
        },
        {
          id: 'royale-hair-care-pkg',
          title: 'Hair & care',
          isPackage: true,
          rating: 4.89,
          reviewsCount: '197K reviews',
          price: 1977,
          originalPrice: 2027,
          duration: '2 hrs 15 mins',
          packageItems: [
            'Haircut: Haircut for men',
            'Massage: 15 mins head massage',
            'Pedicure: Aroma bomb pedicure'
          ]
        }
      ]
    },
    {
      id: 'pedicure',
      title: 'Pedicure',
      services: [
        {
          id: 'royale-aroma-bomb-pedicure',
          title: 'Aroma bomb pedicure',
          tag: 'BESTSELLER',
          rating: 4.82,
          reviewsCount: '14K reviews',
          price: 1299,
          originalPrice: 1349,
          duration: '1 hr 15 mins',
          image: '/images/men_aroma_pedicure.jpg',
          description: 'Revitalise your feet with a soothing aroma bomb pedicure for fresh, soft soles'
        },
        {
          id: 'royale-express-pedicure',
          title: 'Express pedicure',
          rating: 4.81,
          reviewsCount: '285 reviews',
          price: 900,
          duration: '40 mins',
          image: '/images/men_express_pedicure.jpg',
          description: 'Foot care using natural ingredients to leave your feet soft, smooth & refreshed • Gentle exfoliation & a relaxing massage for deep hydration'
        },
        {
          id: 'royale-nail-cut-feet',
          title: 'Nail cut & file (feet)',
          rating: 4.87,
          reviewsCount: '3K reviews',
          price: 120,
          duration: '10 mins',
          image: '/images/men_nail_cut_feet.jpg',
          description: 'Quick & basic nail grooming of your feet'
        },
        {
          id: 'royale-nail-cut-hands',
          title: 'Nail cut & file (hands)',
          rating: 4.85,
          reviewsCount: '3K reviews',
          price: 100,
          duration: '10 mins',
          image: '/images/men_nail_cut_hands.jpg',
          description: 'Quick & basic nail grooming of your hands'
        }
      ]
    },
    {
      id: 'hair-care',
      title: 'Hair care',
      services: [
        {
          id: 'royale-haircut-men',
          title: 'Haircut for men',
          tag: 'BESTSELLER',
          rating: 4.88,
          reviewsCount: '1.2M reviews',
          price: 459,
          duration: '45 mins',
          image: '/images/men_haircut_pro.jpg',
          description: 'Tailored haircut by top-rated senior stylists with blow-dry styling & scalp rinse'
        },
        {
          id: 'royale-haircut-boys',
          title: 'Haircut for boys',
          rating: 4.86,
          reviewsCount: '180K reviews',
          price: 459,
          duration: '45 mins',
          image: '/images/men_haircut_boys.jpg',
          description: 'Gentle, trendy styling for boys under 12 with sanitised equipment'
        }
      ]
    },
    {
      id: 'face-care',
      title: 'Face care',
      banner: {
        headline: 'Beardo Golden Glow Facial',
        sub: 'With real gold dust, turmeric and lemon extracts',
        img: '/images/men_beardo_glow_banner.jpg'
      },
      services: [
        {
          id: 'royale-beardo-glow-facial',
          title: 'Beardo golden glow facial',
          tag: 'BESTSELLER',
          rating: 4.89,
          reviewsCount: '45K reviews',
          price: 1599,
          duration: '60 mins',
          image: '/images/men_o3_facial.jpg',
          description: 'Infused with active gold dust and botanical extracts for an ultra-luminous, energized finish'
        },
        {
          id: 'royale-o3-facial',
          title: 'O3+ skin brightening facial',
          rating: 4.90,
          reviewsCount: '72K reviews',
          price: 2000,
          originalPrice: 2100,
          duration: '75 mins',
          image: '/images/men_o3_facial.jpg',
          description: 'Dermatologically formulated O3+ lightening kit targeting hyperpigmentation & dark patches'
        },
        {
          id: 'royale-repechage-facial',
          title: 'Repechage skin brightening facial',
          tag: 'BESTSELLER',
          rating: 4.91,
          reviewsCount: '58K reviews',
          price: 2000,
          originalPrice: 2100,
          duration: '75 mins',
          image: '/images/men_repechage_facial.jpg',
          description: 'EcoCert pure seaweed & marine peptide infusion for high-potency radiance and barrier repair'
        },
        {
          id: 'royale-o3-detan',
          title: 'O3+ face & neck detan',
          rating: 4.88,
          reviewsCount: '95K reviews',
          price: 849,
          duration: '30 mins',
          image: '/images/men_prime_face_detan.jpg',
          description: 'Deep lacto-protein peel eliminating sun tan, pollution films, and uneven skin tone'
        }
      ]
    },
    {
      id: 'beard-grooming',
      title: 'Shave/beard grooming',
      services: [
        {
          id: 'royale-clean-shave',
          title: 'Clean shave',
          rating: 4.87,
          reviewsCount: '220K reviews',
          price: 299,
          duration: '25 mins',
          image: '/images/men_clean_shave_pro.jpg',
          description: 'Warm towel treatment, smooth single-blade shave, and soothing alcohol-free balm'
        },
        {
          id: 'royale-beard-trim',
          title: 'Beard trimming & styling',
          tag: 'BESTSELLER',
          rating: 4.89,
          reviewsCount: '410K reviews',
          price: 299,
          duration: '25 mins',
          image: '/images/men_beard_trim_pro.jpg',
          description: 'Precision boundary contouring, cheek fade, and conditioning beard growth oil'
        },
        {
          id: 'royale-beard-color',
          title: 'Beard colour (only application)',
          rating: 4.85,
          reviewsCount: '82K reviews',
          price: 199,
          duration: '20 mins',
          image: '/images/men_beard_color_pro.jpg',
          description: 'Even brush application of beard dye for 100% natural, streak-free grey coverage'
        }
      ]
    },
    {
      id: 'hair-color',
      title: 'Hair color',
      services: [
        {
          id: 'royale-hair-color-only',
          title: 'Hair colour (only application)',
          rating: 4.84,
          reviewsCount: '110K reviews',
          price: 349,
          duration: '30 mins',
          image: '/images/men_hair_color_only.jpg',
          description: 'Skillful section-by-section application with zero scalp staining (product by customer)'
        },
        {
          id: 'royale-inoa-color',
          title: "L'Oreal Inoa hair colour",
          rating: 4.89,
          reviewsCount: '85K reviews',
          price: 749,
          originalPrice: 849,
          duration: '45 mins',
          optionsCount: 4,
          image: '/images/men_inoa_logo_thumb.jpg',
          description: 'Ammonia-free luxury oil delivery system (ODS2) for 6 weeks of intense, glossy color'
        }
      ]
    },
    {
      id: 'massage',
      title: 'Massage',
      services: [
        {
          id: 'royale-head-massage',
          title: 'Head massage',
          rating: 4.88,
          reviewsCount: '190K reviews',
          price: 219,
          duration: '15 mins',
          optionsCount: 2,
          image: '/images/men_head_massage_pro.jpg',
          description: 'Stress-busting pressure points massage using soothing almond or cooling herbal oils'
        },
        {
          id: 'royale-head-neck-shoulder',
          title: 'Head, neck & shoulder massage',
          rating: 4.90,
          reviewsCount: '140K reviews',
          price: 449,
          duration: '40 mins',
          image: '/images/men_head_neck_shoulder.jpg',
          description: 'Deep tissue therapy targeting upper back knots, cervical tension, and stress fatigue'
        }
      ]
    }
  ];

  // Calculate Cart metrics
  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    Object.entries(cart).forEach(([itemId, item]) => {
      const qty = typeof item === 'number' ? item : item?.quantity || 0;
      if (qty > 0) {
        count += qty;
        // Search in sections
        let foundPrice = item?.price || 0;
        if (!foundPrice) {
          CATALOGUE_SECTIONS.forEach(sec => {
            sec.services.forEach(srv => {
              if (srv.id === itemId) foundPrice = srv.price;
            });
          });
        }
        total += (foundPrice || 0) * qty;
      }
    });
    return { cartCount: count, cartTotal: total };
  }, [cart]);

  function getQty(id) {
    const it = cart[id];
    if (typeof it === 'number') return it;
    return it?.quantity || 0;
  }

  function handleAdd(srv) {
    if (onAddToCart) {
      onAddToCart(srv);
    } else if (onUpdateQty) {
      onUpdateQty(srv.id, getQty(srv.id) + 1);
    }
    showToast(`Added ${srv.title} to cart`);
  }

  function handleCategoryClick(catId) {
    setActiveCategoryTab(catId);
    const el = document.getElementById(`section-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Filter sections by search query if any
  const displayedSections = useMemo(() => {
    if (!searchQuery.trim()) return CATALOGUE_SECTIONS;
    const q = searchQuery.toLowerCase();
    return CATALOGUE_SECTIONS.map(sec => ({
      ...sec,
      services: sec.services.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.packageItems && s.packageItems.some(item => item.toLowerCase().includes(q)))
      )
    })).filter(sec => sec.services.length > 0);
  }, [searchQuery]);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 120, color: '#0F172A', fontFamily: 'inherit' }}>
      
      {/* 1. TOP STICKY NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          {/* Left: Back Arrow & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155'
              }}
              title="Return to Home"
            >
              <ArrowLeft size={18} />
            </button>

            <div onClick={onBackHome} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
              <div
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: 14,
                  padding: '4px 7px',
                  borderRadius: 4,
                  letterSpacing: 0.5
                }}
              >
                UC
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', letterSpacing: -0.3 }}>
                Urban Company
              </span>
            </div>
          </div>

          {/* Middle: Location & Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 680 }}>
            <button
              type="button"
              onClick={onOpenLocationModal}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#1E293B',
                whiteSpace: 'nowrap',
                maxWidth: 240
              }}
            >
              <MapPin size={14} color="#7C3AED" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                4744+HMQ, {selectedLocality || selectedCity}
              </span>
            </button>

            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                padding: '8px 14px'
              }}
            >
              <Search size={16} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search in Salon Royale"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: 13,
                  color: '#0F172A'
                }}
              />
            </div>
          </div>

          {/* Right: Cart icon */}
          <button
            type="button"
            onClick={onOpenCart}
            style={{
              position: 'relative',
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1E293B'
            }}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 800,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF'
                }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN CONTAINER WITH 3-COLUMN LAYOUT */}
      <div style={{ maxWidth: 1280, margin: '24px auto', padding: '0 24px' }}>
        
        {/* Title & Rating */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Salon Royale
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#6D28D9',
                color: '#FFFFFF',
                borderRadius: 50,
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 800
              }}
            >
              <Star size={11} fill="#FFFFFF" strokeWidth={0} />
              <span>4.87</span>
            </div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              (1.3 M bookings)
            </span>
          </div>
        </div>

        {/* 3 Columns: Left Navigation Sidebar | Center Services Catalogue | Right UC Promise & Floating Cart */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: 32, alignItems: 'start' }}>
          
          {/* Left Column: Select a Service (Sidebar) */}
          <aside
            style={{
              position: 'sticky',
              top: 80,
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '18px 14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, paddingLeft: 6 }}>
              Select a service
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 8px' }}>
              {SIDEBAR_CATEGORIES.map((cat) => {
                const isActive = activeCategoryTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 10,
                      outline: isActive ? '2px solid #7C3AED' : 'none'
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: '#EEF2F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isActive ? '2px solid #7C3AED' : '1px solid #E2E8F0'
                      }}
                    >
                      {cat.iconType === 'package' ? (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: '#06B6D4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              background: '#FFFFFF',
                              borderRadius: 4,
                              opacity: 0.95
                            }}
                          />
                        </div>
                      ) : (
                        <img
                          src={cat.img}
                          alt={cat.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#7C3AED' : '#334155',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        maxWidth: 62
                      }}
                    >
                      {cat.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center Column: Services Sections */}
          <main style={{ minWidth: 0 }}>
            {displayedSections.map((sec) => (
              <section
                key={sec.id}
                id={`section-${sec.id}`}
                style={{
                  marginBottom: 36,
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 20 }}>
                  {sec.title}
                </h2>

                {/* Banner if present (e.g., Beardo Golden Glow) */}
                {sec.banner && (
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      marginBottom: 20,
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Special Formulation
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#78350F', margin: '4px 0 2px 0' }}>
                        {sec.banner.headline}
                      </h3>
                      <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>
                        {sec.banner.sub}
                      </p>
                    </div>
                    {sec.banner.img && (
                      <img
                        src={sec.banner.img}
                        alt="Banner"
                        style={{ width: 140, height: 80, objectFit: 'cover' }}
                      />
                    )}
                  </div>
                )}

                {/* Services Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sec.services.map((srv) => {
                    const qty = getQty(srv.id);

                    return (
                      <div
                        key={srv.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 20,
                          paddingBottom: 24,
                          borderBottom: '1px solid #F1F5F9'
                        }}
                      >
                        {/* Left Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {srv.isPackage && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                color: '#059669',
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: 4
                              }}
                            >
                              <span style={{ fontSize: 13 }}>■</span> PACKAGE
                            </div>
                          )}

                          {srv.tag && (
                            <div
                              style={{
                                display: 'inline-block',
                                background: '#F0FDF4',
                                color: '#15803D',
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: 4,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: 4
                              }}
                            >
                              {srv.tag}
                            </div>
                          )}

                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                            {srv.title}
                          </h3>

                          {/* Rating & Reviews */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                background: '#6D28D9',
                                color: '#FFFFFF',
                                borderRadius: 50,
                                padding: '1px 6px',
                                fontSize: 11,
                                fontWeight: 800
                              }}
                            >
                              <Star size={10} fill="#FFFFFF" strokeWidth={0} />
                              <span>{srv.rating}</span>
                            </div>
                            <span style={{ fontSize: 12, color: '#64748B' }}>
                              ({srv.reviewsCount})
                            </span>
                          </div>

                          {/* Price & Duration */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                              ₹{srv.price.toLocaleString()}
                            </span>
                            {srv.originalPrice && (
                              <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through' }}>
                                ₹{srv.originalPrice.toLocaleString()}
                              </span>
                            )}
                            {srv.duration && (
                              <span style={{ fontSize: 12, color: '#64748B' }}>
                                • {srv.duration}
                              </span>
                            )}
                          </div>

                          {/* Inclusions or Package Items list */}
                          {srv.packageItems && (
                            <ul style={{ margin: '0 0 14px 0', paddingLeft: 18, fontSize: 12.5, color: '#475569' }}>
                              {srv.packageItems.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: 4 }}>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}

                          {srv.description && (
                            <p style={{ margin: '0 0 10px 0', fontSize: 12.5, color: '#64748B', lineHeight: 1.45 }}>
                              {srv.description}
                            </p>
                          )}

                          {srv.isPackage ? (
                            <button
                              type="button"
                              onClick={() => handleAdd(srv)}
                              style={{
                                background: 'transparent',
                                border: '1px solid #CBD5E1',
                                borderRadius: 8,
                                padding: '6px 14px',
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#0F172A',
                                cursor: 'pointer'
                              }}
                            >
                              Edit your package
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedDetailService(srv)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#7C3AED',
                                cursor: 'pointer',
                                textDecoration: 'none'
                              }}
                            >
                              View details
                            </button>
                          )}
                        </div>

                        {/* Right: Add Button or Service Image + Add Button */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 110, flexShrink: 0 }}>
                          {srv.image && (
                            <div
                              style={{
                                width: 100,
                                height: 90,
                                borderRadius: 12,
                                overflow: 'hidden',
                                background: '#F1F5F9',
                                marginBottom: -16,
                                zIndex: 1
                              }}
                            >
                              <img
                                src={srv.image}
                                alt={srv.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          )}

                          {/* Add / Quantity Button */}
                          <div style={{ zIndex: 2 }}>
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleAdd(srv)}
                                style={{
                                  background: '#FFFFFF',
                                  border: '1.5px solid #7C3AED',
                                  color: '#7C3AED',
                                  borderRadius: 8,
                                  padding: '7px 22px',
                                  fontSize: 13,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                Add
                              </button>
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  background: '#FAF5FF',
                                  border: '1.5px solid #7C3AED',
                                  borderRadius: 8,
                                  padding: '5px 12px',
                                  color: '#7C3AED',
                                  fontWeight: 800,
                                  fontSize: 13
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => onUpdateQty(srv.id, qty - 1)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: '#7C3AED',
                                    cursor: 'pointer',
                                    display: 'flex'
                                  }}
                                >
                                  <Minus size={14} strokeWidth={3} />
                                </button>
                                <span>{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQty(srv.id, qty + 1)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: '#7C3AED',
                                    cursor: 'pointer',
                                    display: 'flex'
                                  }}
                                >
                                  <Plus size={14} strokeWidth={3} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </main>

          {/* Right Column: UC Promise & Sticky Cart */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* UC Promise Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: '20px 22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  UC Promise
                </h3>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #E0E7FF 0%, #EDE9FE 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #C7D2FE'
                  }}
                >
                  <ShieldCheck size={18} color="#6D28D9" />
                  <span style={{ fontSize: 6.5, fontWeight: 800, color: '#4338CA', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Assured
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#059669" strokeWidth={2.5} />
                  <span>Verified Professionals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#059669" strokeWidth={2.5} />
                  <span>Hassle Free Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} color="#059669" strokeWidth={2.5} />
                  <span>Transparent Pricing</span>
                </div>
              </div>
            </div>

            {/* View Cart Box - Only rendered when cartCount > 0 */}
            {cartCount > 0 && (
              <div
                style={{
                  background: '#6D28D9',
                  borderRadius: 14,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(109, 40, 217, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
                onClick={onOpenCart || onOpenCheckout}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>
                    ₹{cartTotal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.85 }}>
                    {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 14 }}>
                  <span>View Cart</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Mobile / Small Screens */}
      {cartCount > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            left: 20,
            right: 20,
            zIndex: 90,
            background: '#6D28D9',
            borderRadius: 14,
            padding: '14px 20px',
            display: 'none', // Shown via responsive CSS if needed
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(109, 40, 217, 0.4)'
          }}
          className="salon-mobile-floating-cart"
          onClick={onOpenCart || onOpenCheckout}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              ₹{cartTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>
              {cartCount} items
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 14 }}>
            <span>View Cart</span>
            <ChevronRight size={16} />
          </div>
        </div>
      )}
    </div>
  );
}
