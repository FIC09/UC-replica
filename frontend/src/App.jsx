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
  RapidoChatDrawer
} from './components/RapidoChatDrawer';
import {
  PaymentGatewayModal
} from './components/PaymentGatewayModal';
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
import { AdminRouter } from './admin/AdminRouter';
import { ProfessionalRouter } from './professional/ProfessionalRouter';
import { professionalClient } from './professional/professionalClient';
import { PartnerRouter } from './partner/PartnerRouter';
import {
  PartnerDashboardModal
} from './components/PartnerDashboardModal';
import {
  ProfessionalDashboardModal
} from './components/ProfessionalDashboardModal';
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
  WorkerReviewPage
} from './components/WorkerReviewPage';
import {
  PaintingServicePage
} from './components/PaintingServicePage';
import {
  AboutUsPage
} from './components/AboutUsPage';

import {
  CATEGORIES,
  PROMO_BANNERS,
  SERVICES as INITIAL_SERVICES
} from './data/servicesData';
import { ShoppingBag, ArrowRight, Sparkles, CheckCircle2, Plus, Wrench, RotateCcw } from 'lucide-react';
import { StickyCategoryNav } from './components/StickyCategoryNav';
import { ServiceCard } from './components/ServiceCard';
import {
  servicesApi,
  bookingsApi,
  addressesApi,
  workerApi,
  partnerApi,
  adminApi,
  authApi,
  couponsApi
} from './api/apiClient';

const VIEW_ROUTES = {
  'home': { path: '/', title: 'Forge India Connect - Expert Home & Beauty Services on Demand' },
  'electrician-service-page': { path: '/services/electrician', title: 'Electrician Services - Forge India Connect' },
  'plumber-service-page': { path: '/services/plumber', title: 'Plumber Services - Forge India Connect' },
  'carpenter-service-page': { path: '/services/carpenter', title: 'Carpenter Services - Forge India Connect' },
  'ac-service-page': { path: '/services/ac-service', title: 'AC Services & Repair - Forge India Connect' },
  'chimney-service-page': { path: '/services/chimney-service', title: 'Chimney Repair & Service - Forge India Connect' },
  'geyser-service-page': { path: '/services/geyser-service', title: 'Geyser Repair - Forge India Connect' },
  'laptop-service-page': { path: '/services/laptop-repair', title: 'Laptop & PC Repair - Forge India Connect' },
  'refrigerator-service-page': { path: '/services/refrigerator-repair', title: 'Refrigerator Repair - Forge India Connect' },
  'washing-machine-service-page': { path: '/services/washing-machine-repair', title: 'Washing Machine Repair - Forge India Connect' },
  'microwave-service-page': { path: '/services/microwave-repair', title: 'Microwave Repair - Forge India Connect' },
  'television-service-page': { path: '/services/tv-repair', title: 'Television Repair - Forge India Connect' },
  'water-purifier-service-page': { path: '/services/water-purifier', title: 'Water Purifier Service - Forge India Connect' },
  'native-purifier-page': { path: '/services/native-purifier', title: 'Native Water Purifier - Forge India Connect' },
  'native-smart-locks-page': { path: '/services/native-smart-locks', title: 'Native Smart Locks - Forge India Connect' },
  'salon-prime-page': { path: '/services/salon-women', title: 'Salon for Women - Forge India Connect' },
  'salon-men-prime-page': { path: '/services/salon-men', title: 'Salon for Men - Forge India Connect' },
  'salon-royale-page': { path: '/services/salon-royale', title: 'Salon Royale - Forge India Connect' },
  'hair-studio-page': { path: '/services/hair-studio', title: 'Hair Studio - Forge India Connect' },
  'cockroach-control-page': { path: '/services/pest-control', title: 'Pest Control - Forge India Connect' },
  'full-home-cleaning-page': { path: '/services/full-home-cleaning', title: 'Full Home Cleaning - Forge India Connect' },
  'kitchen-cleaning-page': { path: '/services/kitchen-cleaning', title: 'Kitchen Cleaning - Forge India Connect' },
  'bathroom-cleaning-page': { path: '/services/bathroom-cleaning', title: 'Bathroom Cleaning - Forge India Connect' },
  'painting-service-page': { path: '/services/painting', title: 'Painting Services - Forge India Connect' },
  'quick-repairs-page': { path: '/services/quick-repairs', title: 'Quick Repairs - Forge India Connect' },
  'checkout': { path: '/checkout', title: 'Checkout - Forge India Connect' },
  'about-us': { path: '/about', title: 'About Us - Forge India Connect' }
};

function getViewFromPath(pathname) {
  if (pathname === '/about' || pathname.startsWith('/about')) return 'about-us';
  if (pathname.startsWith('/checkout')) return 'checkout';
  for (const [viewKey, info] of Object.entries(VIEW_ROUTES)) {
    if (info.path !== '/' && (pathname === info.path || pathname.startsWith(info.path))) {
      return viewKey;
    }
  }
  return 'home';
}

