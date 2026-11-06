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

interface PurifierModel {
  id: string;
  title: string;
  rating: string;
  reviews: string;
  price: number;
  originalPrice: number;
  offerPrice: number;
  offerBanner: string;
  optionsText?: string;
  image: any;
  description: string;
  features: string[];
}

const PURIFIER_MODELS: PurifierModel[] = [
  {
    id: 'native-m1',
    title: 'Native M1',
    rating: '4.86',
    reviews: '162K reviews',
    price: 13499,
    originalPrice: 17499,
    offerPrice: 11799,
    offerBanner: 'Get it at ₹11,799',
    optionsText: '2 options',
    image: require('../../assets/images/native_m1_purifier.jpg'),
    description: 'Revolutionary water purifier with Rapid Reverse Rinse technology. Needs zero filter replacement for 2 whole years.',
    features: [
      'Needs no filter service for 2 years',
      'In-built RO + UV multi-stage filtration',
      'Smart LED ring indicator for real-time filter life',
      '8 Litre food-grade antibacterial tank',
      'Free VIP installation by UC certified master technician',
    ],
  },
  {
    id: 'native-m0',
    title: 'Native M0',
    rating: '4.85',
    reviews: '12K reviews',
    price: 11799,
    originalPrice: 14999,
    offerPrice: 10269,
    offerBanner: 'Get it at ₹10,269',
    optionsText: '2 options',
    image: require('../../assets/images/native_purifier.jpg'),
    description: 'Affordable, premium water purification designed for Indian tap & tanker water with 10-stage RO filtration.',
    features: [
      'Needs no filter service for 2 years',
      'Multi-stage RO + UV purification with mineral retainer',
      'Compact wall-mount design with drip tray',
      '7.5 Litre storage capacity',
      '2-Year comprehensive warranty on all parts & filters',
    ],
  },
  {
    id: 'native-m2-copper',
    title: 'Native M2 Copper',
    rating: '4.92',
    reviews: '62K reviews',
    price: 15499,
    originalPrice: 19999,
    offerPrice: 13999,
    offerBanner: 'Get it at ₹13,999',
    optionsText: 'Alkaline + Copper',
    image: require('../../assets/images/native_m1_purifier.jpg'),
    description: 'Top-of-the-line water purifier with Active Copper & Alkaline infusion for optimum immunity, digestion, and pH 8.5 balance.',
    features: [
      'Needs no filter service for 2 years',
      'Active Copper & Alkaline mineral balance technology',
      'Stainless steel UV chamber & real-time TDS tracker',
      '8 Litre food grade tank',
      'Free doorstep installation & 2-year zero maintenance warranty',
    ],
  },
];

