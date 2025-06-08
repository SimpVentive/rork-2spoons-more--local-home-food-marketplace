import React from 'react';
import { Platform } from 'react-native';

// Import the appropriate component based on platform
let LocationPickerComponent: any;

if (Platform.OS === 'web') {
  // For web, use the web-specific implementation
  LocationPickerComponent = require('./LocationPickerWeb').default;
} else {
  // For native platforms, use the native implementation
  LocationPickerComponent = require('./LocationPickerNative').default;
}

// Export the platform-specific component
export default LocationPickerComponent;