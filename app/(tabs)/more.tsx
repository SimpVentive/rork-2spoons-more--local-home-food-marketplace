import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  User,
  ShoppingBag,
  Wallet,
  LogOut,
  ChefHat,
  Route,
  FileText,
  HelpCircle,
  Star,
  Share2,
  PlusCircle,
  Search,
  TrendingUp,
  Shield,
  Home,
  RefreshCw,
  QrCode,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';

export default function MoreScreen() {
  const { user, logout, userPreference, switchRole } = useAuthStore();
  const router = useRouter();
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              setTimeout(() => {
                router.replace('/(auth)' as any);
              }, 100); 
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSwitchRole = async () => {
    try {
      await switchRole();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch role. Please try again.');
    }
  };
  
  const handleShareApp = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Home Food App',
            text: 'Check out this amazing home food app! Get delicious homemade food from local chefs.',
            url: 'https://homefood.app',
          });
        } else {
          const url = 'https://homefood.app';
          const text = 'Check out this amazing home food app! Get delicious homemade food from local chefs.';
          const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          window.open(shareUrl, '_blank');
        }
        return;
      }
      
      const shareOptions = {
        message: Platform.OS === 'ios' 
          ? 'Check out this amazing home food app! Get delicious homemade food from local chefs.'
          : 'Check out this amazing home food app! Get delicious homemade food from local chefs. Download now: https://homefood.app',
        title: 'Home Food App',
        ...(Platform.OS === 'ios' && {
          url: 'https://homefood.app',
        }),
      };
      
      await Share.share(shareOptions);
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert(
        'Share Failed', 
        'Unable to share the app at this time. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleRateApp = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Rate Our App',
          'Thank you for your interest! Please visit our app on the App Store or Google Play Store to leave a rating.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const appStoreUrl = Platform.select({
        ios: 'https://apps.apple.com/app/id123456789',
        android: 'market://details?id=com.homefood.app',
        default: 'https://homefood.app',
      });
      
      const fallbackUrl = Platform.select({
        ios: 'https://apps.apple.com/app/id123456789',
        android: 'https://play.google.com/store/apps/details?id=com.homefood.app',
        default: 'https://homefood.app',
      });
      
      try {
        if (appStoreUrl) {
          const supported = await Linking.canOpenURL(appStoreUrl);
          if (supported) {
            await Linking.openURL(appStoreUrl);
          } else if (fallbackUrl) {
            await Linking.openURL(fallbackUrl);
          }
        }
      } catch (linkingError) {
        Alert.alert(
          'Rate Our App',
          'Thank you for using our app! Please visit your device\'s app store to rate us.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Rate app error:', error);
    }
  };
  
  const isSeller = user?.isChef || userPreference?.type === 'seller';
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            <View style={styles.userTypeContainer}>
              <Text style={styles.userType}>
                {isSeller ? 'Seller Account' : 'Buyer Account'}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.switchRoleButton}
          onPress={handleSwitchRole}
        >
          <RefreshCw size={16} color={colors.white} />
          <Text style={styles.switchRoleText}>
            Switch to {isSeller ? 'Buyer' : 'Seller'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Quick Access</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/scan' as any)}
        >
          <QrCode size={22} color={colors.primary} />
          <Text style={styles.menuItemText}>Scan QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/search' as any)}
        >
          <Search size={22} color={colors.primary} />
          <Text style={styles.menuItemText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/edit-profile' as any)}
        >
          <User size={22} color={colors.primary} />
          <Text style={styles.menuItemText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      {isSeller && (
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Business Tools</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/create' as any)}
          >
            <PlusCircle size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Create Listing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/analytics' as any)}
          >
            <TrendingUp size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/seller-onboarding' as any)}
          >
            <ChefHat size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Seller Settings</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!isSeller && (
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Discover</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/' as any)}
          >
            <Home size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/route-settings' as any)}
          >
            <Route size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Route Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/orders' as any)}
          >
            <ShoppingBag size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/finances' as any)}
          >
            <Wallet size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Wallet & Payments</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/file-complaint' as any)}
        >
          <FileText size={22} color={colors.warning} />
          <Text style={styles.menuItemText}>File a Complaint</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Help & Support', 'Our support team is available 24/7. Please email us at support@homefood.com or call us at +1-800-123-4567.')}
        >
          <HelpCircle size={22} color={colors.warning} />
          <Text style={styles.menuItemText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleRateApp}
        >
          <Star size={22} color={colors.warning} />
          <Text style={styles.menuItemText}>Rate App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleShareApp}
        >
          <Share2 size={22} color={colors.warning} />
          <Text style={styles.menuItemText}>Share App</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Legal & Privacy</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Privacy Policy', 'View our privacy policy at homefood.com/privacy')}
        >
          <Shield size={22} color={colors.textLight} />
          <Text style={styles.menuItemText}>Privacy Policy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Terms of Service', 'View our terms at homefood.com/terms')}
        >
          <FileText size={22} color={colors.textLight} />
          <Text style={styles.menuItemText}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={22} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.border,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  userTypeContainer: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  switchRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  switchRoleText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuSection: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingVertical: 8,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 24,
    marginBottom: 40,
  },
});