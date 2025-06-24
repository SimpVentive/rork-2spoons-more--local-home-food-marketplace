import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
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
  const pathname = usePathname();
  const { user,logout } = useAuthStore();
  useEffect(() => {
      if (!user) {
        router.replace('/(auth)');
      }
  }, [user]);
  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
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
                onPress={() => router.push(item.path)}
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