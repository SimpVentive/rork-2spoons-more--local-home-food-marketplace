import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Platform
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
  Utensils,
  Star,
  Bell,
  Settings,
  PieChart,
  Calendar,
  UserCheck,
  UserX,
  FileText,
  Zap
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import { useOrdersStore } from '@/store/orders-store';
import { useComplaintsStore } from '@/store/complaints-store';
import colors from '@/constants/colors';
import { mockAdminDashboardData } from '@/mocks/data';
import { Image } from 'expo-image';
import { Order, FoodListing, Complaint, TopChef } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { listings, fetchListings } = useListingsStore();
  const { orders, fetchOrders } = useOrdersStore();
  const { complaints } = useComplaintsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    newUsersToday: 0,
    newOrdersToday: 0,
    newListingsToday: 0,
    newComplaintsToday: 0,
    totalChefs: 0,
    verifiedChefs: 0,
    pendingChefs: 0,
    averageRating: 0,
    totalBuyers: 0,
    activeUsers: 0,
    revenueGrowth: 8.5,
    userGrowth: 5.2,
    orderGrowth: 3.4,
    complaintGrowth: -2.1,
  });
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentListings, setRecentListings] = useState<FoodListing[]>([]);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [topSellers, setTopSellers] = useState<{
    sellerId: string;
    sellerName: string;
    sellerImage: string;
    orderCount: number;
    revenue: number;
  }[]>([]);
  
  const router = useRouter();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      await fetchListings();
      await fetchOrders();
      
      // Calculate stats
      loadStats();
      
      // Get recent data
      getRecentData();
      
      // Get top sellers
      getTopSellers();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate new items today
    const newOrdersToday = orders.filter(order => new Date(order.createdAt) >= today).length;
    const newListingsToday = listings.filter(listing => new Date(listing.createdAt) >= today).length;
    const newComplaintsToday = complaints.filter(complaint => new Date(complaint.createdAt) >= today).length;
    
    // Calculate chef stats
    const totalChefs = mockAdminDashboardData.topChefs.length;
    const verifiedChefs = mockAdminDashboardData.topChefs.filter(chef => chef.isVerified).length;
    
    // Calculate average rating
    const totalRatings = listings.reduce((sum, listing) => sum + (listing.rating || 0), 0);
    const averageRating = listings.length > 0 ? parseFloat((totalRatings / listings.length).toFixed(1)) : 0;
    
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
      newUsersToday: mockAdminDashboardData.newUsersToday,
      newOrdersToday,
      newListingsToday,
      newComplaintsToday,
      totalChefs,
      verifiedChefs,
      pendingChefs: totalChefs - verifiedChefs,
      averageRating,
      totalBuyers: mockAdminDashboardData.totalBuyers,
      activeUsers: mockAdminDashboardData.activeUsers,
      revenueGrowth: 8.5,
      userGrowth: 5.2,
      orderGrowth: 3.4,
      complaintGrowth: -2.1,
    });
  };
  
  const getRecentData = () => {
    // Get recent orders
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentOrders(sortedOrders.slice(0, 5));
    
    // Get recent listings
    const sortedListings = [...listings].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentListings(sortedListings.slice(0, 5));
    
    // Get recent complaints
    const sortedComplaints = [...complaints].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentComplaints(sortedComplaints.slice(0, 5));
  };
  
  const getTopSellers = () => {
    // Get top sellers based on order count
    const sellerOrderCounts: Record<string, {
      sellerId: string;
      sellerName: string;
      sellerImage: string;
      orderCount: number;
      revenue: number;
    }> = {};
    
    orders.forEach(order => {
      const sellerId = order.sellerId;
      if (!sellerOrderCounts[sellerId]) {
        const sellerImage = order.listingSnapshot.sellerImage || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d";
        sellerOrderCounts[sellerId] = {
          sellerId: order.sellerId,
          sellerName: order.listingSnapshot.sellerName,
          sellerImage: sellerImage,
          orderCount: 0,
          revenue: 0
        };
      }
      
      sellerOrderCounts[sellerId].orderCount += 1;
      sellerOrderCounts[sellerId].revenue += order.totalPrice;
    });
    
    const topSellers = Object.values(sellerOrderCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setTopSellers(topSellers);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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
            {Math.abs(percentChange)}% {isPositive ? 'increase' : 'decrease'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  const RecentActivityItem = ({ 
    title, 
    subtitle, 
    time, 
    icon, 
    color,
    onPress
  }: {
    title: string;
    subtitle: string;
    time: string;
    icon: React.ReactNode;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.activityIcon, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activitySubtitle}>{subtitle}</Text>
      </View>
      
      <Text style={styles.activityTime}>{time}</Text>
    </TouchableOpacity>
  );
  
  const TopSellerItem = ({ 
    seller, 
    index,
    onPress
  }: {
    seller: {
      sellerId: string;
      sellerName: string;
      sellerImage: string;
      orderCount: number;
      revenue: number;
    };
    index: number;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.sellerItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.sellerRank}>#{index + 1}</Text>
      
      <Image
        source={{ uri: seller.sellerImage }}
        style={styles.sellerImage}
        contentFit="cover"
      />
      
      <View style={styles.sellerInfo}>
        <Text style={styles.sellerName}>{seller.sellerName}</Text>
        <Text style={styles.sellerStats}>
          {seller.orderCount} orders • ₹{seller.revenue.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const QuickActionButton = ({
    icon,
    title,
    color,
    onPress
  }: {
    icon: React.ReactNode;
    title: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.quickActionButton, { backgroundColor: `${color}10` }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );
  
  const AlertItem = ({
    title,
    description,
    icon,
    color,
    onPress
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.alertItem, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.alertIcon, { backgroundColor: `${color}20` }]}>
        {icon}
      </View>
      
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.adminPrimary} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
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
      
      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={20} color={colors.adminPrimary} />}
          color={colors.adminPrimary}
          percentChange={stats.userGrowth}
          isPositive={true}
          onPress={() => router.push('/admin/users')}
        />
        
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={20} color={colors.adminSuccess} />}
          color={colors.adminSuccess}
          percentChange={stats.revenueGrowth}
          isPositive={true}
          onPress={() => router.push('/admin/top-earners')}
        />
        
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag size={20} color={colors.adminWarning} />}
          color={colors.adminWarning}
          percentChange={stats.orderGrowth}
          isPositive={true}
          onPress={() => router.push('/admin/orders')}
        />
        
        <StatCard
          title="Complaints"
          value={stats.totalComplaints}
          icon={<MessageSquare size={20} color={colors.adminError} />}
          color={colors.adminError}
          percentChange={stats.complaintGrowth}
          isPositive={false}
          onPress={() => router.push('/admin/complaints')}
        />
      </View>
      
      {/* Today's Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <Calendar size={20} color={colors.adminPrimary} />
        </View>
        
        <View style={styles.todayStats}>
          <View style={styles.todayStat}>
            <View style={[styles.todayStatIcon, { backgroundColor: `${colors.adminPrimary}20` }]}>
              <UserCheck size={20} color={colors.adminPrimary} />
            </View>
            <Text style={styles.todayStatValue}>{stats.newUsersToday}</Text>
            <Text style={styles.todayStatLabel}>New Users</Text>
          </View>
          
          <View style={styles.todayStat}>
            <View style={[styles.todayStatIcon, { backgroundColor: `${colors.adminWarning}20` }]}>
              <ShoppingBag size={20} color={colors.adminWarning} />
            </View>
            <Text style={styles.todayStatValue}>{stats.newOrdersToday}</Text>
            <Text style={styles.todayStatLabel}>New Orders</Text>
          </View>
          
          <View style={styles.todayStat}>
            <View style={[styles.todayStatIcon, { backgroundColor: `${colors.adminSuccess}20` }]}>
              <Tag size={20} color={colors.adminSuccess} />
            </View>
            <Text style={styles.todayStatValue}>{stats.newListingsToday}</Text>
            <Text style={styles.todayStatLabel}>New Listings</Text>
          </View>
          
          <View style={styles.todayStat}>
            <View style={[styles.todayStatIcon, { backgroundColor: `${colors.adminError}20` }]}>
              <AlertTriangle size={20} color={colors.adminError} />
            </View>
            <Text style={styles.todayStatValue}>{stats.newComplaintsToday}</Text>
            <Text style={styles.todayStatLabel}>Complaints</Text>
          </View>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Zap size={20} color={colors.adminPrimary} />
        </View>
        
        <View style={styles.quickActions}>
          <QuickActionButton
            icon={<Tag size={24} color={colors.adminPrimary} />}
            title="Manage Listings"
            color={colors.adminPrimary}
            onPress={() => router.push('/(admin)/listings')}
          />
          
          <QuickActionButton
            icon={<Users size={24} color={colors.adminPrimary} />}
            title="Manage Users"
            color={colors.adminPrimary}
            onPress={() => router.push('/(admin)/users')}
          />
          
          <QuickActionButton
            icon={<ShoppingBag size={24} color={colors.adminPrimary} />}
            title="View Orders"
            color={colors.adminPrimary}
            onPress={() => router.push('/(admin)/orders')}
          />
          
          <QuickActionButton
            icon={<MessageSquare size={24} color={colors.adminPrimary} />}
            title="Handle Complaints"
            color={colors.adminPrimary}
            onPress={() => router.push('/(admin)/complaints')}
          />
          
          <QuickActionButton
            icon={<BarChart3 size={24} color={colors.adminPrimary} />}
            title="Create Campaign"
            color={colors.adminPrimary}
            onPress={() => router.push('/(admin)/campaigns')}
          />
          
          <QuickActionButton
            icon={<Settings size={24} color={colors.adminPrimary} />}
            title="Settings"
            color={colors.adminPrimary}
            onPress={() => router.push('/(admin)/settings')}
          />
        </View>
      </View>
      
      {/* Alerts & Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
          <Bell size={20} color={colors.adminPrimary} />
        </View>
        
        <View style={styles.alerts}>
          {stats.pendingApprovals > 0 && (
            <AlertItem
              title="Pending Approvals"
              description={`${stats.pendingApprovals} listings waiting for your approval`}
              icon={<Clock size={20} color={colors.adminWarning} />}
              color={colors.adminWarning}
              onPress={() => router.push('/(admin)/listings')}
            />
          )}
          
          {stats.pendingComplaints > 0 && (
            <AlertItem
              title="Unresolved Complaints"
              description={`${stats.pendingComplaints} complaints need your attention`}
              icon={<AlertTriangle size={20} color={colors.adminError} />}
              color={colors.adminError}
              onPress={() => router.push('/(admin)/complaints')}
            />
          )}
          
          {stats.pendingChefs > 0 && (
            <AlertItem
              title="Chef Verification Pending"
              description={`${stats.pendingChefs} chefs waiting to be verified`}
              icon={<ChefHat size={20} color={colors.adminPrimary} />}
              color={colors.adminPrimary}
              onPress={() => router.push('/(admin)/users')}
            />
          )}
          
          <AlertItem
            title="Platform Performance"
            description="All systems operational with 99.9% uptime"
            icon={<CheckCircle size={20} color={colors.adminSuccess} />}
            color={colors.adminSuccess}
          />
        </View>
      </View>
      
      {/* Platform Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <PieChart size={20} color={colors.adminPrimary} />
        </View>
        
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Listings</Text>
              <Tag size={18} color={colors.adminPrimary} />
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalListings}</Text>
                <Text style={styles.overviewStatLabel}>Total</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.activeListings}</Text>
                <Text style={styles.overviewStatLabel}>Active</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.pendingApprovals}</Text>
                <Text style={styles.overviewStatLabel}>Pending</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Orders</Text>
              <ShoppingBag size={18} color={colors.adminWarning} />
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.completedOrders}</Text>
                <Text style={styles.overviewStatLabel}>Completed</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.pendingOrders}</Text>
                <Text style={styles.overviewStatLabel}>In Progress</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.canceledOrders}</Text>
                <Text style={styles.overviewStatLabel}>Canceled</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Users</Text>
              <Users size={18} color={colors.adminPrimary} />
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalBuyers}</Text>
                <Text style={styles.overviewStatLabel}>Buyers</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalChefs}</Text>
                <Text style={styles.overviewStatLabel}>Chefs</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.activeUsers}</Text>
                <Text style={styles.overviewStatLabel}>Active</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>Complaints</Text>
              <MessageSquare size={18} color={colors.adminError} />
            </View>
            
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.totalComplaints}</Text>
                <Text style={styles.overviewStatLabel}>Total</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.resolvedComplaints}</Text>
                <Text style={styles.overviewStatLabel}>Resolved</Text>
              </View>
              
              <View style={styles.overviewStat}>
                <Text style={styles.overviewStatValue}>{stats.pendingComplaints}</Text>
                <Text style={styles.overviewStatLabel}>Pending</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Clock size={20} color={colors.adminPrimary} />
        </View>
        
        <View style={styles.activityList}>
          {recentOrders.length > 0 ? (
            recentOrders.slice(0, 3).map((order, index) => (
              <RecentActivityItem
                key={`order-${index}`}
                title={`New Order #${order.id}`}
                subtitle={`${order.listingSnapshot.dishName} by ${order.listingSnapshot.sellerName}`}
                time={formatDate(order.createdAt)}
                icon={<ShoppingBag size={20} color={colors.adminWarning} />}
                color={colors.adminWarning}
                onPress={() => router.push(`/admin/order-details/${order.id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent orders</Text>
          )}
          
          {recentListings.length > 0 ? (
            recentListings.slice(0, 2).map((listing, index) => (
              <RecentActivityItem
                key={`listing-${index}`}
                title={`New Listing: ${listing.dishName}`}
                subtitle={`Added by ${listing.sellerName}`}
                time={formatDate(listing.createdAt)}
                icon={<Tag size={20} color={colors.adminSuccess} />}
                color={colors.adminSuccess}
                onPress={() => router.push(`/admin/listing-details/${listing.id}`)}
              />
            ))
          ) : null}
          
          {recentComplaints.length > 0 ? (
            recentComplaints.slice(0, 2).map((complaint, index) => (
              <RecentActivityItem
                key={`complaint-${index}`}
                title={`New Complaint: ${complaint.title}`}
                subtitle={`${complaint.description.substring(0, 30)}...`}
                time={formatDate(complaint.createdAt)}
                icon={<AlertTriangle size={20} color={colors.adminError} />}
                color={colors.adminError}
                onPress={() => router.push(`/admin/complaint-details/${complaint.id}`)}
              />
            ))
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/admin/activity-log')}
        >
          <Text style={styles.viewAllButtonText}>View All Activity</Text>
        </TouchableOpacity>
      </View>
      
      {/* Top Sellers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performing Chefs</Text>
          <Star size={20} color={colors.adminWarning} />
        </View>
        
        <View style={styles.sellersList}>
          {topSellers.length > 0 ? (
            topSellers.map((seller, index) => (
              <TopSellerItem
                key={`seller-${index}`}
                seller={seller}
                index={index}
                onPress={() => router.push(`/admin/user-details/${seller.sellerId}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No seller data available</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/admin/top-earners')}
        >
          <Text style={styles.viewAllButtonText}>View All Chefs</Text>
        </TouchableOpacity>
      </View>
      
      {/* Platform Health */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Platform Health</Text>
          <FileText size={20} color={colors.adminPrimary} />
        </View>
        
        <View style={styles.healthStats}>
          <View style={styles.healthStat}>
            <View style={[styles.healthStatIcon, { backgroundColor: `${colors.adminSuccess}20` }]}>
              <Star size={20} color={colors.adminSuccess} />
            </View>
            <View style={styles.healthStatContent}>
              <Text style={styles.healthStatValue}>{stats.averageRating}</Text>
              <Text style={styles.healthStatLabel}>Avg. Rating</Text>
            </View>
          </View>
          
          <View style={styles.healthStat}>
            <View style={[styles.healthStatIcon, { backgroundColor: `${colors.adminWarning}20` }]}>
              <Utensils size={20} color={colors.adminWarning} />
            </View>
            <View style={styles.healthStatContent}>
              <Text style={styles.healthStatValue}>{stats.verifiedChefs}</Text>
              <Text style={styles.healthStatLabel}>Verified Chefs</Text>
            </View>
          </View>
          
          <View style={styles.healthStat}>
            <View style={[styles.healthStatIcon, { backgroundColor: `${colors.adminPrimary}20` }]}>
              <TrendingUp size={20} color={colors.adminPrimary} />
            </View>
            <View style={styles.healthStatContent}>
              <Text style={styles.healthStatValue}>99.9%</Text>
              <Text style={styles.healthStatLabel}>Uptime</Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
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
    borderRadius: 12,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayStat: {
    alignItems: 'center',
  },
  todayStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  todayStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickActionButton: {
    width: width > 768 ? '31%' : '46%',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  alerts: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  overviewCard: {
    width: width > 768 ? '23%' : '46%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textLight,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  viewAllButton: {
    backgroundColor: colors.adminPrimary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  viewAllButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  sellersList: {
    gap: 12,
  },
  sellerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  sellerRank: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.adminWarning,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  sellerStats: {
    fontSize: 12,
    color: colors.textLight,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  healthStatContent: {
    
  },
  healthStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  healthStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    padding: 16,
  },
});