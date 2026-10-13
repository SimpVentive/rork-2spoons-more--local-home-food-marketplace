import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { UtensilsCrossed } from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';

interface ImagePlaceholderProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = '100%',
  height = 160,
  style,
  size = 'medium',
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: designTokens.colors.background,
        },
        style,
      ]}
    >
      <UtensilsCrossed
        size={getIconSize()}
        color={designTokens.colors.textLighter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: designTokens.radius.lg,
    ...designTokens.shadows.sm,
  },
});

export default ImagePlaceholder;
