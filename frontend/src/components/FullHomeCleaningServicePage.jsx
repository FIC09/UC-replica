import React, { useState, useMemo, useRef } from 'react';
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
  Sparkles, 
  X,
  ChevronRight,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  Award,
  Play,
  Pause,
  ChevronDown,
  Home,
  Check
} from 'lucide-react';

export function FullHomeCleaningServicePage({
  onBackHome,
  selectedCity = 'Chennai',
  selectedLocality = '4744+HMQ, N Town Internal Rd',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast = () => {}
}) {
  const [activeCategory, setActiveCategory] = useState('furnished'); 
  // 'furnished' | 'unfurnished' | 'by-room' | 'sofa-carpet'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef(null);

  const CATEGORIES = [
    {
      id: 'furnished',
      title: 'Furnished home',
      subtitle: 'Complete occupied house deep cleaning',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* House body */}
          <rect x="12" y="15" width="34" height="26" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
          <path d="M9 16L29 4L49 16" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sofa inside window */}
          <rect x="16" y="24" width="13" height="13" rx="1.5" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="0.8" />
          <path d="M18 31H27" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" />
          {/* Door */}
          <rect x="33" y="25" width="9" height="16" rx="1" fill="#78350F" />
          <circle cx="40" cy="33" r="0.9" fill="#FCD34D" />
        </svg>
      )
    },
    {
      id: 'unfurnished',
      title: 'Unfurnished / Move-in',
      subtitle: 'Post-renovation & vacant apartment restoration',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Modern Cantilever House */}
          <rect x="13" y="14" width="32" height="26" rx="2" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.2" />
          <rect x="10" y="11" width="38" height="4" rx="1" fill="#334155" />
          {/* Floor machine buffing icon */}
          <circle cx="23" cy="27" r="7" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.4" />
          <circle cx="23" cy="27" r="2.5" fill="#0F172A" />
          <line x1="23" y1="20" x2="31" y2="15" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          {/* Sparkle */}
          <path d="M37 25L39 21L41 25L45 27L41 29L39 33L37 29L33 27L37 25Z" fill="#F59E0B" />
        </svg>
      )
    },
    {
      id: 'by-room',
      title: 'Room cleaning',
      subtitle: 'Single bedroom or living area deep clean',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bedroom Wall */}
          <rect x="11" y="9" width="36" height="32" rx="2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" />
          {/* Headboard */}
          <rect x="16" y="19" width="26" height="10" rx="1.5" fill="#475569" />
          {/* Bed mattress */}
          <rect x="14" y="27" width="30" height="12" rx="2" fill="#FFFFFF" stroke="#64748B" strokeWidth="1" />
          {/* Pillows */}
          <rect x="17" y="23" width="10" height="5" rx="1" fill="#E2E8F0" />
          <rect x="31" y="23" width="10" height="5" rx="1" fill="#E2E8F0" />
        </svg>
      )
    },
    {
      id: 'sofa-carpet',
      title: 'Sofa & Carpet clean',
      subtitle: 'Shampooing & steam extraction',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sofa frame */}
          <rect x="11" y="17" width="36" height="20" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.2" />
          {/* Cushions */}
          <rect x="15" y="23" width="13" height="12" rx="1.5" fill="#BFDBFE" />
          <rect x="30" y="23" width="13" height="12" rx="1.5" fill="#BFDBFE" />
          {/* Armrests */}
          <rect x="8" y="20" width="6" height="18" rx="2" fill="#1D4ED8" />
          <rect x="44" y="20" width="6" height="18" rx="2" fill="#1D4ED8" />
          {/* Legs */}
          <rect x="14" y="39" width="3" height="4" fill="#0F172A" />
          <rect x="41" y="39" width="3" height="4" fill="#0F172A" />
        </svg>
      )
    }
  ];

  const PRODUCTS = [
    // 1. FURNISHED HOME DEEP CLEANING
    {
      id: 'furnished-home-1bhk',
      category: 'furnished',
      title: 'Furnished Apartment Deep Cleaning (1 BHK)',
      rating: '4.82',
      reviewsCount: '420K reviews',
      price: 2499,
      originalPrice: 2999,
      duration: '4-5 hrs',
      badge: 'ALL-IN-ONE',
      tag: 'Team of 2 Pros',
      image: '/images/home_floor_machine.jpg',
      description: 'End-to-end mechanized deep cleaning of occupied 1 BHK: 1 Bedroom, 1 Bathroom, Kitchen, Living Room, Balcony & interior windows with rotary disc scrubbers.',
      inclusions: [
        'Mechanized single disc scrubbing of all floor tiles',
        'Complete bathroom descaling & machine wash',
        'Kitchen countertop, stove, wall tile & chimney exterior degreasing',
        'Bed, sofa & curtain high-power dry vacuuming',
        'Balcony wash & window tracks dust evacuation'
      ],
      exclusions: ['Interior cabinet unloading (available as add-on)', 'Wall paint washing']
    },
    {
      id: 'furnished-home-2bhk',
      category: 'furnished',
      title: 'Furnished Apartment Deep Cleaning (2 BHK)',
      rating: '4.86',
      reviewsCount: '950K reviews',
      price: 3499,
      originalPrice: 4199,
      duration: '5-6 hrs',
      badge: 'MOST POPULAR',
      tag: 'Team of 3 Pros',
      image: '/images/home_floor_machine.jpg',
      description: 'Our signature whole-house deep cleaning for 2 BHK: 2 Bedrooms, 2 Bathrooms, Kitchen, Living & Dining Hall, Balconies & ceiling fixtures.',
      inclusions: [
        'High-RPM rotary scrubbing machine on all tiled floors',
        '2 Bathrooms sanitized with Diversey certified chemicals',
        'Kitchen complete oil, grease & grime eradication',
        'Ceiling fans, switchboards, tube lights & AC exterior wipe',
        'Door frames, baseboard skirting & glass sliding doors polished'
      ],
      exclusions: ['Terrace cleaning or exterior wall climbing']
    },
    {
      id: 'furnished-home-3bhk',
      category: 'furnished',
      title: 'Furnished Apartment Deep Cleaning (3 BHK)',
      rating: '4.88',
      reviewsCount: '680K reviews',
      price: 4499,
      originalPrice: 5499,
      duration: '6-7 hrs',
      badge: 'PREMIUM CARE',
      tag: 'Team of 4 Pros',
      image: '/images/home_floor_machine.jpg',
      description: 'Master clean for large 3 BHK homes: heavy duty rotary buffing across 3 bedrooms, 3 bathrooms, kitchen, huge living room and utility areas.',
      inclusions: [
        '3 Full bathrooms machine scrubbed and descaled',
        'Kitchen deep degrease including exhaust & sink',
        'Industrial vacuum suction across all rooms',
        'Full furniture dusting, mirror polish & wardrobe exterior wiping',
        'Antibacterial whole-home fragrance fogging'
      ],
      exclusions: ['Chandelier dismantling']
    },

    // 2. UNFURNISHED / MOVE-IN
    {
      id: 'unfurnished-movein-1-2bhk',
      category: 'unfurnished',
      title: 'Unfurnished / Move-in Deep Cleaning (1-2 BHK)',
      rating: '4.84',
      reviewsCount: '310K reviews',
      price: 2899,
      originalPrice: 3499,
      duration: '4-5 hrs',
      badge: 'POST-RENOVATION',
      tag: 'Restoration Specialist',
      image: '/images/cleaning_bedroom_bucket.jpg',
      description: 'Intensive restoration cleaning for empty vacant apartments before moving in: removes paint drips, cement haze, adhesive residues & drywall dust.',
      inclusions: [
        'Chemical scraping of paint splatters and cement marks',
        'Floor to ceiling wall dusting and cobweb removal',
        'Full bathroom limescale descaling & sanitization',
        'Kitchen modular cabinets inside-out vacuum and wipe',
        'Balcony pressure jet wash'
      ],
      exclusions: ['Tile re-grouting or civil works']
    },
    {
      id: 'unfurnished-movein-3bhk',
      category: 'unfurnished',
      title: 'Unfurnished / Move-in Deep Cleaning (3 BHK)',
      rating: '4.87',
      reviewsCount: '290K reviews',
      price: 3999,
      originalPrice: 4899,
      duration: '5-6 hrs',
      badge: 'EMPTY FLAT PRO',
      tag: 'Team of 3 Pros',
      image: '/images/cleaning_bedroom_bucket.jpg',
      description: 'Complete blank-slate cleaning for 3 BHK empty flat: ensures 100% germ-free, spotless floors, sparkling windows & sanitized bathrooms before furniture arrives.',
      inclusions: [
        'Full apartment mechanized floor scrubbing with single disc rotary',
        'All empty wardrobes, kitchen cabinets cleaned inside & outside',
        '3 Bathrooms acid-free descaling and high-pressure steam sanitization',
        'Window tracks and glass sliding panels cleaned'
      ],
      exclusions: ['Repainting or wood polishing']
    },

    // 3. BY-ROOM CLEANING
    {
      id: 'single-bedroom-deep-clean',
      category: 'by-room',
      title: 'Single Bedroom Deep Cleaning',
      rating: '4.79',
      reviewsCount: '340K reviews',
      price: 899,
      originalPrice: 1199,
      duration: '90 mins',
      badge: 'BEDROOM CARE',
      tag: 'Verified Cleaner',
      image: '/images/cleaning_bedroom_bucket.jpg',
      description: 'Thorough cleaning of 1 bedroom: mattress dry vacuuming, floor machine scrub, wardrobe exterior wipe, ceiling fan descaling & mirror buffing.',
      inclusions: [
        'Floor tile single disc rotary scrubbing',
        'Mattress & curtain dust extraction with HEPA vacuum',
        'Window panes and grill dusting',
        'Fan blades, switchboard & AC filter cleaning'
      ],
      exclusions: ['Attached bathroom (can be added separately)']
    },
    {
      id: 'living-room-balcony-clean',
      category: 'by-room',
      title: 'Living Room & Balcony Deep Cleaning',
      rating: '4.81',
      reviewsCount: '280K reviews',
      price: 1299,
      originalPrice: 1599,
      duration: '2 hrs',
      badge: 'GUEST READY',
      tag: 'High Impact',
      image: '/images/home_floor_machine.jpg',
      description: 'Make your living room sparkle: sofa & rug dry vacuuming, TV unit & glass coffee table buffing, floor machine scrubbing, and balcony floor jet wash.',
      inclusions: [
        'Living & dining floor rotary machine buffing',
        'Sofa & cushions high-power dry vacuuming',
        'Balcony floor scrub & bird dropping removal',
        'Sliding door glass track cleanout'
      ],
      exclusions: ['Sofa wet shampooing (available in Sofa pack)']
    },

    // 4. SOFA & CARPET STEAM CLEANING
    {
      id: 'sofa-shampoo-3seater',
      category: 'sofa-carpet',
      title: 'Sofa Deep Cleaning & Shampooing (3 Seater)',
      rating: '4.83',
      reviewsCount: '510K reviews',
      price: 599,
      originalPrice: 799,
      duration: '60 mins',
      badge: 'STAINS REMOVED',
      tag: 'Injection-Extraction',
      image: '/images/home_sofa_clean.jpg',
      description: '3-Step injection-extraction deep shampooing: active foam application, scrub with soft nylon brush, and powerful moisture extraction for 99% stain removal.',
      inclusions: [
        'Heavy dust extraction with industrial vacuum',
        'Diversey fabric shampoo foam scrub',
        'High-power moisture vacuum extraction (dries in 3-4 hrs)',
        'Removal of food stains, tea marks & sweat odors'
      ],
      exclusions: ['Leather sofa restoration (available as specialized service)']
    },
    {
      id: 'carpet-rug-deep-clean',
      category: 'sofa-carpet',
      title: 'Carpet & Rug Steam Cleaning (Up to 50 sq ft)',
      rating: '4.80',
      reviewsCount: '240K reviews',
      price: 499,
      originalPrice: 699,
      duration: '45 mins',
      badge: 'MITE FREE',
      tag: 'Deep Fiber Care',
      image: '/images/home_sofa_clean.jpg',
      description: 'Deep fiber sanitization for living room rugs & carpets: removes embedded dust, pet hair, allergens, and brightens original colors.',
      inclusions: [
        'Dual-direction dry vacuuming to lift matted pile',
        'Spot treatment for stubborn grease and juice stains',
        'Antibacterial shampooing & rotary bristle wash',
        '90% moisture extraction'
      ],
      exclusions: ['Silk or antique handmade oriental rug dry cleaning']
    }
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

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

  function toggleVideo() {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlayingVideo(true);
    }
  }

  return (
    <div className="full-home-cleaning-page-wrapper" style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#0F172A'
    }}>
      {/* 1. TOP NAVBAR (MATCHES SCREENSHOT 1:1) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '10px 24px'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Left: Brand Logo & Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              title="Return to Home"
              style={{
                background: '#F3F4F6',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#111827'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Urban Company Logo */}
            <div 
              onClick={onBackHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: '-0.5px',
                padding: '4px 6px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                FIC
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                Forge India Connect
              </div>
            </div>
          </div>

          {/* Middle: Location Selector & Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: '1',
            maxWidth: 680,
            justifyContent: 'center'
          }}>
            {/* Address Selector */}
            <div 
              onClick={onOpenLocationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: '#111827',
                fontWeight: 500,
                maxWidth: 260,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={`${selectedLocality}, ${selectedCity}`}
            >
              <MapPin size={15} color="#4B5563" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedLocality || '4744+HMQ, N Town Internal Rd-...'}
              </span>
              <ChevronDown size={14} color="#6B7280" style={{ flexShrink: 0 }} />
            </div>

            {/* Search Input */}
            <div style={{
              position: 'relative',
              flex: 1,
              maxWidth: 380
            }}>
              <Search 
                size={16} 
                color="#6B7280" 
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input
                type="text"
                placeholder="Search in Full Home Cleaning"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  boxSizing: 'border-box'
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
                    color: '#9CA3AF'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Cart Button */}
          <button
            type="button"
            onClick={onOpenCart || onOpenCheckout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              backgroundColor: cartItemsCount > 0 ? '#111827' : '#F3F4F6',
              color: cartItemsCount > 0 ? '#FFFFFF' : '#111827',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span style={{
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
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
      </header>

      {/* 2. HERO SECTION */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '32px 24px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: 36,
          alignItems: 'start'
        }} className="home-hero-layout">

          {/* LEFT COLUMN: TITLE, RATING, SELECT A SERVICE */}
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.8px',
              lineHeight: 1.15
            }}>
              Full Home Cleaning
            </h1>

            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#6E42E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                4.86
              </span>
              <span style={{
                fontSize: 14,
                color: '#6B7280',
                borderBottom: '1px dotted #9CA3AF',
                cursor: 'pointer'
              }}>
                (1.5 M bookings)
              </span>
            </div>

            {/* "Select a service" Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '18px 16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6B7280',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap'
                }}>
                  Select a service
                </span>
                <div style={{ height: 1, backgroundColor: '#E5E7EB', flex: 1 }} />
              </div>

              {/* 4 Interactive Service Tiles in 2x2 Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12
              }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery('');
                        const el = document.getElementById('full-home-services-list');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: 78,
                          backgroundColor: isSelected ? '#F3F4F6' : '#F9FAFB',
                          borderRadius: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected ? '1.5px solid #111827' : '1px solid #E5E7EB',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.02)' : 'none'
                        }}
                      >
                        {cat.renderIcon()}
                      </div>

                      <span style={{
                        marginTop: 7,
                        fontSize: 12,
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? '#111827' : '#4B5563',
                        lineHeight: 1.25,
                        maxWidth: 130
                      }}>
                        {cat.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guarantee */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 18,
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              fontSize: 12,
              color: '#475569'
            }}>
              <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
              <span>
                <strong>Urban Company Full Home Assurance:</strong> 100% background-checked team, industrial grade rotary scrubbers & Diversey chemicals.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: VIDEO SHOWCASE */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 400,
            backgroundColor: '#0F172A',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <img 
              src="/images/home_floor_machine.jpg" 
              alt="Full Home Deep Cleaning Machine Scrubbing" 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.8)'
              }}
            />

            <video 
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isPlayingVideo ? 'block' : 'none'
              }}
              onEnded={() => setIsPlayingVideo(false)}
            />

            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)'
            }} />

            <div style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              color: '#FFFFFF',
              padding: '0 24px',
              maxWidth: 520
            }}>
              <h2 style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                margin: '0 0 16px 0',
                textShadow: '0 3px 12px rgba(0,0,0,0.85)',
                lineHeight: 1.2
              }}>
                Complete home transformation <br />
                <span style={{ color: '#FDE047' }}>with mechanized care...</span>
              </h2>

              <button
                type="button"
                onClick={toggleVideo}
                title={isPlayingVideo ? "Pause" : "Watch Full Home Cleaning in Action"}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  transition: 'transform 0.15s ease',
                  color: '#111827'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlayingVideo ? (
                  <Pause size={24} fill="#111827" strokeWidth={0} />
                ) : (
                  <Play size={24} fill="#111827" strokeWidth={0} style={{ marginLeft: 3 }} />
                )}
              </button>
            </div>

            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 20,
              right: 20,
              zIndex: 10,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  High-Power Single Disc Rotary Floor Buffing
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  Restores 98% of tile shine, grout brightness & removes sticky grime
                </div>
              </div>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700
              }}>
                1:30 MIN PREVIEW
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES CATALOGUE */}
      <section id="full-home-services-list" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '24px 24px 100px',
        boxSizing: 'border-box'
      }}>
        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: 14,
          marginBottom: 24,
          overflowX: 'auto'
        }}>
          {CATEGORIES.map((cat) => {
            const isTabActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: isTabActive ? '1.5px solid #111827' : '1px solid #E5E7EB',
                  backgroundColor: isTabActive ? '#111827' : '#FFFFFF',
                  color: isTabActive ? '#FFFFFF' : '#4B5563',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.title}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: activeCategory === 'all' ? '1.5px solid #111827' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === 'all' ? '#111827' : '#FFFFFF',
              color: activeCategory === 'all' ? '#FFFFFF' : '#4B5563',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Services ({PRODUCTS.length})
          </button>
        </div>

        {/* Section Heading */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {activeCategory === 'furnished' && 'Furnished Apartment Full Home Cleaning'}
            {activeCategory === 'unfurnished' && 'Unfurnished / Move-in Restoration Cleaning'}
            {activeCategory === 'by-room' && 'By-Room Cleaning (Bedroom & Living Area)'}
            {activeCategory === 'sofa-carpet' && 'Sofa Shampooing & Carpet Steam Cleaning'}
            {activeCategory === 'all' && 'All Full Home & Room Cleaning Packages'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Showing {filteredProducts.length} verified comprehensive cleaning packages
          </p>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 22
        }}>
          {filteredProducts.map((product) => {
            const qty = cart[product.id]?.qty || 0;
            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E5E7EB',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10
                  }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      padding: '2px 8px',
                      borderRadius: 4,
                      letterSpacing: '0.04em'
                    }}>
                      {product.badge}
                    </span>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#111827'
                    }}>
                      <Star size={12} fill="#6E42E5" color="#6E42E5" />
                      <span>{product.rating}</span>
                      <span style={{ color: '#6B7280', fontWeight: 500 }}>
                        ({product.reviewsCount})
                      </span>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 6px 0',
                    lineHeight: 1.3
                  }}>
                    {product.title}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: '#6B7280',
                    marginBottom: 10
                  }}>
                    <Clock size={12} />
                    <span>{product.duration}</span>
                    <span>•</span>
                    <span>{product.tag}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    marginBottom: 12
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  <p style={{
                    fontSize: 13,
                    color: '#4B5563',
                    lineHeight: 1.5,
                    margin: '0 0 14px 0'
                  }}>
                    {product.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {product.inclusions.slice(0, 2).map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#374151' }}>
                        <CheckCircle2 size={13} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDetailProduct(product)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#6E42E5',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 16
                    }}
                  >
                    <span>View details</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  borderTop: '1px solid #F3F4F6'
                }}>
                  <div style={{
                    width: 72,
                    height: 54,
                    borderRadius: 8,
                    overflow: 'hidden',
                    backgroundColor: '#F3F4F6'
                  }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ minWidth: 110 }}>
                    {qty > 0 ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #6E42E5',
                        borderRadius: 8,
                        padding: '5px 10px',
                        boxShadow: '0 2px 8px rgba(110, 66, 229, 0.15)'
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
                            color: '#6E42E5',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#6E42E5' }}>
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
                            color: '#6E42E5',
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
                          padding: '8px 16px',
                          backgroundColor: '#FFFFFF',
                          color: '#6E42E5',
                          border: '1.5px solid #6E42E5',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#6E42E5';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.color = '#6E42E5';
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
      </section>

      {/* 4. DETAILS MODAL */}
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
              maxWidth: 540,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                zIndex: 10
              }}
            >
              <X size={18} color="#0F172A" />
            </button>

            <div style={{ height: 210, width: '100%', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
              <img 
                src={selectedDetailProduct.image} 
                alt={selectedDetailProduct.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  {selectedDetailProduct.badge}
                </span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {selectedDetailProduct.duration}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                {selectedDetailProduct.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                  ₹{selectedDetailProduct.price}
                </span>
                {selectedDetailProduct.originalPrice && (
                  <span style={{ fontSize: 14, color: '#9CA3AF', textDecoration: 'line-through' }}>
                    ₹{selectedDetailProduct.originalPrice}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {selectedDetailProduct.description}
              </p>

              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                  What's included in this service:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDetailProduct.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                      <CheckCircle2 size={15} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDetailProduct.exclusions && selectedDetailProduct.exclusions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                    What's not included:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedDetailProduct.exclusions.map((exc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#6B7280' }}>
                        <X size={13} color="#EF4444" style={{ flexShrink: 0 }} />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  backgroundColor: '#111827',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 10
                }}
              >
                <Plus size={16} />
                <span>Add to Cart • ₹{selectedDetailProduct.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. STICKY BOTTOM CART BAR */}
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
              backgroundColor: '#6E42E5',
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
