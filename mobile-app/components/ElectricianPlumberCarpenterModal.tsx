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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Spacing, Shadows } from '../theme';

export interface EPCItem {
  id: 'electrician' | 'plumber' | 'carpenter';
  name: string;
  badge: string | null;
  categorySlug: string;
  searchQuery: string;
}

export const EPC_OPTIONS: EPCItem[] = [
  {
    id: 'electrician',
    name: 'Electrician',
    badge: '71 mins',
    categorySlug: 'electrical',
    searchQuery: 'Electrician',
  },
  {
    id: 'plumber',
    name: 'Plumber',
    badge: null,
    categorySlug: 'plumbing',
    searchQuery: 'Plumber',
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    badge: '76 mins',
    categorySlug: 'carpentry',
    searchQuery: 'Carpenter',
  },
];

interface ElectricianPlumberCarpenterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (item: EPCItem) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (Math.min(SCREEN_WIDTH - 48, 540) - 32) / 3;

export const ElectricianPlumberCarpenterModal: React.FC<ElectricianPlumberCarpenterModalProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  if (!visible) return null;

  // Render stylized illustrations matching the official Urban Company modal design
  const renderIcon = (id: string) => {
    switch (id) {
      case 'electrician':
        return (
          <View style={styles.iconContainer}>
            {/* Switchboard */}
            <View style={styles.switchboard}>
              <View style={styles.switchGrid}>
                <View style={styles.switchSlot}>
                  <View style={[styles.switchToggle, { backgroundColor: '#EF4444' }]} />
                </View>
                <View style={styles.switchSlot}>
                  <View style={[styles.switchToggle, { backgroundColor: '#10B981' }]} />
                </View>
              </View>
              <View style={styles.socketThreePin}>
                <View style={[styles.pinHole, { alignSelf: 'center', marginBottom: 2 }]} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 12 }}>
                  <View style={styles.pinHole} />
                  <View style={styles.pinHole} />
                </View>
              </View>
            </View>
            {/* Screwdriver leaning next to switchboard */}
            <View style={styles.screwdriverWrapper}>
              <View style={styles.screwdriverHandle} />
              <View style={styles.screwdriverShaft} />
              <View style={styles.screwdriverTip} />
            </View>
          </View>
        );

      case 'plumber':
        return (
          <View style={styles.iconContainer}>
            {/* Commode / Toilet */}
            <View style={styles.toiletTank}>
              <View style={styles.flushButton} />
            </View>
            <View style={styles.toiletSeat} />
            <View style={styles.toiletBase} />
            {/* Plunger */}
            <View style={styles.plungerWrapper}>
              <View style={styles.plungerStick} />
              <View style={styles.plungerCup} />
            </View>
          </View>
        );

      case 'carpenter':
        return (
          <View style={styles.iconContainer}>
            {/* Wooden Door */}
            <View style={styles.doorFrame}>
              <View style={styles.doorPanelTop} />
              <View style={styles.doorPanelBottom} />
              <View style={styles.doorKnob} />
            </View>
            {/* Drill Tool */}
            <View style={styles.drillWrapper}>
              <View style={styles.drillChuck} />
              <View style={styles.drillBody} />
              <View style={styles.drillHandle} />
            </View>
          </View>
        );

      default:
        return <MaterialCommunityIcons name="tools" size={32} color="#475569" />;
    }
  };

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
                <Text style={styles.title}>Electrician, Plumber & Carpenters</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close dialog"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* 3-Column Row of Electrician, Plumber, Carpenter */}
              <View style={styles.grid}>
                {EPC_OPTIONS.map((item) => (
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
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        {renderIcon(item.id)}
                      </View>

                      {/* Arrival ETA Badge (71 mins, 76 mins) */}
                      {item.badge && (
                        <View style={styles.etaBadge}>
                          <Text style={styles.etaBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>

                    {/* Text Label Below Tile */}
                    <Text style={styles.tileLabel}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reassurance Guarantee Banner Below Tiles */}
              <View style={styles.guaranteeBanner}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color="#10B981"
                  style={{ marginRight: 8, marginTop: 1 }}
                />
                <Text style={styles.guaranteeText}>
                  <Text style={{ fontWeight: '700', color: '#1E293B' }}>
                    Urban Company Guarantee:
                  </Text>{' '}
                  30-day service warranty, verified background-checked pros & upfront transparent pricing.
                </Text>
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
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    padding: 6,
    position: 'relative',
  },
  tileLabel: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  etaBadge: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  etaBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F5132',
  },
  guaranteeBanner: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guaranteeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#475569',
  },

  // Graphical Icon Stylings
  iconContainer: {
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // 1. Electrician switchboard
  switchboard: {
    width: 34,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 3.5,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 6,
  },
  switchGrid: {
    width: 14,
    gap: 3,
  },
  switchSlot: {
    width: 12,
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 1.5,
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    paddingHorizontal: 1.5,
  },
  switchToggle: {
    width: 3.5,
    height: 4,
    borderRadius: 1,
  },
  socketThreePin: {
    width: 12,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinHole: {
    width: 2.2,
    height: 2.2,
    borderRadius: 1.1,
    backgroundColor: '#475569',
  },
  screwdriverWrapper: {
    position: 'absolute',
    right: 4,
    top: 6,
    transform: [{ rotate: '25deg' }],
    alignItems: 'center',
  },
  screwdriverHandle: {
    width: 5,
    height: 15,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: '#DC2626',
  },
  screwdriverShaft: {
    width: 2,
    height: 16,
    backgroundColor: '#94A3B8',
  },
  screwdriverTip: {
    width: 2,
    height: 3,
    backgroundColor: '#334155',
  },

  // 2. Plumber Commode + Plunger
  toiletTank: {
    width: 22,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#94A3B8',
    borderRadius: 2.5,
    marginRight: 10,
    alignItems: 'center',
  },
  flushButton: {
    width: 4,
    height: 2,
    backgroundColor: '#CBD5E1',
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  toiletSeat: {
    width: 26,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.2,
    borderColor: '#94A3B8',
    borderRadius: 4,
    marginRight: 10,
    marginTop: -2,
  },
  toiletBase: {
    width: 16,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#94A3B8',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginRight: 10,
    marginTop: -1,
  },
  plungerWrapper: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    alignItems: 'center',
  },
  plungerStick: {
    width: 2.4,
    height: 22,
    backgroundColor: '#D97706',
    borderRadius: 1,
  },
  plungerCup: {
    width: 14,
    height: 8,
    backgroundColor: '#EF4444',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 0.8,
    borderColor: '#DC2626',
    marginTop: -1,
  },

  // 3. Carpenter Door + Drill
  doorFrame: {
    width: 22,
    height: 36,
    backgroundColor: '#92400E',
    borderWidth: 1.2,
    borderColor: '#78350F',
    borderRadius: 2,
    padding: 2,
    marginRight: 10,
    position: 'relative',
    justifyContent: 'space-between',
  },
  doorPanelTop: {
    height: 12,
    backgroundColor: '#78350F',
    opacity: 0.5,
    borderRadius: 1,
  },
  doorPanelBottom: {
    height: 14,
    backgroundColor: '#78350F',
    opacity: 0.5,
    borderRadius: 1,
  },
  doorKnob: {
    position: 'absolute',
    right: 2,
    top: 17,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FDE047',
    borderWidth: 0.6,
    borderColor: '#CA8A04',
  },
  drillWrapper: {
    position: 'absolute',
    right: 6,
    top: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  drillChuck: {
    width: 4,
    height: 2,
    backgroundColor: '#94A3B8',
  },
  drillBody: {
    width: 10,
    height: 7,
    backgroundColor: '#EAB308',
    borderRadius: 1.5,
    borderWidth: 0.8,
    borderColor: '#CA8A04',
  },
  drillHandle: {
    width: 4,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 1,
    marginTop: 6,
    marginLeft: -5,
  },
});

