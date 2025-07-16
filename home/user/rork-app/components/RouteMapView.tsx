import React from 'react';
import { Platform } from 'react-native';

interface RouteMapViewProps {
  routePoints: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
  dishesOnRoute: Array<{
    latitude: number;
    longitude: number;
    dishName: string;
    availableUntil: string;
    sellerName: string;
  }>;
  onDishPress?: (dish: any) => void;
}

export default function RouteMapView(props: RouteMapViewProps) {
  if (Platform.OS === 'web') {
    try {
      const RouteMapViewWeb = require('./RouteMapViewNative.web').default;
      return <RouteMapViewWeb {...props} />;
    } catch (error) {
      console.warn('Web RouteMapView not available, using fallback');
      // Simple fallback for web
      const { View, Text, StyleSheet } = require('react-native');
      const colors = require('@/constants/colors').default;
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: colors.text, textAlign: 'center' }}>
            Route map is not available on web platform
          </Text>
        </View>
      );
    }
  } else {
    const RouteMapViewNative = require('./RouteMapView.native').default;
    return <RouteMapViewNative {...props} />;
  }
}