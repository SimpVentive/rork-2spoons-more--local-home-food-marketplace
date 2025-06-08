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
import { Image } from 'expo-image';
import { 
  Camera, 
  MapPin, 
  ChefHat, 
  CreditCard, 
  X,
  Check,
  Plus,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import { CUISINE_TYPES, PAYMENT_METHODS } from '@/mocks/data';
import LocationPicker from '@/components/LocationPicker';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.experience || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(user?.cuisineTypes || []);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(user?.paymentMethods || []);
  const [location, setLocation] = useState(user?.location || { latitude: 17.4123, longitude: 78.2679 });
  const [isChef, setIsChef] = useState(user?.isChef || false);
  const [allowProfileDisplay, setAllowProfileDisplay] = useState(user?.allowProfileDisplay !== false);
  
  // Detailed address fields
  const [doorNumber, setDoorNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
      return;
    }
    
    // Parse address if it exists
    if (user.address) {
      parseAddress(user.address);
    }
  }, [user]);
  
  const parseAddress = (address: string) => {
    // This is a simple parsing logic - in a real app, you'd have a more robust solution
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 1) setDoorNumber(parts[0]);
    if (parts.length >= 2) setBuildingName(parts[1]);
    if (parts.length >= 3) setStreetName(parts[2]);
    if (parts.length >= 4) setArea(parts[3]);
    if (parts.length >= 5) setLandmark(parts[4]);
    if (parts.length >= 6) setCity(parts[5]);
    if (parts.length >= 7) setDistrict(parts[6]);
    if (parts.length >= 8) setState(parts[7]);
    if (parts.length >= 9) setPinCode(parts[8]);
  };
  
  const formatAddress = () => {
    const addressParts = [
      doorNumber,
      buildingName,
      streetName,
      area,
      landmark,
      city,
      district,
      state,
      pinCode
    ].filter(Boolean);
    
    return addressParts.join(', ');
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (phone && !/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number should be 10 digits';
    }
    
    if (!doorNumber.trim()) {
      newErrors.doorNumber = 'Door/Flat number is required';
    }
    
    if (!streetName.trim()) {
      newErrors.streetName = 'Street name is required';
    }
    
    if (!area.trim()) {
      newErrors.area = 'Area/Locality is required';
    }
    
    if (!city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(pinCode)) {
      newErrors.pinCode = 'PIN code should be 6 digits';
    }
    
    if (isChef && cuisineTypes.length === 0) {
      newErrors.cuisineTypes = 'Please select at least one cuisine type';
    }
    
    if (paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Please select at least one payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (!validateForm()) return;
    
    const formattedAddress = formatAddress();
    
    const updatedUser = {
      name,
      email,
      phone,
      address: formattedAddress,
      experience: bio,
      profileImage,
      cuisineTypes,
      paymentMethods,
      location,
      isChef,
      allowProfileDisplay,
    };
    
    updateUser(updatedUser);
    Alert.alert('Success', 'Profile updated successfully');
    router.back();
  };
  
  const handleLocationSelect = (selectedLocation: { latitude: number; longitude: number; address: string }) => {
    setLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
    parseAddress(selectedLocation.address);
    setLocationPickerVisible(false);
  };
  
  const toggleCuisineType = (cuisine: string) => {
    if (cuisineTypes.includes(cuisine)) {
      setCuisineTypes(cuisineTypes.filter(item => item !== cuisine));
    } else {
      setCuisineTypes([...cuisineTypes, cuisine]);
    }
  };
  
  const togglePaymentMethod = (method: string) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter(item => item !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };
  
  const handleImagePicker = () => {
    // In a real app, this would use expo-image-picker
    // For now, we'll just use a placeholder image
    const placeholderImages = [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
      'https://images.unsplash.com/photo-1493770348161-369560ae357d',
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    setProfileImage(randomImage);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
          style={styles.profileImage}
          contentFit="cover"
        />
        <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
          <Camera size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={errors.email}
        />
        
        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        
        <Text style={styles.sectionTitle}>Address Details</Text>
        
        <Input
          label="House/Flat/Door Number *"
          placeholder="e.g., 42, Flat 3B"
          value={doorNumber}
          onChangeText={setDoorNumber}
          error={errors.doorNumber}
        />
        
        <Input
          label="Building Name (optional)"
          placeholder="e.g., Sunshine Apartments"
          value={buildingName}
          onChangeText={setBuildingName}
        />
        
        <Input
          label="Street/Road Name *"
          placeholder="e.g., MG Road, 4th Cross"
          value={streetName}
          onChangeText={setStreetName}
          error={errors.streetName}
        />
        
        <Input
          label="Area/Locality/Colony *"
          placeholder="e.g., Jayanagar, Koramangala"
          value={area}
          onChangeText={setArea}
          error={errors.area}
        />
        
        <Input
          label="Landmark (optional)"
          placeholder="e.g., Near Post Office"
          value={landmark}
          onChangeText={setLandmark}
        />
        
        <Input
          label="City/Town/Village *"
          placeholder="e.g., Bangalore"
          value={city}
          onChangeText={setCity}
          error={errors.city}
        />
        
        <Input
          label="District (optional)"
          placeholder="e.g., Bangalore Urban"
          value={district}
          onChangeText={setDistrict}
        />
        
        <Input
          label="State/Union Territory *"
          placeholder="e.g., Karnataka"
          value={state}
          onChangeText={setState}
          error={errors.state}
        />
        
        <Input
          label="PIN Code *"
          placeholder="e.g., 560001"
          value={pinCode}
          onChangeText={setPinCode}
          keyboardType="number-pad"
          error={errors.pinCode}
        />
        
        <View style={styles.mapContainer}>
          <Text style={styles.label}>Location on Map</Text>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => setLocationPickerVisible(true)}
          >
            <MapPin size={20} color={colors.primary} />
            <Text style={styles.mapButtonText}>
              {location ? 'Change Location on Map' : 'Select Location on Map'}
            </Text>
          </TouchableOpacity>
          {location && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationCoordinates}>
                Latitude: {location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationCoordinates}>
                Longitude: {location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
        
        <Input
          label="Bio"
          placeholder="Tell us about yourself"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>I am a Chef</Text>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              isChef && styles.toggleButtonActive,
            ]}
            onPress={() => setIsChef(!isChef)}
          >
            <View style={[
              styles.toggleIndicator,
              isChef && styles.toggleIndicatorActive,
            ]}>
              {isChef && <Check size={12} color={colors.white} />}
            </View>
          </TouchableOpacity>
        </View>
        
        {isChef && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Cuisine Types</Text>
            {errors.cuisineTypes && <Text style={styles.errorText}>{errors.cuisineTypes}</Text>}
            <View style={styles.tagsContainer}>
              {CUISINE_TYPES.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.tag,
                    cuisineTypes.includes(cuisine) && styles.tagActive,
                  ]}
                  onPress={() => toggleCuisineType(cuisine)}
                >
                  <Text 
                    style={[
                      styles.tagText,
                      cuisineTypes.includes(cuisine) && styles.tagTextActive,
                    ]}
                  >
                    {cuisine}
                  </Text>
                  {cuisineTypes.includes(cuisine) && (
                    <Check size={12} color={colors.white} style={styles.tagIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          {errors.paymentMethods && <Text style={styles.errorText}>{errors.paymentMethods}</Text>}
          <View style={styles.tagsContainer}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.tag,
                  paymentMethods.includes(method) && styles.tagActive,
                ]}
                onPress={() => togglePaymentMethod(method)}
              >
                <Text 
                  style={[
                    styles.tagText,
                    paymentMethods.includes(method) && styles.tagTextActive,
                  ]}
                >
                  {method}
                </Text>
                {paymentMethods.includes(method) && (
                  <Check size={12} color={colors.white} style={styles.tagIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Display Profile Publicly</Text>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              allowProfileDisplay && styles.toggleButtonActive,
            ]}
            onPress={() => setAllowProfileDisplay(!allowProfileDisplay)}
          >
            <View style={[
              styles.toggleIndicator,
              allowProfileDisplay && styles.toggleIndicatorActive,
            ]}>
              {allowProfileDisplay && <Check size={12} color={colors.white} />}
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            style={styles.saveButton}
          />
        </View>
      </View>
      
      {locationPickerVisible && (
        <LocationPicker
          initialLocation={location ? { ...location, address: formatAddress() } : undefined}
          onSelectLocation={handleLocationSelect}
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
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: Platform.OS === 'web' ? '30%' : 30,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  formContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  mapContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  locationInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  locationCoordinates: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIndicatorActive: {
    transform: [{ translateX: 22 }],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  tagActive: {
    backgroundColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  tagTextActive: {
    color: colors.white,
  },
  tagIcon: {
    marginLeft: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});