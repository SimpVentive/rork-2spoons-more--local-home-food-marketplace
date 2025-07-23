import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  View,
  Pressable,
} from 'react-native';

const colors = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  background: '#F8F9FA',
  white: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E9ECEF',
  card: '#FFFFFF',
  error: '#E74C3C',
  success: '#27AE60',
};

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

const Button: React.FC<ButtonProps> = ({
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
}) => {
  const actualLoading = isLoading || loading;
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 48,
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
      paddingVertical: 12,
      paddingHorizontal: 16,
    };

    if (size === 'small') {
      return { ...sizeStyle, paddingVertical: 8, paddingHorizontal: 12, minHeight: 40 };
    } else if (size === 'large') {
      return { ...sizeStyle, paddingVertical: 16, paddingHorizontal: 24, minHeight: 56 };
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
      fontSize: 16,
      fontWeight: '600',
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
      return { ...baseStyle, fontSize: 14 };
    } else if (size === 'large') {
      return { ...baseStyle, fontSize: 18 };
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
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </ButtonComponent>
  );
};

export default Button;