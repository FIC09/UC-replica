import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  HeroSection 
} from './components/HeroSection';
import { 
  PromoCarousel 
} from './components/PromoCarousel';
import { 
  ServiceDetailModal 
} from './components/ServiceDetailModal';
import { 
  NativeSpotlightSection 
} from './components/NativeSpotlightSection';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  OrderTrackingModal 
} from './components/OrderTrackingModal';
import { 
  CityLocalityModal 
} from './components/CityLocalityModal';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  MyBookingsModal 
} from './components/MyBookingsModal';
import { 
  AddressManagerModal 
} from './components/AddressManagerModal';
import { 
  AdminServicesModal 
} from './components/AdminServicesModal';
import { 
  AdminDashboardModal 
} from './components/AdminDashboardModal';
import { 
  AdminLoginModal 
} from './components/AdminLoginModal';
import { 
  PartnerDashboardModal 
} from './components/PartnerDashboardModal';
import { 
  PartnerOnboardingModal 
} from './components/PartnerOnboardingModal';
import { 
  WorkerOnboardingModal 
} from './components/WorkerOnboardingModal';
import { 
  OnboardingShowcaseSection 
} from './components/OnboardingShowcaseSection';
import { 
  UCPlusSection 
} from './components/UCPlusSection';
import { 
  UCPromiseSection 
} from './components/UCPromiseSection';
import { 
  CustomerReviewsSection 
} from './components/CustomerReviewsSection';
import { 
  FAQSection 
} from './components/FAQSection';
import { 
  Footer 
} from './components/Footer';
import { 
  HomesSections 
} from './components/HomesSections';
import { 
  ApplianceRepairModal 
} from './components/ApplianceRepairModal';
import { 
  BathroomKitchenCleaningModal 
} from './components/BathroomKitchenCleaningModal';
import { 
  ElectricianPlumberCarpenterModal 
} from './components/ElectricianPlumberCarpenterModal';
import { 
  FullHomeCleaningModal 
} from './components/FullHomeCleaningModal';
import { 
  ACServicePage 
} from './components/ACServicePage';
import { 
  ChimneyServicePage 
} from './components/ChimneyServicePage';
import { 
  GeyserServicePage 
} from './components/GeyserServicePage';
import { 
  LaptopServicePage 
} from './components/LaptopServicePage';
import { 
  RefrigeratorServicePage 
} from './components/RefrigeratorServicePage';
import { 
  WashingMachineServicePage 
} from './components/WashingMachineServicePage';
import { 
  MicrowaveServicePage 
} from './components/MicrowaveServicePage';
import { 
  TelevisionServicePage 
} from './components/TelevisionServicePage';
import { 
  WaterPurifierServicePage 
} from './components/WaterPurifierServicePage';
import { 
  NativeWaterPurifierPage 
} from './components/NativeWaterPurifierPage';
import { 
  NativeSmartLocksPage 
} from './components/NativeSmartLocksPage';
import { 
  QuickRepairsServicePage 
} from './components/QuickRepairsServicePage';
import { 
  ElectricianServicePage 
} from './components/ElectricianServicePage';
import { 
  PlumberServicePage 
} from './components/PlumberServicePage';
import { 
  CarpenterServicePage 
} from './components/CarpenterServicePage';
import { 
  BathroomCleaningServicePage 
} from './components/BathroomCleaningServicePage';
import { 
  KitchenCleaningServicePage 
} from './components/KitchenCleaningServicePage';
import { 
  FullHomeCleaningServicePage 
} from './components/FullHomeCleaningServicePage';
import { 
  CockroachControlServicePage 
} from './components/CockroachControlServicePage';
import { 
  UrbanCheckoutPage 
} from './components/UrbanCheckoutPage';
import { 
  SalonPrimeServicePage 
} from './components/SalonPrimeServicePage';
import { 
  HairStudioWomenServicePage 
} from './components/HairStudioWomenServicePage';
import { 
  SelectMenSalonPreferenceModal 
} from './components/SelectMenSalonPreferenceModal';
import { 
  SalonRoyaleServicePage 
} from './components/SalonRoyaleServicePage';
import { 
  SalonMenPrimeServicePage 
} from './components/SalonMenPrimeServicePage';

import { 
  CATEGORIES, 
  PROMO_BANNERS, 
  SERVICES as INITIAL_SERVICES 
} from './data/servicesData';
import { ShoppingBag, ArrowRight, Sparkles, CheckCircle2, Plus, Wrench, RotateCcw } from 'lucide-react';
import { StickyCategoryNav } from './components/StickyCategoryNav';
import { ServiceCard } from './components/ServiceCard';

