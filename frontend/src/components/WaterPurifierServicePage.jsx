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
  Droplets,
  Wrench,
  Shield,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Layers,
  Activity
} from 'lucide-react';

export function WaterPurifierServicePage({
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [isRateCardModalOpen, setIsRateCardModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const carouselRef = useRef(null);

  // Official Urban Company Water Purifier Services matching Screenshots 2 & 3
  const RO_SERVICES = [
    {
      id: 'ro-repair-checkup',
      title: 'Repair check-up',
      category: 'checkup',
      rating: '4.77',
      reviews: '76K reviews',
      price: 299,
      originalPrice: 349,
      duration: '45 mins',
      image: '/images/water_purifier/hero_filter_replacement_clean.jpg?v=4',
      description: 'Comprehensive diagnosis of water purifier problems like leakage, low water flow, bad taste, unusual noise, or power issue.',
      bullets: [
        'TDS level test & inlet water pressure inspection',
        'Booster pump, SMPS adapter & solenoid valve check',
        'Check-up fee adjusted in final repair quote'
      ],
      inclusions: [
        'Complete diagnostic test with digital TDS meter',
        'Booster pump pressure & motor capacitor health check',
        'SMPS adapter voltage output and wiring continuity inspection',
        'Solenoid valve (SV) and auto-cut float switch verification',
        'Leakage detection across all elbows, pipes, and filter housings',
        'Transparent quote before any repair; fee adjusted in final bill'
      ],
      exclusions: [
        'Spare parts cost is not included in the check-up fee',
        'Does not cover external pre-filter housing replacement'
      ]
    },
    {
      id: 'ro-filter-checkup',
      title: 'Filter check-up',
      category: 'checkup',
      rating: '4.79',
      reviews: '136K reviews',
      price: 299,
      originalPrice: 349,
      duration: '45 mins',
      image: '/images/water_purifier/native_brands_grid.png',
      description: 'In-depth health analysis of all filter candles & membrane to check filtration efficacy, TDS reduction, and water purity.',
      bullets: [
        'Sediment, carbon & RO membrane efficiency check',
        'Inlet TDS vs Pure water TDS rejection ratio measurement',
        'Purifier sanitisation and internal tube flushing'
      ],
      inclusions: [
        'Digital TDS testing of raw input water vs filtered output water',
        'Sediment filter pore clogging & turbidity inspection',
        'Activated carbon filter chlorine absorption test',
        'RO membrane salt rejection rate check (aiming >90% rejection)',
        'Pure-to-reject water flow ratio assessment',
        'Recommendation of suitable filter replacements if needed'
      ],
      exclusions: [
        'Cost of replacement filter candles or membrane not included'
      ]
    },
    {
      id: 'ro-complete-filter-replacement',
      title: 'Complete filter replacement',
      category: 'replacement',
      rating: '4.83',
      reviews: '18K reviews',
      price: 4199,
      originalPrice: 4799,
      duration: '90 mins',
      image: '/images/water_purifier/hero_filter_replacement_clean.jpg?v=4',
      tag: 'Best Seller',
      description: 'Full replacement of all filtration stages with 100% genuine Native filters engineered for superior longevity.',
      bullets: [
        'Complete set: Sediment + Pre-Carbon + RO Membrane + Post-Carbon',
        'Includes India’s longest 1-year warranty on filters',
        'Free deep sanitisation & digital TDS calibration'
      ],
      inclusions: [
        'Brand-new high-density 5-micron Sediment filter replacement',
        'High-iodine value Activated Carbon block filter replacement',
        'Heavy-duty 80 GPD thin-film composite (TFC) RO Membrane',
        'Post-carbon mineralizer & alkaline balance infusion cartridge',
        'Complete sanitisation of storage tank and internal plumbing',
        '1-Year Comprehensive Urban Company Warranty on all installed filters',
        'Free digital TDS meter testing before and after replacement'
      ],
      exclusions: [
        'Booster pump or electronic parts not included in filter pack'
      ]
    },
    {
      id: 'ro-wall-mounted-installation',
      title: 'Wall-mounted RO installation',
      category: 'installation',
      rating: '4.81',
      reviews: '84K reviews',
      price: 450,
      originalPrice: 499,
      duration: '60 mins',
      image: '/images/water_purifier/warranty_shield_1year.png',
      description: 'Professional wall bracket mounting, plumbing connections, and initial setup for any brand of wall-hung water purifier.',
      bullets: [
        'Precision drilling with heavy-duty anchor fasteners',
        'Inlet water diverter valve & drain pipe routing',
        'Initial membrane flushing & TDS calibration test'
      ],
      inclusions: [
        'Sturdy wall drilling and bracket hanging for vibration-free mounting',
        'Inlet plumbing connection using brass/SS diverter valve',
        'Food-grade PE tubing connection for input and reject water lines',
        'Initial 15-minute system flush to remove loose carbon fines',
        'Output water TDS level measurement and taste calibration',
        '30-day post-service Urban Company workmanship guarantee'
      ],
      exclusions: [
        'Additional electrical power socket installation',
        'Extra piping beyond standard 5-meter kit'
      ]
    },
    {
      id: 'ro-under-the-counter-installation',
      title: 'Under the counter RO installation',
      category: 'installation',
      rating: '4.77',
      reviews: '1K reviews',
      price: 649,
      originalPrice: 749,
      duration: '75 mins',
      image: '/images/water_purifier/warranty_shield_1year.png',
      description: 'Specialized installation for under-sink water purifiers with pressurized hydro-pneumatic storage tanks and goose-neck faucets.',
      bullets: [
        'Kitchen sink faucet drilling & mounting',
        'Under-counter RO & pressure tank positioning',
        'Pressure gauge check & high-pressure leak testing'
      ],
      inclusions: [
        'Sink or countertop drilling for dedicated designer swan-neck faucet',
        'Under-counter system mounting and pressurized hydro-tank positioning',
        'Brass angle valve tee-junction plumbing connection',
        'Drain saddle clamp installation onto sink drain tailpiece',
        'Hydrostatic pressure testing to guarantee 100% zero leakage',
        'Tank bladder pressure check and initial filling cycle test'
      ],
      exclusions: [
        'Granite or quartz countertop drilling may incur specialized bit charges'
      ]
    },
    {
      id: 'ro-uninstallation',
      title: 'RO Uninstallation',
      category: 'installation',
      rating: '4.86',
      reviews: '16K reviews',
      price: 399,
      originalPrice: 449,
      duration: '40 mins',
      image: '/images/water_purifier/hero_filter_replacement_clean.jpg?v=4',
      description: 'Hassle-free, damage-free unmounting and water drainage of your water purifier when moving home or renovating.',
      bullets: [
        'Water shutoff, complete tank & filter draining',
        'Safe detachment of wall brackets and pipes',
        'Neat packing of purifier, adapters & tubes'
      ],
      inclusions: [
        'Safe disconnection from electricity and main water inlet line',
        'Complete draining of purified water tank and filter candles to prevent spillage',
        'Careful unmounting from wall brackets without wall plaster damage',
        'Coiling and bundling of all PE tubes, valves, and power adapters',
        '30-day Urban Company service assurance'
      ],
      exclusions: [
        'Packaging carton boxes or bubble wrap not included',
        'Plaster wall hole filling or painting not included'
      ]
    }
  ];

  // Standard Rate Card items matching Urban Company official transparent pricing
  const RATE_CARD_ITEMS = [
    { part: 'Sediment Filter (Spun/PP 5-micron)', price: '₹350', warranty: '1 Year' },
    { part: 'Pre-Carbon Block Filter (High-Iodine)', price: '₹450', warranty: '1 Year' },
    { part: 'Post-Carbon / Mineral Infusion Cartridge', price: '₹400', warranty: '1 Year' },
    { part: 'RO Membrane (80 GPD High-TDS TFC)', price: '₹1,800', warranty: '1 Year' },
    { part: 'Booster Pump (100 GPD Heavy-Duty)', price: '₹1,450', warranty: '1 Year' },
    { part: 'SMPS Power Supply Adapter (24V/36V)', price: '₹850', warranty: '1 Year' },
    { part: 'Solenoid Valve (SV 24V DC)', price: '₹450', warranty: '1 Year' },
    { part: 'Low Pressure Switch (LPS)', price: '₹250', warranty: '1 Year' },
    { part: 'Auto-cut Float Valve / Microswitch', price: '₹250', warranty: '1 Year' },
    { part: 'Food-grade PE Pipe Set (5 Meters)', price: '₹150', warranty: '6 Months' },
    { part: 'Brass Diverter Inlet Valve', price: '₹250', warranty: '1 Year' },
    { part: 'Complete Deep Descaling & Sanitisation', price: '₹399', warranty: '30 Days' }
  ];

  // FAQs
  const FAQS = [
    {
      q: 'How often should RO water purifier filters be replaced?',
      a: 'Sediment and carbon pre-filters should generally be replaced every 6 to 12 months depending on your input water quality. The RO membrane typically lasts 1 to 2 years. Urban Company Native filters feature advanced multi-layer architecture engineered to last up to 2 full years with India’s longest 1-year warranty.'
    },
    {
      q: 'What is covered under India’s longest 1-year warranty on spares?',
      a: 'Urban Company provides a comprehensive 1-year warranty on all Native replacement filters and major spare parts (including RO membrane, booster pumps, SMPS adapters, and solenoid valves). If any installed part malfunctions within 365 days, a certified technician will replace it free of cost.'
    },
    {
      q: 'What is a good TDS level for drinking water?',
      a: 'According to the Bureau of Indian Standards (BIS) and WHO, a drinking water TDS between 50 to 150 mg/L (ppm) is considered excellent, while 150 to 300 mg/L is good. Our technicians carry calibrated digital TDS meters and measure your raw and purified water during every visit.'
    },
    {
      q: 'Will the ₹299 check-up fee be deducted if I get the purifier repaired?',
      a: 'Yes, absolutely! The ₹299 check-up inspection fee is fully adjusted against the final repair or filter replacement bill. You only pay for the service and spare parts.'
    },
    {
      q: 'Do you service all brands like Kent, Aquaguard, Pureit, Livpure, and Blue Star?',
      a: 'Yes, our certified technicians are trained and equipped to service all major water purifier brands and models, including Kent, Aquaguard/Eureka Forbes, Pureit, Livpure, Havells, Blue Star, AO Smith, and custom assembled RO systems.'
    }
  ];

  // Carousel scroll handler
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Filtered services
  const filteredServices = RO_SERVICES.filter(service => {
    const matchesSearch = searchQuery === '' || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && service.category === activeFilter;
  });

  // Calculate cart state for water purifier items
  const cartEntries = Object.entries(cart);
  const totalCartCount = cartEntries.reduce((sum, [, item]) => sum + (item.quantity || 1), 0);
  const cartSubtotal = cartEntries.reduce((sum, [, item]) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  // Handle adding service to cart
  const handleServiceAdd = (service) => {
    if (onAddToCart) {
      onAddToCart({
        id: service.id,
        name: service.title,
        title: service.title,
        price: service.price,
        originalPrice: service.originalPrice,
        image: service.image,
        category: 'water-purifier',
        description: service.description
      });
      showToast(`Added ${service.title} to cart`);
    }
  };

  return (
    <div className="water-purifier-service-wrapper" style={{
      backgroundColor: '#FFFFFF',
      color: '#111827',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* =====================================================================
          1. TOP APP BAR / HEADER (MATCHES OFFICIAL UC SCREENSHOTS 1, 2, 3)
          ===================================================================== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Left: Back button & Urban Company Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              aria-label="Back to home"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                fontSize: 11.5,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: -0.2
              }}>
                FIC
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#000000', letterSpacing: -0.4 }}>
                Forge India Connect
              </span>
            </div>
          </div>

          {/* Center: Location Pill + Search Bar (Matches Screenshot 1 & 2) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            maxWidth: 680,
            justifyContent: 'center'
          }}>
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
                padding: '8px 12px',
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

            {/* Search Input matching Screenshot */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              flex: 1,
              maxWidth: 380,
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <Search size={16} color="#6B7280" />
              <input
                type="text"
                placeholder="Search in Water Purifier Service & Installation"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  width: '100%',
                  color: '#111827',
                  backgroundColor: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <X size={14} color="#9CA3AF" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Cart Button + Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                backgroundColor: totalCartCount > 0 ? '#111827' : '#FFFFFF',
                color: totalCartCount > 0 ? '#FFFFFF' : '#111827',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <ShoppingBag size={16} />
              <span className="cart-btn-text">Cart</span>
              {totalCartCount > 0 && (
                <span style={{
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '2px 7px',
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Profile Avatar 'S' matching screenshot top right */}
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }} title="User Profile">
              S
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout: Left content (hero, carousel, warranty, benefits) + Right Sticky Sidebar */}
      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '28px 20px 60px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 32,
          alignItems: 'start'
        }} className="ro-page-grid">
          
          {/* ===================================================================
              LEFT MAIN COLUMN
              =================================================================== */}
          <div style={{ minWidth: 0 }}>

            {/* =================================================================
                HERO SECTION (MATCHES SCREENSHOT 1)
                ================================================================= */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.35fr',
              gap: 20,
              alignItems: 'stretch',
              marginBottom: 36
            }} className="ro-hero-grid">
              
              {/* Left Hero Content */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.15,
                  letterSpacing: -0.6,
                  marginBottom: 10
                }}>
                  Water Purifier<br />Service & ...
                </h1>

                {/* Rating with dotted underline */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: 18
                }}>
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11
                  }}>
                    ★
                  </span>
                  <span style={{ borderBottom: '1px dotted #6B7280', paddingBottom: 1 }}>
                    4.80 (2.4 M bookings)
                  </span>
                </div>

                {/* Warranty Pill Card */}
                <div 
                  onClick={() => setIsWarrantyModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FAFAFA',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#9CA3AF'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShieldCheck size={18} color="#111827" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                      India's longest warranty on spares
                    </span>
                  </div>
                  <ChevronRight size={16} color="#6B7280" />
                </div>
              </div>

              {/* Right Hero Card matching Screenshot 1 */}
              <div 
                className="ro-hero-warranty-card"
                style={{
                  backgroundColor: '#F6F6F6',
                  borderRadius: 16,
                  padding: '28px 24px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 200
                }}
              >
                <div style={{ flex: 1, maxWidth: '54%', zIndex: 2 }}>
                  <h2 style={{
                    fontSize: 27,
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.15,
                    letterSpacing: -0.5,
                    marginBottom: 16
                  }}>
                    Expert service.<br />Longest warranty.
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: '#111827' }}>
                      <Check size={16} color="#111827" strokeWidth={3} />
                      <span>Service by top technicians</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: '#111827' }}>
                      <Check size={16} color="#111827" strokeWidth={3} />
                      <span>1-year warranty on filters<br />by Urban Company</span>
                    </div>
                  </div>
                </div>

                {/* Hero Photo with technician hands inserting cylindrical filter into white purifier */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '48%',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}>
                  <img 
                    src="/images/water_purifier/hero_filter_replacement_clean.jpg?v=4" 
                    alt="Water Purifier Service & Filter Replacement"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center right',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* =================================================================
                SERVICE CAROUSEL SECTION (MATCHES SCREENSHOTS 2 & 3)
                ================================================================= */}
            <div style={{ marginBottom: 44 }}>
              {/* Section Title & Subtitle */}
              <h2 style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.3,
                marginBottom: 4
              }}>
                Water Purifier Service & Installation
              </h2>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: '#6B7280',
                marginBottom: 14
              }}>
                <span style={{ color: '#F59E0B' }}>★</span>
                <span style={{ borderBottom: '1px dotted #9CA3AF' }}>4.80 (203K reviews)</span>
              </div>

              {/* uc cover Standard Rate Card Banner matching Screenshot 2 & 3 */}
              <div 
                onClick={() => setIsRateCardModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 10,
                  padding: '10px 16px',
                  marginBottom: 20,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DCFCE7'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F0FDF4'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#059669',
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: -0.2
                  }}>
                    <Check size={14} strokeWidth={3} />
                    <span>uccover</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                    Standard rate card
                  </span>
                </div>
                <ChevronRight size={16} color="#059669" />
              </div>

              {/* Category Filter Pills */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 18,
                overflowX: 'auto',
                paddingBottom: 4
              }}>
                {[
                  { id: 'all', label: 'All Services' },
                  { id: 'checkup', label: 'Check-ups & Inspection' },
                  { id: 'replacement', label: 'Filter Replacement' },
                  { id: 'installation', label: 'Installation & Setup' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 12.5,
                      fontWeight: 600,
                      border: activeFilter === filter.id ? '1px solid #111827' : '1px solid #E5E7EB',
                      backgroundColor: activeFilter === filter.id ? '#111827' : '#FFFFFF',
                      color: activeFilter === filter.id ? '#FFFFFF' : '#4B5563',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Horizontal Scroll Carousel with Left/Right Arrows matching Screenshot 2 & 3 */}
              <div style={{ position: 'relative' }}>
                {/* Left arrow navigation button */}
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  style={{
                    position: 'absolute',
                    left: -16,
                    top: '45%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, background-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                  aria-label="Scroll carousel left"
                >
                  <ChevronLeft size={18} color="#111827" />
                </button>

                {/* Right arrow navigation button */}
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  style={{
                    position: 'absolute',
                    right: -16,
                    top: '45%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, background-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                  aria-label="Scroll carousel right"
                >
                  <ChevronRight size={18} color="#111827" />
                </button>

                {/* Carousel container */}
                <div 
                  ref={carouselRef}
                  style={{
                    display: 'flex',
                    gap: 16,
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    padding: '4px 2px 14px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {filteredServices.map(service => {
                    const cartItem = cart[service.id];
                    const qty = cartItem ? (cartItem.quantity || 1) : 0;

                    return (
                      <div 
                        key={service.id}
                        style={{
                          flex: '0 0 220px',
                          scrollSnapAlign: 'start',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: 14,
                          padding: '16px 16px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#D1D5DB';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#E5E7EB';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                        }}
                      >
                        {service.tag && (
                          <div style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4
                          }}>
                            {service.tag}
                          </div>
                        )}

                        <div>
                          <h3 style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1.25,
                            minHeight: 38,
                            marginBottom: 8
                          }}>
                            {service.title}
                          </h3>

                          {/* Rating and Reviews */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            color: '#6B7280',
                            marginBottom: 12
                          }}>
                            <span style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{service.rating}</span>
                            <span>({service.reviews})</span>
                          </div>

                          {/* Price */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 6,
                            marginBottom: 14
                          }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                              ₹{service.price.toLocaleString()}
                            </span>
                            {service.originalPrice && (
                              <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>
                                ₹{service.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions: View details + Add / Quantity Button */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(service)}
                            style={{
                              border: 'none',
                              background: 'none',
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#7C3AED',
                              cursor: 'pointer',
                              padding: '4px 0',
                              marginBottom: 10,
                              display: 'block'
                            }}
                          >
                            View details
                          </button>

                          {qty > 0 ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#F3E8FF',
                              border: '1px solid #7C3AED',
                              borderRadius: 8,
                              height: 36,
                              padding: '0 8px'
                            }}>
                              <button
                                type="button"
                                onClick={() => onUpdateQty && onUpdateQty(service.id, qty - 1)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#7C3AED',
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  padding: 2
                                }}
                              >
                                <Minus size={15} strokeWidth={2.5} />
                              </button>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#7C3AED' }}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty && onUpdateQty(service.id, qty + 1)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#7C3AED',
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  padding: 2
                                }}
                              >
                                <Plus size={15} strokeWidth={2.5} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleServiceAdd(service)}
                              style={{
                                width: '100%',
                                height: 36,
                                borderRadius: 8,
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFFFFF',
                                color: '#7C3AED',
                                fontSize: 13.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#7C3AED';
                                e.currentTarget.style.backgroundColor = '#FAF5FF';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                              }}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* =================================================================
                1-YEAR WARRANTY SHOWCASE (MATCHES SCREENSHOT 4)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '36px 28px',
              textAlign: 'center',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.25,
                letterSpacing: -0.5,
                maxWidth: 580,
                margin: '0 auto 8px'
              }}>
                India's longest<br />
                <span style={{ color: '#2563EB' }}>1-year warranty</span>
              </h2>

              <p style={{
                fontSize: 15,
                color: '#4B5563',
                fontWeight: 500,
                marginBottom: 24
              }}>
                on all Native filters & major spares
              </p>

              {/* Water Splash Shield with number 1 graphic matching Screenshot 4 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 20px',
                maxWidth: 260
              }}>
                <img 
                  src="/images/water_purifier/warranty_shield_1year.png" 
                  alt="1-Year Warranty on Native Filters & Major Spares"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 14
                  }}
                />
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                borderRadius: 20,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onClick={() => setIsWarrantyModalOpen(true)}
              >
                <ShieldCheck size={16} />
                <span>Learn more about warranty coverage</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* =================================================================
                BENEFITS OF NATIVE FILTERS (MATCHES SCREENSHOT 5)
                ================================================================= */}
            <div style={{
              backgroundColor: '#0F1115',
              color: '#FFFFFF',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 44,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  lineHeight: 1.2,
                  marginBottom: 6
                }}>
                  Benefits of Native filters
                </h2>
                <p style={{
                  fontSize: 14,
                  color: '#9CA3AF',
                  fontWeight: 500
                }}>
                  A brand by Urban Company
                </p>
              </div>

              {/* 3 Dark Sub-Cards matching Screenshot 5 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Subcard 1: Superior filters. Engineered to last longer. */}
                <div style={{
                  backgroundColor: '#1C1F26',
                  borderRadius: 14,
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}>
                  <div>
                    <h3 style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: 12
                    }}>
                      Superior filters.<br />Engineered to last longer.
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#D1D5DB' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>3-layer filters</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#D1D5DB' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>High quality material</span>
                      </div>
                    </div>
                  </div>

                  {/* Compatible Brands Grid (Kent, Pureit, Aquaguard & more) */}
                  <div style={{
                    width: 116,
                    height: 116,
                    flexShrink: 0,
                    borderRadius: 14,
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2
                  }}>
                    <img 
                      src="/images/water_purifier/native_brands_grid.png" 
                      alt="Compatible with Kent, Pureit, Aquaguard & more"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: 12
                      }}
                    />
                  </div>
                </div>

                {/* Subcards 2 & 3 in a 2-column grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16
                }} className="native-benefits-subgrid">
                  
                  {/* Subcard 2: Tested for all water sources */}
                  <div style={{
                    backgroundColor: '#1C1F26',
                    borderRadius: 14,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: 18
                    }}>
                      Tested for all<br />water sources
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Tap Water */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#2D3139',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 6px'
                        }}>
                          <Droplets size={20} color="#38BDF8" />
                        </div>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Tap water</span>
                      </div>

                      {/* Borewell */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#2D3139',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 6px'
                        }}>
                          <Activity size={20} color="#34D399" />
                        </div>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Borewell</span>
                      </div>

                      {/* Tanker */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#2D3139',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 6px'
                        }}>
                          <Truck size={20} color="#FBBF24" />
                        </div>
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Tanker</span>
                      </div>
                    </div>
                  </div>

                  {/* Subcard 3: Adds essential minerals */}
                  <div style={{
                    backgroundColor: '#1C1F26',
                    borderRadius: 14,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      marginBottom: 18
                    }}>
                      Adds essential<br />minerals
                    </h3>

                    {/* Mineral Spheres with Glossy Gradients matching Screenshot 5 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Calcium Ca */}
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #71717A, #27272A, #09090B)',
                        border: '1px solid #52525B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 14,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                      }}>
                        Ca
                      </div>

                      {/* Magnesium Mg */}
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #71717A, #27272A, #09090B)',
                        border: '1px solid #52525B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 14,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                      }}>
                        Mg
                      </div>

                      {/* Alkaline pH */}
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 35% 35%, #71717A, #27272A, #09090B)',
                        border: '1px solid #52525B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 13,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                      }}>
                        pH
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                1. COMPARISON TABLE: NATIVE BY UC vs OTHER BRANDS vs LOCAL SHOPS (SCREENSHOT 1)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '28px 24px',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              overflowX: 'auto'
            }}>
              <div style={{ minWidth: 480 }}>
                {/* Table Header with Green Native by Urban Company Column */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1.6fr 1.3fr 1.3fr',
                  gap: 12,
                  alignItems: 'end',
                  marginBottom: 16
                }}>
                  <div></div>

                  {/* Native by Urban Company (Distinct Green Column Header matching Screenshot 1) */}
                  <div style={{
                    backgroundColor: '#00684A',
                    color: '#FFFFFF',
                    borderRadius: '12px 12px 0 0',
                    padding: '16px 14px 12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0, 104, 74, 0.2)'
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>
                      Native by<br />Urban Company
                    </div>
                  </div>

                  {/* Other brands */}
                  <div style={{
                    textAlign: 'center',
                    padding: '12px 8px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#374151',
                    lineHeight: 1.2
                  }}>
                    Other<br />brands
                  </div>

                  {/* Local shops */}
                  <div style={{
                    textAlign: 'center',
                    padding: '12px 8px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#374151',
                    lineHeight: 1.2
                  }}>
                    Local<br />shops
                  </div>
                </div>

                {/* Row 1: Warranty on Spares & Filters */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1.6fr 1.3fr 1.3fr',
                  gap: 12,
                  padding: '14px 10px',
                  borderTop: '1px solid #F3F4F6',
                  alignItems: 'center',
                  fontSize: 13
                }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Warranty</div>
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    color: '#065F46',
                    fontWeight: 700,
                    padding: '8px 12px',
                    borderRadius: 8,
                    textAlign: 'center',
                    border: '1px solid #BBF7D0'
                  }}>
                    1-year warranty
                  </div>
                  <div style={{ textAlign: 'center', color: '#6B7280' }}>Limited 3-month</div>
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>No warranty</div>
                </div>

                {/* Row 2: Spare Parts Quality */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1.6fr 1.3fr 1.3fr',
                  gap: 12,
                  padding: '14px 10px',
                  borderTop: '1px solid #F3F4F6',
                  alignItems: 'center',
                  fontSize: 13
                }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Filter Quality</div>
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    color: '#065F46',
                    fontWeight: 700,
                    padding: '8px 12px',
                    borderRadius: 8,
                    textAlign: 'center',
                    border: '1px solid #BBF7D0'
                  }}>
                    100% Genuine Native
                  </div>
                  <div style={{ textAlign: 'center', color: '#6B7280' }}>Aftermarket parts</div>
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>Unverified local</div>
                </div>

                {/* Row 3: Revisit Charges */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1.6fr 1.3fr 1.3fr',
                  gap: 12,
                  padding: '14px 10px',
                  borderTop: '1px solid #F3F4F6',
                  alignItems: 'center',
                  fontSize: 13
                }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Revisit Fee</div>
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    color: '#065F46',
                    fontWeight: 700,
                    padding: '8px 12px',
                    borderRadius: 8,
                    textAlign: 'center',
                    border: '1px solid #BBF7D0'
                  }}>
                    ₹0 for 1 full year
                  </div>
                  <div style={{ textAlign: 'center', color: '#6B7280' }}>Paid after 30 days</div>
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>Paid every visit</div>
                </div>

                {/* Row 4: Technician Training */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1.6fr 1.3fr 1.3fr',
                  gap: 12,
                  padding: '14px 10px',
                  borderTop: '1px solid #F3F4F6',
                  alignItems: 'center',
                  fontSize: 13
                }}>
                  <div style={{ fontWeight: 600, color: '#111827' }}>Technician</div>
                  <div style={{
                    backgroundColor: '#F0FDF4',
                    color: '#065F46',
                    fontWeight: 700,
                    padding: '8px 12px',
                    borderRadius: 8,
                    textAlign: 'center',
                    border: '1px solid #BBF7D0'
                  }}>
                    300+ hrs trained
                  </div>
                  <div style={{ textAlign: 'center', color: '#6B7280' }}>Third-party vendor</div>
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>Untrained</div>
                </div>
              </div>
            </div>

            {/* =================================================================
                2. STAY WORRY-FREE FOR 1 YEAR TIMELINE (SCREENSHOT 2)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.4,
                marginBottom: 24
              }}>
                Stay worry-free for 1 year
              </h2>

              <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
                <div style={{ minWidth: 520 }}>
                  {/* Months Header 1 to 12 matching Screenshot 2 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '90px repeat(12, 1fr)',
                    gap: 4,
                    alignItems: 'center',
                    marginBottom: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6B7280'
                  }}>
                    <span>Months →</span>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <span key={m} style={{ textAlign: 'center' }}>{m}</span>
                    ))}
                  </div>

                  {/* Native filters Row: Full 12-month green span */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 1fr',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                      Native<br />filters
                    </span>
                    <div style={{
                      backgroundColor: '#C6F6D5',
                      border: '1px solid #9AE6B4',
                      borderRadius: 6,
                      padding: '12px 16px',
                      color: '#22543D',
                      fontSize: 12.5,
                      fontWeight: 600,
                      lineHeight: 1.35,
                      textAlign: 'center'
                    }}>
                      ₹0 cost, 1-year warranty.<br />
                      No extra charge for revisits.
                    </div>
                  </div>

                  {/* Other filters Row: 1-3 grey, 4-12 red */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 1fr',
                    gap: 10,
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', lineHeight: 1.2 }}>
                      Other<br />filters
                    </span>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 9fr',
                      gap: 4,
                      alignItems: 'stretch'
                    }}>
                      {/* Months 1-3 */}
                      <div style={{
                        backgroundColor: '#E2E8F0',
                        borderRadius: '6px 0 0 6px',
                        minHeight: 46
                      }}></div>

                      {/* Months 4-12 in solid red matching screenshot 2 */}
                      <div style={{
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        borderRadius: '0 6px 6px 0',
                        padding: '12px 16px',
                        fontSize: 12.5,
                        fontWeight: 600,
                        lineHeight: 1.35,
                        textAlign: 'center'
                      }}>
                        No warranty.<br />
                        Extra cost if something fails.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                3. WHAT'S INCLUDED IN NATIVE KIT? (SCREENSHOT 3)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.4,
                marginBottom: 20
              }}>
                What's included in Native kit?
              </h2>

              {/* Photo Card of the 5 Filter Components with Numbered Badges 1 to 5 matching Screenshot 3 */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '24px 20px',
                textAlign: 'center',
                marginBottom: 24
              }}>
                <div style={{
                  maxWidth: 420,
                  margin: '0 auto 16px'
                }}>
                  <img 
                    src="/images/water_purifier/native_kit_5filters.png" 
                    alt="5 Filter Components Included in Native Kit"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: 10
                    }}
                  />
                </div>

                {/* Numbered Filter Legend List matching Screenshot 3 */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  textAlign: 'left',
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: 18
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      1
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Pre-filter spun</h4>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                        Captures external physical impurities like mud, rust, silt, and sand particles before water enters purifier.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      2
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Sediment filter</h4>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                        Multi-layer spun polypropylene that eliminates microscopic suspended solids and protects the RO membrane.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      3
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Pre-carbon filter</h4>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                        High-iodine activated carbon block that adsorbs free chlorine, hazardous VOCs, pesticides, and foul odor.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      4
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>RO filter (Membrane)</h4>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                        High-efficiency 80 GPD TFC membrane that filters dissolved heavy metals, fluorides, lead, arsenic, and bacteria.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      5
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Post-carbon / Mineralizer filter</h4>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>
                        Infuses essential minerals (Calcium, Magnesium) and balances pH to produce sweet, refreshing drinking water.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                4. OUR PROCESS (SCREENSHOTS 4 & 5)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.4,
                marginBottom: 28
              }}>
                Our Process
              </h2>

              {/* 5-Step Stepper Timeline matching Screenshots 4 & 5 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
                
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    1
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      Pre-service checks
                    </h3>
                    <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.45 }}>
                      The technician performs a detailed diagnosis to identify what needs repair or replacement.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    2
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      Upfront estimate & approval
                    </h3>
                    <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.45 }}>
                      The technician shares an exact price. Work begins only after your approval of the quote.
                    </p>
                  </div>
                </div>

                {/* Step 3 with Kitchen Repair Photo matching Screenshot 4 */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      Expert repair & replacement
                    </h3>
                    <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.45, marginBottom: 14 }}>
                      Technician completes all work. Required parts are sourced at standard fixed rates if needed.
                    </p>

                    {/* Photo below Step 3 matching Screenshot 4 */}
                    <div style={{
                      maxWidth: 340,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid #E5E7EB'
                    }}>
                      <img 
                        src="/images/water_purifier/ro_process_repair_step.png" 
                        alt="Technician Expert Repair & Replacement"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    4
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      Post-repair quality check
                    </h3>
                    <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.45 }}>
                      After service, the technician checks the machine to ensure proper functioning and clean water.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    5
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                      Warranty
                    </h3>
                    <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.45 }}>
                      The parts replaced are covered for up to 1-year warranty from the day of service.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================================
                5. URBAN COMPANY PROMISE (SCREENSHOT 5)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.4,
                marginBottom: 20
              }}>
                Urban Company promise
              </h2>

              {/* Subcard matching Screenshot 5 */}
              <div style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20
              }}>
                <div>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#111827',
                    lineHeight: 1.25,
                    marginBottom: 14
                  }}>
                    On-time service by<br />top-rated technicians
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: '#374151' }}>
                      <CheckCircle2 size={16} color="#059669" />
                      <span>300+ hours of training</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 500, color: '#374151' }}>
                      <CheckCircle2 size={16} color="#059669" />
                      <span>Trained across major brands</span>
                    </div>
                  </div>
                </div>

                {/* Photo of smiling technician with black polo and cap matching Screenshot 5 */}
                <div style={{
                  width: 120,
                  height: 140,
                  flexShrink: 0,
                  borderRadius: 12,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src="/images/water_purifier/ro_top_rated_technician.png" 
                    alt="Top-Rated Certified Technician"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* =================================================================
                6. WE SERVICE & REPAIR ALL MAJOR BRANDS (SCREENSHOT)
                ================================================================= */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 20,
              padding: '32px 28px',
              marginBottom: 44,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <h2 style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.4,
                marginBottom: 24,
                lineHeight: 1.2
              }}>
                We service & repair all<br />major brands
              </h2>

              {/* Brands We Service */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 14
                }}>
                  We service the following brands:
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12
                }}>
                  {[
                    { name: 'Aquaguard', img: '/images/water_purifier/brands/brand_aquaguard.png' },
                    { name: 'Kent', img: '/images/water_purifier/brands/brand_kent.png' },
                    { name: 'Pureit', img: '/images/water_purifier/brands/brand_pureit.png' },
                    { name: 'Livpure', img: '/images/water_purifier/brands/brand_livpure.png' },
                    { name: 'Havells', img: '/images/water_purifier/brands/brand_havells.png' },
                    { name: '& more...', img: '/images/water_purifier/brands/brand_andmore.png' },
                  ].map((brand, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E5E7EB',
                        borderRadius: 12,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 64,
                        transition: 'all 0.15s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#9CA3AF';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img 
                        src={brand.img} 
                        alt={brand.name}
                        style={{
                          maxHeight: 38,
                          maxWidth: '85%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Brands We DON'T Service */}
              <div>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 14
                }}>
                  We <span style={{ fontWeight: 800, color: '#111827' }}>don’t</span> service the following brands:
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12
                }}>
                  {[
                    { name: 'Xiaomi', img: '/images/water_purifier/brands/brand_xiaomi.png' },
                    { name: 'LG', img: '/images/water_purifier/brands/brand_lg.png' },
                    { name: 'AO Smith', img: '/images/water_purifier/brands/brand_aosmith.png' },
                  ].map((brand, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E5E7EB',
                        borderRadius: 12,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 64,
                        transition: 'all 0.15s',
                        cursor: 'default'
                      }}
                    >
                      <img 
                        src={brand.img} 
                        alt={brand.name}
                        style={{
                          maxHeight: 38,
                          maxWidth: '85%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 44
            }}>
              <h3 style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Droplets size={18} color="#0284C7" />
                <span>Recommended TDS Guide for Safe Drinking Water</span>
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12
              }} className="tds-grid">
                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A', marginBottom: 4 }}>50 - 150 PPM</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>Excellent Purity</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>Ideal mineral balance for everyday hydration and kidney health.</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#CA8A04', marginBottom: 4 }}>150 - 300 PPM</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>Good / Acceptable</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>Safe drinking water; sediment filter & carbon check recommended.</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Above 300 PPM</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>High Hardness (RO Required)</div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>Heavy metals & dissolved salts; multi-stage RO membrane essential.</div>
                </div>
              </div>
            </div>

            {/* =================================================================
                FREQUENTLY ASKED QUESTIONS ACCORDION
                ================================================================= */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: -0.3,
                marginBottom: 16
              }}>
                Frequently asked questions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {FAQS.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index}
                      style={{
                        border: '1px solid #E5E7EB',
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                          {faq.q}
                        </span>
                        <ChevronDown 
                          size={18} 
                          color="#6B7280" 
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      </button>

                      {isOpen && (
                        <div style={{
                          padding: '0 18px 16px',
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: '#4B5563',
                          borderTop: '1px solid #F3F4F6'
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ===================================================================
              RIGHT STICKY SIDEBAR: UC PROMISE + CART (MATCHES ALL SCREENSHOTS)
              =================================================================== */}
          <aside style={{ position: 'sticky', top: 88 }}>
            
            {/* UC Promise Card (Matching Screenshots 2, 3, 4, 5) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '20px 22px',
              marginBottom: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                  UC Promise
                </h3>

                {/* Holographic circular QUALITY ASSURED seal matching official screenshot */}
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E0F2FE 0%, #F5D0FE 50%, #CFFAFE 100%)',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(56, 189, 248, 0.2)'
                }}>
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: '#0369A1', letterSpacing: -0.2 }}>
                    QUALITY
                  </span>
                  <Check size={14} color="#0284C7" strokeWidth={3} />
                  <span style={{ fontSize: 7, fontWeight: 700, color: '#0369A1', letterSpacing: -0.2 }}>
                    ASSURED
                  </span>
                </div>
              </div>

              {/* 3 Promise Bullets matching screenshot */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: '#111827' }}>
                  <Check size={16} color="#111827" strokeWidth={2.5} />
                  <span>Verified Professionals</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: '#111827' }}>
                  <Check size={16} color="#111827" strokeWidth={2.5} />
                  <span>Hassle Free Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 500, color: '#111827' }}>
                  <Check size={16} color="#111827" strokeWidth={2.5} />
                  <span>Transparent Pricing</span>
                </div>
              </div>
            </div>

            {/* Sticky Cart Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {totalCartCount === 0 ? (
                /* Empty Cart State */
                <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <ShoppingBag size={32} color="#9CA3AF" />
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                    No items in your cart
                  </h4>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>
                    Select a service above to get started with trusted doorstep servicing.
                  </p>
                </div>
              ) : (
                /* Populated Cart State */
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 12,
                    borderBottom: '1px solid #F3F4F6',
                    marginBottom: 14
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      Cart ({totalCartCount} item{totalCartCount > 1 ? 's' : ''})
                    </span>
                    <button
                      type="button"
                      onClick={onOpenCart}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#7C3AED',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Cart
                    </button>
                  </div>

                  {/* List of Cart Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto', marginBottom: 14 }}>
                    {cartEntries.map(([id, item]) => (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }}>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{item.name || item.title}</span>
                          <div style={{ fontSize: 11, color: '#6B7280' }}>₹{item.price} × {item.quantity}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => onUpdateQty && onUpdateQty(id, (item.quantity || 1) - 1)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              border: '1px solid #E5E7EB',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 700, fontSize: 12 }}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty && onUpdateQty(id, (item.quantity || 1) + 1)}
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 4,
                              border: '1px solid #E5E7EB',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal & Checkout */}
                  <div style={{
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: 12,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Subtotal</span>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
                      ₹{cartSubtotal.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenCheckout || onOpenCart}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 10,
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6D28D9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7C3AED'}
                  >
                    Proceed to Pay • ₹{cartSubtotal.toLocaleString()}
                  </button>
                </div>
              )}
            </div>

          </aside>

        </div>
      </main>

      {/* =====================================================================
          STANDARD RATE CARD MODAL (uccover Standard rate card >)
          ===================================================================== */}
      {isRateCardModalOpen && (
        <div 
          onClick={() => setIsRateCardModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              width: '100%',
              maxWidth: 580,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '24px 28px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: '1px solid #E5E7EB',
              marginBottom: 20
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 800, fontSize: 13, marginBottom: 2 }}>
                  <Check size={14} strokeWidth={3} />
                  <span>uccover</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>
                  Standard Rate Card
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsRateCardModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} color="#4B5563" />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 18, lineHeight: 1.4 }}>
              100% genuine spares with transparent pricing. Urban Company guarantees verified pricing with no hidden charges.
            </p>

            {/* Spares Table */}
            <div style={{
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 20
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                padding: '10px 14px',
                backgroundColor: '#F9FAFB',
                fontSize: 12,
                fontWeight: 700,
                color: '#6B7280',
                borderBottom: '1px solid #E5E7EB'
              }}>
                <span>Spare Part / Service</span>
                <span style={{ textAlign: 'right' }}>Standard Price</span>
                <span style={{ textAlign: 'right' }}>Warranty</span>
              </div>

              {RATE_CARD_ITEMS.map((item, i) => (
                <div 
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    padding: '11px 14px',
                    fontSize: 13,
                    borderBottom: i < RATE_CARD_ITEMS.length - 1 ? '1px solid #F3F4F6' : 'none',
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#111827' }}>{item.part}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: '#111827' }}>{item.price}</span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: '#059669', fontSize: 12 }}>{item.warranty}</span>
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#EFF6FF',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 12,
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8
            }}>
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                All spare parts carry official manufacturer warranty. The ₹299 inspection fee is adjusted in the final repair bill.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          1-YEAR WARRANTY MODAL (India's longest warranty on spares >)
          ===================================================================== */}
      {isWarrantyModalOpen && (
        <div 
          onClick={() => setIsWarrantyModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              width: '100%',
              maxWidth: 520,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '28px 24px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={24} color="#2563EB" />
                <h3 style={{ fontSize: 19, fontWeight: 800, color: '#111827' }}>
                  India's Longest 1-Year Warranty
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWarrantyModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} color="#4B5563" />
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.5, marginBottom: 18 }}>
              Urban Company offers India’s longest 1-year warranty on all Native water purifier filters and major spare parts, assuring uncompromised drinking water quality and peace of mind.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#1F2937' }}>
                <CheckCircle2 size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                <span><strong>Full 365 Days Protection:</strong> Zero cost technician visit and part replacement if an installed filter candle or membrane clogs prematurely.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#1F2937' }}>
                <CheckCircle2 size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                <span><strong>Major Spares Covered:</strong> Covers booster pump, SMPS adapter, solenoid valves, and auto-cut float switches.</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#1F2937' }}>
                <CheckCircle2 size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                <span><strong>No Paperwork Needed:</strong> All warranties are digitally tracked in your Urban Company profile and phone number.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWarrantyModalOpen(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                backgroundColor: '#111827',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          SERVICE DETAILS MODAL (When clicking "View details" on any service)
          ===================================================================== */}
      {selectedDetailItem && (
        <div 
          onClick={() => setSelectedDetailItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              width: '100%',
              maxWidth: 540,
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '24px 28px',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
                  {selectedDetailItem.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                  <span style={{ color: '#F59E0B' }}>★</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{selectedDetailItem.rating}</span>
                  <span>({selectedDetailItem.reviews})</span>
                  <span>•</span>
                  <span>{selectedDetailItem.duration}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDetailItem(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} color="#4B5563" />
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.5, marginBottom: 18 }}>
              {selectedDetailItem.description}
            </p>

            {/* Inclusions */}
            {selectedDetailItem.inclusions && (
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                  What's included:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailItem.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#374151' }}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusions */}
            {selectedDetailItem.exclusions && (
              <div style={{ marginBottom: 22 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                  What's not included:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailItem.exclusions.map((exc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#6B7280' }}>
                      <X size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Add to Cart button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              borderTop: '1px solid #E5E7EB'
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#6B7280', display: 'block' }}>Total Price</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>
                  ₹{selectedDetailItem.price.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleServiceAdd(selectedDetailItem);
                  setSelectedDetailItem(null);
                }}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Style Enhancements */}
      <style>{`
        @media (max-width: 900px) {
          .ro-page-grid {
            grid-template-columns: 1fr !important;
          }
          .ro-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .native-benefits-subgrid {
            grid-template-columns: 1fr !important;
          }
          .tds-grid {
            grid-template-columns: 1fr !important;
          }
          .cart-btn-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
