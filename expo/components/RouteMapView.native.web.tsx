import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Route } from 'lucide-react-native';
import colors from '@/constants/colors';

interface RouteMapViewNativeProps {
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

export default function RouteMapViewNativeWeb({ routePoints, dishesOnRoute, onDishPress }: RouteMapViewNativeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Route size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>Your Route Map</Text>
        <View style={styles.routeStats}>
          <Text style={styles.routeStatsText}>
            {routePoints.length} stops • {dishesOnRoute.length} dishes available
          </Text>
        </View>
      </View>
      
      <View style={styles.webMapFallback}>
        <MapPin size={48} color={colors.textLight} />
        <Text style={styles.webMapText}>Map view is not available on web</Text>
        <Text style={styles.webMapSubtext}>Please use the mobile app for full map functionality</Text>
      </View>
      
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
    </View>
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
  routeSummary: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    paddingVertical: 4,
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
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 32,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});