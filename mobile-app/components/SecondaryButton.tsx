import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'outline' | 'tint' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  variant = 'outline',
  size = 'medium',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const getColors = () => {
    if (disabled) {
      return {
        bg: 'transparent',
        border: Colors.border,
        text: Colors.textDisabled,
      };
    }
    switch (variant) {
      case 'tint':
        return {
          bg: Colors.primarySurface,
          border: 'transparent',
          text: Colors.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: Colors.primary,
        };
      case 'outline':
      default:
        return {
          bg: '#FFFFFF',
          border: Colors.border,
          text: Colors.textPrimary,
        };
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md };
      case 'large':
        return { paddingVertical: Spacing.lg - 2, paddingHorizontal: Spacing.xl };
      case 'medium':
      default:
        return { paddingVertical: Spacing.md - 1, paddingHorizontal: Spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      case 'medium':
      default:
        return 14;
    }
  };

  const { bg, border, text } = getColors();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'ghost' ? 0 : 1.2,
        },
        getPadding(),
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: text, fontSize: getFontSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
  },
  text: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default SecondaryButton;

