import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import OTPInput from '@/components/OTPInput';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function MobileLoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'twofa'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    // Indian phone number format: 10 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
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
      // TODO: Integrate with Supabase auth
      // Call OTP sending API
      console.log('Sending OTP to:', phoneNumber);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep('otp');
      setResendCountdown(60);

      // Countdown timer
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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

    setLoading(true);
    try {
      // TODO: Integrate with Supabase auth
      console.log('Verifying OTP:', otp);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if 2FA is enabled for this user
      // For now, set to true to demonstrate flow
      setIsTwoFAEnabled(true);

      if (isTwoFAEnabled) {
        setStep('twofa');
      } else {
        // Login successful
        router.replace('/(tabs)/home' as never);
      }
    } catch (err) {
      setOtpError('Invalid OTP. Please try again.');
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
      // TODO: Integrate with Supabase 2FA verification
      console.log('Verifying 2FA:', twoFACode);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Login successful
      Alert.alert('Success', 'You have been logged in successfully!');
      router.replace('/(tabs)/home' as never);
    } catch (err) {
      setTwoFAError('Invalid 2FA code. Please try again.');
      console.error('2FA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;

    setLoading(true);
    try {
      await handleSendOTP();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'phone') {
      router.back();
    } else if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setOtpError('');
    } else {
      setStep('otp');
      setTwoFACode('');
      setTwoFAError('');
    }
  };

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
            {step === 'phone' && 'Phone Number'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'twofa' && 'Two-Factor Auth'}
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

              {error && <Text style={styles.errorText}>{error}</Text>}

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
                  <Text style={styles.otpIconText}>••••</Text>
                </View>
              </View>

              <Text style={styles.description}>
                Enter the 4-digit OTP sent to{'\n'}
                <Text style={styles.phoneDisplay}>+91 {phoneNumber}</Text>
              </Text>

              <OTPInput
                length={4}
                value={otp}
                onChangeText={setOtp}
                error={otpError}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                title={loading ? 'Verifying...' : 'Verify OTP'}
                onPress={handleVerifyOTP}
                disabled={loading || otp.length !== 4}
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

          {/* 2FA Step */}
          {step === 'twofa' && (
            <>
              <View style={styles.iconContainer}>
                <View style={styles.twoFAIcon}>
                  <Text style={styles.twoFAIconText}>🔐</Text>
                </View>
              </View>

              <Text style={styles.description}>
                Enter the 4-digit code from your authenticator app
              </Text>

              <OTPInput
                length={4}
                value={twoFACode}
                onChangeText={setTwoFACode}
                error={twoFAError}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                title={loading ? 'Verifying...' : 'Verify 2FA'}
                onPress={handleVerifyTwoFA}
                disabled={loading || twoFACode.length !== 4}
                variant="primary"
                size="large"
              />

              <TouchableOpacity
                onPress={() => Alert.alert('Recovery Code', 'Enter your recovery code')}
              >
                <Text style={styles.link}>Use recovery code instead</Text>
              </TouchableOpacity>
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
  otpIconText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  twoFAIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoFAIconText: {
    fontSize: 40,
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
