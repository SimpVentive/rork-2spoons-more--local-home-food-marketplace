import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
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
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="profile/[id]" />
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="file-complaint" />
      <Stack.Screen name="route-settings" />
    </Stack>
  );
}