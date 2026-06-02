import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockOrders } from '@/mocks/data';
import { Order, OrderStatus, DeliveryMethod, PaymentMethod } from '@/types';

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

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [...mockOrders],
      isLoading: false,
      error: null,
      
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Deduplicate orders by id to prevent duplicates from persisted state
          const currentOrders = get().orders || [];
          const uniqueOrders = [...mockOrders];
          const existingIds = new Set(uniqueOrders.map(o => o.id));
          const additionalOrders = currentOrders.filter(o => !existingIds.has(o.id));
          
          set({ 
            orders: [...uniqueOrders, ...additionalOrders], 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      getOrderById: (id: string) => {
        const { orders } = get();
        return orders.find(order => order.id === id);
      },
      
      getBuyerOrders: (buyerId: string) => {
        const { orders } = get();
        return orders.filter(order => order.buyerId === buyerId);
      },
      
      getSellerOrders: (sellerId: string) => {
        const { orders } = get();
        return orders.filter(order => order.sellerId === sellerId);
      },
      
      createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const now = new Date().toISOString();
          
          const newOrder: Order = {
            id: `order-${Date.now()}`,
            ...orderData,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
          };
          
          set(state => ({
            orders: [...state.orders, newOrder],
            isLoading: false,
            error: null
          }));
          
          return newOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      placeOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const now = new Date().toISOString();
          
          const newOrder = {
            id: `order-${Date.now()}`,
            ...orderData,
            dishName: orderData.listingSnapshot?.dishName || '',
            pickupTime: now,
            buyerName: '',
            buyerPhone: '',
            sellerName: orderData.listingSnapshot?.sellerName || '',
            sellerPhone: '',
            sellerAddress: '',
            paymentMethod: orderData.paymentMethod,
            status: 'pending' as const,
            paymentStatus: 'pending',
            createdAt: now,
            updatedAt: now,
          } satisfies Order;
          
          set(state => ({
            orders: [...state.orders, newOrder],
            isLoading: false,
            error: null
          }));
          
          return newOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateOrderStatus: async (id: string, status: OrderStatus) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { orders } = get();
          const orderIndex = orders.findIndex(order => order.id === id);
          
          if (orderIndex === -1) {
            throw new Error('Order not found');
          }
          
          const now = new Date().toISOString();
          
          // Create a status timestamp field based on the new status
          // Map extended statuses to Order-compatible statuses
          const mappedStatus = (() => {
            if (status === 'accepted') return 'confirmed' as const;
            if (status === 'delivered') return 'completed' as const;
            if (status === 'canceled') return 'cancelled' as const;
            if (status === 'in_delivery') return 'ready' as const;
            return status as Order['status'];
          })();
          
          let statusUpdate: Partial<Order> = { status: mappedStatus, updatedAt: now };
          
          if (status === 'accepted' || status === 'confirmed') {
            statusUpdate.acceptedAt = now;
          } else if (status === 'ready') {
            statusUpdate.readyAt = now;
          } else if (status === 'delivered' || status === 'completed') {
            statusUpdate.deliveredAt = now;
            statusUpdate.completedAt = now;
          }
          
          const updatedOrder = { 
            ...orders[orderIndex], 
            ...statusUpdate
          };
          
          const updatedOrders = [...orders];
          updatedOrders[orderIndex] = updatedOrder;
          
          set({
            orders: updatedOrders,
            isLoading: false,
            error: null,
          });
          
          return updatedOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      cancelOrder: async (id: string, reason: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { orders } = get();
          const orderIndex = orders.findIndex(order => order.id === id);
          
          if (orderIndex === -1) {
            throw new Error('Order not found');
          }
          
          const updatedOrder: Order = { 
            ...orders[orderIndex], 
            status: 'cancelled' as const, 
            notes: reason,
            updatedAt: new Date().toISOString(),
            cancelledAt: new Date().toISOString()
          };
          
          const updatedOrders = [...orders];
          updatedOrders[orderIndex] = updatedOrder;
          
          set({
            orders: updatedOrders,
            isLoading: false,
            error: null,
          });
          
          return updatedOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      requestRefund: async (id: string, reason: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { orders } = get();
          const orderIndex = orders.findIndex(order => order.id === id);
          
          if (orderIndex === -1) {
            throw new Error('Order not found');
          }
          
          const updatedOrder: Order = { 
            ...orders[orderIndex], 
            status: 'cancelled' as const,
            notes: `Refund requested: ${reason}`,
            updatedAt: new Date().toISOString() 
          };
          
          const updatedOrders = [...orders];
          updatedOrders[orderIndex] = updatedOrder;
          
          set({
            orders: updatedOrders,
            isLoading: false,
            error: null,
          });
          
          return updatedOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      rateOrder: async (id: string, rating: number, comment?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { orders } = get();
          const orderIndex = orders.findIndex(order => order.id === id);
          
          if (orderIndex === -1) {
            throw new Error('Order not found');
          }
          
          const updatedOrder = { 
            ...orders[orderIndex], 
            rating,
            reviewComment: comment || '',
            isRated: true,
            updatedAt: new Date().toISOString() 
          };
          
          const updatedOrders = [...orders];
          updatedOrders[orderIndex] = updatedOrder;
          
          set({
            orders: updatedOrders,
            isLoading: false,
            error: null,
          });
          
          return updatedOrder;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
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