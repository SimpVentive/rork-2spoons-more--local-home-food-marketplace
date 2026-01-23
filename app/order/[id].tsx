import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useOrdersStore } from '@/store/orders-store';
import Button from '@/components/Button';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import RatingStars from '@/components/RatingStars';
import colors from '@/constants/colors';
import type { OrderStatus } from '@/types';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { getOrderById, updateOrderStatus, rateOrder } = useOrdersStore();
  
  const [rating, setRating] = useState(5);
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const router = useRouter();
  
  const order = id ? getOrderById(id) : null;
  
  if (!order || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }
  
  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;
  
  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (!isSeller) return;
    
    updateOrderStatus(order.id, newStatus);
    Alert.alert('Success', `Order status updated to ${newStatus}`);
  };
  
  const handleRateOrder = () => {
    if (!isBuyer || order.isRated) return;
    
    rateOrder(order.id, rating);
    setShowRatingModal(false);
    Alert.alert('Thank You!', 'Your rating has been submitted');
  };
  
  const handleFileComplaint = () => {
    if (!isBuyer) return;
    
    router.push(`/file-complaint?orderId=${order.id}`);
  };
  
  const getStatusActions = () => {
    if (!isSeller) return null;
    
    switch (order.status) {
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <Button
              title="Accept Order"
              onPress={() => handleStatusUpdate('confirmed')}
              style={styles.acceptButton}
            />
            <Button
              title="Reject"
              onPress={() => handleStatusUpdate('canceled')}
              variant="outline"
              style={styles.rejectButton}
              textStyle={styles.rejectButtonText}
            />
          </View>
        );
      case 'confirmed':
        return (
          <Button
            title="Mark as Ready"
            onPress={() => handleStatusUpdate('ready')}
          />
        );
      case 'ready':
        return (
          <Button
            title="Mark as Delivered"
            onPress={() => handleStatusUpdate('completed')}
          />
        );
      case 'completed':
        return (
          <Button
            title="Mark as Completed"
            onPress={() => handleStatusUpdate('completed')}
          />
        );
      default:
        return null;
    }
  };
  
  const getBuyerActions = () => {
    if (!isBuyer) return null;
    
    if (order.status === 'completed' && !order.isRated) {
      return (
        <Button
          title="Rate Order"
          onPress={() => setShowRatingModal(true)}
        />
      );
    }
    
    if (['delivered', 'completed'].includes(order.status) && !order.isRated) {
      return (
        <View style={styles.actionButtons}>
          <Button
            title="Rate Order"
            onPress={() => setShowRatingModal(true)}
            style={styles.rateButton}
          />
          <Button
            title="File Complaint"
            onPress={handleFileComplaint}
            variant="outline"
            style={styles.complaintButton}
          />
        </View>
      );
    }
    
    return (
      <Button
        title="File Complaint"
        onPress={handleFileComplaint}
        variant="outline"
      />
    );
  };
  
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.orderStatusContainer}>
          <Text style={styles.orderIdText}>Order #{order.id.slice(0, 8)}</Text>
          <OrderStatusBadge status={order.status} />
        </View>
        
        <Text style={styles.dateText}>
          Ordered on {formatDateTime(order.createdAt)}
        </Text>
      </View>
      
      <View style={styles.card}>
        <View style={styles.dishContainer}>
          <Image
            source={{ uri: order.listingSnapshot?.image }}
            style={styles.dishImage}
            contentFit="cover"
          />
          
          <View style={styles.dishInfo}>
            <Text style={styles.dishName}>{order.listingSnapshot?.dishName}</Text>
            <Text style={styles.dishPrice}>₹{order.listingSnapshot?.price} x {order.quantity}</Text>
            <Text style={styles.totalPrice}>Total: ₹{order.totalPrice}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.sellerContainer}
          onPress={() => router.push(`/profile/${order.sellerId}`)}
        >
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerLabel}>Seller</Text>
            <Text style={styles.sellerName}>{order.listingSnapshot?.sellerName}</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </TouchableOpacity>
        
        <View style={styles.deliveryContainer}>
          <View style={styles.deliveryMethod}>
            <Text style={styles.deliveryLabel}>Delivery Method</Text>
            <Text style={styles.deliveryValue}>{order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</Text>
          </View>
          
          <View style={styles.deliveryAddress}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.addressText}>
              {order.deliveryMethod === 'pickup' 
                ? order.listingSnapshot?.location?.address || order.sellerAddress 
                : order.deliveryAddress || 'No address provided'}
            </Text>
          </View>
        </View>
        
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentLabel}>Payment Method</Text>
          <Text style={styles.paymentValue}>
            {order.paymentMethod === 'cash' 
              ? 'Cash on Delivery' 
              : order.paymentMethod === 'upi' 
                ? 'UPI' 
                : 'Online Payment'}
          </Text>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Timeline</Text>
        
        <View style={styles.timelineContainer}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.completedDot]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Order Placed</Text>
              <Text style={styles.timelineTime}>{formatDateTime(order.createdAt)}</Text>
            </View>
          </View>
          
          <View style={[styles.timelineConnector, order.acceptedAt ? styles.completedConnector : {}]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, order.acceptedAt ? styles.completedDot : {}]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Order Accepted</Text>
              <Text style={styles.timelineTime}>
                {order.acceptedAt ? formatDateTime(order.acceptedAt) : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.timelineConnector, order.readyAt ? styles.completedConnector : {}]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, order.readyAt ? styles.completedDot : {}]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Ready for Pickup/Delivery</Text>
              <Text style={styles.timelineTime}>
                {order.readyAt ? formatDateTime(order.readyAt) : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.timelineConnector, order.deliveredAt ? styles.completedConnector : {}]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, order.deliveredAt ? styles.completedDot : {}]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Delivered</Text>
              <Text style={styles.timelineTime}>
                {order.deliveredAt ? formatDateTime(order.deliveredAt) : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View style={[styles.timelineConnector, order.completedAt ? styles.completedConnector : {}]} />
          
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, order.completedAt ? styles.completedDot : {}]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Completed</Text>
              <Text style={styles.timelineTime}>
                {order.completedAt ? formatDateTime(order.completedAt) : 'Pending'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {order.status === 'cancelled' && (
        <View style={styles.cancelledCard}>
          <AlertTriangle size={20} color={colors.error} />
          <Text style={styles.cancelledText}>
            This order was cancelled on {formatDateTime(order.cancelledAt || '')}
          </Text>
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        {isSeller ? getStatusActions() : getBuyerActions()}
      </View>
      
      {showRatingModal && (
        <View style={styles.ratingModalContainer}>
          <View style={styles.ratingModal}>
            <Text style={styles.ratingTitle}>Rate Your Order</Text>
            <Text style={styles.ratingSubtitle}>How was your experience?</Text>
            
            <View style={styles.starsContainer}>
              <RatingStars
                rating={rating}
                size={36}
                onRatingChange={setRating}
              />
            </View>
            
            <View style={styles.ratingActions}>
              <Button
                title="Cancel"
                onPress={() => setShowRatingModal(false)}
                variant="outline"
                style={styles.ratingCancelButton}
              />
              <Button
                title="Submit"
                onPress={handleRateOrder}
                style={styles.ratingSubmitButton}
              />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dateText: {
    fontSize: 14,
    color: colors.textLight,
  },
  card: {
    backgroundColor: colors.white,
    marginTop: 16,
    padding: 16,
  },
  dishContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  deliveryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deliveryMethod: {
    marginBottom: 8,
  },
  deliveryLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  deliveryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  deliveryAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  paymentContainer: {
    paddingTop: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    marginTop: 2,
  },
  completedDot: {
    backgroundColor: colors.success,
  },
  timelineConnector: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 7,
  },
  completedConnector: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: colors.textLight,
  },
  cancelledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}10`,
    padding: 16,
    marginTop: 16,
  },
  cancelledText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    flex: 2,
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    borderColor: colors.error,
  },
  rejectButtonText: {
    color: colors.error,
  },
  rateButton: {
    flex: 1,
    marginRight: 8,
  },
  complaintButton: {
    flex: 1,
  },
  ratingModalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  ratingModal: {
    width: '80%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingActions: {
    flexDirection: 'row',
  },
  ratingCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  ratingSubmitButton: {
    flex: 2,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 24,
  },
});