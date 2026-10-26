import React from 'react';
import { Percent, ArrowRight, Star, Users } from 'lucide-react';

function DottedIndiaMap() {
  const dots = [
    // Kashmir & Himachal (light grey)
    [90, 16, false], [98, 18, false], [106, 20, false],
    [84, 26, false], [92, 26, false], [100, 26, false], [108, 28, false],
    [78, 36, false], [86, 36, false], [94, 36, true], [102, 36, true], [110, 38, false],
    // Punjab, Haryana, Rajasthan, UP (orange & grey)
    [70, 48, true], [78, 48, true], [86, 48, true], [94, 48, true], [102, 48, true], [110, 48, true], [118, 50, false],
    [62, 60, true], [70, 60, true], [78, 60, true], [86, 60, true], [94, 60, true], [102, 60, true], [110, 60, true], [118, 60, false], [126, 60, false],
    // Gujarat, MP, Bihar, Bengal, Northeast
    [48, 72, true], [56, 72, true], [64, 72, true], [72, 72, true], [80, 72, true], [88, 72, true], [96, 72, true], [104, 72, true], [112, 72, true], [120, 72, true], [136, 68, false], [144, 66, false], [152, 66, false],
    [42, 84, true], [50, 84, true], [58, 84, true], [66, 84, true], [74, 84, true], [82, 84, true], [90, 84, true], [98, 84, true], [106, 84, true], [114, 84, true], [122, 84, true], [144, 76, false], [152, 76, false], [160, 76, false],
    // Maharashtra, Odisha, Chhattisgarh
    [50, 96, true], [58, 96, true], [66, 96, true], [74, 96, true], [82, 96, true], [90, 96, true], [98, 96, true], [106, 96, true], [114, 96, true], [122, 96, true],
    [58, 108, true], [66, 108, true], [74, 108, true], [82, 108, true], [90, 108, true], [98, 108, true], [106, 108, true], [114, 108, true],
    // Karnataka, Telangana, AP
    [64, 120, true], [72, 120, true], [80, 120, true], [88, 120, true], [96, 120, true], [104, 120, true],
    [70, 132, true], [78, 132, true], [86, 132, true], [94, 132, true], [102, 132, true],
    // Tamil Nadu & Kerala (tapering down)
    [74, 144, true], [82, 144, true], [90, 144, true], [98, 144, true],
    [78, 156, true], [86, 156, true], [94, 156, true],
    [82, 168, true], [90, 168, true],
    [86, 180, true]
  ];

  return (
    <svg viewBox="20 0 160 195" style={{ width: '100%', height: '100%', maxHeight: 200, display: 'block' }}>
      {dots.map(([cx, cy, isOrange], idx) => (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r={2.6}
          fill={isOrange ? "#EA580C" : "#CBD5E1"}
        />
      ))}
    </svg>
  );
}

function HairDryerIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      {/* Barrel / Body of purple hair dryer */}
      <rect x="15" y="12" width="20" height="12" rx="6" fill="#9333EA" />
      {/* Nozzle attachment */}
      <path d="M15 14L8 16V20L15 22V14Z" fill="#7E22CE" />
      {/* Back vent */}
      <circle cx="33.5" cy="18" r="4.5" fill="#6B21A8" />
      <circle cx="33.5" cy="18" r="2.2" fill="#A855F7" />
      {/* Handle */}
      <path d="M25 24L22.5 35.5C22 37 23 38.5 24.5 38.5H27C28.5 38.5 29.5 37 29 35.5L28 24H25Z" fill="#9333EA" />
      {/* Accent on handle */}
      <rect x="25.5" y="27" width="2" height="4" rx="1" fill="#C084FC" />
    </svg>
  );
}

function MassageTableIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      {/* Black table cushion */}
      <rect x="7" y="16" width="34" height="9" rx="4" fill="#1E293B" />
      <rect x="9" y="17" width="30" height="2.5" rx="1" fill="#334155" />
      {/* Headrest / folded towel */}
      <rect x="10" y="13" width="8" height="3.5" rx="1.5" fill="#F8FAFC" />
      {/* Dark metallic legs */}
      <line x1="12" y1="25" x2="9" y2="36" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="25" x2="39" y2="36" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="25" x2="19" y2="36" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <line x1="31" y1="25" x2="29" y2="36" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <line x1="10.5" y1="31.5" x2="37.5" y2="31.5" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GridDotsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <circle cx="8" cy="8" r="2.8" fill="#0F172A" />
      <circle cx="16" cy="8" r="2.8" fill="#0F172A" />
      <circle cx="24" cy="8" r="2.8" fill="#0F172A" />
      <circle cx="8" cy="16" r="2.8" fill="#0F172A" />
      <circle cx="16" cy="16" r="2.8" fill="#0F172A" />
      <circle cx="24" cy="16" r="2.8" fill="#0F172A" />
      <circle cx="8" cy="24" r="2.8" fill="#0F172A" />
      <circle cx="16" cy="24" r="2.8" fill="#0F172A" />
      <circle cx="24" cy="24" r="2.8" fill="#0F172A" />
    </svg>
  );
}

function renderBeautyTileIcon(item) {
  if (item.type === 'hair-dryer') return <HairDryerIcon />;
  if (item.type === 'massage-table') return <MassageTableIcon />;
  if (item.type === 'grid-dots') return <GridDotsIcon />;
  return <img src={item.icon} alt={item.title} className="uc-tile-img" />;
}

