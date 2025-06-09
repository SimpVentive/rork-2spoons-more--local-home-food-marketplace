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
  searchListings: (query: string | object) => void;
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
      // For now, just return all listings if query is an object
      // In a real app, you would implement filtering based on the query object
      set({ filteredListings: listings });
      return;
    }
    
    // Handle string-based query
    if (!query || (typeof query === 'string' && !query.trim())) {
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