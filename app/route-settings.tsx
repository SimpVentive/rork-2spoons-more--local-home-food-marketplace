import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Home, 
  Building, 
  Settings,
  Route,
  Navigation,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { RouteSearchModal } from '@/components/RouteSearchModal';
import colors from '@/constants/colors';
import { RouteLocation } from '@/types';

export default function RouteSettingsScreen() {
  const { 
    user, 
    addRouteLocation, 
    removeRouteLocation, 
    updateDetourPreference,
    updateOfficeAddress,
    setRoutesSameAsHomeToOffice
  } = useAuthStore();
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [officeAddress, setOfficeAddressLocal] = useState(user?.officeAddress || '');
  const [detourMeters, setDetourMeters] = useState(user?.detourPreference?.toString() || '500');
  const [routesSame, setRoutesSame] = useState(user?.routesSameAsHomeToOffice ?? true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [currentRouteType, setCurrentRouteType] = useState<'homeToOffice' | 'officeToHome'>('homeToOffice');

  useEffect(() => {
    if (user) {
      setOfficeAddressLocal(user.officeAddress || '');
      setDetourMeters(user.detourPreference?.toString() || '500');
      setRoutesSame(user.routesSameAsHomeToOffice ?? true);
    }
  }, [user]);

  const handleSaveOfficeAddress = async () => {
    if (!officeAddress.trim()) {
      Alert.alert('Error', 'Please enter your office address');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you would geocode the address to get coordinates
      // For demo purposes, we'll use default coordinates
      await updateOfficeAddress(officeAddress, {
        latitude: 12.9716,
        longitude: 77.5946
      });
      
      Alert.alert('Success', 'Office address updated successfully');
    } catch (error) {
      console.error('Error updating office address:', error);
      Alert.alert('Error', 'Failed to update office address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetourPreference = async () => {
    const meters = parseInt(detourMeters);
    if (isNaN(meters) || meters < 100 || meters > 5000) {
      Alert.alert('Error', 'Please enter a valid detour distance between 100-5000 meters');
      return;
    }

    setIsLoading(true);
    try {
      await updateDetourPreference(meters);
      Alert.alert('Success', 'Detour preference updated successfully');
    } catch (error) {
      console.error('Error updating detour preference:', error);
      Alert.alert('Error', 'Failed to update detour preference');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRoutesSame = async (value: boolean) => {
    setRoutesSame(value);
    try {
      await setRoutesSameAsHomeToOffice(value);
    } catch (error) {
      console.error('Error updating routes setting:', error);
      Alert.alert('Error', 'Failed to update route settings');
      setRoutesSame(!value); // Revert on error
    }
  };

  const handleAddLocation = (type: 'homeToOffice' | 'officeToHome') => {
    setCurrentRouteType(type);
    setSearchModalVisible(true);
  };

  const handleLocationSelected = async (location: RouteLocation) => {
    setSearchModalVisible(false);
    setIsLoading(true);
    
    try {
      await addRouteLocation(currentRouteType, location);
      Alert.alert('Success', 'Location added to your route');
    } catch (error) {
      console.error('Error adding location:', error);
      Alert.alert('Error', 'Failed to add location to route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLocation = async (type: 'homeToOffice' | 'officeToHome', locationId: string) => {
    Alert.alert(
      'Remove Location',
      'Are you sure you want to remove this location from your route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeRouteLocation(type, locationId);
              Alert.alert('Success', 'Location removed from your route');
            } catch (error) {
              console.error('Error removing location:', error);
              Alert.alert('Error', 'Failed to remove location');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderRouteSection = (
    title: string,
    icon: React.ReactNode,
    type: 'homeToOffice' | 'officeToHome',
    locations: RouteLocation[]
  ) => (
    <View style={styles.routeSection}>
      <View style={styles.routeSectionHeader}>
        <View style={styles.routeTitleContainer}>
          {icon}
          <Text style={styles.routeSectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddLocation(type)}
        >
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {locations.length === 0 ? (
        <View style={styles.emptyRoute}>
          <Text style={styles.emptyRouteText}>No locations added yet</Text>
          <Text style={styles.emptyRouteSubtext}>
            Add locations along your route to discover food nearby
          </Text>
        </View>
      ) : (
        <View style={styles.locationsList}>
          {locations.map((location, index) => (
            <View key={location.id} style={styles.locationItem}>
              <View style={styles.locationInfo}>
                <MapPin size={16} color={colors.primary} />
                <View style={styles.locationDetails}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveLocation(type, location.id)}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Route Settings',
          headerStyle: { backgroundColor: colors.white },
          headerTitleStyle: { color: colors.text },
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Office Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Building size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Office Address</Text>
          </View>
          
          <Input
            label="Office Address"
            value={officeAddress}
            onChangeText={setOfficeAddressLocal}
            placeholder="Enter your office address"
            multiline
            style={styles.addressInput}
          />
          
          <Button
            title="Save Office Address"
            onPress={handleSaveOfficeAddress}
            isLoading={isLoading}
            style={styles.saveButton}
          />
        </View>

        {/* Route Sync Setting */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Route size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Route Settings</Text>
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Same route both ways</Text>
              <Text style={styles.switchDescription}>
                Use the same route for both home to office and office to home
              </Text>
            </View>
            <Switch
              value={routesSame}
              onValueChange={handleToggleRoutesSame}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Home to Office Route */}
        {renderRouteSection(
          'Home to Office Route',
          <Home size={20} color={colors.primary} />,
          'homeToOffice',
          user?.homeToOfficeRoute || []
        )}

        {/* Office to Home Route (only show if routes are different) */}
        {!routesSame && renderRouteSection(
          'Office to Home Route',
          <Navigation size={20} color={colors.primary} />,
          'officeToHome',
          user?.officeToHomeRoute || []
        )}

        {/* Detour Preference Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Detour Preference</Text>
          </View>
          
          <Text style={styles.detourDescription}>
            Maximum distance you are willing to detour from your route to pick up food
          </Text>
          
          <Input
            label="Maximum Detour (meters)"
            value={detourMeters}
            onChangeText={setDetourMeters}
            placeholder="500"
            keyboardType="numeric"
            style={styles.detourInput}
          />
          
          <Button
            title="Save Detour Preference"
            onPress={handleSaveDetourPreference}
            isLoading={isLoading}
            style={styles.saveButton}
          />
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>How it works</Text>
          <Text style={styles.helpText}>
            • Set your office address and daily route{'\n'}
            • Add key locations along your commute{'\n'}
            • Discover food listings near your route{'\n'}
            • Set your maximum detour distance{'\n'}
            • Get notified about food along your path
          </Text>
        </View>
      </ScrollView>

      <RouteSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onLocationSelected={handleLocationSelected}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  addressInput: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  routeSection: {
    backgroundColor: colors.white,
    marginBottom: 16,
    padding: 16,
  },
  routeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRoute: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyRouteText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
  },
  emptyRouteSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    maxWidth: 250,
  },
  locationsList: {
    gap: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationDetails: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textLight,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.error}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detourDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  detourInput: {
    marginBottom: 16,
  },
  helpSection: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});