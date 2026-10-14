import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value,
  onChangeText,
  error,
}) => {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));

  useEffect(() => {
    const otpArray = value.split('');
    setOtp(otpArray.length === length ? otpArray : new Array(length).fill(''));
  }, [value, length]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // Only allow single digit

    const otpString = newOtp.join('');
    setOtp(newOtp);
    onChangeText(otpString);

    // Auto-focus to next input
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: any,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View>
      <View style={styles.container}>
        {new Array(length).fill(0).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            style={[
              styles.input,
              error && styles.inputError,
              otp[index] && styles.inputFilled,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={otp[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={true}
            selectionColor={colors.primary}
            placeholderTextColor={colors.border}
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  input: {
    width: 56,
    height: 56,
    borderRadius: spacing.radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputFilled: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default OTPInput;
