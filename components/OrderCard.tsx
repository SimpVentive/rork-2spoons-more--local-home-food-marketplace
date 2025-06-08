import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Clock, MapPin } from 'lucide-react-native';
import { Order } from '@/types';
import OrderStatusBadge from './OrderStatusBadge';
import colors from '@/constants/colors';

interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(order)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      
      <View style={styles.content}>
        <Image
          source={{ uri: order.listingSnapshot.image }}
          style={styles.image}
          contentFit="cover"
        />
        
        <View style={styles.details}>
          <Text style={styles.dishName}>{order.listingSnapshot.dishName}</Text>
          
          <View style={styles.sellerInfo}>
            <Text style={styles.label}>Seller: </Text>
            <Text style={styles.value}>{order.listingSnapshot.sellerName}</Text>
          </View>
          
          <View style={styles.quantityInfo}>
            <Text style={styles.label}>Quantity: </Text>
            <Text style={styles.value}>{order.quantity} portions</Text>
          </View>
          
          <View style={styles.priceInfo}>
            <Text style={styles.label}>Total: </Text>
            <Text style={styles.price}>₹{order.totalPrice}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Clock size={14} color={colors.textLight} />
          <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <MapPin size={14} color={colors.textLight} />
          <Text style={styles.infoText} numberOfLines={1}>
            {order.deliveryMethod === 'pickup' 
              ? 'Pickup at seller location' 
              : `Delivery to ${order.deliveryAddress}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  quantityInfo: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
  },
  value: {
    fontSize: 14,
    color: colors.text,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
});

export default OrderCard;