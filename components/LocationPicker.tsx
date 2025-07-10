import React from 'react';
import { Platform } from 'react-native';

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

const LocationPicker: React.FC<LocationPickerProps> = (props): React.ReactElement => {
  if (Platform.OS === 'web') {
    // Use web-specific component
    const LocationPickerWeb = require('./LocationPickerNative.web').default;
    return <LocationPickerWeb {...props} />;
  } else {
    // Use native component
    const LocationPickerNative = require('./LocationPickerNative').default;
    return <LocationPickerNative {...props} />;
  }
};

export default LocationPicker;