import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  ShoppingBag, 
  MessageSquare, 
  Users, 
  Info, 
  Utensils,
  Check,
  ChevronRight,
  MapPin,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { Notification } from '@/types';

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'New Order',
    message: 'Your order for Butter Chicken has been accepted',
    type: 'order',
    relatedId: 'order1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: '2',
    userId: 'user1',
    title: 'New Review',
    message: 'Rahul left a 5-star review on your Paneer Tikka',
    type: 'review',
    relatedId: 'review1',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    userId: 'user1',
    title: 'New Follower',
    message: 'Priya started following you',
    type: 'system',
    relatedId: 'user2',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Dish Alert',
    message: 'Biryani is now available near you',
    type: 'system',
    relatedId: 'listing1',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
  },
  {
    id: '5',
    userId: 'user1',
    title: 'System Update',
    message: 'We have updated our terms of service',
    type: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  const router = useRouter();
  
  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, fetch notifications from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const markAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, isRead: true }))
    );
  };
  
  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        router.push(`/order/${notification.relatedId}` as any);
        break;
      case 'review':
        router.push(`/profile/${user?.id}` as any);
        break;
      case 'promotion':
        // Handle promotion notifications
        break;
      case 'system':
        // Maybe show a modal with more info
        break;
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={24} color={colors.primary} />;
      case 'review':
        return <MessageSquare size={24} color="#FF9800" />;
      case 'promotion':
        return <Info size={24} color="#FF9800" />;
      case 'system':
        return <Info size={24} color="#2196F3" />;
      default:
        return <Bell size={24} color={colors.primary} />;
    }
  };
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} min ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hr ago`;
    } else {
      return `${diffDay} day ago`;
    }
  };
  
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);
  
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  if (!user) {
    return (
      <EmptyState
        title="Not Logged In"
        message="Please log in to view your notifications"
        buttonTitle="Login"
        onButtonPress={() => router.replace('/(auth)' as any)}
      />
    );
  }
  
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
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
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'all' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'unread' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('unread')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'unread' && styles.activeTabText,
            ]}>
              Unread
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={markAllAsRead}
          >
            <Check size={16} color={colors.primary} />
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          message={activeTab === 'all' 
            ? "You don't have any notifications yet" 
            : "You don't have any unread notifications"
          }
          image="https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d"
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
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