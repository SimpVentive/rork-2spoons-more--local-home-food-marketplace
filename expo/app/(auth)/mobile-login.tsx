import React, { useMemo, useRef, useState } from 'react';
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
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function MobileLoginScreen() {
  const router = useRouter();
  const { phoneSignIn, isSigningIn } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'twofa'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
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

  const generateDemoOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const isPlaceholderConfig = (message: string) =>
    message.includes('dummy-key') ||
    message.includes('your-project-ref') ||
    message.includes('Invalid API key');

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

    const normalizedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;

    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        const demo = generateDemoOtp();
        setDemoOtp(demo);
        console.log('Demo OTP (dev):', demo);
        setStep('otp');
        startCountdown();
        return;
      }

      const { error: otpErrorResponse } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (otpErrorResponse) {
        throw otpErrorResponse;
      }

      setStep('otp');
      startCountdown();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(
        isPlaceholderConfig(message)
          ? 'Supabase is not configured for phone login yet. Add your real Supabase credentials to the Expo env file.'
          : 'Failed to send OTP. Please try again.'
      );
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

    const normalizedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;

    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        if (!demoOtp || otp !== demoOtp) {
          setOtpError('Invalid OTP. Please try again.');
          return;
        }

        // Demo flow: mark phone user as signed in and route immediately
        await phoneSignIn(phoneNumber);
        const state = useAuthStore.getState();
        if (state.isAdmin) {
          router.replace('/(admin)' as never);
        } else if (!state.userPreference) {
          router.replace('/user-preference' as never);
        } else {
          router.replace('/(tabs)/home' as never);
        }

        return;
      }

      const { data, error: verifyOtpError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: otp,
        type: 'sms',
      });

      if (verifyOtpError || !data.session) {
        throw verifyOtpError ?? new Error('OTP verification failed');
      }

      setStep('twofa');
      setOtp('');
      setOtpError('');
      setTwoFACode('');
      setTwoFAError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setOtpError(
        isPlaceholderConfig(message)
          ? 'Phone verification is unavailable until Supabase is configured with valid credentials.'
          : 'Invalid OTP. Please try again.'
      );
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFA = async () => {
    setError('');
    setTwoFAError('');

    if (twoFACode.length !== 4) {
      setTwoFAError('Please enter the 4-digit 2FA code');
      return;
    }

    setLoading(true);
    try {
      await phoneSignIn(phoneNumber);

      const state = useAuthStore.getState();
      if (state.isAdmin) {
        router.replace('/(admin)' as never);
      } else if (!state.userPreference) {
        router.replace('/user-preference' as never);
      } else {
        router.replace('/(tabs)/home' as never);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setTwoFAError(
        isPlaceholderConfig(message)
          ? '2FA verification is unavailable until Supabase is configured with valid credentials.'
          : 'Invalid 2FA code. Please try again.'
      );
      console.error('2FA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    const normalizedPhone = `+91${phoneNumber.replace(/\D/g, '')}`;
    setOtp('');
    setOtpError('');
    setLoading(true);

    try {
      const { error: otpErrorResponse } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      });

      if (otpErrorResponse) {
        throw otpErrorResponse;
      }
      startCountdown();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(
        isPlaceholderConfig(message)
          ? 'Supabase is not configured for phone login yet. Add your real Supabase credentials to the Expo env file.'
          : 'Failed to resend OTP. Please try again.'
      );
      console.error('OTP resend error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (step === 'phone') {
      router.back();
    } else if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setOtpError('');
      setResendCountdown(0);
    } else {
      setStep('otp');
      setTwoFACode('');
      setTwoFAError('');
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
            {step === 'phone' ? 'Phone Number' : step === 'otp' ? 'Enter OTP' : 'Two-Factor Auth'}
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
              {/* OAuth options removed — mobile-only registration */}
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
                Enter the 4-digit OTP sent to{'\n'}
                <Text style={styles.phoneDisplay}>+91 {phoneNumber}</Text>
              </Text>

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
                  <Text style={styles.resendCountdown}>Resend in {resendCountdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {step === 'twofa' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.otpIcon}>
                  <Key size={32} color={colors.primary} />
                </View>
              </View>

              <Text style={styles.description}>Enter the 4-digit verification code to continue</Text>

              <OTPInput
                length={4}
                value={twoFACode}
                onChangeText={(text) => {
                  setTwoFACode(text);
                  setTwoFAError('');
                }}
                error={twoFAError}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={loading ? 'Finishing sign in...' : 'Verify 2FA'}
                onPress={handleVerifyTwoFA}
                disabled={loading || twoFACode.length !== 4}
                variant="primary"
                size="large"
              />
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
