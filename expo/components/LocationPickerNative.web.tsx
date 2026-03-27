import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, MapPin } from 'lucide-react-native';
import colors from '@/constants/colors';
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
  onSelectLocation?: (location: {
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

const LocationPickerNativeWeb: React.FC<LocationPickerProps> = ({
  visible,
  initialLocation,
  onLocationSelect,
  onSelectLocation,
  onClose,
  title,
  showRoute,
  routeStart,
  routeEnd,
  routePoints = [],
  dishesOnRoute = [],
}) => {
  const handleLocationSelect = onLocationSelect || onSelectLocation;
  const handleConfirm = () => {
    if (handleLocationSelect) {
      handleLocationSelect({
        latitude: initialLocation?.latitude || 17.4123,
        longitude: initialLocation?.longitude || 78.2679,
        address: initialLocation?.address || 'Default location (Web fallback)',
      });
    }
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
            <Text style={styles.title}>{title || 'Select Location (Web)'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.mapPlaceholder}>
              <MapPin size={48} color={colors.textLight} />
              <Text style={styles.mapPlaceholderText}>
                Interactive map not available on web
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Google Maps integration coming soon for web platform
              </Text>
            </View>
            
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location:</Text>
              <Text style={styles.locationText}>
                {initialLocation?.address || 'No location selected'}
              </Text>
              
              {routePoints.length > 0 && (
                <View style={styles.routeInfo}>
                  <Text style={styles.routeLabel}>Route Points:</Text>
                  {routePoints.map((point, index) => (
                    <Text key={index} style={styles.routePoint}>
                      {index + 1}. {point.name}
                    </Text>
                  ))}
                </View>
              )}
              
              {dishesOnRoute.length > 0 && (
                <View style={styles.dishInfo}>
                  <Text style={styles.dishLabel}>
                    {dishesOnRoute.length} dishes available on route
                  </Text>
                </View>
              )}
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
              title="Use Current Location"
              onPress={handleConfirm}
              style={styles.confirmButton}
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
  content: {
    flex: 1,
    padding: 20,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  locationInfo: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  routeInfo: {
    marginTop: 12,
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  routePoint: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  dishInfo: {
    marginTop: 12,
  },
  dishLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
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

export default LocationPickerNativeWeb;