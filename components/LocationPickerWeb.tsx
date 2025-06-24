import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Search, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
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

const LocationPicker: React.FC<LocationPickerProps> = ({
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
  
  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  const requestLocationPermission = async () => {
    if (initialLocation) return;
    
    setIsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
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
  };
  
  const handleConfirm = () => {
    onSelectLocation(location);
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
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(result)}
                >
                  <MapPin size={16} color={colors.primary} />
                  <Text style={styles.searchResultText}>{result.address}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.webMapFallback}>
            <Text style={styles.webMapText}>
              Map view is not available on web. Please enter an address in the search box.
            </Text>
            
            <View style={styles.selectedLocationContainer}>
              <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
              <Text style={styles.selectedLocationText}>{location.address || 'No location selected'}</Text>
            </View>
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
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  webMapFallback: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 8,
  },
  webMapText: {
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: 20,
  },
  selectedLocationContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  selectedLocationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  selectedLocationText: {
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

export default LocationPicker;