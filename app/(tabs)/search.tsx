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
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Explore Homemade Food</Text>
      <Text style={styles.headerSubtitle}>
        I am looking for...
      </Text>
      
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search for dishes, cuisines, or chefs..."
          value={searchQuery}
          onChangeText={handleSearch}
          onFilterPress={() => setFilterModalVisible(true)}
        />
      </View>
      
      <View style={styles.foodTypeContainer}>
        <TouchableOpacity
          style={[
            styles.foodTypeOption,
            foodType === 'both' && styles.activeFoodTypeOption,
          ]}
          onPress={() => {
            setFoodType('both');
            const updatedFilters = { ...activeFilters, foodType: 'both' as const };
            setActiveFilters(updatedFilters);
            searchListings({ ...updatedFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.foodTypeIcon}>
            <View style={styles.bothFoodIcon}>
              <View style={styles.vegDot} />
              <View style={styles.nonVegDot} />
            </View>
          </View>
          <Text style={styles.foodTypeText}>Both</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.foodTypeOption,
            foodType === 'vegetarian' && styles.vegFoodTypeOption,
          ]}
          onPress={() => {
            setFoodType('vegetarian');
            const updatedFilters = { ...activeFilters, foodType: 'vegetarian' as const };
            setActiveFilters(updatedFilters);
            searchListings({ ...updatedFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.foodTypeIcon}>
            <Leaf size={16} color={foodType === 'vegetarian' ? colors.white : colors.vegetarian} />
          </View>
          <Text 
            style={[
              styles.foodTypeText,
              foodType === 'vegetarian' && styles.vegFoodTypeText,
            ]}
            numberOfLines={1}
          >
            Veg
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.foodTypeOption,
            foodType === 'non-vegetarian' && styles.nonVegFoodTypeOption,
          ]}
          onPress={() => {
            setFoodType('non-vegetarian');
            const updatedFilters = { ...activeFilters, foodType: 'non-vegetarian' as const };
            setActiveFilters(updatedFilters);
            searchListings({ ...updatedFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.foodTypeIcon}>
            <Utensils size={16} color={foodType === 'non-vegetarian' ? colors.white : colors.nonVegetarian} />
          </View>
          <Text 
            style={[
              styles.foodTypeText,
              foodType === 'non-vegetarian' && styles.nonVegFoodTypeText,
            ]}
            numberOfLines={1}
          >
            Non-Veg
          </Text>
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
      
      <View style={styles.quickFilters}>
        <TouchableOpacity 
          style={styles.quickFilter}
          onPress={() => {
            const newFilters = { ...activeFilters, maxDistance: 3 };
            setActiveFilters(newFilters);
            searchListings({ ...newFilters, query: searchQuery });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <MapPin size={16} color={colors.primary} />
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
          <Clock size={16} color={colors.primary} />
          <Text style={styles.quickFilterText}>Ending Soon</Text>
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
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.quickFilterText}>Available Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.routeFilterButton}
          onPress={() => setRouteSearchModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Route size={16} color={colors.white} />
          <Text style={styles.routeFilterText}>Check on My Route</Text>
        </TouchableOpacity>
      </View>
      
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
    paddingBottom: 120, // Increased padding to avoid tab bar overlap
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  foodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  foodTypeOption: {
    alignItems: 'center',
    paddingVertical: 12, // Increased touch target
    paddingHorizontal: 12, // Increased touch target
    borderRadius: 8,
    backgroundColor: colors.card,
    width: '31%',
  },
  activeFoodTypeOption: {
    backgroundColor: colors.primary,
  },
  vegFoodTypeOption: {
    backgroundColor: colors.vegetarian,
  },
  nonVegFoodTypeOption: {
    backgroundColor: colors.nonVegetarian,
  },
  foodTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bothFoodIcon: {
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
  foodTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  vegFoodTypeText: {
    color: colors.white,
  },
  nonVegFoodTypeText: {
    color: colors.white,
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
  quickFilters: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  quickFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12, // Increased touch target
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  quickFilterText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
  },
  routeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12, // Increased touch target
    borderRadius: 16,
    backgroundColor: colors.secondary,
    marginLeft: 'auto',
  },
  routeFilterText: {
    fontSize: 14,
    color: colors.white,
    marginLeft: 6,
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