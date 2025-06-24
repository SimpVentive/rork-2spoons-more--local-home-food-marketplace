import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShoppingBag,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useOrdersStore } from '@/store/orders-store';
import { useListingsStore } from '@/store/listings-store';
import colors from '@/constants/colors';
import { Order } from '@/types';

export default function FinancesScreen() {
  const [activeTab, setActiveTab] = useState<'earned' | 'spent'>('earned');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total: 0, count: 0, average: 0 });

  const { user } = useAuthStore();
  const { fetchOrders, getBuyerOrders, getSellerOrders } = useOrdersStore();
  const { listings, fetchListings } = useListingsStore();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [activeTab, period]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      await fetchOrders();
      await fetchListings();

      const allOrders = activeTab === 'earned'
        ? await getSellerOrders(user.id)
        : await getBuyerOrders(user.id);

      const filteredOrders = filterOrdersByPeriod(allOrders, period);

      setTransactions(filteredOrders);

      const total = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const count = filteredOrders.length;
      const average = count > 0 ? total / count : 0;

      setStats({ total, count, average });
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrdersByPeriod = (orders: Order[], period: 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now && order.status !== 'canceled';
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'pending': return colors.warning;
      case 'canceled': return colors.error;
      default: return colors.textLight;
    }
  };

  const renderTransactionItem = ({ item }: { item: Order }) => {
    const isEarned = item.sellerId === user?.id;
    const listing = listings.find(l => l.id === item.listingId);

    return (
      <TouchableOpacity style={styles.transactionItem} onPress={() => router.push(`/order/${item.id}`)}>
        <View style={styles.transactionIconContainer}>
          {isEarned ? <ArrowUpRight size={20} color={colors.success} /> : <ArrowDownLeft size={20} color={colors.primary} />}
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {listing?.dishName || item.listingSnapshot.dishName}
          </Text>
          <View style={styles.transactionMeta}>
            <View style={styles.transactionMetaItem}>
              <Clock size={12} color={colors.textLight} />
              <Text style={styles.transactionMetaText}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.transactionMetaItem}>
              <ShoppingBag size={12} color={colors.textLight} />
              <Text style={styles.transactionMetaText}>{item.quantity} {item.quantity > 1 ? 'items' : 'item'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, isEarned ? styles.amountEarned : styles.amountSpent]}>
            {isEarned ? '+' : '-'}₹{item.totalPrice}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getOrderStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getOrderStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          {['earned', 'spent'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as 'earned' | 'spent')}
            >
              {(tab === 'earned' ? <TrendingUp size={16} color={activeTab === tab ? colors.white : colors.text} /> : <TrendingDown size={16} color={activeTab === tab ? colors.white : colors.text} />)}
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {['week', 'month', 'year'].map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodOption, period === p && styles.activePeriod]}
            onPress={() => setPeriod(p as 'week' | 'month' | 'year')}
          >
            <Text style={[styles.periodText, period === p && styles.activePeriodText]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>{activeTab === 'earned' ? 'Total Earnings' : 'Total Spent'}</Text>
          <Calendar size={16} color={colors.textLight} />
        </View>
        <Text style={styles.statsAmount}>₹{stats.total.toFixed(2)}</Text>
        <View style={styles.statsDetails}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statValue}>{stats.count}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>₹{stats.average.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <DollarSign size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>No {activeTab === 'earned' ? 'earnings' : 'spending'} in this period</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.white,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  periodOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  activePeriod: {
    backgroundColor: colors.card,
  },
  periodText: {
    fontSize: 14,
    color: colors.textLight,
  },
  activePeriodText: {
    color: colors.text,
    fontWeight: '500',
  },
  statsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  statsAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
  transactionsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionMetaText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  amountEarned: {
    color: colors.success,
  },
  amountSpent: {
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
});