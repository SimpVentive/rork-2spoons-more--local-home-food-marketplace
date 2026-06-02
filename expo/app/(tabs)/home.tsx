import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
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
import { mockUsers } from '@/mocks/data';

export default function HomeScreen() {
  const { user, isInitialized } = useAuthStore();
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
  
  const loadTopChefs = () => {
    const chefs = [...mockUsers]
      .filter(user => user.isChef && user.allowProfileDisplay)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
    
    setTopChefs(chefs);
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
    loadTopChefs();
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
              Good {getTimeOfDay()}, {user?.name ? user.name.split(' ')[0] : 'Guest'}! 👋
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
      
      <View style={styles.heroCard}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1627662168223-7df99068099a' }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Homemade Food</Text>
              <Text style={styles.heroSubtitle}>From local kitchens to your plate</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={handleExploreNowPress}
              >
                <Text style={styles.exploreButtonText}>Explore Now</Text>
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
            onPress={() => router.push('/(tabs)/search' as any)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
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
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    color: colors.textLight,
    marginLeft: 6,
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
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
    flex: 1,
  },
  heroImage: {
    height: 260,
    width: '100%',
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
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  routeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 20,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  routeBannerText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
    fontWeight: '500',
  },
  sectionCard: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
    lineHeight: 20,
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
    width: 170,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topItemImageContainer: {
    position: 'relative',
  },
  topItemImage: {
    width: '100%',
    height: 130,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  topItemPrice: {
    fontSize: 16,
    fontWeight: '800',
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
    width: 110,
    marginRight: 20,
    alignItems: 'center',
  },
  chefImageContainer: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 45,
    marginBottom: 12,
  },
  chefImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.border,
    borderWidth: 3,
    borderColor: colors.white,
  },
  chefName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
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
});