import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockListings } from '@/mocks/data';
import { FoodListing, SearchParams, FilterOptions } from '@/types';

interface ListingsState {
  listings: FoodListing[];
  filteredListings: FoodListing[];
  isLoading: boolean;
  error: string | null;
  fetchListings: () => Promise<void>;
  searchListings: (params: SearchParams) => void;
  getListingById: (id: string) => FoodListing | undefined;
  getSellerListings: (sellerId: string) => FoodListing[];
  createListing: (listing: Omit<FoodListing, 'id'>) => Promise<FoodListing>;
  updateListing: (id: string, updates: Partial<FoodListing>) => Promise<FoodListing>;
  deleteListing: (id: string) => Promise<void>;
  getTopSellingItems: (limit?: number) => Promise<FoodListing[]>;
  addListing: (listing: any) => Promise<boolean>;
  updateListingQuantity: (id: string, newQuantity: number) => Promise<void>;
  bulkUpdateListings: (ids: string[], updates: Partial<FoodListing>) => Promise<void>;
  bulkDeleteListings: (ids: string[]) => Promise<void>;
  toggleListingApproval: (id: string) => Promise<void>;
  toggleListingActive: (id: string) => Promise<void>;
  toggleListingFeatured: (id: string) => Promise<void>;
  exportListings: (format: 'csv' | 'json') => Promise<string>;
  getPendingApprovalListings: () => FoodListing[];
  getFeaturedListings: () => FoodListing[];
  getActiveListings: () => FoodListing[];
  getInactiveListings: () => FoodListing[];
}

