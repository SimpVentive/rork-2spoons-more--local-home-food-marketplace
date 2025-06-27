import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  User,
  Settings,
  ShoppingBag,
  PieChart,
  Wallet,
  LogOut,
  ChefHat,
  Route,
  FileText,
  Bell,
  HelpCircle,
  Star,
  Share2,
  PlusCircle,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';

export default function MoreScreen() {
  const { user, logout, userPreference } = useAuthStore();
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
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const isSeller = userPreference?.type === 'seller';
  
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
          style={styles.editProfileButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <User size={22} color={colors.primary} />
          <Text style={styles.menuItemText}>My Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <ShoppingBag size={22} color={colors.primary} />
          <Text style={styles.menuItemText}>My Orders</Text>
        </TouchableOpacity>
        
        {isSeller && (
          <>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/analytics')}
            >
              <PieChart size={22} color={colors.primary} />
              <Text style={styles.menuItemText}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/create')}
            >
              <PlusCircle size={22} color={colors.primary} />
              <Text style={styles.menuItemText}>Create Listing</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/finances')}
        >
          <Wallet size={22} color={colors.primary} />
          <Text style={styles.menuItemText}>Wallet & Payments</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Preferences</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/route-settings')}
        >
          <Route size={22} color={colors.secondary} />
          <Text style={styles.menuItemText}>Route Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/notifications')}
        >
          <Bell size={22} color={colors.secondary} />
          <Text style={styles.menuItemText}>Notification Preferences</Text>
        </TouchableOpacity>
        
        {isSeller && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/seller-onboarding')}
          >
            <ChefHat size={22} color={colors.secondary} />
            <Text style={styles.menuItemText}>Seller Settings</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push('/file-complaint')}
        >
          <FileText size={22} color={colors.info} />
          <Text style={styles.menuItemText}>File a Complaint</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Help & Support', 'Our support team is available 24/7. Please email us at support@homefood.com or call us at +1-800-123-4567.')}
        >
          <HelpCircle size={22} color={colors.info} />
          <Text style={styles.menuItemText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Rate App', 'Thank you for using our app! Your feedback helps us improve.')}
        >
          <Star size={22} color={colors.info} />
          <Text style={styles.menuItemText}>Rate App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Alert.alert('Share App', 'Share this app with your friends and family!')}
        >
          <Share2 size={22} color={colors.info} />
          <Text style={styles.menuItemText}>Share App</Text>
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
  editProfileButton: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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