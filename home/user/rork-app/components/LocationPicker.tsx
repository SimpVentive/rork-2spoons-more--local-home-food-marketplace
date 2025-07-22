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
    // Simple fallback for web to avoid react-native-maps issues
    const { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput } = require('react-native');
    const { MapPin, X } = require('lucide-react-native');
    const colors = require('@/constants/colors').default;
    const Button = require('./Button').default;
    const [address, setAddress] = React.useState('');
    
    const handleSelect = () => {
      if (address.trim()) {
        props.onLocationSelect({
          latitude: 17.4123, // Default coordinates for demo
          longitude: 78.2679,
          address: address.trim(),
        });
      }
    };
    
    return (
      <Modal visible={props.visible} transparent onRequestClose={props.onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.white, padding: 20, borderRadius: 12, margin: 20, maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
              {props.title}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 20 }}>
              Location picker is not available on web. Using default location.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Cancel" onPress={props.onClose} variant="outline" style={{ flex: 1 }} />
              <Button 
                title="Use Default" 
                onPress={() => {
                  props.onLocationSelect({
                    latitude: 17.4123,
                    longitude: 78.2679,
                    address: 'Default Location (Web)'
                  });
                }} 
                style={{ flex: 1 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  } else {
    // Use native component
    const LocationPickerNative = require('./LocationPickerNative').default;
    return <LocationPickerNative {...props} />;
  }
};

export default LocationPicker;