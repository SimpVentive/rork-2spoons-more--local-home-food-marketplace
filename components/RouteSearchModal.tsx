import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import { Search, MapPin, X } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { RouteLocation } from '@/types';

interface RouteSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: RouteLocation) => void;
}

// Mock locations for demo purposes
const mockLocations: RouteLocation[] = [
  {
    id: 'loc-1',
    name: 'Koramangala Metro Station',
    address: 'Koramangala, Bengaluru, Karnataka',
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    id: 'loc-2',
    name: 'Silk Board Junction',
    address: 'Silk Board, Bengaluru, Karnataka',
    latitude: 12.9165,
    longitude: 77.6224,
  },
  {
    id: 'loc-3',
    name: 'Electronic City',
    address: 'Electronic City, Bengaluru, Karnataka',
    latitude: 12.8456,
    longitude: 77.6603,
  },
  {
    id: 'loc-4',
    name: 'Whitefield',
    address: 'Whitefield, Bengaluru, Karnataka',
    latitude: 12.9698,
    longitude: 77.7500,
  },
  {
    id: 'loc-5',
    name: 'Indiranagar',
    address: 'Indiranagar, Bengaluru, Karnataka',
    latitude: 12.9719,
    longitude: 77.6412,
  },
  {
    id: 'loc-6',
    name: 'MG Road',
    address: 'MG Road, Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.6197,
  },
  {
    id: 'loc-7',
    name: 'Brigade Road',
    address: 'Brigade Road, Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.6103,
  },
  {
    id: 'loc-8',
    name: 'Commercial Street',
    address: 'Commercial Street, Bengaluru, Karnataka',
    latitude: 12.9833,
    longitude: 77.6167,
  },
];

export const RouteSearchModal: React.FC<RouteSearchModalProps> = ({
  visible,
  onClose,
  onLocationSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredLocations = mockLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = async (location: RouteLocation) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onLocationSelected(location);
      setSearchQuery('');
    } catch (error) {
      console.error('Error selecting location:', error);
      Alert.alert('Error', 'Failed to select location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Add Route Location</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Input
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for a location..."
                  leftIcon={<Search size={20} color={colors.textLight} />}
                  style={styles.searchInput}
                />
              </View>

              <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
                {filteredLocations.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'No locations found' : 'Start typing to search for locations'}
                    </Text>
                  </View>
                ) : (
                  filteredLocations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={styles.locationItem}
                      onPress={() => handleLocationSelect(location)}
                      disabled={isLoading}
                    >
                      <View style={styles.locationIcon}>
                        <MapPin size={20} color={colors.primary} />
                      </View>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationAddress}>{location.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <View style={styles.footer}>
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    marginBottom: 0,
  },
  locationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textLight,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cancelButton: {
    width: '100%',
  },
});