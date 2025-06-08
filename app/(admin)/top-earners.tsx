import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  DollarSign, 
  MapPin, 
  Phone, 
  ShoppingBag,
  ChevronRight,
  ArrowUpDown,
  Calendar
} from 'lucide-react-native';
import { TopEarner } from '@/types';
import { mockUsers, mockOrders } from '@/mocks/data';
import colors from '@/constants/colors';

export default function TopEarnersScreen() {
  const router = useRouter();
  
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [filteredEarners, setFilteredEarners] = useState<TopEarner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'earnings' | 'orders'>('earnings');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    loadTopEarners();
  }, [timeRange]);

  useEffect(() => {
    filterAndSortEarners();
  }, [searchQuery, sortBy, sortOrder, topEarners]);

  const loadTopEarners = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate top earners
    const sellerEarnings = new Map<string, { earnings: number, orderCount: number }>();
    
    // Filter orders by time range if needed
    let filteredOrders = [...mockOrders];
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      if (timeRange === 'month') {
        cutoffDate.setMonth(now.getMonth() - 1);
      } else if (timeRange === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      }
      
      filteredOrders = mockOrders.filter(order => 
        new Date(order.createdAt) >= cutoffDate
      );
    }
    
    // Calculate earnings for each seller
    filteredOrders.forEach(order => {
      if (order.status === 'completed') {
        const current = sellerEarnings.get(order.sellerId) || { earnings: 0, orderCount: 0 };
        sellerEarnings.set(order.sellerId, {
          earnings: current.earnings + order.totalPrice,
          orderCount: current.orderCount + 1
        });
      }
    });
    
    // Convert to array and add user details
    const earners: TopEarner[] = Array.from(sellerEarnings.entries())
      .map(([sellerId, data]) => {
        const seller = mockUsers.find(user => user.id === sellerId);
        return {
          id: sellerId,
          name: seller?.name || 'Unknown Seller',
          earnings: data.earnings,
          location: seller?.address || '',
          phone: seller?.phone || '',
          orderCount: data.orderCount
        };
      })
      .sort((a, b) => b.earnings - a.earnings);
    
    setTopEarners(earners);
    setFilteredEarners(earners);
    setIsLoading(false);
  };

  const filterAndSortEarners = () => {
    let result = [...topEarners];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        earner => 
          earner.name.toLowerCase().includes(query) ||
          earner.location.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const factor = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'earnings') {
        return factor * (a.earnings - b.earnings);
      } else {
        return factor * (a.orderCount - b.orderCount);
      }
    });
    
    setFilteredEarners(result);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const renderEarnerItem = ({ item, index }: { item: TopEarner, index: number }) => (
    <TouchableOpacity 
      style={styles.earnerCard}
      onPress={() => router.push(`/admin/user-details/${item.id}`)}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      
      <View style={styles.earnerInfo}>
        <Text style={styles.earnerName}>{item.name}</Text>
        
        <View style={styles.earnerDetails}>
          <View style={styles.earnerDetail}>
            <DollarSign size={16} color={colors.adminAccent} />
            <Text style={styles.earnerDetailText}>₹{item.earnings.toLocaleString()}</Text>
          </View>
          
          <View style={styles.earnerDetail}>
            <ShoppingBag size={16} color={colors.adminSecondary} />
            <Text style={styles.earnerDetailText}>{item.orderCount} orders</Text>
          </View>
        </View>
        
        <View style={styles.earnerLocation}>
          <MapPin size={14} color={colors.textLight} />
          <Text style={styles.earnerLocationText} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <View style={styles.earnerContact}>
          <Phone size={14} color={colors.textLight} />
          <Text style={styles.earnerContactText}>{item.phone}</Text>
        </View>
      </View>
      
      <View style={styles.earnerAction}>
        <ChevronRight size={20} color={colors.adminAccent} />
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
            placeholder="Search top earners..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'all' && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange('all')}
          >
            <Text style={[
              styles.timeRangeButtonText,
              timeRange === 'all' && styles.timeRangeButtonTextActive
            ]}>All Time</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'month' && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[
              styles.timeRangeButtonText,
              timeRange === 'month' && styles.timeRangeButtonTextActive
            ]}>This Month</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === 'week' && styles.timeRangeButtonActive
            ]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={[
              styles.timeRangeButtonText,
              timeRange === 'week' && styles.timeRangeButtonTextActive
            ]}>This Week</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === 'earnings' && styles.sortButtonActive
            ]}
            onPress={() => setSortBy('earnings')}
          >
            <DollarSign size={16} color={sortBy === 'earnings' ? colors.white : colors.text} />
            <Text style={[
              styles.sortButtonText,
              sortBy === 'earnings' && styles.sortButtonTextActive
            ]}>Earnings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === 'orders' && styles.sortButtonActive
            ]}
            onPress={() => setSortBy('orders')}
          >
            <ShoppingBag size={16} color={sortBy === 'orders' ? colors.white : colors.text} />
            <Text style={[
              styles.sortButtonText,
              sortBy === 'orders' && styles.sortButtonTextActive
            ]}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={toggleSortOrder}
          >
            <ArrowUpDown size={16} color={colors.text} />
            <Text style={styles.sortOrderButtonText}>
              {sortOrder === 'desc' ? 'Desc' : 'Asc'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.adminAccent} />
          <Text style={styles.loadingText}>Loading top earners...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEarners}
          renderItem={renderEarnerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No earners found</Text>
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
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  timeRangeButtonActive: {
    backgroundColor: colors.adminAccent,
  },
  timeRangeButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  timeRangeButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: colors.adminAccent,
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  sortButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  sortOrderButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
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
  earnerCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.adminAccent,
  },
  earnerInfo: {
    flex: 1,
  },
  earnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  earnerDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  earnerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  earnerDetailText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 4,
  },
  earnerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  earnerLocationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
    flex: 1,
  },
  earnerContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnerContactText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  earnerAction: {
    justifyContent: 'center',
    padding: 8,
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