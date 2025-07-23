import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Search, MapPin, Navigation, CheckCircle, Route } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import colors from '@/constants/colors';
import Button from '@/components/Button';

interface LocationPickerProps {
  visible: boolean;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  onClose: () => void;
  title: string;
  showRoute: boolean;
  routeStart: any;
  routeEnd: any;
  routePoints?: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
  dishesOnRoute?: Array<{
    latitude: number;
    longitude: number;
    dishName: string;
    availableUntil: string;
    sellerName: string;
  }>;
}

const LocationPickerNative: React.FC<LocationPickerProps> = ({
  visible,
  initialLocation,
  onLocationSelect,
  onClose,
  title,
  showRoute,
  routeStart,
  routeEnd,
  routePoints = [],
  dishesOnRoute = [],
}) => {
  const [location, setLocation] = useState({
    latitude: initialLocation?.latitude || 17.4123,
    longitude: initialLocation?.longitude || 78.2679,
    address: initialLocation?.address || '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>({
    latitude: initialLocation?.latitude || 17.4123,
    longitude: initialLocation?.longitude || 78.2679,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showRouteOverlay, setShowRouteOverlay] = useState(false);
  
  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  const requestLocationPermission = async () => {
    if (initialLocation?.latitude && initialLocation?.longitude) {
      setMapRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      return;
    }
    
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const { latitude, longitude } = currentLocation.coords;
        
        // Get address from coordinates
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        if (addressResponse && addressResponse.length > 0) {
          const address = formatAddress(addressResponse[0]);
          
          setLocation({
            latitude,
            longitude,
            address,
          });
          
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }
    
    setIsLoading(false);
  };
  
  const formatAddress = (addressObj: Location.LocationGeocodedAddress) => {
    const components = [
      addressObj.name,
      addressObj.street,
      addressObj.district,
      addressObj.city,
      addressObj.region,
      addressObj.postalCode,
    ].filter(Boolean);
    
    return components.join(', ');
  };
  
  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setIsLoading(true);
    
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      
      if (addressResponse && addressResponse.length > 0) {
        const address = formatAddress(addressResponse[0]);
        
        setLocation({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          address,
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    
    setIsLoading(false);
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length > 0) {
        const searchResults = await Promise.all(
          results.map(async (result) => {
            const addressResponse = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            
            return {
              latitude: result.latitude,
              longitude: result.longitude,
              address: addressResponse[0] ? formatAddress(addressResponse[0]) : 'Unknown location',
            };
          })
        );
        
        setSearchResults(searchResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    }
    
    setIsLoading(false);
  };
  
  const handleSelectSearchResult = (result: any) => {
    setLocation(result);
    setSearchResults([]);
    setSearchQuery('');
    
    setMapRegion({
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };
  
  const handleConfirm = () => {
    onLocationSelect(location);
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const { latitude, longitude } = currentLocation.coords;
        
        // Get address from coordinates
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        if (addressResponse && addressResponse.length > 0) {
          const address = formatAddress(addressResponse[0]);
          
          setLocation({
            latitude,
            longitude,
            address,
          });
          
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChange = (region: any) => {
    setMapRegion(region);
  };

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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.headerButtons}>
              {(showRoute || routePoints.length > 0) && (
                <TouchableOpacity 
                  style={styles.routeButton}
                  onPress={() => setShowRouteOverlay(!showRouteOverlay)}
                >
                  <Route size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Search size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {searchResults.length > 0 && (
            <ScrollView style={styles.searchResultsContainer} nestedScrollEnabled>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <MapPin size={16} color={colors.primary} />
                  <Text style={styles.searchResultText} numberOfLines={2}>{result.address}</Text>
                  <CheckCircle size={16} color={colors.primary} style={styles.checkIcon} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <View style={styles.mapContainer}>
            {isLoading && (
              <View style={styles.mapLoadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            
            {Platform.OS !== 'web' ? (
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={mapRegion}
                onRegionChangeComplete={handleRegionChange}
                onPress={handleMapPress}
                onMapReady={() => setMapReady(true)}
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
                {/* Selected location marker */}
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Selected Location"
                  description={location.address}
                  pinColor={colors.primary}
                />
                
                {/* Route points markers */}
                {showRouteOverlay && routePoints.map((point, index) => (
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
                {showRouteOverlay && routePoints.length > 1 && (
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
                {showRouteOverlay && dishesOnRoute.map((dish, index) => (
                  <Marker
                    key={`dish-${index}`}
                    coordinate={{
                      latitude: dish.latitude,
                      longitude: dish.longitude,
                    }}
                    title={dish.dishName}
                    description={`By ${dish.sellerName} • Available until ${new Date(dish.availableUntil).toLocaleTimeString()}`}
                    pinColor={colors.success}
                  >
                    <View style={styles.dishMarker}>
                      <Text style={styles.dishMarkerText}>🍽️</Text>
                    </View>
                  </Marker>
                ))}
              </MapView>
            ) : (
              <View style={styles.webMapFallback}>
                <MapPin size={48} color={colors.textLight} />
                <Text style={styles.webMapText}>
                  Interactive map not available on web
                </Text>
                <Text style={styles.webMapSubtext}>
                  Please use the search function above to find locations
                </Text>
              </View>
            )}
            
            {Platform.OS !== 'web' && (
              <>
                <View style={styles.mapControlsContainer}>
                  <TouchableOpacity 
                    style={styles.mapControlButton}
                    onPress={getCurrentLocation}
                  >
                    <Navigation size={24} color={colors.primary} />
                  </TouchableOpacity>
                  
                  {routePoints.length > 0 && (
                    <TouchableOpacity 
                      style={styles.mapControlButton}
                      onPress={fitToRoute}
                    >
                      <Route size={24} color={colors.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.markerFixed}>
                  <MapPin size={32} color={colors.primary} />
                </View>
              </>
            )}
          </View>
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Selected Address:</Text>
            <Text style={styles.addressText}>{location.address || 'Tap on the map to select a location'}</Text>
            
            {showRouteOverlay && routePoints.length > 0 && (
              <View style={styles.routeInfo}>
                <Text style={styles.routeInfoText}>
                  📍 Showing {routePoints.length} route points and {dishesOnRoute.length} available dishes
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Confirm Location"
              onPress={handleConfirm}
              style={styles.confirmButton}
              disabled={!location.address}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    color: colors.text,
    fontSize: 16,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsContainer: {
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
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
  addressContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
  },
  routeInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 6,
  },
  routeInfoText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 2,
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
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

export default LocationPickerNative;