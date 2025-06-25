import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  X, 
  ArrowRight,
  ArrowLeft,
  Trash2,
  Save,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import LocationPicker from '@/components/LocationPicker';
import { RouteLocation } from '@/types';

export default function RouteSettingsScreen() {
  const { user, updateOfficeAddress, addRouteLocation, removeRouteLocation, updateDetourPreference, setRoutesSameAsHomeToOffice } = useAuthStore();
  const router = useRouter();
  
  const [officeAddress, setOfficeAddress] = useState(user?.officeAddress || '');
  const [officeLocation, setOfficeLocation] = useState(user?.officeLocation || { latitude: 0, longitude: 0 });
  const [homeToOfficeRoute, setHomeToOfficeRoute] = useState<RouteLocation[]>(user?.homeToOfficeRoute || []);
  const [officeToHomeRoute, setOfficeToHomeRoute] = useState<RouteLocation[]>(user?.officeToHomeRoute || []);
  const [isSameRoute, setIsSameRoute] = useState(user?.routesSameAsHomeToOffice !== false);
  const [detourPreference, setDetourPreference] = useState(user?.detourPreference || 500);
  
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [locationPickerType, setLocationPickerType] = useState<'office' | 'homeToOffice' | 'officeToHome'>('office');
  
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
      return;
    }
    
    // Update local state when user data changes
    setOfficeAddress(user.officeAddress || '');
    setOfficeLocation(user.officeLocation || { latitude: 0, longitude: 0 });
    setHomeToOfficeRoute(user.homeToOfficeRoute || []);
    setOfficeToHomeRoute(user.officeToHomeRoute || []);
    setIsSameRoute(user.routesSameAsHomeToOffice !== false);
    setDetourPreference(user.detourPreference || 500);
  }, [user]);
  
  const handleOfficeLocationSelect = (selectedLocation: { latitude: number; longitude: number; address: string }) => {
    setOfficeAddress(selectedLocation.address);
    setOfficeLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
    setLocationPickerVisible(false);
  };
  
  const handleRouteLocationSelect = (selectedLocation: { latitude: number; longitude: number; address: string }) => {
    const newLocation: RouteLocation = {
      id: `loc-${Date.now()}`,
      name: selectedLocation.address.split(',')[0],
      address: selectedLocation.address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    };
    
    if (locationPickerType === 'homeToOffice') {
      addRouteLocation('homeToOffice', newLocation);
    } else if (locationPickerType === 'officeToHome') {
      addRouteLocation('officeToHome', newLocation);
    }
    
    setLocationPickerVisible(false);
  };
  
  const handleRemoveRouteLocation = (type: 'homeToOffice' | 'officeToHome', locationId: string) => {
    Alert.alert(
      "Remove Location",
      "Are you sure you want to remove this location from your route?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: () => removeRouteLocation(type, locationId),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleSaveOfficeAddress = async () => {
    if (!officeAddress.trim()) {
      Alert.alert("Error", "Please enter your office address");
      return;
    }
    
    try {
      await updateOfficeAddress(officeAddress, officeLocation);
      Alert.alert("Success", "Office address updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update office address");
    }
  };
  
  const handleToggleRoutesSync = async (value: boolean) => {
    try {
      await setRoutesSameAsHomeToOffice(value);
      setIsSameRoute(value);
    } catch (error) {
      Alert.alert("Error", "Failed to update route settings");
    }
  };
  
  const handleSaveDetourPreference = async () => {
    try {
      await updateDetourPreference(detourPreference);
      Alert.alert("Success", "Detour preference updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update detour preference");
    }
  };
  
  const openLocationPicker = (type: 'office' | 'homeToOffice' | 'officeToHome') => {
    setLocationPickerType(type);
    setLocationPickerVisible(true);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Settings</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Office Address</Text>
        <Text style={styles.sectionDescription}>
          Set your office location to find food along your commute route
        </Text>
        
        <View style={styles.addressContainer}>
          <View style={styles.addressIconContainer}>
            <Briefcase size={24} color={colors.primary} />
          </View>
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressLabel}>Office</Text>
            <Text style={styles.addressText}>
              {officeAddress || "No office address set"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => openLocationPicker('office')}
        >
          <MapPin size={20} color={colors.primary} />
          <Text style={styles.mapButtonText}>
            {officeAddress ? 'Change Office Location' : 'Set Office Location'}
          </Text>
        </TouchableOpacity>
        
        <Button
          title="Save Office Address"
          onPress={handleSaveOfficeAddress}
          style={styles.saveButton}
          disabled={!officeAddress}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Home to Office Route</Text>
        <Text style={styles.sectionDescription}>
          Add locations along your route from home to office
        </Text>
        
        <View style={styles.routeContainer}>
          <View style={styles.routeStartEnd}>
            <View style={styles.routePoint}>
              <Home size={20} color={colors.white} />
            </View>
            <Text style={styles.routePointText}>Home</Text>
          </View>
          
          <View style={styles.routePath}>
            {homeToOfficeRoute.map((location, index) => (
              <View key={location.id} style={styles.routeLocationContainer}>
                <View style={styles.routeLocationLine} />
                <View style={styles.routeLocation}>
                  <View style={styles.routeLocationPoint} />
                  <View style={styles.routeLocationTextContainer}>
                    <Text style={styles.routeLocationName}>{location.name}</Text>
                    <Text style={styles.routeLocationAddress} numberOfLines={1}>
                      {location.address}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeLocationButton}
                    onPress={() => handleRemoveRouteLocation('homeToOffice', location.id)}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <View style={styles.routeLocationLine} />
          </View>
          
          <View style={styles.routeStartEnd}>
            <View style={[styles.routePoint, styles.routeEndPoint]}>
              <Briefcase size={20} color={colors.white} />
            </View>
            <Text style={styles.routePointText}>Office</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.addLocationButton}
          onPress={() => openLocationPicker('homeToOffice')}
        >
          <Plus size={20} color={colors.primary} />
          <Text style={styles.addLocationText}>Add Location on Route</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Office to Home Route</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Same as Home to Office</Text>
            <Switch
              value={isSameRoute}
              onValueChange={handleToggleRoutesSync}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={isSameRoute ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
        
        <Text style={styles.sectionDescription}>
          Add locations along your route from office to home
        </Text>
        
        {isSameRoute ? (
          <View style={styles.sameRouteMessage}>
            <ArrowLeft size={20} color={colors.textLight} />
            <Text style={styles.sameRouteText}>
              Using the same route as Home to Office (in reverse)
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.routeContainer}>
              <View style={styles.routeStartEnd}>
                <View style={[styles.routePoint, styles.routeEndPoint]}>
                  <Briefcase size={20} color={colors.white} />
                </View>
                <Text style={styles.routePointText}>Office</Text>
              </View>
              
              <View style={styles.routePath}>
                {officeToHomeRoute.map((location, index) => (
                  <View key={location.id} style={styles.routeLocationContainer}>
                    <View style={styles.routeLocationLine} />
                    <View style={styles.routeLocation}>
                      <View style={styles.routeLocationPoint} />
                      <View style={styles.routeLocationTextContainer}>
                        <Text style={styles.routeLocationName}>{location.name}</Text>
                        <Text style={styles.routeLocationAddress} numberOfLines={1}>
                          {location.address}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeLocationButton}
                        onPress={() => handleRemoveRouteLocation('officeToHome', location.id)}
                      >
                        <Trash2 size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                <View style={styles.routeLocationLine} />
              </View>
              
              <View style={styles.routeStartEnd}>
                <View style={styles.routePoint}>
                  <Home size={20} color={colors.white} />
                </View>
                <Text style={styles.routePointText}>Home</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.addLocationButton}
              onPress={() => openLocationPicker('officeToHome')}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addLocationText}>Add Location on Route</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detour Preference</Text>
        <Text style={styles.sectionDescription}>
          How far are you willing to detour from your route to pick up food?
        </Text>
        
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={100}
            maximumValue={5000}
            step={100}
            value={detourPreference}
            onValueChange={setDetourPreference}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinLabel}>100m</Text>
            <Text style={styles.sliderValueLabel}>{detourPreference}m</Text>
            <Text style={styles.sliderMaxLabel}>5km</Text>
          </View>
        </View>
        
        <Button
          title="Save Detour Preference"
          onPress={handleSaveDetourPreference}
          style={styles.saveButton}
        />
      </View>
      
      {locationPickerVisible && (
        <LocationPicker
          initialLocation={
            locationPickerType === 'office' && officeLocation.latitude !== 0
              ? { 
                  latitude: officeLocation.latitude, 
                  longitude: officeLocation.longitude,
                  address: officeAddress
                }
              : undefined
          }
          onSelectLocation={
            locationPickerType === 'office'
              ? handleOfficeLocationSelect
              : handleRouteLocationSelect
          }
          onClose={() => setLocationPickerVisible(false)}
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
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  section: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.textLight,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeStartEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  routePoint: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeEndPoint: {
    backgroundColor: colors.secondary,
  },
  routePointText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  routePath: {
    marginLeft: 18,
    paddingLeft: 18,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    marginVertical: 8,
  },
  routeLocationContainer: {
    position: 'relative',
  },
  routeLocationLine: {
    position: 'absolute',
    left: -20,
    top: '50%',
    width: 20,
    height: 2,
    backgroundColor: colors.border,
  },
  routeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  routeLocationPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  routeLocationTextContainer: {
    flex: 1,
  },
  routeLocationName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  routeLocationAddress: {
    fontSize: 12,
    color: colors.textLight,
  },
  removeLocationButton: {
    padding: 8,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  addLocationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },
  sameRouteMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  sameRouteText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderMinLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  sliderValueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});