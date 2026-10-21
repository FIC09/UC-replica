import React, { useState, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  ShoppingBag, 
  Star, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  X,
  ChevronRight,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  Award,
  Play,
  Pause,
  ChevronDown
} from 'lucide-react';

export function KitchenCleaningServicePage({
  onBackHome,
  selectedCity = 'Chennai',
  selectedLocality = '4744+HMQ, N Town Internal Rd',
  onOpenLocationModal,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onOpenCheckout,
  showToast = () => {}
}) {
  const [activeCategory, setActiveCategory] = useState('complete-kitchen'); 
  // 'value-packs' | 'chimney' | 'complete-kitchen' | 'appliance' | 'cabinets' | 'mini-services'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef(null);

  const CATEGORIES = [
    {
      id: 'value-packs',
      title: 'Value packs',
      subtitle: 'Kitchen + Chimney / Bathroom Combos',
      renderIcon: () => (
        <div style={{
          width: 58,
          height: 48,
          borderRadius: 8,
          border: '1.5px solid #059669',
          backgroundColor: '#ECFDF5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.1,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#047857', letterSpacing: '0.04em' }}>
            COMBO
          </span>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#047857', letterSpacing: '0.04em' }}>
            DEALS
          </span>
        </div>
      )
    },
    {
      id: 'chimney',
      title: 'Chimney cleaning',
      subtitle: 'Degrease baffle filters & motor box',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Chimney Duct Pipe */}
          <rect x="23" y="6" width="12" height="15" rx="1.5" fill="#334155" stroke="#1E293B" strokeWidth="1" />
          <line x1="23" y1="12" x2="35" y2="12" stroke="#475569" strokeWidth="1" />
          {/* Hood Pyramid Flare */}
          <path d="M15 32L21 21H37L43 32H15Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
          {/* Base Rim / Mesh Filter */}
          <rect x="13" y="32" width="32" height="4" rx="1" fill="#0F172A" />
          <line x1="17" y1="34" x2="41" y2="34" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'complete-kitchen',
      title: 'Complete kitchen cleaning',
      subtitle: 'Floor to ceiling oil & grease removal',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Kitchen Wall Cabinet */}
          <rect x="12" y="7" width="34" height="13" rx="2" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="29" y1="7" x2="29" y2="20" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="26" cy="14" r="1.2" fill="#64748B" />
          <circle cx="32" cy="14" r="1.2" fill="#64748B" />
          {/* Countertop Slab */}
          <rect x="8" y="27" width="42" height="3" rx="1" fill="#0F172A" />
          {/* Stove on counter */}
          <rect x="20" y="25" width="18" height="2" rx="0.5" fill="#64748B" />
          <circle cx="25" cy="24.5" r="1.8" fill="#334155" />
          <circle cx="33" cy="24.5" r="1.8" fill="#334155" />
          {/* Lower Base Cabinets */}
          <rect x="10" y="30" width="38" height="13" rx="1" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="29" y1="30" x2="29" y2="43" stroke="#94A3B8" strokeWidth="1" />
        </svg>
      )
    },
    {
      id: 'appliance',
      title: 'Appliance cleaning',
      subtitle: 'Fridge, microwave & stove degreasing',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Refrigerator Body */}
          <rect x="18" y="6" width="22" height="37" rx="3" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.3" />
          {/* Top Freezer Divider */}
          <line x1="18" y1="18" x2="40" y2="18" stroke="#94A3B8" strokeWidth="1.2" />
          {/* Shelves Inside Open Refrigerator */}
          <line x1="22" y1="12" x2="36" y2="12" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="22" y1="26" x2="36" y2="26" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="22" y1="34" x2="36" y2="34" stroke="#CBD5E1" strokeWidth="1" />
          {/* Handles */}
          <rect x="19.5" y="10" width="1.5" height="5" rx="0.75" fill="#475569" />
          <rect x="19.5" y="22" width="1.5" height="10" rx="0.75" fill="#475569" />
        </svg>
      )
    },
    {
      id: 'cabinets',
      title: 'Cabinets & tiles',
      subtitle: 'Oil film removal & interior wipe',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Modular Wall Cabinet Box */}
          <rect x="13" y="8" width="32" height="32" rx="2.5" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.4" />
          <line x1="29" y1="8" x2="29" y2="40" stroke="#64748B" strokeWidth="1.2" />
          {/* Glass panels */}
          <rect x="16" y="11" width="10" height="26" rx="1.5" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="0.8" />
          <rect x="32" y="11" width="10" height="26" rx="1.5" fill="#E0F2FE" stroke="#BAE6FD" strokeWidth="0.8" />
          {/* Handles */}
          <circle cx="23" cy="24" r="1.3" fill="#0F172A" />
          <circle cx="35" cy="24" r="1.3" fill="#0F172A" />
        </svg>
      )
    },
    {
      id: 'mini-services',
      title: 'Mini services',
      subtitle: 'Exhaust fan, sink & tap descaling',
      renderIcon: () => (
        <svg width="58" height="48" viewBox="0 0 58 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Square outer fan casing */}
          <rect x="14" y="9" width="30" height="30" rx="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.3" />
          {/* Fan circular grille */}
          <circle cx="29" cy="24" r="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
          <circle cx="29" cy="24" r="3" fill="#334155" />
          {/* 4 Blades */}
          <path d="M29 21V14" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M29 27V34" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M26 24H19" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M32 24H39" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  const PRODUCTS = [
    // 1. COMPLETE KITCHEN CLEANING (Default category)
    {
      id: 'classic-kitchen-cleaning',
      category: 'complete-kitchen',
      title: 'Classic Kitchen Deep Cleaning',
      rating: '4.80',
      reviewsCount: '840K reviews',
      price: 799,
      originalPrice: 999,
      duration: '90 mins',
      badge: 'POPULAR CHOICE',
      tag: 'Oil & Grease Removal',
      image: '/images/kitchen_stove_clean.jpg',
      description: 'Complete degreasing of countertops, gas stove, kitchen wall tiles, exterior of cabinets, and stainless steel sink with Diversey heavy degreaser.',
      inclusions: [
        'Removal of sticky yellow cooking oil stains from wall tiles',
        'Gas stove top, knobs and burner platform degreasing',
        'Cabinet exterior wiping and handles polishing',
        'Sink descaling & high-gloss buffing'
      ],
      exclusions: ['Interior cabinet emptying/cleaning (available in Furnished pack)', 'Chimney internal filter wash']
    },
    {
      id: 'furnished-kitchen-deep-clean',
      category: 'complete-kitchen',
      title: 'Furnished Kitchen Deep Clean (Inside & Out)',
      rating: '4.86',
      reviewsCount: '1.2M reviews',
      price: 1199,
      originalPrice: 1499,
      duration: '150 mins',
      badge: 'BESTSELLER',
      tag: 'Interior + Exterior',
      image: '/images/kitchen_stove_clean.jpg',
      description: 'Comprehensive deep cleaning of entire kitchen: our professionals empty shelves, clean cabinet interiors, degrease racks, wipe jars & organize back.',
      inclusions: [
        'Careful unloading, shelf cleaning & reloading of all cabinets',
        'Full height wall tile chemical scrubbing with machine',
        'Gas stove & chimney exterior degreasing',
        'Exhaust fan and floor scrubbing with Diversey Taski R2'
      ],
      exclusions: ['Repair of damaged laminate or loose hinges']
    },
    {
      id: 'movein-kitchen-deep-clean',
      category: 'complete-kitchen',
      title: 'Move-in / Vacant Kitchen Deep Clean',
      rating: '4.88',
      reviewsCount: '340K reviews',
      price: 1399,
      originalPrice: 1699,
      duration: '180 mins',
      badge: 'TOTAL RESTORATION',
      tag: 'Restoration Specialist',
      image: '/images/cleaning_bedroom_bucket.jpg',
      description: 'Intensive post-renovation and move-in kitchen cleaning: removes cement residue, paint splatters, adhesive tapes, pest droppings & deep grease.',
      inclusions: [
        'Floor to ceiling wall scrubbing and grout whitening',
        'Deep chemical wash of all modular wire baskets & drawer channels',
        'Countertop polish & sink drainage siphon disinfection',
        'Antibacterial sanitization treatment throughout kitchen'
      ],
      exclusions: ['Appliance motor repairs']
    },

    // 2. CHIMNEY CLEANING
    {
      id: 'chimney-baffle-filter-clean',
      category: 'chimney',
      title: 'Chimney Baffle Filter Degreasing & Wash',
      rating: '4.84',
      reviewsCount: '920K reviews',
      price: 399,
      originalPrice: 549,
      duration: '40 mins',
      badge: 'SMOKE FREE',
      tag: 'Filter Specialist',
      image: '/images/chimney_service_clean.jpg',
      description: 'Dismantling of stainless steel baffle/mesh filters, chemical boiling wash to liquefy sticky carbon sludge, and airflow restoration.',
      inclusions: [
        'Filter removal and hot caustic solution soak',
        'Oil collector tray draining & chemical scrub',
        'Exterior hood wipe & led light cover degrease',
        'Smoke suction test after reassembly'
      ],
      exclusions: ['Motor fan blower disassembly (available in Deep Clean)']
    },
    {
      id: 'chimney-complete-deep-clean',
      category: 'chimney',
      title: 'Chimney Complete Deep Cleaning (With Blower)',
      rating: '4.89',
      reviewsCount: '610K reviews',
      price: 699,
      originalPrice: 899,
      duration: '75 mins',
      badge: 'FULL DISASSEMBLY',
      tag: 'Master Technician',
      image: '/images/chimney_install_tech.jpg',
      description: 'Full teardown of kitchen chimney: blower fan motor casing degreasing, internal oil pipe flushing, carbon filter inspection & mirror buffing.',
      inclusions: [
        'Dismantling of blower impeller fan & motor housing',
        'Degreasing of motor box with industrial solvent',
        'Stainless steel outer canopy buffing with anti-static spray',
        'Noise and vibration balance check'
      ],
      exclusions: ['Replacement of burnt motor capacitor or PCB']
    },

    // 3. VALUE PACKS (COMBOS)
    {
      id: 'kitchen-chimney-combo-pack',
      category: 'value-packs',
      title: 'Kitchen Deep Clean + Chimney Filter Combo',
      rating: '4.87',
      reviewsCount: '780K reviews',
      price: 1099,
      originalPrice: 1398,
      duration: '120 mins',
      badge: 'TOP COMBO',
      tag: 'Save ₹299',
      image: '/images/chimney_combo_stove.jpg',
      description: 'Most booked combo: Full kitchen countertop, stove, wall tile & sink cleaning PLUS complete chimney baffle filter chemical boiling degrease.',
      inclusions: [
        'Complete Classic kitchen deep cleaning',
        'Chimney baffle filter dismantling & chemical degrease',
        'Oil collection tray wash',
        'High-gloss shine on all stainless steel fixtures'
      ],
      exclusions: ['Cabinet internal shelf unloading']
    },
    {
      id: 'kitchen-bathroom-power-combo',
      category: 'value-packs',
      title: '1 Kitchen + 1 Bathroom Power Combo',
      rating: '4.85',
      reviewsCount: '1.4M reviews',
      price: 1299,
      originalPrice: 1598,
      duration: '150 mins',
      badge: 'SUPER SAVER',
      tag: 'Complete Hygiene',
      image: '/images/home_bathroom.jpg',
      description: 'Dual space deep cleaning: 1 Kitchen (tiles, stove, counters, sink) + 1 Bathroom (mechanized machine floor scrub, WC descaling & tap buffing).',
      inclusions: [
        '1 Complete Kitchen deep cleaning',
        '1 Bathroom mechanized tile scrubbing with single disc machine',
        'Diversey Taski R1, R2 & R6 certified chemicals',
        'Free antibacterial air freshener spray'
      ],
      exclusions: ['Water tank cleaning']
    },
    {
      id: 'kitchen-chimney-fridge-mega-pack',
      category: 'value-packs',
      title: 'Kitchen + Chimney + Refrigerator Mega Pack',
      rating: '4.91',
      reviewsCount: '520K reviews',
      price: 1599,
      originalPrice: 2099,
      duration: '180 mins',
      badge: 'MEGA PACK',
      tag: 'Save ₹500',
      image: '/images/kitchen_stove_clean.jpg',
      description: 'Triple kitchen care: Entire kitchen tiles & stove + Chimney filter boiling wash + Refrigerator deep defrost, tray sanitization & odor removal.',
      inclusions: [
        'Full kitchen tile, stove, sink & counter degreasing',
        'Chimney baffle filter caustic boil wash',
        'Refrigerator interior shelves & door gasket sanitization',
        'Elimination of lingering food odors'
      ],
      exclusions: ['Defrost timer or thermostat replacement']
    },

    // 4. APPLIANCE CLEANING
    {
      id: 'refrigerator-deep-cleaning',
      category: 'appliance',
      title: 'Refrigerator Deep Cleaning & Sanitization',
      rating: '4.81',
      reviewsCount: '620K reviews',
      price: 349,
      originalPrice: 499,
      duration: '45 mins',
      badge: 'FOOD SAFE',
      tag: 'Sanitization Pro',
      image: '/images/refrigerator_cleaning_single.jpg',
      description: 'Food-safe sanitization of refrigerator: shelves and crisper drawers washed, rubber gasket fungus removed, back drainage tray cleaned.',
      inclusions: [
        'Removal and wash of all vegetable trays and door shelves',
        'Fungus removal from rubber door gaskets',
        'Food-safe antibacterial alcohol wipe',
        'Deodorizer tablet installation'
      ],
      exclusions: ['Gas recharging or compressor repairs']
    },
    {
      id: 'microwave-otg-cleaning',
      category: 'appliance',
      title: 'Microwave & OTG Chemical Degreasing',
      rating: '4.78',
      reviewsCount: '290K reviews',
      price: 249,
      originalPrice: 349,
      duration: '30 mins',
      badge: 'SPARK CLEAN',
      tag: 'Oil Specialist',
      image: '/images/microwave_clean_oven.jpg',
      description: 'Remove burnt oil grease, baked cheese splatters, and food crust from microwave oven cavity, glass turntable, and heating element.',
      inclusions: [
        'Steam softening of hardened interior grease',
        'Turntable glass tray and roller ring chemical soak',
        'Exterior touch panel and door glass polishing',
        'Safe non-toxic chemical wipe'
      ],
      exclusions: ['Magnetron replacement']
    },

    // 5. CABINETS & TILES
    {
      id: 'kitchen-wall-tiles-degreasing',
      category: 'cabinets',
      title: 'Kitchen Wall Tiles & Backsplash Degreasing',
      rating: '4.79',
      reviewsCount: '380K reviews',
      price: 399,
      originalPrice: 599,
      duration: '45 mins',
      badge: 'STAIN REMOVER',
      tag: 'Tile Specialist',
      image: '/images/kitchen_stove_clean.jpg',
      description: 'Eliminate stubborn sticky yellow oil residue and tadka stains from kitchen backsplash tiles behind the stove with high-power degreasing paste.',
      inclusions: [
        'Alkaline degreasing foam application',
        'Wire brush grout line scrub',
        'Hot water rinse & microfiber dry buff',
        'Restores tile gloss and reflection'
      ],
      exclusions: ['Tile re-grouting with cement']
    },
    {
      id: 'modular-cabinet-interiors-wipe',
      category: 'cabinets',
      title: 'Modular Cabinet Interior Cleaning & Shelf Lining',
      rating: '4.83',
      reviewsCount: '410K reviews',
      price: 499,
      originalPrice: 699,
      duration: '60 mins',
      badge: 'ORGANIZED',
      tag: 'Interior Care',
      image: '/images/cupboard_drawer_table.jpg',
      description: 'Wipe-down of all internal shelves, telescopic wire basket channels, spice racks, and corner carousels with anti-dust spray.',
      inclusions: [
        'Vacuuming of loose spices, flour & crumbs',
        'Anti-static wipe of laminate shelving',
        'Telescopic channel grease wipe and lubrication',
        'Clean smell & moth-repellent placement'
      ],
      exclusions: ['New shelf liner roll supply']
    },

    // 6. MINI SERVICES
    {
      id: 'exhaust-fan-deep-clean',
      category: 'mini-services',
      title: 'Exhaust Fan Deep Cleaning & Degreasing',
      rating: '4.76',
      reviewsCount: '480K reviews',
      price: 199,
      originalPrice: 299,
      duration: '25 mins',
      badge: 'HIGH AIRFLOW',
      tag: 'Blade Specialist',
      image: '/images/kitchen_stove_clean.jpg',
      description: 'Dismantling of fan blades, heavy oil chemical soak, motor casing wipe, and reassembly for maximum kitchen exhaust suction.',
      inclusions: [
        'Blade removal & chemical bath to melt 100% grease',
        'Outer wall louver shutter wipe',
        'Motor bearing oiling',
        'Vibration check'
      ],
      exclusions: ['Motor rewinding if coil burnt']
    },
    {
      id: 'kitchen-sink-tap-descaling',
      category: 'mini-services',
      title: 'Kitchen Sink & Faucet Descaling',
      rating: '4.82',
      reviewsCount: '310K reviews',
      price: 149,
      originalPrice: 229,
      duration: '20 mins',
      badge: 'SHINE RESTORE',
      tag: 'Chrome Polish',
      image: '/images/wash_basin.jpg',
      description: 'Heavy duty descaling of hard water stains on stainless steel sink, swan neck tap, and drain waste coupling.',
      inclusions: [
        'Stainless steel acid-free descaling paste',
        'Faucet aerator descaling & flow test',
        'Drain trap biological enzyme sludge flush',
        'Microfiber buffing for mirror finish'
      ],
      exclusions: ['Sink plumbing pipe leak repair']
    }
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = !searchQuery.trim() || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  const cartValues = Object.values(cart || {}).filter(item => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return q > 0;
  });
  const cartItemsCount = cartValues.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return sum + q;
  }, 0);
  const cartTotalAmount = cartValues.reduce((sum, item) => {
    const q = typeof item === 'number' ? item : (item?.qty ?? item?.quantity ?? 0);
    return sum + ((item.price || 0) * q);
  }, 0);

  function toggleVideo() {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlayingVideo(true);
    }
  }

  return (
    <div className="kitchen-cleaning-page-wrapper" style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#0F172A'
    }}>
      {/* 1. TOP NAVBAR (MATCHES SCREENSHOT 1:1) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '10px 24px'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Left: Brand Logo & Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBackHome}
              title="Return to Home"
              style={{
                background: '#F3F4F6',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#111827'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            {/* Urban Company Logo exactly matching screenshot */}
            <div 
              onClick={onBackHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: '-0.5px',
                padding: '4px 6px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                UC
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#000000',
                letterSpacing: '-0.5px',
                lineHeight: 1.1
              }}>
                Urban Company
              </div>
            </div>
          </div>

          {/* Middle: Location Selector & Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: '1',
            maxWidth: 680,
            justifyContent: 'center'
          }}>
            {/* Address Selector exactly matching screenshot */}
            <div 
              onClick={onOpenLocationModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                color: '#111827',
                fontWeight: 500,
                maxWidth: 260,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={`${selectedLocality}, ${selectedCity}`}
            >
              <MapPin size={15} color="#4B5563" style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedLocality || '4744+HMQ, N Town Internal Rd-...'}
              </span>
              <ChevronDown size={14} color="#6B7280" style={{ flexShrink: 0 }} />
            </div>

            {/* Search Input matching screenshot */}
            <div style={{
              position: 'relative',
              flex: 1,
              maxWidth: 380
            }}>
              <Search 
                size={16} 
                color="#6B7280" 
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} 
              />
              <input
                type="text"
                placeholder="Search in Kitchen Cleaning"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 32px 8px 36px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 13,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9CA3AF'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Cart Button */}
          <button
            type="button"
            onClick={onOpenCart || onOpenCheckout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              backgroundColor: cartItemsCount > 0 ? '#111827' : '#F3F4F6',
              color: cartItemsCount > 0 ? '#FFFFFF' : '#111827',
              border: 'none',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {cartItemsCount > 0 && (
              <span style={{
                backgroundColor: '#6E42E5',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION (1:1 REPLICA OF THE SCREENSHOT) */}
      <section style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '32px 24px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '360px 1fr',
          gap: 36,
          alignItems: 'start'
        }} className="kitchen-hero-layout">

          {/* LEFT COLUMN: TITLE, RATING, SELECT A SERVICE CARD (6 TILES) */}
          <div>
            {/* Title */}
            <h1 style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.8px',
              lineHeight: 1.15
            }}>
              Kitchen Cleaning
            </h1>

            {/* Rating with purple circle star matching screenshot */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: '#6E42E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                4.83
              </span>
              <span style={{
                fontSize: 14,
                color: '#6B7280',
                borderBottom: '1px dotted #9CA3AF',
                cursor: 'pointer'
              }}>
                (1.9 M bookings)
              </span>
            </div>

            {/* "Select a service" Box matching screenshot 1:1 (3 Columns x 2 Rows) */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 16,
              padding: '18px 16px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6B7280',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap'
                }}>
                  Select a service
                </span>
                <div style={{ height: 1, backgroundColor: '#E5E7EB', flex: 1 }} />
              </div>

              {/* 6 Interactive Service Tiles in 3-column, 2-row grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                rowGap: 16,
                columnGap: 12
              }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery('');
                        const el = document.getElementById('kitchen-services-list');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        textAlign: 'center'
                      }}
                    >
                      {/* Tile box */}
                      <div
                        style={{
                          width: '100%',
                          height: 76,
                          backgroundColor: isSelected ? '#F3F4F6' : '#F9FAFB',
                          borderRadius: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isSelected ? '1.5px solid #111827' : '1px solid #E5E7EB',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease',
                          transform: isSelected ? 'scale(1.02)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                          }
                        }}
                      >
                        {cat.renderIcon()}
                      </div>

                      {/* Tile Label */}
                      <span style={{
                        marginTop: 7,
                        fontSize: 11.5,
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? '#111827' : '#4B5563',
                        lineHeight: 1.25,
                        maxWidth: 96
                      }}>
                        {cat.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guarantee Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 18,
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              fontSize: 12,
              color: '#475569'
            }}>
              <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
              <span>
                <strong>Food-Safe Promise:</strong> Certified Diversey degreasers, odorless & 100% non-toxic for cooking zones.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: LARGE VIDEO / MEDIA BANNER (MATCHES SCREENSHOT 1:1) */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: 410,
            backgroundColor: '#1E293B',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            {/* Background preview image showing professional with gloves cleaning chimney filters */}
            <img 
              src="/images/kitchen_stove_clean.jpg" 
              alt="Kitchen Chimney Degreasing" 
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.78)'
              }}
            />

            {/* Video Element */}
            <video 
              ref={videoRef}
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isPlayingVideo ? 'block' : 'none'
              }}
              onEnded={() => setIsPlayingVideo(false)}
            />

            {/* Dark Vignette Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)'
            }} />

            {/* Center Text matching screenshot: "They need professional care..." */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              textAlign: 'center',
              color: '#FFFFFF',
              padding: '0 24px',
              maxWidth: 520
            }}>
              <h2 style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                margin: '0 0 16px 0',
                textShadow: '0 3px 12px rgba(0,0,0,0.85)',
                lineHeight: 1.2
              }}>
                They need <br />
                <span style={{ color: '#FDE047' }}>professional care...</span>
              </h2>

              {/* Play / Pause Circular Button */}
              <button
                type="button"
                onClick={toggleVideo}
                title={isPlayingVideo ? "Pause" : "Watch Cleaning In Action"}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  transition: 'transform 0.15s ease, background-color 0.15s ease',
                  color: '#111827'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)';
                }}
              >
                {isPlayingVideo ? (
                  <Pause size={24} fill="#111827" strokeWidth={0} />
                ) : (
                  <Play size={24} fill="#111827" strokeWidth={0} style={{ marginLeft: 3 }} />
                )}
              </button>
            </div>

            {/* Bottom Tagline on Video */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: 20,
              right: 20,
              zIndex: 10,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  High-Heat Steam & Caustic Sludge Dissolving
                </div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  Eliminates 100% of hardened cooking oil and sticky grease
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                1:15 MIN PREVIEW
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES CATALOGUE SECTION */}
      <section id="kitchen-services-list" style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '24px 24px 100px',
        boxSizing: 'border-box'
      }}>
        {/* Category Filter Tabs Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: 14,
          marginBottom: 24,
          overflowX: 'auto'
        }}>
          {CATEGORIES.map((cat) => {
            const isTabActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: isTabActive ? '1.5px solid #111827' : '1px solid #E5E7EB',
                  backgroundColor: isTabActive ? '#111827' : '#FFFFFF',
                  color: isTabActive ? '#FFFFFF' : '#4B5563',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.title}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: activeCategory === 'all' ? '1.5px solid #111827' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === 'all' ? '#111827' : '#FFFFFF',
              color: activeCategory === 'all' ? '#FFFFFF' : '#4B5563',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Services ({PRODUCTS.length})
          </button>
        </div>

        {/* Section Title */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {activeCategory === 'complete-kitchen' && 'Complete Kitchen Cleaning Packages'}
            {activeCategory === 'chimney' && 'Chimney Cleaning & Baffle Filter Degreasing'}
            {activeCategory === 'value-packs' && 'Value Packs & Super Saver Combos'}
            {activeCategory === 'appliance' && 'Kitchen Appliance Cleaning (Fridge, Microwave, Stove)'}
            {activeCategory === 'cabinets' && 'Cabinets & Wall Tiles Degreasing'}
            {activeCategory === 'mini-services' && 'Mini Services (Exhaust Fan, Sink & Tap Descaling)'}
            {activeCategory === 'all' && 'All Kitchen Cleaning Services'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            Showing {filteredProducts.length} verified kitchen cleaning services
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            backgroundColor: '#F9FAFB',
            borderRadius: 16,
            border: '1px dashed #CBD5E1'
          }}>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 12px 0' }}>
              No kitchen services found matching "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => { setActiveCategory('complete-kitchen'); setSearchQuery(''); }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#111827',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 22
          }}>
            {filteredProducts.map((product) => {
              const qty = cart[product.id]?.qty || 0;
              return (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #E5E7EB',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <div>
                    {/* Top Row: Badge & Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10
                    }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        padding: '2px 8px',
                        borderRadius: 4,
                        letterSpacing: '0.04em'
                      }}>
                        {product.badge}
                      </span>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#111827'
                      }}>
                        <Star size={12} fill="#6E42E5" color="#6E42E5" />
                        <span>{product.rating}</span>
                        <span style={{ color: '#6B7280', fontWeight: 500 }}>
                          ({product.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 6px 0',
                      lineHeight: 1.3
                    }}>
                      {product.title}
                    </h3>

                    {/* Duration & Tag */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      color: '#6B7280',
                      marginBottom: 10
                    }}>
                      <Clock size={12} />
                      <span>{product.duration}</span>
                      <span>•</span>
                      <span>{product.tag}</span>
                    </div>

                    {/* Pricing */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      marginBottom: 12
                    }}>
                      <span style={{ fontSize: 19, fontWeight: 900, color: '#0F172A' }}>
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: 13,
                      color: '#4B5563',
                      lineHeight: 1.5,
                      margin: '0 0 14px 0'
                    }}>
                      {product.description}
                    </p>

                    {/* Inclusions preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {product.inclusions.slice(0, 2).map((inc, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#374151' }}>
                          <CheckCircle2 size={13} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>

                    {/* View details button */}
                    <button
                      type="button"
                      onClick={() => setSelectedDetailProduct(product)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#6E42E5',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        marginBottom: 16
                      }}
                    >
                      <span>View details</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* Bottom: Image thumbnail + Add to Cart Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid #F3F4F6'
                  }}>
                    <div style={{
                      width: 72,
                      height: 54,
                      borderRadius: 8,
                      overflow: 'hidden',
                      backgroundColor: '#F3F4F6'
                    }}>
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ minWidth: 110 }}>
                      {qty > 0 ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #6E42E5',
                          borderRadius: 8,
                          padding: '5px 10px',
                          boxShadow: '0 2px 8px rgba(110, 66, 229, 0.15)'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(product.id, qty - 1);
                              showToast(`Updated "${product.title}"`);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6E42E5',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 2
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#6E42E5' }}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(product.id, qty + 1);
                              showToast(`Added more "${product.title}"`);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#6E42E5',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 2
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(product);
                            showToast(`Added "${product.title}" to cart`);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 16px',
                            backgroundColor: '#FFFFFF',
                            color: '#6E42E5',
                            border: '1.5px solid #6E42E5',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#6E42E5';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.color = '#6E42E5';
                          }}
                        >
                          Add +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. DETAILS MODAL */}
      {selectedDetailProduct && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setSelectedDetailProduct(null)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 540,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedDetailProduct(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <X size={18} color="#0F172A" />
            </button>

            <div style={{ height: 200, width: '100%', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
              <img 
                src={selectedDetailProduct.image} 
                alt={selectedDetailProduct.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  {selectedDetailProduct.badge}
                </span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {selectedDetailProduct.duration}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                {selectedDetailProduct.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                  ₹{selectedDetailProduct.price}
                </span>
                {selectedDetailProduct.originalPrice && (
                  <span style={{ fontSize: 14, color: '#9CA3AF', textDecoration: 'line-through' }}>
                    ₹{selectedDetailProduct.originalPrice}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {selectedDetailProduct.description}
              </p>

              {/* Inclusions */}
              <div style={{ marginBottom: 18 }}>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>
                  What's included in this package:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedDetailProduct.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
                      <CheckCircle2 size={15} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              {selectedDetailProduct.exclusions && selectedDetailProduct.exclusions.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
                    What's not included:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedDetailProduct.exclusions.map((exc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#6B7280' }}>
                        <X size={13} color="#EF4444" style={{ flexShrink: 0 }} />
                        <span>{exc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={() => {
                  onAddToCart(selectedDetailProduct);
                  showToast(`Added "${selectedDetailProduct.title}" to cart`);
                  setSelectedDetailProduct(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#111827',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 10
                }}
              >
                <Plus size={16} />
                <span>Add to Cart • ₹{selectedDetailProduct.price}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. STICKY BOTTOM FLOATING CART BAR */}
      {cartItemsCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: 720,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 16,
          padding: '14px 22px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 99,
          animation: 'slideUp 0.25s ease-out'
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'} in your cart
            </div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>
              ₹{cartTotalAmount}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCheckout || onOpenCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
