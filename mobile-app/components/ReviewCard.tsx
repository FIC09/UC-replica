import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { ServiceReview } from '../types';
import RatingComponent from './RatingComponent';

interface ReviewCardProps {
  review: ServiceReview;
  style?: ViewStyle;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, style }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const toggleHelpful = () => {
    if (hasLiked) {
      setHelpfulCount(helpfulCount - 1);
      setHasLiked(false);
    } else {
      setHelpfulCount(helpfulCount + 1);
      setHasLiked(true);
    }
  };

  return (
    <View style={[styles.card, style]}>
      {/* Header: Avatar, Name, Rating & Date */}
      <View style={styles.headerRow}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {review.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.userName}>{review.userName}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.emerald} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>

        <RatingComponent rating={review.rating} size="small" />
      </View>

      {/* Comment Body */}
      <Text style={styles.commentText}>{review.comment}</Text>

      {/* Helpful Action */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleHelpful}
          style={[styles.helpfulBtn, hasLiked && styles.helpfulBtnActive]}
        >
          <Ionicons
            name={hasLiked ? 'thumbs-up' : 'thumbs-up-outline'}
            size={13}
            color={hasLiked ? Colors.primary : Colors.textMuted}
          />
          <Text style={[styles.helpfulText, hasLiked && styles.helpfulTextActive]}>
            Helpful ({helpfulCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.emeraldLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  verifiedText: {
    ...Typography.tinyBold,
    color: Colors.emeraldDark,
    fontSize: 9,
  },
  reviewDate: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  commentText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginVertical: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  helpfulBtnActive: {
    backgroundColor: Colors.primarySurface,
  },
  helpfulText: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  helpfulTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default ReviewCard;

