import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { UserPlus, Check } from 'lucide-react-native';
import colors from '@/constants/colors';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggleFollow: () => void;
  isLoading?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onToggleFollow,
  isLoading = false,
  size = 'medium',
  style,
}) => {
  const buttonStyles = [
    styles.button,
    isFollowing ? styles.followingButton : styles.followButton,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    style,
  ];
  
  const textStyles = [
    styles.text,
    isFollowing ? styles.followingText : styles.followText,
    size === 'small' && styles.smallText,
    size === 'large' && styles.largeText,
  ];
  
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={isFollowing ? colors.primary : colors.white} 
        />
      ) : (
        <>
          {isFollowing ? (
            <Check size={iconSize} color={colors.primary} />
          ) : (
            <UserPlus size={iconSize} color={colors.white} />
          )}
          <Text style={textStyles}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  followButton: {
    backgroundColor: colors.primary,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  largeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    fontWeight: '500',
    marginLeft: 4,
  },
  followText: {
    color: colors.white,
  },
  followingText: {
    color: colors.primary,
  },
  smallText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 16,
  },
});

export default FollowButton;