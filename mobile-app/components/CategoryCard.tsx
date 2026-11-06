import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  Image,
} from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  variant?: 'grid' | 'compact' | 'horizontal';
  style?: ViewStyle;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  variant = 'grid',
  style,
}) => {
  const isHorizontal = variant === 'horizontal';

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={() => onPress(category)}
      style={[
        styles.card,
        isHorizontal ? styles.cardHorizontal : styles.cardGrid,
        style,
      ]}
    >
      <View style={styles.iconBox}>
        {/* Sale / Time Badge */}
        {category.badge && (
          <View
            style={[
              styles.badge,
              category.badgeType === 'sale' ? styles.badgeSale : styles.badgeTime,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                category.badgeType === 'sale'
                  ? styles.badgeTextSale
                  : styles.badgeTextTime,
              ]}
            >
              {category.badge}
            </Text>
          </View>
        )}

        {typeof category.icon === 'number' || typeof category.icon === 'object' ? (
          <Image
            source={category.icon}
            style={styles.iconImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fallbackIcon} />
        )}
      </View>

      <Text
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  cardGrid: {
    width: '24%',
    marginBottom: Spacing.md,
  },
  cardHorizontal: {
    width: 80,
    marginRight: Spacing.md,
  },
  iconBox: {
    width: 66,
    height: 66,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  fallbackIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLighter,
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },
  badgeSale: {
    backgroundColor: Colors.emerald,
  },
  badgeTime: {
    backgroundColor: Colors.purpleLight,
  },
  badgeText: {
    ...Typography.tinyBold,
    fontSize: 8.5,
  },
  badgeTextSale: {
    color: '#FFFFFF',
  },
  badgeTextTime: {
    color: Colors.purple,
  },
  title: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs + 2,
    lineHeight: 15,
  },
});

export default CategoryCard;

