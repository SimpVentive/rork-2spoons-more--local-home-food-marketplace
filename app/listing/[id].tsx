import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Clock, 
  Package, 
  Star, 
  ChefHat,
  Share2,
  Heart,
  Minus,
  Plus,
  Leaf,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useListingsStore } from '@/store/listings-store';
import { useReviewsStore } from '@/store/reviews-store';
import { useAuthStore } from '@/store/auth-store';
import { useFollowsStore } from '@/store/follows-store';
import { useOrdersStore } from '@/store/orders-store';
import { DeliveryMethod, PaymentMethod } from '@/types';
import Button from '@/components/Button';
import RatingStars from '@/components/RatingStars';
import FollowButton from '@/components/FollowButton';
import colors from '@/constants/colors';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListingById, updateListingQuantity } = useListingsStore();
  const { fetchSellerReviews } = useReviewsStore();
  const { user } = useAuthStore();
  const { isFollowing, followSeller, unfollowSeller, isLoading: followLoading } = useFollowsStore();
  const { placeOrder, isLoading: orderLoading } = useOrdersStore();
  
  const [listing, setListing] = useState(getListingById(id));
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  const router = useRouter();
  
  useEffect(() => {
    if (listing) {
      loadSellerReviews();
    }
  }, [listing]);
  
  const loadSellerReviews = async () => {
    if (listing) {
      try {
        const reviews = await fetchSellerReviews(listing.sellerId);
        setSellerReviews(reviews || []);
      } catch (error) {
        console.error("Error loading seller reviews:", error);
      }
    }
  };
  
  const handleFavoriteToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsFavorite(!isFavorite);
  };
  
  const handleShare = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Share', 'Sharing functionality would be implemented here');
  };
  
  const handleFollowToggle = async () => {
    if (!user || !listing) return;
    
    const isCurrentlyFollowing = isFollowing(user.id, listing.sellerId);
    
    try {
      if (isCurrentlyFollowing) {
        await unfollowSeller(user.id, listing.sellerId);
      } else {
        await followSeller(user.id, listing.sellerId);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };
  
  const handleViewProfile = () => {
    if (listing) {
      router.push(`/profile/${listing.sellerId}`);
    }
  };
  
  const handleOrderNow = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to place an order',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)') }
        ]
      );
      return;
    }
    
    if (isListingExpired()) {
      Alert.alert('Expired', 'This listing is no longer available');
      return;
    }
    
    if (listing && listing.remainingQuantity <= 0) {
      Alert.alert('Sold Out', 'This item is sold out');
      return;
    }
    
    setOrderModalVisible(true);
  };
  
  const handlePlaceOrder = async () => {
    if (!user || !listing) return;
    
    // Check if requested quantity is available
    if (quantity > listing.remainingQuantity) {
      Alert.alert('Not enough available', `Only ${listing.remainingQuantity} portions available`);
      return;
    }
    
    try {
      const newOrder = await placeOrder({
        buyerId: user.id,
        sellerId: listing.sellerId,
        listingId: listing.id,
        listingSnapshot: {
          dishName: listing.dishName,
          price: listing.price,
          image: listing.image,
          sellerName: listing.sellerName,
          location: listing.location
        },
        quantity,
        totalPrice: quantity * listing.price,
        deliveryAddress: user.address,
        deliveryMethod,
        paymentMethod,
      });
      
      // Update the remaining quantity
      await updateListingQuantity(listing.id, listing.remainingQuantity - quantity);
      
      // Refresh the listing data
      setListing(getListingById(id));
      
      setOrderModalVisible(false);
      
      Alert.alert(
        'Order Placed Successfully',
        'Your order has been sent to the seller',
        [
          { text: 'View Order', onPress: () => router.push(`/order/${newOrder.id}`) },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };
  
  const incrementQuantity = () => {
    if (listing && quantity < listing.remainingQuantity) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert('Maximum Reached', `Only ${listing?.remainingQuantity} portions available`);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const isListingExpired = () => {
    if (!listing) return true;
    return new Date(listing.availableUntil) < new Date();
  };
  
  const getTimeRemaining = () => {
    if (!listing) return '';
    
    const now = new Date();
    const expiryTime = new Date(listing.availableUntil);
    
    if (now > expiryTime) return 'Expired';
    
    const diffMs = expiryTime.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24);
      return `${days} day${days > 1 ? 's' : ''} left`;
    }
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m left`;
    }
    
    return `${diffMins}m left`;
  };
  
  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }
  
  const isOwnListing = user?.id === listing.sellerId;
  const isUserFollowing = user && isFollowing(user.id, listing.sellerId);
  const expired = isListingExpired();
  const soldOut = listing.remainingQuantity <= 0;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Image
        source={{ uri: listing.image }}
        style={styles.image}
        contentFit="cover"
      />
      
      {(expired || soldOut) && (
        <View style={styles.statusOverlay}>
          <Text style={styles.statusText}>
            {expired ? 'EXPIRED' : 'SOLD OUT'}
          </Text>
        </View>
      )}
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{listing.dishName}</Text>
          <Text style={styles.price}>₹{listing.price}</Text>
        </View>
        
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.cuisineType}</Text>
          </View>
          
          {listing.isVegetarian && (
            <View style={[styles.tag, styles.vegTag]}>
              <Leaf size={14} color={colors.success} />
              <Text style={[styles.tagText, styles.vegTagText]}>Veg</Text>
            </View>
          )}
        </View>
        
        <View style={styles.availabilityInfo}>
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>
              {listing.remainingQuantity} of {listing.availableQuantity} available
            </Text>
          </View>
          
          <View style={[
            styles.timeBadge,
            expired ? styles.expiredBadge : {}
          ]}>
            <Clock size={14} color={expired ? colors.white : colors.text} />
            <Text style={[
              styles.timeText,
              expired ? styles.expiredText : {}
            ]}>
              {getTimeRemaining()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {listing.description || "No description provided"}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Package size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {typeof listing.availableQuantity === 'number' ? `${listing.availableQuantity} portions` : listing.quantity} ({listing.servings} servings)
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Package size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {listing.packaging}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              Available from {new Date(listing.availableFrom).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              Available until {new Date(listing.availableUntil).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {listing.location.address}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seller</Text>
        
        <TouchableOpacity style={styles.sellerContainer} onPress={handleViewProfile}>
          <Image
            source={{ uri: listing.sellerImage }}
            style={styles.sellerImage}
            contentFit="cover"
          />
          
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{listing.sellerName}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.primary} fill={colors.primary} />
              <Text style={styles.ratingText}>
                {listing.sellerRating?.toFixed(1) || '0.0'} ({sellerReviews.length} reviews)
              </Text>
            </View>
            
            <View style={styles.cuisineContainer}>
              <ChefHat size={16} color={colors.textLight} />
              <Text style={styles.cuisineText}>{listing.cuisineType} Specialist</Text>
            </View>
          </View>
          
          {!isOwnListing && user && (
            <FollowButton
              isFollowing={!!isUserFollowing}
              onToggleFollow={handleFollowToggle}
              isLoading={followLoading}
              size="small"
            />
          )}
        </TouchableOpacity>
      </View>
      
      {sellerReviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          
          {sellerReviews.slice(0, 2).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.buyerImage }}
                  style={styles.reviewerImage}
                  contentFit="cover"
                />
                
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.buyerName}</Text>
                  <RatingStars rating={review.rating} size={14} readonly />
                </View>
                
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
          
          {sellerReviews.length > 2 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleViewProfile}
            >
              <Text style={styles.viewAllText}>
                View all {sellerReviews.length} reviews
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.actionContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleFavoriteToggle}
          >
            <Heart 
              size={24} 
              color={isFavorite ? colors.primary : colors.text}
              fill={isFavorite ? colors.primary : 'transparent'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleShare}
          >
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        {!isOwnListing ? (
          <Button
            title={expired ? "Expired" : soldOut ? "Sold Out" : "Order Now"}
            onPress={handleOrderNow}
            style={styles.orderButton}
            disabled={expired || soldOut}
          />
        ) : (
          <Button
            title="Edit Listing"
            onPress={() => {}}
            variant="outline"
            style={styles.editButton}
          />
        )}
      </View>
      
      {/* Order Modal */}
      <Modal
        visible={orderModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Place Order</Text>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={decrementQuantity}
                >
                  <Minus size={20} color={colors.text} />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                >
                  <Plus size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.availabilityNote}>
                {listing.remainingQuantity} portions available
              </Text>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Delivery Method</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    deliveryMethod === 'pickup' && styles.selectedOption,
                  ]}
                  onPress={() => setDeliveryMethod('pickup')}
                >
                  <Text style={[
                    styles.optionText,
                    deliveryMethod === 'pickup' && styles.selectedOptionText,
                  ]}>
                    Self Pickup
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    deliveryMethod === 'delivery' && styles.selectedOption,
                  ]}
                  onPress={() => setDeliveryMethod('delivery')}
                >
                  <Text style={[
                    styles.optionText,
                    deliveryMethod === 'delivery' && styles.selectedOptionText,
                  ]}>
                    Delivery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Payment Method</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    paymentMethod === 'cash' && styles.selectedOption,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Text style={[
                    styles.optionText,
                    paymentMethod === 'cash' && styles.selectedOptionText,
                  ]}>
                    Cash
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    paymentMethod === 'upi' && styles.selectedOption,
                  ]}
                  onPress={() => setPaymentMethod('upi')}
                >
                  <Text style={[
                    styles.optionText,
                    paymentMethod === 'upi' && styles.selectedOptionText,
                  ]}>
                    UPI
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    paymentMethod === 'online' && styles.selectedOption,
                  ]}
                  onPress={() => setPaymentMethod('online')}
                >
                  <Text style={[
                    styles.optionText,
                    paymentMethod === 'online' && styles.selectedOptionText,
                  ]}>
                    Online
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.orderSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price per item:</Text>
                <Text style={styles.summaryValue}>₹{listing.price}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity:</Text>
                <Text style={styles.summaryValue}>{quantity}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                <Text style={styles.summaryValue}>
                  {deliveryMethod === 'delivery' ? '₹30' : 'Free'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  ₹{quantity * listing.price + (deliveryMethod === 'delivery' ? 30 : 0)}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setOrderModalVisible(false)}
                variant="outline"
                style={styles.modalCancelButton}
              />
              <Button
                title="Place Order"
                onPress={handlePlaceOrder}
                style={styles.modalConfirmButton}
                isLoading={orderLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.border,
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 250,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  vegTag: {
    backgroundColor: colors.success + '20',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  vegTagText: {
    color: colors.success,
    marginLeft: 4,
  },
  availabilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quantityText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  timeBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiredBadge: {
    backgroundColor: colors.error,
  },
  timeText: {
    color: colors.text,
    fontSize: 12,
    marginLeft: 4,
  },
  expiredText: {
    color: colors.white,
  },
  section: {
    padding: 16,
    marginTop: 8,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  sellerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  cuisineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cuisineText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  viewProfileText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderButton: {
    flex: 1,
  },
  editButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityNote: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.white,
  },
  orderSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  modalConfirmButton: {
    flex: 2,
  },
});