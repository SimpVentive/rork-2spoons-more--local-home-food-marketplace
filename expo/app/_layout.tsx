import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { ErrorBoundary } from './error-boundary';
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout() {
  const router = useRouter();
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.white,
              },
              headerTintColor: colors.text,
              headerTitleStyle: {
                fontWeight: '600',
              },
              headerLeft: ({ canGoBack }) => {
                if (canGoBack) {
                  return (
                    <TouchableOpacity 
                      onPress={() => {
                        try {
                          router.back();
                        } catch (error) {
                          console.error('Navigation error:', error);
                        }
                      }}
                      style={{ 
                        padding: 12, 
                        marginLeft: -8,
                        borderRadius: 20,
                      }}
                      hitSlop={{ 
                        top: 15, 
                        bottom: 15, 
                        left: 15, 
                        right: 15 
                      }}
                      activeOpacity={0.7}
                    >
                      <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                  );
                }
                return null;
              },
              gestureEnabled: Platform.OS === 'ios',
              animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="setup-location" options={{ title: 'Set Your Location' }} />
            <Stack.Screen name="admin-access/[token]/index" options={{ headerShown: false }} />
            <Stack.Screen name="listing/[id]" options={{ title: 'Dish Details' }} />
            <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
            <Stack.Screen name="profile/[id]" options={{ title: 'Profile' }} />
            <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="route-settings" options={{ title: 'Route Settings' }} />
            <Stack.Screen name="create-listing" options={{ title: 'Create Listing' }} />
            <Stack.Screen name="file-complaint" options={{ title: 'File Complaint' }} />
            <Stack.Screen name="seller-onboarding" options={{ title: 'Seller Setup' }} />
            <Stack.Screen name="user-preference" options={{ title: 'Account Type' }} />
            <Stack.Screen name="seller-profile-setup" options={{ title: 'Complete Your Profile' }} />
            <Stack.Screen name="admin-login" options={{ title: 'Admin Login' }} />
            <Stack.Screen name="admin/user-details/[id]" options={{ title: 'User Details' }} />
            <Stack.Screen name="scan" options={{ title: 'Scan QR Code' }} />
            <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
          </Stack>
        </SafeAreaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
