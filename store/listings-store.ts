import { create } from 'zustand';
import { api } from '@/lib/api';
import { FoodListing } from '@/types';
import { useAuthStore } from './auth-store';

interface ListingsState {
  listings: FoodListing[];
  filteredListings: FoodListing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  getSellerListings: (sellerId: string) => FoodListing[];
  getTopSellingItems: (limit?: number) => Promise<FoodListing[]>;
  searchListings: (query: string | object) => void;
  addListing: (listing: Partial<FoodListing>) => Promise<FoodListing>;
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
      const response = await api.get('/api/food-listings/');
      set({ listings: response.data, filteredListings: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch listings', isLoading: false });
    }
  },

  getSellerListings: (sellerId) => {
    const { listings } = get();
    return listings.filter(listing => listing.sellerId === sellerId);
  },

  getTopSellingItems: async (limit = 5) => {
    try {
      const response = await api.get(`/api/food-listings/top-selling/?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return [];
    }
  },

  searchListings: (query) => {
    const { listings } = get();

    if (typeof query === 'object') {
      set({ filteredListings: listings });
      return;
    }

    if (!query || typeof query !== 'string') {
      set({ filteredListings: listings });
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = listings.filter(listing =>
      listing.dishName.toLowerCase().includes(lowercaseQuery) ||
      listing.sellerName.toLowerCase().includes(lowercaseQuery) ||
      (listing.cuisineType?.toLowerCase().includes(lowercaseQuery)) ||
      (listing.description?.toLowerCase().includes(lowercaseQuery))
    );

    set({ filteredListings: filtered });
  },

  addListing: async (listing) => {
  const token = useAuthStore.getState().token;
  console.log('Update Token:', token);

  set({ isLoading: true, error: null });

  if (!token) {
    set({ isLoading: false, error: 'User not authenticated' });
    throw new Error('User not authenticated');
  }

  try {
    const response = await api.post('/api/food-listing-create/', listing, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newListing = response.data;

    set(state => {
      const updated = [...state.listings, newListing];
      return {
        listings: updated,
        filteredListings: updated,
        isLoading: false
      };
    });

    return newListing;
  } catch (error) {
    console.error('Add listing error:', error);
    set({ error: 'Failed to add listing', isLoading: false });
    throw error;
  }
},

  updateListing: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/food-listings/${id}/`, updates);
      const updatedListing = response.data;

      set(state => {
        const updated = state.listings.map(listing => listing.id === id ? updatedListing : listing);
        return { listings: updated, filteredListings: updated, isLoading: false };
      });

      return updatedListing;
    } catch (error) {
      set({ error: 'Failed to update listing', isLoading: false });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/food-listings/${id}/`);
      set(state => {
        const updated = state.listings.filter(listing => listing.id !== id);
        return { listings: updated, filteredListings: updated, isLoading: false };
      });
    } catch (error) {
      set({ error: 'Failed to delete listing', isLoading: false });
      throw error;
    }
  },

  toggleListingApproval: async (id) => {
    const listing = get().listings.find(l => l.id === id);
    if (!listing) return set({ error: 'Listing not found' });
    await get().updateListing(id, { isApproved: !listing.isApproved });
  },

  toggleListingActive: async (id) => {
    const listing = get().listings.find(l => l.id === id);
    if (!listing) return set({ error: 'Listing not found' });
    await get().updateListing(id, { isActive: !listing.isActive });
  },

  toggleListingFeatured: async (id) => {
    const listing = get().listings.find(l => l.id === id);
    if (!listing) return set({ error: 'Listing not found' });
    await get().updateListing(id, { isFeatured: !listing.isFeatured });
  },

  bulkUpdateListings: async (ids, updates) => {
    set({ isLoading: true, error: null });
    try {
      await api.put('/api/food-listings/bulk-update/', { ids, updates });
      await get().fetchListings();
    } catch (error) {
      set({ error: 'Failed to bulk update', isLoading: false });
    }
  },

  bulkDeleteListings: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/food-listings/bulk-delete/', { ids });
      await get().fetchListings();
    } catch (error) {
      set({ error: 'Failed to bulk delete', isLoading: false });
    }
  },

  exportListings: async (format) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/food-listings/export/?format=${format}`);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to export listings', isLoading: false });
      throw error;
    }
  },
}));
