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
  CheckCircle2, 
  Clock, 
  Star, 
  ShieldCheck, 
  Phone, 
  Check, 
  HardHat, 
  Building2, 
  LogOut,
  Eye,
  CloudRain,
  MapPin,
  Briefcase,
  IndianRupee,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
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
  // Navigation tabs: 'overview' | 'bookings' | 'services' | 'workers' | 'partners'
  const [activeTab, setActiveTab] = useState('overview');

  // Multi-hub city selector
  const [selectedCity, setSelectedCity] = useState('Krishnagiri');

  // Monsoon Weather Surge State
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

  function handleToggleSurge() {
    const nextVal = !monsoonSurge;
    setMonsoonSurge(nextVal);
    try {
      localStorage.setItem('uc_admin_monsoon_surge', String(nextVal));
    } catch {}
    if (onToggleMonsoonSurge) {
      onToggleMonsoonSurge(nextVal);
    }
    if (onShowToast) {
      onShowToast(`🌧️ Weather Surge ${nextVal ? 'ACTIVATED (+₹49 rain allowance)' : 'DEACTIVATED (normal rates)'}`);
    }
  }

  // Fallback default bookings if none yet in DB
  const displayBookings = useMemo(() => {
    if (bookings && bookings.length > 0) return bookings;
    return [
      {
        id: 'ORD-9841',
        customerName: 'Aarav Mehta',
        phone: '+91 98201 11223',
        serviceName: 'Powerjet AC Servicing (Split)',
        locality: 'Bandra West',
        city: 'Mumbai',
        date: 'Today',
        timeSlot: '02:00 PM - 03:00 PM',
        amount: 699,
        status: 'In Progress'
      },
      {
        id: 'ORD-9842',
        customerName: 'Sneha Roy',
        phone: '+91 98112 44556',
        serviceName: 'Classic Bathroom Deep Cleaning',
        locality: 'Pali Hill',
        city: 'Mumbai',
        date: 'Today',
        timeSlot: '03:30 PM - 04:30 PM',
        amount: 499,
        status: 'Pending'
      },
      {
        id: 'ORD-9843',
        customerName: 'Vikram Merchant',
        phone: '+91 98330 99887',
        serviceName: 'Switch & Socket Installation',
        locality: 'Khar West',
        city: 'Mumbai',
        date: 'Today',
        timeSlot: '11:00 AM - 12:00 PM',
        amount: 299,
        status: 'Completed'
      },
      {
        id: 'ORD-9844',
        customerName: 'Pooja Iyer',
        phone: '+91 98450 67123',
        serviceName: 'Full Home Deep Cleaning',
        locality: 'Juhu',
        city: 'Mumbai',
        date: 'Tomorrow',
        timeSlot: '10:00 AM - 01:00 PM',
        amount: 2499,
        status: 'Pending'
      }
    ];
  }, [bookings]);

  // Fallback default worker applications
  const displayWorkers = useMemo(() => {
    if (workerApplications && workerApplications.length > 0) return workerApplications;
    return [
      {
        id: 'WRK-84210',
        applicantName: 'Ramesh Vishwakarma',
        phone: '+91 98205 11982',
        trade: 'AC & Appliance Repair',
        locality: 'Bandra West, Mumbai',
        experience: '5 years',
        status: 'Pending Review',
        appliedAt: '2 hours ago'
      },
      {
        id: 'WRK-84211',
        applicantName: 'Suresh Patil',
        phone: '+91 98192 33410',
        trade: 'Master Electrician',
        locality: 'Khar West, Mumbai',
        experience: '4 years',
        status: 'Pending Review',
        appliedAt: 'Yesterday'
      }
    ];
  }, [workerApplications]);

  // Fallback default partner applications
  const displayPartners = useMemo(() => {
    if (partnerApplications && partnerApplications.length > 0) return partnerApplications;
    return [
      {
        id: 'PTR-90142',
        businessName: 'Apex Home Solutions LLP',
        ownerName: 'Sandeep Patil',
        phone: '+91 98210 33411',
        city: 'Mumbai',
        locality: 'Bandra & Khar Cluster',
        trade: 'All Home Maintenance Fleet',
        techniciansCount: 12,
        status: 'Pending Review',
        gstNumber: '27AABCA1234F1Z8',
        appliedAt: '3 days ago'
      }
    ];
  }, [partnerApplications]);

  // Search & Filter States
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState('all');

  // Service Edit / Create Modal State
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    id: '',
    title: '',
    category: 'ac-appliances',
    subcategory: 'AC Service & Repair',
    price: 499,
    rating: 4.8,
    reviewsCount: 120,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
    description: 'Professional expert service with genuine parts and 30-day warranty.'
  });

  function handleOpenCreate() {
    setServiceFormData({
      id: '',
      title: '',
      category: 'ac-appliances',
      subcategory: 'AC Service & Repair',
      price: 499,
      rating: 4.8,
      reviewsCount: 120,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80',
      description: 'Professional expert service with genuine parts and 30-day warranty.'
    });
    setIsServiceFormOpen(true);
  }

  function handleOpenEdit(srv) {
    setServiceFormData({
      id: srv.id,
      title: srv.title || '',
      category: srv.category || 'ac-appliances',
      subcategory: srv.subcategory || '',
      price: srv.price || 499,
      rating: srv.rating || 4.8,
      reviewsCount: srv.reviewsCount || 100,
      image: srv.image || '',
      description: srv.description || ''
    });
    setIsServiceFormOpen(true);
  }

  function handleSaveService(e) {
    e.preventDefault();
    if (!serviceFormData.title.trim()) {
      alert('Please enter a service title');
      return;
    }

    if (serviceFormData.id) {
      // Update
      if (onUpdateService) onUpdateService(serviceFormData);
      if (onShowToast) onShowToast(`✓ Service "${serviceFormData.title}" updated`);
    } else {
      // Create new
      const newSrv = {
        ...serviceFormData,
        id: `srv-${Date.now()}`
      };
      if (onAddService) onAddService(newSrv);
      if (onShowToast) onShowToast(`🎉 Service "${newSrv.title}" added to catalogue`);
    }
    setIsServiceFormOpen(false);
  }

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(srv => {
      const matchCat = serviceCategory === 'all' || srv.category === serviceCategory;
      const matchSearch = !serviceSearch.trim() || 
        (srv.title || '').toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (srv.subcategory || '').toLowerCase().includes(serviceSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, serviceCategory, serviceSearch]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return displayBookings.filter(b => {
      const matchStatus = bookingFilterStatus === 'all' || 
        b.status?.toLowerCase() === bookingFilterStatus.toLowerCase();
      const matchSearch = !bookingSearch.trim() ||
        (b.customerName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.id || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.serviceName || '').toLowerCase().includes(bookingSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [displayBookings, bookingFilterStatus, bookingSearch]);

  // Pending counts
  const pendingWorkersCount = displayWorkers.filter(w => w.status === 'Pending Review' || w.status === 'Pending').length;
  const pendingPartnersCount = displayPartners.filter(p => p.status === 'Pending Review' || p.status === 'Pending').length;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Main White Window */}
      <div style={{
        width: '100%',
        maxWidth: 1320,
        height: '92vh',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>

        {/* ---------------------------------------------------- */}
        {/* LEFT CLEAN WHITE SIDEBAR                              */}
        {/* ---------------------------------------------------- */}
        <aside style={{
          width: 260,
          minWidth: 260,
          backgroundColor: '#FAFAFC',
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Logo / Brand Header */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#6E42E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(110, 66, 229, 0.3)'
              }}>
                <LayoutDashboard size={20} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                  Urban Ops
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                    Live Operations
                  </span>
                </div>
              </div>
            </div>

            {/* City Hub Switcher */}
            <div style={{ padding: '12px 16px 8px' }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: 6
              }}>
                Operating Region
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: 13,
                fontWeight: 600,
                color: '#1F2937'
              }}>
                <MapPin size={15} color="#6E42E5" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#111827',
                    outline: 'none',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="Krishnagiri">Krishnagiri Hub</option>
                  <option value="Mumbai">Mumbai Metro Hub</option>
                  <option value="Bengaluru">Bengaluru Hub</option>
                  <option value="Delhi NCR">Delhi NCR Hub</option>
                </select>
              </div>
            </div>

            {/* Clean Navigation Menu */}
            <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'bookings', label: 'Live Bookings', icon: ShoppingBag, count: displayBookings.length },
                { id: 'services', label: 'Services Catalogue', icon: Wrench, count: services.length },
                { id: 'workers', label: 'Worker Applications', icon: HardHat, count: pendingWorkersCount, badgeColor: '#EF4444' },
                { id: 'partners', label: 'Partner Agencies', icon: Building2, count: pendingPartnersCount, badgeColor: '#3B82F6' }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: isActive ? '#6E42E5' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#4B5563',
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#EEF2F6';
                        e.currentTarget.style.color = '#111827';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4B5563';
                      }
                    }}
                  >
                    <Icon size={18} color={isActive ? '#FFFFFF' : '#6B7280'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 9999,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : (item.badgeColor || '#E5E7EB'),
                        color: isActive ? '#FFFFFF' : (item.badgeColor ? '#FFFFFF' : '#374151')
                      }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin User Footer / Logout */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#EDE9FE',
                color: '#6E42E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0
              }}>
                A
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Super Admin
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  admin@urbancompany.com
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onAdminLogout) onAdminLogout();
                onClose();
              }}
              title="Lock Session & Exit"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
                e.currentTarget.style.borderColor = '#FCA5A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* ---------------------------------------------------- */}
        {/* RIGHT MAIN CONTENT AREA                               */}
        {/* ---------------------------------------------------- */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden'
        }}>
          {/* Top Bar */}
          <header style={{
            height: 64,
            padding: '0 28px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>
                {activeTab === 'overview' && 'Operations Dashboard'}
                {activeTab === 'bookings' && 'Live Customer Bookings'}
                {activeTab === 'services' && 'Services Catalogue Manager'}
                {activeTab === 'workers' && 'Worker Onboarding Applications'}
                {activeTab === 'partners' && 'Franchise Partner Agencies'}
              </h2>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0 0' }}>
                {selectedCity} Operations Command • Synchronized with active database
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Rain Surge Weather Control Button */}
              <button
                type="button"
                onClick={handleToggleSurge}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${monsoonSurge ? '#86EFAC' : '#E5E7EB'}`,
                  backgroundColor: monsoonSurge ? '#ECFDF5' : '#F9FAFB',
                  color: monsoonSurge ? '#065F46' : '#4B5563',
                  transition: 'all 0.15s ease'
                }}
              >
                <CloudRain size={16} color={monsoonSurge ? '#059669' : '#6B7280'} />
                <span>Rain Surge: {monsoonSurge ? 'ON (+₹49)' : 'OFF'}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  color: '#4B5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#4B5563';
                }}
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </div>
          </header>

          {/* Scrollable Content Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            backgroundColor: '#F8FAFC'
          }}>

            {/* ======================================================== */}
            {/* TAB 1: OVERVIEW (CLEAN & SIMPLE)                         */}
            {/* ======================================================== */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* 4 Clean Key Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 16
                }}>
                  {/* Card 1: Revenue */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Total GMV</span>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IndianRupee size={16} color="#7C3AED" />
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      ₹48,43,294
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>↑ 19.2%</span>
                      <span style={{ color: '#94A3B8' }}>vs last month</span>
                    </div>
                  </div>

                  {/* Card 2: Bookings */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Orders Today</span>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={16} color="#059669" />
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      143 Bookings
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', marginTop: 4 }}>
                      96.8% on-time arrival
                    </div>
                  </div>

                  {/* Card 3: Verified Pros */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Verified Pros</span>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="#2563EB" />
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                      1,845 Pros
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', marginTop: 4 }}>
                      Active across 15 zones
                    </div>
                  </div>

                  {/* Card 4: CSAT Rating */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Average Rating</span>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={16} color="#D97706" fill="#D97706" />
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>4.89</span>
                      <span style={{ fontSize: 16, color: '#D97706' }}>★</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                      1.2M+ verified customer reviews
                    </div>
                  </div>
                </div>

                {/* Surge Banner / Operational Note */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: '16px 20px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: monsoonSurge ? '#ECFDF5' : '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CloudRain size={20} color={monsoonSurge ? '#059669' : '#64748B'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                        Monsoon Weather Surge Pricing
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                        {monsoonSurge 
                          ? 'Active: An automatic ₹49 bad-weather allowance is applied to all outdoor technician bookings.'
                          : 'Inactive: Standard catalogue rates are in effect with no rain surcharge.'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSurge}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: monsoonSurge ? '#059669' : '#6E42E5',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {monsoonSurge ? 'Turn Off Surge' : 'Enable Rain Surge (+₹49)'}
                  </button>
                </div>

                {/* 2-Column Split: Recent Bookings & Pending Applications */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
                  
                  {/* Left: Recent Bookings Table */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Recent Bookings
                        </h3>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                          Latest dispatch requests across {selectedCity}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6E42E5',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        View All ({displayBookings.length}) <ChevronRight size={14} />
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase' }}>
                            <th style={{ padding: '8px 6px' }}>Booking</th>
                            <th style={{ padding: '8px 6px' }}>Customer</th>
                            <th style={{ padding: '8px 6px' }}>Service</th>
                            <th style={{ padding: '8px 6px' }}>Amount</th>
                            <th style={{ padding: '8px 6px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayBookings.slice(0, 5).map(b => (
                            <tr key={b.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                              <td style={{ padding: '10px 6px', fontWeight: 700, color: '#6E42E5' }}>{b.id}</td>
                              <td style={{ padding: '10px 6px', color: '#1E293B' }}>{b.customerName}</td>
                              <td style={{ padding: '10px 6px', color: '#475569', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {b.serviceName}
                              </td>
                              <td style={{ padding: '10px 6px', fontWeight: 700, color: '#0F172A' }}>₹{b.amount}</td>
                              <td style={{ padding: '10px 6px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 9999,
                                  backgroundColor: b.status === 'Completed' ? '#ECFDF5' : b.status === 'In Progress' ? '#FFFBEB' : '#F1F5F9',
                                  color: b.status === 'Completed' ? '#059669' : b.status === 'In Progress' ? '#D97706' : '#475569'
                                }}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Pending Applications Queue */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '18px 20px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          Pending Approvals
                        </h3>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                          Technician and Partner onboarding requests
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {displayWorkers.slice(0, 3).map(w => (
                        <div key={w.id} style={{
                          padding: '12px',
                          borderRadius: 8,
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{w.applicantName}</div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{w.trade} • {w.experience}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateWorkerApplicationStatus) onUpdateWorkerApplicationStatus(w.id, 'Approved');
                                if (onShowToast) onShowToast(`✓ Worker "${w.applicantName}" approved!`);
                              }}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                border: 'none',
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateWorkerApplicationStatus) onUpdateWorkerApplicationStatus(w.id, 'Rejected');
                                if (onShowToast) onShowToast(`✕ Application rejected.`);
                              }}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}

                      {displayPartners.slice(0, 1).map(p => (
                        <div key={p.id} style={{
                          padding: '12px',
                          borderRadius: 8,
                          backgroundColor: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>{p.businessName}</div>
                            <div style={{ fontSize: 11.5, color: '#0284C7', marginTop: 2 }}>{p.techniciansCount} Technicians • {p.city}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdatePartnerApplicationStatus) onUpdatePartnerApplicationStatus(p.id, 'Approved');
                              if (onShowToast) onShowToast(`✓ Partner "${p.businessName}" approved!`);
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: 'none',
                              backgroundColor: '#0284C7',
                              color: '#FFFFFF',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: LIVE BOOKINGS (CLEAN & COMPLETE)                  */}
            {/* ======================================================== */}
            {activeTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                
                {/* Search & Status Filters */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #D1D5DB',
                    borderRadius: 8,
                    padding: '8px 12px',
                    width: 320
                  }}>
                    <Search size={16} color="#64748B" />
                    <input
                      type="text"
                      placeholder="Search by customer, service or ID..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        fontSize: 13,
                        outline: 'none',
                        width: '100%',
                        color: '#0F172A'
                      }}
                    />
                  </div>

                  {/* Status Pills */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['all', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setBookingFilterStatus(st)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: `1px solid ${bookingFilterStatus === st ? '#6E42E5' : '#E2E8F0'}`,
                          backgroundColor: bookingFilterStatus === st ? '#6E42E5' : '#FFFFFF',
                          color: bookingFilterStatus === st ? '#FFFFFF' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {st === 'all' ? 'All Bookings' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bookings Table */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: 12, fontWeight: 700 }}>
                        <th style={{ padding: '12px 18px' }}>Booking ID</th>
                        <th style={{ padding: '12px 18px' }}>Customer & Phone</th>
                        <th style={{ padding: '12px 18px' }}>Service Name</th>
                        <th style={{ padding: '12px 18px' }}>Schedule Slot</th>
                        <th style={{ padding: '12px 18px' }}>Amount</th>
                        <th style={{ padding: '12px 18px' }}>Status</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '14px 18px', fontWeight: 800, color: '#6E42E5' }}>{b.id}</td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.customerName || 'Customer'}</div>
                              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{b.phone || '+91 98200 00000'}</div>
                            </td>
                            <td style={{ padding: '14px 18px', color: '#1E293B', fontWeight: 600 }}>{b.serviceName}</td>
                            <td style={{ padding: '14px 18px', color: '#64748B', fontSize: 12.5 }}>
                              {b.date || 'Today'} • {b.timeSlot || '02:00 PM'}
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A' }}>₹{b.amount}</td>
                            <td style={{ padding: '14px 18px' }}>
                              <select
                                value={b.status}
                                onChange={(e) => {
                                  if (onUpdateBookingStatus) onUpdateBookingStatus(b.id, e.target.value);
                                  if (onShowToast) onShowToast(`✓ Status updated to ${e.target.value}`);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: `1px solid ${b.status === 'Completed' ? '#86EFAC' : b.status === 'In Progress' ? '#FDE68A' : '#E2E8F0'}`,
                                  backgroundColor: b.status === 'Completed' ? '#ECFDF5' : b.status === 'In Progress' ? '#FFFBEB' : '#F8FAFC',
                                  color: b.status === 'Completed' ? '#047857' : b.status === 'In Progress' ? '#B45309' : '#334155'
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                              {b.status !== 'Cancelled' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onCancelBooking) onCancelBooking(b.id);
                                    if (onShowToast) onShowToast(`Cancelled booking ${b.id}`);
                                  }}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 6,
                                    border: '1px solid #FCA5A5',
                                    backgroundColor: '#FEF2F2',
                                    color: '#DC2626',
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                            No bookings found matching your filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: SERVICES CATALOGUE (CLEAN & COMPLETE)             */}
            {/* ======================================================== */}
            {activeTab === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                
                {/* Search, Category Filter & Add Button */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #D1D5DB',
                      borderRadius: 8,
                      padding: '8px 12px',
                      width: 260
                    }}>
                      <Search size={16} color="#64748B" />
                      <input
                        type="text"
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        style={{ border: 'none', backgroundColor: 'transparent', fontSize: 13, outline: 'none', width: '100%' }}
                      />
                    </div>

                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #D1D5DB',
                        backgroundColor: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Categories ({services.length})</option>
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {onResetServices && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset catalogue to original 51 services?')) {
                            onResetServices();
                            if (onShowToast) onShowToast('Catalogue reset to defaults');
                          }
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          color: '#475569',
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Reset Defaults
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#6E42E5',
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(110, 66, 229, 0.3)'
                      }}
                    >
                      <Plus size={16} /> Add New Service
                    </button>
                  </div>
                </div>

                {/* Services Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16
                }}>
                  {filteredServices.map(srv => (
                    <div key={srv.id} style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                    }}>
                      <div style={{ height: 130, width: '100%', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={srv.image}
                          alt={srv.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80';
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(15, 23, 42, 0.8)',
                          color: '#FFFFFF',
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6
                        }}>
                          {srv.subcategory || srv.category}
                        </span>
                      </div>

                      <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4, lineHeight: 1.3 }}>
                            {srv.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
                            <span style={{ color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Star size={12} fill="#D97706" /> {srv.rating || '4.8'}
                            </span>
                            <span>•</span>
                            <span>{srv.reviewsCount || '100'} reviews</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                            ₹{srv.price}
                          </span>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(srv)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 6,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#F8FAFC',
                                color: '#334155',
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Edit3 size={13} /> Edit
                            </button>

                            {onDeleteService && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete "${srv.title}"?`)) {
                                    onDeleteService(srv.id);
                                    if (onShowToast) onShowToast(`Deleted ${srv.title}`);
                                  }
                                }}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  border: '1px solid #FECACA',
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  fontSize: 12,
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: WORKER APPLICATIONS (CLEAN LIST)                  */}
            {/* ======================================================== */}
            {activeTab === 'workers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Technician Recruitment Queue
                    </h3>
                    <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0 0' }}>
                      Individual professionals applying to work on the Urban Company platform
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {displayWorkers.map(w => (
                    <div key={w.id} style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#475569'
                        }}>
                          <HardHat size={22} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{w.applicantName}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 4, backgroundColor: '#ECFDF5', color: '#059669' }}>
                              Aadhaar Verified
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>
                            {w.trade} • {w.experience} experience • {w.locality}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span>📞 <strong>{w.phone}</strong></span>
                            {w.email && <span>✉️ <strong>{w.email}</strong></span>}
                            {w.password ? (
                              <span style={{ color: '#059669', fontWeight: 600 }}>🔑 Password Configured</span>
                            ) : null}
                            <span style={{ color: '#94A3B8' }}>🕒 Applied {w.appliedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          backgroundColor: w.status === 'Approved' ? '#ECFDF5' : w.status === 'Rejected' ? '#FEF2F2' : '#FFFBEB',
                          color: w.status === 'Approved' ? '#059669' : w.status === 'Rejected' ? '#DC2626' : '#D97706'
                        }}>
                          {w.status}
                        </span>

                        {w.status === 'Pending Review' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateWorkerApplicationStatus) onUpdateWorkerApplicationStatus(w.id, 'Approved');
                                if (onShowToast) onShowToast(`✓ Worker "${w.applicantName}" approved!`);
                              }}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdateWorkerApplicationStatus) onUpdateWorkerApplicationStatus(w.id, 'Rejected');
                                if (onShowToast) onShowToast(`✕ Application rejected.`);
                              }}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: PARTNER AGENCIES (CLEAN FLEET)                    */}
            {/* ======================================================== */}
            {activeTab === 'partners' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Franchise Partner Agencies
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0 0' }}>
                    Contractor fleets and authorized agency partners managing multi-technician teams
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {displayPartners.map(p => (
                    <div key={p.id} style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563EB'
                        }}>
                          <Building2 size={22} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{p.businessName}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 4, backgroundColor: '#F5F3FF', color: '#6D28D9' }}>
                              {p.businessType || 'Fleet Agency'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                            Managing Director: <strong>{p.ownerName}</strong> • {p.categoryName || p.category || 'Services'} • {p.city}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span>📞 <strong>{p.phone}</strong></span>
                            {p.email && <span>✉️ <strong>{p.email}</strong></span>}
                            {p.password ? (
                              <span style={{ color: '#059669', fontWeight: 600 }}>🔑 Password Configured</span>
                            ) : (
                              <span style={{ color: '#64748B' }}>🔑 Default Master Auth</span>
                            )}
                            <span style={{ color: '#2563EB', fontWeight: 600 }}>Fleet: {p.techniciansCount || p.fleetSize || 'Fleet'}</span>
                            {p.appliedAt && <span style={{ color: '#94A3B8' }}>🕒 Applied {p.appliedAt}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 6,
                          backgroundColor: p.status === 'Approved' ? '#ECFDF5' : p.status === 'Rejected' ? '#FEF2F2' : '#EFF6FF',
                          color: p.status === 'Approved' ? '#059669' : p.status === 'Rejected' ? '#DC2626' : '#2563EB'
                        }}>
                          {p.status}
                        </span>

                        {p.status === 'Pending Review' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdatePartnerApplicationStatus) onUpdatePartnerApplicationStatus(p.id, 'Approved');
                                if (onShowToast) onShowToast(`✓ Partner "${p.businessName}" approved!`);
                              }}
                              style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: 'none',
                                backgroundColor: '#2563EB',
                                color: '#FFFFFF',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Approve Agency
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onUpdatePartnerApplicationStatus) onUpdatePartnerApplicationStatus(p.id, 'Rejected');
                                if (onShowToast) onShowToast(`✕ Application rejected.`);
                              }}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#64748B',
                                fontSize: 12.5,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        </main>

      </div>

      {/* ---------------------------------------------------- */}
      {/* SERVICE ADD / EDIT MODAL (CLEAN & MINIMAL)           */}
      {/* ---------------------------------------------------- */}
      {isServiceFormOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: '100%',
            maxWidth: 520,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {serviceFormData.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceFormOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.title}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Subcategory / Tag</label>
                <input
                  type="text"
                  value={serviceFormData.subcategory}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, subcategory: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Image URL</label>
                <input
                  type="text"
                  value={serviceFormData.image}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsServiceFormOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#6E42E5', color: '#FFFFFF', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
