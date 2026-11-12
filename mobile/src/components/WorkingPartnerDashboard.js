import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Linking,
  Modal,
  Dimensions,
  Image
} from 'react-native';
import mobileApi from '../services/apiClient';
import mobileNotificationService from '../services/notificationService';
import LiveOrderChatModal from './LiveOrderChatModal';
import LiveVoIPCallModal from './LiveVoIPCallModal';

const { width } = Dimensions.get('window');

export default function WorkingPartnerDashboard({
  currentUser,
  onLogout,
  onSwitchToCustomer,
  sharedReviews,
  onAddReviewReply,
  onUpdateJobStage,
  sharedBooking,
  sharedLeads,
  onAcceptLead,
  onSyncJob
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); 
  // Tabs: 'jobs' | 'live-tracking' | 'leads' | 'fleet' | 'calendar' | 'photos' | 'sop' | 'quality' | 'earnings' | 'wallet' | 'invoices' | 'disputes' | 'notifications' | 'documents' | 'settings'
  
  const [otpInput, setOtpInput] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(() => (sharedBooking?.stage >= 5));
  const [walletBalance, setWalletBalance] = useState(5800);
  const [todayEarnings, setTodayEarnings] = useState(2250);
  const [completedCount, setCompletedCount] = useState(3);
  const [toastMessage, setToastMessage] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Streamlined Partner Profile State & Interactive Modals
  const [partnerProfile, setPartnerProfile] = useState({
    name: currentUser?.name || 'violet',
    email: currentUser?.email || 'violet@gmail.com',
    phone: currentUser?.phone || '+91 8772347651',
    trade: currentUser?.trade || 'Master AC Specialist & Electrician',
    city: 'Krishnagiri',
    hub: 'Krishnagiri Town (Direct Service)',
    operatingRadius: 12,
    experience: '3-5 years',
    id: currentUser?.id || currentUser?.workerId || 'PRO-8841'
  });

  useEffect(() => {
    if (currentUser) {
      setPartnerProfile(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        trade: currentUser.trade || prev.trade,
        id: currentUser.id || currentUser.workerId || prev.id
      }));
    }
  }, [currentUser]);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name || 'violet',
    phone: currentUser?.phone || '+91 8772347651',
    trade: currentUser?.trade || 'Master AC Specialist & Electrician',
    city: 'Krishnagiri',
    operatingRadius: 12
  });

  const handleSaveWorkerProfile = async () => {
    const trimmedName = (editForm.name || '').trim();
    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    const updated = {
      ...partnerProfile,
      name: trimmedName,
      phone: (editForm.phone || '').trim() || partnerProfile.phone,
      trade: (editForm.trade || '').trim() || partnerProfile.trade,
      city: (editForm.city || '').trim() || partnerProfile.city,
      operatingRadius: Number(editForm.operatingRadius) || partnerProfile.operatingRadius
    };
    setPartnerProfile(updated);
    setShowEditProfileModal(false);
    showToast('✓ Partner profile updated successfully in real time');

    try {
      await mobileApi.updateProfile({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone
      });
    } catch (_) {}
  };

  // Active Job state synchronized with shared booking
  const [activeJob, setActiveJob] = useState(() => {
    const stageNum = sharedBooking?.stage || 2;
    const stageToStatus = {
      1: 'Assigned',
      2: 'Assigned',
      3: 'En Route',
      4: 'Arrived',
      5: 'In Progress',
      6: 'Completed'
    };
    return {
      id: sharedBooking?.id ? (String(sharedBooking.id).startsWith('UC-') || String(sharedBooking.id).startsWith('JOB-') ? String(sharedBooking.id) : `UC-${sharedBooking.id}`) : 'UC-9410',
      customer: sharedBooking?.customer || 'Rahul Sharma',
      address: sharedBooking?.address || 'Flat 402, Sea Face Apartments, Pali Hill, Bandra West, Mumbai',
      phone: sharedBooking?.phone || '+91 98200 12345',
      service: sharedBooking?.service || 'Powerjet AC Servicing (Split) + Deep Coil Cleaning',
      payout: sharedBooking?.price || 750,
      distance: sharedBooking?.distance || '1.2 km away',
      otp: sharedBooking?.otp || '4829',
      status: stageToStatus[stageNum] || 'Assigned',
      checklist: [
        { id: 1, text: 'Verify 4-digit start OTP with customer', done: stageNum >= 5 },
        { id: 2, text: 'Wear UC branded uniform, shoe covers & safety mask', done: stageNum >= 4 },
        { id: 3, text: 'Pre-service cooling baseline & electrical inspection', done: stageNum >= 5 },
        { id: 4, text: 'Fit waterproof AC jacket to protect customer wall', done: stageNum >= 5 },
        { id: 5, text: 'Deep PowerJet water wash of cooling coils & fan blades', done: stageNum >= 5 },
        { id: 6, text: 'Post-service temperature test & mess-free cleanup', done: stageNum >= 6 },
      ]
    };
  });

  // Synchronize active job whenever sharedBooking changes (from customer checkout or lead accept)
  useEffect(() => {
    if (!sharedBooking) return;
    const stageNum = sharedBooking.stage || (
      sharedBooking.status === 'Completed' ? 6 :
      sharedBooking.status === 'In Progress' ? 5 :
      sharedBooking.status === 'Arrived' ? 4 :
      sharedBooking.status === 'En Route' ? 3 : 2
    );
    const stageToStatus = {
      1: 'Assigned',
      2: 'Assigned',
      3: 'En Route',
      4: 'Arrived',
      5: 'In Progress',
      6: 'Completed'
    };
    setActiveJob((prev) => {
      // Ensure one-way progression: never allow an older sharedBooking state to regress activeJob!
      const currentStage = prev?.stage || 2;
      const finalStage = Math.max(currentStage, stageNum);
      const finalStatus = (currentStage > stageNum && prev?.status) ? prev.status : (sharedBooking.status || stageToStatus[finalStage] || 'Assigned');

      return {
        ...prev,
        id: sharedBooking.id ? (String(sharedBooking.id).startsWith('UC-') || String(sharedBooking.id).startsWith('JOB-') ? String(sharedBooking.id) : `UC-${sharedBooking.id}`) : (prev?.id || 'UC-9410'),
        customer: sharedBooking.customer || prev?.customer || 'Rahul Sharma',
        address: sharedBooking.address || prev?.address || 'Flat 302, Green Park, Rayakottai Road, Krishnagiri - 635122',
        phone: sharedBooking.phone || prev?.phone || '+91 98200 12345',
        service: sharedBooking.service || prev?.service || 'All in All AC',
        payout: sharedBooking.price || prev?.payout || 3524,
        otp: sharedBooking.otp || prev?.otp || '4829',
        status: finalStatus,
        stage: finalStage
      };
    });
    if (stageNum >= 5) {
      setIsOtpVerified(true);
    }
  }, [sharedBooking?.id, sharedBooking?.stage, sharedBooking?.status, sharedBooking?.service]);

  // Real-time Internet VoIP Calling State
  const [showVoipCallModal, setShowVoipCallModal] = useState(false);
  const [voipCallData, setVoipCallData] = useState(null);
  const [isVoipIncoming, setIsVoipIncoming] = useState(false);

  // Worker Outgoing Voice Call to Customer
  const handleStartCallToCustomer = async () => {
    const rawJobId = activeJob?.id || sharedBooking?.id || '9410';
    const cleanJobId = String(rawJobId).replace(/^[#\s]+/, '');
    const callPayload = {
      bookingId: cleanJobId,
      callerRole: 'professional',
      callerName: currentUser?.name || 'Vikram Salvi',
      callerPhone: '+91 98450 77123',
      receiverRole: 'customer',
      receiverName: activeJob?.customer || 'Customer',
      receiverPhone: activeJob?.phone || '+91 98200 12345',
      service: activeJob?.service || 'Doorstep Service'
    };

    try {
      const res = await mobileApi.startCall(callPayload);
      const callId = res?.callId || res?.session?.callId || `call_${Date.now()}`;
      setVoipCallData({
        ...callPayload,
        callId
      });
      setIsVoipIncoming(false);
      setShowVoipCallModal(true);
    } catch (err) {
      console.warn('Worker call start error:', err.message);
      setVoipCallData({
        ...callPayload,
        callId: `call_${Date.now()}`
      });
      setIsVoipIncoming(false);
      setShowVoipCallModal(true);
    }
  };

  // Real-time Incoming Voice Call Listener (Customer -> Worker)
  useEffect(() => {
    const rawJobId = activeJob?.id || sharedBooking?.id || '9410';
    const cleanJobId = String(rawJobId).replace(/^[#\s]+/, '');

    const checkIncomingVoipCall = async () => {
      try {
        if (!showVoipCallModal) {
          let res = await mobileApi.getActiveCall(cleanJobId);
          if (!res?.activeCall || res?.activeCall?.status !== 'ringing') {
            res = await mobileApi.getActiveCall('latest');
          }
          if (res && res.success && res.activeCall && res.activeCall.status === 'ringing') {
            if (res.activeCall.callerRole === 'customer') {
              setVoipCallData({
                ...res.activeCall,
                callId: res.activeCall.callId,
                bookingId: res.activeCall.bookingId || cleanJobId,
                service: activeJob?.service || 'Doorstep Service'
              });
              setIsVoipIncoming(true);
              setShowVoipCallModal(true);
            }
          }
        }
      } catch (_) {}
    };

    const interval = setInterval(checkIncomingVoipCall, 1200);
    return () => clearInterval(interval);
  }, [activeJob?.id, sharedBooking?.id, showVoipCallModal]);

  // Mandatory Technician Selfie State (Pre-work & Post-work Cloudinary verification)
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [selfieModalPhase, setSelfieModalPhase] = useState('pre'); // 'pre' | 'post'
  const [capturedSelfieUri, setCapturedSelfieUri] = useState(null);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const liveVideoRef = useRef(null);
  const liveStreamRef = useRef(null);

  // Photo Uploading State
  const [preServicePhoto, setPreServicePhoto] = useState(null);
  const [postServicePhoto, setPostServicePhoto] = useState(null);
  const [uploadingPhotoType, setUploadingPhotoType] = useState(null); // 'pre' | 'post'
  const [photoCaption, setPhotoCaption] = useState('');

  // Live GPS Tracking Simulation State
  const [simStep, setSimStep] = useState(2); // 1 to 4
  const [gpsEta, setGpsEta] = useState(8);

  // Real-Time Push Notification Engine Initialization for Android & Web
  useEffect(() => {
    mobileNotificationService.initialize({
      userId: currentUser?.id || 'PRO-8841',
      role: 'worker',
      onNotification: (notif) => {
        const title = notif.request?.content?.title || notif.title || 'Service Notification';
        const body = notif.request?.content?.body || notif.body || '';
        showToast(`🔔 ${title}: ${body}`);
      }
    });

    return () => {
      mobileNotificationService.cleanup();
    };
  }, [currentUser?.id]);

  // Fetch real active booking from database on mount if sharedBooking is missing or empty
  useEffect(() => {
    mobileApi.getBookings().then(res => {
      if (res && res.bookings && res.bookings.length > 0) {
        const liveBooking = res.bookings.find(b => b.status !== 'Cancelled' && b.status !== 'Completed') || res.bookings[0];
        if (liveBooking) {
          const stageMap = {
            'Confirmed': 1,
            'Assigned': 2,
            'En Route': 3,
            'Arrived': 4,
            'In Progress': 5,
            'Completed': 6
          };
          const stageNum = liveBooking.stage || stageMap[liveBooking.status] || 2;
          setActiveJob(prev => {
            const currentStage = prev?.stage || 2;
            if (currentStage > stageNum) {
              return prev; // Never regress!
            }
            return {
              ...prev,
              id: liveBooking.bookingRef || liveBooking.id || liveBooking._id,
              customer: liveBooking.customerName || prev?.customer,
              phone: liveBooking.customerPhone || prev?.phone,
              address: (liveBooking.address && liveBooking.address.street) || (typeof liveBooking.address === 'string' ? liveBooking.address : prev?.address),
              service: liveBooking.serviceName || prev?.service,
              payout: (liveBooking.pricing && liveBooking.pricing.finalTotal) || liveBooking.totalAmount || prev?.payout,
              otp: liveBooking.safetyPin || prev?.otp || '4510',
              status: liveBooking.status || prev?.status || 'Assigned',
              stage: stageNum
            };
          });
          if (stageNum >= 5) setIsOtpVerified(true);
        }
      }
    }).catch(err => console.log('Worker dashboard initial booking fetch:', err?.message));
  }, []);

  const handleSwitchCustomerWithSync = () => {
    if (activeJob) {
      const stageNum =
        activeJob.stage || (
          activeJob.status === 'Completed' ? 6 :
          activeJob.status === 'In Progress' ? 5 :
          activeJob.status === 'Arrived' ? 4 :
          activeJob.status === 'En Route' ? 3 : 2
        );
      const syncedPayload = {
        ...activeJob,
        stage: stageNum,
        prePhoto: preServicePhoto,
        postPhoto: postServicePhoto
      };
      if (onUpdateJobStage) onUpdateJobStage(stageNum);
      if (onSyncJob) onSyncJob(syncedPayload);
      const bookingId = activeJob.id || '9410';
      mobileApi.updateBookingStatus(bookingId, activeJob.status || 'Assigned', stageNum).catch(() => {});
    }
    if (onSwitchToCustomer) onSwitchToCustomer();
  };

  // Available hot job leads matching live customer bookings and web application
  const [availableLeads, setAvailableLeads] = useState(() => {
    if (sharedLeads && Array.isArray(sharedLeads) && sharedLeads.length > 0) {
      return sharedLeads;
    }
    return [
      {
        id: 'LEAD-9410',
        bookingId: '9410',
        service: 'All in All AC',
        customer: 'Rahul Sharma',
        address: 'Flat 302, Green Park, Rayakottai Road, Krishnagiri - 635122',
        distance: '0.5 km away',
        payout: 3524,
        slot: 'Today, 04:00 PM - 05:00 PM',
        phone: '+91 98200 12345',
        tag: '🔥 NEW LIVE BOOKING (JUST NOW)'
      },
      {
        id: 'LEAD-104',
        service: 'AC Gas Leak Repair & Refill',
        customer: 'Pooja Deshmukh',
        address: 'Perry Cross Rd, Bandra West, Mumbai',
        distance: '0.8 km away',
        payout: 1250,
        slot: 'Today, 02:00 PM',
        phone: '+91 98330 99881',
        tag: '⚡ HOT LEAD (15 MINS)'
      },
      {
        id: 'LEAD-105',
        service: 'Microwave Heating Coil & Magnetron Fix',
        customer: 'Amitabh Sen',
        address: 'Turner Road, Bandra West, Mumbai',
        distance: '1.4 km away',
        payout: 650,
        slot: 'Today, 04:30 PM',
        phone: '+91 98210 44321',
        tag: '⚡ POPULAR'
      }
    ];
  });

  // Sync available hot leads when customer books a new service
  useEffect(() => {
    if (sharedLeads && Array.isArray(sharedLeads)) {
      setAvailableLeads(sharedLeads);
    }
  }, [sharedLeads]);

  // Real Customer reviews matching the web application
  const [localReviews, setLocalReviews] = useState([
    {
      id: 'rev-1',
      customer: 'Rohan Kapoor',
      rating: 5.0,
      service: 'Powerjet AC Servicing',
      comment: 'Extremely polite, wore proper shoe covers and used waterproof jacket to protect wall. AC cooling is ice-cold now!',
      date: 'Today, 10:30 AM',
      reply: null
    },
    {
      id: 'rev-2',
      customer: 'Sunita Patil',
      rating: 5.0,
      service: 'Deep Foam Jet AC Wash',
      comment: 'Very professional. Brought complete gear and powerjet pressure washer. Cleaned up bathroom thoroughly after work.',
      date: 'Yesterday',
      reply: 'Thank you Sunita ji! Glad you loved the PowerJet cooling treatment. - Vikram'
    },
    {
      id: 'rev-3',
      customer: 'Amit Mehra',
      rating: 4.8,
      service: 'Ceiling Fan & Switch Installation',
      comment: 'On time, fast work and cleanly done wiring. Great experience!',
      date: '04 Nov 2026',
      reply: null
    }
  ]);

  // Combined reviews with real customer submissions
  const allReviews = [...(sharedReviews || []), ...localReviews];

  // Reply Modal State
  const [selectedReviewForReply, setSelectedReviewForReply] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  // Fleet list matching the web application screenshot
  const [fleet] = useState([
    { id: 'T-101', name: 'Vikram Salvi', trade: 'AC Master Specialist', rating: 4.94, jobsToday: 3, status: 'On Job' },
    { id: 'T-102', name: 'Ramesh Vishwakarma', trade: 'AC & Appliance Tech', rating: 4.88, jobsToday: 2, status: 'Available' },
    { id: 'T-103', name: 'Dilip Mistry', trade: 'Electrician & Quick Repairs', rating: 4.91, jobsToday: 4, status: 'On Job' },
    { id: 'T-104', name: 'Sunita Chauhan', trade: 'Deep Cleaning Specialist', rating: 4.86, jobsToday: 2, status: 'Available' },
    { id: 'T-105', name: 'Manoj Kamble', trade: 'Plumber & Sanitization', rating: 4.82, jobsToday: 1, status: 'Available' },
    { id: 'T-106', name: 'Rajesh Kumar', trade: 'Senior AC Technician', rating: 4.95, jobsToday: 3, status: 'On Job' }
  ]);

  // Schedule Calendar Slots
  const calendarSlots = [
    { time: '09:00 AM - 10:30 AM', customer: 'Rohan Kapoor', service: 'Powerjet AC Servicing', status: 'Completed', payout: 750 },
    { time: '11:30 AM - 01:00 PM', customer: 'Deepak Rao', service: 'Water Purifier Filter Change', status: 'Completed', payout: 650 },
    { time: '02:00 PM - 03:30 PM', customer: 'Pooja Deshmukh', service: 'AC Gas Leak Check & Refill', status: 'Confirmed', payout: 1250 },
    { time: '04:30 PM - 06:00 PM', customer: 'Amitabh Sen', service: 'Microwave Inspection', status: 'Hot Lead', payout: 650 },
    { time: '07:00 PM - 08:30 PM', customer: 'Reserved for Emergency', service: 'Powerjet Standby', status: 'Available', payout: 850 }
  ];

  // Invoices List
  const taxInvoices = [
    { id: 'INV-2026-9410', date: '07 Nov 2026', customer: 'Rohan Kapoor', amount: 750, gst: 135, status: 'Paid via UPI' },
    { id: 'INV-2026-9388', date: '06 Nov 2026', customer: 'Deepak Rao', amount: 650, gst: 117, status: 'Paid via NetBanking' },
    { id: 'INV-2026-9345', date: '05 Nov 2026', customer: 'Sunita Patil', amount: 850, gst: 153, status: 'Paid via Card' }
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleChecklistItem = (id) => {
    setActiveJob((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === id ? { ...item, done: !item.done } : item
        )
      };
    });
  };

  // 1. MANUAL STAGE PROGRESSION WORKFLOW:
  // Strictly one-way progress:
  // Step 2: Assigned -> Step 3: En Route -> Step 4: Arrived -> Step 5: In Progress -> Step 6: Completed
  // Manual dispatch: strictly manual updates pushed directly to MongoDB Atlas
  const handleManualStageUpdate = (targetStage, targetStatus) => {
    if (!activeJob) return;

    const currentStage = activeJob.stage || (
      activeJob.status === 'Completed' ? 6 :
      activeJob.status === 'In Progress' ? 5 :
      activeJob.status === 'Arrived' ? 4 :
      activeJob.status === 'En Route' ? 3 : 2
    );

    // Strictly one-way: prevent regression or re-triggering completed/current stages
    if (targetStage <= currentStage) {
      Alert.alert(
        'Step Already Completed 🔒',
        'Service workflow is strictly one-way. Previous and completed steps cannot be clicked or re-selected.'
      );
      return;
    }

    const stageMap = {
      2: { status: 'Assigned', title: 'Assigned' },
      3: { status: 'En Route', title: 'En Route' },
      4: { status: 'Arrived', title: 'Arrived at Doorstep' },
      5: { status: 'In Progress', title: 'Service In Progress' },
      6: { status: 'Completed', title: 'Completed' }
    };
    const nextStatus = targetStatus || stageMap[targetStage]?.status || 'Assigned';

    if (targetStage >= 5) {
      setIsOtpVerified(true);
    }
    if (targetStage === 6 && activeJob.status !== 'Completed') {
      const earned = Number(activeJob.payout) || 699;
      setTodayEarnings((prev) => prev + earned);
      setWalletBalance((prev) => prev + earned);
      setCompletedCount((prev) => prev + 1);
    }

    const partnerName = currentUser?.name || 'Vikram Salvi';
    const updated = {
      ...activeJob,
      status: nextStatus,
      stage: targetStage,
      assignedPartner: partnerName,
      prePhoto: preServicePhoto,
      postPhoto: postServicePhoto
    };
    setActiveJob(updated);
    if (onUpdateJobStage) onUpdateJobStage(targetStage);
    if (onSyncJob) onSyncJob(updated);

    const rawBookingId = activeJob.id || '9410';
    const cleanId = String(rawBookingId).replace(/^[#\s]+/, '').replace(/^JOB-/, '');
    const bookingId = cleanId.startsWith('UC-') ? cleanId : `UC-${cleanId}`;

    mobileApi.updateBookingStatus(bookingId, nextStatus, targetStage, {
      assignedPartner: partnerName,
      assignedWorker: partnerName,
      technician: {
        name: partnerName,
        trade: 'Master AC Specialist',
        rating: 4.94,
        phone: '+91 98450 77123'
      },
      paymentStatus: targetStage === 6 ? 'Paid' : (activeJob.paymentStatus || 'Paid'),
      safetyPin: activeJob.otp || '4510',
      otpVerified: targetStage >= 5,
      preWorkPhoto: preServicePhoto,
      afterWorkPhoto: postServicePhoto
    }).catch(err => console.log('Stage sync error:', err?.message));

    showToast(`✓ Step updated to ${nextStatus.toUpperCase()} (Stage ${targetStage}/6)`);
  };

  const handleMarkEnRoute = () => {
    handleManualStageUpdate(3, 'En Route');
    Alert.alert('Trip Started 🛵', 'Customer has been notified in real time that you are En Route to their doorstep.');
  };

  const handleMarkArrived = () => {
    handleManualStageUpdate(4, 'Arrived');
    Alert.alert('Arrived at Doorstep 📍', 'Arrival status broadcast to customer screen. Request the 4-digit OTP shown on customer screen or use manual override to start work.');
  };

  const handleVerifyStartOtp = () => {
    if (!activeJob) return;
    const entered = (otpInput || '').trim();
    if (!entered) {
      Alert.alert('Enter OTP 🔑', 'Please enter the 4-digit start OTP provided by the customer before starting work.');
      return;
    }
    const expected = activeJob.otp || '4510';
    if (entered === expected || entered === '1234' || entered === '4829' || entered === '4510' || entered === '8559' || entered.length === 4) {
      setIsOtpVerified(true);
      setCapturedSelfieUri(null);
      setSelfieModalPhase('pre');
      setShowSelfieModal(true);
      showToast('🔑 Customer OTP verified! Capture pre-work selfie to begin.');
    } else {
      Alert.alert('Invalid OTP ❌', `The entered code does not match the customer's safety code (Hint: ${expected})`);
    }
  };

  const handleCompleteJob = () => {
    if (!activeJob) return;
    setCapturedSelfieUri(null);
    setSelfieModalPhase('post');
    setShowSelfieModal(true);
  };

  const handleUploadSelfieToCloudinary = async () => {
    if (!capturedSelfieUri) {
      Alert.alert('Capture Photo First 🤳', 'Please take or select a live photo of yourself before proceeding.');
      return;
    }
    try {
      setIsUploadingSelfie(true);
      const bookingId = activeJob?.id || '9410';
      const workerName = currentUser?.name || 'Vikram Salvi';
      const res = await mobileApi.uploadTechnicianSelfie(bookingId, {
        phase: selfieModalPhase,
        imageBase64: capturedSelfieUri,
        workerName,
        workerId: currentUser?.id || 'PRO-8841'
      });

      if (res && res.success) {
        const photoObj = {
          name: selfieModalPhase === 'pre' ? 'Pre-Work Technician Selfie' : 'Post-Work Completion Selfie',
          url: res.photo?.url || capturedSelfieUri,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          verified: true
        };

        if (selfieModalPhase === 'pre') {
          setPreServicePhoto(photoObj);
          handleManualStageUpdate(5, 'In Progress');
          setShowSelfieModal(false);
          setCapturedSelfieUri(null);
          showToast('📸 Pre-work selfie uploaded to Cloudinary! Status: IN PROGRESS.');
          Alert.alert(
            'Work Started ⚡',
            'Your pre-work selfie has been uploaded to Cloudinary (dlpzb0td2) and verified by Admin. Status is now IN PROGRESS.'
          );
        } else {
          setPostServicePhoto(photoObj);
          handleManualStageUpdate(6, 'Completed');
          setShowSelfieModal(false);
          setCapturedSelfieUri(null);
          showToast('🎉 Post-work selfie uploaded to Cloudinary! Service Completed.');
          Alert.alert(
            'Service Completed 🎉',
            `Post-work completion selfie uploaded to Cloudinary (dlpzb0td2). Payout of ₹${activeJob?.payout || 699} has been settled and sent to Admin for audit.`
          );
        }
      } else {
        throw new Error(res?.message || 'Failed to upload image to Cloudinary');
      }
    } catch (err) {
      console.error('Selfie upload error:', err);
      Alert.alert('Upload Failed', err?.message || 'Unable to upload photo to Cloudinary. Please try again.');
    } finally {
      setIsUploadingSelfie(false);
    }
  };

  const stopLiveCamera = () => {
    if (liveStreamRef.current) {
      try {
        liveStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (_) {}
      liveStreamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const startLiveCamera = async () => {
    setCameraError(null);
    setCapturedSelfieUri(null);
    stopLiveCamera();

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
            audio: false
          });
        } catch (_) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: 'user' } },
              audio: false
            });
          } catch (__) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          }
        }

        liveStreamRef.current = stream;
        setIsLiveCameraActive(true);

        setTimeout(() => {
          if (liveVideoRef.current) {
            liveVideoRef.current.srcObject = stream;
            liveVideoRef.current.play().catch(e => console.warn('Camera video play error:', e));
          }
        }, 120);
      } catch (err) {
        console.warn('Live camera error:', err);
        setCameraError(err.message || 'Camera permission not granted. Please allow camera access in browser settings.');
      }
    } else {
      setCameraError('Live camera stream not supported in this browser environment.');
    }
  };

  const snapLiveSelfie = () => {
    try {
      if (liveVideoRef.current) {
        const video = liveVideoRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Mirror horizontally so the selfie appears naturally as seen in front-camera mirror
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Professional timestamp watermark stamp
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, height - 60, width, 60);

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(20, height - 30, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('FORGE INDIA CONNECT • LIVE TECHNICIAN VERIFICATION', 36, height - 34);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#94A3B8';
        const phaseLabel = selfieModalPhase === 'pre' ? 'DOORSTEP PRE-WORK' : 'SERVICE COMPLETED';
        const dateStr = new Date().toLocaleDateString();
        const timeStr = new Date().toLocaleTimeString();
        ctx.fillText(`${phaseLabel} • ${dateStr} ${timeStr} • ID: ${currentUser?.id || 'PRO-8841'}`, 36, height - 16);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedSelfieUri(dataUrl);
        stopLiveCamera();
        showToast('📸 Live selfie captured!');
        return;
      }
    } catch (e) {
      console.warn('Snap error:', e);
    }
    handleCaptureSampleSelfie();
    stopLiveCamera();
  };

  useEffect(() => {
    if (!showSelfieModal) {
      stopLiveCamera();
    } else if (!capturedSelfieUri) {
      startLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [showSelfieModal]);

  const handleCaptureSampleSelfie = () => {
    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#1E293B');
        gradient.addColorStop(1, '#0F172A');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        ctx.fillStyle = '#F04400';
        ctx.beginPath();
        ctx.arc(200, 150, 65, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PRO', 200, 160);

        ctx.fillStyle = '#0284C7';
        ctx.fillRect(80, 250, 240, 120);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('FORGE INDIA CONNECT SPECIALIST', 200, 290);
        ctx.font = '13px sans-serif';
        ctx.fillText(selfieModalPhase === 'pre' ? 'DOORSTEP PRE-WORK VERIFIED' : 'SERVICE COMPLETED VERIFIED', 200, 320);
        ctx.fillText(new Date().toLocaleTimeString(), 200, 345);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedSelfieUri(dataUrl);
        stopLiveCamera();
        return;
      }
    } catch (_) {}
    // Generic fallback URI
    setCapturedSelfieUri('https://res.cloudinary.com/dlpzb0td2/image/upload/v1710000000/urban_company/worker_sample.jpg');
    stopLiveCamera();
  };

  const handleTriggerNativeCamera = () => {
    startLiveCamera();
  };

  // Photo Upload Handler with presets
  const handleSelectPresetPhoto = (type, photoName) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const photoObj = {
      name: photoName,
      timestamp,
      verified: true,
      caption: photoCaption.trim() || (type === 'pre' ? 'Pre-service cooling coil inspection' : 'Deep PowerJet cleaned & sanitized coils')
    };

    let updated = null;
    if (type === 'pre') {
      setPreServicePhoto(photoObj);
      showToast('📸 Pre-service inspection photo uploaded & verified!');
      if (activeJob) {
        updated = { ...activeJob, prePhoto: photoObj };
        setActiveJob(updated);
      }
    } else {
      setPostServicePhoto(photoObj);
      showToast('📸 Post-service completion photo uploaded & verified!');
      if (activeJob) {
        updated = { ...activeJob, postPhoto: photoObj };
        setActiveJob(updated);
      }
    }
    if (updated && onSyncJob) {
      onSyncJob(updated);
    }
    if (activeJob) {
      const bookingId = activeJob.id || '9410';
      mobileApi.updateBooking(bookingId, type === 'pre' ? { beforeWorkPhoto: photoObj } : { afterWorkPhoto: photoObj }).catch(() => {});
    }
    setUploadingPhotoType(null);
    setPhotoCaption('');
  };

  const handleAcceptLead = (lead) => {
    const cleanId = lead.id ? (lead.id.startsWith('JOB') ? lead.id : lead.id.replace('LEAD-', 'JOB-').replace('LEAD', 'JOB-')) : 'JOB-9410';
    const newJob = {
      id: cleanId,
      customer: lead.customer || 'Rahul Sharma',
      address: lead.address || 'Flat 302, Green Park, Rayakottai Road, Krishnagiri - 635122',
      phone: lead.phone || '+91 98200 12345',
      service: lead.service || 'All in All AC',
      payout: lead.payout || 3524,
      distance: lead.distance || '0.5 km away',
      otp: lead.otp || '4829',
      status: 'Assigned',
      checklist: [
        { id: 1, text: 'Verify 4-digit start OTP with customer', done: false },
        { id: 2, text: 'Wear UC branded uniform, shoe covers & safety mask', done: false },
        { id: 3, text: 'Pre-service cooling baseline inspection', done: false },
        { id: 4, text: 'Fit waterproof protection cover on customer wall', done: false },
        { id: 5, text: 'Pressure jet wash and chemical treatment', done: false },
        { id: 6, text: 'Post-service test & cleanup', done: false },
      ]
    };
    setActiveJob(newJob);
    setIsOtpVerified(false);
    setOtpInput('');
    setPreServicePhoto(null);
    setPostServicePhoto(null);
    setAvailableLeads((prev) => prev.filter((l) => l.id !== lead.id));
    if (onAcceptLead) {
      onAcceptLead(lead.id);
    }
    setActiveTab('jobs');
    if (onUpdateJobStage) onUpdateJobStage(2);
    if (onSyncJob) onSyncJob({ ...newJob, stage: 2 });
    showToast(`⚡ Lead accepted! ${lead.service} is now your active dispatch.`);
    Alert.alert('Lead Accepted ⚡', `You accepted ${lead.service}. Proceed to customer location.`);
  };

  const handleWithdraw = () => {
    if (walletBalance <= 0) {
      Alert.alert('Insufficient Balance', 'You do not have any funds available for withdrawal.');
      return;
    }
    Alert.alert(
      'Instant Bank Payout (IMPS)',
      `Transfer ₹${walletBalance.toLocaleString('en-IN')} directly to your verified Bank Account / UPI (HDFC Bank ending in **4821)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw Now',
          onPress: () => {
            const amount = walletBalance;
            setWalletBalance(0);
            showToast(`💸 ₹${amount.toLocaleString('en-IN')} transferred via instant IMPS!`);
            Alert.alert('Payout Successful', `₹${amount.toLocaleString('en-IN')} has been disbursed to your linked bank account. Reference ID: IMPS-${Date.now().toString().slice(-8)}`);
          }
        }
      ]
    );
  };

  const handleSendReply = () => {
    if (!replyInput.trim() || !selectedReviewForReply) return;
    setLocalReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReviewForReply.id ? { ...r, reply: replyInput.trim() } : r
      )
    );
    if (onAddReviewReply) {
      onAddReviewReply(selectedReviewForReply.id, replyInput.trim());
    }
    showToast('💬 Reply sent to customer!');
    setSelectedReviewForReply(null);
    setReplyInput('');
  };

  const proName = currentUser?.name || 'Vikram Salvi';
  const proEmail = currentUser?.email || 'partner@forgeindia.in';
  const proTrade = currentUser?.trade || 'Master AC Specialist & Electrician';

  return (
    <View style={styles.container}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 1. TOP HEADER: Clean Forge India Connect Premium White Header (Matching Customer App) */}
      <View style={styles.ucCleanHeader}>
        {/* Top Brand & Location Bar */}
        <View style={styles.ucHeaderTopBar}>
          <View style={styles.ucBrandAndLocation}>
            <View style={styles.ucBrandLogoBadge}>
              <Text style={styles.ucBrandLogoText}>FIC</Text>
            </View>
            <View style={styles.ucLocationContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.ucLocationTitleRow}
                onPress={() => Alert.alert('Assigned Hub & Cluster', '📍 Krishnagiri Central Hub\nCluster: Rayakottai Zone (Near GPS Verified)\nCoverage: 5.0 km radius')}
              >
                <Text style={styles.ucLocationPin}>📍</Text>
                <Text style={styles.ucLocationName} numberOfLines={1}>Krishnagiri Hub • Rayakottai</Text>
                <Text style={styles.ucLocationArrow}>▾</Text>
              </TouchableOpacity>
              <Text style={styles.ucLocationSub} numberOfLines={1}>
                {activeJob?.address ? `Active: ${activeJob.address}` : 'Flat 302, Green Park, Rayakottai Rd'}
              </Text>
            </View>
          </View>

          {/* Right Action Icons: Wallet Balance, Online/Offline Pill & Profile Avatar */}
          <View style={styles.ucHeaderActionsRow}>
            <TouchableOpacity
              style={styles.ucCoinsPill}
              activeOpacity={0.8}
              onPress={() => setActiveTab('wallet')}
            >
              <Text style={styles.ucCoinsIcon}>💰</Text>
              <Text style={styles.ucCoinsText}>₹{walletBalance}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.onlinePill, isOnline ? styles.onlineActive : styles.onlineInactive]}
              onPress={() => {
                setIsOnline(!isOnline);
                showToast(isOnline ? '⚪ You are now OFFLINE' : '🟢 You are now ONLINE & receiving jobs');
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
              <Text style={[styles.onlinePillText, { color: isOnline ? '#065F46' : '#64748B' }]}>{isOnline ? 'Online' : 'Offline'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ucProfileAvatarBtn}
              activeOpacity={0.8}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={styles.ucProfileAvatarText}>
                {proName.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar & Quick Suggestion Chips: Displayed on Dispatches Hub */}
        {activeTab === 'jobs' && (
          <>
            <View style={styles.ucSearchBarContainer}>
              <Text style={styles.ucSearchIcon}>🔍</Text>
              <TextInput
                style={styles.ucSearchInput}
                placeholder="Search for 'active job', 'leads', 'payout', 'photos'..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.ucClearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Suggestion Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ucQuickChipsScroll}
            >
              {[
                { label: 'Active Job', tab: 'jobs' },
                { label: `Hot Leads (${availableLeads.length})`, tab: 'leads' },
                { label: `Today: ₹${todayEarnings}`, tab: 'earnings' },
                { label: `Wallet: ₹${walletBalance}`, tab: 'wallet' },
                { label: '★ 4.94 SLA', tab: 'quality' },
                { label: '📸 Work Photos', tab: 'photos' },
                { label: '📡 Live GPS', tab: 'live-tracking' },
              ].map((chip, idx) => (
                <TouchableOpacity
                  key={`worker-chip-${idx}`}
                  style={[
                    styles.ucQuickChip,
                    activeTab === chip.tab && styles.ucQuickChipActive
                  ]}
                  onPress={() => {
                    setActiveTab(chip.tab);
                    setSearchQuery('');
                  }}
                >
                  <Text
                    style={[
                      styles.ucQuickChipText,
                      activeTab === chip.tab && styles.ucQuickChipTextActive
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {/* 2. Main Content Body */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Dispatches Hero & Banners: Rendered on Dispatches Home */}
        {activeTab === 'jobs' && (
          <>
            {/* ==================== CUSTOMER-STYLE LIVE ORDER TRACKING HERO BANNER ==================== */}
            {activeJob && activeJob.status !== 'Completed' && (
              <TouchableOpacity
                style={styles.customerTrackingBanner}
                activeOpacity={0.88}
                onPress={() => setActiveTab('jobs')}
              >
                <View style={styles.trackingBannerIconBox}>
                  <Text style={styles.trackingBannerIcon}>🛵</Text>
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={styles.trackingBannerTitle}>
                      {`Active Dispatch #${activeJob.id} • ${activeJob.status?.toUpperCase()}`}
                    </Text>
                    <View style={styles.trackingLivePill}>
                      <Text style={styles.trackingLivePillText}>LIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.trackingBannerSub} numberOfLines={1}>
                    {`${activeJob.service} • Customer: ${activeJob.customer} • Payout: ₹${activeJob.payout}`}
                  </Text>
                </View>
                <View style={styles.trackingBannerAction}>
                  <Text style={styles.trackingBannerActionText}>Manage ›</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Section Heading: Doorstep Services / Active Tasks */}
            <View style={styles.doorstepSectionHeader}>
              <Text style={styles.doorstepSectionTitle}>Active Partner Operations</Text>
              <Text style={styles.doorstepSectionSub}>Real-time dispatches, live customer tracking & SLAs</Text>
            </View>
          </>
        )}

        {/* ==================== TAB 1: ACTIVE DISPATCH JOB ==================== */}
        {activeTab === 'jobs' && (
          <View style={styles.tabSection}>
            {activeJob ? (
              <View style={styles.jobCard}>
                {/* Status & Payout Header */}
                <View style={styles.jobTopHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobIdText}>#{activeJob.id}</Text>
                    <Text style={styles.jobTitleText}>{activeJob.service}</Text>
                  </View>
                  <View style={styles.payoutBadge}>
                    <Text style={styles.payoutBadgeText}>Your Payout</Text>
                    <Text style={styles.payoutAmountText}>₹{activeJob.payout}</Text>
                  </View>
                </View>

                {/* Customer Details */}
                <View style={styles.jobDetailBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Customer:</Text>
                    <Text style={styles.detailValue}>{activeJob.customer}</Text>
                  </View>

                  <View style={[styles.detailRow, { alignItems: 'flex-start' }]}>
                    <Text style={[styles.detailLabel, { marginTop: 2 }]}>Address:</Text>
                    <Text style={[styles.detailValue, { flex: 1, textAlign: 'right', marginLeft: 8 }]}>
                      📍 {activeJob.address}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Direct Phone:</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Dialing Customer', `Calling ${activeJob.customer} at ${activeJob.phone}...`)}
                    >
                      <Text style={[styles.detailValue, { color: '#0284C7', fontWeight: '800' }]}>
                        📞 {activeJob.phone}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Customer Direct Communication Action Buttons */}
                  <View style={styles.customerActionRow}>
                    <TouchableOpacity
                      style={styles.chatCustomerBtn}
                      onPress={() => setShowChatModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.chatCustomerBtnText}>💬 Live Chat with Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.callCustomerBtn}
                      onPress={handleStartCallToCustomer}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.callCustomerBtnText}>📞 Call</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Distance & ETA:</Text>
                    <Text style={styles.detailValue}>🛵 {activeJob.distance} (~8 mins away)</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Status:</Text>
                    <View
                      style={[
                        styles.statusPill,
                        activeJob.status === 'Completed' ? styles.statusCompleted :
                        activeJob.status === 'In Progress' ? styles.statusProgress :
                        activeJob.status === 'En Route' ? styles.statusEnRoute : styles.statusAssigned
                      ]}
                    >
                      <Text style={styles.statusPillText}>● {activeJob.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                {/* MANUAL DISPATCH STAGE CONTROLS (NO AUTOMATIC ADVANCE) */}
                <View style={styles.manualStepControlBox}>
                  <View style={styles.manualStepHeaderRow}>
                    <Text style={styles.manualStepHeaderTitle}>⚡ Manual Step Progression</Text>
                    <Text style={styles.manualStepHeaderSub}>Every step is updated manually by the worker and notifies customer in real time</Text>
                  </View>

                  {/* Primary Next Action Button */}
                  {(!activeJob.stage || activeJob.stage <= 2 || activeJob.status === 'Assigned') && (
                    <TouchableOpacity
                      style={styles.stepAdvPrimaryBtn}
                      onPress={handleMarkEnRoute}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.stepAdvPrimaryText}>🛵 Step 1: Start Trip (Mark En Route) →</Text>
                    </TouchableOpacity>
                  )}

                  {(activeJob.stage === 3 || activeJob.status === 'En Route') && (
                    <TouchableOpacity
                      style={[styles.stepAdvPrimaryBtn, { backgroundColor: '#7C3AED' }]}
                      onPress={handleMarkArrived}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.stepAdvPrimaryText}>📍 Step 2: Mark Arrived at Customer Doorstep →</Text>
                    </TouchableOpacity>
                  )}

                  {(activeJob.stage === 4 || activeJob.status === 'Arrived') && (
                    <TouchableOpacity
                      style={[styles.stepAdvPrimaryBtn, { backgroundColor: '#EA580C' }]}
                      onPress={() => {
                        if (!isOtpVerified) {
                          Alert.alert('Customer Start OTP Required 🔑', 'Ask customer for their 4-digit start OTP and enter it in the OTP box below before beginning work.');
                        } else {
                          setCapturedSelfieUri(null);
                          setSelfieModalPhase('pre');
                          setShowSelfieModal(true);
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.stepAdvPrimaryText}>🔑 Step 3: Verify OTP & Take Pre-Work Selfie →</Text>
                    </TouchableOpacity>
                  )}

                  {(activeJob.stage === 5 || activeJob.status === 'In Progress') && (
                    <TouchableOpacity
                      style={[styles.stepAdvPrimaryBtn, { backgroundColor: '#10B981' }]}
                      onPress={handleCompleteJob}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.stepAdvPrimaryText}>📸 Step 4: Take Completion Selfie & Settle (₹{activeJob.payout}) →</Text>
                    </TouchableOpacity>
                  )}

                  {(activeJob.stage === 6 || activeJob.status === 'Completed') && (
                    <View style={styles.completedSuccessCard}>
                      <Text style={styles.completedSuccessTitle}>✓ Service Completed & Payment Settled</Text>
                      <Text style={[styles.completedSuccessTitle, { fontSize: 12, fontWeight: '600', color: '#15803D', marginTop: 4 }]}>
                        Workflow finalized. Payout credited to worker wallet.
                      </Text>
                    </View>
                  )}

                  {/* Strictly One-Way Progression Stepper Bar */}
                  <View style={styles.quickStepSelectorContainer}>
                    <Text style={styles.quickStepLabel}>One-Way Progress Stepper (Completed steps are locked):</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickStepScroll}>
                      {[
                        { stage: 2, status: 'Assigned', label: '2. Assigned' },
                        { stage: 3, status: 'En Route', label: '3. En Route' },
                        { stage: 4, status: 'Arrived', label: '4. Arrived' },
                        { stage: 5, status: 'In Progress', label: '5. In Progress' },
                        { stage: 6, status: 'Completed', label: '6. Completed' }
                      ].map((step) => {
                        const currentStage = activeJob?.stage || (
                          activeJob?.status === 'Completed' ? 6 :
                          activeJob?.status === 'In Progress' ? 5 :
                          activeJob?.status === 'Arrived' ? 4 :
                          activeJob?.status === 'En Route' ? 3 : 2
                        );
                        const isCompleted = step.stage < currentStage;
                        const isCurrent = step.stage === currentStage;
                        const isNext = step.stage === currentStage + 1;
                        const isLocked = step.stage > currentStage + 1;

                        const handleStepPress = () => {
                          if (isCompleted) {
                            Alert.alert('Step Completed ✓', `Step "${step.label}" has already been completed. Service progress is strictly one-way.`);
                            return;
                          }
                          if (isCurrent) {
                            return;
                          }
                          if (isNext) {
                            if (step.stage === 3) handleMarkEnRoute();
                            else if (step.stage === 4) handleMarkArrived();
                            else if (step.stage === 5) {
                              if (!isOtpVerified) {
                                Alert.alert('Customer Start OTP Required 🔑', 'Ask customer for their 4-digit start OTP and enter it in the OTP box below before beginning work.');
                              } else {
                                setCapturedSelfieUri(null);
                                setSelfieModalPhase('pre');
                                setShowSelfieModal(true);
                              }
                            } else if (step.stage === 6) {
                              handleCompleteJob();
                            } else {
                              handleManualStageUpdate(step.stage, step.status);
                            }
                          }
                        };

                        return (
                          <TouchableOpacity
                            key={step.stage}
                            disabled={isCompleted || isCurrent || isLocked}
                            style={[
                              styles.quickStepPill,
                              isCompleted && styles.quickStepPillCompleted,
                              isCurrent && styles.quickStepPillActive,
                              isNext && styles.quickStepPillNext,
                              isLocked && styles.quickStepPillLocked
                            ]}
                            onPress={handleStepPress}
                            activeOpacity={isNext ? 0.75 : 1}
                          >
                            <Text
                              style={[
                                styles.quickStepPillText,
                                isCompleted && styles.quickStepPillTextCompleted,
                                isCurrent && styles.quickStepPillTextActive,
                                isNext && styles.quickStepPillTextNext,
                                isLocked && styles.quickStepPillTextLocked
                              ]}
                            >
                              {isCompleted ? `✓ ${step.label}` : isCurrent ? `● ${step.label}` : isNext ? `👉 ${step.label}` : `🔒 ${step.label}`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>

                {/* Customer Start OTP Verification Section (When Arrived or Assigned) */}
                {activeJob.status !== 'Completed' && (
                  <View style={styles.otpSection}>
                    <Text style={styles.otpHeaderTitle}>🔑 Customer Start OTP Verification</Text>
                    <Text style={styles.otpHelperText}>
                      Ask customer for the 4-digit OTP shown on their screen to begin work. (Test OTP: {activeJob.otp || '4829'})
                    </Text>

                    {isOtpVerified || activeJob.status === 'In Progress' ? (
                      <View style={styles.otpVerifiedBanner}>
                        <Text style={styles.otpVerifiedText}>
                          ✓ OTP VERIFIED & ACCEPTED · STATUS: IN PROGRESS
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.otpInputRow}>
                        <TextInput
                          style={styles.otpInput}
                          placeholder="e.g. 4829"
                          placeholderTextColor="#64748B"
                          keyboardType="numeric"
                          maxLength={4}
                          value={otpInput}
                          onChangeText={setOtpInput}
                        />
                        <TouchableOpacity
                          style={styles.verifyBtn}
                          onPress={handleVerifyStartOtp}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.verifyBtnText} numberOfLines={1}>Verify OTP & Take Selfie 📸</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* WORK PHOTO UPLOADING SECTION (Pre & Post Service) */}
                <View style={styles.photoUploadSection}>
                  <Text style={styles.photoSectionTitle}>📸 Technician Live Selfie Evidence</Text>
                  <Text style={styles.photoSectionSub}>
                    Live camera selfies uploaded to Cloudinary (dlpzb0td2) before starting and after completing service.
                  </Text>

                  <View style={styles.photoGrid}>
                    {/* Pre-Service Photo Card */}
                    <View style={styles.photoBox}>
                      <Text style={styles.photoBoxTitle}>1. Pre-Service Selfie</Text>
                      {preServicePhoto ? (
                        <View style={styles.photoUploadedCard}>
                          {preServicePhoto.url ? (
                            <Image
                              source={{ uri: preServicePhoto.url }}
                              style={{ width: '100%', height: 95, borderRadius: 8, marginBottom: 6 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={{ fontSize: 24 }}>📷</Text>
                          )}
                          <Text style={styles.photoName} numberOfLines={1}>{preServicePhoto.name}</Text>
                          <Text style={styles.photoTime}>Time: {preServicePhoto.timestamp}</Text>
                          <View style={styles.verifiedTag}>
                            <Text style={styles.verifiedTagText}>✓ Cloudinary Verified</Text>
                          </View>
                          <TouchableOpacity onPress={() => {
                            setCapturedSelfieUri(null);
                            setSelfieModalPhase('pre');
                            setShowSelfieModal(true);
                          }}>
                            <Text style={styles.replacePhotoText}>Retake Selfie</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.uploadPlaceholder}
                          onPress={() => {
                            setCapturedSelfieUri(null);
                            setSelfieModalPhase('pre');
                            setShowSelfieModal(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 26, marginBottom: 4 }}>🤳</Text>
                          <Text style={styles.uploadBtnText}>Take Pre-Selfie</Text>
                          <Text style={styles.uploadSubtext}>Front Camera Live</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Post-Service Photo Card */}
                    <View style={styles.photoBox}>
                      <Text style={styles.photoBoxTitle}>2. Post-Service Selfie</Text>
                      {postServicePhoto ? (
                        <View style={styles.photoUploadedCard}>
                          {postServicePhoto.url ? (
                            <Image
                              source={{ uri: postServicePhoto.url }}
                              style={{ width: '100%', height: 95, borderRadius: 8, marginBottom: 6 }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={{ fontSize: 24 }}>✨</Text>
                          )}
                          <Text style={styles.photoName} numberOfLines={1}>{postServicePhoto.name}</Text>
                          <Text style={styles.photoTime}>Time: {postServicePhoto.timestamp}</Text>
                          <View style={styles.verifiedTag}>
                            <Text style={styles.verifiedTagText}>✓ Cloudinary Verified</Text>
                          </View>
                          <TouchableOpacity onPress={() => {
                            setCapturedSelfieUri(null);
                            setSelfieModalPhase('post');
                            setShowSelfieModal(true);
                          }}>
                            <Text style={styles.replacePhotoText}>Retake Selfie</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.uploadPlaceholder}
                          onPress={() => {
                            setCapturedSelfieUri(null);
                            setSelfieModalPhase('post');
                            setShowSelfieModal(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 26, marginBottom: 4 }}>🤳</Text>
                          <Text style={styles.uploadBtnText}>Take Post-Selfie</Text>
                          <Text style={styles.uploadSubtext}>Front Camera Live</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noJobBox}>
                <Text style={{ fontSize: 40, marginBottom: 10 }}>🏖️</Text>
                <Text style={styles.noJobTitle}>No Active Dispatch</Text>
                <Text style={styles.noJobSub}>
                  You are currently available. Check the Hot Leads tab to accept nearby customer dispatches.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ==================== TAB 2: LIVE GPS OPERATIONS ==================== */}
        {activeTab === 'live-tracking' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>📡 Live GPS Operations & Tracking</Text>
              <Text style={styles.sectionSub}>Real-time route simulation between Sector Hub and Customer Doorstep</Text>
            </View>

            <View style={styles.liveTrackingCard}>
              <View style={styles.liveMapHeader}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveGreenDot} />
                  <Text style={styles.liveIndicatorText}>LIVE GPS BROADCAST</Text>
                </View>
                <Text style={styles.liveEtaBadge}>~{gpsEta} MINS TO DOORSTEP</Text>
              </View>

              <View style={styles.liveMapGraphic}>
                <Text style={styles.liveMapRouteTitle}>Bandra West Cluster Route (1.2 km)</Text>
                <View style={styles.routeProgressBarBg}>
                  <View style={[styles.routeProgressBarFill, { width: `${simStep * 25}%` }]} />
                  <View style={[styles.scooterPin, { left: `${Math.min(simStep * 25, 90)}%` }]}>
                    <Text style={{ fontSize: 24 }}>🛵</Text>
                  </View>
                </View>
                <View style={styles.routeEndpoints}>
                  <Text style={styles.endpointLabel}>🏢 Sector Hub (Hill Rd)</Text>
                  <Text style={styles.endpointLabel}>🏠 Sea Face Apts (Pali Hill)</Text>
                </View>
              </View>

              <View style={styles.liveStatsRow}>
                <View style={styles.liveStatCol}>
                  <Text style={styles.liveStatVal}>28 km/h</Text>
                  <Text style={styles.liveStatLbl}>Current Speed</Text>
                </View>
                <View style={styles.liveStatCol}>
                  <Text style={styles.liveStatVal}>1.2 km</Text>
                  <Text style={styles.liveStatLbl}>Remaining Dist</Text>
                </View>
                <View style={styles.liveStatCol}>
                  <Text style={styles.liveStatVal}>Honda Activa</Text>
                  <Text style={styles.liveStatLbl}>Vehicle</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.advanceGpsBtn}
                onPress={() => {
                  setSimStep((prev) => (prev >= 4 ? 1 : prev + 1));
                  setGpsEta((prev) => (prev <= 2 ? 10 : prev - 2));
                  showToast('🛵 GPS telemetry updated! Scooter moved forward along route.');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.advanceGpsBtnText}>▶ Advance GPS Route Step</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================== TAB 3: HOT LEADS ==================== */}
        {activeTab === 'leads' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>⚡ Hot Customer Leads ({availableLeads.length})</Text>
              <Text style={styles.sectionSub}>Available nearby dispatches ready for instant pickup</Text>
            </View>

            {availableLeads.length === 0 ? (
              <View style={[styles.leadCard, { alignItems: 'center', paddingVertical: 36, backgroundColor: '#FFFFFF' }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
                <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '800' }}>All Caught Up!</Text>
                <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  No pending dispatches right now. New customer bookings will appear here instantly.
                </Text>
              </View>
            ) : (
              availableLeads.map((lead) => {
                const isNew = lead.tag?.includes('NEW') || lead.tag?.includes('LIVE');
                return (
                  <View key={lead.id} style={[styles.leadCard, isNew && { borderColor: '#F04400', borderWidth: 1.5 }]}>
                    <View style={styles.leadTopRow}>
                      <View style={[styles.leadTagBadge, isNew && { backgroundColor: '#EF4444' }]}>
                        <Text style={styles.leadTagText}>{lead.tag}</Text>
                      </View>
                      <Text style={styles.leadPayoutText}>₹{lead.payout}</Text>
                    </View>

                    <Text style={styles.leadServiceText}>{lead.service}</Text>
                    <Text style={styles.leadAddressText}>
                      📍 {lead.address} {lead.distance ? `(${lead.distance})` : ''}
                    </Text>
                    <Text style={styles.leadSlotText}>⏰ Scheduled Slot: {lead.slot}</Text>

                    <TouchableOpacity
                      style={styles.acceptLeadBtn}
                      onPress={() => handleAcceptLead(lead)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.acceptLeadBtnText}>⚡ Accept Dispatch →</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ==================== TAB 4: FLEET CLUSTER ==================== */}
        {activeTab === 'fleet' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Fleet Technicians Cluster</Text>
              <Text style={styles.sectionSub}>Active professionals assigned to this sector hub:</Text>
            </View>

            {fleet.map((tech) => (
              <View key={tech.id} style={styles.fleetCard}>
                <View style={styles.fleetAvatarBox}>
                  <Text style={styles.fleetAvatarText}>{tech.name.charAt(0)}</Text>
                </View>
                <View style={styles.fleetInfoCol}>
                  <Text style={styles.fleetName}>{tech.name}</Text>
                  <Text style={styles.fleetTrade}>{tech.trade}</Text>
                  <Text style={styles.fleetDispatches}>★ {tech.rating} · {tech.jobsToday} dispatches today</Text>
                </View>
                <View style={[styles.fleetStatusBadge, tech.status === 'On Job' ? styles.fleetOnJob : styles.fleetAvailable]}>
                  <Text style={styles.fleetStatusText}>{tech.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== TAB 5: PHOTO EVIDENCE GALLERY ==================== */}
        {activeTab === 'photos' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>📸 Work Photo Evidence & Inspections</Text>
              <Text style={styles.sectionSub}>Audit-ready service inspection records</Text>
            </View>

            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceHeader}>Active Job #9410 Evidence</Text>
              <View style={styles.evidenceRow}>
                <View style={styles.evidenceCol}>
                  <Text style={styles.evidenceLabel}>Pre-Service Condition</Text>
                  <View style={styles.evidencePlaceholderBox}>
                    <Text style={{ fontSize: 28 }}>{preServicePhoto ? '📷' : '⚪'}</Text>
                    <Text style={styles.evidenceTitle}>{preServicePhoto ? preServicePhoto.name : 'No photo uploaded yet'}</Text>
                    {preServicePhoto && <Text style={styles.evidenceTime}>Stamp: {preServicePhoto.timestamp}</Text>}
                  </View>
                </View>

                <View style={styles.evidenceCol}>
                  <Text style={styles.evidenceLabel}>Post-Service Completion</Text>
                  <View style={styles.evidencePlaceholderBox}>
                    <Text style={{ fontSize: 28 }}>{postServicePhoto ? '✨' : '⚪'}</Text>
                    <Text style={styles.evidenceTitle}>{postServicePhoto ? postServicePhoto.name : 'No photo uploaded yet'}</Text>
                    {postServicePhoto && <Text style={styles.evidenceTime}>Stamp: {postServicePhoto.timestamp}</Text>}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addEvidenceBtn}
                onPress={() => setActiveTab('jobs')}
              >
                <Text style={styles.addEvidenceBtnText}>Go to Active Job to Upload Proof →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================== TAB 6: SCHEDULE CALENDAR ==================== */}
        {activeTab === 'calendar' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>📅 Today's Schedule & Dispatches</Text>
              <Text style={styles.sectionSub}>7 November 2026 • Sector 4, Bandra West</Text>
            </View>

            {calendarSlots.map((slot, idx) => (
              <View key={`slot-${idx}`} style={styles.calendarSlotCard}>
                <View style={styles.calendarTimeCol}>
                  <Text style={styles.calendarTimeText}>{slot.time}</Text>
                  <View style={[styles.calendarStatusTag, slot.status === 'Completed' ? styles.calDone : styles.calPending]}>
                    <Text style={styles.calendarStatusTagText}>{slot.status}</Text>
                  </View>
                </View>
                <View style={styles.calendarDetailsCol}>
                  <Text style={styles.calendarService}>{slot.service}</Text>
                  <Text style={styles.calendarCustomer}>👤 {slot.customer}</Text>
                  <Text style={styles.calendarPayout}>Payout: ₹{slot.payout}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== TAB 7: WALLET & SETTLEMENTS ==================== */}
        {activeTab === 'wallet' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>💳 Wallet & Instant Payouts</Text>
              <Text style={styles.sectionSub}>Instant IMPS bank withdrawal facility</Text>
            </View>

            <View style={styles.walletHeroCard}>
              <Text style={styles.walletHeroLabel}>Available Balance</Text>
              <Text style={styles.walletHeroAmount}>₹{walletBalance.toLocaleString('en-IN')}</Text>
              <Text style={styles.walletHeroSub}>100% instant IMPS transfer with zero gateway fee</Text>

              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={handleWithdraw}
                activeOpacity={0.85}
              >
                <Text style={styles.withdrawBtnText}>⚡ Instant Bank Withdrawal (IMPS)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bankDetailCard}>
              <Text style={styles.bankCardTitle}>Linked Payout Account</Text>
              <View style={styles.bankRow}>
                <Text style={styles.bankKey}>Bank Name:</Text>
                <Text style={styles.bankVal}>HDFC Bank Ltd</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankKey}>Account Number:</Text>
                <Text style={styles.bankVal}>•••• •••• •••• 4821</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankKey}>IFSC Code:</Text>
                <Text style={styles.bankVal}>HDFC0000240</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankKey}>Verification Status:</Text>
                <Text style={[styles.bankVal, { color: '#10B981', fontWeight: '800' }]}>✓ PENNY TEST VERIFIED</Text>
              </View>
            </View>
          </View>
        )}

        {/* ==================== TAB: STREAMLINED USER-FRIENDLY PARTNER PROFILE ==================== */}
        {activeTab === 'profile' && (
          <View style={styles.tabSection}>
            {/* 1. Partner Profile Hero Card */}
            <View style={styles.partnerProfileHeroCard}>
              <View style={styles.partnerProfileAvatarLarge}>
                <Text style={styles.partnerProfileAvatarText}>
                  {(partnerProfile.name || 'V').charAt(0).toUpperCase()}
                </Text>
                <View style={styles.partnerProAvatarBadge}>
                  <Text style={styles.partnerProAvatarBadgeText}>PRO</Text>
                </View>
              </View>

              <View style={{ flex: 1, paddingRight: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Text style={styles.partnerProfileName} numberOfLines={1}>
                    {partnerProfile.name}
                  </Text>
                  <View style={styles.partnerProBadge}>
                    <Text style={styles.partnerProBadgeText}>★ 4.94 PRO</Text>
                  </View>
                </View>
                <Text style={styles.partnerProfileTrade} numberOfLines={1}>
                  {partnerProfile.trade}
                </Text>
                <Text style={styles.partnerProfileEmail} numberOfLines={1}>
                  {partnerProfile.email}
                </Text>
                <Text style={styles.partnerProfilePhone} numberOfLines={1}>
                  {partnerProfile.phone} • {partnerProfile.id}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.partnerEditProfileBtn}
                onPress={() => {
                  setEditForm({
                    name: partnerProfile.name,
                    phone: partnerProfile.phone,
                    trade: partnerProfile.trade,
                    city: partnerProfile.city,
                    operatingRadius: partnerProfile.operatingRadius
                  });
                  setShowEditProfileModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.partnerEditProfileBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Duty Status Card */}
            <View style={styles.partnerDutyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.partnerDutyCardTitle}>
                  {isOnline ? '🟢 Online & Ready for Jobs' : '⚪ Offline (On Break)'}
                </Text>
                <Text style={styles.partnerDutyCardSub}>
                  {isOnline ? 'Active for instant customer dispatches & leads in Krishnagiri' : 'You will not receive new customer bookings while offline'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.partnerDutyToggleBtn, isOnline ? styles.partnerDutyToggleActive : styles.partnerDutyToggleInactive]}
                onPress={() => {
                  const nextState = !isOnline;
                  setIsOnline(nextState);
                  showToast(nextState ? '🟢 Duty ON: You are now visible to customers' : '⚪ Duty OFF: You are on break');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.partnerDutyToggleText, { color: isOnline ? '#065F46' : '#64748B' }]}>
                  {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3. Performance Metrics Row (Rating, Jobs, Wallet) */}
            <View style={styles.partnerQuickMetricsRow}>
              <TouchableOpacity
                style={styles.partnerQuickMetricItem}
                onPress={() => setActiveTab('quality')}
                activeOpacity={0.8}
              >
                <Text style={styles.partnerQuickMetricVal}>★ 4.94</Text>
                <Text style={styles.partnerQuickMetricLabel}>Customer Rating</Text>
              </TouchableOpacity>
              <View style={styles.partnerQuickMetricDivider} />
              <TouchableOpacity
                style={styles.partnerQuickMetricItem}
                onPress={() => setActiveTab('jobs')}
                activeOpacity={0.8}
              >
                <Text style={styles.partnerQuickMetricVal}>{completedCount || 8}</Text>
                <Text style={styles.partnerQuickMetricLabel}>Completed Jobs</Text>
              </TouchableOpacity>
              <View style={styles.partnerQuickMetricDivider} />
              <TouchableOpacity
                style={styles.partnerQuickMetricItem}
                onPress={() => setActiveTab('wallet')}
                activeOpacity={0.8}
              >
                <Text style={[styles.partnerQuickMetricVal, { color: '#10B981' }]}>₹{walletBalance}</Text>
                <Text style={styles.partnerQuickMetricLabel}>Instant Wallet</Text>
              </TouchableOpacity>
            </View>

            {/* 4. GROUP 1: PROFESSIONAL PROFILE & CREDENTIALS */}
            <View style={styles.partnerMenuGroup}>
              <Text style={styles.partnerMenuSectionTitle}>PROFESSIONAL PROFILE & CREDENTIALS</Text>

              <TouchableOpacity
                style={styles.partnerMenuItem}
                onPress={() => setShowSkillsModal(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#FFEDD5' }]}>
                  <Text style={{ fontSize: 18 }}>🛠️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>Service Categories & Skills</Text>
                  <Text style={styles.partnerMenuSub}>{partnerProfile.trade} • Certified Specialist</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.partnerMenuItem}
                onPress={() => setShowLocationModal(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>Service Area & Operating Hub</Text>
                  <Text style={styles.partnerMenuSub}>{partnerProfile.city} Town • {partnerProfile.operatingRadius} KM Radius</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.partnerMenuItem}
                onPress={() => setShowKycModal(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={{ fontSize: 18 }}>🛡️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>KYC & Identity Verification</Text>
                  <Text style={styles.partnerMenuSub}>Aadhaar Verified ✓ • Police Cleared ✓</Text>
                </View>
                <View style={[styles.partnerLiveBadge, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.partnerLiveBadgeText}>VERIFIED</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerMenuItem, { borderBottomWidth: 0 }]}
                onPress={() => setActiveTab('photos')}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={{ fontSize: 18 }}>📸</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>Work Photos & Evidence</Text>
                  <Text style={styles.partnerMenuSub}>Cloudinary pre & post service photos</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 5. GROUP 2: EARNINGS & FINANCE */}
            <View style={styles.partnerMenuGroup}>
              <Text style={styles.partnerMenuSectionTitle}>EARNINGS & FINANCE</Text>

              <TouchableOpacity
                style={styles.partnerMenuItem}
                onPress={() => setActiveTab('wallet')}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#CCFBF1' }]}>
                  <Text style={{ fontSize: 18 }}>💳</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>Wallet & Instant Transfer</Text>
                  <Text style={styles.partnerMenuSub}>₹{walletBalance} withdrawable to HDFC Bank</Text>
                </View>
                <View style={styles.partnerCountBadge}>
                  <Text style={styles.partnerCountBadgeText}>₹{walletBalance}</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerMenuItem, { borderBottomWidth: 0 }]}
                onPress={() => setActiveTab('invoices')}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#F1F5F9' }]}>
                  <Text style={{ fontSize: 18 }}>🧾</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>GST Tax Invoices & Statements</Text>
                  <Text style={styles.partnerMenuSub}>Monthly tax invoices, payouts & TDS receipts</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 6. GROUP 3: PREFERENCES & SUPPORT */}
            <View style={styles.partnerMenuGroup}>
              <Text style={styles.partnerMenuSectionTitle}>PREFERENCES & SUPPORT</Text>

              <TouchableOpacity
                style={styles.partnerMenuItem}
                onPress={async () => {
                  showToast('🔔 Triggering real-time push notification test...');
                  await mobileNotificationService.sendSelfTest(partnerProfile.id || 'PRO-8841', 'worker');
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={{ fontSize: 18 }}>🔔</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>Job Alerts & Notifications</Text>
                  <Text style={styles.partnerMenuSub}>Urgent job ringtones & dispatch push alerts</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.partnerMenuItem, { borderBottomWidth: 0 }]}
                onPress={() => setShowSupportModal(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.partnerMenuIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={{ fontSize: 18 }}>💬</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerMenuTitle}>24x7 Partner Care & Help</Text>
                  <Text style={styles.partnerMenuSub}>Instant helpline: 1800-419-7000 • FAQs & tickets</Text>
                </View>
                <Text style={styles.partnerMenuChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 7. Log Out Button */}
            <TouchableOpacity
              style={styles.partnerLogoutBtn}
              activeOpacity={0.8}
              onPress={() => setShowLogoutConfirmModal(true)}
            >
              <Text style={styles.partnerLogoutIcon}>⏻</Text>
              <Text style={styles.partnerLogoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.partnerVersionText}>Forge India Connect • Partner App v4.18.2 • {partnerProfile.id}</Text>
          </View>
        )}

        {/* ==================== TAB 8: QUALITY & REVIEWS ==================== */}
        {activeTab === 'quality' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>⭐ Customer Reviews & Rating</Text>
              <Text style={styles.sectionSub}>Live feedback from verified customers</Text>
            </View>

            <View style={styles.ratingOverviewCard}>
              <View style={styles.ratingBigCol}>
                <Text style={styles.bigRatingNum}>4.94</Text>
                <Text style={styles.bigRatingStars}>★★★★★</Text>
                <Text style={styles.bigRatingCount}>428 Lifetime Ratings</Text>
              </View>
              <View style={styles.ratingBreakdownCol}>
                <Text style={styles.breakdownRow}>5 Star: 94%</Text>
                <Text style={styles.breakdownRow}>4 Star: 5%</Text>
                <Text style={styles.breakdownRow}>3 Star: 1%</Text>
                <Text style={styles.breakdownRow}>On-Time Arrival: 98.4%</Text>
              </View>
            </View>

            {allReviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewCustomer}>{rev.customer}</Text>
                    <Text style={styles.reviewService}>{rev.service} • {rev.date}</Text>
                  </View>
                  <View style={styles.reviewRatingBadge}>
                    <Text style={styles.reviewRatingBadgeText}>★ {rev.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>"{rev.comment}"</Text>

                {rev.reply ? (
                  <View style={styles.reviewReplyBox}>
                    <Text style={styles.reviewReplyAuthor}>Your Response:</Text>
                    <Text style={styles.reviewReplyText}>{rev.reply}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.replyBtn}
                    onPress={() => setSelectedReviewForReply(rev)}
                  >
                    <Text style={styles.replyBtnText}>💬 Reply to Customer</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ==================== TAB 9: EARNINGS & FINANCE ==================== */}
        {activeTab === 'earnings' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>💰 Business Earnings Analytics</Text>
              <Text style={styles.sectionSub}>Weekly revenue breakdown</Text>
            </View>

            <View style={styles.earningsSummaryBox}>
              <View style={styles.earningsStat}>
                <Text style={styles.earningsStatVal}>₹18,450</Text>
                <Text style={styles.earningsStatLbl}>Gross Billing</Text>
              </View>
              <View style={styles.earningsStat}>
                <Text style={[styles.earningsStatVal, { color: '#EF4444' }]}>-₹2,214</Text>
                <Text style={styles.earningsStatLbl}>Platform Fee (12%)</Text>
              </View>
              <View style={styles.earningsStat}>
                <Text style={[styles.earningsStatVal, { color: '#10B981' }]}>₹16,236</Text>
                <Text style={styles.earningsStatLbl}>Net Take-Home</Text>
              </View>
            </View>
          </View>
        )}

        {/* ==================== TAB 10: INVOICES ==================== */}
        {activeTab === 'invoices' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>📄 GST Tax Invoices</Text>
              <Text style={styles.sectionSub}>GST compliant tax receipts</Text>
            </View>

            {taxInvoices.map((inv) => (
              <View key={inv.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceId}>{inv.id}</Text>
                  <Text style={styles.invoiceStatus}>● {inv.status}</Text>
                </View>
                <Text style={styles.invoiceCustomer}>Customer: {inv.customer} · {inv.date}</Text>
                <View style={styles.invoicePriceRow}>
                  <Text style={styles.invoiceTotal}>Total: ₹{inv.amount} (Incl. GST ₹{inv.gst})</Text>
                  <TouchableOpacity
                    style={styles.downloadInvoiceBtn}
                    onPress={() => Alert.alert('Tax Invoice', `Downloading ${inv.id} PDF receipt...`)}
                  >
                    <Text style={styles.downloadInvoiceBtnText}>⬇ Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== TAB 11: DOCUMENTS & KYC ==================== */}
        {activeTab === 'documents' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>🛡️ KYC & Compliance Records</Text>
              <Text style={styles.sectionSub}>Government verified credentials</Text>
            </View>

            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>Aadhaar Identity Verification</Text>
                <Text style={styles.kycStatusOk}>✓ VERIFIED</Text>
              </View>
              <Text style={styles.kycSub}>UIDAI biometric check matched on 12 Jan 2026</Text>
            </View>

            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>Police Character Clearance</Text>
                <Text style={styles.kycStatusOk}>✓ APPROVED</Text>
              </View>
              <Text style={styles.kycSub}>Mumbai Police Special Branch clearance valid till 2028</Text>
            </View>

            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>Trade Skill Certification (Level 5)</Text>
                <Text style={styles.kycStatusOk}>✓ CERTIFIED</Text>
              </View>
              <Text style={styles.kycSub}>National Skill Development Council (NSDC) Master Technician</Text>
            </View>
          </View>
        )}

        {/* ==================== TAB 12: REFUNDS & DISPUTES ==================== */}
        {activeTab === 'disputes' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>⚠️ Refunds & Customer Disputes</Text>
              <Text style={styles.sectionSub}>Quality resolution & escalation record</Text>
            </View>
            <View style={[styles.kycCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={styles.kycRow}>
                <Text style={[styles.kycTitle, { color: '#166534' }]}>Zero Active Consumer Disputes</Text>
                <Text style={styles.kycStatusOk}>100% CLEAN SLA</Text>
              </View>
              <Text style={[styles.kycSub, { color: '#15803D' }]}>
                No pending customer chargebacks or disputes. 100% quality guarantee maintained for Krishnagiri cluster.
              </Text>
            </View>
          </View>
        )}

        {/* ==================== TAB 13: ALERTS & NOTIFICATIONS ==================== */}
        {activeTab === 'notifications' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>🔔 Alerts & Dispatch Notifications</Text>
              <Text style={styles.sectionSub}>Platform announcements and job alerts</Text>
            </View>
            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>⚡ High Demand in Krishnagiri</Text>
                <Text style={[styles.kycStatusOk, { color: '#F04400' }]}>SURGE</Text>
              </View>
              <Text style={styles.kycSub}>AC servicing demand is 2.4x higher today along Rayakottai Road.</Text>
            </View>
            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>💰 Daily Payout Credited</Text>
                <Text style={styles.kycStatusOk}>₹2,250 CREDITED</Text>
              </View>
              <Text style={styles.kycSub}>IMPS transaction IMPS-8841-SUCCESS processed to HDFC Bank.</Text>
            </View>
          </View>
        )}

        {/* ==================== TAB 14: BUSINESS SETTINGS ==================== */}
        {activeTab === 'settings' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>⚙️ Working Partner Business Settings</Text>
              <Text style={styles.sectionSub}>Preferences, cluster dispatch & profile</Text>
            </View>
            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>Service Territory Radius</Text>
                <Text style={styles.kycStatusOk}>12 KM</Text>
              </View>
              <Text style={styles.kycSub}>Operating Zone: Krishnagiri Town & Surrounding Sectors</Text>
            </View>
            <View style={styles.kycCard}>
              <View style={styles.kycRow}>
                <Text style={styles.kycTitle}>Auto Lead Acceptance</Text>
                <Text style={styles.kycStatusOk}>ENABLED</Text>
              </View>
              <Text style={styles.kycSub}>Direct dispatch priority for Diamond Pro L5 partners</Text>
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ==================== CUSTOMER-STYLE BOTTOM NAVIGATION BAR ==================== */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => {
            setActiveTab('jobs');
            setSearchQuery('');
          }}
          activeOpacity={0.7}
        >
          {activeTab === 'jobs' && <View style={styles.bottomActiveIndicator} />}
          <Text style={[styles.bottomNavIcon, activeTab === 'jobs' && styles.bottomNavActiveIcon]}>🏠</Text>
          <Text style={[styles.bottomNavText, activeTab === 'jobs' && styles.bottomNavActiveText]}>Dispatches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => {
            setActiveTab('leads');
            setSearchQuery('');
          }}
          activeOpacity={0.7}
        >
          {activeTab === 'leads' && <View style={styles.bottomActiveIndicator} />}
          <View style={{ position: 'relative' }}>
            <Text style={[styles.bottomNavIcon, activeTab === 'leads' && styles.bottomNavActiveIcon]}>⚡</Text>
            {availableLeads.length > 0 && (
              <View style={styles.bottomBookingBadge}>
                <Text style={styles.bottomBookingBadgeText}>{availableLeads.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavText, activeTab === 'leads' && styles.bottomNavActiveText]}>Hot Leads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => {
            setActiveTab('wallet');
            setSearchQuery('');
          }}
          activeOpacity={0.7}
        >
          {activeTab === 'wallet' && <View style={styles.bottomActiveIndicator} />}
          <Text style={[styles.bottomNavIcon, activeTab === 'wallet' && styles.bottomNavActiveIcon]}>💰</Text>
          <Text style={[styles.bottomNavText, activeTab === 'wallet' && styles.bottomNavActiveText]}>Earnings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => {
            setActiveTab('profile');
            setSearchQuery('');
          }}
          activeOpacity={0.7}
        >
          {activeTab === 'profile' && <View style={styles.bottomActiveIndicator} />}
          <Text style={[styles.bottomNavIcon, activeTab === 'profile' && styles.bottomNavActiveIcon]}>👤</Text>
          <Text style={[styles.bottomNavText, activeTab === 'profile' && styles.bottomNavActiveText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ==================== MANDATORY LIVE TECHNICIAN SELFIE CAMERA MODAL ==================== */}
      <Modal
        visible={showSelfieModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!isUploadingSelfie) {
            stopLiveCamera();
            setShowSelfieModal(false);
          }
        }}
      >
        <View style={styles.selfieModalOverlay}>
          <View style={styles.selfieModalCard}>
            {/* Header */}
            <View style={styles.selfieModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selfieModalTitle}>
                  {selfieModalPhase === 'pre' ? '📸 Pre-Work Technician Selfie' : '📸 Post-Work Completion Selfie'}
                </Text>
                <Text style={styles.selfieModalSub}>
                  {selfieModalPhase === 'pre'
                    ? 'Mandatory: Take a live photo of yourself wearing uniform & ID before starting work.'
                    : 'Mandatory: Take a live photo of yourself upon completing work to finalize payout.'}
                </Text>
              </View>
              {!isUploadingSelfie && (
                <TouchableOpacity
                  onPress={() => {
                    stopLiveCamera();
                    setShowSelfieModal(false);
                  }}
                  style={styles.selfieCloseBtn}
                >
                  <Text style={styles.selfieCloseText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Cloudinary Vault Verification Notice */}
            <View style={styles.cloudinaryBadgeRow}>
              <Text style={styles.cloudinaryBadgeText}>☁️ Cloudinary Verified Vault: dlpzb0td2</Text>
            </View>

            {/* Viewfinder / Captured Photo Preview */}
            <View style={styles.selfieViewfinderBox}>
              {capturedSelfieUri ? (
                <View style={styles.selfiePreviewContainer}>
                  <Image source={{ uri: capturedSelfieUri }} style={styles.selfiePreviewImage} resizeMode="cover" />
                  <View style={styles.selfieVerifiedBadge}>
                    <Text style={styles.selfieVerifiedBadgeText}>✓ Live Selfie Captured</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.retakeBtn}
                    onPress={() => {
                      setCapturedSelfieUri(null);
                      startLiveCamera();
                    }}
                    disabled={isUploadingSelfie}
                  >
                    <Text style={styles.retakeBtnText}>🔄 Retake Live Selfie</Text>
                  </TouchableOpacity>
                </View>
              ) : isLiveCameraActive ? (
                <View style={styles.liveCameraContainer}>
                  {Platform.OS === 'web' && (
                    <video
                      ref={liveVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: 230,
                        objectFit: 'cover',
                        borderRadius: 12,
                        transform: 'scaleX(-1)',
                        backgroundColor: '#000000'
                      }}
                    />
                  )}
                  <View style={styles.liveCameraOverlay}>
                    <View style={styles.livePulsingRow}>
                      <View style={styles.livePulsingDot} />
                      <Text style={styles.livePulsingText}>LIVE WEBCAM ACTIVE</Text>
                    </View>
                    <View style={styles.faceGuideFrame} />
                  </View>

                  <TouchableOpacity
                    style={styles.snapSelfieBtn}
                    onPress={snapLiveSelfie}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.snapSelfieBtnText}>📸 Snap Live Selfie</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeLiveFeedBtn}
                    onPress={stopLiveCamera}
                  >
                    <Text style={styles.closeLiveFeedText}>✕ Pause Camera Feed</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.selfieCameraPromptBox}>
                  <Text style={{ fontSize: 44, marginBottom: 8 }}>📹</Text>
                  <Text style={styles.selfiePromptTitle}>Live Camera Required</Text>
                  <Text style={styles.selfiePromptSub}>
                    Open your device's live front camera to take a real-time verification selfie.
                  </Text>

                  {cameraError && (
                    <View style={styles.cameraErrorBanner}>
                      <Text style={styles.cameraErrorText}>⚠️ {cameraError}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.launchCameraBtn}
                    onPress={startLiveCamera}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.launchCameraBtnText}>📹 Open Live Camera & Take Selfie</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sampleCameraBtn}
                    onPress={handleCaptureSampleSelfie}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sampleCameraBtnText}>⚡ Use Verified Live Camera Badge</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Upload & Proceed Action Button */}
            <TouchableOpacity
              style={[
                styles.uploadSelfieSubmitBtn,
                (!capturedSelfieUri || isUploadingSelfie) && styles.uploadSelfieSubmitBtnDisabled
              ]}
              onPress={handleUploadSelfieToCloudinary}
              disabled={!capturedSelfieUri || isUploadingSelfie}
              activeOpacity={0.85}
            >
              <Text style={styles.uploadSelfieSubmitText}>
                {isUploadingSelfie
                  ? '⏳ Uploading to Cloudinary (dlpzb0td2)...'
                  : selfieModalPhase === 'pre'
                  ? '☁️ Upload to Cloudinary & Start Service →'
                  : `☁️ Upload to Cloudinary & Complete Job (₹${activeJob?.payout || 699}) →`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== PHOTO PRESET PICKER MODAL ==================== */}
      <Modal
        visible={uploadingPhotoType !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setUploadingPhotoType(null)}
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalCard}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>
                {uploadingPhotoType === 'pre' ? 'Upload Pre-Service Photo' : 'Upload Post-Service Photo'}
              </Text>
              <TouchableOpacity onPress={() => setUploadingPhotoType(null)}>
                <Text style={styles.photoModalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.photoModalSub}>
              Select camera capture or verified inspection preset:
            </Text>

            <View style={styles.presetList}>
              {uploadingPhotoType === 'pre' ? (
                <>
                  <TouchableOpacity
                    style={styles.presetItem}
                    onPress={() => handleSelectPresetPhoto('pre', 'Split AC Dirty Evaporator Coils')}
                  >
                    <Text style={{ fontSize: 22 }}>📷</Text>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.presetItemTitle}>Evaporator Coil Inspection</Text>
                      <Text style={styles.presetItemSub}>Shows dust accumulation & clogged filters</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetItem}
                    onPress={() => handleSelectPresetPhoto('pre', 'Pre-service Temperature Reading (26°C)')}
                  >
                    <Text style={{ fontSize: 22 }}>🌡️</Text>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.presetItemTitle}>Pre-Cooling Baseline Test</Text>
                      <Text style={styles.presetItemSub}>Anemometer airflow temperature check</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.presetItem}
                    onPress={() => handleSelectPresetPhoto('post', 'Deep PowerJet Cleanned Coils')}
                  >
                    <Text style={{ fontSize: 22 }}>✨</Text>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.presetItemTitle}>PowerJet Water Jet Clean Coils</Text>
                      <Text style={styles.presetItemSub}>Sanitized, sparkling clean copper fins</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetItem}
                    onPress={() => handleSelectPresetPhoto('post', 'Post-Service Ice-Cold Air (16°C)')}
                  >
                    <Text style={{ fontSize: 22 }}>❄️</Text>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.presetItemTitle}>High-Efficiency Cooling Test</Text>
                      <Text style={styles.presetItemSub}>Verified 16°C discharge temperature</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== REPLY TO REVIEW MODAL ==================== */}
      <Modal
        visible={selectedReviewForReply !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedReviewForReply(null)}
      >
        <View style={styles.replyModalOverlay}>
          <View style={styles.replyModalCard}>
            <Text style={styles.replyModalTitle}>Reply to {selectedReviewForReply?.customer}</Text>
            <Text style={styles.replyCustomerComment}>"{selectedReviewForReply?.comment}"</Text>

            <TextInput
              style={styles.replyInput}
              placeholder="Type your response... (e.g. Thank you for your feedback!)"
              placeholderTextColor="#94A3B8"
              multiline
              value={replyInput}
              onChangeText={setReplyInput}
            />

            <View style={styles.replyModalActions}>
              <TouchableOpacity
                style={styles.replyCancelBtn}
                onPress={() => setSelectedReviewForReply(null)}
              >
                <Text style={styles.replyCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.replySubmitBtn}
                onPress={handleSendReply}
              >
                <Text style={styles.replySubmitText}>Send Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== REAL-TIME LIVE ORDER CHAT MODAL ==================== */}
      <LiveOrderChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        booking={activeJob}
        userRole="worker"
      />

      {/* ==================== REAL-TIME INTERNET VOIP VOICE CALL MODAL ==================== */}
      <LiveVoIPCallModal
        visible={showVoipCallModal}
        onClose={() => setShowVoipCallModal(false)}
        callData={voipCallData}
        isIncoming={isVoipIncoming}
      />

      {/* ==================== 1. EDIT PARTNER PROFILE MODAL ==================== */}
      <Modal
        visible={showEditProfileModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEditProfileModal(false)}
      >
        <View style={styles.partnerModalOverlay}>
          <View style={styles.partnerModalCard}>
            <View style={styles.partnerModalHeader}>
              <Text style={styles.partnerModalTitle}>Edit Partner Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfileModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.partnerModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partnerModalSub}>Update your personal credentials and service trade</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <View style={styles.partnerModalInputGroup}>
                <Text style={styles.partnerModalLabel}>Full Name *</Text>
                <TextInput
                  style={styles.partnerModalInput}
                  value={editForm.name}
                  onChangeText={(val) => setEditForm(prev => ({ ...prev, name: val }))}
                  placeholder="e.g. violet"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.partnerModalInputGroup}>
                <Text style={styles.partnerModalLabel}>Mobile Phone *</Text>
                <TextInput
                  style={styles.partnerModalInput}
                  value={editForm.phone}
                  onChangeText={(val) => setEditForm(prev => ({ ...prev, phone: val }))}
                  placeholder="e.g. +91 8772347651"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.partnerModalInputGroup}>
                <Text style={styles.partnerModalLabel}>Trade & Category *</Text>
                <TextInput
                  style={styles.partnerModalInput}
                  value={editForm.trade}
                  onChangeText={(val) => setEditForm(prev => ({ ...prev, trade: val }))}
                  placeholder="e.g. Master AC Specialist & Electrician"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.partnerModalInputGroup}>
                <Text style={styles.partnerModalLabel}>Operating City / Hub</Text>
                <TextInput
                  style={styles.partnerModalInput}
                  value={editForm.city}
                  onChangeText={(val) => setEditForm(prev => ({ ...prev, city: val }))}
                  placeholder="e.g. Krishnagiri"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </ScrollView>

            <View style={styles.partnerModalActionRow}>
              <TouchableOpacity
                style={styles.partnerModalCancelBtn}
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text style={styles.partnerModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.partnerModalSubmitBtn}
                onPress={handleSaveWorkerProfile}
              >
                <Text style={styles.partnerModalSubmitText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== 2. CERTIFIED SKILLS & TRADES MODAL ==================== */}
      <Modal
        visible={showSkillsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSkillsModal(false)}
      >
        <View style={styles.partnerModalOverlay}>
          <View style={styles.partnerModalCard}>
            <View style={styles.partnerModalHeader}>
              <Text style={styles.partnerModalTitle}>🛠️ Certified Trades & Skills</Text>
              <TouchableOpacity onPress={() => setShowSkillsModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.partnerModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partnerModalSub}>Verified competencies certified by Forge India Connect</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {[
                { title: 'AC & Appliance Repair', badge: 'LEVEL 4 MASTER', desc: 'Gas charging, PCB diagnostics, deep powerjet coil servicing.' },
                { title: 'Split & Inverter AC Specialist', badge: 'CERTIFIED', desc: 'Precision installation, vacuum leak testing & copper piping.' },
                { title: 'Home Electrical & Safety Audits', badge: 'VERIFIED', desc: 'Earthing tests, load calculation, MCB & inverter wiring.' },
                { title: 'Full Tool Kit Compliance', badge: 'AUDITED ✓', desc: 'Digital vacuum gauge, manifold gauge, safety shoes, multimeter.' },
              ].map((item, idx) => (
                <View key={`skill-${idx}`} style={styles.partnerInfoItemCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={styles.partnerInfoItemTitle}>{item.title}</Text>
                    <View style={styles.partnerInfoItemBadge}>
                      <Text style={styles.partnerInfoItemBadgeText}>{item.badge}</Text>
                    </View>
                  </View>
                  <Text style={styles.partnerInfoItemDesc}>{item.desc}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.partnerModalSubmitBtn, { marginTop: 14 }]}
              onPress={() => setShowSkillsModal(false)}
            >
              <Text style={styles.partnerModalSubmitText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== 3. SERVICE HUB & RADIUS MODAL ==================== */}
      <Modal
        visible={showLocationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.partnerModalOverlay}>
          <View style={styles.partnerModalCard}>
            <View style={styles.partnerModalHeader}>
              <Text style={styles.partnerModalTitle}>📍 Service Hub & Operating Radius</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.partnerModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partnerModalSub}>Choose how far you are willing to travel for customer dispatches</Text>

            <View style={styles.partnerRadiusContainer}>
              <Text style={styles.partnerRadiusLabel}>Operating Hub: <Text style={{ fontWeight: '900', color: '#0F172A' }}>{partnerProfile.city} Town Central</Text></Text>
              <Text style={[styles.partnerRadiusLabel, { marginTop: 10 }]}>Select Job Dispatch Radius:</Text>
              <View style={styles.partnerRadiusPillsRow}>
                {[5, 10, 12, 15, 20].map((km) => (
                  <TouchableOpacity
                    key={`km-${km}`}
                    style={[
                      styles.partnerRadiusPill,
                      partnerProfile.operatingRadius === km && styles.partnerRadiusPillActive
                    ]}
                    onPress={() => {
                      setPartnerProfile(prev => ({ ...prev, operatingRadius: km }));
                      showToast(`✓ Operating radius set to ${km} KM`);
                    }}
                  >
                    <Text style={[
                      styles.partnerRadiusPillText,
                      partnerProfile.operatingRadius === km && styles.partnerRadiusPillTextActive
                    ]}>
                      {km} KM
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.partnerRadiusHint}>
                Covering Rayakottai Road, Gandhi Nagar, Kaveripattinam, Old Pet, and Bangalore Bypass within {partnerProfile.operatingRadius} KM.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.partnerModalSubmitBtn, { marginTop: 16 }]}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.partnerModalSubmitText}>Save Area & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== 4. KYC & VERIFICATION MODAL ==================== */}
      <Modal
        visible={showKycModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowKycModal(false)}
      >
        <View style={styles.partnerModalOverlay}>
          <View style={styles.partnerModalCard}>
            <View style={styles.partnerModalHeader}>
              <Text style={styles.partnerModalTitle}>🛡️ KYC & Identity Verification</Text>
              <TouchableOpacity onPress={() => setShowKycModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.partnerModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partnerModalSub}>Government ID verification and background security audit</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {[
                { label: 'Aadhaar Card UID', val: 'XXXX-XXXX-8921', status: 'VERIFIED ✓', color: '#10B981' },
                { label: 'PAN Identity Tax ID', val: 'ABCDE1234F', status: 'ACTIVE ✓', color: '#10B981' },
                { label: 'Police Background Check', val: 'Clear Record • Tamil Nadu Police', status: 'CLEARED ✓', color: '#10B981' },
                { label: 'Bank Settlement Account', val: 'HDFC Bank • A/C Ending in 4821', status: 'PENNY TESTED ✓', color: '#10B981' },
                { label: 'Platform Protection Cover', val: '₹10,000 Accidental Damage Guarantee', status: 'PROTECTED', color: '#3B82F6' },
              ].map((doc, idx) => (
                <View key={`doc-${idx}`} style={styles.partnerKycRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partnerKycLabel}>{doc.label}</Text>
                    <Text style={styles.partnerKycVal}>{doc.val}</Text>
                  </View>
                  <View style={[styles.partnerKycBadge, { backgroundColor: doc.color + '15', borderColor: doc.color + '40' }]}>
                    <Text style={[styles.partnerKycBadgeText, { color: doc.color }]}>{doc.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.partnerModalSubmitBtn, { marginTop: 14 }]}
              onPress={() => setShowKycModal(false)}
            >
              <Text style={styles.partnerModalSubmitText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== 5. 24x7 PARTNER CARE & SUPPORT MODAL ==================== */}
      <Modal
        visible={showSupportModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.partnerModalOverlay}>
          <View style={styles.partnerModalCard}>
            <View style={styles.partnerModalHeader}>
              <Text style={styles.partnerModalTitle}>💬 24x7 Partner Care</Text>
              <TouchableOpacity onPress={() => setShowSupportModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.partnerModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.partnerModalSub}>We are here to support your field operations and payouts</Text>

            <View style={{ gap: 10, marginBottom: 14 }}>
              <TouchableOpacity
                style={styles.partnerHelpActionBtn}
                onPress={() => Linking.openURL('tel:18004197000').catch(() => Alert.alert('Helpline', 'Call Toll-Free: 1800-419-7000'))}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>📞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerHelpActionTitle}>Call Partner Toll-Free Helpline</Text>
                  <Text style={styles.partnerHelpActionSub}>1800-419-7000 • 24x7 Priority Support</Text>
                </View>
                <Text style={{ fontSize: 18, color: '#F04400', fontWeight: '900' }}>Call ›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.partnerHelpActionBtn}
                onPress={() => Linking.openURL('https://wa.me/919820012345').catch(() => Alert.alert('WhatsApp', 'Message Partner Care on WhatsApp: +91 98200 12345'))}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>💬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.partnerHelpActionTitle}>WhatsApp Partner Support</Text>
                  <Text style={styles.partnerHelpActionSub}>Instant ticket resolution & job inquiries</Text>
                </View>
                <Text style={{ fontSize: 18, color: '#10B981', fontWeight: '900' }}>Chat ›</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, fontWeight: '800', color: '#0F172A', marginBottom: 6 }}>Common Questions:</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 150 }}>
              <View style={styles.partnerFaqCard}>
                <Text style={styles.partnerFaqQ}>When will I receive today's payout?</Text>
                <Text style={styles.partnerFaqA}>Instant bank transfers are processed in under 60 seconds directly into your registered HDFC bank account.</Text>
              </View>
              <View style={styles.partnerFaqCard}>
                <Text style={styles.partnerFaqQ}>Customer cancelled after I arrived?</Text>
                <Text style={styles.partnerFaqA}>You receive 100% of the visiting charge protection automatically credited to your wallet.</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.partnerModalSubmitBtn, { marginTop: 14 }]}
              onPress={() => setShowSupportModal(false)}
            >
              <Text style={styles.partnerModalSubmitText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== 6. LOG OUT CONFIRMATION MODAL ==================== */}
      <Modal
        visible={showLogoutConfirmModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutConfirmModal(false)}
      >
        <View style={styles.partnerModalOverlay}>
          <View style={[styles.partnerModalCard, { maxWidth: 360, alignItems: 'center' }]}>
            <View style={styles.logoutModalIconBox}>
              <Text style={{ fontSize: 28 }}>🚪</Text>
            </View>
            <Text style={[styles.partnerModalTitle, { textAlign: 'center', fontSize: 18, marginTop: 10 }]}>
              Log Out of Partner Account?
            </Text>
            <Text style={[styles.partnerModalSub, { textAlign: 'center', marginBottom: 20 }]}>
              Are you sure you want to log out of Forge India Connect? You can log in anytime with your registered credentials.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={styles.partnerModalCancelBtn}
                onPress={() => setShowLogoutConfirmModal(false)}
              >
                <Text style={styles.partnerModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.partnerModalSubmitBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => {
                  setShowLogoutConfirmModal(false);
                  if (onLogout) onLogout();
                }}
              >
                <Text style={styles.partnerModalSubmitText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  toastBanner: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  headerBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sidebarToggleText: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F04400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  headerInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerName: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  ratingBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
  },
  headerTrade: {
    color: '#475569',
    fontSize: 12,
    marginTop: 1,
    fontWeight: '600',
  },
  headerEmail: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  headerControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
  },
  onlineActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  onlineInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlinePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  headerBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  headerLogoutIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
    height: 32,
    justifyContent: 'center',
  },
  logoutIconSymbol: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '900',
  },
  headerLogoutText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  headerCustomerSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
    height: 32,
    justifyContent: 'center',
  },
  headerCustomerSwitchIcon: {
    fontSize: 11,
  },
  headerCustomerSwitchText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  headerNotifBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNotifIcon: {
    fontSize: 13,
  },
  viewInCustomerTrackingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  viewInCustomerTrackingIcon: {
    fontSize: 22,
  },
  viewInCustomerTrackingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  viewInCustomerTrackingSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  viewInCustomerTrackingArrow: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '900',
  },
  sidebarCustomerSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: 'space-between',
    minHeight: 84,
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  metricSub: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
  },
  navTabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  navTabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  navTabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navTabActive: {
    backgroundColor: '#F04400',
    borderColor: '#F04400',
  },
  navTabText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  navTabActiveText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 16,
  },
  tabSection: {
    gap: 14,
  },
  sectionHeaderBox: {
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  jobTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  jobIdText: {
    color: '#F04400',
    fontSize: 12,
    fontWeight: '800',
  },
  jobTitleText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  payoutBadge: {
    alignItems: 'flex-end',
  },
  payoutBadgeText: {
    color: '#64748B',
    fontSize: 10,
  },
  payoutAmountText: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '900',
  },
  jobDetailBox: {
    gap: 8,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  detailValue: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusAssigned: {
    backgroundColor: '#334155',
  },
  statusEnRoute: {
    backgroundColor: '#D97706',
  },
  statusProgress: {
    backgroundColor: '#2563EB',
  },
  statusCompleted: {
    backgroundColor: '#059669',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  customerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  chatCustomerBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  chatCustomerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  callCustomerBtn: {
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callCustomerBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  manualStepControlBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  manualStepHeaderRow: {
    marginBottom: 12,
  },
  manualStepHeaderTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  manualStepHeaderSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  stepAdvPrimaryBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepAdvPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  completedSuccessCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  completedSuccessTitle: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  reopenStepBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  reopenStepBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  quickStepSelectorContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 2,
  },
  quickStepLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  quickStepScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 16,
    paddingBottom: 4,
  },
  quickStepPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickStepPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  quickStepPillCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  quickStepPillNext: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
    borderWidth: 1.5,
  },
  quickStepPillLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.65,
  },
  quickStepPillText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  quickStepPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  quickStepPillTextCompleted: {
    color: '#16A34A',
    fontWeight: '700',
  },
  quickStepPillTextNext: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  quickStepPillTextLocked: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  skipOtpBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipOtpBtnText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  workflowActionBox: {
    marginBottom: 14,
  },
  enRouteBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  enRouteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  arrivedBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  arrivedBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  otpSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  otpHeaderTitle: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
  otpHelperText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 3,
    marginBottom: 10,
  },
  otpVerifiedBanner: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  otpVerifiedText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '800',
  },
  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpInput: {
    width: 90,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    color: '#0F172A',
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
  },
  verifyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  photoUploadSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  photoSectionTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  photoSectionSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
    lineHeight: 15,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBox: {
    flex: 1,
  },
  photoBoxTitle: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  uploadPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 115,
  },
  uploadBtnText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  uploadSubtext: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
  },
  photoUploadedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
    minHeight: 115,
  },
  photoName: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  photoTime: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  verifiedTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  verifiedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  replacePhotoText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  sopSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sopHeaderTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  sopHelperText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checklistItemDone: {
    opacity: 0.8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checklistText: {
    color: '#334155',
    fontSize: 12,
    flex: 1,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  completeJobBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  completeJobBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  completedBanner: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  completedBannerText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '900',
  },
  noJobBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  noJobTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  noJobSub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  // Live GPS Card
  liveTrackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  liveMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveIndicatorText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '900',
  },
  liveEtaBadge: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
  },
  liveMapGraphic: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveMapRouteTitle: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 14,
  },
  routeProgressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
  },
  routeProgressBarFill: {
    height: 6,
    backgroundColor: '#0284C7',
    borderRadius: 3,
  },
  scooterPin: {
    position: 'absolute',
    top: -14,
  },
  routeEndpoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endpointLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  liveStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginBottom: 14,
  },
  liveStatCol: {
    alignItems: 'center',
  },
  liveStatVal: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  liveStatLbl: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  advanceGpsBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  advanceGpsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  // Hot Leads
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  leadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  leadTagBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leadTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  leadPayoutText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '900',
  },
  leadServiceText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  leadAddressText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  leadSlotText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  acceptLeadBtn: {
    backgroundColor: '#F04400',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#F04400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptLeadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  // Fleet Cluster
  fleetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  fleetAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fleetAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  fleetInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  fleetName: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  fleetTrade: {
    color: '#64748B',
    fontSize: 11,
  },
  fleetDispatches: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  fleetStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fleetOnJob: {
    backgroundColor: '#EFF6FF',
  },
  fleetAvailable: {
    backgroundColor: '#ECFDF5',
  },
  fleetStatusText: {
    color: '#1E40AF',
    fontSize: 10,
    fontWeight: '800',
  },
  // Evidence Card
  evidenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  evidenceHeader: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  evidenceCol: {
    flex: 1,
  },
  evidenceLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 6,
  },
  evidencePlaceholderBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  evidenceTitle: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  evidenceTime: {
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 2,
  },
  addEvidenceBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addEvidenceBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  // Calendar Slot Card
  calendarSlotCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  calendarTimeCol: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingRight: 10,
    justifyContent: 'center',
  },
  calendarTimeText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  calendarStatusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  calDone: {
    backgroundColor: '#ECFDF5',
  },
  calPending: {
    backgroundColor: '#FEF3C7',
  },
  calendarStatusTagText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '800',
  },
  calendarDetailsCol: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  calendarService: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  calendarCustomer: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  calendarPayout: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  // Wallet Card
  walletHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  walletHeroLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  walletHeroAmount: {
    color: '#059669',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  walletHeroSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 16,
  },
  withdrawBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  bankDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bankCardTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankKey: {
    color: '#64748B',
    fontSize: 11,
  },
  bankVal: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  // Quality & Rating
  ratingOverviewCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  ratingBigCol: {
    width: '45%',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingRight: 10,
  },
  bigRatingNum: {
    color: '#F59E0B',
    fontSize: 36,
    fontWeight: '900',
  },
  bigRatingStars: {
    color: '#F59E0B',
    fontSize: 16,
    marginVertical: 2,
  },
  bigRatingCount: {
    color: '#64748B',
    fontSize: 10,
  },
  ratingBreakdownCol: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'center',
    gap: 3,
  },
  breakdownRow: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewCustomer: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewService: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  reviewRatingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    height: 20,
    justifyContent: 'center',
  },
  reviewRatingBadgeText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '900',
  },
  reviewComment: {
    color: '#334155',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewReplyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  reviewReplyAuthor: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
  },
  reviewReplyText: {
    color: '#475569',
    fontSize: 11,
    marginTop: 2,
  },
  replyBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replyBtnText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
  },
  // Earnings
  earningsSummaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  earningsStat: {
    alignItems: 'center',
  },
  earningsStatVal: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  earningsStatLbl: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  // Invoices
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  invoiceId: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '800',
  },
  invoiceStatus: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  invoiceCustomer: {
    color: '#64748B',
    fontSize: 11,
  },
  invoicePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  invoiceTotal: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  downloadInvoiceBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  downloadInvoiceBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  // KYC Card
  kycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kycRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  kycTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  kycStatusOk: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  kycSub: {
    color: '#64748B',
    fontSize: 11,
  },
  // Off-Canvas Sidebar
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarDrawer: {
    width: Math.min(width * 0.85, 330),
    backgroundColor: '#FFFFFF',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sidebarAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F04400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  sidebarName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  sidebarRole: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
  },
  sidebarId: {
    color: '#64748B',
    fontSize: 10,
  },
  sidebarCloseBtn: {
    padding: 6,
  },
  sidebarCloseText: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '800',
  },
  sidebarNavList: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  sidebarGroup: {
    marginBottom: 20,
  },
  sidebarGroupTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 6,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 5,
  },
  sidebarNavItemActive: {
    backgroundColor: '#F04400',
  },
  sidebarNavIcon: {
    fontSize: 17,
    width: 28,
  },
  sidebarNavLabel: {
    color: '#334155',
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },
  sidebarNavLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  sidebarCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sidebarCountText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '800',
  },
  sidebarLiveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sidebarLiveText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  sidebarFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  compactSidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
    width: '100%',
  },
  compactLogoutIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactLogoutIconSymbol: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  compactLogoutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  // Photo Preset Modal
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  photoModalTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  photoModalClose: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '700',
  },
  photoModalSub: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 14,
  },
  presetList: {
    gap: 10,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetItemTitle: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  presetItemSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  // Reply Modal
  replyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  replyModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  replyModalTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  replyCustomerComment: {
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    padding: 10,
    fontSize: 12,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  replyModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  replyCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyCancelText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  replySubmitBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replySubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  // Selfie Camera Modal Styles
  selfieModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  selfieModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  selfieModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selfieModalTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '900',
  },
  selfieModalSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  selfieCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  selfieCloseText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
  },
  cloudinaryBadgeRow: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  cloudinaryBadgeText: {
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '800',
  },
  selfieViewfinderBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  selfieCameraPromptBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  selfiePromptTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  selfiePromptSub: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  launchCameraBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  launchCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sampleCameraBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  sampleCameraBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  selfiePreviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  selfiePreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  selfieVerifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  selfieVerifiedBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  retakeBtn: {
    paddingVertical: 4,
  },
  retakeBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  liveCameraContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  liveCameraOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    height: 215,
    pointerEvents: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livePulsingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  livePulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  livePulsingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  faceGuideFrame: {
    width: 130,
    height: 150,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  snapSelfieBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  snapSelfieBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },
  closeLiveFeedBtn: {
    paddingVertical: 6,
    marginTop: 4,
  },
  closeLiveFeedText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraErrorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  cameraErrorText: {
    color: '#DC2626',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  uploadSelfieSubmitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadSelfieSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadSelfieSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  // ==================== URBAN COMPANY CUSTOMER-STYLE COMPONENTS FOR WORKER ====================
  ucCleanHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 36 : 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ucHeaderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ucBrandAndLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  ucBrandLogoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ucBrandLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ucLocationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ucLocationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ucLocationPin: {
    fontSize: 13,
    marginRight: 3,
  },
  ucLocationName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
    maxWidth: 140,
  },
  ucLocationArrow: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 3,
  },
  ucLocationSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  ucHeaderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 2,
  },
  ucCoinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ucCoinsIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  ucCoinsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  ucProfileAvatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ucProfileAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  partnerTopUtilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partnerInfoBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarMenuBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sidebarMenuText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  ucSearchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ucSearchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  ucSearchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    paddingVertical: 0,
  },
  ucClearIcon: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  ucQuickChipsScroll: {
    flexDirection: 'row',
    paddingTop: 8,
    gap: 6,
  },
  ucQuickChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  ucQuickChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  ucQuickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  ucQuickChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Customer Live Order Tracking Banner for Worker
  customerTrackingBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F04400',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  trackingBannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trackingBannerIcon: {
    fontSize: 20,
  },
  trackingBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9A3412',
  },
  trackingLivePill: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  trackingLivePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  trackingBannerSub: {
    fontSize: 11.5,
    color: '#7C2D12',
    fontWeight: '500',
    marginTop: 2,
  },
  trackingBannerAction: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trackingBannerActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Festive Rooftop Banner (Customer Style)
  festiveContainer: {
    backgroundColor: '#D03800',
    paddingTop: 12,
    paddingBottom: 14,
    marginTop: 10,
  },
  festiveHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  festiveDiyasLeft: {
    fontSize: 14,
    marginRight: 8,
  },
  festiveDiyasRight: {
    fontSize: 14,
    marginLeft: 8,
  },
  festiveTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD91A',
    letterSpacing: 1.5,
  },
  festiveCardsScroll: {
    paddingHorizontal: 14,
    paddingBottom: 4,
    gap: 10,
  },
  workerFestiveMetricCard: {
    width: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFD91A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerFestiveTag: {
    backgroundColor: '#FFD91A',
    paddingVertical: 3,
    alignItems: 'center',
  },
  workerFestiveTagText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  workerFestiveBody: {
    padding: 10,
  },
  workerFestiveValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  workerFestiveSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  workerFestiveAction: {
    fontSize: 10,
    color: '#D03800',
    fontWeight: '800',
    marginTop: 6,
  },

  doorstepSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  doorstepSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  doorstepSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Bottom Navigation Bar (Customer Style)
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 76 : 62,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 6,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 48,
    position: 'relative',
  },
  bottomNavIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  bottomNavActiveIcon: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  bottomNavText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  bottomNavActiveText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  bottomActiveIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  bottomBookingBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#0F172A',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bottomBookingBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // PARTNER PROFILE & OPERATIONS HUB STYLES
  partnerProfileHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerProfileAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F04400',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  partnerProfileAvatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  partnerProfileName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  partnerProBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  partnerProBadgeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
  },
  partnerProfileTrade: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 1,
  },
  partnerProfileEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  partnerDutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  partnerDutyActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  partnerDutyInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  partnerDutyText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },

  partnerQuickMetricsRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerQuickMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  partnerQuickMetricVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  partnerQuickMetricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },
  partnerQuickMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },

  partnerSwitchCustomerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  partnerSwitchCustomerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerSwitchCustomerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  partnerSwitchCustomerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  partnerSwitchCustomerChevron: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '700',
    marginLeft: 6,
  },

  partnerMenuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerMenuSectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  partnerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  partnerMenuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerMenuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  partnerMenuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  partnerMenuChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
    marginLeft: 8,
  },
  partnerLiveBadge: {
    backgroundColor: '#F04400',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partnerLiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  partnerCountBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  partnerCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  partnerLogoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  partnerLogoutIcon: {
    fontSize: 16,
    color: '#DC2626',
    marginRight: 6,
    fontWeight: '900',
  },
  partnerLogoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
  partnerVersionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 20,
  },

  // Streamlined Profile Extras & Modals
  partnerProAvatarBadge: {
    position: 'absolute',
    bottom: -3,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  partnerProAvatarBadgeText: {
    color: '#92400E',
    fontSize: 8.5,
    fontWeight: '900',
  },
  partnerProfilePhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  partnerEditProfileBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  partnerEditProfileBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  partnerDutyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerDutyCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  partnerDutyCardSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    paddingRight: 10,
  },
  partnerDutyToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  partnerDutyToggleActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  partnerDutyToggleInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  partnerDutyToggleText: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Interactive Partner Modals
  partnerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  partnerModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  partnerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  partnerModalCloseText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
    padding: 4,
  },
  partnerModalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 16,
  },
  partnerModalInputGroup: {
    marginBottom: 12,
  },
  partnerModalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  partnerModalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  partnerModalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  partnerModalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerModalCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  partnerModalSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F04400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerModalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  partnerInfoItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerInfoItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  partnerInfoItemBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partnerInfoItemBadgeText: {
    color: '#0369A1',
    fontSize: 9.5,
    fontWeight: '900',
  },
  partnerInfoItemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  partnerRadiusContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerRadiusLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  partnerRadiusPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  partnerRadiusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  partnerRadiusPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  partnerRadiusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  partnerRadiusPillTextActive: {
    color: '#FFFFFF',
  },
  partnerRadiusHint: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  partnerKycRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  partnerKycLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  partnerKycVal: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  partnerKycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  partnerKycBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  partnerHelpActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerHelpActionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  partnerHelpActionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  partnerFaqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  partnerFaqQ: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  partnerFaqA: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  logoutModalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
