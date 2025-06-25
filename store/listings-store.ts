import { create } from 'zustand';
import { FoodListing, FilterOptions, SearchParams, RouteSearchParams } from '@/types';
import { mockListings } from '@/mocks/data';
import { useAuthStore } from '@/store/auth-store';

interface ListingsState {
  listings: FoodListing[];
  filteredListings: FoodListing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  getSellerListings: (sellerId: string) => FoodListing[];
  getTopSellingItems: (limit?: number) => Promise<FoodListing[]>;
  searchListings: (params: FilterOptions | SearchParams) => void;
  searchListingsOnRoute: (params: RouteSearchParams) => void;
  addListing: (listing: Omit<FoodListing, 'id' | 'createdAt'>) => Promise<FoodListing>;
  updateListing: (id: string, updates: Partial<FoodListing>) => Promise<FoodListing>;
  deleteListing: (id: string) => Promise<void>;
  toggleListingApproval: (id: string) => Promise<void>;
  toggleListingActive: (id: string) => Promise<void>;
  toggleListingFeatured: (id: string) => Promise<void>;
  bulkUpdateListings: (ids: string[], updates: Partial<FoodListing>) => Promise<void>;
  bulkDeleteListings: (ids: string[]) => Promise<void>;
  exportListings: (format: 'csv' | 'json') => Promise<string>;
  pruneExpiredListings: () => Promise<void>;
}

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: [],
  filteredListings: [],
  isLoading: false,
  error: null,

  fetchListings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Prune expired listings that are more than 3 hours old
      await get().pruneExpiredListings();
      
      // Get the updated listings after pruning
      const currentListings = get().listings.length > 0 
        ? get().listings 
        : mockListings;
      
      set({ 
        listings: currentListings, 
        filteredListings: currentListings,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch listings', isLoading: false });
    }
  },

  getSellerListings: (sellerId: string) => {
    const { listings } = get();
    return listings.filter(listing => listing.sellerId === sellerId);
  },

  getTopSellingItems: async (limit = 5) => {
    try {
      const { listings } = get();
      // In a real app, we would fetch from an API with sorting by orderCount
      // For now, we'll sort the mock data
      const sortedListings = [...listings]
        .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
        .slice(0, limit);
      
      return sortedListings;
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return [];
    }
  },

  searchListings: (params) => {
    const { listings } = get();
    
    // Handle object-based params (for advanced filtering)
    let filtered = [...listings];
    
    // Apply price filters
    if (params.minPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price >= params.minPrice!);
    }
    
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price <= params.maxPrice!);
    }
    
    // Apply cuisine type filters
    if (params.cuisineTypes && params.cuisineTypes.length > 0) {
      filtered = filtered.filter(listing => 
        listing.cuisineType && params.cuisineTypes!.includes(listing.cuisineType)
      );
    }
    
    // Apply distance filter
    if (params.maxDistance !== undefined) {
      // In a real app, we would calculate the actual distance
      // For now, we'll use a mock implementation
      filtered = filtered.filter(listing => {
        // Mock distance calculation (random for demo)
        const distance = Math.random() * 20;
        return distance <= params.maxDistance!;
      });
    }
    
    // Apply servings filter
    if (params.minServings !== undefined) {
      filtered = filtered.filter(listing => 
        (listing.servings || 1) >= params.minServings!
      );
    }
    
    if (params.maxServings !== undefined) {
      filtered = filtered.filter(listing => 
        (listing.servings || 10) <= params.maxServings!
      );
    }
    
    // Apply availability filter
    if (params.availableNow) {
      const now = new Date();
      filtered = filtered.filter(listing => {
        const availableFrom = new Date(listing.availableFrom);
        const availableUntil = new Date(listing.availableUntil);
        return now >= availableFrom && now <= availableUntil && listing.remainingQuantity > 0;
      });
    }
    
    // Apply food type filter
    if (params.foodType && params.foodType !== 'both') {
      filtered = filtered.filter(listing => 
        params.foodType === 'vegetarian' ? listing.isVegetarian : !listing.isVegetarian
      );
    }
    
    // Apply sorting
    if (params.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      
      filtered.sort((a, b) => {
        switch (params.sortBy) {
          case 'price':
            return sortOrder * (a.price - b.price);
          case 'rating':
            return sortOrder * ((b.rating || 0) - (a.rating || 0));
          case 'distance':
            // Mock distance sorting (random for demo)
            return sortOrder * (Math.random() - 0.5);
          case 'availableUntil':
            return sortOrder * (new Date(a.availableUntil).getTime() - new Date(b.availableUntil).getTime());
          case 'servings':
            return sortOrder * ((a.servings || 1) - (b.servings || 1));
          default:
            return 0;
        }
      });
    }
    
    // Apply text search if params.query exists
    if ('query' in params && params.query && typeof params.query === 'string' && params.query.trim()) {
      const lowercaseQuery = params.query.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.dishName.toLowerCase().includes(lowercaseQuery) ||
        listing.sellerName.toLowerCase().includes(lowercaseQuery) ||
        (listing.cuisineType && listing.cuisineType.toLowerCase().includes(lowercaseQuery)) ||
        (listing.description && listing.description.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    set({ filteredListings: filtered });
  },

  searchListingsOnRoute: (params: RouteSearchParams) => {
    const { listings } = get();
    const authStore = useAuthStore.getState();
    const { user } = authStore;
    
    if (!user) {
      set({ filteredListings: [], error: 'User not logged in' });
      return;
    }
    
    // Get the route locations based on the selected route type
    const routeLocations = params.routeType === 'homeToOffice' 
      ? user.homeToOfficeRoute || []
      : user.officeToHomeRoute || [];
    
    if (routeLocations.length === 0) {
      set({ filteredListings: [], error: 'No route locations defined' });
      return;
    }
    
    // Get the maximum detour distance
    const maxDetour = params.maxDetour || user.detourPreference || 500;
    
    // Filter listings based on route proximity
    // In a real app, we would use actual geospatial calculations
    // For this demo, we'll use a simplified approach with random distances
    let filtered = [...listings].filter(listing => {
      // Simulate checking if the listing is within the detour distance of any route point
      // In a real app, this would be a proper distance calculation
      const minDistanceToRoute = Math.random() * 1000; // Random distance in meters
      return minDistanceToRoute <= maxDetour;
    });
    
    // Apply dish name filter if provided
    if (params.dishName) {
      const lowercaseDishName = params.dishName.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.dishName.toLowerCase().includes(lowercaseDishName) ||
        (listing.description && listing.description.toLowerCase().includes(lowercaseDishName))
      );
    }
    
    // Apply cuisine type filters if provided
    if (params.cuisineTypes && params.cuisineTypes.length > 0) {
      filtered = filtered.filter(listing => 
        listing.cuisineType && params.cuisineTypes!.includes(listing.cuisineType)
      );
    }
    
    // Apply food type filter if provided
    if (params.foodType && params.foodType !== 'both') {
      filtered = filtered.filter(listing => 
        params.foodType === 'vegetarian' ? listing.isVegetarian : !listing.isVegetarian
      );
    }
    
    // Sort by proximity to route (in a real app)
    // For demo, we'll just randomize the order
    filtered.sort(() => Math.random() - 0.5);
    
    set({ filteredListings: filtered });
  },

  addListing: async (listing) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newListing: FoodListing = {
        ...listing,
        id: `listing${Date.now()}`,
        createdAt: new Date().toISOString(),
        isApproved: false,
        isActive: true,
      };
      
      set(state => {
        const updatedListings = [...state.listings, newListing];
        return {
          listings: updatedListings,
          filteredListings: updatedListings,
          isLoading: false,
        };
      });
      
      return newListing;
    } catch (error) {
      set({ error: 'Failed to add listing', isLoading: false });
      throw error;
    }
  },

  updateListing: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedListing: FoodListing | undefined;
      
      set(state => {
        const updatedListings = state.listings.map(listing => {
          if (listing.id === id) {
            updatedListing = { ...listing, ...updates };
            return updatedListing;
          }
          return listing;
        });
        
        return { 
          listings: updatedListings, 
          filteredListings: updatedListings,
          isLoading: false 
        };
      });
      
      if (!updatedListing) {
        throw new Error('Listing not found');
      }
      
      return updatedListing;
    } catch (error) {
      set({ error: 'Failed to update listing', isLoading: false });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const updatedListings = state.listings.filter(listing => listing.id !== id);
        return {
          listings: updatedListings,
          filteredListings: updatedListings,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Failed to delete listing', isLoading: false });
      throw error;
    }
  },

  toggleListingApproval: async (id) => {
    const listing = get().listings.find(l => l.id === id);
    if (!listing) {
      set({ error: 'Listing not found' });
      return;
    }
    
    await get().updateListing(id, { isApproved: !listing.isApproved });
  },

  toggleListingActive: async (id) => {
    const listing = get().listings.find(l => l.id === id);
    if (!listing) {
      set({ error: 'Listing not found' });
      return;
    }
    
    await get().updateListing(id, { isActive: !listing.isActive });
  },

  toggleListingFeatured: async (id) => {
    const listing = get().listings.find(l => l.id === id);
    if (!listing) {
      set({ error: 'Listing not found' });
      return;
    }
    
    await get().updateListing(id, { isFeatured: !listing.isFeatured });
  },

  bulkUpdateListings: async (ids, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const updatedListings = state.listings.map(listing => {
          if (ids.includes(listing.id)) {
            return { ...listing, ...updates };
          }
          return listing;
        });
        
        return { 
          listings: updatedListings, 
          filteredListings: updatedListings,
          isLoading: false 
        };
      });
    } catch (error) {
      set({ error: 'Failed to update listings', isLoading: false });
      throw error;
    }
  },

  bulkDeleteListings: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const updatedListings = state.listings.filter(listing => !ids.includes(listing.id));
        return {
          listings: updatedListings,
          filteredListings: updatedListings,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Failed to delete listings', isLoading: false });
      throw error;
    }
  },

  exportListings: async (format) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const listings = get().listings;
      
      if (format === 'json') {
        const jsonData = JSON.stringify(listings, null, 2);
        set({ isLoading: false });
        return jsonData;
      } else if (format === 'csv') {
        // Simple CSV conversion
        const headers = 'id,dishName,sellerName,price,isVegetarian,isApproved,isActive,isFeatured\n';
        const rows = listings.map(listing => 
          `${listing.id},${listing.dishName},${listing.sellerName},${listing.price},${listing.isVegetarian},${listing.isApproved},${listing.isActive},${listing.isFeatured || false}`
        ).join('\n');
        
        const csvData = headers + rows;
        set({ isLoading: false });
        return csvData;
      }
      
      throw new Error('Unsupported format');
    } catch (error) {
      set({ error: 'Failed to export listings', isLoading: false });
      throw error;
    }
  },

  pruneExpiredListings: async () => {
    try {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // 3 hours ago
      
      set(state => {
        // Filter out listings that expired more than 3 hours ago
        const updatedListings = state.listings.filter(listing => {
          const expiryTime = new Date(listing.availableUntil);
          return expiryTime > threeHoursAgo;
        });
        
        return {
          listings: updatedListings,
          filteredListings: updatedListings,
        };
      });
    } catch (error) {
      console.error('Error pruning expired listings:', error);
    }
  },
}));