function App() {
  // Location State (persisted to localStorage)
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_selected_city');
      if (saved && !saved.includes('Mumbai')) return saved;
      return 'Krishnagiri';
    } catch {
      return 'Krishnagiri';
    }
  });
  const [selectedLocality, setSelectedLocality] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_selected_locality');
      if (saved && !saved.includes('Bandra')) return saved;
      return 'Rayakottai Road';
    } catch {
      return 'Rayakottai Road';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_selected_city', selectedCity);
      localStorage.setItem('uc_selected_locality', selectedLocality);
    } catch {}
  }, [selectedCity, selectedLocality]);

  // Category Filtering
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  // Dedicated View Routing: 'home' | 'ac-service-page'
  const [currentView, setCurrentView] = useState('home');
  const [quickRepairsTrade, setQuickRepairsTrade] = useState('electrician');

  // Top Header Navigation Tabs: 'homes' | 'native' | 'beauty'
  const [activeNavTab, setActiveNavTab] = useState('homes');

  function handleSelectNavTab(tab) {
    setActiveNavTab(tab);
    setActiveSubcategory(null);
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCategorySelection(catId) {
    setActiveCategory(catId);
    setActiveSubcategory(null);
    if (catId === 'ac-appliances' || catId === 'ac-repair') {
      setIsApplianceModalOpen(true);
      return;
    }
    if (catId === 'quick-repairs') {
      handleOpenElectricianTrade('electrician');
      return;
    }
    if (catId === 'cleaning-pest') {
      setIsCleaningModalOpen(true);
      return;
    }
    if (catId === 'cleaning-home') {
      setIsFullCleaningModalOpen(true);
      return;
    }
    if (catId === 'native-smart-locks') {
      setCurrentView('native-smart-locks-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (catId === 'native-ro' || catId === 'water-purifier') {
      setCurrentView('native-purifier-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (catId === 'womens-salon' || catId === 'salon-prime') {
      setCurrentView('salon-prime-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (catId === 'mens-salon') {
      setIsMenSalonPreferenceOpen(true);
      return;
    }
    setActiveNavTab('homes');
  }

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState('');

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  }

  // ==========================================
  // 1. SERVICES CATALOGUE CRUD STATE
  // ==========================================
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map(s => s.id));
        const missingInitial = INITIAL_SERVICES.filter(s => !existingIds.has(s.id));
        const combined = missingInitial.length > 0 ? [...parsed, ...missingInitial] : parsed;
        return combined.map(s => {
          let updated = { ...s };
          if (updated.image && updated.image.includes('1548839140')) {
            updated.image = '/images/native_purifier.jpg';
          }
          if (updated.title && /spa/i.test(updated.title)) {
            updated.title = updated.title.replace(/Hair Spa/gi, 'Hair Care').replace(/\s*&\s*Spa/gi, '').replace(/Spa/gi, 'Care');
          }
          if (updated.badge && /spa/i.test(updated.badge)) {
            updated.badge = updated.badge.replace(/SPA LUXURY/gi, 'LUXURY CARE').replace(/SPA/gi, 'LUXURY');
          }
          if (updated.description && /spa/i.test(updated.description)) {
            updated.description = updated.description.replace(/spa/gi, 'salon');
          }
          if (updated.title && /massage/i.test(updated.title)) {
            updated.title = updated.title.replace(/Deep Tissue Stress Relief Massage/gi, 'Scalp & Neck Tension Relief Therapy').replace(/massage/gi, 'Therapy & Care');
          }
          if (updated.subcategory && /massage/i.test(updated.subcategory)) {
            updated.subcategory = updated.subcategory.replace(/massage therapy/gi, 'Head & Scalp Care').replace(/massage/gi, 'Care');
          }
          if (updated.description && /massage/i.test(updated.description)) {
            updated.description = updated.description.replace(/massage/gi, 'therapy');
          }
          if (updated.id === 'drill-and-hang' || (updated.subcategory && updated.subcategory.includes('Carpenter'))) {
            updated.subcategory = 'Carpenter';
          }
          return updated;
        });
      }
      return INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_services', JSON.stringify(services));
    } catch {}
  }, [services]);

  function handleAddService(newSvc) {
    setServices(prev => [newSvc, ...prev]);
    showToast(`✅ Created new service: "${newSvc.title}"`);
  }

  function handleUpdateService(id, updatedFields) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
    showToast(`✏️ Updated service details successfully!`);
  }

  function handleDeleteService(id) {
    const target = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    showToast(`🗑️ Deleted "${target?.title || 'Service'}" from catalogue`);
  }

  function handleResetServices() {
    setServices(INITIAL_SERVICES);
    showToast(`🔄 Reset catalogue to default preset services`);
  }

  // ==========================================
  // Operational Weather Surge (Monsoon rain fee: +₹49)
  // ==========================================
  const [monsoonSurge, setMonsoonSurge] = useState(() => {
    try {
      return localStorage.getItem('uc_admin_monsoon_surge') === 'true';
    } catch {
      return false;
    }
  });

  function handleToggleMonsoonSurge(newVal) {
    const nextVal = typeof newVal === 'boolean' ? newVal : !monsoonSurge;
    setMonsoonSurge(nextVal);
    try {
      localStorage.setItem('uc_admin_monsoon_surge', String(nextVal));
    } catch {}
  }

  // Effective services list reflecting active operational surge
  const effectiveServices = useMemo(() => {
    if (!monsoonSurge) return services;
    return services.map(s => ({
      ...s,
      basePrice: s.price,
      price: s.price + 49,
      originalPrice: s.originalPrice ? s.originalPrice + 49 : Math.round(s.price * 1.15) + 49,
      isRainSurgeActive: true
    }));
  }, [services, monsoonSurge]);

  // ==========================================
  // 2. SAVED ADDRESSES CRUD STATE
  // ==========================================
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_addresses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ADDR-1',
        label: 'Home',
        flat: 'Flat 402, Sea Green Heights, Bandra West',
        locality: 'Bandra West',
        city: 'Mumbai',
        pincode: '400050',
        landmark: 'Opposite Mehboob Studio',
        isDefault: true,
        formatted: 'Flat 402, Sea Green Heights, Bandra West, Mumbai - 400050 (Opposite Mehboob Studio)'
      },
      {
        id: 'ADDR-2',
        label: 'Work',
        flat: 'Unit 802, One BKC, G Block, BKC',
        locality: 'Bandra West',
        city: 'Mumbai',
        pincode: '400051',
        landmark: 'Near MCA Club',
        isDefault: false,
        formatted: 'Unit 802, One BKC, G Block, BKC, Mumbai - 400051'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_addresses', JSON.stringify(savedAddresses));
    } catch {}
  }, [savedAddresses]);

  function handleAddAddress(newAddr) {
    setSavedAddresses(prev => [newAddr, ...prev]);
    showToast(`✅ Added new saved address: ${newAddr.label}`);
  }

  function handleUpdateAddress(id, updatedFields) {
    setSavedAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    showToast(`✏️ Updated address successfully!`);
  }

  function handleDeleteAddress(id) {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    showToast(`🗑️ Address deleted.`);
  }

  function handleSelectDefaultAddress(id) {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    showToast(`⭐ Set as default delivery address`);
  }

  // ==========================================
  // 3. BOOKINGS CRUD STATE
  // ==========================================
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_bookings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'UC-829410',
        items: [
          { title: 'Powerjet AC Servicing (Split / Window)', qty: 1, price: 499 }
        ],
        totalAmount: 548,
        address: 'Flat 402, Sea Green Heights, Bandra West, Mumbai - 400050',
        slot: 'Today (13 Oct), 02:00 PM - 03:00 PM',
        status: 'Confirmed',
        createdAt: '13 Oct, 11:30 AM',
        paymentMethod: 'UPI'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_bookings', JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  function handleConfirmOrder(bookingDetails) {
    setBookings(prev => [bookingDetails, ...prev]);
    setCart({}); // clear cart
    setIsCheckoutModalOpen(false);
    setCurrentView('home');
    setActiveTrackingBooking(bookingDetails);
    showToast(`🎉 Booking ${bookingDetails.id} confirmed!`);
  }

  function handleUpdateBookingSlot(id, newSlot) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, slot: newSlot } : b));
    showToast(`🕒 Booking ${id} rescheduled to ${newSlot}`);
  }

  function handleUpdateBookingAddress(id, newAddress, newNotes) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, address: newAddress, notes: newNotes } : b));
    showToast(`📍 Delivery details updated for ${id}`);
  }

  function handleCancelBooking(id, reason) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled', cancelReason: reason } : b));
    showToast(`🚫 Booking ${id} has been cancelled.`);
  }

  function handleDeleteBookingHistory(id) {
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast(`🗑️ Removed booking record from history.`);
  }

  function handleUpdateBookingStatus(id, newStatus, partnerName) {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        status: newStatus,
        assignedPartner: partnerName || b.assignedPartner || 'Rajesh Kumar'
      };
    }));
    showToast(`✓ Order #${id} updated to ${newStatus}`);
  }

  // ==========================================
  // 4. CART CRUD STATE
  // ==========================================
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_cart');
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      const cleaned = {};
      Object.entries(parsed).forEach(([k, v]) => {
        const q = typeof v === 'number' ? v : (v?.qty ?? v?.quantity ?? 0);
        if (q > 0) {
          cleaned[k] = typeof v === 'object' ? { ...v, qty: q } : { id: k, qty: q };
        }
      });
      return cleaned;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  function handleAddToCart(service) {
    setCart((prev) => ({
      ...prev,
      [service.id]: {
        ...service,
        qty: (prev[service.id]?.qty || 0) + 1,
      },
    }));
    showToast(`🛒 Added "${service.title}" to cart`);
  }

  function handleUpdateQty(serviceId, newQty) {
    setCart((prev) => {
      const copy = { ...prev };
      if (newQty <= 0) {
        delete copy[serviceId];
      } else if (copy[serviceId]) {
        copy[serviceId] = { ...copy[serviceId], qty: newQty };
      }
      return copy;
    });
  }

  function handleRemoveItem(serviceId) {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[serviceId];
      return copy;
    });
    showToast(`🗑️ Removed item from cart`);
  }

  function handleClearCart() {
    setCart({});
    showToast(`🗑️ Cart cleared`);
  }

  // ==========================================
  // 5. USER AUTH & PLUS MEMBERSHIP
  // ==========================================
  const [hasUCPlus, setHasUCPlus] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_user');
      return saved ? JSON.parse(saved) : { name: 'Rahul Sharma', phone: '+91 98201 44521' };
    } catch {
      return { name: 'Rahul Sharma', phone: '+91 98201 44521' };
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('uc_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('uc_user');
      }
    } catch {}
  }, [user]);

  // Modals Visibility
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  function handleOpenAuth(mode = 'login') {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Purge any stale admin session so opening the portal strictly requires password verification
    try {
      sessionStorage.removeItem('uc_admin_auth');
    } catch {}
  }, []);

  // Category Modals State
  const [isApplianceModalOpen, setIsApplianceModalOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [isFullCleaningModalOpen, setIsFullCleaningModalOpen] = useState(false);
  const [isElectricianModalOpen, setIsElectricianModalOpen] = useState(false);
  const [isMenSalonPreferenceOpen, setIsMenSalonPreferenceOpen] = useState(false);

  function handleSelectMenSalonPreference(pref) {
    setIsMenSalonPreferenceOpen(false);
    if (pref === 'royale') {
      setCurrentView('salon-royale-page');
    } else {
      setCurrentView('salon-men-prime-page');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectFullCleaningOption(option) {
    setIsFullCleaningModalOpen(false);
    const optId = typeof option === 'string' ? option : option?.id;
    if (optId === 'cockroach-control' || option?.name?.toLowerCase().includes('cockroach')) {
      setCurrentView('cockroach-control-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('🛡️ Opened Cockroach & Pest Control Services');
    } else {
      setCurrentView('full-home-cleaning-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('✨ Opened Full Home & By-Room Cleaning Services');
    }
  }

  function handleSelectElectricianOption(item) {
    setIsElectricianModalOpen(false);
    const tradeId = (typeof item === 'string' ? item : item?.id) || 'electrician';
    if (tradeId === 'plumber') {
      setCurrentView('plumber-service-page');
      showToast('🚰 Showing Plumber Details & Services Only');
    } else if (tradeId === 'carpenter') {
      setCurrentView('carpenter-service-page');
      showToast('🪚 Showing Carpenter Details & Services Only');
    } else {
      setCurrentView('electrician-service-page');
      showToast('⚡ Showing Electrician Details & Services Only');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenElectricianTrade(trade = 'electrician') {
    setIsElectricianModalOpen(false);
    const tradeId = (typeof trade === 'string' ? trade : trade?.id) || 'electrician';
    if (tradeId === 'plumber') {
      setCurrentView('plumber-service-page');
    } else if (tradeId === 'carpenter') {
      setCurrentView('carpenter-service-page');
    } else {
      setCurrentView('electrician-service-page');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSelectCleaningOption(option) {
    setIsCleaningModalOpen(false);
    if (option.id === 'kitchen-cleaning' || option.title?.toLowerCase().includes('kitchen')) {
      setCurrentView('kitchen-cleaning-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('🍳 Opened Kitchen Cleaning services');
      return;
    }
    if (
      option.id === 'single-bathroom' || 
      option.id === 'bathroom-cleaning' ||
      option.id === 'bathroom-kitchen-combo' ||
      option.title?.toLowerCase().includes('bathroom')
    ) {
      setCurrentView('bathroom-cleaning-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('✨ Opened Bathroom Cleaning services');
      return;
    }
    handleCategorySelection('cleaning-pest');
    setActiveSubcategory(null);
    showToast(`Showing verified services for ${option.title}`);
    setTimeout(() => {
      const el = document.getElementById('services-catalogue');
      if (el) {
        const offset = -76;
        const topPos = el.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }, 120);
  }

  function handleSelectAppliance(appliance) {
    setIsApplianceModalOpen(false);
    if (appliance.id === 'ac') {
      setCurrentView('ac-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'chimney') {
      setCurrentView('chimney-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'geyser') {
      setCurrentView('geyser-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'laptop') {
      setCurrentView('laptop-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'refrigerator') {
      setCurrentView('refrigerator-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'washing-machine') {
      setCurrentView('washing-machine-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'microwave') {
      setCurrentView('microwave-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'television') {
      setCurrentView('television-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (appliance.id === 'water-purifier') {
      setCurrentView('water-purifier-service-page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    handleCategorySelection(appliance.category);
    showToast(`Showing verified services for ${appliance.name}`);
    setTimeout(() => {
      const el = document.getElementById('services-catalogue');
      if (el) {
        const offset = -76;
        const topPos = el.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }, 120);
  }

  function handleOpenAdminPortal() {
    if (isAdminAuthenticated) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminAuthModalOpen(true);
    }
  }

  function handleAdminLoginSuccess() {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('uc_admin_auth', 'true');
    } catch {}
    setIsAdminAuthModalOpen(false);
    setIsAdminDashboardOpen(true);
    showToast('✓ Welcome, Administrator! Operations Hub Unlocked.');
  }

  function handleAdminLogout() {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('uc_admin_auth');
    } catch {}
    setIsAdminDashboardOpen(false);
    showToast('ℹ️ Logged out from Administrator Session. Portal Locked.');
  }

  function handleCloseAdminDashboard() {
    setIsAdminDashboardOpen(false);
    // Lock admin session when closed so unauthorized users cannot access without password
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('uc_admin_auth');
    } catch {}
  }
  const [isPartnerDashboardOpen, setIsPartnerDashboardOpen] = useState(false);
  const [isPartnerOnboardingOpen, setIsPartnerOnboardingOpen] = useState(false);
  const [isWorkerOnboardingOpen, setIsWorkerOnboardingOpen] = useState(false);

  // ==========================================
  // 6. WORKER ONBOARDING APPLICATIONS STATE
  // ==========================================
  const [workerApplications, setWorkerApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_worker_applications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'WRK-84210',
        applicantName: 'Ramesh Vishwakarma',
        phone: '+91 98205 11982',
        trade: 'ac-appliances',
        tradeName: 'AC & Appliance Repair',
        locality: 'Bandra West, Mumbai',
        experience: '4-6 years',
        toolsAvailable: 'Yes, Full Tool Kit & Gauges',
        hasSmartphone: 'Yes, Android 13',
        expectedIncome: '₹70,000 / month',
        aadhaarNumber: 'XXXX-XXXX-4821',
        appliedAt: '14 Oct 2026, 11:20 AM',
        status: 'Pending Review'
      },
      {
        id: 'WRK-84209',
        applicantName: 'Sunita Chauhan',
        phone: '+91 98190 22345',
        trade: 'cleaning-pest',
        tradeName: 'Deep Cleaning & Pest Control',
        locality: 'Powai, Mumbai',
        experience: '3-5 years',
        toolsAvailable: 'Yes, Deep Clean Machines',
        hasSmartphone: 'Yes, iOS 17',
        expectedIncome: '₹55,000 / month',
        aadhaarNumber: 'XXXX-XXXX-9012',
        appliedAt: '13 Oct 2026, 04:45 PM',
        status: 'Pending Review'
      },
      {
        id: 'WRK-84205',
        applicantName: 'Dilip Mistry',
        phone: '+91 98331 44567',
        trade: 'quick-repairs',
        tradeName: 'Electrician & Quick Repairs',
        locality: 'Andheri West, Mumbai',
        experience: '7+ years',
        toolsAvailable: 'Yes, Digital Multimeter & Power Tools',
        hasSmartphone: 'Yes, Android 12',
        expectedIncome: '₹65,000 / month',
        aadhaarNumber: 'XXXX-XXXX-1144',
        appliedAt: '12 Oct 2026, 02:15 PM',
        status: 'Approved'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_worker_applications', JSON.stringify(workerApplications));
    } catch {}
  }, [workerApplications]);

  function handleWorkerApplied(newApp) {
    setWorkerApplications(prev => [newApp, ...prev]);
    showToast(`🎉 Worker application submitted for ${newApp.applicantName}! Admin notified.`);
  }

  function handleUpdateWorkerAppStatus(id, newStatus) {
    setWorkerApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    showToast(`✓ Worker application #${id} marked as ${newStatus}`);
  }

  function handleDeleteWorkerApp(id) {
    setWorkerApplications(prev => prev.filter(a => a.id !== id));
    showToast(`🗑️ Removed worker application #${id}`);
  }

  // ==========================================
  // 7. PARTNER ONBOARDING APPLICATIONS STATE
  // ==========================================
  const [partnerApplications, setPartnerApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_partner_applications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'PTR-90142',
        businessName: 'Apex Home Solutions LLP',
        ownerName: 'Sandeep Patil',
        phone: '+91 98210 33411',
        email: 'sandeep@apexhome.in',
        businessType: 'Partnership / LLP',
        category: 'ac-appliances',
        categoryName: 'AC & Appliance Repair',
        fleetSize: '12 Technicians',
        city: 'Bandra, Khar & Santacruz, Mumbai',
        gstNumber: '27AABCA1234F1Z8',
        monthlyCapacity: '250-400 jobs/month',
        appliedAt: '14 Oct 2026, 09:15 AM',
        status: 'Pending Review'
      },
      {
        id: 'PTR-90138',
        businessName: 'SwiftClean Pro Agency',
        ownerName: 'Meera Nair',
        phone: '+91 98200 77654',
        email: 'ops@swiftclean.co',
        businessType: 'Private Limited Company',
        category: 'cleaning-pest',
        categoryName: 'Deep Cleaning & Pest Control',
        fleetSize: '8 Specialist Cleaners',
        city: 'Powai, Chandivali & Vikhroli, Mumbai',
        gstNumber: '27AAECP5678M1Z2',
        monthlyCapacity: '180-260 jobs/month',
        appliedAt: '13 Oct 2026, 06:10 PM',
        status: 'Approved'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_partner_applications', JSON.stringify(partnerApplications));
    } catch {}
  }, [partnerApplications]);

  function handlePartnerApplied(newPartnerApp) {
    setPartnerApplications(prev => [newPartnerApp, ...prev]);
    showToast(`🎉 Partner registration submitted for ${newPartnerApp.businessName}! Admin notified.`);
  }

  function handleUpdatePartnerAppStatus(id, newStatus) {
    setPartnerApplications(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    showToast(`✓ Partner application #${id} marked as ${newStatus}`);
  }

  function handleDeletePartnerApp(id) {
    setPartnerApplications(prev => prev.filter(p => p.id !== id));
    showToast(`🗑️ Removed partner application #${id}`);
  }

  const [editingServiceForAdmin, setEditingServiceForAdmin] = useState(null);
  const [selectedDetailService, setSelectedDetailService] = useState(null);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState(null);

  function handleOpenCreateService() {
    setEditingServiceForAdmin('NEW');
    setIsAdminModalOpen(true);
  }

  function handleOpenEditService(service) {
    setEditingServiceForAdmin(service);
    setIsAdminModalOpen(true);
  }

  // Cart Calculations
  const cartItems = Object.values(cart);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  function handleLocationSelect(city, locality) {
    setSelectedCity(city);
    setSelectedLocality(locality);
    showToast(`📍 Delivering to ${locality}, ${city}`);
  }

  function handleProceedToCheckout() {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenCartView() {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Available subcategories for the selected category
  const availableSubcategories = Array.from(
    new Set(
      effectiveServices
        .filter(s => activeCategory === 'all' || s.category === activeCategory)
        .map(s => s.subcategory)
        .filter(Boolean)
    )
  );

  // Filtered Services based on category and subcategory selection
  const filteredServices = effectiveServices.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (activeSubcategory) {
      const sub = (s.subcategory || '').toLowerCase();
      const target = activeSubcategory.toLowerCase();
      if (!sub.includes(target) && !s.title.toLowerCase().includes(target)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="app-container">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: '#0F172A',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 0,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13.5,
          fontWeight: 700,
          animation: 'slideDownFade 0.25s ease'
        }}>
          <Sparkles size={16} color="#A78BFA" />
          <span>{toastMessage}</span>
        </div>
      )}

      {currentView === 'ac-service-page' ? (
        <ACServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'chimney-service-page' ? (
        <ChimneyServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'geyser-service-page' ? (
        <GeyserServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'television-service-page' ? (
        <TelevisionServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'microwave-service-page' ? (
        <MicrowaveServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'washing-machine-service-page' ? (
        <WashingMachineServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'refrigerator-service-page' ? (
        <RefrigeratorServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'laptop-service-page' ? (
        <LaptopServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'water-purifier-service-page' ? (
        <WaterPurifierServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'native-purifier-page' ? (
        <NativeWaterPurifierPage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'native-smart-locks-page' ? (
        <NativeSmartLocksPage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'electrician-service-page' ? (
        <ElectricianServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'plumber-service-page' ? (
        <PlumberServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'carpenter-service-page' ? (
        <CarpenterServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'bathroom-cleaning-page' ? (
        <BathroomCleaningServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'kitchen-cleaning-page' ? (
        <KitchenCleaningServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'full-home-cleaning-page' ? (
        <FullHomeCleaningServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'cockroach-control-page' ? (
        <CockroachControlServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'quick-repairs-service-page' ? (
        <QuickRepairsServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          initialTrade={quickRepairsTrade}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'salon-prime-page' ? (
        <SalonPrimeServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
          monsoonSurge={monsoonSurge}
        />
      ) : currentView === 'hair-studio-page' ? (
        <HairStudioWomenServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
          monsoonSurge={monsoonSurge}
        />
      ) : currentView === 'salon-royale-page' ? (
        <SalonRoyaleServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'salon-men-prime-page' ? (
        <SalonMenPrimeServicePage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
        />
      ) : currentView === 'checkout' ? (
        <UrbanCheckoutPage
          onBackHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          cart={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          user={user}
          onOpenAuth={handleOpenAuth}
          savedAddresses={savedAddresses}
          onConfirmOrder={handleConfirmOrder}
          showToast={showToast}
          hasUCPlus={hasUCPlus}
          onToggleUCPlus={() => setHasUCPlus(!hasUCPlus)}
        />
      ) : (
        <>
          {/* 1. Exact Navbar (Matches Screenshot) */}
          <Navbar
            selectedCity={selectedCity}
        selectedLocality={selectedLocality}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        cart={cart}
        cartTotal={cartSubtotal}
        onOpenCart={handleOpenCartView}
        onOpenAuth={() => handleOpenAuth('login')}
        user={user}
        onOpenBookings={() => setIsBookingsModalOpen(true)}
        bookingsCount={bookings.filter(b => b.status !== 'Cancelled').length}
        onOpenAddresses={() => setIsAddressModalOpen(true)}
        addressesCount={savedAddresses.length}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenAdminDashboard={handleOpenAdminPortal}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenPartnerDashboard={() => setIsPartnerDashboardOpen(true)}
        onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
        onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
        services={services}
        onSelectService={(s) => {
          if (s?.title?.toLowerCase().includes('lock') || s?.subcategory?.toLowerCase().includes('lock') || s?.id?.includes('lock')) {
            setCurrentView('native-smart-locks-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (s?.title?.toLowerCase().includes('purifier') || s?.subcategory?.toLowerCase().includes('purifier') || s?.id?.includes('purifier')) {
            if (s?.title?.toLowerCase().includes('repair') || s?.title?.toLowerCase().includes('service') || s?.id?.includes('repair') || s?.id?.includes('service')) {
              setCurrentView('water-purifier-service-page');
            } else {
              setCurrentView('native-purifier-page');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (s?.title?.toLowerCase().includes('refrigerator') || s?.subcategory?.toLowerCase().includes('refrigerator') || s?.id?.includes('refrigerator') || s?.title?.toLowerCase().includes('fridge')) {
            setCurrentView('refrigerator-service-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (s?.title?.toLowerCase().includes('washing') || s?.subcategory?.toLowerCase().includes('washing') || s?.id?.includes('washing') || s?.title?.toLowerCase().includes('washer')) {
            setCurrentView('washing-machine-service-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (s?.title?.toLowerCase().includes('microwave') || s?.subcategory?.toLowerCase().includes('microwave') || s?.id?.includes('microwave')) {
            setCurrentView('microwave-service-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (s?.title?.toLowerCase().includes('television') || s?.subcategory?.toLowerCase().includes('television') || s?.id?.includes('television') || s?.title?.toLowerCase().includes('tv') || s?.id?.includes('tv')) {
            setCurrentView('television-service-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (
            s?.category === 'quick-repairs' || 
            s?.subcategory === 'Electrician' || 
            s?.subcategory === 'Plumber' || 
            s?.subcategory === 'Carpenter' ||
            s?.title?.toLowerCase().includes('electrician') ||
            s?.title?.toLowerCase().includes('plumber') ||
            s?.title?.toLowerCase().includes('carpenter') ||
            s?.title?.toLowerCase().includes('fan') ||
            s?.title?.toLowerCase().includes('switch') ||
            s?.title?.toLowerCase().includes('tap') ||
            s?.title?.toLowerCase().includes('drain')
          ) {
            let trade = 'electrician';
            const cat = (s?.subcategory || s?.title || '').toLowerCase();
            if (cat.includes('plumb') || cat.includes('tap') || cat.includes('drain') || cat.includes('leak') || cat.includes('flush')) {
              trade = 'plumber';
            } else if (cat.includes('carpent') || cat.includes('drill') || cat.includes('door') || cat.includes('cupboard') || cat.includes('furniture')) {
              trade = 'carpenter';
            }
            if (trade === 'plumber') {
              setCurrentView('plumber-service-page');
            } else if (trade === 'carpenter') {
              setCurrentView('carpenter-service-page');
            } else {
              setCurrentView('electrician-service-page');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (
            s?.title?.toLowerCase().includes('cockroach') ||
            s?.subcategory?.toLowerCase().includes('pest') ||
            s?.title?.toLowerCase().includes('pest') ||
            s?.id?.includes('cockroach') ||
            s?.id?.includes('pest')
          ) {
            setCurrentView('cockroach-control-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (
            s?.title?.toLowerCase().includes('full home') ||
            s?.title?.toLowerCase().includes('furnished') ||
            s?.title?.toLowerCase().includes('unfurnished') ||
            s?.title?.toLowerCase().includes('sofa') ||
            s?.title?.toLowerCase().includes('carpet') ||
            s?.subcategory?.toLowerCase().includes('full home') ||
            s?.id?.includes('full-home')
          ) {
            setCurrentView('full-home-cleaning-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (
            s?.title?.toLowerCase().includes('kitchen') ||
            s?.subcategory?.toLowerCase().includes('kitchen') ||
            s?.id?.includes('kitchen')
          ) {
            setCurrentView('kitchen-cleaning-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (
            s?.title?.toLowerCase().includes('bathroom') ||
            s?.subcategory?.toLowerCase().includes('bathroom') ||
            s?.id?.includes('bathroom')
          ) {
            setCurrentView('bathroom-cleaning-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setSelectedDetailService(s);
          }
        }}
        onSelectCategory={handleCategorySelection}
        activeNavTab={activeNavTab}
        onSelectNavTab={handleSelectNavTab}
      />

      <main className="main-content">
        {/* 2. Exact Hero Section from Screenshot */}
        <HeroSection
          activeNavTab={activeNavTab}
          onSelectNavTab={handleSelectNavTab}
          onOpenACPage={() => {
            setCurrentView('ac-service-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenApplianceModal={() => setIsApplianceModalOpen(true)}
          onOpenCleaningModal={() => setIsCleaningModalOpen(true)}
          onOpenElectricianModal={(trade) => {
            if (trade && typeof trade === 'string') {
              handleOpenElectricianTrade(trade);
            } else {
              setIsElectricianModalOpen(true);
            }
          }}
          onOpenFullCleaningModal={() => setIsFullCleaningModalOpen(true)}
          onOpenPurifierPage={() => {
            setCurrentView('native-purifier-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSalonPrimePage={() => {
            setCurrentView('salon-prime-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenHairStudioPage={() => {
            setCurrentView('hair-studio-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSmartLocksPage={() => {
            setCurrentView('native-smart-locks-page');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectCategory={(catId) => {
            handleCategorySelection(catId);
          }}
          onOpenMenSalonPreference={() => setIsMenSalonPreferenceOpen(true)}
        />

        {/* Homes Extended Sections (Promo banners, New & noteworthy, Most booked, Appliances, Cleaning) */}
        {activeNavTab === 'homes' && (
          <HomesSections 
            onSelectCategory={handleCategorySelection}
            onOpenApplianceModal={() => setIsApplianceModalOpen(true)}
            onOpenElectricianModal={(trade) => {
              if (trade && typeof trade === 'string') {
                handleOpenElectricianTrade(trade);
              } else {
                setIsElectricianModalOpen(true);
              }
            }}
            onOpenACPage={() => {
              setCurrentView('ac-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenChimneyPage={() => {
              setCurrentView('chimney-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenLaptopPage={() => {
              setCurrentView('laptop-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenRefrigeratorPage={() => {
              setCurrentView('refrigerator-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenWashingMachinePage={() => {
              setCurrentView('washing-machine-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenMicrowavePage={() => {
              setCurrentView('microwave-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenTelevisionPage={() => {
              setCurrentView('television-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCleaningModal={() => setIsCleaningModalOpen(true)}
            onOpenFullCleaningModal={() => setIsFullCleaningModalOpen(true)}
            onOpenSmartLocksPage={() => {
              setCurrentView('native-smart-locks-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPurifierPage={() => {
              setCurrentView('native-purifier-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenWaterPurifierServicePage={() => {
              setCurrentView('water-purifier-service-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBathroomCleaningPage={() => {
              setCurrentView('bathroom-cleaning-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenKitchenCleaningPage={() => {
              setCurrentView('kitchen-cleaning-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenFullHomeCleaningPage={() => {
              setCurrentView('full-home-cleaning-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCockroachControlPage={() => {
              setCurrentView('cockroach-control-page');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}



        {/* Homes Extended Trust & Review Sections */}
        {activeNavTab === 'homes' && (
          <>
            {/* Native by UC Spotlight Showcase */}
            <NativeSpotlightSection
              onExploreNative={() => {
                setCurrentView('native-purifier-page');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* UC Plus Membership Section */}
            <UCPlusSection
              hasUCPlus={hasUCPlus}
              onToggleUCPlus={() => {
                setHasUCPlus(!hasUCPlus);
                if (!hasUCPlus) {
                  showToast('🎉 UC Plus activated! 10% discount on all bookings.');
                }
              }}
            />

            {/* The Urban Company Promise */}
            <UCPromiseSection />

            {/* Dual Onboarding Opportunities: Worker & Partner */}
            <OnboardingShowcaseSection
              onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
              onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
            />

            {/* Verified Customer Reviews */}
            <CustomerReviewsSection />

            {/* Frequently Asked Questions */}
            <FAQSection />
          </>
        )}
      </main>


      {/* 11. Footer */}
      <Footer
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          const matchedKey = Object.keys(CITY_LOCALITIES).find(
            k => k.toLowerCase() === (city || '').trim().toLowerCase()
          );
          const defaultLocality = (matchedKey && CITY_LOCALITIES[matchedKey]?.[0]) 
            || 'Central';
          handleLocationSelect(city, defaultLocality);
        }}
        onOpenPartnerDashboard={() => setIsPartnerDashboardOpen(true)}
        onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
        onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
      />

          {/* Universal Sticky Floating Cart Bar (Desktop & Mobile) */}
          {totalCartCount > 0 && (
            <div 
              className="universal-floating-cart-bar"
              onClick={handleOpenCartView}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShoppingBag size={20} color="#A78BFA" />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800 }}>
                    {totalCartCount} {totalCartCount === 1 ? 'service' : 'services'} added • ₹{cartSubtotal}
                  </div>
                  <div style={{ fontSize: 11.5, opacity: 0.9, color: '#A7F3D0' }}>
                    🎉 Saving extra ₹100 with auto-coupon at checkout
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#5E3BEE',
                color: '#FFFFFF',
                padding: '9px 18px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(94, 59, 238, 0.35)'
              }}>
                <span>View Cart</span>
                <ArrowRight size={16} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* MODALS & DRAWERS                                          */}
      {/* ========================================================= */}

      {/* 1. Location Modal */}
      <CityLocalityModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCity={selectedCity}
        currentLocality={selectedLocality}
        onSelectLocation={handleLocationSelect}
      />

      {/* 2. Service Detail Modal */}
      <ServiceDetailModal
        service={selectedDetailService}
        onClose={() => setSelectedDetailService(null)}
        qtyInCart={selectedDetailService ? (cart[selectedDetailService.id]?.qty || 0) : 0}
        onAddToCart={handleAddToCart}
        onUpdateQty={handleUpdateQty}
      />

      {/* 3. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        hasUCPlus={hasUCPlus}
        onToggleUCPlus={() => setHasUCPlus(!hasUCPlus)}
      />

      {/* 4. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cart={cart}
        totalAmount={cartSubtotal}
        selectedCity={selectedCity}
        selectedLocality={selectedLocality}
        user={user}
        savedAddresses={savedAddresses}
        onConfirmOrder={handleConfirmOrder}
        onOpenManageAddresses={() => setIsAddressModalOpen(true)}
      />

      {/* 5. Live Order Tracker Modal */}
      <OrderTrackingModal
        booking={activeTrackingBooking}
        onClose={() => setActiveTrackingBooking(null)}
      />

      {/* 6. My Bookings Modal */}
      <MyBookingsModal
        isOpen={isBookingsModalOpen}
        onClose={() => setIsBookingsModalOpen(false)}
        bookings={bookings}
        onTrackBooking={(b) => setActiveTrackingBooking(b)}
        onUpdateBookingSlot={handleUpdateBookingSlot}
        onUpdateBookingAddress={handleUpdateBookingAddress}
        onCancelBooking={handleCancelBooking}
        onDeleteBookingHistory={handleDeleteBookingHistory}
      />

      {/* 7. Saved Addresses Modal */}
      <AddressManagerModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={savedAddresses}
        onAddAddress={handleAddAddress}
        onUpdateAddress={handleUpdateAddress}
        onDeleteAddress={handleDeleteAddress}
        onSelectDefaultAddress={handleSelectDefaultAddress}
      />

      {/* 8. Catalogue Management Modal */}
      <AdminServicesModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setEditingServiceForAdmin(null);
        }}
        services={services}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
        onResetServices={handleResetServices}
        initialEditingService={editingServiceForAdmin}
        defaultCategory={activeCategory !== 'all' ? activeCategory : 'ac-appliances'}
      />

      {/* 9. User Auth / Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        initialMode={authModalMode}
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          showToast(`✨ Welcome, ${loggedInUser.name || 'User'}! Logged in successfully.`);
        }}
        onLogout={() => {
          setUser(null);
          showToast(`👋 Logged out successfully.`);
        }}
      />

      {/* 10. Urban Company Executive Admin Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminDashboardOpen}
        onClose={handleCloseAdminDashboard}
        services={services}
        monsoonSurge={monsoonSurge}
        onToggleMonsoonSurge={handleToggleMonsoonSurge}
        onAddService={handleAddService}
        onUpdateService={handleUpdateService}
        onDeleteService={handleDeleteService}
        onResetServices={handleResetServices}
        onOpenCreateService={handleOpenCreateService}
        onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
        workerApplications={workerApplications}
        onUpdateWorkerApplicationStatus={handleUpdateWorkerAppStatus}
        onDeleteWorkerApplication={handleDeleteWorkerApp}
        partnerApplications={partnerApplications}
        onUpdatePartnerApplicationStatus={handleUpdatePartnerAppStatus}
        onDeletePartnerApplication={handleDeletePartnerApp}
        onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
        onAdminLogout={handleAdminLogout}
        bookings={bookings}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onCancelBooking={handleCancelBooking}
        onDeleteBookingHistory={handleDeleteBookingHistory}
        onShowToast={showToast}
      />

      {/* 10B. Urban Company Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* 11. Urban Company Partner Pro Portal */}
      <PartnerDashboardModal
        isOpen={isPartnerDashboardOpen}
        onClose={() => setIsPartnerDashboardOpen(false)}
        onShowToast={showToast}
        onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
      />

      {/* 12. Urban Company Worker Onboarding Modal */}
      <WorkerOnboardingModal
        isOpen={isWorkerOnboardingOpen}
        onClose={() => setIsWorkerOnboardingOpen(false)}
        onWorkerApplied={handleWorkerApplied}
        selectedCity={selectedCity}
      />

      {/* 13. Urban Company Partner Onboarding Wizard */}
      <PartnerOnboardingModal
        isOpen={isPartnerOnboardingOpen}
        onClose={() => setIsPartnerOnboardingOpen(false)}
        onPartnerApplied={handlePartnerApplied}
        onPartnerRegistered={(newPro) => {
          showToast(`🎉 Welcome ${newPro.businessName || newPro.name}! Registered in ${newPro.city || newPro.locality}.`);
        }}
        onOpenPartnerDashboard={() => setIsPartnerDashboardOpen(true)}
        selectedCity={selectedCity}
      />

      {/* 14. Urban Company Appliance Repair & Service Modal */}
      <ApplianceRepairModal
        isOpen={isApplianceModalOpen}
        onClose={() => setIsApplianceModalOpen(false)}
        onSelectAppliance={handleSelectAppliance}
      />

      {/* 15. Urban Company Bathroom & Kitchen Cleaning Modal */}
      <BathroomKitchenCleaningModal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        onSelectOption={handleSelectCleaningOption}
      />

      {/* 16. Urban Company Electrician, Plumber & Carpenters Modal */}
      <ElectricianPlumberCarpenterModal
        isOpen={isElectricianModalOpen}
        onClose={() => setIsElectricianModalOpen(false)}
        onSelectOption={handleSelectElectricianOption}
        cart={cart}
        onAddToCart={handleAddToCart}
        onUpdateQty={handleUpdateQty}
        onOpenCart={handleOpenCartView}
      />

      {/* 17. Urban Company Cleaning Modal (Full Home & Cockroach Control) */}
      <FullHomeCleaningModal
        isOpen={isFullCleaningModalOpen}
        onClose={() => setIsFullCleaningModalOpen(false)}
        onSelectOption={handleSelectFullCleaningOption}
      />

      {/* 18. Urban Company Men Salon Preference Modal (Royale vs Prime) */}
      <SelectMenSalonPreferenceModal
        isOpen={isMenSalonPreferenceOpen}
        onClose={() => setIsMenSalonPreferenceOpen(false)}
        onSelectPreference={handleSelectMenSalonPreference}
      />
    </div>
  );
}

export default App;
