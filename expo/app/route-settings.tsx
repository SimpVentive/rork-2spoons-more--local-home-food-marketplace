import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import {
  MapPin,
  Navigation,
  Plus,
  X,
  Save,
  Home,
  Building,
  ArrowLeft,
  Map,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LocationPicker from '@/components/LocationPicker';
import RouteMapView from '@/components/RouteMapView';
import colors from '@/constants/colors';
import { RouteLocation } from '@/types';
import * as Location from 'expo-location';

export default function RouteSettingsScreen() {
  const { user, updateProfile } = useAuthStore();
  const { listings } = useListingsStore();
  const router = useRouter();

  const [officeAddress, setOfficeAddress] = useState(user?.officeAddress || '');
  const [officeLocation, setOfficeLocation] = useState<{ latitude: number; longitude: number }>(
    user?.officeLocation ?? { latitude: 17.4400, longitude: 78.3800 }
  );
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>(
    user?.location ?? { latitude: 17.4400, longitude: 78.3800 }
  );
  const [address, setAddress] = useState(user?.address || '');
  const [homeToOfficeRoute, setHomeToOfficeRoute] = useState<RouteLocation[]>(user?.homeToOfficeRoute || []);
  const [officeToHomeRoute, setOfficeToHomeRoute] = useState<RouteLocation[]>(user?.officeToHomeRoute || []);
  const [routesSameAsHomeToOffice, setRoutesSameAsHomeToOffice] = useState(user?.routesSameAsHomeToOffice !== false);
  const [detourPreference, setDetourPreference] = useState(user?.detourPreference?.toString() || '500');
  const [isLoading, setIsLoading] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [pickingLocationFor, setPickingLocationFor] = useState<'home' | 'office' | 'homeToOffice' | 'officeToHome' | null>(null);
  const [showRouteMap, setShowRouteMap] = useState(false);

  // New route location form
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [addingToRoute, setAddingToRoute] = useState<'homeToOffice' | 'officeToHome' | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/welcome' as any);
    }
  }, [user]);

  const handleSave = async () => {
    if (!officeAddress.trim()) {
      Alert.alert('Error', 'Please enter your office address');
      return;
    }

    try {
      setIsLoading(true);
      
      // Mock office location coordinates (in real app, you'd geocode the address)
      /*const officeLocation = {
        latitude: 17.4400,
        longitude: 78.3800,
      };*/
      console.log('Saving route settings:', address, location, officeAddress, officeLocation, homeToOfficeRoute, officeToHomeRoute, routesSameAsHomeToOffice, detourPreference);
      const success = await updateProfile({
        address,
        location,
        officeAddress,
        officeLocation,
        homeToOfficeRoute,
        officeToHomeRoute: routesSameAsHomeToOffice ? homeToOfficeRoute : officeToHomeRoute,
        routesSameAsHomeToOffice,
        detourPreference: parseInt(detourPreference) || 500,
      });

      if (success) {
        Alert.alert('Success', 'Route settings updated successfully');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update route settings');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openLocationPicker = (type: 'home' | 'office' | 'homeToOffice' | 'officeToHome') => {
    setPickingLocationFor(type);
    setLocationPickerVisible(true);
  };

  const handleLocationSelected = async (location: { latitude: number; longitude: number; address: string }) => {
    console.log(`Location selected for ${pickingLocationFor}:`, location);
    if (pickingLocationFor === 'office') {
      setOfficeAddress(location.address);
      setOfficeLocation({ latitude: location.latitude, longitude: location.longitude });
    }
    else if (pickingLocationFor === 'home') {
      setAddress(location.address);
      setLocation({ latitude: location.latitude, longitude: location.longitude });
    }
    else if (pickingLocationFor === 'homeToOffice' || pickingLocationFor === 'officeToHome') {
      // Add to route
      const newLocation: RouteLocation = {
        id: `location-${Date.now()}`,
        name: newLocationName.trim() || 'Route Point',
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      if (pickingLocationFor === 'homeToOffice') {
        setHomeToOfficeRoute([...homeToOfficeRoute, newLocation]);
      } else {
        setOfficeToHomeRoute([...officeToHomeRoute, newLocation]);
      }

      // Reset form
      setNewLocationName('');
      setNewLocationAddress('');
      setAddingToRoute(null);
    }

    setLocationPickerVisible(false);
    setPickingLocationFor(null);
  };

  const addRouteLocation = () => {
    if (!newLocationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    // Open location picker to select the actual location
    openLocationPicker(addingToRoute!);
  };

  const removeRouteLocation = (routeType: 'homeToOffice' | 'officeToHome', locationId: string) => {
    if (routeType === 'homeToOffice') {
      setHomeToOfficeRoute(homeToOfficeRoute.filter(loc => loc.id !== locationId));
    } else {
      setOfficeToHomeRoute(officeToHomeRoute.filter(loc => loc.id !== locationId));
    }
  };

  const renderRouteLocation = (location: RouteLocation, routeType: 'homeToOffice' | 'officeToHome') => (
    <View key={location.id} style={styles.routeLocationItem}>
      <View style={styles.routeLocationInfo}>
        <Text style={styles.routeLocationName}>{location.name}</Text>
        <Text style={styles.routeLocationAddress}>{location.address}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeLocationButton}
        onPress={() => removeRouteLocation(routeType, location.id)}
      >
        <X size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  // Get dishes available on the current route
  const getDishesOnRoute = () => {
    if (!user || !homeToOfficeRoute.length) return [];

    const routePoints = [
      { latitude: user.location.latitude, longitude: user.location.longitude, name: 'Home' },
      ...homeToOfficeRoute,
      ...(user.officeLocation ? [{ ...user.officeLocation, name: 'Office' }] : []),
    ];

    return listings.filter(listing => {
      return routePoints.some(point => {
        const distance = calculateDistance(
          point.latitude,
          point.longitude,
          listing.location.latitude,
          listing.location.longitude
        ) * 1000; // Convert to meters
        
        return distance <= (user.detourPreference || 500);
      });
    }).map(listing => ({
      latitude: listing.location.latitude,
      longitude: listing.location.longitude,
      dishName: listing.dishName,
      availableUntil: listing.availableUntil,
      sellerName: listing.sellerName,
    }));
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const routePoints = user ? [
    { latitude: user.location.latitude, longitude: user.location.longitude, name: 'Home' },
    ...homeToOfficeRoute,
    ...(user.officeLocation ? [{ ...user.officeLocation, name: 'Office' }] : []),
  ] : [];

  const dishesOnRoute = getDishesOnRoute();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Route Settings',
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Location</Text>
          <Text style={styles.sectionDescription}>
            Your current home address
          </Text>
          <Input
            label="Home Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your Home address"
            leftIcon={<Home size={20} color={colors.primary} />}
          />
          <TouchableOpacity
            style={styles.selectLocationButton}
            onPress={() => openLocationPicker('home')}
          >
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.selectLocationText}>Select on Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Office Location</Text>
          <Text style={styles.sectionDescription}>
            Set your office address to enable route-based food discovery
          </Text>
          
          <Input
            label="Office Address"
            value={officeAddress}
            onChangeText={setOfficeAddress}
            placeholder="Enter your office address"
            leftIcon={<Building size={20} color={colors.textLight} />}
          />
          
          <TouchableOpacity
            style={styles.selectLocationButton}
            onPress={() => openLocationPicker('office')}
          >
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.selectLocationText}>Select on Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home to Office Route</Text>
          <Text style={styles.sectionDescription}>
            Add stops along your route from home to office
          </Text>
          
          {homeToOfficeRoute.map(location => renderRouteLocation(location, 'homeToOffice'))}
          
          {addingToRoute === 'homeToOffice' ? (
            <View style={styles.addLocationForm}>
              <Input
                label="Location Name"
                value={newLocationName}
                onChangeText={setNewLocationName}
                placeholder="e.g., Metro Station, Shopping Mall"
              />
              <View style={styles.addLocationButtons}>
                <Button
                  title="Select on Map"
                  onPress={addRouteLocation}
                  style={styles.addButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    setAddingToRoute(null);
                    setNewLocationName('');
                    setNewLocationAddress('');
                  }}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => setAddingToRoute('homeToOffice')}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addLocationButtonText}>Add Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Office to Home Route</Text>
            <TouchableOpacity
              style={styles.sameRouteButton}
              onPress={() => setRoutesSameAsHomeToOffice(!routesSameAsHomeToOffice)}
            >
              <View style={[styles.checkbox, routesSameAsHomeToOffice && styles.checkboxChecked]}>
                {routesSameAsHomeToOffice && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.sameRouteText}>Same as home to office</Text>
            </TouchableOpacity>
          </View>
          
          {!routesSameAsHomeToOffice && (
            <>
              <Text style={styles.sectionDescription}>
                Add stops along your route from office to home
              </Text>
              
              {officeToHomeRoute.map(location => renderRouteLocation(location, 'officeToHome'))}
              
              {addingToRoute === 'officeToHome' ? (
                <View style={styles.addLocationForm}>
                  <Input
                    label="Location Name"
                    value={newLocationName}
                    onChangeText={setNewLocationName}
                    placeholder="e.g., Metro Station, Shopping Mall"
                  />
                  <View style={styles.addLocationButtons}>
                    <Button
                      title="Select on Map"
                      onPress={addRouteLocation}
                      style={styles.addButton}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setAddingToRoute(null);
                        setNewLocationName('');
                        setNewLocationAddress('');
                      }}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addLocationButton}
                  onPress={() => setAddingToRoute('officeToHome')}
                >
                  <Plus size={20} color={colors.primary} />
                  <Text style={styles.addLocationButtonText}>Add Stop</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detour Preference</Text>
          <Text style={styles.sectionDescription}>
            Maximum distance you're willing to detour from your route (in meters)
          </Text>
          
          <Input
            label="Maximum Detour (meters)"
            value={detourPreference}
            onChangeText={setDetourPreference}
            placeholder="500"
            keyboardType="numeric"
            leftIcon={<Navigation size={20} color={colors.textLight} />}
          />
        </View>

        {/* Route Map View */}
        {(homeToOfficeRoute.length > 0 || user?.officeLocation) && (
          <View style={styles.section}>
            <View style={styles.mapHeader}>
              <Text style={styles.sectionTitle}>Route Map</Text>
              <TouchableOpacity
                style={styles.viewMapButton}
                onPress={() => setShowRouteMap(!showRouteMap)}
              >
                <Map size={20} color={colors.primary} />
                <Text style={styles.viewMapText}>
                  {showRouteMap ? 'Hide Map' : 'View Map'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              View your route and available dishes along the way
            </Text>
            
            {showRouteMap && (
              <View style={styles.mapWrapper}>
                <RouteMapView
                  routePoints={routePoints}
                  dishesOnRoute={dishesOnRoute}
                  onDishPress={(dish) => {
                    const listing = listings.find(l => l.dishName === dish.dishName && l.sellerName === dish.sellerName);
                    if (listing) {
                      router.push(`/listing/${listing.id}` as any);
                    } else {
                      Alert.alert(
                        dish.dishName,
                        `Available from ${dish.sellerName} until ${new Date(dish.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      );
                    }
                  }}
                />
              </View>
            )}
          </View>
        )}

        <Button
          title="Save Route Settings"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </ScrollView>

      {locationPickerVisible && (
        <LocationPicker
          initialLocation={
            pickingLocationFor === 'office' && user.officeLocation
              ? { ...user.officeLocation, address: officeAddress } 
              : pickingLocationFor === 'home' && user.location
              ? { ...user.location, address: address }
              : undefined
          }
          onLocationSelect={handleLocationSelected}
          onClose={() => {
            setLocationPickerVisible(false);
            setPickingLocationFor(null);
          }}
          routePoints={routePoints}
          dishesOnRoute={dishesOnRoute}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    padding: 16,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  selectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectLocationText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  routeLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  routeLocationInfo: {
    flex: 1,
  },
  routeLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  routeLocationAddress: {
    fontSize: 14,
    color: colors.textLight,
  },
  removeLocationButton: {
    padding: 8,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addLocationButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  addLocationForm: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  addLocationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
  sameRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sameRouteText: {
    fontSize: 14,
    color: colors.text,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  viewMapText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  mapWrapper: {
    height: 350,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButton: {
    margin: 16,
  },
});