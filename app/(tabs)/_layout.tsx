import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { 
  Home, 
  History,
  Settings,
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
  MoreHorizontal,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text,Alert } from 'react-native';

export default function TabLayout(): React.ReactElement {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    userPreference: any;
    user: any;
  } | null>(null);
  const { user, switchRole } = useAuthStore();
  
  // Wait for component to mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get auth state after mounting
  useEffect(() => {
    if (!isMounted) return;
    
    const initializeAuth = async () => {
      try {
        console.log('TabLayout: Initializing auth...');
        
        // Initialize the auth store first
        await useAuthStore.getState().initialize();
        
        // Then get the state
        const { isAuthenticated, userPreference, user, isInitialized } = useAuthStore.getState();
        
        console.log('TabLayout: Auth state after init:', { 
          isAuthenticated, 
          userPreference, 
          isInitialized,
          userName: user?.name,
          isAdmin: user?.isAdmin 
        });
        
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
    
    console.log('TabLayout: Checking auth for navigation...', {
      isAuthenticated: authState.isAuthenticated,
      isAdmin: authState.user?.isAdmin,
      userPreference: authState.userPreference
    });
    
    // Add a small delay to ensure everything is properly initialized
    const checkAuth = async () => {
      try {
        if (!authState.isAuthenticated) {
          console.log('TabLayout: User not authenticated, redirecting to auth');
          router.replace('/(auth)');
          return;
        }
        
        // IMPORTANT: Admin users should NEVER see the tabs - redirect them immediately
        if (authState.user?.isAdmin === true) {
          console.log('TabLayout: Admin user detected, redirecting to admin panel');
          router.replace('/(admin)');
          return;
        }
        
        if (!authState.userPreference) {
          console.log('TabLayout: No user preference, redirecting to preference selection');
          router.replace('/user-preference');
          return;
        }
        
        console.log('TabLayout: User authenticated and ready for tabs');
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
  let isSeller = user?.isChef;

  // Calculate tab bar height with proper safe area handling for Android
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 80;

  const handleSwitchRolelay = async () => {
      try {
        await switchRole();
        console.log(user?.isChef);
        isSeller = user?.isChef;
      } catch (error) {
        Alert.alert('Error', 'Failed to switch role. Please try again.');
      }
  };
  console.log(isSeller)
  const screens = [
    
    
    {
      name: 'index',
      title: 'Home',
      icon: (color) => <Home size={24} color={color} />, 
      show: user?.isChef,
      tabbutton: true,
    },
	{
      name: 'orders',
      title: 'My Orders',
      icon: (color) => <ShoppingBag size={24} color={color} />, 
      show: user?.isChef,
      tabbutton: true,
    },
	{
      name: 'finances',
      title: 'Wallet',
      icon: (color) => <Wallet size={24} color={color} />, 
      show: user?.isChef,
      tabbutton: true,
    },	
	{
      name: 'index',
      title: 'Explore',
      icon: (color) => <Home size={24} color={color} />, 
      show: !user?.isChef,
      tabbutton: true,
    },
    {
      name: 'route-settings',
      title: 'Route Settings',
      icon: (color) => <Settings size={24} color={color} />, 
      show: !user?.isChef,
      tabbutton: true,
    },
	{
      name: 'following',
      title: 'Followers',
      icon: (color) => <Users size={24} color={color} />, 
      show: true,
      tabbutton: true,
    },
    {
      name: 'notifications',
      title: 'Notifications',
      icon: (color) => <Bell size={24} color={color} />, 
      show: !user?.isChef,
      tabbutton: true,
    },
    {
      name: 'more',
      title: 'More',
      icon: (color) => <MoreHorizontal size={24} color={color} />, 
      show: true,
      tabbutton: true,
    },
    {
        name: 'search',
        title: 'Search',
        icon: null, 
        show: true,
        tabbutton: false,
      },
    {
        name: 'analytics',
        title: 'Analytics',
        icon: null, 
        show: true,
        tabbutton: false,
      },
    {
        name: 'create',
        title: 'Create',
        icon: null, 
        show: true,
        tabbutton: false,
      },
  ];
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
            onPress={handleSwitchRolelay}
          >
            <RefreshCw size={16} color={colors.primary} />
            <Text style={styles.switchButtonText}>
              {user?.isChef ? 'Buyer' : 'Seller'}
            </Text>
          </TouchableOpacity>
        ),
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
      }}
    >
      
      {screens.filter(screen => screen.show).map(screen => {
        if (screen.show) {
        if (screen.tabbutton) {          
          return (
            <Tabs.Screen
              key={screen.name}
              name={screen.name}
              options={{
                title: screen.title,
                tabBarIcon: ({ color }) => screen.icon ? screen.icon(color) : null,
              }}
            />
          );
        } else {
          return (
            <Tabs.Screen
              key={screen.name}
              name={screen.name}
              options={{
                title: screen.title,
                tabBarButton: () => null,
              }}
            />
          );
        }
        }
        else{
          return null
        }
      })}
      
      
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