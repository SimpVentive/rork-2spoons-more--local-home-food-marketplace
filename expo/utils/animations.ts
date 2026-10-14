import { Animated, Easing } from 'react-native';
import designTokens from '@/constants/design-tokens';

// Create animated values
export const createFadeAnimation = () => {
  return new Animated.Value(0);
};

export const createSlideAnimation = () => {
  return new Animated.Value(300);
};

export const createScaleAnimation = () => {
  return new Animated.Value(0.9);
};

// Fade In animation
export const fadeIn = (animatedValue: Animated.Value, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Fade Out animation
export const fadeOut = (animatedValue: Animated.Value, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

// Slide Up animation
export const slideUp = (animatedValue: Animated.Value, duration = 350) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Slide Down animation
export const slideDown = (animatedValue: Animated.Value, duration = 350) => {
  return Animated.timing(animatedValue, {
    toValue: 300,
    duration,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });
};

// Scale animation
export const scaleIn = (animatedValue: Animated.Value, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

// Combined fade and slide (entrance)
export const modalEnter = (fadeValue: Animated.Value, slideValue: Animated.Value) => {
  return Animated.parallel([fadeIn(fadeValue, 250), slideUp(slideValue, 350)]);
};

// Combined fade and slide (exit)
export const modalExit = (fadeValue: Animated.Value, slideValue: Animated.Value) => {
  return Animated.parallel([fadeOut(fadeValue, 250), slideDown(slideValue, 350)]);
};

// Bounce animation (for emphasis)
export const bounce = (animatedValue: Animated.Value, fromValue = 0.95) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.05,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: fromValue,
      duration: 150,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);
};

// Pulse animation (for loading or attention)
export const pulse = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: designTokens.animation.duration.slow,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.6,
        duration: designTokens.animation.duration.slow,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// Shimmer animation (for skeleton loaders)
export const shimmer = (animatedValue: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// Spring animation
export const spring = (animatedValue: Animated.Value, toValue = 1) => {
  return Animated.spring(animatedValue, {
    toValue,
    speed: 12,
    bounciness: 8,
    useNativeDriver: true,
  });
};
