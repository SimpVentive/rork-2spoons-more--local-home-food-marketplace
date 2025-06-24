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
import { useListingsStore } from '@/store/listings-store';
import EmptyState from '@/components/EmptyState';
import FoodCard from '@/components/FoodCard';
import { api } from '@/lib/api';

import { User, FoodListing } from '@/types';
import colors from '@/constants/colors';

export default function FollowingScreen() {
  const { user } = useAuthStore();
  const { listings, fetchListings } = useListingsStore();

  const [followedSellers, setFollowedSellers] = useState<User[]>([]);
  const [followedListings, setFollowedListings] = useState<FoodListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (user) loadFollowedContent();
  }, [user]);

  const loadFollowedContent = async () => {
    if (!user) return;

    try {
      setRefreshing(true);

      const { data: sellers } = await api.get(`/api/users/${user.id}/sellers/`);
      console.log(sellers)
      setFollowedSellers(sellers);

      await fetchListings(); // wait for listings to update
      const sellerIds = sellers.map((s: User) => s.id);
      const filtered = listings.filter((l: FoodListing) => sellerIds.includes(l.sellerId));
      setFollowedListings(filtered);
    } catch (error) {
      console.error('Error loading followed content:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSellerPress = (sellerId: string) => {
    router.push(`/profile/${sellerId}`);
  };

  const handleListingPress = (listing: FoodListing) => {
    router.push(`/listing/${listing.id}`);
  };

  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view followed sellers"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)')}
      />
    );
  }

  if (!refreshing && followedSellers.length === 0) {
    return (
      <EmptyState
        title="No Followed Sellers"
        message="You haven't followed any sellers yet"
        image="https://images.unsplash.com/photo-1594708053019-5c77bf8a8ee5"
        buttonTitle="Explore Sellers"
        onButtonPress={() => router.push('/(tabs)')}
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
                  {item.followingname}
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
                    {typeof item.address === 'string'
                      ? item.address.split(',').pop()?.trim()
                      : 'No address'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sellersListContent}
          />

          <Text style={styles.sectionTitle}>Recent Listings</Text>
          {followedListings.length === 0 && (
            <Text style={styles.emptyText}>No recent listings from followed sellers</Text>
          )}
        </View>
      }
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFollowedContent} />}
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
