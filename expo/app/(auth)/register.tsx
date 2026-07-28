import React from 'react';
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
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import colors from "@/constants/colors"; // ✅

export default function RegisterScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { syncProfile } = useAuthStore();
  const router = useRouter();

  // Redirect when authenticated
  React.useEffect(() => {
    if (user && !authLoading) {
      syncProfile(user.id, user.email, user.name, user.picture).then(() => {
        const state = useAuthStore.getState();
        if (state.isAdmin) {
          router.replace('/(admin)' as never);
        } else {
          // New users go to preference selection
          router.replace('/user-preference' as never);
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍳</Text>
            </View>
          </View>
          <Text style={styles.title}>Join 2Spoons More</Text>
          <Text style={styles.subtitle}>
            Discover delicious homemade food near you
          </Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.instruction}>
            Create your account to start discovering homemade food from local chefs in your area.
          </Text>

          <TouchableOpacity
            style={styles.mobileButton}
            onPress={() => router.push('/(auth)/mobile-login' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.mobileButtonText}>Continue with Phone Number</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href={"/(auth)/login" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 8,
  },
  instruction: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  signingInIndicator: {
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    marginLeft: 8,
    padding: 4,
  },
  errorDismissText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  mobileButton:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  mobileButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
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
  googleLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
  },
  appleIcon: {
    color: colors.white,
    fontSize: 22,
    marginRight: 12,
    lineHeight: 28,
  },
  appleLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  termsText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 15,
  },
  loginText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
