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
import { Address } from '../types';
import StatusBadge from './StatusBadge';

interface AddressCardProps {
  address: Address;
  isSelected?: boolean;
  onSelect?: (address: Address) => void;
  onEdit?: (address: Address) => void;
  style?: ViewStyle;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  style,
}) => {
  const getAddressIcon = () => {
    switch (address.type) {
      case 'Work':
        return 'briefcase-outline';
      case 'Other':
        return 'location-outline';
      case 'Home':
      default:
        return 'home-outline';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect && onSelect(address)}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
            <Ionicons
              name={getAddressIcon()}
              size={18}
              color={isSelected ? Colors.primary : Colors.textSecondary}
            />
          </View>
          <Text style={styles.label}>{address.label}</Text>
          {address.isDefault && (
            <StatusBadge label="Default" variant="completed" size="small" />
          )}
        </View>

        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(address)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.fullAddress}>{address.fullAddress}</Text>

      {address.landmark && (
        <Text style={styles.landmark}>Landmark: {address.landmark}</Text>
      )}

      <Text style={styles.cityPostal}>
        {address.city} - {address.postalCode}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#FAFAFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: Colors.primarySurface,
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  fullAddress: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.xxs,
  },
  landmark: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xxs,
  },
  cityPostal: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
});

export default AddressCard;

