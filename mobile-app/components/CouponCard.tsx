import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Coupon } from '../types';

interface CouponCardProps {
  coupon: Coupon;
  onApply: (coupon: Coupon) => void;
  isApplied?: boolean;
  style?: ViewStyle;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onApply,
  isApplied = false,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {/* Left ticket cutout & icon */}
      <View style={styles.leftCol}>
        <View style={styles.iconCircle}>
          <Ionicons name="pricetag" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.codeText}>{coupon.code}</Text>
      </View>

      {/* Divider */}
      <View style={styles.dashDivider} />

      {/* Right details */}
      <View style={styles.rightCol}>
        <Text style={styles.title}>{coupon.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {coupon.description}
        </Text>
        <Text style={styles.conditionText}>
          Min. Order ₹{coupon.minOrderValue} • Valid till {coupon.expiresAt}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onApply(coupon)}
          style={[styles.applyButton, isApplied && styles.applyButtonApplied]}
        >
          <Text style={[styles.applyText, isApplied && styles.applyTextApplied]}>
            {isApplied ? 'Applied ✓' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.2,
    borderColor: '#E9D5FF',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  leftCol: {
    backgroundColor: Colors.primarySurface,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  codeText: {
    ...Typography.tinyBold,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  dashDivider: {
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  rightCol: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },
  conditionText: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  applyButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs + 2,
  },
  applyButtonApplied: {
    backgroundColor: Colors.emeraldLight,
    borderWidth: 1,
    borderColor: Colors.emerald,
  },
  applyText: {
    ...Typography.captionBold,
    color: Colors.textInverse,
  },
  applyTextApplied: {
    color: Colors.emeraldDark,
  },
});

export default CouponCard;

