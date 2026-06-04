import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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

/** Map a Supabase food_listings row to our FoodListing type */
function rowToListing(row: Record<string, unknown>): FoodListing {
  return {
    id: row.id as string,
    sellerId: row.seller_id as string,
    sellerName: row.seller_name as string,
    sellerImage: (row.seller_image as string) || '',
    sellerRating: (row.seller_rating as number) || 0,
    dishName: row.dish_name as string,
    description: (row.description as string) || '',
    image: (row.image as string) || '',
    ingredients: (row.ingredients as string[]) || [],
    allergens: (row.allergens as string[]) || [],
    quantity: (row.quantity as number) || 0,
    remainingQuantity: (row.remaining_quantity as number) || 0,
    availableQuantity: (row.quantity as number) || 0,
    price: row.price as number,
    isVegetarian: (row.is_vegetarian as boolean) || false,
    cuisineType: (row.cuisine_type as string) || '',
    subcuisineType: (row.subcuisine_type as string) || undefined,
    spiceLevel: (row.spice_level as 'mild' | 'medium' | 'hot') || 'medium',
    preparationTime: (row.preparation_time as number) || 30,
    pickupTime: (row.pickup_time as string) || new Date().toISOString(),
    location: {
      latitude: (row.location_lat as number) || 0,
      longitude: (row.location_lng as number) || 0,
    },
    address: (row.address as string) || '',
    isActive: (row.is_active as boolean) ?? true,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    rating: (row.rating as number) || 0,
    reviewCount: (row.review_count as number) || 0,
    orderCount: (row.order_count as number) || 0,
    availableFrom: (row.available_from as string) || new Date().toISOString(),
    availableUntil: (row.available_until as string) || new Date().toISOString(),
    servings: (row.servings as number) || 1,
    packaging: (row.packaging as string) || 'Eco-friendly container',
    isFeatured: (row.is_featured as boolean) || false,
    isApproved: (row.is_approved as boolean) || false,
  };
}

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: [],
  filteredListings: [],
  isLoading: false,
  error: null,

  fetchListings: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch listings error:', error.message);
        set({ error: 'Failed to fetch listings. Please try again.', isLoading: false });
        return;
      }

      const listings = (data || []).map(rowToListing);
      set({ listings, filteredListings: listings, isLoading: false });
    } catch (error) {
      console.error('Error fetching listings:', error);
      set({ error: 'Failed to fetch listings. Please try again.', isLoading: false });
    }
  },

  searchListings: (options: FilterOptions) => {
    const state = get();
    const listings = state.listings || [];
    let filtered = [...listings];

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

    if (options.foodType) {
      if (options.foodType === 'vegetarian') {
        filtered = filtered.filter(listing => listing.isVegetarian);
      } else if (options.foodType === 'non-vegetarian') {
        filtered = filtered.filter(listing => !listing.isVegetarian);
      }
    }

    if (options.cuisineTypes && options.cuisineTypes.length > 0) {
      filtered = filtered.filter(listing => options.cuisineTypes!.includes(listing.cuisineType));
    }

    if (options.subcuisineTypes && options.subcuisineTypes.length > 0) {
      filtered = filtered.filter(listing =>
        listing.subcuisineType && options.subcuisineTypes!.includes(listing.subcuisineType)
      );
    }

    if (options.minPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price <= options.maxPrice!);
    }

    if (options.minRating !== undefined) {
      filtered = filtered.filter(listing => (listing.rating || 0) >= options.minRating!);
    }

    if (options.maxDistance !== undefined && options.userLocation) {
      filtered = filtered.filter(listing => {
        const distance = calculateDistance(
          options.userLocation!.latitude, options.userLocation!.longitude,
          listing.location.latitude, listing.location.longitude
        );
        return distance <= options.maxDistance!;
      });
    }

    if (options.availableNow) {
      const now = new Date();
      filtered = filtered.filter(listing => {
        const availableFrom = new Date(listing.availableFrom);
        const availableUntil = new Date(listing.availableUntil);
        return now >= availableFrom && now <= availableUntil && listing.remainingQuantity > 0;
      });
    }

    if (options.minServings !== undefined) {
      filtered = filtered.filter(listing => listing.servings >= options.minServings!);
    }

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
                options.userLocation.latitude, options.userLocation.longitude,
                a.location.latitude, a.location.longitude
              );
              const distanceB = calculateDistance(
                options.userLocation.latitude, options.userLocation.longitude,
                b.location.latitude, b.location.longitude
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

    const route = params.routeType === 'homeToOffice'
      ? user.homeToOfficeRoute
      : (user.routesSameAsHomeToOffice && params.routeType === 'officeToHome')
        ? [...(user.homeToOfficeRoute || [])].reverse()
        : user.officeToHomeRoute;

    if (!route || route.length === 0) {
      set({ filteredListings: [], error: 'Route not set up' });
      return;
    }

    const routePoints = [
      { latitude: user.location.latitude, longitude: user.location.longitude },
      ...route.map(loc => ({ latitude: loc.latitude, longitude: loc.longitude })),
      { latitude: user.officeLocation?.latitude || 0, longitude: user.officeLocation?.longitude || 0 },
    ];

    let filtered = listings.filter(listing =>
      routePoints.some(point => {
        const distance = calculateDistance(
          point.latitude, point.longitude,
          listing.location.latitude, listing.location.longitude
        ) * 1000;
        return distance <= params.maxDetour;
      })
    );

    if (params.foodType !== 'both') {
      if (params.foodType === 'vegetarian') {
        filtered = filtered.filter(listing => listing.isVegetarian);
      } else if (params.foodType === 'non-vegetarian') {
        filtered = filtered.filter(listing => !listing.isVegetarian);
      }
    }

    if (params.dishName) {
      const query = params.dishName.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.dishName.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
      );
    }

    if (params.cuisineTypes && params.cuisineTypes.length > 0) {
      filtered = filtered.filter(listing => params.cuisineTypes!.includes(listing.cuisineType));
    }

    if (params.subcuisineTypes && params.subcuisineTypes.length > 0) {
      filtered = filtered.filter(listing =>
        listing.subcuisineType && params.subcuisineTypes!.includes(listing.subcuisineType)
      );
    }

    filtered.sort((a, b) => {
      const minDistanceA = Math.min(...routePoints.map(point =>
        calculateDistance(point.latitude, point.longitude, a.location.latitude, a.location.longitude) * 1000
      ));
      const minDistanceB = Math.min(...routePoints.map(point =>
        calculateDistance(point.latitude, point.longitude, b.location.latitude, b.location.longitude) * 1000
      ));
      return minDistanceA - minDistanceB;
    });

    set({ filteredListings: filtered });
  },

  addListing: async (listing) => {
    try {
      set({ isLoading: true, error: null });

      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('food_listings')
        .insert({
          seller_id: user.id,
          seller_name: user.name,
          seller_image: user.profileImage,
          seller_rating: user.rating || 0,
          dish_name: listing.dishName,
          description: listing.description,
          image: listing.image,
          ingredients: listing.ingredients,
          allergens: listing.allergens,
          quantity: listing.quantity,
          remaining_quantity: listing.remainingQuantity,
          price: listing.price,
          is_vegetarian: listing.isVegetarian,
          cuisine_type: listing.cuisineType,
          subcuisine_type: listing.subcuisineType,
          spice_level: listing.spiceLevel,
          preparation_time: listing.preparationTime,
          pickup_time: listing.pickupTime,
          location_lat: listing.location.latitude,
          location_lng: listing.location.longitude,
          address: listing.address,
          servings: listing.servings,
          packaging: listing.packaging,
          available_from: listing.availableFrom,
          available_until: listing.availableUntil,
          is_active: true,
          is_approved: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Add listing error:', error.message);
        set({ error: 'Failed to add listing. Please try again.', isLoading: false });
        throw error;
      }

      const newListing = rowToListing(data);
      set(state => ({
        listings: [newListing, ...(state.listings || [])],
        filteredListings: [newListing, ...(state.filteredListings || [])],
        isLoading: false,
      }));

      return newListing;
    } catch (error) {
      console.error('Error adding listing:', error);
      set({ error: 'Failed to add listing. Please try again.', isLoading: false });
      throw error;
    }
  },

  updateListing: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });

      const dbUpdates: Record<string, unknown> = {};
      if (updates.dishName !== undefined) dbUpdates.dish_name = updates.dishName;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.remainingQuantity !== undefined) dbUpdates.remaining_quantity = updates.remainingQuantity;
      if (updates.isVegetarian !== undefined) dbUpdates.is_vegetarian = updates.isVegetarian;
      if (updates.cuisineType !== undefined) dbUpdates.cuisine_type = updates.cuisineType;
      if (updates.spiceLevel !== undefined) dbUpdates.spice_level = updates.spiceLevel;
      if (updates.availableUntil !== undefined) dbUpdates.available_until = updates.availableUntil;
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('food_listings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Update listing error:', error.message);
        set({ error: 'Failed to update listing.', isLoading: false });
        throw error;
      }

      const state = get();
      const listing = state.listings.find(l => l.id === id);
      if (!listing) throw new Error('Listing not found');
      const updatedListing = { ...listing, ...updates };

      set(state => ({
        listings: state.listings.map(l => l.id === id ? updatedListing : l),
        filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
        isLoading: false,
      }));

      return updatedListing;
    } catch (error) {
      console.error('Error updating listing:', error);
      set({ error: 'Failed to update listing.', isLoading: false });
      throw error;
    }
  },

  updateListingQuantity: async (id, newQuantity) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (!listing) throw new Error('Listing not found');

    const updatedListing = { ...listing, remainingQuantity: newQuantity };
    set(state => ({
      listings: state.listings.map(l => l.id === id ? updatedListing : l),
      filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
    }));

    await supabase
      .from('food_listings')
      .update({ remaining_quantity: newQuantity })
      .eq('id', id);
  },

  deleteListing: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('food_listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete listing error:', error.message);
        set({ error: 'Failed to delete listing.', isLoading: false });
        return false;
      }

      set(state => ({
        listings: state.listings.filter(l => l.id !== id),
        filteredListings: state.filteredListings.filter(l => l.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      set({ error: 'Failed to delete listing.', isLoading: false });
      return false;
    }
  },

  getListing: (id) => get().listings.find(l => l.id === id),
  getListingById: (id) => get().listings.find(l => l.id === id),
  getSellerListings: (sellerId) => get().listings.filter(l => l.sellerId === sellerId),

  getTopSellingItems: async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('is_approved', true)
        .eq('is_active', true)
        .order('order_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get top selling error:', error.message);
        return [];
      }

      return (data || []).map(rowToListing);
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return [];
    }
  },

  toggleListingApproval: async (id) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (!listing) return;

    const newApproved = !listing.isApproved;
    const updatedListing = { ...listing, isApproved: newApproved };
    set(state => ({
      listings: state.listings.map(l => l.id === id ? updatedListing : l),
      filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
    }));

    await supabase
      .from('food_listings')
      .update({ is_approved: newApproved })
      .eq('id', id);
  },

  toggleListingActive: async (id) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (!listing) return;

    const newActive = !listing.isActive;
    const updatedListing = { ...listing, isActive: newActive };
    set(state => ({
      listings: state.listings.map(l => l.id === id ? updatedListing : l),
      filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
    }));

    await supabase
      .from('food_listings')
      .update({ is_active: newActive })
      .eq('id', id);
  },

  toggleListingFeatured: async (id) => {
    const state = get();
    const listing = state.listings.find(l => l.id === id);
    if (!listing) return;

    const newFeatured = !listing.isFeatured;
    const updatedListing = { ...listing, isFeatured: newFeatured };
    set(state => ({
      listings: state.listings.map(l => l.id === id ? updatedListing : l),
      filteredListings: state.filteredListings.map(l => l.id === id ? updatedListing : l),
    }));

    await supabase
      .from('food_listings')
      .update({ is_featured: newFeatured })
      .eq('id', id);
  },

  bulkUpdateListings: async (ids, updates) => {
    set(state => ({
      listings: state.listings.map(l => ids.includes(l.id) ? { ...l, ...updates } : l),
      filteredListings: state.filteredListings.map(l => ids.includes(l.id) ? { ...l, ...updates } : l),
    }));

    const dbUpdates: Record<string, unknown> = {};
    if (updates.isApproved !== undefined) dbUpdates.is_approved = updates.isApproved;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('food_listings').update(dbUpdates).in('id', ids);
    }
  },

  bulkDeleteListings: async (ids) => {
    set(state => ({
      listings: state.listings.filter(l => !ids.includes(l.id)),
      filteredListings: state.filteredListings.filter(l => !ids.includes(l.id)),
    }));
    await supabase.from('food_listings').delete().in('id', ids);
  },

  exportListings: async (format) => {
    const state = get();
    if (format === 'json') {
      return JSON.stringify(state.listings, null, 2);
    }
    const headers = ['id', 'dishName', 'sellerName', 'price', 'isActive', 'isApproved'];
    const rows = state.listings.map(l => [l.id, l.dishName, l.sellerName, l.price, l.isActive, l.isApproved].join(','));
    return [headers.join(','), ...rows].join('\n');
  },
}));

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
