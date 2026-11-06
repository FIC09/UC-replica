import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Shadows } from '../theme';

export interface CleaningItem {
  id: 'full-home' | 'cockroach-control';
  name: string;
  line1: string;
  line2?: string;
  searchQuery: string;
  categorySlug: string;
}

export const CLEANING_CHOICES: CleaningItem[] = [
  {
    id: 'full-home',
    name: 'Full Home/ By Room Cleaning',
    line1: 'Full Home/ By Room',
    line2: 'Cleaning',
    searchQuery: 'Full Home Cleaning',
    categorySlug: 'cleaning',
  },
  {
    id: 'cockroach-control',
    name: 'Cockroach Control',
    line1: 'Cockroach Control',
    line2: '',
    searchQuery: 'Pest Control',
    categorySlug: 'pest-control',
  },
];

interface CleaningModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (item: CleaningItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (Math.min(SCREEN_WIDTH - 48, 440) - 32) / 2;

export const CleaningModal: React.FC<CleaningModalProps> = ({
  visible,
  onClose,
  onSelectOption,
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
              {/* Header with Title & Cancel Button on Right Side */}
              <View style={styles.header}>
                <Text style={styles.title}>Cleaning</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close dialog"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* 2-Column Grid */}
              <View style={styles.grid}>
                {CLEANING_CHOICES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.tileWrapper}
                    activeOpacity={0.75}
                    onPress={() => {
                      onClose();
                      onSelectOption(item);
                    }}
                  >
                    {/* Light Gray Rounded Tile Box */}
                    <View style={styles.tileBox}>
                      {item.id === 'full-home' ? (
                        /* House / Room Architectural Illustration */
                        <View style={styles.houseContainer}>
                          {/* Flat Roof */}
                          <View style={styles.houseRoof} />
                          {/* Main Body */}
                          <View style={styles.houseBody}>
                            {/* Left Window Section */}
                            <View style={styles.houseLeftCol}>
                              <View style={styles.windowUpper}>
                                <View style={styles.windowDivider} />
                              </View>
                              <View style={styles.floorDivider} />
                              <View style={styles.windowLower} />
                            </View>
                            {/* Door */}
                            <View style={styles.houseDoor}>
                              <View style={styles.doorHandle} />
                            </View>
                            {/* Right Wood Siding */}
                            <View style={styles.houseWoodWall}>
                              <View style={styles.woodSlats} />
                              <View style={styles.woodSlats} />
                              <View style={styles.woodSlats} />
                            </View>
                          </View>
                          {/* Base line with bush */}
                          <View style={styles.houseBaseRow}>
                            <View style={styles.gardenBush} />
                            <View style={styles.groundLine} />
                          </View>
                        </View>
                      ) : (
                        /* Cockroach Control Prohibition Icon */
                        <View style={styles.pestContainer}>
                          {/* Red prohibition circle */}
                          <View style={styles.banCircle}>
                            {/* Diagonal slash */}
                            <View style={styles.banSlash} />
                            {/* Cockroach body */}
                            <View style={styles.roachBody}>
                              <View style={styles.roachHead} />
                              <View style={styles.roachThorax} />
                              <View style={styles.roachAbdomen} />
                              {/* Antennae */}
                              <View style={styles.antennaLeft} />
                              <View style={styles.antennaRight} />
                            </View>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Text Label Below Tile */}
                    <View style={styles.tileLabelCol}>
                      <Text style={styles.tileLabel}>{item.line1}</Text>
                      {item.line2 ? <Text style={styles.tileLabel}>{item.line2}</Text> : null}
                    </View>
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
    maxWidth: 440,
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
    fontSize: 22,
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
    justifyContent: 'space-between',
    gap: 16,
  },
  tileWrapper: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  tileBox: {
    width: '100%',
    height: 86,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  tileLabelCol: {
    marginTop: 8,
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },

  // 1. House Architectural Illustration
  houseContainer: {
    width: 52,
    alignItems: 'center',
  },
  houseRoof: {
    width: 48,
    height: 3.5,
    backgroundColor: '#475569',
    borderRadius: 1.5,
  },
  houseBody: {
    width: 42,
    height: 28,
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#64748B',
    borderRadius: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  houseLeftCol: {
    width: 20,
    height: '100%',
    padding: 2,
    justifyContent: 'space-between',
  },
  windowUpper: {
    height: 9,
    backgroundColor: '#93C5FD',
    borderRadius: 1,
    borderWidth: 0.8,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  floorDivider: {
    height: 1,
    backgroundColor: '#94A3B8',
  },
  windowLower: {
    height: 10,
    backgroundColor: '#93C5FD',
    borderRadius: 1,
    borderWidth: 0.8,
    borderColor: '#3B82F6',
  },
  houseDoor: {
    width: 8,
    height: 15,
    backgroundColor: '#78350F',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  doorHandle: {
    position: 'absolute',
    right: 1.5,
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
    backgroundColor: '#FCD34D',
  },
  houseWoodWall: {
    flex: 1,
    height: '100%',
    backgroundColor: '#B45309',
    justifyContent: 'space-evenly',
    paddingVertical: 2,
  },
  woodSlats: {
    height: 0.8,
    backgroundColor: '#78350F',
    width: '100%',
  },
  houseBaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    marginTop: 1,
  },
  gardenBush: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
    marginRight: 2,
  },
  groundLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
  },

  // 2. Cockroach Pest Prohibition Illustration
  pestContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2.8,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  banSlash: {
    position: 'absolute',
    width: 2.8,
    height: 40,
    backgroundColor: '#DC2626',
    transform: [{ rotate: '45deg' }],
    zIndex: 2,
  },
  roachBody: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  roachHead: {
    width: 5,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#78350F',
  },
  roachThorax: {
    width: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#92400E',
    marginTop: -1,
  },
  roachAbdomen: {
    width: 9,
    height: 14,
    borderTopLeftRadius: 4.5,
    borderTopRightRadius: 4.5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: '#B45309',
    marginTop: -1,
  },
  antennaLeft: {
    position: 'absolute',
    top: -5,
    left: -4,
    width: 6,
    height: 5,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#78350F',
    borderTopLeftRadius: 5,
  },
  antennaRight: {
    position: 'absolute',
    top: -5,
    right: -4,
    width: 6,
    height: 5,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: '#78350F',
    borderTopRightRadius: 5,
  },
});

