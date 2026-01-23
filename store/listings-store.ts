import { create } from 'zustand';
import { mockFoodListings } from '@/mocks/data';
import { FoodListing, FilterOptions, RouteSearchParams } from '@/types';
import { useAuthStore } from './auth-store';

interface ListingsState {
  listings: FoodListing[];
  filteredListings: FoodListing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  searchListings: (options: FilterOptions) => void;
  searchListingsOnRoute: (params: RouteSearchParams) => void;
  addListing: (listing: Omit<FoodListing, 'id' | 'createdAt'>) => Promise<FoodListing>;
  updateListing: (id: string, updates: Partial<FoodListing>) => Promise<FoodListing>;
  updateListingQuantity: (id: string, newQuantity: number) => Promise<void>;
  deleteListing: (id: string) => Promise<boolean>;
  getListing: (id: string) => FoodListing | undefined;
  getListingById: (id: string) => FoodListing | undefined;
  getSellerListings: (sellerId: string) => FoodListing[];
  getTopSellingItems: (limit?: number) => Promise<FoodListing[]>;
  toggleListingApproval: (id: string) => Promise<void>;
  toggleListingActive: (id: string) => Promise<void>;
  toggleListingFeatured: (id: string) => Promise<void>;
  bulkUpdateListings: (ids: string[], updates: Partial<FoodListing>) => Promise<void>;
  bulkDeleteListings: (ids: string[]) => Promise<void>;
  exportListings: (format: 'csv' | 'json') => Promise<string>;
}

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: [],
  filteredListings: [],
  isLoading: false,
  error: null,
  
  fetchListings: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would fetch from an API
      // For demo purposes, we'll use mock data
      set({ 
        listings: mockFoodListings,
        filteredListings: mockFoodListings,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ 
        error: 'Failed to fetch listings. Please try again.',
        isLoading: false 
      });
    }
  },
  
  searchListings: (options: FilterOptions) => {
    const state = get();
    const listings = state.listings || [];
    let filtered = [...listings];
    
    // Apply search query filter
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.dishName.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.cuisineType.toLowerCase().includes(query) ||
        (listing.subcuisineType && listing.subcuisineType.toLowerCase().includes(query)) ||
        listing.sellerName.toLowerCase().includes(query)
      );
    }
    
    // Apply food type filter
    if (options.foodType) {
      if (options.foodType === 'vegetarian') {
        filtered = filtered.filter(listing => listing.isVegetarian);
      } else if (options.foodType === 'non-vegetarian') {
        filtered = filtered.filter(listing => !listing.isVegetarian);
      }
    }
    
    // Apply cuisine type filter
    if (options.cuisineTypes && options.cuisineTypes.length > 0) {
      filtered = filtered.filter(listing => 
        options.cuisineTypes!.includes(listing.cuisineType)
      );
    }
    
    // Apply subcuisine type filter
    if (options.subcuisineTypes && options.subcuisineTypes.length > 0) {
      filtered = filtered.filter(listing => 
        listing.subcuisineType && options.subcuisineTypes!.includes(listing.subcuisineType)
      );
    }
    
    // Apply price range filter
    if (options.minPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price <= options.maxPrice!);
    }
    
    // Apply rating filter
    if (options.minRating !== undefined) {
      filtered = filtered.filter(listing => 
        (listing.rating || 0) >= options.minRating!
      );
    }
    
    // Apply distance filter
    if (options.maxDistance !== undefined && options.userLocation) {
      filtered = filtered.filter(listing => {
        const distance = calculateDistance(
          options.userLocation!.latitude,
          options.userLocation!.longitude,
          listing.location.latitude,
          listing.location.longitude
        );
        return distance <= options.maxDistance!;
      });
    }
    
    // Apply availability filter
    if (options.availableNow) {
      const now = new Date();
      filtered = filtered.filter(listing => {
        const availableFrom = new Date(listing.availableFrom);
        const availableUntil = new Date(listing.availableUntil);
        return now >= availableFrom && now <= availableUntil && listing.remainingQuantity > 0;
      });
    }
    
    // Apply servings filter
    if (options.minServings !== undefined) {
      filtered = filtered.filter(listing => listing.servings >= options.minServings!);
    }
    
    // Apply sorting
    if (options.sortBy) {
      filtered.sort((a, b) => {
        switch (options.sortBy) {
          case 'price':
            return options.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
          case 'rating':
            return options.sortOrder === 'asc' 
              ? (a.rating || 0) - (b.rating || 0) 
              : (b.rating || 0) - (a.rating || 0);
          case 'distance':
            if (options.userLocation) {
              const distanceA = calculateDistance(
                options.userLocation.latitude,
                options.userLocation.longitude,
                a.location.latitude,
                a.location.longitude
              );
              const distanceB = calculateDistance(
                options.userLocation.latitude,
                options.userLocation.longitude,
                b.location.latitude,
                b.location.longitude
              );
              return options.sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
            }
            return 0;
          case 'availableUntil':
            const dateA = new Date(a.availableUntil).getTime();
            const dateB = new Date(b.availableUntil).getTime();
            return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          default:
            return 0;
        }
      });
    }
    
    set({ filteredListings: filtered });
  },
  
  searchListingsOnRoute: (params: RouteSearchParams) => {
    const state = get();
    const listings = state.listings || [];
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ filteredListings: [], error: 'User not found' });
      return;
    }
    
    // Get the appropriate route based on the route type
    const route = params.routeType === 'homeToOffice' 
      ? user.homeToOfficeRoute 
      : (user.routesSameAsHomeToOffice && params.routeType === 'officeToHome')
        ? [...(user.homeToOfficeRoute || [])].reverse()
        : user.officeToHomeRoute;
    
    if (!route || route.length === 0) {
      set({ filteredListings: [], error: 'Route not set up' });
      return;
    }
    
    // Create a path of points along the route
    const routePoints = [
      { latitude: user.location.latitude, longitude: user.location.longitude }, // Home
      ...route.map(loc => ({ latitude: loc.latitude, longitude: loc.longitude })),
      { latitude: user.officeLocation?.latitude || 0, longitude: user.officeLocation?.longitude || 0 }, // Office
    ];
    
    // Filter listings based on proximity to the route
    let filtered = listings.filter(listing => {
      // Check if listing is within the maximum detour distance from any point on the route
      return routePoints.some(point => {
        const distance = calculateDistance(
          point.latitude,
          point.longitude,
          listing.location.latitude,
          listing.location.longitude
        ) * 1000; // Convert to meters
        
        return distance <= params.maxDetour;
      });
    });
    
    // Apply food type filter
    if (params.foodType !== 'both') {
      if (params.foodType === 'vegetarian') {
        filtered = filtered.filter(listing => listing.isVegetarian);
      } else if (params.foodType === 'non-vegetarian') {
        filtered = filtered.filter(listing => !listing.isVegetarian);
      }
    }
    
    // Apply dish name filter if provided
    if (params.dishName) {
      const query = params.dishName.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.dishName.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
      );
    }
    
    // Apply cuisine types filter if provided
    if (params.cuisineTypes && params.cuisineTypes.length > 0) {
      filtered = filtered.filter(listing => 
        params.cuisineTypes!.includes(listing.cuisineType)
      );
    }
    
    // Apply subcuisine types filter if provided
    if (params.subcuisineTypes && params.subcuisineTypes.length > 0) {
      filtered = filtered.filter(listing => 
        listing.subcuisineType && params.subcuisineTypes!.includes(listing.subcuisineType)
      );
    }
    
    // Sort by distance from the route (closest first)
    filtered.sort((a, b) => {
      const minDistanceA = Math.min(...routePoints.map(point => 
        calculateDistance(
          point.latitude,
          point.longitude,
          a.location.latitude,
          a.location.longitude
        ) * 1000 // Convert to meters
      ));
      
      const minDistanceB = Math.min(...routePoints.map(point => 
        calculateDistance(
          point.latitude,
          point.longitude,
          b.location.latitude,
          b.location.longitude
        ) * 1000 // Convert to meters
      ));
      
      return minDistanceA - minDistanceB;
    });
    
    set({ filteredListings: filtered });
  },
  
  addListing: async (listing: Omit<FoodListing, 'id' | 'createdAt'>) => {
    try {
      set({ isLoading: true, error: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a new ID and creation date
      const newListing: FoodListing = {
        ...listing,
        id: `listing-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Update the store
      set(state => ({
        listings: [newListing, ...(state.listings || [])],
        filteredListings: [newListing, ...(state.filteredListings || [])],
        isLoading: false,
      }));
      
      return newListing;
    } catch (error) {
      console.error('Error adding listing:', error);
      set({ 
        error: 'Failed to add listing. Please try again.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateListing: async (id: string, updates: Partial<FoodListing>) => {
    try {
      set({ isLoading: true, error: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the listing to update
      const state = get();
      const listings = state.listings || [];
      const listing = listings.find(l => l.id === id);
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Update the listing
      const updatedListing: FoodListing = {
        ...listing,
        ...updates,
      };
      
      // Update the store
      set(state => ({
        listings: (state.listings || []).map(l => l.id === id ? updatedListing : l),
        filteredListings: (state.filteredListings || []).map(l => l.id === id ? updatedListing : l),
        isLoading: false,
      }));
      
      return updatedListing;
    } catch (error) {
      console.error('Error updating listing:', error);
      set({ 
        error: 'Failed to update listing. Please try again.',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updateListingQuantity: async (id: string, newQuantity: number) => {
    try {
      // Find the listing to update
      const state = get();
      const listings = state.listings || [];
      const listing = listings.find(l => l.id === id);
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      // Update the listing quantity
      const updatedListing: FoodListing = {
        ...listing,
        remainingQuantity: newQuantity,
      };
      
      // Update the store
      set(state => ({
        listings: (state.listings || []).map(l => l.id === id ? updatedListing : l),
        filteredListings: (state.filteredListings || []).map(l => l.id === id ? updatedListing : l),
      }));
    } catch (error) {
      console.error('Error updating listing quantity:', error);
      throw error;
    }
  },
  
  deleteListing: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the store
      set(state => ({
        listings: (state.listings || []).filter(l => l.id !== id),
        filteredListings: (state.filteredListings || []).filter(l => l.id !== id),
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      set({ 
        error: 'Failed to delete listing. Please try again.',
        isLoading: false 
      });
      return false;
    }
  },
  
  getListing: (id: string) => {
    const state = get();
    const listings = state.listings || [];
    return listings.find(l => l.id === id);
  },
  
  getListingById: (id: string) => {
    const state = get();
    const listings = state.listings || [];
    return listings.find(l => l.id === id);
  },
  
  getSellerListings: (sellerId: string) => {
    const state = get();
    const listings = state.listings || [];
    return listings.filter(l => l.sellerId === sellerId);
  },
  
  getTopSellingItems: async (limit = 10) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current listings safely
      const state = get();
      const listings = state.listings || [];
      
      // Sort listings by order count (descending)
      const topItems = [...listings]
        .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
        .slice(0, limit);
      
      return topItems;
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return [];
    }
  },

  toggleListingApproval: async (id: string) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (listing) {
      const updatedListing = { ...listing, isApproved: !listing.isApproved };
      set(state => ({
        listings: state.listings.map(l => l.id === id ? updatedListing : l),
        filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
      }));
    }
  },

  toggleListingActive: async (id: string) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (listing) {
      const updatedListing = { ...listing, isActive: !listing.isActive };
      set(state => ({
        listings: state.listings.map(l => l.id === id ? updatedListing : l),
        filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
      }));
    }
  },

  toggleListingFeatured: async (id: string) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (listing) {
      const updatedListing = { ...listing, isFeatured: !listing.isFeatured };
      set(state => ({
        listings: state.listings.map(l => l.id === id ? updatedListing : l),
        filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
      }));
    }
  },

  bulkUpdateListings: async (ids: string[], updates: Partial<FoodListing>) => {
    set(state => ({
      listings: state.listings.map(l => ids.includes(l.id) ? { ...l, ...updates } : l),
      filteredListings: state.filteredListings.map(l => ids.includes(l.id) ? { ...l, ...updates } : l),
    }));
  },

  bulkDeleteListings: async (ids: string[]) => {
    set(state => ({
      listings: state.listings.filter(l => !ids.includes(l.id)),
      filteredListings: state.filteredListings.filter(l => !ids.includes(l.id)),
    }));
  },

  exportListings: async (format: 'csv' | 'json') => {
    const state = get();
    if (format === 'json') {
      return JSON.stringify(state.listings, null, 2);
    }
    const headers = ['id', 'dishName', 'sellerName', 'price', 'isActive', 'isApproved'];
    const rows = state.listings.map(l => [l.id, l.dishName, l.sellerName, l.price, l.isActive, l.isApproved].join(','));
    return [headers.join(','), ...rows].join('\n');
  },
}));

// Helper function to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}