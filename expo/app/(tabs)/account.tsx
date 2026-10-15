import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
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
import { supabase } from '@/lib/supabase';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sellerEarnings, setSellerEarnings] = useState<Array<{
    id: string;
    sellerId: string;
    orderId: string;
    amount: number;
    paymentMethod: 'cod' | 'prepaid';
    status: 'pending' | 'credited' | 'failed';
    buyerId?: string;
    dishName?: string;
    createdAt: string;
    creditedAt?: string;
    confirmationDeadline?: string;
    updatedAt?: string;
  }>>([]);

  useEffect(() => {
    const fetchSellerEarnings = async () => {
      if (!user?.id || !isSeller) {
        setSellerEarnings([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('seller_earnings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching seller earnings:', error);
          setSellerEarnings([]);
          return;
        }

        const mappedEarnings = (data || []).map((row: any) => ({
          id: row.id,
          sellerId: row.seller_id,
          orderId: row.order_id,
          amount: Number(row.amount) || 0,
          paymentMethod: row.payment_method || 'prepaid',
          status: row.status || 'pending',
          buyerId: row.buyer_id,
          dishName: row.dish_name || 'Food order',
          createdAt: row.created_at || new Date().toISOString(),
          creditedAt: row.credited_at || undefined,
          confirmationDeadline: row.confirmation_deadline || undefined,
          updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
        }));

        setSellerEarnings(mappedEarnings);
      } catch (fetchError) {
        console.error('Failed to load seller earnings:', fetchError);
        setSellerEarnings([]);
      }
    };

    fetchSellerEarnings();
  }, [user?.id, isSeller]);

  const totalEarnings = sellerEarnings
    .filter((entry) => entry.status === 'credited' || entry.status === 'pending')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const creditedAmount = sellerEarnings
    .filter((entry) => entry.status === 'credited')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const pendingAmount = sellerEarnings
    .filter((entry) => entry.status === 'pending')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace('/(auth)/welcome' as any);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
      return;
    }

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
          onPress: confirmLogout,
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
            totalEarnings={totalEarnings}
            pendingAmount={pendingAmount}
            creditedAmount={creditedAmount}
            transactions={sellerEarnings}
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

      {Platform.OS === 'web' && (
        <Modal
          transparent
          visible={showLogoutModal}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Logout</Text>
              <Text style={styles.modalText}>Are you sure you want to logout?</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.logoutButton]}
                  onPress={confirmLogout}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: designTokens.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: designTokens.colors.white,
    borderRadius: designTokens.radius.xl,
    padding: designTokens.spacing['2xl'],
    ...designTokens.shadows.lg,
  },
  modalTitle: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    color: designTokens.colors.text,
    marginBottom: designTokens.spacing.sm,
  },
  modalText: {
    fontSize: designTokens.typography.size.base,
    color: designTokens.colors.textLight,
    marginBottom: designTokens.spacing['2xl'],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: designTokens.spacing.md,
  },
  modalButton: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
    borderRadius: designTokens.radius.md,
    minWidth: 110,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: designTokens.colors.background,
  },
  cancelButtonText: {
    color: designTokens.colors.text,
    fontWeight: designTokens.typography.weight.semibold,
  },
  logoutButton: {
    backgroundColor: designTokens.colors.error,
  },
  logoutButtonText: {
    color: designTokens.colors.white,
    fontWeight: designTokens.typography.weight.semibold,
  },
});