function App() {
  // Location State (persisted to localStorage)
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_selected_city');
      if (saved && !/chennai|poonamalle|adayalampattu|tiruvallur/i.test(saved)) return saved;
      return 'Krishnagiri';
    } catch {
      return 'Krishnagiri';
    }
  });
  const [selectedLocality, setSelectedLocality] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_selected_locality');
      if (saved && !/chennai|poonamalle|adayalampattu|tiruvallur/i.test(saved)) return saved;
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

  // Dedicated Route & View Routing
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin');
  });
  const [isProfessionalRoute, setIsProfessionalRoute] = useState(() => {
    return window.location.pathname.startsWith('/professional');
  });
  const [isPartnerRoute, setIsPartnerRoute] = useState(() => {
    return window.location.pathname.startsWith('/partner');
  });
  const [isReviewRoute, setIsReviewRoute] = useState(() => {
    return window.location.pathname.startsWith('/review');
  });
  const [isAboutRoute, setIsAboutRoute] = useState(() => {
    return window.location.pathname === '/about' || window.location.pathname.startsWith('/about');
  });
  const [isCheckoutRoute, setIsCheckoutRoute] = useState(() => {
    return window.location.pathname.startsWith('/checkout');
  });

  const [currentView, setCurrentView] = useState(() => {
    if (window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/professional') ||
        window.location.pathname.startsWith('/partner') ||
        window.location.pathname.startsWith('/review')) {
      return 'home';
    }
    return getViewFromPath(window.location.pathname);
  });

  function navigateToView(viewKey, { replace = false } = {}) {
    const route = VIEW_ROUTES[viewKey] || VIEW_ROUTES['home'];
    setCurrentView(viewKey);
    setIsAboutRoute(viewKey === 'about-us');
    setIsCheckoutRoute(viewKey === 'checkout');

    if (replace) {
      window.history.replaceState({ view: viewKey }, '', route.path);
    } else if (window.location.pathname !== route.path) {
      window.history.pushState({ view: viewKey }, '', route.path);
    }

    if (route.title) {
      document.title = route.title;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackHome() {
    if (window.history.state?.view && window.history.state.view !== 'home' && window.location.pathname !== '/') {
      window.history.back();
    } else {
      navigateToView('home');
    }
  }

  useEffect(() => {
    function handleLocationSync(e) {
      const path = window.location.pathname;
      setIsAdminRoute(path.startsWith('/admin'));
      setIsProfessionalRoute(path.startsWith('/professional'));
      setIsPartnerRoute(path.startsWith('/partner'));
      setIsReviewRoute(path.startsWith('/review'));

      const atAbout = path === '/about' || path.startsWith('/about');
      setIsAboutRoute(atAbout);
      const atCheckout = path.startsWith('/checkout');
      setIsCheckoutRoute(atCheckout);

      let targetView = 'home';
      if (e?.state?.view) {
        targetView = e.state.view;
      } else if (atAbout) {
        targetView = 'about-us';
      } else if (atCheckout) {
        targetView = 'checkout';
      } else {
        targetView = getViewFromPath(path);
      }

      setCurrentView(targetView);
      const route = VIEW_ROUTES[targetView] || VIEW_ROUTES['home'];
      if (route?.title) {
        document.title = route.title;
      }
    }

    // Set initial history state if not populated so Chrome back knows root state
    const currentPath = window.location.pathname;
    const initialView = getViewFromPath(currentPath);
    const initialRoute = VIEW_ROUTES[initialView] || VIEW_ROUTES['home'];
    if (!window.history.state || !window.history.state.view) {
      window.history.replaceState({ view: initialView }, '', initialRoute.path);
    }
    if (initialRoute?.title) {
      document.title = initialRoute.title;
    }

    window.addEventListener('popstate', handleLocationSync);
    return () => window.removeEventListener('popstate', handleLocationSync);
  }, []);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
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
      navigateToView('native-smart-locks-page');
      return;
    }
    if (catId === 'native-ro' || catId === 'water-purifier') {
      navigateToView('native-purifier-page');
      return;
    }
    if (catId === 'womens-salon' || catId === 'salon-prime') {
      navigateToView('salon-prime-page');
      return;
    }
    if (catId === 'mens-salon') {
      setIsMenSalonPreferenceOpen(true);
      return;
    }
    if (catId === 'painting-decor' || catId === 'home-painting' || catId === 'painting') {
      navigateToView('painting-service-page');
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

  // ==========================================
  // MERN BACKEND API SYNCHRONIZATION
  // ==========================================
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function syncFromBackend() {
      try {
        const res = await servicesApi.getAll();
        if (isMounted && res?.services?.length > 0) {
          const backendServices = res.services;
          const backendIds = new Set(backendServices.map(s => s.id));
          const missing = INITIAL_SERVICES.filter(s => !backendIds.has(s.id));
          setServices([...backendServices, ...missing]);
          setIsBackendConnected(true);
        }
      } catch (err) {
        console.info('Operating with local services cache:', err.message);
      }

      try {
        const bRes = await bookingsApi.getAll();
        if (isMounted) {
          const serverBookings = bRes?.bookings || [];
          const serverIds = new Set(serverBookings.map(b => (b.id || b.bookingReference || '').toLowerCase()));

          // Recover and auto-sync any offline or locally pending bookings
          let localBookings = [];
          try {
            const raw = localStorage.getItem('uc_bookings');
            if (raw) localBookings = JSON.parse(raw);
          } catch {}

          const unsynced = Array.isArray(localBookings)
            ? localBookings.filter(b => b && b.id && !serverIds.has((b.id || '').toLowerCase()) && !serverIds.has((b.bookingReference || '').toLowerCase()))
            : [];

          // Upload pending bookings to backend in background
          for (const pending of unsynced) {
            bookingsApi.create(pending)
              .then(() => {
                broadcastBookingSync('BOOKING_CREATED', { booking: pending, id: pending.id });
              })
              .catch(syncErr => console.warn('Sync pending booking notice:', syncErr.message));
          }

          const combined = [...unsynced, ...serverBookings];
          if (combined.length > 0) {
            setBookings(combined);
            const active = combined.find(b => b.status === 'Confirmed' || b.status === 'Assigned' || b.status === 'In Progress') || combined[0];
            if (active) setLatestLiveBooking(active);
          }
        }
      } catch (bErr) {
        console.warn('Initial bookings fetch note:', bErr.message);
      }

      try {
        if (user) {
          const aRes = await addressesApi.getAll();
          if (isMounted && aRes?.addresses?.length > 0) {
            setSavedAddresses(aRes.addresses);
          }
        }
      } catch {}

      try {
        const wRes = await workerApi.getAll();
        if (isMounted && wRes?.applications?.length > 0) {
          setWorkerApplications(wRes.applications);
        }
      } catch {}

      try {
        const pRes = await partnerApi.getAll();
        if (isMounted && pRes?.applications?.length > 0) {
          setPartnerApplications(pRes.applications);
        }
      } catch {}

      try {
        const adm = await adminApi.getSettings();
        if (isMounted && adm?.settings) {
          if (typeof adm.settings.monsoonSurge === 'boolean') {
            setMonsoonSurge(adm.settings.monsoonSurge);
          }
        }
      } catch {}
    }

    syncFromBackend();
    return () => { isMounted = false; };
  }, []);

  function handleAddService(newSvc) {
    setServices(prev => [newSvc, ...prev]);
    servicesApi.create(newSvc).catch(err => console.warn('Backend sync failed:', err));
    showToast(`✅ Created new service: "${newSvc.title}"`);
  }

  function handleUpdateService(id, updatedFields) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
    servicesApi.update(id, updatedFields).catch(err => console.warn('Backend sync failed:', err));
    showToast(`✏️ Updated service details successfully!`);
  }

  function handleDeleteService(id) {
    const target = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    servicesApi.delete(id).catch(err => console.warn('Backend sync failed:', err));
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
    adminApi.setSurge(nextVal).catch(err => console.warn('Backend surge sync failed:', err));
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
  // 2. SAVED ADDRESSES CRUD STATE (User-Scoped)
  // ==========================================
  const getUserAddressKey = (currentUser) => {
    if (!currentUser) return null;
    return `uc_addresses_${currentUser._id || currentUser.id || currentUser.phone || currentUser.email}`;
  };

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const storedUser = localStorage.getItem('uc_user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      if (!currentUser) return [];

      const key = `uc_addresses_${currentUser._id || currentUser.id || currentUser.phone || currentUser.email}`;
      const saved = localStorage.getItem(key) || localStorage.getItem('uc_addresses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(addr => 
            addr && 
            addr.id !== 'ADDR-KG-1' && 
            addr.id !== 'ADDR-1' && 
            !addr.flat?.includes('Door 14/2') && 
            !addr.flat?.includes('Flat 402')
          );
        }
      }
    } catch {}
    return [];
  });

  // Keep savedAddresses in sync when user logs in or out
  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      try {
        localStorage.removeItem('uc_addresses');
      } catch {}
      return;
    }
    const key = getUserAddressKey(user);
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedAddresses(parsed.filter(addr => 
            addr && 
            addr.id !== 'ADDR-KG-1' && 
            addr.id !== 'ADDR-1' && 
            !addr.flat?.includes('Door 14/2') && 
            !addr.flat?.includes('Flat 402')
          ));
        }
      }
    } catch {}
  }, [user]);

  // Persist addresses under current user key
  useEffect(() => {
    if (!user) return;
    const key = getUserAddressKey(user);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(savedAddresses));
    } catch {}
  }, [savedAddresses, user]);

  // Proactively auto-heal any existing saved addresses holding Chennai ISP exchange false-positives
  useEffect(() => {
    const hasStaleIsp = savedAddresses.some(addr =>
      /chennai|poonamalle|adayalampattu|ambattur|maduravoyal|nerkundram|porur|tiruvallur|kancheepuram|vanagaram|avadi|600095|600056/i.test(
        `${addr.city} ${addr.locality} ${addr.formatted || ''} ${addr.flat || ''}`
      )
    );
    if (hasStaleIsp) {
      setSavedAddresses(prev => prev.map(addr => {
        const isIsp = /chennai|poonamalle|adayalampattu|ambattur|maduravoyal|nerkundram|porur|tiruvallur|kancheepuram|vanagaram|avadi|600095|600056/i.test(
          `${addr.city} ${addr.locality} ${addr.formatted || ''} ${addr.flat || ''}`
        );
        if (isIsp) {
          return {
            ...addr,
            city: 'Krishnagiri',
            locality: 'Rayakottai Road',
            pincode: '635001',
            flat: addr.flat && !/adayalampattu|chennai/i.test(addr.flat) ? addr.flat : '',
            landmark: addr.landmark || '',
            formatted: addr.formatted || ''
          };
        }
        return addr;
      }));
    }
  }, [savedAddresses]);

  function handleAddAddress(newAddr) {
    setSavedAddresses(prev => [newAddr, ...prev]);
    addressesApi.create(newAddr).catch(err => console.warn('Backend address sync failed:', err));
    showToast(`✅ Added new saved address: ${newAddr.label}`);
  }

  function handleUpdateAddress(id, updatedFields) {
    setSavedAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    addressesApi.update(id, updatedFields).catch(err => console.warn('Backend address update failed:', err));
    showToast(`✏️ Updated address successfully!`);
  }

  function handleDeleteAddress(id) {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    addressesApi.delete(id).catch(err => console.warn('Backend address delete failed:', err));
    showToast(`🗑️ Address deleted.`);
  }

  function handleSelectDefaultAddress(id) {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    addressesApi.setDefault(id).catch(err => console.warn('Backend default address sync failed:', err));
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
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_bookings', JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  async function handleConfirmOrder(bookingDetails) {
    const custName = user?.name || bookingDetails.customerName || bookingDetails.userName || 'Customer';
    const rawPhone = (user?.phone || bookingDetails.userPhone || '').toString().trim();
    const formattedPhone = rawPhone.startsWith('+91') ? rawPhone : (rawPhone ? `+91 ${rawPhone.replace(/\D/g, '').slice(-10) || rawPhone}` : '');
    const custEmail = user?.email || bookingDetails.userEmail || '';
    const custId = user?._id || user?.id || bookingDetails.customerId || '';

    const enriched = {
      ...bookingDetails,
      userName: custName,
      customerName: custName,
      userPhone: formattedPhone,
      userEmail: custEmail,
      customerId: custId,
      city: bookingDetails.city || selectedCity || 'Krishnagiri',
      serviceZone: bookingDetails.serviceZone || selectedLocality || 'Rayakottai Road',
      status: bookingDetails.status || 'Confirmed',
      paymentStatus: bookingDetails.paymentStatus || 'Paid'
    };
    setBookings(prev => [enriched, ...prev]);
    setCart({}); // clear cart
    setIsCheckoutModalOpen(false);
    navigateToView('home');
    setActiveTrackingBooking(enriched);
    setLatestLiveBooking(enriched);

    try {
      const serverRes = await bookingsApi.create(enriched);
      const finalBooking = serverRes?.booking || enriched;
      if (serverRes?.booking) {
        setBookings(prev => prev.map(b => b.id === enriched.id ? { ...b, ...serverRes.booking } : b));
      }
      showToast(`🎉 Booking ${finalBooking.id} confirmed!`);

      // Instantly broadcast to Admin Dashboard and all open tabs in real-time
      try {
        const syncChannel = new BroadcastChannel('uc_sync_channel');
        syncChannel.postMessage({ type: 'BOOKING_CREATED', booking: finalBooking, timestamp: Date.now() });
        syncChannel.close();
      } catch (bcErr) {}
      try {
        localStorage.setItem('uc_last_booking_event', JSON.stringify({ type: 'BOOKING_CREATED', id: finalBooking.id, timestamp: Date.now() }));
      } catch (lsErr) {}
    } catch (err) {
      console.warn('Backend booking sync notice:', err.message);
      showToast(`🎉 Booking ${enriched.id} confirmed!`);
      // Broadcast even on fallback
      try {
        const syncChannel = new BroadcastChannel('uc_sync_channel');
        syncChannel.postMessage({ type: 'BOOKING_CREATED', booking: enriched, timestamp: Date.now() });
        syncChannel.close();
      } catch (bcErr) {}
      try {
        localStorage.setItem('uc_last_booking_event', JSON.stringify({ type: 'BOOKING_CREATED', id: enriched.id, timestamp: Date.now() }));
      } catch (lsErr) {}
    }
  }

  function broadcastBookingSync(type, data = {}) {
    try {
      const syncChannel = new BroadcastChannel('uc_sync_channel');
      syncChannel.postMessage({ type, ...data, timestamp: Date.now() });
      syncChannel.close();
    } catch (bcErr) {}
    try {
      localStorage.setItem('uc_last_booking_event', JSON.stringify({ type, ...data, timestamp: Date.now() }));
    } catch (lsErr) {}
  }

  function handleUpdateBookingSlot(id, newSlot) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, slot: newSlot } : b));
    bookingsApi.update(id, { slot: newSlot }).catch(err => console.warn('Backend slot update failed:', err));
    broadcastBookingSync('BOOKING_UPDATED', { id, slot: newSlot });
    showToast(`🕒 Booking ${id} rescheduled to ${newSlot}`);
  }

  function handleUpdateBookingAddress(id, newAddress, newNotes) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, address: newAddress, notes: newNotes } : b));
    bookingsApi.update(id, { address: newAddress, notes: newNotes }).catch(err => console.warn('Backend address update failed:', err));
    broadcastBookingSync('BOOKING_UPDATED', { id, address: newAddress });
    showToast(`📍 Delivery details updated for ${id}`);
  }

  function handleCancelBooking(id, reason) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled', cancelReason: reason } : b));
    bookingsApi.update(id, { status: 'Cancelled', cancelReason: reason }).catch(err => console.warn('Backend cancel sync failed:', err));
    broadcastBookingSync('BOOKING_UPDATED', { id, status: 'Cancelled' });
    showToast(`🚫 Booking ${id} has been cancelled.`);
  }

  function handleDeleteBookingHistory(id) {
    setBookings(prev => prev.filter(b => b.id !== id));
    bookingsApi.delete(id).catch(err => console.warn('Backend booking delete failed:', err));
    broadcastBookingSync('BOOKING_DELETED', { id });
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
    bookingsApi.update(id, {
      status: newStatus,
      assignedPartner: partnerName || 'Rajesh Kumar'
    }).catch(err => console.warn('Backend status update failed:', err));
    broadcastBookingSync('BOOKING_UPDATED', { id, status: newStatus });
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
  const [hasUCPlus, setHasUCPlus] = useState(() => {
    try {
      return localStorage.getItem('uc_plus_active') === 'true';
    } catch {
      return false;
    }
  });

  const [isUCPlusPaymentOpen, setIsUCPlusPaymentOpen] = useState(false);

  function handleOpenUCPlusPayment() {
    if (hasUCPlus) {
      showToast('✨ Your UC Plus Membership is active! Enjoy 10% off on all bookings.');
      return;
    }
    setIsUCPlusPaymentOpen(true);
  }

  function handleUCPlusPaymentSuccess(paymentDetails) {
    setIsUCPlusPaymentOpen(false);
    setHasUCPlus(true);
    try {
      localStorage.setItem('uc_plus_active', 'true');
    } catch {}
    showToast(`🎉 Payment of ₹299 successful via ${paymentDetails?.methodLabel || 'Online Payment'}! UC Plus VIP Membership activated for 6 months.`);
  }

  // Personal customer bookings for the logged-in customer (Tenant isolation)
  const customerBookings = useMemo(() => {
    if (!user) return [];
    const userPhoneDigits = (user.phone || '').replace(/\D/g, '').slice(-10);
    const userId = (user._id || user.id || '').toString().trim();
    const userEmail = (user.email || '').trim().toLowerCase();
    const userName = (user.name || '').trim().toLowerCase();

    return bookings.filter(b => {
      // 1. Match by customerId
      if (userId && b.customerId && (b.customerId.toString() === userId)) return true;
      // 2. Match by 10-digit phone number
      if (userPhoneDigits && b.userPhone) {
        const bPhoneDigits = b.userPhone.replace(/\D/g, '').slice(-10);
        if (bPhoneDigits && bPhoneDigits === userPhoneDigits) return true;
      }
      // 3. Match by email
      if (userEmail && b.userEmail && b.userEmail.toLowerCase() === userEmail) return true;
      // 4. Match by customer/user name
      const bCustName = (b.userName || b.customerName || '').trim().toLowerCase();
      if (userName && bCustName && bCustName === userName) return true;

      return false;
    });
  }, [bookings, user]);

  useEffect(() => {
    if (user && customerBookings.length > 0) {
      const active = customerBookings.find(b => b.status === 'Confirmed' || b.status === 'Assigned' || b.status === 'In Progress') || customerBookings[0] || null;
      setLatestLiveBooking(active);
    } else {
      setLatestLiveBooking(null);
    }
  }, [customerBookings, user]);

  useEffect(() => {
    function handleAuthEvent(e) {
      if (e.detail?.user === null) {
        setUser(null);
      } else if (e.detail?.user) {
        setUser(e.detail.user);
      }
    }
    function handleStorageEvent(e) {
      if ((e.key === 'uc_user' || e.key === 'uc_auth_user') && !e.newValue) {
        setUser(null);
      } else if ((e.key === 'uc_user' || e.key === 'uc_auth_user') && e.newValue) {
        try { setUser(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener('uc:auth-changed', handleAuthEvent);
    window.addEventListener('uc_auth_event', handleAuthEvent);
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('uc:auth-changed', handleAuthEvent);
      window.removeEventListener('uc_auth_event', handleAuthEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

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
    // Purge any stale admin session if not on admin route
    try {
      if (!window.location.pathname.startsWith('/admin')) {
        sessionStorage.removeItem('uc_admin_auth');
      }
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
      navigateToView('salon-royale-page');
    } else {
      navigateToView('salon-men-prime-page');
    }
  }

  function handleSelectFullCleaningOption(option) {
    setIsFullCleaningModalOpen(false);
    const optId = typeof option === 'string' ? option : option?.id;
    if (optId === 'cockroach-control' || option?.name?.toLowerCase().includes('cockroach')) {
      navigateToView('cockroach-control-page');
      showToast('🛡️ Opened Cockroach & Pest Control Services');
    } else {
      navigateToView('full-home-cleaning-page');
      showToast('✨ Opened Full Home & By-Room Cleaning Services');
    }
  }

  function handleSelectElectricianOption(item) {
    setIsElectricianModalOpen(false);
    const tradeId = (typeof item === 'string' ? item : item?.id) || 'electrician';
    if (tradeId === 'plumber') {
      navigateToView('plumber-service-page');
      showToast('🚰 Showing Plumber Details & Services Only');
    } else if (tradeId === 'carpenter') {
      navigateToView('carpenter-service-page');
      showToast('🪚 Showing Carpenter Details & Services Only');
    } else {
      navigateToView('electrician-service-page');
      showToast('⚡ Showing Electrician Details & Services Only');
    }
  }

  function handleOpenElectricianTrade(trade = 'electrician') {
    setIsElectricianModalOpen(false);
    const tradeId = (typeof trade === 'string' ? trade : trade?.id) || 'electrician';
    if (tradeId === 'plumber') {
      navigateToView('plumber-service-page');
    } else if (tradeId === 'carpenter') {
      navigateToView('carpenter-service-page');
    } else {
      navigateToView('electrician-service-page');
    }
  }

  function handleSelectCleaningOption(option) {
    setIsCleaningModalOpen(false);
    if (option.id === 'kitchen-cleaning' || option.title?.toLowerCase().includes('kitchen')) {
      navigateToView('kitchen-cleaning-page');
      showToast('🍳 Opened Kitchen Cleaning services');
      return;
    }
    if (
      option.id === 'single-bathroom' ||
      option.id === 'bathroom-cleaning' ||
      option.id === 'bathroom-kitchen-combo' ||
      option.title?.toLowerCase().includes('bathroom')
    ) {
      navigateToView('bathroom-cleaning-page');
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
      navigateToView('ac-service-page');
      return;
    }
    if (appliance.id === 'chimney') {
      navigateToView('chimney-service-page');
      return;
    }
    if (appliance.id === 'geyser') {
      navigateToView('geyser-service-page');
      return;
    }
    if (appliance.id === 'laptop') {
      navigateToView('laptop-service-page');
      return;
    }
    if (appliance.id === 'refrigerator') {
      navigateToView('refrigerator-service-page');
      return;
    }
    if (appliance.id === 'washing-machine') {
      navigateToView('washing-machine-service-page');
      return;
    }
    if (appliance.id === 'microwave') {
      navigateToView('microwave-service-page');
      return;
    }
    if (appliance.id === 'television') {
      navigateToView('television-service-page');
      return;
    }
    if (appliance.id === 'water-purifier') {
      navigateToView('water-purifier-service-page');
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
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
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
  const [isProfessionalDashboardOpen, setIsProfessionalDashboardOpen] = useState(false);
  const [isPartnerDashboardOpen, setIsPartnerDashboardOpen] = useState(false);
  const [isPartnerOnboardingOpen, setIsPartnerOnboardingOpen] = useState(false);
  const [isWorkerOnboardingOpen, setIsWorkerOnboardingOpen] = useState(false);

  function handleOpenProfessionalPortal() {
    try {
      professionalClient.setAuth('demo_pro_token', professionalClient.getStoredUser());
    } catch {}
    setIsProfessionalDashboardOpen(false);
    try {
      sessionStorage.setItem('uc_pro_token', 'simulated-pro-jwt-token');
      localStorage.setItem('uc_pro_token', 'simulated-pro-jwt-token');
    } catch {}
    window.history.pushState({}, '', '/professional');
    setIsProfessionalRoute(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenPartnerPortal() {
    setIsPartnerDashboardOpen(false);
    try {
      sessionStorage.setItem('uc_partner_token', 'simulated-partner-jwt-token');
      localStorage.setItem('uc_partner_token', 'simulated-partner-jwt-token');
    } catch {}
    window.history.pushState({}, '', '/partner');
    setIsPartnerRoute(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Automatic deep-link & direct launch for Partner and Professional Worker Dashboards
  useEffect(() => {
    function checkDirectLaunchPortal() {
      try {
        const portal = localStorage.getItem('uc_open_portal');
        if (portal === 'partner') {
          handleOpenPartnerPortal();
          localStorage.removeItem('uc_open_portal');
        } else if (portal === 'professional') {
          handleOpenProfessionalPortal();
          localStorage.removeItem('uc_open_portal');
        }
        const search = window.location.search;
        if (search.includes('open=partner')) {
          handleOpenPartnerPortal();
        } else if (search.includes('open=professional')) {
          handleOpenProfessionalPortal();
        }
      } catch {}
    }
    checkDirectLaunchPortal();
    window.addEventListener('popstate', checkDirectLaunchPortal);
    return () => window.removeEventListener('popstate', checkDirectLaunchPortal);
  }, []);

  function handleLogout() {
    setUser(null);
    setSavedAddresses([]);
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('uc_addresses');
      localStorage.removeItem('uc_user');
      sessionStorage.removeItem('uc_admin_auth');
      sessionStorage.removeItem('uc_admin_token');
      sessionStorage.removeItem('uc_admin_user');
      localStorage.removeItem('uc_admin_token');
      localStorage.removeItem('uc_admin_user');
      localStorage.removeItem('uc_open_portal');
      localStorage.removeItem('uc_partner_token');
      localStorage.removeItem('uc_partner_id');
      localStorage.removeItem('uc_partner_profile');
      localStorage.removeItem('uc_partner_staff');
      localStorage.removeItem('uc_pro_token');
      localStorage.removeItem('uc_pro_id');
      localStorage.removeItem('uc_pro_user');
    } catch {}
    setIsAdminRoute(false);
    setIsProfessionalRoute(false);
    setIsPartnerRoute(false);
    setIsAboutRoute(false);
    navigateToView('home', { replace: true });
    setActiveNavTab('homes');
    if (window.location.pathname !== '/') {
      window.location.href = '/';
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`👋 Logged out successfully. Returning to Home.`);
  }

  function handleOpenAbout() {
    navigateToView('about-us');
  }

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
    workerApi.submit(newApp).catch(err => console.warn('Backend worker app sync failed:', err));
    showToast(`🎉 Worker application submitted for ${newApp.applicantName}! Admin notified.`);
  }

  function handleUpdateWorkerAppStatus(id, newStatus) {
    setWorkerApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    workerApi.updateStatus(id, newStatus).catch(err => console.warn('Backend worker status sync failed:', err));
    showToast(`✓ Worker application #${id} marked as ${newStatus}`);
  }

  function handleDeleteWorkerApp(id) {
    setWorkerApplications(prev => prev.filter(a => a.id !== id));
    workerApi.delete(id).catch(err => console.warn('Backend worker app delete failed:', err));
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
    partnerApi.submit(newPartnerApp).catch(err => console.warn('Backend partner app sync failed:', err));
    showToast(`🎉 Partner registration submitted for ${newPartnerApp.businessName}! Admin notified.`);
  }

  function handleUpdatePartnerAppStatus(id, newStatus) {
    setPartnerApplications(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    partnerApi.updateStatus(id, newStatus).catch(err => console.warn('Backend partner status sync failed:', err));
    showToast(`✓ Partner application #${id} marked as ${newStatus}`);
  }

  function handleDeletePartnerApp(id) {
    setPartnerApplications(prev => prev.filter(p => p.id !== id));
    partnerApi.delete(id).catch(err => console.warn('Backend partner delete failed:', err));
    showToast(`🗑️ Removed partner application #${id}`);
  }

  const [editingServiceForAdmin, setEditingServiceForAdmin] = useState(null);
  const [selectedDetailService, setSelectedDetailService] = useState(null);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState(null);
  const [latestLiveBooking, setLatestLiveBooking] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_bookings');
      if (saved) {
        const list = JSON.parse(saved);
        return list.find(b => b.status === 'Confirmed' || b.status === 'Assigned' || b.status === 'In Progress') || list[0] || null;
      }
    } catch {}
    return null;
  });
  const [activeChatBooking, setActiveChatBooking] = useState(null);

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
    const isIspGateway = /chennai|poonamalle|adayalampattu|ambattur|maduravoyal|nerkundram|porur|tiruvallur|kancheepuram|vanagaram|avadi|600095|600056/i.test(`${city} ${locality}`);
    const finalCity = isIspGateway ? 'Krishnagiri' : city;
    const finalLocality = isIspGateway ? 'Rayakottai Road' : locality;
    setSelectedCity(finalCity);
    setSelectedLocality(finalLocality);
    showToast(`📍 Delivering to ${finalLocality}, ${finalCity}`);
  }

  function handleProceedToCheckout() {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(false);
    navigateToView('checkout');
  }

  function handleOpenCartView() {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(false);
    navigateToView('checkout');
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

  // Dedicated Full-Page Admin Dashboard Routing (/admin/*)
  if (isAdminRoute) {
    return (
      <AdminRouter
        onLogout={handleLogout}
        onExitToMarketplace={() => {
          setIsAdminRoute(false);
          navigateToView('home');
        }}
      />
    );
  }

  // Dedicated Full-Page Professional / Worker Dashboard Routing (/professional/*)
  if (isProfessionalRoute) {
    return (
      <ProfessionalRouter
        onLogout={handleLogout}
        onExitToMarketplace={() => {
          setIsProfessionalRoute(false);
          navigateToView('home');
        }}
      />
    );
  }

  // Dedicated Full-Page Business Partner Dashboard Routing (/partner/*)
  if (isPartnerRoute) {
    return (
      <PartnerRouter
        onLogout={handleLogout}
        onExitToMarketplace={() => {
          setIsPartnerRoute(false);
          navigateToView('home');
        }}
      />
    );
  }

  // Dedicated Full-Page Customer Review Routing (/review/:bookingId)
  if (isReviewRoute) {
    const rawBookingId = window.location.pathname.replace('/review/', '').split('/')[0] || '';
    return (
      <WorkerReviewPage
        bookingId={rawBookingId}
        onNavigateHome={() => {
          setIsReviewRoute(false);
          navigateToView('home');
        }}
      />
    );
  }

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
          onBackHome={handleBackHome}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onOpenCart={handleOpenCartView}
          onOpenCheckout={handleProceedToCheckout}
          showToast={showToast}
          services={services}
        />
      ) : currentView === 'chimney-service-page' ? (
        <ChimneyServicePage
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
          onBackHome={handleBackHome}
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
      ) : currentView === 'painting-service-page' ? (
        <PaintingServicePage
          onBackHome={handleBackHome}
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
      ) : isCheckoutRoute || currentView === 'checkout' ? (
        <UrbanCheckoutPage
          onBackHome={handleBackHome}
          cart={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          selectedCity={selectedCity}
          selectedLocality={selectedLocality}
          onSelectLocation={handleLocationSelect}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          user={user}
          onOpenAuth={handleOpenAuth}
          savedAddresses={savedAddresses}
          onAddAddress={handleAddAddress}
          onConfirmOrder={handleConfirmOrder}
          showToast={showToast}
          hasUCPlus={hasUCPlus}
          onToggleUCPlus={handleOpenUCPlusPayment}
        />
      ) : isAboutRoute || currentView === 'about-us' ? (
        <AboutUsPage
          onBackHome={handleBackHome}
          onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
          onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
          onOpenAuth={handleOpenAuth}
          onOpenContact={() => {
            const footerEl = document.querySelector('.uc-footer');
            if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth' });
          }}
          user={user}
          selectedCity={selectedCity}
          onSelectCity={(city) => {
            const matchedKey = Object.keys(CITY_LOCALITIES).find(
              k => k.toLowerCase() === (city || '').trim().toLowerCase()
            );
            const defaultLocality = (matchedKey && CITY_LOCALITIES[matchedKey]?.[0])
              || 'Central';
            handleLocationSelect(city, defaultLocality);
          }}
          onOpenPartnerDashboard={() => {
            window.history.pushState({}, '', '/partner');
            setIsPartnerRoute(true);
          }}
          onOpenProfessionalPortal={handleOpenProfessionalPortal}
          onOpenAdminPortal={handleOpenAdminPortal}
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
        bookingsCount={(user ? customerBookings : bookings).filter(b => b.status !== 'Cancelled').length}
        activeBooking={latestLiveBooking}
        onOpenChat={() => setActiveChatBooking(latestLiveBooking)}
        onOpenAddresses={() => setIsAddressModalOpen(true)}
        addressesCount={savedAddresses.length}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenAdminDashboard={handleOpenAdminPortal}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenPartnerDashboard={handleOpenPartnerPortal}
        onOpenProfessionalDashboard={handleOpenProfessionalPortal}
        onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
        onOpenPartnerOnboarding={() => setIsPartnerOnboardingOpen(true)}
        onLogout={handleLogout}
        services={services}
        onSelectService={(s) => {
          if (s?.title?.toLowerCase().includes('lock') || s?.subcategory?.toLowerCase().includes('lock') || s?.id?.includes('lock')) {
            navigateToView('native-smart-locks-page');
          } else if (s?.title?.toLowerCase().includes('purifier') || s?.subcategory?.toLowerCase().includes('purifier') || s?.id?.includes('purifier')) {
            if (s?.title?.toLowerCase().includes('repair') || s?.title?.toLowerCase().includes('service') || s?.id?.includes('repair') || s?.id?.includes('service')) {
              navigateToView('water-purifier-service-page');
            } else {
              navigateToView('native-purifier-page');
            }
          } else if (s?.title?.toLowerCase().includes('refrigerator') || s?.subcategory?.toLowerCase().includes('refrigerator') || s?.id?.includes('refrigerator') || s?.title?.toLowerCase().includes('fridge')) {
            navigateToView('refrigerator-service-page');
          } else if (s?.title?.toLowerCase().includes('washing') || s?.subcategory?.toLowerCase().includes('washing') || s?.id?.includes('washing') || s?.title?.toLowerCase().includes('washer')) {
            navigateToView('washing-machine-service-page');
          } else if (s?.title?.toLowerCase().includes('microwave') || s?.subcategory?.toLowerCase().includes('microwave') || s?.id?.includes('microwave')) {
            navigateToView('microwave-service-page');
          } else if (s?.title?.toLowerCase().includes('television') || s?.subcategory?.toLowerCase().includes('television') || s?.id?.includes('television') || s?.title?.toLowerCase().includes('tv') || s?.id?.includes('tv')) {
            navigateToView('television-service-page');
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
              navigateToView('plumber-service-page');
            } else if (trade === 'carpenter') {
              navigateToView('carpenter-service-page');
            } else {
              navigateToView('electrician-service-page');
            }
          } else if (
            s?.title?.toLowerCase().includes('cockroach') ||
            s?.subcategory?.toLowerCase().includes('pest') ||
            s?.title?.toLowerCase().includes('pest') ||
            s?.id?.includes('cockroach') ||
            s?.id?.includes('pest')
          ) {
            navigateToView('cockroach-control-page');
          } else if (
            s?.title?.toLowerCase().includes('full home') ||
            s?.title?.toLowerCase().includes('furnished') ||
            s?.title?.toLowerCase().includes('unfurnished') ||
            s?.title?.toLowerCase().includes('sofa') ||
            s?.title?.toLowerCase().includes('carpet') ||
            s?.subcategory?.toLowerCase().includes('full home') ||
            s?.id?.includes('full-home')
          ) {
            navigateToView('full-home-cleaning-page');
          } else if (
            s?.title?.toLowerCase().includes('kitchen') ||
            s?.subcategory?.toLowerCase().includes('kitchen') ||
            s?.id?.includes('kitchen')
          ) {
            navigateToView('kitchen-cleaning-page');
          } else if (
            s?.title?.toLowerCase().includes('bathroom') ||
            s?.subcategory?.toLowerCase().includes('bathroom') ||
            s?.id?.includes('bathroom')
          ) {
            navigateToView('bathroom-cleaning-page');
          } else if (
            s?.title?.toLowerCase().includes('ac') ||
            s?.subcategory?.toLowerCase().includes('ac') ||
            s?.category === 'ac-appliances' ||
            s?.id?.includes('ac') ||
            s?.id?.includes('srv-')
          ) {
            navigateToView('ac-service-page');
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
            navigateToView('ac-service-page');
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
            navigateToView('native-purifier-page');
          }}
          onOpenSalonPrimePage={() => {
            navigateToView('salon-prime-page');
          }}
          onOpenHairStudioPage={() => {
            navigateToView('hair-studio-page');
          }}
          onOpenSmartLocksPage={() => {
            navigateToView('native-smart-locks-page');
          }}
          onSelectCategory={(catId) => {
            handleCategorySelection(catId);
          }}
          onOpenMenSalonPreference={() => setIsMenSalonPreferenceOpen(true)}
        />

        {/* Homes Extended Sections (Promo banners, New & noteworthy, Most booked, Appliances, Cleaning) */}
        {activeNavTab === 'homes' && (
          <HomesSections
            services={services}
            onSelectService={(s) => {
              if (s?.category === 'ac-appliances' || s?.title?.toLowerCase().includes('ac') || s?.id?.includes('srv-')) {
                navigateToView('ac-service-page');
              } else {
                setSelectedDetailService(s);
              }
            }}
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
              navigateToView('ac-service-page');
            }}
            onOpenChimneyPage={() => {
              navigateToView('chimney-service-page');
            }}
            onOpenLaptopPage={() => {
              navigateToView('laptop-service-page');
            }}
            onOpenRefrigeratorPage={() => {
              navigateToView('refrigerator-service-page');
            }}
            onOpenWashingMachinePage={() => {
              navigateToView('washing-machine-service-page');
            }}
            onOpenMicrowavePage={() => {
              navigateToView('microwave-service-page');
            }}
            onOpenTelevisionPage={() => {
              navigateToView('television-service-page');
            }}
            onOpenCleaningModal={() => setIsCleaningModalOpen(true)}
            onOpenFullCleaningModal={() => setIsFullCleaningModalOpen(true)}
            onOpenSmartLocksPage={() => {
              navigateToView('native-smart-locks-page');
            }}
            onOpenPurifierPage={() => {
              navigateToView('native-purifier-page');
            }}
            onOpenWaterPurifierServicePage={() => {
              navigateToView('water-purifier-service-page');
            }}
            onOpenBathroomCleaningPage={() => {
              navigateToView('bathroom-cleaning-page');
            }}
            onOpenKitchenCleaningPage={() => {
              navigateToView('kitchen-cleaning-page');
            }}
            onOpenFullHomeCleaningPage={() => {
              navigateToView('full-home-cleaning-page');
            }}
            onOpenCockroachControlPage={() => {
              navigateToView('cockroach-control-page');
            }}
            onOpenPaintingPage={() => {
              navigateToView('painting-service-page');
            }}
          />
        )}



        {/* Homes Extended Trust & Review Sections */}
        {activeNavTab === 'homes' && (
          <>
            {/* Native by UC Spotlight Showcase */}
            <NativeSpotlightSection
              onExploreNative={() => {
                navigateToView('native-purifier-page');
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
        onOpenPartnerDashboard={() => {
          window.history.pushState({}, '', '/partner');
          setIsPartnerRoute(true);
        }}
        onOpenPartnerOnboarding={() => {
          window.history.pushState({}, '', '/partner/onboarding');
          setIsPartnerRoute(true);
        }}
        onOpenWorkerOnboarding={() => setIsWorkerOnboardingOpen(true)}
        onOpenProfessionalPortal={handleOpenProfessionalPortal}
        onOpenAdminPortal={handleOpenAdminPortal}
        onOpenAbout={handleOpenAbout}
      />
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
        onToggleUCPlus={handleOpenUCPlusPayment}
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

      {/* 4.5. UC Plus Membership Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isUCPlusPaymentOpen}
        onClose={() => setIsUCPlusPaymentOpen(false)}
        amount={299}
        user={user}
        slot="Instant Activation (6 Months)"
        address={selectedLocality ? `${selectedLocality}, ${selectedCity}` : selectedCity}
        items={[
          {
            id: 'uc_plus_membership',
            title: 'UC Plus VIP Membership (6 Months Validity)',
            price: 299,
            qty: 1
          }
        ]}
        onPaymentSuccess={handleUCPlusPaymentSuccess}
        hideCOD={true}
      />

      {/* 5. Live Order Tracker Modal */}
      <OrderTrackingModal
        booking={activeTrackingBooking}
        onClose={() => setActiveTrackingBooking(null)}
      />

      {/* Persistent Floating Real-Time Live Order & Chat Bar */}
      {latestLiveBooking && !activeTrackingBooking && !activeChatBooking && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9990,
            background: 'linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%)',
            color: '#FFFFFF',
            borderRadius: 50,
            padding: '8px 16px 8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 12px 28px rgba(76, 29, 149, 0.45), 0 0 0 1px rgba(255,255,255,0.15)',
            border: '1.5px solid #8B5CF6'
          }}
        >
          <div
            onClick={() => setActiveTrackingBooking(latestLiveBooking)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            title="Click to view Live GPS Tracking"
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}>
              🛵
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#F3E8FF' }}>Live Service Active</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              </div>
              <div style={{ fontSize: 11, color: '#DDD6FE' }}>
                {latestLiveBooking.assignedProfessional?.name || latestLiveBooking.assignedPartner || 'Technician'} • Track ➔
              </div>
            </div>
          </div>

          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)' }} />

          {/* Quick-Chat Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveChatBooking(latestLiveBooking);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.15s'
            }}
            title="Chat in real-time with your assigned professional (Rapido Style)"
          >
            <span>💬 Chat</span>
          </button>
        </div>
      )}

      {/* 6. My Bookings Modal */}
      <MyBookingsModal
        isOpen={isBookingsModalOpen}
        onClose={() => setIsBookingsModalOpen(false)}
        bookings={customerBookings}
        currentUser={user}
        onOpenAuth={handleOpenAuth}
        onTrackBooking={(b) => {
          setActiveTrackingBooking(b);
          setLatestLiveBooking(b);
        }}
        onUpdateBookingSlot={handleUpdateBookingSlot}
        onUpdateBookingAddress={handleUpdateBookingAddress}
        onCancelBooking={handleCancelBooking}
        onDeleteBookingHistory={handleDeleteBookingHistory}
      />

      {/* Top-Level Rapido-Style Real-Time Customer Chat Drawer */}
      {activeChatBooking && (
        <RapidoChatDrawer
          isOpen={Boolean(activeChatBooking)}
          onClose={() => setActiveChatBooking(null)}
          booking={activeChatBooking}
          currentUser={{
            role: 'customer',
            id: activeChatBooking.userId || activeChatBooking.userPhone || (activeChatBooking.id ? `cust-${activeChatBooking.id}` : 'cust-user'),
            name: activeChatBooking.userName || user?.name || 'Customer',
            phone: activeChatBooking.userPhone || user?.phone
          }}
        />
      )}

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
        onOpenAdminDashboard={handleOpenAdminPortal}
        onOpenProfessionalDashboard={handleOpenProfessionalPortal}
        onOpenPartnerDashboard={handleOpenPartnerPortal}
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          // Instantly broadcast new customer registration across all tabs to Admin Dashboard
          try {
            const syncChannel = new BroadcastChannel('uc_sync_channel');
            syncChannel.postMessage({ type: 'CUSTOMER_CREATED', customer: loggedInUser, timestamp: Date.now() });
            syncChannel.close();
          } catch (e) {}
          try {
            localStorage.setItem('uc_last_customer_event', JSON.stringify({ type: 'CUSTOMER_CREATED', customer: loggedInUser, timestamp: Date.now() }));
          } catch (e) {}

          if (loggedInUser.role === 'admin') {
            setIsAdminAuthenticated(true);
            try {
              sessionStorage.setItem('uc_admin_auth', 'true');
              localStorage.setItem('uc_admin_auth', 'true');
            } catch {}
            window.history.pushState({}, '', '/admin');
            setIsAdminRoute(true);
            showToast(`🛡️ Admin Operations Dashboard opened for ${loggedInUser.name}!`);
          } else if (loggedInUser.role === 'professional') {
            handleOpenProfessionalPortal();
            showToast(`⚡ Professional Service Hub opened for ${loggedInUser.name}!`);
          } else if (loggedInUser.role === 'partner') {
            handleOpenPartnerPortal();
            showToast(`🏢 Partner Agency Portal opened for ${loggedInUser.agencyName || loggedInUser.name}!`);
          } else {
            showToast(`✨ Welcome, ${loggedInUser.name || 'User'}! Logged in successfully.`);
          }
        }}
        onLogout={handleLogout}
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
        user={user}
      />

      {/* 11B. Urban Company Professional Technician Companion Hub */}
      <ProfessionalDashboardModal
        isOpen={isProfessionalDashboardOpen}
        onClose={() => setIsProfessionalDashboardOpen(false)}
        user={user}
        onShowToast={showToast}
        onOpenFullPortal={handleOpenProfessionalPortal}
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
