import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Filter, 
  Clock, 
  MapPin, 
  Leaf, 
  Utensils,
  Bell,
  TrendingUp,
  Users,
  Calendar,
  Route,
  Navigation,
} from 'lucide-react-native';
import { useListingsStore } from '@/store/listings-store';
import { useAuthStore } from '@/store/auth-store';
import { FoodCard } from '@/components/FoodCard';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { FilterModal } from '@/components/FilterModal';
import { NotifyMeModal } from '@/components/NotifyMeModal';
import { RouteSearchModal } from '@/components/RouteSearchModal';
import { BackgroundPattern } from '@/components/BackgroundPattern';
import colors from '@/constants/colors';
import { FoodListing, FilterOptions, RouteSearchParams } from '@/types';

export default function SearchScreen() {
  const { user } = useAuthStore();
  const { 
    filteredListings, 
    fetchListings, 
    searchListings, 
    searchListingsOnRoute,
    isLoading 
  } = useListingsStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [routeSearchModalVisible, setRouteSearchModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [foodType, setFoodType] = useState<'vegetarian' | 'non-vegetarian' | 'both'>('both');
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All', active: true, icon: TrendingUp },
    { id: 'nearby', name: 'Nearby', active: false, icon: MapPin },
    { id: 'vegetarian', name: 'Veg', active: false, icon: Leaf },
    { id: 'non-vegetarian', name: 'Non-Veg', active: false, icon: Utensils },
    { id: 'trending', name: 'Trending', active: false, icon: TrendingUp },
    { id: 'new', name: 'New', active: false, icon: Clock },
    { id: 'available', name: 'Available Now', active: false, icon: Calendar },
    { id: 'servings', name: 'Family Size', active: false, icon: Users },
    { id: 'route', name: 'On My Route', active: false, icon: Route },
  ]);
  
  const router = useRouter();
  
  useEffect(() => {
    fetchListings();
  }, []);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchListings({ ...activeFilters, query: text });
  };
  
  const handleFilterApply = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setFoodType(filters.foodType || 'both');
    
    // Combine search query with filters
    searchListings({ ...filters, query: searchQuery });
  };
  
  const handleRouteSearchApply = (params: RouteSearchParams) => {
    // Update category selection
    const updatedCategories = categories.map(cat => ({
      ...cat,
      active: cat.id === 'route',
    }));
    setCategories(updatedCategories);
    
    // Call the route-based search function
    searchListingsOnRoute(params);
    
    setRouteSearchModalVisible(false);
  };
  
  const handleCategorySelect = (categoryId: string) => {
    const updatedCategories = categories.map(cat => ({
      ...cat,
      active: cat.id === categoryId,
    }));
    setCategories(updatedCategories);
    
    // Apply category-specific filters
    let filters: FilterOptions = { ...activeFilters };
    let newFoodType: 'vegetarian' | 'non-vegetarian' | 'both' = foodType;
    
    if (categoryId === 'vegetarian') {
      filters.foodType = 'vegetarian';
      newFoodType = 'vegetarian';
    } else if (categoryId === 'non-vegetarian') {
      filters.foodType = 'non-vegetarian';
      newFoodType = 'non-vegetarian';
    } else if (categoryId === 'nearby') {
      filters.maxDistance = 3; // 3km radius
    } else if (categoryId === 'available') {
      filters.availableNow = true;
    } else if (categoryId === 'servings') {
      filters.minServings = 4; // Family size (4+ servings)
    } else if (categoryId === 'route') {
      // Open route search modal
      setRouteSearchModalVisible(true);
      return;
    } else if (categoryId === 'all') {
      filters = {}; // Reset filters
      newFoodType = 'both';
    }
    
    setActiveFilters(filters);
    setFoodType(newFoodType);
    
    // Apply search with filters
    searchListings({ ...filters, query: searchQuery });
  };
  
  const handleListingPress = (listing: FoodListing) => {
    router.push(`/listing/${listing.id}`);
  };
  
  const handleNotifyMe = () => {
    setNotifyModalVisible(true);
  };
  
  const handleVoiceSearch = () => {
    // Placeholder for voice search functionality
    console.log('Voice search activated');
    // In a real app, you would implement speech-to-text here
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar - Top Priority */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="What's cooking in your neighborhood?"
          value={searchQuery}
          onChangeText={handleSearch}
          onFilterPress={() => setFilterModalVisible(true)}
          onVoiceSearch={handleVoiceSearch}
          isLarge={true}
          showSuggestions={true}
        />
      </View>
      
      {/* Diet Preference Cards - Horizontal Layout */}
      <View style={styles.dietSection}>
        <Text style={styles.sectionTitle}>Diet Preference</Text>
        <View style={styles.dietPreferencesContainer}>
          <TouchableOpacity
            style={[
              styles.dietCard,
              foodType === 'both' && styles.activeBothDiet,
            ]}
            onPress={() => {
              setFoodType('both');
              const updatedFilters = { ...activeFilters, foodType: 'both' as const };
              setActiveFilters(updatedFilters);
              searchListings({ ...updatedFilters, query: searchQuery });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.dietIconWrapper}>
              <View style={styles.bothDietIcon}>
                <View style={styles.vegDot} />
                <View style={styles.nonVegDot} />
              </View>
            </View>
            <Text style={[
              styles.dietCardText,
              foodType === 'both' && styles.activeDietCardText,
            ]}>Both</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.dietCard,
              foodType === 'vegetarian' && styles.activeVegDiet,
            ]}
            onPress={() => {
              setFoodType('vegetarian');
              const updatedFilters = { ...activeFilters, foodType: 'vegetarian' as const };
              setActiveFilters(updatedFilters);
              searchListings({ ...updatedFilters, query: searchQuery });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.dietIconWrapper}>
              <Leaf size={24} color={foodType === 'vegetarian' ? colors.white : colors.vegetarian} />
            </View>
            <Text style={[
              styles.dietCardText,
              foodType === 'vegetarian' && styles.activeDietCardText,
            ]}>Vegetarian</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.dietCard,
              foodType === 'non-vegetarian' && styles.activeNonVegDiet,
            ]}
            onPress={() => {
              setFoodType('non-vegetarian');
              const updatedFilters = { ...activeFilters, foodType: 'non-vegetarian' as const };
              setActiveFilters(updatedFilters);
              searchListings({ ...updatedFilters, query: searchQuery });
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.dietIconWrapper}>
              <Utensils size={24} color={foodType === 'non-vegetarian' ? colors.white : colors.nonVegetarian} />
            </View>
            <Text style={[
              styles.dietCardText,
              foodType === 'non-vegetarian' && styles.activeDietCardText,
            ]}>Non-Veg</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Quick Filters Section */}
      <View style={styles.filtersSection}>
        <Text style={styles.sectionTitle}>Quick Filters</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFiltersContainer}
        >
          <TouchableOpacity 
            style={[
              styles.quickFilterPill,
              activeFilters.maxDistance && styles.activeQuickFilter
            ]}
            onPress={() => {
              const newFilters = { ...activeFilters, maxDistance: 3 };
              setActiveFilters(newFilters);
              searchListings({ ...newFilters, query: searchQuery });
            }}
          >
            <MapPin size={16} color={activeFilters.maxDistance ? colors.white : colors.primary} />
            <Text style={[
              styles.quickFilterText,
              activeFilters.maxDistance && styles.activeQuickFilterText
            ]}>Nearby</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.quickFilterPill,
              activeFilters.availableNow && styles.activeQuickFilter
            ]}
            onPress={() => {
              const newFilters: FilterOptions = { 
                ...activeFilters, 
                availableNow: true
              };
              setActiveFilters(newFilters);
              searchListings({ ...newFilters, query: searchQuery });
            }}
          >
            <Clock size={16} color={activeFilters.availableNow ? colors.white : colors.primary} />
            <Text style={[
              styles.quickFilterText,
              activeFilters.availableNow && styles.activeQuickFilterText
            ]}>Available Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.priceFilterPill}
          >
            <Text style={styles.priceFilterText}>₹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.priceFilterPill}
          >
            <Text style={styles.priceFilterText}>₹₹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.priceFilterPill}
          >
            <Text style={styles.priceFilterText}>₹₹₹</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Cuisine Categories */}
      <View style={styles.cuisineSection}>
        <View style={styles.cuisineSectionHeader}>
          <Text style={styles.sectionTitle}>Cuisines</Text>
          <Text style={styles.scrollHint}>Scroll for more →</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineFiltersContainer}
        >
          {['Indian', 'Chinese', 'Continental', 'Italian', 'Thai', 'Mexican', 'Japanese', 'Korean'].map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.cuisinePill,
                activeFilters.cuisineTypes?.includes(cuisine) && styles.activeCuisinePill
              ]}
              onPress={() => {
                const newFilters = { 
                  ...activeFilters, 
                  cuisineTypes: [cuisine]
                };
                setActiveFilters(newFilters);
                searchListings({ ...newFilters, query: searchQuery });
              }}
            >
              <Text style={[
                styles.cuisineFilterText,
                activeFilters.cuisineTypes?.includes(cuisine) && styles.activeCuisineText
              ]}>{cuisine}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Route Button */}
      <TouchableOpacity 
        style={styles.routeButton}
        onPress={() => setRouteSearchModalVisible(true)}
      >
        <View style={styles.routeIconContainer}>
          <Route size={20} color={colors.primary} />
        </View>
        <Text style={styles.routeButtonText}>Check on My Route</Text>
        <Navigation size={16} color={colors.primary} />
      </TouchableOpacity>
      
      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'} found
        </Text>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={16} color={colors.primary} />
          <Text style={styles.sortButtonText}>
            {activeFilters.cuisineTypes && activeFilters.cuisineTypes.length > 0 
              ? `${activeFilters.cuisineTypes.length} filters` 
              : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderEmptyComponent = () => (
    <EmptyState
      title="No Results Found"
      message={
        searchQuery 
          ? `We couldn't find any results for "${searchQuery}"`
          : "Try adjusting your filters or search for something else"
      }
      icon={<Bell size={48} color={colors.textLight} />}
      buttonTitle="Notify Me When Available"
      onButtonPress={handleNotifyMe}
    />
  );
  
  return (
    <View style={styles.container}>
      <BackgroundPattern opacity={0.02} />
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Check if listing is expired
          const isExpired = new Date(item.availableUntil) < new Date();
          const isSoldOut = item.remainingQuantity <= 0;
          
          return (
            <View style={styles.cardWrapper}>
              <FoodCard 
                listing={item} 
                onPress={handleListingPress}
                isExpired={isExpired}
                isSoldOut={isSoldOut}
              />
            </View>
          );
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
      />
      
      <NotifyMeModal
        visible={notifyModalVisible}
        onClose={() => setNotifyModalVisible(false)}
        initialDishName={searchQuery}
      />
      
      <RouteSearchModal
        visible={routeSearchModalVisible}
        onClose={() => setRouteSearchModalVisible(false)}
        onApply={handleRouteSearchApply}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Search Container
  searchContainer: {
    marginBottom: 20,
    zIndex: 1000,
  },
  
  // Section Styling
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  
  // Diet Section
  dietSection: {
    marginBottom: 24,
  },
  dietPreferencesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dietCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  activeBothDiet: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  activeVegDiet: {
    backgroundColor: colors.vegetarian,
    borderColor: colors.vegetarian,
    shadowColor: colors.vegetarian,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  activeNonVegDiet: {
    backgroundColor: colors.nonVegetarian,
    borderColor: colors.nonVegetarian,
    shadowColor: colors.nonVegetarian,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  dietIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bothDietIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.vegetarian,
    marginRight: 4,
  },
  nonVegDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.nonVegetarian,
  },
  dietCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  activeDietCardText: {
    color: colors.white,
  },
  
  // Filters Section
  filtersSection: {
    marginBottom: 20,
  },
  quickFiltersContainer: {
    paddingHorizontal: 0,
    gap: 8,
  },
  quickFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activeQuickFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 6,
  },
  activeQuickFilterText: {
    color: colors.white,
  },
  priceFilterPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 48,
  },
  priceFilterText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  
  // Cuisine Section
  cuisineSection: {
    marginBottom: 20,
  },
  cuisineSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scrollHint: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  cuisineFiltersContainer: {
    paddingHorizontal: 0,
    gap: 8,
  },
  cuisinePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activeCuisinePill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cuisineFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  activeCuisineText: {
    color: colors.white,
  },
  
  // Route Button
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  routeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  
  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // Card Wrapper
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
  },
});