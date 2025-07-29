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
  UtensilsCrossed,
  MapPin,
  ChefHat,
  CreditCard,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

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
  // Custom tab bar icon component with notification badge
  const TabIcon = ({ icon, color, focused, badgeCount }: { 
    icon: React.ReactNode; 
    color: string; 
    focused: boolean;
    badgeCount?: number;
  }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const glowAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      if (focused) {
        // Haptic feedback on tab switch
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        
        // Scale animation
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
        
        // Glow animation
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
        
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }, [focused]);

    const glowColor = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255, 107, 53, 0)', 'rgba(255, 107, 53, 0.3)'],
    });

    return (
      <View style={styles.tabIconContainer}>
        <Animated.View 
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale: scaleAnim }],
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: focused ? 8 : 0,
              elevation: focused ? 8 : 0,
            }
          ]}
        >
          {icon}
        </Animated.View>
        {badgeCount && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount.toString()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const screens = [
    {
      name: 'index',
      title: 'Home',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<ChefHat size={24} color={color} />} 
          color={color} 
          focused={focused}
        />
      ), 
      show: user?.isChef,
      tabbutton: true,
    },
	{
      name: 'orders',
      title: 'My Orders',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<UtensilsCrossed size={24} color={color} />} 
          color={color} 
          focused={focused}
          badgeCount={3} // Mock notification count
        />
      ), 
      show: user?.isChef,
      tabbutton: true,
    },
	{
      name: 'finances',
      title: 'Wallet',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<CreditCard size={24} color={color} />} 
          color={color} 
          focused={focused}
        />
      ), 
      show: user?.isChef,
      tabbutton: true,
    },	
	{
      name: 'index',
      title: 'Explore',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<Home size={24} color={color} />} 
          color={color} 
          focused={focused}
        />
      ), 
      show: !user?.isChef,
      tabbutton: true,
    },
    {
      name: 'route-settings',
      title: 'Route Settings',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<MapPin size={24} color={color} />} 
          color={color} 
          focused={focused}
          badgeCount={1} // Mock notification for new routes
        />
      ), 
      show: !user?.isChef,
      tabbutton: true,
    },
	{
      name: 'following',
      title: 'Following',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<Heart size={24} color={color} />} 
          color={color} 
          focused={focused}
        />
      ), 
      show: true,
      tabbutton: true,
    },
    {
      name: 'more',
      title: 'More',
      icon: (color: string, focused: boolean) => (
        <TabIcon 
          icon={<User size={24} color={color} />} 
          color={color} 
          focused={focused}
        />
      ), 
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
            paddingTop: Platform.OS === 'ios' ? 12 : 8,
            paddingBottom: Platform.OS === 'ios' ? 28 : 20,
            paddingHorizontal: 16,
            zIndex: 9999,
            elevation: 30,
            marginHorizontal: 16,
            marginBottom: Platform.OS === 'ios' ? 20 : 16,
            borderRadius: 24,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
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
                tabBarIcon: ({ color, focused }) => screen.icon ? screen.icon(color, focused) : null,
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
    backgroundColor: colors.white,
    borderTopWidth: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBarLabel: {
    fontSize: Platform.OS === 'android' ? 10 : 9,
    marginTop: Platform.OS === 'android' ? 2 : 1,
    fontWeight: '600',
  },
  tabBarItem: {
    paddingVertical: Platform.OS === 'android' ? 6 : 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    borderRadius: 16,
    marginHorizontal: 2,
    height: Platform.OS === 'android' ? 52 : 54,
  },
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
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