import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
  StatusBadge,
  ApplianceRepairModal,
  ApplianceItem,
  ElectricianPlumberCarpenterModal,
  EPCItem,
  BathroomKitchenCleaningModal,
  CleaningOptionItem,
  CleaningModal,
  CleaningItem,
} from '../../components';
import {
  DEMO_CATEGORIES,
  POPULAR_SERVICES,
  RECOMMENDED_SERVICES,
  RECENTLY_VIEWED_SERVICES,
  DEMO_PROMOTIONS,
  AVAILABLE_ADDRESSES,
} from '../../data';
import { Category, Service, Promotion } from '../../types';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedAddress] = useState(AVAILABLE_ADDRESSES[0]);
  const [cartIds, setCartIds] = useState<string[]>(['srv-1']);
  const [applianceModalVisible, setApplianceModalVisible] = useState(false);
  const [epcModalVisible, setEpcModalVisible] = useState(false);
  const [cleaningModalVisible, setCleaningModalVisible] = useState(false);
  const [fullHomeModalVisible, setFullHomeModalVisible] = useState(false);

  const handleSearchFocus = () => {
    router.push('/explore/search');
  };

  const handleCategoryPress = (category: Category) => {
    if (
      category.slug === 'appliances' ||
      category.slug === 'ac-services' ||
      category.name.toLowerCase().includes('appliance')
    ) {
      setApplianceModalVisible(true);
      return;
    }

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

    if (
      category.slug === 'bathroom-kitchen' ||
      category.slug === 'bathroom-kitchen-cleaning' ||
      category.name.toLowerCase().includes('bathroom') ||
      category.name.toLowerCase().includes('kitchen')
    ) {
      setCleaningModalVisible(true);
      return;
    }

    if (
      category.slug === 'cleaning' ||
      category.slug === 'full-home-cleaning' ||
      category.name.trim().toLowerCase() === 'cleaning'
    ) {
      setFullHomeModalVisible(true);
      return;
    }

    if (
      category.slug === 'native-purifier' ||
      category.slug === 'purifiers' ||
      category.name.toLowerCase().includes('water purifier') ||
      category.name.toLowerCase().includes('purifier')
    ) {
      router.push('/services/native-purifier');
      return;
    }

    if (
      category.slug === 'smart-locks' ||
      category.slug === 'native-smart-locks' ||
      category.name.toLowerCase().includes('smart lock') ||
      category.name.toLowerCase().includes('lock')
    ) {
      router.push('/services/native-smart-locks');
      return;
    }

    if (
      category.slug === 'womens-salon' ||
      category.slug === 'mens-salon' ||
      category.slug === 'beauty' ||
      category.name.toLowerCase().includes('salon') ||
      category.name.toLowerCase().includes('beauty')
    ) {
      router.push('/(tabs)?tab=beauty');
      return;
    }

    if (
      category.slug === 'native-purifier' ||
      category.slug === 'purifiers' ||
      category.name.toLowerCase().includes('water purifier') ||
      category.name.toLowerCase().includes('purifier')
    ) {
      router.push('/services/native-purifier');
      return;
    }

    if (
      category.slug === 'smart-locks' ||
      category.slug === 'native-smart-locks' ||
      category.name.toLowerCase().includes('smart lock') ||
      category.name.toLowerCase().includes('lock')
    ) {
      router.push('/services/native-smart-locks');
      return;
    }

    if (
      category.slug === 'womens-salon' ||
      category.slug === 'mens-salon' ||
      category.slug === 'beauty' ||
      category.name.toLowerCase().includes('salon') ||
      category.name.toLowerCase().includes('beauty')
    ) {
      router.push('/(tabs)?tab=beauty');
      return;
    }

    router.push({
      pathname: '/explore/category',
      params: { slug: category.slug, name: category.name },
    });
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

  const handleServicePress = (service: Service) => {
    router.push({
      pathname: '/services/detail',
      params: { id: service.id },
    });
  };

  const handleToggleCart = (service: Service) => {
    if (cartIds.includes(service.id)) {
      setCartIds(cartIds.filter((id) => id !== service.id));
    } else {
      setCartIds([...cartIds, service.id]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. HEADER */}
      <CustomHeader
        location={selectedAddress.label}
        subLocation={selectedAddress.city}
        notificationCount={2}
        onLocationPress={() => Alert.alert('Location', selectedAddress.fullAddress)}
        onNotificationPress={() => Alert.alert('Notifications', '1. Your AC technician is on the way.\n2. Flat ₹500 offer applied.')}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. SEARCH BAR TRIGGER */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSearchFocus}
          style={styles.searchBarWrapper}
        >
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="Search all 50+ home services, repairs & cleaning..."
            showFilterButton={true}
            onFilterPress={handleSearchFocus}
          />
        </TouchableOpacity>

        {/* 3. SERVICE CATEGORY GRID */}
        <View style={[styles.categoriesCard, Shadows.card]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Browse All Categories</Text>
              <Text style={styles.sectionSubtext}>Select any category to view specialized experts</Text>
            </View>
            <StatusBadge label="10 Categories" variant="neutral" size="small" />
          </View>

          <View style={styles.categoriesGrid}>
            {DEMO_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onPress={handleCategoryPress}
              />
            ))}
          </View>
        </View>

        {/* 4. RECENTLY VIEWED SERVICES */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Recently Viewed</Text>
              <Text style={styles.sectionSubtext}>Pick up where you left off</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {RECENTLY_VIEWED_SERVICES.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                isAdded={cartIds.includes(srv.id)}
                onPress={handleServicePress}
                onAddPress={handleToggleCart}
              />
            ))}
          </ScrollView>
        </View>

        {/* 5. POPULAR SERVICES CAROUSEL */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Popular in Your City</Text>
              <Text style={styles.sectionSubtext}>Most requested home services</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/explore/popular')}>
              <Text style={styles.seeAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {POPULAR_SERVICES.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                isAdded={cartIds.includes(srv.id)}
                onPress={handleServicePress}
                onAddPress={handleToggleCart}
              />
            ))}
          </ScrollView>
        </View>

        {/* 6. PROMOTIONAL SERVICE BANNER */}
        <View style={styles.bannerContainer}>
          <PromotionalBanner
            promotion={DEMO_PROMOTIONS[1]} // Native Purifier promo
            onPress={(p: Promotion) =>
              router.push({
                pathname: '/explore/category',
                params: { slug: 'purifiers', name: 'Native Purifiers' },
              })
            }
          />
        </View>

        {/* 7. RECOMMENDED SERVICES */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Recommended For You</Text>
              <Text style={styles.sectionSubtext}>Customized home maintenance solutions</Text>
            </View>
          </View>

          <View style={styles.verticalList}>
            {RECOMMENDED_SERVICES.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                variant="horizontal"
                isAdded={cartIds.includes(srv.id)}
                onPress={handleServicePress}
                onAddPress={handleToggleCart}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Appliance Repair & Service Modal */}
      <ApplianceRepairModal
        visible={applianceModalVisible}
        onClose={() => setApplianceModalVisible(false)}
        onSelectAppliance={handleSelectAppliance}
      />

      {/* Electrician, Plumber & Carpenters Modal */}
      <ElectricianPlumberCarpenterModal
        visible={epcModalVisible}
        onClose={() => setEpcModalVisible(false)}
        onSelectOption={handleSelectEPC}
      />

      {/* Bathroom & Kitchen Cleaning Modal */}
      <BathroomKitchenCleaningModal
        visible={cleaningModalVisible}
        onClose={() => setCleaningModalVisible(false)}
        onSelectOption={handleSelectCleaningOption}
      />

      {/* Cleaning (Full Home / Cockroach Control) Modal */}
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
  searchBarWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoriesCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sectionHeading: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sectionSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  seeAllText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionBlock: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  horizontalScroll: {
    paddingTop: Spacing.xs,
  },
  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  verticalList: {
    marginTop: Spacing.xs,
  },
});
