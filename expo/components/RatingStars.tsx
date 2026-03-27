import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Star } from 'lucide-react-native';
import colors from '@/constants/colors';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  activeColor?: string;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}

const RatingStars = ({
  rating,
  maxRating = 5,
  size = 24,
  color = colors.border,
  activeColor = colors.primary,
  onRatingChange,
  readonly = false,
}: RatingStarsProps) => {
  const handlePress = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starFilled = index < rating;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index + 1)}
            disabled={readonly}
            style={Platform.OS === 'web' ? { padding: 2, display: 'flex' } : styles.starContainer}
          >
            <Star
              size={size}
              color={starFilled ? activeColor : color}
              fill={starFilled ? activeColor : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    padding: 2,
  },
});

export default RatingStars;