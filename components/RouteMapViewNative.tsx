import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MapPin, Navigation, Clock, Utensils, Route } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
import colors from '@/constants/colors';
import { RouteLocation } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';

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

export default function RouteMapViewNative({ routePoints, dishesOnRoute, onDishPress }: RouteMapViewNativeProps) {
  const { user } = useAuthStore();
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: routePoints[0]?.latitude || 17.4123,
    longitude: routePoints[0]?.longitude || 78.2679,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (routePoints.length > 0) {
      fitToRoute();
    }
  }, [routePoints]);

  const fitToRoute = () => {
    if (routePoints.length === 0) return;
    
    const latitudes = routePoints.map(p => p.latitude);
    const longitudes = routePoints.map(p => p.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2; // Add padding
    const deltaLng = (maxLng - minLng) * 1.2;
    
    setMapRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    });
  };

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

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass
          showsScale
          showsBuildings
          showsTraffic
          showsIndoors
          mapType="standard"
          zoomEnabled
          zoomControlEnabled
          rotateEnabled
          scrollEnabled
          pitchEnabled
        >
          {/* Route points markers */}
          {routePoints.map((point, index) => (
            <Marker
              key={`route-${index}`}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              title={point.name}
              description="Route point"
              pinColor={index === 0 ? colors.success : index === routePoints.length - 1 ? colors.secondary : colors.warning}
            >
              <View style={[
                styles.routeMarker,
                index === 0 && styles.startMarker,
                index === routePoints.length - 1 && styles.endMarker
              ]}>
                <Text style={styles.routeMarkerText}>
                  {index === 0 ? '🏠' : index === routePoints.length - 1 ? '🏢' : index}
                </Text>
              </View>
            </Marker>
          ))}
          
          {/* Route polyline */}
          {routePoints.length > 1 && (
            <Polyline
              coordinates={routePoints.map(point => ({
                latitude: point.latitude,
                longitude: point.longitude,
              }))}
              strokeColor={colors.primary}
              strokeWidth={3}
            />
          )}
          
          {/* Dishes on route markers */}
          {dishesOnRoute.map((dish, index) => (
            <Marker
              key={`dish-${index}`}
              coordinate={{
                latitude: dish.latitude,
                longitude: dish.longitude,
              }}
              title={dish.dishName}
              description={`By ${dish.sellerName} • Available until ${new Date(dish.availableUntil).toLocaleTimeString()}`}
              pinColor={colors.success}
              onPress={() => onDishPress?.(dish)}
            >
              <View style={styles.dishMarker}>
                <Text style={styles.dishMarkerText}>🍽️</Text>
              </View>
            </Marker>
          ))}
        </MapView>
        
        <View style={styles.mapControlsContainer}>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={fitToRoute}
          >
            <Route size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControlsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
  },
  mapControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  routeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startMarker: {
    borderColor: colors.success,
  },
  endMarker: {
    borderColor: colors.secondary,
  },
  routeMarkerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dishMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dishMarkerText: {
    fontSize: 16,
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
});