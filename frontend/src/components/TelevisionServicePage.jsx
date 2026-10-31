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
  Tv
} from 'lucide-react';

export function TelevisionServicePage({
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

  // Catalogue of Television services matching official Urban Company Screenshots 1 & 2
  const TV_SERVICES = [
    // =========================================================================
    // 1. TV CHECK-UP (Screenshot 1)
    // =========================================================================
    {
      id: 'tv-check-up',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'TV check-up',
      rating: '4.77',
      reviews: '169K reviews',
      price: 249,
      originalPrice: null,
      startsAt: true,
      optionsText: '4 options',
      duration: '60 mins',
      image: '/images/tv_checkup_item.jpg?v=2',
      bullets: [
        'Visitation fee will be adjusted in the final repair quote',
        'CRT TVs, sound bars & set-top boxes not covered'
      ],
      inclusions: [
        'Comprehensive diagnosis of display panel, backlight LED strips, T-Con board & main PCB',
        'Power supply testing, capacitor inspection & audio IC continuity test',
        'HDMI, audio jack & Wi-Fi/Bluetooth connectivity troubleshooting',
        'Visitation fee adjusted in the final repair bill'
      ],
      exclusions: [
        'CRT TVs, sound bars & external set-top boxes are not covered',
        'Physically cracked or broken LED panels cannot be repaired'
      ],
      details: 'Comprehensive diagnostic inspection by an Urban Company verified TV technician. Identifies problems like no display, sound but no picture, horizontal/vertical lines, blinking power LED, or restarting loops. If repair is done, the check-up fee is adjusted in the final bill.',
      options: [
        {
          id: 'tv-checkup-32-inch',
          title: 'Up to 32 inch TV check-up',
          rating: '4.77',
          reviews: '74K reviews',
          price: 249,
          duration: '60 mins',
          description: 'Power supply board test, backlight LED diagnosis, motherboard & sound output inspection'
        },
        {
          id: 'tv-checkup-43-inch',
          title: '33 to 43 inch TV check-up',
          rating: '4.78',
          reviews: '52K reviews',
          price: 299,
          duration: '60 mins',
          description: 'T-Con board test, display lines diagnosis, HDMI port & smart board connectivity test'
        },
        {
          id: 'tv-checkup-55-inch',
          title: '44 to 55 inch TV check-up',
          rating: '4.80',
          reviews: '31K reviews',
          price: 349,
          duration: '60 mins',
          description: '4K panel testing, backlighting inverter circuit diagnosis, smart OS firmware & sound board check'
        },
        {
          id: 'tv-checkup-56-plus',
          title: '56 inch & above / OLED / QLED TV check-up',
          rating: '4.84',
          reviews: '12K reviews',
          price: 449,
          duration: '60 mins',
          description: 'High-end OLED/QLED pixel inspection, mainboard micro-soldering evaluation & audio amp test'
        }
      ]
    },

    // =========================================================================
    // 2. TV INSTALLATION / UNINSTALLATION (Screenshot 2)
    // =========================================================================
    {
      id: 'tv-installation-uninstallation',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'TV installation / uninstallation',
      rating: '4.90',
      reviews: '5K reviews',
      price: 349,
      originalPrice: null,
      startsAt: true,
      optionsText: '4 options',
      duration: '45 mins',
      image: '/images/tv_install_item.jpg?v=2',
      bullets: [
        'Spirit level wall alignment & heavy-duty anchor bolt drilling',
        'Cable concealment, HDMI/Set-top box setup & display tuning'
      ],
      inclusions: [
        'Precision spirit level wall bracket mounting and heavy-duty anchor bolt drilling',
        'Safe TV hanging, anti-drop latch locking & viewing angle adjustment',
        'HDMI, set-top box, soundbar and console wire neat grouping',
        'Channel tuning, picture calibration and operational demo'
      ],
      exclusions: [
        'Wall mount brackets can be purchased from technician if not available'
      ],
      details: 'Professional wall mount installation or safe uninstallation by certified technicians. We ensure perfectly level mounting with spirit level tools, sturdy anchor bolts for safety, and clean cable management.',
      options: [
        {
          id: 'tv-install-up-to-43',
          title: 'TV wall mount installation (up to 43 inch)',
          rating: '4.90',
          reviews: '2.8K reviews',
          price: 349,
          duration: '45 mins',
          description: 'Wall drilling with heavy-duty anchors, bracket mounting, TV hanging & spirit level alignment'
        },
        {
          id: 'tv-install-44-to-55',
          title: 'TV wall mount installation (44 to 55 inch)',
          rating: '4.92',
          reviews: '1.4K reviews',
          price: 449,
          duration: '45 mins',
          description: 'Large bracket mounting with heavy-duty anchors, dual-technician safe lift & cable setup'
        },
        {
          id: 'tv-install-56-plus',
          title: 'TV wall mount installation (56 inch & above)',
          rating: '4.94',
          reviews: '520 reviews',
          price: 599,
          duration: '60 mins',
          description: 'Extra-large reinforced wall bracket installation, precision tilt calibration & wire concealment'
        },
        {
          id: 'tv-uninstall-any-size',
          title: 'TV uninstallation (any size)',
          rating: '4.88',
          reviews: '640 reviews',
          price: 199,
          duration: '30 mins',
          description: 'Safe wall unmounting, bracket removal, wire tagging and packaging preparation for shifting'
        }
      ]
    }
  ];

  // Filter services by search query
  const filteredServices = TV_SERVICES.filter(svc => {
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
    const el = document.getElementById('tv-catalogue-section');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  return (
    <div className="tv-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR (MATCHING URBAN COMPANY SCREENSHOTS 1 & 2)  */}
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

            {/* Search in Television Repair */}
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
                placeholder="Search in Television Repair"
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
        id="tv-catalogue-section"
        className="ac-page-main-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '32px 20px 80px',
          alignItems: 'start'
        }}
      >
        {/* ======================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR ("Television Repair")            */}
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
              fontSize: 34,
              fontWeight: 900,
              color: '#0F172A',
              margin: '0 0 10px 0',
              lineHeight: 1.15,
              letterSpacing: -0.6
            }}>
              Television<br />Repair
            </h1>

            {/* Rating: ★ 4.83 (1.3 M bookings) */}
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
              <span style={{ fontWeight: 800, color: '#0F172A' }}>4.83</span>
              <span style={{
                color: '#475569',
                borderBottom: '1px dotted #94A3B8',
                cursor: 'pointer',
                paddingBottom: 1
              }}>
                (1.3 M bookings)
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
        {/* COLUMN 2: CENTER CONTENT ("Select a service")           */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          {/* Section Heading: "Select a service" (Screenshot 1) */}
          <h2 style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 24px 0',
            letterSpacing: -0.4
          }}>
            Select a service
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 18,
                    paddingBottom: 28,
                    borderBottom: '1px solid #F1F5F9',
                    alignItems: 'start'
                  }}
                >
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
                      <span style={{ color: '#64748B', borderBottom: '1px dotted #94A3B8', cursor: 'pointer' }}>
                        ({service.reviews})
                      </span>
                    </div>

                    {/* Price Row: Starts at ₹249 */}
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

                    {/* Bullets (Matches Screenshots 1 & 2) */}
                    {service.bullets && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                        {service.bullets.map((b, i) => (
                          <p key={i} style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.45 }}>
                            • {b}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* View details button (Screenshots 1 & 2) */}
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

                  {/* Right: Product Thumbnail & Add Stepper (Screenshots 1 & 2) */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    width: 116,
                    flexShrink: 0
                  }}>
                    {/* Product Thumbnail */}
                    <div style={{
                      width: 116,
                      height: 104,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: '#F6F6F6',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
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
          {/* Card 1: UC Promise (Screenshots 1 & 2) */}
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
              /* Empty Cart State with Shopping Cart + Purple Bird SVG (Screenshots 1 & 2) */
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
      {/* 3. MULTI-OPTIONS MODAL (TV CHECK-UP / INSTALLATION)       */}
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
                  Select TV Screen Size / Type
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
              <span>Visitation fee adjusted in the final repair bill</span>
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
                Urban Company offers comprehensive warranty protection on all television repairs:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>180-day Warranty on Replaced Spare Parts</strong>: Any replaced power supply board, backlight LED strip, T-Con board, or motherboard carries a 180-day free replacement guarantee.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>30-day Service Protection</strong>: If display lines, restart loops, or audio issues reoccur within 30 days of service, our technician will revisit and resolve it for free.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Check size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Genuine OEM Parts Only</strong>: Compatible with Sony Bravia, Samsung, LG, Mi, OnePlus, TCL, Vu, Panasonic, and all major brands.
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
            Urban Company is India&apos;s largest home services platform. Over 1.3 Million bookings completed for verified, warranty-backed Television repair and wall mount installation.
          </p>
          <div style={{ fontSize: 12, color: '#64748B', borderTop: '1px solid #1E293B', paddingTop: 16 }}>
            © 2026 Urban Company. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
