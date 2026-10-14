import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';

export default function AppIndex() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const initializeApp = async () => {
      try {
        // Give React Navigation a moment to mount
        await new Promise(resolve => setTimeout(resolve, 300));

        if (user) {
          // User is authenticated — route based on preferences
          const state = useAuthStore.getState();
          if (state.isAdmin) {
            router.replace('/(admin)' as never);
          } else if (!state.userPreference) {
            router.replace('/user-preference' as never);
          } else {
            router.replace('/(tabs)/home' as never);
          }
        } else {
          // No session — go to auth
          router.replace('/(auth)/welcome' as never);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        router.replace('/(auth)/welcome' as never);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [user, authLoading, router]);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ 
        marginTop: 16, 
        color: colors.textLight,
        fontSize: 16 
      }}>
        Loading...
      </Text>
    </View>
  );
}