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
  // Always use the native component which handles web fallback internally
  const RouteMapViewNative = require('./RouteMapViewNative').default;
  return <RouteMapViewNative {...props} />;
}