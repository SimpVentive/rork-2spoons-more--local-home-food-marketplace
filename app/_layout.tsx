import React from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="user-preference" options={{ gestureEnabled: false }} />
      <Stack.Screen name="seller-onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="create-listing" />
      <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="scan" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="file-complaint" />
      <Stack.Screen name="route-settings" />
    </Stack>
  );
}