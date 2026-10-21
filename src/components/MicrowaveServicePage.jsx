import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  ShoppingBag, 
  Check, 
  Star, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  X, 
  Wrench, 
  Award, 
  FileText
} from 'lucide-react';

export function MicrowaveServicePage({
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
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [optionsModalService, setOptionsModalService] = useState(null);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);

  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const checkScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // 6 specific issue cards from Screenshots 2 & 3
  const MICROWAVE_ISSUES = [
    {
      id: 'microwave-not-heating',
      title: 'Not heating',
      rating: '4.85',
      reviews: '44K reviews',
      price: 199,
      duration: '60 mins',
      problemDescription: 'Magnetron diagnosis, high-voltage diode & capacitor inspection, transformer test',
      image: '/images/appliance_microwave.jpg'
    },
    {
      id: 'microwave-not-working',
      title: 'Not working',
      rating: '4.81',
      reviews: '36K reviews',
      price: 199,
      duration: '60 mins',
      problemDescription: 'Power supply board test, ceramic fuse replacement, thermal cut-out & door switch check',
      image: '/images/appliance_microwave.jpg'
    },
    {
      id: 'microwave-unknown-issue',
      title: 'Unknown issue',
      rating: '4.81',
      reviews: '23K reviews',
      price: 199,
      duration: '60 mins',
      problemDescription: 'Full diagnostic check-up across electrical, heating, rotating & display systems',
      image: '/images/appliance_microwave.jpg'
    },
    {
      id: 'microwave-buttons-not-working',
      title: 'Buttons not working',
      rating: '4.79',
      reviews: '22K reviews',
      price: 199,
      duration: '60 mins',
      problemDescription: 'Touch touchpad membrane diagnosis, ribbon connector clean & PCB keypad test',
      image: '/images/appliance_microwave.jpg'
    },
    {
      id: 'microwave-noise-issue',
      title: 'Noise issue',
      rating: '4.87',
      reviews: '10K reviews',
      price: 199,
      duration: '60 mins',
      problemDescription: 'Cooling fan motor check, turntable drive gear inspection & humming capacitor analysis',
      image: '/images/appliance_microwave.jpg'
    },
    {
      id: 'microwave-sparking-issue',
      title: 'Sparking / burning smell',
      rating: '4.83',
      reviews: '15K reviews',
      price: 199,
      duration: '60 mins',
      problemDescription: 'Mica waveguide sheet replacement, cavity burn marks clean & stirrer blade test',
      image: '/images/appliance_microwave.jpg'
    }
  ];

  // Deep cleaning and other services
  const ADDITIONAL_SERVICES = [
    {
      id: 'microwave-deep-cleaning',
      title: 'Microwave deep cleaning & degreasing',
      rating: '4.86',
      reviews: '28K reviews',
      price: 299,
      duration: '45 mins',
      image: '/images/appliance_microwave.jpg',
      inclusions: [
        'Cavity steam descaling and food-safe grease elimination',
        'Glass turntable plate, roller ring & shaft deep degreased',
        'Door glass, vent grills & exterior body polish with odor neutralizer'
      ],
      details: 'Comprehensive high-temperature steam degreasing of inner cavity walls, ceiling, turntable roller, and glass door, neutralizing stubborn foul odors.'
    }
  ];

  // Rate card data for Standard Rate Card modal (Screenshot 2)
  const RATE_CARD_ITEMS = [
    { item: 'Microwave Check-up / Inspection', price: '₹199', note: 'Adjusted in final repair bill' },
    { item: 'Waveguide / Mica Sheet Replacement', price: '₹249 - ₹349', note: 'Includes 180-day warranty' },
    { item: 'Door Interlock Micro-switch', price: '₹299 - ₹449', note: 'Includes 180-day warranty' },
    { item: 'High Voltage Diode / Capacitor', price: '₹449 - ₹699', note: 'Includes 180-day warranty' },
    { item: 'Turntable Synchronous Motor', price: '₹499 - ₹749', note: 'Includes 180-day warranty' },
    { item: 'Touch Keypad Membrane', price: '₹649 - ₹999', note: 'Includes 180-day warranty' },
    { item: 'Magnetron Replacement (Genuine OEM)', price: '₹1,299 - ₹1,899', note: 'Includes 180-day warranty' },
    { item: 'High Voltage Transformer', price: '₹1,199 - ₹1,699', note: 'Includes 180-day warranty' }
  ];

  // Supported brands (Screenshot 5)
  const BRANDS = [
    { name: 'LG', color: '#A50034' },
    { name: 'Panasonic', color: '#004185' },
    { name: 'BAJAJ', color: '#003399' },
    { name: 'Samsung', color: '#1428A0' },
    { name: 'IFB', color: '#E31E24' },
    { name: 'Godrej', color: '#2B579A' },
    { name: 'Whirlpool', color: '#F2A900' },
    { name: 'Morphy Richards', color: '#333333' }
  ];

  // Calculate cart entries
  const cartEntries = Object.entries(cart);
  const totalCartCount = cartEntries.reduce((sum, [, item]) => sum + (item.qty || 0), 0);
  const cartTotalAmount = cartEntries.reduce((sum, [, item]) => sum + ((item.price || 0) * (item.qty || 0)), 0);

  function scrollToServices() {
    const el = document.getElementById('microwave-catalogue-section');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  return (
    <div className="microwave-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR (MATCHING URBAN COMPANY SCREENSHOTS)        */}
      {/* ========================================================= */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #EAECF0',
        height: 68,
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Left: Back Arrow + Urban Company Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              title="Return to Home"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <ArrowLeft size={18} color="#111827" />
            </button>

            <div 
              onClick={onBackHome}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{
                width: 28,
                height: 28,
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 13.5,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: -0.5
              }}>
                UC
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#000000', letterSpacing: -0.4 }}>
                Urban Company
              </span>
            </div>
          </div>

          {/* Center: Location Pill + Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 620, justifyContent: 'center' }}>
            {/* Location Pill */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '7px 12px',
                backgroundColor: '#FFFFFF',
                fontSize: 13,
                fontWeight: 500,
                color: '#374151',
                cursor: 'pointer',
                maxWidth: 240,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title="Change Delivery Location"
            >
              <MapPin size={15} color="#111827" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedLocality}, {selectedCity}
              </span>
              <ChevronDown size={14} color="#6B7280" />
            </button>

            {/* Search in Microwave */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '7px 12px',
              backgroundColor: '#FFFFFF',
              flex: 1,
              maxWidth: 320
            }}>
              <Search size={16} color="#6B7280" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in Microwave"
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: 13,
                  color: '#111827',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Right: Cart Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 8,
                backgroundColor: totalCartCount > 0 ? '#6E42E5' : '#F3F4F6',
                color: totalCartCount > 0 ? '#FFFFFF' : '#374151',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <ShoppingBag size={16} />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span style={{
                  backgroundColor: '#FFFFFF',
                  color: '#6E42E5',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION (MATCHES SCREENSHOT 1 EXACTLY)             */}
      {/* ========================================================= */}
      <section style={{
        maxWidth: 1240,
        margin: '0 auto',
        padding: '36px 20px 24px',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.8fr)',
          gap: 40,
          alignItems: 'center'
        }}>
          {/* Left Hero Details */}
          <div>
            <h1 style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 10px 0',
              lineHeight: 1.1,
              letterSpacing: -0.8
            }}>
              Microwave
            </h1>

            {/* Rating & Bookings: ★ 4.84 (834K bookings) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#1E293B',
              marginBottom: 20
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 19,
                height: 19,
                borderRadius: '50%',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF'
              }}>
                <Star size={11.5} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>4.84</span>
              <span style={{
                color: '#475569',
                borderBottom: '1px dotted #94A3B8',
                cursor: 'pointer',
                paddingBottom: 1
              }}>
                (834K bookings)
              </span>
            </div>

            {/* UC COVER Card (Screenshot 1) */}
            <div 
              onClick={() => setIsWarrantyModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                backgroundColor: '#F8FAFC',
                width: '100%',
                maxWidth: 340,
                marginBottom: 24,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: 14,
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 900
                  }}>
                    ✓
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: 0.5 }}>
                    UC COVER
                  </span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                  Verified quotes &amp; upto 180 days warranty
                </span>
              </div>
              <ChevronRight size={16} color="#64748B" />
            </div>

            {/* View Services Button */}
            <div>
              <button
                type="button"
                onClick={scrollToServices}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(110, 66, 229, 0.28)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#582AD1'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6E42E5'}
              >
                View Services
              </button>
            </div>
          </div>

          {/* Right Hero Promo Banner Card (Matches Official Urban Company Design without broken taskbar/wrong purifier image) */}
          <div style={{
            backgroundColor: '#FAFAFA',
            borderRadius: 20,
            border: '1px solid #EAECF0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 26px',
            gap: 20,
            minHeight: 260
          }}>
            {/* Promo Text Column */}
            <div style={{ flex: '1 1 54%', minWidth: 200 }}>
              <h2 style={{
                fontSize: 27,
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 16px 0',
                lineHeight: 1.18,
                letterSpacing: -0.6
              }}>
                Expert service.<br />Longest warranty.
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <Check size={18} color="#0F172A" strokeWidth={2.8} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', lineHeight: 1.35 }}>
                    Service by top technicians
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <Check size={18} color="#0F172A" strokeWidth={2.8} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', lineHeight: 1.35 }}>
                    Up to 180 days warranty on spare parts by Urban Company
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <Check size={18} color="#0F172A" strokeWidth={2.8} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', lineHeight: 1.35 }}>
                    Standardised diagnostic checklist &amp; genuine parts
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Microwave Technician Photo */}
            <div style={{
              flex: '0 0 44%',
              maxWidth: 250,
              height: 220,
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/images/microwave_technician_clean.jpg" 
                alt="Urban Company Microwave Service Technician"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. MAIN CATALOGUE & CART (SCREENSHOTS 2 & 3)              */}
      {/* ========================================================= */}
      <div 
        id="microwave-catalogue-section"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '28px 20px 60px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: 36,
          alignItems: 'start'
        }}
      >
        {/* ======================================================= */}
        {/* LEFT COLUMN: ISSUE CARDS, PROCESS & BRANDS              */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          {/* Section: Microwave check-up */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: 26,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: -0.4
            }}>
              Microwave check-up
            </h2>

            {/* Rating & Reviews: ★ 4.84 (61K reviews) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              marginBottom: 16
            }}>
              <Star size={12} fill="#0F172A" color="#0F172A" />
              <span style={{ fontWeight: 800, color: '#0F172A' }}>4.84</span>
              <span style={{ color: '#475569', borderBottom: '1px dotted #94A3B8', cursor: 'pointer' }}>
                (61K reviews)
              </span>
            </div>

            {/* UC Cover Standard Rate Card Banner (Screenshot 2 & 3) */}
            <div 
              onClick={() => setIsRateCardModalOpen(true)}
              style={{
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 12,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: 24,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E0F2FE'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F0F9FF'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: '#0284C7',
                  letterSpacing: -0.2
                }}>
                  ✓ uccover
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>
                  Standard rate card
                </span>
              </div>
              <ChevronRight size={16} color="#0284C7" />
            </div>

            {/* Horizontal Issue Cards Slider (Screenshots 2 & 3) */}
            <div style={{ position: 'relative' }}>
              {/* Left Carousel Arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  style={{
                    position: 'absolute',
                    left: -14,
                    top: '42%',
                    zIndex: 10,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                  }}
                >
                  <ChevronLeft size={16} color="#1E293B" />
                </button>
              )}

              {/* Cards Container */}
              <div 
                ref={carouselRef}
                onScroll={checkScroll}
                style={{
                  display: 'flex',
                  gap: 16,
                  overflowX: 'auto',
                  paddingBottom: 10,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {MICROWAVE_ISSUES.map(issue => {
                  const cartItem = cart[issue.id];
                  const qty = cartItem ? cartItem.qty : 0;

                  return (
                    <div
                      key={issue.id}
                      style={{
                        minWidth: 160,
                        maxWidth: 168,
                        backgroundColor: '#FFFFFF',
                        border: qty > 0 ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                        borderRadius: 14,
                        padding: '16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div>
                        <h4 style={{
                          fontSize: 14.5,
                          fontWeight: 800,
                          color: '#0F172A',
                          margin: '0 0 6px 0',
                          lineHeight: 1.3
                        }}>
                          {issue.title}
                        </h4>

                        {/* Rating */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          color: '#64748B',
                          marginBottom: 14
                        }}>
                          <Star size={10} fill="#0F172A" color="#0F172A" />
                          <span style={{ fontWeight: 800, color: '#0F172A' }}>{issue.rating}</span>
                          <span>({issue.reviews})</span>
                        </div>
                      </div>

                      <div>
                        {/* Price */}
                        <div style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: '#0F172A',
                          marginBottom: 12
                        }}>
                          ₹{issue.price}
                        </div>

                        {/* Add / Stepper Button */}
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart({
                                id: issue.id,
                                title: `Microwave Check-up: ${issue.title}`,
                                price: issue.price,
                                image: issue.image
                              });
                              showToast(`Added Microwave (${issue.title}) to cart`);
                            }}
                            style={{
                              width: '100%',
                              border: '1.5px solid #6E42E5',
                              backgroundColor: '#FFFFFF',
                              color: '#6E42E5',
                              fontSize: 13,
                              fontWeight: 800,
                              padding: '6px 0',
                              borderRadius: 8,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = '#6E42E5';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.color = '#6E42E5';
                            }}
                          >
                            Add
                          </button>
                        ) : (
                          <div style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#6E42E5',
                            color: '#FFFFFF',
                            borderRadius: 8,
                            padding: '5px 8px',
                            boxSizing: 'border-box'
                          }}>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(issue.id, qty - 1)}
                              style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}
                            >
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: 800, fontSize: 13 }}>{qty}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(issue.id, qty + 1)}
                              style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Carousel Arrow */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  style={{
                    position: 'absolute',
                    right: -14,
                    top: '42%',
                    zIndex: 10,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                  }}
                >
                  <ChevronRight size={16} color="#1E293B" />
                </button>
              )}
            </div>
          </section>

          {/* Additional Service: Deep Cleaning */}
          <section style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
              Cleaning &amp; Maintenance
            </h3>
            {ADDITIONAL_SERVICES.map(svc => {
              const qty = cart[svc.id]?.qty || 0;
              return (
                <div key={svc.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '18px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                      {svc.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 6 }}>
                      <Star size={11} fill="#0F172A" color="#0F172A" />
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>{svc.rating}</span>
                      <span>({svc.reviews})</span>
                      <span>• {svc.duration}</span>
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                      ₹{svc.price}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailItem(svc)}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#6E42E5', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      View details
                    </button>
                  </div>

                  <div style={{ width: 90, flexShrink: 0 }}>
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(svc);
                          showToast(`Added ${svc.title} to cart`);
                        }}
                        style={{
                          width: '100%',
                          border: '1.5px solid #6E42E5',
                          backgroundColor: '#FFFFFF',
                          color: '#6E42E5',
                          fontSize: 13,
                          fontWeight: 800,
                          padding: '6px 0',
                          borderRadius: 8,
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#6E42E5',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        padding: '5px 8px'
                      }}>
                        <button type="button" onClick={() => onUpdateQty(svc.id, qty - 1)} style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: 13 }}>{qty}</span>
                        <button type="button" onClick={() => onUpdateQty(svc.id, qty + 1)} style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}>
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* ======================================================= */}
          {/* 4. OUR PROCESS SECTION (SCREENSHOT 4)                    */}
          {/* ======================================================= */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{
              fontSize: 26,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 24px 0',
              letterSpacing: -0.4
            }}>
              Our process
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div style={{ width: 1.5, flex: 1, backgroundColor: '#E2E8F0', minHeight: 36 }} />
                </div>
                <div style={{ paddingBottom: 24 }}>
                  <h4 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', margin: '4px 0 4px 0' }}>
                    Inspection &amp; quote
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    We inspect the appliance &amp; share a repair quote for approval
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div style={{ width: 1.5, flex: 1, backgroundColor: '#E2E8F0', minHeight: 36 }} />
                </div>
                <div style={{ paddingBottom: 24 }}>
                  <h4 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', margin: '4px 0 4px 0' }}>
                    Approval or expert review
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    Repair begins after your approval, if you are unsure you can call expert
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    3
                  </div>
                  <div style={{ width: 1.5, flex: 1, backgroundColor: '#E2E8F0', minHeight: 36 }} />
                </div>
                <div style={{ paddingBottom: 24 }}>
                  <h4 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', margin: '4px 0 4px 0' }}>
                    Repair &amp; spare parts
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    If needed, we will source spare parts at fixed rates for the repair
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: 13.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    4
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: 15.5, fontWeight: 800, color: '#0F172A', margin: '4px 0 4px 0' }}>
                    Warranty activation
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    Your appliance will automatically come under 180 days warranty after the repair
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================= */}
          {/* 5. TOP TECHNICIANS & BRANDS (SCREENSHOT 5)               */}
          {/* ======================================================= */}
          <section style={{ marginBottom: 40 }}>
            {/* Top Technicians Card */}
            <div style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
              marginBottom: 36
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '0 0 18px 0' }}>
                  Top technicians
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShieldCheck size={20} color="#0F172A" strokeWidth={2} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                      Background verified
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Wrench size={20} color="#0F172A" strokeWidth={2} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                      Trained across all major brands
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Award size={20} color="#0F172A" strokeWidth={2} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                      Certified under Skill India Programme
                    </span>
                  </div>
                </div>
              </div>

              {/* Technician Photo */}
              <div style={{
                width: 140,
                height: 160,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 12,
                backgroundColor: '#FFFFFF'
              }}>
                <img 
                  src="/images/top_technician_clean.jpg" 
                  alt="Verified Skill India Certified Urban Company Technician"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    display: 'block'
                  }}
                />
              </div>
            </div>

            {/* We service all brands */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 16px 0' }}>
                We service all brands
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 12
              }}>
                {BRANDS.map(brand => (
                  <div
                    key={brand.name}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: '14px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 900,
                      color: brand.color,
                      letterSpacing: -0.2,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {brand.name}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: "UC Promise" & "Cart" (SCREENSHOTS 1-5)   */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Card 1: UC Promise */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '20px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Header: Title + Quality Assured Hologram Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: -0.3
              }}>
                UC Promise
              </h3>

              {/* Holographic Seal Badge */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E0E7FF 0%, #FDF4FF 50%, #CFFAFE 100%)',
                border: '1px solid #C7D2FE',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.15)'
              }}>
                <span style={{ fontSize: 7, fontWeight: 900, color: '#4F46E5', lineHeight: 1 }}>
                  QUALITY
                </span>
                <span style={{ fontSize: 6.5, fontWeight: 800, color: '#7C3AED', lineHeight: 1, marginTop: 1 }}>
                  ASSURED
                </span>
              </div>
            </div>

            {/* Checkmark List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={16} color="#059669" strokeWidth={2.5} />
                <span>Verified Professionals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={16} color="#059669" strokeWidth={2.5} />
                <span>Hassle Free Booking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={16} color="#059669" strokeWidth={2.5} />
                <span>Transparent Pricing</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cart Summary Box */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '24px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {cartEntries.length === 0 ? (
              /* Empty Cart State with Shopping Cart SVG */
              <div style={{
                textAlign: 'center',
                padding: '16px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ position: 'relative', width: 72, height: 60, marginBottom: 12 }}>
                  <svg viewBox="0 0 72 60" fill="none" style={{ width: '100%', height: '100%' }}>
                    <path d="M12 12H20L28 42H58L66 22H24" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="32" cy="48" r="3.5" fill="#94A3B8" />
                    <circle cx="54" cy="48" r="3.5" fill="#94A3B8" />
                    <circle cx="48" cy="14" r="5" fill="#8B5CF6" />
                    <path d="M52 14L56 16L52 18Z" fill="#F59E0B" />
                    <path d="M44 16C42 18 42 22 45 22C48 22 49 19 49 16Z" fill="#7C3AED" />
                  </svg>
                </div>

                <p style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: '#94A3B8',
                  margin: 0
                }}>
                  No items in your cart
                </p>
              </div>
            ) : (
              /* Active Cart Items */
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: '1px solid #F1F5F9'
                }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Cart Summary
                  </h4>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6E42E5' }}>
                    {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {cartEntries.map(([id, item]) => (
                    <div key={id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 12.5
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ color: '#64748B', fontSize: 11.5, marginTop: 2 }}>
                          ₹{item.price} × {item.qty}
                        </div>
                      </div>

                      {/* Small Stepper */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: '#F3F4F6',
                        borderRadius: 6,
                        padding: '3px 6px'
                      }}>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(id, item.qty - 1)}
                          style={{ border: 'none', background: 'none', color: '#374151', cursor: 'pointer', display: 'flex' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: 12 }}>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(id, item.qty + 1)}
                          style={{ border: 'none', background: 'none', color: '#374151', cursor: 'pointer', display: 'flex' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                <div style={{
                  borderTop: '1px dashed #E2E8F0',
                  paddingTop: 12,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Total Amount</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>₹{cartTotalAmount}</span>
                </div>

                {/* Savings Pill */}
                <div style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 6,
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#059669',
                  marginBottom: 14
                }}>
                  <Sparkles size={13} color="#059669" />
                  <span>Doorstep check-up fee adjusted with repair</span>
                </div>

                {/* Proceed Button */}
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  style={{
                    width: '100%',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '11px 0',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#582AD1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6E42E5'}
                >
                  Proceed to Pay
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 6. STANDARD RATE CARD MODAL (SCREENSHOT 2)                */}
      {/* ========================================================= */}
      {isRateCardModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 520,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Standard Rate Card
                </h3>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Transparent, verified pricing for genuine microwave spare parts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRateCardModalOpen(false)}
                style={{ border: 'none', background: '#F1F5F9', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px', color: '#64748B', fontWeight: 700 }}>Service / Spare Part</th>
                    <th style={{ padding: '8px 4px', color: '#64748B', fontWeight: 700, textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {RATE_CARD_ITEMS.map((rc, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 4px', fontWeight: 600, color: '#1E293B' }}>
                        <div>{rc.item}</div>
                        <div style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>{rc.note}</div>
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                        {rc.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '14px 24px', backgroundColor: '#FAFAFA', borderTop: '1px solid #F1F5F9', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsRateCardModalOpen(false)}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 20px',
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: 'pointer'
                }}
              >
                Close Rate Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. WARRANTY POLICY MODAL (UC COVER SCREENSHOT 1)           */}
      {/* ========================================================= */}
      {isWarrantyModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={22} color="#6E42E5" />
                <h3 style={{ fontSize: 16.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  UC Cover: Up to 180 Days Warranty
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWarrantyModalOpen(false)}
                style={{ border: 'none', background: '#F1F5F9', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} color="#64748B" />
              </button>
            </div>

            <div style={{ padding: '20px', fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 14px' }}>
                Every microwave repair is protected by our industry-leading guarantee:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>180-day Warranty on Replaced Spare Parts</strong>: Any magnetron, capacitor, transformer, or micro-switch carries a 180-day replacement warranty.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>30-day Service Guarantee</strong>: If heating issues or strange noises persist within 30 days, we revisit with zero service charges.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>100% Genuine OEM Components</strong>: Compatible with LG, Samsung, Panasonic, IFB, Bajaj, Godrej, and all leading brands.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', backgroundColor: '#FAFAFA', borderTop: '1px solid #F1F5F9', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsWarrantyModalOpen(false)}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 20px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. URBAN COMPANY FOOTER BANNER                           */}
      {/* ========================================================= */}
      <footer style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
        padding: '36px 20px 48px',
        marginTop: 60
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontWeight: 900,
              fontSize: 16,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: -0.5
            }}>
              UC
            </div>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', letterSpacing: -0.5 }}>
              Urban Company
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
            Urban Company is India&apos;s largest home services platform. Over 834K bookings completed for verified, warranty-backed Microwave repair and servicing.
          </p>
          <div style={{ fontSize: 12, color: '#64748B', borderTop: '1px solid #1E293B', paddingTop: 16 }}>
            © 2026 Urban Company. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
