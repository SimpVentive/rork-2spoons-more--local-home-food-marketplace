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
} from 'react-native';
import { X, Search, MapPin, Navigation, CheckCircle } from 'lucide-react-native';
import * as Location from 'expo-location';
import colors from '../constants/colors';
import Button from './Button';

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
  title?: string;
  searchPlaceholder?: string;
}

export default function LocationPickerNativeWeb({
  visible,
  initialLocation,
  onLocationSelect,
  onClose,
  title = "Select Location",
  searchPlaceholder = "Search for a location..."
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Array<{
    latitude: number;
    longitude: number;
    address: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const address = await reverseGeocode(location.coords.latitude, location.coords.longitude);
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address || 'Current Location'
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const addr = result[0];
        return `${addr.street || ''} ${addr.city || ''} ${addr.region || ''} ${addr.country || ''}`.trim();
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await Location.geocodeAsync(query);
      const formattedResults = await Promise.all(
        results.slice(0, 5).map(async (result) => {
          const address = await reverseGeocode(result.latitude, result.longitude);
          return {
            latitude: result.latitude,
            longitude: result.longitude,
            address
          };
        })
      );
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchLocations(text);
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    onLocationSelect(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.webMapFallback}>
          <MapPin size={48} color={colors.textLight} />
          <Text style={styles.webMapText}>Map view is not available on web</Text>
          <Text style={styles.webMapSubtext}>Please use the mobile app for full map functionality</Text>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {isLoadingLocation && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          )}

          {currentLocation && (
            <TouchableOpacity
              style={styles.locationItem}
              onPress={() => handleLocationSelect(currentLocation)}
            >
              <View style={styles.locationIcon}>
                <Navigation size={20} color={colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Current Location</Text>
                <Text style={styles.locationAddress}>{currentLocation.address}</Text>
              </View>
              <CheckCircle size={20} color={colors.success} />
            </TouchableOpacity>
          )}

          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.locationItem}
              onPress={() => handleLocationSelect(result)}
            >
              <View style={styles.locationIcon}>
                <MapPin size={20} color={colors.textLight} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>Search Result</Text>
                <Text style={styles.locationAddress}>{result.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
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
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textLight,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    marginTop: 8,
  },
});