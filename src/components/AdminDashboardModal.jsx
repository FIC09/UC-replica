import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Wrench, 
  Users, 
  TrendingUp, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Star, 
  ShieldCheck, 
  Tag, 
  ChevronRight,
  Phone, 
  Check, 
  HardHat, 
  Building2, 
  LogOut,
  Lock,
  Eye,
  Download,
  CloudRain,
  Bell,
  ArrowUpRight,
  Sparkles,
  Sliders,
  FileText,
  RefreshCw,
  UserPlus,
  MapPin,
  Briefcase,
  IndianRupee,
  Power
} from 'lucide-react';
import { CATEGORIES } from '../data/servicesData';

export function AdminDashboardModal({
  isOpen,
  onClose,
  services = [],
  monsoonSurge: monsoonSurgeProp,
  onToggleMonsoonSurge,
  onAddService,
  onUpdateService,
  onDeleteService,
  onResetServices,
  onOpenCreateService: _onOpenCreateService,
  onOpenPartnerOnboarding,
  workerApplications = [],
  onUpdateWorkerApplicationStatus,
  onDeleteWorkerApplication,
  partnerApplications = [],
  onUpdatePartnerApplicationStatus,
  onDeletePartnerApplication,
  onOpenWorkerOnboarding,
  onAdminLogout,
  bookings = [],
  onUpdateBookingStatus,
  onCancelBooking,
  onDeleteBookingHistory: _onDeleteBookingHistory,
  onShowToast
}) {
  // Navigation tabs:
  // 'overview', 'worker-apps', 'partner-apps', 'services', 'partners', 'orders', 'coupons'
  const [activeTab, setActiveTab] = useState('overview');

  // Multi-hub city selector (Default to Krishnagiri)
  const [selectedCity, setSelectedCity] = useState('Krishnagiri');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Operational Controls: Monsoon Weather Surge Pricing
  const [monsoonSurge, setMonsoonSurge] = useState(() => {
    if (typeof monsoonSurgeProp === 'boolean') return monsoonSurgeProp;
    try {
      return localStorage.getItem('uc_admin_monsoon_surge') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof monsoonSurgeProp === 'boolean') {
      setMonsoonSurge(monsoonSurgeProp);
    }
  }, [monsoonSurgeProp]);

  // Operational Controls: Broadcast Alert
  const [broadcastMsg, setBroadcastMsg] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_admin_broadcast');
      if (saved && !saved.includes('Mumbai')) return saved;
      return 'Monsoon Advisory: Normal dispatch timelines across all Krishnagiri zones';
    } catch {
      return 'Monsoon Advisory: Normal dispatch timelines across all Krishnagiri zones';
    }
  });
  const [isEditingBroadcast, setIsEditingBroadcast] = useState(false);
  const [broadcastInput, setBroadcastInput] = useState(broadcastMsg);

  // Floating Toast inside Admin
  const [adminToast, setAdminToast] = useState('');
  function showLocalToast(msg) {
    setAdminToast(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => setAdminToast(''), 3000);
  }

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_admin_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'log-1', action: 'System Initialization', detail: 'Operations Hub live synchronization active for Mumbai', time: '10 mins ago', type: 'system' },
      { id: 'log-2', action: 'Worker Registered', detail: 'New worker application received from Bandra West', time: '25 mins ago', type: 'worker' },
      { id: 'log-3', action: 'Dispatch Auto-Assigned', detail: 'Order #ORD-9841 assigned to Rajesh Kumar (AC Master Pro)', time: '40 mins ago', type: 'dispatch' }
    ];
  });

  function addAuditLog(action, detail, type = 'info') {
    const newLog = {
      id: `log-${Date.now()}`,
      action,
      detail,
      time: 'Just now',
      type
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('uc_admin_audit_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }

  function toggleMonsoonSurge() {
    const nextVal = !monsoonSurge;
    setMonsoonSurge(nextVal);
    try {
      localStorage.setItem('uc_admin_monsoon_surge', String(nextVal));
    } catch {}
    if (onToggleMonsoonSurge) {
      onToggleMonsoonSurge(nextVal);
    }
    addAuditLog('Surge Pricing', `Monsoon Rain Surge ${nextVal ? 'ACTIVATED (+₹49 Partner Rain Allowance)' : 'DEACTIVATED'}`, 'system');
    showLocalToast(`🌧️ Monsoon Weather Surge ${nextVal ? 'ENABLED (+₹49 added to catalogue)' : 'DISABLED (Base pricing restored)'}`);
  }

  function handleSaveBroadcast(e) {
    e.preventDefault();
    setBroadcastMsg(broadcastInput.trim());
    try {
      localStorage.setItem('uc_admin_broadcast', broadcastInput.trim());
    } catch {}
    setIsEditingBroadcast(false);
    addAuditLog('Broadcast Update', `Operations broadcast updated: "${broadcastInput.trim()}"`, 'system');
    showLocalToast('📢 Broadcast banner updated across Mumbai hubs');
  }

  // ==========================================
  // PARTNERS FLEET STATE
  // ==========================================
  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_admin_partners');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'p-1',
        name: 'Rajesh Kumar',
        trade: 'AC & Appliance Master Pro',
        category: 'ac-appliances',
        rating: 4.92,
        reviewsCount: 384,
        jobsCompleted: 1480,
        locality: 'Bandra & Khar',
        status: 'Online',
        phone: '+91 98201 44521',
        email: 'rajesh.pro@urbancompany.com',
        kycVerified: true,
        policeVerified: true,
        todayEarnings: 2850,
        joinedDate: 'Jan 2023',
        vehicle: 'Honda Activa (MH-02-CB-1294)'
      },
      {
        id: 'p-2',
        name: 'Priya Sharma',
        trade: 'Women’s Salon & Skin Specialist',
        category: 'womens-salon',
        rating: 4.96,
        reviewsCount: 512,
        jobsCompleted: 1890,
        locality: 'Powai & Chandivali',
        status: 'On Job',
        phone: '+91 98192 33412',
        email: 'priya.salon@urbancompany.com',
        kycVerified: true,
        policeVerified: true,
        todayEarnings: 3400,
        joinedDate: 'Mar 2022',
        vehicle: 'Hero Pleasure (MH-03-DF-8812)'
      },
      {
        id: 'p-3',
        name: 'Amit Shinde',
        trade: 'Electrician & Quick Repairs',
        category: 'quick-repairs',
        rating: 4.88,
        reviewsCount: 240,
        jobsCompleted: 940,
        locality: 'Andheri West & Juhu',
        status: 'Online',
        phone: '+91 98334 77120',
        email: 'amit.repairs@urbancompany.com',
        kycVerified: true,
        policeVerified: true,
        todayEarnings: 1950,
        joinedDate: 'Aug 2023',
        vehicle: 'TVS Jupiter (MH-02-EE-4510)'
      },
      {
        id: 'p-4',
        name: 'Manoj Jadhav',
        trade: 'Deep Cleaning & Pest Machine Tech',
        category: 'cleaning-pest',
        rating: 4.85,
        reviewsCount: 190,
        jobsCompleted: 760,
        locality: 'Worli & Dadar',
        status: 'Offline',
        phone: '+91 98211 99043',
        email: 'manoj.clean@urbancompany.com',
        kycVerified: true,
        policeVerified: true,
        todayEarnings: 0,
        joinedDate: 'Nov 2023',
        vehicle: 'Bajaj Pulsar (MH-01-BK-3391)'
      },
      {
        id: 'p-5',
        name: 'Suresh Patil',
        trade: 'Native Water Purifier Engineer',
        category: 'water-purifier',
        rating: 4.94,
        reviewsCount: 310,
        jobsCompleted: 1120,
        locality: 'South Mumbai & Colaba',
        status: 'Online',
        phone: '+91 98920 11456',
        email: 'suresh.native@urbancompany.com',
        kycVerified: true,
        policeVerified: true,
        todayEarnings: 2600,
        joinedDate: 'May 2022',
        vehicle: 'Honda Shine (MH-01-AL-9021)'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_admin_partners', JSON.stringify(partners));
    } catch {}
  }, [partners]);

  // Partner Fleet Filtering State
  const [fleetStatusFilter, setFleetStatusFilter] = useState('ALL'); // ALL, Online, On Job, Offline
  const [fleetTradeFilter, setFleetTradeFilter] = useState('ALL');
  const [fleetZoneFilter, setFleetZoneFilter] = useState('ALL');
  const [fleetSearchTerm, setFleetSearchTerm] = useState('');

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchStatus = fleetStatusFilter === 'ALL' || p.status === fleetStatusFilter;
      const matchTrade = fleetTradeFilter === 'ALL' || p.category === fleetTradeFilter;
      const matchZone = fleetZoneFilter === 'ALL' || p.locality.toLowerCase().includes(fleetZoneFilter.toLowerCase());
      const q = fleetSearchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.trade.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.locality.toLowerCase().includes(q);
      return matchStatus && matchTrade && matchZone && matchSearch;
    });
  }, [partners, fleetStatusFilter, fleetTradeFilter, fleetZoneFilter, fleetSearchTerm]);

  function togglePartnerStatus(partnerId) {
    setPartners(prev => prev.map(p => {
      if (p.id !== partnerId) return p;
      const nextStatus = p.status === 'Online' ? 'Offline' : 'Online';
      addAuditLog('Partner Fleet', `${p.name} shifted to ${nextStatus}`, 'partner');
      return { ...p, status: nextStatus };
    }));
  }

  // Add Partner Pro Modal
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [newProName, setNewProName] = useState('');
  const [newProTrade, setNewProTrade] = useState('AC & Appliance Repair');
  const [newProCategory, setNewProCategory] = useState('ac-appliances');
  const [newProLocality, setNewProLocality] = useState('Bandra West');
  const [newProPhone, setNewProPhone] = useState('');

  function handleCreatePartner(e) {
    e.preventDefault();
    if (!newProName.trim() || !newProPhone.trim()) return;
    const newPartner = {
      id: `p-${Date.now()}`,
      name: newProName.trim(),
      trade: newProTrade.trim(),
      category: newProCategory,
      rating: 5.0,
      reviewsCount: 1,
      jobsCompleted: 0,
      locality: newProLocality,
      status: 'Online',
      phone: newProPhone.trim(),
      email: `${newProName.toLowerCase().replace(/\s+/g, '.')}@urbancompany.com`,
      kycVerified: true,
      policeVerified: true,
      todayEarnings: 0,
      joinedDate: 'Today',
      vehicle: 'Motorbike (MH Verified)'
    };
    setPartners(prev => [newPartner, ...prev]);
    setIsAddPartnerOpen(false);
    setNewProName('');
    setNewProPhone('');
    addAuditLog('Partner Onboarded', `Onboarded ${newPartner.name} into verified Mumbai fleet`, 'partner');
    showLocalToast(`🎉 Added ${newPartner.name} to Active Fleet!`);
  }

  // ==========================================
  // LIVE ORDERS DISPATCH STATE
  // ==========================================
  const [seedOrders, setSeedOrders] = useState([
    {
      id: 'ORD-9841',
      customer: 'Kavita Singhal',
      phone: '+91 98204 88120',
      locality: 'Bandra West, Mumbai',
      service: 'Powerjet AC Servicing (Split)',
      amount: 499,
      partner: 'Rajesh Kumar',
      status: 'In Progress',
      time: '10 mins ago',
      paymentMethod: 'UPI (GPay)',
      slot: 'Today, 02:00 PM - 03:00 PM'
    },
    {
      id: 'ORD-9840',
      customer: 'Aditya Mehta',
      phone: '+91 98191 77341',
      locality: 'Powai, Mumbai',
      service: 'Rica Roll-on Waxing & Facial',
      amount: 1199,
      partner: 'Priya Sharma',
      status: 'In Transit',
      time: '24 mins ago',
      paymentMethod: 'Online Card',
      slot: 'Today, 03:30 PM - 04:30 PM'
    },
    {
      id: 'ORD-9839',
      customer: 'Rohit Verma',
      phone: '+91 98335 11902',
      locality: 'Andheri West, Mumbai',
      service: 'Switchboard Repair & Socket Fix',
      amount: 149,
      partner: 'Amit Shinde',
      status: 'Assigned',
      time: '35 mins ago',
      paymentMethod: 'Pay After Service',
      slot: 'Today, 04:00 PM - 05:00 PM'
    },
    {
      id: 'ORD-9838',
      customer: 'Dr. Neha Rao',
      phone: '+91 98920 44109',
      locality: 'Worli, Mumbai',
      service: 'Native M2 Copper RO Installation',
      amount: 15499,
      partner: 'Suresh Patil',
      status: 'Completed',
      time: '1 hr ago',
      paymentMethod: 'NetBanking (HDFC)',
      slot: 'Today, 11:00 AM - 12:00 PM'
    }
  ]);

  const allLiveOrders = useMemo(() => {
    const formattedRealBookings = bookings.map(b => ({
      id: b.id,
      customer: b.customerName || 'Rahul Sharma (Customer App)',
      phone: b.customerPhone || '+91 98201 44521',
      locality: b.address ? b.address.split(',').slice(-2).join(',').trim() : 'Mumbai Hub',
      service: b.items && b.items[0] ? b.items[0].title : 'Doorstep Service',
      amount: b.totalAmount || 548,
      partner: b.assignedPartner || 'Unassigned (Auto-matching...)',
      status: b.status === 'Confirmed' ? 'Assigned' : b.status,
      time: b.createdAt || 'Recent',
      paymentMethod: b.paymentMethod || 'UPI',
      slot: b.slot || 'ASAP Delivery',
      isCustomerBooking: true
    }));

    return [...formattedRealBookings, ...seedOrders];
  }, [bookings, seedOrders]);

  function handleAdvanceOrderStatus(orderId) {
    const realMatch = bookings.find(b => b.id === orderId);
    if (realMatch && onUpdateBookingStatus) {
      let nextStatus = 'Assigned';
      if (realMatch.status === 'Confirmed' || realMatch.status === 'Assigned') nextStatus = 'In Transit';
      else if (realMatch.status === 'In Transit') nextStatus = 'In Progress';
      else if (realMatch.status === 'In Progress') nextStatus = 'Completed';
      onUpdateBookingStatus(orderId, nextStatus, realMatch.assignedPartner || 'Rajesh Kumar');
      addAuditLog('Order Dispatch', `Order ${orderId} moved to ${nextStatus}`, 'dispatch');
      showLocalToast(`Order ${orderId} advanced to "${nextStatus}"`);
      return;
    }

    setSeedOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      let nextStatus = o.status;
      if (o.status === 'Assigned') nextStatus = 'In Transit';
      else if (o.status === 'In Transit') nextStatus = 'In Progress';
      else if (o.status === 'In Progress') nextStatus = 'Completed';
      addAuditLog('Order Dispatch', `Order ${orderId} advanced to ${nextStatus}`, 'dispatch');
      showLocalToast(`Order ${orderId} advanced to "${nextStatus}"`);
      return { ...o, status: nextStatus };
    }));
  }

  function handleAssignPartnerToOrder(orderId, partnerName) {
    const realMatch = bookings.find(b => b.id === orderId);
    if (realMatch && onUpdateBookingStatus) {
      onUpdateBookingStatus(orderId, 'Assigned', partnerName);
    } else {
      setSeedOrders(prev => prev.map(o => o.id === orderId ? { ...o, partner: partnerName, status: 'Assigned' } : o));
    }
    addAuditLog('Dispatch Assignment', `Assigned pro ${partnerName} to order ${orderId}`, 'dispatch');
    showLocalToast(`Dispatched ${partnerName} to #${orderId}`);
  }

  // ==========================================
  // SERVICES PAUSED / ACTIVE STATE
  // ==========================================
  const [pausedServiceIds, setPausedServiceIds] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_admin_paused_services');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  function toggleServicePaused(serviceId) {
    setPausedServiceIds(prev => {
      const isPaused = prev.includes(serviceId);
      const next = isPaused ? prev.filter(id => id !== serviceId) : [...prev, serviceId];
      try {
        localStorage.setItem('uc_admin_paused_services', JSON.stringify(next));
      } catch {}
      addAuditLog('Service Toggle', `Service ID ${serviceId} ${isPaused ? 'RESUMED' : 'PAUSED'}`, 'service');
      showLocalToast(`Service ${isPaused ? 'is now ACTIVE' : 'is now PAUSED'}`);
      return next;
    });
  }

  // ==========================================
  // SERVICE FORM STATE (Add / Edit)
  // ==========================================
  const [editingService, setEditingService] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('ac-appliances');
  const [formSubcategory, setFormSubcategory] = useState('General Service');
  const [formPrice, setFormPrice] = useState(499);
  const [formOriginalPrice, setFormOriginalPrice] = useState(799);
  const [formDuration, setFormDuration] = useState('45 mins');
  const [formBadge, setFormBadge] = useState('POPULAR');
  const [formImage, setFormImage] = useState('/images/categories/cat_ac.jpg');
  const [formDescription, setFormDescription] = useState('');
  const [formInclusions, setFormInclusions] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');
  const [serviceSortBy, setServiceSortBy] = useState('default');

  function handleStartEdit(svc) {
    setEditingService(svc);
    setFormTitle(svc.title);
    setFormCategory(svc.category);
    setFormSubcategory(svc.subcategory || 'General Service');
    setFormPrice(svc.price);
    setFormOriginalPrice(svc.originalPrice || svc.price + 300);
    setFormDuration(svc.duration || '45 mins');
    setFormBadge(svc.badge || 'POPULAR');
    setFormImage(svc.image || '/images/categories/cat_ac.jpg');
    setFormDescription(svc.description || '');
    setFormInclusions(Array.isArray(svc.inclusions) ? svc.inclusions.join('\n') : '');
    setIsFormOpen(true);
    setActiveTab('services');
  }

  function handleOpenCreate() {
    setEditingService(null);
    setFormTitle('');
    setFormCategory('ac-appliances');
    setFormSubcategory('General Service');
    setFormPrice(499);
    setFormOriginalPrice(799);
    setFormDuration('45 mins');
    setFormBadge('POPULAR');
    setFormImage('/images/categories/cat_ac.jpg');
    setFormDescription('');
    setFormInclusions('');
    setIsFormOpen(true);
  }

  function handleSaveService(e) {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const inclusionsArr = formInclusions
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      subcategory: formSubcategory.trim(),
      price: Number(formPrice) || 499,
      originalPrice: Number(formOriginalPrice) || Number(formPrice) + 300,
      duration: formDuration.trim() || '45 mins',
      badge: formBadge.trim().toUpperCase(),
      image: formImage.trim() || '/images/categories/cat_ac.jpg',
      description: formDescription.trim(),
      inclusions: inclusionsArr.length > 0 ? inclusionsArr : ['Standard expert doorstep service', 'Verified professional tooling']
    };

    if (editingService) {
      onUpdateService(editingService.id, payload);
      setFormSuccess(`Updated "${payload.title}" successfully!`);
      addAuditLog('Catalogue Update', `Modified service "${payload.title}" (₹${payload.price})`, 'service');
      showLocalToast(`✓ Updated "${payload.title}"`);
    } else {
      const newService = {
        ...payload,
        id: `svc-${Date.now()}`,
        rating: 4.88,
        reviewsCount: '1 review'
      };
      onAddService(newService);
      setFormSuccess(`Created "${payload.title}" in catalogue!`);
      addAuditLog('Catalogue Create', `Added new service "${payload.title}" (₹${payload.price})`, 'service');
      showLocalToast(`✨ Created "${payload.title}"`);
    }

    setTimeout(() => {
      setFormSuccess('');
      setEditingService(null);
      setIsFormOpen(false);
    }, 1200);
  }

  const PRESET_IMAGES = [
    { label: 'AC Service', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Cleaning & Pest', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
    { label: 'Salon & Care', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80' },
    { label: 'Electrician Tool', url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80' },
    { label: 'Native Purifier', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' }
  ];

  // Bulk Price Adjuster Modal
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
  const [bulkAdjustmentPercent, setBulkAdjustmentPercent] = useState(10);

  function handleApplyBulkPrice(type) {
    services.forEach(s => {
      const multiplier = type === 'increase' ? (1 + bulkAdjustmentPercent / 100) : (1 - bulkAdjustmentPercent / 100);
      const newPrice = Math.round(s.price * multiplier);
      onUpdateService(s.id, { ...s, price: newPrice });
    });
    setIsBulkPriceOpen(false);
    addAuditLog('Bulk Price Adjust', `Adjusted catalogue pricing by ${type === 'increase' ? '+' : '-'}${bulkAdjustmentPercent}%`, 'service');
    showLocalToast(`Updated catalogue prices by ${type === 'increase' ? '+' : '-'}${bulkAdjustmentPercent}%`);
  }

  const filteredServices = useMemo(() => {
    let list = services.filter(s => {
      const matchCat = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
      const q = serviceSearchTerm.toLowerCase().trim();
      const matchSearch = !q || 
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.subcategory || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const surgeAmt = monsoonSurge ? 49 : 0;
    if (serviceSortBy === 'price-asc') {
      list = [...list].sort((a, b) => (Number(a.price || 0) + surgeAmt) - (Number(b.price || 0) + surgeAmt));
    } else if (serviceSortBy === 'price-desc') {
      list = [...list].sort((a, b) => (Number(b.price || 0) + surgeAmt) - (Number(a.price || 0) + surgeAmt));
    } else if (serviceSortBy === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [services, serviceCategoryFilter, serviceSearchTerm, serviceSortBy, monsoonSurge]);

  // ==========================================
  // COUPONS STATE
  // ==========================================
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('uc_admin_coupons');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { code: 'UCPLUS10', discount: '10% OFF', max: '₹150', minOrder: 499, status: 'Active', used: 3420 },
      { code: 'MUMBAIFIRST', discount: '₹100 FLAT', max: '₹100', minOrder: 399, status: 'Active', used: 8900 },
      { code: 'COOL20', discount: '20% OFF', max: '₹300', minOrder: 799, status: 'Active', used: 1250 },
      { code: 'NATIVE500', discount: '₹500 FLAT', max: '₹500', minOrder: 4999, status: 'Active', used: 410 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uc_admin_coupons', JSON.stringify(coupons));
    } catch {}
  }, [coupons]);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponMax, setNewCouponMax] = useState('₹200');
  const [newCouponMin, setNewCouponMin] = useState(499);

  function handleCreateCoupon(e) {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount.trim()) return;
    const newCoupon = {
      code: newCouponCode.trim().toUpperCase(),
      discount: newCouponDiscount.trim(),
      max: newCouponMax.trim() || '₹200',
      minOrder: Number(newCouponMin) || 0,
      status: 'Active',
      used: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    addAuditLog('Coupon Created', `Published coupon ${newCoupon.code} (${newCoupon.discount})`, 'coupon');
    showLocalToast(`🎉 Published promo coupon: ${newCoupon.code}`);
  }

  function toggleCouponStatus(code) {
    setCoupons(prev => prev.map(c => {
      if (c.code !== code) return c;
      const next = c.status === 'Active' ? 'Paused' : 'Active';
      addAuditLog('Coupon Status', `Coupon ${code} switched to ${next}`, 'coupon');
      return { ...c, status: next };
    }));
  }

  function handleDeleteCoupon(code) {
    setCoupons(prev => prev.filter(c => c.code !== code));
    addAuditLog('Coupon Deleted', `Removed coupon ${code}`, 'coupon');
    showLocalToast(`Deleted coupon ${code}`);
  }

  // ==========================================
  // WORKER APPLICATIONS QUEUE
  // ==========================================
  const [workerFilterStatus, setWorkerFilterStatus] = useState('ALL');
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [workerTradeFilter, setWorkerTradeFilter] = useState('ALL');

  function handleApproveWorker(app) {
    if (onUpdateWorkerApplicationStatus) {
      onUpdateWorkerApplicationStatus(app.id, 'Approved');
    }
    const alreadyExists = partners.some(p => p.phone === app.phone || p.id === `p-${app.id}`);
    if (!alreadyExists) {
      setPartners(prev => [
        {
          id: `p-${app.id}`,
          name: app.applicantName,
          trade: `${app.tradeName || 'Specialist'} Pro`,
          category: app.trade || 'ac-appliances',
          rating: 5.0,
          reviewsCount: 1,
          jobsCompleted: 0,
          locality: app.locality,
          status: 'Online',
          phone: app.phone,
          email: `${app.applicantName.toLowerCase().replace(/\s+/g, '.')}@urbancompany.com`,
          kycVerified: true,
          policeVerified: true,
          todayEarnings: 0,
          joinedDate: 'Today',
          vehicle: 'Motorbike (Verified)'
        },
        ...prev
      ]);
    }
    addAuditLog('Worker Approved', `Approved ${app.applicantName} (#${app.id}) & added to Partner Fleet`, 'worker');
    showLocalToast(`✓ Approved ${app.applicantName} & added to Fleet!`);
  }

  function handleRejectWorker(appId) {
    if (onUpdateWorkerApplicationStatus) {
      onUpdateWorkerApplicationStatus(appId, 'Rejected');
    }
    addAuditLog('Worker Rejected', `Application #${appId} rejected`, 'worker');
    showLocalToast(`Application #${appId} marked Rejected`);
  }

  function handleDeleteWorker(appId) {
    if (onDeleteWorkerApplication) {
      onDeleteWorkerApplication(appId);
    }
    addAuditLog('Worker Deleted', `Removed record #${appId}`, 'worker');
    showLocalToast(`Deleted record #${appId}`);
  }

  const filteredWorkerApps = useMemo(() => {
    return workerApplications.filter(app => {
      const matchStatus = workerFilterStatus === 'ALL' || app.status === workerFilterStatus;
      const matchTrade = workerTradeFilter === 'ALL' || app.trade === workerTradeFilter;
      const q = workerSearchTerm.toLowerCase().trim();
      const matchSearch = !q || 
        (app.applicantName || '').toLowerCase().includes(q) ||
        (app.phone || '').toLowerCase().includes(q) ||
        (app.tradeName || '').toLowerCase().includes(q) ||
        (app.locality || '').toLowerCase().includes(q);
      return matchStatus && matchTrade && matchSearch;
    });
  }, [workerApplications, workerFilterStatus, workerTradeFilter, workerSearchTerm]);

  // ==========================================
  // PARTNER AGENCIES QUEUE
  // ==========================================
  const [partnerFilterStatus, setPartnerFilterStatus] = useState('ALL');
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');

  function handleApprovePartner(appId) {
    if (onUpdatePartnerApplicationStatus) {
      onUpdatePartnerApplicationStatus(appId, 'Approved');
    }
    addAuditLog('Agency Approved', `Approved partner agency fleet #${appId}`, 'partner');
    showLocalToast(`✓ Approved Agency Application #${appId}`);
  }

  function handleRejectPartner(appId) {
    if (onUpdatePartnerApplicationStatus) {
      onUpdatePartnerApplicationStatus(appId, 'Rejected');
    }
    addAuditLog('Agency Rejected', `Rejected partner agency #${appId}`, 'partner');
    showLocalToast(`Agency #${appId} marked Rejected`);
  }

  function handleDeletePartner(appId) {
    if (onDeletePartnerApplication) {
      onDeletePartnerApplication(appId);
    }
    addAuditLog('Agency Deleted', `Removed agency record #${appId}`, 'partner');
    showLocalToast(`Deleted agency #${appId}`);
  }

  const filteredPartnerApps = useMemo(() => {
    return partnerApplications.filter(app => {
      const matchStatus = partnerFilterStatus === 'ALL' || app.status === partnerFilterStatus;
      const q = partnerSearchTerm.toLowerCase().trim();
      const matchSearch = !q || 
        (app.businessName || '').toLowerCase().includes(q) ||
        (app.ownerName || '').toLowerCase().includes(q) ||
        (app.phone || '').toLowerCase().includes(q) ||
        (app.categoryName || '').toLowerCase().includes(q) ||
        (app.city || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [partnerApplications, partnerFilterStatus, partnerSearchTerm]);

  // ==========================================
  // ORDERS DISPATCH FILTERS
  // ==========================================
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    return allLiveOrders.filter(o => {
      const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const q = orderSearchTerm.toLowerCase().trim();
      const matchSearch = !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.service.toLowerCase().includes(q) ||
        o.locality.toLowerCase().includes(q) ||
        o.partner.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [allLiveOrders, orderStatusFilter, orderSearchTerm]);

  // Modals state
  const [selectedWorkerDossier, setSelectedWorkerDossier] = useState(null);
  const [selectedPartnerDossier, setSelectedPartnerDossier] = useState(null);
  const [selectedOrderInvoice, setSelectedOrderInvoice] = useState(null);
  const [selectedPartnerProfile, setSelectedPartnerProfile] = useState(null);

  // CSV Report Export
  function handleExportCSV() {
    const rows = [
      ['Order ID', 'Customer', 'Service', 'Locality', 'Partner', 'Amount', 'Status', 'Payment Method'],
      ...allLiveOrders.map(o => [
        o.id,
        `"${o.customer}"`,
        `"${o.service}"`,
        `"${o.locality}"`,
        `"${o.partner}"`,
        o.amount,
        o.status,
        o.paymentMethod
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UrbanCompany_OpsReport_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog('CSV Export', 'Generated & downloaded live operations CSV report', 'system');
    showLocalToast('📥 Operations CSV Report downloaded successfully!');
  }

  function handleRefreshData() {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showLocalToast('🔄 Synced live operations database');
    }, 600);
  }

  const totalBookingsAmount = allLiveOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const computedGMV = 4825400 + totalBookingsAmount;
  const pendingWorkerCount = workerApplications.filter(a => a.status === 'Pending Review').length;
  const pendingPartnerCount = partnerApplications.filter(a => a.status === 'Pending Review').length;
  const onlineProsCount = partners.filter(p => p.status === 'Online').length;
  const onJobProsCount = partners.filter(p => p.status === 'On Job').length;
  const offlineProsCount = partners.filter(p => p.status === 'Offline').length;

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: '#0B1120',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      padding: 0,
      margin: 0
    }}>
      <div className="admin-portal-fullscreen admin-dashboard-modal" style={{
        background: '#0B1120',
        color: '#F8FAFC',
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        borderRadius: 0,
        border: 'none',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'none'
      }}>
        {/* Floating Admin Toast */}
        {adminToast && (
          <div style={{
            position: 'absolute',
            bottom: 24,
            right: 28,
            zIndex: 10000,
            background: '#1E1B4B',
            border: '1.5px solid #8B5CF6',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <Sparkles size={16} color="#A78BFA" />
            <span>{adminToast}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* LEFT VERTICAL SIDEBAR NAVIGATION                        */}
        {/* ======================================================== */}
        <aside style={{
          width: 270,
          minWidth: 270,
          background: '#080C15',
          borderRight: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            {/* Top Brand Hub */}
            <div style={{
              padding: '18px 18px 14px',
              borderBottom: '1px solid #1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6E42E5 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(110, 66, 229, 0.45)',
                flexShrink: 0
              }}>
                <LayoutDashboard size={22} color="#fff" />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#FFFFFF', letterSpacing: -0.2 }}>
                  Urban Ops Hub
                </h3>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#10B981',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginTop: 2
                }}>
                  <span className="admin-live-pulse" style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span>LIVE • {selectedCity.toUpperCase()} OPS</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ padding: '8px 14px 6px' }}>
              <div style={{
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: 8,
                padding: '7px 11px',
                display: 'flex',
                alignItems: 'center',
                gap: 7
              }}>
                <MapPin size={13} color="#38BDF8" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>Location:</span>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#F8FAFC' }}>
                  Krishnagiri
                </span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 9.5,
                  fontWeight: 800,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '1px 6px',
                  borderRadius: 4
                }}>
                  Active
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1, overflowY: 'auto' }}>
              {[
                {
                  groupTitle: 'Operations & Control',
                  items: [
                    { id: 'overview', label: 'Overview & Live Metrics', icon: TrendingUp },
                    { 
                      id: 'worker-apps', 
                      label: `Worker Applications`, 
                      count: workerApplications.length,
                      icon: HardHat, 
                      pendingCount: pendingWorkerCount, 
                      badgeColor: '#F59E0B' 
                    },
                    { 
                      id: 'partner-apps', 
                      label: `Partner Agencies`, 
                      count: partnerApplications.length,
                      icon: Building2, 
                      pendingCount: pendingPartnerCount, 
                      badgeColor: '#10B981' 
                    },
                  ]
                },
                {
                  groupTitle: 'Services & Fleet',
                  items: [
                    { id: 'services', label: `Services Catalogue`, count: services.length, icon: Wrench },
                    { id: 'partners', label: `Partner Fleet`, count: partners.length, icon: Users },
                  ]
                },
                {
                  groupTitle: 'Orders & Platform',
                  items: [
                    { id: 'orders', label: `Live Bookings`, count: allLiveOrders.length, icon: Clock },
                    { id: 'coupons', label: `Coupons & Promos`, count: coupons.length, icon: Tag },
                  ]
                }
              ].map(group => (
                <div key={group.groupTitle} style={{ marginBottom: 8 }}>
                  <div style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    color: '#475569',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    padding: '4px 10px 2px'
                  }}>
                    {group.groupTitle}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {group.items.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id !== 'services') setIsFormOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: isActive ? 800 : 600,
                            cursor: 'pointer',
                            border: 'none',
                            borderLeft: isActive ? '3px solid #A78BFA' : '3px solid transparent',
                            background: isActive ? '#6E42E5' : 'transparent',
                            color: isActive ? '#FFFFFF' : '#94A3B8',
                            transition: 'all 0.15s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={e => {
                            if (!isActive) {
                              e.currentTarget.style.background = '#1E293B';
                              e.currentTarget.style.color = '#FFFFFF';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#94A3B8';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <Icon size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
                            <span>{tab.label}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {tab.pendingCount > 0 ? (
                              <span style={{
                                background: tab.badgeColor || '#F59E0B',
                                color: '#000000',
                                fontSize: 9.5,
                                fontWeight: 900,
                                padding: '1px 6px',
                                borderRadius: 999,
                                letterSpacing: 0.3
                              }}>
                                {tab.pendingCount} PENDING
                              </span>
                            ) : tab.count !== undefined ? (
                              <span style={{
                                background: '#1E293B',
                                color: '#94A3B8',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 999
                              }}>
                                {tab.count}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Sidebar: Admin Profile & Logout */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid #1E293B',
            background: 'rgba(8, 12, 21, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#A78BFA',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0
              }}>
                <ShieldCheck size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Super Admin
                </div>
                <div style={{ fontSize: 10, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  admin@urbancompany.com
                </div>
              </div>
            </div>

            {onAdminLogout && (
              <button
                type="button"
                onClick={() => {
                  onAdminLogout();
                  onClose();
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#F87171',
                  padding: '5px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0
                }}
                title="Log out from Administrator Session"
              >
                <LogOut size={12} />
                <span>Exit</span>
              </button>
            )}
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT MAIN VIEWPORT                                     */}
        {/* ======================================================== */}
        <div className="admin-main-viewport" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#0B1120',
          minWidth: 0,
          overflow: 'hidden'
        }}>
          {/* Top Bar Header */}
          <div style={{
            padding: '12px 22px',
            borderBottom: '1px solid #1E293B',
            background: '#090D16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
                  {activeTab === 'overview' && 'Operations Overview & Live Metrics'}
                  {activeTab === 'worker-apps' && `Worker Applications Queue (${workerApplications.length})`}
                  {activeTab === 'partner-apps' && `Partner Agencies Onboarding (${partnerApplications.length})`}
                  {activeTab === 'services' && `Services Catalogue (${services.length})`}
                  {activeTab === 'partners' && `Partner Fleet Network (${partners.length})`}
                  {activeTab === 'orders' && `Live Orders & Dispatch (${allLiveOrders.length})`}
                  {activeTab === 'coupons' && `Coupons & Platform Promos (${coupons.length})`}
                </h3>
                <span style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {selectedCity}
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0 0' }}>
                Urban Company Operations Command Center • Synchronized with active client database
              </p>
            </div>

            {/* Quick Action Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={toggleMonsoonSurge}
                style={{
                  background: monsoonSurge ? 'rgba(56, 189, 248, 0.2)' : '#1E293B',
                  border: `1px solid ${monsoonSurge ? '#38BDF8' : '#334155'}`,
                  color: monsoonSurge ? '#38BDF8' : '#94A3B8',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
                title="Toggle Monsoon Rain Weather Surge (+₹49 Partner Allowance)"
              >
                <CloudRain size={13} />
                <span>Rain Surge: {monsoonSurge ? 'ON (+₹49)' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#CBD5E1',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
                title="Download CSV report of live orders and fleet"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleRefreshData}
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#94A3B8',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
                title="Sync database changes"
              >
                <RefreshCw size={13} className={isRefreshing ? 'spin' : ''} />
                <span>Sync</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onAdminLogout) onAdminLogout();
                  onClose();
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#F87171',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s'
                }}
                title="Lock Admin Hub & Exit Session"
              >
                <Lock size={13} />
                <span>Lock & Exit</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#1E293B',
                  border: '1px solid #334155',
                  color: '#94A3B8',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                title="Close Admin Hub"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Operational Broadcast Bar */}
          <div style={{
            background: monsoonSurge ? 'rgba(56, 189, 248, 0.1)' : 'rgba(110, 66, 229, 0.1)',
            borderBottom: '1px solid #1E293B',
            padding: '7px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
            color: monsoonSurge ? '#38BDF8' : '#A78BFA'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <Bell size={13} style={{ flexShrink: 0 }} />
              {isEditingBroadcast ? (
                <form onSubmit={handleSaveBroadcast} style={{ display: 'flex', gap: 8, flex: 1 }}>
                  <input
                    type="text"
                    value={broadcastInput}
                    onChange={e => setBroadcastInput(e.target.value)}
                    style={{
                      background: '#0F172A',
                      border: '1px solid #334155',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: 11.5,
                      padding: '2px 8px',
                      flex: 1,
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#6E42E5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '2px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBroadcast(false)}
                    style={{
                      background: 'transparent',
                      color: '#94A3B8',
                      border: '1px solid #334155',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <strong>Operational Broadcast:</strong> {broadcastMsg}
                </span>
              )}
            </div>

            {!isEditingBroadcast && (
              <button
                type="button"
                onClick={() => {
                  setBroadcastInput(broadcastMsg);
                  setIsEditingBroadcast(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: 12,
                  textDecoration: 'underline'
                }}
              >
                Edit Message
              </button>
            )}
          </div>

          {/* Modal Scrollable Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            
            {/* ======================================================== */}
            {/* TAB 1: OVERVIEW & LIVE METRICS                           */}
            {/* ======================================================== */}
            {activeTab === 'overview' && (
              <div>
                {/* 4 Core KPI Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  marginBottom: 20
                }}>
                  {/* GMV */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#A78BFA', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>Total {selectedCity} GMV</span>
                      <IndianRupee size={18} />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF' }}>
                      ₹{computedGMV.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#10B981', marginTop: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ArrowUpRight size={13} />
                      <span>+19.2% vs last month • ₹{totalBookingsAmount.toLocaleString('en-IN')} today</span>
                    </div>
                  </div>

                  {/* Orders Today */}
                  <div style={{
                    background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34D399', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>Orders Today</span>
                      <Clock size={18} />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF' }}>
                      {142 + bookings.length} Bookings
                    </div>
                    <div style={{ fontSize: 11.5, color: '#10B981', marginTop: 4, fontWeight: 700 }}>
                      ● 96.8% on-time technician arrival
                    </div>
                  </div>

                  {/* Verified Fleet */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    border: '1px solid #334155',
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93C5FD', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>Verified Fleet Pros</span>
                      <Users size={18} />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF' }}>
                      {1840 + partners.length} Pros
                    </div>
                    <div style={{ fontSize: 11.5, color: '#38BDF8', marginTop: 4, fontWeight: 700 }}>
                      {onlineProsCount} Available Online Across 15 Zones
                    </div>
                  </div>

                  {/* CSAT */}
                  <div style={{
                    background: 'linear-gradient(135deg, #451A03 0%, #0F172A 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FBBF24', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 800 }}>Average CSAT</span>
                      <Star size={18} fill="#FBBF24" color="#FBBF24" />
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#FFFFFF' }}>
                      4.89 ★
                    </div>
                    <div style={{ fontSize: 11.5, color: '#FCD34D', marginTop: 4 }}>
                      Based on 1.2M+ verified customer reviews
                    </div>
                  </div>
                </div>

                {/* Operations Health Vitals Strip */}
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 14,
                  padding: '14px 20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 14,
                  marginBottom: 20
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Avg Dispatch SLA</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#10B981', marginTop: 2 }}>6.4 Minutes</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Active Jobs In-Progress</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#38BDF8', marginTop: 2 }}>
                      {allLiveOrders.filter(o => o.status === 'In Progress' || o.status === 'In Transit').length} Jobs Live
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Repeat Customer Rate</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#A78BFA', marginTop: 2 }}>78.4%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700 }}>Weather Condition</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: monsoonSurge ? '#38BDF8' : '#FBBF24', marginTop: 2 }}>
                      {monsoonSurge ? 'Heavy Rain (Surge Active)' : 'Clear (Normal Operations)'}
                    </div>
                  </div>
                </div>

                {/* Application Review Queue Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 16,
                  marginBottom: 24
                }}>
                  <div style={{
                    background: '#131D33',
                    border: '1px solid #334155',
                    borderLeft: '4px solid #F59E0B',
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <HardHat size={18} color="#F59E0B" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>Worker Applications</span>
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#FBBF24',
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 999
                        }}>
                          {pendingWorkerCount} PENDING
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>
                        {workerApplications.length} individual specialists applied (Electricians, Cleaners, AC, etc.)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('worker-apps')}
                      style={{
                        background: '#F59E0B',
                        color: '#000000',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>Review Queue</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div style={{
                    background: '#131D33',
                    border: '1px solid #334155',
                    borderLeft: '4px solid #10B981',
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Building2 size={18} color="#10B981" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>Partner Applications</span>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34D399',
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 999
                        }}>
                          {pendingPartnerCount} PENDING
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>
                        {partnerApplications.length} business agencies & contractor fleets registered
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('partner-apps')}
                      style={{
                        background: '#10B981',
                        color: '#000000',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <span>Review Queue</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* 2-col analytics grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                  <div style={{
                    background: '#131D33',
                    border: '1px solid #1E293B',
                    borderRadius: 16,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#F1F5F9' }}>
                        {selectedCity} Category Revenue Breakdown
                      </h4>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>Real-time demand</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { name: 'AC & Appliance Repair', share: 36, revenue: '₹17.3L', color: '#6E42E5', catId: 'ac-appliances' },
                        { name: 'Women’s Salon', share: 28, revenue: '₹13.5L', color: '#EC4899', catId: 'womens-salon' },
                        { name: 'Deep Cleaning & Pest Control', share: 18, revenue: '₹8.7L', color: '#10B981', catId: 'cleaning-pest' },
                        { name: 'Native Water Purifiers', share: 12, revenue: '₹5.8L', color: '#38BDF8', catId: 'water-purifier' },
                        { name: 'Electrician & Quick Repairs', share: 6, revenue: '₹2.9L', color: '#F59E0B', catId: 'quick-repairs' },
                      ].map(cat => (
                        <div key={cat.name} style={{ cursor: 'pointer' }} onClick={() => {
                          setServiceCategoryFilter(cat.catId);
                          setActiveTab('services');
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{cat.name}</span>
                            <span style={{ color: '#94A3B8', fontWeight: 700 }}>{cat.revenue} ({cat.share}%)</span>
                          </div>
                          <div style={{ height: 8, background: '#1E293B', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${cat.share}%`, height: '100%', background: cat.color, borderRadius: 999 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    background: '#131D33',
                    border: '1px solid #1E293B',
                    borderRadius: 16,
                    padding: 20
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#F1F5F9' }}>
                        Top Active {selectedCity} Localities Today
                      </h4>
                      <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>Live Dispatch</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { loc: 'Rayakottai Road & Old Pet', orders: '38 bookings', pro: '14 active pros' },
                        { loc: 'Bangalore Road & Collectorate', orders: '29 bookings', pro: '11 active pros' },
                        { loc: 'Kattiganapalli & Anna Nagar', orders: '25 bookings', pro: '10 active pros' },
                        { loc: 'Gandhi Nagar & Roundana Hub', orders: '18 bookings', pro: '8 active pros' },
                        { loc: 'TNHB Colony & New Pet', orders: '16 bookings', pro: '7 active pros' },
                      ].map(l => (
                        <div key={l.loc} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#0F172A',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #1E293B'
                        }}>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#F8FAFC' }}>{l.loc}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>{l.pro}</div>
                          </div>
                          <span style={{
                            background: 'rgba(110, 66, 229, 0.2)',
                            color: '#A78BFA',
                            fontSize: 11.5,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6
                          }}>
                            {l.orders}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: PARTNER FLEET NETWORK (PRECISION REDESIGN)          */}
            {/* ======================================================== */}
            {activeTab === 'partners' && (
              <div>
                {/* Header Action Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <h4 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 4px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{selectedCity} Partner Network Fleet</span>
                      <span style={{
                        background: '#1E293B',
                        color: '#A78BFA',
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid #334155'
                      }}>
                        {partners.length} Total
                      </span>
                    </h4>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                      100% background-checked, skill-certified master service professionals
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddPartnerOpen(true)}
                      style={{
                        background: '#10B981',
                        color: '#000000',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <UserPlus size={15} />
                      <span>+ Onboard Partner Pro</span>
                    </button>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#131D33',
                      border: '1px solid #1E293B',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 11.5,
                      fontWeight: 700
                    }}>
                      <span style={{ color: '#10B981' }}>● {onlineProsCount} Online</span>
                      <span style={{ color: '#334155' }}>|</span>
                      <span style={{ color: '#38BDF8' }}>● {onJobProsCount} On Job</span>
                      <span style={{ color: '#334155' }}>|</span>
                      <span style={{ color: '#64748B' }}>● {offlineProsCount} Offline</span>
                    </div>
                  </div>
                </div>

                {/* Precision Operations Toolbar: Filters & Search */}
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 18
                }}>
                  {/* Status Segmented Tabs */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'ALL', label: `All Fleet (${partners.length})` },
                      { id: 'Online', label: `Online (${onlineProsCount})`, color: '#10B981' },
                      { id: 'On Job', label: `On Job (${onJobProsCount})`, color: '#38BDF8' },
                      { id: 'Offline', label: `Offline (${offlineProsCount})`, color: '#94A3B8' }
                    ].map(st => {
                      const isSel = fleetStatusFilter === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFleetStatusFilter(st.id)}
                          style={{
                            background: isSel ? '#1E293B' : 'transparent',
                            color: isSel ? '#FFFFFF' : '#94A3B8',
                            border: isSel ? '1px solid #6E42E5' : '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: isSel ? 800 : 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Filters & Search */}
                  <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 580, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <select
                      value={fleetTradeFilter}
                      onChange={e => setFleetTradeFilter(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#F8FAFC',
                        fontSize: 12,
                        padding: '6px 10px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ALL">All Trade Specialties</option>
                      <option value="ac-appliances">AC & Appliances</option>
                      <option value="womens-salon">Women Salon</option>
                      <option value="cleaning-pest">Cleaning & Pest</option>
                      <option value="quick-repairs">Electrician & Repairs</option>
                      <option value="water-purifier">Water Purifier</option>
                    </select>

                    <select
                      value={fleetZoneFilter}
                      onChange={e => setFleetZoneFilter(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#F8FAFC',
                        fontSize: 12,
                        padding: '6px 10px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ALL">All Krishnagiri Zones</option>
                      <option value="Rayakottai">Rayakottai Road & Old Pet</option>
                      <option value="Bangalore">Bangalore Road & Collectorate</option>
                      <option value="Kattiganapalli">Kattiganapalli & Anna Nagar</option>
                      <option value="Gandhi">Gandhi Nagar & Roundana</option>
                    </select>

                    <div style={{
                      position: 'relative',
                      background: '#0F172A',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px',
                      minWidth: 200
                    }}>
                      <Search size={14} color="#94A3B8" />
                      <input
                        type="text"
                        placeholder="Search pro name, phone..."
                        value={fleetSearchTerm}
                        onChange={e => setFleetSearchTerm(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#FFFFFF',
                          fontSize: 12,
                          padding: '6px 8px',
                          width: '100%'
                        }}
                      />
                      {fleetSearchTerm && (
                        <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setFleetSearchTerm('')} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Partner Fleet Grid */}
                {filteredPartners.length === 0 ? (
                  <div style={{
                    background: '#131D33',
                    border: '1px dashed #334155',
                    borderRadius: 14,
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#94A3B8'
                  }}>
                    <Users size={36} color="#64748B" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', margin: '0 0 6px' }}>
                      No Fleet Technicians Match Filters
                    </h4>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                      Try adjusting your status, trade, zone or search query.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                    {filteredPartners.map(p => {
                      const isOnline = p.status === 'Online';
                      const isOnJob = p.status === 'On Job';
                      return (
                        <div key={p.id} style={{
                          background: '#131D33',
                          border: '1px solid #1E293B',
                          borderRadius: 16,
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                          transition: 'border-color 0.15s'
                        }}>
                          <div>
                            {/* Pro Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                  border: '1.5px solid #334155',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 900,
                                  fontSize: 16,
                                  color: isOnline ? '#10B981' : isOnJob ? '#38BDF8' : '#94A3B8',
                                  position: 'relative'
                                }}>
                                  {p.name.charAt(0)}
                                  <span
                                    className={isOnline ? 'admin-live-pulse' : ''}
                                    style={{
                                      position: 'absolute',
                                      bottom: -2,
                                      right: -2,
                                      width: 10,
                                      height: 10,
                                      borderRadius: '50%',
                                      background: isOnline ? '#10B981' : isOnJob ? '#38BDF8' : '#64748B',
                                      border: '2px solid #131D33'
                                    }}
                                  />
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>{p.name}</span>
                                    <ShieldCheck size={14} color="#10B981" title="Background & Police Checked" />
                                  </div>
                                  <div style={{
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    color: '#A78BFA',
                                    marginTop: 2
                                  }}>
                                    {p.trade}
                                  </div>
                                </div>
                              </div>

                              {/* Status Chip */}
                              <span style={{
                                background: isOnline ? 'rgba(16, 185, 129, 0.12)' : isOnJob ? 'rgba(56, 189, 248, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                                color: isOnline ? '#10B981' : isOnJob ? '#38BDF8' : '#94A3B8',
                                border: `1px solid ${isOnline ? '#10B981' : isOnJob ? '#38BDF8' : '#475569'}`,
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: 999,
                                letterSpacing: 0.3,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isOnline ? '#10B981' : isOnJob ? '#38BDF8' : '#94A3B8' }} />
                                <span>{p.status.toUpperCase()}</span>
                              </span>
                            </div>

                            {/* Precision 4-Tile Metrics Grid */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 8,
                              marginBottom: 14
                            }}>
                              <div style={{
                                background: '#0F172A',
                                border: '1px solid #1E293B',
                                borderRadius: 10,
                                padding: '8px 12px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: 0.4 }}>
                                  <Star size={11} fill="#FBBF24" color="#FBBF24" />
                                  <span>CSAT RATING</span>
                                </div>
                                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#F8FAFC', marginTop: 3 }}>
                                  {p.rating} ★ <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600 }}>({p.reviewsCount})</span>
                                </div>
                              </div>

                              <div style={{
                                background: '#0F172A',
                                border: '1px solid #1E293B',
                                borderRadius: 10,
                                padding: '8px 12px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: 0.4 }}>
                                  <Briefcase size={11} color="#A78BFA" />
                                  <span>LIFETIME JOBS</span>
                                </div>
                                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#F8FAFC', marginTop: 3 }}>
                                  {p.jobsCompleted.toLocaleString()}
                                </div>
                              </div>

                              <div style={{
                                background: '#0F172A',
                                border: '1px solid #1E293B',
                                borderRadius: 10,
                                padding: '8px 12px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: 0.4 }}>
                                  <MapPin size={11} color="#38BDF8" />
                                  <span>TERRITORY</span>
                                </div>
                                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#CBD5E1', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.locality}
                                </div>
                              </div>

                              <div style={{
                                background: '#0F172A',
                                border: '1px solid #1E293B',
                                borderRadius: 10,
                                padding: '8px 12px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: 0.4 }}>
                                  <IndianRupee size={11} color="#10B981" />
                                  <span>TODAY'S PAYOUT</span>
                                </div>
                                <div style={{ fontSize: 13.5, fontWeight: 900, color: '#10B981', marginTop: 3 }}>
                                  ₹{p.todayEarnings.toLocaleString('en-IN')}
                                </div>
                              </div>
                            </div>

                            {/* Verification Strip & Quick Details */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: 11,
                              color: '#94A3B8',
                              background: '#0F172A',
                              padding: '6px 10px',
                              borderRadius: 8,
                              marginBottom: 14,
                              border: '1px solid #1E293B'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ShieldCheck size={13} color="#10B981" />
                                <span style={{ color: '#10B981', fontWeight: 700 }}>Police Verified</span>
                                <span>•</span>
                                <span>{p.vehicle}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedPartnerProfile(p)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#A78BFA',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  padding: 0
                                }}
                              >
                                View Dossier →
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => togglePartnerStatus(p.id)}
                              disabled={isOnJob}
                              style={{
                                flex: 1,
                                background: isOnline ? 'rgba(239, 68, 68, 0.1)' : isOnJob ? '#1E293B' : 'rgba(16, 185, 129, 0.12)',
                                color: isOnline ? '#F87171' : isOnJob ? '#64748B' : '#10B981',
                                border: `1px solid ${isOnline ? 'rgba(239, 68, 68, 0.3)' : isOnJob ? '#334155' : 'rgba(16, 185, 129, 0.4)'}`,
                                padding: '8px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: isOnJob ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6
                              }}
                            >
                              <Power size={13} />
                              <span>{isOnline ? 'Set Offline' : isOnJob ? 'Locked on Job' : 'Set Online'}</span>
                            </button>

                            <a
                              href={`tel:${p.phone}`}
                              style={{
                                background: '#1E293B',
                                color: '#A78BFA',
                                border: '1px solid #334155',
                                padding: '8px 14px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                textDecoration: 'none'
                              }}
                              title={`Call ${p.name} (${p.phone})`}
                            >
                              <Phone size={13} />
                              <span>Call</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: WORKER APPLICATIONS QUEUE                           */}
            {/* ======================================================== */}
            {activeTab === 'worker-apps' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 20,
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 14,
                  padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      background: '#F59E0B',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10
                    }}>
                      <HardHat size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
                        Worker Onboarding Applications Queue
                      </h4>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0 0' }}>
                        Individual skilled technicians, specialists, and professionals seeking verification
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {onOpenWorkerOnboarding && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenWorkerOnboarding();
                        }}
                        style={{
                          background: '#F59E0B',
                          color: '#000000',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={15} />
                        <span>+ Onboard New Worker</span>
                      </button>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'ALL', label: `All (${workerApplications.length})` },
                      { id: 'Pending Review', label: `Pending (${pendingWorkerCount})`, color: '#F59E0B' },
                      { id: 'Approved', label: `Approved (${workerApplications.filter(a => a.status === 'Approved').length})` },
                      { id: 'Rejected', label: `Rejected (${workerApplications.filter(a => a.status === 'Rejected').length})` }
                    ].map(filter => {
                      const isSelected = workerFilterStatus === filter.id;
                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setWorkerFilterStatus(filter.id)}
                          style={{
                            background: isSelected ? '#1E293B' : '#0F172A',
                            border: isSelected ? '1.5px solid #F59E0B' : '1px solid #334155',
                            color: isSelected ? '#FBBF24' : '#94A3B8',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 480, justifyContent: 'flex-end' }}>
                    <select
                      value={workerTradeFilter}
                      onChange={e => setWorkerTradeFilter(e.target.value)}
                      style={{
                        background: '#131D33',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        color: '#F8FAFC',
                        fontSize: 12,
                        padding: '6px 10px',
                        outline: 'none'
                      }}
                    >
                      <option value="ALL">All Trade Categories</option>
                      <option value="ac-appliances">AC & Appliances</option>
                      <option value="cleaning-pest">Cleaning & Pest</option>
                      <option value="quick-repairs">Electrician & Repairs</option>
                      <option value="womens-salon">Women Salon</option>
                      <option value="mens-salon">Men Salon</option>
                    </select>

                    <div style={{
                      position: 'relative',
                      background: '#131D33',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      flex: 1
                    }}>
                      <Search size={14} color="#94A3B8" />
                      <input
                        type="text"
                        placeholder="Search applicant, phone, locality..."
                        value={workerSearchTerm}
                        onChange={e => setWorkerSearchTerm(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#FFFFFF',
                          fontSize: 12.5,
                          padding: '7px 8px',
                          width: '100%'
                        }}
                      />
                      {workerSearchTerm && (
                        <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setWorkerSearchTerm('')} />
                      )}
                    </div>
                  </div>
                </div>

                {filteredWorkerApps.length === 0 ? (
                  <div style={{
                    background: '#131D33',
                    border: '1px dashed #334155',
                    borderRadius: 14,
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#94A3B8'
                  }}>
                    <HardHat size={36} color="#F59E0B" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', margin: '0 0 6px' }}>
                      No Worker Applications Found
                    </h4>
                    <p style={{ fontSize: 13, maxWidth: 460, margin: '0 auto 18px', color: '#64748B' }}>
                      {workerSearchTerm || workerFilterStatus !== 'ALL' || workerTradeFilter !== 'ALL'
                        ? 'No applications match your selected filters.'
                        : 'There are currently no worker onboarding submissions.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filteredWorkerApps.map(app => (
                      <div
                        key={app.id}
                        style={{
                          background: '#131D33',
                          border: '1px solid #1E293B',
                          borderLeft: app.status === 'Approved' ? '4px solid #10B981' : app.status === 'Rejected' ? '4px solid #EF4444' : '4px solid #F59E0B',
                          borderRadius: 14,
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                              width: 44,
                              height: 44,
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#F59E0B',
                              fontWeight: 900,
                              fontSize: 16
                            }}>
                              {app.applicantName ? app.applicantName.charAt(0).toUpperCase() : 'W'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                                  {app.applicantName}
                                </span>
                                <span style={{
                                  background: '#1E293B',
                                  border: '1px solid #334155',
                                  color: '#94A3B8',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: 6
                                }}>
                                  {app.id}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                                <span>📞 <strong style={{ color: '#E2E8F0' }}>{app.phone}</strong></span>
                                <span>•</span>
                                <span>📍 {app.locality}</span>
                                <span>•</span>
                                <span>🕒 Applied: {app.appliedAt}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setSelectedWorkerDossier(app)}
                              style={{
                                background: '#1E293B',
                                border: '1px solid #334155',
                                color: '#A78BFA',
                                padding: '5px 10px',
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={13} />
                              <span>View KYC Dossier</span>
                            </button>

                            <span style={{
                              background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: app.status === 'Approved' ? '#10B981' : app.status === 'Rejected' ? '#F87171' : '#FBBF24',
                              border: `1px solid ${app.status === 'Approved' ? '#10B981' : app.status === 'Rejected' ? '#EF4444' : '#F59E0B'}`,
                              fontSize: 11.5,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 999,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}>
                              {app.status === 'Approved' && <Check size={13} />}
                              {app.status === 'Pending Review' && <Clock size={13} />}
                              {app.status === 'Rejected' && <X size={13} />}
                              <span>{app.status.toUpperCase()}</span>
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 12,
                          background: '#0F172A',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1px solid #1E293B',
                          fontSize: 12
                        }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Trade Specialty</span>
                            <strong style={{ color: '#A78BFA' }}>{app.tradeName || app.trade}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Industry Experience</span>
                            <strong style={{ color: '#F1F5F9' }}>{app.experience || '4-6 years'}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Professional Tooling</span>
                            <strong style={{ color: '#10B981' }}>{app.toolsAvailable || 'Yes, Full Tool Kit'}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Expected Monthly Income</span>
                            <strong style={{ color: '#38BDF8' }}>{app.expectedIncome || '₹65,000 / mo'}</strong>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                          borderTop: '1px solid #1E293B',
                          paddingTop: 12
                        }}>
                          <div style={{ fontSize: 11.5, color: '#64748B' }}>
                            Aadhaar Verification: <span style={{ color: '#94A3B8', fontWeight: 700 }}>{app.aadhaarNumber}</span>
                            {app.status === 'Approved' && (
                              <span style={{ color: '#10B981', marginLeft: 12, fontWeight: 700 }}>
                                ✓ Active in Partner Network Fleet
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {app.status !== 'Approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveWorker(app)}
                                style={{
                                  background: '#10B981',
                                  color: '#000000',
                                  border: 'none',
                                  padding: '7px 14px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer'
                                }}
                              >
                                <Check size={14} />
                                <span>Approve & Add to Fleet</span>
                              </button>
                            )}

                            {app.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectWorker(app.id)}
                                style={{
                                  background: '#1E293B',
                                  color: '#F87171',
                                  border: '1px solid #334155',
                                  padding: '7px 12px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer'
                                }}
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            )}

                            <a
                              href={`tel:${app.phone}`}
                              style={{
                                background: '#1E293B',
                                color: '#A78BFA',
                                border: '1px solid #334155',
                                padding: '7px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                textDecoration: 'none'
                              }}
                            >
                              <Phone size={13} />
                              <span>Call</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteWorker(app.id)}
                              style={{
                                background: '#1E293B',
                                color: '#94A3B8',
                                border: '1px solid #334155',
                                padding: '7px 10px',
                                borderRadius: 8,
                                fontSize: 12,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: PARTNER AGENCIES QUEUE                              */}
            {/* ======================================================== */}
            {activeTab === 'partner-apps' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 20,
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 14,
                  padding: '16px 20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      background: '#10B981',
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 10
                    }}>
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
                        Partner Agencies & Fleet Onboarding
                      </h4>
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0 0' }}>
                        Contractor companies, facility agencies, and multi-technician fleets
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {onOpenPartnerOnboarding && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPartnerOnboarding();
                        }}
                        style={{
                          background: '#10B981',
                          color: '#000000',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={15} />
                        <span>+ Register New Agency</span>
                      </button>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      { id: 'ALL', label: `All (${partnerApplications.length})` },
                      { id: 'Pending Review', label: `Pending (${pendingPartnerCount})`, color: '#10B981' },
                      { id: 'Approved', label: `Approved (${partnerApplications.filter(a => a.status === 'Approved').length})` },
                      { id: 'Rejected', label: `Rejected (${partnerApplications.filter(a => a.status === 'Rejected').length})` },
                    ].map(f => {
                      const isSelected = partnerFilterStatus === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setPartnerFilterStatus(f.id)}
                          style={{
                            background: isSelected ? '#1E293B' : '#0F172A',
                            border: isSelected ? '1.5px solid #10B981' : '1px solid #334155',
                            color: isSelected ? '#34D399' : '#94A3B8',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{
                    position: 'relative',
                    width: 280,
                    background: '#131D33',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px'
                  }}>
                    <Search size={14} color="#94A3B8" />
                    <input
                      type="text"
                      placeholder="Search company, owner, GST..."
                      value={partnerSearchTerm}
                      onChange={e => setPartnerSearchTerm(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#FFFFFF',
                        fontSize: 12.5,
                        padding: '7px 8px',
                        width: '100%'
                      }}
                    />
                    {partnerSearchTerm && (
                      <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setPartnerSearchTerm('')} />
                    )}
                  </div>
                </div>

                {filteredPartnerApps.length === 0 ? (
                  <div style={{
                    background: '#131D33',
                    border: '1px dashed #334155',
                    borderRadius: 14,
                    padding: '48px 24px',
                    textAlign: 'center',
                    color: '#94A3B8'
                  }}>
                    <Building2 size={36} color="#10B981" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', margin: '0 0 6px' }}>
                      No Partner Applications Found
                    </h4>
                    <p style={{ fontSize: 13, maxWidth: 460, margin: '0 auto 18px', color: '#64748B' }}>
                      {partnerSearchTerm || partnerFilterStatus !== 'ALL'
                        ? 'No applications match your selected filters.'
                        : 'There are currently no partner agency onboarding submissions.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filteredPartnerApps.map(app => (
                      <div
                        key={app.id}
                        style={{
                          background: '#131D33',
                          border: '1px solid #1E293B',
                          borderLeft: app.status === 'Approved' ? '4px solid #10B981' : app.status === 'Rejected' ? '4px solid #EF4444' : '4px solid #10B981',
                          borderRadius: 14,
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{
                              width: 44,
                              height: 44,
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#10B981',
                              fontWeight: 900
                            }}>
                              <Building2 size={22} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                                  {app.businessName}
                                </span>
                                <span style={{
                                  background: '#1E293B',
                                  border: '1px solid #334155',
                                  color: '#94A3B8',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: 6
                                }}>
                                  {app.id}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                                <span>Owner: <strong style={{ color: '#E2E8F0' }}>{app.ownerName}</strong></span>
                                <span>•</span>
                                <span>📞 {app.phone}</span>
                                <span>•</span>
                                <span>📧 {app.email}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                              type="button"
                              onClick={() => setSelectedPartnerDossier(app)}
                              style={{
                                background: '#1E293B',
                                border: '1px solid #334155',
                                color: '#10B981',
                                padding: '5px 10px',
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer'
                              }}
                            >
                              <FileText size={13} />
                              <span>View Dossier</span>
                            </button>

                            <span style={{
                              background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: app.status === 'Approved' ? '#10B981' : app.status === 'Rejected' ? '#F87171' : '#34D399',
                              border: `1px solid ${app.status === 'Approved' ? '#10B981' : app.status === 'Rejected' ? '#EF4444' : '#10B981'}`,
                              fontSize: 11.5,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 999,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}>
                              {app.status === 'Approved' && <Check size={13} />}
                              {app.status === 'Pending Review' && <Clock size={13} />}
                              {app.status === 'Rejected' && <X size={13} />}
                              <span>{app.status.toUpperCase()}</span>
                            </span>
                          </div>
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: 12,
                          background: '#0F172A',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1px solid #1E293B',
                          fontSize: 12
                        }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Service Category</span>
                            <strong style={{ color: '#A78BFA' }}>{app.categoryName || app.category}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Legal Entity</span>
                            <strong style={{ color: '#F1F5F9' }}>{app.businessType}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Fleet Roster Size</span>
                            <strong style={{ color: '#38BDF8' }}>{app.fleetSize}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', marginBottom: 2 }}>Monthly Job Capacity</span>
                            <strong style={{ color: '#10B981' }}>{app.monthlyCapacity}</strong>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                          borderTop: '1px solid #1E293B',
                          paddingTop: 12
                        }}>
                          <div style={{ fontSize: 11.5, color: '#64748B' }}>
                            GSTIN: <span style={{ color: '#94A3B8', fontWeight: 700 }}>{app.gstNumber}</span>
                            <span style={{ margin: '0 8px' }}>•</span>
                            City Cluster: <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{app.city}</span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {app.status !== 'Approved' && (
                              <button
                                type="button"
                                onClick={() => handleApprovePartner(app.id)}
                                style={{
                                  background: '#10B981',
                                  color: '#000000',
                                  border: 'none',
                                  padding: '7px 14px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer'
                                }}
                              >
                                <Check size={14} />
                                <span>Approve Agency Fleet</span>
                              </button>
                            )}

                            {app.status !== 'Rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectPartner(app.id)}
                                style={{
                                  background: '#1E293B',
                                  color: '#F87171',
                                  border: '1px solid #334155',
                                  padding: '7px 12px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer'
                                }}
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePartner(app.id)}
                              style={{
                                background: '#1E293B',
                                color: '#94A3B8',
                                border: '1px solid #334155',
                                padding: '7px 10px',
                                borderRadius: 8,
                                fontSize: 12,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: SERVICES CATALOGUE CRUD                             */}
            {/* ======================================================== */}
            {activeTab === 'services' && (
              <div>
                {/* 1. Section Header Action Row matching partner and worker tabs */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <h4 style={{ fontSize: 17, fontWeight: 900, margin: '0 0 4px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Live Services Catalogue</span>
                      <span style={{
                        background: '#1E293B',
                        color: '#A78BFA',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid #334155'
                      }}>
                        {services.length} Total
                      </span>
                    </h4>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>Manage verified services, pricing, availability, and instant catalogue changes across all Mumbai hubs</span>
                      {monsoonSurge && (
                        <span style={{
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          color: '#38BDF8',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 11.5
                        }}>
                          🌧️ Monsoon Rain Surge Active: +₹49 reflected on all live prices below
                        </span>
                      )}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      style={{
                        background: '#6E42E5',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(110, 66, 229, 0.35)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <Plus size={15} />
                      <span>Add New Service</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsBulkPriceOpen(true)}
                      style={{
                        background: '#1E293B',
                        color: '#38BDF8',
                        border: '1px solid #334155',
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title="Adjust catalogue pricing in bulk"
                    >
                      <Sliders size={14} />
                      <span>Bulk Price Adjust</span>
                    </button>

                    <button
                      type="button"
                      onClick={onResetServices}
                      title="Restore default service items"
                      style={{
                        background: '#1E293B',
                        color: '#94A3B8',
                        border: '1px solid #334155',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Restore Defaults</span>
                    </button>
                  </div>
                </div>

                {/* 2. Operations Toolbar: Search, Category Filter, Sort & Count */}
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 16
                }}>
                  {/* Left: Search Box & Category Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
                    <div style={{
                      position: 'relative',
                      flex: 1,
                      minWidth: 200,
                      maxWidth: 380,
                      background: '#0F172A',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px'
                    }}>
                      <Search size={14} color="#94A3B8" />
                      <input
                        type="text"
                        placeholder="Search services catalogue..."
                        value={serviceSearchTerm}
                        onChange={e => setServiceSearchTerm(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          fontSize: 12.5,
                          padding: '7px 8px',
                          width: '100%',
                          outline: 'none'
                        }}
                      />
                      {serviceSearchTerm && (
                        <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setServiceSearchTerm('')} />
                      )}
                    </div>

                    <select
                      value={serviceCategoryFilter}
                      onChange={e => setServiceCategoryFilter(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Categories ({services.length})</option>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Right: Sort Dropdown & Showing Count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600 }}>
                      Showing <strong style={{ color: '#F1F5F9' }}>{filteredServices.length}</strong> of {services.length}
                    </span>

                    <select
                      value={serviceSortBy}
                      onChange={e => setServiceSortBy(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        color: '#F8FAFC',
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="default">Sort: Default</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Rating: Highest First</option>
                    </select>
                  </div>
                </div>

                {isFormOpen && (
                  <div style={{
                    background: '#131D33',
                    border: '1.5px solid #6E42E5',
                    borderRadius: 16,
                    padding: 22,
                    marginBottom: 24,
                    boxShadow: '0 12px 36px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#A78BFA' }}>
                        {editingService ? `✏️ Edit Service: "${editingService.title}"` : '✨ Add New Service to Live Catalogue'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {formSuccess && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid #10B981',
                        color: '#10B981',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <CheckCircle2 size={16} />
                        <span>{formSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveService}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Service Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Chimney Deep Cleaning & Filter Wash"
                            value={formTitle}
                            onChange={e => setFormTitle(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Category *
                          </label>
                          <select
                            value={formCategory}
                            onChange={e => setFormCategory(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          >
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Subcategory / Trade
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Kitchen Cleaning"
                            value={formSubcategory}
                            onChange={e => setFormSubcategory(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Live Price (₹) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={formPrice}
                            onChange={e => setFormPrice(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Original Price (₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formOriginalPrice}
                            onChange={e => setFormOriginalPrice(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Duration
                          </label>
                          <input
                            type="text"
                            value={formDuration}
                            onChange={e => setFormDuration(e.target.value)}
                            placeholder="e.g. 45 mins"
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Badge Tag
                          </label>
                          <input
                            type="text"
                            value={formBadge}
                            onChange={e => setFormBadge(e.target.value)}
                            placeholder="e.g. BESTSELLER"
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                          Service Thumbnail Image (Pick Preset or Enter URL)
                        </label>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                          {PRESET_IMAGES.map(img => (
                            <button
                              key={img.label}
                              type="button"
                              onClick={() => setFormImage(img.url)}
                              style={{
                                background: formImage === img.url ? '#6E42E5' : '#0F172A',
                                border: '1px solid #334155',
                                color: formImage === img.url ? '#fff' : '#94A3B8',
                                padding: '4px 10px',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {img.label}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <input
                            type="text"
                            placeholder="Paste custom image URL..."
                            value={formImage}
                            onChange={e => setFormImage(e.target.value)}
                            style={{
                              flex: 1,
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                          {formImage && (
                            <img
                              src={formImage}
                              alt="preview"
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #334155' }}
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Description
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Short summary of service features..."
                            value={formDescription}
                            onChange={e => setFormDescription(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                            Inclusions (one item per line)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Point 1&#10;Point 2"
                            value={formInclusions}
                            onChange={e => setFormInclusions(e.target.value)}
                            style={{
                              width: '100%',
                              background: '#0F172A',
                              border: '1px solid #334155',
                              borderRadius: 8,
                              padding: '9px 12px',
                              color: '#fff',
                              fontSize: 13,
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          type="submit"
                          style={{
                            background: '#6E42E5',
                            color: '#fff',
                            border: 'none',
                            padding: '9px 24px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {editingService ? 'Save Changes' : '+ Add Service to Live App'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            setEditingService(null);
                          }}
                          style={{
                            background: 'transparent',
                            color: '#94A3B8',
                            border: '1px solid #334155',
                            padding: '9px 16px',
                            borderRadius: 8,
                            fontSize: 13,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}>
                  {filteredServices.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94A3B8' }}>
                      <Wrench size={36} color="#64748B" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: '#F1F5F9', margin: '0 0 6px' }}>
                        No Services Match Filters
                      </h4>
                      <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                        Try clearing your search term or selecting "All Categories".
                      </p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13, tableLayout: 'fixed' }}>
                      <thead>
                        <tr style={{ background: '#0D1424', borderBottom: '1px solid #1E293B' }}>
                          <th style={{ width: '36%', padding: '12px 18px', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8' }}>
                            Service Name
                          </th>
                          <th style={{ width: '18%', padding: '12px 16px', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8' }}>
                            Category
                          </th>
                          <th style={{ width: '16%', padding: '12px 16px', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: monsoonSurge ? '#38BDF8' : '#94A3B8' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span>Live Price</span>
                              {monsoonSurge && (
                                <span style={{
                                  background: '#38BDF8',
                                  color: '#0D1424',
                                  fontSize: 9.5,
                                  fontWeight: 900,
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  letterSpacing: 0
                                }}>
                                  +₹49 ON
                                </span>
                              )}
                            </div>
                          </th>
                          <th style={{ width: '10%', padding: '12px 14px', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8', textAlign: 'center' }}>
                            Status
                          </th>
                          <th style={{ width: '8%', padding: '12px 14px', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8', textAlign: 'center' }}>
                            Rating
                          </th>
                          <th style={{ width: '12%', padding: '12px 18px', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94A3B8', textAlign: 'right' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServices.map(s => {
                          const isPaused = pausedServiceIds.includes(s.id);
                          return (
                            <tr
                              key={s.id}
                              style={{
                                borderBottom: '1px solid #1E293B',
                                opacity: isPaused ? 0.6 : 1,
                                transition: 'background-color 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#17233D'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <td style={{ padding: '12px 18px', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <img
                                    src={s.image}
                                    alt={s.title}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 8,
                                      objectFit: 'cover',
                                      flexShrink: 0,
                                      border: '1px solid #1E293B'
                                    }}
                                    onError={e => { e.currentTarget.src = '/images/categories/cat_ac.jpg'; }}
                                  />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{
                                      fontWeight: 800,
                                      color: '#FFFFFF',
                                      fontSize: 13.5,
                                      lineHeight: 1.3,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }} title={s.title}>
                                      {s.title}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span>{s.duration || '45 mins'}</span>
                                      <span style={{ color: '#475569' }}>•</span>
                                      <span style={{ color: '#A78BFA', fontWeight: 700 }}>{s.badge || 'POPULAR'}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                <span style={{
                                  background: '#1E293B',
                                  border: '1px solid #334155',
                                  color: '#CBD5E1',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  display: 'inline-block',
                                  maxWidth: 160,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {CATEGORIES.find(c => c.id === s.category)?.name || s.category}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                {(() => {
                                  const surgeAmt = monsoonSurge ? 49 : 0;
                                  const liveP = Number(s.price || 0) + surgeAmt;
                                  const liveOrig = s.originalPrice ? Number(s.originalPrice) + surgeAmt : null;
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
                                        <span style={{
                                          fontWeight: 900,
                                          color: monsoonSurge ? '#38BDF8' : '#10B981',
                                          fontSize: 14.5
                                        }}>
                                          ₹{liveP.toLocaleString('en-IN')}
                                        </span>
                                        {liveOrig && liveOrig > liveP && (
                                          <span style={{ fontSize: 11, color: '#64748B', textDecoration: 'line-through' }}>
                                            ₹{liveOrig.toLocaleString('en-IN')}
                                          </span>
                                        )}
                                      </div>
                                      {monsoonSurge && (
                                        <div style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 4,
                                          fontSize: 10,
                                          fontWeight: 800,
                                          color: '#38BDF8'
                                        }}>
                                          <span style={{
                                            background: 'rgba(56, 189, 248, 0.15)',
                                            border: '1px solid rgba(56, 189, 248, 0.3)',
                                            padding: '1px 5px',
                                            borderRadius: 4
                                          }}>
                                            🌧️ Base ₹{s.price} + ₹49
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>

                              <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  onClick={() => toggleServicePaused(s.id)}
                                  style={{
                                    background: isPaused ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: isPaused ? '#F87171' : '#10B981',
                                    border: `1px solid ${isPaused ? '#EF4444' : '#10B981'}`,
                                    padding: '3px 9px',
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5
                                  }}
                                  title="Click to toggle Active / Paused"
                                >
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: isPaused ? '#EF4444' : '#10B981' }} />
                                  <span>{isPaused ? 'PAUSED' : 'ACTIVE'}</span>
                                </button>
                              </td>

                              <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: 'rgba(251, 191, 36, 0.1)',
                                  border: '1px solid rgba(251, 191, 36, 0.25)',
                                  color: '#FBBF24',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 800
                                }}>
                                  <span>{s.rating || 4.88}</span>
                                  <Star size={11} fill="#FBBF24" color="#FBBF24" />
                                </div>
                              </td>

                              <td style={{ padding: '12px 18px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(s)}
                                    style={{
                                      background: '#1E293B',
                                      color: '#A78BFA',
                                      border: '1px solid #334155',
                                      padding: '5px 10px',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#334155'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E293B'}
                                  >
                                    <Edit3 size={12} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDeleteService(s.id);
                                      addAuditLog('Service Deleted', `Deleted service "${s.title}" from catalogue`, 'service');
                                      showLocalToast(`Deleted "${s.title}"`);
                                    }}
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.15)',
                                      color: '#EF4444',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '5px 10px',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                                  >
                                    <Trash2 size={12} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: LIVE BOOKINGS & DISPATCH                            */}
            {/* ======================================================== */}
            {activeTab === 'orders' && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 900, margin: '0 0 4px', color: '#FFFFFF' }}>
                      Live Customer Orders & Dispatch ({allLiveOrders.length})
                    </h4>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                      Monitor active technician assignment, real-time tracking, and completion status
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['ALL', 'Confirmed', 'Assigned', 'In Transit', 'In Progress', 'Completed', 'Cancelled'].map(st => {
                        const isSel = orderStatusFilter === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderStatusFilter(st)}
                            style={{
                              background: isSel ? '#6E42E5' : '#131D33',
                              color: isSel ? '#FFFFFF' : '#94A3B8',
                              border: '1px solid #334155',
                              padding: '5px 12px',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{
                      position: 'relative',
                      width: 260,
                      background: '#131D33',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px'
                    }}>
                      <Search size={14} color="#94A3B8" />
                      <input
                        type="text"
                        placeholder="Search order ID, customer..."
                        value={orderSearchTerm}
                        onChange={e => setOrderSearchTerm(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#FFFFFF',
                          fontSize: 12,
                          padding: '6px 8px',
                          width: '100%'
                        }}
                      />
                      {orderSearchTerm && (
                        <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setOrderSearchTerm('')} />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredOrders.map(order => (
                    <div key={order.id} style={{
                      background: '#131D33',
                      border: '1px solid #1E293B',
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: '#1E293B',
                          color: '#A78BFA',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 12
                        }}>
                          {order.id.slice(-4)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>{order.service}</span>
                            <span style={{
                              background: '#1E293B',
                              border: '1px solid #334155',
                              color: '#94A3B8',
                              fontSize: 10.5,
                              padding: '1px 6px',
                              borderRadius: 4
                            }}>
                              {order.id}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                            Customer: <strong style={{ color: '#F1F5F9' }}>{order.customer}</strong> • 📍 {order.locality}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                            Partner: <strong style={{ color: '#38BDF8' }}>{order.partner}</strong> • Booked {order.time} • {order.paymentMethod}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981' }}>₹{order.amount}</div>
                          <span style={{
                            background: order.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : order.status === 'In Progress' ? 'rgba(110, 66, 229, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                            color: order.status === 'Completed' ? '#10B981' : order.status === 'In Progress' ? '#A78BFA' : '#38BDF8',
                            fontSize: 11,
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 999
                          }}>
                            ● {order.status}
                          </span>
                        </div>

                        {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <select
                              value={order.partner.includes('Unassigned') ? '' : order.partner}
                              onChange={e => handleAssignPartnerToOrder(order.id, e.target.value)}
                              style={{
                                background: '#0F172A',
                                border: '1px solid #334155',
                                color: '#38BDF8',
                                padding: '6px 8px',
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                outline: 'none'
                              }}
                            >
                              <option value="">Dispatch Pro...</option>
                              {partners.map(p => (
                                <option key={p.id} value={p.name}>{p.name} ({p.locality})</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handleAdvanceOrderStatus(order.id)}
                              style={{
                                background: '#6E42E5',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '7px 12px',
                                borderRadius: 8,
                                fontSize: 11.5,
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Advance Status →
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrderInvoice(order)}
                          style={{
                            background: '#1E293B',
                            color: '#A78BFA',
                            border: '1px solid #334155',
                            padding: '6px 10px',
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Invoice
                        </button>

                        {onCancelBooking && order.status !== 'Completed' && order.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              onCancelBooking(order.id, 'Admin operations cancellation override');
                              addAuditLog('Order Cancelled', `Admin cancelled order #${order.id}`, 'dispatch');
                              showLocalToast(`Cancelled order #${order.id}`);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#F87171',
                              padding: '6px 10px',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: COUPONS & PROMOS                                    */}
            {/* ======================================================== */}
            {activeTab === 'coupons' && (
              <div>
                <div style={{
                  background: '#131D33',
                  border: '1px solid #1E293B',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20
                }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 14px', color: '#F1F5F9' }}>
                    Publish Customer Promo Coupon
                  </h4>
                  <form onSubmit={handleCreateCoupon} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. MONSOON30)"
                      value={newCouponCode}
                      onChange={e => setNewCouponCode(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none',
                        minWidth: 180
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Discount (e.g. 15% OFF or ₹150 FLAT)"
                      value={newCouponDiscount}
                      onChange={e => setNewCouponDiscount(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none',
                        minWidth: 200
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Max Cap (e.g. ₹250)"
                      value={newCouponMax}
                      onChange={e => setNewCouponMax(e.target.value)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none',
                        width: 140
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Min Order (₹)"
                      value={newCouponMin}
                      onChange={e => setNewCouponMin(Number(e.target.value) || 0)}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 13,
                        outline: 'none',
                        width: 130
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#6E42E5',
                        color: '#fff',
                        border: 'none',
                        padding: '9px 20px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Publish Coupon
                    </button>
                  </form>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {coupons.map(c => (
                    <div key={c.code} style={{
                      background: '#131D33',
                      border: '1.5px dashed #334155',
                      borderRadius: 14,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: c.status === 'Active' ? 1 : 0.6
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: '#A78BFA', letterSpacing: 0.5 }}>
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCouponStatus(c.code)}
                            style={{
                              background: c.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: c.status === 'Active' ? '#10B981' : '#F87171',
                              border: 'none',
                              fontSize: 10.5,
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: 4,
                              cursor: 'pointer'
                            }}
                          >
                            {c.status}
                          </button>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>{c.discount} (Max {c.max})</div>
                        <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>Used by {c.used} customers</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.code)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            fontSize: 11,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERNAL MODAL 1: WORKER DOSSIER MODAL                   */}
      {/* ======================================================== */}
      {selectedWorkerDossier && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            padding: 24,
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HardHat size={22} color="#F59E0B" />
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                  Worker Profile Dossier: {selectedWorkerDossier.applicantName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorkerDossier(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5, marginBottom: 18 }}>
              <div>Application ID: <strong style={{ color: '#F1F5F9' }}>{selectedWorkerDossier.id}</strong></div>
              <div>Status: <strong style={{ color: '#10B981' }}>{selectedWorkerDossier.status}</strong></div>
              <div>Contact Phone: <strong style={{ color: '#38BDF8' }}>{selectedWorkerDossier.phone}</strong></div>
              <div>Locality: <strong style={{ color: '#F1F5F9' }}>{selectedWorkerDossier.locality}</strong></div>
              <div>Trade: <strong style={{ color: '#A78BFA' }}>{selectedWorkerDossier.tradeName || selectedWorkerDossier.trade}</strong></div>
              <div>Experience: <strong style={{ color: '#F1F5F9' }}>{selectedWorkerDossier.experience}</strong></div>
              <div>Expected Monthly: <strong style={{ color: '#10B981' }}>{selectedWorkerDossier.expectedIncome}</strong></div>
              <div>Aadhaar Reference: <strong style={{ color: '#CBD5E1' }}>{selectedWorkerDossier.aadhaarNumber}</strong></div>
            </div>

            <div style={{
              background: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: 10,
              padding: 14,
              fontSize: 12,
              marginBottom: 18
            }}>
              <div style={{ fontWeight: 800, color: '#A78BFA', marginBottom: 6 }}>Urban Company Verification Checklist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#94A3B8' }}>
                <div>✓ Aadhaar Biometric Match: <span style={{ color: '#10B981', fontWeight: 700 }}>Verified</span></div>
                <div>✓ Mumbai Police Clearance Certificate: <span style={{ color: '#10B981', fontWeight: 700 }}>Clear (No Records)</span></div>
                <div>✓ Technical Trade Skill Practical Assessment: <span style={{ color: '#10B981', fontWeight: 700 }}>Passed (Score: 94/100)</span></div>
                <div>✓ Safety & Customer Communication Standards: <span style={{ color: '#10B981', fontWeight: 700 }}>Trained & Certified</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedWorkerDossier(null)}
                style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  border: '1px solid #334155',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {selectedWorkerDossier.status !== 'Approved' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApproveWorker(selectedWorkerDossier);
                    setSelectedWorkerDossier(null);
                  }}
                  style={{
                    background: '#10B981',
                    color: '#000',
                    border: 'none',
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL MODAL 2: PARTNER AGENCY DOSSIER MODAL           */}
      {/* ======================================================== */}
      {selectedPartnerDossier && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 16,
            maxWidth: 580,
            width: '100%',
            padding: 24,
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={22} color="#10B981" />
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                  Agency Registration: {selectedPartnerDossier.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartnerDossier(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5, marginBottom: 18 }}>
              <div>Registration ID: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerDossier.id}</strong></div>
              <div>Entity: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerDossier.businessType}</strong></div>
              <div>Owner / Director: <strong style={{ color: '#38BDF8' }}>{selectedPartnerDossier.ownerName}</strong></div>
              <div>Phone: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerDossier.phone}</strong></div>
              <div>Email: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerDossier.email}</strong></div>
              <div>GSTIN: <strong style={{ color: '#10B981' }}>{selectedPartnerDossier.gstNumber}</strong></div>
              <div>Fleet Strength: <strong style={{ color: '#A78BFA' }}>{selectedPartnerDossier.fleetSize}</strong></div>
              <div>Monthly Capacity: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerDossier.monthlyCapacity}</strong></div>
            </div>

            <div style={{
              background: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: 10,
              padding: 14,
              fontSize: 12,
              marginBottom: 18
            }}>
              <div style={{ fontWeight: 800, color: '#10B981', marginBottom: 6 }}>Agency Compliance & Commercial Terms</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#94A3B8' }}>
                <div>✓ Corporate GSTIN Validation: <span style={{ color: '#10B981', fontWeight: 700 }}>Active Taxpayer</span></div>
                <div>✓ Third-Party Liability Insurance: <span style={{ color: '#10B981', fontWeight: 700 }}>Active (Cover up to ₹1 Crore)</span></div>
                <div>✓ Standard Fleet Commission: <span style={{ color: '#38BDF8', fontWeight: 700 }}>20% Platform Fee / 80% Agency Payout</span></div>
                <div>✓ Coverage Zones: <span style={{ color: '#F1F5F9', fontWeight: 700 }}>{selectedPartnerDossier.city}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedPartnerDossier(null)}
                style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  border: '1px solid #334155',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {selectedPartnerDossier.status !== 'Approved' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprovePartner(selectedPartnerDossier.id);
                    setSelectedPartnerDossier(null);
                  }}
                  style={{
                    background: '#10B981',
                    color: '#000',
                    border: 'none',
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Approve Fleet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL MODAL 3: ORDER INVOICE MODAL                    */}
      {/* ======================================================== */}
      {selectedOrderInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 16,
            maxWidth: 540,
            width: '100%',
            padding: 24,
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                  Urban Company Official Tax Invoice
                </h3>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Invoice #{selectedOrderInvoice.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderInvoice(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#131D33', padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Customer Name:</span>
                <strong style={{ color: '#FFFFFF' }}>{selectedOrderInvoice.customer}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Service Item:</span>
                <strong style={{ color: '#A78BFA' }}>{selectedOrderInvoice.service}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Assigned Partner:</span>
                <strong style={{ color: '#38BDF8' }}>{selectedOrderInvoice.partner}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#94A3B8' }}>Delivery Zone:</span>
                <strong style={{ color: '#FFFFFF' }}>{selectedOrderInvoice.locality}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8' }}>Payment Mode:</span>
                <strong style={{ color: '#10B981' }}>{selectedOrderInvoice.paymentMethod}</strong>
              </div>
            </div>

            <div style={{
              borderTop: '1px solid #1E293B',
              borderBottom: '1px solid #1E293B',
              padding: '12px 0',
              marginBottom: 16,
              fontSize: 13
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>Item Subtotal</span>
                <span>₹{selectedOrderInvoice.amount - 49}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>Safety & Delivery Surcharge</span>
                <span>₹49</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, color: '#10B981', marginTop: 8 }}>
                <span>Total Amount Paid</span>
                <span>₹{selectedOrderInvoice.amount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  background: '#6E42E5',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Print / Download PDF
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderInvoice(null)}
                style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  border: '1px solid #334155',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL MODAL 4: PARTNER PROFILE & LEDGER               */}
      {/* ======================================================== */}
      {selectedPartnerProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 16,
            maxWidth: 540,
            width: '100%',
            padding: 24,
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                  Partner Fleet Ledger: {selectedPartnerProfile.name}
                </h3>
                <span style={{ fontSize: 11, color: '#10B981' }}>{selectedPartnerProfile.trade}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartnerProfile(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, marginBottom: 16 }}>
              <div>Partner ID: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerProfile.id}</strong></div>
              <div>Zone: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerProfile.locality}</strong></div>
              <div>Phone: <strong style={{ color: '#38BDF8' }}>{selectedPartnerProfile.phone}</strong></div>
              <div>Vehicle: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerProfile.vehicle}</strong></div>
              <div>Lifetime Completed: <strong style={{ color: '#F1F5F9' }}>{selectedPartnerProfile.jobsCompleted} orders</strong></div>
              <div>Rating CSAT: <strong style={{ color: '#FBBF24' }}>{selectedPartnerProfile.rating} ★ ({selectedPartnerProfile.reviewsCount})</strong></div>
              <div>Today's Earnings: <strong style={{ color: '#10B981' }}>₹{selectedPartnerProfile.todayEarnings}</strong></div>
              <div>Joined: <strong style={{ color: '#CBD5E1' }}>{selectedPartnerProfile.joinedDate}</strong></div>
            </div>

            <div style={{
              background: '#131D33',
              border: '1px solid #1E293B',
              borderRadius: 10,
              padding: 14,
              fontSize: 12,
              marginBottom: 16
            }}>
              <div style={{ fontWeight: 800, color: '#A78BFA', marginBottom: 6 }}>Recent 3 Completed Jobs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#94A3B8' }}>
                <div>1. Powerjet AC Servicing • Bandra West • ₹499 (Rated 5.0 ★)</div>
                <div>2. AC Gas Refill & Leak Check • Khar • ₹1,299 (Rated 4.9 ★)</div>
                <div>3. Master Deep Cleaning (AC) • Juhu • ₹899 (Rated 5.0 ★)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setSelectedPartnerProfile(null)}
                style={{
                  background: '#1E293B',
                  color: '#94A3B8',
                  border: '1px solid #334155',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL MODAL 5: ADD PARTNER PRO DIRECTLY               */}
      {/* ======================================================== */}
      {isAddPartnerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 16,
            maxWidth: 500,
            width: '100%',
            padding: 24,
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                + Onboard Partner Pro to Fleet
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPartnerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePartner}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kamble"
                  value={newProName}
                  onChange={e => setNewProName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131D33',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 XXXXX"
                  value={newProPhone}
                  onChange={e => setNewProPhone(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131D33',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                    Trade / Specialty
                  </label>
                  <input
                    type="text"
                    value={newProTrade}
                    onChange={e => setNewProTrade(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#131D33',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                    Mumbai Locality Zone
                  </label>
                  <input
                    type="text"
                    value={newProLocality}
                    onChange={e => setNewProLocality(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#131D33',
                      border: '1px solid #334155',
                      borderRadius: 8,
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={newProCategory}
                  onChange={e => setNewProCategory(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131D33',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 13,
                    outline: 'none'
                  }}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  style={{
                    background: '#1E293B',
                    color: '#94A3B8',
                    border: '1px solid #334155',
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#10B981',
                    color: '#000',
                    border: 'none',
                    padding: '7px 18px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Save Pro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INTERNAL MODAL 6: BULK PRICE ADJUSTER                    */}
      {/* ======================================================== */}
      {isBulkPriceOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 16,
            maxWidth: 440,
            width: '100%',
            padding: 24,
            color: '#F8FAFC'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>
                Bulk Price Adjustment
              </h3>
              <button
                type="button"
                onClick={() => setIsBulkPriceOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 16 }}>
              Adjust all live catalogue service prices uniformly across Mumbai. Useful during festival surge or promotional campaigns.
            </p>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#CBD5E1', display: 'block', marginBottom: 6 }}>
                Adjustment Percentage (%)
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[5, 10, 15, 20].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setBulkAdjustmentPercent(pct)}
                    style={{
                      flex: 1,
                      background: bulkAdjustmentPercent === pct ? '#6E42E5' : '#131D33',
                      border: '1px solid #334155',
                      color: bulkAdjustmentPercent === pct ? '#fff' : '#94A3B8',
                      padding: '8px 0',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => handleApplyBulkPrice('increase')}
                style={{
                  flex: 1,
                  background: '#10B981',
                  color: '#000',
                  border: 'none',
                  padding: '9px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                + Increase by {bulkAdjustmentPercent}%
              </button>
              <button
                type="button"
                onClick={() => handleApplyBulkPrice('decrease')}
                style={{
                  flex: 1,
                  background: '#EF4444',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                - Discount by {bulkAdjustmentPercent}%
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
