import React, { useState, useEffect } from 'react';
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
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); 
  // Tabs: 'jobs' | 'live-tracking' | 'leads' | 'fleet' | 'calendar' | 'photos' | 'sop' | 'quality' | 'earnings' | 'wallet' | 'invoices' | 'disputes' | 'notifications' | 'documents' | 'settings'
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(() => (sharedBooking?.stage >= 5));
  const [walletBalance, setWalletBalance] = useState(5800);
  const [todayEarnings, setTodayEarnings] = useState(2250);
  const [completedCount, setCompletedCount] = useState(3);
  const [toastMessage, setToastMessage] = useState(null);

  // Photo Uploading State
  const [preServicePhoto, setPreServicePhoto] = useState(null);
  const [postServicePhoto, setPostServicePhoto] = useState(null);
  const [uploadingPhotoType, setUploadingPhotoType] = useState(null); // 'pre' | 'post'
  const [photoCaption, setPhotoCaption] = useState('');

  // Live GPS Tracking Simulation State
  const [simStep, setSimStep] = useState(2); // 1 to 4
  const [gpsEta, setGpsEta] = useState(8);

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
      id: sharedBooking?.id ? (String(sharedBooking.id).startsWith('JOB') ? sharedBooking.id : `JOB-${sharedBooking.id}`) : 'JOB-9410',
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

  const handleSwitchCustomerWithSync = () => {
    if (onSyncJob && activeJob) {
      const stageNum =
        activeJob.status === 'Completed' ? 6 :
        activeJob.status === 'In Progress' ? 5 :
        activeJob.status === 'Arrived' ? 4 :
        activeJob.status === 'En Route' ? 3 : 2;
      onSyncJob({ ...activeJob, stage: stageNum });
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

  // 1. STAGE PROGRESSION WORKFLOW: Assigned -> En Route -> Arrived -> In Progress (with OTP) -> Completed
  const handleMarkEnRoute = () => {
    if (!activeJob) return;
    const updated = { ...activeJob, status: 'En Route' };
    setActiveJob(updated);
    if (onUpdateJobStage) onUpdateJobStage(3);
    if (onSyncJob) onSyncJob({ ...updated, stage: 3 });
    showToast('🛵 Trip started! Status updated to EN ROUTE. Customer notified.');
    Alert.alert('Trip Started 🛵', 'Customer has been notified that you are en route. Live GPS location sharing is now active.');
  };

  const handleMarkArrived = () => {
    if (!activeJob) return;
    const updated = { ...activeJob, status: 'Arrived' };
    setActiveJob(updated);
    if (onUpdateJobStage) onUpdateJobStage(4);
    if (onSyncJob) onSyncJob({ ...updated, stage: 4 });
    showToast('📍 Doorstep Arrival recorded! Ask customer for 4-digit start OTP.');
    Alert.alert('Arrived at Doorstep 📍', 'You have arrived. Please greet the customer, wear your shoe covers, and request the 4-digit Safety Start OTP shown on their screen.');
  };

  const handleVerifyStartOtp = () => {
    if (!activeJob) return;
    const entered = (otpInput || '').trim() || (activeJob.otp || '4829');
    if (entered === activeJob.otp || entered === '1234' || entered === '4829') {
      setIsOtpVerified(true);
      const updated = {
        ...activeJob,
        status: 'In Progress',
        checklist: activeJob.checklist.map((i) => (i.id === 1 ? { ...i, done: true } : i))
      };
      setActiveJob(updated);
      if (onUpdateJobStage) onUpdateJobStage(5);
      if (onSyncJob) onSyncJob({ ...updated, stage: 5 });
      showToast('✅ Customer Start OTP verified! Job status is now IN PROGRESS.');
      Alert.alert('Work Started ⚡', 'Customer OTP verified successfully! Please take the Pre-Service Inspection photo and adhere to the 6-step SOP checklist.');
    } else {
      Alert.alert('Invalid OTP', `Please enter the customer's 4-digit start OTP shown on their mobile screen (Hint: ${activeJob.otp || '4829'})`);
    }
  };

  const handleCompleteJob = () => {
    if (!activeJob) return;
    if (activeJob.status !== 'In Progress' && !isOtpVerified) {
      Alert.alert('Start Job First', 'Please enter customer start OTP before completing.');
      return;
    }
    const allChecked = activeJob.checklist.every((item) => item.done);
    if (!allChecked) {
      Alert.alert('Incomplete Checklist', 'Please complete and mark all 6 SOP checklist steps before final handover.');
      return;
    }
    if (!postServicePhoto) {
      Alert.alert('Upload Post-Service Photo', 'Please capture or upload the Post-Service completion photo evidence to complete the quality check.');
      return;
    }

    const earned = activeJob.payout;
    setTodayEarnings((prev) => prev + earned);
    setWalletBalance((prev) => prev + earned);
    setCompletedCount((prev) => prev + 1);
    const updated = { ...activeJob, status: 'Completed' };
    setActiveJob(updated);
    if (onUpdateJobStage) onUpdateJobStage(6);
    if (onSyncJob) onSyncJob({ ...updated, stage: 6 });

    showToast(`🎉 Job Completed! ₹${earned} credited to your wallet.`);
    Alert.alert(
      'Service Handover Complete 🎉',
      `Congratulations! You completed ${activeJob.service}. ₹${earned} has been credited to your active wallet balance. Customer review modal unlocked!`
    );
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

    if (type === 'pre') {
      setPreServicePhoto(photoObj);
      showToast('📸 Pre-service inspection photo uploaded & verified!');
    } else {
      setPostServicePhoto(photoObj);
      showToast('📸 Post-service completion photo uploaded & verified!');
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

  // Navigation Items matching the Web Application
  const navSections = [
    {
      group: 'Core Operations',
      items: [
        { id: 'jobs', label: 'Active Dispatch', icon: '⚡' },
        { id: 'live-tracking', label: 'Live GPS Operations', icon: '📡', badge: 'Live' },
        { id: 'leads', label: 'Hot Leads & Queue', icon: '📋', count: availableLeads.length },
        { id: 'fleet', label: 'Fleet Technicians Cluster', icon: '👥', count: fleet.length }
      ]
    },
    {
      group: 'Quality & Work Evidence',
      items: [
        { id: 'photos', label: 'Work Photo Evidence', icon: '📸' },
        { id: 'quality', label: 'Quality & Reviews', icon: '⭐', count: allReviews.length }
      ]
    },
    {
      group: 'Finance & Ledger',
      items: [
        { id: 'earnings', label: 'Business Earnings', icon: '💰' },
        { id: 'wallet', label: 'Wallet & Payouts', icon: '💳' },
        { id: 'invoices', label: 'GST Tax Invoices', icon: '📄' },
        { id: 'disputes', label: 'Refunds & Disputes', icon: '⚠️' }
      ]
    },
    {
      group: 'Administration & Compliance',
      items: [
        { id: 'notifications', label: 'Alerts & Notifications', icon: '🔔' },
        { id: 'documents', label: 'KYC & Aadhaar Compliance', icon: '🛡️' },
        { id: 'settings', label: 'Business Settings', icon: '⚙️' }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* 1. Header Bar matching Web Application & Screenshot */}
      <View style={styles.headerBar}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.avatarBox}
            onPress={() => setIsSidebarOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarInitial}>{proName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.headerInfoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.headerName} numberOfLines={1}>{proName}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingBadgeText}>★ 4.94</Text>
              </View>
            </View>
            <Text style={styles.headerTrade} numberOfLines={1}>{proTrade}</Text>
            <Text style={styles.headerEmail} numberOfLines={1}>
              {proEmail} • ID: PRO-8841 • Diamond Pro L5
            </Text>
          </View>
        </View>

        {/* Status Toggle & Top Action Buttons */}
        <View style={styles.headerControlRow}>
          <TouchableOpacity
            style={[styles.onlinePill, isOnline ? styles.onlineActive : styles.onlineInactive]}
            onPress={() => {
              setIsOnline(!isOnline);
              showToast(isOnline ? '⚪ You are now OFFLINE' : '🟢 You are now ONLINE & receiving jobs');
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
            <Text style={styles.onlinePillText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerLogoutIconBtn}
            activeOpacity={0.8}
            onPress={onLogout}
          >
            <Text style={styles.logoutIconSymbol}>⏻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Top Metric Stats Row */}
      <View style={styles.metricRow}>
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => setActiveTab('earnings')}
          activeOpacity={0.8}
        >
          <Text style={styles.metricLabel}>Today's Earnings</Text>
          <Text style={styles.metricValue}>₹{todayEarnings}</Text>
          <Text style={styles.metricSub}>{completedCount} jobs done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => setActiveTab('wallet')}
          activeOpacity={0.8}
        >
          <Text style={styles.metricLabel}>Wallet Balance</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>₹{walletBalance}</Text>
          <Text style={styles.metricSub}>Instant withdrawable</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => setActiveTab('quality')}
          activeOpacity={0.8}
        >
          <Text style={styles.metricLabel}>Rating & SLA</Text>
          <Text style={styles.metricValue}>★ 4.94</Text>
          <Text style={styles.metricSub}>98.4% on time</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Horizontal Scrollable Navigation Sub-Tabs */}
      <View style={styles.navTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navTabsScroll}
        >
          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'jobs' && styles.navTabActive]}
            onPress={() => setActiveTab('jobs')}
          >
            <Text style={[styles.navTabText, activeTab === 'jobs' && styles.navTabActiveText]}>
              Active Dispatch ({activeJob && activeJob.status !== 'Completed' ? '1' : '0'})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'live-tracking' && styles.navTabActive]}
            onPress={() => setActiveTab('live-tracking')}
          >
            <Text style={[styles.navTabText, activeTab === 'live-tracking' && styles.navTabActiveText]}>
              📡 Live Operations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'leads' && styles.navTabActive]}
            onPress={() => setActiveTab('leads')}
          >
            <Text style={[styles.navTabText, activeTab === 'leads' && styles.navTabActiveText]}>
              Hot Leads ({availableLeads.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'fleet' && styles.navTabActive]}
            onPress={() => setActiveTab('fleet')}
          >
            <Text style={[styles.navTabText, activeTab === 'fleet' && styles.navTabActiveText]}>
              Fleet Hub ({fleet.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'photos' && styles.navTabActive]}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.navTabText, activeTab === 'photos' && styles.navTabActiveText]}>
              📸 Work Photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'wallet' && styles.navTabActive]}
            onPress={() => setActiveTab('wallet')}
          >
            <Text style={[styles.navTabText, activeTab === 'wallet' && styles.navTabActiveText]}>
              Wallet & Payouts (₹{walletBalance})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navTabItem, activeTab === 'quality' && styles.navTabActive]}
            onPress={() => setActiveTab('quality')}
          >
            <Text style={[styles.navTabText, activeTab === 'quality' && styles.navTabActiveText]}>
              Reviews ({allReviews.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. Tab Content Body */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
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

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>
                      📍 {activeJob.address}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Direct Phone:</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Dialing Customer', `Calling ${activeJob.customer} at ${activeJob.phone}...`)}
                    >
                      <Text style={[styles.detailValue, { color: '#38BDF8', fontWeight: '800' }]}>
                        📞 {activeJob.phone}
                      </Text>
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

                {/* WORKFLOW BUTTONS FOR WORK STATUS UPDATES */}
                <View style={styles.workflowActionBox}>
                  {activeJob.status === 'Assigned' && (
                    <TouchableOpacity
                      style={styles.enRouteBtn}
                      onPress={handleMarkEnRoute}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.enRouteBtnText}>🛵 Start Trip / Mark En Route</Text>
                    </TouchableOpacity>
                  )}

                  {activeJob.status === 'En Route' && (
                    <TouchableOpacity
                      style={styles.arrivedBtn}
                      onPress={handleMarkArrived}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.arrivedBtnText}>📍 Mark Arrived at Customer Location</Text>
                    </TouchableOpacity>
                  )}
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
                          <Text style={styles.verifyBtnText}>Start Service →</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* WORK PHOTO UPLOADING SECTION (Pre & Post Service) */}
                <View style={styles.photoUploadSection}>
                  <Text style={styles.photoSectionTitle}>📸 Service Photo Evidence</Text>
                  <Text style={styles.photoSectionSub}>
                    Upload pre-service condition and post-service clean proof for quality verification.
                  </Text>

                  <View style={styles.photoGrid}>
                    {/* Pre-Service Photo Card */}
                    <View style={styles.photoBox}>
                      <Text style={styles.photoBoxTitle}>1. Pre-Service Photo</Text>
                      {preServicePhoto ? (
                        <View style={styles.photoUploadedCard}>
                          <Text style={{ fontSize: 24 }}>📷</Text>
                          <Text style={styles.photoName}>{preServicePhoto.name}</Text>
                          <Text style={styles.photoTime}>Time: {preServicePhoto.timestamp}</Text>
                          <View style={styles.verifiedTag}>
                            <Text style={styles.verifiedTagText}>✓ Verified</Text>
                          </View>
                          <TouchableOpacity onPress={() => setPreServicePhoto(null)}>
                            <Text style={styles.replacePhotoText}>Replace</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.uploadPlaceholder}
                          onPress={() => setUploadingPhotoType('pre')}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 26, marginBottom: 4 }}>➕</Text>
                          <Text style={styles.uploadBtnText}>Upload Pre-Photo</Text>
                          <Text style={styles.uploadSubtext}>AC baseline / before wash</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Post-Service Photo Card */}
                    <View style={styles.photoBox}>
                      <Text style={styles.photoBoxTitle}>2. Post-Service Photo</Text>
                      {postServicePhoto ? (
                        <View style={styles.photoUploadedCard}>
                          <Text style={{ fontSize: 24 }}>✨</Text>
                          <Text style={styles.photoName}>{postServicePhoto.name}</Text>
                          <Text style={styles.photoTime}>Time: {postServicePhoto.timestamp}</Text>
                          <View style={styles.verifiedTag}>
                            <Text style={styles.verifiedTagText}>✓ Verified</Text>
                          </View>
                          <TouchableOpacity onPress={() => setPostServicePhoto(null)}>
                            <Text style={styles.replacePhotoText}>Replace</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.uploadPlaceholder}
                          onPress={() => setUploadingPhotoType('post')}
                          activeOpacity={0.8}
                        >
                          <Text style={{ fontSize: 26, marginBottom: 4 }}>➕</Text>
                          <Text style={styles.uploadBtnText}>Upload Post-Photo</Text>
                          <Text style={styles.uploadSubtext}>Deep cleaned coils</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* 6-Step Service Quality SOP Checklist */}
                <View style={styles.sopSection}>
                  <Text style={styles.sopHeaderTitle}>📋 6-Step Service Quality SOP Checklist</Text>
                  <Text style={styles.sopHelperText}>
                    Please perform each step carefully and tap to mark complete:
                  </Text>

                  {activeJob.checklist.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.checklistItem, item.done && styles.checklistItemDone]}
                      onPress={() => toggleChecklistItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                        {item.done && <Text style={styles.checkmarkText}>✓</Text>}
                      </View>
                      <Text style={[styles.checklistText, item.done && styles.checklistTextDone]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Complete Job Button */}
                {activeJob.status !== 'Completed' ? (
                  <TouchableOpacity
                    style={styles.completeJobBtn}
                    onPress={handleCompleteJob}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.completeJobBtnText}>🎉 Complete Service & Handover</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBanner}>
                    <Text style={styles.completedBannerText}>
                      ✓ SERVICE HANDOVER COMPLETED · EARNINGS CREDITED
                    </Text>
                  </View>
                )}
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
              <View style={[styles.leadCard, { alignItems: 'center', paddingVertical: 36, backgroundColor: '#1E293B' }]}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🎉</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>All Caught Up!</Text>
                <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
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

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ==================== OFF-CANVAS SIDEBAR DRAWER MODAL (LEFT-DOCKED) ==================== */}
      <Modal
        visible={isSidebarOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.sidebarOverlay}>
          {/* 1. Left-Docked Sidebar Drawer */}
          <View style={styles.sidebarDrawer}>
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarAvatarBox}>
                <Text style={styles.sidebarAvatarText}>{proName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.sidebarName}>{proName}</Text>
                <Text style={styles.sidebarRole}>Working Partner Portal</Text>
                <Text style={styles.sidebarId}>ID: PRO-8841</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSidebarOpen(false)}
                style={styles.sidebarCloseBtn}
              >
                <Text style={styles.sidebarCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarNavList} showsVerticalScrollIndicator={false}>
              {navSections.map((group, gIdx) => (
                <View key={`g-${gIdx}`} style={styles.sidebarGroup}>
                  <Text style={styles.sidebarGroupTitle}>{group.group.toUpperCase()}</Text>
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
                        onPress={() => {
                          setActiveTab(item.id);
                          setIsSidebarOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.sidebarNavIcon}>{item.icon}</Text>
                        <Text style={[styles.sidebarNavLabel, isActive && styles.sidebarNavLabelActive]}>
                          {item.label}
                        </Text>
                        {item.count !== undefined && (
                          <View style={styles.sidebarCountBadge}>
                            <Text style={styles.sidebarCountText}>{item.count}</Text>
                          </View>
                        )}
                        {item.badge && (
                          <View style={styles.sidebarLiveBadge}>
                            <Text style={styles.sidebarLiveText}>{item.badge}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Pinned Bottom Logout Footer */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity
                style={styles.sidebarFooterLogoutBtn}
                onPress={() => {
                  setIsSidebarOpen(false);
                  onLogout();
                }}
                activeOpacity={0.85}
              >
                <View style={styles.logoutIconBadge}>
                  <Text style={styles.sidebarLogoutIconSymbol}>⏻</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Dimmed Dismiss Backdrop on the Right */}
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            onPress={() => setIsSidebarOpen(false)}
            activeOpacity={1}
          />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarToggleText: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  ratingBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  headerTrade: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  headerEmail: {
    color: '#64748B',
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
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  onlineActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  onlineInactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: '#64748B',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlinePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  headerBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  headerLogoutIconBtn: {
    backgroundColor: '#DC2626',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  metricRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  metricSub: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  navTabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1E293B',
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
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  navTabActive: {
    backgroundColor: '#F04400',
    borderColor: '#F04400',
  },
  navTabText: {
    color: '#94A3B8',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  jobCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  jobTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
    marginBottom: 12,
  },
  jobIdText: {
    color: '#F04400',
    fontSize: 12,
    fontWeight: '800',
  },
  jobTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  payoutBadge: {
    alignItems: 'flex-end',
  },
  payoutBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  payoutAmountText: {
    color: '#10B981',
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
    color: '#94A3B8',
    fontSize: 12,
  },
  detailValue: {
    color: '#FFFFFF',
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
    backgroundColor: '#10B981',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  workflowActionBox: {
    marginBottom: 14,
  },
  enRouteBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
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
  },
  arrivedBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  otpSection: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  otpHeaderTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  otpHelperText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
    marginBottom: 10,
  },
  otpVerifiedBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  otpVerifiedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  otpInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  verifyBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  photoUploadSection: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  photoSectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  photoSectionSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoBox: {
    flex: 1,
  },
  photoBoxTitle: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  uploadPlaceholder: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#475569',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  uploadBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  uploadSubtext: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  photoUploadedCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  photoName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  photoTime: {
    color: '#94A3B8',
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
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  sopSection: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  sopHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sopHelperText: {
    color: '#94A3B8',
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
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#CBD5E1',
    fontSize: 12,
    flex: 1,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  completeJobBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeJobBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  completedBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  completedBannerText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '900',
  },
  noJobBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  noJobTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  noJobSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  // Live GPS Card
  liveTrackingCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
  },
  liveEtaBadge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  liveMapGraphic: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  liveMapRouteTitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 14,
  },
  routeProgressBarBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 16,
  },
  routeProgressBarFill: {
    height: 6,
    backgroundColor: '#38BDF8',
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
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  liveStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
    marginBottom: 14,
  },
  liveStatCol: {
    alignItems: 'center',
  },
  liveStatVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  liveStatLbl: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  advanceGpsBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  advanceGpsBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  // Hot Leads
  leadCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
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
    color: '#10B981',
    fontSize: 16,
    fontWeight: '900',
  },
  leadServiceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  leadAddressText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  leadSlotText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  acceptLeadBtn: {
    backgroundColor: '#F04400',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  fleetTrade: {
    color: '#94A3B8',
    fontSize: 11,
  },
  fleetDispatches: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  fleetStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fleetOnJob: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
  },
  fleetAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  fleetStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // Evidence Card
  evidenceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  evidenceHeader: {
    color: '#FFFFFF',
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
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 6,
  },
  evidencePlaceholderBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  evidenceTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  evidenceTime: {
    color: '#64748B',
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
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  calendarTimeCol: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    paddingRight: 10,
    justifyContent: 'center',
  },
  calendarTimeText: {
    color: '#FFFFFF',
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
    backgroundColor: '#10B981',
  },
  calPending: {
    backgroundColor: '#D97706',
  },
  calendarStatusTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  calendarDetailsCol: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  calendarService: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  calendarCustomer: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  calendarPayout: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  // Wallet Card
  walletHeroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  walletHeroLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  walletHeroAmount: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  walletHeroSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 16,
  },
  withdrawBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  bankDetailCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  bankCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankKey: {
    color: '#94A3B8',
    fontSize: 11,
  },
  bankVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Quality & Rating
  ratingOverviewCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ratingBigCol: {
    width: '45%',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#334155',
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
    color: '#94A3B8',
    fontSize: 10,
  },
  ratingBreakdownCol: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: 'center',
    gap: 3,
  },
  breakdownRow: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewCustomer: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewService: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  reviewRatingBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    height: 20,
    justifyContent: 'center',
  },
  reviewRatingBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  reviewComment: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewReplyBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  reviewReplyAuthor: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  reviewReplyText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  replyBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
  },
  replyBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  // Earnings
  earningsSummaryBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsStat: {
    alignItems: 'center',
  },
  earningsStatVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  earningsStatLbl: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  // Invoices
  invoiceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  invoiceId: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  invoiceStatus: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  invoiceCustomer: {
    color: '#94A3B8',
    fontSize: 11,
  },
  invoicePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  invoiceTotal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  downloadInvoiceBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  downloadInvoiceBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // KYC Card
  kycCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kycRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  kycTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  kycStatusOk: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  kycSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  // Off-Canvas Sidebar
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarDrawer: {
    width: Math.min(width * 0.85, 330),
    backgroundColor: '#1E293B',
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 12,
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sidebarRole: {
    color: '#38BDF8',
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
    color: '#94A3B8',
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
    color: '#94A3B8',
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
    color: '#CBD5E1',
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },
  sidebarNavLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  sidebarCountBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sidebarCountText: {
    color: '#FFFFFF',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarFooterLogoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  sidebarLogoutIconSymbol: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  // Photo Preset Modal
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  photoModalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  photoModalClose: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
  },
  photoModalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 14,
  },
  presetList: {
    gap: 10,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetItemTitle: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  replyModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyModalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  replyCustomerComment: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  replyInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
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
    color: '#94A3B8',
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
});
