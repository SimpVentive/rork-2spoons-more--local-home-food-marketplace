import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, DeliveryMethod, PaymentMethod } from '@/types';
import { useAuthStore } from './auth-store';

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  getBuyerOrders: (buyerId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  cancelOrder: (id: string, reason: string) => Promise<Order>;
  requestRefund: (id: string, reason: string) => Promise<Order>;
  rateOrder: (id: string, rating: number, comment?: string) => Promise<Order>;
  placeOrder: (orderData: {
    buyerId: string;
    sellerId: string;
    listingId: string;
    listingSnapshot: any;
    quantity: number;
    totalPrice: number;
    deliveryAddress: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    deliveryInstructions?: string;
  }) => Promise<Order>;
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    listingId: row.listing_id as string,
    buyerId: row.buyer_id as string,
    sellerId: row.seller_id as string,
    dishName: row.dish_name as string,
    quantity: (row.quantity as number) || 1,
    totalPrice: row.total_price as number,
    status: (row.status as Order['status']) || 'pending',
    pickupTime: (row.pickup_time as string) || new Date().toISOString(),
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
    buyerName: (row.buyer_name as string) || '',
    buyerPhone: (row.buyer_phone as string) || '',
    sellerName: (row.seller_name as string) || '',
    sellerPhone: (row.seller_phone as string) || '',
    sellerAddress: (row.seller_address as string) || '',
    paymentMethod: (row.payment_method as string) || 'cash',
    notes: row.notes as string | undefined,
    rating: row.rating as number | undefined,
    reviewComment: row.review_comment as string | undefined,
    isRated: (row.is_rated as boolean) || false,
    listingSnapshot: row.listing_snapshot as Order['listingSnapshot'],
    cancelledAt: row.cancelled_at as string | undefined,
    deliveryAddress: row.delivery_address as string | undefined,
    deliveryInstructions: row.delivery_instructions as string | undefined,
    paymentStatus: row.payment_status as string | undefined,
    acceptedAt: row.accepted_at as string | undefined,
    readyAt: row.ready_at as string | undefined,
    deliveredAt: row.delivered_at as string | undefined,
    completedAt: row.completed_at as string | undefined,
    deliveryMethod: row.delivery_method as string | undefined,
  };
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });
          const user = useAuthStore.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }

          // Fetch orders where user is buyer or seller
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch orders error:', error.message);
            set({ error: error.message, isLoading: false });
            return;
          }

          set({ orders: (data || []).map(rowToOrder), isLoading: false });
        } catch (error) {
          console.error('Fetch orders error:', error);
          set({ error: 'Failed to fetch orders', isLoading: false });
        }
      },

      getOrderById: (id) => get().orders.find(o => o.id === id),
      getBuyerOrders: (buyerId) => get().orders.filter(o => o.buyerId === buyerId),
      getSellerOrders: (sellerId) => get().orders.filter(o => o.sellerId === sellerId),

      createOrder: async (orderData) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('orders')
            .insert({
              listing_id: orderData.listingId,
              buyer_id: orderData.buyerId,
              seller_id: orderData.sellerId,
              dish_name: orderData.dishName,
              quantity: orderData.quantity,
              total_price: orderData.totalPrice,
              status: 'pending',
              pickup_time: orderData.pickupTime,
              buyer_name: orderData.buyerName,
              buyer_phone: orderData.buyerPhone,
              seller_name: orderData.sellerName,
              seller_phone: orderData.sellerPhone,
              seller_address: orderData.sellerAddress,
              delivery_address: orderData.deliveryAddress,
              delivery_instructions: orderData.deliveryInstructions,
              delivery_method: orderData.deliveryMethod,
              payment_method: orderData.paymentMethod,
              payment_status: 'pending',
              listing_snapshot: orderData.listingSnapshot,
            })
            .select()
            .single();

          if (error) {
            console.error('Create order error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const newOrder = rowToOrder(data);
          set(state => ({ orders: [...state.orders, newOrder], isLoading: false }));
          return newOrder;
        } catch (error) {
          console.error('Create order error:', error);
          set({ error: 'Failed to create order', isLoading: false });
          throw error;
        }
      },

      placeOrder: async (orderData) => {
        try {
          set({ isLoading: true, error: null });

          const now = new Date().toISOString();
          const buyerUser = useAuthStore.getState().user;

          // Fetch seller profile to get phone and address
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('phone, address')
            .eq('id', orderData.sellerId)
            .single();

          const { data, error } = await supabase
            .from('orders')
            .insert({
              listing_id: orderData.listingId,
              buyer_id: orderData.buyerId,
              seller_id: orderData.sellerId,
              dish_name: orderData.listingSnapshot?.dishName || '',
              quantity: orderData.quantity,
              total_price: orderData.totalPrice,
              status: 'pending',
              pickup_time: now,
              buyer_name: buyerUser?.name || '',
              buyer_phone: buyerUser?.phone || '',
              seller_name: orderData.listingSnapshot?.sellerName || '',
              seller_phone: sellerData?.phone || '',
              seller_address: sellerData?.address || '',
              delivery_address: orderData.deliveryAddress,
              delivery_instructions: orderData.deliveryInstructions,
              delivery_method: orderData.deliveryMethod,
              payment_method: orderData.paymentMethod,
              payment_status: 'pending',
              listing_snapshot: orderData.listingSnapshot,
            })
            .select()
            .single();

          if (error) {
            console.error('Place order error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const newOrder = rowToOrder(data);
          set(state => ({ orders: [...state.orders, newOrder], isLoading: false }));
          return newOrder;
        } catch (error) {
          console.error('Place order error:', error);
          set({ error: 'Failed to place order', isLoading: false });
          throw error;
        }
      },

      updateOrderStatus: async (id, status) => {
        try {
          set({ isLoading: true, error: null });
          const now = new Date().toISOString();

          const mappedStatus = (() => {
            if (status === 'accepted') return 'confirmed' as const;
            if (status === 'delivered') return 'completed' as const;
            if (status === 'canceled') return 'cancelled' as const;
            if (status === 'in_delivery') return 'ready' as const;
            return status as Order['status'];
          })();

          const dbUpdates: Record<string, unknown> = { status: mappedStatus, updated_at: now };
          if (status === 'accepted' || status === 'confirmed') dbUpdates.accepted_at = now;
          else if (status === 'ready') dbUpdates.ready_at = now;
          else if (status === 'delivered' || status === 'completed') {
            dbUpdates.delivered_at = now;
            dbUpdates.completed_at = now;
          } else if (status === 'canceled') dbUpdates.cancelled_at = now;

          const { error } = await supabase
            .from('orders')
            .update(dbUpdates)
            .eq('id', id);

          if (error) {
            console.error('Update order status error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const state = get();
          const orderIndex = state.orders.findIndex(o => o.id === id);
          if (orderIndex === -1) throw new Error('Order not found');

          const updatedOrder = { ...state.orders[orderIndex], ...dbUpdates, status: mappedStatus };
          const updatedOrders = [...state.orders];
          updatedOrders[orderIndex] = updatedOrder;

          set({ orders: updatedOrders, isLoading: false });
          return updatedOrder;
        } catch (error) {
          console.error('Update order status error:', error);
          set({ error: 'Failed to update order', isLoading: false });
          throw error;
        }
      },

      cancelOrder: async (id, reason) => {
        try {
          set({ isLoading: true, error: null });
          const now = new Date().toISOString();

          const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled', notes: reason, cancelled_at: now, updated_at: now })
            .eq('id', id);

          if (error) {
            console.error('Cancel order error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const state = get();
          const orderIndex = state.orders.findIndex(o => o.id === id);
          if (orderIndex === -1) throw new Error('Order not found');

          const updatedOrder = { ...state.orders[orderIndex], status: 'cancelled' as const, notes: reason, cancelledAt: now, updatedAt: now };
          const updatedOrders = [...state.orders];
          updatedOrders[orderIndex] = updatedOrder;

          set({ orders: updatedOrders, isLoading: false });
          return updatedOrder;
        } catch (error) {
          console.error('Cancel order error:', error);
          set({ error: 'Failed to cancel order', isLoading: false });
          throw error;
        }
      },

      requestRefund: async (id, reason) => {
        try {
          set({ isLoading: true, error: null });
          const now = new Date().toISOString();

          const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled', notes: `Refund requested: ${reason}`, updated_at: now })
            .eq('id', id);

          if (error) {
            console.error('Request refund error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const state = get();
          const orderIndex = state.orders.findIndex(o => o.id === id);
          if (orderIndex === -1) throw new Error('Order not found');

          const updatedOrder = { ...state.orders[orderIndex], status: 'cancelled' as const, notes: `Refund requested: ${reason}`, updatedAt: now };
          const updatedOrders = [...state.orders];
          updatedOrders[orderIndex] = updatedOrder;

          set({ orders: updatedOrders, isLoading: false });
          return updatedOrder;
        } catch (error) {
          console.error('Request refund error:', error);
          set({ error: 'Failed to request refund', isLoading: false });
          throw error;
        }
      },

      rateOrder: async (id, rating, comment) => {
        try {
          set({ isLoading: true, error: null });
          const now = new Date().toISOString();

          const { error } = await supabase
            .from('orders')
            .update({ rating, review_comment: comment || '', is_rated: true, updated_at: now })
            .eq('id', id);

          if (error) {
            console.error('Rate order error:', error.message);
            set({ error: error.message, isLoading: false });
            throw error;
          }

          const state = get();
          const orderIndex = state.orders.findIndex(o => o.id === id);
          if (orderIndex === -1) throw new Error('Order not found');

          const updatedOrder = { ...state.orders[orderIndex], rating, reviewComment: comment || '', isRated: true, updatedAt: now };
          const updatedOrders = [...state.orders];
          updatedOrders[orderIndex] = updatedOrder;

          set({ orders: updatedOrders, isLoading: false });
          return updatedOrder;
        } catch (error) {
          console.error('Rate order error:', error);
          set({ error: 'Failed to rate order', isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
