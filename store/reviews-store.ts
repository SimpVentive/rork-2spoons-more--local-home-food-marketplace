import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockReviews } from '@/mocks/data';
import { Review } from '@/types';

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
      reviews: [...mockReviews],
      isLoading: false,
      error: null,
      
      fetchReviews: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // In a real app, we would fetch from an API
          set({ 
            reviews: [...mockReviews], 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      fetchSellerReviews: async (sellerId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { reviews } = get();
          const sellerReviews = reviews.filter(review => review.sellerId === sellerId);
          
          set({ isLoading: false });
          
          return sellerReviews;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          return [];
        }
      },
      
      fetchListingReviews: async (listingId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { reviews } = get();
          const listingReviews = reviews.filter(review => review.listingId === listingId);
          
          set({ isLoading: false });
          
          return listingReviews;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          return [];
        }
      },
      
      fetchBuyerReviews: async (buyerId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { reviews } = get();
          const buyerReviews = reviews.filter(review => review.buyerId === buyerId);
          
          set({ isLoading: false });
          
          return buyerReviews;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          return [];
        }
      },
      
      fetchRecentReviews: async (limit = 5) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { reviews } = get();
          // Sort by date (newest first) and take the specified limit
          const recentReviews = [...reviews]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
          
          set({ isLoading: false });
          
          return recentReviews;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          return [];
        }
      },
      
      addReview: async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newReview: Review = {
            id: `review-${Date.now()}`,
            ...reviewData,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            reviews: [...state.reviews, newReview],
            isLoading: false,
          }));
          
          return newReview;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateReview: async (id: string, data: Partial<Review>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { reviews } = get();
          const reviewIndex = reviews.findIndex(review => review.id === id);
          
          if (reviewIndex === -1) {
            throw new Error('Review not found');
          }
          
          const updatedReview = { 
            ...reviews[reviewIndex], 
            ...data 
          };
          
          const updatedReviews = [...reviews];
          updatedReviews[reviewIndex] = updatedReview;
          
          set({
            reviews: updatedReviews,
            isLoading: false,
          });
          
          return updatedReview;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteReview: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { reviews } = get();
          const updatedReviews = reviews.filter(review => review.id !== id);
          
          set({
            reviews: updatedReviews,
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
    }),
    {
      name: 'reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);