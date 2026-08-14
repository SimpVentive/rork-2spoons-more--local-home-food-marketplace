import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { zustandStorage } from "@/lib/storage";
import { User, UserPreference, RouteLocation } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userPreference: UserPreference | null;
  isInitialized: boolean;
  isLoading: boolean;

  /** Called after Rork Auth sign-in to sync the Supabase profile */
  syncProfile: (authUserId: string, authEmail?: string, authName?: string, authPicture?: string, authPhone?: string) => Promise<User | null>;
  /** Fetch profile from Supabase by user ID */
  fetchProfile: (userId: string) => Promise<User | null>;
  /** Logout — clears local state (token clearing is handled by useAuth hook) */
  logout: () => void;
  /** Admin login with email/password — demo implementation */
  adminLogin: (email: string, password: string) => Promise<boolean>;

  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  updateUserPreference: (preference: 'buyer' | 'seller') => Promise<void>;
  switchRole: () => Promise<void>;
  addRouteLocation: (type: 'homeToOffice' | 'officeToHome', location: RouteLocation) => Promise<void>;
  removeRouteLocation: (type: 'homeToOffice' | 'officeToHome', locationId: string) => Promise<void>;
  updateDetourPreference: (meters: number) => Promise<void>;
  updateOfficeAddress: (address: string, location: { latitude: number; longitude: number }) => Promise<void>;
  setRoutesSameAsHomeToOffice: (value: boolean) => Promise<void>;
  updateSubscription: (plan: string, expiryDate: string) => Promise<void>;
  incrementPostCount: () => Promise<boolean>;
  checkPostingEligibility: () => { eligible: boolean; message: string };
  resetFreePostsRemaining: () => Promise<void>;
  initialize: () => Promise<void>;
}

/** Map a Supabase profile row to our app User type */
function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: (row.name as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    address: (row.address as string) || '',
    profileImage: (row.avatar_url as string) || '',
    experience: (row.experience as string) || '',
    cuisineTypes: (row.cuisine_types as string[]) || [],
    paymentMethods: (row.payment_methods as string[]) || [],
    location: {
      latitude: (row.location_lat as number) || 0,
      longitude: (row.location_lng as number) || 0,
    },
    isChef: (row.is_chef as boolean) || false,
    allowProfileDisplay: (row.allow_profile_display as boolean) ?? true,
    isVerified: (row.is_verified as boolean) || false,
    isAdmin: (row.is_admin as boolean) || false,
    rating: (row.rating as number) || 0,
    reviewCount: (row.review_count as number) || 0,
    officeAddress: (row.office_address as string) || '',
    officeLocation: {
      latitude: (row.office_lat as number) || 0,
      longitude: (row.office_lng as number) || 0,
    },
    homeToOfficeRoute: (row.home_to_office_route as RouteLocation[]) || [],
    officeToHomeRoute: (row.office_to_home_route as RouteLocation[]) || [],
    routesSameAsHomeToOffice: (row.routes_same_as_home_to_office as boolean) ?? true,
    detourPreference: (row.detour_preference as number) || 500,
    subscriptionPlan: (row.subscription_plan as string) || undefined,
    subscriptionExpiry: (row.subscription_expiry as string) || undefined,
    firstPostDate: (row.first_post_date as string) || null,
    postCount: (row.post_count as number) || 0,
    freePostsRemaining: (row.free_posts_remaining as number) ?? 3,
  };
}

