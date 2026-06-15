import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Bell, 
  ChefHat, 
  TrendingUp, 
  Star,
  Route,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import { useReviewsStore } from '@/store/reviews-store';
import { LoadingState } from '@/components/LoadingState';
import { NotifyMeModal } from '@/components/NotifyMeModal';
import { FoodListing, User, Review } from '@/types';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { imageSizes } from '@/constants/images';
import { fetchTopChefs } from '@/lib/supabase';

export default function HomeScreen() {
  const { user, isInitialized } = useAuthStore();
  const isChef = user?.isChef ?? false;
  const { 
    listings, 
    fetchListings, 
    getTopSellingItems
  } = useListingsStore();
  
  const reviewsStore = useReviewsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [topSellingItems, setTopSellingItems] = useState<FoodListing[]>([]);
  const [topChefs, setTopChefs] = useState<User[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  
  const router = useRouter();
  
  useEffect(() => {
    if (isInitialized) {
      fetchListings();
      loadTopSellingItems();
      loadTopChefs();
      loadRecentReviews();
    }
  }, [isInitialized]);
  
  if (!isInitialized) {
    return (
      <LoadingState 
        message="Welcome back! Loading your personalized feed..."
        size="large"
      />
    );
  }
  
  const loadTopSellingItems = async () => {
    try {
      const items = await getTopSellingItems(5);
      setTopSellingItems(items);
    } catch (error) {
      console.error("Error loading top selling items:", error);
      setTopSellingItems(listings.slice(0, 5));
    }
  };
  
  const loadTopChefs = async () => {
    try {
      const chefs = await fetchTopChefs(5);
      setTopChefs(chefs);
    } catch (error) {
      console.error("Error loading top chefs:", error);
    }
  };
  
  const loadRecentReviews = async () => {
    try {
      const reviews = await reviewsStore.fetchRecentReviews(5);
      setRecentReviews(reviews);
    } catch (error) {
      console.error("Error loading recent reviews:", error);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    await loadTopSellingItems();
    await loadRecentReviews();
    await loadTopChefs();
    setRefreshing(false);
  };
  
  const handleListingPress = (listing: FoodListing) => {
    router.push(`/listing/${listing.id}` as never);
  };

  const handleChefPress = (chefId: string) => {
    router.push(`/profile/${chefId}` as never);
  };

  const handleRouteSettingsPress = () => {
    router.push('/(tabs)/route-settings' as never);
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search' as never);
  };

  const handleExploreNowPress = () => {
    try {
      router.push('/(tabs)/search' as never);
    } catch (e) {
      router.navigate('/(tabs)/search');
    }
  };
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {isChef ? '👨‍🍳' : '👋'} {user?.name ? user.name.split(' ')[0] : 'Guest'}
            </Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.primary} />
              <Text style={styles.locationText}>{user?.address || 'Set your location'}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notifyButton}
              onPress={() => router.push('/(tabs)/notifications' as never)}
            >
              <Bell size={20} color={colors.primary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as never)}>
              <Image
                source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={handleSearchPress}
        >
          <View style={styles.searchIcon}>
            <Text style={styles.searchEmoji}>🔍</Text>
          </View>
          <Text style={styles.searchPlaceholder}>Search for dishes, cuisines...</Text>
        </TouchableOpacity>
      </View>
      
      {/* Hero section - different content for buyer vs seller */}
      <View style={styles.heroCard}>
        <ImageBackground
          source={{ uri: isChef 
            ? 'https://images.unsplash.com/photo-1556910103-1c02745aae4d' 
            : 'https://images.unsplash.com/photo-1627662168223-7df99068099a' 
          }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                {isChef ? 'Share Your Food' : 'Homemade Food'}
              </Text>
              <Text style={styles.heroSubtitle}>
                {isChef ? 'Cook, share, and earn from your kitchen' : 'From local kitchens to your plate'}
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => {
                  if (isChef) {
                    router.push('/create-listing' as never);
                  } else {
                    handleExploreNowPress();
                  }
                }}
              >
                <Text style={styles.exploreButtonText}>
                  {isChef ? 'Create Listing' : 'Explore Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {(!user?.officeAddress) && (
        <View style={styles.bannerSection}>
          <TouchableOpacity 
            style={styles.routeBanner}
            onPress={handleRouteSettingsPress}
          >
            <View style={styles.routeBannerIconContainer}>
              <Route size={24} color={colors.white} />
            </View>
            <View style={styles.routeBannerContent}>
              <Text style={styles.routeBannerTitle}>Set Up Your Route</Text>
              <Text style={styles.routeBannerText}>
                Find food along your daily commute route (up to 5 locations)
              </Text>
            </View>
            <MapPin size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconContainer}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Top Selling Items</Text>
              <Text style={styles.sectionSubtitle}>Most loved dishes this week</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => {
              // Navigate to search with all items sorted by rating
              const { searchListings } = useListingsStore.getState();
              searchListings({ sortBy: 'rating' });
              router.push('/(tabs)/search' as never);
            }}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {topSellingItems.length === 0 ? (
          <View style={styles.emptyTopItems}>
            <Text style={styles.emptyTopItemsText}>No dishes available right now</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/(tabs)/search' as never)}
            >
              <Text style={styles.browseButtonText}>Browse All Dishes</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topItemsContainer}
        >
          {topSellingItems.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={styles.topItemCard}
              onPress={() => handleListingPress(item)}
            >
              <View style={styles.topItemImageContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.topItemImage}
                  resizeMode="cover"
                />
                <View style={item.isVegetarian ? styles.vegIndicator : styles.nonVegIndicator} />
              </View>
              <View style={styles.topItemInfo}>
                <Text style={styles.topItemName} numberOfLines={1}>{item.dishName}</Text>
                <Text style={styles.topItemPrice}>₹{item.price}</Text>
                <View style={styles.topItemRating}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.topItemRatingText}>{item.rating?.toFixed(1) || '4.5'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        )}
      </View>
      
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconContainer}>
              <ChefHat size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Top Chefs</Text>
              <Text style={styles.sectionSubtitle}>Master chefs in your area</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => router.push('/(tabs)/following' as never)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topChefsContainer}
        >
          {topChefs.map((chef) => (
            <TouchableOpacity 
              key={chef.id}
              style={styles.chefCard}
              onPress={() => handleChefPress(chef.id)}
            >
              <View style={styles.chefImageContainer}>
                <Image
                  source={{ uri: chef.profileImage }}
                  style={styles.chefImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.chefName} numberOfLines={1}>{chef.name}</Text>
              <View style={styles.chefRating}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.chefRatingText}>{chef.rating?.toFixed(1) || '4.5'}</Text>
              </View>
              <Text style={styles.chefSpecialty} numberOfLines={1}>
                {chef.cuisineTypes[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <NotifyMeModal
        visible={notifyModalVisible}
        onClose={() => setNotifyModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: colors.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchEmoji: {
    fontSize: 18,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
    flex: 1,
  },
  heroImage: {
    height: imageSizes.hero.height,
    width: imageSizes.hero.width,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderRadius: 20,
  },
  heroOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 24,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bannerSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  routeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  routeBannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeBannerContent: {
    flex: 1,
  },
  routeBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  routeBannerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionCard: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontWeight: typography.weights.medium,
    lineHeight: 18,
  },
  seeAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  topItemsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  topItemCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  topItemImageContainer: {
    position: 'relative',
  },
  topItemImage: {
    width: imageSizes.listingCard.width,
    height: imageSizes.listingCard.height,
    backgroundColor: colors.border,
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
  topItemInfo: {
    padding: 14,
  },
  topItemName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  topItemPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 6,
  },
  topItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topItemRatingText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  topChefsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  chefCard: {
    width: 80,
    marginRight: 14,
    alignItems: 'center',
  },
  chefImageContainer: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 45,
    marginBottom: 12,
  },
  chefImage: {
    width: imageSizes.chefProfile.width,
    height: imageSizes.chefProfile.height,
    borderRadius: imageSizes.chefProfile.borderRadius,
    backgroundColor: colors.border,
    borderWidth: 3,
    borderColor: colors.white,
  },
  chefName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
  },
  chefRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chefRatingText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  chefSpecialty: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  emptyTopItems: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyTopItemsText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 12,
  },
  browseButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  browseButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});