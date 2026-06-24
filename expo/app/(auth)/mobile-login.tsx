import React, { useState, useRef } from 'react';
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
import { ArrowLeft, Phone, Key } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import OTPInput from '@/components/OTPInput';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function MobileLoginScreen() {
  const router = useRouter();
  const { phoneSignIn, isSigningIn } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const generateOTP = (): string => {
    // Generate a random 4-digit OTP
    return String(Math.floor(1000 + Math.random() * 9000));
  };

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setResendCountdown(60);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    setError('');
    setPhoneError('');

    if (!phoneNumber.trim()) {
      setPhoneError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // Generate OTP — in production this would come from an SMS gateway
      const code = generateOTP();
      setGeneratedOtp(code);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log(`[Demo] OTP for ${phoneNumber}: ${code}`);
      setStep('otp');
      startCountdown();
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      console.error('OTP send error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setOtpError('');

    if (otp.length !== 4) {
      setOtpError('Please enter the 4-digit OTP');
      return;
    }

    if (otp !== generatedOtp) {
      setOtpError('Incorrect OTP. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Sign in the user via the auth context
      await phoneSignIn(phoneNumber);

      // Route based on user preferences
      const state = useAuthStore.getState();
      if (state.isAdmin) {
        router.replace('/(admin)' as never);
      } else if (!state.userPreference) {
        router.replace('/user-preference' as never);
      } else {
        router.replace('/(tabs)/home' as never);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Phone sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    const code = generateOTP();
    setGeneratedOtp(code);
    setOtp('');
    setOtpError('');
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`[Demo] New OTP for ${phoneNumber}: ${code}`);
    setLoading(false);
    startCountdown();
  };

  const handleBack = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (step === 'phone') {
      router.back();
    } else {
      setStep('phone');
      setOtp('');
      setOtpError('');
      setGeneratedOtp('');
      if (countdownRef.current) clearInterval(countdownRef.current);
      setResendCountdown(0);
    }
  };

  const isBusy = loading || isSigningIn;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {step === 'phone' ? 'Phone Number' : 'Enter OTP'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Phone Number Step */}
          {step === 'phone' && (
            <>
              <View style={styles.iconContainer}>
                <Phone size={48} color={colors.primary} />
              </View>

              <Text style={styles.description}>
                Enter your 10-digit mobile number to login
              </Text>

              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setPhoneError('');
                }}
                keyboardType="phone-pad"
                error={phoneError}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={loading ? 'Sending OTP...' : 'Send OTP'}
                onPress={handleSendOTP}
                disabled={loading || !phoneNumber.trim()}
                variant="primary"
                size="large"
              />

              <TouchableOpacity
                onPress={() => router.replace('/(auth)/login' as never)}
              >
                <Text style={styles.link}>Use Google or Apple instead</Text>
              </TouchableOpacity>
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.otpIcon}>
                  <Key size={32} color={colors.primary} />
                </View>
              </View>

              <Text style={styles.description}>
                Enter the 4-digit OTP sent to{'\n'}
                <Text style={styles.phoneDisplay}>+91 {phoneNumber}</Text>
              </Text>

              {/* Visible OTP — for demo purposes, shows the code on screen */}
              <View style={styles.otpDisplayCard}>
                <Text style={styles.otpDisplayLabel}>Your OTP is</Text>
                <Text style={styles.otpDisplayValue}>{generatedOtp}</Text>
                <Text style={styles.otpDisplayHint}>
                  In production, this would arrive via SMS
                </Text>
              </View>

              <OTPInput
                length={4}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  setOtpError('');
                }}
                error={otpError}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={isBusy ? 'Signing in...' : 'Verify & Sign In'}
                onPress={handleVerifyOTP}
                disabled={isBusy || otp.length !== 4}
                variant="primary"
                size="large"
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive OTP? </Text>
                {resendCountdown > 0 ? (
                  <Text style={styles.resendCountdown}>
                    Resend in {resendCountdown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
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
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  backButton: {
    padding: spacing.md,
    marginLeft: -spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing['2xl'],
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  otpIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 24,
  },
  phoneDisplay: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  // OTP Display Card — shows the generated code prominently
  otpDisplayCard: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${colors.primary}30`,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  otpDisplayLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: typography.weights.semibold,
  },
  otpDisplayValue: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 12,
    marginBottom: spacing.sm,
  },
  otpDisplayHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  resendCountdown: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    fontWeight: typography.weights.semibold,
  },
  resendLink: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  link: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontWeight: typography.weights.semibold,
  },
});
