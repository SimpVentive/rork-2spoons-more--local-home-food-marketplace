import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  RefreshControl, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

import { 
  Bell, ShoppingBag, MessageSquare, Users, Info, 
  Utensils, Check, ChevronRight
} from 'lucide-react-native';

import { useAuthStore } from '@/store/auth-store';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { Notification } from '@/types';
import { api } from '@/lib/api';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get('api/notifications/'); // 🔧 Set your Django URL
      setNotifications(res.data);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      Alert.alert('Error', 'Unable to fetch notifications from the server.');
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  /*const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    // Optionally PATCH to backend to persist read state
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // Optionally PATCH all to backend
  };*/

  const markAsRead = async (id: string) => {
  setNotifications(prev =>
    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
  );

  try {
    await api.patch(`api/notifications/mark-read/${id}/`);
  } catch (e) {
    console.error('Failed to mark as read', e);
  }
};

const markAllAsRead = async () => {
  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  try {
    await api.patch(`api/notifications/mark-all-read/`);
  } catch (e) {
    console.error('Failed to mark all as read', e);
  }
};


  const handleNotificationPress = (n: Notification) => {
    markAsRead(n.id);
    switch (n.type) {
      case 'order': router.push(`/order/${n.relatedId}`); break;
      case 'review': router.push(`/profile/${user?.id}`); break;
      case 'follow': router.push(`/profile/${n.relatedId}`); break;
      case 'dish': router.push(`/listing/${n.relatedId}`); break;
      case 'system': /* handle system notifications */ break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag size={24} color={colors.primary} />;
      case 'review': return <MessageSquare size={24} color="#FF9800" />;
      case 'follow': return <Users size={24} color="#9C27B0" />;
      case 'dish': return <Utensils size={24} color={colors.success} />;
      case 'system': return <Info size={24} color="#2196F3" />;
      default: return <Bell size={24} color={colors.primary} />;
    }
  };

  const getTimeAgo = (dt: string) => {
    const date = new Date(dt);
    const diff = Date.now() - date.getTime();
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return 'just now';
    if (min < 60) return `${min} min ago`;
    if (hr < 24) return `${hr} hr ago`;
    return `${day} day ago`;
  };

  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view your notifications"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)')}
      />
    );
  }

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => !n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{getTimeAgo(item.createdAt)}</Text>
      </View>
      <ChevronRight size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          {['all', 'unread'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as 'all' | 'unread')}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {tab === 'unread' && unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllReadButton} onPress={markAllAsRead}>
            <Check size={16} color={colors.primary} />
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      {filtered.length === 0 ? (
        <EmptyState
          title="No Notifications"
          message={
            activeTab === 'all'
              ? "You don't have any notifications yet"
              : "You don't have any unread notifications"
          }
          image="https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d"
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.white,
    shadowColor: colors.shadow, // Now using the shadow color from constants
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  markAllReadText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  listContainer: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadNotification: {
    backgroundColor: `${colors.primary}08`,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textLight,
  },
});