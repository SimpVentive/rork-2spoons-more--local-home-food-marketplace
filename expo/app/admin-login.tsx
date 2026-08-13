import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const adminLogin = useAuthStore(state => state.adminLogin);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Starting admin login for:', email);
      
      const success = await adminLogin(email, password);
      
      if (!success) {
        setError('Invalid admin credentials. Try using admin@example.com');
        console.log('Admin login failed for:', email);
      } else {
        console.log('Admin login successful');
        
        // If login is successful, use setTimeout to ensure navigation happens after state update
        setTimeout(() => {
          const { isAuthenticated, isAdmin, user } = useAuthStore.getState();
          
          console.log('Post-admin-login state:', { isAuthenticated, isAdmin, userName: user?.name });
          
          if (isAuthenticated && isAdmin) {
            console.log('Redirecting to admin dashboard');
            router.replace('/dashboard' as any);
          } else {
            console.log('Admin authentication failed');
            setError('Admin authentication failed. Please try again.');
          }
        }, 100);
      }
    } catch (error) {
      console.log('Admin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <ShieldAlert size={64} color={colors.primary} />
          <Text style={styles.appName}>Admin Portal</Text>
          <Text style={styles.tagline}>Manage your HomeCook platform</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Sign in to your admin account</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <Input
            label="Email"
            placeholder="Enter your admin email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIconButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textLight} />
                ) : (
                  <Eye size={20} color={colors.textLight} />
                )}
              </TouchableOpacity>
            }
          />
          
          <Button
            title="Sign In"
            onPress={handleLogin}
            style={styles.loginButton}
            isLoading={isLoading}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/login' as any)}
          >
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
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
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
    marginTop: 16,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  demoCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  eyeIconButton: {
    padding: 8,
  },
});