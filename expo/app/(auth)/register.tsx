import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function RegisterScreen() {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'phone' && !phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (mode === 'phone' && !/^\+?\d{10,13}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid mobile number';
    }
    
    if (mode === 'email' && !email.trim()) {
      newErrors.email = 'Email is required';
    } else if (mode === 'email' && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (codeSent && !verificationCode.trim()) {
      newErrors.verificationCode = 'Please enter the verification code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSendCode = async () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'phone' && !phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (mode === 'phone' && !/^\+?\d{10,13}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid mobile number';
    }
    
    if (mode === 'email' && !email.trim()) {
      newErrors.email = 'Email is required';
    } else if (mode === 'email' && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setCodeSent(true);
    
    // In demo mode, show the code
    Alert.alert(
      'Verification Code Sent',
      `A verification code has been sent to your ${mode === 'phone' ? 'mobile' : 'email'}.\n\nDemo code: ${code}`,
      [{ text: 'OK' }]
    );
  };
  
  const handleRegister = async () => {
    if (!validate()) return;
    
    // Verify code
    if (verificationCode !== generatedCode) {
      setErrors({ verificationCode: 'Invalid verification code' });
      return;
    }

    setIsLoading(true);
    try {
      const userEmail = mode === 'email' ? email : `${phone.replace(/\D/g, '')}@homecook.app`;
      const userName = mode === 'phone' ? `User${phone.slice(-4)}` : email.split('@')[0];
      
      await register({
        name: userName,
        email: userEmail,
        phone: mode === 'phone' ? phone : '',
        password: password,
        cuisineTypes: [],
        paymentMethods: ['UPI', 'Cash'],
        location: { latitude: 17.4123, longitude: 78.2679 },
        address: '',
        isChef: false,
        isVerified: true,
      } as any);
      
      // Set buyer preference directly and skip the preference selection page
      const { updateUserPreference } = useAuthStore.getState();
      await updateUserPreference('buyer');
      
      // Navigate directly to home
      setTimeout(() => {
        router.replace('/(tabs)/home' as any);
      }, 100);
    } catch (error) {
      console.log('Registration error:', error);
      setErrors({
        general: 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
          <Text style={styles.title}>Join HomeCook</Text>
          <Text style={styles.subtitle}>
            Discover delicious homemade food near you
          </Text>
        </View>
        
        <View style={styles.form}>
          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeOption, mode === 'phone' && styles.modeOptionActive]}
              onPress={() => { setMode('phone'); setCodeSent(false); setVerificationCode(''); }}
            >
              <Text style={[styles.modeText, mode === 'phone' && styles.modeTextActive]}>
                Mobile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeOption, mode === 'email' && styles.modeOptionActive]}
              onPress={() => { setMode('email'); setCodeSent(false); setVerificationCode(''); }}
            >
              <Text style={[styles.modeText, mode === 'email' && styles.modeTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>
          
          {mode === 'phone' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, errors.phone ? styles.inputError : null]}
                  placeholder="9876543210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!codeSent}
                />
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.textInput, errors.email ? styles.inputError : null]}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!codeSent}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>
          )}
          
          {!codeSent ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.textInput, errors.password ? styles.inputError : null]}
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>
              
              <Button
                title="Send Verification Code"
                onPress={handleSendCode}
                style={styles.sendCodeButton}
              />
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={[styles.textInput, styles.codeInput, errors.verificationCode ? styles.inputError : null]}
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {errors.verificationCode ? <Text style={styles.errorText}>{errors.verificationCode}</Text> : null}
                <TouchableOpacity onPress={handleSendCode}>
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.textInput, errors.password ? styles.inputError : null]}
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>
              
              <Button
                title="Create Account"
                onPress={handleRegister}
                style={styles.registerButton}
                isLoading={isLoading}
              />
            </>
          )}
        </View>
        
        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}
        
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeOptionActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  modeTextActive: {
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '700' as const,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
  },
  sendCodeButton: {
    marginTop: 4,
  },
  registerButton: {
    marginTop: 4,
  },
  resendText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 10,
    textAlign: 'right',
  },
  errorBanner: {
    backgroundColor: `${colors.error}12`,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.error}25`,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500' as const,
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
