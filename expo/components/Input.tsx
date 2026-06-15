import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  KeyboardTypeOptions,
  Platform,
} from 'react-native';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  maxLength?: number;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  style?: StyleProp<ViewStyle>;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  disabled = false,
  maxLength,
  rightIcon,
  leftIcon,
  isPassword,
  textAlignVertical,
  style,
  helperText,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputContainerError, style]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            ...(multiline ? [{ height: numberOfLines * 24, textAlignVertical: (textAlignVertical || 'top') } as TextStyle] : []),
            ...(error ? [styles.inputError] : []),
            ...(disabled ? [styles.inputDisabled] : []),
            ...(rightIcon ? [{ paddingRight: 40 } as TextStyle] : []),
            ...(leftIcon ? [{ paddingLeft: 40 } as TextStyle] : []),
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          editable={!disabled}
          maxLength={maxLength}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText, errorStyle]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontWeight: typography.weights.normal,
  },
  inputError: {
    color: colors.error,
  },
  inputDisabled: {
    backgroundColor: colors.card,
    color: colors.textLight,
  },
  leftIconContainer: {
    paddingLeft: 14,
  },
  rightIconContainer: {
    paddingRight: 14,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: colors.error,
  },
});

export default Input;
