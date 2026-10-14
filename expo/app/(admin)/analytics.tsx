import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function AnalyticsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChefs: 0,
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
    approvedListings: 0,
    pendingListings: 0,
    totalEarnings: 0,
    completedOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get user stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: totalChefs } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('is_chef', true);

      // Get listing stats
      const { count: totalListings } = await supabase
        .from('food_listings')
        .select('*', { count: 'exact' });

      const { count: approvedListings } = await supabase
        .from('food_listings')
        .select('*', { count: 'exact' })
        .eq('is_approved', true);

      const { count: pendingListings } = await supabase
        .from('food_listings')
        .select('*', { count: 'exact' })
        .eq('is_approved', false);

      // Get order stats
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' });

      const { count: completedOrders, data: completedOrdersData } = await supabase
        .from('orders')
        .select('total_price', { count: 'exact' })
        .eq('status', 'completed');

      // Calculate total earnings
      let totalEarnings = 0;
      if (completedOrdersData) {
        totalEarnings = completedOrdersData.reduce((sum, order) => sum + (order.total_price || 0), 0);
      }

      setStats({
        totalUsers: totalUsers || 0,
        totalChefs: totalChefs || 0,
        totalListings: totalListings || 0,
        totalOrders: totalOrders || 0,
        approvedListings: approvedListings || 0,
        pendingListings: pendingListings || 0,
        totalRevenue: 0,
        totalEarnings: totalEarnings,
        completedOrders: completedOrders || 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics Dashboard</Text>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/admin/drill-users-list' as any)}>
          <View style={styles.metricIconContainer}>
            <Users size={24} color={colors.primary} />
          </View>
          <Text style={styles.metricValue}>{stats.totalUsers}</Text>
          <Text style={styles.metricLabel}>Total Users</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/admin/drill-users-list?filter=chefs' as any)}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#F3E5F5' }]}>
            <ShoppingBag size={24} color="#9C27B0" />
          </View>
          <Text style={styles.metricValue}>{stats.totalChefs}</Text>
          <Text style={styles.metricLabel}>Chefs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/(admin)/listings' as any)}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <BarChart3 size={24} color="#43A047" />
          </View>
          <Text style={styles.metricValue}>{stats.totalListings}</Text>
          <Text style={styles.metricLabel}>Listings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/(admin)/orders' as any)}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <TrendingUp size={24} color="#FB8C00" />
          </View>
          <Text style={styles.metricValue}>{stats.totalOrders}</Text>
          <Text style={styles.metricLabel}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/(admin)/orders?filter=completed' as any)}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#FCE4EC' }]}>
            <BarChart3 size={24} color="#E91E63" />
          </View>
          <Text style={styles.metricValue}>₹{stats.totalEarnings.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Total Earnings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/(admin)/orders?filter=completed' as any)}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#E0F2F1' }]}>
            <ShoppingBag size={24} color="#009688" />
          </View>
          <Text style={styles.metricValue}>{stats.completedOrders}</Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Listing Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Listing Status</Text>

        <View style={styles.statusRow}>
          <TouchableOpacity style={styles.statusItem} onPress={() => router.push('/(admin)/listings?filter=approved' as any)}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={styles.statusLabel}>Approved</Text>
            <Text style={styles.statusValue}>{stats.approvedListings}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statusItem} onPress={() => router.push('/(admin)/listings?filter=pending' as any)}>
            <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.statusLabel}>Pending</Text>
            <Text style={styles.statusValue}>{stats.pendingListings}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusBar}>
          <View
            style={[
              styles.statusBarFill,
              {
                width: `${stats.totalListings > 0
                  ? (stats.approvedListings / stats.totalListings) * 100
                  : 0}%`,
                backgroundColor: colors.success,
              },
            ]}
          />
        </View>
        <Text style={styles.statusBarLabel}>
          {stats.totalListings > 0
            ? Math.round((stats.approvedListings / stats.totalListings) * 100)
            : 0}% approved
        </Text>
      </View>

      {/* Quick Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Summary</Text>

        <TouchableOpacity style={styles.summaryItem} onPress={() => router.push('/admin/drill-users-list' as any)}>
          <Text style={styles.summaryLabel}>Total Platform Users</Text>
          <Text style={styles.summaryValue}>{stats.totalUsers}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryItem} onPress={() => router.push('/admin/drill-users-list?filter=chefs' as any)}>
          <Text style={styles.summaryLabel}>Active Chefs</Text>
          <Text style={styles.summaryValue}>{stats.totalChefs}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryItem} onPress={() => router.push('/(admin)/orders' as any)}>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
          <Text style={styles.summaryValue}>{stats.totalOrders}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.summaryItem} onPress={() => router.push('/(admin)/listings' as any)}>
          <Text style={styles.summaryLabel}>Approval Rate</Text>
          <Text style={styles.summaryValue}>
            {stats.totalListings > 0
              ? `${Math.round((stats.approvedListings / stats.totalListings) * 100)}%`
              : 'N/A'}
          </Text>
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
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  statusLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statusBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusBarLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'right',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
});
