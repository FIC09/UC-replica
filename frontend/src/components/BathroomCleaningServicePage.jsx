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
  Info
} from 'lucide-react';

export function BathroomCleaningServicePage({
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
  const [activeCategory, setActiveCategory] = useState('one-time'); // 'value-deals' | 'one-time' | 'mini-services'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef(null);

  const CATEGORIES = [
    {
      id: 'value-deals',
      title: 'Value deals',
      subtitle: 'Multi-bathroom packs & combos',
      renderIcon: () => (
        <div style={{
          width: 58,
          height: 48,
          borderRadius: 8,
          border: '1.5px solid #059669',
          backgroundColor: '#ECFDF5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.1,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#047857', letterSpacing: '0.04em' }}>
            COMBO
          </span>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#047857', letterSpacing: '0.04em' }}>
            DEALS
          </span>
        </div>
      )
    },
    {
      id: 'one-time',
      title: 'One time deep clean',
      subtitle: 'Complete single/double bathroom visit',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cistern Tank */}
          <rect x="21" y="6" width="16" height="15" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
          <rect x="20" y="5" width="18" height="2.5" rx="1" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.8" />
          <ellipse cx="29" cy="4.8" rx="2" ry="0.8" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.6" />
          {/* Flush push button */}
          <circle cx="29" cy="11" r="1.6" fill="#94A3B8" />
          {/* Seat Rim */}
          <ellipse cx="29" cy="24" rx="13" ry="5.5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" />
          {/* Bowl Front Curve */}
          <path d="M17 24C17 33 22 38 29 38C36 38 41 33 41 24" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
          {/* Base Foot */}
          <path d="M23 38L22 43H36L35 38" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'mini-services',
      title: 'Mini services',
      subtitle: 'Taps, washbasin & stain removal',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chrome Tap */}
          <path d="M29 6V11M29 6H26C24.5 6 24 7 24 8.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M27 9L29 11L31 9" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
          {/* Basin Bowl Top Oval */}
          <ellipse cx="29" cy="16" rx="19" ry="6.5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.3" />
          <ellipse cx="29" cy="16.5" rx="13" ry="3.8" fill="#E2E8F0" />
          <circle cx="29" cy="17" r="1.5" fill="#64748B" />
          {/* Basin Under Curve */}
          <path d="M11 16C11 24 18 27 29 27C40 27 47 24 47 16" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.3" />
          {/* Pedestal Stand */}
          <path d="M24 27L22 42H36L34 27" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" strokeLinejoin="round" />
          <rect x="20" y="42" width="18" height="2" rx="0.5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.8" />
        </svg>
      )
    }
  ];

  const PRODUCTS = [
    // ONE TIME DEEP CLEAN (Default View from user request "single bathroom visit")
    {
      id: 'classic-bathroom-cleaning',
      category: 'one-time',
      title: 'Classic Bathroom Cleaning (1 Bathroom)',
      rating: '4.76',
      reviewsCount: '3.1M reviews',
      price: 419,
      originalPrice: 499,
      duration: '40 mins',
      badge: 'POPULAR CHOICE',
      tag: 'Verified Cleaner',
      image: '/images/home_bathroom.jpg',
      description: 'Complete one-time cleaning of 1 bathroom: floor, wall tiles, WC toilet bowl, washbasin, taps & mirrors with professional Diversey chemicals.',
      inclusions: [
        'Diversey Taski R1 & R6 cleaning solutions',
        'Manual scrubbing of floor & wall tiles up to 6 ft',
        'WC commode descaling and inner rim sanitization',
        'Chrome tap and washbasin buffing'
      ],
      exclusions: ['Single disc mechanized scrubbing machine (available in Intense)', 'Exhaust fan deep degreasing']
    },
    {
      id: 'intense-bathroom-cleaning',
      category: 'one-time',
      title: 'Intense Bathroom Cleaning (1 Bathroom)',
      rating: '4.83',
      reviewsCount: '4.2M reviews',
      price: 519,
      originalPrice: 599,
      duration: '50 mins',
      badge: 'BESTSELLER',
      tag: 'Machine Scrubbing',
      image: '/images/home_bathroom.jpg',
      description: 'Heavy duty stain removal using high-RPM mechanized single disc tile scrubber & premium anti-limescale chemicals. Restores 95% floor brightness.',
      inclusions: [
        'High-RPM single disc scrubbing machine for floor tiles',
        'Acid-free Diversey limescale remover for hard water stains',
        'Thorough grout stain removal & mold sanitization',
        'Mirror descaling & shower glass partition polishing'
      ],
      exclusions: ['Ceiling paint scraping or plumbing repairs']
    },
    {
      id: 'movein-bathroom-cleaning',
      category: 'one-time',
      title: 'Move-in / Vacant Apartment Bathroom Deep Clean',
      rating: '4.86',
      reviewsCount: '640K reviews',
      price: 649,
      originalPrice: 749,
      duration: '60 mins',
      badge: 'DEEP RESTORATION',
      tag: 'Restoration Specialist',
      image: '/images/cleaning_bedroom_bucket.jpg',
      description: 'Intensive restoration cleaning for new move-ins, post-renovation dust, paint specks, cement haze, and long-standing yellow stains.',
      inclusions: [
        'Removal of paint specks, cement splatters & adhesive marks',
        'Full height wall tile scrubbing (floor to ceiling)',
        'Exhaust fan blades & cover chemical degreasing',
        'Drain trap sludge clearing and deodorization'
      ],
      exclusions: ['Broken tile replacement or silicone re-sealing']
    },

    // VALUE DEALS (Combos & Multi-bathroom packages)
    {
      id: 'intense-cleaning-2-bathroom',
      category: 'value-deals',
      title: 'Intense Cleaning (2 Bathrooms)',
      rating: '4.81',
      reviewsCount: '1.8M reviews',
      price: 1018,
      originalPrice: 1098,
      duration: '80 mins',
      badge: 'SUPER SAVER',
      tag: 'Machine Scrubbing',
      image: '/images/home_bathroom.jpg',
      description: 'Intense mechanized deep cleaning for 2 bathrooms. Save ₹80 compared to single bookings with Diversey chemicals and mechanized floor scrubbing.',
      inclusions: [
        'Both bathrooms mechanized single disc floor scrubbing',
        'Diversey Taski R6 toilet bowl descaling for 2 WCs',
        'All chrome taps, showers, and basins mirror-buffed',
        'Grout line brightening and anti-fungal treatment'
      ],
      exclusions: ['Exhaust fan motor replacement']
    },
    {
      id: 'classic-cleaning-2-bathroom',
      category: 'value-deals',
      title: 'Classic Cleaning (2 Bathrooms)',
      rating: '4.78',
      reviewsCount: '950K reviews',
      price: 829,
      originalPrice: 899,
      duration: '60 mins',
      badge: 'VALUE PACK',
      tag: 'Verified Cleaner',
      image: '/images/home_bathroom.jpg',
      description: 'Manual deep scrubbing and sanitization of 2 bathrooms at discounted package rate.',
      inclusions: [
        'Full scrubbing of 2 bathrooms including walls & floor',
        'Toilet bowl stain removal and sanitization',
        'Washbasin & faucet descaling',
        'Mirror and glass wipe-down'
      ],
      exclusions: ['Mechanized floor buffer machine']
    },
    {
      id: 'intense-cleaning-3-bathroom',
      category: 'value-deals',
      title: 'Intense Cleaning (3 Bathrooms)',
      rating: '4.83',
      reviewsCount: '820K reviews',
      price: 1499,
      originalPrice: 1649,
      duration: '120 mins',
      badge: 'MEGA VALUE',
      tag: 'Team of 2 Cleaners',
      image: '/images/home_floor_machine.jpg',
      description: 'Complete intensive machine cleaning for 3 full bathrooms. Executed simultaneously by trained 2-pro team for fast, sparkling results.',
      inclusions: [
        '3 Bathrooms machine scrubbed & sanitized',
        'Anti-bacterial disinfectant spray application',
        'Complete hard water scale removal across 3 sets of taps',
        'Full tile wall wiping & dry wipe finish'
      ],
      exclusions: ['Plumbing leak fix or tap replacement']
    },
    {
      id: 'bathroom-kitchen-combo-pack',
      category: 'value-deals',
      title: 'Bathroom & Kitchen Super Saver Combo',
      rating: '4.85',
      reviewsCount: '1.2M reviews',
      price: 1499,
      originalPrice: 1799,
      duration: '150 mins',
      badge: 'TOP COMBO',
      tag: 'Complete House Care',
      image: '/images/kitchen_stove_clean.jpg',
      description: 'Combined power package: 1 Bathroom Intense Deep Clean + 1 Kitchen Degreasing (chimney exterior, gas stove, tiles & countertop).',
      inclusions: [
        '1 Complete bathroom mechanized deep clean',
        '1 Kitchen heavy oil & grease chemical removal',
        'Gas stove burner and kitchen sink descaling',
        'Countertop and backsplash tile degreasing'
      ],
      exclusions: ['Chimney internal filter wash (available as add-on)']
    },

    // MINI SERVICES
    {
      id: 'tap-basin-descaling',
      category: 'mini-services',
      title: 'Taps, Basin & Shower Head Descaling',
      rating: '4.79',
      reviewsCount: '450K reviews',
      price: 199,
      originalPrice: 299,
      duration: '25 mins',
      badge: 'QUICK SPARKLE',
      tag: 'Chrome Specialist',
      image: '/images/wash_basin.jpg',
      description: 'Targeted acid-free descaling to remove white chalky hard water deposits from chrome faucets, basin bowls, and overhead shower nozzles.',
      inclusions: [
        'Professional chrome descaling paste treatment',
        'Aerator unclogging for smooth water pressure',
        'Washbasin ceramic stain removal',
        'High-gloss microfiber buffing finish'
      ],
      exclusions: ['Wall tile or floor cleaning']
    },
    {
      id: 'toilet-bowl-stain-removal',
      category: 'mini-services',
      title: 'Toilet Bowl Deep Stain Removal (Taski R6)',
      rating: '4.74',
      reviewsCount: '310K reviews',
      price: 149,
      originalPrice: 219,
      duration: '20 mins',
      badge: '100% STAIN FREE',
      tag: 'Sanitization Pro',
      image: '/images/flush_tank.jpg',
      description: 'Heavy duty descaling of yellowish uric acid, stubborn brown waterline rings, and mineral build-up under the toilet rim.',
      inclusions: [
        'Industrial Diversey Taski R6 acidic descaling gel',
        'Rim jet and water siphon deep brush scrub',
        'Seat cover antibacterial wipe',
        'Pleasant floral deodorizing flush'
      ],
      exclusions: ['Flush tank internal mechanical repairs']
    },
    {
      id: 'tile-grouting-mold-removal',
      category: 'mini-services',
      title: 'Tile Grouting & Mold Removal (Bathroom Walls/Floor)',
      rating: '4.80',
      reviewsCount: '280K reviews',
      price: 249,
      originalPrice: 349,
      duration: '30 mins',
      badge: 'ANTI-FUNGAL',
      tag: 'Deep Sanitation',
      image: '/images/home_bathroom.jpg',
      description: 'Remove black mold, mildew, and grime from bathroom tile joints using active oxygen bleach gel.',
      inclusions: [
        'Oxygen active mold-killing gel penetration',
        'Grout line wire brush scrub',
        'Anti-fungal shield coating to prevent regrowth',
        'Dry vacuum wash'
      ],
      exclusions: ['Re-grouting with cement or epoxy']
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
    <div className="bathroom-cleaning-page-wrapper" style={{
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
          {/* Left: Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Urban Company Logo exactly matching screenshot */}
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
                UC
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                Urban Company
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
            {/* Address Selector exactly matching screenshot */}
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

            {/* Search Input matching screenshot */}
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
                placeholder="Search in Bathroom Cleaning"
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

      {/* 2. HERO SECTION (1:1 REPLICA OF THE SCREENSHOT) */}
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
        }} className="bathroom-hero-layout">

          {/* LEFT COLUMN: TITLE, RATING, SELECT A SERVICE CARD */}
          <div>
            {/* Title */}
            <h1 style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.8px',
              lineHeight: 1.15
            }}>
              Bathroom Cleaning
            </h1>

            {/* Rating with purple circle star matching screenshot */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24
            }}>
              {/* Purple Circle Star */}
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
                4.83
              </span>
              <span style={{
                fontSize: 14,
                color: '#6B7280',
                borderBottom: '1px dotted #9CA3AF',
                cursor: 'pointer'
              }}>
                (8.9 M bookings)
              </span>
            </div>

            {/* "Select a service" Box matching screenshot 1:1 */}
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

              {/* 3 Interactive Service Tiles: Value deals, One time deep clean, Mini services */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
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
                        // Smooth scroll down to products section
                        const el = document.getElementById('bathroom-services-list');
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
                      {/* Tile box */}
                      <div
                        style={{
                          width: '100%',
                          height: 82,
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
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                          }
                        }}
                      >
                        {cat.renderIcon()}
                      </div>

                      {/* Tile Label */}
                      <span style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? '#111827' : '#4B5563',
                        lineHeight: 1.25,
                        maxWidth: 90
                      }}>
                        {cat.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guarantee / UC Safety Badge below */}
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
                <strong>Urban Company Promise:</strong> Safe & odorless Diversey Taski chemicals with 100% shine guarantee.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: LARGE VIDEO / HERO MEDIA SHOWCASE (MATCHES SCREENSHOT 1:1) */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 380,
            backgroundColor: '#F3F4F6',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            {/* Background preview image or video */}
            <img 
              src="/images/home_bathroom.jpg" 
              alt="Bathroom Deep Cleaning in Action" 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isPlayingVideo ? 'none' : 'brightness(0.92)'
              }}
            />

            {/* Video Element (Optional HTML5 video) */}
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

            {/* Subtle Gradient Overlay */}
            {!isPlayingVideo && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
              }} />
            )}

            {/* Center Circular Play Button matching screenshot 1:1 */}
            <button
              type="button"
              onClick={toggleVideo}
              title={isPlayingVideo ? "Pause Video" : "Watch Bathroom Cleaning in Action"}
              style={{
                position: 'relative',
                zIndex: 10,
                width: 68,
                height: 68,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
                color: '#111827'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.88)';
              }}
            >
              {isPlayingVideo ? (
                <Pause size={28} fill="#111827" strokeWidth={0} />
              ) : (
                <Play size={28} fill="#111827" strokeWidth={0} style={{ marginLeft: 3 }} />
              )}
            </button>

            {/* Bottom Tagline on Video */}
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
              textShadow: '0 2px 8px rgba(0,0,0,0.6)'
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>
                  Mechanized Single-Disc Scrubbing & Descaling
                </div>
                <div style={{ fontSize: 12.5, opacity: 0.9 }}>
                  Removes 95% of limescale, hard water stains & grout discoloration
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                0:45 MIN PREVIEW
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES CATALOGUE SECTION */}
      <section id="bathroom-services-list" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '24px 24px 100px',
        boxSizing: 'border-box'
      }}>
        {/* Category Filter Tabs Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: 14,
          marginBottom: 24,
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveCategory('one-time')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: activeCategory === 'one-time' ? '1.5px solid #111827' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === 'one-time' ? '#111827' : '#FFFFFF',
              color: activeCategory === 'one-time' ? '#FFFFFF' : '#4B5563',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            One time deep clean
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('value-deals')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: activeCategory === 'value-deals' ? '1.5px solid #111827' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === 'value-deals' ? '#111827' : '#FFFFFF',
              color: activeCategory === 'value-deals' ? '#FFFFFF' : '#4B5563',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Value deals (Combos)
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('mini-services')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: activeCategory === 'mini-services' ? '1.5px solid #111827' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === 'mini-services' ? '#111827' : '#FFFFFF',
              color: activeCategory === 'mini-services' ? '#FFFFFF' : '#4B5563',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Mini services
          </button>

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
              cursor: 'pointer'
            }}
          >
            All Services ({PRODUCTS.length})
          </button>
        </div>

        {/* Section Title */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {activeCategory === 'one-time' && 'One Time Deep Cleaning Packages'}
            {activeCategory === 'value-deals' && 'Value Deals & Multi-Bathroom Combos'}
            {activeCategory === 'mini-services' && 'Mini Services (Taps, Basin & Descaling)'}
            {activeCategory === 'all' && 'All Bathroom Cleaning Services'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Showing {filteredProducts.length} verified bathroom cleaning services
          </p>
        </div>

        {/* Services Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            border: '1px dashed #CBD5E1'
          }}>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 12px 0' }}>
              No bathroom services found matching "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => { setActiveCategory('one-time'); setSearchQuery(''); }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#111827',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
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
                    {/* Top Row: Badge & Rating */}
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

                    {/* Title */}
                    <h3 style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 6px 0',
                      lineHeight: 1.3
                    }}>
                      {product.title}
                    </h3>

                    {/* Duration */}
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

                    {/* Pricing */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 19, fontWeight: 900, color: '#0F172A' }}>
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: 13,
                      color: '#4B5563',
                      lineHeight: 1.5,
                      margin: '0 0 14px 0'
                    }}>
                      {product.description}
                    </p>

                    {/* Inclusions preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {product.inclusions.slice(0, 2).map((inc, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#374151' }}>
                          <CheckCircle2 size={13} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>

                    {/* View details button */}
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

                  {/* Bottom: Image thumbnail + Add to Cart Button */}
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
        )}
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
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <X size={18} color="#0F172A" />
            </button>

            <div style={{ height: 200, width: '100%', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
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

              {/* Inclusions */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                  What's included in this package:
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

              {/* Exclusions */}
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

              {/* Add to Cart button */}
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

      {/* 5. STICKY BOTTOM FLOATING CART BAR */}
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
