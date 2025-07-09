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

let LocationPickerNative: React.ComponentType<LocationPickerProps> | null = null;
let LocationPickerWeb: React.ComponentType<LocationPickerProps> | null = null;

// Only import native component on native platforms
if (Platform.OS !== 'web') {
  try {
    LocationPickerNative = require('./LocationPickerNative').default;
  } catch (error) {
    console.warn('Failed to load LocationPickerNative:', error);
  }
}

// Only import web component on web platform
if (Platform.OS === 'web') {
  try {
    LocationPickerWeb = require('./LocationPicker.web').default;
  } catch (error) {
    console.warn('Failed to load LocationPickerWeb:', error);
  }
}

const LocationPicker: React.FC<LocationPickerProps> = (props): React.ReactElement => {
  if (Platform.OS === 'web') {
    if (LocationPickerWeb) {
      return <LocationPickerWeb {...props} />;
    } else {
      // Fallback for web if component fails to load
      const LocationPickerWebFallback = require('./LocationPicker.web').default;
      return <LocationPickerWebFallback {...props} />;
    }
  } else {
    if (LocationPickerNative) {
      return <LocationPickerNative {...props} />;
    } else {
      // Fallback for native if component fails to load
      const LocationPickerNativeFallback = require('./LocationPickerNative').default;
      return <LocationPickerNativeFallback {...props} />;
    }
  }
};

export default LocationPicker;