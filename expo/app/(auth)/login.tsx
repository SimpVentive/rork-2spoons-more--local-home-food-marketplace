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
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function LoginScreen() {
  const { user, isSigningIn, error, signIn, clearError, isLoading: authLoading } = useAuth();
  const { syncProfile } = useAuthStore();
  const router = useRouter();

  // Redirect when authenticated
  useEffect(() => {
    if (user && !authLoading) {
      syncProfile(user.id, user.email, user.name, user.picture).then(() => {
        const state = useAuthStore.getState();
        if (state.isAdmin) {
          router.replace('/(admin)' as never);
        } else if (!state.userPreference) {
          router.replace('/user-preference' as never);
        } else {
          router.replace('/(tabs)/home' as never);
        }
      });
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1' }}
            style={styles.logo}
          />
          <Text style={styles.appName}>2Spoons More</Text>
          <Text style={styles.tagline}>Homemade food, delivered with love</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
                <Text style={styles.errorDismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          
          {isSigningIn && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.signingInIndicator} />
          )}
          
          <TouchableOpacity
            style={[styles.googleButton, isSigningIn && styles.buttonDisabled]}
            onPress={() => signIn('google')}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            <Text style={styles.googleButtonText}>G</Text>
            <Text style={styles.googleButtonLabel}>Continue with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.appleButton, isSigningIn && styles.buttonDisabled]}
            onPress={() => signIn('apple')}
            disabled={isSigningIn}
            activeOpacity={0.8}
          >
            <Text style={styles.appleButtonText}></Text>
            <Text style={styles.appleButtonLabel}>Continue with Apple</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <TouchableOpacity 
            style={styles.emailButton}
            onPress={() => router.push('/(auth)/register' as never)}
            disabled={isSigningIn}
          >
            <Text style={styles.emailButtonText}>Sign up with email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
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
  },
  formContainer: {
    paddingHorizontal: 24,
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: spacing.radius.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  errorDismiss: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  errorDismissText: {
    color: '#DC2626',
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  signingInIndicator: {
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: spacing.lg,
    borderRadius: spacing.radius.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  googleButtonText: {
    color: '#4285F4',
    backgroundColor: colors.white,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 12,
    overflow: 'hidden',
  },
  googleButtonLabel: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: spacing.lg,
    borderRadius: spacing.radius.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  appleButtonText: {
    color: colors.white,
    fontSize: 22,
    marginRight: 12,
    lineHeight: 28,
  },
  appleButtonLabel: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textLight,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  emailButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
