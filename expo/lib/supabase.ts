import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Using mock data as fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch user profile by ID from Supabase
 */
export async function fetchUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetch top chefs sorted by rating
 */
export async function fetchTopChefs(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_chef', true)
      .eq('allow_profile_display', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((chef) => ({
      ...chef,
      profileImage: chef.avatar_url || chef.profileImage || '',
      cuisineTypes: chef.cuisine_types || chef.cuisineTypes || [],
      reviewCount: chef.review_count || chef.reviewCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching top chefs:', error);
    return [];
  }
}

/**
 * Fetch all user profiles (for admin)
 */
export async function fetchAllUserProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all user profiles:', error);
    return [];
  }
}

/**
 * Fetch user profiles by IDs
 */
export async function fetchUserProfilesByIds(userIds: string[]) {
  try {
    if (userIds.length === 0) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user profiles by IDs:', error);
    return [];
  }
}

/**
 * Calculate top earners from orders
 */
export async function fetchTopEarners(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('seller_id, total_price')
      .eq('status', 'completed');

    if (error) throw error;

    // Group by seller and sum earnings
    const earningsBySellerMap = new Map<string, number>();
    (data || []).forEach((order: any) => {
      const current = earningsBySellerMap.get(order.seller_id) || 0;
      earningsBySellerMap.set(order.seller_id, current + (order.total_price || 0));
    });

    // Get seller profiles
    const sellerIds = Array.from(earningsBySellerMap.keys());
    const { data: sellers } = await supabase
      .from('profiles')
      .select('*')
      .in('id', sellerIds);

    // Combine data
    const topEarners = (sellers || [])
      .map((seller: any) => ({
        id: seller.id,
        name: seller.name,
        earnings: earningsBySellerMap.get(seller.id) || 0,
        location: seller.address,
        phone: seller.phone,
        orderCount: 0, // Would need a separate query to get this
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, limit);

    return topEarners;
  } catch (error) {
    console.error('Error fetching top earners:', error);
    return [];
  }
}

/**
 * Search users by query
 */
export async function searchUsers(query: string) {
  try {
    const searchTerm = `%${query}%`;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}
