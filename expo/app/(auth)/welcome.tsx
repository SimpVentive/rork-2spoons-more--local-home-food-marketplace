import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect when already authenticated
  useEffect(() => {
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
  }, [user, authLoading, router]);

  // Loading screen
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.white}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
        }}
        style={styles.backgroundImage}
      />

      {/* Dark gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>
              2Spoons More
            </Text>

            <Text style={styles.tagline}>
              Homemade food, shared with love
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.description}>
              Connect with home chefs in your neighborhood
              and discover delicious homemade meals
            </Text>

            <Button
              title="Continue with Phone Number"
              onPress={() =>
                router.push('/(auth)/mobile-login' as never)
              }
              variant="primary"
              style={styles.button}
              icon={
                <Phone
                  size={18}
                  color={colors.white}
                />
              }
            />
          </View>

        </View>
      </SafeAreaView>
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
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  header: {
    alignItems: 'center',
  },

  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },

  tagline: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },

  footer: {
    width: '100%',
  },

  description: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  button: {
    width: '100%',
  },
});