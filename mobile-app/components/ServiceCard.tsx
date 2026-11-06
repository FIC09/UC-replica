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
import { Service } from '../types';
import RatingComponent from './RatingComponent';
import PriceDisplay from './PriceDisplay';
import StatusBadge from './StatusBadge';

interface ServiceCardProps {
  service: Service;
  onPress: (service: Service) => void;
  onAddPress?: (service: Service) => void;
  isAdded?: boolean;
  variant?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  onAddPress,
  isAdded = false,
  variant = 'vertical',
  style,
}) => {
  const isHorizontal = variant === 'horizontal';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(service)}
      style={[
        styles.card,
        isHorizontal ? styles.cardHorizontal : styles.cardVertical,
        Shadows.card,
        style,
      ]}
    >
      {/* Image Container */}
      <View
        style={[
          styles.imageContainer,
          isHorizontal ? styles.imageContainerHorizontal : styles.imageContainerVertical,
        ]}
      >
        <Image
          source={service.image}
          style={styles.image}
          resizeMode="cover"
        />

        {service.badge && (
          <View style={styles.topBadge}>
            <StatusBadge label={service.badge} variant="sale" size="small" />
          </View>
        )}
      </View>

      {/* Content Container */}
      <View
        style={[
          styles.contentContainer,
          isHorizontal && styles.contentContainerHorizontal,
        ]}
      >
        <View style={styles.topInfoRow}>
          <RatingComponent rating={service.rating} reviewsCount={service.reviewsCount} size="small" />
          {service.duration && (
            <Text style={styles.durationText}>• {service.duration}</Text>
          )}
        </View>

        <Text
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {service.title}
        </Text>

        {service.description && !isHorizontal && (
          <Text
            style={styles.description}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {service.description}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <PriceDisplay
            price={service.price}
            originalPrice={service.originalPrice}
            size={isHorizontal ? 'small' : 'medium'}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => (onAddPress ? onAddPress(service) : onPress(service))}
            style={[
              styles.addButton,
              isAdded && styles.addButtonActive,
            ]}
          >
            <Text
              style={[
                styles.addButtonText,
                isAdded && styles.addButtonTextActive,
              ]}
            >
              {isAdded ? 'Added ✓' : 'Add +'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardVertical: {
    width: 200,
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHorizontal: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },
  imageContainer: {
    backgroundColor: Colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainerVertical: {
    width: '100%',
    height: 125,
  },
  imageContainerHorizontal: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadge: {
    position: 'absolute',
    top: Spacing.xs + 2,
    left: Spacing.xs + 2,
  },
  contentContainer: {
    padding: Spacing.md,
    justifyContent: 'space-between',
    flex: 1,
  },
  contentContainerHorizontal: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  durationText: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  addButton: {
    paddingHorizontal: Spacing.md - 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  addButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addButtonText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  addButtonTextActive: {
    color: Colors.textInverse,
  },
});

export default ServiceCard;

