import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { zustandStorage } from '@/lib/storage';

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

function rowToFollow(row: Record<string, unknown>): Follow {
  return {
    id: row.id as string,
    followerId: row.follower_id as string,
    followedId: row.following_id as string,
    createdAt: row.created_at as string,
  };
}

export const useFollowsStore = create<FollowsState>()(
  persist(
    (set, get) => ({
      follows: [],
      isLoading: false,

      followSeller: async (followerId, followedId) => {
        if (followerId === followedId) return false;
        if (get().isFollowing(followerId, followedId)) return true;

        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('follows')
            .insert({ follower_id: followerId, following_id: followedId })
            .select()
            .single();

          if (error) {
            console.error('Follow seller error:', error.message);
            set({ isLoading: false });
            return false;
          }

          set(state => ({ follows: [...state.follows, rowToFollow(data)], isLoading: false }));
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
          const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followedId);

          if (error) {
            console.error('Unfollow seller error:', error.message);
            set({ isLoading: false });
            return false;
          }

          set(state => ({
            follows: state.follows.filter(
              f => !(f.followerId === followerId && f.followedId === followedId)
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
        return get().follows.some(f => f.followerId === followerId && f.followedId === followedId);
      },

      getFollowedSellers: (followerId) => {
        return get().follows.filter(f => f.followerId === followerId).map(f => f.followedId);
      },

      getFollowerCount: (followedId) => {
        return get().follows.filter(f => f.followedId === followedId).length;
      },
    }),
    {
      name: '2spoons-follows-storage',
      storage: zustandStorage,
    }
  )
);
