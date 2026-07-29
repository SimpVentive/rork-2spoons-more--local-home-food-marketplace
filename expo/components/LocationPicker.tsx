import React from 'react';
import { Platform } from 'react-native';
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
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
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [location, setLocation] = React.useState({
    latitude: props.initialLocation?.latitude ?? 17.4123,
    longitude: props.initialLocation?.longitude ?? 78.2679,
    address: props.initialLocation?.address ?? "",
  });
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
        <View
  style={{
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    height: 650,
    overflow: "hidden",
  }}
>
  {isLoaded && (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "550px",
      }}
      zoom={15}
      center={{
        lat: location.latitude,
        lng: location.longitude,
      }}
      onClick={(e) => {
        if (!e.latLng) return;

        setLocation({
          latitude: e.latLng.lat(),
          longitude: e.latLng.lng(),
          address: `${e.latLng.lat()}, ${e.latLng.lng()}`,
        });
      }}
    >
      <Marker
        position={{
          lat: location.latitude,
          lng: location.longitude,
        }}
      />
    </GoogleMap>
  )}

  <View style={{ padding: 15, flexDirection: "row" }}>
    <Button
      title="Cancel"
      onPress={props.onClose}
      variant="outline"
      style={{ flex: 1, marginRight: 10 }}
    />

    <Button
      title="Confirm"
      style={{ flex: 1 }}
      onPress={() => props.onLocationSelect(location)}
    />
  </View>
</View>
      </Modal>
    );
  } else {
    // Use native component
    const LocationPickerNative = require('./LocationPicker.native').default;
    return <LocationPickerNative {...props} />;
  }
};

export default LocationPicker;