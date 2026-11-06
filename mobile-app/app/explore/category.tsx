import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { Shadows } from '../../theme/shadows';
import {
  ServiceCard,
  StatusBadge,
  EmptyState,
} from '../../components';
import { ALL_SERVICES, DEMO_CATEGORIES } from '../../data';
import { Service } from '../../types';

export default function CategoryDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string; name?: string }>();

  const categorySlug = params.slug || 'ac-services';
  const category =
    DEMO_CATEGORIES.find((c) => c.slug === categorySlug) || DEMO_CATEGORIES[0];

  const [cartIds, setCartIds] = useState<string[]>(['srv-1']);

  // Get all services belonging to this category
  const categoryServices = ALL_SERVICES.filter(
    (s) => s.categorySlug === categorySlug
  );

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {category.name}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/explore/search')}
          style={styles.searchIconButton}
        >
          <Ionicons name="search" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Hero Banner */}
        <View style={[styles.heroBanner, Shadows.card]}>
          <View style={styles.heroLeftCol}>
            {category.badge && (
              <View style={styles.badgeWrapper}>
                <StatusBadge label={category.badge} variant="sale" size="small" />
              </View>
            )}
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <Text style={styles.categoryDesc}>{category.description}</Text>

            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <Ionicons name="time" size={13} color={Colors.primary} />
                <Text style={styles.featureText}>45-Min Arrival</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={13} color={Colors.emerald} />
                <Text style={styles.featureText}>30-Day Guarantee</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroIconBox}>
            <Image source={category.icon} style={styles.heroIcon} resizeMode="contain" />
          </View>
        </View>

        {/* Section title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Available Services ({categoryServices.length})
          </Text>
          <Text style={styles.sectionSub}>All prices include doorstep inspection</Text>
        </View>

        {/* Services List */}
        {categoryServices.length > 0 ? (
          <View style={styles.servicesList}>
            {categoryServices.map((service) => (
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
        ) : (
          <EmptyState
            title="Services Coming Soon"
            description={`We are currently boarding certified professionals for ${category.name} in your neighborhood.`}
            iconName="construct-outline"
            buttonTitle="Browse All Services"
            onButtonPress={() => router.push('/(tabs)/explore')}
          />
        )}
      </ScrollView>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  searchIconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  heroBanner: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  heroLeftCol: {
    flex: 1.4,
    paddingRight: Spacing.sm,
  },
  badgeWrapper: {
    marginBottom: Spacing.xs,
  },
  categoryTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: Spacing.xxs,
  },
  categoryDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  featureText: {
    ...Typography.tinyBold,
    color: Colors.textPrimary,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  heroIcon: {
    width: 54,
    height: 54,
  },
  sectionHeaderRow: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  sectionSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  servicesList: {
    paddingHorizontal: Spacing.lg,
  },
});

