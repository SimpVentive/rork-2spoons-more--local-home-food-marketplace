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
  Route,
  RefreshCw,
  Menu,
  Heart,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';

export default function TabLayout(): React.ReactElement {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    userPreference: any;
    user: any;
  } | null>(null);
  const { switchRole } = useAuthStore();
  
  // Wait for component to mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get auth state after mounting
  useEffect(() => {
    if (!isMounted) return;
    
    const initializeAuth = async () => {
      try {
        // Initialize the auth store first
        await useAuthStore.getState().initialize();
        
        // Then get the state
        const { isAuthenticated, userPreference, user } = useAuthStore.getState();
        setAuthState({ isAuthenticated, userPreference, user });
        setHasCheckedAuth(true);
      } catch (error) {
        console.error('Error getting auth state:', error);
        setAuthState({ isAuthenticated: false, userPreference: null, user: null });
        setHasCheckedAuth(true);
      }
    };
    
    initializeAuth();
  }, [isMounted]);

  // Check authentication and redirect if needed, but only after mounting and getting auth state
  useEffect(() => {
    if (!isMounted || !authState || !hasCheckedAuth) return;
    
    // Add a small delay to ensure everything is properly initialized
    const checkAuth = async () => {
      try {
        if (!authState.isAuthenticated) {
          router.replace('/(auth)');
          return;
        }
        
        // IMPORTANT: Admin users should NEVER see the tabs - redirect them immediately
        if (authState.user?.isAdmin === true) {
          router.replace('/(admin)');
          return;
        }
        
        if (!authState.userPreference) {
          router.replace('/user-preference');
          return;
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Don't redirect on error, let user stay in tabs
      }
    };

    // Use setTimeout to ensure navigation happens after render
    const timeoutId = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timeoutId);
  }, [isMounted, authState, hasCheckedAuth, router]);

  // Show loading while checking authentication
  if (!isMounted || !authState || !hasCheckedAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Initializing...</Text>
      </View>
    );
  }

  // Don't render tabs if not authenticated or no user preference
  // Admin users should be redirected in the useEffect above
  if (!authState.isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Authenticating...</Text>
      </View>
    );
  }
  
  // Additional safety check for admin users
  if (authState.user?.isAdmin === true) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Redirecting to admin...</Text>
      </View>
    );
  }
  
  // If no user preference, show loading (will redirect in useEffect)
  if (!authState.userPreference) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Setting up preferences...</Text>
      </View>
    );
  }

  // Determine if user is a seller/chef based on userPreference
  const isSeller = authState.userPreference?.type === 'seller' || authState.user?.isChef;

  // Calculate tab bar height with proper safe area handling for Android
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 80;

  const handleSwitchRole = async () => {
    try {
      await switchRole();
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingTop: Platform.OS === 'ios' ? 8 : 6,
            paddingBottom: Platform.OS === 'ios' ? 25 : 18,
            paddingHorizontal: 6,
            zIndex: 1000,
            elevation: 20,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: {
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerRight: () => (
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={handleSwitchRole}
          >
            <RefreshCw size={16} color={colors.primary} />
            <Text style={styles.switchButtonText}>
              {isSeller ? 'Buyer' : 'Seller'}
            </Text>
          </TouchableOpacity>
        ),
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
      }}
    >
      {/* For Sellers: Profile (landing), Orders, Wallet, Followers, More */}
      {isSeller && (
        <>
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <User size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Profile',
            }}
          />
          
          <Tabs.Screen
            name="orders"
            options={{
              title: 'My Orders',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <ShoppingBag size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Orders',
            }}
          />
          
          <Tabs.Screen
            name="finances"
            options={{
              title: 'Wallet',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Wallet size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Wallet',
            }}
          />
          
          <Tabs.Screen
            name="following"
            options={{
              title: 'Followers',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Users size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Followers',
            }}
          />
          
          <Tabs.Screen
            name="more"
            options={{
              title: 'More',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Menu size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'More',
            }}
          />
        </>
      )}
      
      {/* For Buyers: Home, Search, Following, Profile */}
      {!isSeller && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Home size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Home',
            }}
          />
          
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Search size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Search',
            }}
          />
          
          <Tabs.Screen
            name="following"
            options={{
              title: 'Following',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Heart size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Following',
            }}
          />
          
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <User size={Platform.OS === 'android' ? 20 : 22} color={color} />
                </View>
              ),
              tabBarLabel: 'Profile',
            }}
          />
        </>
      )}
      
      {/* Hidden tabs that will be accessible from the more screen */}
      <Tabs.Screen
        name="route-settings"
        options={{
          title: 'Route Settings',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
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
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarButton: () => null,
        }}
      />
      
      {/* For sellers, hide the index and search tabs */}
      {isSeller && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarButton: () => null,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarButton: () => null,
            }}
          />
        </>
      )}
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
    borderTopWidth: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 12,
  },
  tabBarLabel: {
    fontSize: Platform.OS === 'android' ? 11 : 10,
    marginTop: Platform.OS === 'android' ? 4 : 2,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingVertical: Platform.OS === 'android' ? 4 : 6,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 55,
    borderRadius: 8,
    marginHorizontal: 1,
    height: Platform.OS === 'android' ? 48 : 50,
  },
  iconContainer: {
    width: Platform.OS === 'android' ? 32 : 36,
    height: Platform.OS === 'android' ? 32 : 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Platform.OS === 'android' ? 16 : 18,
  },
  focusedIconContainer: {
    backgroundColor: `${colors.primary}15`,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: `${colors.primary}10`,
  },
  switchButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});