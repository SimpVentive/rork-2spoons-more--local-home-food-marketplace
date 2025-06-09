import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
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
import { useListingsStore } from '@/store/listings-store';
import { useOrdersStore } from '@/store/orders-store';
import { useFollowsStore } from '@/store/follows-store';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

// Mock data for charts
const mockRevenueData = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
  { month: 'May', amount: 1200 },
  { month: 'Jun', amount: 2400 },
];

const mockOrdersData = [
  { month: 'Jan', count: 0 },
  { month: 'Feb', count: 0 },
  { month: 'Mar', count: 0 },
  { month: 'Apr', count: 0 },
  { month: 'May', count: 5 },
  { month: 'Jun', count: 10 },
];

const mockPopularDishes = [
  { name: 'Butter Chicken', count: 8 },
  { name: 'Masala Dosa', count: 6 },
  { name: 'Gulab Jamun', count: 4 },
];

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const { getSellerListings } = useListingsStore();
  const { getSellerOrders } = useOrdersStore();
  const { getFollowerCount } = useFollowsStore();
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  const router = useRouter();
  
  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view your analytics"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)')}
      />
    );
  }
  
  const sellerListings = getSellerListings(user.id);
  const sellerOrders = getSellerOrders(user.id);
  const followerCount = getFollowerCount(user.id);
  
  // Calculate metrics
  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const completedOrders = sellerOrders.filter(order => order.status === 'completed').length;
  const averageRating = user.rating || 0;
  
  // Simple bar chart component
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
                  }
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
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'week' && styles.activeTimeRange,
            ]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === 'week' && styles.activeTimeRangeText,
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'month' && styles.activeTimeRange,
            ]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === 'month' && styles.activeTimeRangeText,
            ]}>
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'year' && styles.activeTimeRange,
            ]}
            onPress={() => setTimeRange('year')}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === 'year' && styles.activeTimeRangeText,
            ]}>
              Year
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Wallet size={24} color="#1976D2" />
          </View>
          <Text style={styles.metricValue}>₹{totalRevenue}</Text>
          <Text style={styles.metricLabel}>Total Revenue</Text>
        </View>
        
        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <BarChart3 size={24} color="#43A047" />
          </View>
          <Text style={styles.metricValue}>{completedOrders}</Text>
          <Text style={styles.metricLabel}>Completed Orders</Text>
        </View>
        
        <View style={styles.metricCard}>
          <View style={[styles.metricIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Star size={24} color="#FF9800" />
          </View>
          <Text style={styles.metricValue}>{averageRating.toFixed(1)}</Text>
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
        
        <BarChart 
          data={mockRevenueData} 
          valueKey="amount" 
          color={colors.primary} 
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <BarChart3 size={20} color={colors.primary} />
        </View>
        
        <BarChart 
          data={mockOrdersData} 
          valueKey="count" 
          color={colors.secondary} 
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Dishes</Text>
        </View>
        
        {mockPopularDishes.map((dish, index) => (
          <View key={index} style={styles.popularDishItem}>
            <Text style={styles.popularDishName}>{dish.name}</Text>
            <View style={styles.popularDishCount}>
              <Text style={styles.popularDishCountText}>{dish.count} orders</Text>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.viewMoreButton}
        onPress={() => Alert.alert('Coming Soon', 'Detailed analytics will be available in a future update.')}
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
    shadowColor: colors.black, // Using black instead of shadow
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
});