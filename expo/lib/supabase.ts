import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { User } from "@/types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  accessToken: async () => {
    const token = await SecureStore.getItemAsync("access_token");
    return token ?? undefined;
  },
});

// Helper function to convert snake_case from DB to User type
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
    homeToOfficeRoute: (row.home_to_office_route as any) || [],
    officeToHomeRoute: (row.office_to_home_route as any) || [],
    routesSameAsHomeToOffice: (row.routes_same_as_home_to_office as boolean) ?? true,
    detourPreference: (row.detour_preference as number) || 500,
    subscriptionPlan: (row.subscription_plan as string) || undefined,
    subscriptionExpiry: (row.subscription_expiry as string) || undefined,
    firstPostDate: (row.first_post_date as string) || null,
    postCount: (row.post_count as number) || 0,
    freePostsRemaining: (row.free_posts_remaining as number) ?? 3,
  };
}

// Fetch all chefs sorted by rating
export async function fetchTopChefs(limit: number = 10): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_chef', true)
      .eq('allow_profile_display', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fetch top chefs error:', error.message);
      return [];
    }

    return (data || []).map(rowToUser);
  } catch (error) {
    console.error('Error fetching top chefs:', error);
    return [];
  }
}

// Fetch all users
export async function fetchAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch all users error:', error.message);
      return [];
    }

    return (data || []).map(rowToUser);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

// Fetch specific user profile
export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Fetch user profile error:', error.message);
      return null;
    }

    return data ? rowToUser(data) : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Fetch multiple user profiles by IDs
export async function fetchUserProfilesByIds(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error('Fetch user profiles error:', error.message);
      return [];
    }

    return (data || []).map(rowToUser);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
}
