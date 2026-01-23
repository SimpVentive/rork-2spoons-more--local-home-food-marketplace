import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, X, MapPin } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import FoodCard from '@/components/FoodCard';
import { FilterModal } from '@/components/FilterModal';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { FoodListing, FilterOptions } from '@/types';

export default function SearchScreen() {
  const { user } = useAuthStore();
  const { listings, filteredListings, searchListings, fetchListings, isLoading } = useListingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchListings({ ...filters, query: searchQuery });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  const handleListingPress = (listing: FoodListing) => {
    router.push(`/listing/${listing.id}` as any);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cuisineTypes?.length) count++;
    if (filters.foodType && filters.foodType !== 'both') count++;
    if (filters.spiceLevel?.length) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minRating) count++;
    if (filters.maxDistance) count++;
    return count;
  }, [filters]);

  const displayListings = filteredListings.length > 0 ? filteredListings : listings;

  const renderItem = ({ item }: { item: FoodListing }) => (
    <FoodCard
      listing={item}
      onPress={() => handleListingPress(item)}
      userLocation={user?.location}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes, cuisines..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
        onPress={() => setFilterModalVisible(true)}
      >
        <Filter size={20} color={activeFilterCount > 0 ? colors.white : colors.primary} />
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding delicious food...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        title="No dishes found"
        message={searchQuery || activeFilterCount > 0 
          ? "Try adjusting your search or filters"
          : "Be the first to explore our dishes!"}
        buttonTitle={activeFilterCount > 0 ? "Clear Filters" : undefined}
        onButtonPress={activeFilterCount > 0 ? handleClearFilters : undefined}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={displayListings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />
      
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
        userLocation={user?.location}
      />
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${colors.primary}10`,
  },
  activeFiltersText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
});