export const useListingsStore = create<ListingsState>()(
  persist(
    (set, get) => ({
      listings: [...mockListings],
      filteredListings: [...mockListings],
      isLoading: false,
      error: null,
      
      fetchListings: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In a real app, we would fetch from an API
          set({ 
            listings: [...mockListings], 
            filteredListings: [...mockListings],
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      searchListings: (params: SearchParams) => {
        const { listings } = get();
        
        let filtered = [...listings];
        
        // Filter by search query
        if (params.query) {
          const query = params.query.toLowerCase();
          filtered = filtered.filter(listing => 
            listing.dishName.toLowerCase().includes(query) || 
            (listing.description && listing.description.toLowerCase().includes(query)) ||
            (listing.cuisineType && listing.cuisineType.toLowerCase().includes(query)) ||
            listing.sellerName.toLowerCase().includes(query)
          );
        }
        
        // Filter by price range
        if (params.minPrice !== undefined) {
          filtered = filtered.filter(listing => listing.price >= params.minPrice!);
        }
        
        if (params.maxPrice !== undefined) {
          filtered = filtered.filter(listing => listing.price <= params.maxPrice!);
        }
        
        // Filter by cuisine types
        if (params.cuisineTypes && params.cuisineTypes.length > 0) {
          filtered = filtered.filter(listing => 
            listing.cuisineType && params.cuisineTypes!.includes(listing.cuisineType)
          );
        }
        
        // Filter by food type (vegetarian/non-vegetarian)
        if (params.foodType && params.foodType !== 'both') {
          filtered = filtered.filter(listing => 
            params.foodType === 'vegetarian' ? listing.isVegetarian : !listing.isVegetarian
          );
        }
        
        // Filter by distance
        if (params.maxDistance !== undefined) {
          // In a real app, we would calculate actual distance
          // For now, we'll just simulate it
          filtered = filtered.filter(listing => {
            // Simulate distance calculation
            const distance = Math.random() * 10; // Random distance between 0-10 km
            return distance <= params.maxDistance!;
          });
        }
        
        // Sort results
        if (params.sortBy) {
          filtered.sort((a, b) => {
            if (params.sortBy === 'price') {
              return params.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (params.sortBy === 'rating') {
              const ratingA = a.rating || 0;
              const ratingB = b.rating || 0;
              return params.sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
            } else if (params.sortBy === 'availableUntil') {
              const dateA = new Date(a.availableUntil).getTime();
              const dateB = new Date(b.availableUntil).getTime();
              return params.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (params.sortBy === 'distance') {
              // Simulate distance calculation
              const distanceA = Math.random() * 10;
              const distanceB = Math.random() * 10;
              return params.sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
            }
            return 0;
          });
        }
        
        set({ filteredListings: filtered });
      },
      
      getListingById: (id: string) => {
        const { listings } = get();
        return listings.find(listing => listing.id === id);
      },
      
      getSellerListings: (sellerId: string) => {
        const { listings } = get();
        return listings.filter(listing => listing.sellerId === sellerId);
      },
      
      createListing: async (listing: Omit<FoodListing, 'id'>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newListing: FoodListing = {
            id: `listing-${Date.now()}`,
            ...listing,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            listings: [...state.listings, newListing],
            filteredListings: [...state.filteredListings, newListing],
            isLoading: false,
          }));
          
          return newListing;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateListing: async (id: string, updates: Partial<FoodListing>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { listings } = get();
          const listingIndex = listings.findIndex(listing => listing.id === id);
          
          if (listingIndex === -1) {
            throw new Error('Listing not found');
          }
          
          const updatedListing = { ...listings[listingIndex], ...updates };
          
          const updatedListings = [...listings];
          updatedListings[listingIndex] = updatedListing;
          
          set({
            listings: updatedListings,
            filteredListings: updatedListings,
            isLoading: false,
          });
          
          return updatedListing;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteListing: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            listings: state.listings.filter(listing => listing.id !== id),
            filteredListings: state.filteredListings.filter(listing => listing.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      getTopSellingItems: async (limit = 10) => {
        const { listings } = get();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Sort by a combination of rating and orders
        const sortedListings = [...listings].sort((a, b) => {
          const scoreA = (a.rating || 0) * 0.7 + (a.orderCount || 0) * 0.3;
          const scoreB = (b.rating || 0) * 0.7 + (b.orderCount || 0) * 0.3;
          return scoreB - scoreA;
        });
        
        return sortedListings.slice(0, limit);
      },

      // Add a new listing
      addListing: async (listing: any) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newListing: FoodListing = {
            id: `listing-${Date.now()}`,
            ...listing,
            createdAt: new Date().toISOString(),
            rating: 0,
            reviewCount: 0,
            orderCount: 0,
            isApproved: true,
            isActive: true,
          };
          
          set(state => ({
            listings: [...state.listings, newListing],
            filteredListings: [...state.filteredListings, newListing],
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          return false;
        }
      },

      // Update listing quantity
      updateListingQuantity: async (id: string, newQuantity: number) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { listings } = get();
          const listingIndex = listings.findIndex(listing => listing.id === id);
          
          if (listingIndex === -1) {
            throw new Error('Listing not found');
          }
          
          const updatedListing = { 
            ...listings[listingIndex], 
            remainingQuantity: newQuantity 
          };
          
          const updatedListings = [...listings];
          updatedListings[listingIndex] = updatedListing;
          
          set({
            listings: updatedListings,
            filteredListings: updatedListings.filter(listing => 
              get().filteredListings.some(fl => fl.id === listing.id)
            ),
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Bulk update listings
      bulkUpdateListings: async (ids: string[], updates: Partial<FoodListing>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { listings } = get();
          const updatedListings = listings.map(listing => {
            if (ids.includes(listing.id)) {
              return { ...listing, ...updates };
            }
            return listing;
          });
          
          set({
            listings: updatedListings,
            filteredListings: updatedListings,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Bulk delete listings
      bulkDeleteListings: async (ids: string[]) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          set(state => ({
            listings: state.listings.filter(listing => !ids.includes(listing.id)),
            filteredListings: state.filteredListings.filter(listing => !ids.includes(listing.id)),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Toggle listing approval status
      toggleListingApproval: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { listings } = get();
          const listingIndex = listings.findIndex(listing => listing.id === id);
          
          if (listingIndex === -1) {
            throw new Error('Listing not found');
          }
          
          const updatedListing = { 
            ...listings[listingIndex], 
            isApproved: !listings[listingIndex].isApproved 
          };
          
          const updatedListings = [...listings];
          updatedListings[listingIndex] = updatedListing;
          
          set({
            listings: updatedListings,
            filteredListings: updatedListings,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Toggle listing active status
      toggleListingActive: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { listings } = get();
          const listingIndex = listings.findIndex(listing => listing.id === id);
          
          if (listingIndex === -1) {
            throw new Error('Listing not found');
          }
          
          const updatedListing = { 
            ...listings[listingIndex], 
            isActive: !listings[listingIndex].isActive 
          };
          
          const updatedListings = [...listings];
          updatedListings[listingIndex] = updatedListing;
          
          set({
            listings: updatedListings,
            filteredListings: updatedListings,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Toggle listing featured status
      toggleListingFeatured: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { listings } = get();
          const listingIndex = listings.findIndex(listing => listing.id === id);
          
          if (listingIndex === -1) {
            throw new Error('Listing not found');
          }
          
          const updatedListing = { 
            ...listings[listingIndex], 
            isFeatured: !listings[listingIndex].isFeatured 
          };
          
          const updatedListings = [...listings];
          updatedListings[listingIndex] = updatedListing;
          
          set({
            listings: updatedListings,
            filteredListings: updatedListings,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      // Export listings
      exportListings: async (format: 'csv' | 'json') => {
        const { listings } = get();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (format === 'csv') {
          // Create CSV
          const headers = 'ID,Dish Name,Seller,Price,Vegetarian,Cuisine,Status,Approved,Featured,Created At\n';
          const rows = listings.map(listing => {
            return `${listing.id},"${listing.dishName}","${listing.sellerName}",${listing.price},${listing.isVegetarian},${listing.cuisineType || ''},${listing.isActive ? 'Active' : 'Inactive'},${listing.isApproved ? 'Yes' : 'No'},${listing.isFeatured ? 'Yes' : 'No'},${listing.createdAt}`;
          }).join('\n');
          
          return headers + rows;
        } else {
          // Create JSON
          return JSON.stringify(listings, null, 2);
        }
      },
      
      // Get listings pending approval
      getPendingApprovalListings: () => {
        const { listings } = get();
        return listings.filter(listing => !listing.isApproved);
      },
      
      // Get featured listings
      getFeaturedListings: () => {
        const { listings } = get();
        return listings.filter(listing => listing.isFeatured);
      },
      
      // Get active listings
      getActiveListings: () => {
        const { listings } = get();
        return listings.filter(listing => listing.isActive);
      },
      
      // Get inactive listings
      getInactiveListings: () => {
        const { listings } = get();
        return listings.filter(listing => !listing.isActive);
      },
    }),
    {
      name: 'listings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);