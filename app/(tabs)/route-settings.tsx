import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Home, 
  Building, 
  Route, 
  Clock, 
  Save,
  Plus,
  Trash2,
  Navigation,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import LocationPicker from '@/components/LocationPicker';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { RoutePoint, User } from '@/types';

export default function RouteSettingsScreen() {
  const { user, updateProfile } = useAuthStore();
  const router = useRouter();
  
  const [homeLocation, setHomeLocation] = useState<RoutePoint | null>(null);
  const [officeLocation, setOfficeLocation] = useState<RoutePoint | null>(null);
  const [customLocations, setCustomLocations] = useState<RoutePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerType, setLocationPickerType] = useState<'home' | 'office' | 'custom'>('home');
  
  useEffect(() => {
    loadUserLocations();
  }, [user]);
  
  const loadUserLocations = () => {
    if (!user) return;
    
    // Load home location from user address
    if (user.address && user.location) {
      setHomeLocation({
        id: 'home',
        name: 'Home',
        address: user.address,
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        type: 'home',
      });
    }
    
    // Load office location
    if (user.officeAddress && user.officeLocation) {
      setOfficeLocation({
        id: 'office',
        name: 'Office',
        address: user.officeAddress,
        latitude: user.officeLocation.latitude,
        longitude: user.officeLocation.longitude,
        type: 'office',
      });
    }
    
    // Load custom locations (if they exist in user data)
    if (user.customLocations) {
      setCustomLocations(user.customLocations);
    }
  };
  
  const handleLocationSelect = (location: any) => {
    const routePoint: RoutePoint = {
      id: locationPickerType === 'custom' ? Date.now().toString() : locationPickerType,
      name: locationPickerType === 'home' ? 'Home' : locationPickerType === 'office' ? 'Office' : 'Custom Location',
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      type: locationPickerType,
    };
    
    if (locationPickerType === 'home') {
      setHomeLocation(routePoint);
    } else if (locationPickerType === 'office') {
      setOfficeLocation(routePoint);
    } else {
      setCustomLocations(prev => [...prev, routePoint]);
    }
    
    setShowLocationPicker(false);
  };
  
  const handleSaveRoute = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const updates: Partial<User> = {
        officeAddress: officeLocation?.address || '',
        officeCoordinates: officeLocation ? {
          latitude: officeLocation.latitude,
          longitude: officeLocation.longitude,
        } : undefined,
        customLocations: customLocations,
      };
      
      await updateProfile(updates);
      
      Alert.alert(
        'Success',
        'Your route settings have been saved successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving route:', error);
      Alert.alert(
        'Error',
        'Failed to save route settings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveCustomLocation = (locationId: string) => {
    setCustomLocations(prev => prev.filter(loc => loc.id !== locationId));
  };
  
  const openLocationPicker = (type: 'home' | 'office' | 'custom') => {
    setLocationPickerType(type);
    setShowLocationPicker(true);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Settings</Text>
        <Text style={styles.subtitle}>
          Set up your daily routes to discover food along the way
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Primary Locations</Text>
        
        {/* Home Location */}
        <TouchableOpacity 
          style={styles.locationCard}
          onPress={() => openLocationPicker('home')}
        >
          <View style={styles.locationIconContainer}>
            <Home size={24} color={colors.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>Home</Text>
            <Text style={styles.locationAddress}>
              {homeLocation?.address || 'Tap to set your home location'}
            </Text>
          </View>
          <MapPin size={20} color={colors.textLight} />
        </TouchableOpacity>
        
        {/* Office Location */}
        <TouchableOpacity 
          style={styles.locationCard}
          onPress={() => openLocationPicker('office')}
        >
          <View style={styles.locationIconContainer}>
            <Building size={24} color={colors.secondary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>Office</Text>
            <Text style={styles.locationAddress}>
              {officeLocation?.address || 'Tap to set your office location'}
            </Text>
          </View>
          <MapPin size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Locations</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => openLocationPicker('custom')}
          >
            <Plus size={16} color={colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {customLocations.length === 0 ? (
          <View style={styles.emptyState}>
            <Navigation size={48} color={colors.textLight} />
            <Text style={styles.emptyStateText}>
              No custom locations added yet
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Add frequently visited places to find food along those routes
            </Text>
          </View>
        ) : (
          customLocations.map((location) => (
            <View key={location.id} style={styles.locationCard}>
              <View style={styles.locationIconContainer}>
                <MapPin size={24} color={colors.info} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveCustomLocation(location.id)}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Route Preferences</Text>
        
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceIconContainer}>
            <Route size={24} color={colors.warning} />
          </View>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceName}>Search Radius</Text>
            <Text style={styles.preferenceDescription}>
              Find food within 2km of your route
            </Text>
          </View>
        </View>
        
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceIconContainer}>
            <Clock size={24} color={colors.info} />
          </View>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceName}>Time Window</Text>
            <Text style={styles.preferenceDescription}>
              Show food available during your commute hours
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <Button
          title="Save Route Settings"
          onPress={handleSaveRoute}
          loading={isLoading}
          icon={<Save size={16} color={colors.white} />}
          style={styles.saveButton}
        />
      </View>
      
      {showLocationPicker && (
        <LocationPicker
          visible={showLocationPicker}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          title={`Select ${locationPickerType === 'home' ? 'Home' : locationPickerType === 'office' ? 'Office' : 'Custom'} Location`}
          showRoute={false}
          routeStart={homeLocation}
          routeEnd={officeLocation}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  actionContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    marginTop: 16,
  },
});