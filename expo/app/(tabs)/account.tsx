import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SectionList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Settings,
  Bell,
  Route,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  User,
  Wallet,
  BarChart3,
  Users,
  FileText,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { EarningsCard } from '@/components/EarningsCard';
import colors from '@/constants/colors';
import designTokens from '@/constants/design-tokens';

interface MenuSection {
  title: string;
  data: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  color?: string;
  danger?: boolean;
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, userPreference, logout } = useAuthStore();
  const isSeller = userPreference?.type === 'seller';
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Mock earnings data - replace with real data from store/API
  const mockEarnings = [
    {
      id: 'earn_1',
      sellerId: user?.id || '',
      orderId: 'order_123',
      amount: 250,
      paymentMethod: 'cod' as const,
      status: 'credited' as const,
      buyerId: 'buyer_1',
      dishName: 'Biryani',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      creditedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'earn_2',
      sellerId: user?.id || '',
      orderId: 'order_124',
      amount: 180,
      paymentMethod: 'prepaid' as const,
      status: 'credited' as const,
      buyerId: 'buyer_2',
      dishName: 'Butter Chicken',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      creditedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'earn_3',
      sellerId: user?.id || '',
      orderId: 'order_125',
      amount: 320,
      paymentMethod: 'cod' as const,
      status: 'pending' as const,
      buyerId: 'buyer_3',
      dishName: 'Samosas',
      createdAt: new Date().toISOString(),
      confirmationDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const profileMenuItems: MenuItem[] = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      icon: <Edit3 size={20} color={colors.primary} />,
      onPress: () => router.push('/edit-profile'),
    },
    {
      id: 'route-settings',
      label: 'Route Settings',
      icon: <Route size={20} color={colors.primary} />,
      onPress: () => router.push('/route-settings'),
    },
  ];

  const preferencesMenuItems: MenuItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} color={colors.primary} />,
      onPress: () => router.push('/(tabs)/notifications'),
    },
    {
      id: 'settings',
      label: 'App Settings',
      icon: <Settings size={20} color={colors.primary} />,
      onPress: () => {
        Alert.alert('Coming Soon', 'App settings will be available soon');
      },
    },
  ];

  const sellerMenuItems: MenuItem[] = isSeller
    ? [
        {
          id: 'analytics',
          label: 'Analytics',
          icon: <BarChart3 size={20} color={colors.secondary} />,
          onPress: () => router.push('/(tabs)/analytics'),
        },
        {
          id: 'wallet',
          label: 'Wallet',
          icon: <Wallet size={20} color={colors.secondary} />,
          onPress: () => router.push('/(tabs)/finances'),
        },
        {
          id: 'followers',
          label: 'Followers',
          icon: <Users size={20} color={colors.secondary} />,
          onPress: () => router.push('/(tabs)/following'),
        },
      ]
    : [
        {
          id: 'orders',
          label: 'Orders',
          icon: <FileText size={20} color={colors.secondary} />,
          onPress: () => router.push('/(tabs)/orders'),
        },
        {
          id: 'wallet',
          label: 'Wallet',
          icon: <Wallet size={20} color={colors.secondary} />,
          onPress: () => router.push('/(tabs)/finances'),
        },
        {
          id: 'following',
          label: 'Following',
          icon: <Users size={20} color={colors.secondary} />,
          onPress: () => router.push('/(tabs)/following'),
        },
      ];

  const supportMenuItems: MenuItem[] = [
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle size={20} color={colors.info} />,
      onPress: () => {
        Alert.alert('Help & Support', 'Support chat will be available soon');
      },
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut size={20} color={colors.error} />,
      onPress: handleLogout,
      danger: true,
    },
  ];

  const sections: MenuSection[] = [
    {
      title: 'Account',
      data: profileMenuItems,
    },
    {
      title: isSeller ? 'Seller' : 'Customer',
      data: sellerMenuItems,
    },
    {
      title: 'Preferences',
      data: preferencesMenuItems,
    },
    {
      title: 'Support',
      data: supportMenuItems,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.profileImage }}
          style={styles.profileImage}
          contentFit="cover"
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isSeller ? colors.secondary : colors.primary,
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {isSeller ? '👨‍🍳 Chef' : '🛒 Buyer'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Earnings Section for Sellers */}
      {isSeller && (
        <View style={styles.earningsSection}>
          <EarningsCard
            totalEarnings={mockEarnings
              .filter(e => e.status === 'credited')
              .reduce((sum, e) => sum + (e.amount || 0), 0)}
            pendingAmount={mockEarnings
              .filter(e => e.status === 'pending')
              .reduce((sum, e) => sum + (e.amount || 0), 0)}
            creditedAmount={mockEarnings
              .filter(e => e.status === 'credited')
              .reduce((sum, e) => sum + (e.amount || 0), 0)}
            transactions={mockEarnings}
            period={period}
            onPeriodChange={setPeriod}
          />
        </View>
      )}

      {/* Menu Sections */}
      {sections.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuSection}>
            {section.data.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index !== section.data.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
                activeOpacity={0.6}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.iconContainer}>{item.icon}</View>
                  <Text
                    style={[
                      styles.menuItemLabel,
                      item.danger && styles.dangerText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={item.danger ? colors.error : colors.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>2Spoons v1.0.0</Text>
        <Text style={styles.footerSubText}>Local Home Food Marketplace</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: designTokens.spacing['2xl'],
    backgroundColor: designTokens.colors.white,
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.md,
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.border,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    color: designTokens.colors.text,
    marginBottom: designTokens.spacing.xs,
  },

  profileEmail: {
    fontSize: designTokens.typography.size.sm,
    color: designTokens.colors.textLight,
    marginBottom: designTokens.spacing.md,
  },

  badgeContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
  },

  badge: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.radius.full,
  },

  badgeText: {
    fontSize: designTokens.typography.size.xs,
    fontWeight: designTokens.typography.weight.semibold,
    color: designTokens.colors.white,
  },

  sectionTitle: {
    fontSize: designTokens.typography.size.xs,
    fontWeight: designTokens.typography.weight.bold,
    color: designTokens.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
  },

  menuSection: {
    backgroundColor: designTokens.colors.white,
    marginHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
    overflow: 'hidden',
    ...designTokens.shadows.sm,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.lg,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.border,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: designTokens.radius.md,
    backgroundColor: designTokens.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designTokens.spacing.lg,
  },

  menuItemLabel: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.medium,
    color: designTokens.colors.text,
  },

  dangerText: {
    color: designTokens.colors.error,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing['3xl'],
    borderTopWidth: 1,
    borderTopColor: designTokens.colors.border,
  },

  footerText: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
    color: designTokens.colors.text,
    marginBottom: designTokens.spacing.xs,
  },

  footerSubText: {
    fontSize: designTokens.typography.size.xs,
    color: designTokens.colors.textLight,
  },

  earningsSection: {
    marginHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
    backgroundColor: designTokens.colors.white,
    borderRadius: designTokens.radius.lg,
    overflow: 'hidden',
    ...designTokens.shadows.sm,
  },
});
