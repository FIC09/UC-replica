import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';

interface LockModel {
  id: string;
  title: string;
  rating: string;
  reviews: string;
  price: number;
  originalPrice: number;
  offerPrice: number;
  offerBanner: string | null;
  optionsText?: string | null;
  bullets: string[];
  image: any;
  description: string;
  features: string[];
}

const LOCK_MODELS: LockModel[] = [
  {
    id: 'native-lock-pro',
    title: 'Native Lock Pro',
    rating: '4.80',
    reviews: '22K reviews',
    price: 15000,
    originalPrice: 18999,
    offerPrice: 13500,
    offerBanner: 'Get it at ₹13,500',
    optionsText: '2 options',
    bullets: [
      '7 ways to unlock',
      'Unlock request with visitor photo on every doorbell press',
    ],
    image: require('../../assets/images/native_smart_lock.jpg'),
    description: 'Comprehensive 7-in-1 smart lock with built-in wide-angle HD camera doorbell, visitor snapshot alert, instant app unlock, and anti-tamper alarm.',
    features: [
      'Built-in HD camera doorbell with two-way audio',
      'Visitor photo sent straight to your phone',
      '7 Unlocking modes: Fingerprint, Passcode, App, RFID, OTP, Key & Bluetooth',
      'Bank-grade AES 128-bit encryption',
      'Free doorstep installation by UC certified master carpenter',
      '2-Year on-site replacement warranty',
    ],
  },
  {
    id: 'native-lock-ultra',
    title: 'Native Lock Ultra',
    rating: '4.67',
    reviews: '2K reviews',
    price: 22499,
    originalPrice: 26999,
    offerPrice: 20499,
    offerBanner: 'Get it at ₹20,499',
    optionsText: '2 options',
    bullets: [
      '9 ways to unlock including face unlock',
      'Unlock request with visitor photo on every doorbell press',
    ],
    image: require('../../assets/images/native_smart_lock_fill.jpg'),
    description: 'Flagship smart lock with 3D Structured Light Facial Recognition. Touchless instant unlocking as you approach the door, even in pitch dark.',
    features: [
      '3D Structured Light Face Unlock (0.4 sec recognition)',
      'Built-in HD video doorbell with live streaming',
      '9 Unlocking modes including Face, Palm, Fingerprint & App',
      'Lithium-ion rechargeable battery with 8-month standby',
      'Free VIP installation & 3-year doorstep replacement guarantee',
    ],
  },
  {
    id: 'native-lock-s',
    title: 'Native Lock S',
    rating: '4.68',
    reviews: '2K reviews',
    price: 8999,
    originalPrice: 11999,
    offerPrice: 8999,
    offerBanner: null,
    optionsText: null,
    bullets: [
      '5 ways to unlock',
      'Install on any door & go keyless',
    ],
    image: require('../../assets/images/native_lock_s.jpg'),
    description: 'Ultra-sleek, minimalist smart lock designed to fit on any wooden or metal door without changing existing handles. 100% keyless convenience.',
    features: [
      '5 Unlocking modes: Fast Biometric Fingerprint, Backlit PIN, RFID, App & Mechanical Key',
      'Fits on any door (30mm - 70mm thickness)',
      'Anti-peep fake PIN protection to keep password secret',
      'Free doorstep installation within 2 hours',
    ],
  },
];

