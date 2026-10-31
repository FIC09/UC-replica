import React, { useState, useMemo, useEffect } from 'react';
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
  Zap, 
  X,
  ChevronRight,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  Award
} from 'lucide-react';

export function QuickRepairsServicePage({
  onBackHome,
  initialTrade = 'electrician', // 'electrician' | 'plumber' | 'carpenter'
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
  const [activeTrade, setActiveTrade] = useState(initialTrade); // 'electrician' | 'plumber' | 'carpenter'
  const [activeSection, setActiveSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);

  useEffect(() => {
    if (initialTrade) {
      setActiveTrade(initialTrade);
      setActiveSection('all');
    }
  }, [initialTrade]);

  // Complete, rich EPC product catalogue
  const CATALOGUE = useMemo(() => ({
    electrician: {
      tradeName: 'Electrician',
      headline: 'Certified Electrician Services',
      subhead: 'Arriving in ~71 mins • 30-Day Service Warranty • Background Verified',
      etaBadge: '71 mins',
      rating: '4.82',
      reviews: '850K reviews',
      sections: [
        { id: 'all', title: 'All Services' },
        { id: 'fans', title: 'Ceiling & Exhaust Fans' },
        { id: 'switches', title: 'Switchboards & Sockets' },
        { id: 'lighting', title: 'Lights, Bulbs & Tubelights' },
        { id: 'wiring', title: 'Wiring, MCB & Fuse' },
        { id: 'inverter', title: 'Inverter & Battery' }
      ],
      products: [
        {
          id: 'fan-install-repair',
          sectionId: 'fans',
          title: 'Ceiling Fan Installation / Replacement',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.85',
          reviewsCount: '315K reviews',
          price: 149,
          originalPrice: 249,
          duration: '25 mins',
          badge: 'INSTANT SERVICE',
          tag: 'Verified Electrician',
          image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
          description: 'Safe ceiling fan assembly, hook mounting, capacitor check, and blade balancing with zero wobble.',
          inclusions: [
            'Dismantling old fan if replacement needed',
            'Blade balancing and silent rotation check',
            'Regulator switch speed test',
            'Insulation tape and safety bolt tightening'
          ],
          exclusions: ['New fan unit or additional hook anchor fabrication']
        },
        {
          id: 'fan-repair',
          sectionId: 'fans',
          title: 'Ceiling & Exhaust Fan Repair',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.80',
          reviewsCount: '142K reviews',
          price: 149,
          originalPrice: 229,
          duration: '30 mins',
          badge: 'QUICK FIX',
          tag: 'Verified Electrician',
          image: '/images/fan_repair.jpg',
          description: 'Diagnose noise, slow speeds, coil heating, or replace faulty capacitor with genuine parts.',
          inclusions: [
            'Capacitor check & replacement',
            'Bearing oiling & noise reduction',
            'Blade realignment'
          ],
          exclusions: ['Motor rewinding if coil burnt out']
        },
        {
          id: 'switchboard-repair',
          sectionId: 'switches',
          title: 'Switchboard Repair & Socket Replacement',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.80',
          reviewsCount: '194K reviews',
          price: 99,
          originalPrice: 199,
          duration: '20 mins',
          badge: 'SUPER SAVER',
          tag: 'Safety Tested',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          description: 'Fix sparking switches, burnt sockets, loose wiring, or install new modular switch plates.',
          inclusions: [
            'Multi-meter circuit continuity test',
            'Safe wire crimping and earthing check',
            'Replacement of damaged switch/socket unit'
          ],
          exclusions: ['Cost of new modular switches if needed']
        },
        {
          id: 'tubelight-install',
          sectionId: 'lighting',
          title: 'Tubelight & Batten LED Installation',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.86',
          reviewsCount: '98K reviews',
          price: 119,
          originalPrice: 199,
          duration: '20 mins',
          badge: 'SAME DAY',
          tag: 'Verified Electrician',
          image: '/images/tubelight.jpg',
          description: 'Safe mounting and wiring of LED batten lights, conventional tubelights, and chokes.',
          inclusions: [
            'Wall clip drilling & mounting',
            'Safe wiring connection with wire caps',
            'Illumination & choke test'
          ],
          exclusions: ['Cost of LED tubelight unit']
        },
        {
          id: 'bulb-installation',
          sectionId: 'lighting',
          title: 'Bulb & Spot Light Installation',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.84',
          reviewsCount: '87K reviews',
          price: 49,
          originalPrice: 99,
          duration: '15 mins',
          badge: 'SUPER SAVER',
          tag: 'Safety Tested',
          image: '/images/bulb_install.jpg',
          description: 'Quick installation or replacement of ceiling bulbs, track lights, and spotlight fixtures.',
          inclusions: ['Holder connection', 'Safe ladder assistance', 'Illumination check'],
          exclusions: ['Cost of bulb']
        },
        {
          id: 'internal-wiring',
          sectionId: 'wiring',
          title: 'New Internal Wiring & Safety Earthing Check',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.73',
          reviewsCount: '45K reviews',
          price: 199,
          originalPrice: 299,
          duration: '45 mins',
          badge: 'FIRE SAFE',
          tag: 'Certified Wireman',
          image: '/images/internal_wiring.jpg',
          description: 'FR/FRLS insulated wire pulling through PVC conduits, junction boxes, and distribution panels.',
          inclusions: [
            'Conduit wire pulling (up to 5m)',
            'Crimping & terminal insulation',
            'Continuity & earthing testing'
          ],
          exclusions: ['Wall groove cutting / channelling if needed']
        },
        {
          id: 'mcb-fuse-repair',
          sectionId: 'wiring',
          title: 'MCB Fuse Replacement & Tripping Fix',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.88',
          reviewsCount: '68K reviews',
          price: 149,
          originalPrice: 249,
          duration: '30 mins',
          badge: 'SAFETY CERTIFIED',
          tag: 'Certified Wireman',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          description: 'Fix frequent MCB tripping, replace burnt circuit breakers, and balance household phase load.',
          inclusions: ['Single/Double pole MCB swap', 'Terminal torque tightening', 'Short circuit load testing'],
          exclusions: ['Cost of new MCB unit']
        },
        {
          id: 'inverter-service',
          sectionId: 'inverter',
          title: 'Inverter & Battery Terminal Servicing',
          category: 'quick-repairs',
          subcategory: 'Electrician',
          rating: '4.82',
          reviewsCount: '54K reviews',
          price: 249,
          originalPrice: 399,
          duration: '35 mins',
          badge: 'BACKUP POWER',
          tag: 'Power Specialist',
          image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
          description: 'Complete home inverter checkup, battery distilled water top-up, lead terminal desulfation, and voltage regulation.',
          inclusions: ['Acid terminal cleaning & jelly coat', 'Distilled water top-up (up to 6 cells)', 'Backup output voltage check'],
          exclusions: ['Cost of distilled water if not supplied by customer', 'Battery replacement']
        }
      ]
    },
    plumber: {
      tradeName: 'Plumber',
      headline: 'Master Plumber Services',
      subhead: 'Leak Proof Guarantee • Transparent Pricing • Certified Master Plumbers',
      etaBadge: 'Same Day',
      rating: '4.79',
      reviews: '620K reviews',
      sections: [
        { id: 'all', title: 'All Services' },
        { id: 'taps', title: 'Taps & Mixers' },
        { id: 'toilet', title: 'Toilet & Flush Tank' },
        { id: 'blockage', title: 'Drain Blockage Removal' },
        { id: 'basin', title: 'Basin & Waste Pipes' },
        { id: 'tank', title: 'Water Tank Cleaning' }
      ],
      products: [
        {
          id: 'tap-repair-replacement',
          sectionId: 'taps',
          title: 'Water Tap Repair & Mixer Leak Fix',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.83',
          reviewsCount: '240K reviews',
          price: 149,
          originalPrice: 249,
          duration: '30 mins',
          badge: 'LEAK PROOF',
          tag: 'Experienced Plumber',
          image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
          description: 'Stop dripping faucets, replace faulty ceramic cartridges, Teflon sealing, and pressure adjustments.',
          inclusions: [
            'Washer or ceramic spindle replacement',
            'Teflon tape re-threading to stop wall seepage',
            'Aerator descaling to restore water flow'
          ],
          exclusions: ['Cost of new brass tap/mixer unit']
        },
        {
          id: 'flush-tank-repair',
          sectionId: 'toilet',
          title: 'Toilet Flush Tank Repair & Ball Valve Fix',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.75',
          reviewsCount: '112K reviews',
          price: 149,
          originalPrice: 249,
          duration: '30 mins',
          badge: 'NO OVERFLOW',
          tag: 'Master Plumber',
          image: '/images/flush_tank.jpg',
          description: 'Stop continuous water running, fix push button, float valve, syphon kit, or inlet valve leakage.',
          inclusions: [
            'Syphon mechanism adjustment',
            'Ball valve float calibration',
            'Washer leak check'
          ],
          exclusions: ['Cost of new internal syphon kit if cracked']
        },
        {
          id: 'drain-blockage',
          sectionId: 'blockage',
          title: 'Drain & Basin Blockage Removal',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.77',
          reviewsCount: '168K reviews',
          price: 199,
          originalPrice: 349,
          duration: '35 mins',
          badge: 'RAPID CLEAR',
          tag: 'Specialist Tools',
          image: '/images/drain_blockage.jpg',
          description: 'Heavy duty auger snake clearing for clogged kitchen sinks, wash basins, or bathroom floor traps.',
          inclusions: [
            'Mechanical auger clearing',
            'P-trap dismantling & sludge cleanout',
            'High-flow drain test'
          ],
          exclusions: ['Main sewer line blockage outside home premises']
        },
        {
          id: 'wash-basin-leakage',
          sectionId: 'basin',
          title: 'Wash Basin Leakage & Waste Pipe Repair',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.78',
          reviewsCount: '92K reviews',
          price: 129,
          originalPrice: 219,
          duration: '25 mins',
          badge: 'ZERO LEAK',
          tag: 'Master Plumber',
          image: '/images/wash_basin.jpg',
          description: 'Fix dripping bottle traps, replace broken corrugated waste pipes, and reseal silicone edges.',
          inclusions: [
            'Waste coupling tightening',
            'Teflon threading & silicone sealing',
            'Water flow test'
          ],
          exclusions: ['Cost of replacement ceramic basin']
        },
        {
          id: 'connection-hose',
          sectionId: 'basin',
          title: 'Connection Hose & Angle Valve Replacement',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.78',
          reviewsCount: '76K reviews',
          price: 129,
          originalPrice: 199,
          duration: '20 mins',
          badge: 'HIGH PRESSURE',
          tag: 'Certified Plumber',
          image: '/images/connection_hose.jpg',
          description: 'Install stainless steel braided connection pipe for geysers, toilet health faucets, or basins.',
          inclusions: ['Thread sealing with premium Teflon', 'Pressure seal testing', 'Old hose removal'],
          exclusions: ['Cost of new SS braided hose or angle valve']
        },
        {
          id: 'shower-install-repair',
          sectionId: 'taps',
          title: 'Shower Head Installation & Descaling',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.81',
          reviewsCount: '83K reviews',
          price: 119,
          originalPrice: 199,
          duration: '25 mins',
          badge: 'HIGH FLOW',
          tag: 'Certified Plumber',
          image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
          description: 'Install new rainfall or handheld shower head, fix loose shower arms, and descale clogged nozzles for maximum spray.',
          inclusions: ['Shower arm mounting and Teflon thread seal', 'Silicone ring replacement', 'Water spray balance test'],
          exclusions: ['Cost of new shower head unit']
        },
        {
          id: 'water-tank-cleaning',
          sectionId: 'tank',
          title: 'Overhead Water Tank Deep Cleaning (up to 1000L)',
          category: 'quick-repairs',
          subcategory: 'Plumber',
          rating: '4.89',
          reviewsCount: '47K reviews',
          price: 699,
          originalPrice: 999,
          duration: '60 mins',
          badge: 'GERM FREE',
          tag: 'Hygienic Pro',
          image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
          description: '6-stage deep cleaning of rooftop plastic or concrete water tank: sludge de-watering, high-pressure jetting, vacuuming, and UV antibacterial treatment.',
          inclusions: ['Sludge & sediment pump evacuation', 'Anti-algae scrubbing', 'UV lamp disinfection scan'],
          exclusions: ['Water distribution pipe flushing inside flat walls']
        }
      ]
    },
    carpenter: {
      tradeName: 'Carpenter',
      headline: 'Master Carpenter Services',
      subhead: 'Arriving in ~76 mins • Precision Tools • Flawless Woodwork & Fittings',
      etaBadge: '76 mins',
      rating: '4.83',
      reviews: '490K reviews',
      sections: [
        { id: 'all', title: 'All Services' },
        { id: 'locks', title: 'Door Locks & Latches' },
        { id: 'doors', title: 'Wooden Door Repairs' },
        { id: 'cupboards', title: 'Cupboards & Drawers' },
        { id: 'drill', title: 'Drill & Wall Hanging' },
        { id: 'furniture', title: 'Furniture Assembly' }
      ],
      products: [
        {
          id: 'door-lock-repair',
          sectionId: 'locks',
          title: 'Door Lock Repair & Mortise Lock Installation',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.79',
          reviewsCount: '110K reviews',
          price: 149,
          originalPrice: 249,
          duration: '30 mins',
          badge: 'SECURITY SAFE',
          tag: 'Master Carpenter',
          image: '/images/door_lock_mortise.jpg',
          description: 'Fix stuck door latches, install new high-security mortise locks, cylinder barrels, or magnetic catches.',
          inclusions: ['Mortise slot chiseling/adjustment', 'Strike plate realignment', 'Smooth key turn lubrication test'],
          exclusions: ['Cost of new mortise lock / cylinder unit']
        },
        {
          id: 'door-repair',
          sectionId: 'doors',
          title: 'Door Repair, Trimming & Hinge Alignment',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.78',
          reviewsCount: '95K reviews',
          price: 199,
          originalPrice: 329,
          duration: '40 mins',
          badge: 'NO SQUEAK',
          tag: 'Master Carpenter',
          image: '/images/door_repair_wood.jpg',
          description: 'Planing swollen wooden doors rubbing against the floor, tightening loose hinges, and eliminating creaking noises.',
          inclusions: ['Bottom door edge planing (up to 5mm)', 'Hinge realignment and screw anchoring', 'Closing clearance check'],
          exclusions: ['Replacing warped solid wood door frame']
        },
        {
          id: 'cupboard-repair',
          sectionId: 'cupboards',
          title: 'Cupboard & Drawer Repair (Hydraulic Hinges)',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.80',
          reviewsCount: '84K reviews',
          price: 89,
          originalPrice: 159,
          duration: '20 mins',
          badge: 'SMOOTH SLIDE',
          tag: 'Furniture Pro',
          image: '/images/cupboard_drawer_table.jpg',
          description: 'Repair misaligned wardrobe shutters, replace loose soft-close hydraulic hinges, and fix stuck drawer sliders.',
          inclusions: ['Telescopic channel realignment', 'Hydraulic auto-hinge tightening', 'Magnetic catch adjustment'],
          exclusions: ['Cost of replacement telescopic channels or soft-close hinges']
        },
        {
          id: 'drill-and-hang',
          sectionId: 'drill',
          title: 'Drill & Hang (Curtain Rods, Mirrors, Art & Frames)',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.87',
          reviewsCount: '180K reviews',
          price: 199,
          originalPrice: 299,
          duration: '30 mins',
          badge: 'LASER LEVEL',
          tag: 'Precision Level',
          image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
          description: 'Clean wall drilling with spirit level alignment for up to 3 items. Zero dust with vacuum drill collar.',
          inclusions: [
            'Drilling on concrete, brick, or tile walls',
            'High-grade nylon wall plugs and heavy-duty screws included',
            'Level alignment with laser spirit level tool'
          ],
          exclusions: ['Mounting hardware brackets if not supplied with TV']
        },
        {
          id: 'shelf-installation',
          sectionId: 'drill',
          title: 'Floating Shelf & Cabinet Installation',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.81',
          reviewsCount: '64K reviews',
          price: 99,
          originalPrice: 189,
          duration: '25 mins',
          badge: 'LEVEL CHECKED',
          tag: 'Master Carpenter',
          image: '/images/shelf_install.jpg',
          description: 'Precision bracket mounting for floating shelves, bathroom mirrors, kitchen racks, and key holders.',
          inclusions: ['Laser spirit level measurement', 'Anchor bolt insertion', 'Load bearing test'],
          exclusions: ['Cost of shelf unit']
        },
        {
          id: 'decor-installation',
          sectionId: 'drill',
          title: 'Wall Decor & Hanging Frame Installation',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.84',
          reviewsCount: '52K reviews',
          price: 99,
          originalPrice: 169,
          duration: '20 mins',
          badge: 'ZERO DAMAGE',
          tag: 'Master Carpenter',
          image: '/images/decor_abstract_frame.jpg',
          description: 'Safe and damage-free hanging of abstract canvas art, family photo collages, metal wall sculptures, and wall clocks.',
          inclusions: ['Precision drill & heavy duty picture hook fitting', 'Spirit level horizontal alignment', 'Clean dust sweep'],
          exclusions: ['Cost of custom picture frames']
        },
        {
          id: 'furniture-assembly',
          sectionId: 'furniture',
          title: 'Bed, Table & Wardrobe Furniture Assembly',
          category: 'quick-repairs',
          subcategory: 'Carpenter',
          rating: '4.90',
          reviewsCount: '73K reviews',
          price: 349,
          originalPrice: 599,
          duration: '60 mins',
          badge: 'FLATPACK PRO',
          tag: 'Master Carpenter',
          image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
          description: 'Expert assembly of flat-pack furniture (IKEA, Pepperfry, Urban Ladder) including beds, computer desks, dining tables, and wardrobes.',
          inclusions: ['Cam-lock and wooden dowel assembly', 'Drawer and hinge alignment', 'Weight stability and wobble test'],
          exclusions: ['Wall anchoring for tall wardrobes (charged as add-on)']
        }
      ]
    }
  }), []);

  const currentTradeData = CATALOGUE[activeTrade] || CATALOGUE.electrician;

  // Filter products by section and search query
  const displayedProducts = currentTradeData.products.filter(p => {
    if (activeSection !== 'all' && p.sectionId !== activeSection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return p.title.toLowerCase().includes(q) || 
             p.description.toLowerCase().includes(q) ||
             (p.inclusions && p.inclusions.some(inc => inc.toLowerCase().includes(q)));
    }
    return true;
  });

  // Calculate cart count & amount
  const cartItemsCount = Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  const cartTotalAmount = Object.values(cart).reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);

  return (
    <div className="quick-repairs-page-wrapper" style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 100 }}>
      {/* ======================================================== */}
      {/* 1. TOP STICKY NAVIGATION BAR                              */}
      {/* ======================================================== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                <span onClick={onBackHome} style={{ cursor: 'pointer' }}>Home</span>
                <span>/</span>
                <span style={{ color: '#0F172A' }}>Quick Repairs</span>
              </div>
              <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A', letterSpacing: '-0.3px' }}>
                Electrician, Plumber &amp; Carpenter
              </h1>
            </div>
          </div>

          {/* Location Selector */}
          <div 
            onClick={onOpenLocationModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 999,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: '#0F172A'
            }}
          >
            <MapPin size={14} color="#6E42E5" />
            <span>{selectedLocality}, {selectedCity}</span>
          </div>

          {/* Cart Circle Button */}
          <button
            type="button"
            onClick={onOpenCart}
            style={{
              position: 'relative',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A'
            }}
            title="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#6E42E5',
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: 800,
                width: 18,
                height: 18,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. THREE-TRADE MASTER SWITCHER HEADER                     */}
      {/* ======================================================== */}
      <section style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        borderBottom: '1px solid #E2E8F0',
        padding: '24px 20px 20px'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Main 3 Tabs: Electrician | Plumber | Carpenter */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 20
          }}>
            {[
              {
                id: 'electrician',
                name: 'Electrician',
                eta: '71 mins',
                icon: Zap,
                color: '#6E42E5',
                desc: 'Fans, lights, switches & wiring'
              },
              {
                id: 'plumber',
                name: 'Plumber',
                eta: 'Leak Proof',
                icon: Wrench,
                color: '#0284C7',
                desc: 'Taps, blockages, flush & pipes'
              },
              {
                id: 'carpenter',
                name: 'Carpenter',
                eta: '76 mins',
                icon: Award,
                color: '#D97706',
                desc: 'Locks, doors, cupboards & assembly'
              }
            ].map(tab => {
              const isActive = activeTrade === tab.id;
              const Icon = tab.icon;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    setActiveTrade(tab.id);
                    setActiveSection('all');
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    border: isActive ? `2px solid ${tab.color}` : '1.5px solid #E2E8F0',
                    background: isActive ? '#FFFFFF' : '#F8FAFC',
                    boxShadow: isActive ? '0 10px 25px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: isActive ? `${tab.color}15` : '#FFFFFF',
                      border: `1px solid ${isActive ? tab.color : '#E2E8F0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: tab.color,
                      flexShrink: 0
                    }}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{tab.name}</span>
                        {isActive && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: tab.color,
                            color: '#FFFFFF'
                          }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {tab.desc}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#065F46',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '3px 8px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap'
                  }}>
                    {tab.eta}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Trade Headline & Search Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.4px' }}>
                {currentTradeData.headline}
              </h2>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#0F172A' }}>
                  <Star size={13} fill="#F59E0B" color="#F59E0B" />
                  <span>{currentTradeData.rating}</span>
                </span>
                <span>•</span>
                <span>{currentTradeData.reviews}</span>
                <span>•</span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>{currentTradeData.subhead}</span>
              </div>
            </div>

            {/* Live Search Box */}
            <div style={{ position: 'relative', width: 340, maxWidth: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentTradeData.tradeName} services...`}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 12,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 13,
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
                    right: 12,
                    top: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8'
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. MAIN CATALOGUE: SIDEBAR + PRODUCT CARDS               */}
      {/* ======================================================== */}
      <div style={{
        maxWidth: 1280,
        margin: '24px auto 0',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 28,
        alignItems: 'start'
      }}>
        {/* Left Sticky Subcategory Navigation Sidebar */}
        <aside style={{
          position: 'sticky',
          top: 80,
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          padding: '14px 12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            padding: '4px 12px 10px',
            borderBottom: '1px solid #F1F5F9',
            marginBottom: 6
          }}>
            Filter by Category
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {currentTradeData.sections.map(sec => {
              const isSecActive = activeSection === sec.id;
              const count = sec.id === 'all' 
                ? currentTradeData.products.length 
                : currentTradeData.products.filter(p => p.sectionId === sec.id).length;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: isSecActive ? '#6E42E5' : 'transparent',
                    color: isSecActive ? '#FFFFFF' : '#334155',
                    fontSize: 13,
                    fontWeight: isSecActive ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    if (!isSecActive) e.currentTarget.style.background = '#F8FAFC';
                  }}
                  onMouseLeave={e => {
                    if (!isSecActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{sec.title}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background: isSecActive ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                    color: isSecActive ? '#FFFFFF' : '#64748B',
                    padding: '2px 7px',
                    borderRadius: 999
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* UC Trust Box */}
          <div style={{
            marginTop: 18,
            padding: '12px',
            background: '#F5F3FF',
            borderRadius: 12,
            border: '1px solid #DDD6FE'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#6E42E5', marginBottom: 4 }}>
              <ShieldCheck size={16} />
              <span>UC 30-Day Guarantee</span>
            </div>
            <div style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.35 }}>
              Free rework or full refund if you face any issues within 30 days of service.
            </div>
          </div>
        </aside>

        {/* Right Product Catalogue Grid */}
        <main>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {activeSection === 'all' 
                ? `All ${currentTradeData.tradeName} Services` 
                : currentTradeData.sections.find(s => s.id === activeSection)?.title}
              <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B', marginLeft: 8 }}>
                ({displayedProducts.length} items)
              </span>
            </h3>
          </div>

          {displayedProducts.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '48px 24px',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
              color: '#64748B'
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                No services match your search
              </p>
              <p style={{ fontSize: 13, margin: '0 0 16px' }}>
                Try searching for something else or clear the search filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveSection('all');
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  background: '#6E42E5',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {displayedProducts.map(product => {
                const qtyInCart = cart[product.id]?.qty || 0;

                return (
                  <div
                    key={product.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 18,
                      border: '1px solid #E2E8F0',
                      padding: '20px 22px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 24,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#CBD5E1';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
                    }}
                  >
                    {/* Left Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {product.badge && (
                        <span style={{
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#6E42E5',
                          background: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          padding: '3px 8px',
                          borderRadius: 6,
                          marginBottom: 8,
                          letterSpacing: 0.4
                        }}>
                          {product.badge}
                        </span>
                      )}

                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#0F172A',
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.2px'
                      }}>
                        {product.title}
                      </h4>

                      {/* Ratings & Duration */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 12,
                        color: '#475569',
                        marginBottom: 10
                      }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontWeight: 700,
                          color: '#0F172A'
                        }}>
                          <Star size={13} fill="#F59E0B" color="#F59E0B" />
                          <span>{product.rating}</span>
                          <span style={{ color: '#94A3B8', fontWeight: 500 }}>({product.reviewsCount})</span>
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color="#64748B" />
                          <span>{product.duration}</span>
                        </span>
                      </div>

                      {/* Price Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 8,
                        marginBottom: 12
                      }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                          ₹{product.price}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span style={{ fontSize: 13, color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p style={{
                        fontSize: 13,
                        color: '#475569',
                        margin: '0 0 12px 0',
                        lineHeight: 1.45
                      }}>
                        {product.description}
                      </p>

                      {/* Inclusions Bullets */}
                      {product.inclusions && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 5,
                          marginBottom: 12
                        }}>
                          {product.inclusions.slice(0, 3).map((inc, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#4B5563' }}>
                              <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }} />
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* View details button */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailProduct(product)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E42E5',
                          fontSize: 12.5,
                          fontWeight: 700,
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>View complete details</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    {/* Right Image & Add to Cart Controls */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                      width: 130,
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: 130,
                        height: 105,
                        borderRadius: 14,
                        overflow: 'hidden',
                        background: '#F1F5F9',
                        position: 'relative'
                      }}>
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Add button or Counter Stepper */}
                      {qtyInCart > 0 ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#6E42E5',
                          color: '#FFFFFF',
                          borderRadius: 10,
                          padding: '6px 14px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(product.id, -1);
                              showToast(`Removed 1 "${product.title}"`);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Minus size={15} strokeWidth={2.5} />
                          </button>
                          <span style={{ fontSize: 14, fontWeight: 800 }}>{qtyInCart}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQty(product.id, 1);
                              showToast(`Added 1 "${product.title}"`);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#FFFFFF',
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Plus size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(product);
                            showToast(`🛒 Added "${product.title}" to cart`);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 0',
                            borderRadius: 10,
                            background: '#FFFFFF',
                            color: '#6E42E5',
                            border: '1.5px solid #6E42E5',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s'
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
              })}
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 4. PRODUCT DETAILS POPUP MODAL                            */}
      {/* ======================================================== */}
      {selectedDetailProduct && (
        <div 
          onClick={() => setSelectedDetailProduct(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              maxWidth: 520,
              width: '100%',
              padding: '24px 26px',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedDetailProduct(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                overflow: 'hidden',
                background: '#F1F5F9',
                flexShrink: 0
              }}>
                <img src={selectedDetailProduct.image} alt={selectedDetailProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#0F172A' }}>
                  {selectedDetailProduct.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>★ {selectedDetailProduct.rating}</span>
                  <span>•</span>
                  <span>{selectedDetailProduct.duration}</span>
                  <span>•</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>₹{selectedDetailProduct.price}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
              {selectedDetailProduct.description}
            </p>

            {/* Inclusions */}
            {selectedDetailProduct.inclusions && (
              <div style={{ marginBottom: 16 }}>
                <h5 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#065F46', margin: '0 0 8px', letterSpacing: 0.5 }}>
                  ✓ What is Included
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailProduct.inclusions.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#334155' }}>
                      <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusions */}
            {selectedDetailProduct.exclusions && (
              <div style={{ marginBottom: 20 }}>
                <h5 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#991B1B', margin: '0 0 8px', letterSpacing: 0.5 }}>
                  ✕ What is NOT Included
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedDetailProduct.exclusions.map((exc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: '#64748B' }}>
                      <X size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Add to Cart Button */}
            <button
              type="button"
              onClick={() => {
                onAddToCart(selectedDetailProduct);
                setSelectedDetailProduct(null);
                showToast(`🛒 Added "${selectedDetailProduct.title}" to cart`);
              }}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 12,
                background: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Add to Cart • ₹{selectedDetailProduct.price}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. STICKY BOTTOM CHECKOUT STRIP                           */}
      {/* ======================================================== */}
      {cartItemsCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#0F172A',
          color: '#FFFFFF',
          borderRadius: 16,
          padding: '12px 20px',
          boxShadow: '0 12px 35px rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          width: '90%',
          maxWidth: 720
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={18} color="#A78BFA" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                {cartItemsCount} {cartItemsCount === 1 ? 'service' : 'services'} added • ₹{cartTotalAmount}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>
                Extra ₹50 coupon discount applied at checkout
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onOpenCart}
              style={{
                background: '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Cart
            </button>
            <button
              type="button"
              onClick={onOpenCheckout}
              style={{
                background: '#6E42E5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '8px 18px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Book Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
