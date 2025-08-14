import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { 
  Home, 
  User, 
  RefreshCw,
  Heart,
  UtensilsCrossed,
  MapPin,
  ChefHat,
  CreditCard,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { Platform, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function TabLayout(): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, userPreference, isInitialized, switchRole, initialize } = useAuthStore();
  
  // Initialize auth store on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isInitialized) {
          await initialize();
        }
        
        // Check auth state and redirect if needed
        const state = useAuthStore.getState();
        
        if (!state.isAuthenticated) {
          router.replace('/(auth)');
          return;
        }
        
        if (state.user?.isAdmin === true) {
          router.replace('/(admin)');
          return;
        }
        
        if (!state.userPreference) {
          router.replace('/user-preference');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Tab layout init error:', error);
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Show loading while initializing
  if (isLoading || !isAuthenticated || !userPreference || user?.isAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Loading...</Text>
      </View>
    );
  }

  const handleSwitchRole = async () => {
    try {
      await switchRole();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch role. Please try again.');
    }
  };

  // Simple tab icon without complex animations for better Android compatibility
  const TabIcon = ({ icon, badgeCount }: { 
    icon: React.ReactNode; 
    badgeCount?: number;
  }) => {
    return (
      <View style={styles.tabIconContainer}>
        <View style={styles.iconWrapper}>
          {icon}
        </View>
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

  // Simplified screen configuration for better Android compatibility
  const isChef = user?.isChef;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: {
          backgroundColor: colors.white,
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
              {isChef ? 'Buyer' : 'Seller'}
            </Text>
          </TouchableOpacity>
        ),
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Chef/Seller Tabs */}
      {isChef && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => (
                <TabIcon icon={<ChefHat size={24} color={color} />} />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: 'Orders',
              tabBarIcon: ({ color }) => (
                <TabIcon 
                  icon={<UtensilsCrossed size={24} color={color} />} 
                  badgeCount={3}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="finances"
            options={{
              title: 'Wallet',
              tabBarIcon: ({ color }) => (
                <TabIcon icon={<CreditCard size={24} color={color} />} />
              ),
            }}
          />
        </>
      )}
      
      {/* Buyer Tabs */}
      {!isChef && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Explore',
              tabBarIcon: ({ color }) => (
                <TabIcon icon={<Home size={24} color={color} />} />
              ),
            }}
          />
          <Tabs.Screen
            name="route-settings"
            options={{
              title: 'Routes',
              tabBarIcon: ({ color }) => (
                <TabIcon 
                  icon={<MapPin size={24} color={color} />} 
                  badgeCount={1}
                />
              ),
            }}
          />
        </>
      )}
      
      {/* Common Tabs */}
      <Tabs.Screen
        name="following"
        options={{
          title: 'Following',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<Heart size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => (
            <TabIcon icon={<User size={24} color={color} />} />
          ),
        }}
      />
      
      {/* Hidden screens */}
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'android' ? 65 : 85,
    paddingBottom: Platform.OS === 'android' ? 10 : 25,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 4,
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