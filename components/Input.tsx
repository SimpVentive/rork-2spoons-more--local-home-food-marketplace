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
            multiline && { height: numberOfLines * 24, textAlignVertical: textAlignVertical || 'top' },
            error && styles.inputError,
            disabled && styles.inputDisabled,
            rightIcon && { paddingRight: 40 },
            leftIcon && { paddingLeft: 40 },
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
      {error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 48, // Ensure minimum height for touch target
  },
  inputError: {
    borderColor: colors.error,
  },
  inputDisabled: {
    backgroundColor: '#F1F1F1',
    color: colors.textLight,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    height: '100%',
    justifyContent: 'center',
    zIndex: 1,
  },
});

export default Input;