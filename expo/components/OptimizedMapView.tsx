import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';

// Simplified types for better Android compatibility
interface LiteMapPoint {
  lat: number;
  lng: number;
  title?: string;
  count?: number;
}

// Simple fallback functions
const calculateMapRegion = (points: LiteMapPoint[]) => {
  if (points.length === 0) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }
  
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat, 0.01) * 1.2,
    longitudeDelta: Math.max(maxLng - minLng, 0.01) * 1.2,
  };
};

const loadMapComponent = async () => {
  try {
    if (Platform.OS === 'web') {
      return null;
    }
    const MapView = require('react-native-maps').default;
    const { Marker, Polyline, PROVIDER_GOOGLE } = require('react-native-maps');
    return { MapView, Marker, Polyline, PROVIDER_GOOGLE };
  } catch (error) {
    console.warn('Maps not available:', error);
    return null;
  }
};

interface OptimizedMapViewProps {
  points: LiteMapPoint[];
  routePoints?: LiteMapPoint[];
  onPointPress?: (point: LiteMapPoint) => void;
  showRoute?: boolean;
  style?: any;
  zoomLevel?: number;
}

const OptimizedMapView: React.FC<OptimizedMapViewProps> = ({
  points,
  routePoints = [],
  onPointPress,
  showRoute = false,
  style,
  zoomLevel = 12,
}) => {
  const [mapComponents, setMapComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations for performance
  const mapRegion = useMemo(() => {
    const allPoints = [...points, ...routePoints];
    return calculateMapRegion(allPoints);
  }, [points, routePoints]);

  const clusteredMarkers = useMemo(() => {
    // Simplified - no clustering for Android compatibility
    return points.slice(0, 20); // Limit markers for performance
  }, [points]);

  // Load map components dynamically
  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      try {
        const components = await loadMapComponent();
        
        if (mounted) {
          setMapComponents(components);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load map components:', err);
        if (mounted) {
          setError('Failed to load map');
          setLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle marker press
  const handleMarkerPress = useCallback((point: LiteMapPoint) => {
    onPointPress?.(point);
  }, [onPointPress]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !mapComponents) {
    return (
      <View style={[styles.container, styles.fallbackContainer, style]}>
        <MapPin size={48} color={colors.textLight} />
        <Text style={styles.fallbackTitle}>Map Unavailable</Text>
        <Text style={styles.fallbackSubtitle}>
          {error || 'Interactive map not available on this platform'}
        </Text>
        <Text style={styles.fallbackInfo}>
          Showing {points.length} locations
        </Text>
      </View>
    );
  }

  // Web fallback
  if (Platform.OS === 'web' || !mapComponents.MapView) {
    return (
      <View style={[styles.container, styles.fallbackContainer, style]}>
        <MapPin size={48} color={colors.textLight} />
        <Text style={styles.fallbackTitle}>Interactive Map</Text>
        <Text style={styles.fallbackSubtitle}>
          Map view optimized for mobile devices
        </Text>
        <Text style={styles.fallbackInfo}>
          Showing {points.length} locations
          {routePoints.length > 0 && ` • ${routePoints.length} route points`}
        </Text>
      </View>
    );
  }

  const { MapView, Marker, Polyline, PROVIDER_GOOGLE } = mapComponents;

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        mapType="standard"
      >
        {/* Simple markers */}
        {clusteredMarkers.map((point, index) => (
          <Marker
            key={`marker-${index}`}
            coordinate={{
              latitude: point.lat,
              longitude: point.lng,
            }}
            title={point.title || `Location ${index + 1}`}
            onPress={() => handleMarkerPress(point)}
          />
        ))}

        {/* Route polyline */}
        {showRoute && routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints.map(point => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            strokeColor={colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}

        {/* Route markers */}
        {showRoute && routePoints.map((point, index) => (
          <Marker
            key={`route-${index}`}
            coordinate={{
              latitude: point.lat,
              longitude: point.lng,
            }}
            title={point.title || `Stop ${index + 1}`}
          >
            <View style={[
              styles.routeMarker,
              index === 0 && styles.startMarker,
              index === routePoints.length - 1 && styles.endMarker,
            ]}>
              <Text style={styles.routeMarkerText}>
                {index === 0 ? '🏠' : index === routePoints.length - 1 ? '🏢' : index + 1}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  fallbackInfo: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  singleMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startMarker: {
    borderColor: colors.success,
  },
  endMarker: {
    borderColor: colors.secondary,
  },
  routeMarkerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default OptimizedMapView;
export type { LiteMapPoint };