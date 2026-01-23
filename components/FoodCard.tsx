import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Clock, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import { FoodListing } from '@/types';
import { optimizeImageUrl, generatePlaceholder } from '@/utils/imageOptimization';

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
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: optimizeImageUrl({
              uri: listing.image,
              width: 400,
              height: 240,
              quality: 85,
              format: 'webp'
            })
          }}
          style={styles.image}
          contentFit="cover"
          placeholder={generatePlaceholder(400, 240)}
          transition={200}
          cachePolicy="memory-disk"
        />
        
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
          
          <Text style={styles.price}>₹{listing.price}</Text>
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
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  vegIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.vegetarian,
    borderWidth: 1,
    borderColor: colors.white,
  },
  nonVegIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.nonVegetarian,
    borderWidth: 1,
    borderColor: colors.white,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    marginRight: 6,
  },
  sellerName: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  rating: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  expiredText: {
    color: colors.error,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default FoodCard;