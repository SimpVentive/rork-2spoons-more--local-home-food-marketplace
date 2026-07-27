import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Key, Phone } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import OTPInput from '@/components/OTPInput';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth-store';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

const OTP_LENGTH = 6;
// Development mode: bypass Supabase OTP entirely (no SMS provider needed)
// To use real Supabase phone OTP, set this to false and configure a phone provider
// in Supabase Dashboard → Authentication → Providers → Phone
const BYPASS_PHONE_OTP = true;

export default function MobileLoginScreen() {
  const router = useRouter();
  const { phoneSignIn, isSigningIn } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91${cleaned.slice(2)}`;
    }
    return `+91${cleaned}`;
  };

  const startCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setResendCountdown(60);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message);
    }
    return String(error ?? 'Unknown error');
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

    const normalizedPhone = formatPhoneNumber(phoneNumber);

    setLoading(true);
    try {
      await phoneSignIn(normalizedPhone, undefined, { allowLocalFallback: true });
      const state = useAuthStore.getState();
      if (state.isAdmin) {
        router.replace('/(admin)' as never);
      } else if (!state.userPreference) {
        router.replace('/user-preference' as never);
      } else {
        router.replace('/(tabs)/home' as never);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message || 'Login failed. Please try again.');
      console.error('Phone sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setOtpError('');

    if (otp.length !== OTP_LENGTH) {
      setOtpError(`Please enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }

    const normalizedPhone = formatPhoneNumber(phoneNumber);

    setLoading(true);
    try {
      await phoneSignIn(normalizedPhone);
      const state = useAuthStore.getState();
      if (state.isAdmin) {
        router.replace('/(admin)' as never);
      } else if (!state.userPreference) {
        router.replace('/user-preference' as never);
      } else {
        router.replace('/(tabs)/home' as never);
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setOtpError(message || 'Verification failed. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setOtp('');
    setOtpError('');
    startCountdown();
  };

  const handleBack = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (step === 'phone') {
      router.back();
    } else {
      setStep('phone');
      setOtp('');
      setOtpError('');
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
          {step === 'phone' && (
            <>
              <View style={styles.iconContainer}>
                <Phone size={48} color={colors.primary} />
              </View>

              <Text style={styles.description}>Enter your 10-digit mobile number to login</Text>

              {__DEV__ ? (
                <Text style={styles.debugText}>
                  Development mode: Direct sign in (no SMS)
                </Text>
              ) : null}

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
                title={loading ? 'Signing in...' : 'Continue'}
                onPress={handleSendOTP}
                disabled={loading || !phoneNumber.trim()}
                variant="primary"
                size="large"
              />
            </>
          )}

          {step === 'otp' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.otpIcon}>
                  <Key size={32} color={colors.primary} />
                </View>
              </View>

              <Text style={styles.description}>
                Enter the {OTP_LENGTH}-digit OTP sent to{'\n'}
                <Text style={styles.phoneDisplay}>+91 {phoneNumber}</Text>
              </Text>


              <OTPInput
                length={OTP_LENGTH}
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
                disabled={isBusy || otp.length !== OTP_LENGTH}
                variant="primary"
                size="large"
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive OTP? </Text>
                {resendCountdown > 0 ? (
                  <Text style={styles.resendCountdown}>Resend in {resendCountdown}s</Text>
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
  debugText: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: typography.weights.bold,
  },
  phoneDisplay: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
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
});
