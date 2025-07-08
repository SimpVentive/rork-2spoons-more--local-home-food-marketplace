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
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    userPreference: any;
  } | null>(null);
  
  // Wait for component to mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get auth state after mounting
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      const { isAuthenticated, userPreference } = useAuthStore.getState();
      setAuthState({ isAuthenticated, userPreference });
    } catch (error) {
      console.error('Error getting auth state:', error);
      setAuthState({ isAuthenticated: false, userPreference: null });
    }
  }, [isMounted]);

  // Check authentication and redirect if needed, but only after mounting and getting auth state
  useEffect(() => {
    if (!isMounted || !authState) return;
    
    // Add a small delay to ensure everything is properly initialized
    const checkAuth = async () => {
      try {
        if (!authState.isAuthenticated) {
          router.replace('/(auth)');
          return;
        }
        
        if (!authState.userPreference) {
          router.replace('/user-preference');
          return;
        }
        
        setHasCheckedAuth(true);
      } catch (error) {
        console.error('Navigation error:', error);
        setHasCheckedAuth(true);
      }
    };

    // Use setTimeout to ensure navigation happens after render
    const timeoutId = setTimeout(checkAuth, 200);
    
    return () => clearTimeout(timeoutId);
  }, [isMounted, authState, router]);

  // Show loading while checking authentication
  if (!isMounted || !authState || !hasCheckedAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Don't render tabs if not authenticated or no user preference
  if (!authState.isAuthenticated || !authState.userPreference) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Determine if user is a seller/chef based on userPreference
  const isSeller = authState.userPreference?.type === 'seller';

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
      {!isSeller ? [
        <Tabs.Screen
          key="search"
          name="search"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Search size={24} color={color} />,
            tabBarLabel: 'Explore',
          }}
        />,
        
        <Tabs.Screen
          key="notifications"
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
            tabBarLabel: 'Alerts',
          }}
        />,
        
        <Tabs.Screen
          key="profile"
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            tabBarLabel: 'Profile',
          }}
        />
      ] as const : null}
      
      {/* For Sellers: Profile, Create, Followers, Wallet */}
      {isSeller ? [
        <Tabs.Screen
          key="profile"
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            tabBarLabel: 'Profile',
          }}
        />,
        
        <Tabs.Screen
          key="create"
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} />,
            tabBarLabel: 'Create',
          }}
        />,
        
        <Tabs.Screen
          key="following"
          name="following"
          options={{
            title: 'Followers',
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
            tabBarLabel: 'Followers',
          }}
        />,
        
        <Tabs.Screen
          key="finances"
          name="finances"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
            tabBarLabel: 'Wallet',
          }}
        />
      ] as const : null}
      
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