import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Clock, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import designTokens from '@/constants/design-tokens';
import { FoodListing } from '@/types';
import { generatePlaceholder, optimizeImageUrl } from '@/utils/imageOptimization';
import ImagePlaceholder from './ImagePlaceholder';

interface FoodCardProps {
  listing: FoodListing;
  onPress: (listing: FoodListing) => void;
  isExpired?: boolean;
  isSoldOut?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  listing,
  onPress,
  isExpired = false,
  isSoldOut = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const getTimeRemaining = () => {
    const now = new Date();
    const expiryTime = new Date(listing.availableUntil);

    if (now > expiryTime) return 'Expired';

    const diffMs = expiryTime.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24);
      return `${days}d left`;
    }

    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m left`;
    }

    return `${diffMins}m left`;
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(listing)}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={`${listing.dishName} by ${listing.sellerName}`}
      accessibilityHint={`Price ₹${listing.price}, ${listing.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'}, Available for ${getTimeRemaining()}`}
      accessibilityRole="button"
    >
      <View style={styles.imageContainer}>
        {!imageError ? (
          <>
            <Image
              source={{ uri: listing.image }}
              style={styles.image}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay for better text contrast on images */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradient}
            />
          </>
        ) : (
          <ImagePlaceholder height={160} />
        )}

        {(isExpired || isSoldOut) && (
          <View style={styles.overlayBadge}>
            <Text style={styles.overlayText}>
              {isExpired ? 'EXPIRED' : 'SOLD OUT'}
            </Text>
          </View>
        )}

        <View style={listing.isVegetarian ? styles.vegIndicator : styles.nonVegIndicator} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.dishName}
        </Text>
        
        <View style={styles.sellerInfo}>
          <Image
            source={{ 
              uri: optimizeImageUrl({
                uri: listing.sellerImage,
                width: 40,
                height: 40,
                quality: 90,
                format: 'webp'
              })
            }}
            style={styles.sellerImage}
            contentFit="cover"
            placeholder={generatePlaceholder(40, 40)}
            transition={150}
            cachePolicy="memory-disk"
          />
          
          <Text style={styles.sellerName} numberOfLines={1}>
            {listing.sellerName}
          </Text>
          
          <View style={styles.ratingContainer}>
            <Star size={12} color={colors.primary} fill={colors.primary} />
            <Text style={styles.rating}>{listing.sellerRating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={12} color={colors.textLight} />
          <Text style={styles.locationText} numberOfLines={1}>
            {listing.address}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.timeContainer}>
            <Clock size={12} color={isExpired ? colors.error : colors.textLight} />
            <Text 
              style={[
                styles.timeText,
                isExpired && styles.expiredText
              ]}
            >
              {getTimeRemaining()}
            </Text>
          </View>
          
          <Text style={styles.price}>starts at ₹{listing.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width < 500 ? (width / 2) - 24 : 220;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: designTokens.radius.lg,
    overflow: 'hidden',
    ...designTokens.shadows.lg,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlayBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: colors.white,
    fontWeight: designTokens.typography.weight.bold,
    fontSize: designTokens.typography.size.lg,
  },
  vegIndicator: {
    position: 'absolute',
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.vegetarian,
    borderWidth: 2,
    borderColor: colors.white,
  },
  nonVegIndicator: {
    position: 'absolute',
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.nonVegetarian,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    padding: designTokens.spacing.lg,
  },
  title: {
    fontSize: designTokens.typography.size.xl,
    fontWeight: designTokens.typography.weight.bold,
    color: colors.text,
    marginBottom: designTokens.spacing.md,
    lineHeight: designTokens.typography.lineHeight.tight,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  sellerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    marginRight: designTokens.spacing.sm,
  },
  sellerName: {
    fontSize: designTokens.typography.size.sm,
    color: colors.textLight,
    flex: 1,
    fontWeight: designTokens.typography.weight.normal,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: designTokens.spacing.sm,
  },
  rating: {
    fontSize: designTokens.typography.size.sm,
    color: colors.text,
    marginLeft: 2,
    fontWeight: designTokens.typography.weight.semibold,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  locationText: {
    fontSize: designTokens.typography.size.sm,
    color: colors.textLight,
    marginLeft: designTokens.spacing.xs,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: designTokens.typography.size.sm,
    color: colors.textLight,
    marginLeft: designTokens.spacing.xs,
  },
  expiredText: {
    color: colors.error,
    fontWeight: designTokens.typography.weight.semibold,
  },
  price: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.extrabold,
    color: colors.primary,
  },
});

export default FoodCard;