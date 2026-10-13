import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  Dimensions,
} from 'react-native';
import designTokens from '@/constants/design-tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const shimmerAnimation = new Animated.Value(0);

  useEffect(() => {
    if (!animated) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animated, shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: animated ? opacity : 1,
          backgroundColor: designTokens.colors.border,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  type?: 'card' | 'list-item';
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  type = 'card',
  style,
}) => {
  if (type === 'list-item') {
    return (
      <View style={[styles.listItemSkeleton, style]}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.listItemContent}>
          <SkeletonLoader width="80%" height={16} style={styles.mb8} />
          <SkeletonLoader width="60%" height={12} />
        </View>
      </View>
    );
  }

  // Card skeleton
  return (
    <View style={[styles.cardSkeleton, style]}>
      {/* Image skeleton */}
      <SkeletonLoader height={160} borderRadius={designTokens.radius.lg} />

      {/* Content skeleton */}
      <View style={styles.cardContent}>
        <SkeletonLoader width="90%" height={18} style={styles.mb12} />

        {/* Seller info */}
        <View style={styles.sellerInfoSkeleton}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width="60%" height={14} style={styles.ml12} />
        </View>

        {/* Location */}
        <SkeletonLoader width="80%" height={12} style={styles.my8} />

        {/* Footer (time and price) */}
        <View style={styles.footerSkeleton}>
          <SkeletonLoader width="40%" height={14} />
          <SkeletonLoader width="25%" height={16} />
        </View>
      </View>
    </View>
  );
};

interface SkeletonGridProps {
  count?: number;
  type?: 'card' | 'list-item';
  style?: ViewStyle;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 6,
  type = 'card',
  style,
}) => {
  return (
    <View
      style={[
        type === 'card' ? styles.gridContainer : styles.listContainer,
        style,
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} type={type} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: designTokens.colors.border,
  },

  cardSkeleton: {
    backgroundColor: designTokens.colors.white,
    borderRadius: designTokens.radius.lg,
    overflow: 'hidden',
    marginBottom: designTokens.spacing.md,
    ...designTokens.shadows.md,
  },

  cardContent: {
    padding: designTokens.spacing.md,
  },

  mb8: {
    marginBottom: designTokens.spacing.sm,
  },

  mb12: {
    marginBottom: designTokens.spacing.md,
  },

  my8: {
    marginVertical: designTokens.spacing.sm,
  },

  ml12: {
    marginLeft: designTokens.spacing.md,
  },

  sellerInfoSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },

  footerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.border,
  },

  listItemContent: {
    flex: 1,
    marginLeft: designTokens.spacing.md,
  },

  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
  },

  listContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export default SkeletonLoader;
