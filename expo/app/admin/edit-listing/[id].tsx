import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { FoodListing } from '@/types';
import { useListingsStore } from '@/store/listings-store';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { updateListing, deleteListing } = useListingsStore();
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    dishName: '',
    description: '',
    price: '',
    quantity: '',
    servings: '',
    isVegetarian: false,
    isApproved: false,
    isActive: true,
    isFeatured: false,
  });

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
        setFormData({
          dishName: listing.dishName,
          description: listing.description,
          price: listing.price.toString(),
          quantity: listing.quantity,
          servings: listing.servings,
          isVegetarian: listing.isVegetarian,
          isApproved: listing.isApproved,
          isActive: listing.isActive,
          isFeatured: listing.isFeatured,
        });
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (listing) {
        const updates = {
          ...listing,
          dishName: formData.dishName,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: formData.quantity,
          servings: formData.servings,
          isVegetarian: formData.isVegetarian,
          isApproved: formData.isApproved,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        };
        await updateListing(listing.id, updates);
        Alert.alert('Success', 'Listing updated successfully');
        loadListing();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update listing');
    } finally {
      setIsSaving(false);
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
        <Text style={styles.title}>Edit Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      {listing.image && (
        <Image
          source={{ uri: listing.image }}
          style={styles.image}
          contentFit="cover"
        />
      )}

      <View style={styles.formSection}>
        <Input
          label="Dish Name"
          value={formData.dishName}
          onChangeText={(text) => setFormData({ ...formData, dishName: text })}
          placeholder="Dish name"
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Dish description"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Price"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="Price"
          keyboardType="decimal-pad"
        />

        <Input
          label="Quantity"
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          placeholder="Quantity"
        />

        <Input
          label="Servings"
          value={formData.servings}
          onChangeText={(text) => setFormData({ ...formData, servings: text })}
          placeholder="Number of servings"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Vegetarian</Text>
          <Switch
            value={formData.isVegetarian}
            onValueChange={(value) => setFormData({ ...formData, isVegetarian: value })}
            thumbColor={formData.isVegetarian ? colors.primary : colors.border}
            trackColor={{ false: colors.background, true: `${colors.primary}40` }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Approved</Text>
          <Switch
            value={formData.isApproved}
            onValueChange={(value) => setFormData({ ...formData, isApproved: value })}
            thumbColor={formData.isApproved ? colors.success : colors.border}
            trackColor={{ false: colors.background, true: `${colors.success}40` }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Active</Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            thumbColor={formData.isActive ? colors.primary : colors.border}
            trackColor={{ false: colors.background, true: `${colors.primary}40` }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Featured</Text>
          <Switch
            value={formData.isFeatured}
            onValueChange={(value) => setFormData({ ...formData, isFeatured: value })}
            thumbColor={formData.isFeatured ? colors.primary : colors.border}
            trackColor={{ false: colors.background, true: `${colors.primary}40` }}
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title={isSaving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
            size="large"
            style={styles.saveButton}
          />
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={20} color={colors.error} />
          <Text style={styles.deleteButtonText}>Delete Listing</Text>
        </TouchableOpacity>
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
    height: 250,
    backgroundColor: colors.border,
  },
  formSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  buttonRow: {
    marginTop: spacing.lg,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
