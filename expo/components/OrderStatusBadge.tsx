import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '@/types';
import colors from '@/constants/colors';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium' | 'large';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return '#FFA726'; // Orange
      case 'accepted':
      case 'confirmed':
        return '#42A5F5'; // Blue
      case 'preparing':
        return '#7E57C2'; // Purple
      case 'ready':
      case 'in_delivery':
        return '#26A69A'; // Teal
      case 'delivered':
      case 'completed':
        return colors.success; // Green
      case 'canceled':
      case 'refund_requested':
      case 'refunded':
        return colors.error; // Red
      default:
        return colors.textLight;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'in_delivery':
        return 'In Delivery';
      case 'delivered':
        return 'Delivered';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      case 'refund_requested':
        return 'Refund Requested';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: 2,
            paddingHorizontal: 6,
            borderRadius: 4,
          },
          text: {
            fontSize: 10,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
          },
          text: {
            fontSize: 14,
          },
        };
      default:
        return {
          container: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
          },
          text: {
            fontSize: 12,
          },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const backgroundColor = getStatusColor();

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: backgroundColor + '20' }, // 20% opacity
        sizeStyles.container
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: backgroundColor },
          sizeStyles.text
        ]}
      >
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OrderStatusBadge;