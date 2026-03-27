import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, X, Leaf, Flame, Clock, Star } from 'lucide-react-native';
import { Image } from 'expo-image';

import { useListingsStore } from '@/store/listings-store';
import { FilterModal } from '@/components/FilterModal';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { FoodListing, FilterOptions } from '@/types';
import { ESSENTIAL_CUISINE_TYPES, getExtendedCuisineTypes } from '@/mocks/data';
import { optimizeImageUrl, generatePlaceholder } from '@/utils/imageOptimization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const QUICK_FILTERS = [
  { id: 'all', label: 'All', icon: null },
  { id: 'veg', label: 'Veg', icon: 'leaf' },
  { id: 'nonveg', label: 'Non-Veg', icon: 'flame' },
  { id: 'rating', label: 'Top Rated', icon: 'star' },
  { id: 'new', label: 'New', icon: 'clock' },
] as const;

const ALL_CUISINES = [...ESSENTIAL_CUISINE_TYPES, ...getExtendedCuisineTypes()];

export default function SearchScreen() {

  const { listings, filteredListings, searchListings, fetchListings, isLoading } = useListingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [refreshing, setRefreshing] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const searchFilters: FilterOptions = { ...filters, query: searchQuery };

      if (selectedCuisine) {
        searchFilters.cuisineTypes = [selectedCuisine];
      }

      if (activeQuickFilter === 'veg') {
        searchFilters.foodType = 'vegetarian';
      } else if (activeQuickFilter === 'nonveg') {
        searchFilters.foodType = 'non-vegetarian';
      } else if (activeQuickFilter === 'rating') {
        searchFilters.sortBy = 'rating';
      }

      searchListings(searchFilters);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters, activeQuickFilter, selectedCuisine]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  }, [fetchListings]);

  const handleListingPress = useCallback((listing: FoodListing) => {
    router.push(`/listing/${listing.id}` as any);
  }, [router]);

  const handleApplyFilters = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setActiveQuickFilter('all');
    setSelectedCuisine(null);
  }, []);

  const handleQuickFilter = useCallback((filterId: string) => {
    setActiveQuickFilter(filterId === activeQuickFilter ? 'all' : filterId);
  }, [activeQuickFilter]);

  const handleCuisinePress = useCallback((cuisine: string) => {
    setSelectedCuisine(prev => prev === cuisine ? null : cuisine);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cuisineTypes?.length) count++;
    if (filters.foodType && filters.foodType !== 'both') count++;
    if (filters.spiceLevel?.length) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minRating) count++;
    if (filters.maxDistance) count++;
    if (selectedCuisine) count++;
    if (activeQuickFilter !== 'all') count++;
    return count;
  }, [filters, selectedCuisine, activeQuickFilter]);

  const displayListings = useMemo(() => {
    const source = filteredListings.length > 0 || searchQuery || activeFilterCount > 0
      ? filteredListings
      : listings;

    if (activeQuickFilter === 'new') {
      return [...source].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return source;
  }, [filteredListings, listings, searchQuery, activeFilterCount, activeQuickFilter]);

  const renderQuickFilterIcon = (iconName: string | null, isActive: boolean) => {
    const iconColor = isActive ? colors.white : colors.text;
    const size = 14;
    switch (iconName) {
      case 'leaf': return <Leaf size={size} color={isActive ? colors.white : colors.vegetarian} />;
      case 'flame': return <Flame size={size} color={isActive ? colors.white : colors.nonVegetarian} />;
      case 'star': return <Star size={size} color={isActive ? colors.white : '#FFB800'} />;
      case 'clock': return <Clock size={size} color={iconColor} />;
      default: return null;
    }
  };

  const renderFoodCard = useCallback(({ item, index }: { item: FoodListing; index: number }) => {
    const isLeft = index % 2 === 0;
    const now = new Date();
    const expiryTime = new Date(item.availableUntil);
    const isExpired = now > expiryTime;
    const isSoldOut = item.remainingQuantity <= 0;

    const getTimeRemaining = () => {
      if (isExpired) return 'Expired';
      const diffMs = expiryTime.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHrs > 24) return `${Math.floor(diffHrs / 24)}d left`;
      if (diffHrs > 0) return `${diffHrs}h ${diffMins}m`;
      return `${diffMins}m left`;
    };

    return (
      <TouchableOpacity
        style={[
          styles.foodCard,
          { marginRight: isLeft ? 8 : 0, marginLeft: isLeft ? 0 : 8 },
        ]}
        onPress={() => handleListingPress(item)}
        activeOpacity={0.85}
        testID={`food-card-${item.id}`}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{
              uri: optimizeImageUrl({
                uri: item.image,
                width: 400,
                height: 280,
                quality: 85,
                format: 'webp',
              }),
            }}
            style={styles.cardImage}
            contentFit="cover"
            placeholder={generatePlaceholder(400, 280)}
            transition={200}
            cachePolicy="memory-disk"
          />
          {(isExpired || isSoldOut) && (
            <View style={styles.cardOverlay}>
              <Text style={styles.cardOverlayText}>
                {isExpired ? 'EXPIRED' : 'SOLD OUT'}
              </Text>
            </View>
          )}
          <View style={styles.cardPriceBadge}>
            <Text style={styles.cardPriceText}>₹{item.price}</Text>
          </View>
          <View style={item.isVegetarian ? styles.vegDot : styles.nonVegDot} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.dishName}</Text>

          <View style={styles.cardSellerRow}>
            <Image
              source={{
                uri: optimizeImageUrl({
                  uri: item.sellerImage,
                  width: 32,
                  height: 32,
                  quality: 90,
                  format: 'webp',
                }),
              }}
              style={styles.cardSellerImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Text style={styles.cardSellerName} numberOfLines={1}>{item.sellerName}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardRating}>
              <Star size={11} color="#FFB800" fill="#FFB800" />
              <Text style={styles.cardRatingText}>{item.sellerRating?.toFixed(1) || '0.0'}</Text>
            </View>
            <View style={styles.cardTime}>
              <Clock size={11} color={isExpired ? colors.error : colors.textLight} />
              <Text style={[styles.cardTimeText, isExpired && { color: colors.error }]}>
                {getTimeRemaining()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleListingPress]);

  const renderListHeader = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineScrollContent}
        style={styles.cuisineScroll}
      >
        {ALL_CUISINES.map((cuisine) => {
          const isActive = selectedCuisine === cuisine;
          return (
            <TouchableOpacity
              key={cuisine}
              style={[styles.cuisineChip, isActive && styles.cuisineChipActive]}
              onPress={() => handleCuisinePress(cuisine)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cuisineChipText, isActive && styles.cuisineChipTextActive]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFilterScrollContent}
        style={styles.quickFilterScroll}
      >
        {QUICK_FILTERS.map((filter) => {
          const isActive = activeQuickFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.quickFilterChip, isActive && styles.quickFilterChipActive]}
              onPress={() => handleQuickFilter(filter.id)}
              activeOpacity={0.7}
            >
              {filter.icon && (
                <View style={styles.quickFilterIconWrap}>
                  {renderQuickFilterIcon(filter.icon, isActive)}
                </View>
              )}
              <Text style={[styles.quickFilterText, isActive && styles.quickFilterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </Text>
          <TouchableOpacity onPress={handleClearFilters} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {displayListings.length} {displayListings.length === 1 ? 'dish' : 'dishes'} found
        </Text>
      </View>
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
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <View style={[styles.searchInputContainer, searchFocused && styles.searchInputFocused]}>
            <Search size={20} color={searchFocused ? colors.primary : colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dishes, cuisines, chefs..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              testID="search-input"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={18} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
            testID="filter-button"
          >
            <SlidersHorizontal size={20} color={activeFilterCount > 0 ? colors.white : colors.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayListings}
        renderItem={renderFoodCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchInputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: 10,
    fontWeight: '400' as const,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  filterBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700' as const,
  },
  cuisineScroll: {
    marginTop: 12,
  },
  cuisineScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cuisineChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cuisineChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cuisineChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
  },
  cuisineChipTextActive: {
    color: colors.white,
  },
  quickFilterScroll: {
    marginTop: 10,
  },
  quickFilterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickFilterChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  quickFilterIconWrap: {
    marginRight: 5,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.text,
  },
  quickFilterTextActive: {
    color: colors.white,
  },
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: `${colors.primary}08`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  activeFiltersText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  clearFiltersText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700' as const,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
  gridContent: {
    paddingBottom: 120,
  },
  gridRow: {
    paddingHorizontal: 16,
  },
  foodCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    backgroundColor: colors.border,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardOverlayText: {
    color: colors.white,
    fontWeight: '700' as const,
    fontSize: 12,
    letterSpacing: 1,
  },
  cardPriceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  cardPriceText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  vegDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.vegetarian,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  nonVegDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.nonVegetarian,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  cardSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSellerImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.border,
    marginRight: 6,
  },
  cardSellerName: {
    fontSize: 11,
    color: colors.textLight,
    flex: 1,
    fontWeight: '500' as const,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRatingText: {
    fontSize: 11,
    color: colors.text,
    marginLeft: 3,
    fontWeight: '600' as const,
  },
  cardTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTimeText: {
    fontSize: 10,
    color: colors.textLight,
    marginLeft: 3,
    fontWeight: '500' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textLight,
    fontWeight: '500' as const,
  },
});