function normalizePhone(value?: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(-10);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      userPreference: null,
      isInitialized: false,
      isLoading: false,

      initialize: async () => {
        try {
          set({ isInitialized: true });
        } catch (error) {
          console.error('Auth store initialization error:', error);
          set({ isInitialized: true });
        }
      },

      fetchProfile: async (userId: string) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !data) {
          console.error('Fetch profile error:', error?.message);
          return null;
        }

        return rowToUser(data);
      },

      syncProfile: async (
        authUserId: string,
        authEmail?: string,
        authName?: string,
        authPicture?: string,
        authPhone?: string
      ) => {
        try {
          set({ isLoading: true });

          const profileSeed: Record<string, unknown> = {
            id: authUserId,
            email: authEmail || '',
            name: authName || '',
            avatar_url: authPicture || '',
          };

          if (authPhone) {
            profileSeed.phone = authPhone;
          }

          // Upsert avoids a brittle read-then-insert sequence under RLS.
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert(profileSeed, { onConflict: 'id' });

          if (upsertError) {
            console.error('Upsert profile error:', upsertError.message);
            set({ isLoading: false });
            return null;
          }

          if (__DEV__) {
            console.log('Profile upsert success:', { id: authUserId, phone: authPhone ?? null });
          }

          // Fetch the full profile
          let { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUserId)
            .maybeSingle();

          if (fetchError) {
            console.error('Fetch profile after upsert error:', fetchError.message);
            set({ isLoading: false });
            return null;
          }

          if (!profile) {
            console.error('Profile missing after upsert:', authUserId);
            set({ isLoading: false });
            return null;
          }

          const expectedPhone = normalizePhone(authPhone);
          if (expectedPhone) {
            const persistedPhone = normalizePhone((profile.phone as string | undefined) ?? '');

            if (persistedPhone !== expectedPhone) {
              const { data: updatedProfile, error: updatePhoneError } = await supabase
                .from('profiles')
                .update({ phone: expectedPhone })
                .eq('id', authUserId)
                .select('*')
                .maybeSingle();

              if (updatePhoneError) {
                console.error('Update phone after upsert error:', updatePhoneError.message);
                set({ isLoading: false });
                return null;
              }

              if (!updatedProfile) {
                console.error('Profile missing after phone update:', authUserId);
                set({ isLoading: false });
                return null;
              }

              profile = updatedProfile;
            }
          }

          if (__DEV__) {
            console.log('Profile fetch after upsert:', {
              id: authUserId,
              phone: (profile?.phone as string | undefined) ?? authPhone ?? null,
              fetched: Boolean(profile),
            });
          }

          const user = rowToUser(profile);

          set({
            user,
            isAuthenticated: true,
            isAdmin: user.isAdmin === true,
            userPreference: user.isChef ? { type: 'seller' } : { type: 'buyer' },
            isLoading: false,
            isInitialized: true,
          });
          return user;

        } catch (error) {
          console.error('Sync profile error:', error);
          set({ isLoading: false });
          return null;
        }
      },

      adminLogin: async (email: string, password: string) => {
        try {
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (authError || !authData.user) {
            console.error('Admin auth error:', authError?.message);
            return false;
          }

          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError || !profile) {
            console.error('Profile error:', profileError?.message);

            await supabase.auth.signOut();
            return false;
          }

          const user = rowToUser(profile);

          if (!user.isAdmin) {
            await supabase.auth.signOut();
            return false;
          }

          set({
            user,
            isAuthenticated: true,
            isAdmin: true,
            userPreference: user.isChef
              ? { type: 'seller' }
              : { type: 'buyer' },
            isInitialized: true,
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
          userPreference: null,
        });
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          const dbUpdates: Record<string, unknown> = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.email !== undefined) dbUpdates.email = updates.email;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.address !== undefined) dbUpdates.address = updates.address;
          if (updates.profileImage !== undefined) dbUpdates.avatar_url = updates.profileImage;
          if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
          if (updates.cuisineTypes !== undefined) dbUpdates.cuisine_types = updates.cuisineTypes;
          if (updates.paymentMethods !== undefined) dbUpdates.payment_methods = updates.paymentMethods;
          if (updates.isChef !== undefined) dbUpdates.is_chef = updates.isChef;
          if (updates.allowProfileDisplay !== undefined) dbUpdates.allow_profile_display = updates.allowProfileDisplay;
          if (updates.location) {
            dbUpdates.location_lat = updates.location.latitude;
            dbUpdates.location_lng = updates.location.longitude;
          }

          const { error } = await supabase
            .from('profiles')
            .update({ ...dbUpdates, updated_at: new Date().toISOString() })
            .eq('id', user.id);

          if (error) {
            console.error('Update profile error:', error.message);
            return false;
          }

          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser, isAdmin: updatedUser.isAdmin === true });
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          return false;
        }
      },

      updateUser: async (updates: Partial<User>) => {
        return get().updateProfile(updates);
      },

      updateUserPreference: async (preference: 'buyer' | 'seller') => {
        try {
          set({ userPreference: { type: preference } });
          const { user } = get();
          if (user) {
            await get().updateProfile({ isChef: preference === 'seller' });
          }
        } catch (error) {
          console.error('User preference update error:', error);
          throw error;
        }
      },

      switchRole: async () => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          const newPreference = user.isChef ? 'buyer' : 'seller';
          set({ userPreference: { type: newPreference } });
          await get().updateProfile({ isChef: newPreference === 'seller' });
        } catch (error) {
          console.error('Role switch error:', error);
          throw error;
        }
      },

      addRouteLocation: async (type: 'homeToOffice' | 'officeToHome', location: RouteLocation) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          let updatedUser = { ...user };

          if (type === 'homeToOffice') {
            updatedUser.homeToOfficeRoute = [...(user.homeToOfficeRoute || []), location];
            if (user.routesSameAsHomeToOffice) {
              updatedUser.officeToHomeRoute = [...updatedUser.homeToOfficeRoute].reverse();
            }
          } else {
            updatedUser.officeToHomeRoute = [...(user.officeToHomeRoute || []), location];
          }

          set({ user: updatedUser });

          const { error } = await supabase
            .from('profiles')
            .update({
              home_to_office_route: updatedUser.homeToOfficeRoute,
              office_to_home_route: updatedUser.officeToHomeRoute,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) console.error('Add route location error:', error.message);
        } catch (error) {
          console.error('Add route location error:', error);
          throw error;
        }
      },

      removeRouteLocation: async (type: 'homeToOffice' | 'officeToHome', locationId: string) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          let updatedUser = { ...user };

          if (type === 'homeToOffice') {
            updatedUser.homeToOfficeRoute = (user.homeToOfficeRoute || []).filter(loc => loc.id !== locationId);
            if (user.routesSameAsHomeToOffice) {
              updatedUser.officeToHomeRoute = [...updatedUser.homeToOfficeRoute].reverse();
            }
          } else {
            updatedUser.officeToHomeRoute = (user.officeToHomeRoute || []).filter(loc => loc.id !== locationId);
          }

          set({ user: updatedUser });

          const { error } = await supabase
            .from('profiles')
            .update({
              home_to_office_route: updatedUser.homeToOfficeRoute,
              office_to_home_route: updatedUser.officeToHomeRoute,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) console.error('Remove route location error:', error.message);
        } catch (error) {
          console.error('Remove route location error:', error);
          throw error;
        }
      },

      updateDetourPreference: async (meters: number) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          set({ user: { ...user, detourPreference: meters } });

          const { error } = await supabase
            .from('profiles')
            .update({ detour_preference: meters, updated_at: new Date().toISOString() })
            .eq('id', user.id);

          if (error) console.error('Update detour preference error:', error.message);
        } catch (error) {
          console.error('Update detour preference error:', error);
          throw error;
        }
      },

      updateOfficeAddress: async (address: string, location: { latitude: number; longitude: number }) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          const updatedUser = {
            ...user,
            officeAddress: address,
            officeLocation: location,
          };
          set({ user: updatedUser });

          const { error } = await supabase
            .from('profiles')
            .update({
              office_address: address,
              office_lat: location.latitude,
              office_lng: location.longitude,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) console.error('Update office address error:', error.message);
        } catch (error) {
          console.error('Update office address error:', error);
          throw error;
        }
      },

      setRoutesSameAsHomeToOffice: async (value: boolean) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          let updatedUser = { ...user, routesSameAsHomeToOffice: value };
          if (value && user.homeToOfficeRoute) {
            updatedUser.officeToHomeRoute = [...user.homeToOfficeRoute].reverse();
          }
          set({ user: updatedUser });

          const { error } = await supabase
            .from('profiles')
            .update({
              routes_same_as_home_to_office: value,
              office_to_home_route: updatedUser.officeToHomeRoute,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) console.error('Set routes same error:', error.message);
        } catch (error) {
          console.error('Set routes same error:', error);
          throw error;
        }
      },

      updateSubscription: async (plan: string, expiryDate: string) => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          const updatedUser = {
            ...user,
            subscriptionPlan: plan,
            subscriptionExpiry: expiryDate,
            freePostsRemaining: 0,
          };
          set({ user: updatedUser });

          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_plan: plan,
              subscription_expiry: expiryDate,
              free_posts_remaining: 0,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) console.error('Update subscription error:', error.message);
        } catch (error) {
          console.error('Update subscription error:', error);
          throw error;
        }
      },

      incrementPostCount: async () => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          const eligibility = get().checkPostingEligibility();
          if (!eligibility.eligible) return false;

          let updatedUser = { ...user };
          if (!user.firstPostDate) {
            updatedUser.firstPostDate = new Date().toISOString();
          }
          updatedUser.postCount = (user.postCount || 0) + 1;
          if (user.freePostsRemaining && user.freePostsRemaining > 0) {
            updatedUser.freePostsRemaining = user.freePostsRemaining - 1;
          }
          set({ user: updatedUser });

          const { error } = await supabase
            .from('profiles')
            .update({
              first_post_date: updatedUser.firstPostDate,
              post_count: updatedUser.postCount,
              free_posts_remaining: updatedUser.freePostsRemaining,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) console.error('Increment post count error:', error.message);
          return true;
        } catch (error) {
          console.error('Increment post count error:', error);
          return false;
        }
      },

      checkPostingEligibility: () => {
        const { user } = get();
        if (!user) return { eligible: false, message: 'User not found' };

        if (user.freePostsRemaining && user.freePostsRemaining > 0) {
          return { eligible: true, message: `You have ${user.freePostsRemaining} free posts remaining` };
        }

        if (user.subscriptionPlan && user.subscriptionExpiry) {
          const expiryDate = new Date(user.subscriptionExpiry);
          if (expiryDate > new Date()) {
            if (user.subscriptionPlan === 'basic' && (user.postCount || 0) >= 10) {
              return { eligible: false, message: 'You have reached the maximum number of posts for your Basic plan (10 per month)' };
            } else if (user.subscriptionPlan === 'silver' && (user.postCount || 0) >= 30) {
              return { eligible: false, message: 'You have reached the maximum number of posts for your Silver plan (30 per month)' };
            } else if (user.subscriptionPlan === 'gold') {
              return { eligible: true, message: 'You have unlimited posts with your Gold plan' };
            }
            return { eligible: true, message: 'You have an active subscription' };
          } else {
            return { eligible: false, message: 'Your subscription has expired. Please renew to continue posting.' };
          }
        }

        if (user.firstPostDate) {
          const firstPostDate = new Date(user.firstPostDate);
          const trialEndDate = new Date(firstPostDate);
          trialEndDate.setDate(trialEndDate.getDate() + 30);
          if (new Date() < trialEndDate) {
            return { eligible: true, message: `Your free trial is active until ${trialEndDate.toLocaleDateString()}` };
          }
        }

        return { eligible: false, message: 'You need to subscribe to a plan to continue posting' };
      },

      resetFreePostsRemaining: async () => {
        try {
          const { user } = get();
          if (!user) throw new Error('User not found');

          set({ user: { ...user, freePostsRemaining: 3 } });

          const { error } = await supabase
            .from('profiles')
            .update({ free_posts_remaining: 3, updated_at: new Date().toISOString() })
            .eq('id', user.id);

          if (error) console.error('Reset free posts error:', error.message);
        } catch (error) {
          console.error('Reset free posts error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: zustandStorage,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userPreference: state.userPreference,
        isAdmin: state.isAdmin,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
