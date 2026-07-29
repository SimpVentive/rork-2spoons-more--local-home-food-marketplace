import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Notification, DishNotification } from '@/types';
import { zustandStorage } from '@/lib/storage';

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

function rowToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    message: row.message as string,
    type: (row.type as Notification['type']) || 'system',
    relatedId: row.related_id as string | undefined,
    isRead: (row.is_read as boolean) || false,
    createdAt: row.created_at as string,
    data: row.data as any,
  };
}

function rowToDishNotification(row: Record<string, unknown>): DishNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    dishName: row.dish_name as string | undefined,
    cuisineType: row.cuisine_type as string | undefined,
    subcuisineType: row.subcuisine_type as string | undefined,
    location: row.location as string | undefined,
    routeType: row.route_type as 'homeToOffice' | 'officeToHome' | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: row.created_at as string,
  };
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
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Fetch notifications error:', error.message);
            set({ error: error.message, isLoading: false });
            return;
          }

          set({ notifications: (data || []).map(rowToNotification), isLoading: false });

          // Also fetch dish notifications
          const { data: dishData, error: dishError } = await supabase
            .from('dish_notifications')
            .select('*')
            .eq('user_id', userId);

          if (!dishError) {
            set({ dishNotifications: (dishData || []).map(rowToDishNotification) });
          }
        } catch (error) {
          set({ error: 'Failed to fetch notifications', isLoading: false });
        }
      },

      markAsRead: async (notificationId: string) => {
        try {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

          set(state => ({
            notifications: state.notifications.map(n =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          }));
        } catch (error) {
          console.error('Mark as read error:', error);
        }
      },

      markAllAsRead: async (userId: string) => {
        try {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

          set(state => ({
            notifications: state.notifications.map(n =>
              n.userId === userId ? { ...n, isRead: true } : n
            ),
          }));
        } catch (error) {
          console.error('Mark all as read error:', error);
        }
      },

      addNotification: async (notification) => {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .insert({
              user_id: notification.userId,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              related_id: notification.relatedId,
              is_read: false,
              data: notification.data,
            })
            .select()
            .single();

          if (error) {
            console.error('Add notification error:', error.message);
            return;
          }

          set(state => ({ notifications: [rowToNotification(data), ...state.notifications] }));
        } catch (error) {
          console.error('Add notification error:', error);
        }
      },

      deleteNotification: async (notificationId: string) => {
        try {
          await supabase.from('notifications').delete().eq('id', notificationId);
          set(state => ({ notifications: state.notifications.filter(n => n.id !== notificationId) }));
        } catch (error) {
          console.error('Delete notification error:', error);
        }
      },

      getUnreadCount: (userId: string) => {
        return get().notifications.filter(n => n.userId === userId && !n.isRead).length;
      },

      addDishNotification: async (notification) => {
        try {
          const { data, error } = await supabase
            .from('dish_notifications')
            .insert({
              user_id: notification.userId,
              dish_name: notification.dishName,
              cuisine_type: notification.cuisineType,
              subcuisine_type: notification.subcuisineType,
              location: notification.location,
              route_type: notification.routeType,
              email: notification.email,
              phone: notification.phone,
              is_active: true,
            })
            .select()
            .single();

          if (error) {
            console.error('Add dish notification error:', error.message);
            throw error;
          }

          set(state => ({ dishNotifications: [rowToDishNotification(data), ...state.dishNotifications] }));
        } catch (error) {
          console.error('Add dish notification error:', error);
          throw error;
        }
      },

      getDishNotifications: (userId: string) => {
        return get().dishNotifications.filter(n => n.userId === userId && n.isActive);
      },

      removeDishNotification: async (notificationId: string) => {
        try {
          await supabase
            .from('dish_notifications')
            .update({ is_active: false })
            .eq('id', notificationId);

          set(state => ({
            dishNotifications: state.dishNotifications.map(n =>
              n.id === notificationId ? { ...n, isActive: false } : n
            ),
          }));
        } catch (error) {
          console.error('Remove dish notification error:', error);
          throw error;
        }
      },

      checkRouteNotifications: async (_userId: string) => {
        // Route-based notifications require server-side logic (checking listings against user route).
        // This is a client-side stub — in production, use a Supabase Edge Function or Cloudflare Worker.
        try {
          const { dishNotifications } = get();
          const activeDishNotifications = dishNotifications.filter(n => n.isActive);

          for (const dishNotification of activeDishNotifications) {
            if (!dishNotification.dishName) continue;

            const { data: matchingListings } = await supabase
              .from('food_listings')
              .select('id')
              .eq('is_approved', true)
              .eq('is_active', true)
              .ilike('dish_name', `%${dishNotification.dishName}%`)
              .limit(1);

            if (matchingListings && matchingListings.length > 0) {
              const { data: existingNotification } = await supabase
                .from('notifications')
                .select('id')
                .eq('user_id', dishNotification.userId)
                .eq('type', 'route_dish')
                .eq('related_id', matchingListings[0].id)
                .limit(1);

              if (!existingNotification || existingNotification.length === 0) {
                await get().addNotification({
                  userId: dishNotification.userId,
                  title: `${dishNotification.dishName} Available Nearby!`,
                  message: `${dishNotification.dishName} is now available along your route. Tap to view details.`,
                  type: 'route_dish',
                  relatedId: matchingListings[0].id,
                  isRead: false,
                });
              }
            }
          }
        } catch (error) {
          console.error('Check route notifications error:', error);
        }
      },

      getRouteBasedNotifications: (userId: string) => {
        const { notifications } = get();
        return notifications.filter(
          n => n.userId === userId && n.type === 'route_dish' && !n.isRead
        );
      },
    }),
    {
      name: 'notifications-storage',
      storage: zustandStorage,
      partialize: (state) => ({
        dishNotifications: state.dishNotifications,
      }),
    }
  )
);
