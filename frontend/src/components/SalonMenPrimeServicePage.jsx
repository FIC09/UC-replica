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
  ShoppingBag
} from 'lucide-react';

export function SalonMenPrimeServicePage({
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

  // 7 Sidebar Categories (Screenshot 1 of Men's Prime)
  const SIDEBAR_CATEGORIES = [
    { id: 'packages', title: 'Packages', img: '/images/men_prime_packages.jpg' },
    { id: 'haircut-beard', title: 'Haircut & beard styling', img: '/images/men_prime_beard_trim.jpg' },
    { id: 'facial-cleanup', title: 'Facial & cleanup', img: '/images/men_prime_brightening_facial.jpg' },
    { id: 'detan', title: 'Detan', img: '/images/men_prime_face_detan.jpg' },
    { id: 'mani-pedi', title: 'Manicure & pedicure', img: '/images/men_express_pedicure.jpg' },
    { id: 'massage', title: 'Massage', img: '/images/men_prime_head_massage.jpg' },
    { id: 'hair-color', title: 'Hair color', img: '/images/men_prime_matrix_color.jpg' }
  ];

  // Full Catalogue matching Screenshots
  const CATALOGUE_SECTIONS = [
    {
      id: 'packages',
      title: 'Packages',
      services: [
        {
          id: 'men-prime-haircut-massage',
          title: 'Haircut & massage',
          isPackage: true,
          rating: 4.85,
          reviewsCount: '775K reviews',
          price: 388,
          duration: '40 mins',
          image: '/images/beauty_mens_haircut.jpg',
          packageItems: [
            'Haircut: Haircut for men',
            'Massage: 10 min Relaxing Head massage- with oil'
          ]
        },
        {
          id: 'men-prime-grooming-essentials',
          title: 'Grooming essentials',
          tag: 'VALUE SAVER',
          discountBadge: '10% OFF',
          isPackage: true,
          rating: 4.85,
          reviewsCount: '1M reviews',
          price: 532,
          originalPrice: 587,
          duration: '1 hr 5 mins',
          image: '/images/men_beard_trim_pro.jpg',
          packageItems: [
            'Haircut: Haircut for men',
            'Shave/beard grooming: Beard trimming & styling'
          ]
        },
        {
          id: 'men-prime-haircut-color',
          title: 'Haircut & color',
          discountBadge: '10% OFF',
          isPackage: true,
          rating: 4.84,
          reviewsCount: '240K reviews',
          price: 503,
          originalPrice: 558,
          duration: '1 hr 15 mins',
          image: '/images/men_prime_matrix_color.jpg',
          packageItems: [
            'Haircut: Haircut for men',
            'Hair color: Hair color (with product)'
          ]
        },
        {
          id: 'men-prime-hair-care-pkg',
          title: 'Hair & care',
          discountBadge: '10% OFF',
          isPackage: true,
          rating: 4.86,
          reviewsCount: '310K reviews',
          price: 728,
          originalPrice: 808,
          duration: '1 hr 30 mins',
          image: '/images/men_head_massage_pro.jpg',
          packageItems: [
            'Haircut: Haircut for men',
            'Massage: Head massage',
            'Pedicure: Express pedicure'
          ]
        },
        {
          id: 'men-prime-face-care-beyond',
          title: 'Face care & beyond',
          discountBadge: '10% OFF',
          isPackage: true,
          rating: 4.85,
          reviewsCount: '180K reviews',
          price: 788,
          originalPrice: 858,
          duration: '1 hr 15 mins',
          image: '/images/men_prime_charcoal_cleanup.jpg',
          packageItems: [
            'Facial & cleanup: Charcoal de-toxifying cleanup',
            'Haircut: Haircut for men'
          ]
        },
        {
          id: 'men-prime-make-own-pkg',
          title: 'Make your own package',
          discountBadge: '15% OFF',
          isPackage: true,
          rating: 4.87,
          reviewsCount: '450K reviews',
          price: 1386,
          originalPrice: 1606,
          duration: '2 hrs',
          image: '/images/men_prime_combo.jpg',
          packageItems: [
            'Choose any 3 services across Haircut, Facial, Detan & Massage'
          ]
        }
      ]
    },
    {
      id: 'haircut-beard',
      title: 'Haircut & beard styling',
      banner: {
        headline: 'The perfect look for you',
        sub: 'Precision haircuts & beard styling at your doorstep',
        img: '/images/men_prime_haircut_banner.jpg'
      },
      services: [
        {
          id: 'men-prime-haircut-men',
          title: 'Haircut for men',
          tag: 'BESTSELLER',
          rating: 4.86,
          reviewsCount: '2.1M reviews',
          price: 259,
          duration: '35 mins',
          image: '/images/men_prime_haircut_men.jpg',
          description: 'Modern salon haircut with neck trim, sanitised clippers and blow-dry finish'
        },
        {
          id: 'men-prime-haircut-boys',
          title: 'Haircut for boys',
          rating: 4.84,
          reviewsCount: '340K reviews',
          price: 259,
          duration: '35 mins',
          image: '/images/men_prime_haircut_boys.jpg',
          description: 'Comfortable styling for boys under 12 with child-friendly stylists'
        },
        {
          id: 'men-prime-clean-shave',
          title: 'Clean shave',
          rating: 4.85,
          reviewsCount: '510K reviews',
          price: 199,
          duration: '20 mins',
          image: '/images/men_prime_clean_shave.jpg',
          description: 'Ultra-smooth foam shave with fresh disposable blade and cooling balm'
        },
        {
          id: 'men-prime-beard-trim',
          title: 'Beard trimming & styling',
          tag: 'BESTSELLER',
          rating: 4.87,
          reviewsCount: '680K reviews',
          price: 199,
          duration: '20 mins',
          image: '/images/men_prime_beard_trim.jpg',
          description: 'Precision jawline edging, moustache shaping, and conditioning beard wash'
        },
        {
          id: 'men-prime-beard-color',
          title: 'Beard color (with product)',
          rating: 4.82,
          reviewsCount: '120K reviews',
          price: 199,
          duration: '20 mins',
          image: '/images/men_prime_beard_color.jpg',
          description: 'Rich natural black or dark brown tint application with zero skin staining'
        }
      ]
    },
    {
      id: 'facial-cleanup',
      title: 'Facial & cleanup',
      services: [
        {
          id: 'men-prime-brightening-facial',
          title: 'Skin brightening facial',
          tag: 'BESTSELLER',
          rating: 4.86,
          reviewsCount: '140K reviews',
          price: 1399,
          duration: '55 mins',
          image: '/images/men_prime_brightening_facial.jpg',
          description: 'Vitamin C enriched deep cleansing facial with multi-step exfoliation and soothing mask'
        },
        {
          id: 'men-prime-hydrating-facial',
          title: 'Skin hydrating facial',
          rating: 4.84,
          reviewsCount: '98K reviews',
          price: 1399,
          duration: '55 mins',
          image: '/images/men_prime_hydrating_facial.jpg',
          description: 'Intensive hyaluronic hydration therapy restoring dry, tired skin barrier'
        },
        {
          id: 'men-prime-oil-free-cleanup',
          title: 'Oil-free vacation cleanup',
          rating: 4.83,
          reviewsCount: '85K reviews',
          price: 699,
          duration: '35 mins',
          image: '/images/men_prime_oil_free_cleanup.jpg',
          description: 'Sebum-balancing facial cleanup with tea tree essence and pore contraction'
        },
        {
          id: 'men-prime-office-cleanup',
          title: 'Office-ready cleanup',
          rating: 4.85,
          reviewsCount: '115K reviews',
          price: 699,
          duration: '35 mins',
          image: '/images/men_prime_office_cleanup.jpg',
          description: 'Instant radiance cleanup targeting screen fatigue, dullness and dead skin'
        },
        {
          id: 'men-prime-charcoal-cleanup',
          title: 'Charcoal de-toxifying cleanup',
          rating: 4.84,
          reviewsCount: '130K reviews',
          price: 599,
          duration: '30 mins',
          image: '/images/men_prime_charcoal_cleanup.jpg',
          description: 'Activated charcoal peel extracting deep pores impurities and blackheads'
        },
        {
          id: 'men-prime-blackheads',
          title: 'Blackheads removal',
          rating: 4.81,
          reviewsCount: '65K reviews',
          price: 399,
          duration: '20 mins',
          image: '/images/men_prime_blackheads.jpg',
          description: 'Nose and T-zone steam extraction with sterile comedone extractor and astringent rinse'
        }
      ]
    },
    {
      id: 'detan',
      title: 'Detan',
      services: [
        {
          id: 'men-prime-face-detan',
          title: 'Face & neck detan',
          rating: 4.86,
          reviewsCount: '210K reviews',
          price: 399,
          duration: '20 mins',
          image: '/images/men_prime_face_detan.jpg',
          description: 'Sun damage reversal peel with lemon and papaya enzymes'
        },
        {
          id: 'men-prime-hands-detan',
          title: 'Hands detan',
          rating: 4.83,
          reviewsCount: '75K reviews',
          price: 399,
          duration: '30 mins',
          image: '/images/men_prime_hands_detan.jpg',
          description: 'Full arms and hands tan lightening with gentle micro-crystals'
        }
      ]
    },
    {
      id: 'mani-pedi',
      title: 'Manicure & pedicure',
      banner: {
        headline: 'Reset ritual for tired feet',
        sub: 'Deep cleansing scrubs, callus removal & relaxation',
        img: '/images/men_prime_pedicure_banner.jpg'
      },
      services: [
        {
          id: 'men-prime-lemon-pedicure',
          title: 'Brightening lemon deep cleanse pedicure',
          tag: 'BESTSELLER',
          rating: 4.85,
          reviewsCount: '110K reviews',
          price: 799,
          duration: '50 mins',
          image: '/images/men_prime_lemon_pedicure.jpg',
          description: 'Warm lemon bath, pumice callus scrubbing, and calming massage'
        },
        {
          id: 'men-prime-choco-pedicure',
          title: 'Chocolate & vanilla sole rejuvenating pedicure',
          rating: 4.87,
          reviewsCount: '42K reviews',
          price: 899,
          originalPrice: 949,
          duration: '55 mins',
          image: '/images/men_prime_choco_pedicure.jpg',
          description: 'Antioxidant rich cocoa butter scrub with vanilla bean moisture wrap'
        },
        {
          id: 'men-prime-express-pedicure',
          title: 'Brightening lemon express pedicure',
          rating: 4.81,
          reviewsCount: '55K reviews',
          price: 549,
          duration: '35 mins',
          image: '/images/men_prime_express_pedicure.jpg',
          description: 'Quick soak, cuticle care and lemon foot scrub for quick grooming'
        },
        {
          id: 'men-prime-express-manicure',
          title: 'Express manicure',
          rating: 4.82,
          reviewsCount: '48K reviews',
          price: 499,
          duration: '30 mins',
          image: '/images/men_prime_express_manicure.jpg',
          description: 'Fingernail trimming, filing, cuticle pushback, and nourishing hand cream'
        },
        {
          id: 'men-prime-nail-cut-hands',
          title: 'Nail cut & file (hands)',
          rating: 4.84,
          reviewsCount: '25K reviews',
          price: 99,
          duration: '10 mins',
          image: '/images/men_prime_nail_cut_hands.jpg',
          description: 'Quick clipper and emery board nail trim for hands'
        },
        {
          id: 'men-prime-nail-cut-feet',
          title: 'Nail cut & file (feet)',
          rating: 4.85,
          reviewsCount: '28K reviews',
          price: 99,
          duration: '10 mins',
          image: '/images/men_prime_nail_cut_feet.jpg',
          description: 'Quick toenail clipping and neat edge shaping'
        },
        {
          id: 'men-prime-foot-calf-massage',
          title: 'Foot & calf massage',
          rating: 4.88,
          reviewsCount: '62K reviews',
          price: 199,
          duration: '15 mins',
          image: '/images/men_prime_foot_calf_massage.jpg',
          description: 'Pressure point relief for calf muscles, heels and soles'
        }
      ]
    },
    {
      id: 'massage',
      title: 'Massage',
      services: [
        {
          id: 'men-prime-head-massage',
          title: 'Head massage',
          rating: 4.87,
          reviewsCount: '380K reviews',
          price: 121,
          duration: '10 mins',
          image: '/images/men_prime_head_massage.jpg',
          description: 'Energizing oil massage boosting scalp circulation and melting away stress'
        },
        {
          id: 'men-prime-hair-strengthen-massage',
          title: 'Hair Strengthening Head Massage',
          rating: 4.89,
          reviewsCount: '95K reviews',
          price: 149,
          duration: '15 mins',
          optionsCount: 2,
          image: '/images/men_prime_hair_strengthen_massage.jpg',
          description: 'Enriched with onion seed and rosemary oil to prevent hair fall and nourish roots'
        },
        {
          id: 'men-prime-head-neck-shoulder',
          title: 'Head, neck & shoulder massage',
          rating: 4.88,
          reviewsCount: '160K reviews',
          price: 299,
          duration: '30 mins',
          image: '/images/men_prime_head_neck_shoulder.jpg',
          description: 'Comprehensive upper body therapy easing stiff traps and neck tightness'
        },
        {
          id: 'men-prime-hydrating-face-massage',
          title: 'Hydrating face massage (10 mins)',
          rating: 4.84,
          reviewsCount: '40K reviews',
          price: 149,
          duration: '10 mins',
          image: '/images/men_prime_hydrating_face_massage.jpg',
          description: 'Lymphatic drainage face massage with aloe vera gel for quick revival'
        },
        {
          id: 'men-prime-neck-shoulder',
          title: 'Neck & shoulder massage',
          rating: 4.86,
          reviewsCount: '70K reviews',
          price: 199,
          duration: '20 mins',
          image: '/images/men_prime_neck_shoulder.jpg',
          description: 'Focused relief for computer posture fatigue and scapular tension'
        }
      ]
    },
    {
      id: 'hair-color',
      title: 'Hair color',
      banner: {
        headline: 'Spill-free application',
        sub: 'Clean, mess-free professional color application at home',
        img: '/images/men_prime_hair_color_banner.jpg'
      },
      services: [
        {
          id: 'men-prime-hair-color-only',
          title: 'Hair color (only application)',
          rating: 4.82,
          reviewsCount: '190K reviews',
          price: 199,
          duration: '25 mins',
          image: '/images/men_hair_color_only.jpg',
          description: 'Flawless brush application by trained pros (product provided by customer)'
        },
        {
          id: 'men-prime-garnier-color',
          title: 'Garnier hair color',
          rating: 4.85,
          reviewsCount: '145K reviews',
          price: 299,
          duration: '35 mins',
          optionsCount: 3,
          image: '/images/men_prime_garnier_color.jpg',
          description: 'Ammonia-free Garnier Color Naturals with olive, almond and avocado oil'
        },
        {
          id: 'men-prime-matrix-color',
          title: "L'Oreal matrix hair color",
          rating: 4.87,
          reviewsCount: '110K reviews',
          price: 449,
          duration: '40 mins',
          optionsCount: 3,
          image: '/images/men_prime_matrix_color.jpg',
          description: 'Salon-grade Matrix Socolor cream dye for rich, long-lasting multidimensional color'
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
    const el = document.getElementById(`prime-section-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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
          {/* Left: Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
                FIC
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', letterSpacing: -0.3 }}>
                Forge India Connect
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
                {/chennai|poonamalle|adayalampattu|tiruvallur/i.test(selectedLocality) ? 'Rayakottai Road' : (selectedLocality || 'Rayakottai Road')}, {/chennai|poonamalle|adayalampattu|tiruvallur/i.test(selectedCity) ? 'Krishnagiri' : (selectedCity || 'Krishnagiri')}
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
                placeholder="Search in Salon Prime"
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
            Salon Prime for Men
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
              <span>4.85</span>
            </div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              (2.4 M bookings)
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
                      {cat.iconType === 'package' && !cat.img ? (
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
                id={`prime-section-${sec.id}`}
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

                {/* Banner if present */}
                {sec.banner && (
                  <div
                    style={{
                      borderRadius: 12,
                      overflow: 'hidden',
                      marginBottom: 20,
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ padding: '16px 20px' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                        {sec.banner.headline}
                      </h3>
                      <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
                                  letterSpacing: '0.04em'
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
                                  letterSpacing: '0.04em'
                                }}
                              >
                                {srv.tag}
                              </div>
                            )}

                            {srv.discountBadge && (
                              <div
                                style={{
                                  display: 'inline-block',
                                  background: '#FEF3C7',
                                  color: '#B45309',
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: '2px 6px',
                                  borderRadius: 4
                                }}
                              >
                                {srv.discountBadge}
                              </div>
                            )}
                          </div>

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
            display: 'none',
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
