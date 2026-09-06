import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, LogIn, UserPlus, CheckCircle, Trash2, Edit2, Package } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  actionType: 'login' | 'signup' | 'create' | 'update' | 'delete' | 'approve';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export default function ActivityLogScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [searchQuery, activities]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);

      // Fetch from various tables to create an activity log
      const [usersResult, listingsResult, ordersResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('food_listings')
          .select('id, dish_name, created_at, user_id, is_approved')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('orders')
          .select('id, created_at, user_id, status')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const logs: ActivityLog[] = [];

      // Add user signup activities
      if (usersResult.data) {
        usersResult.data.forEach((user: any) => {
          logs.push({
            id: `user_${user.id}`,
            userId: user.id,
            userName: user.name || 'Unknown User',
            action: 'User Signup',
            actionType: 'signup',
            description: `${user.name || 'New user'} joined the platform`,
            timestamp: user.created_at,
          });
        });
      }

      // Add listing activities
      if (listingsResult.data) {
        listingsResult.data.forEach((listing: any) => {
          const action = listing.is_approved ? 'Listing Approved' : 'Listing Created';
          const description = listing.is_approved
            ? `Listing "${listing.dish_name}" was approved`
            : `New listing "${listing.dish_name}" created`;

          logs.push({
            id: `listing_${listing.id}`,
            userId: listing.user_id,
            userName: listing.dish_name,
            action,
            actionType: listing.is_approved ? 'approve' : 'create',
            description,
            timestamp: listing.created_at,
            metadata: { type: 'listing', dishName: listing.dish_name },
          });
        });
      }

      // Add order activities
      if (ordersResult.data) {
        ordersResult.data.forEach((order: any) => {
          logs.push({
            id: `order_${order.id}`,
            userId: order.user_id,
            userName: order.status,
            action: 'Order Placed',
            actionType: 'create',
            description: `Order ${order.id.slice(0, 8)} status: ${order.status}`,
            timestamp: order.created_at,
            metadata: { type: 'order', status: order.status },
          });
        });
      }

      // Sort by timestamp
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(logs);
      setFilteredActivities(logs);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterActivities = () => {
    if (!searchQuery.trim()) {
      setFilteredActivities(activities);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = activities.filter(
      (activity) =>
        activity.userName.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.action.toLowerCase().includes(query)
    );
    setFilteredActivities(filtered);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return <LogIn size={18} color={colors.primary} />;
      case 'signup':
        return <UserPlus size={18} color={colors.success} />;
      case 'approve':
        return <CheckCircle size={18} color={colors.success} />;
      case 'delete':
        return <Trash2 size={18} color={colors.error} />;
      case 'update':
        return <Edit2 size={18} color={colors.warning} />;
      case 'create':
        return <Package size={18} color={colors.primary} />;
      default:
        return <LogIn size={18} color={colors.textLight} />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return colors.primary;
      case 'signup':
        return colors.success;
      case 'approve':
        return colors.success;
      case 'delete':
        return colors.error;
      case 'update':
        return colors.warning;
      case 'create':
        return colors.primary;
      default:
        return colors.textLight;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  if (isLoading && !activities.length) {
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
        <Text style={styles.title}>Activity Log</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No activities found</Text>
          </View>
        ) : (
          filteredActivities.map((activity, index) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                {getActionIcon(activity.actionType)}
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.actionLabel, { color: getActionColor(activity.actionType) }]}>
                  {activity.action}
                </Text>
                <Text style={styles.description}>{activity.description}</Text>
                <Text style={styles.timestamp}>
                  {new Date(activity.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
        <View style={styles.footer} />
      </ScrollView>
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
  content: {
    paddingHorizontal: spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyStateText: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
  },
  footer: {
    height: spacing.lg,
  },
});
