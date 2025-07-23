import React from 'react';
import { Platform, View, Text } from 'react-native';
import { MapPin, Route } from 'lucide-react-native';
import colors from '@/constants/colors';

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
    // Simple fallback for web to avoid react-native-maps issues
    
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
      }}>
        <View style={{
          padding: 16,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Route size={20} color={colors.primary} />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginLeft: 8,
          }}>Your Route Map</Text>
        </View>
        
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.card,
          margin: 16,
          borderRadius: 12,
          padding: 32,
        }}>
          <MapPin size={48} color={colors.textLight} />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginTop: 16,
            textAlign: 'center',
          }}>Map view is not available on web</Text>
          <Text style={{
            fontSize: 14,
            color: colors.textLight,
            marginTop: 8,
            textAlign: 'center',
          }}>Please use the mobile app for full map functionality</Text>
        </View>
        
        <View style={{
          backgroundColor: colors.white,
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>Route Summary</Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 14, color: colors.textLight }}>Total Stops:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{props.routePoints.length}</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 14, color: colors.textLight }}>Available Dishes:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{props.dishesOnRoute.length}</Text>
          </View>
        </View>
      </View>
    );
  } else {
    // For native platforms, show a simple fallback as well
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
      }}>
        <View style={{
          padding: 16,
          backgroundColor: colors.white,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Route size={20} color={colors.primary} />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginLeft: 8,
          }}>Your Route Map</Text>
        </View>
        
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.card,
          margin: 16,
          borderRadius: 12,
          padding: 32,
        }}>
          <MapPin size={48} color={colors.textLight} />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginTop: 16,
            textAlign: 'center',
          }}>Map view is temporarily unavailable</Text>
          <Text style={{
            fontSize: 14,
            color: colors.textLight,
            marginTop: 8,
            textAlign: 'center',
          }}>Route functionality will be available soon</Text>
        </View>
        
        <View style={{
          backgroundColor: colors.white,
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>Route Summary</Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 14, color: colors.textLight }}>Total Stops:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{props.routePoints.length}</Text>
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
          }}>
            <Text style={{ fontSize: 14, color: colors.textLight }}>Available Dishes:</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{props.dishesOnRoute.length}</Text>
          </View>
        </View>
      </View>
    );
  }
}