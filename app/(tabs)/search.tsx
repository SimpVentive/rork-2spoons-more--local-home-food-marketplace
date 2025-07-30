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
      <View style={styles.welcomeSection}>
        <Text style={styles.headerTitle}>What's cooking in your neighborhood?</Text>
        <Text style={styles.headerSubtitle}>
          Discover delicious homemade meals from local chefs
        </Text>
      </View>
      
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
      
      <View style={styles.dietPreferencesContainer}>
        <TouchableOpacity
          style={[
            styles.dietPreferenceOption,
            foodType === 'both' && styles.activeBothDiet,
          ]}
          onPress={() => {
            setFoodType('both');
            const updatedFilters = { ...activeFilters, foodType: 'both' as const };
            setActiveFilters(updatedFilters);
            searchListings({ ...updatedFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.dietIconContainer}>
            <View style={styles.bothDietIcon}>
              <View style={styles.vegDot} />
              <View style={styles.nonVegDot} />
            </View>
          </View>
          <View style={styles.dietTextContainer}>
            <Text style={[
              styles.dietPreferenceText,
              foodType === 'both' && styles.activeDietText,
            ]}>Both</Text>
            <Text style={[
              styles.dietSubtext,
              foodType === 'both' && styles.activeDietSubtext,
            ]}>All dishes</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.dietPreferenceOption,
            foodType === 'vegetarian' && styles.activeVegDiet,
          ]}
          onPress={() => {
            setFoodType('vegetarian');
            const updatedFilters = { ...activeFilters, foodType: 'vegetarian' as const };
            setActiveFilters(updatedFilters);
            searchListings({ ...updatedFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.dietIconContainer}>
            <Leaf size={20} color={foodType === 'vegetarian' ? colors.white : colors.vegetarian} />
          </View>
          <View style={styles.dietTextContainer}>
            <Text style={[
              styles.dietPreferenceText,
              foodType === 'vegetarian' && styles.activeDietText,
            ]}>Vegetarian</Text>
            <Text style={[
              styles.dietSubtext,
              foodType === 'vegetarian' && styles.activeDietSubtext,
            ]}>Plant-based</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.dietPreferenceOption,
            foodType === 'non-vegetarian' && styles.activeNonVegDiet,
          ]}
          onPress={() => {
            setFoodType('non-vegetarian');
            const updatedFilters = { ...activeFilters, foodType: 'non-vegetarian' as const };
            setActiveFilters(updatedFilters);
            searchListings({ ...updatedFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.dietIconContainer}>
            <Utensils size={20} color={foodType === 'non-vegetarian' ? colors.white : colors.nonVegetarian} />
          </View>
          <View style={styles.dietTextContainer}>
            <Text style={[
              styles.dietPreferenceText,
              foodType === 'non-vegetarian' && styles.activeDietText,
            ]}>Non-Veg</Text>
            <Text style={[
              styles.dietSubtext,
              foodType === 'non-vegetarian' && styles.activeDietSubtext,
            ]}>Meat & seafood</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                category.active && styles.activeCategoryButton,
              ]}
              onPress={() => handleCategorySelect(category.id)}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            >
              <Icon 
                size={16} 
                color={category.active ? colors.white : colors.text} 
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  category.active && styles.activeCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContainer}
      >
        <TouchableOpacity 
          style={styles.quickFilter}
          onPress={() => {
            const newFilters = { ...activeFilters, maxDistance: 3 };
            setActiveFilters(newFilters);
            searchListings({ ...newFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <View style={styles.quickFilterIconContainer}>
            <MapPin size={16} color={colors.primary} />
          </View>
          <Text style={styles.quickFilterText}>Nearby</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickFilter}
          onPress={() => {
            const newFilters: FilterOptions = { 
              ...activeFilters, 
              sortBy: 'availableUntil',
              sortOrder: 'asc'
            };
            setActiveFilters(newFilters);
            searchListings({ ...newFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <View style={styles.quickFilterIconContainer}>
            <Clock size={16} color={colors.primary} />
          </View>
          <Text style={styles.quickFilterText}>Available Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickFilter}
          onPress={() => {
            const newFilters: FilterOptions = { 
              ...activeFilters, 
              availableNow: true
            };
            setActiveFilters(newFilters);
            searchListings({ ...newFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <View style={styles.quickFilterIconContainer}>
            <Calendar size={16} color={colors.primary} />
          </View>
          <Text style={styles.quickFilterText}>Next 2 Hours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickFilter}
          onPress={() => {
            const newFilters: FilterOptions = { 
              ...activeFilters, 
              availableNow: true
            };
            setActiveFilters(newFilters);
            searchListings({ ...newFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <View style={styles.quickFilterIconContainer}>
            <Calendar size={16} color={colors.primary} />
          </View>
          <Text style={styles.quickFilterText}>Today</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.priceFilter}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Text style={styles.priceFilterText}>₹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.priceFilter}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Text style={styles.priceFilterText}>₹₹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.priceFilter}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Text style={styles.priceFilterText}>₹₹₹</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineFiltersContainer}
      >
        {['Indian', 'Chinese', 'Continental', 'Italian', 'Thai', 'Mexican'].map((cuisine) => (
          <TouchableOpacity
            key={cuisine}
            style={styles.cuisineFilter}
            onPress={() => {
              const newFilters = { 
                ...activeFilters, 
                cuisineTypes: [cuisine]
              };
              setActiveFilters(newFilters);
              searchListings({ ...newFilters, query: searchQuery });
            }}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          >
            <Text style={styles.cuisineFilterText}>{cuisine}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.routeFilterButton}
        onPress={() => setRouteSearchModalVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      >
        <View style={styles.routeIconContainer}>
          <Route size={18} color={colors.white} />
        </View>
        <Text style={styles.routeFilterText}>Check on My Route</Text>
        <Navigation size={16} color={colors.white} />
      </TouchableOpacity>
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'} found
        </Text>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setFilterModalVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
    paddingBottom: 140, // Increased padding to avoid tab bar overlap
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginBottom: 8,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  searchContainer: {
    marginBottom: 20,
    zIndex: 1000,
  },
  dietPreferencesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dietPreferenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    width: '31%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  activeBothDiet: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeVegDiet: {
    backgroundColor: colors.vegetarian,
    borderColor: colors.vegetarian,
    shadowColor: colors.vegetarian,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeNonVegDiet: {
    backgroundColor: colors.nonVegetarian,
    borderColor: colors.nonVegetarian,
    shadowColor: colors.nonVegetarian,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dietIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bothDietIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.vegetarian,
    marginRight: 3,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.nonVegetarian,
  },
  dietTextContainer: {
    flex: 1,
  },
  dietPreferenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activeDietText: {
    color: colors.white,
  },
  dietSubtext: {
    fontSize: 10,
    color: colors.textLight,
  },
  activeDietSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoriesContainer: {
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12, // Increased touch target
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    marginRight: 6,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeCategoryText: {
    color: colors.white,
  },
  quickFiltersContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickFilterIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  priceFilter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 50,
  },
  priceFilterText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  cuisineFiltersContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  cuisineFilter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cuisineFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  routeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textLight,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10, // Increased touch target
  },
  sortButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
  },
});