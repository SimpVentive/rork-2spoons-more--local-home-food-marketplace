import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import colors from '@/constants/colors';

interface BackgroundPatternProps {
  style?: any;
  opacity?: number;
}

const { width, height } = Dimensions.get('window');

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  style,
  opacity = 0.03,
}) => {
  const dotSize = 2;
  const spacing = 24;
  const dotsPerRow = Math.ceil(width / spacing);
  const dotsPerColumn = Math.ceil(height / spacing);

  const renderDots = () => {
    const dots = [];
    for (let row = 0; row < dotsPerColumn; row++) {
      for (let col = 0; col < dotsPerRow; col++) {
        dots.push(
          <View
            key={`${row}-${col}`}
            style={[
              styles.dot,
              {
                left: col * spacing,
                top: row * spacing,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                opacity: opacity,
              },
            ]}
          />
        );
      }
    }
    return dots;
  };

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
});

export default BackgroundPattern;