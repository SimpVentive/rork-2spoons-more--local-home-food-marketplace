import { createClient } from '@supabase/supabase-js';
import { PickupLocation, SellerEarnings, CODDetails } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * PICKUP LOCATIONS
 */
export const pickupLocationsQueries = {
  async createPickupLocation(location: PickupLocation) {
    const { data, error } = await supabase
      .from('pickup_locations')
      .insert([
        {
          listing_id: location.listingId,
          type: location.type,
          name: location.name,
          street: location.address.street,
          city: location.address.city,
          state: location.address.state,
          zip_code: location.address.zipCode,
          country: location.address.country,
          full_address: location.address.fullAddress,
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          google_maps_url: location.googleMapsUrl,
          pickup_time_start: location.pickupTimeStart,
          pickup_time_end: location.pickupTimeEnd,
          instructions: location.instructions,
          is_available: location.isAvailable,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async getPickupLocationsByListing(listingId: string) {
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('listing_id', listingId)
      .eq('is_available', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updatePickupLocation(locationId: string, updates: Partial<PickupLocation>) {
    const { data, error } = await supabase
      .from('pickup_locations')
      .update(updates)
      .eq('id', locationId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deletePickupLocation(locationId: string) {
    const { error } = await supabase
      .from('pickup_locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;
  },
};

/**
 * SELLER EARNINGS
 */
export const earningsQueries = {
  async createEarning(earning: SellerEarnings) {
    const { data, error } = await supabase
      .from('seller_earnings')
      .insert([
        {
          seller_id: earning.sellerId,
          order_id: earning.orderId,
          amount: earning.amount,
          payment_method: earning.paymentMethod,
          status: earning.status,
          buyer_id: earning.buyerId,
          dish_name: earning.dishName,
          confirmation_deadline: earning.confirmationDeadline,
          credited_at: earning.creditedAt,
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async getSellerEarnings(sellerId: string, status?: string) {
    let query = supabase
      .from('seller_earnings')
      .select('*')
      .eq('seller_id', sellerId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSellerEarningsSummary(sellerId: string) {
    const { data, error } = await supabase
      .from('seller_earnings_summary')
      .select('*')
      .eq('seller_id', sellerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async updateEarningStatus(earningId: string, status: string, amount?: number) {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (amount) update.confirmed_amount = amount;
    if (status === 'credited') update.credited_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('seller_earnings')
      .update(update)
      .eq('id', earningId)
      .select();

    if (error) throw error;
    return data?.[0];
  },
};

/**
 * COD CONFIRMATIONS
 */
export const codQueries = {
  async createCODConfirmation(
    orderId: string,
    sellerId: string,
    amount: number,
    pickupTimeEnd: string,
    confirmationTimeoutMinutes: number = 5
  ) {
    const deadlineTime = new Date(pickupTimeEnd);
    deadlineTime.setMinutes(deadlineTime.getMinutes() + confirmationTimeoutMinutes);

    const { data, error } = await supabase
      .from('cod_confirmations')
      .insert([
        {
          order_id: orderId,
          seller_id: sellerId,
          amount,
          pickup_time_end: pickupTimeEnd,
          confirmation_timeout_minutes: confirmationTimeoutMinutes,
          confirmation_deadline: deadlineTime.toISOString(),
          status: 'pending',
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async getPendingCODConfirmations(sellerId: string) {
    const { data, error } = await supabase
      .from('pending_cod_confirmations')
      .select('*')
      .eq('seller_id', sellerId);

    if (error) throw error;
    return data || [];
  },

  async updateCODConfirmation(
    confirmationId: string,
    status: string,
    confirmedAmount?: number,
    denialReason?: string
  ) {
    const update: any = { status, updated_at: new Date().toISOString() };
    if (confirmedAmount) update.confirmed_amount = confirmedAmount;
    if (denialReason) update.denial_reason = denialReason;
    if (status === 'confirmed') update.confirmed_at = new Date().toISOString();
    if (status === 'denied') update.denied_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('cod_confirmations')
      .update(update)
      .eq('id', confirmationId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async getCODByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('cod_confirmations')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};

/**
 * NOTIFICATIONS
 */
export const notificationQueries = {
  async createNotification(
    sellerId: string,
    orderId: string,
    type: string,
    title: string,
    body: string,
    data?: any
  ) {
    const { data: result, error } = await supabase
      .from('seller_notifications')
      .insert([
        {
          seller_id: sellerId,
          order_id: orderId,
          type,
          title,
          body,
          data,
          sent_to_seller: true,
        },
      ])
      .select();

    if (error) throw error;
    return result?.[0];
  },

  async getSellerNotifications(sellerId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('seller_notifications')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .rpc('mark_notification_as_read', { notification_id: notificationId });

    if (error) throw error;
    return data;
  },

  async getUnreadCount(sellerId: string) {
    const { data, error } = await supabase
      .rpc('get_unread_notification_count', { seller_id_param: sellerId });

    if (error) throw error;
    return data || 0;
  },

  async updateWhatsAppStatus(notificationId: string, messageId: string) {
    const { data, error } = await supabase
      .from('seller_notifications')
      .update({
        sent_to_whatsapp: true,
        whatsapp_timestamp: new Date().toISOString(),
        whatsapp_message_id: messageId,
      })
      .eq('id', notificationId)
      .select();

    if (error) throw error;
    return data?.[0];
  },
};

/**
 * ORDERS - COD Integration
 */
export const ordersCODQueries = {
  async getOrdersWithCODStatus(sellerId: string) {
    const { data, error } = await supabase
      .from('orders_with_cod_status')
      .select('*')
      .eq('seller_id', sellerId);

    if (error) throw error;
    return data || [];
  },

  async updateOrderCODStatus(
    orderId: string,
    status: string,
    confirmedAmount?: number,
    denialReason?: string
  ) {
    const update: any = { status };
    if (confirmedAmount) update.confirmedAmount = confirmedAmount;
    if (denialReason) update.denialReason = denialReason;
    if (status === 'confirmed') update.confirmedAt = new Date().toISOString();

    const { data, error } = await supabase
      .rpc('update_order_cod_status', {
        order_id_param: orderId,
        status_param: status,
        amount_param: confirmedAmount,
        reason_param: denialReason,
      });

    if (error) throw error;
    return data;
  },

  async getPendingCODOrders(sellerId: string) {
    const { data, error } = await supabase
      .rpc('get_pending_cod_orders', { seller_id_param: sellerId });

    if (error) throw error;
    return data || [];
  },
};

/**
 * REALTIME SUBSCRIPTIONS
 */
export const realtimeSubscriptions = {
  watchPendingCODConfirmations(
    sellerId: string,
    callback: (data: any) => void
  ) {
    return supabase
      .from(`cod_confirmations:seller_id=eq.${sellerId}`)
      .on('*', (payload) => {
        callback(payload);
      })
      .subscribe();
  },

  watchNotifications(
    sellerId: string,
    callback: (data: any) => void
  ) {
    return supabase
      .from(`seller_notifications:seller_id=eq.${sellerId}`)
      .on('INSERT', (payload) => {
        callback(payload);
      })
      .subscribe();
  },

  watchEarnings(
    sellerId: string,
    callback: (data: any) => void
  ) {
    return supabase
      .from(`seller_earnings:seller_id=eq.${sellerId}`)
      .on('*', (payload) => {
        callback(payload);
      })
      .subscribe();
  },
};
