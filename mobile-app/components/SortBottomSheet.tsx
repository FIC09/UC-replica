import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

export type SortOptionKey = 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc' | 'popular';

interface SortBottomSheetProps {
  visible: boolean;
  selectedSort: SortOptionKey;
  onSelectSort: (sortKey: SortOptionKey) => void;
  onClose: () => void;
}

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  visible,
  selectedSort,
  onSelectSort,
  onClose,
}) => {
  const sortOptions: { key: SortOptionKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'recommended', label: 'Recommended by Forge India', icon: 'sparkles-outline' },
    { key: 'price_asc', label: 'Price: Low to High', icon: 'trending-up-outline' },
    { key: 'price_desc', label: 'Price: High to Low', icon: 'trending-down-outline' },
    { key: 'rating_desc', label: 'Highest Rated (★ 4.8+)', icon: 'star-outline' },
    { key: 'popular', label: 'Most Popular & Booked', icon: 'flame-outline' },
  ];

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
                <Text style={styles.headerTitle}>Sort Services</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {sortOptions.map((opt) => {
                  const isSelected = selectedSort === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      activeOpacity={0.75}
                      onPress={() => {
                        onSelectSort(opt.key);
                        onClose();
                      }}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                      ]}
                    >
                      <View style={styles.optionLeft}>
                        <Ionicons
                          name={opt.icon}
                          size={18}
                          color={isSelected ? Colors.primary : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </View>

                      {isSelected ? (
                        <Ionicons name="radio-button-on" size={20} color={Colors.primary} />
                      ) : (
                        <Ionicons name="radio-button-off" size={20} color={Colors.border} />
                      )}
                    </TouchableOpacity>
                  );
                })}
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
  optionsList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    backgroundColor: Colors.primarySurface,
    borderColor: '#DDD6FE',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  optionLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default SortBottomSheet;

