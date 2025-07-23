// Web fallback for react-native-maps
import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ children, ...props }) => {
  return (
    <View style={[{ flex: 1, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }, props.style]}>
      <Text>Map not available on web</Text>
      {children}
    </View>
  );
};

const Marker = ({ children, ...props }) => {
  return <View>{children}</View>;
};

const Polyline = (props) => {
  return null;
};

const PROVIDER_GOOGLE = 'google';

export default MapView;
export { Marker, Polyline, PROVIDER_GOOGLE };