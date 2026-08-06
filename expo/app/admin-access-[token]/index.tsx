import React, { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AdminLoginScreen from '../admin-login';

export default function AdminAccessScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  // Secret token - should be set via environment variable
  // Format: 2spoonsmore.com/admin-access-<THIS_TOKEN>
  const ADMIN_SECRET_TOKEN = process.env.EXPO_PUBLIC_ADMIN_TOKEN || 'secure-admin-2024-access';

  useEffect(() => {
    // Verify the token
    if (!token || token !== ADMIN_SECRET_TOKEN) {
      // Invalid or missing token - redirect to home
      router.replace('/(tabs)/home' as never);
    }
  }, [token]);

  // If token is valid, show admin login
  if (token === ADMIN_SECRET_TOKEN) {
    return <AdminLoginScreen />;
  }

  // If invalid, return null (will redirect)
  return null;
}
