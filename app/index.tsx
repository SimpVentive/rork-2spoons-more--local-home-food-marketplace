import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';

export default function AppIndex() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const { isAuthenticated, isInitialized, user, userPreference, initialize } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the auth store
        await initialize();
        
        // Small delay to ensure everything is properly set up
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const state = useAuthStore.getState();
        
        // Route based on authentication state
        if (!state.isAuthenticated) {
          router.replace('/(auth)');
        } else if (state.user?.isAdmin) {
          router.replace('/(admin)');
        } else if (!state.userPreference) {
          router.replace('/user-preference');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('App initialization error:', error);
        // Fallback to auth screen on error
        router.replace('/(auth)');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
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
          Starting...
        </Text>
      </View>
    );
  }

  // This should not be reached as navigation should happen in useEffect
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}