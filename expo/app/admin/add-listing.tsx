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
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function AddListingScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [formData, setFormData] = useState({
    dishName: '',
    description: '',
    price: '',
    quantity: '',
    servings: '2',
    isVegetarian: true,
    isApproved: true,
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, is_chef')
        .eq('is_chef', true)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load chefs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      Alert.alert('Error', 'Please select a chef');
      return;
    }

    if (!formData.dishName.trim()) {
      Alert.alert('Error', 'Please enter dish name');
      return;
    }

    if (!formData.price.trim()) {
      Alert.alert('Error', 'Please enter price');
      return;
    }

    try {
      setIsSaving(true);

      // Get selected chef's details
      const selectedChef = users.find((u) => u.id === selectedUserId);
      if (!selectedChef) {
        throw new Error('Chef not found');
      }

      // Get chef's location
      const { data: chefProfile, error: profileError } = await supabase
        .from('profiles')
        .select('address, location_lat, location_lng')
        .eq('id', selectedUserId)
        .single();

      if (profileError) throw profileError;

      // Create listing
      const { error: listingError } = await supabase
        .from('food_listings')
        .insert({
          user_id: selectedUserId,
          dish_name: formData.dishName,
          description: formData.description,
          price: parseFloat(formData.price),
          quantity: formData.quantity,
          servings: formData.servings,
          is_vegetarian: formData.isVegetarian,
          is_approved: formData.isApproved,
          is_active: formData.isActive,
          cuisine_type: 'General',
          packaging: 'Box',
          available_from: new Date().toISOString(),
          available_until: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
          address: chefProfile?.address || '',
          location_lat: chefProfile?.location_lat || 0,
          location_lng: chefProfile?.location_lng || 0,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
          is_featured: false,
          is_lunch_box: false,
        });

      if (listingError) throw listingError;

      Alert.alert('Success', 'Listing created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedChef = users.find((u) => u.id === selectedUserId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Select Chef</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.userSelector}
              onPress={() => setShowUserPicker(!showUserPicker)}
            >
              <Text style={styles.userSelectorText}>
                {selectedChef ? selectedChef.name : 'Select a chef...'}
              </Text>
            </TouchableOpacity>

            {showUserPicker && (
              <View style={styles.userList}>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.userOption}
                    onPress={() => {
                      setSelectedUserId(user.id);
                      setShowUserPicker(false);
                    }}
                  >
                    <Text style={styles.userOptionText}>{user.name}</Text>
                    <Text style={styles.userOptionEmail}>{user.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Listing Details</Text>

        <Input
          label="Dish Name"
          value={formData.dishName}
          onChangeText={(text) => setFormData({ ...formData, dishName: text })}
          placeholder="Enter dish name"
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter description"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Price (₹)"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="Enter price"
          keyboardType="decimal-pad"
        />

        <Input
          label="Quantity"
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          placeholder="e.g., 500g, 1kg"
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

        <View style={styles.buttonRow}>
          <Button
            title={isSaving ? 'Creating...' : 'Create Listing'}
            onPress={handleSave}
            disabled={isSaving || !selectedUserId}
            size="large"
            style={styles.saveButton}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            size="large"
            style={styles.cancelButton}
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
  formSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  userSelector: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userSelectorText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  userList: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    maxHeight: 300,
  },
  userOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userOptionText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  userOptionEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
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
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});
