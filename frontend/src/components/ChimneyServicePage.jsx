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
  ArrowRight,
  Sparkles,
  X,
  Tag
} from 'lucide-react';

export function ChimneyServicePage({
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
  const [activeSubTab, setActiveSubTab] = useState('combos'); // 'combos' | 'repair' | 'service' | 'install'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [optionsModalService, setOptionsModalService] = useState(null);

  // Sub-services for the left sidebar "Select a service" (Matches Screenshots 1 to 5)
  const SUB_SERVICES = [
    {
      id: 'combos',
      name: 'Combos',
      type: 'deal-tile',
      dealText: 'COMBO DEALS',
    },
    {
      id: 'repair',
      name: 'Repair',
      type: 'image-tile',
      image: '/images/chimney_repair_tech.jpg'
    },
    {
      id: 'service',
      name: 'Service',
      type: 'image-tile',
      image: '/images/chimney_service_clean.jpg'
    },
    {
      id: 'install',
      name: 'Installation/uninstallation',
      type: 'image-tile',
      image: '/images/chimney_install_tech.jpg'
    }
  ];

  // Catalogue of Chimney services matching Screenshots 1 to 5 exactly
  const CHIMNEY_SERVICES = [
    // =========================================================================
    // 1. COMBOS (Screenshots 1, 2, 3)
    // =========================================================================
    {
      id: 'chimney-combo-deep-gas-stove',
      sectionId: 'combos',
      sectionTitle: 'Combos',
      title: 'Deep service with gas stove',
      rating: '4.72',
      reviews: '4K reviews',
      price: 1498,
      originalPrice: 1898,
      startsAt: true,
      optionsText: '2 options',
      duration: '2 hrs',
      image: '/images/chimney_combo_stove.jpg',
      inclusions: [
        'Dismantling for internal servicing of motor, blowers & filters',
        'Interior & exterior surface degreasing'
      ],
      details: 'Comprehensive internal dismantle and foam degreasing for your kitchen chimney plus full carbon cleaning and flame adjustment for your gas stove hob.',
      options: [
        {
          id: 'combo-deep-curved-glass',
          title: 'Curved glass chimney + Gas stove deep clean',
          rating: '4.72',
          reviews: '2.8K reviews',
          price: 1498,
          originalPrice: 1898,
          duration: '2 hrs',
          description: 'Deep solvent degreasing of curved glass hood, baffle filters, motor blower and 2/3/4 burner stove'
        },
        {
          id: 'combo-deep-straight-line',
          title: 'Straight line / T-Shape chimney + Gas stove deep clean',
          rating: '4.74',
          reviews: '1.2K reviews',
          price: 1698,
          originalPrice: 2098,
          duration: '2 hrs 15 mins',
          description: 'Heavy duty grease removal for box/T-shape stainless steel chimneys and gas stove burner nozzles'
        }
      ]
    },
    {
      id: 'chimney-combo-basic-gas-stove',
      sectionId: 'combos',
      sectionTitle: 'Combos',
      title: 'Basic service with gas stove',
      rating: '4.73',
      reviews: '1K reviews',
      price: 999,
      originalPrice: 1298,
      startsAt: false,
      optionsText: null,
      duration: '1 hr 30 mins',
      image: '/images/chimney_combo_stove.jpg',
      inclusions: [
        'Mesh & filter cleanup, exterior degreasing & stain removal'
      ],
      details: 'Periodic maintenance to clear surface grease from filters and ensure clear, blue, efficient burner flames on your gas stove.'
    },
    {
      id: 'chimney-annual-package-2visits',
      sectionId: 'combos',
      sectionTitle: 'Combos',
      isHero: true,
      heroDiscountBadge: 'UPTO 16% OFF',
      heroTopTitle: 'Chimney deep service: 2 visits in 12 months',
      title: '2 visits: Chimney deep service',
      rating: '4.80',
      reviews: '87K reviews',
      price: 2200,
      originalPrice: 2498,
      startsAt: true,
      optionsText: '2 options',
      subtextBadge: 'Starts at ₹1100/service',
      duration: null,
      image: '/images/hero_chimney.jpg',
      inclusions: [
        'Book 2 visits chimney deep service at a discounted price',
        'Schedule your first service now & the remaining anytime within 12 months'
      ],
      details: 'Annual value pack. Get 2 comprehensive deep clean visits spaced across 12 months to keep your kitchen completely odor and smoke-free.',
      options: [
        {
          id: 'pack-2visits-curved-glass',
          title: '2 Visits: Curved glass chimney deep service',
          rating: '4.80',
          reviews: '55K reviews',
          price: 2200,
          originalPrice: 2498,
          duration: 'Valid for 12 months',
          description: '2 complete dismantling & hot foam wash sessions for curved glass chimneys'
        },
        {
          id: 'pack-2visits-straight-line',
          title: '2 Visits: Straight line / T-Shape chimney deep service',
          rating: '4.82',
          reviews: '32K reviews',
          price: 2500,
          originalPrice: 2898,
          duration: 'Valid for 12 months',
          description: '2 deep overhauls for stainless steel T-shape or island chimneys'
        }
      ]
    },

    // =========================================================================
    // 2. REPAIR (Screenshot 4)
    // =========================================================================
    {
      id: 'chimney-checkup',
      sectionId: 'repair',
      sectionTitle: 'Repair',
      title: 'Chimney check-up',
      rating: '4.69',
      reviews: '40K reviews',
      price: 199,
      originalPrice: null,
      startsAt: true,
      optionsText: '2 options',
      bullet: 'Visitation fee will be adjusted in the final repair quote',
      duration: null,
      image: '/images/chimney_repair_tech.jpg',
      inclusions: [
        'Complete diagnostic check of motor, push buttons, PCB & exhaust airflow',
        'Transparent quote shared before repair; visitation charge adjusted in repair bill'
      ],
      details: 'Expert diagnostic inspection when your chimney has power issues, low suction, or unusual motor vibration.',
      options: [
        {
          id: 'repair-checkup-curved-glass',
          title: 'Curved glass chimney check-up',
          rating: '4.69',
          reviews: '28K reviews',
          price: 199,
          duration: '30 mins',
          description: 'Inspection of touch panel, gesture sensors, motor capacitors and LED lights'
        },
        {
          id: 'repair-checkup-straight-line',
          title: 'Straight line / T-Shape / Island chimney check-up',
          rating: '4.70',
          reviews: '12K reviews',
          price: 249,
          duration: '30 mins',
          description: 'Motor bearing testing, duct flap inspection and electronic board troubleshooting'
        }
      ]
    },

    // =========================================================================
    // 3. SERVICE (Screenshot 5)
    // =========================================================================
    {
      id: 'chimney-deep-service',
      sectionId: 'service',
      sectionTitle: 'Service',
      title: 'Deep chimney service',
      rating: '4.80',
      reviews: '87K reviews',
      price: 1249,
      originalPrice: null,
      startsAt: true,
      optionsText: '2 options',
      duration: null,
      image: '/images/chimney_service_clean.jpg',
      inclusions: [
        'Dismantling for internal servicing of motor, blowers & filters',
        'Interior & exterior surface degreasing'
      ],
      details: 'Thorough internal overhaul using powerful caustic foam degreaser to remove stubborn hardened grease and restore 100% suction.',
      options: [
        {
          id: 'deep-service-curved-glass',
          title: 'Curved glass chimney deep service',
          rating: '4.80',
          reviews: '60K reviews',
          price: 1249,
          duration: '1 hr 15 mins',
          description: 'Complete internal dismantle, caustic foam degreasing of blowers, motor casing & glass polishing'
        },
        {
          id: 'deep-service-straight-line',
          title: 'Straight line / T-Shape chimney deep service',
          rating: '4.81',
          reviews: '27K reviews',
          price: 1449,
          duration: '1 hr 30 mins',
          description: 'Heavy duty degreasing for box/T-shape chimneys with stainless steel baffle filters'
        }
      ]
    },

    // =========================================================================
    // 4. INSTALLATION/UNINSTALLATION (Screenshot 5)
    // =========================================================================
    {
      id: 'chimney-installation-uninstallation',
      sectionId: 'install',
      sectionTitle: 'Installation/uninstallation',
      title: 'Chimney installation & uninstallation',
      rating: '4.72',
      reviews: '626 reviews',
      price: 459,
      originalPrice: null,
      startsAt: true,
      optionsText: '2 options',
      duration: '60 mins',
      image: '/images/chimney_install_tech.jpg',
      inclusions: [
        'Safe dismantling & professional mounting with spirit-level precision',
        'Flexible exhaust duct pipe routing & electrical safety check'
      ],
      details: 'Precise mounting at optimal height (65-75cm) above stove for best suction, or damage-free dismounting when shifting.',
      options: [
        {
          id: 'chimney-install-option',
          title: 'Kitchen chimney installation',
          rating: '4.82',
          reviews: '410 reviews',
          price: 699,
          duration: '60 mins',
          description: 'Drilling, heavy-duty wall bracket mounting, exhaust duct connection & testing'
        },
        {
          id: 'chimney-uninstall-option',
          title: 'Kitchen chimney uninstallation',
          rating: '4.70',
          reviews: '216 reviews',
          price: 459,
          duration: '40 mins',
          description: 'Safe removal of chimney canopy, duct pipe disconnection and bracket removal'
        }
      ]
    }
  ];

  // Scroll to section when subtab clicked
  function handleSubTabClick(tabId) {
    setActiveSubTab(tabId);
    const target = document.getElementById(`chimney-section-${tabId}`);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  // Filter services by search query
  const filteredServices = CHIMNEY_SERVICES.filter(svc => {
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

  return (
    <div className="chimney-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR (MATCHING URBAN COMPANY SCREENSHOT EXACTLY) */}
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
          {/* Left: Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

          {/* Center: Location Pill + Search in Chimney Repair */}
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

            {/* Search in Chimney Repair */}
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
                placeholder="Search in Chimney Repair"
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
      {/* 2. MAIN 3-COLUMN LAYOUT (MATCHING SCREENSHOTS 1 TO 5)     */}
      {/* ========================================================= */}
      <div 
        className="ac-page-main-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '24px 20px 80px',
          alignItems: 'start'
        }}
      >
        {/* ======================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR ("Chimney Repair" & Tiles)       */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Main Title & Rating (★ 4.78 (817K bookings)) */}
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: -0.6
            }}>
              Chimney Repair
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13.5,
              fontWeight: 600,
              color: '#374151'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF'
              }}>
                <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>4.78</span>
              <span style={{ color: '#64748B', borderBottom: '1px dotted #94A3B8', cursor: 'pointer' }}>
                (817K bookings)
              </span>
            </div>
          </div>

          {/* Up to 180 days warranty banner (Matches Screenshot 1) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#6E42E5" />
              <span>Up to 180 days warranty</span>
            </div>
            <ChevronRight size={15} color="#64748B" />
          </div>

          {/* Select a Service Box */}
          <div style={{
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
                      textAlign: 'center',
                      cursor: 'pointer',
                      gap: 6
                    }}
                  >
                    {/* Tile Thumbnail */}
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      border: isActive ? '2px solid #0F172A' : '1px solid #E5E7EB',
                      backgroundColor: sub.type === 'deal-tile' ? '#E6F7F5' : '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 6,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}>
                      {sub.type === 'deal-tile' ? (
                        <div style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'block',
                            fontSize: 10.5,
                            fontWeight: 900,
                            color: '#0F766E',
                            lineHeight: 1.2,
                            letterSpacing: -0.2
                          }}>
                            COMBO
                          </span>
                          <span style={{
                            display: 'block',
                            fontSize: 10.5,
                            fontWeight: 900,
                            color: '#0F766E',
                            lineHeight: 1.2,
                            letterSpacing: -0.2
                          }}>
                            DEALS
                          </span>
                        </div>
                      ) : (
                        <img
                          src={sub.image}
                          alt={sub.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 10
                          }}
                        />
                      )}
                    </div>

                    {/* Tile Label */}
                    <span style={{
                      fontSize: 11.5,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#0F172A' : '#475569',
                      lineHeight: 1.25,
                      maxWidth: 86
                    }}>
                      {sub.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ======================================================= */}
        {/* COLUMN 2: CENTER SERVICES LISTING                       */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          {['combos', 'repair', 'service', 'install'].map(sectionKey => {
            const sectionServices = filteredServices.filter(s => s.sectionId === sectionKey);
            if (sectionServices.length === 0) return null;

            const sectionName = SUB_SERVICES.find(s => s.id === sectionKey)?.name || 'Services';

            return (
              <section 
                key={sectionKey} 
                id={`chimney-section-${sectionKey}`}
                style={{ marginBottom: 48, scrollMarginTop: 88 }}
              >
                {/* Section Title */}
                <h2 style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 20px 0',
                  letterSpacing: -0.5
                }}>
                  {sectionName}
                </h2>

                {/* Service Cards inside Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sectionServices.map(service => {
                    const cartItem = cart[service.id];
                    const qty = cartItem ? cartItem.qty : 0;
                    const optionsCountInCart = service.options 
                      ? service.options.reduce((sum, opt) => sum + (cart[opt.id]?.qty || 0), 0)
                      : 0;

                    // If it is the featured Hero card (2 visits in 12 months)
                    if (service.isHero) {
                      return (
                        <div
                          key={service.id}
                          style={{
                            border: '1px solid #E5E7EB',
                            borderRadius: 16,
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                          }}
                        >
                          {/* Top Half Banner */}
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            padding: '22px 28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 20
                          }}>
                            <div>
                              <span style={{
                                backgroundColor: '#047857',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: 4,
                                display: 'inline-block',
                                marginBottom: 10,
                                letterSpacing: 0.3
                              }}>
                                {service.heroDiscountBadge}
                              </span>
                              <h3 style={{
                                fontSize: 22,
                                fontWeight: 900,
                                color: '#0F172A',
                                margin: 0,
                                lineHeight: 1.25,
                                letterSpacing: '-0.4px',
                                maxWidth: 320
                              }}>
                                {service.heroTopTitle}
                              </h3>
                            </div>

                            <div style={{ width: 170, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                              <img
                                src={service.image}
                                alt={service.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          </div>

                          {/* Bottom Half Row */}
                          <div style={{
                            padding: '18px 24px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            borderTop: '1px solid #F1F5F9',
                            gap: 20
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                                {service.title}
                              </h4>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 6 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                                  <Star size={13} fill="#6E42E5" color="#6E42E5" /> {service.rating}
                                </span>
                                <span style={{ borderBottom: '1px dotted #94A3B8', cursor: 'pointer' }}>
                                  ({service.reviews})
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14, marginBottom: 6 }}>
                                {service.startsAt && <span style={{ fontSize: 12.5, color: '#64748B' }}>Starts at</span>}
                                <strong style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹{service.price}</strong>
                                {service.originalPrice && (
                                  <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: 13 }}>
                                    ₹{service.originalPrice}
                                  </span>
                                )}
                              </div>

                              {service.subtextBadge && (
                                <div style={{ color: '#047857', fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span>◆</span>
                                  <span>{service.subtextBadge}</span>
                                </div>
                              )}

                              <ul style={{ margin: '0 0 10px 0', paddingLeft: 18, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                                {service.inclusions?.map((inc, i) => (
                                  <li key={i} style={{ marginBottom: 3 }}>{inc}</li>
                                ))}
                              </ul>

                              <button
                                type="button"
                                onClick={() => setSelectedDetailItem(service)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  color: '#6E42E5',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                View details
                              </button>
                            </div>

                            {/* Button */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, width: 110 }}>
                              {optionsCountInCart === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setOptionsModalService(service)}
                                  style={{
                                    width: '100%',
                                    padding: '7px 0',
                                    borderRadius: 8,
                                    border: '1.5px solid #6E42E5',
                                    backgroundColor: '#FFFFFF',
                                    color: '#6E42E5',
                                    fontSize: 13.5,
                                    fontWeight: 800,
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    backgroundColor: '#6E42E5',
                                    color: '#FFFFFF',
                                    borderRadius: 8,
                                    padding: '6px 8px',
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
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Standard Service Item
                    return (
                      <div
                        key={service.id}
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
                          <h3 style={{
                            fontSize: 16.5,
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
                            fontSize: 12.5
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

                          {/* Price Row */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 8,
                            fontSize: 14.5,
                            fontWeight: 800,
                            color: '#0F172A',
                            marginBottom: 8
                          }}>
                            {service.startsAt && <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>Starts at</span>}
                            <span>₹{service.price}</span>
                            {service.originalPrice && (
                              <span style={{
                                textDecoration: 'line-through',
                                color: '#94A3B8',
                                fontSize: 13,
                                fontWeight: 500
                              }}>
                                ₹{service.originalPrice}
                              </span>
                            )}
                            {service.duration && (
                              <span style={{ color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
                                • {service.duration}
                              </span>
                            )}
                          </div>

                          {/* Single Bullet Point if present */}
                          {service.bullet && (
                            <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                              • {service.bullet}
                            </p>
                          )}

                          {/* Inclusions list */}
                          {service.inclusions && service.inclusions.length > 0 && !service.bullet && (
                            <ul style={{
                              margin: '0 0 10px 0',
                              paddingLeft: 18,
                              fontSize: 12.5,
                              color: '#475569',
                              lineHeight: 1.5
                            }}>
                              {service.inclusions.map((inc, i) => (
                                <li key={i} style={{ marginBottom: 3 }}>
                                  {inc}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* View details button */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailItem(service)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#6E42E5',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'none'
                            }}
                          >
                            View details
                          </button>
                        </div>

                        {/* Right: Image & Add Stepper */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          width: 110,
                          flexShrink: 0
                        }}>
                          {/* Image Box */}
                          <div style={{
                            width: 110,
                            height: 74,
                            borderRadius: 12,
                            overflow: 'hidden',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
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
                                    padding: '5px 6px',
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
        {/* COLUMN 3: RIGHT SIDEBAR ("UC Promise" & "Cart")         */}
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

              {/* Shimmer Circular Holographic Seal Badge */}
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
                        gap: 6,
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        padding: '2px 6px'
                      }}>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(id, item.qty - 1)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, display: 'flex' }}
                        >
                          <Minus size={12} color="#475569" />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: 12 }}>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(id, item.qty + 1)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, display: 'flex' }}
                        >
                          <Plus size={12} color="#475569" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#0F172A',
                  paddingTop: 10,
                  borderTop: '1px solid #F1F5F9',
                  marginBottom: 14
                }}>
                  <span>Subtotal</span>
                  <span>₹{cartTotalAmount}</span>
                </div>

                {/* View Cart / Checkout Button */}
                <button
                  type="button"
                  onClick={onOpenCheckout}
                  style={{
                    width: '100%',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 16px',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(110, 66, 229, 0.3)',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#582AD1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6E42E5'}
                >
                  <span>Proceed to Pay</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>₹{cartTotalAmount}</span>
                    <ArrowRight size={15} />
                  </div>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ========================================================= */}
      {/* 3. OPTIONS SELECTION MODAL (For Combos, Check-up, etc.)   */}
      {/* ========================================================= */}
      {optionsModalService && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setOptionsModalService(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px 14px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                  {optionsModalService.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                    <Star size={13} fill="#6E42E5" color="#6E42E5" /> {optionsModalService.rating}
                  </span>
                  <span>({optionsModalService.reviews})</span>
                  <span>•</span>
                  <span>Select an option</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOptionsModalService(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Options List */}
            <div style={{ overflowY: 'auto', padding: '16px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {optionsModalService.options?.map(opt => {
                const optQty = cart[opt.id]?.qty || 0;
                return (
                  <div 
                    key={opt.id}
                    style={{
                      border: optQty > 0 ? '1.5px solid #6E42E5' : '1px solid #E5E7EB',
                      backgroundColor: optQty > 0 ? '#FAF7FF' : '#FFFFFF',
                      borderRadius: 12,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 3px' }}>
                        {opt.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700, color: '#6E42E5' }}>
                          <Star size={11} fill="#6E42E5" color="#6E42E5" /> {opt.rating}
                        </span>
                        <span>({opt.reviews})</span>
                        {opt.duration && <span>• {opt.duration}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        <span>₹{opt.price}</span>
                        {opt.originalPrice && (
                          <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>
                            ₹{opt.originalPrice}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.35 }}>
                          {opt.description}
                        </p>
                      )}
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      {optQty === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(opt);
                            showToast(`Added ${opt.title} to cart`);
                          }}
                          style={{
                            padding: '6px 20px',
                            borderRadius: 8,
                            border: '1.5px solid #6E42E5',
                            backgroundColor: '#FFFFFF',
                            color: '#6E42E5',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          backgroundColor: '#6E42E5',
                          borderRadius: 8,
                          padding: '5px 10px',
                          color: '#FFFFFF'
                        }}>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(opt.id, optQty - 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>{optQty}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(opt.id, optQty + 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAFAFA'
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
                {optionsModalService.options?.reduce((sum, opt) => sum + (cart[opt.id]?.qty || 0), 0)} items added
              </span>
              <button
                type="button"
                onClick={() => setOptionsModalService(null)}
                style={{
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 24px',
                  fontSize: 13.5,
                  fontWeight: 800,
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
      {/* 4. SERVICE DETAILS MODAL (When clicking "View details")   */}
      {/* ========================================================= */}
      {selectedDetailItem && (
        <div 
          className="modal-backdrop-overlay" 
          onClick={() => setSelectedDetailItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setSelectedDetailItem(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', paddingRight: 32 }}>
              {selectedDetailItem.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              <span style={{ color: '#6E42E5', fontWeight: 800 }}>★ {selectedDetailItem.rating}</span>
              <span>({selectedDetailItem.reviews})</span>
              {selectedDetailItem.duration && <span>• {selectedDetailItem.duration}</span>}
            </div>

            <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginBottom: 14 }}>
              ₹{selectedDetailItem.price}
              {selectedDetailItem.originalPrice && (
                <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through', marginLeft: 8 }}>
                  ₹{selectedDetailItem.originalPrice}
                </span>
              )}
            </div>

            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              {selectedDetailItem.details}
            </p>

            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              What's Included:
            </h4>
            <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              {selectedDetailItem.inclusions.map((inc, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{inc}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                onAddToCart(selectedDetailItem);
                showToast(`Added ${selectedDetailItem.title} to cart`);
                setSelectedDetailItem(null);
              }}
              style={{
                width: '100%',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '11px',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Add to Cart • ₹{selectedDetailItem.price}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. BOTTOM BRAND BANNER (MATCHES SCREENSHOT)              */}
      {/* ========================================================= */}
      <footer style={{
        borderTop: '1px solid #EAECF0',
        backgroundColor: '#FFFFFF',
        padding: '36px 20px 48px',
        marginTop: 40
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 32,
            height: 32,
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: 14.5,
            borderRadius: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: -0.5
          }}>
            UC
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#000000', letterSpacing: -0.5 }}>
            Urban Company
          </span>
        </div>
      </footer>
    </div>
  );
}
