import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  Star, 
  MapPin, 
  ChefHat,
  CreditCard,
  Users,
} from 'lucide-react-native';
import { mockUsers } from '@/mocks/data';
import { useListingsStore } from '@/store/listings-store';
import { useReviewsStore } from '@/store/reviews-store';
import { useAuthStore } from '@/store/auth-store';
import { useFollowsStore } from '@/store/follows-store';
import Button from '@/components/Button';
import RatingStars from '@/components/RatingStars';
import { FoodCard } from '@/components/FoodCard';
import FollowButton from '@/components/FollowButton';
import colors from '@/constants/colors';
import { User, FoodListing, Review } from '@/types';

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSellerListings } = useListingsStore();
  const { fetchSellerReviews } = useReviewsStore();
  const { user } = useAuthStore();
  const { 
    isFollowing, 
    followSeller, 
    unfollowSeller, 
    getFollowerCount,
    isLoading: followLoading 
  } = useFollowsStore();
  
  const [seller, setSeller] = useState<User | null>(null);
  const [sellerListings, setSellerListings] = useState<FoodListing[]>([]);
  const [sellerReviews, setSellerReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [followerCount, setFollowerCount] = useState(0);
  
  const router = useRouter();
  
  useEffect(() => {
    // Find seller in mock data
    const foundSeller = mockUsers.find(user => user.id === id);
    if (foundSeller) {
      setSeller(foundSeller);
      
      // Get seller listings
      const listings = getSellerListings(id);
      setSellerListings(listings);
      
      // Get seller reviews
      loadSellerReviews(id);
      
      // Get follower count
      setFollowerCount(getFollowerCount(id));
    }
  }, [id]);
  
  const loadSellerReviews = async (sellerId: string) => {
    const reviews = await fetchSellerReviews(sellerId);
    setSellerReviews(reviews);
  };
  
  const handleListingPress = (listing: FoodListing) => {
    router.push(`/listing/${listing.id}`);
  };
  
  const handleFollowToggle = async () => {
    if (!user || !seller) return;
    
    const isCurrentlyFollowing = isFollowing(user.id, seller.id);
    
    if (isCurrentlyFollowing) {
      await unfollowSeller(user.id, seller.id);
    } else {
      await followSeller(user.id, seller.id);
    }
    
    // Update follower count
    setFollowerCount(getFollowerCount(seller.id));
  };

  const getTabStyle = (tabName: string) => {
    if (Platform.OS === 'web') {
      return {
        ...styles.tab,
        ...(activeTab === tabName ? styles.activeTab : {})
      };
    }
    return activeTab === tabName ? [styles.tab, styles.activeTab] : styles.tab;
  };

  const getTabTextStyle = (tabName: string) => {
    if (Platform.OS === 'web') {
      return {
        ...styles.tabText,
        ...(activeTab === tabName ? styles.activeTabText : {})
      };
    }
    return activeTab === tabName ? [styles.tabText, styles.activeTabText] : styles.tabText;
  };
  
  if (!seller) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Seller not found</Text>
      </View>
    );
  }
  
  const isCurrentUser = user?.id === seller.id;
  const isUserFollowing = user ? isFollowing(user.id, seller.id) : false;
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: seller.profileImage }}
            style={styles.profileImage}
            contentFit="cover"
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{seller.name}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.primary} fill={colors.primary} />
              <Text style={styles.rating}>
                {seller.rating?.toFixed(1) || '0.0'} ({seller.reviewCount || 0} reviews)
              </Text>
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.locationText} numberOfLines={1}>
                {seller.address}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sellerListings.length}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
        
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>
            {seller.experience || "No bio provided"}
          </Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <ChefHat size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {seller.cuisineTypes.join(', ')}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <CreditCard size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {seller.paymentMethods.join(', ')}
              </Text>
            </View>
          </View>
          
          {!isCurrentUser ? (
            <View style={styles.actionButtons}>
              <Button
                title="Contact"
                onPress={() => Alert.alert('Contact', 'Messaging functionality would be implemented here')}
                variant="outline"
                style={styles.contactButton}
              />
              
              <FollowButton
                isFollowing={isUserFollowing}
                onToggleFollow={handleFollowToggle}
                isLoading={followLoading}
                style={styles.followButton}
              />
            </View>
          ) : (
            <Button
              title="Edit Profile"
              onPress={() => {}}
              style={styles.editButton}
            />
          )}
        </View>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={getTabStyle('listings')}
            onPress={() => setActiveTab('listings')}
          >
            <Text style={getTabTextStyle('listings')}>
              Food Listings
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getTabStyle('reviews')}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={getTabTextStyle('reviews')}>
              Reviews
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={getTabStyle('about')}
            onPress={() => setActiveTab('about')}
          >
            <Text style={getTabTextStyle('about')}>
              About
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'listings' ? (
          <View style={styles.listingsContainer}>
            {sellerListings.length === 0 ? (
              <Text style={styles.emptyText}>
                No food listings available
              </Text>
            ) : (
              <View>
                {sellerListings.map((item) => (
                  <View key={item.id} style={styles.cardWrapper}>
                    <FoodCard 
                      listing={item} 
                      onPress={handleListingPress} 
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : activeTab === 'reviews' ? (
          <View style={styles.reviewsContainer}>
            {sellerReviews.length === 0 ? (
              <Text style={styles.emptyText}>
                No reviews yet
              </Text>
            ) : (
              sellerReviews.map((review) => (
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
              ))
            )}
          </View>
        ) : (
          <View style={styles.aboutContainer}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>Experience</Text>
              <Text style={styles.aboutText}>
                {seller.experience || "No experience information provided"}
              </Text>
            </View>
            
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>Specialties</Text>
              <View style={styles.tagsContainer}>
                {seller.cuisineTypes.map((cuisine) => (
                  <View key={cuisine} style={styles.tag}>
                    <Text style={styles.tagText}>{cuisine}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>Payment Methods</Text>
              <View style={styles.tagsContainer}>
                {seller.paymentMethods.map((method) => (
                  <View key={method} style={styles.tag}>
                    <Text style={styles.tagText}>{method}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.aboutSection}>
              <Text style={styles.aboutSectionTitle}>Location</Text>
              <View style={styles.locationDetail}>
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.locationDetailText}>{seller.address}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  bioSection: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  contactButton: {
    flex: 1,
    marginRight: 8,
  },
  followButton: {
    flex: 1,
  },
  editButton: {
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  listingsContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  reviewsContainer: {
    padding: 16,
    backgroundColor: colors.white,
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
  aboutContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  locationDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDetailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
});