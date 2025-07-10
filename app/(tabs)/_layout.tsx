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
  Menu,
  Route,
  RefreshCw,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    
    try {
      const { isAuthenticated, userPreference, user } = useAuthStore.getState();
      setAuthState({ isAuthenticated, userPreference, user });
      setHasCheckedAuth(true);
    } catch (error) {
      console.error('Error getting auth state:', error);
      setAuthState({ isAuthenticated: false, userPreference: null, user: null });
      setHasCheckedAuth(true);
    }
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
        
        if (!authState.userPreference) {
          router.replace('/user-preference');
          return;
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    };

    // Use setTimeout to ensure navigation happens after render
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isMounted, authState, hasCheckedAuth, router]);

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
  const isSeller = authState.userPreference?.type === 'seller' || authState.user?.isChef;

  // Calculate tab bar height with proper safe area handling for Android
  const tabBarHeight = Platform.OS === 'ios' 
    ? 80 + insets.bottom 
    : 80 + Math.max(insets.bottom, 20); // Increased minimum padding for Android

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
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 20),
            paddingTop: 12,
            // Fix Android overlap issue
            ...(Platform.OS === 'android' && {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTopWidth: 2,
              borderTopColor: colors.border,
              elevation: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }),
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
        tabBarItemStyle: [
          styles.tabBarItem,
          {
            height: Platform.OS === 'ios' ? 60 : 56,
            paddingBottom: Platform.OS === 'android' ? 8 : 0,
          }
        ],
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
                  <User size={24} color={color} />
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
                  <ShoppingBag size={24} color={color} />
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
                  <Wallet size={24} color={color} />
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
                  <Users size={24} color={color} />
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
                  <Menu size={24} color={color} />
                </View>
              ),
              tabBarLabel: 'More',
            }}
          />
        </>
      )}
      
      {/* For Buyers: More, Explore (landing), Route Settings, Following, Notifications */}
      {!isSeller && (
        <>
          <Tabs.Screen
            name="more"
            options={{
              title: 'More',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Menu size={24} color={color} />
                </View>
              ),
              tabBarLabel: 'More',
            }}
          />
          
          <Tabs.Screen
            name="index"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Search size={24} color={color} />
                </View>
              ),
              tabBarLabel: 'Explore',
            }}
          />
          
          <Tabs.Screen
            name="route-settings"
            options={{
              title: 'Route Settings',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Route size={24} color={color} />
                </View>
              ),
              tabBarLabel: 'Routes',
            }}
          />
          
          <Tabs.Screen
            name="following"
            options={{
              title: 'Following',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Users size={24} color={color} />
                </View>
              ),
              tabBarLabel: 'Following',
            }}
          />
          
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                  <Bell size={24} color={color} />
                </View>
              ),
              tabBarLabel: 'Alerts',
            }}
          />
        </>
      )}
      
      {/* Hidden tabs that will be accessible from the more screen */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
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
      
      {/* For sellers, hide the index tab */}
      {isSeller && (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarButton: () => null,
          }}
        />
      )}
      
      {/* For buyers, hide the profile tab */}
      {!isSeller && (
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarButton: () => null,
          }}
        />
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
    // Ensure proper positioning on Android
    ...(Platform.OS === 'android' && {
      marginBottom: 0,
      paddingBottom: 20,
    }),
  },
  tabBarLabel: {
    fontSize: Platform.OS === 'android' ? 11 : 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tabBarItem: {
    paddingVertical: 4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
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