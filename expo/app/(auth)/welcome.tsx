import React from 'react';
import { View, Text, StyleSheet, Platform, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // If already authenticated, redirect to main app
  React.useEffect(() => {
    if (user && !authLoading) {
      const state = useAuthStore.getState();
      if (state.isAdmin) {
        router.replace('/(admin)' as never);
      } else if (!state.userPreference) {
        router.replace('/user-preference' as never);
      } else {
        router.replace('/(tabs)/home' as never);
      }
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe' }}
        style={styles.backgroundImage}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>2Spoons More</Text>
          <Text style={styles.tagline}>Homemade food, shared with love</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.description}>
            Connect with home chefs in your neighborhood and discover delicious homemade meals
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Continue with Phone Number"
              onPress={() => router.push('/(auth)/mobile-login' as never)}
              variant="primary"
              style={styles.button}
              icon={<Phone size={18} color={colors.white} />}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
  },
  footer: {
    width: '100%',
  },
  description: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
  registerButton: {
    borderColor: colors.white,
    width: '100%',
  },
  registerButtonText: {
    color: colors.white,
  },
  mobileButton: {
    borderColor: colors.white,
    width: '100%',
  },
  mobileButtonText: {
    color: colors.white,
  },
});
