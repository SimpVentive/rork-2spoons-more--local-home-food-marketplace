import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Home, Search, ShoppingBag, Users, Wallet, Bell, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthenticated) {
      // Redirect to the auth flow
      router.replace('/(auth)');
    }
  }, [isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 0,
          paddingTop: 0,
        },
        headerStyle: {
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarItemStyle: {
          paddingVertical: 10,
          height: 50,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
          tabBarLabel: 'Explore',
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
          tabBarLabel: 'Orders',
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: 'Following',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          tabBarLabel: 'Following',
        }}
      />
      <Tabs.Screen
        name="finances"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
          tabBarLabel: 'Wallet',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
          tabBarLabel: 'Alerts',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          tabBarLabel: 'Profile',
        }}
      />
      {/* Remove the create tab from the tab bar but keep it accessible via router */}
      <Tabs.Screen
        name="create"
        options={{
          href: null,
        }}
      />
      {/* Remove analytics from tab bar */}
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}