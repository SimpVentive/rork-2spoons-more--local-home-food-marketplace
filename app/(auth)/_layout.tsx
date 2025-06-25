import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function AuthLayout() {
  const { isAuthenticated, userPreference } = useAuthStore();
  const router = useRouter();

  // Check authentication in useEffect to avoid navigation during render
  useEffect(() => {
    if (isAuthenticated) {
      // If user has no preference set, redirect to preference selection
      if (!userPreference) {
        router.replace('/user-preference');
      } else {
        // If user is a seller, redirect to profile
        if (userPreference.type === 'seller') {
          router.replace('/(tabs)/profile');
        } else {
          // Otherwise redirect to home
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, userPreference]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}