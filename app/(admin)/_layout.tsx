import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Users, 
  MessageSquare, 
  Settings,
  Bell,
  BarChart3,
  Mail,
  DollarSign,
  LogOut
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';

export default function AdminLayout() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [authState, setAuthState] = useState<{
      isAuthenticated: boolean;
      userPreference: any;
      user: any;
    } | null>(null);

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
            router.replace('/(auth)' as any);
            return;
          }
          
          // IMPORTANT: Admin users should NEVER see the tabs - redirect them immediately
          if (authState.user?.isAdmin === true) {
            console.log('TabLayout: Admin user detected, redirecting to admin panel');
            router.replace('/(admin)' as any);
            return;
          }
          else{
            console.log('TabLayout: Admin user detected, redirecting to user panel');
            router.replace('/(tabs)');
            return;
          }
          
          if (authState?.userPreference === undefined || authState?.userPreference === null) {
            console.log('TabLayout: No user preference, redirecting to preference selection');
            router.replace('/user-preference' as any);
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
  const handleLogout = () => {
    logout();
    router.replace('/(auth)' as any);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    { 
      icon: <LayoutDashboard size={24} color={isActive('/(admin)') ? colors.white : colors.textLight} />, 
      label: 'Dashboard', 
      path: '/(admin)' 
    },
    { 
      icon: <Tag size={24} color={isActive('/(admin)/listings') ? colors.white : colors.textLight} />, 
      label: 'Listings', 
      path: '/(admin)/listings' 
    },
    { 
      icon: <ShoppingBag size={24} color={isActive('/(admin)/orders') ? colors.white : colors.textLight} />, 
      label: 'Orders', 
      path: '/(admin)/orders' 
    },
    { 
      icon: <Users size={24} color={isActive('/(admin)/users') ? colors.white : colors.textLight} />, 
      label: 'Users', 
      path: '/(admin)/users' 
    },
    { 
      icon: <MessageSquare size={24} color={isActive('/(admin)/complaints') ? colors.white : colors.textLight} />, 
      label: 'Complaints', 
      path: '/(admin)/complaints' 
    },
    { 
      icon: <Bell size={24} color={isActive('/(admin)/campaigns') ? colors.white : colors.textLight} />, 
      label: 'Campaigns', 
      path: '/(admin)/campaigns' 
    },
    { 
      icon: <Mail size={24} color={isActive('/(admin)/messaging') ? colors.white : colors.textLight} />, 
      label: 'Messaging', 
      path: '/(admin)/messaging' 
    },
    { 
      icon: <DollarSign size={24} color={isActive('/(admin)/top-earners') ? colors.white : colors.textLight} />, 
      label: 'Top Earners', 
      path: '/(admin)/top-earners' 
    },
    { 
      icon: <BarChart3 size={24} color={isActive('/(admin)/analytics') ? colors.white : colors.textLight} />, 
      label: 'Analytics', 
      path: '/(admin)/analytics' 
    },
    { 
      icon: <Settings size={24} color={isActive('/(admin)/settings') ? colors.white : colors.textLight} />, 
      label: 'Settings', 
      path: '/(admin)/settings' 
    },
  ];

  // On web, show a sidebar. On mobile, use a Stack navigator
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Admin Panel</Text>
          </View>
          
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  isActive(item.path) && styles.menuItemActive
                ]}
                onPress={() => router.push(item.path as any)}
              >
                {item.icon}
                <Text style={[
                  styles.menuItemText,
                  isActive(item.path) && styles.menuItemTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={24} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <View style={styles.content}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </View>
      </View>
    );
  }

  // Mobile layout
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.adminPrimary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="listings"
        options={{
          title: 'Manage Listings',
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Manage Orders',
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Manage Users',
        }}
      />
      <Stack.Screen
        name="complaints"
        options={{
          title: 'Manage Complaints',
        }}
      />
      <Stack.Screen
        name="campaigns"
        options={{
          title: 'Campaigns',
        }}
      />
      <Stack.Screen
        name="messaging"
        options={{
          title: 'Messaging',
        }}
      />
      <Stack.Screen
        name="top-earners"
        options={{
          title: 'Top Earners',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    height: '100%',
  },
  sidebarHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.adminPrimary,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemActive: {
    backgroundColor: colors.adminPrimary,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.text,
  },
  menuItemTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 12,
    color: colors.error,
  },
  content: {
    flex: 1,
  },
});