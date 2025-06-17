import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, DishNotification } from '@/types';
import { api } from '@/lib/api'; // Your configured Axios instance
import { useAuthStore } from './auth-store'; // For token auth

interface NotificationsState {
  notifications: Notification[];
  dishNotifications: DishNotification[];
  isLoading: boolean;
  error: string | null;

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<Notification>;
  getNotificationsByUser: (userId: string) => Promise<Notification[]>;
  getUnreadNotificationCount: (userId: string) => number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  addDishNotification: (notification: Omit<DishNotification, 'id' | 'createdAt'>) => Promise<DishNotification>;
  getDishNotificationsByUser: (userId: string) => Promise<DishNotification[]>;
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
          const token = useAuthStore.getState().token;
          const res = await api.post('/api/notifications/', notificationData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set(state => ({
            notifications: [res.data, ...state.notifications],
            isLoading: false,
          }));
          return res.data;
        } catch (err) {
          set({ isLoading: false, error: 'Failed to add notification' });
          throw err;
        }
      },

      getNotificationsByUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const token = useAuthStore.getState().token;
          const res = await api.get(`/api/notifications/?user_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ notifications: res.data, isLoading: false });
          return res.data;
        } catch (err) {
          set({ isLoading: false, error: 'Failed to fetch notifications' });
          return [];
        }
      },

      getUnreadNotificationCount: (userId) => {
        return get().notifications.filter(n => n.userId === userId && !n.isRead).length;
      },

      markAsRead: async (notificationId) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          await api.patch(`/api/notifications/${notificationId}/read/`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });

          set(state => ({
            notifications: state.notifications.map(n =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false, error: 'Failed to mark as read' });
          throw err;
        }
      },

      markAllAsRead: async (userId) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          await api.patch(`/api/notifications/mark_all/`, { userId }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set(state => ({
            notifications: state.notifications.map(n =>
              n.userId === userId ? { ...n, isRead: true } : n
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false, error: 'Failed to mark all as read' });
          throw err;
        }
      },

      deleteNotification: async (notificationId) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          await api.delete(`/api/notifications/${notificationId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== notificationId),
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false, error: 'Failed to delete notification' });
          throw err;
        }
      },

      addDishNotification: async (notificationData) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          const res = await api.post('/api/dish-notifications/', notificationData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set(state => ({
            dishNotifications: [...state.dishNotifications, res.data],
            isLoading: false,
          }));
          return res.data;
        } catch (err) {
          set({ isLoading: false, error: 'Failed to add dish notification' });
          throw err;
        }
      },

      getDishNotificationsByUser: async (userId) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          const res = await api.get(`/api/dish-notifications/?user_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ dishNotifications: res.data, isLoading: false });
          return res.data;
        } catch (err) {
          set({ isLoading: false, error: 'Failed to fetch dish notifications' });
          return [];
        }
      },

      getActiveDishNotifications: (userId) => {
        return get().dishNotifications.filter(n => n.userId === userId && n.isActive);
      },

      toggleDishNotificationStatus: async (notificationId, isActive) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          await api.patch(`/api/dish-notifications/${notificationId}/`, { isActive }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set(state => ({
            dishNotifications: state.dishNotifications.map(n =>
              n.id === notificationId ? { ...n, isActive } : n
            ),
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false, error: 'Failed to update dish notification' });
          throw err;
        }
      },

      deleteDishNotification: async (notificationId) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token;
          await api.delete(`/api/dish-notifications/${notificationId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set(state => ({
            dishNotifications: state.dishNotifications.filter(n => n.id !== notificationId),
            isLoading: false,
          }));
        } catch (err) {
          set({ isLoading: false, error: 'Failed to delete dish notification' });
          throw err;
        }
      },
    }),
    {
      name: 'notifications-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
