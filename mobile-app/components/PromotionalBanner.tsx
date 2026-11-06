import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
} from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/shadows';
import { Promotion } from '../types';

interface PromotionalBannerProps {
  promotion: Promotion;
  onPress: (promotion: Promotion) => void;
  style?: ViewStyle;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  promotion,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(promotion)}
      style={[
        styles.bannerContainer,
        { backgroundColor: promotion.bgColor || Colors.primary },
        Shadows.card,
        style,
      ]}
    >
      <View style={styles.textColumn}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{promotion.discountBadge}</Text>
        </View>

        <Text
          style={[styles.title, { color: promotion.textColor || Colors.textInverse }]}
          numberOfLines={2}
        >
          {promotion.title}
        </Text>

        <Text
          style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.85)' }]}
          numberOfLines={2}
        >
          {promotion.subtitle}
        </Text>

        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>{promotion.ctaText || 'Claim Offer →'}</Text>
        </View>
      </View>

      {promotion.image && (
        <View style={styles.imageColumn}>
          <Image
            source={promotion.image}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 140,
  },
  textColumn: {
    flex: 1.2,
    justifyContent: 'center',
    paddingRight: Spacing.sm,
  },
  badgePill: {
    backgroundColor: '#FEF08A',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs + 2,
  },
  badgePillText: {
    ...Typography.tinyBold,
    color: '#854D0E',
    letterSpacing: 0.3,
  },
  title: {
    ...Typography.h3,
    fontWeight: '800',
    marginBottom: Spacing.xxs,
    lineHeight: 22,
  },
  subtitle: {
    ...Typography.caption,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  ctaButton: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
  },
  ctaText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  imageColumn: {
    flex: 0.8,
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default PromotionalBanner;

