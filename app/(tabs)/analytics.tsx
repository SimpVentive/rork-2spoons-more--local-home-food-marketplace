import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Users,
  Wallet,
  Star,
  BarChart3,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { api } from '@/lib/api';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

interface AnalyticsData {
  total_revenue: number;
  completed_orders: number;
  average_rating: number;
  follower_count: number;
  revenue_by_month: { month: string; amount: number }[];
  orders_by_month: { month: string; count: number }[];
  popular_dishes: { name: string; count: number }[];
}

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    api
      .get(`/api/followers/count/?seller_id=${user.id}`)
      .then(res => {
        const count = res.data.count;
        setFollowerCount(count);

        return api.get('/api/seller-analytics/').then(analyticsRes => {
          setAnalytics({
            ...analyticsRes.data,
            average_rating: user.rating || 0,
            follower_count: count,
          });
        });
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Failed to load analytics');
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view analytics"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)')}
      />
    );
  }

  if (loading || analytics === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  const { total_revenue, completed_orders, average_rating, popular_dishes } = analytics;

  const BarChart = ({ data, valueKey, color }: any) => {
    const maxValue = Math.max(...data.map((item: any) => item[valueKey]));
    return (
      <View style={styles.chartContainer}>
        {data.map((item: any, index: number) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barLabelContainer}>
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${maxValue > 0 ? (item[valueKey] / maxValue) * 100 : 0}%`,
                    backgroundColor: color,
                  },
                ]}
              />
              <Text style={styles.barValue}>
                {valueKey === 'amount' ? `₹${item[valueKey]}` : item[valueKey]}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Seller Analytics</Text>
        <View style={styles.timeRangeContainer}>
          {['week', 'month', 'year'].map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRange]}
              onPress={() => setTimeRange(range as 'week' | 'month' | 'year')}
            >
              <Text style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Wallet size={24} color="#1976D2" />
          </View>
          <Text style={styles.metricValue}>₹{total_revenue}</Text>
          <Text style={styles.metricLabel}>Total Revenue</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <BarChart3 size={24} color="#43A047" />
          </View>
          <Text style={styles.metricValue}>{completed_orders}</Text>
          <Text style={styles.metricLabel}>Completed Orders</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Star size={24} color="#FF9800" />
          </View>
          <Text style={styles.metricValue}>{average_rating.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>Average Rating</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#F3E5F5' }]}>
            <Users size={24} color="#9C27B0" />
          </View>
          <Text style={styles.metricValue}>{followerCount}</Text>
          <Text style={styles.metricLabel}>Followers</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <TrendingUp size={20} color={colors.primary} />
        </View>
        <BarChart data={analytics.revenue_by_month} valueKey="amount" color={colors.primary} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <BarChart3 size={20} color={colors.primary} />
        </View>
        <BarChart data={analytics.orders_by_month} valueKey="count" color={colors.secondary} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Dishes</Text>
        </View>
        {popular_dishes.map((dish, idx) => (
          <View key={idx} style={styles.popularDishItem}>
            <Text style={styles.popularDishName}>{dish.name}</Text>
            <Text style={styles.popularDishCount}>{dish.count} orders</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.viewMoreButton}
        onPress={() =>
          Alert.alert('Coming Soon', 'Detailed analytics will be available in a future update.')
        }
      >
        <Text style={styles.viewMoreText}>View Detailed Analytics</Text>
        <ChevronRight size={20} color={colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTimeRange: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeRangeText: {
    fontSize: 14,
    color: colors.textLight,
  },
  activeTimeRangeText: {
    color: colors.text,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  chartContainer: {
    marginTop: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabelContainer: {
    width: 40,
  },
  barLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  barWrapper: {
    flex: 1,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 16,
    borderRadius: 8,
  },
  barValue: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
  },
  popularDishItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  popularDishName: {
    fontSize: 16,
    color: colors.text,
  },
  popularDishCount: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularDishCountText: {
    fontSize: 12,
    color: colors.textLight,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  viewMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 8,
  },
  loadingText: { padding: 16, fontSize: 16, color: colors.text },
});