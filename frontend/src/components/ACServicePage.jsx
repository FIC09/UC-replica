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
  Clock, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Tag, 
  ArrowRight,
  Sparkles,
  Award,
  X
} from 'lucide-react';

// ============================================================================
// CO-PILOT DIGITAL AC DIAGNOSTIC DEVICE VECTOR GRAPHIC (Matches Screenshot 1)
// ============================================================================
function CoPilotDeviceGraphic() {
  return (
    <svg viewBox="0 0 320 250" style={{ width: '100%', maxWidth: 280, height: 'auto', display: 'block' }}>
      {/* Hand left fingers holding side */}
      <path d="M35 155 C15 130 22 90 45 95 C55 98 62 115 60 150 Z" fill="#E2B198" />
      <path d="M42 185 C25 170 30 145 50 150 C60 155 64 175 58 190 Z" fill="#DBA388" />

      {/* Hand right fingers holding side */}
      <path d="M285 155 C305 130 298 90 275 95 C265 98 258 115 260 150 Z" fill="#E2B198" />
      <path d="M278 185 C295 170 290 145 270 150 C260 155 256 175 262 190 Z" fill="#DBA388" />

      {/* Top Black Cable */}
      <path d="M160 20 C160 -5 190 -12 210 -20" stroke="#18181B" strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* Main Black Housing */}
      <rect x="68" y="20" width="184" height="200" rx="18" fill="#1C1917" stroke="#292524" strokeWidth="2.5" />

      {/* Brand Header */}
      <rect x="84" y="32" width="14" height="14" rx="2.5" fill="#000" stroke="#44403C" />
      <text x="86.5" y="42.5" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif">UC</text>
      <text x="103" y="42.5" fill="#E7E5E4" fontSize="9" fontWeight="700" fontFamily="sans-serif">Urban Company</text>

      {/* Neon Matrix Green LCD Screen */}
      <rect x="80" y="52" width="160" height="92" rx="4" fill="#65A30D" />
      <rect x="82" y="54" width="156" height="88" rx="3" fill="#84CC16" />
      {/* Screen Digital Matrix Lines */}
      <text x="88" y="69" fill="#14532D" fontSize="9.5" fontWeight="700" fontFamily="monospace">190825 1535  30.6C</text>
      <text x="88" y="85" fill="#14532D" fontSize="9.5" fontWeight="700" fontFamily="monospace">NON-INV 1T   2:30</text>
      <text x="88" y="110" fill="#14532D" fontSize="16" fontWeight="900" fontFamily="monospace" letterSpacing="0.8">GAS OK</text>
      <text x="88" y="132" fill="#14532D" fontSize="9" fontWeight="700" fontFamily="monospace">CURRENT:4.12 A4.17 A</text>

      {/* CO-PILOT Label & Hazard Tape */}
      <text x="82" y="157" fill="#A8A29E" fontSize="8" fontWeight="800" letterSpacing="0.8">CO-PILOT</text>
      <rect x="82" y="161" width="36" height="5" fill="#FACC15" rx="1" />
      <path d="M85 166 L88 161 M92 166 L95 161 M99 166 L102 161 M106 166 L109 161 M113 166 L116 161" stroke="#1C1917" strokeWidth="1.6" />

      {/* Dual Push Buttons */}
      <circle cx="125" cy="188" r="13" fill="#292524" stroke="#44403C" strokeWidth="2" />
      <text x="110" y="210" fill="#78716C" fontSize="7.5" fontWeight="700">AC type</text>

      <circle cx="195" cy="188" r="13" fill="#292524" stroke="#44403C" strokeWidth="2" />
      <text x="180" y="210" fill="#78716C" fontSize="7.5" fontWeight="700">Tonnage</text>

      {/* Bottom Thumb Clamps */}
      <ellipse cx="88" cy="198" rx="18" ry="22" fill="#E2B198" />
      <ellipse cx="232" cy="198" rx="18" ry="22" fill="#E2B198" />
    </svg>
  );
}

