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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function EditUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    isChef: false,
    isAdmin: false,
    isVerified: false,
    allowProfileDisplay: true,
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const user: User = {
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          profileImage: data.avatar_url || '',
          isChef: data.is_chef || false,
          isAdmin: data.is_admin || false,
          rating: data.rating || 0,
          reviewCount: data.review_count || 0,
          address: data.address || '',
          experience: data.experience || '',
          cuisineTypes: data.cuisine_types || [],
          paymentMethods: data.payment_methods || [],
          location: {
            latitude: data.location_lat || 0,
            longitude: data.location_lng || 0,
          },
          allowProfileDisplay: data.allow_profile_display ?? true,
          isVerified: data.is_verified || false,
          officeAddress: data.office_address || '',
          officeLocation: {
            latitude: data.office_lat || 0,
            longitude: data.office_lng || 0,
          },
          homeToOfficeRoute: data.home_to_office_route || [],
          officeToHomeRoute: data.office_to_home_route || [],
          routesSameAsHomeToOffice: data.routes_same_as_home_to_office ?? true,
          detourPreference: data.detour_preference || 500,
          subscriptionPlan: data.subscription_plan,
          subscriptionExpiry: data.subscription_expiry,
          firstPostDate: data.first_post_date || null,
          postCount: data.post_count || 0,
          freePostsRemaining: data.free_posts_remaining ?? 3,
        };
        setUser(user);
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          isChef: user.isChef,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
          allowProfileDisplay: user.allowProfileDisplay,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await supabase
        .from('profiles')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          is_chef: formData.isChef,
          is_admin: formData.isAdmin,
          is_verified: formData.isVerified,
          allow_profile_display: formData.allowProfileDisplay,
        })
        .eq('id', id);

      Alert.alert('Success', 'User updated successfully');
      loadUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit User</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        {user.profileImage && (
          <Image
            source={{ uri: user.profileImage }}
            style={styles.avatar}
            contentFit="cover"
          />
        )}
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userId}>{user.id}</Text>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="User name"
        />

        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="Email address"
          editable={false}
        />

        <Input
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="Phone number"
          editable={false}
        />

        <Input
          label="Address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Street address"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Is Chef</Text>
          <Switch
            value={formData.isChef}
            onValueChange={(value) => setFormData({ ...formData, isChef: value })}
            thumbColor={formData.isChef ? colors.primary : colors.border}
            trackColor={{ false: colors.background, true: `${colors.primary}40` }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Is Admin</Text>
          <Switch
            value={formData.isAdmin}
            onValueChange={(value) => setFormData({ ...formData, isAdmin: value })}
            thumbColor={formData.isAdmin ? colors.primary : colors.border}
            trackColor={{ false: colors.background, true: `${colors.primary}40` }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Is Verified</Text>
          <Switch
            value={formData.isVerified}
            onValueChange={(value) => setFormData({ ...formData, isVerified: value })}
            thumbColor={formData.isVerified ? colors.primary : colors.border}
            trackColor={{ false: colors.background, true: `${colors.primary}40` }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Allow Profile Display</Text>
          <Switch
            value={formData.allowProfileDisplay}
            onValueChange={(value) =>
              setFormData({ ...formData, allowProfileDisplay: value })
            }
            thumbColor={formData.allowProfileDisplay ? colors.primary : colors.border}
            trackColor={{
              false: colors.background,
              true: `${colors.primary}40`,
            }}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>{user.rating.toFixed(1)}★</Text>
          <Text style={styles.infoLabel} style={{ marginTop: spacing.md }}>
            Posts
          </Text>
          <Text style={styles.infoValue}>{user.postCount}</Text>
          <Text style={styles.infoLabel} style={{ marginTop: spacing.md }}>
            Reviews
          </Text>
          <Text style={styles.infoValue}>{user.reviewCount}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Button
            title={isSaving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
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
  section: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userId: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  formSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.xs,
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
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
