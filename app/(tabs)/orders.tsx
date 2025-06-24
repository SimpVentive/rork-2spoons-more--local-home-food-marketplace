import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useOrdersStore } from '@/store/orders-store';
import OrderCard from '@/components/OrderCard';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { Order } from '@/types';

export default function OrdersScreen() {
  const { user } = useAuthStore();
  const {
    getBuyerOrders,
    getSellerOrders,
    isLoading,
  } = useOrdersStore();

  const [buyingOrders, setBuyingOrders] = useState<Order[]>([]);
  const [sellingOrders, setSellingOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchOrders = async () => {
    if (user) {
      try {
        const buyerOrders = await getBuyerOrders(user.id);
        const sellerOrders = await getSellerOrders(user.id);
        setBuyingOrders(buyerOrders);
        setSellingOrders(sellerOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    router.push(`/order/${order.id}`);
  };

  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view your orders"
        image="https://images.unsplash.com/photo-1594708053019-5c77bf8a8ee5"
        buttonTitle="Log In"
        onButtonPress={() => router.push('/(auth)')}
      />
    );
  }

  const displayOrders = activeTab === 'buying' ? buyingOrders : sellingOrders;

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'buying' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('buying')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'buying' && styles.activeTabText,
            ]}
          >
            Orders Placed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'selling' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('selling')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'selling' && styles.activeTabText,
            ]}
          >
            Orders Received
          </Text>
        </TouchableOpacity>
      </View>

      {displayOrders.length === 0 ? (
        <EmptyState
          title={`No ${activeTab === 'buying' ? 'orders placed' : 'orders received'} yet`}
          message={
            activeTab === 'buying'
              ? "You haven't placed any orders yet"
              : "You haven't received any orders yet"
          }
          image="https://images.unsplash.com/photo-1594708053019-5c77bf8a8ee5"
          buttonTitle={activeTab === 'buying' ? 'Browse Food' : 'Create Listing'}
          onButtonPress={() =>
            activeTab === 'buying'
              ? router.push('/(tabs)')
              : router.push('/create-listing')
          }
        />
      ) : (
        <FlatList
          data={displayOrders}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleOrderPress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    padding: 16,
  },
});
