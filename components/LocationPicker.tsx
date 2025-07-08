import React from 'react';
import { Platform } from 'react-native';
import LocationPickerNative from './LocationPickerNative';

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

const LocationPicker: React.FC<LocationPickerProps> = (props) => {
  // For now, always use the native implementation
  // In the future, you could add web-specific implementation here
  return <LocationPickerNative {...props} />;
};

export default LocationPicker;