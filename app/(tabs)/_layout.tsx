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
  Settings,
  Route,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, TouchableOpacity, Text, Modal, Pressable } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { user, userPreference } = useAuthStore();
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  
  // Check authentication in useEffect to avoid navigation during render
  useEffect(() => {
    const { isAuthenticated, userPreference } = useAuthStore.getState();
    
    if (!isAuthenticated) {
      router.replace('/(auth)');
    } else if (!userPreference) {
      router.replace('/user-preference');
    }
  }, []);

  const toggleMoreMenu = () => {
    setMoreMenuVisible(!moreMenuVisible);
  };

  const navigateTo = (route: string) => {
    setMoreMenuVisible(false);
    router.push(route);
  };

  // Determine if user is a seller/chef
  const isSeller = user?.isChef || userPreference?.type === 'seller';

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
        {/* Home - Always visible */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            tabBarLabel: 'Home',
          }}
        />
        
        {/* Explore (Search) - Always visible */}
        <Tabs.Screen
          name="search"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <Search size={24} color={color} />,
            tabBarLabel: 'Explore',
          }}
        />
        
        {/* Following - Only visible for sellers */}
        <Tabs.Screen
          name="following"
          options={{
            title: 'Following',
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
            tabBarLabel: 'Following',
            tabBarButton: isSeller ? undefined : () => null,
          }}
        />
        
        {/* Notifications/Alerts - Always visible */}
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color }) => <Bell size={24} color={color} />,
            tabBarLabel: 'Alerts',
          }}
        />
        
        {/* Profile - Always visible */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            tabBarLabel: 'Profile',
          }}
        />
        
        {/* More - Always visible and always last */}
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color }) => <MoreHorizontal size={24} color={color} />,
            tabBarLabel: 'More',
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent default navigation
              e.preventDefault();
              toggleMoreMenu();
            },
          }}
        />
        
        {/* Hidden tabs that will be accessible from the more menu */}
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
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
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="finances"
          options={{
            title: 'Wallet',
            tabBarButton: () => null,
          }}
        />
      </Tabs>

      {/* More Menu Modal */}
      <Modal
        visible={moreMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMoreMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMoreMenuVisible(false)}
        >
          <View style={styles.moreMenuContainer}>
            {/* Orders - Always visible */}
            <TouchableOpacity 
              style={styles.moreMenuItem}
              onPress={() => navigateTo('/(tabs)/orders')}
            >
              <ShoppingBag size={24} color={colors.text} />
              <Text style={styles.moreMenuItemText}>Orders</Text>
            </TouchableOpacity>
            
            {/* Following - Only for buyers (since sellers have it in main tab) */}
            {!isSeller && (
              <TouchableOpacity 
                style={styles.moreMenuItem}
                onPress={() => navigateTo('/(tabs)/following')}
              >
                <Users size={24} color={colors.text} />
                <Text style={styles.moreMenuItemText}>Following</Text>
              </TouchableOpacity>
            )}
            
            {/* Create Listing - Only for sellers */}
            {isSeller && (
              <TouchableOpacity 
                style={styles.moreMenuItem}
                onPress={() => navigateTo('/(tabs)/create')}
              >
                <PlusCircle size={24} color={colors.text} />
                <Text style={styles.moreMenuItemText}>Create Listing</Text>
              </TouchableOpacity>
            )}
            
            {/* Analytics - Only for sellers */}
            {isSeller && (
              <TouchableOpacity 
                style={styles.moreMenuItem}
                onPress={() => navigateTo('/(tabs)/analytics')}
              >
                <PieChart size={24} color={colors.text} />
                <Text style={styles.moreMenuItemText}>Analytics</Text>
              </TouchableOpacity>
            )}
            
            {/* Wallet - Always visible */}
            <TouchableOpacity 
              style={styles.moreMenuItem}
              onPress={() => navigateTo('/(tabs)/finances')}
            >
              <Wallet size={24} color={colors.text} />
              <Text style={styles.moreMenuItemText}>Wallet</Text>
            </TouchableOpacity>
            
            {/* Route Settings - Always visible */}
            <TouchableOpacity 
              style={styles.moreMenuItem}
              onPress={() => navigateTo('/route-settings')}
            >
              <Route size={24} color={colors.text} />
              <Text style={styles.moreMenuItemText}>Route Settings</Text>
            </TouchableOpacity>
            
            {/* Account Settings - Always visible */}
            <TouchableOpacity 
              style={styles.moreMenuItem}
              onPress={() => navigateTo('/edit-profile')}
            >
              <Settings size={24} color={colors.text} />
              <Text style={styles.moreMenuItemText}>Account Settings</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.white,
    paddingHorizontal: 8, // Add horizontal padding for better spacing
  },
  tabBarLabel: {
    fontSize: 10,
    marginTop: 0,
    paddingTop: 0,
  },
  tabBarItem: {
    height: 50,
    paddingVertical: 5,
    flex: 1, // Ensure equal distribution
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  moreMenuContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moreMenuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
    fontWeight: '500',
  },
});