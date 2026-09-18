import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function LoginScreen() {
<<<<<<< HEAD
  const { user, isLoading: authLoading } = useAuth();
=======
  const insets = useSafeAreaInsets();
  const { user, isSigningIn, isLoading: authLoading } = useAuth();
>>>>>>> e98ba982b522029decd60adb5c4c91091aa9ffe9
  const router = useRouter();

  // Redirect when authenticated
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
=======
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing['2xl'] + insets.bottom + 20 }
        ]}
        keyboardShouldPersistTaps="handled"
>>>>>>> e98ba982b522029decd60adb5c4c91091aa9ffe9
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
              }}
              style={styles.logo}
              contentFit="cover"
            />

            <Text style={styles.appName}>
              2Spoons More
            </Text>

            <Text style={styles.tagline}>
              Homemade food, delivered with love
            </Text>
          </View>

          {/* Login */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>
              Welcome
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue
            </Text>

            <TouchableOpacity
              style={styles.mobileButton}
              onPress={() =>
                router.push('/(auth)/mobile-login' as never)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.mobileButtonText}>
                Continue with Phone Number
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: spacing.radius.lg,
  },

  appName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.lg,
  },

  tagline: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  formContainer: {
    width: '100%',
  },

  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
    marginBottom: spacing['2xl'],
  },

  mobileButton: {
    width: '100%',
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  mobileButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});