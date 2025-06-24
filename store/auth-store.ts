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
  updateUser: (updates: Partial<User>) => Promise<boolean>;
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
          console.log(response.data);
          const { user, token } = response.data;

          if (!user.isAdmin) {
            console.warn('User is not an admin');
            return false;
          }

          set({
            user,
            isAuthenticated: true,
            token,
            isAdmin: user.isAdmin === true,
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
    const formData = new FormData();

    // Append text fields
    formData.append('name', userData.name || '');
    formData.append('email', userData.email || '');
    formData.append('password', userData.password || '');
    formData.append('experience', userData.experience || '');
    formData.append('isChef', 'true'); // if applicable
    formData.append('isVegetarianOnly', String(userData.isVegetarianOnly));

    // Append cuisineTypes and paymentMethods as JSON strings
    formData.append('cuisine_types', JSON.stringify(userData.cuisineTypes || []));
    formData.append('payment_methods', JSON.stringify(userData.paymentMethods || []));

    // Append location data
    formData.append('latitude', String(userData.location?.latitude || ''));
    formData.append('longitude', String(userData.location?.longitude || ''));
    formData.append('address', userData.address || '');

    // Append profile image if available
    if (userData.profileImage && userData.profileImage.startsWith('file://')) {
      const uriParts = userData.profileImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('profile_image', {
        uri: userData.profileImage,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    // Send request with FormData
    const response = await fetch(`${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      body: formData,
      headers: {
        // ❌ DO NOT set Content-Type manually for FormData
        // 'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Registration failed:', errorData);
      throw new Error('Registration failed');
    }

    const data = await response.json();

    set({
      user: data.user,
      isAuthenticated: true,
      isAdmin: data.user.isAdmin === true,
      token: data.token,
    });

    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
},
updateUser: async (updates: Partial<User> & { profileImageFile?: any }) => {
        try {
          const { token } = get();
          if (!token) throw new Error('Not authenticated');

          const formData = new FormData();

          // Append regular fields
          for (const key in updates) {
            if (key === 'profileImageFile' || updates[key as keyof typeof updates] === undefined) continue;

            const value = updates[key as keyof typeof updates];

            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }

          // Append location if provided
          if (updates.location) {
            const { latitude, longitude } = updates.location;
            if (latitude !== undefined && longitude !== undefined) {
              formData.append('location[latitude]', String(latitude));
              formData.append('location[longitude]', String(longitude));
            }
          }

          // Append image file if provided
          if (updates.profileImageFile) {
            const localUri = updates.profileImageFile.uri;
            const filename = localUri.split('/').pop()!;
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('profile_image', {
              uri: localUri,
              name: filename,
              type,
            } as any);
          }

          const response = await fetch(`${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/api/auth/profile/`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              // DO NOT manually set 'Content-Type'; fetch sets it automatically for FormData
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Update failed: ${errorData}`);
          }

          const data = await response.json();
          const updatedUser = data.user;

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
    }
  ),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
/*
updateUser: async (updates: Partial<User>) => {
        try {
          const { token } = get();
          if (!token) throw new Error('Not authenticated');

          const response = await api.put('/api/auth/profile/', updates, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const updatedUser = response.data.user;
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
*/