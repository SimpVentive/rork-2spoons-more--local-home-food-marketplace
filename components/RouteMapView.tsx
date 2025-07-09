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
    // Use web-specific fallback component
    const RouteMapViewWeb = require('./RouteMapViewNative.web').default;
    return <RouteMapViewWeb {...props} />;
  } else {
    // Use native component (will automatically use .web.tsx fallback on web if needed)
    const RouteMapViewNative = require('./RouteMapViewNative').default;
    return <RouteMapViewNative {...props} />;
  }
}