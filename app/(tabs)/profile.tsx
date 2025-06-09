import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  LogOut, 
  Settings, 
  Star, 
  MapPin, 
  CreditCard,
  ChefHat,
  BarChart3,
  ShoppingBag,
  Users,
  Edit,
  PlusCircle,
  Shield,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import { useReviewsStore } from '@/store/reviews-store';
import { useOrdersStore } from '@/store/orders-store';
import { useFollowsStore } from '@/store/follows-store';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout, isAdmin } = useAuthStore();
  const { getSellerListings, fetchListings } = useListingsStore();
  const { reviews, fetchSellerReviews } = useReviewsStore();
  const { getBuyerOrders, getSellerOrders } = useOrdersStore();
  const { getFollowerCount } = useFollowsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [userListings, setUserListings] = useState([]);
  
  const router = useRouter();
  
  useEffect(() => {
    fetchListings();
    if (user) {
      fetchSellerReviews(user.id);
      setFollowerCount(getFollowerCount(user.id));
      loadUserListings();
    }
  }, [user]);
  
  const loadUserListings = () => {
    if (user && getSellerListings) {
      const listings = getSellerListings(user.id);
      setUserListings(listings);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    if (user) {
      await fetchSellerReviews(user.id);
      setFollowerCount(getFollowerCount(user.id));
      loadUserListings();
    }
    setRefreshing(false);
  };
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };
  
  const handleViewAnalytics = () => {
    router.push('/analytics');
  };
  
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleCreateListing = () => {
    router.push('/create-listing');
  };

  const handleAdminDashboard = () => {
    router.push('/(admin)');
  };
  
  const userReviews = user ? reviews.filter(review => review.sellerId === user.id) : [];
  const buyerOrders = user ? getBuyerOrders(user.id) : [];
  const sellerOrders = user ? getSellerOrders(user.id) : [];
  
  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view your profile"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)')}
      />
    );
  }

  const getListingCardStyle = () => {
    if (Platform.OS === 'web') {
      return {
        ...styles.listingCard,
        width: '100%',
        marginRight: 0,
        marginBottom: 12
      };
    }
    return styles.listingCard;
  };

  const getAddListingCardStyle = () => {
    if (Platform.OS === 'web') {
      return {
        ...styles.addListingCard,
        width: '100%',
        height: 100
      };
    }
    return styles.addListingCard;
  };
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
            style={styles.profileImage}
            contentFit="cover"
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.primary} fill={colors.primary} />
              <Text style={styles.rating}>
                {user.rating?.toFixed(1) || '0.0'} ({user.reviewCount || 0} reviews)
              </Text>
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colors.textLight} />
              <Text style={styles.locationText} numberOfLines={1}>
                {user.address}
              </Text>
            </View>

            {user.isAdmin && (
              <View style={styles.adminBadge}>
                <Shield size={12} color="#FFFFFF" />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.bio} numberOfLines={3}>
          {user.experience || "No bio provided yet"}
        </Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <ChefHat size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {user.cuisineTypes && user.cuisineTypes.length > 0 ? user.cuisineTypes.join(', ') : 'No cuisines specified'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <CreditCard size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {user.paymentMethods && user.paymentMethods.length > 0 ? user.paymentMethods.join(', ') : 'No payment methods specified'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Edit size={16} color={colors.white} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.createListingButton}
            onPress={handleCreateListing}
          >
            <PlusCircle size={16} color={colors.white} />
            <Text style={styles.createListingText}>Create Listing</Text>
          </TouchableOpacity>
        </View>

        {user.isAdmin && (
          <TouchableOpacity 
            style={styles.adminDashboardButton}
            onPress={handleAdminDashboard}
          >
            <Shield size={16} color={colors.white} />
            <Text style={styles.adminDashboardText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <ShoppingBag size={24} color="#1976D2" />
          </View>
          <Text style={styles.statValue}>{buyerOrders.length + sellerOrders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => router.push('/(tabs)/following')}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#F3E5F5' }]}>
            <Users size={24} color="#9C27B0" />
          </View>
          <Text style={styles.statValue}>{followerCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleViewAnalytics}
        >
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <BarChart3 size={24} color="#43A047" />
          </View>
          <Text style={styles.statValue}>{userListings.length}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Food Listings</Text>
          <TouchableOpacity onPress={handleViewAnalytics}>
            <Text style={styles.viewAllText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
        
        {userListings.length === 0 ? (
          <View style={styles.emptyListingsContainer}>
            <Text style={styles.emptyListingsText}>
              You haven't added any food listings yet
            </Text>
            <Button
              title="Add New Listing"
              onPress={() => router.push('/create-listing')}
              style={styles.addButton}
            />
          </View>
        ) : (
          <ScrollView
            horizontal={Platform.OS !== 'web'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={Platform.OS === 'web' 
              ? { ...styles.listingsContainer, flexDirection: 'column' } 
              : styles.listingsContainer
            }
          >
            {userListings.slice(0, 3).map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={getListingCardStyle()}
                onPress={() => router.push(`/listing/${listing.id}`)}
              >
                <Image
                  source={{ uri: listing.image }}
                  style={styles.listingImage}
                  contentFit="cover"
                />
                <View style={styles.listingInfo}>
                  <Text style={styles.listingName} numberOfLines={1}>
                    {listing.dishName}
                  </Text>
                  <Text style={styles.listingPrice}>₹{listing.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={getAddListingCardStyle()}
              onPress={() => router.push('/create-listing')}
            >
              <Text style={styles.addListingText}>+ Add New</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {buyerOrders.length === 0 ? (
          <View style={styles.emptyOrdersContainer}>
            <Text style={styles.emptyOrdersText}>
              You haven't placed any orders yet
            </Text>
            <Button
              title="Browse Food"
              onPress={() => router.push('/(tabs)')}
              style={styles.browseButton}
            />
          </View>
        ) : (
          <View>
            {buyerOrders.slice(0, 2).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <Image
                  source={{ uri: order.listingSnapshot.image }}
                  style={styles.orderImage}
                  contentFit="cover"
                />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName} numberOfLines={1}>
                    {order.listingSnapshot.dishName}
                  </Text>
                  <Text style={styles.orderDetails}>
                    {order.quantity} x ₹{order.listingSnapshot.price} = ₹{order.totalPrice}
                  </Text>
                  <View style={[
                    styles.orderStatus,
                    { 
                      backgroundColor: order.status === 'completed' 
                        ? `${colors.success}20` 
                        : order.status === 'canceled' 
                          ? `${colors.error}20` 
                          : `${colors.primary}20` 
                    }
                  ]}>
                    <Text style={[
                      styles.orderStatusText,
                      { 
                        color: order.status === 'completed' 
                          ? colors.success 
                          : order.status === 'canceled' 
                            ? colors.error 
                            : colors.primary 
                      }
                    ]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
        textStyle={styles.logoutButtonText}
      />
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
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  settingsButton: {
    padding: 8,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsContainer: {
    gap: 8,
    marginBottom: 16,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  editProfileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editProfileText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  createListingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createListingText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  adminDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  adminDashboardText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  section: {
    padding: 16,
    marginTop: 16,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyListingsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyListingsText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    width: 200,
  },
  listingsContainer: {
    paddingRight: Platform.OS === 'web' ? 0 : 16,
  },
  listingCard: {
    width: 150,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  listingImage: {
    width: '100%',
    height: 100,
    backgroundColor: colors.border,
  },
  listingInfo: {
    padding: 8,
  },
  listingName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  addListingCard: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addListingText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyOrdersText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  browseButton: {
    width: 200,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  orderImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
  },
  orderInfo: {
    flex: 1,
    padding: 12,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  orderStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 32,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
});