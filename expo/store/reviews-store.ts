import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Review } from '@/types';
import { zustandStorage } from '@/lib/storage';

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

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    orderId: row.order_id as string,
    listingId: row.listing_id as string,
    buyerId: row.buyer_id as string,
    sellerId: row.seller_id as string,
    rating: row.rating as number,
    comment: (row.comment as string) || '',
    createdAt: row.created_at as string,
    buyerName: (row.buyer_name as string) || '',
    buyerImage: (row.buyer_image as string) || undefined,
    sellerName: (row.seller_name as string) || '',
    dishName: (row.dish_name as string) || '',
  };
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],
      isLoading: false,
      error: null,

      fetchReviews: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch reviews error:', error.message);
            set({ error: error.message, isLoading: false });
            return;
          }

          set({ reviews: (data || []).map(rowToReview), isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch reviews', isLoading: false });
        }
      },

      fetchSellerReviews: async (sellerId) => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('seller_id', sellerId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch seller reviews error:', error.message);
            return [];
          }
          return (data || []).map(rowToReview);
        } catch {
          return [];
        }
      },

      fetchListingReviews: async (listingId) => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch listing reviews error:', error.message);
            return [];
          }
          return (data || []).map(rowToReview);
        } catch {
          return [];
        }
      },

      fetchBuyerReviews: async (buyerId) => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('buyer_id', buyerId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch buyer reviews error:', error.message);
            return [];
          }
          return (data || []).map(rowToReview);
        } catch {
          return [];
        }
      },

      fetchRecentReviews: async (limit = 5) => {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) {
            console.error('Fetch recent reviews error:', error.message);
            return [];
          }
          return (data || []).map(rowToReview);
        } catch {
          return [];
        }
      },

      addReview: async (reviewData) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('reviews')
            .insert({
              order_id: reviewData.orderId,
              listing_id: reviewData.listingId,
              buyer_id: reviewData.buyerId,
              seller_id: reviewData.sellerId,
              rating: reviewData.rating,
              comment: reviewData.comment,
              buyer_name: reviewData.buyerName,
              buyer_image: reviewData.buyerImage,
              seller_name: reviewData.sellerName,
              dish_name: reviewData.dishName,
            })
            .select()
            .single();

          if (error) {
            console.error('Add review error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const newReview = rowToReview(data);
          set(state => ({ reviews: [...state.reviews, newReview], isLoading: false }));
          return newReview;
        } catch (error) {
          set({ error: 'Failed to add review', isLoading: false });
          throw error;
        }
      },

      updateReview: async (id, updates) => {
        try {
          set({ isLoading: true, error: null });

          const dbUpdates: Record<string, unknown> = {};
          if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
          if (updates.comment !== undefined) dbUpdates.comment = updates.comment;

          const { error } = await supabase
            .from('reviews')
            .update(dbUpdates)
            .eq('id', id);

          if (error) {
            console.error('Update review error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const state = get();
          const reviewIndex = state.reviews.findIndex(r => r.id === id);
          if (reviewIndex === -1) throw new Error('Review not found');

          const updatedReview = { ...state.reviews[reviewIndex], ...updates };
          const updatedReviews = [...state.reviews];
          updatedReviews[reviewIndex] = updatedReview;

          set({ reviews: updatedReviews, isLoading: false });
          return updatedReview;
        } catch (error) {
          set({ error: 'Failed to update review', isLoading: false });
          throw error;
        }
      },

      deleteReview: async (id) => {
        try {
          set({ isLoading: true, error: null });

          const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Delete review error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          set(state => ({ reviews: state.reviews.filter(r => r.id !== id), isLoading: false }));
        } catch (error) {
          set({ error: 'Failed to delete review', isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'reviews-storage',
      storage: zustandStorage,
    }
  )
);
