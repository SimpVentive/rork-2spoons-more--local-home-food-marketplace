import React from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLayout() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    // Check if the user is authenticated and is an admin
    if (!isAuthenticated) {
      // Redirect to the auth flow
      router.replace('/(auth)');
    } else if (!isAdmin()) {
      // Redirect non-admin users to the main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isAdmin]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Manage Users',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Manage Orders',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="listings"
        options={{
          title: 'Manage Listings',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="complaints"
        options={{
          title: 'Manage Complaints',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Admin Settings',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="campaigns"
        options={{
          title: 'Marketing Campaigns',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="messaging"
        options={{
          title: 'User Messages',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="top-earners"
        options={{
          title: 'Top Earners',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack>
  );
}