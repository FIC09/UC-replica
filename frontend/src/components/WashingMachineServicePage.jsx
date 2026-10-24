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
  Sparkles,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export function WashingMachineServicePage({
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
  const [isMuted, setIsMuted] = useState(true);

  // Catalogue of Washing Machine services matching official Urban Company Screenshots 1 & 2
  const WASHING_MACHINE_SERVICES = [
    // =========================================================================
    // 1. JET SERVICE (Screenshot 1)
    // =========================================================================
    {
      id: 'washing-machine-jet-service',
      sectionId: 'select-service',
      sectionTitle: 'Select your service',
      title: 'Washing machine jet service',
      rating: '4.78',
      reviews: '5K reviews',
      price: 1099,
      originalPrice: null,
      startsAt: true,
      optionsText: '2 options',
      duration: '1 hr 20 mins',
      hasBanner: true,
      bannerImage: '/images/washing_machine_drum_banner.jpg',
      image: '/images/washing_machine_jet_item.jpg',
      bullets: [
        'Complete high-pressure power jet cleaning of the inner & outer tub',
        'Removes hidden sludge, limescale deposits, detergent buildup & foul odor',
        'Dismantling of agitator / pulsator with full chemical-free sanitization'
      ],
      inclusions: [
        'High-pressure power jet descaling of drum, pulsator, and outer tub',
        'Drain pump filter cleaning & lint trap debris extraction',
        'Anti-bacterial hot steam wash destroying 99.9% of bacteria & mold',
        'Vibration check, belt tension calibration & silent spin test'
      ],
      exclusions: [
        'Electrical PCB or motor hardware replacement (quoted separately if needed)'
      ],
      details: 'Over time, detergent slime, lint, and hard-water scale accumulate behind the spin drum, transferring bacteria onto freshly washed clothes. Our certified technician dismounts the drum and uses a high-pressure jet wash to thoroughly eliminate deep-seated grime and foul odors.',
      options: [
        {
          id: 'wm-jet-top-load',
          title: 'Fully automatic top load jet service',
          rating: '4.78',
          reviews: '3.4K reviews',
          price: 1099,
          duration: '1 hr 20 mins',
          description: 'Pulsator disassembly, outer tub high-pressure jet wash, scale descaling & lint chamber clean'
        },
        {
          id: 'wm-jet-front-load',
          title: 'Fully automatic front load jet service',
          rating: '4.82',
          reviews: '1.6K reviews',
          price: 1399,
          duration: '1 hr 40 mins',
          description: 'Stainless steel drum deep jet flush, door rubber gasket mold extraction & drain pump cleanse'
        }
      ]
    },

    // =========================================================================
    // 2. CHECK-UP (Screenshot 2)
    // =========================================================================
    {
      id: 'washing-machine-check-up',
      sectionId: 'select-service',
      sectionTitle: 'Select your service',
      title: 'Washing machine check-up',
      rating: '4.79',
      reviews: '103K reviews',
      price: 199,
      originalPrice: null,
      startsAt: true,
      optionsText: '3 options',
      duration: '60 mins',
      image: '/images/washing_machine_checkup_v2.jpg',
      bullets: [
        'Complete check-up to identify issues before repair',
        'We share a quote and get it approved by you before the repair begins'
      ],
      inclusions: [
        'Complete diagnostic inspection of motor, capacitor, drain pump & inlet valve',
        'Electrical circuit PCB test, error code diagnosis & wiring continuity check',
        'Spin vibration balance & water level pressure sensor calibration',
        'Visitation fee adjusted in the final repair bill'
      ],
      exclusions: [
        'Replacement spare parts cost not included in inspection fee'
      ],
      details: 'Comprehensive doorstep inspection by a verified UC appliance expert. Identifies problems like machine not spinning, water not draining, excessive noise/vibration, or error codes. If repair is done, the ₹199 check-up fee is deducted from the final quote.',
      options: [
        {
          id: 'wm-checkup-top-load',
          title: 'Fully automatic top load check-up',
          rating: '4.79',
          reviews: '62K reviews',
          price: 199,
          duration: '60 mins',
          description: 'Pulsator rotation, water inlet valve, drain pump, lid lock switch & drive belt test'
        },
        {
          id: 'wm-checkup-semi-automatic',
          title: 'Semi-automatic washing machine check-up',
          rating: '4.76',
          reviews: '24K reviews',
          price: 199,
          duration: '60 mins',
          description: 'Wash motor, spin motor capacitor, gear box, timer switch & drain bellows inspection'
        },
        {
          id: 'wm-checkup-front-load',
          title: 'Fully automatic front load check-up',
          rating: '4.81',
          reviews: '17K reviews',
          price: 249,
          duration: '60 mins',
          description: 'Inverter direct drive motor test, shock absorbers, heating element & digital PCB diagnostic'
        }
      ]
    },

    // =========================================================================
    // 3. INSTALLATION (Screenshot 2)
    // =========================================================================
    {
      id: 'washing-machine-installation',
      sectionId: 'select-service',
      sectionTitle: 'Select your service',
      title: 'Washing machine installation',
      rating: '4.81',
      reviews: '54K reviews',
      price: 399,
      originalPrice: null,
      startsAt: true,
      optionsText: '3 options',
      duration: '45 mins',
      image: '/images/washing_machine_install_v2.jpg',
      bullets: [
        'The washing machine will be installed with care.',
        'The area will be cleaned once work is done.'
      ],
      inclusions: [
        'Transit bolt removal, anti-vibration rubber base leveling & spirit level calibration',
        'Inlet braided hose and tap adapter leak-proof coupling',
        'Drain hose connection with clamp fixing & post-install live wash cycle demo',
        'Workspace tidying and packaging disposal'
      ],
      exclusions: [
        'Plumbing pipe alterations or additional tap fitting require quick repairs plumber'
      ],
      details: 'Professional installation for top-load and front-load washing machines. Ensures vibration-free operation, correct water pressure inlet fitting, and damage-free transit bolt removal.',
      options: [
        {
          id: 'wm-install-top-load',
          title: 'Top load washing machine installation',
          rating: '4.81',
          reviews: '32K reviews',
          price: 399,
          duration: '45 mins',
          description: 'Water inlet connection, drain pipe setting, spirit level leveling & operational test'
        },
        {
          id: 'wm-install-front-load',
          title: 'Front load washing machine installation',
          rating: '4.83',
          reviews: '14K reviews',
          price: 499,
          duration: '60 mins',
          description: 'Transit bolts safe extraction, rubber feet leveling, inlet filter installation & cycle test'
        },
        {
          id: 'wm-uninstallation',
          title: 'Washing machine uninstallation',
          rating: '4.78',
          reviews: '8K reviews',
          price: 199,
          duration: '30 mins',
          description: 'Water drainage, inlet hose decoupling, transit bolt re-securing for safe shifting'
        }
      ]
    }
  ];

  // Filter services by search query
  const filteredServices = WASHING_MACHINE_SERVICES.filter(svc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return svc.title.toLowerCase().includes(q) ||
           (svc.bullets && svc.bullets.some(b => b.toLowerCase().includes(q))) ||
           (svc.options && svc.options.some(opt => opt.title.toLowerCase().includes(q)));
  });

  // Calculate cart entries
  const cartEntries = Object.entries(cart);
  const totalCartCount = cartEntries.reduce((sum, [, item]) => sum + (item.qty || 0), 0);
  const cartTotalAmount = cartEntries.reduce((sum, [, item]) => sum + ((item.price || 0) * (item.qty || 0)), 0);

  function scrollToServices() {
    const el = document.getElementById('wm-catalogue-section');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  return (
    <div className="washing-machine-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
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
                fontSize: 11.5,
                letterSpacing: -0.2
              }}>
                FIC
              </div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#000000', letterSpacing: -0.4 }}>
                Forge India Connect
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

            {/* Search in Washing Machine Repair */}
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
                placeholder="Search in Washing Machine Repair"
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
      {/* 2. MAIN 3-COLUMN LAYOUT (MATCHING SCREENSHOT 1 & 2)       */}
      {/* ========================================================= */}
      <div 
        id="wm-catalogue-section"
        className="ac-page-main-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '32px 20px 80px',
          alignItems: 'start'
        }}
      >
        {/* ======================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR ("Washing Machine Repair")        */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Main Title & Rating */}
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 10px 0',
              lineHeight: 1.15,
              letterSpacing: -0.6
            }}>
              Washing Machine<br />Repair
            </h1>

            {/* Rating: ★ 4.79 (3.7 M bookings) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              color: '#1E293B',
              marginTop: 6
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
              <span style={{ fontWeight: 800, color: '#0F172A' }}>4.79</span>
              <span style={{
                color: '#475569',
                borderBottom: '1px dotted #94A3B8',
                cursor: 'pointer',
                paddingBottom: 1
              }}>
                (3.7 M bookings)
              </span>
            </div>
          </div>

          {/* Up to 180 days warranty banner (Matches Screenshot 1) */}
          <div 
            onClick={() => setIsWarrantyModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={17} color="#6E42E5" />
              <span>Up to 180 days warranty</span>
            </div>
            <ChevronRight size={15} color="#64748B" />
          </div>

          {/* View Services Button (From Screenshot 1) */}
          <button
            type="button"
            onClick={scrollToServices}
            style={{
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '11px 22px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              width: 'fit-content',
              boxShadow: '0 4px 12px rgba(110, 66, 229, 0.25)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#582AD1'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6E42E5'}
          >
            View Services
          </button>
        </aside>

        {/* ======================================================= */}
        {/* COLUMN 2: CENTER CONTENT ("Select your service")        */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          {/* Section Heading: "Select your service" */}
          <h2 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 22px 0',
            letterSpacing: -0.4
          }}>
            Select your service
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            {filteredServices.map(service => {
              const cartItem = cart[service.id];
              const qty = cartItem ? cartItem.qty : 0;
              const optionsCountInCart = service.options 
                ? service.options.reduce((sum, opt) => sum + (cart[opt.id]?.qty || 0), 0)
                : 0;

              return (
                <div
                  key={service.id}
                  style={{
                    paddingBottom: 26,
                    borderBottom: '1px solid #F1F5F9'
                  }}
                >
                  {/* Hero Media Banner for Jet Service (Screenshot 1) */}
                  {service.hasBanner && (
                    <div style={{
                      position: 'relative',
                      borderRadius: 16,
                      overflow: 'hidden',
                      backgroundColor: '#0F172A',
                      marginBottom: 18,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                    }}>
                      <img 
                        src={service.bannerImage} 
                        alt="High Pressure Power Jet Cleaning of Washing Machine Drum"
                        style={{
                          width: '100%',
                          height: 210,
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />

                      {/* Top Left Badge: POWER JET DRUM CLEANING */}
                      <div style={{
                        position: 'absolute',
                        top: 14,
                        left: 16,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '5px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <Sparkles size={13} color="#A78BFA" />
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FFFFFF', letterSpacing: 0.4 }}>
                          POWER JET DRUM CLEANING
                        </span>
                      </div>

                      {/* Video Player Style Controls Overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.7) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '14px 18px',
                        pointerEvents: 'none'
                      }}>
                        {/* Title & Subtitle + Audio Toggle */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          marginBottom: 10,
                          gap: 12
                        }}>
                          <div>
                            <h4 style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: '#FFFFFF',
                              margin: '0 0 2px 0',
                              letterSpacing: -0.2
                            }}>
                              The deep cleaning it deserves
                            </h4>
                            <p style={{
                              fontSize: 12,
                              color: '#E2E8F0',
                              margin: 0,
                              fontWeight: 500
                            }}>
                              High-pressure jet wash removes hidden sludge &amp; limescale
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            style={{
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '50%',
                              width: 30,
                              height: 30,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              pointerEvents: 'auto',
                              transition: 'all 0.15s ease',
                              flexShrink: 0
                            }}
                            title={isMuted ? 'Unmute video' : 'Mute video'}
                          >
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>
                        </div>

                        {/* Video timeline bar */}
                        <div style={{
                          width: '100%',
                          height: 3.5,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: '45%',
                            height: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 2
                          }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Service Card Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 18,
                    alignItems: 'start'
                  }}>
                    {/* Left Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: 16.5,
                        fontWeight: 800,
                        color: '#0F172A',
                        margin: '0 0 5px 0',
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
                        <span style={{ color: '#64748B' }}>({service.reviews})</span>
                      </div>

                      {/* Price Row: Starts at ₹199 • 60 mins */}
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
                        {service.duration && (
                          <span style={{ color: '#64748B', fontSize: 12.5, fontWeight: 500 }}>
                            • {service.duration}
                          </span>
                        )}
                      </div>

                      {/* Bullets (Matches Screenshot 2) */}
                      {service.bullets && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                          {service.bullets.map((b, i) => (
                            <p key={i} style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                              • {b}
                            </p>
                          ))}
                        </div>
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
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'none'
                        }}
                      >
                        View details
                      </button>
                    </div>

                    {/* Right: Product Thumbnail & Add Stepper */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      width: 116,
                      flexShrink: 0
                    }}>
                      {/* Product Thumbnail (only if not hero banner or if thumbnail present) */}
                      {!service.hasBanner && (
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
                      )}

                      {/* Add Button / Stepper */}
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
                                style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ fontWeight: 800, fontSize: 13 }}>{qty}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty(service.id, qty + 1)}
                                style={{ border: 'none', background: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 0 }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
          {/* Card 1: UC Promise (Screenshot 1 & 2) */}
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

              {/* Shimmer Circular Holographic Seal Badge (From Screenshot 1 & 2) */}
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

            {/* Checkmark List (Exact from Screenshot 1 & 2) */}
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

          {/* Card 2: Cart Summary Box (Screenshot 1 & 2) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '24px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {cartEntries.length === 0 ? (
              /* Empty Cart State with Shopping Cart + Purple Bird SVG (From Screenshot 1 & 2) */
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
      {/* 3. MULTI-OPTIONS MODAL                                    */}
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
                  Select Machine Type
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

            {/* Note banner */}
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
              <span>Inspection fee is adjusted in the final repair quote</span>
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
      {/* 4. SERVICE DETAIL MODAL (VIEW DETAILS)                    */}
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
      {/* 5. WARRANTY POLICY MODAL                                  */}
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
                Urban Company offers comprehensive warranty protection on all washing machine services:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>180-day Warranty on Replaced Spare Parts</strong>: Any replaced drain pump, inlet valve, capacitor, or drive belt carries a 180-day free replacement guarantee.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>30-day Service Protection</strong>: If the same issue reoccurs within 30 days of service, our technician visits again and resolves it for free.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Genuine OEM Parts Only</strong>: Compatible with IFB, LG, Samsung, Whirlpool, Bosch, Godrej, Panasonic, and all major brands.
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
      {/* 6. URBAN COMPANY FOOTER BANNER                           */}
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
            Urban Company is India&apos;s largest home services platform. Over 3.7 Million bookings completed for verified, warranty-backed Washing Machine repair and servicing.
          </p>
          <div style={{ fontSize: 12, color: '#64748B', borderTop: '1px solid #1E293B', paddingTop: 16 }}>
            © 2026 Urban Company. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
