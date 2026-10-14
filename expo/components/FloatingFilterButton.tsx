import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Filter } from 'lucide-react-native';
import colors from '@/constants/colors';

interface FloatingFilterButtonProps {
  onPress: () => void;
}

export const FloatingFilterButton: React.FC<FloatingFilterButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Filter size={24} color={colors.white} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    left: 20,
    bottom: Platform.OS === 'ios' ? 120 : 100, // Position above tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
    zIndex: 999, // High z-index to ensure it's above other elements
  },
});