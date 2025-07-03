import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MapPin, Navigation, Clock, Utensils } from 'lucide-react-native';
import colors from '@/constants/colors';
import { RouteLocation } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';

interface RouteMapViewProps {
  routePoints: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
  dishesOnRoute: Array<{
    latitude: number;
    longitude: number;
    dishName: string;
    availableUntil: string;
    sellerName: string;
  }>;
  onDishPress?: (dish: any) => void;
}

export default function RouteMapView({ routePoints, dishesOnRoute, onDishPress }: RouteMapViewProps) {
  const { user } = useAuthStore();
  const [mapError, setMapError] = useState(false);

  // For web, we'll show a simplified view since Google Maps requires API key
  if (Platform.OS === 'web' || mapError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MapPin size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Your Route Overview</Text>
        </View>

        <ScrollView style={styles.routeList} showsVerticalScrollIndicator={false}>
          {/* Route Points */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Points</Text>
            {routePoints.map((point, index) => (
              <View key={index} style={styles.routePoint}>
                <View style={styles.routePointIcon}>
                  <Text style={styles.routePointNumber}>{index + 1}</Text>
                </View>
                <View style={styles.routePointInfo}>
                  <Text style={styles.routePointName}>{point.name}</Text>
                  <Text style={styles.routePointCoords}>
                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Dishes on Route */}
          {dishesOnRoute.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Dishes on Route</Text>
              {dishesOnRoute.map((dish, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dishItem}
                  onPress={() => onDishPress?.(dish)}
                >
                  <View style={styles.dishIcon}>
                    <Utensils size={16} color={colors.white} />
                  </View>
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>{dish.dishName}</Text>
                    <Text style={styles.dishSeller}>by {dish.sellerName}</Text>
                    <View style={styles.dishTime}>
                      <Clock size={12} color={colors.textLight} />
                      <Text style={styles.dishTimeText}>
                        Until {new Date(dish.availableUntil).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {dishesOnRoute.length === 0 && (
            <View style={styles.emptyState}>
              <Utensils size={48} color={colors.textLight} />
              <Text style={styles.emptyStateTitle}>No dishes found on your route</Text>
              <Text style={styles.emptyStateText}>
                Set up your route preferences to discover food along your daily commute
              </Text>
            </View>
          )}
        </ScrollView>

        {Platform.OS === 'web' && (
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeText}>
              📍 Interactive map view is available on mobile devices
            </Text>
          </View>
        )}
      </View>
    );
  }

  // For native platforms, we could integrate with react-native-maps
  // But since it's not in the allowed packages, we'll use the same fallback
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>Your Route Overview</Text>
      </View>

      <ScrollView style={styles.routeList} showsVerticalScrollIndicator={false}>
        {/* Route Points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Points</Text>
          {routePoints.map((point, index) => (
            <View key={index} style={styles.routePoint}>
              <View style={styles.routePointIcon}>
                <Text style={styles.routePointNumber}>{index + 1}</Text>
              </View>
              <View style={styles.routePointInfo}>
                <Text style={styles.routePointName}>{point.name}</Text>
                <Text style={styles.routePointCoords}>
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Dishes on Route */}
        {dishesOnRoute.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Dishes on Route</Text>
            {dishesOnRoute.map((dish, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dishItem}
                onPress={() => onDishPress?.(dish)}
              >
                <View style={styles.dishIcon}>
                  <Utensils size={16} color={colors.white} />
                </View>
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName}>{dish.dishName}</Text>
                  <Text style={styles.dishSeller}>by {dish.sellerName}</Text>
                  <View style={styles.dishTime}>
                    <Clock size={12} color={colors.textLight} />
                    <Text style={styles.dishTimeText}>
                      Until {new Date(dish.availableUntil).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {dishesOnRoute.length === 0 && (
          <View style={styles.emptyState}>
            <Utensils size={48} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>No dishes found on your route</Text>
            <Text style={styles.emptyStateText}>
              Set up your route preferences to discover food along your daily commute
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.mapNotice}>
        <Text style={styles.mapNoticeText}>
          🗺️ Interactive map coming soon! Currently showing route overview.
        </Text>
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
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  routeList: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routePointIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routePointNumber: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  routePointInfo: {
    flex: 1,
  },
  routePointName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  routePointCoords: {
    fontSize: 12,
    color: colors.textLight,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  dishIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  dishSeller: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  dishTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishTimeText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  webNotice: {
    backgroundColor: colors.info + '20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.info + '40',
  },
  webNoticeText: {
    fontSize: 14,
    color: colors.info,
    textAlign: 'center',
  },
  mapNotice: {
    backgroundColor: colors.secondary + '20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary + '40',
  },
  mapNoticeText: {
    fontSize: 14,
    color: colors.secondary,
    textAlign: 'center',
  },
});