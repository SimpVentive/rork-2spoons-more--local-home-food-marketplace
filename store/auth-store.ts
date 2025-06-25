import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockUsers } from '@/mocks/data';
import { User, UserPreference, RouteLocation } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isAdmin: boolean;
  userPreference: UserPreference | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  updateUserPreference: (preference: 'buyer' | 'seller') => Promise<void>;
  addRouteLocation: (type: 'homeToOffice' | 'officeToHome', location: RouteLocation) => Promise<void>;
  removeRouteLocation: (type: 'homeToOffice' | 'officeToHome', locationId: string) => Promise<void>;
  updateDetourPreference: (meters: number) => Promise<void>;
  updateOfficeAddress: (address: string, location: { latitude: number; longitude: number }) => Promise<void>;
  setRoutesSameAsHomeToOffice: (value: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      isAdmin: false,
      userPreference: null,
      
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
            isAdmin: user.isAdmin === true,
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
            u.email.toLowerCase() === email.toLowerCase() && u.isAdmin === true
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
            isAdmin: true,
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
          isAdmin: false,
          token: null,
          userPreference: null,
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
            // New fields
            officeAddress: "",
            officeLocation: { latitude: 0, longitude: 0 },
            homeToOfficeRoute: [],
            officeToHomeRoute: [],
            routesSameAsHomeToOffice: true,
            detourPreference: 500, // Default 500 meters
          };
          
          // In a real app, we would save this to the database
          // For demo purposes, we'll just set it in the store
          
          set({
            user: newUser,
            isAuthenticated: true,
            isAdmin: false,
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
          
          set({ 
            user: updatedUser,
            isAdmin: updatedUser.isAdmin === true
          });
          
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          return false;
        }
      },

      updateUserPreference: async (preference: 'buyer' | 'seller') => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ userPreference: { type: preference } });
          
          // Also update the user object if it exists
          const { user } = get();
          if (user) {
            await get().updateProfile({ 
              isChef: preference === 'seller'
            });
          }
          
          return;
        } catch (error) {
          console.error('User preference update error:', error);
          throw error;
        }
      },

      addRouteLocation: async (type: 'homeToOffice' | 'officeToHome', location: RouteLocation) => {
        try {
          const { user } = get();
          
          if (!user) {
            throw new Error('User not found');
          }
          
          let updatedUser = { ...user };
          
          if (type === 'homeToOffice') {
            updatedUser.homeToOfficeRoute = [...(user.homeToOfficeRoute || []), location];
            
            // If routes are synced, update officeToHome as well
            if (user.routesSameAsHomeToOffice) {
              updatedUser.officeToHomeRoute = [...updatedUser.homeToOfficeRoute].reverse();
            }
          } else {
            updatedUser.officeToHomeRoute = [...(user.officeToHomeRoute || []), location];
          }
          
          set({ user: updatedUser });
          
          return;
        } catch (error) {
          console.error('Add route location error:', error);
          throw error;
        }
      },

      removeRouteLocation: async (type: 'homeToOffice' | 'officeToHome', locationId: string) => {
        try {
          const { user } = get();
          
          if (!user) {
            throw new Error('User not found');
          }
          
          let updatedUser = { ...user };
          
          if (type === 'homeToOffice') {
            updatedUser.homeToOfficeRoute = (user.homeToOfficeRoute || [])
              .filter(loc => loc.id !== locationId);
            
            // If routes are synced, update officeToHome as well
            if (user.routesSameAsHomeToOffice) {
              updatedUser.officeToHomeRoute = [...updatedUser.homeToOfficeRoute].reverse();
            }
          } else {
            updatedUser.officeToHomeRoute = (user.officeToHomeRoute || [])
              .filter(loc => loc.id !== locationId);
          }
          
          set({ user: updatedUser });
          
          return;
        } catch (error) {
          console.error('Remove route location error:', error);
          throw error;
        }
      },

      updateDetourPreference: async (meters: number) => {
        try {
          const { user } = get();
          
          if (!user) {
            throw new Error('User not found');
          }
          
          const updatedUser = { ...user, detourPreference: meters };
          set({ user: updatedUser });
          
          return;
        } catch (error) {
          console.error('Update detour preference error:', error);
          throw error;
        }
      },

      updateOfficeAddress: async (address: string, location: { latitude: number; longitude: number }) => {
        try {
          const { user } = get();
          
          if (!user) {
            throw new Error('User not found');
          }
          
          const updatedUser = { 
            ...user, 
            officeAddress: address,
            officeLocation: location
          };
          
          set({ user: updatedUser });
          
          return;
        } catch (error) {
          console.error('Update office address error:', error);
          throw error;
        }
      },

      setRoutesSameAsHomeToOffice: async (value: boolean) => {
        try {
          const { user } = get();
          
          if (!user) {
            throw new Error('User not found');
          }
          
          let updatedUser = { ...user, routesSameAsHomeToOffice: value };
          
          // If setting to true, copy and reverse the homeToOffice route
          if (value && user.homeToOfficeRoute) {
            updatedUser.officeToHomeRoute = [...user.homeToOfficeRoute].reverse();
          }
          
          set({ user: updatedUser });
          
          return;
        } catch (error) {
          console.error('Set routes same error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);