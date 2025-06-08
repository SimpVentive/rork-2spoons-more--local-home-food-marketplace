import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '@/mocks/data';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      
      login: async (email: string, password: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find user with matching email (in a real app, this would be done on the server)
          const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            console.log("User not found for email:", email);
            console.log("Available users:", mockUsers.map(u => u.email));
            return false;
          }
          
          // In a real app, we would verify the password on the server
          // For demo purposes, we'll just assume the password is correct
          
          set({
            user,
            isAuthenticated: true,
            token: 'demo-token-' + Math.random().toString(36).substring(2, 15),
          });
          
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      adminLogin: async (email: string, password: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Find admin user with matching email
          const adminUser = mockUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && u.isAdmin
          );
          
          if (!adminUser) {
            console.log("Admin user not found for email:", email);
            return false;
          }
          
          // In a real app, we would verify the password on the server
          // For demo purposes, we'll just assume the password is correct
          
          set({
            user: adminUser,
            isAuthenticated: true,
            token: 'admin-token-' + Math.random().toString(36).substring(2, 15),
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
          token: null,
        });
      },
      
      register: async (userData: Partial<User>) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if email is already in use
          const existingUser = mockUsers.find(u => 
            u.email.toLowerCase() === userData.email?.toLowerCase()
          );
          
          if (existingUser) {
            throw new Error('Email already in use');
          }
          
          // Create new user
          const newUser: User = {
            id: `user-${Date.now()}`,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            profileImage: userData.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
            experience: userData.experience || "",
            cuisineTypes: userData.cuisineTypes || [],
            paymentMethods: userData.paymentMethods || ['UPI'],
            location: userData.location || {
              latitude: 0,
              longitude: 0,
            },
            isChef: userData.isChef || false,
            allowProfileDisplay: userData.allowProfileDisplay !== undefined ? userData.allowProfileDisplay : true,
            isVerified: false,
            isAdmin: false,
            rating: 0,
            reviewCount: 0,
          };
          
          // In a real app, we would save this to the database
          // For demo purposes, we'll just set it in the store
          
          set({
            user: newUser,
            isAuthenticated: true,
            token: 'demo-token-' + Math.random().toString(36).substring(2, 15),
          });
          
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },
      
      updateProfile: async (updates: Partial<User>) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { user } = get();
          
          if (!user) {
            throw new Error('User not found');
          }
          
          const updatedUser = { ...user, ...updates };
          
          // In a real app, we would update this in the database
          // For demo purposes, we'll just update it in the store
          
          set({ user: updatedUser });
          
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          return false;
        }
      },
      
      isAdmin: () => {
        const { user } = get();
        return !!user?.isAdmin;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);