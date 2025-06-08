import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  MessageSquare,
  ChefHat,
  Tag,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import { useOrdersStore } from '@/store/orders-store';
import { useComplaintsStore } from '@/store/complaints-store';
import colors from '@/constants/colors';
import { mockAdminDashboardData } from '@/mocks/data';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { listings } = useListingsStore();
  const { orders } = useOrdersStore();
  const { complaints } = useComplaintsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalOrders: 0,
    totalComplaints: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeListings: 0,
    completedOrders: 0,
    pendingOrders: 0,
    canceledOrders: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
  });
  
  const router = useRouter();
  
  useEffect(() => {
    loadStats();
  }, [listings, orders, complaints]);
  
  const loadStats = () => {
    // Calculate stats from store data
    const pendingApprovals = listings.filter(listing => !listing.isApproved).length;
    const activeListings = listings.filter(listing => listing.isActive).length;
    
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = orders.filter(order => ['confirmed', 'preparing', 'ready'].includes(order.status)).length;
    const canceledOrders = orders.filter(order => order.status === 'canceled').length;
    
    const resolvedComplaints = complaints.filter(complaint => complaint.status === 'resolved').length;
    const pendingComplaints = complaints.filter(complaint => complaint.status === 'pending').length;
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    setStats({
      totalUsers: mockAdminDashboardData.totalBuyers + mockAdminDashboardData.topChefs.length,
      totalListings: listings.length,
      totalOrders: orders.length,
      totalComplaints: complaints.length,
      totalRevenue,
      pendingApprovals,
      activeListings,
      completedOrders,
      pendingOrders,
      canceledOrders,
      resolvedComplaints,
      pendingComplaints,
    });
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    loadStats();
    setRefreshing(false);
  };
  
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    percentChange, 
    isPositive = true,
    onPress
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    percentChange?: number;
    isPositive?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statCardHeader}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <View style={[styles.statCardIcon, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
      </View>
      
      <Text style={styles.statCardValue}>{value}</Text>
      
      {percentChange !== undefined && (
        <View style={styles.statCardFooter}>
          {isPositive ? (
            <ArrowUpRight size={16} color={colors.success} />
          ) : (
            <ArrowDownRight size={16} color={colors.error} />
          )}
          <Text style={[
            styles.statCardPercent,
            { color: isPositive ? colors.success : colors.error }
          ]}>
            {percentChange}% {isPositive ? 'increase' : 'decrease'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {user?.name.split(' ')[0] || 'Admin'}</Text>
          <Text style={styles.subtitle}>Here's what's happening with your platform today.</Text>
        </View>
      </View>
      
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={20} color={colors.adminPrimary} />}
          color={colors.adminPrimary}
          percentChange={5.2}
          isPositive={true}
          onPress={() => router.push('/admin/users')}
        />
        
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={20} color={colors.adminSuccess} />}
          color={colors.adminSuccess}
          percentChange={8.1}
          isPositive={true}
          onPress={() => router.push('/admin/top-earners')}
        />
        
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag size={20} color={colors.adminWarning} />}
          color={colors.adminWarning}
          percentChange={3.4}
          isPositive={true}
          onPress={() => router.push('/admin/orders')}
        />
        
        <StatCard
          title="Complaints"
          value={stats.totalComplaints}
          icon={<MessageSquare size={20} color={colors.adminDanger} />}
          color={colors.adminDanger}
          percentChange={2.1}
          isPositive={false}
          onPress={() => router.push('/admin/complaints')}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Listings Overview</Text>
        
        <View style={styles.listingsStats}>
          <View style={styles.listingStat}>
            <View style={[styles.listingStatIcon, { backgroundColor: `${colors.adminPrimary}20` }]}>
              <Tag size={20} color={colors.adminPrimary} />
            </View>
            <View style={styles.listingStatContent}>
              <Text style={styles.listingStatValue}>{stats.totalListings}</Text>
              <Text style={styles.listingStatLabel}>Total Listings</Text>
            </View>
          </View>
          
          <View style={styles.listingStat}>
            <View style={[styles.listingStatIcon, { backgroundColor: `${colors.adminSuccess}20` }]}>
              <CheckCircle size={20} color={colors.adminSuccess} />
            </View>
            <View style={styles.listingStatContent}>
              <Text style={styles.listingStatValue}>{stats.activeListings}</Text>
              <Text style={styles.listingStatLabel}>Active</Text>
            </View>
          </View>
          
          <View style={styles.listingStat}>
            <View style={[styles.listingStatIcon, { backgroundColor: `${colors.adminWarning}20` }]}>
              <Clock size={20} color={colors.adminWarning} />
            </View>
            <View style={styles.listingStatContent}>
              <Text style={styles.listingStatValue}>{stats.pendingApprovals}</Text>
              <Text style={styles.listingStatLabel}>Pending</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/admin/listings')}
        >
          <Text style={styles.viewAllButtonText}>Manage Listings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders Status</Text>
        
        <View style={styles.ordersStats}>
          <View style={styles.orderStat}>
            <View style={[styles.orderStatIcon, { backgroundColor: `${colors.adminSuccess}20` }]}>
              <CheckCircle size={20} color={colors.adminSuccess} />
            </View>
            <Text style={styles.orderStatValue}>{stats.completedOrders}</Text>
            <Text style={styles.orderStatLabel}>Completed</Text>
          </View>
          
          <View style={styles.orderStat}>
            <View style={[styles.orderStatIcon, { backgroundColor: `${colors.adminWarning}20` }]}>
              <Clock size={20} color={colors.adminWarning} />
            </View>
            <Text style={styles.orderStatValue}>{stats.pendingOrders}</Text>
            <Text style={styles.orderStatLabel}>In Progress</Text>
          </View>
          
          <View style={styles.orderStat}>
            <View style={[styles.orderStatIcon, { backgroundColor: `${colors.adminDanger}20` }]}>
              <XCircle size={20} color={colors.adminDanger} />
            </View>
            <Text style={styles.orderStatValue}>{stats.canceledOrders}</Text>
            <Text style={styles.orderStatLabel}>Canceled</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/admin/orders')}
        >
          <Text style={styles.viewAllButtonText}>View All Orders</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complaints</Text>
        
        <View style={styles.complaintsStats}>
          <View style={styles.complaintStat}>
            <View style={[styles.complaintStatIcon, { backgroundColor: `${colors.adminWarning}20` }]}>
              <AlertTriangle size={20} color={colors.adminWarning} />
            </View>
            <View style={styles.complaintStatContent}>
              <Text style={styles.complaintStatValue}>{stats.pendingComplaints}</Text>
              <Text style={styles.complaintStatLabel}>Pending</Text>
            </View>
          </View>
          
          <View style={styles.complaintStat}>
            <View style={[styles.complaintStatIcon, { backgroundColor: `${colors.adminSuccess}20` }]}>
              <CheckCircle size={20} color={colors.adminSuccess} />
            </View>
            <View style={styles.complaintStatContent}>
              <Text style={styles.complaintStatValue}>{stats.resolvedComplaints}</Text>
              <Text style={styles.complaintStatLabel}>Resolved</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/admin/complaints')}
        >
          <Text style={styles.viewAllButtonText}>Manage Complaints</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/admin/listings')}
          >
            <Tag size={24} color={colors.adminPrimary} />
            <Text style={styles.quickActionText}>Manage Listings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/admin/users')}
          >
            <Users size={24} color={colors.adminPrimary} />
            <Text style={styles.quickActionText}>Manage Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/admin/campaigns')}
          >
            <BarChart3 size={24} color={colors.adminPrimary} />
            <Text style={styles.quickActionText}>Create Campaign</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/admin/messaging')}
          >
            <MessageSquare size={24} color={colors.adminPrimary} />
            <Text style={styles.quickActionText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  statCard: {
    width: width > 768 ? '23%' : '46%', // Using percentage without calc()
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardTitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  statCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  statCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCardPercent: {
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  listingsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listingStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listingStatContent: {
    
  },
  listingStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  listingStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  viewAllButton: {
    backgroundColor: colors.adminPrimary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  viewAllButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  ordersStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  orderStat: {
    alignItems: 'center',
  },
  orderStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  orderStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  complaintsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  complaintStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complaintStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  complaintStatContent: {
    
  },
  complaintStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  complaintStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAction: {
    width: width > 768 ? '23%' : '46%', // Using percentage without calc()
    backgroundColor: `${colors.adminPrimary}10`,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});