import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Star, Zap, Users } from 'lucide-react';

export function HomesSections({ 
  onSelectCategory, 
  onSelectService, 
  onAddToCart, 
  onOpenApplianceModal, 
  onOpenACPage, 
  onOpenChimneyPage, 
  onOpenLaptopPage, 
  onOpenRefrigeratorPage, 
  onOpenWashingMachinePage, 
  onOpenMicrowavePage, 
  onOpenTelevisionPage, 
  onOpenCleaningModal, 
  onOpenFullCleaningModal,
  onOpenElectricianModal,
  onOpenSmartLocksPage,
  onOpenPurifierPage,
  onOpenWaterPurifierServicePage,
  onOpenBathroomCleaningPage,
  onOpenKitchenCleaningPage,
  onOpenFullHomeCleaningPage,
  onOpenCockroachControlPage
}) {
  function handleCategory(catId) {
    if (catId === 'quick-repairs' && onOpenElectricianModal) {
      onOpenElectricianModal();
      return;
    }
    onSelectCategory(catId);
    const el = document.getElementById('services-catalogue');
    if (el) {
      const offset = -76;
      const topPos = el.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  }

  // Horizontal Scroll Controller for Most Booked Services
  const mostBookedRef = useRef(null);
  const [canScrollMBLeft, setCanScrollMBLeft] = useState(false);
  const [canScrollMBRight, setCanScrollMBRight] = useState(true);

  const promoRef = useRef(null);
  const nnRef = useRef(null);
  const applianceRef = useRef(null);

  const scrollPromo = (direction) => {
    if (!promoRef.current) return;
    const offset = direction === 'left' ? -460 : 460;
    promoRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const scrollNN = (direction) => {
    if (!nnRef.current) return;
    const offset = direction === 'left' ? -460 : 460;
    nnRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const scrollAppliance = (direction) => {
    if (!applianceRef.current) return;
    const offset = direction === 'left' ? -460 : 460;
    applianceRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const checkMBScroll = () => {
    if (!mostBookedRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = mostBookedRef.current;
    setCanScrollMBLeft(scrollLeft > 10);
    setCanScrollMBRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Horizontal Scroll Controller for Electrician, Plumber, Carpenters
  const epcRef = useRef(null);
  const [canScrollEPCLeft, setCanScrollEPCLeft] = useState(false);
  const [canScrollEPCRight, setCanScrollEPCRight] = useState(true);

  const checkEPCScroll = () => {
    if (!epcRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = epcRef.current;
    setCanScrollEPCLeft(scrollLeft > 10);
    setCanScrollEPCRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkMBScroll();
    checkEPCScroll();
    window.addEventListener('resize', checkMBScroll);
    window.addEventListener('resize', checkEPCScroll);
    return () => {
      window.removeEventListener('resize', checkMBScroll);
      window.removeEventListener('resize', checkEPCScroll);
    };
  }, []);

  const scrollMB = (direction) => {
    if (!mostBookedRef.current) return;
    const offset = direction === 'left' ? -520 : 520;
    mostBookedRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkMBScroll, 350);
  };

  const scrollEPC = (direction) => {
    if (!epcRef.current) return;
    const offset = direction === 'left' ? -520 : 520;
    epcRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkEPCScroll, 350);
  };

  // Exact 10 items from the 2 screenshots for Electrician, Plumber, Carpenters
  const EPC_SERVICES = [
    {
      id: 'fan-repair',
      name: 'Fan repair',
      rating: '4.80',
      price: 149,
      image: '/images/fan_repair.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'tubelight-install',
      name: 'Tubelight Installation / Replacement',
      rating: '4.86',
      price: 119,
      image: '/images/tubelight.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'door-lock-repair',
      name: 'Door lock repair & installation',
      rating: '4.79',
      isInstant: true,
      price: 149,
      image: '/images/door_lock_mortise.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'flush-tank-repair',
      name: 'Flush tank repair',
      rating: '4.75',
      price: 149,
      image: '/images/flush_tank.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'door-repair',
      name: 'Door repair',
      rating: '4.78',
      isInstant: true,
      price: 199,
      image: '/images/door_repair_wood.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'ceiling-fan-install',
      name: 'Regular ceiling fan installation',
      rating: '4.85',
      price: 99,
      image: '/images/ceiling_fan_install.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'cupboard-repair',
      name: 'Cupboard repair',
      rating: '4.80',
      isInstant: true,
      price: 89,
      image: '/images/cupboard_drawer_table.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'decor-installation',
      name: 'Decor installation',
      rating: '4.84',
      isInstant: true,
      price: 99,
      image: '/images/decor_abstract_frame.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'drain-blockage',
      name: 'Drain blockage removal',
      rating: '4.77',
      price: 199,
      image: '/images/drain_blockage.jpg',
      category: 'quick-repairs',
    },
    {
      id: 'wash-basin-leakage',
      name: 'Wash basin leakage repair',
      rating: '4.78',
      price: 129,
      image: '/images/wash_basin.jpg',
      category: 'quick-repairs',
    },
  ];

  return (
    <div className="homes-extended-sections">
      {/* =====================================================================
          1. SOCIAL PROOF STATS (MATCHES HOMES SCREENSHOT 2)
          ===================================================================== */}
      <section className="homes-social-proof-section">
        <div className="container-custom">
          <div className="homes-social-proof-row">
            <div className="homes-social-stat-item">
              <Star size={28} strokeWidth={1.8} className="homes-social-icon" />
              <div className="homes-social-stat-text">
                <span className="homes-stat-value">4.8</span>
                <span className="homes-stat-label">Service Rating*</span>
              </div>
            </div>
            <div className="homes-social-stat-item">
              <Users size={28} strokeWidth={1.8} className="homes-social-icon" />
              <div className="homes-social-stat-text">
                <span className="homes-stat-value">12M+</span>
                <span className="homes-stat-label">Customers Globally*</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. HOMES PROMO BANNERS (MATCHES HOMES SCREENSHOT 2)
          ===================================================================== */}
      <section className="homes-section-block">
        <div className="container-custom">
          <div className="homes-slider-relative-container">
            <div className="homes-banners-grid" ref={promoRef}>
              {/* Banner 1: Foam Jet AC */}
              <div 
                className="homes-banner-card banner-ac"
                onClick={() => onOpenACPage ? onOpenACPage() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-banner-content">
                  <span className="banner-badge-blue">2X COOLING</span>
                  <h3 className="banner-title-dark">Deep clean, zero hassle</h3>
                  <p className="banner-sub-dark">Foam jet AC service</p>
                  <button type="button" className="banner-btn-dark">Book now</button>
                </div>
                <div className="homes-banner-img-wrap">
                  <img src="/images/hero_ac.jpg" alt="Foam jet AC service" className="homes-banner-img" />
                </div>
              </div>

              {/* Banner 2: Festive Home Painting */}
              <div 
                className="homes-banner-card banner-painting"
                onClick={() => handleCategory('painting-decor')}
              >
                <div className="homes-banner-content">
                  <h3 className="banner-title-light">Elevate your home this festive season</h3>
                  <p className="banner-sub-light">Home painting</p>
                  <button type="button" className="banner-btn-dark-translucent">Book now</button>
                </div>
                <div className="homes-banner-img-wrap">
                  <img src="/images/home_festive.jpg" alt="Home painting" className="homes-banner-img" />
                </div>
              </div>

              {/* Banner 3: Native RO Purifiers */}
              <div 
                className="homes-banner-card banner-native"
                onClick={() => onOpenPurifierPage ? onOpenPurifierPage() : handleCategory('native-ro')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-banner-content">
                  <span className="banner-badge-green">Sale live</span>
                  <div className="banner-native-logo">N A T I V E</div>
                  <h3 className="banner-title-light">RO Water Purifiers</h3>
                  <button type="button" className="banner-btn-dark-translucent">Buy now</button>
                </div>
                <div className="homes-banner-img-wrap">
                  <img src="/images/native_purifier.jpg" alt="Native RO Purifiers" className="homes-banner-img contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. NEW AND NOTEWORTHY (MATCHES HOMES SCREENSHOT 3)
          ===================================================================== */}
      <section className="homes-section-block">
        <div className="container-custom">
          <h2 className="homes-section-title">New and noteworthy</h2>
          <div className="homes-slider-relative-container">
            <div className="homes-cards-row scrollable" ref={nnRef}>
              {/* 1. Full Home/ By Room Cleaning */}
              <div 
                className="homes-card-clean"
                onClick={() => onOpenCleaningModal ? onOpenCleaningModal() : handleCategory('cleaning-pest')}
              >
                <div className="homes-card-clean-img-box">
                  <img 
                    src="/images/home_sofa_clean.jpg" 
                    alt="Full Home Cleaning" 
                    className="homes-card-clean-img" 
                  />
                </div>
                <h4 className="homes-card-clean-title">Full Home/ By Room Cleaning</h4>
              </div>

              {/* 2. Native Water Purifier (New) */}
              <div 
                className="homes-card-clean"
                onClick={() => onOpenPurifierPage ? onOpenPurifierPage() : handleCategory('native-ro')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-card-clean-img-box">
                  <span className="clean-pill-badge pink">New</span>
                  <img 
                    src="/images/native_purifier.jpg" 
                    alt="Native Water Purifier" 
                    className="homes-card-clean-img" 
                  />
                </div>
                <h4 className="homes-card-clean-title">Native Water Purifier</h4>
              </div>

              {/* 3. Native Smart Locks with Blue 3D Face Scan Overlay */}
              <div 
                className="homes-card-clean"
                onClick={() => onOpenSmartLocksPage ? onOpenSmartLocksPage() : handleCategory('native-ro')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-card-clean-img-box">
                  <div className="face-scan-graphic-overlay">
                    <svg width="44" height="44" viewBox="0 0 54 54" fill="none">
                      <path d="M12 6H6V12" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M42 6H48V12" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 48H6V42" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M48 42V48H42" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="27" cy="22" r="8" stroke="#38BDF8" strokeWidth="2.5"/>
                      <path d="M16 40C17 33 21 31 27 31C33 31 37 33 38 40" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M9 26H45" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3"/>
                    </svg>
                  </div>
                  <img 
                    src="/images/native_smart_lock.jpg" 
                    alt="Native Smart Locks" 
                    className="homes-card-clean-img" 
                  />
                </div>
                <h4 className="homes-card-clean-title">Native Smart Locks</h4>
              </div>

              {/* 4. Laptop Repair */}
              <div 
                className="homes-card-clean"
                onClick={() => onOpenLaptopPage ? onOpenLaptopPage() : handleCategory('quick-repairs')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-card-clean-img-box">
                  <img 
                    src="/images/appliance_laptop.jpg" 
                    alt="Laptop Repair" 
                    className="homes-card-clean-img" 
                  />
                </div>
                <h4 className="homes-card-clean-title">Laptop Repair</h4>
                <span className="clean-sub-arrival">
                  <Zap size={11} fill="#16A34A" /> In 44 mins
                </span>
              </div>

              {/* 5. AC Service */}
              <div 
                className="homes-card-clean"
                onClick={() => onOpenACPage ? onOpenACPage() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-card-clean-img-box">
                  <img 
                    src="/images/ac_service_card.jpg" 
                    alt="AC" 
                    className="homes-card-clean-img" 
                  />
                </div>
                <h4 className="homes-card-clean-title">AC</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. MOST BOOKED SERVICES (HOMES SCREENSHOT 3)
          ===================================================================== */}
      <section className="homes-section-block">
        <div className="container-custom">
          <h2 className="homes-section-title">Most booked services</h2>

          <div className="homes-slider-relative-container">
            <div 
              className="homes-cards-row scrollable" 
              ref={mostBookedRef}
              onScroll={checkMBScroll}
            >
              {/* 1. Intense cleaning (2 bathroom) */}
              <div 
                className="homes-service-card"
                onClick={() => onOpenBathroomCleaningPage ? onOpenBathroomCleaningPage() : handleCategory('cleaning-pest')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-svc-img-wrap">
                  <img src="/images/home_bathroom.jpg" alt="Intense cleaning (2 bathroom)" className="homes-svc-img" />
                </div>
                <h4 className="homes-svc-title">Intense cleaning (2 bathroom)</h4>
                <div className="homes-svc-rating">
                  <Star size={12} fill="#0F172A" color="#0F172A" />
                  <span>4.81</span>
                </div>
                <div className="homes-svc-price-row">
                  <span className="price">₹1,018</span>
                  <span className="strike">₹1,098</span>
                </div>
              </div>

              {/* 2. Intense bathroom cleaning */}
              <div 
                className="homes-service-card"
                onClick={() => onOpenBathroomCleaningPage ? onOpenBathroomCleaningPage() : handleCategory('cleaning-pest')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-svc-img-wrap">
                  <img src="/images/home_bathroom.jpg" alt="Intense bathroom cleaning" className="homes-svc-img" />
                </div>
                <h4 className="homes-svc-title">Intense bathroom cleaning</h4>
                <div className="homes-svc-rating">
                  <Star size={12} fill="#0F172A" color="#0F172A" />
                  <span>4.81</span>
                </div>
                <div className="homes-svc-price-row">
                  <span className="price">₹549</span>
                </div>
              </div>

              {/* 3. Foam-jet AC service */}
              <div 
                className="homes-service-card"
                onClick={() => onOpenACPage ? onOpenACPage() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-svc-img-wrap">
                  <img src="/images/hero_ac.jpg" alt="Foam-jet AC service" className="homes-svc-img" />
                </div>
                <h4 className="homes-svc-title">Foam-jet AC service</h4>
                <div className="homes-svc-rating">
                  <Star size={12} fill="#0F172A" color="#0F172A" />
                  <span>4.75</span>
                </div>
                <div className="homes-svc-price-row">
                  <span className="price">₹699</span>
                </div>
              </div>

              {/* 4. AC check-up */}
              <div 
                className="homes-service-card"
                onClick={() => onOpenACPage ? onOpenACPage() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <div className="homes-svc-img-wrap">
                  <img src="/images/hero_ac.jpg" alt="AC check-up" className="homes-svc-img" />
                </div>
                <h4 className="homes-svc-title">AC check-up</h4>
                <div className="homes-svc-rating">
                  <Star size={12} fill="#0F172A" color="#0F172A" />
                  <span>4.73</span>
                </div>
                <div className="homes-svc-price-row">
                  <span className="price">₹299</span>
                </div>
              </div>

              {/* 5. Furnished apartment - Home deep cleaning */}
              <div 
                className="homes-service-card"
                onClick={() => handleCategory('cleaning-pest')}
              >
                <div className="homes-svc-img-wrap">
                  <img src="/images/home_floor_machine.jpg" alt="Furnished apartment cleaning" className="homes-svc-img" />
                </div>
                <h4 className="homes-svc-title">Furnished apartment - Home deep cleaning</h4>
                <div className="homes-svc-rating">
                  <Star size={12} fill="#0F172A" color="#0F172A" />
                  <span>4.79</span>
                </div>
                <div className="homes-svc-price-row">
                  <span className="price">₹3,499</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. APPLIANCE REPAIR & SERVICE (HOMES SCREENSHOT 4)
          ===================================================================== */}
      <section className="homes-section-block">
        <div className="container-custom">
          <div className="homes-section-header-flex">
            <h2 
              className="homes-section-title" 
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
              title="Click to view all appliances"
            >
              Appliance repair & service
            </h2>
            <button 
              type="button" 
              className="homes-see-all-btn"
              onClick={() => onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
            >
              See all
            </button>
          </div>

          <div className="homes-slider-relative-container">
            <div className="homes-cards-row scrollable" ref={applianceRef}>
              {/* 1. AC */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenACPage ? onOpenACPage() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">AC</h4>
                <div className="appliance-img-container">
                  <img 
                    src="/images/ac_service_card.jpg" 
                    alt="AC" 
                    className="appliance-img" 
                  />
                </div>
              </div>

              {/* 2. Washing Machine Repair */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenWashingMachinePage ? onOpenWashingMachinePage() : onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">Washing Machine Repair</h4>
                <div className="appliance-img-container">
                  <img src="/images/appliance_washer.jpg" alt="Washing Machine" className="appliance-img contain" />
                </div>
              </div>

              {/* 3. Chimney Repair */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenChimneyPage ? onOpenChimneyPage() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">Chimney Repair</h4>
                <div className="appliance-img-container">
                  <img src="/images/appliance_chimney.jpg" alt="Chimney" className="appliance-img contain" />
                </div>
              </div>

              {/* 4. Refrigerator */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenRefrigeratorPage ? onOpenRefrigeratorPage() : onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">Refrigerator</h4>
                <div className="appliance-img-container">
                  <img src="/images/appliance_fridge.jpg" alt="Refrigerator" className="appliance-img contain" />
                </div>
              </div>

              {/* 5. Television Repair */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenTelevisionPage ? onOpenTelevisionPage() : onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">Television Repair</h4>
                <div className="appliance-img-container">
                  <img src="/images/appliance_tv.jpg" alt="Television Repair" className="appliance-img contain" />
                </div>
              </div>

              {/* 6. Microwave */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenMicrowavePage ? onOpenMicrowavePage() : onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">Microwave</h4>
                <div className="appliance-img-container">
                  <img src="/images/appliance_microwave.jpg" alt="Microwave" className="appliance-img contain" />
                </div>
              </div>

              {/* 7. Water Purifier */}
              <div 
                className="homes-appliance-item"
                onClick={() => onOpenWaterPurifierServicePage ? onOpenWaterPurifierServicePage() : onOpenApplianceModal ? onOpenApplianceModal() : handleCategory('ac-appliances')}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="appliance-item-name">Water Purifier</h4>
                <div className="appliance-img-container">
                  <img src="/images/appliance_water_purifier.jpg" alt="Water Purifier" className="appliance-img contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. CLEANING & PEST CONTROL (MATCHES SCREENSHOT 1)
          ===================================================================== */}
      <section className="homes-section-block">
        <div className="container-custom">
          <h2 className="homes-section-title">Cleaning & pest control</h2>
          <div className="homes-cleaning-cards-wrap">
            {/* 1. Full Home/ By Room Cleaning */}
            <div 
              className="homes-cleaning-card"
              onClick={() => onOpenFullHomeCleaningPage ? onOpenFullHomeCleaningPage() : onOpenFullCleaningModal ? onOpenFullCleaningModal() : handleCategory('cleaning-pest')}
              style={{ cursor: 'pointer' }}
            >
              <h4 className="homes-cleaning-card-title">Full Home/ By Room Cleaning</h4>
              <div className="homes-cleaning-img-wrap">
                <img 
                  src="/images/cleaning_bedroom_bucket.jpg" 
                  alt="Full Home/ By Room Cleaning" 
                  className="homes-cleaning-img" 
                />
              </div>
            </div>

            {/* 2. Cockroach Control */}
            <div 
              className="homes-cleaning-card"
              onClick={() => onOpenCockroachControlPage ? onOpenCockroachControlPage() : onOpenFullCleaningModal ? onOpenFullCleaningModal() : handleCategory('cleaning-pest')}
              style={{ cursor: 'pointer' }}
            >
              <h4 className="homes-cleaning-card-title">Cockroach Control</h4>
              <div className="homes-cleaning-img-wrap">
                {/* Prohibited Cockroach Emblem (Screenshot 1) */}
                <div className="cockroach-prohibited-badge">
                  <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
                    <circle cx="26" cy="26" r="23" stroke="#DC2626" strokeWidth="4.5" fill="white"/>
                    <line x1="9" y1="9" x2="43" y2="43" stroke="#DC2626" strokeWidth="4.5"/>
                    <ellipse cx="26" cy="26" rx="6" ry="10" fill="#0F172A"/>
                    <circle cx="26" cy="14" r="3.5" fill="#0F172A"/>
                    <path d="M23 11L18 6M29 11L34 6" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M20 20L13 17M32 20L39 17M19 26L12 27M33 26L40 27M20 32L14 36M32 32L38 36" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <img 
                  src="/images/cockroach_spray_can.jpg" 
                  alt="Cockroach Control" 
                  className="homes-cleaning-img" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. ELECTRICIAN, PLUMBER, CARPENTERS (MATCHES SCREENSHOTS 2, 3, 4)
          ===================================================================== */}
      <section className="homes-section-block">
        <div className="container-custom">
          <div className="homes-section-header-flex">
            <h2 
              className="homes-section-title" 
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => onOpenElectricianModal ? onOpenElectricianModal() : handleCategory('quick-repairs')}
            >
              Electrician, Plumber, Carpenters
            </h2>
            <button 
              type="button" 
              className="homes-see-all-btn"
              onClick={() => onOpenElectricianModal ? onOpenElectricianModal() : handleCategory('quick-repairs')}
            >
              See all
            </button>
          </div>

          {/* Exact 2-Row 5-Column Grid matching Screenshots 2, 3, 4 */}
          <div className="homes-epc-2row-grid">
            {EPC_SERVICES.map((svc) => (
              <div 
                key={svc.id}
                className="homes-service-card epc-grid-card"
                onClick={() => {
                  let trade = 'electrician';
                  const n = (svc.name || '').toLowerCase();
                  if (n.includes('flush') || n.includes('drain') || n.includes('tank') || n.includes('tap') || n.includes('plumb')) {
                    trade = 'plumber';
                  } else if (n.includes('door') || n.includes('cupboard') || n.includes('decor') || n.includes('carpent') || n.includes('lock')) {
                    trade = 'carpenter';
                  }
                  if (onOpenElectricianModal) {
                    onOpenElectricianModal(trade);
                  } else {
                    handleCategory(svc.category);
                  }
                }}
              >
                <div className="homes-svc-img-wrap epc-clean-bg">
                  <img src={svc.image} alt={svc.name} className="homes-svc-img contain-epc" />
                </div>
                <h4 className="homes-svc-title">{svc.name}</h4>
                
                <div className="homes-svc-rating">
                  <Star size={12} fill="#0F172A" color="#0F172A" />
                  <span>{svc.rating}</span>
                  {svc.isInstant && (
                    <span className="clean-instant-tag">
                      • <Zap size={10} fill="#16A34A" color="#16A34A" /> Instant
                    </span>
                  )}
                </div>

                <div className="homes-svc-price-row">
                  <span className="price">₹{svc.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
