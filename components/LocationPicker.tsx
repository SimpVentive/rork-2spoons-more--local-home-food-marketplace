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
  if (Platform.OS === 'web') {
    // Use web-specific component
    const LocationPickerWeb = require('./LocationPicker.web').default;
    return <LocationPickerWeb {...props} />;
  } else {
    // Use native component (will automatically use .web.tsx fallback on web if needed)
    const LocationPickerNative = require('./LocationPickerNative.web').default;
    return <LocationPickerNative {...props} />;
  }
};

export default LocationPicker;