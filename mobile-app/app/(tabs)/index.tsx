import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';
import {
  CustomHeader,
  SearchBar,
  CategoryCard,
  ServiceCard,
  PromotionalBanner,
  BookingCard,
  StatusBadge,
  PrimaryButton,
  SecondaryButton,
  RatingComponent,
  PriceDisplay,
  ApplianceRepairModal,
  ApplianceItem,
  ElectricianPlumberCarpenterModal,
  EPCItem,
  BathroomKitchenCleaningModal,
  CleaningOptionItem,
  CleaningModal,
  CleaningItem,
  BeautyDoorstepSection,
} from '../../components';
import {
  DEMO_CATEGORIES,
  DEMO_PROMOTIONS,
  POPULAR_SERVICES,
  RECOMMENDED_SERVICES,
  FREQUENTLY_BOOKED_SERVICES,
  ALL_SERVICES,
  DEMO_COUPONS,
  AVAILABLE_ADDRESSES,
  DEMO_NOTIFICATIONS,
  DEMO_BOOKINGS,
  DEMO_USER,
} from '../../data';
import { Service, Category, Promotion, Coupon, Address } from '../../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();

  // Top Nav Switcher: Homes | Native | Beauty
  const [activeNavTab, setActiveNavTab] = useState<'homes' | 'native' | 'beauty'>('homes');

  useEffect(() => {
    if (params.tab === 'beauty' || params.tab === 'native' || params.tab === 'homes') {
      setActiveNavTab(params.tab as 'homes' | 'native' | 'beauty');
    }
  }, [params.tab]);

  // 1. Header & Location State
  const [selectedAddress, setSelectedAddress] = useState<Address>(AVAILABLE_ADDRESSES[0]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  // 2. Search & Suggestions State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Service[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // 3. Carousel State
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const promoScrollRef = useRef<any>(null);

  // 4. Cart / Added Services State
  const [cartServiceIds, setCartServiceIds] = useState<string[]>(['srv-1']);
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [applianceModalVisible, setApplianceModalVisible] = useState(false);
  const [epcModalVisible, setEpcModalVisible] = useState(false);
  const [cleaningModalVisible, setCleaningModalVisible] = useState(false);
  const [fullHomeModalVisible, setFullHomeModalVisible] = useState(false);

  // 5. Offers Applied State
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>('FESTIVE500');

  // Quick search keywords
  const quickSearchChips = [
    'AC Power Jet',
    'Bathroom Cleaning',
    'Electrician',
    'Plumber',
    'Native Purifier',
    'Smart Lock',
    'Pest Control',
    'Painter',
  ];

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Search input handler with instant local suggestions
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const query = text.toLowerCase().trim();
    const matches = ALL_SERVICES.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        (s.description && s.description.toLowerCase().includes(query))
    );
    setSearchSuggestions(matches.slice(0, 5));
  };

  // Auto-scroll promotional banner every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (searchQuery.trim().length > 0) return; // Pause auto-scroll during search
      setActivePromoIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % DEMO_PROMOTIONS.length;
        promoScrollRef.current?.scrollTo({
          x: nextIndex * (width - 40),
          animated: true,
        });
        return nextIndex;
      });
    }, 4200);

    return () => clearInterval(interval);
  }, [searchQuery]);

  // Add / Remove from Cart
  const handleToggleCart = (service: Service) => {
    if (cartServiceIds.includes(service.id)) {
      setCartServiceIds(cartServiceIds.filter((id) => id !== service.id));
    } else {
      setCartServiceIds([...cartServiceIds, service.id]);
    }
  };

  // Open Service Detail Modal
  const handleOpenService = (service: Service) => {
    setActiveModalService(service);
    setServiceModalVisible(true);
  };

  // Filter category selection
  const handleCategoryPress = (category: Category) => {
    // If Appliance Repair & Service or AC Services is clicked, open the ApplianceRepairModal
    if (
      category.slug === 'appliances' ||
      category.slug === 'ac-services' ||
      category.name.toLowerCase().includes('appliance')
    ) {
      setApplianceModalVisible(true);
      return;
    }

    // If Electrician, Plumber & Carpenters is clicked, open the ElectricianPlumberCarpenterModal
    if (
      category.slug === 'quick-repairs' ||
      category.slug === 'electrical' ||
      category.slug === 'plumbing' ||
      category.slug === 'carpentry' ||
      category.name.toLowerCase().includes('electrician') ||
      category.name.toLowerCase().includes('plumber') ||
      category.name.toLowerCase().includes('carpenter')
    ) {
      setEpcModalVisible(true);
      return;
    }

    // If Bathroom & Kitchen cleaning is clicked, open the BathroomKitchenCleaningModal
    if (
      category.slug === 'bathroom-kitchen' ||
      category.slug === 'bathroom-kitchen-cleaning' ||
      category.name.toLowerCase().includes('bathroom') ||
      category.name.toLowerCase().includes('kitchen')
    ) {
      setCleaningModalVisible(true);
      return;
    }

    // If Cleaning is clicked, open the CleaningModal (Full Home / Cockroach Control)
    if (
      category.slug === 'cleaning' ||
      category.slug === 'full-home-cleaning' ||
      category.name.trim().toLowerCase() === 'cleaning'
    ) {
      setFullHomeModalVisible(true);
      return;
    }

    // If Native Water Purifier is clicked, navigate directly to /services/native-purifier
    if (
      category.slug === 'native-purifier' ||
      category.slug === 'purifiers' ||
      category.name.toLowerCase().includes('water purifier') ||
      category.name.toLowerCase().includes('purifier')
    ) {
      router.push('/services/native-purifier');
      return;
    }

    // If Native Smart Locks is clicked, navigate directly to /services/native-smart-locks
    if (
      category.slug === 'smart-locks' ||
      category.slug === 'native-smart-locks' ||
      category.name.toLowerCase().includes('smart lock') ||
      category.name.toLowerCase().includes('lock')
    ) {
      router.push('/services/native-smart-locks');
      return;
    }

    // If Beauty, Women's Salon or Men's Salon is clicked, switch to Beauty tab
    if (
      category.slug === 'womens-salon' ||
      category.slug === 'mens-salon' ||
      category.slug === 'beauty' ||
      category.name.toLowerCase().includes('salon') ||
      category.name.toLowerCase().includes('beauty')
    ) {
      setActiveNavTab('beauty');
      return;
    }

    if (selectedCategoryFilter === category.slug) {
      setSelectedCategoryFilter('all');
    } else {
      setSelectedCategoryFilter(category.slug);
    }
  };

  const handleSelectAppliance = (item: ApplianceItem) => {
    router.push({
      pathname: '/explore/search',
      params: { q: item.searchQuery || item.name },
    });
  };

  const handleSelectEPC = (item: EPCItem) => {
    router.push({
      pathname: '/explore/search',
      params: { q: item.searchQuery || item.name },
    });
  };

  const handleSelectCleaningOption = (item: CleaningOptionItem) => {
    router.push({
      pathname: '/explore/search',
      params: { q: item.searchQuery || item.title },
    });
  };

  const handleSelectCleaningChoice = (item: CleaningItem) => {
    router.push({
      pathname: '/explore/search',
      params: { q: item.searchQuery || item.name },
    });
  };

  // Apply Coupon
  const handleApplyCoupon = (coupon: Coupon) => {
    if (appliedCouponCode === coupon.code) {
      setAppliedCouponCode(null);
      Alert.alert('Coupon Removed', `Code ${coupon.code} was removed.`);
    } else {
      setAppliedCouponCode(coupon.code);
      Alert.alert('Coupon Applied! 🎉', `${coupon.title}: ${coupon.description}`);
    }
  };

  // Filtered services if category filter is active
  const filteredCategoryServices =
    selectedCategoryFilter === 'all'
      ? []
      : ALL_SERVICES.filter((s) => s.categorySlug === selectedCategoryFilter);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ============================================================ */}
      {/* SECTION 1: HEADER (Logo, Location, Notification & Profile)  */}
      {/* ============================================================ */}
      <CustomHeader
        location={selectedAddress.label}
        subLocation={selectedAddress.city}
        notificationCount={2}
        onLocationPress={() => setLocationModalVisible(true)}
        onNotificationPress={() => setNotificationModalVisible(true)}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />

      {/* ============================================================ */}
      {/* TOP NAVIGATION TABS: Homes | Native | Beauty                */}
      {/* ============================================================ */}
      <View style={styles.topTabBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveNavTab('homes')}
          style={[styles.topTabButton, activeNavTab === 'homes' && styles.topTabButtonActive]}
        >
          <Text style={[styles.topTabText, activeNavTab === 'homes' && styles.topTabTextActive]}>
            Homes
          </Text>
          {activeNavTab === 'homes' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveNavTab('native')}
          style={[styles.topTabButton, activeNavTab === 'native' && styles.topTabButtonActive]}
        >
          <Text style={[styles.topTabText, activeNavTab === 'native' && styles.topTabTextActive]}>
            Native
          </Text>
          {activeNavTab === 'native' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveNavTab('beauty')}
          style={[styles.topTabButton, activeNavTab === 'beauty' && styles.topTabButtonActive]}
        >
          <Text style={[styles.topTabText, activeNavTab === 'beauty' && styles.topTabTextActive]}>
            Beauty
          </Text>
          {activeNavTab === 'beauty' && <View style={styles.topTabIndicator} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeNavTab === 'beauty' ? (
          <BeautyDoorstepSection
            onSelectTile={(tile) => {
              router.push({
                pathname: '/explore/search',
                params: { q: tile.searchQuery },
              });
            }}
            onSelectService={handleOpenService}
            onToggleCart={handleToggleCart}
            cartServiceIds={cartServiceIds}
            onSwitchToHomes={() => setActiveNavTab('homes')}
          />
        ) : activeNavTab === 'native' ? (
          <View style={styles.nativeContainer}>
            <View style={styles.nativeHeroBanner}>
              <View style={styles.nativeBadgePill}>
                <Ionicons name="sparkles" size={12} color="#9333EA" />
                <Text style={styles.nativeBadgePillText}>Smart Living by Urban Company</Text>
              </View>
              <Text style={styles.nativeHeroTitle}>Native Devices</Text>
              <Text style={styles.nativeHeroSub}>
                Engineered appliances with zero maintenance and smart connected security.
              </Text>
            </View>

            {/* Purifier Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/services/native-purifier')}
              style={[styles.nativeHeroCard, Shadows.elevated]}
            >
              <Image
                source={require('../../assets/images/native_purifier.jpg')}
                style={styles.nativeCardImage}
                resizeMode="cover"
              />
              <View style={styles.nativeCardContent}>
                <View style={styles.nativeTagBadge}>
                  <Text style={styles.nativeTagText}>2-YEAR ZERO SERVICE</Text>
                </View>
                <Text style={styles.nativeCardHeading}>Native Water Purifier M1 & M2</Text>
                <Text style={styles.nativeCardDescription}>
                  Needs no filter service for 2 full years. RO + UV + Alkaline Copper.
                </Text>
                <View style={styles.nativePriceRow}>
                  <Text style={styles.nativePriceText}>Starts at ₹13,499</Text>
                  <Text style={styles.nativeActionLink}>View Models →</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Smart Locks Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/services/native-smart-locks')}
              style={[styles.nativeHeroCard, Shadows.elevated]}
            >
              <Image
                source={require('../../assets/images/native_smart_lock.jpg')}
                style={styles.nativeCardImage}
                resizeMode="cover"
              />
              <View style={styles.nativeCardContent}>
                <View style={[styles.nativeTagBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.nativeTagText, { color: '#B45309' }]}>6-IN-1 SMART UNLOCK</Text>
                </View>
                <Text style={styles.nativeCardHeading}>Native Smart Door Locks</Text>
                <Text style={styles.nativeCardDescription}>
                  Fingerprint, passcode, RFID card & built-in video camera chime.
                </Text>
                <View style={styles.nativePriceRow}>
                  <Text style={styles.nativePriceText}>Starts at ₹7,999</Text>
                  <Text style={styles.nativeActionLink}>View Models →</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <>
        {/* ============================================================ */}
        {/* SECTION 2: WELCOME SECTION (Personalized Greeting)          */}
        {/* ============================================================ */}
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeTextCol}>
            <View style={styles.welcomeBadgeRow}>
              <View style={styles.badgePill}>
                <Ionicons name="sparkles" size={11} color={Colors.primary} />
                <Text style={styles.badgePillText}>45-Min Arrival Hub</Text>
              </View>
              <View style={styles.memberPill}>
                <Ionicons name="shield-checkmark" size={11} color={Colors.emeraldDark} />
                <Text style={styles.memberPillText}>Verified Pros</Text>
              </View>
            </View>

            <Text style={styles.greetingTitle}>
              {getGreeting()}, {DEMO_USER.name} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              What home service can we help you with today?
            </Text>
          </View>
        </View>

        {/* ============================================================ */}
        {/* SECTION 3: INTERACTIVE SEARCH BAR & SUGGESTIONS DROPDOWN    */}
        {/* ============================================================ */}
        <View style={styles.searchSectionWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search 'AC Repair', 'Plumber', 'Cleaning'..."
            showFilterButton={true}
            onFilterPress={() =>
              Alert.alert('Search Filters', 'Filter by: 1. Top Rated ★4.8+  2. Instant 45-Min Arrival  3. Festive Deals')
            }
          />

          {/* Real-time search suggestions overlay */}
          {searchQuery.trim().length > 0 && (
            <View style={[styles.suggestionsBox, Shadows.elevated]}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>
                  {searchSuggestions.length > 0
                    ? `Matching Services (${searchSuggestions.length})`
                    : 'No direct matches found'}
                </Text>
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>Clear</Text>
                </TouchableOpacity>
              </View>

              {searchSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSearchQuery('');
                    handleOpenService(item);
                  }}
                  style={styles.suggestionRow}
                >
                  <Image source={item.image} style={styles.suggestionImage} />
                  <View style={styles.suggestionDetails}>
                    <Text style={styles.suggestionServiceTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.suggestionCategory}>{item.category} • {item.duration}</Text>
                  </View>
                  <View style={styles.suggestionPriceCol}>
                    <Text style={styles.suggestionPrice}>₹{item.price}</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Search Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {quickSearchChips.map((chip) => (
              <TouchableOpacity
                key={chip}
                activeOpacity={0.75}
                onPress={() => handleSearchChange(chip)}
                style={styles.chipButton}
              >
                <Ionicons name="search-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* ACTIVE BOOKING LIVE TRACKING PREVIEW                         */}
        {/* ============================================================ */}
        <View style={styles.bookingPreviewSection}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.sectionTitle}>Active Booking Status</Text>
          </View>
          <BookingCard
            booking={DEMO_BOOKINGS[0]}
            onPress={(b) => handleOpenService(ALL_SERVICES[0])}
            onTrackPress={(b) =>
              Alert.alert('Live Pro Tracking', `Expert: ${b.professionalName}\nStatus: En route to ${selectedAddress.label}\nArrival in: 22 mins`)
            }
            onCancelPress={() =>
              Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this booking?')
            }
          />
        </View>

        {/* ============================================================ */}
        {/* SECTION 4: PROMOTIONAL BANNER CAROUSEL (Auto & Manual)      */}
        {/* ============================================================ */}
        <View style={styles.carouselSection}>
          <View style={styles.carouselHeaderRow}>
            <View style={styles.bannerTagRow}>
              <Text style={styles.sectionTitle}>Offers & Festive Sales</Text>
              <StatusBadge label="Limited Time" variant="sale" size="small" />
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/offers')}>
              <Text style={styles.seeAllText}>All Offers →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={promoScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
              setActivePromoIndex(idx);
            }}
            contentContainerStyle={styles.promoCarouselScroll}
          >
            {DEMO_PROMOTIONS.map((promo) => (
              <View key={promo.id} style={{ width: width - 36, marginRight: 12 }}>
                <PromotionalBanner
                  promotion={promo}
                  onPress={(p) =>
                    Alert.alert(p.title, `Promo code: ${p.code}\n${p.subtitle}`)
                  }
                />
              </View>
            ))}
          </ScrollView>

          {/* Carousel Indicator Dots */}
          <View style={styles.indicatorDotsRow}>
            {DEMO_PROMOTIONS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.carouselDot,
                  i === activePromoIndex && styles.carouselDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ============================================================ */}
        {/* SECTION 5: SERVICE CATEGORIES GRID (10 Categories)          */}
        {/* ============================================================ */}
        <View style={[styles.categoriesCard, Shadows.card]}>
          <View style={styles.categoriesHeader}>
            <View>
              <Text style={styles.categoriesTitle}>Service Categories</Text>
              <Text style={styles.categoriesSub}>Select a category to view specialized experts</Text>
            </View>
            <StatusBadge label="10 Categories" variant="neutral" size="small" />
          </View>

          <View style={styles.categoriesGrid}>
            {DEMO_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={handleCategoryPress}
              />
            ))}
          </View>

          {/* Category Filter Active Indicator */}
          {selectedCategoryFilter !== 'all' && (
            <View style={styles.activeCategoryNotice}>
              <Text style={styles.activeCategoryNoticeText}>
                Showing services for:{' '}
                <Text style={{ fontWeight: '800' }}>
                  {DEMO_CATEGORIES.find((c) => c.slug === selectedCategoryFilter)?.name}
                </Text>
              </Text>
              <TouchableOpacity onPress={() => setSelectedCategoryFilter('all')}>
                <Text style={styles.clearCategoryFilter}>Show All ✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Filtered category results */}
          {filteredCategoryServices.length > 0 && (
            <View style={styles.categoryResultsList}>
              {filteredCategoryServices.map((srv) => (
                <ServiceCard
                  key={srv.id}
                  service={srv}
                  variant="horizontal"
                  isAdded={cartServiceIds.includes(srv.id)}
                  onPress={handleOpenService}
                  onAddPress={handleToggleCart}
                />
              ))}
            </View>
          )}
        </View>

        {/* ============================================================ */}
        {/* SECTION 6: POPULAR SERVICES                                 */}
        {/* ============================================================ */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Popular Services</Text>
              <Text style={styles.sectionSubtext}>Highest booked services in your area</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesHorizontalScroll}
          >
            {POPULAR_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isAdded={cartServiceIds.includes(service.id)}
                onPress={handleOpenService}
                onAddPress={handleToggleCart}
              />
            ))}
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SECTION 7: RECOMMENDED SERVICES (Personalized Preview)      */}
        {/* ============================================================ */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Recommended For You</Text>
              <Text style={styles.sectionSubtext}>Personalized based on seasonal home care</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.seeAllText}>Explore →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesHorizontalScroll}
          >
            {RECOMMENDED_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isAdded={cartServiceIds.includes(service.id)}
                onPress={handleOpenService}
                onAddPress={handleToggleCart}
              />
            ))}
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SECTION 8: FREQUENTLY BOOKED SERVICES                       */}
        {/* ============================================================ */}
        <View style={styles.frequentlySection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Frequently Booked</Text>
              <Text style={styles.sectionSubtext}>Quick 25-45 minute quick fixes & maintenance</Text>
            </View>
          </View>

          <View style={styles.frequentlyList}>
            {FREQUENTLY_BOOKED_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                variant="horizontal"
                isAdded={cartServiceIds.includes(service.id)}
                onPress={handleOpenService}
                onAddPress={handleToggleCart}
              />
            ))}
          </View>
        </View>

        {/* ============================================================ */}
        {/* SECTION 9: OFFERS AND DISCOUNTS (Coupons Section)           */}
        {/* ============================================================ */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Exclusive Coupons</Text>
              <Text style={styles.sectionSubtext}>Tap to apply promo discount code instantly</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/offers')}>
              <Text style={styles.seeAllText}>View all →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.couponsScroll}
          >
            {DEMO_COUPONS.map((coupon) => (
              <View key={coupon.id} style={styles.couponCardWrapper}>
                <View style={styles.couponPill}>
                  <Text style={styles.couponCodeText}>{coupon.code}</Text>
                  <TouchableOpacity
                    onPress={() => handleApplyCoupon(coupon)}
                    style={[
                      styles.couponApplyBtn,
                      appliedCouponCode === coupon.code && styles.couponApplyBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.couponApplyText,
                        appliedCouponCode === coupon.code && styles.couponApplyTextActive,
                      ]}
                    >
                      {appliedCouponCode === coupon.code ? 'Applied ✓' : 'Apply'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.couponTitleText}>{coupon.title}</Text>
                <Text style={styles.couponDescText}>{coupon.description}</Text>
                <Text style={styles.couponExpiryText}>Valid till {coupon.expiresAt}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* SECTION 10: WHY CHOOSE FORGE INDIA CONNECT?                 */}
        {/* ============================================================ */}
        <View style={[styles.whyChooseCard, Shadows.subtle]}>
          <View style={styles.whyChooseHeader}>
            <View style={styles.whyBadge}>
              <Text style={styles.whyBadgeText}>PLATFORM PROMISE</Text>
            </View>
            <Text style={styles.whyChooseTitle}>Why Choose Forge India Connect?</Text>
            <Text style={styles.whyChooseSubtitle}>
              Built for reliability, speed, and trusted home care across Indian cities.
            </Text>
          </View>

          <View style={styles.whyGrid}>
            <View style={styles.whyItem}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.whyTextCol}>
                <Text style={styles.whyItemTitle}>Convenient 45-Min Arrival</Text>
                <Text style={styles.whyItemDesc}>
                  Select your exact arrival slot with real-time GPS expert tracking.
                </Text>
              </View>
            </View>

            <View style={styles.whyItem}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.emerald} />
              </View>
              <View style={styles.whyTextCol}>
                <Text style={styles.whyItemTitle}>100% Verified Professionals</Text>
                <Text style={styles.whyItemDesc}>
                  5-step background vetting, standardized tools, and skill certification.
                </Text>
              </View>
            </View>

            <View style={styles.whyItem}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="cash-outline" size={20} color={Colors.amber} />
              </View>
              <View style={styles.whyTextCol}>
                <Text style={styles.whyItemTitle}>Transparent Upfront Pricing</Text>
                <Text style={styles.whyItemDesc}>
                  Fixed transparent digital estimates with zero hidden doorstep surcharges.
                </Text>
              </View>
            </View>

            <View style={styles.whyItem}>
              <View style={[styles.whyIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="headset-outline" size={20} color={Colors.purple} />
              </View>
              <View style={styles.whyTextCol}>
                <Text style={styles.whyItemTitle}>Dedicated Customer Support</Text>
                <Text style={styles.whyItemDesc}>
                  In-app assistance, 30-day service protection, and instant query resolution.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Global Bottom Padding */}
        <View style={{ height: Spacing.xxl }} />
        </>
        )}
      </ScrollView>

      {/* ============================================================ */}
      {/* MODAL 1: LOCATION SWITCHER MODAL                             */}
      {/* ============================================================ */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setLocationModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetCard}>
                <View style={styles.bottomSheetDragBar} />
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Select Delivery Address</Text>
                  <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                    <Ionicons name="close" size={22} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {AVAILABLE_ADDRESSES.map((addr) => {
                  const isSelected = selectedAddress.id === addr.id;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedAddress(addr);
                        setLocationModalVisible(false);
                      }}
                      style={[
                        styles.addressOption,
                        isSelected && styles.addressOptionSelected,
                      ]}
                    >
                      <View style={styles.addressIconCircle}>
                        <Ionicons
                          name={addr.type === 'Home' ? 'home' : addr.type === 'Work' ? 'briefcase' : 'location'}
                          size={18}
                          color={isSelected ? Colors.primary : Colors.textSecondary}
                        />
                      </View>
                      <View style={styles.addressDetails}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.addressLabel}>{addr.label}</Text>
                          {addr.isDefault && (
                            <StatusBadge label="Default" variant="completed" size="small" />
                          )}
                        </View>
                        <Text style={styles.addressFullText} numberOfLines={2}>
                          {addr.fullAddress}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setLocationModalVisible(false);
                    Alert.alert('Add New Address', 'Please enter your new apartment/house details.');
                  }}
                  style={styles.addNewAddressBtn}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.addNewAddressText}>Add New Service Address</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: NOTIFICATIONS SHEET                                 */}
      {/* ============================================================ */}
      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNotificationModalVisible(false)}>
          <View style={styles.modalOverlayCenter}>
            <TouchableWithoutFeedback>
              <View style={[styles.dialogCard, Shadows.elevated]}>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Notifications</Text>
                  <TouchableOpacity onPress={() => setNotificationModalVisible(false)}>
                    <Ionicons name="close" size={22} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {DEMO_NOTIFICATIONS.map((notif) => (
                  <View key={notif.id} style={styles.notifItem}>
                    <View style={styles.notifDot} />
                    <View style={styles.notifTextCol}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      <Text style={styles.notifMsg}>{notif.message}</Text>
                      <Text style={styles.notifTime}>{notif.time}</Text>
                    </View>
                  </View>
                ))}

                <View style={{ marginTop: Spacing.md }}>
                  <PrimaryButton
                    title="Mark All as Read"
                    onPress={() => setNotificationModalVisible(false)}
                    size="medium"
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: SERVICE DETAILS & BOOKING MODAL                    */}
      {/* ============================================================ */}
      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setServiceModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetCard}>
                <View style={styles.bottomSheetDragBar} />
                {activeModalService && (
                  <>
                    <View style={styles.serviceModalHeader}>
                      <Image source={activeModalService.image} style={styles.serviceModalImg} />
                      <TouchableOpacity
                        style={styles.closeServiceModalBtn}
                        onPress={() => setServiceModalVisible(false)}
                      >
                        <Ionicons name="close" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.serviceModalBody}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusBadge label={activeModalService.category} variant="time" size="small" />
                        <RatingComponent rating={activeModalService.rating} reviewsCount={activeModalService.reviewsCount} />
                      </View>

                      <Text style={styles.serviceModalTitle}>{activeModalService.title}</Text>
                      <Text style={styles.serviceModalDesc}>{activeModalService.description}</Text>

                      <View style={styles.serviceHighlightsRow}>
                        <View style={styles.serviceHighlightItem}>
                          <Ionicons name="time-outline" size={16} color={Colors.primary} />
                          <Text style={styles.serviceHighlightText}>{activeModalService.duration}</Text>
                        </View>
                        <View style={styles.serviceHighlightItem}>
                          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.emerald} />
                          <Text style={styles.serviceHighlightText}>30-Day Guarantee</Text>
                        </View>
                        <View style={styles.serviceHighlightItem}>
                          <Ionicons name="sparkles-outline" size={16} color={Colors.amber} />
                          <Text style={styles.serviceHighlightText}>Top Technician</Text>
                        </View>
                      </View>

                      <View style={styles.serviceModalFooter}>
                        <View>
                          <Text style={styles.totalPriceLabel}>Total Amount</Text>
                          <PriceDisplay
                            price={activeModalService.price}
                            originalPrice={activeModalService.originalPrice}
                            size="large"
                          />
                        </View>

                        <View style={{ width: 160 }}>
                          <PrimaryButton
                            title={
                              cartServiceIds.includes(activeModalService.id)
                                ? 'Added to Cart ✓'
                                : 'Book / Add Service'
                            }
                            variant={
                              cartServiceIds.includes(activeModalService.id)
                                ? 'dark'
                                : 'primary'
                            }
                            onPress={() => {
                              handleToggleCart(activeModalService);
                              setServiceModalVisible(false);
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: APPLIANCE REPAIR & SERVICE MODAL                    */}
      {/* ============================================================ */}
      <ApplianceRepairModal
        visible={applianceModalVisible}
        onClose={() => setApplianceModalVisible(false)}
        onSelectAppliance={handleSelectAppliance}
      />

      {/* ============================================================ */}
      {/* MODAL 5: ELECTRICIAN, PLUMBER & CARPENTERS MODAL             */}
      {/* ============================================================ */}
      <ElectricianPlumberCarpenterModal
        visible={epcModalVisible}
        onClose={() => setEpcModalVisible(false)}
        onSelectOption={handleSelectEPC}
      />

      {/* ============================================================ */}
      {/* MODAL 6: BATHROOM & KITCHEN CLEANING MODAL                   */}
      {/* ============================================================ */}
      <BathroomKitchenCleaningModal
        visible={cleaningModalVisible}
        onClose={() => setCleaningModalVisible(false)}
        onSelectOption={handleSelectCleaningOption}
      />

      {/* ============================================================ */}
      {/* MODAL 7: CLEANING (FULL HOME / COCKROACH CONTROL) MODAL      */}
      {/* ============================================================ */}
      <CleaningModal
        visible={fullHomeModalVisible}
        onClose={() => setFullHomeModalVisible(false)}
        onSelectOption={handleSelectCleaningChoice}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // Top Segmented Tab Switcher (Homes | Native | Beauty)
  topTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: Spacing.lg,
  },
  topTabButton: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
    alignItems: 'center',
  },
  topTabButtonActive: {},
  topTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  topTabTextActive: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  topTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },

  // Native Showcase Section
  nativeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  nativeHeroBanner: {
    marginBottom: Spacing.lg,
  },
  nativeBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  nativeBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7E22CE',
  },
  nativeHeroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  nativeHeroSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  nativeHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  nativeCardImage: {
    width: '100%',
    height: 180,
  },
  nativeCardContent: {
    padding: 16,
  },
  nativeTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  nativeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  nativeCardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  nativeCardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  nativePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  nativePriceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  nativeActionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Section 2: Welcome Section
  welcomeContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.background,
  },
  welcomeTextCol: {
    width: '100%',
  },
  welcomeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  badgePillText: {
    ...Typography.tinyBold,
    color: Colors.primary,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  memberPillText: {
    ...Typography.tinyBold,
    color: Colors.emeraldDark,
  },
  greetingTitle: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Section 3: Search Bar
  searchSectionWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    position: 'relative',
    zIndex: 50,
  },
  chipsScroll: {
    paddingTop: Spacing.sm,
    gap: Spacing.xs + 2,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    ...Typography.tiny,
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // Search Suggestions Box
  suggestionsBox: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    zIndex: 100,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.xs,
  },
  suggestionsTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  clearSearchText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  suggestionImage: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  suggestionDetails: {
    flex: 1,
  },
  suggestionServiceTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  suggestionCategory: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  suggestionPriceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionPrice: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },

  // Active Booking
  bookingPreviewSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emerald,
  },

  // Section 4: Promotional Carousel
  carouselSection: {
    marginTop: Spacing.md,
  },
  carouselHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  promoCarouselScroll: {
    paddingHorizontal: Spacing.lg,
  },
  indicatorDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  carouselDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  // Section 5: Categories
  categoriesCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoriesTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  categoriesSub: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginTop: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activeCategoryNotice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  activeCategoryNoticeText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  clearCategoryFilter: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  categoryResultsList: {
    marginTop: Spacing.md,
  },

  // Section 6, 7 & 8: Services Carousels
  servicesSection: {
    marginTop: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sectionSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  seeAllText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  servicesHorizontalScroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },

  // Frequently booked
  frequentlySection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  frequentlyList: {
    marginTop: Spacing.xs,
  },

  // Section 9: Offers / Coupons
  offersSection: {
    marginTop: Spacing.xl,
  },
  couponsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  couponCardWrapper: {
    width: 250,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    padding: Spacing.md,
  },
  couponPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  couponCodeText: {
    ...Typography.tinyBold,
    color: Colors.primary,
    letterSpacing: 0.8,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  couponApplyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  couponApplyBtnActive: {
    backgroundColor: Colors.emeraldLight,
    borderWidth: 1,
    borderColor: Colors.emerald,
  },
  couponApplyText: {
    ...Typography.tinyBold,
    color: '#FFFFFF',
  },
  couponApplyTextActive: {
    color: Colors.emeraldDark,
  },
  couponTitleText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  couponDescText: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    lineHeight: 14,
    marginBottom: Spacing.xs,
  },
  couponExpiryText: {
    ...Typography.tiny,
    color: Colors.textMuted,
    fontSize: 9.5,
  },

  // Section 10: Why Choose Forge India Connect
  whyChooseCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  whyChooseHeader: {
    marginBottom: Spacing.lg,
  },
  whyBadge: {
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  whyBadgeText: {
    ...Typography.tinyBold,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  whyChooseTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  whyChooseSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  whyGrid: {
    gap: Spacing.md,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  whyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  whyTextCol: {
    flex: 1,
  },
  whyItemTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  whyItemDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  bottomSheetCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  bottomSheetDragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  addressOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFAFF',
  },
  addressIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  addressFullText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addNewAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  addNewAddressText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },

  // Notification items
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 5,
  },
  notifTextCol: {
    flex: 1,
  },
  notifTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  notifMsg: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  notifTime: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Service Details Modal
  serviceModalHeader: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  serviceModalImg: {
    width: '100%',
    height: '100%',
  },
  closeServiceModalBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceModalBody: {
    gap: Spacing.xs + 2,
  },
  serviceModalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  serviceModalDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.xxs,
  },
  serviceHighlightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
  },
  serviceHighlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceHighlightText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  serviceModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  totalPriceLabel: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
});
