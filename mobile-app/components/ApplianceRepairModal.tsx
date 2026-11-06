import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

export interface ApplianceItem {
  id: string;
  name: string;
  image: any;
  category: string;
  searchQuery: string;
}

export const APPLIANCE_ITEMS: ApplianceItem[] = [
  {
    id: 'ac',
    name: 'AC',
    image: require('../assets/images/appliance_ac.jpg'),
    category: 'ac-services',
    searchQuery: 'AC Service',
  },
  {
    id: 'chimney',
    name: 'Chimney Repair',
    image: require('../assets/images/appliance_chimney.jpg'),
    category: 'appliances',
    searchQuery: 'Chimney Repair',
  },
  {
    id: 'geyser',
    name: 'Geyser Service & Repair',
    image: require('../assets/images/appliance_geyser.jpg'),
    category: 'appliances',
    searchQuery: 'Geyser',
  },
  {
    id: 'laptop',
    name: 'Laptop Repair',
    image: require('../assets/images/appliance_laptop.jpg'),
    category: 'appliances',
    searchQuery: 'Laptop Repair',
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator',
    image: require('../assets/images/appliance_fridge.jpg'),
    category: 'appliances',
    searchQuery: 'Refrigerator',
  },
  {
    id: 'washing-machine',
    name: 'Washing Machine Repair',
    image: require('../assets/images/appliance_washer.jpg'),
    category: 'appliances',
    searchQuery: 'Washing Machine Repair',
  },
  {
    id: 'microwave',
    name: 'Microwave',
    image: require('../assets/images/appliance_microwave.jpg'),
    category: 'appliances',
    searchQuery: 'Microwave',
  },
  {
    id: 'television',
    name: 'Television Repair',
    image: require('../assets/images/appliance_tv.jpg'),
    category: 'appliances',
    searchQuery: 'Television Repair',
  },
  {
    id: 'water-purifier',
    name: 'Water Purifier Service & Installation',
    image: require('../assets/images/appliance_water_purifier.jpg'),
    category: 'native-purifier',
    searchQuery: 'Water Purifier',
  },
];

interface ApplianceRepairModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAppliance: (item: ApplianceItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (Math.min(SCREEN_WIDTH - 48, 540) - 32) / 3;

export const ApplianceRepairModal: React.FC<ApplianceRepairModalProps> = ({
  visible,
  onClose,
  onSelectAppliance,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialogCard, Shadows.cardHover]}>
              {/* Header with Title and Round Close Button */}
              <View style={styles.header}>
                <Text style={styles.title}>Appliance Repair & Service</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close dialog"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* 3x3 Grid of 9 Appliances */}
              <View style={styles.grid}>
                {APPLIANCE_ITEMS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.tileWrapper}
                    activeOpacity={0.75}
                    onPress={() => {
                      onClose();
                      onSelectAppliance(item);
                    }}
                  >
                    {/* Light Gray Rounded Tile Box */}
                    <View style={styles.tileBox}>
                      <Image
                        source={item.image}
                        style={styles.tileImage}
                        contentFit="contain"
                        transition={150}
                      />
                    </View>
                    {/* Appliance Name */}
                    <Text style={styles.tileLabel} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 540,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  tileWrapper: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  tileBox: {
    width: '100%',
    height: 82,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  tileImage: {
    width: '80%',
    height: 52,
  },
  tileLabel: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 15,
  },
});

