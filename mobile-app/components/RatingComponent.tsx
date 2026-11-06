import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface RatingComponentProps {
  rating: number;
  reviewsCount?: string;
  size?: 'small' | 'medium' | 'large';
  showStar?: boolean;
  style?: ViewStyle;
}

export const RatingComponent: React.FC<RatingComponentProps> = ({
  rating,
  reviewsCount,
  size = 'medium',
  showStar = true,
  style,
}) => {
  const iconSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;
  const ratingTextSize = size === 'small' ? 11 : size === 'large' ? 16 : 13;

  return (
    <View style={[styles.container, style]}>
      {showStar && (
        <Ionicons name="star" size={iconSize} color={Colors.amber} style={styles.starIcon} />
      )}
      <Text style={[styles.ratingText, { fontSize: ratingTextSize }]}>
        {rating.toFixed(2)}
      </Text>
      {reviewsCount && (
        <Text style={[styles.reviewsText, { fontSize: ratingTextSize - 1 }]}>
          ({reviewsCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  starIcon: {
    marginRight: 1,
  },
  ratingText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  reviewsText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

export default RatingComponent;

