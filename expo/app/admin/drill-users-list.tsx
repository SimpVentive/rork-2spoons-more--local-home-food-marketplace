import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { User as UserType } from '@/types';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function UsersListScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedUsers: UserType[] = (data || []).map(row => ({
        id: row.id,
        name: row.name || '',
        email: row.email || '',
        phone: row.phone || '',
        profileImage: row.avatar_url || '',
        isChef: row.is_chef || false,
        isAdmin: row.is_admin || false,
        rating: row.rating || 0,
        reviewCount: row.review_count || 0,
        address: row.address || '',
        experience: row.experience || '',
        cuisineTypes: row.cuisine_types || [],
        paymentMethods: row.payment_methods || [],
        location: {
          latitude: row.location_lat || 0,
          longitude: row.location_lng || 0,
        },
        allowProfileDisplay: row.allow_profile_display ?? true,
        isVerified: row.is_verified || false,
        officeAddress: row.office_address || '',
        officeLocation: {
          latitude: row.office_lat || 0,
          longitude: row.office_lng || 0,
        },
        homeToOfficeRoute: row.home_to_office_route || [],
        officeToHomeRoute: row.office_to_home_route || [],
        routesSameAsHomeToOffice: row.routes_same_as_home_to_office ?? true,
        detourPreference: row.detour_preference || 500,
        subscriptionPlan: row.subscription_plan,
        subscriptionExpiry: row.subscription_expiry,
        firstPostDate: row.first_post_date || null,
        postCount: row.post_count || 0,
        freePostsRemaining: row.free_posts_remaining ?? 3,
      }));

      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
    );
    setFilteredUsers(filtered);
  };

  const renderUserRow = ({ item }: { item: UserType }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() => router.push(`/admin/user-details/${item.id}`)}
    >
      <Image
        source={{ uri: item.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
        style={styles.avatar}
        contentFit="cover"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userMeta}>{item.email}</Text>
        <View style={styles.badgeContainer}>
          {item.isChef && <View style={styles.chefBadge}><Text style={styles.badgeText}>Chef</Text></View>}
          {item.isAdmin && <View style={styles.adminBadge}><Text style={styles.badgeText}>Admin</Text></View>}
          {item.isVerified && <View style={styles.verifiedBadge}><Text style={styles.badgeText}>✓</Text></View>}
        </View>
      </View>
      <Text style={styles.rating}>{item.rating.toFixed(1)}★</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>All Users</Text>
        <Text style={styles.count}>{filteredUsers.length}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or phone"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserRow}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    flex: 1,
    textAlign: 'center',
  },
  count: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chefBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  rating: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