export default function NativeWaterPurifierScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartQuantities, setCartQuantities] = useState<{ [key: string]: number }>({
    'native-m1': 1,
  });
  const [selectedDetailModel, setSelectedDetailModel] = useState<PurifierModel | null>(null);

  // Cart totals
  const totalCartCount = Object.values(cartQuantities).reduce((acc, qty) => acc + qty, 0);
  const totalCartAmount = Object.entries(cartQuantities).reduce((sum, [id, qty]) => {
    const item = PURIFIER_MODELS.find((m) => m.id === id);
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

  const filteredModels = PURIFIER_MODELS.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search in Native Purifier"
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
        {/* 2. HERO HEADER SECTION                                       */}
        {/* ============================================================ */}
        <View style={styles.heroSection}>
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeText}>Native Water</Text>
            <Text style={styles.titleBadgeText}>Purifier</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#7C3AED" />
            <Text style={styles.ratingText}>
              4.84 <Text style={styles.reviewsCount}>(321K bookings)</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewServicesBtn}
            activeOpacity={0.85}
            onPress={() => {
              // Scroll to models
            }}
          >
            <Text style={styles.viewServicesBtnText}>View Services</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================ */}
        {/* 3. BANK OFFERS STRIP                                         */}
        {/* ============================================================ */}
        <View style={styles.offerCard}>
          <View style={styles.offerIconCircle}>
            <Text style={styles.offerPercent}>%</Text>
          </View>
          <View style={styles.offerTextCol}>
            <Text style={styles.offerHeading}>Flat ₹1250 off</Text>
            <Text style={styles.offerSub}>HDFC Bank CC. No cost EMI</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
        </View>

        {/* ============================================================ */}
        {/* 4. MODELS SECTION                                            */}
        {/* ============================================================ */}
        <View style={styles.modelsSection}>
          <Text style={styles.modelsSectionTitle}>Models</Text>

          {filteredModels.map((model) => {
            const qty = cartQuantities[model.id] || 0;
            return (
              <View key={model.id} style={styles.modelCard}>
                {/* Left Information */}
                <View style={styles.modelInfo}>
                  <Text style={styles.modelTitle}>{model.title}</Text>

                  <View style={styles.modelRatingRow}>
                    <Ionicons name="star" size={12} color="#7C3AED" />
                    <Text style={styles.modelRatingText}>
                      {model.rating}{' '}
                      <Text style={{ color: '#64748B', fontWeight: '500' }}>
                        ({model.reviews})
                      </Text>
                    </Text>
                  </View>

                  <Text style={styles.modelPrice}>
                    Starts at ₹{model.price.toLocaleString('en-IN')}
                  </Text>

                  <TouchableOpacity
                    onPress={() => setSelectedDetailModel(model)}
                    style={styles.viewDetailsRow}
                  >
                    <Text style={styles.viewDetailsText}>View details</Text>
                    <Ionicons name="arrow-forward" size={13} color="#7C3AED" />
                  </TouchableOpacity>
                </View>

                {/* Right Image & Add Button Box */}
                <View style={styles.modelVisualCol}>
                  <View style={styles.modelImageBox}>
                    {/* Discount banner on top */}
                    <View style={styles.modelOfferBanner}>
                      <Text style={styles.modelOfferBannerText}>
                        % {model.offerBanner}
                      </Text>
                    </View>
                    <Image
                      source={model.image}
                      style={styles.modelImage}
                      contentFit="cover"
                      transition={150}
                    />
                  </View>

                  {/* Add / Quantity Stepper Button */}
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      activeOpacity={0.8}
                      onPress={() => handleAdd(model.id)}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyStepper}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleRemove(model.id)}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleAdd(model.id)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {model.optionsText && (
                    <Text style={styles.modelOptionsText}>{model.optionsText}</Text>
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
      {/* 7. MODEL DETAILS MODAL                                        */}
      {/* ============================================================ */}
      {selectedDetailModel && (
        <Modal
          visible={!!selectedDetailModel}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedDetailModel(null)}
        >
          <TouchableWithoutFeedback onPress={() => setSelectedDetailModel(null)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedDetailModel.title}</Text>
                    <TouchableOpacity onPress={() => setSelectedDetailModel(null)}>
                      <Ionicons name="close" size={22} color="#0F172A" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalDesc}>{selectedDetailModel.description}</Text>

                  <Text style={styles.modalFeatureHeading}>Highlights & Inclusions:</Text>
                  {selectedDetailModel.features.map((feat, idx) => (
                    <View key={idx} style={styles.modalFeatureRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={styles.modalFeatureText}>{feat}</Text>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.modalAddBtn}
                    onPress={() => {
                      handleAdd(selectedDetailModel.id);
                      setSelectedDetailModel(null);
                    }}
                  >
                    <Text style={styles.modalAddBtnText}>
                      Add to Cart • ₹{selectedDetailModel.offerPrice.toLocaleString('en-IN')}
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
    marginBottom: Spacing.md,
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
  },
  viewServicesBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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

  // Models Section
  modelsSection: {
    marginBottom: Spacing.lg,
  },
  modelsSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  modelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modelInfo: {
    flex: 1,
    paddingRight: 14,
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modelRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  modelRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  modelPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
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
  modelVisualCol: {
    width: 110,
    alignItems: 'center',
  },
  modelImageBox: {
    width: 104,
    height: 94,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  modelOfferBanner: {
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
  modelOfferBannerText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  modelImage: {
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
  modelOptionsText: {
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

