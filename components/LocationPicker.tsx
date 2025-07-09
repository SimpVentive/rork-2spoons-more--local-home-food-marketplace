import React from 'react';
import { Platform } from 'react-native';

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

const LocationPicker: React.FC<LocationPickerProps> = (props): React.ReactElement => {
  // Use platform-specific imports to avoid native modules on web
  if (Platform.OS === 'web') {
    const LocationPickerWeb = require('./LocationPicker.web').default;
    return <LocationPickerWeb {...props} />;
  } else {
    const LocationPickerNative = require('./LocationPickerNative').default;
    return <LocationPickerNative {...props} />;
  }
};

export default LocationPicker;