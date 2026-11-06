import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import {
  SearchBar,
  ServiceCard,
  EmptyState,
  FilterBottomSheet,
  SortBottomSheet,
  FilterOptions,
  SortOptionKey,
  StatusBadge,
} from '../../components';
import { ALL_SERVICES, DEMO_CATEGORIES } from '../../data';
import { Service } from '../../types';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();

  // Search query state
  const [searchTerm, setSearchTerm] = useState(params.q || '');

  React.useEffect(() => {
    if (params.q) {
      setSearchTerm(params.q);
    }
  }, [params.q]);

  // Filter & Sorting state
  const [filters, setFilters] = useState<FilterOptions>({
    categorySlug: 'all',
    priceRange: 'all',
    minRating: 0,
  });
  const [sortKey, setSortKey] = useState<SortOptionKey>('recommended');

  // Bottom sheets visibility
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Cart tracking state
  const [cartIds, setCartIds] = useState<string[]>(['srv-1']);

  // Dynamic search, filter, and sort algorithm using useMemo
  const filteredServices = useMemo(() => {
    let result = [...ALL_SERVICES];

    // 1. Text Search matching
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (filters.categorySlug !== 'all') {
      result = result.filter((s) => s.categorySlug === filters.categorySlug);
    }

    // 3. Price Filter
    if (filters.priceRange === 'under300') {
      result = result.filter((s) => s.price < 300);
    } else if (filters.priceRange === '300to700') {
      result = result.filter((s) => s.price >= 300 && s.price <= 700);
    } else if (filters.priceRange === 'above700') {
      result = result.filter((s) => s.price > 700);
    }

    // 4. Rating Filter
    if (filters.minRating > 0) {
      result = result.filter((s) => s.rating >= filters.minRating);
    }

    // 5. Sorting
    switch (sortKey) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
      case 'recommended':
      default:
        // Keep default order
        break;
    }

    return result;
  }, [searchTerm, filters, sortKey]);

  // Count active filters
  const activeFilterCount =
    (filters.categorySlug !== 'all' ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

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

  const resetFilters = () => {
    setFilters({
      categorySlug: 'all',
      priceRange: 'all',
      minRating: 0,
    });
  };

  const popularKeywords = ['AC Repair', 'Bathroom Cleaning', 'Plumber', 'Electrician', 'Painting', 'Smart Lock'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header bar with Back button and search input */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <SearchBar
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search services, repairs..."
            autoFocus={true}
          />
        </View>
      </View>

      {/* Filter and Sort Control Bar */}
      <View style={styles.controlBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setFilterModalVisible(true)}
          style={[styles.controlButton, activeFilterCount > 0 && styles.controlButtonActive]}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={activeFilterCount > 0 ? '#FFFFFF' : Colors.textPrimary}
          />
          <Text
            style={[
              styles.controlButtonText,
              activeFilterCount > 0 && styles.controlButtonTextActive,
            ]}
          >
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSortModalVisible(true)}
          style={[styles.controlButton, sortKey !== 'recommended' && styles.controlButtonActive]}
        >
          <Ionicons
            name="swap-vertical"
            size={16}
            color={sortKey !== 'recommended' ? '#FFFFFF' : Colors.textPrimary}
          />
          <Text
            style={[
              styles.controlButtonText,
              sortKey !== 'recommended' && styles.controlButtonTextActive,
            ]}
          >
            Sort
          </Text>
        </TouchableOpacity>

        {/* Results Counter */}
        <Text style={styles.resultsCountText}>
          {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
        </Text>
      </View>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {filters.categorySlug !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  Category: {DEMO_CATEGORIES.find((c) => c.slug === filters.categorySlug)?.name}
                </Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, categorySlug: 'all' })}>
                  <Ionicons name="close" size={13} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {filters.priceRange !== 'all' && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>
                  Price: {filters.priceRange === 'under300' ? '< ₹300' : filters.priceRange === '300to700' ? '₹300 - ₹700' : '> ₹700'}
                </Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, priceRange: 'all' })}>
                  <Ionicons name="close" size={13} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {filters.minRating > 0 && (
              <View style={styles.filterChip}>
                <Text style={styles.filterChipText}>Rating: ★ {filters.minRating}+</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, minRating: 0 })}>
                  <Ionicons name="close" size={13} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Main Results / Empty State */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredServices.length > 0 ? (
          <View style={styles.resultsList}>
            {filteredServices.map((service) => (
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
          <View style={styles.noResultsContainer}>
            <EmptyState
              title="No Services Found"
              description={`We couldn't find any services matching "${searchTerm}". Try different keywords or reset your filters.`}
              iconName="search-outline"
              buttonTitle="Reset Filters"
              onButtonPress={() => {
                setSearchTerm('');
                resetFilters();
              }}
            />

            {/* Popular Suggestions */}
            <View style={styles.popularKeywordsSection}>
              <Text style={styles.popularKeywordsTitle}>Suggested searches:</Text>
              <View style={styles.keywordsWrap}>
                {popularKeywords.map((kw) => (
                  <TouchableOpacity
                    key={kw}
                    onPress={() => setSearchTerm(kw)}
                    style={styles.keywordPill}
                  >
                    <Ionicons name="search" size={12} color={Colors.primary} />
                    <Text style={styles.keywordText}>{kw}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={filterModalVisible}
        currentFilters={filters}
        categories={DEMO_CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))}
        onApply={(f) => setFilters(f)}
        onReset={resetFilters}
        onClose={() => setFilterModalVisible(false)}
      />

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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
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
  searchInputContainer: {
    flex: 1,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
  },
  controlButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  controlButtonText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  controlButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsCountText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
  activeFiltersRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  filterChipText: {
    ...Typography.tinyBold,
    color: Colors.primary,
  },
  clearAllBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  clearAllText: {
    ...Typography.tinyBold,
    color: Colors.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  noResultsContainer: {
    alignItems: 'center',
  },
  popularKeywordsSection: {
    width: '100%',
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.sm,
  },
  popularKeywordsTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  keywordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  keywordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  keywordText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});

