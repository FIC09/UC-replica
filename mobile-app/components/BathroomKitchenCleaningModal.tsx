import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Share,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Shadows } from '../theme';

export interface CleaningOptionItem {
  id: 'single-bathroom' | 'kitchen-cleaning';
  title: string;
  subtitle: string;
  priceText: string;
  type: 'toilet-illustration' | 'image';
  searchQuery: string;
}

export const CLEANING_OPTIONS: CleaningOptionItem[] = [
  {
    id: 'single-bathroom',
    title: 'Single Bathroom Visit',
    subtitle: 'One-time deep cleaning',
    priceText: 'Starts at ₹419/service',
    type: 'toilet-illustration',
    searchQuery: 'Bathroom Deep Cleaning',
  },
  {
    id: 'kitchen-cleaning',
    title: 'Kitchen cleaning',
    subtitle: 'For one time kitchen deep cleaning needs',
    priceText: 'Starting at ₹799',
    type: 'image',
    searchQuery: 'Kitchen Deep Cleaning',
  },
];

interface BathroomKitchenCleaningModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (item: CleaningOptionItem) => void;
}

export const BathroomKitchenCleaningModal: React.FC<BathroomKitchenCleaningModalProps> = ({
  visible,
  onClose,
  onSelectOption,
}) => {
  if (!visible) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Bathroom & Kitchen Cleaning - Forge India Connect',
        message: 'Book professional Bathroom & Kitchen deep cleaning starting at ₹419 on Forge India Connect!',
      });
    } catch {
      // ignore
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
              {/* Header: Back arrow, Title, Share icon, and Close icon */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.backBtn}
                    accessibilityLabel="Back"
                  >
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                  </TouchableOpacity>
                  <Text style={styles.title}>Bathroom & Kitchen cleaning</Text>
                </View>

                <View style={styles.headerRight}>
                  <TouchableOpacity
                    onPress={handleShare}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.actionBtn}
                    accessibilityLabel="Share"
                  >
                    <Ionicons name="share-social-outline" size={19} color="#64748B" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.closeBtn}
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={18} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Options List */}
              <View style={styles.optionsList}>
                {CLEANING_OPTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.optionRow}
                    activeOpacity={0.75}
                    onPress={() => {
                      onClose();
                      onSelectOption(item);
                    }}
                  >
                    {/* Left Box */}
                    <View style={styles.visualBox}>
                      {item.type === 'toilet-illustration' ? (
                        <View style={styles.commodeWrapper}>
                          {/* Left gold sparkle */}
                          <Text style={styles.sparkle}>✦</Text>
                          {/* Commode tank & bowl illustration */}
                          <View style={styles.commodeContainer}>
                            <View style={styles.commodeTank}>
                              <View style={styles.commodeFlush} />
                            </View>
                            <View style={styles.commodeSeat} />
                            <View style={styles.commodeBowl} />
                            <View style={styles.commodeFoot} />
                          </View>
                        </View>
                      ) : (
                        <Image
                          source={require('../assets/images/kitchen_stove_clean.jpg')}
                          style={styles.stoveImage}
                          contentFit="cover"
                          transition={150}
                        />
                      )}
                    </View>

                    {/* Right Content */}
                    <View style={styles.contentCol}>
                      <Text style={styles.optionTitle}>{item.title}</Text>
                      <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                      <Text style={styles.optionPrice}>{item.priceText}</Text>
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
    maxWidth: 480,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backBtn: {
    padding: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    gap: 12,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 18,
  },
  visualBox: {
    width: 88,
    height: 88,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  stoveImage: {
    width: '100%',
    height: '100%',
  },
  contentCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 6,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },

  // Sparkling Commode Illustration
  commodeWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: 18,
    left: 4,
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
  },
  commodeContainer: {
    alignItems: 'center',
    marginLeft: 10,
  },
  commodeTank: {
    width: 22,
    height: 18,
    backgroundColor: '#BFDBFE',
    borderTopLeftRadius: 3.5,
    borderTopRightRadius: 3.5,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    alignItems: 'center',
    paddingTop: 3,
  },
  commodeFlush: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  commodeSeat: {
    width: 28,
    height: 7,
    backgroundColor: '#93C5FD',
    borderRadius: 3.5,
    marginTop: -1,
  },
  commodeBowl: {
    width: 24,
    height: 15,
    backgroundColor: '#DBEAFE',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  commodeFoot: {
    width: 13,
    height: 6,
    backgroundColor: '#BFDBFE',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});

