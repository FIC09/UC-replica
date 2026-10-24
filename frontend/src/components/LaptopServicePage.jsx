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
  Sparkles
} from 'lucide-react';

export function LaptopServicePage({
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

  // Catalogue of Laptop services matching official Urban Company screenshot
  const LAPTOP_SERVICES = [
    {
      id: 'laptop-desktop-service',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'Laptop/Desktop service',
      rating: '4.82',
      reviews: '24K reviews',
      price: 599,
      originalPrice: 799,
      priceLabel: 'Starts at ₹599',
      optionsCount: 4,
      duration: '60 mins',
      image: '/images/laptop_circuit_macro.jpg',
      inclusions: [
        'Internal cleaning of fans, vents & components',
        'Enhances speed, cooling & battery efficiency'
      ],
      details: 'Deep ultrasonic and anti-static brush cleaning of cooling fans, heat sinks, and thermal paste reapplication to prevent laptop overheating and thermal throttling.'
    },
    {
      id: 'laptop-system-upgrade-consult',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'System upgrade consultation',
      rating: '4.81',
      reviews: '5K reviews',
      price: 199,
      originalPrice: 299,
      priceLabel: 'Starts at ₹199',
      optionsCount: null,
      duration: '30 mins',
      image: '/images/laptop_keyboard_repair.jpg',
      inclusions: [
        'Expert guidance for SSD, RAM upgrade & performance boost',
        'Diagnostic health report of motherboard, storage & battery'
      ],
      details: 'On-site technical assessment to check maximum supported RAM capacity and high-speed NVMe M.2 SSD compatibility for 5X faster boot times.'
    },
    {
      id: 'laptop-os-software-setup',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'OS installation & software setup',
      rating: '4.85',
      reviews: '32K reviews',
      price: 499,
      originalPrice: 699,
      priceLabel: '₹499',
      optionsCount: null,
      duration: '45 mins',
      image: '/images/laptop_dell_xps.jpg',
      inclusions: [
        'Genuine Windows/macOS clean install & driver configuration',
        'Antivirus, MS Office & essential utilities setup'
      ],
      details: 'Fresh operating system installation with all original chipset, graphics, and WiFi drivers tuned for peak stability and zero bloatware.'
    },
    {
      id: 'laptop-screen-display-replace',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'Screen / display replacement consultation',
      rating: '4.79',
      reviews: '18K reviews',
      price: 249,
      originalPrice: 399,
      priceLabel: '₹249',
      optionsCount: null,
      duration: '30 mins',
      image: '/images/appliance_laptop.jpg',
      inclusions: [
        'Accurate diagnosis for cracked screen, lines on display or blank screen',
        'Free door-step pick up and return delivery with OEM genuine screen quote'
      ],
      details: 'Precision diagnosis of display panel ribbon cables, backlight inverters, or shattered LCD/OLED panels with 100% original OEM screen replacements.'
    },
    {
      id: 'laptop-keyboard-battery-replace',
      sectionId: 'select-service',
      sectionTitle: 'Select a service',
      title: 'Keyboard / Trackpad / Battery replacement',
      rating: '4.80',
      reviews: '22K reviews',
      price: 299,
      originalPrice: 449,
      priceLabel: 'Starts at ₹299',
      optionsCount: null,
      duration: '45 mins',
      image: '/images/laptop_keyboard_repair.jpg',
      inclusions: [
        'Resolves non-working keys, swollen battery & erratic trackpad',
        '100% brand original parts with up to 6 months warranty'
      ],
      details: 'Replacement for faulty keys, liquid spill damages, or batteries failing to hold charge. Includes safe old battery recycling.'
    }
  ];

  // Filter services by search query
  const filteredServices = LAPTOP_SERVICES.filter(svc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return svc.title.toLowerCase().includes(q) ||
           svc.sectionTitle.toLowerCase().includes(q) ||
           svc.inclusions.some(inc => inc.toLowerCase().includes(q));
  });

  // Calculate cart entries
  const cartEntries = Object.entries(cart);
  const totalCartCount = cartEntries.reduce((sum, [, item]) => sum + (item.qty || 0), 0);
  const cartTotalAmount = cartEntries.reduce((sum, [, item]) => sum + ((item.price || 0) * (item.qty || 0)), 0);

  function scrollToServices() {
    const el = document.getElementById('laptop-services-section');
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  return (
    <div className="laptop-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
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

            {/* Search in Laptop Repair */}
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
                placeholder="Search in Laptop Repair"
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
      {/* 2. MAIN 3-COLUMN LAYOUT (MATCHING SCREENSHOT)             */}
      {/* ========================================================= */}
      <div 
        className="ac-page-main-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '28px 20px 80px',
          alignItems: 'start'
        }}
      >
        {/* ======================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR ("Laptop Repair")                */}
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
              fontSize: 28,
              fontWeight: 800,
              color: '#111827',
              margin: '0 0 6px 0',
              lineHeight: 1.2,
              letterSpacing: -0.5
            }}>
              Laptop Repair
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13.5,
              fontWeight: 600,
              color: '#374151',
              marginTop: 8
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
              <span style={{ fontWeight: 800, color: '#111827' }}>4.81</span>
              <span style={{ color: '#64748B' }}>(476K bookings)</span>
            </div>
          </div>

          {/* Up to 180 days warranty banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '11px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#334155',
            cursor: 'default'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} color="#6E42E5" />
              <span>Up to 180 days warranty</span>
            </div>
            <ChevronRight size={15} color="#94A3B8" />
          </div>

          {/* View Services Button (From Screenshot) */}
          <button
            type="button"
            onClick={scrollToServices}
            style={{
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              width: 'fit-content',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#582AD1'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6E42E5'}
          >
            View Services
          </button>
        </aside>

        {/* ======================================================= */}
        {/* COLUMN 2: CENTER SERVICES LISTING                       */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          <section id="laptop-services-section" style={{ scrollMarginTop: 88 }}>
            {/* Section Heading: "Select a service" */}
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 24px 0',
              letterSpacing: -0.3
            }}>
              Select a service
            </h2>

            {/* Services List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {filteredServices.map(service => {
                const cartItem = cart[service.id];
                const qty = cartItem ? cartItem.qty : 0;

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
                        marginBottom: 8,
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

                      {/* Price Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14.5,
                        fontWeight: 800,
                        color: '#0F172A',
                        marginBottom: 12
                      }}>
                        <span>{service.priceLabel || `₹${service.price}`}</span>
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
                          <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                            • {service.duration}
                          </span>
                        )}
                      </div>

                      {/* Inclusions */}
                      <ul style={{
                        margin: '0 0 12px 0',
                        paddingLeft: 18,
                        fontSize: 13,
                        color: '#475569',
                        lineHeight: 1.55
                      }}>
                        {service.inclusions.map((inc, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>
                            {inc}
                          </li>
                        ))}
                      </ul>

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
                      gap: 8,
                      width: 140,
                      flexShrink: 0
                    }}>
                      {/* Image Box */}
                      <div style={{
                        width: 130,
                        height: 110,
                        borderRadius: 14,
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
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              onAddToCart(service);
                              showToast(`Added ${service.title} to cart`);
                            }}
                            style={{
                              width: '100px',
                              border: '1.5px solid #6E42E5',
                              backgroundColor: '#FFFFFF',
                              color: '#6E42E5',
                              fontSize: 13.5,
                              fontWeight: 800,
                              padding: '6px 0',
                              borderRadius: 8,
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
                            width: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#6E42E5',
                            color: '#FFFFFF',
                            borderRadius: 8,
                            padding: '5px 10px',
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
                            <span style={{ fontWeight: 800, fontSize: 13.5 }}>{qty}</span>
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

                        {service.optionsCount && (
                          <span style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                            {service.optionsCount} options
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        {/* ======================================================= */}
        {/* COLUMN 3: RIGHT SIDEBAR ("UC Promise" & "Cart")         */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 20
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
            {/* Header: Title + Quality Assured Shimmer Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
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

              {/* Shimmer Circular Badge */}
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #A78BFA 0%, #EC4899 50%, #60A5FA 100%)',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(167, 139, 250, 0.25)'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 2
                }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: '#6E42E5', lineHeight: 1 }}>
                    QUALITY
                  </span>
                  <span style={{ fontSize: 6.5, fontWeight: 800, color: '#EC4899', lineHeight: 1 }}>
                    ASSURED
                  </span>
                </div>
              </div>
            </div>

            {/* Checkmark List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={16} color="#0F172A" strokeWidth={2.5} />
                <span>Verified Professionals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={16} color="#0F172A" strokeWidth={2.5} />
                <span>Hassle Free Booking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155' }}>
                <Check size={16} color="#0F172A" strokeWidth={2.5} />
                <span>Transparent Pricing</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cart Summary Box */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '20px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {cartEntries.length === 0 ? (
              /* Empty Cart State with Shopping Cart SVG */
              <div style={{
                textAlign: 'center',
                padding: '30px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <svg width="68" height="60" viewBox="0 0 68 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 10H16L22 42H54L58 18H20" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="26" cy="48" r="3.5" fill="#94A3B8" />
                  <circle cx="50" cy="48" r="3.5" fill="#94A3B8" />
                  <path d="M48 6C48 6 52 3 56 6C60 9 58 13 58 13C58 13 55 12 52 11C49 10 48 6 48 6Z" fill="#8B5CF6" />
                  <circle cx="54" cy="7" r="1" fill="#FFFFFF" />
                  <line x1="28" y1="24" x2="48" y2="24" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                  <line x1="30" y1="30" x2="46" y2="30" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                  <line x1="32" y1="36" x2="42" y2="36" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#64748B',
                  margin: '14px 0 0 0'
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
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: '1px solid #F1F5F9'
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>
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
                      fontSize: 13
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ color: '#64748B', fontSize: 12 }}>
                          ₹{item.price} × {item.qty}
                        </div>
                      </div>

                      {/* Small Stepper */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: '#F1F5F9',
                        borderRadius: 6,
                        padding: '3px 8px'
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

      {/* Service Detail Modal */}
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
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {selectedDetailItem.title}
              </h3>
              <button 
                onClick={() => setSelectedDetailItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
              {selectedDetailItem.details}
            </p>

            <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              What's Included:
            </h4>
            <ul style={{ margin: '0 0 20px 0', paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              {selectedDetailItem.inclusions.map((inc, i) => (
                <li key={i}>{inc}</li>
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
    </div>
  );
}
