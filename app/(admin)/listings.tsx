import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Filter, 
  Plus, 
  Tag, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Clock, 
  Download,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  AlertTriangle
} from 'lucide-react-native';
import { useListingsStore } from '@/store/listings-store';
import colors from '@/constants/colors';
import { Image } from 'expo-image';
import { FoodListing } from '@/types';

export default function ManageListings() {
  const { 
    listings, 
    fetchListings, 
    toggleListingApproval, 
    toggleListingActive, 
    toggleListingFeatured,
    deleteListing,
    bulkUpdateListings,
    bulkDeleteListings,
    exportListings,
    isLoading
  } = useListingsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredListings, setFilteredListings] = useState<FoodListing[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const router = useRouter();
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchQuery, selectedFilter, sortBy, sortDirection]);
  
  const loadData = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };
  
  const filterAndSortListings = () => {
    let filtered = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.dishName.toLowerCase().includes(query) || 
        listing.sellerName.toLowerCase().includes(query) ||
        (listing.cuisineType && listing.cuisineType.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (selectedFilter === 'active') {
      filtered = filtered.filter(listing => listing.isActive);
    } else if (selectedFilter === 'inactive') {
      filtered = filtered.filter(listing => !listing.isActive);
    } else if (selectedFilter === 'pending') {
      filtered = filtered.filter(listing => !listing.isApproved);
    } else if (selectedFilter === 'approved') {
      filtered = filtered.filter(listing => listing.isApproved);
    } else if (selectedFilter === 'featured') {
      filtered = filtered.filter(listing => listing.isFeatured);
    } else if (selectedFilter === 'vegetarian') {
      filtered = filtered.filter(listing => listing.isVegetarian);
    } else if (selectedFilter === 'non-vegetarian') {
      filtered = filtered.filter(listing => !listing.isVegetarian);
    }
    
    // Apply sorting
    if (sortBy === 'name') {
      filtered.sort((a, b) => {
        const comparison = a.dishName.localeCompare(b.dishName);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const comparison = a.price - b.price;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        const comparison = ratingA - ratingB;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        const comparison = dateA - dateB;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    setFilteredListings(filtered);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };
  
  const handleToggleApproval = async (id: string) => {
    try {
      await toggleListingApproval(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to update approval status');
    }
  };
  
  const handleToggleActive = async (id: string) => {
    try {
      await toggleListingActive(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to update active status');
    }
  };
  
  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleListingFeatured(id);
    } catch (error) {
      Alert.alert('Error', 'Failed to update featured status');
    }
  };
  
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListing(id);
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          }
        }
      ]
    );
  };
  
  const handleSelectListing = (id: string) => {
    if (selectedListings.includes(id)) {
      setSelectedListings(selectedListings.filter(listingId => listingId !== id));
    } else {
      setSelectedListings([...selectedListings, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map(listing => listing.id));
    }
  };
  
  const handleBulkApprove = async () => {
    if (selectedListings.length === 0) {
      Alert.alert('No Listings Selected', 'Please select listings to approve');
      return;
    }
    
    try {
      await bulkUpdateListings(selectedListings, { isApproved: true });
      Alert.alert('Success', `${selectedListings.length} listings approved`);
      setSelectedListings([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to approve listings');
    }
  };
  
  const handleBulkActivate = async () => {
    if (selectedListings.length === 0) {
      Alert.alert('No Listings Selected', 'Please select listings to activate');
      return;
    }
    
    try {
      await bulkUpdateListings(selectedListings, { isActive: true });
      Alert.alert('Success', `${selectedListings.length} listings activated`);
      setSelectedListings([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to activate listings');
    }
  };
  
  const handleBulkDeactivate = async () => {
    if (selectedListings.length === 0) {
      Alert.alert('No Listings Selected', 'Please select listings to deactivate');
      return;
    }
    
    try {
      await bulkUpdateListings(selectedListings, { isActive: false });
      Alert.alert('Success', `${selectedListings.length} listings deactivated`);
      setSelectedListings([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to deactivate listings');
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) {
      Alert.alert('No Listings Selected', 'Please select listings to delete');
      return;
    }
    
    Alert.alert(
      'Delete Listings',
      `Are you sure you want to delete ${selectedListings.length} listings? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await bulkDeleteListings(selectedListings);
              Alert.alert('Success', `${selectedListings.length} listings deleted`);
              setSelectedListings([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listings');
            }
          }
        }
      ]
    );
  };
  
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await exportListings(format);
      
      // In a real app, this would download a file
      // For this demo, we'll show an alert
      Alert.alert('Export Successful', `Listings exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export listings');
    }
  };
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  const ListingItem = ({ listing }: { listing: FoodListing }) => {
    const isSelected = selectedListings.includes(listing.id);
    
    return (
      <View style={[styles.listingItem, isSelected && styles.selectedItem]}>
        <TouchableOpacity 
          style={styles.selectCheckbox}
          onPress={() => handleSelectListing(listing.id)}
        >
          <View style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected
          ]}>
            {isSelected && <CheckCircle size={16} color={colors.white} />}
          </View>
        </TouchableOpacity>
        
        <Image
          source={{ uri: listing.image }}
          style={styles.listingImage}
          contentFit="cover"
        />
        
        <View style={styles.listingDetails}>
          <Text style={styles.listingName}>{listing.dishName}</Text>
          
          <View style={styles.listingMeta}>
            <Text style={styles.listingPrice}>₹{listing.price}</Text>
            <View style={styles.listingTags}>
              <View style={[
                styles.tag, 
                { backgroundColor: listing.isVegetarian ? colors.vegetarian + '20' : colors.nonVegetarian + '20' }
              ]}>
                <Text style={[
                  styles.tagText,
                  { color: listing.isVegetarian ? colors.vegetarian : colors.nonVegetarian }
                ]}>
                  {listing.isVegetarian ? 'Veg' : 'Non-Veg'}
                </Text>
              </View>
              
              {listing.cuisineType && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{listing.cuisineType}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.listingInfo}>
            <Text style={styles.sellerName}>By {listing.sellerName}</Text>
            
            <View style={styles.listingStatsContainer}>
              {listing.rating !== undefined && (
                <View style={styles.statItem}>
                  <Star size={14} color={colors.adminWarning} />
                  <Text style={styles.statText}>{listing.rating.toFixed(1)}</Text>
                </View>
              )}
              
              <View style={styles.statItem}>
                <Clock size={14} color={colors.textLight} />
                <Text style={styles.statText}>
                  {new Date(listing.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statusBadges}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: listing.isApproved ? colors.adminSuccess + '20' : colors.adminError + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: listing.isApproved ? colors.adminSuccess : colors.adminError }
              ]}>
                {listing.isApproved ? 'Approved' : 'Pending'}
              </Text>
            </View>
            
            <View style={[
              styles.statusBadge,
              { backgroundColor: listing.isActive ? colors.adminSuccess + '20' : colors.adminError + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: listing.isActive ? colors.adminSuccess : colors.adminError }
              ]}>
                {listing.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            
            {listing.isFeatured && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: colors.adminWarning + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: colors.adminWarning }
                ]}>
                  Featured
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.listingActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/admin/listing-details/${listing.id}`)}
          >
            <Eye size={20} color={colors.adminPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/admin/edit-listing/${listing.id}`)}
          >
            <Edit size={20} color={colors.adminInfo} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleApproval(listing.id)}
          >
            {listing.isApproved ? (
              <XCircle size={20} color={colors.adminError} />
            ) : (
              <CheckCircle size={20} color={colors.adminSuccess} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleActive(listing.id)}
          >
            {listing.isActive ? (
              <XCircle size={20} color={colors.adminError} />
            ) : (
              <CheckCircle size={20} color={colors.adminSuccess} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleFeatured(listing.id)}
          >
            {listing.isFeatured ? (
              <XCircle size={20} color={colors.adminError} />
            ) : (
              <Star size={20} color={colors.adminWarning} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(listing.id)}
          >
            <Trash2 size={20} color={colors.adminError} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.adminPrimary} />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Listings</Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/admin/add-listing')}
        >
          <Plus size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Listing</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.adminPrimary} />
        </TouchableOpacity>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
          >
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'all' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.activeFilterTabText]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'active' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('active')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'active' && styles.activeFilterTabText]}>
                Active
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'inactive' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('inactive')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'inactive' && styles.activeFilterTabText]}>
                Inactive
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'pending' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('pending')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'pending' && styles.activeFilterTabText]}>
                Pending Approval
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'approved' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('approved')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'approved' && styles.activeFilterTabText]}>
                Approved
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'featured' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('featured')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'featured' && styles.activeFilterTabText]}>
                Featured
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'vegetarian' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('vegetarian')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'vegetarian' && styles.activeFilterTabText]}>
                Vegetarian
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTab, selectedFilter === 'non-vegetarian' && styles.activeFilterTab]}
              onPress={() => setSelectedFilter('non-vegetarian')}
            >
              <Text style={[styles.filterTabText, selectedFilter === 'non-vegetarian' && styles.activeFilterTabText]}>
                Non-Vegetarian
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            
            <View style={styles.sortOptions}>
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'newest' && styles.activeSortOption]}
                onPress={() => setSortBy('newest')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'newest' && styles.activeSortOptionText]}>
                  Date
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'name' && styles.activeSortOption]}
                onPress={() => setSortBy('name')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'name' && styles.activeSortOptionText]}>
                  Name
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'price' && styles.activeSortOption]}
                onPress={() => setSortBy('price')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'price' && styles.activeSortOptionText]}>
                  Price
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sortOption, sortBy === 'rating' && styles.activeSortOption]}
                onPress={() => setSortBy('rating')}
              >
                <Text style={[styles.sortOptionText, sortBy === 'rating' && styles.activeSortOptionText]}>
                  Rating
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.sortDirectionButton}
              onPress={toggleSortDirection}
            >
              {sortDirection === 'asc' ? (
                <ChevronUp size={20} color={colors.adminPrimary} />
              ) : (
                <ChevronDown size={20} color={colors.adminPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.bulkActionsContainer}>
        <TouchableOpacity 
          style={styles.selectAllButton}
          onPress={handleSelectAll}
        >
          <View style={[
            styles.checkbox,
            selectedListings.length === filteredListings.length && filteredListings.length > 0 && styles.checkboxSelected
          ]}>
            {selectedListings.length === filteredListings.length && filteredListings.length > 0 && (
              <CheckCircle size={16} color={colors.white} />
            )}
          </View>
          <Text style={styles.selectAllText}>
            {selectedListings.length === filteredListings.length && filteredListings.length > 0
              ? 'Deselect All'
              : 'Select All'}
          </Text>
        </TouchableOpacity>
        
        {selectedListings.length > 0 && (
          <View style={styles.bulkActions}>
            <TouchableOpacity 
              style={styles.bulkActionButton}
              onPress={handleBulkApprove}
            >
              <CheckCircle size={16} color={colors.adminSuccess} />
              <Text style={styles.bulkActionText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bulkActionButton}
              onPress={handleBulkActivate}
            >
              <CheckCircle size={16} color={colors.adminSuccess} />
              <Text style={styles.bulkActionText}>Activate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bulkActionButton}
              onPress={handleBulkDeactivate}
            >
              <XCircle size={16} color={colors.adminError} />
              <Text style={styles.bulkActionText}>Deactivate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bulkActionButton}
              onPress={handleBulkDelete}
            >
              <Trash2 size={16} color={colors.adminError} />
              <Text style={styles.bulkActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.exportButtons}>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => handleExport('csv')}
          >
            <FileText size={16} color={colors.adminPrimary} />
            <Text style={styles.exportButtonText}>CSV</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => handleExport('json')}
          >
            <FileText size={16} color={colors.adminPrimary} />
            <Text style={styles.exportButtonText}>JSON</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.listingStats}>
        <Text style={styles.listingCount}>
          {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
        </Text>
        
        {selectedListings.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedListings.length} selected
          </Text>
        )}
      </View>
      
      <ScrollView
        style={styles.listingsContainer}
        contentContainerStyle={styles.listingsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredListings.length > 0 ? (
          filteredListings.map(listing => (
            <ListingItem key={listing.id} listing={listing} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>No listings found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Add your first listing to get started'}
            </Text>
            
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/admin/add-listing')}
              >
                <Plus size={20} color={colors.white} />
                <Text style={styles.emptyStateButtonText}>Add Listing</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.adminPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: colors.text,
  },
  filterButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  filterTabs: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeFilterTab: {
    backgroundColor: colors.adminPrimary,
  },
  filterTabText: {
    color: colors.textLight,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: colors.white,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginRight: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    flex: 1,
  },
  sortOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeSortOption: {
    backgroundColor: colors.adminPrimary + '20',
  },
  sortOptionText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: 12,
  },
  activeSortOptionText: {
    color: colors.adminPrimary,
  },
  sortDirectionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.adminPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: colors.adminPrimary,
    borderColor: colors.adminPrimary,
  },
  selectAllText: {
    color: colors.text,
    fontWeight: '500',
  },
  bulkActions: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  bulkActionText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
  },
  exportButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: colors.card,
    marginLeft: 8,
  },
  exportButtonText: {
    color: colors.adminPrimary,
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
  },
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listingCount: {
    color: colors.textLight,
    fontSize: 14,
  },
  selectedCount: {
    color: colors.adminPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  listingsContainer: {
    flex: 1,
  },
  listingsContent: {
    padding: 16,
  },
  listingItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: colors.adminPrimary,
  },
  selectCheckbox: {
    justifyContent: 'center',
    marginRight: 12,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listingDetails: {
    flex: 1,
    marginLeft: 12,
  },
  listingName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.adminPrimary,
    marginRight: 8,
  },
  listingTags: {
    flexDirection: 'row',
  },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.card,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: colors.textLight,
  },
  listingInfo: {
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  listingStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  statusBadges: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  listingActions: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.card,
    marginBottom: 8,
    marginRight: Platform.OS === 'web' ? 8 : 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.adminPrimary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});