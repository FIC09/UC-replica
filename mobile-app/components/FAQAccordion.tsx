import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { ServiceFAQ } from '../types';

interface FAQAccordionProps {
  faqs: ServiceFAQ[];
  style?: ViewStyle;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, style }) => {
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, style]}>
      {faqs.map((faq, idx) => {
        const isExpanded = expandedId === faq.id;
        return (
          <View
            key={faq.id}
            style={[
              styles.itemCard,
              idx === faqs.length - 1 && styles.itemCardLast,
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => toggleExpand(faq.id)}
              style={styles.questionRow}
            >
              <Text style={styles.questionText}>{faq.question}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.answerWrapper}>
                <Text style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  itemCard: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  itemCardLast: {
    borderBottomWidth: 0,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  questionText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  answerWrapper: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  answerText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default FAQAccordion;

