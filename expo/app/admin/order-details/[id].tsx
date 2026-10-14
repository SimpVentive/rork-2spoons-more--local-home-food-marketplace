import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, MapPin, Clock, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface Order {
  id: string;
  userId: string;
  sellerEmail: string;
  sellerName: string;
  listingId: string;
  dishName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  deliveryAddress: string;
  notes: string;
  listingImage: string;
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          userId: data.user_id,
          sellerEmail: data.seller_email || '',
          sellerName: data.seller_name || '',
          listingId: data.listing_id,
          dishName: data.dish_name || '',
          quantity: data.quantity || 1,
          totalPrice: data.total_price || 0,
          status: data.status || 'pending',
          createdAt: data.created_at,
          deliveryAddress: data.delivery_address || '',
          notes: data.notes || '',
          listingImage: data.listing_image || '',
        };
        setOrder(order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      if (order) {
        await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', order.id);

        Alert.alert('Success', `Order status updated to ${newStatus}`);
        loadOrder();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'confirmed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.warning;
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {order.listingImage && (
        <Image
          source={{ uri: order.listingImage }}
          style={styles.image}
          contentFit="cover"
        />
      )}

      <View style={styles.detailsSection}>
        <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>

        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.dishCard}>
          <Text style={styles.dishName}>{order.dishName}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Quantity:</Text>
            <Text style={styles.value}>{order.quantity}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Price:</Text>
            <Text style={styles.value}>₹{order.totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Seller Information</Text>
        <View style={styles.infoRow}>
          <User size={16} color={colors.textLight} />
          <Text style={styles.value}>{order.sellerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{order.sellerEmail}</Text>
        </View>

        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.textLight} />
          <Text style={styles.value}>{order.deliveryAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={16} color={colors.textLight} />
          <Text style={styles.value}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>

        {order.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{order.notes}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Change Status</Text>
        <View style={styles.statusButtons}>
          {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                order.status === status && styles.activeStatusButton,
              ]}
              onPress={() => handleStatusChange(status)}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  order.status === status && styles.activeStatusButtonText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing['2xl'],
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
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.border,
  },
  detailsSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
  },
  orderId: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  dishCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  dishName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textLight,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  notes: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    lineHeight: 20,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  activeStatusButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  activeStatusButtonText: {
    color: colors.white,
  },
  errorText: {
    fontSize: typography.sizes.base,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
});
