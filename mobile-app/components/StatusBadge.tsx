import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

export type StatusVariant =
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'sale'
  | 'time'
  | 'new'
  | 'popular'
  | 'warning'
  | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
  size = 'medium',
}) => {
  const getBadgeColors = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'upcoming':
        return { bg: Colors.primarySurface, text: Colors.primary, border: '#DDD6FE' };
      case 'in_progress':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'completed':
        return { bg: Colors.emeraldLight, text: Colors.emeraldDark, border: '#A7F3D0' };
      case 'cancelled':
        return { bg: Colors.errorLight, text: Colors.error, border: '#FECACA' };
      case 'sale':
        return { bg: Colors.emerald, text: '#FFFFFF' };
      case 'time':
        return { bg: Colors.purpleLight, text: Colors.purple, border: '#E9D5FF' };
      case 'new':
      case 'popular':
        return { bg: Colors.secondary, text: '#FFFFFF' };
      case 'warning':
        return { bg: Colors.warningLight, text: Colors.warning };
      case 'neutral':
      default:
        return { bg: Colors.surfaceAlt, text: Colors.textSecondary, border: Colors.border };
    }
  };

  const colors = getBadgeColors();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border || 'transparent',
          paddingHorizontal: isSmall ? Spacing.xs + 2 : Spacing.sm + 2,
          paddingVertical: isSmall ? 2 : Spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: colors.text, fontSize: isSmall ? 10 : 11 },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...Typography.tinyBold,
    letterSpacing: 0.2,
  },
});

export default StatusBadge;

