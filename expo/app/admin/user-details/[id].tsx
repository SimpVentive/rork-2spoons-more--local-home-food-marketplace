import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  ShoppingBag,
  ChefHat,
  Calendar,
  Shield,
  Trash2,
  Edit2,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { User as UserType } from '@/types';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { supabase } from '@/lib/supabase';

export default function UserDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadUserDetails();
    }
  }, [id]);

  const loadUserDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const userData: UserType = {
          id: data.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          profileImage: data.avatar_url || '',
          experience: data.experience || '',
          cuisineTypes: data.cuisine_types || [],
          paymentMethods: data.payment_methods || [],
          location: {
            latitude: data.location_lat || 0,
            longitude: data.location_lng || 0,
          },
          isChef: data.is_chef || false,
          allowProfileDisplay: data.allow_profile_display ?? true,
          isVerified: data.is_verified || false,
          isAdmin: data.is_admin || false,
          rating: data.rating || 0,
          reviewCount: data.review_count || 0,
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
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

              if (error) throw error;

              Alert.alert('Success', 'User deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            } finally {
              setIsDeleting(false);
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

  if (!user) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
          <Text style={styles.headerTitle}>User Details</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
            style={styles.profileImage}
            contentFit="cover"
          />

          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user.name}</Text>
              {user.isAdmin && (
                <View style={styles.adminBadge}>
                  <Shield size={12} color="#FFFFFF" />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
              {user.isChef && (
                <View style={styles.chefBadge}>
                  <ChefHat size={12} color="#FFFFFF" />
                  <Text style={styles.chefBadgeText}>Chef</Text>
                </View>
              )}
            </View>

            {user.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Star size={16} color={colors.primary} fill={colors.primary} />
                <Text style={styles.rating}>
                  {user.rating.toFixed(1)} ({user.reviewCount} reviews)
                </Text>
              </View>
            )}

            <View style={styles.verificationContainer}>
              {user.isVerified ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              ) : (
                <View style={styles.unverifiedBadge}>
                  <Text style={styles.unverifiedText}>Not Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <Mail size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoText}>{user.address || 'Not set'}</Text>
            </View>
          </View>
        </View>

        {/* Account Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ShoppingBag size={24} color={colors.primary} />
              <Text style={styles.statValue}>{user.postCount || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>

            {user.isChef && (
              <View style={styles.statCard}>
                <ChefHat size={24} color={colors.secondary} />
                <Text style={styles.statValue}>{user.cuisineTypes.length}</Text>
                <Text style={styles.statLabel}>Cuisines</Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Info */}
        {user.isChef && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chef Information</Text>

            {user.cuisineTypes.length > 0 && (
              <View style={styles.infoRow}>
                <ChefHat size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Specialties</Text>
                  <Text style={styles.infoText}>{user.cuisineTypes.join(', ')}</Text>
                </View>
              </View>
            )}

            {user.experience && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoText}>{user.experience}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteUser} disabled={isDeleting}>
              <Trash2 size={20} color={colors.white} />
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  chefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  chefBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  rating: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  verificationContainer: {
    marginTop: spacing.sm,
  },
  verifiedBadge: {
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: colors.success,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  unverifiedBadge: {
    backgroundColor: `${colors.textLight}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  unverifiedText: {
    color: colors.textLight,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontWeight: typography.weights.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  actionButtons: {
    gap: spacing.md,
  },
  deleteButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.md,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
  },
});
