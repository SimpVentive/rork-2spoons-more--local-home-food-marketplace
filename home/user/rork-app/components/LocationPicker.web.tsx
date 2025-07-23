import React from 'react';
import { View, Text, Modal } from 'react-native';
import { MapPin } from 'lucide-react-native';
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

const LocationPickerWeb: React.FC<LocationPickerProps> = (props) => {
  return (
    <Modal visible={props.visible} transparent onRequestClose={props.onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.white, padding: 20, borderRadius: 12, margin: 20, maxWidth: 400 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
            {props.title}
          </Text>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <MapPin size={48} color={colors.textLight} />
            <Text style={{ fontSize: 14, color: colors.textLight, textAlign: 'center', marginTop: 12 }}>
              Location picker is not available on web. Using default location.
            </Text>
          </View>
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
};

export default LocationPickerWeb;