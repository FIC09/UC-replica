import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowLeft, 
  Search, 
  Star, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Zap,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export function ElectricianPlumberCarpenterModal({ 
  isOpen, 
  onClose, 
  onSelectOption,
  cart = {},
  onAddToCart,
  onUpdateQty,
  onOpenCart
}) {
  const [selectedCategory, setSelectedCategory] = useState(null); // 'electrician' | 'plumber' | 'carpenter' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState('all');

  // Reset category drill-down when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setSearchQuery('');
      setActiveSubFilter('all');
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (selectedCategory) {
          setSelectedCategory(null);
        } else {
          onClose();
        }
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, selectedCategory]);

  // Complete products catalogue based on category names
  const EPC_PRODUCTS = useMemo(() => ({
    electrician: [
      {
        id: 'fan-install-repair',
        title: 'Ceiling Fan Installation / Replacement',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'fans',
        rating: 4.85,
        reviewsCount: '315K reviews',
        price: 149,
        originalPrice: 249,
        duration: '25 mins',
        badge: 'INSTANT SERVICE',
        tag: 'Verified Electrician',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
        description: 'Safe ceiling fan assembly, hook mounting, capacitor check, and blade balancing with zero wobble.',
        inclusions: ['Blade balancing test', 'Capacitor connection', 'Regulator speed check', 'Safety bolt tightening']
      },
      {
        id: 'fan-repair',
        title: 'Ceiling & Exhaust Fan Repair',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'fans',
        rating: 4.80,
        reviewsCount: '142K reviews',
        price: 149,
        originalPrice: 229,
        duration: '30 mins',
        badge: 'QUICK FIX',
        tag: 'Verified Electrician',
        image: '/images/fan_repair.jpg',
        description: 'Diagnose noise, slow speeds, coil heating, or replace faulty capacitor with genuine parts.',
        inclusions: ['Capacitor diagnosis & replacement', 'Bearing oiling & noise fix', 'Blade alignment']
      },
      {
        id: 'switchboard-repair',
        title: 'Switchboard Repair & Socket Replacement',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'switches',
        rating: 4.80,
        reviewsCount: '194K reviews',
        price: 99,
        originalPrice: 199,
        duration: '20 mins',
        badge: 'SUPER SAVER',
        tag: 'Safety Tested',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
        description: 'Fix sparking switches, burnt sockets, loose wiring, or install new modular switch plates.',
        inclusions: ['Multi-meter circuit continuity test', 'Safe wire crimping', 'Replacement of damaged modular socket']
      },
      {
        id: 'tubelight-install',
        title: 'Tubelight & Batten LED Installation',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'lighting',
        rating: 4.86,
        reviewsCount: '98K reviews',
        price: 119,
        originalPrice: 199,
        duration: '20 mins',
        badge: 'SAME DAY',
        tag: 'Verified Electrician',
        image: '/images/tubelight.jpg',
        description: 'Safe mounting and wiring of LED batten lights, conventional tubelights, and electronic chokes.',
        inclusions: ['Wall clip drilling & mounting', 'Safe wiring connection with wire caps', 'Illumination test']
      },
      {
        id: 'bulb-installation',
        title: 'Bulb & Spot Light Installation',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'lighting',
        rating: 4.84,
        reviewsCount: '87K reviews',
        price: 49,
        originalPrice: 99,
        duration: '15 mins',
        badge: 'SUPER SAVER',
        tag: 'Safety Tested',
        image: '/images/bulb_install.jpg',
        description: 'Quick installation or replacement of ceiling bulbs, track lights, and spotlight fixtures.',
        inclusions: ['Holder inspection', 'Safe ladder assistance', 'Phase polarity check']
      },
      {
        id: 'internal-wiring',
        title: 'New Internal Wiring & Safety Earthing Check',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'wiring',
        rating: 4.73,
        reviewsCount: '45K reviews',
        price: 199,
        originalPrice: 299,
        duration: '45 mins',
        badge: 'FIRE SAFE',
        tag: 'Certified Wireman',
        image: '/images/internal_wiring.jpg',
        description: 'FR/FRLS insulated wire pulling through PVC conduits, junction boxes, and distribution panels.',
        inclusions: ['Conduit wire pulling (up to 5m)', 'Crimping & terminal insulation', 'Earthing continuity test']
      },
      {
        id: 'mcb-fuse-repair',
        title: 'MCB Fuse Replacement & Tripping Fix',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'wiring',
        rating: 4.88,
        reviewsCount: '68K reviews',
        price: 149,
        originalPrice: 249,
        duration: '30 mins',
        badge: 'SAFETY CERTIFIED',
        tag: 'Certified Wireman',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
        description: 'Fix frequent MCB tripping, replace burnt circuit breakers, and balance household phase load.',
        inclusions: ['Single/Double pole MCB swap', 'Terminal torque tightening', 'Short circuit load testing']
      },
      {
        id: 'inverter-service',
        title: 'Inverter & Battery Terminal Servicing',
        category: 'quick-repairs',
        subcategory: 'Electrician',
        subTag: 'wiring',
        rating: 4.82,
        reviewsCount: '54K reviews',
        price: 249,
        originalPrice: 399,
        duration: '35 mins',
        badge: 'BACKUP POWER',
        tag: 'Power Specialist',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
        description: 'Complete home inverter checkup, battery distilled water top-up, lead terminal desulfation, and voltage regulation.',
        inclusions: ['Acid terminal cleaning & jelly coat', 'Distilled water top-up (up to 6 cells)', 'Output voltage test']
      }
    ],
    plumber: [
      {
        id: 'tap-repair-replacement',
        title: 'Water Tap Repair & Mixer Leak Fix',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'taps',
        rating: 4.83,
        reviewsCount: '240K reviews',
        price: 149,
        originalPrice: 249,
        duration: '30 mins',
        badge: 'LEAK PROOF',
        tag: 'Experienced Plumber',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
        description: 'Stop dripping faucets, replace faulty ceramic cartridges, Teflon sealing, and pressure adjustments.',
        inclusions: ['Washer or ceramic spindle replacement', 'Teflon tape re-threading', 'Aerator descaling to restore water flow']
      },
      {
        id: 'flush-tank-repair',
        title: 'Toilet Flush Tank Repair & Ball Valve Fix',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'toilet',
        rating: 4.75,
        reviewsCount: '112K reviews',
        price: 149,
        originalPrice: 249,
        duration: '30 mins',
        badge: 'NO OVERFLOW',
        tag: 'Master Plumber',
        image: '/images/flush_tank.jpg',
        description: 'Stop continuous water running, fix push button, float valve, syphon kit, or inlet valve leakage.',
        inclusions: ['Syphon mechanism adjustment', 'Ball valve float calibration', 'Washer leak check']
      },
      {
        id: 'drain-blockage',
        title: 'Drain & Basin Blockage Removal',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'blockage',
        rating: 4.77,
        reviewsCount: '168K reviews',
        price: 199,
        originalPrice: 349,
        duration: '35 mins',
        badge: 'RAPID CLEAR',
        tag: 'Specialist Tools',
        image: '/images/drain_blockage.jpg',
        description: 'Heavy duty auger snake clearing for clogged kitchen sinks, wash basins, or bathroom floor traps.',
        inclusions: ['Mechanical auger snake unclogging', 'P-trap cleaning & sludge cleanout', 'High-flow drain test']
      },
      {
        id: 'wash-basin-leakage',
        title: 'Wash Basin Leakage & Waste Pipe Repair',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'basin',
        rating: 4.78,
        reviewsCount: '92K reviews',
        price: 129,
        originalPrice: 219,
        duration: '25 mins',
        badge: 'ZERO LEAK',
        tag: 'Master Plumber',
        image: '/images/wash_basin.jpg',
        description: 'Fix dripping bottle traps, replace broken corrugated waste pipes, and reseal silicone edges.',
        inclusions: ['Waste coupling tightening', 'Teflon threading & silicone sealing', 'Water flow test']
      },
      {
        id: 'connection-hose',
        title: 'Connection Hose & Angle Valve Replacement',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'pipes',
        rating: 4.78,
        reviewsCount: '76K reviews',
        price: 129,
        originalPrice: 199,
        duration: '20 mins',
        badge: 'HIGH PRESSURE',
        tag: 'Certified Plumber',
        image: '/images/connection_hose.jpg',
        description: 'Install stainless steel braided connection pipe for geysers, toilet health faucets, or basins.',
        inclusions: ['Thread sealing with premium Teflon', 'Pressure seal testing', 'Old hose removal']
      },
      {
        id: 'shower-install-repair',
        title: 'Shower Head Installation & Descaling',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'taps',
        rating: 4.81,
        reviewsCount: '83K reviews',
        price: 119,
        originalPrice: 199,
        duration: '25 mins',
        badge: 'HIGH FLOW',
        tag: 'Certified Plumber',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
        description: 'Install new rainfall or handheld shower head, fix loose shower arms, and descale clogged nozzles for maximum spray.',
        inclusions: ['Shower arm mounting', 'Teflon thread seal & silicone ring', 'Water spray balance test']
      },
      {
        id: 'water-tank-cleaning',
        title: 'Overhead Water Tank Deep Cleaning (up to 1000L)',
        category: 'quick-repairs',
        subcategory: 'Plumber',
        subTag: 'pipes',
        rating: 4.89,
        reviewsCount: '47K reviews',
        price: 699,
        originalPrice: 999,
        duration: '60 mins',
        badge: 'GERM FREE',
        tag: 'Hygienic Pro',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
        description: '6-stage deep cleaning of rooftop water tank: sludge de-watering, high-pressure jetting, vacuuming, and UV antibacterial treatment.',
        inclusions: ['Sludge & sediment pump evacuation', 'Anti-algae wall scrubbing', 'UV lamp disinfection scan']
      }
    ],
    carpenter: [
      {
        id: 'door-lock-repair',
        title: 'Door Lock Repair & Mortise Lock Installation',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'locks',
        rating: 4.79,
        reviewsCount: '110K reviews',
        price: 149,
        originalPrice: 249,
        duration: '30 mins',
        badge: 'SECURITY SAFE',
        tag: 'Master Carpenter',
        image: '/images/door_lock_mortise.jpg',
        description: 'Fix stuck door latches, install new high-security mortise locks, cylinder barrels, or magnetic catches.',
        inclusions: ['Mortise slot chiseling/adjustment', 'Strike plate realignment', 'Smooth key turn lubrication test']
      },
      {
        id: 'door-repair',
        title: 'Door Repair, Trimming & Hinge Alignment',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'doors',
        rating: 4.78,
        reviewsCount: '95K reviews',
        price: 199,
        originalPrice: 329,
        duration: '40 mins',
        badge: 'NO SQUEAK',
        tag: 'Master Carpenter',
        image: '/images/door_repair_wood.jpg',
        description: 'Planing swollen wooden doors rubbing against the floor, tightening loose hinges, and eliminating creaking noises.',
        inclusions: ['Bottom door edge planing (up to 5mm)', 'Hinge realignment & anchoring', 'Closing clearance check']
      },
      {
        id: 'cupboard-repair',
        title: 'Cupboard & Drawer Repair (Hydraulic Hinges)',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'cupboards',
        rating: 4.80,
        reviewsCount: '84K reviews',
        price: 89,
        originalPrice: 159,
        duration: '20 mins',
        badge: 'SMOOTH SLIDE',
        tag: 'Furniture Pro',
        image: '/images/cupboard_drawer_table.jpg',
        description: 'Repair misaligned wardrobe shutters, replace loose soft-close hydraulic hinges, and fix stuck drawer sliders.',
        inclusions: ['Telescopic channel realignment', 'Hydraulic auto-hinge tightening', 'Magnetic catch adjustment']
      },
      {
        id: 'drill-and-hang',
        title: 'Drill & Hang (Curtain Rods, Mirrors, Art & Frames)',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'drill',
        rating: 4.87,
        reviewsCount: '180K reviews',
        price: 199,
        originalPrice: 299,
        duration: '30 mins',
        badge: 'LASER LEVEL',
        tag: 'Precision Level',
        image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
        description: 'Clean wall drilling with spirit level alignment for up to 3 items. Zero dust with vacuum drill collar.',
        inclusions: ['Drilling on concrete, brick, or tile', 'Heavy-duty nylon plugs & screws included', 'Laser spirit level alignment']
      },
      {
        id: 'shelf-installation',
        title: 'Floating Shelf & Cabinet Installation',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'shelves',
        rating: 4.81,
        reviewsCount: '64K reviews',
        price: 99,
        originalPrice: 189,
        duration: '25 mins',
        badge: 'LEVEL CHECKED',
        tag: 'Master Carpenter',
        image: '/images/shelf_install.jpg',
        description: 'Precision bracket mounting for floating shelves, bathroom mirrors, kitchen racks, and key holders.',
        inclusions: ['Laser spirit level measurement', 'Anchor bolt insertion', 'Load bearing test']
      },
      {
        id: 'decor-installation',
        title: 'Wall Decor & Hanging Frame Installation',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'drill',
        rating: 4.84,
        reviewsCount: '52K reviews',
        price: 99,
        originalPrice: 169,
        duration: '20 mins',
        badge: 'ZERO DAMAGE',
        tag: 'Master Carpenter',
        image: '/images/decor_abstract_frame.jpg',
        description: 'Safe and damage-free hanging of abstract canvas art, family photo collages, metal wall sculptures, and wall clocks.',
        inclusions: ['Precision drill & picture hook fitting', 'Horizontal level alignment', 'Clean dust sweep']
      },
      {
        id: 'furniture-assembly',
        title: 'Bed, Table & Wardrobe Furniture Assembly',
        category: 'quick-repairs',
        subcategory: 'Carpenter',
        subTag: 'shelves',
        rating: 4.90,
        reviewsCount: '73K reviews',
        price: 349,
        originalPrice: 599,
        duration: '60 mins',
        badge: 'FLATPACK PRO',
        tag: 'Master Carpenter',
        image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
        description: 'Expert assembly of flat-pack furniture (IKEA, Pepperfry, Urban Ladder) including beds, computer desks, dining tables, and wardrobes.',
        inclusions: ['Cam-lock and dowel assembly', 'Drawer & hinge alignment', 'Weight stability and wobble test']
      }
    ]
  }), []);

  if (!isOpen) return null;

  const OPTIONS = [
    {
      id: 'electrician',
      name: 'Electrician',
      badge: '71 mins',
      renderIcon: () => (
        <svg width="68" height="52" viewBox="0 0 68 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Switchboard outer plate */}
          <rect x="8" y="6" width="40" height="32" rx="4" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <rect x="9.5" y="7.5" width="37" height="29" rx="3" fill="#F8FAFC" />
          <rect x="14" y="13" width="7" height="11" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="17.5" y1="15" x2="17.5" y2="17" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="24.5" y="13" width="7" height="11" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="28" y1="15" x2="28" y2="17" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="39" cy="16" r="1.8" fill="#475569" />
          <circle cx="36.5" cy="20.5" r="1.3" fill="#475569" />
          <circle cx="41.5" cy="20.5" r="1.3" fill="#475569" />
          <path d="M48 24L53 40" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M53 40L54 43" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          <g transform="rotate(-18 45 6)">
            <rect x="42" y="6" width="6.5" height="18" rx="2.5" fill="#EF4444" stroke="#DC2626" strokeWidth="0.8" />
            <line x1="44" y1="8" x2="44" y2="22" stroke="#FCA5A5" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="46.5" y1="8" x2="46.5" y2="22" stroke="#B91C1C" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        </svg>
      )
    },
    {
      id: 'plumber',
      name: 'Plumber',
      badge: null,
      renderIcon: () => (
        <svg width="68" height="52" viewBox="0 0 68 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="6" width="22" height="17" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="14" y="5" width="24" height="3" rx="1.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
          <ellipse cx="26" cy="4.5" rx="2.5" ry="1.2" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.6" />
          <ellipse cx="26" cy="26" rx="15" ry="6.5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M13 26C13 36 19 41 26 41C33 41 39 36 39 26" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M19 41L18 46H34L33 41" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="48" y1="12" x2="48" y2="36" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M42 44C42 38 54 38 54 44H42Z" fill="#EF4444" stroke="#DC2626" strokeWidth="1.2" />
          <rect x="41.5" y="44" width="13" height="2" rx="1" fill="#DC2626" />
        </svg>
      )
    },
    {
      id: 'carpenter',
      name: 'Carpenter',
      badge: '76 mins',
      renderIcon: () => (
        <svg width="68" height="52" viewBox="0 0 68 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="11" y="4" width="26" height="42" rx="2" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
          <rect x="13" y="6" width="22" height="38" rx="1" fill="#92400E" stroke="#78350F" strokeWidth="0.8" />
          <rect x="15" y="8" width="8" height="14" rx="1" fill="#78350F" opacity="0.6" />
          <rect x="25" y="8" width="8" height="14" rx="1" fill="#78350F" opacity="0.6" />
          <rect x="15" y="24" width="8" height="17" rx="1" fill="#78350F" opacity="0.6" />
          <rect x="25" y="24" width="8" height="17" rx="1" fill="#78350F" opacity="0.6" />
          <circle cx="34" cy="25" r="1.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.6" />
          <path d="M37 25H47C49 25 50 26 50 28V30C50 31.5 49 32.5 47 32.5H41L38.5 30.5H37V25Z" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
          <rect x="34" y="26.5" width="3" height="3" fill="#334155" />
          <line x1="30" y1="28" x2="34" y2="28" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M44 32.5L46 41H42.5L41 32.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
          <rect x="41" y="40" width="8" height="4.5" rx="1" fill="#0F172A" />
          <circle cx="42.5" cy="34" r="1" fill="#EF4444" />
        </svg>
      )
    }
  ];

  // Active category item
  const currentOption = OPTIONS.find(o => o.id === selectedCategory);

  // Filtered products list for selected category
  const activeProducts = selectedCategory ? (EPC_PRODUCTS[selectedCategory] || []) : [];
  const filteredProducts = activeProducts.filter(p => {
    if (activeSubFilter !== 'all' && p.subTag !== activeSubFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.title.toLowerCase().includes(q) || 
             p.description.toLowerCase().includes(q) || 
             (p.inclusions && p.inclusions.some(inc => inc.toLowerCase().includes(q)));
    }
    return true;
  });

  // Category specific filter pills
  const SUB_FILTERS = {
    electrician: [
      { id: 'all', label: 'All Services' },
      { id: 'fans', label: 'Fan Repairs' },
      { id: 'switches', label: 'Switches & Sockets' },
      { id: 'lighting', label: 'Lighting' },
      { id: 'wiring', label: 'Wiring & MCB' }
    ],
    plumber: [
      { id: 'all', label: 'All Services' },
      { id: 'taps', label: 'Taps & Mixers' },
      { id: 'toilet', label: 'Toilet & Flush' },
      { id: 'blockage', label: 'Drain Blockage' },
      { id: 'basin', label: 'Basin & Pipes' }
    ],
    carpenter: [
      { id: 'all', label: 'All Services' },
      { id: 'locks', label: 'Door Locks' },
      { id: 'doors', label: 'Door Repair' },
      { id: 'cupboards', label: 'Cupboards' },
      { id: 'drill', label: 'Drill & Hang' },
      { id: 'shelves', label: 'Furniture Assembly' }
    ]
  };

  // Cart total items count from active products
  const cartItemsCount = Object.values(cart).reduce((sum, item) => {
    return sum + (item.qty || 0);
  }, 0);
  const cartTotalAmount = Object.values(cart).reduce((sum, item) => {
    return sum + ((item.price || 0) * (item.qty || 0));
  }, 0);

  return (
    <div 
      className="electrician-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Centered Modal Wrapper holding Floating Close Button & Modal Box */}
      <div 
        style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: selectedCategory ? 740 : 580,
          transition: 'max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main White Modal Card */}
        <div
          className="electrician-modal"
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.35)',
            width: '100%',
            padding: selectedCategory ? '24px 24px 20px' : '28px 28px 32px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            maxHeight: selectedCategory ? '88vh' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* ======================================================== */}
          {/* VIEW 1: INITIAL 3 TILES GRID (MATCHES SCREENSHOT 1:1)     */}
          {/* ======================================================== */}
          {!selectedCategory ? (
            <div>
              {/* Modal Header with Title & Cancel Button on Right Side */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24
              }}>
                <h2 style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2
                }}>
                  Electrician, Plumber &amp; Carpenters
                </h2>

                <button
                  type="button"
                  onClick={onClose}
                  className="electrician-modal-close"
                  title="Close"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    border: 'none',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E5E7EB';
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X size={20} strokeWidth={2.4} />
                </button>
              </div>

              {/* 3-Column Grid of Electrician, Plumber, Carpenter */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                columnGap: 14,
                rowGap: 18
              }}>
                {OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectOption) {
                        onSelectOption(item);
                      } else {
                        setSelectedCategory(item.id);
                        setSearchQuery('');
                        setActiveSubFilter('all');
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
                    {/* Light Gray Rounded Tile Box */}
                    <div
                      className="electrician-tile-box"
                      style={{
                        width: '100%',
                        height: 86,
                        backgroundColor: '#F8F9FA',
                        borderRadius: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px 8px',
                        boxSizing: 'border-box',
                        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.18s ease, box-shadow 0.18s ease',
                        border: '1px solid #F1F3F5',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.backgroundColor = '#F0F3F6';
                        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.06)';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#F8F9FA';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = '#F1F3F5';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: item.badge ? 'translateY(-6px)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}>
                        {item.renderIcon()}
                      </div>

                      {/* Arrival ETA Badge (71 mins, 76 mins) matching Screenshot */}
                      {item.badge && (
                        <span style={{
                          position: 'absolute',
                          bottom: 7,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#0F5132',
                          backgroundColor: '#FFFFFF',
                          padding: '1.5px 7px',
                          borderRadius: 999,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.06)',
                          lineHeight: 1.2,
                          letterSpacing: -0.2
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Text Label Below Tile */}
                    <span style={{
                      marginTop: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: '#1F2937',
                      textAlign: 'center',
                      lineHeight: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Informational reassurance banner below tiles */}
              <div style={{
                marginTop: 22,
                padding: '10px 14px',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11.5,
                color: '#475569'
              }}>
                <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Urban Company Guarantee:</strong> 30-day service warranty, verified background-checked pros & upfront transparent pricing.
                </span>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* VIEW 2: CATEGORY PRODUCTS LIST (BASED ON CLICKED NAME)   */
            /* ======================================================== */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {/* Header with Back button and Title */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottom: '1px solid #F1F5F9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    style={{
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: 10,
                      width: 34,
                      height: 34,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#1E293B',
                      transition: 'background 0.15s'
                    }}
                    title="Back to all categories"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                        {currentOption?.name} Services
                      </h3>
                      {currentOption?.badge && (
                        <span style={{
                          background: '#ECFDF5',
                          color: '#065F46',
                          border: '1px solid #A7F3D0',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <Zap size={11} fill="#10B981" color="#10B981" />
                          <span>Arriving in ~{currentOption.badge}</span>
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {filteredProducts.length} verified {currentOption?.name?.toLowerCase()} products available
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Direct on-page navigation link */}
                  {onSelectOption && (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentOption) onSelectOption(currentOption);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6E42E5',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Explore full category on page"
                    >
                      <span>View on Full Page</span>
                      <ExternalLink size={13} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="electrician-modal-close"
                    title="Close"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E5E7EB';
                      e.currentTarget.style.color = '#111827';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <X size={18} strokeWidth={2.4} />
                  </button>
                </div>
              </div>

              {/* Search input & Filter pills bar */}
              <div style={{ paddingTop: 12, paddingBottom: 10 }}>
                {/* Search Box */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 11 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${currentOption?.name?.toLowerCase()} products (e.g. ${selectedCategory === 'electrician' ? 'fan, socket, switch, wire' : selectedCategory === 'plumber' ? 'tap, leak, flush, drain' : 'lock, door, drill, cupboard'})...`}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 34px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      fontSize: 12.5,
                      color: '#0F172A',
                      outline: 'none',
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
                        top: 9,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Subcategory filter pills */}
                {SUB_FILTERS[selectedCategory] && (
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                    {SUB_FILTERS[selectedCategory].map(pill => {
                      const isActive = activeSubFilter === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setActiveSubFilter(pill.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: isActive ? 700 : 500,
                            border: isActive ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                            background: isActive ? '#F5F3FF' : '#FFFFFF',
                            color: isActive ? '#6E42E5' : '#475569',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s'
                          }}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Scrollable Products List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                {filteredProducts.length === 0 ? (
                  <div style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    color: '#64748B',
                    fontSize: 13
                  }}>
                    No products found matching "<strong>{searchQuery}</strong>". Try clearing your search.
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const qtyInCart = cart[product.id]?.qty || 0;
                    return (
                      <div
                        key={product.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 14,
                          border: '1px solid #E2E8F0',
                          background: '#FFFFFF',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                          gap: 14
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Left Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {product.badge && (
                            <span style={{
                              display: 'inline-block',
                              fontSize: 9.5,
                              fontWeight: 800,
                              color: '#6E42E5',
                              background: '#F5F3FF',
                              border: '1px solid #DDD6FE',
                              padding: '2px 6px',
                              borderRadius: 4,
                              marginBottom: 4,
                              letterSpacing: 0.3
                            }}>
                              {product.badge}
                            </span>
                          )}

                          <h4 style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#0F172A',
                            margin: '0 0 4px 0',
                            lineHeight: 1.3
                          }}>
                            {product.title}
                          </h4>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#475569', marginBottom: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#0F172A' }}>
                              <Star size={12} fill="#F59E0B" color="#F59E0B" />
                              <span>{product.rating}</span>
                              <span style={{ color: '#94A3B8', fontWeight: 500 }}>({product.reviewsCount})</span>
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={11} color="#64748B" />
                              <span>{product.duration}</span>
                            </span>
                          </div>

                          <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.35, marginBottom: 6 }}>
                            {product.description}
                          </div>

                          {/* Price Row */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                              ₹{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through' }}>
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Thumbnail & Add to Cart button */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <div style={{
                            width: 84,
                            height: 72,
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: '#F1F5F9',
                            position: 'relative'
                          }}>
                            <img
                              src={product.image}
                              alt={product.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>

                          {/* Interactive Add to Cart Controls */}
                          {qtyInCart > 0 ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#6E42E5',
                              color: '#FFFFFF',
                              borderRadius: 8,
                              padding: '3px 8px',
                              width: 84,
                              boxSizing: 'border-box'
                            }}>
                              <button
                                type="button"
                                onClick={() => onUpdateQty && onUpdateQty(product.id, -1)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: 0
                                }}
                              >
                                <Minus size={13} strokeWidth={2.5} />
                              </button>
                              <span style={{ fontSize: 12, fontWeight: 800 }}>{qtyInCart}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty && onUpdateQty(product.id, 1)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: 0
                                }}
                              >
                                <Plus size={13} strokeWidth={2.5} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAddToCart && onAddToCart(product)}
                              style={{
                                width: 84,
                                padding: '5px 0',
                                background: '#FFFFFF',
                                color: '#6E42E5',
                                border: '1.5px solid #6E42E5',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                textAlign: 'center'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#6E42E5';
                                e.currentTarget.style.color = '#FFFFFF';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#FFFFFF';
                                e.currentTarget.style.color = '#6E42E5';
                              }}
                            >
                              Add +
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Floating Bottom Cart Bar */}
              {cartItemsCount > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.35)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShoppingBag size={15} color="#A78BFA" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'} in cart
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        Total: ₹{cartTotalAmount}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenCart) onOpenCart();
                    }}
                    style={{
                      background: '#6E42E5',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>View Cart</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
