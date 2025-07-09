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
    // Import web component dynamically to avoid bundling native modules
    const LocationPickerWeb = require('./LocationPicker.web').default;
    return <LocationPickerWeb {...props} />;
  } else {
    // Import native component dynamically to avoid bundling on web
    const LocationPickerNative = require('./LocationPickerNative').default;
    return <LocationPickerNative {...props} />;
  }
};

export default LocationPicker;