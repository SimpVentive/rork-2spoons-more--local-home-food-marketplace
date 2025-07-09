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
import { MapPin, Navigation, Clock, Utensils, Route } from 'lucide-react-native';
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

  // For web and fallback, we'll show a comprehensive route overview
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Route size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Your Route Overview</Text>
          <View style={styles.routeStats}>
            <Text style={styles.routeStatsText}>
              {routePoints.length} stops • {dishesOnRoute.length} dishes available
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Route Visualization */}
          <View style={styles.routeVisualization}>
            {routePoints.map((point, index) => (
              <View key={index} style={styles.routePointContainer}>
                <View style={styles.routePointLeft}>
                  <View style={[
                    styles.routePointDot,
                    index === 0 && styles.startPoint,
                    index === routePoints.length - 1 && styles.endPoint
                  ]}>
                    <Text style={styles.routePointNumber}>
                      {index === 0 ? '🏠' : index === routePoints.length - 1 ? '🏢' : index}
                    </Text>
                  </View>
                  {index < routePoints.length - 1 && <View style={styles.routeLine} />}
                </View>
                
                <View style={styles.routePointInfo}>
                  <Text style={styles.routePointName}>{point.name}</Text>
                  <Text style={styles.routePointCoords}>
                    {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                  </Text>
                  
                  {/* Show dishes near this point */}
                  {dishesOnRoute.filter(dish => {
                    const distance = calculateDistance(
                      point.latitude,
                      point.longitude,
                      dish.latitude,
                      dish.longitude
                    );
                    return distance < 0.5; // Within 500m
                  }).map((dish, dishIndex) => (
                    <TouchableOpacity
                      key={dishIndex}
                      style={styles.nearbyDish}
                      onPress={() => onDishPress?.(dish)}
                    >
                      <Utensils size={14} color={colors.secondary} />
                      <Text style={styles.nearbyDishText}>{dish.dishName}</Text>
                      <Text style={styles.nearbyDishSeller}>by {dish.sellerName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* All Dishes on Route */}
          {dishesOnRoute.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Available Dishes on Route</Text>
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
                    <View style={styles.dishLocation}>
                      <MapPin size={12} color={colors.textLight} />
                      <Text style={styles.dishLocationText}>
                        {dish.latitude.toFixed(4)}, {dish.longitude.toFixed(4)}
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

          {/* Route Summary */}
          <View style={styles.routeSummary}>
            <Text style={styles.routeSummaryTitle}>Route Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Stops:</Text>
              <Text style={styles.summaryValue}>{routePoints.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Available Dishes:</Text>
              <Text style={styles.summaryValue}>{dishesOnRoute.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Distance:</Text>
              <Text style={styles.summaryValue}>
                {calculateTotalDistance(routePoints).toFixed(1)} km
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.mapNotice}>
          <Text style={styles.mapNoticeText}>
            🗺️ Interactive Google Maps integration coming soon!
          </Text>
        </View>
      </View>
    );
  }

  // For native platforms, use the native map component
  const RouteMapViewNative = require('./RouteMapViewNative').default;
  return (
    <RouteMapViewNative
      routePoints={routePoints}
      dishesOnRoute={dishesOnRoute}
      onDishPress={onDishPress}
    />
  );
}

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Calculate total route distance
const calculateTotalDistance = (points: Array<{latitude: number; longitude: number}>): number => {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
  }
  return totalDistance;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
    marginBottom: 4,
  },
  routeStats: {
    marginTop: 4,
  },
  routeStatsText: {
    fontSize: 14,
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  routeVisualization: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
  },
  routePointContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  routePointLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  routePointDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  startPoint: {
    backgroundColor: colors.success,
  },
  endPoint: {
    backgroundColor: colors.secondary,
  },
  routePointNumber: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.border,
  },
  routePointInfo: {
    flex: 1,
    paddingTop: 8,
  },
  routePointName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  routePointCoords: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  nearbyDish: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  nearbyDishText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 6,
    flex: 1,
  },
  nearbyDishSeller: {
    fontSize: 10,
    color: colors.textLight,
  },
  section: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
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
    marginBottom: 2,
  },
  dishTimeText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 4,
  },
  dishLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dishLocationText: {
    fontSize: 10,
    color: colors.textLight,
    marginLeft: 4,
  },
  routeSummary: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 12,
  },
  routeSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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