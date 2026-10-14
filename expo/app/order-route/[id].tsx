import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation, Phone, MessageSquare, Clock, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import Button from '@/components/Button';
import LocationPicker from '@/components/LocationPicker';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  directionUrl: string;
}

export default function OrderRouteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const order: Order = {
          id: data.id,
          listingId: data.listing_id,
          buyerId: data.buyer_id,
          sellerId: data.seller_id,
          dishName: data.dish_name || '',
          quantity: data.quantity || 1,
          totalPrice: data.total_price || 0,
          status: data.status || 'pending',
          pickupTime: data.pickup_time,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          buyerName: data.buyer_name || '',
          buyerPhone: data.buyer_phone || '',
          sellerName: data.seller_name || '',
          sellerPhone: data.seller_phone || '',
          sellerAddress: data.seller_address || '',
          deliveryAddress: data.delivery_address || '',
          deliveryInstructions: data.delivery_instructions || '',
          deliveryMethod: data.delivery_method || 'pickup',
          paymentMethod: data.payment_method || 'cash',
          paymentStatus: data.payment_status || 'pending',
          listingSnapshot: data.listing_snapshot,
          notes: data.notes,
          cancelledAt: data.cancelled_at,
          acceptedAt: data.accepted_at,
          readyAt: data.ready_at,
          deliveredAt: data.delivered_at,
          completedAt: data.completed_at,
        };
        setOrder(order);
        calculateRoute(order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = async (order: Order) => {
    try {
      // Fetch seller location from database
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('location_lat, location_lng')
        .eq('id', order.sellerId)
        .single();

      if (!sellerData) {
        console.error('Seller location not found');
        return;
      }

      // For now, we'll just calculate distance using Haversine formula
      // In production, you'd use Google Maps Distance Matrix API
      const distance = calculateDistance(
        0, 0, // Buyer location (would come from user profile)
        sellerData.location_lat,
        sellerData.location_lng
      );

      // Estimate 5 minutes per km
      const duration = Math.round(distance * 5);

      // Create Google Maps directions URL
      const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${order.listingSnapshot?.location.latitude},${order.listingSnapshot?.location.longitude}&travelmode=driving`;

      setRouteInfo({ distance, duration, directionUrl });
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleOpenMap = () => {
    if (routeInfo?.directionUrl) {
      Linking.openURL(routeInfo.directionUrl);
    }
  };

  const handleCallSeller = () => {
    if (order?.sellerPhone) {
      Linking.openURL(`tel:${order.sellerPhone}`);
    }
  };

  const handleMessageSeller = () => {
    if (order?.sellerPhone) {
      Linking.openURL(`sms:${order.sellerPhone}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pickup Route</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Order Info */}
        <View style={styles.infoCard}>
          <Text style={styles.dishName}>{order.dishName}</Text>
          <Text style={styles.sellerName}>from {order.sellerName}</Text>
          <Text style={styles.statusBadge}>{order.status.toUpperCase()}</Text>
        </View>

        {/* Location Info */}
        <View style={styles.locationCard}>
          <View style={styles.locationItem}>
            <MapPin size={20} color={colors.primary} />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationAddress}>{order.sellerAddress}</Text>
            </View>
          </View>
        </View>

        {/* Route Info */}
        {routeInfo && (
          <View style={styles.routeCard}>
            <View style={styles.routeInfo}>
              <View style={styles.routeItem}>
                <Navigation size={20} color={colors.primary} />
                <View>
                  <Text style={styles.routeLabel}>Distance</Text>
                  <Text style={styles.routeValue}>{routeInfo.distance.toFixed(1)} km</Text>
                </View>
              </View>

              <View style={styles.routeItem}>
                <Clock size={20} color={colors.primary} />
                <View>
                  <Text style={styles.routeLabel}>Est. Time</Text>
                  <Text style={styles.routeValue}>{routeInfo.duration} mins</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Open Map"
            onPress={handleOpenMap}
            icon={<Navigation size={20} color={colors.white} />}
            size="large"
            style={styles.primaryButton}
          />
        </View>

        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleCallSeller}>
            <Phone size={20} color={colors.primary} />
            <Text style={styles.contactButtonText}>Call Seller</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleMessageSeller}>
            <MessageSquare size={20} color={colors.primary} />
            <Text style={styles.contactButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Seller Contact */}
        <View style={styles.sellerCard}>
          <Text style={styles.sellerCardTitle}>Seller Contact</Text>
          <Text style={styles.sellerName}>{order.sellerName}</Text>
          <Text style={styles.sellerPhone}>{order.sellerPhone}</Text>
          <Text style={styles.sellerAddress}>{order.sellerAddress}</Text>
        </View>

        {/* Instructions */}
        {order.deliveryInstructions && (
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Pickup Instructions</Text>
            <Text style={styles.instructionsText}>{order.deliveryInstructions}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  dishName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sellerName: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  statusBadge: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.success,
    backgroundColor: `${colors.success}20`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  locationItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  routeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  routeValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  actionButtons: {
    marginBottom: spacing.lg,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contactButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  sellerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sellerCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sellerPhone: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.semibold,
  },
  instructionsCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  instructionsText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    lineHeight: 20,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
