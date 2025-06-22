import { create } from 'zustand';
import { FoodListing, FilterOptions } from '@/types';
import { mockListings } from '@/mocks/data';

interface ListingsState {
  listings: FoodListing[];
  filteredListings: FoodListing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  getSellerListings: (sellerId: string) => FoodListing[];
  getTopSellingItems: (limit?: number) => Promise<FoodListing[]>;
  searchListings: (query: string | FilterOptions) => void;
  addListing: (listing: Omit<FoodListing, 'id' | 'createdAt'>) => Promise<FoodListing>;
  updateListing: (id: string, updates: Partial<FoodListing>) => Promise<FoodListing>;
  deleteListing: (id: string) => Promise<void>;
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
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ 
        listings: mockListings, 
        filteredListings: mockListings,
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

  searchListings: (query) => {
    const { listings } = get();
    
    // Handle object-based query (for advanced filtering)
    if (typeof query === 'object') {
      const filters = query as FilterOptions;
      let filtered = [...listings];
      
      // Apply price filters
      if (filters.minPrice !== undefined) {
        filtered = filtered.filter(listing => listing.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(listing => listing.price <= filters.maxPrice!);
      }
      
      // Apply cuisine type filters
      if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
        filtered = filtered.filter(listing => 
          listing.cuisineType && filters.cuisineTypes!.includes(listing.cuisineType)
        );
      }
      
      // Apply distance filter
      if (filters.maxDistance !== undefined) {
        // In a real app, we would calculate the actual distance
        // For now, we'll use a mock implementation
        filtered = filtered.filter(listing => {
          // Mock distance calculation (random for demo)
          const distance = Math.random() * 20;
          return distance <= filters.maxDistance!;
        });
      }
      
      // Apply servings filter
      if (filters.minServings !== undefined) {
        filtered = filtered.filter(listing => 
          (listing.servings || 1) >= filters.minServings!
        );
      }
      
      if (filters.maxServings !== undefined) {
        filtered = filtered.filter(listing => 
          (listing.servings || 10) <= filters.maxServings!
        );
      }
      
      // Apply availability filter
      if (filters.availableNow) {
        const now = new Date();
        filtered = filtered.filter(listing => {
          const availableFrom = new Date(listing.availableFrom);
          const availableUntil = new Date(listing.availableUntil);
          return now >= availableFrom && now <= availableUntil && listing.remainingQuantity > 0;
        });
      }
      
      // Apply food type filter
      if (filters.foodType && filters.foodType !== 'both') {
        filtered = filtered.filter(listing => 
          filters.foodType === 'vegetarian' ? listing.isVegetarian : !listing.isVegetarian
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
        
        filtered.sort((a, b) => {
          switch (filters.sortBy) {
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
      
      // Apply text search if query.query exists
      if (filters.query && typeof filters.query === 'string' && filters.query.trim()) {
        const lowercaseQuery = filters.query.toLowerCase();
        filtered = filtered.filter(listing => 
          listing.dishName.toLowerCase().includes(lowercaseQuery) ||
          listing.sellerName.toLowerCase().includes(lowercaseQuery) ||
          (listing.cuisineType && listing.cuisineType.toLowerCase().includes(lowercaseQuery)) ||
          (listing.description && listing.description.toLowerCase().includes(lowercaseQuery))
        );
      }
      
      set({ filteredListings: filtered });
      return;
    }
    
    // Handle string-based query
    if (query === undefined || query === null || (typeof query === 'string' && !query.trim())) {
      set({ filteredListings: listings });
      return;
    }
    
    const lowercaseQuery = typeof query === 'string' ? query.toLowerCase() : '';
    const filtered = listings.filter(listing => 
      listing.dishName.toLowerCase().includes(lowercaseQuery) ||
      listing.sellerName.toLowerCase().includes(lowercaseQuery) ||
      (listing.cuisineType && listing.cuisineType.toLowerCase().includes(lowercaseQuery)) ||
      (listing.description && listing.description.toLowerCase().includes(lowercaseQuery))
    );
    
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
}));