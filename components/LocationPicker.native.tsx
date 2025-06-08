import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { X, Search, MapPin, Navigation, CheckCircle } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import colors from '@/constants/colors';
import Button from './Button';

interface LocationPickerProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  onSelectLocation: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  onClose: () => void;
}

const LocationPickerNative: React.FC<LocationPickerProps> = ({
  initialLocation,
  onSelectLocation,
  onClose,
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
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 17.4123,
    longitude: initialLocation?.longitude || 78.2679,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
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
    onSelectLocation(location);
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

  const handleRegionChange = (region: Region) => {
    setMapRegion(region);
  };
  
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Search size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
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
            </View>
          )}
          
          <View style={styles.mapContainer}>
            {isLoading && (
              <View style={styles.mapLoadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            
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
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Selected Location"
                description={location.address}
                pinColor={colors.primary}
              />
            </MapView>
            
            <View style={styles.mapControlsContainer}>
              <TouchableOpacity 
                style={styles.mapControlButton}
                onPress={getCurrentLocation}
              >
                <Navigation size={24} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mapTypeButton}
                onPress={() => {/* Toggle map type */}}
              >
                <Text style={styles.mapTypeText}>Map</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.markerFixed}>
              <MapPin size={32} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Selected Address:</Text>
            <Text style={styles.addressText}>{location.address || 'Tap on the map to select a location'}</Text>
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

const { width, height } = Dimensions.get('window');

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
  mapTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
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
});

export default LocationPickerNative;