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
  const { orders, getBuyerOrders, getSellerOrders, isLoading } = useOrdersStore();
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  
  const buyingOrders = user ? getBuyerOrders(user.id) : [];
  const sellingOrders = user ? getSellerOrders(user.id) : [];
  
  const displayOrders = activeTab === 'buying' ? buyingOrders : sellingOrders;
  
  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would fetch the latest orders from the server
    // For now, we'll just simulate a delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleOrderPress = (order: Order) => {
    router.push(`/order/${order.id}` as any);
  };
  
  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view your orders"
        image="https://images.unsplash.com/photo-1594708053019-5c77bf8a8ee5"
        buttonTitle="Log In"
        onButtonPress={() => router.push('/(auth)' as any)}
      />
    );
  }
  
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
              ? router.push('/(tabs)/home' as any) 
              : router.push('/create-listing' as any)
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