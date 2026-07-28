import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  View,
  Pressable,
} from 'react-native';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

const Button = forwardRef<any, ButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}, ref) => {
  const actualLoading = isLoading || loading;
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: spacing.radius.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 48,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      }),
    };

    if (variant === 'primary') {
      return { ...baseStyle, backgroundColor: colors.primary };
    } else if (variant === 'secondary') {
      return { ...baseStyle, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.secondary };
    } else if (variant === 'outline') {
      return { ...baseStyle, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
    } else if (variant === 'danger') {
      return { ...baseStyle, backgroundColor: colors.error };
    }

    return baseStyle;
  };

  const getSizeStyle = () => {
    const sizeStyle: ViewStyle = {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    };

    if (size === 'small') {
      return { ...sizeStyle, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 };
    } else if (size === 'large') {
      return { ...sizeStyle, paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'], minHeight: 56 };
    }

    return sizeStyle;
  };

  const getDisabledStyle = () => {
    if (disabled) {
      return { backgroundColor: '#CCCCCC', borderColor: '#CCCCCC' };
    }
    return {};
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      color: colors.white,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      textAlign: 'center',
    };

    if (variant === 'primary') {
      return { ...baseStyle, color: colors.white };
    } else if (variant === 'secondary') {
      return { ...baseStyle, color: colors.white };
    } else if (variant === 'outline') {
      return { ...baseStyle, color: colors.primary };
    }

    if (size === 'small') {
      return { ...baseStyle, fontSize: typography.sizes.sm };
    } else if (size === 'large') {
      return { ...baseStyle, fontSize: typography.sizes.lg };
    }

    if (disabled) {
      return { ...baseStyle, color: colors.textLight };
    }

    return baseStyle;
  };

  // Use Pressable for better Android touch handling
  const ButtonComponent = Platform.OS === 'android' ? Pressable : TouchableOpacity;
  
  const hitSlopValue = Platform.OS === 'android' ? 15 : 8;

  const buttonProps = Platform.OS === 'android' 
    ? {
        android_ripple: { 
          color: variant === 'outline' ? `${colors.primary}20` : 'rgba(255, 255, 255, 0.3)',
          borderless: false,
        },
        onPress: onPress,
        disabled: disabled || actualLoading,
      }
    : {
        onPress: onPress,
        disabled: disabled || actualLoading,
        activeOpacity: 0.8,
      };

  return (
    <ButtonComponent
      ref={ref}
      style={[getButtonStyle(), getSizeStyle(), getDisabledStyle(), style]}
      hitSlop={{ 
        top: hitSlopValue, 
        bottom: hitSlopValue, 
        left: hitSlopValue, 
        right: hitSlopValue 
      }}
      {...buttonProps}
    >
      {actualLoading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </ButtonComponent>
  );
});

Button.displayName = 'Button';

export default Button;