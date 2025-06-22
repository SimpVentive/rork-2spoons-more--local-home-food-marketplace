import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Home, Search, ShoppingBag, Users, Wallet, Bell, User, PieChart, PlusCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Check authentication in useEffect to avoid navigation during render
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: {
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          tabBarItemStyle: styles.tabBarItem,
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
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
            tabBarLabel: 'Create',
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
            tabBarLabel: 'Analytics',
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
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  tabBar: {
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingBottom: Platform.OS === 'ios' ? 25 : 5,
    paddingTop: 5,
    elevation: 24, // Increased elevation for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'absolute', // Make sure it's positioned absolutely
    bottom: 0, // Position at the bottom
    left: 0,
    right: 0,
    zIndex: 1000, // Increased zIndex to ensure it's above other content
    backgroundColor: colors.white, // Ensure background color is set
  },
  tabBarLabel: {
    fontSize: 10,
    marginTop: 0,
    paddingTop: 0,
  },
  tabBarItem: {
    height: 50,
    paddingVertical: 5,
  },
});