import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Star, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useFollowsStore } from '@/store/follows-store';
import { useListingsStore } from '@/store/listings-store';
import { mockUsers } from '@/mocks/data';
import FoodCard from '@/components/FoodCard';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { User, FoodListing } from '@/types';

export default function FollowingScreen() {
  const { user } = useAuthStore();
  const { getFollowedSellers } = useFollowsStore();
  const { listings } = useListingsStore();
  
  const [followedSellers, setFollowedSellers] = useState<User[]>([]);
  const [followedListings, setFollowedListings] = useState<FoodListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      loadFollowedContent();
    }
  }, [user]);
  
  const loadFollowedContent = () => {
    if (!user) return;
    
    // Get IDs of followed sellers
    const followedIds = getFollowedSellers(user.id);
    
    // Get seller profiles
    const sellers = mockUsers.filter(u => followedIds.includes(u.id));
    setFollowedSellers(sellers);
    
    // Get listings from followed sellers
    const sellerListings = listings.filter(listing => 
      followedIds.includes(listing.sellerId)
    );
    setFollowedListings(sellerListings);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    loadFollowedContent();
    setRefreshing(false);
  };
  
  const handleSellerPress = (sellerId: string) => {
    router.push(`/profile/${sellerId}` as any);
  };
  
  const handleListingPress = (listing: FoodListing) => {
    router.push(`/listing/${listing.id}` as any);
  };
  
  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view followed sellers"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)' as any)}
      />
    );
  }
  
  if (followedSellers.length === 0) {
    return (
      <EmptyState
        title="No Followed Sellers"
        message="You haven't followed any sellers yet"
        image="https://images.unsplash.com/photo-1594708053019-5c77bf8a8ee5"
        buttonTitle="Explore Sellers"
        onButtonPress={() => router.push('/(tabs)/home' as any)}
      />
    );
  }
  
  return (
    <FlatList
      style={styles.container}
      data={followedListings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <FoodCard listing={item} onPress={handleListingPress} />
        </View>
      )}
      ListHeaderComponent={
        <View>
          <Text style={styles.sectionTitle}>Followed Sellers</Text>
          <FlatList
            horizontal
            data={followedSellers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.sellerCard}
                onPress={() => handleSellerPress(item.id)}
              >
                <Image
                  source={{ uri: item.profileImage }}
                  style={styles.sellerImage}
                  contentFit="cover"
                />
                <Text style={styles.sellerName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <Star size={12} color={colors.primary} fill={colors.primary} />
                  <Text style={styles.ratingText}>
                    {item.rating?.toFixed(1) || '0.0'}
                  </Text>
                </View>
                <View style={styles.locationContainer}>
                  <MapPin size={10} color={colors.textLight} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.address.split(',').pop()?.trim()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sellersListContent}
          />
          
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          {followedListings.length === 0 && (
            <Text style={styles.emptyText}>
              No recent listings from followed sellers
            </Text>
          )}
        </View>
      }
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  sellersListContent: {
    paddingBottom: 16,
  },
  sellerCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  sellerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: colors.textLight,
    marginLeft: 2,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: 24,
  },
});