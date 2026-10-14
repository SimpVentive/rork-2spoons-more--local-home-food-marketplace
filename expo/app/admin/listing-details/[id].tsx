import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, MapPin, Clock, Star, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { FoodListing } from '@/types';
import { useListingsStore } from '@/store/listings-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { deleteListing } = useListingsStore();
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const listing: FoodListing = {
          id: data.id,
          dishName: data.dish_name || '',
          description: data.description || '',
          image: data.image_url || '',
          price: data.price || 0,
          rating: data.rating || 0,
          reviewCount: data.review_count || 0,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          userId: data.user_id,
          isApproved: data.is_approved || false,
          isActive: data.is_active !== false,
          isFeatured: data.is_featured || false,
          isVegetarian: data.is_vegetarian || false,
          cuisineType: data.cuisine_type || '',
          quantity: data.quantity || '',
          servings: data.servings || '',
          packaging: data.packaging || '',
          availableFrom: data.available_from ? new Date(data.available_from) : new Date(),
          availableUntil: data.available_until ? new Date(data.available_until) : new Date(),
          location: {
            latitude: data.location_lat || 0,
            longitude: data.location_lng || 0,
          },
          address: data.address || '',
          isLunchBox: data.is_lunch_box || false,
          lunchBoxItems: data.lunch_box_items || [],
        };
        setListing(listing);
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (listing) {
                await deleteListing(listing.id);
                Alert.alert('Success', 'Listing deleted successfully');
                router.back();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Listing Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {listing.image && (
        <Image
          source={{ uri: listing.image }}
          style={styles.image}
          contentFit="cover"
        />
      )}

      <View style={styles.detailsSection}>
        <Text style={styles.dishName}>{listing.dishName}</Text>

        <View style={styles.badgesRow}>
          {listing.isApproved ? (
            <View style={styles.approvedBadge}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.badgeText}>Approved</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <XCircle size={16} color={colors.warning} />
              <Text style={styles.badgeText}>Pending</Text>
            </View>
          )}
          {listing.isFeatured && (
            <View style={styles.featuredBadge}>
              <Star size={16} color="#FFB800" />
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
          {listing.isActive ? (
            <View style={styles.activeBadge}>
              <CheckCircle size={16} color={colors.success} />
              <Text style={styles.badgeText}>Active</Text>
            </View>
          ) : (
            <View style={styles.inactiveBadge}>
              <XCircle size={16} color={colors.error} />
              <Text style={styles.badgeText}>Inactive</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>₹{listing.price}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rating:</Text>
          <Text style={styles.value}>{listing.rating?.toFixed(1)}★ ({listing.reviewCount} reviews)</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Cuisine Type:</Text>
          <Text style={styles.value}>{listing.cuisineType}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Quantity:</Text>
          <Text style={styles.value}>{listing.quantity}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Servings:</Text>
          <Text style={styles.value}>{listing.servings}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Vegetarian:</Text>
          <Text style={styles.value}>{listing.isVegetarian ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Packaging:</Text>
          <Text style={styles.value}>{listing.packaging}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Available From:</Text>
          <Text style={styles.value}>{new Date(listing.availableFrom).toLocaleString()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Available Until:</Text>
          <Text style={styles.value}>{new Date(listing.availableUntil).toLocaleString()}</Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.value}>{listing.address}</Text>
        </View>

        {listing.description && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="Edit"
            onPress={() => router.push(`/admin/edit-listing/${listing.id}` as any)}
            size="large"
            style={styles.editButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            size="large"
            style={styles.deleteButton}
            variant="secondary"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.border,
  },
  detailsSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
  },
  dishName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.warning}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFB80015',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.error}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textLight,
  },
  value: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
