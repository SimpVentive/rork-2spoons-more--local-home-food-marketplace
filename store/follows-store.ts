import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  getFollowedSellers: (followerId: string) => string[];
  getFollowerCount: (followedId: string) => number;
}

// Mock follows for demonstration
const mockFollows: Follow[] = [
  {
    id: '1',
    followerId: '1',
    followedId: '2',
    createdAt: '2023-06-10T14:30:00Z',
  },
  {
    id: '2',
    followerId: '1',
    followedId: '3',
    createdAt: '2023-06-12T09:15:00Z',
  },
  {
    id: '3',
    followerId: '2',
    followedId: '1',
    createdAt: '2023-06-14T16:45:00Z',
  },
];

export const useFollowsStore = create<FollowsState>()(
  persist(
    (set, get) => ({
      follows: mockFollows,
      isLoading: false,

      followSeller: async (followerId, followedId) => {
        // Don't allow following yourself
        if (followerId === followedId) return false;
        
        // Check if already following
        if (get().isFollowing(followerId, followedId)) return true;
        
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newFollow: Follow = {
            id: `follow_${Date.now()}`,
            followerId,
            followedId,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            follows: [...state.follows, newFollow],
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          console.error('Follow seller error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      unfollowSeller: async (followerId, followedId) => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            follows: state.follows.filter(
              follow => !(follow.followerId === followerId && follow.followedId === followedId)
            ),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          console.error('Unfollow seller error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      isFollowing: (followerId, followedId) => {
        return get().follows.some(
          follow => follow.followerId === followerId && follow.followedId === followedId
        );
      },

      getFollowedSellers: (followerId) => {
        return get().follows
          .filter(follow => follow.followerId === followerId)
          .map(follow => follow.followedId);
      },

      getFollowerCount: (followedId) => {
        return get().follows.filter(follow => follow.followedId === followedId).length;
      },
    }),
    {
      name: '2spoons-follows-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);