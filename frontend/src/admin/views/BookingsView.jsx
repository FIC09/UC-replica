import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getSocket } from '../../api/socketClient';
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  User, 
  Phone, 
  Mail,
  MapPin, 
  Calendar, 
  CreditCard, 
  Wrench, 
  IndianRupee,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Plus,
  RefreshCw,
  Printer,
  Shield,
  ShieldCheck,
  ArrowUpDown,
  MessageSquare,
  FileText,
  Ban,
  RotateCcw,
  Check,
  Sparkles,
  HelpCircle,
  Briefcase,
  Timer,
  Zap,
  Radio,
  Star,
  Compass,
  Trash2,
  Camera,
  Edit,
  Edit2
} from 'lucide-react';
import { adminClient } from '../adminClient';

// Valid Lifecycle Pipeline definition
const LIFECYCLE_STAGES = ['Pending', 'Confirmed', 'Assigned', 'En Route', 'In Progress', 'Completed'];

const VALID_TRANSITIONS = {
  'Pending': ['Confirmed', 'Cancelled', 'Failed'],
  'Confirmed': ['Assigned', 'Cancelled', 'Failed'],
  'Assigned': ['En Route', 'Assigned', 'Confirmed', 'Cancelled', 'Failed'],
  'En Route': ['In Progress', 'Cancelled', 'Failed'],
  'In Progress': ['Completed', 'Failed', 'Cancelled'],
  'Completed': [],
  'Cancelled': [],
  'Failed': ['Pending', 'Cancelled']
};

