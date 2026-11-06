import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import {
  ServiceCard,
  SortBottomSheet,
  SortOptionKey,
  StatusBadge,
} from '../../components';
import { POPULAR_SERVICES, ALL_SERVICES } from '../../data';
import { Service } from '../../types';

export default function PopularServicesScreen() {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortOptionKey>('popular');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [cartIds, setCartIds] = useState<string[]>(['srv-1']);

  // Combine popular and top-rated services
  const popularServicesList = useMemo(() => {
    let list = ALL_SERVICES.filter((s) => s.isPopular || s.rating >= 4.85);

    switch (sortKey) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        list.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }

    return list;
  }, [sortKey]);

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
      Alert.alert('Service Added! 🎉', `${service.title} was added to your booking cart.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Most Popular Services</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSortModalVisible(true)}
          style={styles.sortButton}
        >
          <Ionicons name="swap-vertical" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Subheader Banner */}
      <View style={styles.subheader}>
        <View style={styles.badgeRow}>
          <StatusBadge label="Top 1% Booked" variant="sale" size="small" />
          <Text style={styles.ratingTrust}>★ 4.8+ Average Customer Rating</Text>
        </View>
        <Text style={styles.subheaderDesc}>
          Based on over 10,000+ customer bookings in your city this month.
        </Text>
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {popularServicesList.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              variant="horizontal"
              isAdded={cartIds.includes(service.id)}
              onPress={handleServicePress}
              onAddPress={handleToggleCart}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        visible={sortModalVisible}
        selectedSort={sortKey}
        onSelectSort={(s) => setSortKey(s)}
        onClose={() => setSortModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sortButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subheader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxs,
  },
  ratingTrust: {
    ...Typography.captionBold,
    color: Colors.amber,
  },
  subheaderDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});

