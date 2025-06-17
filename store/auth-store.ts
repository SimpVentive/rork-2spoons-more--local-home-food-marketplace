import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      isAdmin: false,

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/api/auth/login/', { email, password });
          const { user, token } = response.data;

          set({
            user,
            isAuthenticated: true,
            token,
            isAdmin: user.isAdmin === true,
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      adminLogin: async (email: string, password: string) => {
        try {
          const response = await api.post('/api/auth/admin-login/', { email, password });
          const { user, token } = response.data;

          if (!user.isAdmin) {
            console.warn('User is not an admin');
            return false;
          }

          set({
            user,
            isAuthenticated: true,
            token,
            isAdmin: true,
          });

          return true;
        } catch (error) {
          console.error('Admin login error:', error);
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          token: null,
        });
      },

      register: async (userData: Partial<User>) => {
        try {
          const response = await api.post('/api/auth/register/', userData);
          const { user, token } = response.data;

          set({
            user,
            isAuthenticated: true,
            isAdmin: user.isAdmin === true,
            token,
          });

          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const { token } = get();
          if (!token) throw new Error('Not authenticated');

          const response = await api.put('/api/auth/profile/', updates, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const updatedUser = response.data;

          set({
            user: updatedUser,
            isAdmin: updatedUser.isAdmin === true,
          });

          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
