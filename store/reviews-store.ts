import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review } from '@/types';
import { api } from '@/lib/api';

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;

  fetchReviews: () => Promise<void>;
  fetchSellerReviews: (sellerId: string) => Promise<Review[]>;
  fetchListingReviews: (listingId: string) => Promise<Review[]>;
  fetchBuyerReviews: (buyerId: string) => Promise<Review[]>;
  fetchRecentReviews: (limit?: number) => Promise<Review[]>;

  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  updateReview: (id: string, data: Partial<Review>) => Promise<Review>;
  deleteReview: (id: string) => Promise<void>;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      isLoading: false,
      error: null,

      fetchReviews: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get<Review[]>('/api/reviews/');
          set({ reviews: data, isLoading: false });
        } catch (error: any) {
          set({ error: error?.message || 'Error fetching reviews', isLoading: false });
        }
      },

      fetchSellerReviews: async (sellerId: string) => {
        try {
          const { data } = await api.get<Review[]>('/api/reviews/', {
            params: { seller_id: sellerId },
          });
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error fetching seller reviews' });
          return [];
        }
      },

      fetchListingReviews: async (listingId: string) => {
        try {
          const { data } = await api.get<Review[]>('/api/reviews/', {
            params: { listing_id: listingId },
          });
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error fetching listing reviews' });
          return [];
        }
      },

      fetchBuyerReviews: async (buyerId: string) => {
        try {
          const { data } = await api.get<Review[]>('/api/reviews/', {
            params: { buyer_id: buyerId },
          });
          return data;
        } catch (error: any) {
          set({ error: error?.message ?? 'Error fetching buyer reviews' });
          return [];
        }
      },

      fetchRecentReviews: async (limit = 5) => {
        try {
          const { data } = await api.get<Review[]>('/api/reviews/', {
            params: { ordering: '-created_at', limit },
          });
          return data;
        } catch (error: any) {
          console.error('Error loading recent reviews:', error);
          set({ error: error?.message ?? 'Error fetching recent reviews' });
          return [];
        }
      },


      addReview: async (reviewData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<Review>('/api/reviews/', reviewData);
          set(state => ({ reviews: [...state.reviews, data], isLoading: false }));
          return data;
        } catch (error: any) {
          set({ error: error?.message ?? 'Error adding review', isLoading: false });
          throw error;
        }
      },

      updateReview: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: updated } = await api.patch<Review>(`/api/reviews/${id}/`, data);
          set(state => ({
            reviews: state.reviews.map(r => (r.id === id ? updated : r)),
            isLoading: false,
          }));
          return updated;
        } catch (error: any) {
          set({ error: error?.message || 'Error updating review', isLoading: false });
          throw error;
        }
      },

      deleteReview: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/api/reviews/${id}/`);
          set(state => ({
            reviews: state.reviews.filter(r => r.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error?.message || 'Error deleting review', isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