export function HeroSection({ activeNavTab = 'homes', onSelectCategory, onSelectNavTab, onOpenACPage, onOpenApplianceModal, onOpenCleaningModal, onOpenElectricianModal, onOpenFullCleaningModal, onOpenPurifierPage, onOpenSmartLocksPage, onOpenSalonPrimePage, onOpenHairStudioPage, onOpenMenSalonPreference }) {
  // Categories for Homes view (Matches Screenshot 1)
  const homesCategories = [
    {
      id: 'ac-appliances',
      title: 'Appliance Repair & Service',
      icon: '/images/categories/cat_ac.jpg',
      badge: '44 mins',
    },
    {
      id: 'quick-repairs',
      title: 'Electrician, Plumber & Carpenters',
      icon: '/images/categories/cat_repairs.jpg',
      badge: '46 mins',
    },
    {
      id: 'cleaning-pest',
      title: 'Bathroom & Kitchen cleaning',
      icon: '/images/categories/cat_cleaning.jpg',
      badge: null,
    },
    {
      id: 'cleaning-home',
      title: 'Cleaning',
      icon: '/images/categories/cat_cleaning.jpg',
      badge: null,
    },
    {
      id: 'native-ro',
      title: 'Native Water Purifier',
      icon: '/images/categories/cat_purifier.jpg',
      badge: 'Sale',
    },
    {
      id: 'native-smart-locks',
      title: 'Native Smart Locks',
      icon: '/images/categories/cat_lock.jpg',
      badge: 'Sale',
    },
  ];

  function handleCategoryClick(catId, itemTitle) {
    if (catId === 'ac-appliances' && onOpenApplianceModal) {
      onOpenApplianceModal();
      return;
    }
    if (itemTitle === 'Bathroom & Kitchen cleaning' && onOpenCleaningModal) {
      onOpenCleaningModal();
      return;
    }
    if ((itemTitle === 'Cleaning' || catId === 'cleaning-home') && onOpenFullCleaningModal) {
      onOpenFullCleaningModal();
      return;
    }
    if ((catId === 'quick-repairs' || itemTitle?.toLowerCase().includes('electrician')) && onOpenElectricianModal) {
      onOpenElectricianModal();
      return;
    }
    if ((itemTitle === 'Native Smart Locks' || itemTitle?.includes('Smart Lock') || itemTitle?.includes('Lock')) && onOpenSmartLocksPage) {
      onOpenSmartLocksPage();
      return;
    }
    if ((itemTitle?.includes('Purifier') || (catId === 'native-ro' && !itemTitle?.includes('Lock'))) && onOpenPurifierPage) {
      onOpenPurifierPage();
      return;
    }
    if ((itemTitle === 'Hair Studio for Women' || itemTitle?.includes('Hair Studio')) && onOpenHairStudioPage) {
      onOpenHairStudioPage();
      return;
    }
    if ((itemTitle === 'Salon for Men' || itemTitle === 'Massage for Men' || itemTitle?.toLowerCase().includes('men') || catId === 'mens-salon') && onOpenMenSalonPreference) {
      onOpenMenSalonPreference();
      return;
    }
    if ((itemTitle === 'Salon Prime' || itemTitle === 'Women Salon' || catId === 'womens-salon') && onOpenSalonPrimePage) {
      onOpenSalonPrimePage();
      return;
    }
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  }

  // Categories for Beauty view (Matches Screenshot 1)
  const beautyCategories = [
    {
      id: 'womens-salon',
      title: 'Salon Prime',
      icon: '/images/categories/cat_womens_salon.jpg',
      badge: null,
      type: 'image'
    },
    {
      id: 'womens-salon',
      title: 'Hair Studio for Women',
      badge: '74 mins',
      badgeClass: 'uc-badge-purple',
      type: 'hair-dryer'
    },
    {
      id: 'mens-salon',
      title: 'Salon for Men',
      icon: '/images/categories/cat_mens_salon.jpg',
      badge: null,
      type: 'image'
    },
    {
      id: 'mens-salon',
      title: 'Massage for Men',
      badge: '59 mins',
      badgeClass: 'uc-badge-green',
      type: 'massage-table'
    },
    {
      id: 'all',
      title: 'All services',
      badge: null,
      type: 'grid-dots'
    }
  ];

  // =========================================================================
  // 1. BEAUTY TAB: DOORSTEP SERVICES + 4-MOSAIC + RATINGS + SPOTLIGHT
  //    (Matches Screenshots 1, 2, 3)
  // =========================================================================
  if (activeNavTab === 'beauty') {
    return (
      <section className="uc-exact-hero-section uc-beauty-landing-section">
        {/* 1. Beauty Hero: Headline + 6-tile Category Card + 2x2 Mosaic Collage (Screenshot 1) */}
        <div className="container-custom uc-exact-hero-grid">
          {/* Left Column: Heading + Category Card */}
          <div className="uc-hero-left-col">
            <h1 className="uc-doorstep-headline">
              Beauty services at your<br />doorstep
            </h1>

            {/* White Category Card with 6 Tiles */}
            <div className="uc-exact-category-card">
              <div className="uc-tiles-grid-6">
                {beautyCategories.map((item, index) => (
                  <div
                    key={index}
                    className="uc-tile-item"
                    onClick={() => handleCategoryClick(item.id, item.title)}
                  >
                    <div className="uc-tile-icon-box">
                      {renderBeautyTileIcon(item)}
                    </div>

                    {item.badge ? (
                      <span className={`uc-arrival-badge ${item.badgeClass || ''}`}>
                        {item.badge}
                      </span>
                    ) : (
                      <div className="uc-badge-placeholder" />
                    )}

                    <span className="uc-tile-title">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Collage Mosaic (Screenshot 1) */}
          <div className="uc-hero-right-col">
            <div className="uc-mosaic-grid">
              {/* Left Sub-column: Skincare Arm Treatment + Men's Haircut */}
              <div className="uc-mosaic-subcol">
                <div className="uc-mosaic-item-wrap" style={{ flex: 1.35 }}>
                  <img
                    src="/images/beauty_arm_treatment.jpg"
                    alt="Beauty Skincare Arm Treatment"
                    className="uc-mosaic-img"
                  />
                </div>
                <div className="uc-mosaic-item-wrap" style={{ flex: 1 }}>
                  <img
                    src="/images/beauty_mens_haircut.jpg"
                    alt="Men's Haircut and Beard Grooming"
                    className="uc-mosaic-img"
                  />
                </div>
              </div>

              {/* Right Sub-column: Ayurvedic Potli Massage + Women's Hair Studio */}
              <div className="uc-mosaic-subcol">
                <div className="uc-mosaic-item-wrap" style={{ flex: 1 }}>
                  <img
                    src="/images/beauty_potli_massage.jpg"
                    alt="Ayurvedic Herbal Potli Massage"
                    className="uc-mosaic-img"
                  />
                </div>
                <div className="uc-mosaic-item-wrap" style={{ flex: 1.25 }}>
                  <img
                    src="/images/hero_salon.jpg"
                    alt="Hair Studio for Women"
                    className="uc-mosaic-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Social Proof Ratings Row (Screenshot 2) */}
        <div className="container-custom">
          <div className="uc-beauty-ratings-row">
            <div className="uc-beauty-rating-item">
              <Star size={32} strokeWidth={1.3} color="#0F172A" />
              <div>
                <div className="uc-rating-val">4.8</div>
                <div className="uc-rating-lbl">Service Rating*</div>
              </div>
            </div>
            <div className="uc-beauty-rating-item">
              <Users size={32} strokeWidth={1.3} color="#0F172A" />
              <div>
                <div className="uc-rating-val">12M+</div>
                <div className="uc-rating-lbl">Customers Globally*</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. In the spotlight (Screenshots 2 & 3) */}
        <div className="container-custom uc-spotlight-section">
          <h2 className="uc-spotlight-title">In the spotlight</h2>

          <div className="uc-spotlight-grid">
            {/* Card 1: Japanese glow rituals */}
            <div 
              className="uc-spotlight-card card-japanese"
              onClick={() => handleCategoryClick('womens-salon', 'Japanese glow rituals')}
            >
              <img 
                src="/images/spotlight_japanese_glow.jpg" 
                alt="Japanese glow rituals" 
                className="uc-spotlight-bg-img"
              />
              <div className="uc-spotlight-content">
                <div>
                  <span className="uc-spotlight-badge new-launch">New launch</span>
                  <h3 className="uc-spotlight-card-heading">Japanese glow rituals</h3>
                  <p className="uc-spotlight-card-sub">Now at your doorstep</p>
                </div>
                <button 
                  type="button" 
                  className="uc-spotlight-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick('womens-salon', 'Japanese glow rituals');
                  }}
                >
                  Book now
                </button>
              </div>
            </div>

            {/* Card 2: Full arms, legs & underarms waxing */}
            <div 
              className="uc-spotlight-card card-waxing"
              onClick={() => handleCategoryClick('womens-salon', 'Full arms, legs & underarms waxing')}
            >
              <img 
                src="/images/spotlight_waxing.jpg" 
                alt="Full arms, legs & underarms waxing" 
                className="uc-spotlight-bg-img"
              />
              <div className="uc-spotlight-content">
                <div>
                  <span className="uc-spotlight-badge price-drop">Price drop</span>
                  <h3 className="uc-spotlight-card-heading">Full arms, legs & underarms waxing</h3>
                  <div className="uc-spotlight-price-row">
                    <span className="uc-spotlight-price">₹899</span>
                    <span className="uc-spotlight-original-price">₹1,198</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="uc-spotlight-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick('womens-salon', 'Full arms, legs & underarms waxing');
                  }}
                >
                  Book now
                </button>
              </div>
            </div>

            {/* Card 3: Let go of that built-up stress */}
            <div 
              className="uc-spotlight-card card-massage"
              onClick={() => handleCategoryClick('womens-salon', 'Swedish stress relief massage')}
            >
              <img 
                src="/images/spotlight_massage.jpg" 
                alt="Swedish stress relief massage" 
                className="uc-spotlight-bg-img"
              />
              <div className="uc-spotlight-content">
                <div>
                  <h3 className="uc-spotlight-card-heading">Let go of that built-up stress</h3>
                  <p className="uc-spotlight-card-sub">Swedish stress relief massage</p>
                </div>
                <button 
                  type="button" 
                  className="uc-spotlight-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick('womens-salon', 'Swedish stress relief massage');
                  }}
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }


  // =========================================================================
  // =========================================================================
  // 2. NATIVE TAB: PRODUCT SHOWCASE AT TOP + ADVANTAGE CARDS BELOW
  // =========================================================================
  if (activeNavTab === 'native') {
    return (
      <section className="uc-exact-hero-section native-store-hero">
        <div className="container-custom uc-native-hero-wrap">
          {/* Native Product Line Showcase (Water Purifiers & Smart Locks) - AT TOP OF NATIVE */}
          <div className="uc-native-hero-grid" style={{ marginBottom: 32 }}>
            {/* 1. Water Purifiers Card */}
            <div 
              className="uc-native-showcase-card"
              
              onClick={() => {
                if (onOpenPurifierPage) onOpenPurifierPage();
                else handleCategoryClick('native-ro', 'Native Water Purifiers');
              }}
            >
              <div className="uc-native-discount-badge" >
                % ₹4,800 off
              </div>
              <div className="uc-native-img-box" >
                <img 
                  src="/images/native_purifier.jpg" 
                  alt="Native Water Purifiers" 
                  className="uc-native-img"
                  
                />
              </div>
              <h2 className="uc-native-card-title">Water Purifiers</h2>
              <p className="uc-native-card-desc">
                Needs no service for 2 years • In-built RO + UV + Alkaline<br />Copper
              </p>
              <div className="uc-native-card-cta uc-native-cta-primary" >
                <span>Explore Water Purifiers</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* 2. Smart Locks Card */}
            <div 
              className="uc-native-showcase-card"
              
              onClick={() => {
                if (onOpenSmartLocksPage) onOpenSmartLocksPage();
                else handleCategoryClick('native-ro', 'Native Smart Locks');
              }}
            >
              <div className="uc-native-discount-badge" >
                % ₹4,500 off
              </div>
              <div className="uc-native-img-box" >
                <img 
                  src="/images/native_smart_lock.jpg" 
                  alt="Native Smart Locks" 
                  className="uc-native-img"
                  
                />
              </div>
              <h2 className="uc-native-card-title">Smart Locks</h2>
              <p className="uc-native-card-desc">
                6-in-1 Unlocking • Built-in Video Doorbell & Anti-Theft Security
              </p>
              <div className="uc-native-card-cta uc-native-cta-secondary" >
                <span>Explore Smart Locks</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Top 3 Advantage Cards */}
          <div className="uc-native-adv-cards-grid">
            {/* Card 1: Professional Installation */}
            <div 
              className="uc-native-adv-card"
              
              onClick={() => {
                if (onOpenPurifierPage) onOpenPurifierPage();
                else handleCategoryClick('native-ro');
              }}
            >
              <div className="uc-native-adv-card-text">
                <h3 className="uc-native-adv-heading">Professional<br />installation</h3>
                <p className="uc-native-adv-sub">Only top technicians<br />trained by UC.</p>
              </div>
              <div className="uc-native-adv-card-visual" >
                <img 
                  src="/images/native_tech_exact.png" 
                  alt="Only top technicians trained by UC"
                  className="uc-native-adv-exact-img"
                  
                />
              </div>
            </div>

            {/* Card 2: 24x7 Expert Support */}
            <div 
              className="uc-native-adv-card"
              
              onClick={() => {
                if (onOpenPurifierPage) onOpenPurifierPage();
                else handleCategoryClick('native-ro');
              }}
            >
              <div className="uc-native-adv-card-text">
                <h3 className="uc-native-adv-heading">24×7 expert<br />support</h3>
                <p className="uc-native-adv-sub">Talk to experts who<br />understand the product.</p>
              </div>
              <div className="uc-native-adv-card-visual" >
                <img 
                  src="/images/native_support_exact.png" 
                  alt="Talk to experts who understand the product" 
                  className="uc-native-adv-exact-img"
                  
                />
              </div>
            </div>

            {/* Card 3: Servicing 14,500+ Pin Codes */}
            <div 
              className="uc-native-adv-card"
              
              onClick={() => {
                if (onOpenPurifierPage) onOpenPurifierPage();
                else handleCategoryClick('native-ro');
              }}
            >
              <div className="uc-native-adv-card-text">
                <h3 className="uc-native-adv-heading">Servicing 14,500+<br />pin codes</h3>
                <p className="uc-native-adv-sub">We never outsource service<br />to locals.</p>
              </div>
              <div className="uc-native-adv-card-visual" >
                <img 
                  src="/images/native_map_exact.png" 
                  alt="Servicing 14,500+ pin codes - We never outsource service to locals" 
                  className="uc-native-adv-exact-img"
                  
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 3. HOMES TAB: DOORSTEP CATEGORIES + 4-MOSAIC (Matches Screenshot 1)
  // =========================================================================
  return (
    <section className="uc-exact-hero-section">
      <div className="container-custom uc-exact-hero-grid">
        {/* Left Column: Heading + Category Box with "What are you looking for?" */}
        <div className="uc-hero-left-col">
          <h1 className="uc-doorstep-headline">
            Home services at your<br />doorstep
          </h1>

          {/* White Card with 6 Category Tiles (Matches Screenshot 1) */}
          <div className="uc-exact-category-card">
            <div className="uc-category-card-heading">
              What are you looking for?
            </div>

            <div className="uc-tiles-grid-6">
              {homesCategories.map((item, index) => (
                <div
                  key={index}
                  className="uc-tile-item"
                  onClick={() => handleCategoryClick(item.id, item.title)}
                >
                  {/* Clean rounded icon box */}
                  <div className="uc-tile-icon-box">
                    {item.badge === 'Sale' && (
                      <span className="uc-tile-sale-badge">Sale</span>
                    )}
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="uc-tile-img"
                    />
                  </div>

                  {/* Arrival time badge (for 44 mins / 46 mins) */}
                  {item.badge && item.badge !== 'Sale' ? (
                    <span className="uc-arrival-badge">
                      {item.badge}
                    </span>
                  ) : (
                    <div className="uc-badge-placeholder" />
                  )}

                  {/* Title */}
                  <span className="uc-tile-title">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Exact 4-Photo 2x2 Mosaic Collage (Matches Screenshot 1) */}
        <div className="uc-hero-right-col">
          <div className="uc-mosaic-grid">
            {/* Left Sub-column: AC Cleaning + Ceiling Fan Install */}
            <div className="uc-mosaic-subcol">
              <div className="uc-mosaic-item-wrap">
                <img
                  src="/images/hero_ac.jpg"
                  alt="AC Service Technician"
                  className="uc-mosaic-img"
                />
              </div>
              <div className="uc-mosaic-item-wrap">
                <img
                  src="/images/ceiling_fan_install.jpg"
                  alt="Ceiling Fan Repair and Installation"
                  className="uc-mosaic-img"
                />
              </div>
            </div>

            {/* Right Sub-column: Bathroom Deep Cleaning + Home Painting */}
            <div className="uc-mosaic-subcol">
              <div className="uc-mosaic-item-wrap">
                <img
                  src="/images/home_bathroom.jpg"
                  alt="Bathroom Cleaning Service"
                  className="uc-mosaic-img"
                />
                <div className="uc-bathroom-highlight" />
              </div>
              <div className="uc-mosaic-item-wrap">
                <img
                  src="/images/home_painter.jpg"
                  alt="Painting & Waterproofing"
                  className="uc-mosaic-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
