import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  Users, 
  Wallet, 
  Bell, 
  User, 
  PieChart, 
  PlusCircle,
  MoreHorizontal,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated, userPreference } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Wait for component to mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication and redirect if needed, but only after mounting
  useEffect(() => {
    if (!isMounted) return;
    
    // Add a small delay to ensure everything is properly initialized
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.replace('/(auth)');
        return;
      }
      
      if (!userPreference) {
        router.replace('/user-preference');
        return;
      }
      
      setHasCheckedAuth(true);
    };

    // Use setTimeout to ensure navigation happens after render
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isMounted, isAuthenticated, userPreference, router]);

  // Show loading while checking authentication
  if (!isMounted || !hasCheckedAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Don't render tabs if not authenticated or no user preference
  if (!isAuthenticated || !userPreference) {
    return null;
  }

  // Determine if user is a seller/chef based on userPreference
  const isSeller = userPreference?.type === 'seller';

  return (
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
      {/* Home - Always visible and always first */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      
      {/* More - Always visible and always second (next to Home) */}
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <MoreHorizontal size={24} color={color} />,
          tabBarLabel: 'More',
        }}
      />
      
      {/* For Buyers: Explore, Alerts, Profile */}
      {!isSeller && (
        <>
          <Tabs.Screen
            name="search"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color }) => <Search size={24} color={color} />,
              tabBarLabel: 'Explore',
            }}
          />
          
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Alerts',
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
        </>
      )}
      
      {/* For Sellers: Profile, Create, Followers, Wallet */}
      {isSeller && (
        <>
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <User size={24} color={color} />,
              tabBarLabel: 'Profile',
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
            name="following"
            options={{
              title: 'Followers',
              tabBarIcon: ({ color }) => <Users size={24} color={color} />,
              tabBarLabel: 'Followers',
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
        </>
      )}
      
      {/* Hidden tabs that will be accessible from the more screen */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 85 : 60,
    paddingBottom: Platform.OS === 'ios' ? 25 : 5,
    paddingTop: 5,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
  },
  tabBarLabel: {
    fontSize: 10,
    marginTop: 0,
    paddingTop: 0,
  },
  tabBarItem: {
    height: 50,
    paddingVertical: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});