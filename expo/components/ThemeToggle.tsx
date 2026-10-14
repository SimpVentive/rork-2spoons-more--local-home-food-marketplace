import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Animated,
} from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useThemePreference } from '@/utils/theme';
import { useThemeColors } from '@/utils/theme';
import designTokens from '@/constants/design-tokens';

interface ThemeToggleProps {
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  style,
  size = 'medium',
}) => {
  const { isDark, setTheme, isAuto } = useThemePreference();
  const colors = useThemeColors();
  const rotateAnim = new Animated.Value(0);

  const handleToggle = () => {
    // Cycle through: auto -> light -> dark -> auto
    if (isAuto) {
      setTheme('light');
    } else if (!isDark) {
      setTheme('dark');
    } else {
      setTheme('auto');
    }

    // Animate rotation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => rotateAnim.setValue(0));
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const getTooltip = () => {
    if (isAuto) return 'Auto (follows system)';
    return isDark ? 'Dark mode' : 'Light mode';
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel="Theme toggle"
      accessibilityHint={`Current: ${getTooltip()}. Double tap to change.`}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        {isDark ? (
          <Moon size={getIconSize()} color={colors.primary} />
        ) : (
          <Sun size={getIconSize()} color={colors.primary} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: designTokens.spacing.md,
    borderRadius: designTokens.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThemeToggle;