export function BookingsView({ onShowToast, onNavigate }) {
  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Active Drawers / Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState(null);

  // CRUD Modals & Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const initialCreateForm = {
    userName: '',
    userPhone: '+91 ',
    userEmail: '',
    serviceName: 'AC Deep Clean & Jet Pump Service',
    serviceCategory: 'Appliance Repair',
    totalAmount: 899,
    city: 'Krishnagiri',
    serviceZone: 'Gandhi Nagar',
    address: '',
    slot: '11:30 AM - 01:00 PM',
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash After Service (COD)',
    assignmentMode: 'AUTO',
    assignedPartner: '',
    professionalId: '',
    customerInstructions: ''
  };
  const [createFormData, setCreateFormData] = useState(initialCreateForm);

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Action Form States
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedProForAssign, setSelectedProForAssign] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ newDate: '', newSlot: '10:00 AM - 11:30 AM', reason: 'Customer requested schedule adjustment' });
  const [cancelData, setCancelData] = useState({ reason: 'Customer requested cancellation', feeCharged: 0 });
  const [refundData, setRefundData] = useState({ amount: '', reason: 'Service quality dispute' });

  // Real-time Assignment Engine States
  const [assignmentStats, setAssignmentStats] = useState({
    totalUnassigned: 0,
    pendingOffers: 0,
    autoAssigned: 0,
    manuallyAssigned: 0,
    rejectedOrExpired: 0,
    awaitingOwnerAttention: 0
  });
  const [manualAssignBooking, setManualAssignBooking] = useState(null);
  const [eligiblePros, setEligiblePros] = useState([]);
  const [loadingEligiblePros, setLoadingEligiblePros] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [offerTimeout, setOfferTimeout] = useState(120);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateFilter, setCandidateFilter] = useState('ALL');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 1-second countdown ticker for offer expirations
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch assignment KPIs
  const fetchAssignmentStats = () => {
    adminClient.getAssignmentStats()
      .then(res => {
        if (res && res.stats) setAssignmentStats(res.stats);
      })
      .catch(err => console.warn('Assignment stats load note:', err.message));
  };

  useEffect(() => {
    fetchAssignmentStats();
  }, []);

  // Active filters ref for instant real-time synchronization
  const filtersRef = useRef({});
  filtersRef.current = {
    search,
    statusFilter,
    paymentFilter,
    cityFilter,
    categoryFilter,
    partnerFilter,
    assignedFilter,
    dateRangeFilter,
    sortBy,
    sortOrder,
    page
  };

  // Fetch bookings with current filters (supports silent background refresh)
  const fetchBookingsList = (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    }
    const current = filtersRef.current || {};
    const params = {
      search: current.search || search,
      status: current.statusFilter || statusFilter,
      paymentStatus: current.paymentFilter || paymentFilter,
      city: current.cityFilter || cityFilter,
      category: current.categoryFilter || categoryFilter,
      partnerAgency: current.partnerFilter || partnerFilter,
      assigned: current.assignedFilter || assignedFilter,
      dateRange: current.dateRangeFilter || dateRangeFilter,
      sortBy: current.sortBy || sortBy,
      sortOrder: current.sortOrder || sortOrder,
      page: current.page || page,
      limit: 10
    };

    return adminClient.getBookings(params)
      .then(res => {
        setBookings(res.bookings || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        if (showLoadingSpinner) {
          setLoading(false);
        }
        return res;
      })
      .catch(() => {
        if (showLoadingSpinner) {
          setLoading(false);
        }
      });
  };

  // Automatic Real-Time Synchronization Engine (BroadcastChannel + LocalStorage + Focus + 3s Silent Poll)
  useEffect(() => {
    // 1. Instant 0ms Cross-Tab Sync via BroadcastChannel
    let broadcastChannel = null;
    try {
      broadcastChannel = new BroadcastChannel('uc_sync_channel');
      broadcastChannel.onmessage = (event) => {
        const data = event.data || {};
        if (data.type === 'BOOKING_CREATED') {
          setPage(1);
          fetchBookingsList(false);
          fetchAssignmentStats();
          const bookingId = data.booking?.id || data.bookingId || data.id || 'Order';
          onShowToast && onShowToast(`🛎️ New booking received: ${bookingId}!`);
        } else if (data.type === 'BOOKING_UPDATED' || data.type === 'BOOKING_DELETED') {
          fetchBookingsList(false); // Immediate silent refresh
          fetchAssignmentStats();
          const bookingId = data.booking?.id || data.bookingId || data.id || 'Order';
          if (data.type === 'BOOKING_DELETED') {
            onShowToast && onShowToast(`🗑️ Booking record ${bookingId} removed.`);
          } else {
            onShowToast && onShowToast(`🛎️ Real-time sync: ${bookingId} updated!`);
          }
        }
      };
    } catch (bcErr) {}

    // 2. Cross-Tab Fallback via Storage Event
    const handleStorageEvent = (e) => {
      if (e.key === 'uc_last_booking_event') {
        fetchBookingsList(false);
        fetchAssignmentStats();
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 3. Immediate Refresh when switching to the Admin Dashboard Tab
    const handleTabFocus = () => {
      fetchBookingsList(false);
      fetchAssignmentStats();
    };
    window.addEventListener('focus', handleTabFocus);

    // 4. Continuous Fast Silent Background Polling (Every 3 seconds)
    const pollInterval = setInterval(() => {
      fetchBookingsList(false);
      fetchAssignmentStats();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('focus', handleTabFocus);
      if (broadcastChannel) {
        try { broadcastChannel.close(); } catch (e) {}
      }
    };
  }, []);

  const handleOpenAssignModal = (booking) => {
    const b = booking || selectedBooking;
    if (!b) return;
    setManualAssignBooking(b);
    setSelectedCandidate(null);
    setCandidateSearch('');
    setCandidateFilter('ALL');
    setLoadingEligiblePros(true);
    setOfferTimeout(120);

    adminClient.getEligibleProfessionals(b.id || b.bookingReference)
      .then(res => {
        const raw = res.eligibleProfessionals || res.candidates || [];
        const normalized = raw.map(c => {
          const w = c.worker || {};
          const proId = c.id || w.id || (w._id ? w._id.toString() : '');
          const proName = c.name || w.applicantName || w.name || 'Professional';
          return {
            ...c,
            id: proId,
            name: proName,
            phone: c.phone || w.phone || '',
            trade: c.trade || w.tradeName || w.trade || 'Specialist',
            skills: c.skills || w.skills || [],
            rating: c.rating != null ? Number(c.rating) : (w.rating != null ? Number(w.rating) : 5.0),
            isVerified: c.isVerified != null ? c.isVerified : (w.status === 'Approved'),
            isOnline: c.isOnline != null ? c.isOnline : (w.dispatchState !== 'Offline'),
            isAvailable: c.isAvailable != null ? c.isAvailable : (!c.isBusy),
            isEligible: c.isEligible != null ? c.isEligible : true,
            distanceKm: c.distanceKm != null ? c.distanceKm : 1.5,
            score: c.score != null ? c.score : (c.totalScore || 80),
            attendanceStatus: c.attendanceStatus || (w.dispatchState === 'Offline' ? 'OFFLINE' : 'PRESENT'),
            attendanceLabel: c.attendanceLabel || (w.dispatchState === 'Offline' ? 'Offline' : 'Present & Available'),
            attendanceScore: c.attendanceScore != null ? c.attendanceScore : 30,
            workloadStatus: c.workloadStatus || 'OPTIMAL',
            workloadLabel: c.workloadLabel || 'Optimal (0 active jobs)',
            workloadScore: c.workloadScore != null ? c.workloadScore : 30,
            activeBookingsCount: c.activeBookingsCount || 0,
            maxDailyJobs: c.maxDailyJobs || 4,
            isCapacityReached: !!c.isCapacityReached,
            isSlotConflict: !!c.isSlotConflict
          };
        });
        setEligiblePros(normalized);
        setLoadingEligiblePros(false);
      })
      .catch(err => {
        onShowToast && onShowToast(`Failed to load candidates: ${err.message}`);
        setEligiblePros([]);
        setLoadingEligiblePros(false);
      });
  };

  const handleDispatchManualOffer = async () => {
    if (!manualAssignBooking || !selectedCandidate) return;
    setIsSubmittingOffer(true);
    try {
      const res = await adminClient.sendManualOffer(
        manualAssignBooking.id || manualAssignBooking.bookingReference,
        selectedCandidate.id,
        offerTimeout
      );
      if (res.success) {
        onShowToast && onShowToast(`✓ Offer sent to ${selectedCandidate.name}! (${offerTimeout}s timeout)`);
        setManualAssignBooking(null);
        setSelectedCandidate(null);
        fetchBookingsList();
        fetchAssignmentStats();
      } else {
        onShowToast && onShowToast(`Offer dispatch error: ${res.error || res.message}`);
      }
    } catch (err) {
      onShowToast && onShowToast(`Failed to dispatch offer: ${err.message}`);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleDirectAssignWorker = async () => {
    const booking = manualAssignBooking || selectedBooking;
    if (!booking || !selectedCandidate) return;
    setIsSubmittingOffer(true);
    try {
      const res = await adminClient.assignProfessional(booking.id || booking.bookingReference, {
        professionalId: selectedCandidate.id,
        professionalName: selectedCandidate.name,
        professionalPhone: selectedCandidate.phone,
        trade: selectedCandidate.trade || selectedCandidate.tradeName || 'Specialist Technician',
        partnerAgency: selectedCandidate.partnerAgencyName || ''
      });
      if (res && res.success !== false) {
        onShowToast && onShowToast(`✓ Worker ${selectedCandidate.name} directly assigned to ${booking.id || booking.bookingReference}!`);
        setManualAssignBooking(null);
        setShowAssignModal(false);
        setSelectedCandidate(null);
        fetchBookingsList(false);
        fetchAssignmentStats();
        try {
          const syncChannel = new BroadcastChannel('uc_sync_channel');
          syncChannel.postMessage({ type: 'BOOKING_UPDATED', bookingId: booking.id, timestamp: Date.now() });
          syncChannel.close();
        } catch (e) {}
      } else {
        onShowToast && onShowToast(`Assignment notice: ${res?.error || res?.message || 'Error assigning professional'}`);
      }
    } catch (err) {
      onShowToast && onShowToast(`Failed to assign worker: ${err.message}`);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleSwitchMode = async (bookingId, currentMode) => {
    const newMode = currentMode === 'AUTO' ? 'MANUAL' : 'AUTO';
    try {
      const res = await adminClient.switchAssignmentMode(bookingId, newMode);
      if (res.success) {
        onShowToast && onShowToast(`✓ Mode switched to ${newMode} for ${bookingId}`);
        fetchBookingsList();
        fetchAssignmentStats();
      }
    } catch (err) {
      onShowToast && onShowToast(`Failed to change mode: ${err.message}`);
    }
  };

  const handleRetryAutoAssign = async (bookingId) => {
    try {
      onShowToast && onShowToast(`🔄 Retrying auto-assignment for ${bookingId}...`);
      const res = await adminClient.retryAutoAssign(bookingId);
      if (res.success) {
        onShowToast && onShowToast(`✓ Auto-assignment algorithm initiated for ${bookingId}`);
        fetchBookingsList();
        fetchAssignmentStats();
      }
    } catch (err) {
      onShowToast && onShowToast(`Auto-assign retry error: ${err.message}`);
    }
  };

  // Filter change listener
  useEffect(() => {
    fetchBookingsList(true);
  }, [search, statusFilter, paymentFilter, cityFilter, categoryFilter, partnerFilter, assignedFilter, dateRangeFilter, sortBy, sortOrder, page]);

  // Load available professionals for assignment
  useEffect(() => {
    adminClient.getProfessionals({ limit: 50 })
      .then(res => setProfessionals(res.professionals || []))
      .catch(() => {});
  }, []);

  // Update lifecycle transition
  function handleTransition(newStatus) {
    if (!selectedBooking) return;
    adminClient.updateLifecycleStatus(selectedBooking.id, newStatus, `Lifecycle transitioned to ${newStatus}`)
      .then(() => {
        onShowToast && onShowToast(`✓ Booking ${selectedBooking.id} moved to ${newStatus}`);
        setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: newStatus } : b));
        setSelectedBooking(prev => ({
          ...prev,
          status: newStatus,
          timeline: [
            ...(prev.timeline || []),
            {
              id: 'tl-' + Date.now(),
              status: newStatus,
              title: `Status set to ${newStatus}`,
              description: `Lifecycle transition triggered by Administrator`,
              actor: 'Administrator',
              actorRole: 'Admin',
              timestamp: new Date()
            }
          ]
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error updating status: ${err.message}`);
      });
  }

  // Handle Assign Professional
  function handleAssignProSubmit() {
    if (!selectedBooking || !selectedProForAssign) return;
    const pro = professionals.find(p => (p.id || p._id) === selectedProForAssign);
    if (!pro) return;

    adminClient.assignProfessional(selectedBooking.id, {
      professionalId: pro.id || pro._id,
      professionalName: pro.applicantName || pro.name,
      professionalPhone: pro.phone,
      trade: pro.trade || pro.tradeName || 'Specialist Technician',
      partnerAgency: pro.partnerAgencyName || ''
    })
      .then(() => {
        onShowToast && onShowToast(`✓ Professional ${pro.applicantName || pro.name} assigned to ${selectedBooking.id}`);
        setShowAssignModal(false);
        fetchBookingsList();
        if (selectedBooking) {
          setSelectedBooking(prev => ({
            ...prev,
            status: 'Assigned',
            assignedPartner: pro.applicantName || pro.name,
            assignedProfessional: {
              id: pro.id || pro._id,
              name: pro.applicantName || pro.name,
              phone: pro.phone,
              trade: pro.trade || pro.tradeName || 'Specialist Technician'
            }
          }));
        }
      })
      .catch(err => {
        onShowToast && onShowToast(`Assignment notice: ${err.message}`);
      });
  }

  // Handle Reschedule
  function handleRescheduleSubmit() {
    if (!selectedBooking) return;
    adminClient.rescheduleBooking(selectedBooking.id, rescheduleData.newSlot, rescheduleData.newDate, rescheduleData.reason)
      .then(() => {
        onShowToast && onShowToast(`✓ Booking ${selectedBooking.id} rescheduled to ${rescheduleData.newDate} (${rescheduleData.newSlot})`);
        setShowRescheduleModal(false);
        fetchBookingsList();
        setSelectedBooking(prev => ({
          ...prev,
          slot: `${rescheduleData.newDate}, ${rescheduleData.newSlot}`
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error rescheduling: ${err.message}`);
      });
  }

  // Handle Cancel
  function handleCancelSubmit() {
    if (!selectedBooking) return;
    adminClient.cancelBooking(selectedBooking.id, cancelData.reason, cancelData.feeCharged)
      .then(() => {
        onShowToast && onShowToast(`✓ Booking ${selectedBooking.id} cancelled`);
        setShowCancelModal(false);
        fetchBookingsList();
        setSelectedBooking(prev => ({ ...prev, status: 'Cancelled' }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Error cancelling: ${err.message}`);
      });
  }

  // Handle Refund
  function handleRefundSubmit() {
    if (!selectedBooking) return;
    const amount = parseFloat(refundData.amount) || selectedBooking.totalAmount;
    adminClient.refundBooking(selectedBooking.id, amount, refundData.reason)
      .then(() => {
        onShowToast && onShowToast(`✓ Refund of ₹${amount} initiated for ${selectedBooking.id}`);
        setShowRefundModal(false);
        fetchBookingsList();
        setSelectedBooking(prev => ({
          ...prev,
          paymentStatus: 'Refunded',
          refundDetails: {
            amount,
            status: 'Processed',
            reason: refundData.reason,
            refundedAt: new Date()
          }
        }));
      })
      .catch(err => {
        onShowToast && onShowToast(`Refund issue: ${err.message}`);
      });
  }

  // Handle Create Booking (Admin On-Behalf)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.userName.trim()) {
      onShowToast && onShowToast('Please provide a customer name.');
      return;
    }
    if (!createFormData.userPhone.trim() || createFormData.userPhone.trim() === '+91') {
      onShowToast && onShowToast('Please provide a valid phone number.');
      return;
    }
    if (!createFormData.address.trim()) {
      onShowToast && onShowToast('Please enter the service street address.');
      return;
    }

    setIsSubmittingCreate(true);
    try {
      const res = await adminClient.createBooking(createFormData);
      if (res && res.success !== false) {
        const created = res.booking || {};
        const refId = created.id || created.bookingReference || 'Order';
        onShowToast && onShowToast(`✓ Booking #${refId} created and dispatched to Atlas successfully!`);
        setShowCreateModal(false);
        setCreateFormData(initialCreateForm);

        // Optimistically prepend to table
        if (created.id) {
          setBookings(prev => [created, ...prev.filter(b => b.id !== created.id)]);
          setPagination(prev => ({ ...prev, total: (prev.total || 0) + 1 }));
        }

        // Broadcast across tabs
        try {
          const syncChannel = new BroadcastChannel('uc_sync_channel');
          syncChannel.postMessage({ type: 'BOOKING_CREATED', booking: created, timestamp: Date.now() });
          syncChannel.close();
        } catch (bcErr) {}
        try {
          localStorage.setItem('uc_last_booking_event', JSON.stringify({ type: 'BOOKING_CREATED', bookingId: refId, time: Date.now() }));
        } catch (lsErr) {}

        setPage(1);
        fetchBookingsList(false);
        fetchAssignmentStats();
      } else {
        throw new Error(res?.error || res?.message || 'Creation failed');
      }
    } catch (err) {
      onShowToast && onShowToast(`Error creating booking: ${err.message}`);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal with Prepopulated Data
  const handleOpenEditModal = (booking) => {
    const b = booking || selectedBooking;
    if (!b) return;
    setEditFormData({
      id: b.id || b.bookingReference,
      userName: b.userName || b.customerName || '',
      userPhone: b.userPhone || '',
      userEmail: b.userEmail || '',
      serviceName: b.serviceName || '',
      serviceCategory: b.serviceCategory || 'Appliance Repair',
      totalAmount: b.totalAmount || b.amount || 899,
      city: b.city || b.addressDetails?.city || 'Krishnagiri',
      serviceZone: b.serviceZone || b.addressDetails?.locality || 'Gandhi Nagar',
      address: b.address || b.addressDetails?.fullAddress || '',
      slot: b.slot || '11:30 AM - 01:00 PM',
      status: b.status || 'Pending',
      paymentStatus: b.paymentStatus || 'Pending',
      paymentMethod: b.paymentMethod || 'Cash After Service (COD)',
      assignmentMode: b.assignmentMode || 'AUTO',
      assignedPartner: b.assignedPartner || '',
      customerInstructions: b.customerInstructions || ''
    });
    setShowEditModal(true);
  };

  // Submit Edit / Update
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData || !editFormData.id) return;
    setIsSubmittingEdit(true);
    try {
      const res = await adminClient.updateBooking(editFormData.id, editFormData);
      if (res && res.success !== false) {
        onShowToast && onShowToast(`✓ Booking #${editFormData.id} updated successfully!`);
        setShowEditModal(false);

        // Optimistically update table & drawer
        setBookings(prev => prev.map(b => (b.id === editFormData.id || b.bookingReference === editFormData.id) ? { ...b, ...editFormData } : b));
        if (selectedBooking && (selectedBooking.id === editFormData.id || selectedBooking.bookingReference === editFormData.id)) {
          setSelectedBooking(prev => ({ ...prev, ...editFormData }));
        }

        // Broadcast across tabs
        try {
          const syncChannel = new BroadcastChannel('uc_sync_channel');
          syncChannel.postMessage({ type: 'BOOKING_UPDATED', bookingId: editFormData.id, timestamp: Date.now() });
          syncChannel.close();
        } catch (bcErr) {}
        try {
          localStorage.setItem('uc_last_booking_event', JSON.stringify({ type: 'BOOKING_UPDATED', bookingId: editFormData.id, time: Date.now() }));
        } catch (lsErr) {}

        fetchBookingsList(false);
        fetchAssignmentStats();
      } else {
        throw new Error(res?.error || res?.message || 'Update failed');
      }
    } catch (err) {
      onShowToast && onShowToast(`Failed to update booking: ${err.message}`);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Booking with Optimistic UI & Broadcast
  const handleDeleteBooking = async (bookingId) => {
    if (!bookingId) return;
    const confirmed = window.confirm(`Are you sure you want to permanently delete booking #${bookingId}? This will remove it from MongoDB Atlas and cannot be undone.`);
    if (!confirmed) return;

    // Optimistic removal for immediate UI responsiveness
    setBookings(prev => prev.filter(b => b.id !== bookingId && b.bookingReference !== bookingId));
    setPagination(prev => ({ ...prev, total: Math.max(0, (prev.total || 1) - 1) }));
    if (selectedBooking && (selectedBooking.id === bookingId || selectedBooking.bookingReference === bookingId)) {
      setSelectedBooking(null);
    }

    try {
      const res = await adminClient.deleteBooking(bookingId);
      if (res && res.success !== false) {
        onShowToast && onShowToast(`✓ Booking #${bookingId} permanently deleted from database`);

        // Broadcast across all open browser tabs and worker/customer views
        try {
          const syncChannel = new BroadcastChannel('uc_sync_channel');
          syncChannel.postMessage({ type: 'BOOKING_DELETED', bookingId, timestamp: Date.now() });
          syncChannel.close();
        } catch (bcErr) {}
        try {
          localStorage.setItem('uc_last_booking_event', JSON.stringify({ type: 'BOOKING_DELETED', bookingId, time: Date.now() }));
        } catch (lsErr) {}

        fetchBookingsList(false);
        fetchAssignmentStats();
      } else {
        throw new Error(res?.error || res?.message || 'Failed to delete');
      }
    } catch (err) {
      onShowToast && onShowToast(`Delete error: ${err.message}`);
      fetchBookingsList(false);
    }
  };

  // Handle Internal Note
  function handleAddNoteSubmit(e) {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedBooking) return;
    adminClient.addBookingNote(selectedBooking.id, newNoteText)
      .then(() => {
        const newNoteObj = {
          id: 'note-' + Date.now(),
          note: newNoteText,
          author: 'Admin Operator',
          authorRole: 'Operations Dispatcher',
          createdAt: new Date()
        };
        setSelectedBooking(prev => ({
          ...prev,
          internalNotes: [...(prev.internalNotes || []), newNoteObj]
        }));
        setNewNoteText('');
        onShowToast && onShowToast('✓ Internal note recorded');
      })
      .catch(err => {
        onShowToast && onShowToast(`Error adding note: ${err.message}`);
      });
  }

  // Export CSV
  function handleExportCSV() {
    const headers = [
      'Booking Reference',
      'Customer Name',
      'Customer Phone',
      'Service Name',
      'Category',
      'Assigned Professional',
      'Partner Agency',
      'City',
      'Zone',
      'Scheduled Slot',
      'Booking Status',
      'Payment Status',
      'Total Amount (INR)',
      'Created Date'
    ];

    const rows = bookings.map(b => [
      `"${b.id || b.bookingReference || ''}"`,
      `"${b.userName || b.customerName || ''}"`,
      `"${b.userPhone || ''}"`,
      `"${b.serviceName || ''}"`,
      `"${b.serviceCategory || ''}"`,
      `"${b.assignedPartner || b.assignedProfessional?.name || 'Unassigned'}"`,
      `"${b.partnerAgency || b.assignedBusinessPartner?.name || 'Direct'}"`,
      `"${b.city || ''}"`,
      `"${b.serviceZone || b.locality || ''}"`,
      `"${b.slot || ''}"`,
      `"${b.status || ''}"`,
      `"${b.paymentStatus || ''}"`,
      `"${b.totalAmount || 0}"`,
      `"${new Date(b.createdAt || Date.now()).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Urban_Bookings_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast && onShowToast('📥 Bookings exported to CSV');
  }

  // Status Badge Helper
  function renderStatusBadge(status) {
    const s = (status || 'Pending').toLowerCase();
    let bg = '#F1F5F9';
    let color = '#475569';
    let border = '#CBD5E1';

    if (s === 'completed') {
      bg = '#F0FDF4'; color = '#16A34A'; border = '#BBF7D0';
    } else if (s === 'in progress') {
      bg = '#EFF6FF'; color = '#0284C7'; border = '#BFDBFE';
    } else if (s === 'en route') {
      bg = '#F5F3FF'; color = '#7C3AED'; border = '#DDD6FE';
    } else if (s === 'assigned') {
      bg = '#FAF5FF'; color = '#6E42E5'; border = '#E9D5FF';
    } else if (s === 'confirmed') {
      bg = '#ECFDF5'; color = '#059669'; border = '#A7F3D0';
    } else if (s === 'pending') {
      bg = '#FFFBEB'; color = '#D97706'; border = '#FDE68A';
    } else if (s === 'cancelled' || s === 'failed') {
      bg = '#FEF2F2'; color = '#DC2626'; border = '#FECACA';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
        {status}
      </span>
    );
  }

  // Payment Badge Helper
  function renderPaymentBadge(status) {
    const s = (status || 'Pending').toLowerCase();
    let bg = '#F1F5F9';
    let color = '#475569';

    if (s === 'paid') {
      bg = '#DCFCE7'; color = '#15803D';
    } else if (s === 'refunded') {
      bg = '#FEF3C7'; color = '#B45309';
    } else if (s === 'failed') {
      bg = '#FEE2E2'; color = '#B91C1C';
    } else {
      bg = '#FEF9C3'; color = '#854D0E';
    }

    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: bg,
        color: color
      }}>
        {status || 'Pending'}
      </span>
    );
  }

  // Assignment Status Badge with dynamic live countdown
  function renderAssignmentBadge(b) {
    const status = b.assignmentStatus || (b.assignedPartner || b.assignedProfessional?.name ? 'ASSIGNED' : 'UNASSIGNED');
    let remainingSecs = 0;
    if (b.offerStatus === 'offered' && b.offerExpiry) {
      remainingSecs = Math.max(0, Math.round((new Date(b.offerExpiry).getTime() - currentTime) / 1000));
    }

    if (status === 'ASSIGNED') {
      const name = b.assignedPartner || b.assignedProfessional?.name || 'Verified Pro';
      return (
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: '#ECFDF5',
            color: '#059669',
            fontSize: 11,
            fontWeight: 700,
            border: '1px solid #A7F3D0'
          }}>
            <CheckCircle2 size={12} />
            {name}
          </span>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
            {b.assignedProfessional?.trade || 'Verified Technician'}
          </div>
        </div>
      );
    }

    if (status === 'OFFERED' || (b.offerStatus === 'offered' && remainingSecs > 0)) {
      const proName = b.offeredTo?.proName || 'Professional';
      return (
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: '#F5F3FF',
            color: '#7C3AED',
            fontSize: 11,
            fontWeight: 700,
            border: '1px solid #DDD6FE'
          }}>
            <Timer size={12} className="animate-spin" />
            Offered ({remainingSecs}s)
          </span>
          <div style={{ fontSize: 10, color: '#7C3AED', marginTop: 2, fontWeight: 600 }}>
            To: {proName}
          </div>
        </div>
      );
    }

    if (status === 'AWAITING_OWNER_ATTENTION') {
      return (
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            fontSize: 11,
            fontWeight: 800,
            border: '1px solid #FECACA',
            boxShadow: '0 0 6px rgba(220, 38, 38, 0.25)'
          }}>
            <AlertCircle size={12} />
            Needs Attention
          </span>
          <div style={{ fontSize: 10, color: '#DC2626', marginTop: 2 }}>
            Exhausted • Manual Assign
          </div>
        </div>
      );
    }

    if (status === 'REJECTED') {
      return (
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: '#FFF1F2',
            color: '#BE123C',
            fontSize: 11,
            fontWeight: 700,
            border: '1px solid #FECDD3'
          }}>
            <Ban size={12} />
            Rejected
          </span>
          {b.offeredTo?.rejectionReason && (
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.offeredTo.rejectionReason}>
              "{b.offeredTo.rejectionReason}"
            </div>
          )}
        </div>
      );
    }

    if (status === 'EXPIRED') {
      return (
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: '#FFFBEB',
            color: '#D97706',
            fontSize: 11,
            fontWeight: 700,
            border: '1px solid #FDE68A'
          }}>
            <Clock size={12} />
            Expired
          </span>
          <div style={{ fontSize: 10, color: '#B45309', marginTop: 2 }}>
            Offer timed out
          </div>
        </div>
      );
    }

    // Default: UNASSIGNED
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 6,
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
        fontSize: 11,
        fontWeight: 700,
        border: '1px solid #FECACA'
      }}>
        <AlertTriangle size={12} />
        Unassigned
      </span>
    );
  }

  // Assignment Mode Pill (Clickable toggle between AUTO and MANUAL)
  function renderModePill(b) {
    const mode = b.assignmentMode || 'AUTO';
    const isAuto = mode === 'AUTO';
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleSwitchMode(b.id || b.bookingReference, mode);
        }}
        title={`Click to switch to ${isAuto ? 'MANUAL' : 'AUTO'} assignment mode`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 12,
          fontSize: 10.5,
          fontWeight: 800,
          border: isAuto ? '1px solid #BFDBFE' : '1px solid #DDD6FE',
          backgroundColor: isAuto ? '#EFF6FF' : '#F5F3FF',
          color: isAuto ? '#1D4ED8' : '#6D28D9',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <Zap size={11} fill={isAuto ? '#1D4ED8' : 'none'} />
        {mode}
      </button>
    );
  }

  // Filter candidates for the manual assign modal
  const filteredCandidates = useMemo(() => {
    let list = [...eligiblePros];
    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.trade && p.trade.toLowerCase().includes(q)) ||
        (p.skills && p.skills.some(s => s.toLowerCase().includes(q)))
      );
    }
    if (candidateFilter === 'AVAILABLE') {
      list = list.filter(p => p.isAvailable && p.isOnline);
    } else if (candidateFilter === 'PRESENT') {
      list = list.filter(p => p.attendanceStatus === 'PRESENT');
    } else if (candidateFilter === 'OPTIMAL_WORKLOAD') {
      list = list.filter(p => (p.activeBookingsCount || 0) === 0 && !p.isCapacityReached);
    } else if (candidateFilter === 'TOP_RATED') {
      list = list.filter(p => (p.rating || 0) >= 4.5);
    } else if (candidateFilter === 'CLOSEST') {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
    return list;
  }, [eligiblePros, candidateSearch, candidateFilter]);

  // Check possible next lifecycle transitions
  const currentTransitions = selectedBooking ? (VALID_TRANSITIONS[selectedBooking.status] || []) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Header & Fast Action Bar */}
      <div className="admin-page-header" style={{ padding: '10px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.25 }}>
            Bookings &amp; Dispatch Control
          </h2>
          <p style={{ fontSize: 11.5, color: '#64748B', margin: '2px 0 0 0', lineHeight: 1.2 }}>
            Real-time home services scheduling, lifecycle management, technician assignment, and billing
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              setCreateFormData(initialCreateForm);
              setShowCreateModal(true);
            }}
            title="Create a new service booking"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#6E42E5',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(110, 66, 229, 0.25)'
            }}
          >
            <Plus size={14} />
            New Booking
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
            Live DB Active
          </span>
          <button
            type="button"
            onClick={() => { fetchBookingsList(true); fetchAssignmentStats(); }}
            title="Refresh bookings from Atlas"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 6,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-page-body" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Assignment & Dispatch KPI Metrics Summary Cards - Compact 1-line Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 8,
          marginBottom: 4
        }}>
          {/* 1. Total Unassigned */}
          <div
            onClick={() => { setAssignedFilter(assignedFilter === 'unassigned' ? 'ALL' : 'unassigned'); setPage(1); }}
            style={{
              backgroundColor: assignedFilter === 'unassigned' ? '#FFFBEB' : '#FFFFFF',
              borderRadius: 8,
              padding: '8px 12px',
              border: assignedFilter === 'unassigned' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={15} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {assignmentStats.totalUnassigned || 0}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                Unassigned
              </div>
            </div>
          </div>

          {/* 2. Pending Offers */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Timer size={15} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {assignmentStats.pendingOffers || 0}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                Pending Offers
              </div>
            </div>
          </div>

          {/* 3. Auto-Assigned */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={15} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {assignmentStats.autoAssigned || 0}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                Auto-Assigned
              </div>
            </div>
          </div>

          {/* 4. Manually Assigned */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserCheck size={15} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {assignmentStats.manuallyAssigned || 0}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                Manual Assigned
              </div>
            </div>
          </div>

          {/* 5. Rejected / Expired */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: '8px 12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              backgroundColor: '#FFF1F2',
              color: '#BE123C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Ban size={15} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {assignmentStats.rejectedOrExpired || 0}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                Rejected / Expired
              </div>
            </div>
          </div>

          {/* 6. Awaiting Owner Attention */}
          <div style={{
            backgroundColor: (assignmentStats.awaitingOwnerAttention || 0) > 0 ? '#FEF2F2' : '#FFFFFF',
            borderRadius: 8,
            padding: '8px 12px',
            border: (assignmentStats.awaitingOwnerAttention || 0) > 0 ? '1.5px solid #F87171' : '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertCircle size={15} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: (assignmentStats.awaitingOwnerAttention || 0) > 0 ? '#DC2626' : '#0F172A', lineHeight: 1 }}>
                {assignmentStats.awaitingOwnerAttention || 0}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: (assignmentStats.awaitingOwnerAttention || 0) > 0 ? '#DC2626' : '#475569', marginTop: 2 }}>
                Awaiting Attention
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filter Bar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          padding: '10px 14px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          {/* Search & Main Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              padding: '6px 12px',
              flex: '1 1 240px',
              minWidth: 200
            }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                placeholder="Search reference, customer, phone, service, address..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: 12.5,
                  color: '#0F172A'
                }}
              />
              {search && (
                <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
              )}
            </div>

            {/* Booking Status Filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Assigned">Assigned</option>
              <option value="En Route">En Route</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={e => { setCityFilter(e.target.value); setPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Cities</option>
              <option value="Krishnagiri">Krishnagiri</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>

            {/* Assigned vs Unassigned */}
            <select
              value={assignedFilter}
              onChange={e => { setAssignedFilter(e.target.value); setPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: assignedFilter !== 'ALL' ? '1.5px solid #F59E0B' : '1px solid #CBD5E1',
                fontSize: 12.5,
                backgroundColor: assignedFilter !== 'ALL' ? '#FFFBEB' : '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Assignments</option>
              <option value="assigned">Assigned to Pro</option>
              <option value="unassigned">⚠️ Unassigned (Need Pro)</option>
            </select>

            {/* Partner Agency Filter */}
            <select
              value={partnerFilter}
              onChange={e => { setPartnerFilter(e.target.value); setPage(1); }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                backgroundColor: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Partners</option>
              <option value="Direct">Direct Freelance Pro</option>
              <option value="Apex Home Solutions LLP">Apex Home Solutions LLP</option>
              <option value="Selvam Fleet Services">Selvam Fleet Services</option>
              <option value="Urban Clean Tech Agency">Urban Clean Tech Agency</option>
            </select>

            {/* Live Count Indicator & Reset */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#6E42E5',
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD6FE',
                padding: '4px 9px',
                borderRadius: 6
              }}>
                {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
              </span>

              {(statusFilter !== 'ALL' || paymentFilter !== 'ALL' || cityFilter !== 'ALL' || partnerFilter !== 'ALL' || assignedFilter !== 'ALL' || search) && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setPaymentFilter('ALL');
                    setCityFilter('ALL');
                    setCategoryFilter('ALL');
                    setPartnerFilter('ALL');
                    setAssignedFilter('ALL');
                    setSearch('');
                    setPage(1);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#6E42E5',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '4px 6px',
                    textDecoration: 'underline'
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Main Bookings Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Booking Ref</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Customer</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Service & Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Mode</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Assignment Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Partner Agency</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>City & Zone</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Scheduled Slot</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Payment</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569' }}>Total (₹)</th>
                <th style={{ padding: '14px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="animate-spin" />
                      Loading bookings records...
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                    <AlertCircle size={28} color="#94A3B8" style={{ marginBottom: 8, display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#334155' }}>No bookings match the selected criteria</div>
                    <div style={{ fontSize: 12, marginTop: 4, marginBottom: 14 }}>Try clearing search keywords or filter dropdowns.</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('ALL');
                        setPaymentFilter('ALL');
                        setCityFilter('ALL');
                        setCategoryFilter('ALL');
                        setPartnerFilter('ALL');
                        setAssignedFilter('ALL');
                        setDateRangeFilter('ALL');
                        setPage(1);
                      }}
                      style={{
                        padding: '7px 16px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#6E42E5',
                        color: '#FFFFFF',
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(110,66,229,0.25)'
                      }}
                    >
                      Reset All Filters & Show All Bookings
                    </button>
                  </td>
                </tr>
              ) : (
                bookings.map(b => {
                  return (
                    <tr
                      key={b.id || b.bookingReference}
                      onClick={() => setSelectedBooking(b)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Booking Reference */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#6E42E5' }}>
                        {b.id || b.bookingReference}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{b.userName || b.customerName}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{b.userPhone}</div>
                      </td>

                      {/* Service & Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#1E293B' }}>{b.serviceName}</div>
                        <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>
                            {b.serviceCategory || 'Standard'}
                          </span>
                          {b.items && b.items.length > 1 && (
                            <span>+{b.items.length - 1} items</span>
                          )}
                        </div>
                      </td>

                      {/* Assignment Mode */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderModePill(b)}
                      </td>

                      {/* Assignment Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderAssignmentBadge(b)}
                      </td>

                      {/* Partner Agency */}
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {b.partnerAgency || b.assignedBusinessPartner?.name || 'Direct Pro'}
                      </td>

                      {/* City & Zone */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 500, color: '#0F172A' }}>{b.city || 'Mumbai'}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>{b.serviceZone || b.locality || 'Metro'}</div>
                      </td>

                      {/* Scheduled Slot */}
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={13} color="#64748B" />
                          <span>{b.slot || 'Pending Slot'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderStatusBadge(b.status)}
                        {(() => {
                          const hasBefore = b.beforeWorkPhoto?.url || (b.structuredChecklists?.photos || []).some(p => p.phase === 'before');
                          const hasAfter = b.afterWorkPhoto?.url || (b.structuredChecklists?.photos || []).some(p => p.phase === 'after');
                          if (!hasBefore && !hasAfter) return null;
                          return (
                            <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {hasBefore && (
                                <span style={{ fontSize: 10, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }} title="Pre-work photo attached">
                                  📷 Pre ✓
                                </span>
                              )}
                              {hasAfter && (
                                <span style={{ fontSize: 10, background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }} title="Post-work photo attached">
                                  📷 Post ✓
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Payment */}
                      <td style={{ padding: '14px 16px' }}>
                        {renderPaymentBadge(b.paymentStatus)}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A' }}>
                        ₹{b.totalAmount || b.amount || 0}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {/* Visible Assign Pro button for eligible bookings */}
                          {((!b.assignedPartner && !b.assignedProfessional?.name) || ['UNASSIGNED', 'OFFERED', 'EXPIRED', 'REJECTED', 'AWAITING_OWNER_ATTENTION'].includes(b.assignmentStatus)) && b.status !== 'Completed' && b.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAssignModal(b);
                              }}
                              title="Assign Professional"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: '#7C3AED',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 11px',
                                fontSize: 11.5,
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <UserCheck size={13} />
                              Assign Pro
                            </button>
                          )}

                          {/* Retry Auto-Assign button */}
                          {b.assignmentMode === 'AUTO' && b.status !== 'Assigned' && b.status !== 'Completed' && b.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRetryAutoAssign(b.id || b.bookingReference);
                              }}
                              title="Run automatic assignment engine"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: 6,
                                padding: '6px 9px',
                                fontSize: 11.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <RotateCcw size={11} />
                              Auto
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(b);
                            }}
                            title="Edit Booking Details"
                            style={{
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontSize: 12,
                              color: '#334155',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Edit size={12} />
                            Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            title="Inspect Booking Details"
                            style={{
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 12,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBooking(b.id || b.bookingReference);
                            }}
                            title="Permanently Delete Booking"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA',
                              borderRadius: 6,
                              padding: '6px 9px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                          <ChevronRight size={16} color="#94A3B8" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 13,
          color: '#64748B',
          backgroundColor: '#FFFFFF'
        }}>
          <div>
            Showing <strong style={{ color: '#0F172A' }}>{bookings.length}</strong> of{' '}
            <strong style={{ color: '#0F172A' }}>{pagination.total || bookings.length}</strong> bookings
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: page <= 1 ? '#F1F5F9' : '#FFFFFF',
                color: page <= 1 ? '#94A3B8' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ padding: '0 8px', fontWeight: 600, color: '#0F172A' }}>
              Page {page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={page >= (pagination.totalPages || 1)}
              onClick={() => setPage(prev => prev + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: page >= (pagination.totalPages || 1) ? '#F1F5F9' : '#FFFFFF',
                color: page >= (pagination.totalPages || 1) ? '#94A3B8' : '#334155',
                cursor: page >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. BOOKING DETAIL DRAWER (SLIDE-OVER FROM RIGHT)           */}
      {/* ======================================================== */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end',
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 680,
            backgroundColor: '#FFFFFF',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            borderLeft: '1px solid #E2E8F0'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {selectedBooking.id || selectedBooking.bookingReference}
                  </h3>
                  {renderStatusBadge(selectedBooking.status)}
                  {renderPaymentBadge(selectedBooking.paymentStatus)}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                  Created on {new Date(selectedBooking.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} /> Tax Invoice
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    backgroundColor: '#F1F5F9',
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
                  <X size={18} color="#475569" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Lifecycle Interactive Stepper */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Service Dispatch Pipeline</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#6E42E5' }}>Strict State-Machine Enforced</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {LIFECYCLE_STAGES.map((st, i) => {
                    const isPassed = LIFECYCLE_STAGES.indexOf(selectedBooking.status) >= i;
                    const isCurrent = selectedBooking.status === st;

                    return (
                      <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? '#6E42E5' : isPassed ? '#16A34A' : '#E2E8F0',
                          color: isPassed || isCurrent ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 4
                        }}>
                          {isPassed && !isCurrent ? <Check size={14} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#6E42E5' : '#64748B' }}>
                          {st}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Transition Fast Buttons */}
                {currentTransitions.length > 0 && selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Trigger Next Transition:</span>
                    {currentTransitions.map(nextSt => (
                      <button
                        key={nextSt}
                        onClick={() => handleTransition(nextSt)}
                        style={{
                          backgroundColor: nextSt === 'Cancelled' || nextSt === 'Failed' ? '#FEE2E2' : '#6E42E5',
                          color: nextSt === 'Cancelled' || nextSt === 'Failed' ? '#DC2626' : '#FFFFFF',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Advance to {nextSt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    handleOpenAssignModal(selectedBooking);
                  }}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #6E42E5',
                    backgroundColor: '#F5F3FF',
                    color: '#6E42E5',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <UserCheck size={14} />
                  {selectedBooking.assignedPartner ? 'Reassign Pro' : 'Assign Pro'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(selectedBooking)}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Edit size={14} /> Edit Details
                </button>

                <button
                  onClick={() => setShowRescheduleModal(true)}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={14} /> Reschedule
                </button>

                {selectedBooking.paymentStatus === 'Paid' && (
                  <button
                    onClick={() => {
                      setRefundData({ amount: selectedBooking.totalAmount, reason: 'Customer requested refund' });
                      setShowRefundModal(true);
                    }}
                    style={{
                      flex: '1 1 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #FCD34D',
                      backgroundColor: '#FFFBEB',
                      color: '#B45309',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={14} /> Initiate Refund
                  </button>
                )}

                {selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      flex: '1 1 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      border: '1px solid #FCA5A5',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Ban size={14} /> Cancel Booking
                  </button>
                )}

                <button
                  onClick={() => handleDeleteBooking(selectedBooking.id || selectedBooking.bookingReference)}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #FECACA',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} /> Delete Booking
                </button>
              </div>

              {/* Customer and Service Address */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={15} color="#6E42E5" />
                  Customer & Service Location
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Customer Name</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                      {selectedBooking.userName || selectedBooking.customerName}
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{selectedBooking.userPhone}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{selectedBooking.userEmail}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Service Address</div>
                    <div style={{ fontSize: 13, color: '#1E293B' }}>
                      {selectedBooking.addressDetails?.fullAddress || selectedBooking.address}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {selectedBooking.serviceZone || selectedBooking.locality}, {selectedBooking.city}
                    </div>
                    {selectedBooking.addressDetails?.landmark && (
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>
                        Landmark: {selectedBooking.addressDetails.landmark}
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.customerInstructions && (
                  <div style={{
                    marginTop: 12,
                    padding: '10px 12px',
                    borderRadius: 6,
                    backgroundColor: '#F8FAFC',
                    borderLeft: '3px solid #6E42E5',
                    fontSize: 12,
                    color: '#334155'
                  }}>
                    <strong>Customer Instructions:</strong> {selectedBooking.customerInstructions}
                  </div>
                )}
              </div>

              {/* Assigned Professional & Business Partner */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wrench size={15} color="#6E42E5" />
                  Assigned Professional & Partner Agency
                </div>

                {selectedBooking.assignedPartner || selectedBooking.assignedProfessional?.name ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        backgroundColor: '#EDE9FE',
                        color: '#6E42E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {((selectedBooking.assignedPartner || selectedBooking.assignedProfessional?.name || 'PR')[0]).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                          {selectedBooking.assignedPartner || selectedBooking.assignedProfessional?.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {selectedBooking.assignedProfessional?.trade || 'Certified Service Professional'}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          {selectedBooking.assignedProfessional?.phone || '+91 98205 11982'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#64748B' }}>Business Partner</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
                        {selectedBooking.partnerAgency || selectedBooking.assignedBusinessPartner?.name || 'Direct Pro Freelance'}
                      </div>
                      <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600 }}>
                        Tier: Diamond Level 5
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    borderRadius: 8,
                    backgroundColor: '#FEF2F2',
                    border: '1px dashed #FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: 12, color: '#B91C1C', fontWeight: 500 }}>
                      ⚠️ No technician assigned yet. Overdue dispatch slot alert.
                    </span>
                    <button
                      onClick={() => handleOpenAssignModal(selectedBooking)}
                      style={{
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Assign Pro Now
                    </button>
                  </div>
                )}
              </div>

              {/* Work Verification Evidence Photos (Pre & Post Service) */}
              {(() => {
                const beforePhoto = selectedBooking.beforeWorkPhoto || (selectedBooking.structuredChecklists?.photos || []).find(p => p.phase === 'before');
                const afterPhoto = selectedBooking.afterWorkPhoto || (selectedBooking.structuredChecklists?.photos || []).find(p => p.phase === 'after');

                return (
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 10,
                    padding: '16px 18px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Camera size={15} color="#6E42E5" />
                        <span>Technician Work Verification Photos</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#6E42E5', background: '#EDE9FE', padding: '2px 8px', borderRadius: 4 }}>
                        Mandatory SOP Compliance
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {/* Pre-Work Photo Card */}
                      <div style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: 12,
                        background: beforePhoto ? '#F8FAFC' : '#FFFBEB'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>📸 Pre-Work Photo</span>
                          {beforePhoto ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                              ✓ Verified
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#D97706', background: '#FEF3C7', padding: '2px 6px', borderRadius: 4 }}>
                              ⏳ Pending
                            </span>
                          )}
                        </div>

                        {beforePhoto ? (
                          <div>
                            <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: 8 }}>
                              <img
                                src={beforePhoto.url}
                                alt="Pre-work photo"
                                onClick={() => setSelectedPhotoZoom(beforePhoto.url)}
                                style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                title="Click to view full image"
                              />
                              <span style={{
                                position: 'absolute',
                                bottom: 6,
                                right: 6,
                                background: 'rgba(15,23,42,0.7)',
                                color: '#FFFFFF',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }} onClick={() => setSelectedPhotoZoom(beforePhoto.url)}>
                                🔍 Click to Zoom
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                              {beforePhoto.fileName || 'pre_work_photo.jpg'}
                            </div>
                            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                              Uploaded: {beforePhoto.uploadedAt ? new Date(beforePhoto.uploadedAt).toLocaleString() : 'On record'}
                            </div>
                            {beforePhoto.uploadedBy && (
                              <div style={{ fontSize: 10, color: '#6E42E5', marginTop: 2 }}>
                                By: <strong>{beforePhoto.uploadedBy}</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ padding: '20px 10px', textAlign: 'center', color: '#92400E' }}>
                            <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Awaiting Pre-Work Photo</div>
                            <div style={{ fontSize: 10.5, color: '#B45309', marginTop: 2 }}>
                              Technician must upload this photo before starting service.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Post-Work Photo Card */}
                      <div style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: 12,
                        background: afterPhoto ? '#F8FAFC' : '#ECFDF5'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>📸 Post-Work Photo</span>
                          {afterPhoto ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: 4 }}>
                              ✓ Verified
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#047857', background: '#D1FAE5', padding: '2px 6px', borderRadius: 4 }}>
                              ⏳ Pending
                            </span>
                          )}
                        </div>

                        {afterPhoto ? (
                          <div>
                            <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid #CBD5E1', marginBottom: 8 }}>
                              <img
                                src={afterPhoto.url}
                                alt="Post-work photo"
                                onClick={() => setSelectedPhotoZoom(afterPhoto.url)}
                                style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                title="Click to view full image"
                              />
                              <span style={{
                                position: 'absolute',
                                bottom: 6,
                                right: 6,
                                background: 'rgba(15,23,42,0.7)',
                                color: '#FFFFFF',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }} onClick={() => setSelectedPhotoZoom(afterPhoto.url)}>
                                🔍 Click to Zoom
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                              {afterPhoto.fileName || 'post_work_photo.jpg'}
                            </div>
                            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                              Uploaded: {afterPhoto.uploadedAt ? new Date(afterPhoto.uploadedAt).toLocaleString() : 'On record'}
                            </div>
                            {afterPhoto.uploadedBy && (
                              <div style={{ fontSize: 10, color: '#6E42E5', marginTop: 2 }}>
                                By: <strong>{afterPhoto.uploadedBy}</strong>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ padding: '20px 10px', textAlign: 'center', color: '#065F46' }}>
                            <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Awaiting Post-Work Photo</div>
                            <div style={{ fontSize: 10.5, color: '#047857', marginTop: 2 }}>
                              Technician must upload this photo to complete service.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Service Items and Price Breakdown */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={15} color="#6E42E5" />
                  Service Items & Financial Ledger
                </div>

                {/* Items List */}
                <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
                  {(selectedBooking.items || [
                    { id: '1', title: selectedBooking.serviceName, qty: 1, price: selectedBooking.totalAmount, durationMins: 60 }
                  ]).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          Qty: {item.qty} × ₹{item.price} • Duration: {item.durationMins || 60} mins
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>₹{item.price * item.qty}</div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedBooking.pricingBreakdown?.subtotal || selectedBooking.totalAmount || 0}</span>
                  </div>
                  {selectedBooking.pricingBreakdown?.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                      <span>Discount / Coupon Applied:</span>
                      <span>-₹{selectedBooking.pricingBreakdown.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Convenience / Service Fee:</span>
                    <span>₹{selectedBooking.pricingBreakdown?.convenienceFee || 49}</span>
                  </div>
                  {selectedBooking.pricingBreakdown?.surgeFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                      <span>Monsoon Surge Fee:</span>
                      <span>+₹{selectedBooking.pricingBreakdown.surgeFee}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Taxes (CGST 9% + SGST 9%):</span>
                    <span>₹{selectedBooking.pricingBreakdown?.taxes || Math.round(selectedBooking.totalAmount * 0.18)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#0F172A',
                    paddingTop: 8,
                    borderTop: '1px solid #E2E8F0'
                  }}>
                    <span>Grand Total:</span>
                    <span style={{ color: '#6E42E5' }}>₹{selectedBooking.totalAmount}</span>
                  </div>
                </div>

                {/* Payment info */}
                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: '#F8FAFC',
                  fontSize: 11,
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span>Payment Method: <strong>{selectedBooking.paymentMethod || 'UPI'}</strong></span>
                    {selectedBooking.paymentDetails?.transactionId && (
                      <span style={{ marginLeft: 8 }}>• Txn: <code>{selectedBooking.paymentDetails.transactionId}</code></span>
                    )}
                  </div>
                  <span>Status: <strong>{selectedBooking.paymentStatus}</strong></span>
                </div>

                {selectedBooking.refundDetails && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    fontSize: 11,
                    color: '#92400E'
                  }}>
                    <strong>Refund Processed:</strong> ₹{selectedBooking.refundDetails.amount} ({selectedBooking.refundDetails.reason}) on {new Date(selectedBooking.refundDetails.refundedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Internal Notes Thread & Input */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={15} color="#6E42E5" />
                  Internal Administrative Notes ({selectedBooking.internalNotes?.length || 0})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', marginBottom: 12 }}>
                  {(!selectedBooking.internalNotes || selectedBooking.internalNotes.length === 0) ? (
                    <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                      No internal notes recorded yet.
                    </div>
                  ) : (
                    selectedBooking.internalNotes.map((note, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0'
                      }}>
                        <div style={{ fontSize: 12, color: '#1E293B' }}>{note.note}</div>
                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                          <span>By <strong>{note.author}</strong> ({note.authorRole || 'Admin'})</span>
                          <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to append new note */}
                <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Add an internal note or dispatch comment..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      fontSize: 12,
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#6E42E5',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Save Note
                  </button>
                </form>
              </div>

              {/* Complete Event Timeline with Actors */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="#6E42E5" />
                  Audit Trail & Event Timeline
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                  {(selectedBooking.timeline || [
                    { id: '1', title: 'Order Placed', description: 'Customer initiated online checkout', actor: 'Customer', actorRole: 'Customer', timestamp: selectedBooking.createdAt }
                  ]).map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#6E42E5',
                        marginTop: 5,
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{event.title}</span>
                          <span style={{ fontSize: 10, color: '#64748B' }}>
                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{event.description}</div>
                        <div style={{ fontSize: 10, color: '#6E42E5', marginTop: 2 }}>
                          Actor: <strong>{event.actor}</strong> ({event.actorRole || 'System'})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. REAL MANUAL PROFESSIONAL ASSIGNMENT MODAL              */}
      {/* ======================================================== */}
      {(manualAssignBooking || (showAssignModal && selectedBooking)) && (() => {
        const activeModalBooking = manualAssignBooking || selectedBooking;
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              width: '100%',
              maxWidth: 720,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: '#F8FAFC'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Assign Professional to {activeModalBooking.id || activeModalBooking.bookingReference}
                    </h3>
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      border: '1px solid #BFDBFE'
                    }}>
                      {activeModalBooking.serviceCategory || 'All Services'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span>Customer: <strong style={{ color: '#0F172A' }}>{activeModalBooking.userName || activeModalBooking.customerName}</strong></span>
                    <span>•</span>
                    <span>Slot: <strong style={{ color: '#0F172A' }}>{activeModalBooking.slot}</strong></span>
                    <span>•</span>
                    <span>Location: <strong style={{ color: '#0F172A' }}>{activeModalBooking.serviceZone || activeModalBooking.city}</strong></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManualAssignBooking(null);
                    setShowAssignModal(false);
                    setSelectedCandidate(null);
                  }}
                  style={{
                    border: 'none',
                    background: '#E2E8F0',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Offer Expiration Configuration Row */}
              <div style={{
                padding: '12px 24px',
                backgroundColor: '#FAF5FF',
                borderBottom: '1px solid #E9D5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Timer size={16} color="#7C3AED" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#581C87' }}>
                    Offer Expiration Countdown:
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {[60, 90, 120, 180].map(secs => (
                    <button
                      key={secs}
                      type="button"
                      onClick={() => setOfferTimeout(secs)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: offerTimeout === secs ? '1.5px solid #7C3AED' : '1px solid #CBD5E1',
                        backgroundColor: offerTimeout === secs ? '#7C3AED' : '#FFFFFF',
                        color: offerTimeout === secs ? '#FFFFFF' : '#475569',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {secs}s {secs === 120 ? '(Default)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Filter Toolbar inside Modal */}
              <div style={{
                padding: '14px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  padding: '6px 12px',
                  flex: '1 1 240px'
                }}>
                  <Search size={14} color="#64748B" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, skills, phone..."
                    value={candidateSearch}
                    onChange={e => setCandidateSearch(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      width: '100%',
                      fontSize: 12.5,
                      color: '#0F172A'
                    }}
                  />
                  {candidateSearch && (
                    <X size={12} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setCandidateSearch('')} />
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'ALL', label: `All (${eligiblePros.length})` },
                    { id: 'PRESENT', label: `🟢 Present & On Duty (${eligiblePros.filter(p => p.attendanceStatus === 'PRESENT').length})` },
                    { id: 'OPTIMAL_WORKLOAD', label: `⚡ 0 Active Jobs (${eligiblePros.filter(p => (p.activeBookingsCount || 0) === 0).length})` },
                    { id: 'AVAILABLE', label: `Ready to Assign (${eligiblePros.filter(p => p.isAvailable).length})` },
                    { id: 'TOP_RATED', label: `Top Rated (⭐ 4.5+)` }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCandidateFilter(f.id)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: candidateFilter === f.id ? '1.5px solid #6E42E5' : '1px solid #E2E8F0',
                        backgroundColor: candidateFilter === f.id ? '#F5F3FF' : '#FFFFFF',
                        color: candidateFilter === f.id ? '#6E42E5' : '#64748B',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eligible Candidates Scrollable List */}
              <div style={{
                padding: '16px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                backgroundColor: '#F8FAFC'
              }}>
                {loadingEligiblePros ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#7C3AED' }} />
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Evaluating technicians by Attendance &amp; Workload criteria...</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Verifying shift presence, active bookings count, leaves, and travel distance</div>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                    <AlertCircle size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                    <div style={{ fontWeight: 700, color: '#334155' }}>No technicians match current filter</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Try switching filters to "All" to inspect the complete technician roster.</div>
                  </div>
                ) : (
                  filteredCandidates.map(candidate => {
                    const isSelected = selectedCandidate?.id === candidate.id;
                    const canAssign = candidate.isEligible && candidate.isAvailable;

                    const isPresent = candidate.attendanceStatus === 'PRESENT';
                    const isOnLeave = candidate.attendanceStatus === 'ON_LEAVE';
                    const isOptimalWorkload = (candidate.activeBookingsCount || 0) === 0;
                    const isCapacityFull = candidate.isCapacityReached;

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => {
                          if (canAssign) {
                            setSelectedCandidate(candidate);
                          }
                        }}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 12,
                          border: isSelected ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 14,
                          cursor: canAssign ? 'pointer' : 'not-allowed',
                          opacity: canAssign ? 1 : 0.65,
                          boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Left: Avatar, Name, Verification, Attendance & Workload Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#7C3AED' : (isPresent ? '#DCFCE7' : '#F1F5F9'),
                            color: isSelected ? '#FFFFFF' : (isPresent ? '#15803D' : '#475569'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 16,
                            flexShrink: 0
                          }}>
                            {candidate.name.charAt(0)}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                                {candidate.name}
                              </span>
                              {candidate.isVerified && (
                                <span title="Verified Professional" style={{ display: 'inline-flex' }}>
                                  <ShieldCheck size={14} color="#0284C7" />
                                </span>
                              )}
                              {/* 1. ATTENDANCE CRITERIA BADGE */}
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 10,
                                backgroundColor: isPresent ? '#DCFCE7' : (isOnLeave ? '#FEE2E2' : '#F1F5F9'),
                                color: isPresent ? '#15803D' : (isOnLeave ? '#B91C1C' : '#64748B'),
                                border: `1px solid ${isPresent ? '#BBF7D0' : (isOnLeave ? '#FECACA' : '#E2E8F0')}`
                              }}>
                                {isPresent ? '● Present & On Duty' : (isOnLeave ? '🏖️ On Approved Leave' : '○ Offline')}
                              </span>

                              {/* 2. WORKLOAD FAIRNESS CRITERIA BADGE */}
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 10,
                                backgroundColor: isCapacityFull ? '#FEE2E2' : (isOptimalWorkload ? '#EFF6FF' : '#FEF3C7'),
                                color: isCapacityFull ? '#B91C1C' : (isOptimalWorkload ? '#1D4ED8' : '#B45309'),
                                border: `1px solid ${isCapacityFull ? '#FECACA' : (isOptimalWorkload ? '#BFDBFE' : '#FDE68A')}`
                              }}>
                                ⚡ Workload: {candidate.activeBookingsCount || 0} / {candidate.maxDailyJobs || 4} Jobs {isOptimalWorkload ? '(Optimal)' : (isCapacityFull ? '(Max Capacity)' : '(Moderate)')}
                              </span>
                            </div>

                            {/* Skills Tags & Trade */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#6E42E5' }}>
                                {candidate.trade || 'Specialist'}:
                              </span>
                              {(candidate.skills || []).slice(0, 3).map((sk, idx) => (
                                <span key={idx} style={{
                                  fontSize: 10.5,
                                  backgroundColor: '#F1F5F9',
                                  color: '#334155',
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  fontWeight: 600
                                }}>
                                  {sk}
                                </span>
                              ))}
                            </div>

                            {/* Ineligibility Warning if cannot assign */}
                            {!canAssign && (
                              <div style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#DC2626',
                                marginTop: 4,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <Ban size={12} />
                                Ineligible: {isOnLeave ? 'Technician is on approved leave today' : (!candidate.isOnline ? 'Technician is currently offline' : (isCapacityFull ? 'Technician reached max daily job capacity (4/4)' : 'Busy with conflicting slot'))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Scores & Criteria Breakdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'right', flexShrink: 0 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                              <MapPin size={12} color="#6E42E5" />
                              {candidate.distanceKm != null ? `${candidate.distanceKm} km` : '0 km'} • ~{candidate.etaMinutes || 6}m ETA
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#F59E0B', fontWeight: 700 }}>
                                <Star size={11} fill="#F59E0B" /> {candidate.rating || '5.0'}
                              </span>
                              <span>•</span>
                              <span style={{ color: '#059669', fontWeight: 800, backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: 4, border: '1px solid #A7F3D0' }}>
                                {candidate.score || 85}% Score
                              </span>
                            </div>
                            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                              Att: {candidate.attendanceScore || 30}pts • Workload: {candidate.workloadScore || 30}pts
                            </div>
                          </div>

                          {/* Select Radio / Checkmark */}
                          <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #7C3AED' : '2px solid #CBD5E1',
                            backgroundColor: isSelected ? '#7C3AED' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF'
                          }}>
                            {isSelected && <Check size={14} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer Actions */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF'
              }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {selectedCandidate ? (
                    <span>Selected: <strong style={{ color: '#7C3AED' }}>{selectedCandidate.name}</strong> • Offer expires in {offerTimeout}s</span>
                  ) : (
                    <span>Select an eligible professional from the verified candidates above</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setManualAssignBooking(null);
                      setShowAssignModal(false);
                      setSelectedCandidate(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!selectedCandidate || isSubmittingOffer}
                    onClick={handleDirectAssignWorker}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 18px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: selectedCandidate && !isSubmittingOffer ? '#059669' : '#CBD5E1',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: selectedCandidate && !isSubmittingOffer ? 'pointer' : 'not-allowed',
                      boxShadow: selectedCandidate ? '0 4px 10px rgba(5, 150, 105, 0.25)' : 'none'
                    }}
                  >
                    {isSubmittingOffer ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Assigning Worker...
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} />
                        Direct Assign Worker
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={!selectedCandidate || isSubmittingOffer}
                    onClick={handleDispatchManualOffer}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 20px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: selectedCandidate && !isSubmittingOffer ? '#7C3AED' : '#CBD5E1',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: selectedCandidate && !isSubmittingOffer ? 'pointer' : 'not-allowed',
                      boxShadow: selectedCandidate ? '0 4px 10px rgba(124, 58, 237, 0.25)' : 'none'
                    }}
                  >
                    {isSubmittingOffer ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Dispatching Offer...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Dispatch Manual Offer ({offerTimeout}s)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* 3. RESCHEDULE BOOKING MODAL                               */}
      {/* ======================================================== */}
      {showRescheduleModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 500,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Reschedule Booking {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowRescheduleModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Current Slot:
                </label>
                <div style={{ fontSize: 12, color: '#64748B', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: 6 }}>
                  {selectedBooking.slot}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New Date:
                </label>
                <input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={e => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  New Time Slot:
                </label>
                <select
                  value={rescheduleData.newSlot}
                  onChange={e => setRescheduleData(prev => ({ ...prev, newSlot: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM (Morning)</option>
                  <option value="11:00 AM - 12:30 PM">11:00 AM - 12:30 PM (Midday)</option>
                  <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM (Afternoon)</option>
                  <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM (Evening)</option>
                  <option value="06:00 PM - 07:30 PM">06:00 PM - 07:30 PM (Night Slot)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reschedule Reason:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested evening slot, technician delayed"
                  value={rescheduleData.reason}
                  onChange={e => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handleRescheduleSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#6E42E5',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Rescheduled Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CANCEL BOOKING MODAL                                   */}
      {/* ======================================================== */}
      {showCancelModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#DC2626', margin: 0 }}>
                Cancel Booking {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowCancelModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Cancellation Reason:
                </label>
                <select
                  value={cancelData.reason}
                  onChange={e => setCancelData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Professional unavailable / No replacement">Professional unavailable / No replacement</option>
                  <option value="Severe weather / Monsoon surge disruption">Severe weather / Monsoon surge disruption</option>
                  <option value="Customer unreachable at service location">Customer unreachable at service location</option>
                  <option value="Duplicate booking order placed">Duplicate booking order placed</option>
                  <option value="Incorrect address / Out of service area">Incorrect address / Out of service area</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Cancellation Fee Charged (₹):
                </label>
                <input
                  type="number"
                  value={cancelData.feeCharged}
                  onChange={e => setCancelData(prev => ({ ...prev, feeCharged: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: 11, color: '#64748B' }}>0 if cancelled within free cancellation window.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Dismiss
              </button>
              <button
                onClick={handleCancelSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. INITIATE REFUND MODAL                                  */}
      {/* ======================================================== */}
      {showRefundModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 480,
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#B45309', margin: 0 }}>
                Initiate Customer Refund: {selectedBooking.id}
              </h3>
              <X size={18} color="#64748B" style={{ cursor: 'pointer' }} onClick={() => setShowRefundModal(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Refund Amount (Max ₹{selectedBooking.totalAmount}):
                </label>
                <input
                  type="number"
                  value={refundData.amount}
                  onChange={e => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Dispute & Refund Reason:
                </label>
                <select
                  value={refundData.reason}
                  onChange={e => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Service quality dispute">Service quality dispute / Substandard cleaning</option>
                  <option value="Professional no-show">Professional no-show</option>
                  <option value="Order cancelled before technician dispatch">Order cancelled before dispatch</option>
                  <option value="Overcharged / Pricing error">Overcharged / Pricing error</option>
                  <option value="Appliance parts unavailable">Appliance parts unavailable</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowRefundModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={handleRefundSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Execute Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. TAX INVOICE PRINTABLE MODAL                            */}
      {/* ======================================================== */}
      {showInvoiceModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            width: '100%',
            maxWidth: 680,
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Invoice Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#6E42E5' }}>URBAN SERVICES PLATFORM</span>
                <span style={{ fontSize: 12, color: '#64748B', display: 'block' }}>Tax Invoice & Service Bill</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 6,
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={{
                    backgroundColor: '#F1F5F9',
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
            </div>

            {/* Invoice Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, fontSize: 12 }}>
              <div>
                <strong style={{ fontSize: 13, color: '#0F172A' }}>Billed To:</strong>
                <div style={{ fontWeight: 600, marginTop: 4, color: '#1E293B' }}>
                  {selectedBooking.userName || selectedBooking.customerName}
                </div>
                <div style={{ color: '#64748B' }}>{selectedBooking.userPhone}</div>
                <div style={{ color: '#64748B', marginTop: 2 }}>{selectedBooking.address}</div>
                <div style={{ color: '#64748B' }}>{selectedBooking.city}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div>Invoice Number: <strong>{selectedBooking.invoiceNumber || `INV-2026-${selectedBooking.id?.replace(/\D/g, '') || '9841'}`}</strong></div>
                <div>Date of Issue: <strong>{new Date().toLocaleDateString()}</strong></div>
                <div>Booking Ref: <strong>{selectedBooking.id}</strong></div>
                <div>GSTIN: <strong>27AAACU9821L1ZV</strong></div>
                <div>SAC Code: <strong>998719 (Maintenance & Repair Services)</strong></div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 20 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(selectedBooking.items || [{ title: selectedBooking.serviceName, qty: 1, price: selectedBooking.totalAmount }]).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{it.title}</div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Certified doorstep execution by {selectedBooking.assignedPartner || 'Urban Technician'}</div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{it.qty}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>₹{it.price}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>₹{it.price * it.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Total Ledger */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12 }}>
              <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Taxable Value:</span>
                  <span>₹{Math.round(selectedBooking.totalAmount / 1.18)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>CGST (9%):</span>
                  <span>₹{Math.round((selectedBooking.totalAmount / 1.18) * 0.09)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>SGST (9%):</span>
                  <span>₹{Math.round((selectedBooking.totalAmount / 1.18) * 0.09)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: 14,
                  color: '#0F172A',
                  paddingTop: 8,
                  borderTop: '2px solid #0F172A'
                }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#6E42E5' }}>₹{selectedBooking.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #E2E8F0', fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
              This is a computer-generated tax invoice. Authorized by Urban Platform Services Inc.
            </div>
          </div>
        </div>
      )}

      {/* Admin Photo Zoom Modal */}
      {selectedPhotoZoom && (
        <div
          onClick={() => setSelectedPhotoZoom(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedPhotoZoom}
              alt="Verification Photo Full View"
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                borderRadius: 12,
                display: 'block',
                objectFit: 'contain',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            />
            <button
              onClick={() => setSelectedPhotoZoom(null)}
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                backgroundColor: '#FFFFFF',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                fontSize: 16,
                fontWeight: 800,
                color: '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* CREATE NEW BOOKING MODAL (Real Mongo Insert & Dispatch)  */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: '100%',
            maxWidth: 620,
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Plus size={18} color="#6E42E5" />
                  Create New Service Booking
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: '#64748B' }}>
                  Dispatch new home service directly to MongoDB Atlas &amp; assignment queue
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {/* Customer Details Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sundaramoorthy K"
                      value={createFormData.userName}
                      onChange={e => setCreateFormData(prev => ({ ...prev, userName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 94432 88124"
                      value={createFormData.userPhone}
                      onChange={e => setCreateFormData(prev => ({ ...prev, userPhone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Service & Category Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Service Category
                    </label>
                    <select
                      value={createFormData.serviceCategory}
                      onChange={e => setCreateFormData(prev => ({ ...prev, serviceCategory: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="Bathroom & Kitchen cleaning">Bathroom & Kitchen cleaning</option>
                      <option value="Smart Locks, Electrician & Carpentry">Smart Locks, Electrician & Carpentry</option>
                      <option value="Cleaning & Pest Control">Cleaning & Pest Control</option>
                      <option value="Men's Salon & Spa">Men's Salon & Spa</option>
                      <option value="Women's Salon & Spa">Women's Salon & Spa</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AC Deep Clean & Jet Pump Service"
                      value={createFormData.serviceName}
                      onChange={e => setCreateFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Address & Locality Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={createFormData.city}
                      onChange={e => setCreateFormData(prev => ({ ...prev, city: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Locality / Zone
                    </label>
                    <select
                      value={createFormData.serviceZone}
                      onChange={e => setCreateFormData(prev => ({ ...prev, serviceZone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Gandhi Nagar">Gandhi Nagar</option>
                      <option value="Rayakottai Road">Rayakottai Road</option>
                      <option value="Kattiganapalli">Kattiganapalli</option>
                      <option value="Co-operative Colony">Co-operative Colony</option>
                      <option value="Old Pet">Old Pet</option>
                      <option value="Londonpet">Londonpet</option>
                      <option value="Hosur Road">Hosur Road</option>
                      <option value="Bangalore Road">Bangalore Road</option>
                    </select>
                  </div>
                </div>

                {/* Complete Street Address */}
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14/B, 2nd Cross, Gandhi Nagar, Krishnagiri"
                    value={createFormData.address}
                    onChange={e => setCreateFormData(prev => ({ ...prev, address: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 11px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      fontSize: 12.5,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Slot, Amount, Payment Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Appointment Slot
                    </label>
                    <select
                      value={createFormData.slot}
                      onChange={e => setCreateFormData(prev => ({ ...prev, slot: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Today, 09:30 AM - 11:00 AM">Today, 09:30 AM - 11:00 AM</option>
                      <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                      <option value="Today, 02:00 PM - 03:30 PM">Today, 02:00 PM - 03:30 PM</option>
                      <option value="Today, 04:00 PM - 05:00 PM">Today, 04:00 PM - 05:00 PM</option>
                      <option value="Today, 05:00 PM - 06:00 PM">Today, 05:00 PM - 06:00 PM</option>
                      <option value="Tomorrow, 10:00 AM - 11:30 AM">Tomorrow, 10:00 AM - 11:30 AM</option>
                      <option value="Tomorrow, 02:00 PM - 03:30 PM">Tomorrow, 02:00 PM - 03:30 PM</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={createFormData.totalAmount}
                      onChange={e => setCreateFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) || 0 }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Payment Status
                    </label>
                    <select
                      value={createFormData.paymentStatus}
                      onChange={e => setCreateFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                {/* Assignment Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Dispatch Mode
                    </label>
                    <select
                      value={createFormData.assignmentMode}
                      onChange={e => setCreateFormData(prev => ({ ...prev, assignmentMode: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="AUTO">AUTO (Dispatch algorithm)</option>
                      <option value="MANUAL">MANUAL (Admin assign)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Direct Assign Technician (Optional)
                    </label>
                    <select
                      value={createFormData.professionalId}
                      onChange={e => {
                        const proId = e.target.value;
                        const pro = professionals.find(p => (p.id || p._id) === proId);
                        setCreateFormData(prev => ({
                          ...prev,
                          professionalId: proId,
                          assignedPartner: pro ? (pro.applicantName || pro.name) : ''
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 11px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 12,
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Let system assign --</option>
                      {professionals.map(p => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.applicantName || p.name} ({p.trade || 'Technician'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                backgroundColor: '#F8FAFC'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: isSubmittingCreate ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(110, 66, 229, 0.3)'
                  }}
                >
                  {isSubmittingCreate ? 'Creating in Atlas...' : 'Create & Dispatch Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT BOOKING MODAL (Update Details in MongoDB Atlas)     */}
      {/* ======================================================== */}
      {showEditModal && editFormData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            width: '100%',
            maxWidth: 600,
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit size={16} color="#6E42E5" />
                  Edit Booking #{editFormData.id}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: '#64748B' }}>
                  Update customer information, appointment time, address, or payment status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} color="#64748B" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.userName}
                      onChange={e => setEditFormData(prev => ({ ...prev, userName: e.target.value }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Customer Phone
                    </label>
                    <input
                      type="text"
                      value={editFormData.userPhone}
                      onChange={e => setEditFormData(prev => ({ ...prev, userPhone: e.target.value }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.serviceName}
                      onChange={e => setEditFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Slot
                    </label>
                    <input
                      type="text"
                      value={editFormData.slot}
                      onChange={e => setEditFormData(prev => ({ ...prev, slot: e.target.value }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={e => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                    style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Total (₹)
                    </label>
                    <input
                      type="number"
                      value={editFormData.totalAmount}
                      onChange={e => setEditFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12, backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Assigned">Assigned</option>
                      <option value="En Route">En Route</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Payment
                    </label>
                    <select
                      value={editFormData.paymentStatus}
                      onChange={e => setEditFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      style={{ width: '100%', padding: '8px 11px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12, backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>

              </div>

              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                backgroundColor: '#F8FAFC'
              }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#6E42E5',
                    color: '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: isSubmittingEdit ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(110, 66, 229, 0.3)'
                  }}
                >
                  {isSubmittingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
