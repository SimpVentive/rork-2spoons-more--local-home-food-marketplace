import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, DishNotification } from '@/types';
import { mockNotifications } from '@/mocks/data';

interface NotificationsState {
  notifications: Notification[];
  dishNotifications: DishNotification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: (userId: string) => number;
  addDishNotification: (notification: Omit<DishNotification, 'id' | 'createdAt'>) => Promise<void>;
  getDishNotifications: (userId: string) => DishNotification[];
  removeDishNotification: (notificationId: string) => Promise<void>;
  checkRouteNotifications: (userId: string) => Promise<void>;
  getRouteBasedNotifications: (userId: string) => Notification[];
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      dishNotifications: [],
      isLoading: false,
      error: null,

      fetchNotifications: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Filter notifications for the user
          const userNotifications = mockNotifications.filter(n => n.userId === userId);
          
          set({ 
            notifications: userNotifications,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ 
            error: 'Failed to fetch notifications. Please try again.',
            isLoading: false 
          });
        }
      },

      markAsRead: async (notificationId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            notifications: state.notifications.map(notification =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            )
          }));
        } catch (error) {
          console.error('Error marking notification as read:', error);
          set({ error: 'Failed to mark notification as read.' });
        }
      },

      markAllAsRead: async (userId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            notifications: state.notifications.map(notification =>
              notification.userId === userId
                ? { ...notification, isRead: true }
                : notification
            )
          }));
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
          set({ error: 'Failed to mark all notifications as read.' });
        }
      },

      addNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newNotification: Notification = {
            ...notification,
            id: `notification-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            notifications: [newNotification, ...state.notifications]
          }));
        } catch (error) {
          console.error('Error adding notification:', error);
          set({ error: 'Failed to add notification.' });
        }
      },

      deleteNotification: async (notificationId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== notificationId)
          }));
        } catch (error) {
          console.error('Error deleting notification:', error);
          set({ error: 'Failed to delete notification.' });
        }
      },

      getUnreadCount: (userId: string) => {
        const { notifications } = get();
        return notifications.filter(n => n.userId === userId && !n.isRead).length;
      },

      addDishNotification: async (notification: Omit<DishNotification, 'id' | 'createdAt'>) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newDishNotification: DishNotification = {
            ...notification,
            id: `dish-notification-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          
          set(state => ({
            dishNotifications: [newDishNotification, ...state.dishNotifications]
          }));
        } catch (error) {
          console.error('Error adding dish notification:', error);
          set({ error: 'Failed to add dish notification.' });
          throw error;
        }
      },

      getDishNotifications: (userId: string) => {
        const { dishNotifications } = get();
        return dishNotifications.filter(n => n.userId === userId && n.isActive);
      },

      removeDishNotification: async (notificationId: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set(state => ({
            dishNotifications: state.dishNotifications.map(n =>
              n.id === notificationId ? { ...n, isActive: false } : n
            )
          }));
        } catch (error) {
          console.error('Error removing dish notification:', error);
          set({ error: 'Failed to remove dish notification.' });
          throw error;
        }
      },

      checkRouteNotifications: async (userId: string) => {
        try {
          // This would check for dishes available on user's route
          // and create notifications for dishes they've subscribed to
          const { dishNotifications } = get();
          const activeDishNotifications = dishNotifications.filter(n => n.userId === userId && n.isActive);
          
          // Simulate checking route for available dishes
          // In a real app, this would call an API to check current listings against user's route
          for (const dishNotification of activeDishNotifications) {
            // Check if dish is available on route
            const isAvailableOnRoute = Math.random() > 0.7; // Simulate availability
            
            if (isAvailableOnRoute) {
              // Create a notification
              const routeNotification: Notification = {
                id: `route-notification-${Date.now()}-${Math.random()}`,
                userId,
                title: `${dishNotification.dishName} Available on Your Route!`,
                message: `${dishNotification.dishName} is now available along your route. Tap to view details.`,
                type: 'system' as const,
                relatedId: dishNotification.id,
                isRead: false,
                createdAt: new Date().toISOString(),
              };
              
              set(state => ({
                notifications: [routeNotification, ...state.notifications]
              }));
            }
          }
        } catch (error) {
          console.error('Error checking route notifications:', error);
        }
      },

      getRouteBasedNotifications: (userId: string) => {
        const { notifications } = get();
        return notifications.filter(n => n.userId === userId && n.type === 'system' && n.relatedId?.startsWith('dish-notification') && !n.isRead);
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dishNotifications: state.dishNotifications,
      }),
    }
  )
);