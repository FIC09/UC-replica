import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  showDiscountBadge?: boolean;
  unit?: string;
  style?: ViewStyle;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  currency = '₹',
  size = 'medium',
  showDiscountBadge = true,
  unit,
  style,
}) => {
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const getPriceFontSize = () => {
    switch (size) {
      case 'small':
        return 13;
      case 'large':
        return 22;
      case 'medium':
      default:
        return 16;
    }
  };

  const priceSize = getPriceFontSize();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.currentPrice, { fontSize: priceSize }]}>
        {currency}
        {price.toLocaleString('en-IN')}
      </Text>

      {unit && <Text style={styles.unitText}>/{unit}</Text>}

      {originalPrice && originalPrice > price && (
        <Text style={[styles.originalPrice, { fontSize: priceSize * 0.75 }]}>
          {currency}
          {originalPrice.toLocaleString('en-IN')}
        </Text>
      )}

      {showDiscountBadge && discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountPercent}% OFF</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs + 2,
    flexWrap: 'wrap',
  },
  currentPrice: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  originalPrice: {
    ...Typography.caption,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  unitText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: -Spacing.xs + 1,
  },
  discountBadge: {
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  discountText: {
    ...Typography.tinyBold,
    color: Colors.emeraldDark,
  },
});

export default PriceDisplay;

