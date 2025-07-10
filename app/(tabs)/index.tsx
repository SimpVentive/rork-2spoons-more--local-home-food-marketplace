import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
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
import { FoodCard } from '@/components/FoodCard';
import { NotifyMeModal } from '@/components/NotifyMeModal';
import { FoodListing, User, Review } from '@/types';
import colors from '@/constants/colors';
import { mockUsers } from '@/mocks/data';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { 
    listings, 
    filteredListings, 
    fetchListings, 
    searchListings, 
    isLoading,
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
    fetchListings();
    loadTopSellingItems();
    loadTopChefs();
    loadRecentReviews();
  }, []);
  
  const loadTopSellingItems = async () => {
    try {
      // Use the getTopSellingItems from the store
      const items = await getTopSellingItems(5);
      setTopSellingItems(items);
    } catch (error) {
      console.error("Error loading top selling items:", error);
      // Fallback to first 5 listings if there's an error
      setTopSellingItems(listings.slice(0, 5));
    }
  };
  
  const loadTopChefs = () => {
    // Get top 5 chefs based on rating
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
    router.push(`/listing/${listing.id}`);
  };

  const handleChefPress = (chefId: string) => {
    router.push(`/profile/${chefId}`);
  };

  const handleExplorePress = () => {
    router.push('/(tabs)/search');
  };

  const handleRouteSettingsPress = () => {
    router.push('/(tabs)/route-settings');
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name ? user.name.split(' ')[0] : 'Guest'}
          </Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.locationText}>{user?.address || 'Set your location'}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.notifyButton}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Bell size={20} color={colors.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Image
              source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
              style={styles.profileImage}
              contentFit="cover"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Hero Section with Indian Woman Cooking */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1627662168223-7df99068099a' }}
        style={styles.heroImage}
        imageStyle={styles.heroImageStyle}
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Homemade Food</Text>
          <Text style={styles.heroSubtitle}>From local kitchens to your plate</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={handleSearchPress}
          >
            <Text style={styles.exploreButtonText}>Explore Now</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Route Settings Banner */}
      {(!user?.officeAddress) && (
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
              Find food along your daily commute route
            </Text>
          </View>
          <MapPin size={20} color={colors.white} />
        </TouchableOpacity>
      )}
      
      {/* Top Selling Items Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <TrendingUp size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Top Selling Items</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
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
              <Image
                source={{ uri: item.image }}
                style={styles.topItemImage}
                contentFit="cover"
              />
              <View style={item.isVegetarian ? styles.vegIndicator : styles.nonVegIndicator} />
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
      
      {/* Top Chefs Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <ChefHat size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Top Chefs</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/following')}>
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
              <Image
                source={{ uri: chef.profileImage }}
                style={styles.chefImage}
                contentFit="cover"
              />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
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
  heroImage: {
    height: 240,
    width: '100%',
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  routeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  routeBannerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionContainer: {
    marginTop: 16,
    backgroundColor: colors.white,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  topItemsContainer: {
    paddingHorizontal: 16,
  },
  topItemCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topItemImage: {
    width: '100%',
    height: 100,
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
    padding: 8,
  },
  topItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  topItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
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
    paddingHorizontal: 16,
  },
  chefCard: {
    width: 100,
    marginRight: 16,
    alignItems: 'center',
  },
  chefImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  chefName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
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
});