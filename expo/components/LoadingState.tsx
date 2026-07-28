import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { ChefHat, Utensils, Coffee } from 'lucide-react-native';
import colors from '@/constants/colors';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

const { width } = Dimensions.get('window');

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Preparing your delicious meal...',
  size = 'medium',
  showMessage = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnimation.start();
    pulseAnimation.start();
    fadeAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getIconSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 32;
    }
  };

  const getContainerStyle = () => {
    switch (size) {
      case 'small': return styles.smallContainer;
      case 'large': return styles.largeContainer;
      default: return styles.container;
    }
  };

  return (
    <View style={getContainerStyle()}>
      <View style={styles.animationContainer}>
        {/* Main rotating chef hat */}
        <Animated.View
          style={[
            styles.mainIcon,
            {
              transform: [{ rotate }, { scale: scaleAnim }],
            },
          ]}
        >
          <ChefHat size={getIconSize()} color={colors.primary} />
        </Animated.View>

        {/* Floating utensils */}
        <Animated.View
          style={[
            styles.floatingIcon,
            styles.leftIcon,
            { opacity: fadeAnim },
          ]}
        >
          <Utensils size={getIconSize() * 0.6} color={colors.secondary} />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingIcon,
            styles.rightIcon,
            { opacity: fadeAnim },
          ]}
        >
          <Coffee size={getIconSize() * 0.6} color={colors.warning} />
        </Animated.View>
      </View>

      {showMessage && (
        <Animated.Text
          style={[
            styles.message,
            size === 'small' && styles.smallMessage,
            size === 'large' && styles.largeMessage,
            { opacity: fadeAnim },
          ]}
        >
          {message}
        </Animated.Text>
      )}

      {/* Loading dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  smallContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  largeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    backgroundColor: colors.background,
  },
  animationContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  mainIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.33,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  floatingIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  leftIcon: {
    top: 20,
    left: 0,
  },
  rightIcon: {
    bottom: 20,
    right: 0,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  smallMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  largeMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
});

export default LoadingState;