export default function NativeSmartLocksScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartQuantities, setCartQuantities] = useState<{ [key: string]: number }>({
    'native-lock-pro': 1,
  });
  const [selectedDetailLock, setSelectedDetailLock] = useState<LockModel | null>(null);

  // Cart totals
  const totalCartCount = Object.values(cartQuantities).reduce((acc, qty) => acc + qty, 0);
  const totalCartAmount = Object.entries(cartQuantities).reduce((sum, [id, qty]) => {
    const item = LOCK_MODELS.find((m) => m.id === id);
    return sum + (item ? item.offerPrice * qty : 0);
  }, 0);

  const handleAdd = (id: string) => {
    setCartQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemove = (id: string) => {
    setCartQuantities((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const filteredLocks = LOCK_MODELS.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.bullets.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* ============================================================ */}
      {/* 1. TOP HEADER BAR                                             */}
      {/* ============================================================ */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Location display */}
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={14} color="#7C3AED" />
          <Text style={styles.locationText} numberOfLines={1}>
            Rayakottai Road, Krishnagiri
          </Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in Native Smart Locks"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Cart Icon with badge */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Ionicons name="bag-handle-outline" size={22} color="#0F172A" />
          {totalCartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* 2. HERO SHOWCASE WITH VIDEO BANNER                           */}
        {/* ============================================================ */}
        <View style={styles.heroSection}>
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeText}>Native Smart</Text>
            <Text style={styles.titleBadgeText}>Locks</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#7C3AED" />
            <Text style={styles.ratingText}>
              4.77 <Text style={styles.reviewsCount}>(28K bookings)</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewServicesBtn}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <Text style={styles.viewServicesBtnText}>View Services</Text>
          </TouchableOpacity>

          {/* Big Showcase / Video Banner matching web screenshot */}
          <View style={[styles.videoBannerContainer, Shadows.card]}>
            <Image
              source={require('../../assets/images/native_lock_video_banner.jpg')}
              style={styles.videoBannerImage}
              contentFit="cover"
              transition={200}
            />

            {/* Dark vignette overlay */}
            <View style={styles.videoVignette} />

            {/* Center Play Button Overlay */}
            <TouchableOpacity style={styles.playButton} activeOpacity={0.9}>
              <Ionicons name="play" size={24} color="#0F172A" style={{ marginLeft: 3 }} />
            </TouchableOpacity>

            {/* Left Circular Carousel Nav Arrow */}
            <TouchableOpacity style={styles.carouselLeftArrow} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={18} color="#0F172A" />
            </TouchableOpacity>

            {/* Right Circular Carousel Nav Arrow */}
            <TouchableOpacity style={styles.carouselRightArrow} activeOpacity={0.8}>
              <Ionicons name="chevron-forward" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================ */}
        {/* 3. BANK OFFERS STRIP                                         */}
        {/* ============================================================ */}
        <View style={styles.offerCard}>
          <View style={styles.offerIconCircle}>
            <Text style={styles.offerPercent}>%</Text>
          </View>
          <View style={styles.offerTextCol}>
            <Text style={styles.offerHeading}>Flat 10% off upto ₹1250</Text>
            <Text style={styles.offerSub}>HDFC Bank Full Swipe Offer</Text>
          </View>
          <Text style={styles.offerPagination}>1/7</Text>
        </View>

        {/* ============================================================ */}
        {/* 4. FEATURE LOCK SECTION                                      */}
        {/* ============================================================ */}
        <View style={styles.featureLockSection}>
          <Text style={styles.sectionTitle}>Feature lock</Text>

          {filteredLocks.map((lock) => {
            const qty = cartQuantities[lock.id] || 0;
            return (
              <View key={lock.id} style={styles.lockCard}>
                {/* Left Information & Bullets */}
                <View style={styles.lockInfo}>
                  <Text style={styles.lockTitle}>{lock.title}</Text>

                  <View style={styles.lockRatingRow}>
                    <Ionicons name="star" size={12} color="#7C3AED" />
                    <Text style={styles.lockRatingText}>
                      {lock.rating}{' '}
                      <Text style={{ color: '#64748B', fontWeight: '500' }}>
                        ({lock.reviews})
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.lockPrice}>
                    {lock.price >= 15000
                      ? `Starts at ₹${lock.price.toLocaleString('en-IN')}`
                      : `₹${lock.price.toLocaleString('en-IN')}`}
                  </Text>

                  {/* Bullet points */}
                  <View style={styles.bulletList}>
                    {lock.bullets.map((b, bIdx) => (
                      <View key={bIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedDetailLock(lock)}
                    style={styles.viewDetailsRow}
                  >
                    <Text style={styles.viewDetailsText}>View details</Text>
                    <Ionicons name="arrow-forward" size={13} color="#7C3AED" />
                  </TouchableOpacity>
                </View>

                {/* Right Image & Add Button Box */}
                <View style={styles.lockVisualCol}>
                  <View style={styles.lockImageBox}>
                    {lock.offerBanner && (
                      <View style={styles.lockOfferBanner}>
                        <Text style={styles.lockOfferBannerText}>
                          % {lock.offerBanner}
                        </Text>
                      </View>
                    )}
                    <Image
                      source={lock.image}
                      style={styles.lockImage}
                      contentFit="cover"
                      transition={150}
                    />
                  </View>

                  {/* Add / Stepper Button */}
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      activeOpacity={0.8}
                      onPress={() => handleAdd(lock.id)}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyStepper}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleRemove(lock.id)}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleAdd(lock.id)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {lock.optionsText && (
                    <Text style={styles.lockOptionsText}>{lock.optionsText}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ============================================================ */}
        {/* 5. BRAND / UC PROMISE CARD                                   */}
        {/* ============================================================ */}
        <View style={styles.promiseCard}>
          <View style={styles.promiseHeader}>
            <Text style={styles.promiseTitle}>UC Promise</Text>
            <View style={styles.assuredBadge}>
              <Ionicons name="checkmark" size={11} color="#7C3AED" />
              <Text style={styles.assuredBadgeText}>ASSURED</Text>
            </View>
          </View>

          <View style={styles.promiseList}>
            <View style={styles.promiseItem}>
              <Ionicons name="checkmark-sharp" size={16} color="#0F172A" style={styles.checkIcon} />
              <Text style={styles.promiseItemText}>Verified Professionals</Text>
            </View>
            <View style={styles.promiseItem}>
              <Ionicons name="checkmark-sharp" size={16} color="#0F172A" style={styles.checkIcon} />
              <Text style={styles.promiseItemText}>Hassle Free Booking</Text>
            </View>
            <View style={styles.promiseItem}>
              <Ionicons name="checkmark-sharp" size={16} color="#0F172A" style={styles.checkIcon} />
              <Text style={styles.promiseItemText}>Transparent Pricing</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ============================================================ */}
      {/* 6. BOTTOM STICKY CART FOOTER BAR                              */}
      {/* ============================================================ */}
      {totalCartCount > 0 && (
        <View style={[styles.bottomCartBar, Shadows.cardHover]}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartCountText}>Cart ({totalCartCount} items)</Text>
            <Text style={styles.cartAmountText}>
              ₹{totalCartAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            activeOpacity={0.88}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* ============================================================ */}
      {/* 7. LOCK DETAILS MODAL                                         */}
      {/* ============================================================ */}
      {selectedDetailLock && (
        <Modal
          visible={!!selectedDetailLock}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedDetailLock(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedDetailLock(null)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedDetailLock.title}</Text>
                    <TouchableOpacity onPress={() => setSelectedDetailLock(null)}>
                      <Ionicons name="close" size={22} color="#0F172A" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalDesc}>{selectedDetailLock.description}</Text>

                  <Text style={styles.modalFeatureHeading}>Highlights & Unlocking Modes:</Text>
                  {selectedDetailLock.features.map((feat, idx) => (
                    <View key={idx} style={styles.modalFeatureRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.modalFeatureText}>{feat}</Text>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.modalAddBtn}
                    onPress={() => {
                      handleAdd(selectedDetailLock.id);
                      setSelectedDetailLock(null);
                    }}
                  >
                    <Text style={styles.modalAddBtnText}>
                      Add to Cart • ₹{selectedDetailLock.offerPrice.toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 110,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  // Hero Section
  heroSection: {
    marginBottom: Spacing.lg,
  },
  titleBadge: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  titleBadgeText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewsCount: {
    color: '#64748B',
    fontWeight: '500',
  },
  viewServicesBtn: {
    backgroundColor: '#5E3BEE',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  viewServicesBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Video Banner Container
  videoBannerContainer: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  videoBannerImage: {
    width: '100%',
    height: '100%',
  },
  videoVignette: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  carouselLeftArrow: {
    position: 'absolute',
    top: '50%',
    left: 10,
    transform: [{ translateY: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  carouselRightArrow: {
    position: 'absolute',
    top: '50%',
    right: 10,
    transform: [{ translateY: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Bank Offer Card
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: Spacing.lg,
  },
  offerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  offerPercent: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 14,
  },
  offerTextCol: {
    flex: 1,
  },
  offerHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  offerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  offerPagination: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },

  // Feature Lock Section
  featureLockSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  lockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lockInfo: {
    flex: 1,
    paddingRight: 14,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  lockRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  lockRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  lockPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  bulletList: {
    gap: 4,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  lockVisualCol: {
    width: 110,
    alignItems: 'center',
  },
  lockImageBox: {
    width: 104,
    height: 94,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  lockOfferBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#5E3BEE',
    paddingVertical: 3,
    paddingHorizontal: 4,
    zIndex: 2,
    alignItems: 'center',
  },
  lockOfferBannerText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  lockImage: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: '#5E3BEE',
    borderRadius: 8,
    paddingVertical: 5,
    width: 84,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5E3BEE',
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5E3BEE',
    width: 84,
    height: 30,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    paddingHorizontal: 6,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5E3BEE',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5E3BEE',
  },
  lockOptionsText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },

  // UC Promise Card
  promiseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: Spacing.xl,
  },
  promiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  promiseTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  assuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  assuredBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#7C3AED',
  },
  promiseList: {
    gap: 10,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    width: 18,
  },
  promiseItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },

  // Bottom Sticky Cart Bar
  bottomCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartInfo: {
    gap: 2,
  },
  cartCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  cartAmountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#5E3BEE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Details Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 16,
  },
  modalFeatureHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  modalFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalFeatureText: {
    fontSize: 13,
    color: '#334155',
  },
  modalAddBtn: {
    backgroundColor: '#5E3BEE',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
  },
  modalAddBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

