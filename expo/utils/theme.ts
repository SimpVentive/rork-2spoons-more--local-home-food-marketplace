import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getCurrentTheme: () => 'light' | 'dark';
}

// Theme persistence store
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      setTheme: (theme: Theme) => set({ theme }),
      getCurrentTheme: () => {
        const theme = get().theme;
        if (theme === 'auto') {
          // This will be determined by system preference
          return 'light'; // default fallback
        }
        return theme;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Color definitions for light theme
export const lightColors = {
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  primaryDark: '#E55A24',

  secondary: '#4ECDC4',
  secondaryLight: '#7FE1DD',
  secondaryDark: '#2AA89D',

  success: '#27AE60',
  successLight: '#52C96D',
  error: '#E74C3C',
  errorLight: '#EC7063',
  warning: '#F39C12',
  warningLight: '#F8B739',
  info: '#3498DB',
  infoLight: '#5DADE2',

  vegetarian: '#27AE60',
  nonVegetarian: '#E74C3C',

  white: '#FFFFFF',
  black: '#000000',

  text: '#2C3E50',
  textLight: '#7F8C8D',
  textLighter: '#95A5A6',
  textInverse: '#FFFFFF',

  background: '#F8F9FA',
  card: '#FFFFFF',

  border: '#E9ECEF',
  borderLight: '#F2F3F5',

  shadow: '#000000',
};

// Color definitions for dark theme
export const darkColors = {
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  primaryDark: '#E55A24',

  secondary: '#4ECDC4',
  secondaryLight: '#7FE1DD',
  secondaryDark: '#2AA89D',

  success: '#52C96D',
  successLight: '#66E88D',
  error: '#FF6B6B',
  errorLight: '#FF8787',
  warning: '#FFD43B',
  warningLight: '#FFE066',
  info: '#74C0FC',
  infoLight: '#91C7F9',

  vegetarian: '#52C96D',
  nonVegetarian: '#FF6B6B',

  white: '#FFFFFF',
  black: '#000000',

  text: '#F1F3F5',
  textLight: '#A6ADBA',
  textLighter: '#868E96',
  textInverse: '#1A1A1A',

  background: '#1A1A1A',
  card: '#252525',

  border: '#373A40',
  borderLight: '#2C2E33',

  shadow: '#000000',
};

// Hook to get colors based on current theme
export const useThemeColors = () => {
  const colorScheme = useColorScheme();
  const { theme } = useThemeStore();

  const isDark = theme === 'dark' || (theme === 'auto' && colorScheme === 'dark');

  return isDark ? darkColors : lightColors;
};

// Hook to get theme preference (for conditionally rendering theme toggle, etc.)
export const useThemePreference = () => {
  const colorScheme = useColorScheme();
  const { theme, setTheme } = useThemeStore();

  const isDark = theme === 'dark' || (theme === 'auto' && colorScheme === 'dark');
  const isAuto = theme === 'auto';

  return {
    isDark,
    isAuto,
    theme,
    setTheme,
    colorScheme,
  };
};

export default {
  lightColors,
  darkColors,
  useThemeColors,
  useThemePreference,
  useThemeStore,
};
