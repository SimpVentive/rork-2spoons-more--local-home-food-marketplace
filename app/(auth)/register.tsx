import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, MapPin, Leaf } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LocationPicker from '@/components/LocationPicker';
import colors from '@/constants/colors';
import { CUISINE_TYPES, PAYMENT_METHODS } from '@/mocks/data';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    location: { latitude: 17.4123, longitude: 78.2679 }, // Default location
    cuisineTypes: [] as string[],
    paymentMethods: [] as string[],
    profileImage: '',
    experience: '',
    isVegetarianOnly: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (formData.cuisineTypes.length === 0) {
      newErrors.cuisineTypes = 'Select at least one cuisine type';
    }
    
    if (formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Select at least one payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleRegister();
      }
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(formData);
      router.replace('/(tabs)' as any);
    } catch (error) {
      setErrors({
        general: 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      updateFormData('profileImage', result.assets[0].uri);
    }
  };
  
  const toggleCuisineType = (cuisine: string) => {
    const cuisineTypes = [...formData.cuisineTypes];
    const index = cuisineTypes.indexOf(cuisine);
    
    if (index === -1) {
      cuisineTypes.push(cuisine);
    } else {
      cuisineTypes.splice(index, 1);
    }
    
    updateFormData('cuisineTypes', cuisineTypes);
  };
  
  const togglePaymentMethod = (method: string) => {
    const paymentMethods = [...formData.paymentMethods];
    const index = paymentMethods.indexOf(method);
    
    if (index === -1) {
      paymentMethods.push(method);
    } else {
      paymentMethods.splice(index, 1);
    }
    
    updateFormData('paymentMethods', paymentMethods);
  };
  
  const handleLocationSelect = (location: any) => {
    updateFormData('location', location);
    updateFormData('address', location.address);
    setShowLocationPicker(false);
  };

  const getTagStyle = (selected: boolean, type: 'cuisine' | 'payment') => {
    if (Platform.OS === 'web') {
      return {
        ...styles.tag,
        ...(selected ? styles.selectedTag : {})
      };
    }
    return selected ? [styles.tag, styles.selectedTag] : styles.tag;
  };

  const getTagTextStyle = (selected: boolean) => {
    if (Platform.OS === 'web') {
      return {
        ...styles.tagText,
        ...(selected ? styles.selectedTagText : {})
      };
    }
    return selected ? [styles.tagText, styles.selectedTagText] : styles.tagText;
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'Basic Information' : 'Seller Profile'}
          </Text>
        </View>
        
        <View style={styles.stepIndicator}>
          <View style={Platform.OS === 'web' 
            ? { ...styles.stepDot, ...styles.activeStepDot } 
            : [styles.stepDot, styles.activeStepDot]} 
          />
          <View style={Platform.OS === 'web'
            ? { ...styles.stepLine, ...(step >= 2 ? styles.activeStepLine : {}) }
            : [styles.stepLine, step >= 2 && styles.activeStepLine]} 
          />
          <View style={Platform.OS === 'web'
            ? { ...styles.stepDot, ...(step >= 2 ? styles.activeStepDot : {}) }
            : [styles.stepDot, step >= 2 && styles.activeStepDot]} 
          />
        </View>
        
        {step === 1 ? (
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              error={errors.name}
            />
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              isPassword
              error={errors.password}
              secureTextEntry={true}
            />
            
            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <Leaf size={20} color={colors.success} />
                <Text style={styles.switchLabel}>I prefer vegetarian food only</Text>
              </View>
              <Switch
                value={formData.isVegetarianOnly}
                onValueChange={(value) => updateFormData('isVegetarianOnly', value)}
                trackColor={{ false: colors.textLight, true: colors.success }}
                thumbColor={formData.isVegetarianOnly ? colors.white : colors.white}
              />
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
              {formData.profileImage ? (
                <Image
                  source={{ uri: formData.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={32} color={colors.textLight} />
                  <Text style={styles.imagePlaceholderText}>Add Profile Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Address</Text>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.locationButtonText}>
                  {formData.address || 'Set Location on Map'}
                </Text>
              </TouchableOpacity>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Cuisine Types</Text>
              {errors.cuisineTypes && (
                <Text style={styles.errorText}>{errors.cuisineTypes}</Text>
              )}
              
              <View style={styles.tagsContainer}>
                {CUISINE_TYPES.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={getTagStyle(formData.cuisineTypes.includes(cuisine), 'cuisine')}
                    onPress={() => toggleCuisineType(cuisine)}
                  >
                    <Text style={getTagTextStyle(formData.cuisineTypes.includes(cuisine))}>
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {errors.paymentMethods && (
                <Text style={styles.errorText}>{errors.paymentMethods}</Text>
              )}
              
              <View style={styles.tagsContainer}>
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={getTagStyle(formData.paymentMethods.includes(method), 'payment')}
                    onPress={() => togglePaymentMethod(method)}
                  >
                    <Text style={getTagTextStyle(formData.paymentMethods.includes(method))}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Input
              label="Experience (Optional)"
              placeholder="Tell us about your cooking experience"
              value={formData.experience}
              onChangeText={(text) => updateFormData('experience', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textArea}
            />
          </View>
        )}
        
        {errors.general && (
          <Text style={styles.generalError}>{errors.general}</Text>
        )}
        
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          
          <Button
            title={step === 1 ? 'Next' : 'Create Account'}
            onPress={handleNext}
            style={Platform.OS === 'web' 
              ? { ...styles.nextButton, ...(step === 1 ? styles.fullWidthButton : {}) }
              : [styles.nextButton, step === 1 && styles.fullWidthButton]
            }
            isLoading={isLoading}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
      
      {showLocationPicker && (
        <LocationPicker
          visible={showLocationPicker}
          initialLocation={formData.location}
          onLocationSelect={(location: any) => {
            updateFormData('location', { latitude: location.latitude, longitude: location.longitude });
            updateFormData('address', location.address);
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
          title="Select Location"
          showRoute={false}
          routeStart={null}
          routeEnd={null}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  activeStepDot: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },
  form: {
    marginBottom: 24,
  },
  imagePickerContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  locationSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationButtonText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedTagText: {
    color: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  generalError: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    marginRight: 12,
  },
  nextButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});