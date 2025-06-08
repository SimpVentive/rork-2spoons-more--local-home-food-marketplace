import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, DishNotification } from '@/types';

interface NotificationsState {
  notifications: Notification[];
  dishNotifications: DishNotification[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<Notification>;
  getNotificationsByUser: (userId: string) => Notification[];
  getUnreadNotificationCount: (userId: string) => number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Dish Notifications
  addDishNotification: (notification: Omit<DishNotification, 'id' | 'createdAt'>) => Promise<DishNotification>;
  getDishNotificationsByUser: (userId: string) => DishNotification[];
  getActiveDishNotifications: (userId: string) => DishNotification[];
  toggleDishNotificationStatus: (notificationId: string, isActive: boolean) => Promise<void>;
  deleteDishNotification: (notificationId: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      dishNotifications: [],
      isLoading: false,
      error: null,
      
      addNotification: async (notificationData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Generate a unique ID
          const id = Math.random().toString(36).substring(2, 15);
          
          const newNotification: Notification = {
            id,
            ...notificationData,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            isLoading: false,
          }));
          
          return newNotification;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      getNotificationsByUser: (userId) => {
        return get().notifications
          .filter(notification => notification.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
      
      getUnreadNotificationCount: (userId) => {
        return get().notifications.filter(
          notification => notification.userId === userId && !notification.isRead
        ).length;
      },
      
      markAsRead: async (notificationId) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            notifications: state.notifications.map(notification => 
              notification.id === notificationId 
                ? { ...notification, isRead: true } 
                : notification
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      markAllAsRead: async (userId) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            notifications: state.notifications.map(notification => 
              notification.userId === userId 
                ? { ...notification, isRead: true } 
                : notification
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      deleteNotification: async (notificationId) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            notifications: state.notifications.filter(
              notification => notification.id !== notificationId
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      // Dish Notifications
      addDishNotification: async (notificationData) => {
        set({ isLoading: true, error: null });
        
        try {
          // Generate a unique ID
          const id = Math.random().toString(36).substring(2, 15);
          
          const newNotification: DishNotification = {
            id,
            ...notificationData,
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            dishNotifications: [...state.dishNotifications, newNotification],
            isLoading: false,
          }));
          
          return newNotification;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      getDishNotificationsByUser: (userId) => {
        return get().dishNotifications.filter(notification => notification.userId === userId);
      },
      
      getActiveDishNotifications: (userId) => {
        return get().dishNotifications.filter(
          notification => notification.userId === userId && notification.isActive
        );
      },
      
      toggleDishNotificationStatus: async (notificationId, isActive) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            dishNotifications: state.dishNotifications.map(notification => 
              notification.id === notificationId 
                ? { ...notification, isActive } 
                : notification
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
      
      deleteDishNotification: async (notificationId) => {
        set({ isLoading: true, error: null });
        
        try {
          set((state) => ({
            dishNotifications: state.dishNotifications.filter(
              notification => notification.id !== notificationId
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
          throw error;
        }
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);