export function ACServicePage({
  onBackHome,
  selectedCity = 'Mumbai',
  selectedLocality = 'Bandra West',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast = () => {},
  services = []
}) {
  const [activeSubTab, setActiveSubTab] = useState('packages'); // 'packages' | 'service' | 'repair' | 'install'
  const [activeBannerSlide, setActiveBannerSlide] = useState(0); // 0 = Co-Pilot, 1 = Foam Jet
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailService, setSelectedDetailService] = useState(null);
  const [optionsModalService, setOptionsModalService] = useState(null);

  // Sub-services for the left sidebar "Select a service" (Matches Screenshots 1, 2)
  const SUB_SERVICES = [
    {
      id: 'packages',
      name: 'Super saver packages',
      type: 'discount-tile',
      discountText: 'Upto 30% OFF',
    },
    {
      id: 'service',
      name: 'Service',
      type: 'image-tile',
      image: '/images/ac_service_card.jpg'
    },
    {
      id: 'repair',
      name: 'Repair & gas refill',
      type: 'image-tile',
      image: '/images/hero_ac.jpg'
    },
    {
      id: 'install',
      name: 'Installation/uninstallation',
      type: 'image-tile',
      image: '/images/categories/cat_ac.jpg'
    }
  ];

  // Catalogue of services matching Screenshots 2, 3, 4, 5
  const AC_SERVICES = [
    // 1. Super Saver Packages (Screenshots 2, 3, 4)
    {
      id: 'foam-jet-service-2',
      sectionId: 'packages',
      sectionTitle: 'Super saver packages',
      title: 'Foam-jet service (2 ACs)',
      rating: '4.75',
      reviews: '3M reviews',
      price: 1298,
      originalPrice: 1398,
      duration: '2 hrs',
      perUnitNote: '₹649 per AC',
      isHero: true,
      hasGasCheckBadge: true,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Applicable for both window or split ACs',
        'Indoor unit deep cleaning with foam & jet spray',
        'Free gas check & cooling report'
      ]
    },
    {
      id: 'foam-jet-service-3',
      sectionId: 'packages',
      sectionTitle: 'Super saver packages',
      title: 'Foam-jet service (3 ACs)',
      rating: '4.75',
      reviews: '3M reviews',
      price: 1797,
      originalPrice: 2097,
      duration: '3 hrs',
      perUnitNote: '₹599 per AC',
      isHero: false,
      hasGasCheckBadge: true,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Deep cleaning for 3 split or window AC units',
        'High-pressure foam-jet washing of indoor and outdoor coils',
        'Free gas leak diagnostic report'
      ]
    },
    {
      id: 'foam-jet-service-4',
      sectionId: 'packages',
      sectionTitle: 'Super saver packages',
      title: 'Foam-jet service (4 ACs)',
      rating: '4.75',
      reviews: '3M reviews',
      price: 2196,
      originalPrice: 2796,
      duration: '4 hrs',
      perUnitNote: '₹549 per AC',
      isHero: false,
      hasGasCheckBadge: true,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Complete 4-AC comprehensive power jet wash',
        'Condenser unit & cooling tray deep flush',
        'Free gas check with Co-pilot'
      ]
    },
    {
      id: 'foam-jet-service-5',
      sectionId: 'packages',
      sectionTitle: 'Super saver packages',
      title: 'Foam-jet service (5 ACs)',
      rating: '4.75',
      reviews: '3M reviews',
      price: 2745,
      originalPrice: 3495,
      duration: '5 hrs',
      perUnitNote: '₹549 per AC',
      isHero: false,
      hasGasCheckBadge: true,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Bulk residential or office package for 5 AC units',
        'Anti-bacterial foaming and high-pressure jet washing',
        'Co-pilot gas check for all 5 units'
      ]
    },

    // 2. Service (Screenshot 4)
    {
      id: 'powerjet-split-service',
      sectionId: 'service',
      sectionTitle: 'Service',
      title: 'Powerjet AC servicing (Split AC)',
      rating: '4.84',
      reviews: '850K reviews',
      price: 499,
      originalPrice: 799,
      duration: '45 mins',
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: true,
      image: '/images/ac_service_card.jpg',
      inclusions: [
        'Indoor evaporator coil deep foam jet cleaning',
        'Outdoor unit high-pressure water jet blast',
        'Air filter, drain tray & blower fan unclogging'
      ]
    },
    {
      id: 'powerjet-window-service',
      sectionId: 'service',
      sectionTitle: 'Service',
      title: 'Powerjet AC servicing (Window AC)',
      rating: '4.81',
      reviews: '320K reviews',
      price: 449,
      originalPrice: 699,
      duration: '40 mins',
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: true,
      image: '/images/categories/cat_ac.jpg',
      inclusions: [
        'Complete window AC unit dismantle and deep coil wash',
        'High-pressure jet wash of condenser fins & drain pan'
      ]
    },
    {
      id: 'anti-rust-deep-coating',
      sectionId: 'service',
      sectionTitle: 'Service',
      title: 'Anti-rust deep protective AC coating',
      rating: '4.85',
      reviews: '110K reviews',
      price: 799,
      originalPrice: 1199,
      duration: '30 mins',
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: false,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Prevents cooling gas leakage from coastal salty air corrosion',
        'Polymer nano anti-corrosion spray on copper coils'
      ]
    },

    // 3. Repair & Gas Refill (Screenshot 5)
    {
      id: 'ac-checkup-diagnostic',
      sectionId: 'repair',
      sectionTitle: 'Repair & gas refill',
      title: 'AC check-up',
      rating: '4.73',
      reviews: '876K reviews',
      price: 299,
      startsAt: true,
      optionsText: '4 options',
      bullet: 'Complete check up to identify issues before repair',
      duration: null,
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: false,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Comprehensive 16-point digital diagnostic inspection',
        'Co-pilot reading of gas pressure, amp current, and PCB health',
        'Exact quote shared before starting any repair'
      ],
      options: [
        {
          id: 'checkup-low-cooling',
          title: 'AC not cooling / low cooling check',
          rating: '4.75',
          reviews: '420K reviews',
          price: 299,
          duration: '30 mins',
          description: 'Co-pilot digital check of gas pressure, coil condition & compressor health'
        },
        {
          id: 'checkup-water-leakage',
          title: 'Water leakage check & diagnosis',
          rating: '4.72',
          reviews: '190K reviews',
          price: 299,
          duration: '30 mins',
          description: 'Slope alignment, drain pipe choke & tray condensation inspection'
        },
        {
          id: 'checkup-power-tripping',
          title: 'AC power on / tripping PCB check',
          rating: '4.71',
          reviews: '150K reviews',
          price: 299,
          duration: '30 mins',
          description: 'Capacitor, PCB board, wiring & MCB trip electrical troubleshooting'
        },
        {
          id: 'checkup-noise-smell',
          title: 'Noise / unusual smell check',
          rating: '4.73',
          reviews: '116K reviews',
          price: 299,
          duration: '30 mins',
          description: 'Blower bearing, fan motor alignment & coil odor diagnosis'
        }
      ]
    },
    {
      id: 'gas-refill-checkup',
      sectionId: 'repair',
      sectionTitle: 'Repair & gas refill',
      title: 'Gas refill & check-up',
      rating: '4.77',
      reviews: '111K reviews',
      price: 3000,
      originalPrice: null,
      duration: '2 hrs 30 mins',
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: false,
      image: '/images/ac_service_card.jpg',
      inclusions: [
        'High-pressure nitrogen leak identification test',
        'Rotary vacuum pump moisture purge to prevent compressor burnout',
        'Weighed gas charging with genuine sealed cylinder (R32 / R410A / R22)'
      ]
    },
    {
      id: 'ac-water-leakage-fix',
      sectionId: 'repair',
      sectionTitle: 'Repair & gas refill',
      title: 'Water leakage repair & drain unclog',
      rating: '4.78',
      reviews: '98K reviews',
      price: 349,
      originalPrice: 499,
      duration: '40 mins',
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: false,
      image: '/images/hero_ac.jpg',
      inclusions: [
        'Clears choked drain pipe and tray sludge',
        'Slope re-alignment to stop water dripping inside room'
      ]
    },

    // 4. Installation/uninstallation (Matches Screenshot)
    {
      id: 'ac-installation-uninstallation',
      sectionId: 'install',
      sectionTitle: 'Installation/uninstallation',
      title: 'AC installation/ uninstallation',
      rating: '4.74',
      reviews: '295K reviews',
      price: 699,
      startsAt: true,
      optionsText: '4 options',
      duration: null,
      perUnitNote: null,
      isHero: false,
      hasGasCheckBadge: false,
      image: '/images/categories/cat_ac.jpg',
      inclusions: [
        'Complete mounting/unmounting of split or window AC with spirit-level precision',
        'Flare nut tightening, vacuum test & refrigerant lock to prevent gas leakage',
        'Clean professional installation avoiding wall vibration and drainage leakage'
      ],
      options: [
        {
          id: 'split-ac-installation',
          title: 'Split AC installation',
          rating: '4.82',
          reviews: '180K reviews',
          price: 1199,
          duration: '1 hr 30 mins',
          description: 'Indoor & outdoor bracket mounting with spirit level, pipe flare tightening & vacuum testing'
        },
        {
          id: 'split-ac-uninstallation',
          title: 'Split AC uninstallation',
          rating: '4.79',
          reviews: '75K reviews',
          price: 599,
          duration: '45 mins',
          description: 'Gas lock pump-down into compressor to prevent refrigerant loss & safe bracket dismounting'
        },
        {
          id: 'window-ac-installation',
          title: 'Window AC installation',
          rating: '4.80',
          reviews: '45K reviews',
          price: 699,
          duration: '1 hr',
          description: 'Heavy wooden/metal frame mounting, unit sliding & sealant foam insulation'
        },
        {
          id: 'window-ac-uninstallation',
          title: 'Window AC uninstallation',
          rating: '4.75',
          reviews: '30K reviews',
          price: 499,
          duration: '35 mins',
          description: 'Safe removal of window AC unit from window frame/sill'
        }
      ]
    }
  ];

  // Dynamic AC services added in Admin Dashboard Catalogue
  const effectiveACServices = React.useMemo(() => {
    const baseIds = new Set(AC_SERVICES.map(s => s.id));
    const dynamicAC = (services || []).filter(s => {
      if (baseIds.has(s.id)) return false;
      const cat = (s.category || '').toLowerCase();
      const catName = (s.categoryName || '').toLowerCase();
      const sub = (s.subcategory || '').toLowerCase();
      const title = (s.title || '').toLowerCase();
      return (
        cat === 'ac-appliances' ||
        cat.includes('ac') ||
        catName.includes('ac') ||
        sub.includes('ac') ||
        title.includes('ac') ||
        title.includes('foam')
      );
    }).map(s => ({
      id: s.id,
      sectionId: 'packages',
      sectionTitle: s.subcategory || 'Featured Catalogue Services',
      title: s.title,
      rating: s.rating ? String(s.rating) : '4.85',
      reviews: s.reviewsCount || '1.2K reviews',
      price: s.price,
      originalPrice: s.originalPrice || Math.round(s.price * 1.25),
      duration: s.duration || `${s.durationMins || 60} mins`,
      perUnitNote: 'Verified Admin Catalogue Service',
      isHero: true,
      hasGasCheckBadge: true,
      image: s.image || '/images/hero_ac.jpg',
      inclusions: s.includedWork && s.includedWork.length > 0
        ? s.includedWork
        : ['Comprehensive doorstep inspection and servicing', 'Pre-service diagnostics and safety testing', '30-day service guarantee']
    }));

    return [...dynamicAC, ...AC_SERVICES];
  }, [services]);

  // Filter based on search query
  const filteredServices = searchQuery.trim()
    ? effectiveACServices.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.options && s.options.some(opt => opt.title.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : effectiveACServices;

  // Cart totals
  const cartEntries = Object.entries(cart);
  const totalCartCount = cartEntries.reduce((sum, [, item]) => sum + (item.qty || 0), 0);
  const cartTotalAmount = cartEntries.reduce((sum, [, item]) => sum + ((item.price || 0) * (item.qty || 0)), 0);

  function handleSubTabClick(tabId) {
    setActiveSubTab(tabId);
    const targetElement = document.getElementById(`section-${tabId}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Hero package (2 ACs)
  const heroPackage = effectiveACServices.find(s => s.id === 'foam-jet-service-2') || effectiveACServices[0];
  const heroPkgQty = cart[heroPackage.id]?.qty || 0;

  return (
    <div className="ac-page-wrapper" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111827' }}>
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

          {/* Center: Location Pill + Search in AC */}
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

            {/* Search in AC */}
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
                placeholder="Search in AC"
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
      {/* 2. TOP HERO: TITLE/WARRANTY (LEFT) + CO-PILOT BANNER (RIGHT) */}
      {/* ========================================================= */}
      <div 
        className="ac-page-hero-grid"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '24px 20px 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
          gap: 28,
          alignItems: 'stretch'
        }}
      >
        {/* Left: AC Title, Rating & UC COVER (Matching Screenshot 1) */}
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
            margin: '0 0 6px 0',
            letterSpacing: '-0.8px'
          }}>
            AC
          </h1>

          {/* Rating & Bookings (★ 4.78 (14.2 M bookings)) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <span style={{
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 900
            }}>
              ★
            </span>
            <span style={{ fontWeight: 800, fontSize: 13.5, color: '#0F172A' }}>4.78</span>
            <span style={{
              fontSize: 13.5,
              color: '#64748B',
              borderBottom: '1px dotted #94A3B8',
              cursor: 'pointer'
            }}>
              (14.2 M bookings)
            </span>
          </div>

          {/* UC COVER Banner Card */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F0FDF4',
            border: '1px solid #DCFCE7',
            borderRadius: 12,
            padding: '10px 18px',
            gap: 16,
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DCFCE7'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F0FDF4'}
          >
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#16A34A',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.4
              }}>
                <CheckCircle2 size={14} />
                <span>UC COVER</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginTop: 3 }}>
                Upto 30 days warranty on repairs
              </div>
            </div>
            <ChevronRight size={18} color="#64748B" />
          </div>
        </div>

        {/* Right: Diagnostic Hero Carousel Banner (Matches Screenshot 1) */}
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
          minHeight: 190
        }}>
          {activeBannerSlide === 0 ? (
            <div style={{
              padding: '20px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20
            }}>
              <div>
                <span style={{
                  color: '#047857',
                  fontWeight: 800,
                  fontSize: 12.5,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 6
                }}>
                  FREE GAS CHECK
                </span>
                <h2 style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 8px 0',
                  lineHeight: 1.15,
                  letterSpacing: '-0.6px'
                }}>
                  AC diagnosis<br />with Co-pilot
                </h2>
                <p style={{
                  fontSize: 15,
                  color: '#475569',
                  margin: 0,
                  fontWeight: 500
                }}>
                  No gas refill without a reading
                </p>
              </div>

              {/* Co-Pilot Handheld Device Vector Graphic */}
              <div style={{ flexShrink: 0, width: 220, display: 'flex', justifyContent: 'center' }}>
                <CoPilotDeviceGraphic />
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <span style={{
                  color: '#047857',
                  fontWeight: 800,
                  fontSize: 12.5,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 6
                }}>
                  FREE GAS CHECK
                </span>
                <h2 style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#0F172A',
                  margin: '0 0 8px 0',
                  lineHeight: 1.15,
                  letterSpacing: '-0.6px'
                }}>
                  Foam-jet<br />AC service
                </h2>
                <p style={{
                  fontSize: 15,
                  color: '#475569',
                  margin: 0,
                  fontWeight: 500
                }}>
                  Deep clean AC vents for efficient cooling
                </p>
              </div>
              <div style={{ width: 190, height: 130, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <img src="/images/hero_ac.jpg" alt="Foam-jet service" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {/* Carousel Navigation Buttons with proper spacing so they never overlap text */}
          <button
            type="button"
            onClick={() => setActiveBannerSlide(prev => (prev === 0 ? 1 : 0))}
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
              zIndex: 10
            }}
          >
            <ChevronLeft size={18} color="#111827" />
          </button>
          <button
            type="button"
            onClick={() => setActiveBannerSlide(prev => (prev === 0 ? 1 : 0))}
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
              zIndex: 10
            }}
          >
            <ChevronRight size={18} color="#111827" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN 3-COLUMN LAYOUT (MATCHING SCREENSHOTS 1, 2, 3, 4, 5) */}
      {/* ========================================================= */}
      <div 
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
                    overflow: 'hidden',
                    backgroundColor: sub.type === 'discount-tile' ? '#E6F7F5' : '#F3F4F6',
                    border: isActive ? '2px solid #0F172A' : '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.08)' : 'none'
                  }}>
                    {sub.type === 'discount-tile' ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4
                      }}>
                        <span style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: '#0D9488',
                          textTransform: 'uppercase',
                          letterSpacing: 0.3
                        }}>
                          Upto
                        </span>
                        <span style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: '#0F766E',
                          lineHeight: 1.1
                        }}>
                          30% OFF
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
                          display: 'block'
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#0F172A' : '#475569',
                    textAlign: 'center',
                    lineHeight: 1.25,
                    minHeight: 28,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                    {sub.name}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ======================================================= */}
        {/* COLUMN 2: CENTER (SERVICE SECTIONS)                    */}
        {/* ======================================================= */}
        <main style={{ minWidth: 0 }}>
          {/* ======================================================= */}
          {/* SECTION 1: SUPER SAVER PACKAGES (Screenshots 2, 3, 4)  */}
          {/* ======================================================= */}
          <section id="section-packages" style={{ marginBottom: 40, scrollMarginTop: 90 }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px 0',
              letterSpacing: -0.4
            }}>
              Super saver packages
            </h2>

            {/* Featured Hero Card (Foam-jet AC service with 2 ACs bottom bar) */}
            <div style={{
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              {/* Top Banner Half */}
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
                    marginBottom: 8,
                    letterSpacing: 0.2
                  }}>
                    Free gas check
                  </span>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                    Foam-jet<br />AC service
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                    Deep clean AC vents<br />for efficient cooling
                  </p>
                </div>
                <div style={{ width: 180, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                  <img src="/images/hero_ac.jpg" alt="Foam-jet AC Service" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              {/* Bottom Row Half: Foam-jet service (2 ACs) */}
              <div style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #F1F5F9'
              }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                    Foam-jet service (2 ACs)
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 4 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                      <Star size={13} fill="#6E42E5" color="#6E42E5" /> 4.75
                    </span>
                    <span>(3M reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14 }}>
                    <strong style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹1,298</strong>
                    <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: 13 }}>₹1,398</span>
                    <span style={{ color: '#64748B', fontSize: 12 }}>• 2 hrs</span>
                    <span style={{ color: '#047857', fontWeight: 700, fontSize: 12, marginLeft: 4 }}>₹649 per AC</span>
                  </div>
                </div>

                {/* Add button */}
                {heroPkgQty === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(heroPackage);
                      showToast('Added Foam-jet service (2 ACs) to cart');
                    }}
                    style={{
                      padding: '8px 24px',
                      borderRadius: 8,
                      border: '1.5px solid #6E42E5',
                      backgroundColor: '#FFFFFF',
                      color: '#6E42E5',
                      fontSize: 14,
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
                    gap: 12,
                    backgroundColor: '#6E42E5',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#FFFFFF'
                  }}>
                    <button type="button" onClick={() => onUpdateQty(heroPackage.id, heroPkgQty - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><Minus size={14} /></button>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>{heroPkgQty}</span>
                    <button type="button" onClick={() => onUpdateQty(heroPackage.id, heroPkgQty + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><Plus size={14} /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Remaining Super saver packages (3 ACs, 4 ACs, 5 ACs) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredServices.filter(s => s.sectionId === 'packages' && s.id !== 'foam-jet-service-2').map(service => {
                const inCartItem = cart[service.id];
                const qty = inCartItem?.qty || 0;

                return (
                  <div 
                    key={service.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      padding: '20px 0', 
                      borderBottom: '1px solid #F1F5F9', 
                      gap: 20 
                    }}
                  >
                    {/* Left: Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                        {service.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                          <Star size={13} fill="#6E42E5" color="#6E42E5" /> {service.rating}
                        </span>
                        <span>({service.reviews})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14, marginBottom: 4 }}>
                        <strong style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹{service.price}</strong>
                        {service.originalPrice && (
                          <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: 13 }}>
                            ₹{service.originalPrice}
                          </span>
                        )}
                        <span style={{ color: '#64748B', fontSize: 12 }}>• {service.duration}</span>
                      </div>
                      {service.perUnitNote && (
                        <div style={{ color: '#047857', fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={12} />
                          <span>{service.perUnitNote}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailService(service)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E42E5',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        View details
                      </button>
                    </div>

                    {/* Right: Image + Free gas check badge + Add button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: 110 }}>
                      <div style={{ position: 'relative', width: 110, height: 74, borderRadius: 12, overflow: 'hidden', background: '#F8FAFC' }}>
                        {service.hasGasCheckBadge && (
                          <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#047857',
                            color: '#FFFFFF',
                            fontSize: 9,
                            fontWeight: 800,
                            textAlign: 'center',
                            padding: '2px 0',
                            zIndex: 2,
                            letterSpacing: 0.2
                          }}>
                            Free gas check
                          </span>
                        )}
                        <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(service);
                            showToast(`Added ${service.title} to cart`);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 0',
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
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          backgroundColor: '#6E42E5',
                          borderRadius: 8,
                          padding: '5px 8px',
                          color: '#FFFFFF'
                        }}>
                          <button type="button" onClick={() => onUpdateQty(service.id, qty - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Minus size={14} /></button>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>{qty}</span>
                          <button type="button" onClick={() => onUpdateQty(service.id, qty + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Plus size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================================= */}
          {/* SECTION 2: SERVICE (Screenshot 4)                      */}
          {/* ======================================================= */}
          <section id="section-service" style={{ marginBottom: 40, scrollMarginTop: 90 }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px 0',
              letterSpacing: -0.5
            }}>
              Service
            </h2>

            {/* Featured Hero Card */}
            <div style={{
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#F8FAFC',
              padding: '22px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              marginBottom: 16
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
                  marginBottom: 8,
                  letterSpacing: 0.2
                }}>
                  Free gas check
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                  Foam-jet<br />AC service
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                  Deep clean AC vents<br />for efficient cooling
                </p>
              </div>
              <div style={{ width: 180, height: 120, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <img src="/images/ac_service_card.jpg" alt="Foam-jet AC Service" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Service List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredServices.filter(s => s.sectionId === 'service').map(service => {
                const inCartItem = cart[service.id];
                const qty = inCartItem?.qty || 0;

                return (
                  <div 
                    key={service.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      padding: '20px 0', 
                      borderBottom: '1px solid #F1F5F9', 
                      gap: 20 
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                        {service.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                          <Star size={13} fill="#6E42E5" color="#6E42E5" /> {service.rating}
                        </span>
                        <span>({service.reviews})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14, marginBottom: 4 }}>
                        <strong style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹{service.price}</strong>
                        {service.originalPrice && (
                          <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: 13 }}>
                            ₹{service.originalPrice}
                          </span>
                        )}
                        <span style={{ color: '#64748B', fontSize: 12 }}>• {service.duration}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailService(service)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E42E5',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        View details
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: 110 }}>
                      <div style={{ position: 'relative', width: 110, height: 74, borderRadius: 12, overflow: 'hidden', background: '#F8FAFC' }}>
                        {service.hasGasCheckBadge && (
                          <span style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#047857',
                            color: '#FFFFFF',
                            fontSize: 9,
                            fontWeight: 800,
                            textAlign: 'center',
                            padding: '2px 0',
                            zIndex: 2,
                            letterSpacing: 0.2
                          }}>
                            Free gas check
                          </span>
                        )}
                        <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(service);
                            showToast(`Added ${service.title} to cart`);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 0',
                            borderRadius: 8,
                            border: '1.5px solid #6E42E5',
                            backgroundColor: '#FFFFFF',
                            color: '#6E42E5',
                            fontSize: 13.5,
                            fontWeight: 800,
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
                          width: '100%',
                          backgroundColor: '#6E42E5',
                          borderRadius: 8,
                          padding: '5px 8px',
                          color: '#FFFFFF'
                        }}>
                          <button type="button" onClick={() => onUpdateQty(service.id, qty - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Minus size={14} /></button>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>{qty}</span>
                          <button type="button" onClick={() => onUpdateQty(service.id, qty + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Plus size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ======================================================= */}
          {/* SECTION 3: REPAIR & GAS REFILL (Screenshot 5)          */}
          {/* ======================================================= */}
          <section id="section-repair" style={{ marginBottom: 40, scrollMarginTop: 90 }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px 0',
              letterSpacing: -0.5
            }}>
              Repair & gas refill
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredServices.filter(s => s.sectionId === 'repair').map(service => {
                const inCartItem = cart[service.id];
                const qty = inCartItem?.qty || 0;

                return (
                  <div 
                    key={service.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      padding: '20px 0', 
                      borderBottom: '1px solid #F1F5F9', 
                      gap: 20 
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                        {service.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                          <Star size={13} fill="#6E42E5" color="#6E42E5" /> {service.rating}
                        </span>
                        <span>({service.reviews})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14, marginBottom: 4 }}>
                        {service.startsAt && <span style={{ fontSize: 12.5, color: '#64748B' }}>Starts at</span>}
                        <strong style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹{service.price}</strong>
                        {service.originalPrice && (
                          <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: 13 }}>
                            ₹{service.originalPrice}
                          </span>
                        )}
                        {service.duration && (
                          <span style={{ color: '#64748B', fontSize: 12 }}>• {service.duration}</span>
                        )}
                      </div>
                      {service.bullet && (
                        <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 6px', lineHeight: 1.4 }}>
                          • {service.bullet}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailService(service)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E42E5',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        View details
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, width: 110 }}>
                      <div style={{ position: 'relative', width: 110, height: 74, borderRadius: 12, overflow: 'hidden', background: '#F8FAFC' }}>
                        <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      {service.options ? (
                        (() => {
                          const optionsCountInCart = service.options.reduce((sum, opt) => sum + (cart[opt.id]?.qty || 0), 0);
                          return (
                            <>
                              {optionsCountInCart === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setOptionsModalService(service)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 0',
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
                          );
                        })()
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
                                padding: '6px 0',
                                borderRadius: 8,
                                border: '1.5px solid #6E42E5',
                                backgroundColor: '#FFFFFF',
                                color: '#6E42E5',
                                fontSize: 13.5,
                                fontWeight: 800,
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
                              width: '100%',
                              backgroundColor: '#6E42E5',
                              borderRadius: 8,
                              padding: '5px 8px',
                              color: '#FFFFFF'
                            }}>
                              <button type="button" onClick={() => onUpdateQty(service.id, qty - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Minus size={14} /></button>
                              <span style={{ fontSize: 13, fontWeight: 800 }}>{qty}</span>
                              <button type="button" onClick={() => onUpdateQty(service.id, qty + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Plus size={14} /></button>
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

          {/* ======================================================= */}
          {/* SECTION 4: INSTALLATION/UNINSTALLATION                 */}
          {/* ======================================================= */}
          <section id="section-install" style={{ marginBottom: 40, scrollMarginTop: 90 }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 16px 0',
              letterSpacing: -0.5
            }}>
              Installation/uninstallation
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredServices.filter(s => s.sectionId === 'install').map(service => {
                const inCartItem = cart[service.id];
                const qty = inCartItem?.qty || 0;

                return (
                  <div 
                    key={service.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      padding: '20px 0', 
                      borderBottom: '1px solid #F1F5F9', 
                      gap: 20 
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                        {service.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#6E42E5' }}>
                          <Star size={13} fill="#6E42E5" color="#6E42E5" /> {service.rating}
                        </span>
                        <span style={{ borderBottom: '1px dotted #94A3B8', cursor: 'pointer' }}>
                          ({service.reviews})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 14, marginBottom: 4 }}>
                        {service.startsAt && <span style={{ fontSize: 12.5, color: '#64748B' }}>Starts at</span>}
                        <strong style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>₹{service.price}</strong>
                        {service.duration && (
                          <span style={{ color: '#64748B', fontSize: 12 }}>• {service.duration}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDetailService(service)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E42E5',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        View details
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, width: 110 }}>
                      <div style={{ position: 'relative', width: 110, height: 74, borderRadius: 12, overflow: 'hidden', background: '#F8FAFC' }}>
                        <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      {service.options ? (
                        (() => {
                          const optionsCountInCart = service.options.reduce((sum, opt) => sum + (cart[opt.id]?.qty || 0), 0);
                          return (
                            <>
                              {optionsCountInCart === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setOptionsModalService(service)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 0',
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
                          );
                        })()
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
                                padding: '6px 0',
                                borderRadius: 8,
                                border: '1.5px solid #6E42E5',
                                backgroundColor: '#FFFFFF',
                                color: '#6E42E5',
                                fontSize: 13.5,
                                fontWeight: 800,
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
                              width: '100%',
                              backgroundColor: '#6E42E5',
                              borderRadius: 8,
                              padding: '5px 8px',
                              color: '#FFFFFF'
                            }}>
                              <button type="button" onClick={() => onUpdateQty(service.id, qty - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Minus size={14} /></button>
                              <span style={{ fontSize: 13, fontWeight: 800 }}>{qty}</span>
                              <button type="button" onClick={() => onUpdateQty(service.id, qty + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}><Plus size={14} /></button>
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
        </main>

        {/* ======================================================= */}
        {/* COLUMN 3: RIGHT SIDEBAR (UC PROMISE & CART SUMMARY)    */}
        {/* ======================================================= */}
        <aside style={{
          position: 'sticky',
          top: 88,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* UC Promise Card (Matches Screenshots 2, 3, 4, 5) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
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

              {/* Holographic Circular Seal Badge */}
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
                <CheckCircle2 size={16} color="#4F46E5" />
                <span style={{
                  fontSize: 6.5,
                  fontWeight: 900,
                  color: '#3730A3',
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                  marginTop: 1
                }}>
                  Assured
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Verified Professionals',
                'Hassle Free Booking',
                'Transparent Pricing'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <Check size={16} color="#059669" strokeWidth={2.5} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Card (Matches Screenshots 2, 3, 4, 5) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '24px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            {totalCartCount === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px 0'
              }}>
                {/* Shopping cart illustration */}
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

                <div style={{ fontSize: 13.5, fontWeight: 500, color: '#94A3B8' }}>
                  No items in your cart
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: '1px solid #F1F5F9'
                }}>
                  <h4 style={{ fontSize: 14.5, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Cart Summary
                  </h4>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6E42E5' }}>
                    {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items in cart list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {cartEntries.map(([id, item]) => (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                      <div style={{ flex: 1, paddingRight: 8 }}>
                        <div style={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.25 }}>
                          {item.title}
                        </div>
                        <div style={{ color: '#64748B', fontSize: 11.5, marginTop: 2 }}>
                          ₹{item.price} × {item.qty}
                        </div>
                      </div>

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
      {/* 4. SERVICE DETAILS MODAL (When clicking "View details")   */}
      {/* ========================================================= */}
      {selectedDetailService && (
        <div 
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
          onClick={() => setSelectedDetailService(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedDetailService(null)}
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

            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginBottom: 6, paddingRight: 32 }}>
              {selectedDetailService.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              <span style={{ color: '#6E42E5', fontWeight: 800 }}>★ {selectedDetailService.rating}</span>
              <span>({selectedDetailService.reviews})</span>
              {selectedDetailService.duration && <span>• {selectedDetailService.duration}</span>}
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 16 }}>
              ₹{selectedDetailService.price}
              {selectedDetailService.originalPrice && (
                <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through', marginLeft: 8 }}>
                  ₹{selectedDetailService.originalPrice}
                </span>
              )}
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              What's included:
            </h4>
            <ul style={{ paddingLeft: 20, fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
              {selectedDetailService.inclusions?.map((inc, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{inc}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                onAddToCart(selectedDetailService);
                showToast(`Added ${selectedDetailService.title} to cart`);
                setSelectedDetailService(null);
              }}
              style={{
                width: '100%',
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Add to Cart • ₹{selectedDetailService.price}
            </button>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* 5. OPTIONS SELECTION MODAL (For AC check-up & Installation)*/}
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
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        ₹{opt.price}
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
      {/* 6. BOTTOM BRAND BANNER (MATCHES SCREENSHOT)              */}
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
