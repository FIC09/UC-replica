import React from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import PriceDisplay from './PriceDisplay';
import PrimaryButton from './PrimaryButton';

interface StickyBookNowButtonProps {
  price: number;
  originalPrice?: number;
  duration?: string;
  isAdded?: boolean;
  onBookPress: () => void;
  style?: ViewStyle;
}

export const StickyBookNowButton: React.FC<StickyBookNowButtonProps> = ({
  price,
  originalPrice,
  duration,
  isAdded = false,
  onBookPress,
  style,
}) => {
  return (
    <View style={[styles.container, Shadows.bottomNav, style]}>
      <View style={styles.priceColumn}>
        <Text style={styles.totalLabel}>Total Price</Text>
        <PriceDisplay
          price={price}
          originalPrice={originalPrice}
          size="large"
        />
        {duration && (
          <Text style={styles.durationText}>Estimated time: {duration}</Text>
        )}
      </View>

      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title={isAdded ? 'Added to Cart ✓' : 'Book Now'}
          variant={isAdded ? 'dark' : 'primary'}
          onPress={onBookPress}
          size="medium"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  priceColumn: {
    flex: 1,
  },
  totalLabel: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  durationText: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buttonWrapper: {
    width: 160,
  },
});

export default StickyBookNowButton;

