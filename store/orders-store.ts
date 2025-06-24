import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const applyStatusTimestamps = (order: Order, status: OrderStatus): Partial<Order> => {
  const now = new Date().toISOString();
  const update: Partial<Order> = { status, updatedAt: now };

  switch (status) {
    case 'accepted': update.acceptedAt = now; break;
    case 'ready': update.readyAt = now; break;
    case 'delivered': update.deliveredAt = now; break;
    case 'completed': update.completedAt = now; break;
    case 'canceled': update.canceledAt = now; break;
  }

  return update;
};

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Promise<Order>;
  getBuyerOrders: (buyerId: string) => Promise<Order[]>;
  getSellerOrders: (sellerId: string) => Promise<Order[]>;
  placeOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order>;
  cancelOrder: (id: string, reason: string) => Promise<Order>;
  requestRefund: (id: string, reason: string) => Promise<Order>;
  rateOrder: (id: string, rating: number, comment?: string) => Promise<Order>;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get('/api/orders/');
          set({ orders: data, isLoading: false });
        } catch (error: any) {
          set({ error: error?.message || 'Error fetching orders', isLoading: false });
        }
      },

      getOrderById: async (id: string) => {
        try {
          const { data } = await api.get(`/api/orders/${id}/`);
          return data as Order;
        } catch (error: any) {
          console.error(`Error fetching order ${id}:`, error.message);
          throw error;
        }
      },


      getBuyerOrders: async (buyerId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/api/orders/buyer/`);
          return data as Order[];
        } catch (error: any) {
          console.error('Error fetching buyer orders:', error);
          set({ error: error?.message ?? 'Failed to fetch buyer orders', isLoading: false });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      getSellerOrders: async (sellerId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get(`/api/orders/seller/`);
          return data as Order[];
        } catch (error: any) {
          console.error('Error fetching buyer orders:', error);
          set({ error: error?.message || 'Failed to fetch buyer orders', isLoading: false });
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      placeOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/api/orders/', orderData);
          set(state => ({
            orders: [...state.orders, data],
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error placing order', isLoading: false });
          throw error;
        }
      },

      updateOrderStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const payload = applyStatusTimestamps({} as Order, status);
          const { data } = await api.patch(`/api/orders/${id}/`, payload);
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error updating status', isLoading: false });
          throw error;
        }
      },

      cancelOrder: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/api/orders/${id}/cancel/`, { reason });
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error canceling order', isLoading: false });
          throw error;
        }
      },

      requestRefund: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/api/orders/${id}/refund/`, { reason });
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error requesting refund', isLoading: false });
          throw error;
        }
      },

      rateOrder: async (id, rating, comment = '') => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/api/orders/${id}/rate/`, { rating, comment });
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error?.message || 'Error rating order', isLoading: false });
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
