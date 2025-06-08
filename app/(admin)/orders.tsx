import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  Search, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign
} from 'lucide-react-native';
import { mockOrders } from '@/mocks/data';
import { Order, OrderStatus } from '@/types';
import colors from '@/constants/colors';

export default function ManageOrders() {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'canceled'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, filter, orders]);

  const loadOrders = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
    setIsLoading(false);
  };

  const filterOrders = () => {
    let result = [...orders];
    
    // Apply filter
    if (filter === 'pending') {
      result = result.filter(order => 
        ['pending', 'accepted', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered'].includes(order.status)
      );
    } else if (filter === 'completed') {
      result = result.filter(order => order.status === 'completed');
    } else if (filter === 'canceled') {
      result = result.filter(order => order.status === 'canceled');
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        order => 
          order.id.toLowerCase().includes(query) ||
          order.listingSnapshot.dishName.toLowerCase().includes(query) ||
          order.listingSnapshot.sellerName.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredOrders(result);
  };

  const handleOrderAction = (order: Order, action: 'view' | 'complete' | 'refund') => {
    if (action === 'view') {
      router.push(`/admin/order-details/${order.id}`);
    } else if (action === 'complete') {
      Alert.alert(
        "Complete Order",
        `Are you sure you want to mark order #${order.id} as completed?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Complete", 
            onPress: () => {
              // In a real app, this would call an API
              const updatedOrders = orders.map(item => {
                if (item.id === order.id) {
                  return {
                    ...item,
                    status: 'completed' as OrderStatus,
                    updatedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString()
                  };
                }
                return item;
              });
              setOrders(updatedOrders);
              Alert.alert("Order Completed", `Order #${order.id} has been marked as completed.`);
            }
          }
        ]
      );
    } else if (action === 'refund') {
      Alert.alert(
        "Refund Order",
        `Are you sure you want to refund order #${order.id}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Refund", 
            style: "destructive",
            onPress: () => {
              // In a real app, this would call an API
              const updatedOrders = orders.map(item => {
                if (item.id === order.id) {
                  return {
                    ...item,
                    status: 'refunded' as OrderStatus,
                    paymentStatus: 'refunded' as const,
                    updatedAt: new Date().toISOString()
                  };
                }
                return item;
              });
              setOrders(updatedOrders);
              Alert.alert("Order Refunded", `Order #${order.id} has been refunded.`);
            }
          }
        ]
      );
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return '#43A047';
      case 'canceled':
      case 'refunded':
        return '#E53935';
      case 'pending':
      case 'accepted':
      case 'confirmed':
      case 'preparing':
      case 'ready':
      case 'in_delivery':
      case 'delivered':
        return '#1976D2';
      case 'refund_requested':
        return '#FF9800';
      default:
        return colors.textLight;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} color="#43A047" />;
      case 'canceled':
      case 'refunded':
        return <XCircle size={16} color="#E53935" />;
      case 'refund_requested':
        return <RefreshCw size={16} color="#FF9800" />;
      default:
        return <Clock size={16} color="#1976D2" />;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleOrderAction(item, 'view')}
    >
      <Image
        source={{ uri: item.listingSnapshot.image }}
        style={styles.orderImage}
        contentFit="cover"
      />
      
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.orderName}>{item.listingSnapshot.dishName}</Text>
        <Text style={styles.orderSeller}>Seller: {item.listingSnapshot.sellerName}</Text>
        
        <View style={styles.orderDetails}>
          <View style={styles.orderPrice}>
            <DollarSign size={16} color={colors.primary} />
            <Text style={styles.orderPriceText}>₹{item.totalPrice}</Text>
          </View>
          
          <View style={[
            styles.orderStatus,
            { backgroundColor: `${getStatusColor(item.status)}20` }
          ]}>
            {getStatusIcon(item.status)}
            <Text style={[
              styles.orderStatusText,
              { color: getStatusColor(item.status) }
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>
        
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
      
      <View style={styles.orderActions}>
        {(item.status !== 'completed' && item.status !== 'refunded' && item.status !== 'canceled') && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]}
            onPress={() => handleOrderAction(item, 'complete')}
          >
            <CheckCircle size={20} color="#43A047" />
          </TouchableOpacity>
        )}
        
        {(item.status !== 'refunded' && item.status !== 'canceled') && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FFEBEE' }]}
            onPress={() => handleOrderAction(item, 'refund')}
          >
            <RefreshCw size={20} color="#E53935" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'all' && styles.filterButtonTextActive
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'pending' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'pending' && styles.filterButtonTextActive
          ]}>Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'completed' && styles.filterButtonTextActive
          ]}>Completed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'canceled' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('canceled')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'canceled' && styles.filterButtonTextActive
          ]}>Canceled</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.border,
  },
  orderInfo: {
    flex: 1,
    padding: 12,
  },
  orderId: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  orderSeller: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderPriceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  orderActions: {
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});