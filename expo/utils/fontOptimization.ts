import { Platform } from 'react-native';

/**
 * System font configurations optimized for each platform
 * Using system fonts reduces bundle size and improves performance
 */
export const systemFonts = {
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto_medium',
    semibold: 'Roboto_medium',
    bold: 'Roboto_bold',
  },
  web: {
    regular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    medium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    semibold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    bold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
} as const;

/**
 * Get optimized font family for the current platform
 */
export const getSystemFont = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular'): string => {
  const platform = Platform.OS as keyof typeof systemFonts;
  return systemFonts[platform]?.[weight] || systemFonts.ios[weight];
};

/**
 * Font weight mappings for consistent typography across platforms
 */
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

/**
 * Optimized text styles for common use cases
 */
export const textStyles = {
  heading1: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    fontFamily: getSystemFont('bold'),
    lineHeight: 34,
  },
  heading2: {
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    fontFamily: getSystemFont('semibold'),
    lineHeight: 30,
  },
  heading3: {
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    fontFamily: getSystemFont('semibold'),
    lineHeight: 26,
  },
  heading4: {
    fontSize: 18,
    fontWeight: fontWeights.medium,
    fontFamily: getSystemFont('medium'),
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: fontWeights.regular,
    fontFamily: getSystemFont('regular'),
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: fontWeights.medium,
    fontFamily: getSystemFont('medium'),
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    fontFamily: getSystemFont('regular'),
    lineHeight: 18,
  },
  captionMedium: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    fontFamily: getSystemFont('medium'),
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    fontFamily: getSystemFont('regular'),
    lineHeight: 16,
  },
  smallMedium: {
    fontSize: 12,
    fontWeight: fontWeights.medium,
    fontFamily: getSystemFont('medium'),
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    fontFamily: getSystemFont('semibold'),
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    fontFamily: getSystemFont('medium'),
    lineHeight: 18,
  },
} as const;

/**
 * Get responsive font size based on screen size
 */
export const getResponsiveFontSize = (baseSize: number, screenWidth: number): number => {
  if (screenWidth < 375) {
    return Math.max(baseSize - 2, 12); // Minimum font size of 12
  } else if (screenWidth > 414) {
    return baseSize + 1;
  }
  return baseSize;
};