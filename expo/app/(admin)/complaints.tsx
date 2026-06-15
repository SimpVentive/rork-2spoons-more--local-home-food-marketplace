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
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageCircle,
  User,
  ShoppingBag,
  CreditCard,
  Settings,
  HelpCircle
} from 'lucide-react-native';
import { Complaint } from '@/types';
import { useComplaintsStore } from '@/store/complaints-store';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function ManageComplaints() {
  const router = useRouter();
  const { complaints: storeComplaints, fetchComplaints } = useComplaintsStore();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved' | 'closed'>('all');

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [searchQuery, filter, complaints]);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      await fetchComplaints();
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync store data to local state whenever it changes
  useEffect(() => {
    setComplaints(storeComplaints);
    setFilteredComplaints(storeComplaints);
  }, [storeComplaints]);

  const filterComplaints = () => {
    let result = [...complaints];
    
    // Apply filter
    if (filter !== 'all') {
      result = result.filter(complaint => complaint.status === filter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        complaint => 
          complaint.title.toLowerCase().includes(query) ||
          complaint.description.toLowerCase().includes(query) ||
          complaint.id.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredComplaints(result);
  };

  const handleComplaintAction = (complaint: Complaint, action: 'view' | 'resolve' | 'close') => {
    if (action === 'view') {
      router.push(`/admin/complaint-details/${complaint.id}` as any);
    } else if (action === 'resolve') {
      Alert.alert(
        "Resolve Complaint",
        "Enter resolution details:",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Resolve", 
            onPress: () => {
              // In a real app, this would include a text input for resolution details
              const updatedComplaints = complaints.map(item => {
                if (item.id === complaint.id) {
                  return {
                    ...item,
                    status: 'resolved' as const,
                    resolution: 'Issue resolved by admin.',
                    updatedAt: new Date().toISOString()
                  };
                }
                return item;
              });
              setComplaints(updatedComplaints);
              Alert.alert("Complaint Resolved", `Complaint #${complaint.id} has been resolved.`);
            }
          }
        ]
      );
    } else if (action === 'close') {
      Alert.alert(
        "Close Complaint",
        `Are you sure you want to close complaint #${complaint.id}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Close", 
            onPress: () => {
              const updatedComplaints = complaints.map(item => {
                if (item.id === complaint.id) {
                  return {
                    ...item,
                    status: 'closed' as const,
                    updatedAt: new Date().toISOString()
                  };
                }
                return item;
              });
              setComplaints(updatedComplaints);
              Alert.alert("Complaint Closed", `Complaint #${complaint.id} has been closed.`);
            }
          }
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return '#43A047';
      case 'closed':
        return '#9E9E9E';
      case 'investigating':
        return '#1976D2';
      case 'pending':
        return '#FF9800';
      default:
        return colors.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={16} color="#43A047" />;
      case 'closed':
        return <CheckCircle size={16} color="#9E9E9E" />;
      case 'investigating':
        return <Clock size={16} color="#1976D2" />;
      case 'pending':
        return <AlertTriangle size={16} color="#FF9800" />;
      default:
        return <HelpCircle size={16} color={colors.textLight} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={16} color="#1976D2" />;
      case 'user':
        return <User size={16} color="#9C27B0" />;
      case 'payment':
        return <CreditCard size={16} color="#FF9800" />;
      case 'other':
        return <Settings size={16} color="#43A047" />;
      default:
        return <HelpCircle size={16} color={colors.textLight} />;
    }
  };

  const renderComplaintItem = ({ item }: { item: Complaint }) => (
    <TouchableOpacity 
      style={styles.complaintCard}
      onPress={() => handleComplaintAction(item, 'view')}
    >
      <View style={styles.complaintHeader}>
        <View style={styles.complaintType}>
          {getTypeIcon(item.type)}
          <Text style={styles.complaintTypeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        
        <View style={[
          styles.complaintStatus,
          { backgroundColor: `${getStatusColor(item.status)}20` }
        ]}>
          {getStatusIcon(item.status)}
          <Text style={[
            styles.complaintStatusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.complaintTitle}>{item.title}</Text>
      <Text style={styles.complaintDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.complaintFooter}>
        <Text style={styles.complaintDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        <View style={styles.complaintActions}>
          {(item.status === 'pending' || item.status === 'investigating') && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]}
              onPress={() => handleComplaintAction(item, 'resolve')}
            >
              <CheckCircle size={16} color="#43A047" />
              <Text style={[styles.actionButtonText, { color: '#43A047' }]}>Resolve</Text>
            </TouchableOpacity>
          )}
          
          {(item.status === 'pending' || item.status === 'investigating') && (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#EEEEEE' }]}
              onPress={() => handleComplaintAction(item, 'close')}
            >
              <Clock size={16} color="#757575" />
              <Text style={[styles.actionButtonText, { color: '#757575' }]}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
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
            placeholder="Search complaints..."
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
            filter === 'investigating' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('investigating')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'investigating' && styles.filterButtonTextActive
          ]}>Investigating</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'resolved' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('resolved')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'resolved' && styles.filterButtonTextActive
          ]}>Resolved</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          renderItem={renderComplaintItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No complaints found</Text>
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
  complaintCard: {
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
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  complaintType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complaintTypeText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  complaintStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  complaintStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  complaintDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  complaintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  complaintActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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