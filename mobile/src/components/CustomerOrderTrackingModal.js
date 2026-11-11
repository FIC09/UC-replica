import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import mobileApi from '../services/apiClient';
import LiveOrderChatModal from './LiveOrderChatModal';
import LiveVoIPCallModal from './LiveVoIPCallModal';

const { width } = Dimensions.get('window');

// 6 Progressive Stages matching Web Application OrderTrackingModal.jsx
export const TRACKING_STAGES = [
  { id: 1, title: 'Confirmed', sub: 'Order received & technician assigned', icon: '✅' },
  { id: 2, title: 'Specialist Assigned', sub: 'Vikram Salvi (Master AC Specialist)', icon: '👷' },
  { id: 3, title: 'On The Way', sub: 'Technician driving to doorstep (8 mins away)', icon: '🛵' },
  { id: 4, title: 'Arrived at Doorstep', sub: 'Technician is at your gate / door', icon: '📍' },
  { id: 5, title: 'Service In Progress', sub: 'Powerjet AC cleaning & inspection underway', icon: '⚡' },
  { id: 6, title: 'Service Completed', sub: 'Quality verified & sanitized', icon: '🎉' },
];

export default function CustomerOrderTrackingModal({
  visible,
  onClose,
  booking,
  onReviewSubmitted,
  onUpdateStage
}) {
  const [liveBooking, setLiveBooking] = useState(booking);

  useEffect(() => {
    if (booking) {
      setLiveBooking((prev) => ({ ...(prev || {}), ...booking }));
    }
  }, [booking?.id, booking?.stage, booking?.status, booking?.assignedPartner]);

  const effectiveBooking = liveBooking || booking;
  const rawId = effectiveBooking?.id || effectiveBooking?.bookingRef || effectiveBooking?.bookingReference || '9410';
  const cleanDisplayId = String(rawId).replace(/^[#\s]+/, '');
  const displayOrderRef = cleanDisplayId.startsWith('UC-') ? cleanDisplayId : `UC-${cleanDisplayId.replace(/^(JOB|LEAD)[-_]?/i, '')}`;

  const stageFromStatus = (status) => {
    if (!status) return null;
    const s = String(status).toLowerCase();
    if (s.includes('completed')) return 6;
    if (s.includes('progress')) return 5;
    if (s.includes('arrived')) return 4;
    if (s.includes('route') || s.includes('way')) return 3;
    if (s.includes('assigned')) return 2;
    if (s.includes('confirm') || s.includes('placed') || s.includes('pending')) return 1;
    return null;
  };

  const initialCalculatedStage = (typeof effectiveBooking?.stage === 'number' && effectiveBooking.stage >= 1 && effectiveBooking.stage <= 6)
    ? effectiveBooking.stage
    : (stageFromStatus(effectiveBooking?.status) || 1);

  const [internalStage, setInternalStage] = useState(initialCalculatedStage);

  const assignedProName =
    effectiveBooking?.assignedPartner ||
    effectiveBooking?.assignedProfessional?.name ||
    (effectiveBooking?.technician?.name && effectiveBooking?.technician?.name !== 'Unassigned' ? effectiveBooking?.technician?.name : '') ||
    (initialCalculatedStage >= 2 ? 'Vikram Salvi' : '');
  const hasAssignedPro = Boolean(assignedProName && assignedProName.trim().length > 0 && assignedProName !== 'Unassigned') || initialCalculatedStage >= 2 || internalStage >= 2;
  const proTrade =
    effectiveBooking?.assignedProfessional?.trade ||
    effectiveBooking?.technician?.trade ||
    effectiveBooking?.service ||
    'Master Specialist';
  const proRating =
    effectiveBooking?.assignedProfessional?.rating ||
    effectiveBooking?.technician?.rating ||
    4.94;

  useEffect(() => {
    const candidateStage = (typeof effectiveBooking?.stage === 'number' && effectiveBooking.stage >= 1 && effectiveBooking.stage <= 6)
      ? effectiveBooking.stage
      : (stageFromStatus(effectiveBooking?.status) || null);
    if (candidateStage && candidateStage !== internalStage) {
      setInternalStage(candidateStage);
    }
  }, [effectiveBooking?.stage, effectiveBooking?.status]);

  const currentStage = (typeof internalStage === 'number' && internalStage >= 1 && internalStage <= 6)
    ? internalStage
    : initialCalculatedStage;

  const otp = effectiveBooking?.otp || effectiveBooking?.safetyPin || '4829';
  const simulatedEta = 8;

  const trackingStages = [
    {
      id: 1,
      title: 'Confirmed',
      sub: hasAssignedPro ? 'Order confirmed & specialist assigned' : 'Order received • Awaiting admin assignment',
      icon: '✅'
    },
    {
      id: 2,
      title: 'Specialist Assigned',
      sub: hasAssignedPro ? `${assignedProName} (${proTrade})` : 'Awaiting admin specialist assignment',
      icon: '👷'
    },
    {
      id: 3,
      title: 'On The Way',
      sub: hasAssignedPro ? `${assignedProName} driving to doorstep (~8 mins away)` : 'Specialist en route to doorstep',
      icon: '🛵'
    },
    {
      id: 4,
      title: 'Arrived at Doorstep',
      sub: hasAssignedPro ? `${assignedProName} is at your gate / door` : 'Specialist at your gate / door',
      icon: '📍'
    },
    {
      id: 5,
      title: 'Service In Progress',
      sub: `${effectiveBooking?.service || 'Doorstep service'} underway`,
      icon: '⚡'
    },
    {
      id: 6,
      title: 'Service Completed',
      sub: 'Quality verified & sanitized',
      icon: '🎉'
    }
  ];

  // Live polling while modal is open to pick up worker stage & status updates in real-time
  useEffect(() => {
    if (!visible) return;
    let isCancelled = false;

    const fetchLatestBooking = async () => {
      try {
        const targetId = effectiveBooking?.id || booking?.id || '9410';
        const cleanTarget = String(targetId).replace(/^[#\s]+/, '').replace(/^JOB-/, '');
        let res = await mobileApi.getBookingById(cleanTarget);
        if (!res || !res.success || !res.booking) {
          const listRes = await mobileApi.getBookings();
          if (listRes && listRes.success && Array.isArray(listRes.bookings) && listRes.bookings.length > 0) {
            const match = listRes.bookings.find(b => b.id === cleanTarget || b.bookingReference === cleanTarget);
            if (match) res = { success: true, booking: match };
          }
        }
        if (!isCancelled && res && res.success && res.booking) {
          const b = res.booking;
          setLiveBooking((prev) => ({ ...(prev || {}), ...b }));
          const remoteStage = (typeof b.stage === 'number' && b.stage >= 1 && b.stage <= 6)
            ? b.stage
            : (stageFromStatus(b.status) || 2);
          if (remoteStage) {
            setInternalStage(remoteStage);
            if (onUpdateStage && remoteStage !== booking?.stage) {
              onUpdateStage(remoteStage);
            }
          }
        }
      } catch (_) {}
    };

    fetchLatestBooking();
    const interval = setInterval(fetchLatestBooking, 1500);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [visible, booking?.id, effectiveBooking?.id]);

  // Live In-App Chat Modal State
  const [showChatModal, setShowChatModal] = useState(false);

  // Real-time Internet VoIP Calling State
  const [showVoipCallModal, setShowVoipCallModal] = useState(false);
  const [voipCallData, setVoipCallData] = useState(null);
  const [isVoipIncoming, setIsVoipIncoming] = useState(false);

  // Initiate Internet Call to Assigned Specialist
  const handleStartCall = async () => {
    if (!hasAssignedPro) {
      Alert.alert(
        'Specialist Assignment Pending',
        'A certified specialist is currently being allocated by dispatch. Voice calling will activate as soon as assignment is confirmed.'
      );
      return;
    }

    const bookingRef = displayOrderRef;
    const callPayload = {
      bookingId: bookingRef,
      callerRole: 'customer',
      callerName: effectiveBooking?.customer || effectiveBooking?.userName || 'Rahul Sharma',
      callerPhone: effectiveBooking?.phone || '+91 98201 44521',
      receiverRole: 'professional',
      receiverName: assignedProName,
      receiverPhone: effectiveBooking?.technician?.phone || '+91 98450 77123',
      service: effectiveBooking?.service || 'Doorstep Service'
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
      console.warn('VoIP Call Start Error:', err.message);
      setVoipCallData({
        ...callPayload,
        callId: `call_${Date.now()}`
      });
      setIsVoipIncoming(false);
      setShowVoipCallModal(true);
    }
  };

  // Real-time listener for incoming internet calls from worker
  useEffect(() => {
    if (!visible || !hasAssignedPro) return;

    const checkIncomingVoip = async () => {
      try {
        if (!showVoipCallModal) {
          const res = await mobileApi.getActiveCall(displayOrderRef);
          if (res && res.success && res.activeCall && res.activeCall.status === 'ringing') {
            if (res.activeCall.callerRole === 'professional' || res.activeCall.callerRole === 'worker') {
              setVoipCallData({
                ...res.activeCall,
                callId: res.activeCall.callId,
                bookingId: displayOrderRef,
                service: effectiveBooking?.service
              });
              setIsVoipIncoming(true);
              setShowVoipCallModal(true);
            }
          }
        }
      } catch (_) {}
    };

    const poller = setInterval(checkIncomingVoip, 1800);
    return () => clearInterval(poller);
  }, [visible, displayOrderRef, showVoipCallModal, hasAssignedPro]);

  // Review Modal State (triggers at Stage 6)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Punctual & On-Time ⏱️', 'Polite & Professional 🤝']);
  const [reviewComment, setReviewComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  // When stage reaches 6, automatically trigger Review
  useEffect(() => {
    if (currentStage === 6 && !hasReviewed) {
      setShowReviewModal(true);
    }
  }, [currentStage, hasReviewed]);

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim() && rating < 5) {
      Alert.alert('Review Feedback', 'Please provide a brief feedback comment.');
      return;
    }
    setHasReviewed(true);
    setShowReviewModal(false);

    const reviewPayload = {
      id: `rev-${Date.now()}`,
      customer: 'Rahul Sharma',
      rating,
      date: 'Just now',
      service: booking?.service || 'Powerjet AC Servicing (Split)',
      comment: reviewComment.trim() || 'Outstanding doorstep service by Vikram. Extremely punctual, wore protective gear and left the AC cooling like brand new!',
      tags: selectedTags,
      technician: 'Vikram Salvi'
    };

    if (onReviewSubmitted) {
      onReviewSubmitted(reviewPayload);
    }

    Alert.alert(
      'Thank You! 🌟',
      `Your ${rating}-star review for Vikram Salvi has been recorded. +25 UC Coins credited to your wallet!`,
      [{ text: 'Great', onPress: onClose }]
    );
  };

  const complimentTags = [
    'Punctual & On-Time ⏱️',
    'Polite & Professional 🤝',
    'Super Clean 🧼',
    'Genuine Parts 🔧',
    'Well Equipped 🧰',
    'High Cooling Assured ❄️'
  ];

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {/* Top Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>Live Specialist Tracking</Text>
            <Text style={styles.headerSub}>Order #{displayOrderRef}</Text>
          </View>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE GPS</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Technician Profile Card / Awaiting Assignment Card */}
          {hasAssignedPro ? (
            <View style={styles.proCard}>
              <View style={styles.proAvatarBox}>
                <Text style={styles.proAvatarText}>{(assignedProName || 'P').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.proNameRow}>
                  <Text style={styles.proName}>{assignedProName}</Text>
                  <View style={styles.proRatingBadge}>
                    <Text style={styles.proRatingText}>★ {proRating}</Text>
                  </View>
                </View>
                <Text style={styles.proTrade}>{proTrade}</Text>
                <Text style={styles.proVehicle}>Specialist assigned by dispatch</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.chatProBtn}
                  onPress={() => setShowChatModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chatProBtnText}>💬 Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callProBtn}
                  onPress={handleStartCall}
                  activeOpacity={0.8}
                >
                  <Text style={styles.callProBtnText}>📞 Call</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.proCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1 }]}>
              <View style={[styles.proAvatarBox, { backgroundColor: '#FEF3C7' }]}>
                <Text style={{ fontSize: 24 }}>⏳</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.proNameRow}>
                  <Text style={[styles.proName, { color: '#92400E' }]}>Allocating Specialist...</Text>
                  <View style={[styles.proRatingBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.proRatingText, { color: '#B45309' }]}>AWAITING</Text>
                  </View>
                </View>
                <Text style={[styles.proTrade, { color: '#B45309', marginTop: 2 }]}>
                  Dispatch team is allocating a certified specialist in Krishnagiri.
                </Text>
                <Text style={[styles.proVehicle, { color: '#78350F', marginTop: 2 }]}>
                  Specialist details, call, and live tracking activate once assigned.
                </Text>
              </View>
            </View>
          )}

          {/* Customer Safety OTP Box */}
          <View style={styles.otpCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.otpLabel}>Customer Safety Start OTP</Text>
              <Text style={styles.otpSub}>
                Share this code with technician at doorstep to authorize work start
              </Text>
            </View>
            <View style={styles.otpBadge}>
              <Text style={styles.otpNumber}>{otp}</Text>
            </View>
          </View>

          {/* When worker marks completed, allow customer to view/rate */}
          {currentStage === 6 && !hasReviewed && (
            <TouchableOpacity
              style={styles.customerRateBtn}
              onPress={() => setShowReviewModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.customerRateBtnText}>⭐ Rate Specialist & Service</Text>
            </TouchableOpacity>
          )}

          {/* 6 Stage Timeline Checklist */}
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Order Progress</Text>
            {trackingStages.map((st, idx) => {
              const isPast = st.id < currentStage;
              const isCurrent = st.id === currentStage;

              return (
                <View key={st.id} style={styles.timelineRow}>
                  <View style={styles.timelineLeftCol}>
                    <View
                      style={[
                        styles.timelineIconCircle,
                        isPast && styles.timelineIconPast,
                        isCurrent && styles.timelineIconCurrent,
                      ]}
                    >
                      <Text style={styles.timelineIconText}>
                        {isPast ? '✓' : st.icon}
                      </Text>
                    </View>
                    {idx < TRACKING_STAGES.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          isPast && styles.timelineConnectorActive,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineRightCol}>
                    <Text
                      style={[
                        styles.timelineStageTitle,
                        isCurrent && styles.timelineStageTitleActive,
                      ]}
                    >
                      {st.title}
                    </Text>
                    <Text style={styles.timelineStageSub}>{st.sub}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Real-time Work Verification Photos from Specialist */}
          {(booking?.prePhoto || booking?.postPhoto || booking?.beforeWorkPhoto || booking?.afterWorkPhoto) && (
            <View style={styles.evidenceCard}>
              <Text style={styles.evidenceTitle}>📸 Specialist Work Proof Photos</Text>
              <View style={styles.evidenceRow}>
                {(booking?.prePhoto || booking?.beforeWorkPhoto) && (
                  <View style={styles.evidenceItem}>
                    <Text style={styles.evidenceItemTitle}>1. Pre-Service Baseline</Text>
                    <View style={styles.evidencePhotoBox}>
                      <Text style={{ fontSize: 24 }}>📷</Text>
                      <Text style={styles.evidenceName}>
                        {booking?.prePhoto?.name || booking?.beforeWorkPhoto?.fileName || 'Inspection Photo'}
                      </Text>
                      <View style={styles.evidenceTag}>
                        <Text style={styles.evidenceTagText}>✓ Verified Baseline</Text>
                      </View>
                    </View>
                  </View>
                )}
                {(booking?.postPhoto || booking?.afterWorkPhoto) && (
                  <View style={styles.evidenceItem}>
                    <Text style={styles.evidenceItemTitle}>2. Clean Quality Proof</Text>
                    <View style={styles.evidencePhotoBox}>
                      <Text style={{ fontSize: 24 }}>✨</Text>
                      <Text style={styles.evidenceName}>
                        {booking?.postPhoto?.name || booking?.afterWorkPhoto?.fileName || 'Completed Photo'}
                      </Text>
                      <View style={styles.evidenceTag}>
                        <Text style={styles.evidenceTagText}>✓ Quality Certified</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Booking Summary Box */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Service Details</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Service Booked:</Text>
              <Text style={styles.summaryVal}>{booking?.service || 'Powerjet AC Servicing (Split)'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Total Amount:</Text>
              <Text style={[styles.summaryVal, { color: '#F04400', fontWeight: '800' }]}>
                ₹{booking?.price || 750} (Paid via UPI)
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Customer Address:</Text>
              <Text style={styles.summaryVal}>
                {booking?.address || 'Flat 402, Sea Face Apts, Bandra West, Mumbai'}
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* WORKER REVIEW POPUP MODAL (When Stage reaches Completed) */}
        <Modal
          visible={showReviewModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowReviewModal(false)}
        >
          <View style={styles.reviewModalOverlay}>
            <View style={styles.reviewModalCard}>
              <View style={styles.reviewModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewModalTitle}>Rate Your Experience</Text>
                  <Text style={styles.reviewModalSub}>How was Vikram Salvi's service?</Text>
                </View>
                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                  <Text style={styles.reviewCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Specialist Header in Review */}
              <View style={styles.reviewProBanner}>
                <View style={styles.proAvatarBox}>
                  <Text style={styles.proAvatarText}>V</Text>
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.proName}>Vikram Salvi</Text>
                  <Text style={styles.proTrade}>Master AC Specialist & Electrician</Text>
                </View>
              </View>

              {/* 5-Star Rating Picker */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={`star-${star}`}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Text style={[styles.starIcon, rating >= star ? styles.starActive : styles.starInactive]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabelText}>
                {rating === 5 ? 'Excellent! Outstanding Work! 🌟' :
                 rating === 4 ? 'Very Good & Professional 😊' :
                 rating === 3 ? 'Good Job 🙂' :
                 rating === 2 ? 'Fair Experience 😐' : 'Needs Improvement 🙁'}
              </Text>

              {/* Compliment Tags */}
              <Text style={styles.tagsSectionTitle}>What made it great?</Text>
              <View style={styles.tagsWrap}>
                {complimentTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagPill, isSelected && styles.tagPillActive]}
                      onPress={() => handleToggleTag(tag)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.tagPillText, isSelected && styles.tagPillTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Feedback Input */}
              <TextInput
                style={styles.reviewInput}
                placeholder="Write a feedback note for Vikram... (e.g. Clean work, arrived on time)"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />

              {/* Submit Review Button */}
              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitReview}
                activeOpacity={0.85}
              >
                <Text style={styles.submitReviewBtnText}>Submit Review & Earn +25 Coins 🎉</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Real-time In-App Chat Modal */}
        <LiveOrderChatModal
          visible={showChatModal}
          onClose={() => setShowChatModal(false)}
          booking={effectiveBooking}
          userRole="customer"
        />

        {/* Real-time Internet VoIP Voice Call Modal */}
        <LiveVoIPCallModal
          visible={showVoipCallModal}
          onClose={() => setShowVoipCallModal(false)}
          callData={voipCallData}
          isIncoming={isVoipIncoming}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  scrollBody: {
    flex: 1,
    padding: 16,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  proAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F04400',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proAvatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  proNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  proRatingBadge: {
    backgroundColor: '#FFF8D1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proRatingText: {
    color: '#8A6D00',
    fontSize: 11,
    fontWeight: '800',
  },
  proTrade: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  proVehicle: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 3,
  },
  chatProBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  chatProBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  callProBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    cursor: 'pointer'
  },
  callProBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  otpSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 3,
  },
  otpBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  otpNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  mapContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  mapOverlayTop: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
  },
  mapStatusText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  simRouteBox: {
    paddingVertical: 14,
  },
  roadLine: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    position: 'relative',
    marginHorizontal: 16,
    justifyContent: 'center',
  },
  scooterMarker: {
    position: 'absolute',
    top: -15,
  },
  destinationMarker: {
    position: 'absolute',
    right: -10,
    top: -15,
  },
  roadLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  roadLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  customerRateBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  customerRateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 32,
  },
  timelineIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconPast: {
    backgroundColor: '#10B981',
  },
  timelineIconCurrent: {
    backgroundColor: '#F04400',
  },
  timelineIconText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timelineConnector: {
    width: 2,
    height: 34,
    backgroundColor: '#E2E8F0',
  },
  timelineConnectorActive: {
    backgroundColor: '#10B981',
  },
  timelineRightCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 18,
  },
  timelineStageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  timelineStageTitleActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  timelineStageSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  evidenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  evidenceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  evidenceItem: {
    flex: 1,
  },
  evidenceItemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  evidencePhotoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  evidenceName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 4,
    textAlign: 'center',
  },
  evidenceTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  evidenceTagText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryKey: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  // Review Modal Styles
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  reviewModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  reviewCloseBtn: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
    padding: 4,
  },
  reviewProBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 34,
  },
  starActive: {
    color: '#F59E0B',
  },
  starInactive: {
    color: '#CBD5E1',
  },
  ratingLabelText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  tagsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tagPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  tagPillTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 64,
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: '#F04400',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

