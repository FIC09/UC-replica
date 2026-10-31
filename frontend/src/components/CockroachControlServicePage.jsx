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
  ChevronDown
} from 'lucide-react';

export function CockroachControlServicePage({
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
  const [activeCategory, setActiveCategory] = useState('cockroach'); 
  // 'cockroach' | 'bedbug' | 'termite' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef(null);

  const CATEGORIES = [
    {
      id: 'cockroach',
      title: 'Cockroach control',
      subtitle: 'Odorless gel baiting & kitchen drain spray',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(29, 24)">
            {/* Red Circle & Slash */}
            <circle cx="0" cy="0" r="17" stroke="#DC2626" strokeWidth="2.5" fill="none" />
            <line x1="-12" y1="-12" x2="12" y2="12" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
            {/* Cockroach Silhouette */}
            <ellipse cx="0" cy="-2" rx="4.5" ry="8" fill="#78350F" />
            <circle cx="0" cy="-8.5" r="2.5" fill="#78350F" />
            {/* Legs */}
            <path d="M-3 -4L-9 -6M3 -4L9 -6M-4 0L-10 0M4 0L10 0M-3 4L-9 7M3 4L9 7" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
            {/* Antennae */}
            <path d="M-1.5 -10C-4 -14 -8 -16 -11 -17M1.5 -10C4 -14 8 -16 11 -17" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      id: 'bedbug',
      title: 'Bed bug control',
      subtitle: 'Mattress seams & frame spray (2 visits)',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bed outline */}
          <rect x="13" y="14" width="32" height="22" rx="2" fill="#FEF2F2" stroke="#EF4444" strokeWidth="1.2" />
          <line x1="13" y1="21" x2="45" y2="21" stroke="#F87171" strokeWidth="1" />
          {/* Magnifying glass finding bug */}
          <circle cx="29" cy="27" r="7" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1.5" />
          <line x1="34" y1="32" x2="40" y2="38" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          {/* Small bug inside glass */}
          <circle cx="29" cy="27" r="2.5" fill="#991B1B" />
        </svg>
      )
    },
    {
      id: 'termite',
      title: 'Termite & Ants',
      subtitle: 'Drill-fill-seal woodwork protection',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wooden door frame */}
          <rect x="15" y="8" width="28" height="34" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1.2" />
          <rect x="18" y="11" width="22" height="28" fill="#FDE68A" />
          {/* Drill injection nozzle */}
          <path d="M12 25H22M22 23V27M12 24V26" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="22" cy="25" r="1.5" fill="#EF4444" />
        </svg>
      )
    }
  ];

  const PRODUCTS = [
    // 1. COCKROACH CONTROL
    {
      id: 'intense-cockroach-control-2visits',
      category: 'cockroach',
      title: 'Intense Cockroach Control (Kitchen & Home - 2 Visits)',
      rating: '4.86',
      reviewsCount: '620K reviews',
      price: 899,
      originalPrice: 1199,
      duration: '45 mins',
      badge: 'BESTSELLER',
      tag: 'Bayer Maxforce Gel',
      image: '/images/cockroach_spray_can.jpg',
      description: 'Our most effective 2-visit treatment: odorless Bayer gel dots applied inside all cabinet hinges, drawer channels + odorless micro-spray behind fridge, stove & drain lines. Follow-up visit in 15 days included.',
      inclusions: [
        'Bayer Maxforce odorless gel baiting in every kitchen corner',
        'Residual chemical spray behind heavy electrical appliances',
        'Drain trap biological cleaning to stop drain infestation',
        'Free 15-day follow-up visit to break egg cycle'
      ],
      exclusions: ['External garden spraying']
    },
    {
      id: 'standard-cockroach-control-1visit',
      category: 'cockroach',
      title: 'Standard Cockroach Control (1 Visit)',
      rating: '4.79',
      reviewsCount: '410K reviews',
      price: 549,
      originalPrice: 699,
      duration: '35 mins',
      badge: 'QUICK RELIEF',
      tag: '100% Odorless',
      image: '/images/cockroach_spray_can.jpg',
      description: 'Fast eradication of visible cockroaches in kitchen and bathrooms using food-safe gel dots and drain foam. No need to empty utensils or leave the house.',
      inclusions: [
        'Food-safe odorless gel dots inside kitchen cabinets',
        'Bathroom pipe and drain trap powder treatment',
        'Safe around children, elderly, and pets'
      ],
      exclusions: ['Second follow-up visit']
    },
    {
      id: 'complete-1year-cockroach-warranty',
      category: 'cockroach',
      title: '1-Year 365-Day Cockroach Warranty Protection (3 Visits)',
      rating: '4.90',
      reviewsCount: '380K reviews',
      price: 1599,
      originalPrice: 2199,
      duration: '1 Year Warranty',
      badge: 'ANNUAL PLAN',
      tag: 'Zero Pest Guarantee',
      image: '/images/home_pest_spray.jpg',
      description: 'Year-round complete peace of mind: 3 scheduled quarterly visits + unlimited free complaint visits within 365 days if a single cockroach is spotted.',
      inclusions: [
        '3 Scheduled comprehensive visits (every 4 months)',
        'Unlimited free re-treatments on demand within 365 days',
        'Complete kitchen, bathroom & balcony coverage',
        'Senior master pest exterminator assigned'
      ],
      exclusions: ['Bed bug or termite infestation']
    },

    // 2. BED BUG CONTROL
    {
      id: 'bedbug-control-2visits',
      category: 'bedbug',
      title: 'Bed Bug Complete Extermination (2 Visits Included)',
      rating: '4.83',
      reviewsCount: '290K reviews',
      price: 1499,
      originalPrice: 1899,
      duration: '60 mins',
      badge: 'EGG KILLER',
      tag: '2 Targeted Visits',
      image: '/images/cleaning_bedroom_bucket.jpg',
      description: 'Guaranteed bed bug eradication: high-potency contact spray injected into mattress seams, bed frames, headboards, baseboards, and wall cracks. Second visit in 15 days destroys newly hatched nymphs.',
      inclusions: [
        'Mattress seam and tufting pressure chemical spray',
        'Wooden bed frame dismantle and joint treatment',
        'Wardrobe and curtain crevice fogging',
        'Mandatory second visit after 15 days to eliminate hatchlings'
      ],
      exclusions: ['Washing of bed sheets and linens']
    },

    // 3. TERMITE & ANTS
    {
      id: 'termite-drill-fill-seal',
      category: 'termite',
      title: 'Termite Drill-Fill-Seal Treatment (2-Year Warranty)',
      rating: '4.88',
      reviewsCount: '190K reviews',
      price: 2499,
      originalPrice: 3199,
      duration: '2-3 hrs',
      badge: '2-YEAR WARRANTY',
      tag: 'Govt Approved Chemicals',
      image: '/images/door_lock_mortise.jpg',
      description: 'Permanent protection against wood termites: precision drilling of 12mm holes at skirting joints and door frames, high-pressure termiticide chemical injection, and color-matched white cement sealing.',
      inclusions: [
        'Drilling at 45-degree angles along infected woodwork',
        'High-pressure chemical barrier creation',
        'Hole sealing with waterproof white cement',
        '2-Year official warranty certificate with free re-visits'
      ],
      exclusions: ['Replacing damaged hollow wooden frames']
    },
    {
      id: 'ant-drain-insect-cleanout',
      category: 'termite',
      title: 'Ants & Drain Flies Micro-Treatment',
      rating: '4.75',
      reviewsCount: '180K reviews',
      price: 399,
      originalPrice: 549,
      duration: '25 mins',
      badge: 'SAFE & FAST',
      tag: 'Drain Foam',
      image: '/images/cockroach_spray_can.jpg',
      description: 'Eradicate black & red ant trails on kitchen countertops and small moth flies breeding in bathroom drains using targeted sweet bait gel and expanding foam.',
      inclusions: [
        'Ant colony queen-killer gel baiting',
        'Drain pipe biological enzyme sludge degrease',
        'Window sill and balcony door threshold spray'
      ],
      exclusions: ['Outdoor garden ant mounds']
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
    <div className="cockroach-control-page-wrapper" style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#0F172A'
    }}>
      {/* 1. TOP NAVBAR */}
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
                placeholder="Search in Pest & Cockroach Control"
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
                backgroundColor: '#DC2626',
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
        }} className="pest-hero-layout">

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
              Cockroach & Pest Control
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
                backgroundColor: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                4.84
              </span>
              <span style={{
                fontSize: 14,
                color: '#6B7280',
                borderBottom: '1px dotted #9CA3AF',
                cursor: 'pointer'
              }}>
                (850 K bookings)
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

              {/* 3 Interactive Service Tiles */}
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
                        const el = document.getElementById('pest-services-list');
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
                          backgroundColor: isSelected ? '#FEE2E2' : '#F9FAFB',
                          borderRadius: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected ? '1.5px solid #DC2626' : '1px solid #E5E7EB',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.02)' : 'none'
                        }}
                      >
                        {cat.renderIcon()}
                      </div>

                      <span style={{
                        marginTop: 7,
                        fontSize: 11.5,
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? '#991B1B' : '#4B5563',
                        lineHeight: 1.25,
                        maxWidth: 96
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
              backgroundColor: '#FEF2F2',
              borderRadius: 12,
              border: '1px solid #FECACA',
              fontSize: 12,
              color: '#991B1B'
            }}>
              <ShieldCheck size={18} color="#DC2626" style={{ flexShrink: 0 }} />
              <span>
                <strong>100% Odorless & Kid-Safe:</strong> Bayer certified non-toxic gel dots. No need to empty kitchen utensils.
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
              src="/images/cockroach_spray_can.jpg" 
              alt="Cockroach Control Extermination in Action" 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.75)'
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
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)'
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
                100% Pest-free home <br />
                <span style={{ color: '#FCA5A5' }}>with scientific gel baiting...</span>
              </h2>

              <button
                type="button"
                onClick={toggleVideo}
                title={isPlayingVideo ? "Pause" : "Watch Pest Control in Action"}
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
                  Cascade Colony Elimination Technology
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  Gel is carried back to nests, destroying entire hidden colonies
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
                1:00 MIN PREVIEW
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES CATALOGUE */}
      <section id="pest-services-list" style={{
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
                  border: isTabActive ? '1.5px solid #DC2626' : '1px solid #E5E7EB',
                  backgroundColor: isTabActive ? '#DC2626' : '#FFFFFF',
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
              border: activeCategory === 'all' ? '1.5px solid #DC2626' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === 'all' ? '#DC2626' : '#FFFFFF',
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
            {activeCategory === 'cockroach' && 'Cockroach Extermination & Prevention'}
            {activeCategory === 'bedbug' && 'Bed Bug Targeted Eradication (2 Visits)'}
            {activeCategory === 'termite' && 'Termite Woodwork & Ant Colony Protection'}
            {activeCategory === 'all' && 'All Pest Control & Extermination Services'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Showing {filteredProducts.length} verified government-approved pest control treatments
          </p>
        </div>

        {/* Products Grid */}
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
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B',
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
                      <Star size={12} fill="#DC2626" color="#DC2626" />
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
                      color: '#DC2626',
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
                        border: '1.5px solid #DC2626',
                        borderRadius: 8,
                        padding: '5px 10px',
                        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)'
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
                            color: '#DC2626',
                            display: 'flex',
                            alignItems: 'center',
                            padding: 2
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: '#DC2626' }}>
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
                            color: '#DC2626',
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
                          color: '#DC2626',
                          border: '1.5px solid #DC2626',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#DC2626';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                          e.currentTarget.style.color = '#DC2626';
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
                  backgroundColor: '#FEE2E2',
                  color: '#991B1B',
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
                  What's included in this pest treatment:
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
                  backgroundColor: '#DC2626',
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
              backgroundColor: '#DC2626',
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
