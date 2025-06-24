import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Shield } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { adminLogin, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    try {
      await adminLogin(email, password);
      // On success, navigation can be handled in layout or here
    } catch (e) {
      console.log('Admin login error:', e);
    }
  };

  const handleBackToUserLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={64}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.adminBadge}>
            <Shield size={40} color={colors.white} />
          </View>
          <Text style={styles.appName}>Admin Portal</Text>
          <Text style={styles.tagline}>Manage your HomeCook platform</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Sign in to your admin account</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="Enter admin email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textLight} />
                ) : (
                  <Eye size={20} color={colors.textLight} />
                )}
              </TouchableOpacity>
            }
          />

          <Button
            title="Sign In as Admin"
            onPress={handleLogin}
            style={styles.loginButton}
            isLoading={isLoading}
          />

          <TouchableOpacity style={styles.backButton} onPress={handleBackToUserLogin}>
            <Text style={styles.backButtonText}>Back to User Login</Text>
          </TouchableOpacity>

          <View style={styles.demoCredentials}>
            <Text style={styles.demoTitle}>Demo Admin Credentials:</Text>
            <Text style={styles.demoText}>Email: admin@example.com</Text>
            <Text style={styles.demoText}>Password: any password will work</Text>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  adminBadge: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: colors.adminPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.adminPrimary,
    marginTop: 16,
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: `${colors.error}20`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 16,
    backgroundColor: colors.adminPrimary,
  },
  backButton: {
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: colors.adminPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  demoCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: `${colors.adminPrimary}10`,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.adminPrimary,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
});