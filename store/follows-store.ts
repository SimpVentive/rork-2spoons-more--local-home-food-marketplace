import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api'; // Your configured Axios instance
import { useAuthStore } from './auth-store';

interface Follow {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
}

interface FollowsState {
  follows: Follow[];
  isLoading: boolean;
  followSeller: (followerId: string, followedId: string) => Promise<boolean>;
  unfollowSeller: (followerId: string, followedId: string) => Promise<boolean>;
  isFollowing: (followerId: string, followedId: string) => boolean;
  getFollowedSellers: (followerId: string) => Promise<string[]>;
  getFollowerCount: (followedId: string) => Promise<number>;
}

export const useFollowsStore = create<FollowsState>()(
  persist(
    (set, get) => ({
      follows: [],
      isLoading: false,

      followSeller: async (followerId, followedId) => {
        if (followerId === followedId || get().isFollowing(followerId, followedId)) return false;

        set({ isLoading: true });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.post(
            `/api/follows/`,
            { follower: followerId, followed: followedId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          set(state => ({
            follows: [...state.follows, response.data],
            isLoading: false,
          }));

          return true;
        } catch (error) {
          console.error('Follow error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      unfollowSeller: async (followerId, followedId) => {
        set({ isLoading: true });
        const token = useAuthStore.getState().token;

        try {
          await api.delete(`/api/follows/${followerId}/${followedId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set(state => ({
            follows: state.follows.filter(
              follow => !(follow.followerId === followerId && follow.followedId === followedId)
            ),
            isLoading: false,
          }));

          return true;
        } catch (error) {
          console.error('Unfollow error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      isFollowing: (followerId, followedId) => {
        return get().follows.some(
          follow => follow.followerId === followerId && follow.followedId === followedId
        );
      },

      getFollowedSellers: async (followerId) => {
        set({ isLoading: true });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.get(`/api/follows/?follower=${followerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set({ follows: response.data, isLoading: false });

          return response.data.map((follow: Follow) => follow.followedId);
        } catch (error) {
          console.error('Get followed sellers error:', error);
          set({ isLoading: false });
          return [];
        }
      },

      getFollowerCount: async (followedId) => {
        set({ isLoading: true });
        const token = useAuthStore.getState().token;

        try {
          const response = await api.get(`/api/follows/?followed=${followedId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set({ isLoading: false });
          return response.data.length;
        } catch (error) {
          console.error('Get follower count error:', error);
          set({ isLoading: false });
          return 0;
        }
      },
    }),
    {
      name: 'follows-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
