import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export interface FilterOptions {
  categorySlug: string;
  priceRange: string; // 'all' | 'under300' | '300to700' | 'above700'
  minRating: number; // 0 | 4.5 | 4.8
}

interface FilterBottomSheetProps {
  visible: boolean;
  currentFilters: FilterOptions;
  categories: { name: string; slug: string }[];
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
  onClose: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  currentFilters,
  categories,
  onApply,
  onReset,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.categorySlug);
  const [selectedPrice, setSelectedPrice] = useState(currentFilters.priceRange);
  const [selectedRating, setSelectedRating] = useState(currentFilters.minRating);

  const priceOptions = [
    { key: 'all', label: 'All Prices' },
    { key: 'under300', label: 'Under ₹300' },
    { key: '300to700', label: '₹300 - ₹700' },
    { key: 'above700', label: 'Above ₹700' },
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 4.5, label: '★ 4.5 & above' },
    { value: 4.8, label: '★ 4.8 & above' },
  ];

  const handleApply = () => {
    onApply({
      categorySlug: selectedCategory,
      priceRange: selectedPrice,
      minRating: selectedRating,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('all');
    setSelectedPrice('all');
    setSelectedRating(0);
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.dragBar} />

              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Filter Services</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.bodyScroll}>
                {/* 1. Category */}
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.pillsWrap}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory('all')}
                    style={[
                      styles.pill,
                      selectedCategory === 'all' && styles.pillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        selectedCategory === 'all' && styles.pillTextActive,
                      ]}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>

                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.slug;
                    return (
                      <TouchableOpacity
                        key={c.slug}
                        activeOpacity={0.7}
                        onPress={() => setSelectedCategory(c.slug)}
                        style={[styles.pill, isSelected && styles.pillActive]}
                      >
                        <Text
                          style={[styles.pillText, isSelected && styles.pillTextActive]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 2. Price Range */}
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.pillsWrap}>
                  {priceOptions.map((opt) => {
                    const isSelected = selectedPrice === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        activeOpacity={0.7}
                        onPress={() => setSelectedPrice(opt.key)}
                        style={[styles.pill, isSelected && styles.pillActive]}
                      >
                        <Text
                          style={[styles.pillText, isSelected && styles.pillTextActive]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Minimum Rating */}
                <Text style={styles.filterSectionTitle}>Customer Rating</Text>
                <View style={styles.pillsWrap}>
                  {ratingOptions.map((opt) => {
                    const isSelected = selectedRating === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.7}
                        onPress={() => setSelectedRating(opt.value)}
                        style={[styles.pill, isSelected && styles.pillActive]}
                      >
                        <Text
                          style={[styles.pillText, isSelected && styles.pillTextActive]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Action buttons */}
              <View style={styles.actionsRow}>
                <View style={{ flex: 1 }}>
                  <SecondaryButton
                    title="Reset All"
                    onPress={handleReset}
                    variant="outline"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <PrimaryButton
                    title="Apply Filters"
                    onPress={handleApply}
                    variant="primary"
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    maxHeight: '80%',
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  bodyScroll: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});

export default FilterBottomSheet;

