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
  getListingById: (id: string) => Promise<FoodListing | undefined>;
  deleteListing: (id: string) => Promise<void>;
  toggleListingApproval: (id: string) => Promise<void>;
  toggleListingActive: (id: string) => Promise<void>;
  toggleListingFeatured: (id: string) => Promise<void>;
  bulkUpdateListings: (ids: string[], updates: Partial<FoodListing>) => Promise<void>;
  bulkDeleteListings: (ids: string[]) => Promise<void>;
  exportListings: (format: 'csv' | 'json') => Promise<string>;
  updateListingQuantity: (id: string, quantity: number) => Promise<void>;
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
  getListingById: async (id: string): Promise<FoodListing | undefined> => {
    try {
      const response = await api.get(`/api/food-listings/${id}/`);
      //console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return undefined;
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
      const formData = new FormData();

      // Handle dish image
      if (listing.image && listing.image.startsWith('file')) {
        const uriParts = listing.image.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
          uri: listing.image,
          name: `upload.${fileType}`,
          type: `image/${fileType}`,
        } as any); // React Native requires this casting
      }

      // Append all other fields (except image already handled)
      Object.keys(listing).forEach((key) => {
        if (key === 'image') return;

        const value = listing[key as keyof typeof listing];
        if (value === undefined || value === null) return;

        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // Send POST request to backend
      const response = await api.post('/api/food-listing-create/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newListing = response.data;

      set(state => {
        const updated = [...state.listings, newListing];
        return {
          listings: updated,
          filteredListings: updated,
          isLoading: false,
        };
      });

      return newListing;
    } catch (error) {
      console.error('Add listing error:', error);
      set({ error: 'Failed to add listing', isLoading: false });
      throw error;
    }
  },
  updateListingEdit: async (listingId, listing) => {
  const token = useAuthStore.getState().token;
  set({ isLoading: true, error: null });

  if (!token) {
    set({ isLoading: false, error: 'User not authenticated' });
    throw new Error('User not authenticated');
  }

  try {
    const formData = new FormData();

    if (listing.image && listing.image.startsWith('file://')) {
      const uriParts = listing.image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('image', {
        uri: listing.image,
        name: `upload.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    formData.append('dish_name', listing.dishName);
    formData.append('description', listing.description);
    formData.append('price', String(listing.price));
    formData.append('is_vegetarian', listing.isVegetarian);
    formData.append('cuisine_type', listing.cuisineType);
    formData.append('quantity', listing.quantity);
    formData.append('available_quantity', String(listing.availableQuantity));
    formData.append('available_from', new Date(listing.availableFrom).toISOString());
    formData.append('available_until', new Date(listing.availableUntil).toISOString());
    formData.append('packaging', listing.packaging);
    formData.append('servings', String(listing.servings));
    formData.append('is_lunchbox', listing.isLunchBox);
    formData.append('cuisineType', listing.cuisineType);
    formData.append('lunchbox_items', JSON.stringify(listing.lunchBoxItems));
    formData.append('useDefaultAddress', String(listing.useDefaultAddress));

    if (listing.pickupLocation?.id) {
      formData.append('location', String(listing.pickupLocation.id));
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api/food-listings/${listingId}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Update failed: ${errorData}`);
    }

    const updatedListing = await response.json();

    set((state) => {
      const updatedListings = state.listings.map((l) =>
        l.id === listingId ? updatedListing : l
      );
      return {
        listings: updatedListings,
        filteredListings: updatedListings,
        isLoading: false,
      };
    });

    return true;
  } catch (error) {
    console.error('Update listing error:', error);
    set({ error: 'Failed to update listing', isLoading: false });
    throw error;
  }
},




updateListingQuantity: async (id, quantity) => {
  set({ isLoading: true, error: null });
  try {
    
    const response = await api.patch(`/api/food-listing-update/${id}/`, {
      remaining_quantity: quantity,
    });

    const updatedListing = response.data;

    set(state => {
      const updated = state.listings.map(listing =>
        listing.id === id ? updatedListing : listing
      );
      return { listings: updated, filteredListings: updated, isLoading: false };
    });
  } catch (error) {
    console.error("Failed to update quantity:", error);
    set({ error: 'Failed to update listing quantity', isLoading: false });
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
