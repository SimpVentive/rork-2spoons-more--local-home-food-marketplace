import { Platform } from 'react-native';

// Design Tokens - Comprehensive system for all UI properties
export const designTokens = {
  // ========== COLORS ==========
  colors: {
    // Primary Brand
    primary: '#FF6B35',
    primaryLight: '#FF8C5A',
    primaryDark: '#E55A24',

    // Secondary Brand
    secondary: '#4ECDC4',
    secondaryLight: '#7FE1DD',
    secondaryDark: '#2AA89D',

    // Semantic Colors
    success: '#27AE60',
    successLight: '#52C96D',
    error: '#E74C3C',
    errorLight: '#EC7063',
    warning: '#F39C12',
    warningLight: '#F8B739',
    info: '#3498DB',
    infoLight: '#5DADE2',

    // Dietary Indicators
    vegetarian: '#27AE60',
    nonVegetarian: '#E74C3C',

    // Neutral Palette
    white: '#FFFFFF',
    black: '#000000',

    // Text Colors
    text: '#2C3E50',
    textLight: '#7F8C8D',
    textLighter: '#95A5A6',
    textInverse: '#FFFFFF',

    // Backgrounds
    background: '#F8F9FA',
    card: '#FFFFFF',

    // Borders & Dividers
    border: '#E9ECEF',
    borderLight: '#F2F3F5',

    // Shadow
    shadow: '#000000',
  },

  // ========== TYPOGRAPHY ==========
  typography: {
    // Font Families
    family: {
      default: Platform.OS === 'ios' ? 'System' : 'Roboto',
      mono: Platform.OS === 'ios' ? 'Menlo' : 'RobotoMono',
    },

    // Font Sizes (consistent scale)
    size: {
      xs: 11,      // Small labels
      sm: 12,      // Captions
      base: 14,    // Body text
      md: 16,      // Regular body
      lg: 18,      // Large body
      xl: 20,      // Card titles
      '2xl': 24,   // Section headers
      '3xl': 28,   // Large headers
      '4xl': 32,   // Page titles
    },

    // Font Weights
    weight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Predefined Text Styles
    styles: {
      // Page Titles
      h1: {
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 1.2,
      },
      // Section Headers
      h2: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 1.2,
      },
      // Card Titles
      h3: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 1.3,
      },
      // Subsection Headers
      h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 1.3,
      },
      // Large body text
      h5: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 1.4,
      },
      // Regular body text
      body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.5,
      },
      // Smaller body text
      bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 1.5,
      },
      // Caption/Meta text
      caption: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 1.4,
      },
      // Small labels
      label: {
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 1.3,
      },
    },
  },

  // ========== SPACING ==========
  spacing: {
    // 8px base unit grid
    xs: 4,      // 0.5 * base
    sm: 8,      // 1 * base
    md: 12,     // 1.5 * base
    lg: 16,     // 2 * base
    xl: 20,     // 2.5 * base
    '2xl': 24,  // 3 * base
    '3xl': 32,  // 4 * base
    '4xl': 40,  // 5 * base
    '5xl': 48,  // 6 * base
  },

  // ========== BORDER RADIUS ==========
  radius: {
    none: 0,
    sm: 4,      // Slight rounding
    md: 8,      // Default components
    lg: 12,     // Cards, large elements
    xl: 16,     // Modal corners
    '2xl': 20,  // Bottom sheets
    full: 9999, // Fully rounded (circles)
  },

  // ========== SHADOWS & ELEVATION ==========
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
    '2xl': {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
      elevation: 10,
    },
  },

  // ========== SIZES ==========
  size: {
    // Icon sizes
    icon: {
      xs: 12,
      sm: 16,
      base: 20,
      md: 24,
      lg: 32,
      xl: 48,
    },

    // Touch target sizes (min 48x48)
    touch: {
      sm: 40,
      base: 48,
      lg: 56,
    },

    // Image sizes
    image: {
      avatar: 32,
      avatarLarge: 48,
      thumbnail: 80,
      card: 160,
      hero: 240,
    },
  },

  // ========== ANIMATION/TRANSITIONS ==========
  animation: {
    duration: {
      fast: 150,      // Quick interactions
      base: 250,      // Standard animations
      slow: 350,      // Smooth transitions
      slower: 500,    // Deliberate animations
    },

    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // ========== Z-INDEX SCALE ==========
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 1000,
    toast: 1100,
    tooltip: 1200,
  },

  // ========== COMMON PATTERNS ==========
  common: {
    // Button heights by size
    buttonHeight: {
      small: 40,
      medium: 48,
      large: 56,
    },

    // Search bar height
    searchBarHeight: 44,

    // Tab bar height
    tabBarHeight: Platform.OS === 'ios' ? 85 : 60,

    // Header height
    headerHeight: 56,

    // Safe area padding (bottom sheet, modals)
    safeAreaPadding: Platform.OS === 'ios' ? 40 : 20,
  },
};

export default designTokens;
