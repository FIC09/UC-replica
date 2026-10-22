import React, { useState } from 'react';
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
  Info,
  Clock,
  AlertCircle
} from 'lucide-react';

export function RefrigeratorServicePage({
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

  // Catalogue of Refrigerator services matching official Urban Company Screenshots 1 & 2
  const REFRIGERATOR_SERVICES = [
    // =========================================================================
    // 1. REFRIGERATOR CHECK-UP (Screenshot 2)
    // =========================================================================
    {
      id: 'refrigerator-check-up',
      sectionId: 'refrigerator-checkup-section',
      sectionTitle: 'Refrigerator check-up',
      title: 'Refrigerator check-up',
      rating: '4.73',
      reviews: '193K reviews',
      price: 199,
      originalPrice: null,
      startsAt: true,
      optionsText: '3 options',
      duration: '60 mins',
      image: '/images/refrigerator_checkup_clean.jpg',
      bullet: 'Visitation fee will be adjusted in the final repair quote',
      inclusions: [
        'Complete diagnostic inspection of cooling issues, compressor & gas leak check',
        'Defrost heater, bi-metal thermostat, sensor & fan motor evaluation',
        'Electrical PCB wiring, overload relay & door gasket seal test',
        'Visitation fee will be adjusted in the final repair quote'
      ],
      exclusions: [
        'Spare parts cost and refrigerant gas refill are charged separately if needed',
        'Physical body denting or external paint repairs'
      ],
      details: 'Comprehensive diagnostic inspection by UC-certified technician. The technician diagnoses the exact root cause of cooling loss, water leakage, strange noises, or electrical tripping. If repair is taken, the ₹199 check-up fee is adjusted in the final bill.',
      options: [
        {
          id: 'single-door-checkup',
          title: 'Single door refrigerator check-up',
          rating: '4.73',
          reviews: '102K reviews',
          price: 199,
          duration: '60 mins',
          description: 'Cooling issues diagnosis, thermostat calibration, compressor relay test & door gasket seal inspection'
        },
        {
          id: 'double-door-checkup',
          title: 'Double door / Frost-free refrigerator check-up',
          rating: '4.75',
          reviews: '68K reviews',
          price: 249,
          duration: '60 mins',
          description: 'Defrost heater, bi-metal thermostat, evaporator fan motor, sensor check & cooling coil diagnostic'
        },
        {
          id: 'side-by-side-checkup',
          title: 'Side-by-side / Inverter refrigerator check-up',
          rating: '4.79',
          reviews: '23K reviews',
          price: 299,
          duration: '60 mins',
          description: 'Inverter PCB diagnosis, dual cooling circuits, digital display temperature panel test & variable compressor test'
        }
      ]
    },

    // =========================================================================
    // 2. DEEP CLEANING & SANITIZATION
    // =========================================================================
    {
      id: 'single-door-deep-cleaning',
      sectionId: 'cleaning-sanitization',
      sectionTitle: 'Deep cleaning & sanitization',
      title: 'Single door deep cleaning & sanitization',
      rating: '4.82',
      reviews: '41K reviews',
      price: 449,
      originalPrice: null,
      startsAt: false,
      duration: '60 mins',
      image: '/images/refrigerator_cleaning_single.jpg',
      bullet: 'Shelves dismounted, steam clean & food-safe anti-bacterial sanitization',
      inclusions: [
        'Shelves, vegetable box & door trays dismounted and deep steam washed',
        'Anti-fungal wipe-down of interior walls & magnetic door gaskets',
        'Exterior body buffing & compressor drip tray cleaning'
      ],
      exclusions: [
        'Defrosting frozen food packages is excluded',
        'Technical mechanical repairs not included'
      ],
      details: 'High-temperature steam sanitization that destroys 99.9% of bacteria and stubborn foul food odors, leaving your refrigerator pristine, fresh, and hygienic.'
    },
    {
      id: 'double-door-deep-cleaning',
      sectionId: 'cleaning-sanitization',
      sectionTitle: 'Deep cleaning & sanitization',
      title: 'Double door deep cleaning & sanitization',
      rating: '4.85',
      reviews: '34K reviews',
      price: 599,
      originalPrice: null,
      startsAt: false,
      duration: '75 mins',
      image: '/images/refrigerator_cleaning_double.jpg',
      bullet: 'Deep freezer & fridge compartments descaled, steam sanitized & odor deodorized',
      inclusions: [
        'Separate deep freezer and main compartment chemical-free steam sanitization',
        'Air vents vacuuming, magnetic gasket scrub & compressor drain hole flush',
        'Food-safe lemon-infused anti-bacterial wipe-down'
      ],
      exclusions: [
        'Mechanical repair or refrigerant refill not included'
      ],
      details: 'Comprehensive deep cleaning for frost-free double door refrigerators. Clears blocked drainage holes to prevent pooling water and restores optimal air circulation.'
    },

    // =========================================================================
    // 3. REFRIGERANT GAS CHARGING & REPAIR
    // =========================================================================
    {
      id: 'refrigerator-gas-charging',
      sectionId: 'gas-charging-repairs',
      sectionTitle: 'Gas charging & repairs',
      title: 'Refrigerator gas charging / refill',
      rating: '4.78',
      reviews: '55K reviews',
      price: 1499,
      originalPrice: null,
      startsAt: true,
      optionsText: '2 options',
      duration: '90 mins',
      image: '/images/refrigerator_hero.jpg',
      bullet: 'Vacuum test, brazing & genuine refrigerant recharge with 180-day warranty',
      inclusions: [
        'Nitrogen pressure leak detection and copper capillary brazing',
        'Complete system vacuum evacuation to eliminate moisture',
        'Precision weighed genuine R600a / R134a eco-friendly refrigerant recharge',
        '180 days Urban Company warranty on gas charging'
      ],
      exclusions: [
        'Major compressor replacement charged as per parts rate card'
      ],
      details: 'Certified refrigeration gas charging using factory-specified refrigerants. Includes high-pressure leak testing, vacuum evacuation, and copper pipe welding.',
      options: [
        {
          id: 'single-door-gas-refill',
          title: 'Single door gas charging (R600a / R134a)',
          rating: '4.76',
          reviews: '31K reviews',
          price: 1499,
          duration: '90 mins',
          description: 'Capillary flushing, vacuum testing, charging valve brazing and R600a/R134a eco refrigerant refill'
        },
        {
          id: 'double-door-gas-refill',
          title: 'Double door / Inverter gas charging',
          rating: '4.80',
          reviews: '24K reviews',
          price: 1899,
          duration: '90 mins',
          description: 'High-pressure nitrogen leak test, filter drier replacement, vacuum pull & digital scale weighed gas recharge'
        }
      ]
    }
  ];

  // Filter services by search query
  const filteredServices = REFRIGERATOR_SERVICES.filter(svc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return svc.title.toLowerCase().includes(q) ||
           svc.sectionTitle.toLowerCase().includes(q) ||
           (svc.inclusions && svc.inclusions.some(inc => inc.toLowerCase().includes(q))) ||
           (svc.options && svc.options.some(opt => opt.title.toLowerCase().includes(q)));
  });

  // Calculate cart entries
  const cartEntries = Object.entries(cart);
  const totalCartCount = cartEntries.reduce((sum, [, item]) => sum + (item.qty || 0), 0);
  const cartTotalAmount = cartEntries.reduce((sum, [, item]) => sum + ((item.price || 0) * (item.qty || 0)), 0);

  // Sub-services for the sticky sidebar navigation
  const SUB_SERVICES = [
    {
      id: 'checkup',
      name: 'Refrigerator check-up',
      sectionId: 'refrigerator-checkup-section',
      image: '/images/refrigerator_checkup_clean.jpg'
    },
    {
      id: 'single-door',
      name: 'Single door refrigerator',
      sectionId: 'refrigerator-checkup-section',
      image: '/images/refrigerator_cleaning_single.jpg'
    },
    {
      id: 'double-door',
      name: 'Double door / Inverter',
      sectionId: 'refrigerator-checkup-section',
      image: '/images/refrigerator_cleaning_double.jpg'
    },
    {
      id: 'gas-cleaning',
      name: 'Gas refill & cleaning',
      sectionId: 'gas-charging-repairs',
      image: '/images/refrigerator_hero.jpg'
    }
  ];

  const [activeSubTab, setActiveSubTab] = useState('checkup');
  const [activeBannerSlide, setActiveBannerSlide] = useState(0);

  function handleSubTabClick(tabId) {
    setActiveSubTab(tabId);
    const sub = SUB_SERVICES.find(s => s.id === tabId);
    const targetId = sub ? sub.sectionId : 'refrigerator-checkup-section';
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const topOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  function scrollToServices() {
    const el = document.getElementById('refrigerator-catalogue-section');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  // Get unique sections
  const sections = [
    { id: 'refrigerator-checkup-section', title: 'Refrigerator check-up' },
    { id: 'cleaning-sanitization', title: 'Deep cleaning & sanitization' },
    { id: 'gas-charging-repairs', title: 'Gas charging & repairs' }
  ];

  return (
    <div className="refrigerator-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR (MATCHING URBAN COMPANY SCREENSHOT 1 & 2)   */}
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

            {/* Search in Refrigerator */}
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
                placeholder="Search in Refrigerator"
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
      {/* 2. TOP HERO: TITLE/WARRANTY (LEFT) + HERO CAROUSEL (RIGHT) */}
      {/* ========================================================= */}
      <div 
        className="ac-page-hero-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '24px 20px 20px',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'stretch'
        }}
      >
        {/* Left: Refrigerator Title, Rating & Up to 180 days warranty */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <h1 style={{
            fontSize: 34,
            fontWeight: 900,
            color: '#0F172A',
            margin: '0 0 8px 0',
            letterSpacing: '-0.8px'
          }}>
            Refrigerator
          </h1>

          {/* Rating & Bookings (★ 4.76 (1.9 M bookings)) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
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
              <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>4.76</span>
            <span style={{
              fontSize: 13.5,
              color: '#64748B',
              borderBottom: '1px dotted #94A3B8',
              cursor: 'pointer'
            }}>
              (1.9 M bookings)
            </span>
          </div>

          {/* Warranty Card */}
          <div 
            onClick={() => setIsWarrantyModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '12px 18px',
              gap: 16,
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} color="#6E42E5" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                Up to 180 days warranty
              </span>
            </div>
            <ChevronRight size={18} color="#64748B" />
          </div>
        </div>

        {/* Right: Diagnostic Hero Carousel Banner (Matches Screenshot 1 & user photo) */}
        <div style={{
          position: 'relative',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 195
        }}>
          {activeBannerSlide === 0 ? (
            <div style={{
              padding: '20px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  color: '#047857',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 6,
                  backgroundColor: '#ECFDF5',
                  padding: '4px 10px',
                  borderRadius: 6
                }}>
                  ADVANCED DIAGNOSTICS
                </span>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 6px 0',
                  lineHeight: 1.25,
                  letterSpacing: -0.4
                }}>
                  PCB &amp; Compressor diagnosis<br />with digital multimeter
                </h2>
                <p style={{
                  fontSize: 13.5,
                  color: '#475569',
                  margin: 0,
                  fontWeight: 500
                }}>
                  Starts at ₹199 • Adjusted in final repair quote
                </p>
              </div>
              <div style={{ width: 200, height: 140, borderRadius: 12, overflow: 'hidden', flexShrink: 0, backgroundColor: '#F8FAFC' }}>
                <img 
                  src="/images/refrigerator_hero.jpg" 
                  alt="Technician testing circuit board with multimeter" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} 
                />
              </div>
            </div>
          ) : activeBannerSlide === 1 ? (
            <div style={{
              padding: '20px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  color: '#6E42E5',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 6,
                  backgroundColor: '#FAF5FF',
                  padding: '4px 10px',
                  borderRadius: 6
                }}>
                  180 DAYS WARRANTY
                </span>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 6px 0',
                  lineHeight: 1.25,
                  letterSpacing: -0.4
                }}>
                  Genuine spare parts &amp;<br />refrigerant gas recharge
                </h2>
                <p style={{
                  fontSize: 13.5,
                  color: '#475569',
                  margin: 0,
                  fontWeight: 500
                }}>
                  Nitrogen leak test, copper brazing &amp; eco R600a refill
                </p>
              </div>
              <div style={{ width: 200, height: 140, borderRadius: 12, overflow: 'hidden', flexShrink: 0, backgroundColor: '#F8FAFC' }}>
                <img 
                  src="/images/refrigerator_checkup_clean.jpg" 
                  alt="Compressor & gas recharge" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  color: '#0284C7',
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 6,
                  backgroundColor: '#F0F9FF',
                  padding: '4px 10px',
                  borderRadius: 6
                }}>
                  DEEP HYGIENE
                </span>
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 6px 0',
                  lineHeight: 1.25,
                  letterSpacing: -0.4
                }}>
                  Steam sanitization &amp;<br />anti-bacterial cleaning
                </h2>
                <p style={{
                  fontSize: 13.5,
                  color: '#475569',
                  margin: 0,
                  fontWeight: 500
                }}>
                  Dismounted trays, odor removal &amp; 99.9% germ elimination
                </p>
              </div>
              <div style={{ width: 200, height: 140, borderRadius: 12, overflow: 'hidden', flexShrink: 0, backgroundColor: '#F8FAFC' }}>
                <img 
                  src="/images/refrigerator_cleaning_double.jpg" 
                  alt="Deep steam clean" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>
          )}

          {/* Carousel Navigation Buttons with proper clearance */}
          <button
            type="button"
            onClick={() => setActiveBannerSlide(prev => (prev === 0 ? 2 : prev - 1))}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              zIndex: 10,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <ChevronLeft size={18} color="#111827" />
          </button>
          <button
            type="button"
            onClick={() => setActiveBannerSlide(prev => (prev === 2 ? 0 : prev + 1))}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              zIndex: 10,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <ChevronRight size={18} color="#111827" />
          </button>

          {/* Slide Indicator Dots */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            zIndex: 10
          }}>
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveBannerSlide(idx)}
                style={{
                  width: activeBannerSlide === idx ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: activeBannerSlide === idx ? '#0F172A' : '#CBD5E1',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN 3-COLUMN LAYOUT (MATCHING URBAN COMPANY STANDARDS) */}
      {/* ========================================================= */}
      <div 
        id="refrigerator-catalogue-section"
        className="ac-page-main-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '10px 20px 80px',
          alignItems: 'start'
        }}
      >
        {/* ======================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR ("Select a service")            */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'none',
            margin: '0 0 14px 0',
            letterSpacing: -0.2
          }}>
            Select a service
          </h3>

          {/* 2x2 Sub-Service Tiles Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            columnGap: 10,
            rowGap: 14
          }}>
            {SUB_SERVICES.map(sub => {
              const isActive = activeSubTab === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => handleSubTabClick(sub.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    textAlign: 'center'
                  }}
                >
                  {/* Square Box */}
                  <div style={{
                    width: '100%',
                    height: 72,
                    borderRadius: 12,
                    border: isActive ? '2px solid #000000' : '1px solid #E5E7EB',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    marginBottom: 8,
                    padding: 6,
                    boxSizing: 'border-box',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}>
                    <img 
                      src={sub.image} 
                      alt={sub.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#000000' : '#475569',
                    lineHeight: 1.25
                  }}>
                    {sub.name}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ======================================================= */}
        {/* COLUMN 2: CENTER SERVICES LISTING                       */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          {sections.map(section => {
            const sectionServices = filteredServices.filter(s => s.sectionId === section.id);
            if (sectionServices.length === 0) return null;

            return (
              <section key={section.id} id={section.id} style={{ marginBottom: 44, scrollMarginTop: 88 }}>
                {/* Section Heading (e.g. "Refrigerator check-up" from Screenshot 2) */}
                <h2 style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 22px 0',
                  letterSpacing: -0.4
                }}>
                  {section.title}
                </h2>

                {/* Services Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {sectionServices.map(service => {
                    const cartItem = cart[service.id];
                    const qty = cartItem ? cartItem.qty : 0;
                    const optionsCountInCart = service.options 
                      ? service.options.reduce((sum, opt) => sum + (cart[opt.id]?.qty || 0), 0)
                      : 0;

                    return (
                      <div
                        key={service.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 20,
                          paddingBottom: 28,
                          borderBottom: '1px solid #F1F5F9'
                        }}
                      >
                        {/* Left Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: '#0F172A',
                            margin: '0 0 6px 0',
                            letterSpacing: -0.3
                          }}>
                            {service.title}
                          </h3>

                          {/* Rating & Reviews */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 6,
                            fontSize: 13
                          }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              backgroundColor: '#6E42E5',
                              color: '#FFFFFF'
                            }}>
                              <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
                            </div>
                            <span style={{ fontWeight: 800, color: '#0F172A' }}>{service.rating}</span>
                            <span style={{ color: '#64748B', borderBottom: '1px dotted #94A3B8', cursor: 'pointer' }}>
                              ({service.reviews})
                            </span>
                          </div>

                          {/* Price Row: Starts at ₹199 • 60 mins */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 8,
                            fontSize: 15,
                            fontWeight: 800,
                            color: '#0F172A',
                            marginBottom: 8
                          }}>
                            {service.startsAt && <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Starts at</span>}
                            <span>₹{service.price}</span>
                            {service.duration && (
                              <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                                • {service.duration}
                              </span>
                            )}
                          </div>

                          {/* Single Bullet if present */}
                          {service.bullet && (
                            <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                              • {service.bullet}
                            </p>
                          )}

                          {/* View details button (Screenshot 2) */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(service)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#6E42E5',
                              fontSize: 13.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                          >
                            View details
                          </button>
                        </div>

                        {/* Right: Image & Add Stepper (Matches Screenshot 2) */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 8,
                          width: 116,
                          flexShrink: 0
                        }}>
                          {/* Image Box */}
                          <div style={{
                            width: 116,
                            height: 116,
                            borderRadius: 14,
                            overflow: 'hidden',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                          }}>
                            <img
                              src={service.image}
                              alt={service.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </div>

                          {/* Add / Stepper Button */}
                          {service.options ? (
                            <>
                              {optionsCountInCart === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setOptionsModalService(service)}
                                  style={{
                                    width: '100%',
                                    border: '1.5px solid #6E42E5',
                                    backgroundColor: '#FFFFFF',
                                    color: '#6E42E5',
                                    fontSize: 13.5,
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
                                <div
                                  onClick={() => setOptionsModalService(service)}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#6E42E5',
                                    color: '#FFFFFF',
                                    borderRadius: 8,
                                    padding: '6px 6px',
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <span>{optionsCountInCart} added</span>
                                </div>
                              )}
                              <span
                                onClick={() => setOptionsModalService(service)}
                                style={{
                                  fontSize: 11,
                                  color: optionsCountInCart > 0 ? '#6E42E5' : '#64748B',
                                  fontWeight: optionsCountInCart > 0 ? 700 : 500,
                                  cursor: 'pointer'
                                }}
                              >
                                {optionsCountInCart > 0 ? 'Edit options' : (service.optionsText || `${service.options.length} options`)}
                              </span>
                            </>
                          ) : (
                            <>
                              {qty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onAddToCart(service);
                                    showToast(`Added ${service.title} to cart`);
                                  }}
                                  style={{
                                    width: '100%',
                                    border: '1.5px solid #6E42E5',
                                    backgroundColor: '#FFFFFF',
                                    color: '#6E42E5',
                                    fontSize: 13.5,
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
                                    onClick={() => onUpdateQty(service.id, qty - 1)}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#FFFFFF',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex'
                                    }}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span style={{ fontWeight: 800, fontSize: 13 }}>{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQty(service.id, qty + 1)}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#FFFFFF',
                                      cursor: 'pointer',
                                      padding: 0,
                                      display: 'flex'
                                    }}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: "UC Promise" & "Cart" (SCREENSHOT 2)      */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Card 1: UC Promise (Screenshot 2) */}
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

              {/* Shimmer Circular Holographic Seal Badge (From Screenshot 2) */}
              <div style={{
                width: 46,
                height: 46,
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

            {/* Checkmark List (Exact from Screenshot 2) */}
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

          {/* Card 2: Cart Summary Box (Screenshot 2) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '24px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {cartEntries.length === 0 ? (
              /* Empty Cart State with Shopping Cart + Purple Bird SVG (From Screenshot 2) */
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
                  <span>Free doorstep inspection with repairs</span>
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
      {/* 4. MULTI-OPTIONS MODAL (FOR STARTS AT ₹199)              */}
      {/* ========================================================= */}
      {optionsModalService && (
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
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'fadeInScale 0.2s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Select Refrigerator Type
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: '3px 0 0' }}>
                  {optionsModalService.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOptionsModalService(null)}
                style={{
                  border: 'none',
                  background: '#F1F5F9',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            {/* Inclusions note */}
            <div style={{
              backgroundColor: '#F8FAFC',
              padding: '10px 24px',
              borderBottom: '1px solid #F1F5F9',
              fontSize: 12,
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Sparkles size={14} color="#6E42E5" />
              <span>Visitation &amp; check-up fee adjusted in the final repair bill</span>
            </div>

            {/* Options List */}
            <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {optionsModalService.options.map(option => {
                  const cartItem = cart[option.id];
                  const qty = cartItem ? cartItem.qty : 0;

                  return (
                    <div
                      key={option.id}
                      style={{
                        border: qty > 0 ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                        borderRadius: 12,
                        padding: '14px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 14,
                        backgroundColor: qty > 0 ? '#FAF5FF' : '#FFFFFF',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                          {option.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: '#6E42E5',
                            color: '#FFFFFF'
                          }}>
                            <Star size={8.5} fill="#FFFFFF" color="#FFFFFF" />
                          </div>
                          <span style={{ fontWeight: 800, color: '#0F172A' }}>{option.rating}</span>
                          <span style={{ color: '#64748B' }}>({option.reviews})</span>
                          <span style={{ color: '#64748B' }}>• {option.duration}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 6px', lineHeight: 1.4 }}>
                          {option.description}
                        </p>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                          ₹{option.price}
                        </div>
                      </div>

                      {/* Stepper / Add */}
                      <div style={{ width: 88, flexShrink: 0 }}>
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart({
                                id: option.id,
                                title: option.title,
                                price: option.price,
                                image: optionsModalService.image
                              });
                              showToast(`Added ${option.title} to cart`);
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
                              textAlign: 'center'
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
                            padding: '6px 8px'
                          }}>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(option.id, qty - 1)}
                              style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}
                            >
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: 800, fontSize: 13 }}>{qty}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(option.id, qty + 1)}
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
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAFAFA'
            }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748B' }}>Total in cart: </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>₹{cartTotalAmount}</span>
              </div>
              <button
                type="button"
                onClick={() => setOptionsModalService(null)}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 20px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SERVICE DETAIL MODAL (VIEW DETAILS)                    */}
      {/* ========================================================= */}
      {selectedDetailItem && (
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
            maxWidth: 540,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'fadeInScale 0.2s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {selectedDetailItem.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, marginTop: 4 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF'
                  }}>
                    <Star size={9} fill="#FFFFFF" color="#FFFFFF" />
                  </div>
                  <span style={{ fontWeight: 800 }}>{selectedDetailItem.rating}</span>
                  <span style={{ color: '#64748B' }}>({selectedDetailItem.reviews})</span>
                  {selectedDetailItem.duration && <span style={{ color: '#64748B' }}>• {selectedDetailItem.duration}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                style={{
                  border: 'none',
                  background: '#F1F5F9',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} color="#64748B" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', maxHeight: '65vh', overflowY: 'auto' }}>
              <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: '0 0 18px' }}>
                {selectedDetailItem.details}
              </p>

              {/* What is included */}
              {selectedDetailItem.inclusions && (
                <div style={{ marginBottom: 18 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
                    What is included
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedDetailItem.inclusions.map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155' }}>
                        <Check size={16} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What is excluded */}
              {selectedDetailItem.exclusions && (
                <div style={{ marginBottom: 18 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
                    What is excluded
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedDetailItem.exclusions.map((exc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#64748B' }}>
                        <X size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UC Warranty Guarantee */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <ShieldCheck size={28} color="#6E42E5" style={{ flexShrink: 0 }} />
                <div>
                  <h5 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>
                    Urban Company 180 Days Warranty
                  </h5>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                    Genuine spare parts with up to 180 days warranty &amp; 30-day service protection.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAFAFA'
            }}>
              <div>
                <span style={{ fontSize: 12, color: '#64748B' }}>Starts at</span>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>₹{selectedDetailItem.price}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedDetailItem.options) {
                    setOptionsModalService(selectedDetailItem);
                    setSelectedDetailItem(null);
                  } else {
                    onAddToCart(selectedDetailItem);
                    showToast(`Added ${selectedDetailItem.title} to cart`);
                    setSelectedDetailItem(null);
                  }
                }}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {selectedDetailItem.options ? 'Select Option' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. WARRANTY POLICY MODAL                                  */}
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
                  Up to 180 Days Warranty
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
                Urban Company offers a comprehensive repair warranty on all refrigerator services:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>180-day Warranty on Replaced Spare Parts</strong>: Any replaced compressor relay, thermostat, fan motor, or PCB carries a 180-day free replacement guarantee.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>30-day Service Protection</strong>: If the same cooling issue reoccurs within 30 days of service, our technician will revisit and resolve it with zero extra fee.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Genuine OEM Parts Only</strong>: We use factory-certified manufacturer spare parts matching LG, Samsung, Whirlpool, Haier, Godrej, Bosch, and all top brands.
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
      {/* 7. URBAN COMPANY FOOTER BANNER (MATCHES REST OF APP)      */}
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
            Urban Company is India&apos;s largest home services platform. Over 1.9 Million customers trust us for verified, warranty-backed Refrigerator repair and servicing.
          </p>
          <div style={{ fontSize: 12, color: '#64748B', borderTop: '1px solid #1E293B', paddingTop: 16 }}>
            © 2026 Urban Company. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
