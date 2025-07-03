import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

export default function RootLayout() {
  const router = useRouter();
  
  return (
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
                  onPress={() => router.back()}
                  style={{ padding: 8, marginLeft: -8 }}
                >
                  <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
              );
            }
            return null;
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ title: 'Dish Details' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
        <Stack.Screen name="profile/[id]" options={{ title: 'Profile' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="route-settings" options={{ title: 'Route Settings' }} />
        <Stack.Screen name="create-listing" options={{ title: 'Create Listing' }} />
        <Stack.Screen name="file-complaint" options={{ title: 'File Complaint' }} />
        <Stack.Screen name="seller-onboarding" options={{ title: 'Seller Setup' }} />
        <Stack.Screen name="user-preference" options={{ title: 'Account Type' }} />
        <Stack.Screen name="admin-login" options={{ title: 'Admin Login' }} />
        <Stack.Screen name="scan" options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </SafeAreaProvider>
  );
}