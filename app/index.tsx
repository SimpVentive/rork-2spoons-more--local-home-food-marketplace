import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

export default function AppIndex() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Simple delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For now, always redirect to auth to avoid complex state issues
        console.log('Redirecting to auth...');
        router.replace('/(auth)/welcome' as any);
        
      } catch (error) {
        console.error('App initialization error:', error);
        // Fallback to auth screen on error
        router.replace('/(auth)/welcome' as any);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [router]);

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
          Loading...
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