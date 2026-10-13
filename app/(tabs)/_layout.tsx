import React, { useEffect } from 'react';
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
  Settings,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import designTokens from '@/constants/design-tokens';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { user, userPreference, isAuthenticated } = useAuthStore();

  // Check authentication in useEffect to avoid navigation during render
  useEffect(() => {
    const checkAuth = async () => {
      // Give the store time to hydrate from AsyncStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      const { isAuthenticated, userPreference } = useAuthStore.getState();

      if (!isAuthenticated) {
        router.replace('/(auth)');
      } else if (!userPreference) {
        router.replace('/user-preference');
      }
    };

    checkAuth();
  }, [router]);

  // Determine if user is a seller/chef based on userPreference
  const isSeller = userPreference?.type === 'seller';

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
            fontWeight: designTokens.typography.weight.semibold,
            fontSize: designTokens.typography.size.lg,
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

        {/* For Buyers: Explore, Alerts */}
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
          </>
        )}

        {/* For Sellers: Create, Followers */}
        {isSeller && (
          <>
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
          </>
        )}

        {/* Account - Always visible and always last */}
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
            tabBarLabel: 'Account',
          }}
        />

        {/* Hidden tabs (accessible from Account menu) */}
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
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="finances"
          options={{
            title: 'Finances',
            tabBarButton: () => null,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  tabBar: {
    borderTopColor: designTokens.colors.border,
    borderTopWidth: 1,
    height: designTokens.common.tabBarHeight,
    paddingBottom: Platform.OS === 'ios' ? designTokens.common.safeAreaPadding : designTokens.spacing.sm,
    paddingTop: designTokens.spacing.sm,
    ...designTokens.shadows.lg,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: designTokens.zIndex.modal,
    backgroundColor: designTokens.colors.white,
    paddingHorizontal: designTokens.spacing.sm,
  },
  tabBarLabel: {
    fontSize: designTokens.typography.size.xs,
    marginTop: 0,
    paddingTop: 0,
  },
  tabBarItem: {
    height: designTokens.common.buttonHeight.medium,
    paddingVertical: designTokens.spacing.sm,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});