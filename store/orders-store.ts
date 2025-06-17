import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, DeliveryMethod, PaymentMethod } from '@/types';
import { api } from '@/lib/api';

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
  getOrderById: (id: string) => Order | undefined;
  getBuyerOrders: (buyerId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
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
          const { data } = await api.get('/orders/');
          set({ orders: data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Error fetching orders', isLoading: false });
        }
      },

      getOrderById: (id: string) => get().orders.find(order => order.id === id),

      getBuyerOrders: (buyerId: string) => get().orders.filter(order => order.buyerId === buyerId),

      getSellerOrders: (sellerId: string) => get().orders.filter(order => order.sellerId === sellerId),

      placeOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/orders/', orderData);
          set(state => ({ orders: [...state.orders, data], isLoading: false }));
          return data;
        } catch (error: any) {
          set({ error: error.message || 'Error placing order', isLoading: false });
          throw error;
        }
      },

      updateOrderStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.patch(`/orders/${id}/`, applyStatusTimestamps({} as Order, status));
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error.message || 'Error updating order status', isLoading: false });
          throw error;
        }
      },

      cancelOrder: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/orders/${id}/cancel/`, { reason });
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error.message || 'Error canceling order', isLoading: false });
          throw error;
        }
      },

      requestRefund: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/orders/${id}/refund/`, { reason });
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error.message || 'Error requesting refund', isLoading: false });
          throw error;
        }
      },

      rateOrder: async (id, rating, comment = '') => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(`/orders/${id}/rate/`, { rating, comment });
          set(state => ({
            orders: state.orders.map(order => (order.id === id ? data : order)),
            isLoading: false,
          }));
          return data;
        } catch (error: any) {
          set({ error: error.message || 'Error rating order', isLoading: false });
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