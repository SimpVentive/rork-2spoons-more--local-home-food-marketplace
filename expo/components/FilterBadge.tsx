import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import colors from '@/constants/colors';
import designTokens from '@/constants/design-tokens';

interface FilterBadgeProps {
  label: string;
  onRemove?: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({
  label,
  onRemove,
  style,
  variant = 'primary',
}) => {
  const backgroundColor =
    variant === 'primary' ? designTokens.colors.primary : designTokens.colors.secondary;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={styles.badgeText}>{label}</Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeButton}
        >
          <X size={14} color={designTokens.colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

interface ActiveFiltersProps {
  filters: { id: string; label: string }[];
  onRemoveFilter?: (filterId: string) => void;
  onClearAll?: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  if (filters.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Filters</Text>
        {onClearAll && filters.length > 0 && (
          <TouchableOpacity onPress={onClearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {filters.map((filter) => (
          <FilterBadge
            key={filter.id}
            label={filter.label}
            onRemove={
              onRemoveFilter ? () => onRemoveFilter(filter.id) : undefined
            }
            style={styles.badge}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designTokens.colors.background,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },

  title: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.bold,
    color: designTokens.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  clearAll: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
    color: designTokens.colors.primary,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    gap: designTokens.spacing.sm,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designTokens.colors.primary,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.radius.full,
    gap: designTokens.spacing.sm,
  },

  badgeText: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
    color: designTokens.colors.white,
  },

  removeButton: {
    padding: designTokens.spacing.xs,
  },
});

export default FilterBadge;
