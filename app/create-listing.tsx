import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  Camera, 
  MapPin, 
  Clock, 
  Calendar, 
  Leaf, 
  Trash2, 
  Plus,
  Utensils,
  Package,
  AlertTriangle,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import LocationPicker from '@/components/LocationPicker';
import SubscriptionModal from '@/components/SubscriptionModal';
import colors from '@/constants/colors';
import { CUISINE_TYPES, PACKAGING_TYPES, SOUTH_INDIAN_SUBCUISINES, SOUTH_INDIAN_CUISINES_FLAT } from '@/mocks/data';

// Lunchbox image from Unsplash (online URL instead of local asset)
const LUNCHBOX_IMAGE_URL = "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

interface LunchBoxItem {
  id: string;
  name: string;
  description: string;
  quantity: string;
  image: string;
}

export default function CreateListingScreen() {
  const { user, checkPostingEligibility, incrementPostCount } = useAuthStore();
  const { addListing, isLoading } = useListingsStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    dishName: '',
    description: '',
    image: '',
    quantity: '',
    servings: '2',
    price: '',
    packaging: '',
    availableFrom: new Date(),
    availableUntil: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
    cuisineType: user?.cuisineTypes[0] || '',
    subcuisineType: '',
    isVegetarian: true,
    isLunchBox: false,
    lunchBoxItems: [] as LunchBoxItem[],
    pickupLocation: {
      latitude: user?.location?.latitude || 0,
      longitude: user?.location?.longitude || 0,
      address: user?.address || '',
    },
    useDefaultAddress: true,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSubcuisines, setShowSubcuisines] = useState(false);
  const [availableSubcuisines, setAvailableSubcuisines] = useState<string[]>([]);
  
  useEffect(() => {
    // Check if user is eligible to post
    if (user) {
      const eligibility = checkPostingEligibility();
      if (!eligibility.eligible) {
        Alert.alert(
          'Subscription Required',
          eligibility.message,
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Subscribe', onPress: () => setShowSubscriptionModal(true) }
          ]
        );
      }
    }
    
    // Set default pickup location when user changes
    if (user && formData.useDefaultAddress) {
      setFormData(prev => ({
        ...prev,
        pickupLocation: {
          latitude: user.location?.latitude || 0,
          longitude: user.location?.longitude || 0,
          address: user.address || '',
        },
      }));
    }
  }, [user]);

  useEffect(() => {
    // Update available subcuisines when cuisine type changes
    if (formData.cuisineType && Object.keys(SOUTH_INDIAN_SUBCUISINES).includes(formData.cuisineType)) {
      setShowSubcuisines(true);
      setAvailableSubcuisines(
        SOUTH_INDIAN_SUBCUISINES[formData.cuisineType as keyof typeof SOUTH_INDIAN_SUBCUISINES] || []
      );
    } else {
      setShowSubcuisines(false);
      setAvailableSubcuisines([]);
      setFormData(prev => ({ ...prev, subcuisineType: '' }));
    }
  }, [formData.cuisineType]);
  
  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.isLunchBox) {
      // Validate lunch box
      if (formData.lunchBoxItems.length === 0) {
        newErrors.lunchBoxItems = 'Please add at least one item to your lunch box';
      } else {
        // Check if all lunch box items have required fields
        const invalidItems = formData.lunchBoxItems.filter(
          item => !item.name.trim() || !item.quantity.trim()
        );
        
        if (invalidItems.length > 0) {
          newErrors.lunchBoxItems = 'All lunch box items must have a name and quantity';
        }
      }
    } else {
      // Validate regular dish
      if (!formData.dishName.trim()) {
        newErrors.dishName = 'Dish name is required';
      }
      
      if (!formData.image) {
        newErrors.image = 'Please add an image of your dish';
      }
    }
    
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    } else if (Number(formData.quantity) > 3) {
      newErrors.quantity = 'Maximum quantity allowed is 3';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (!formData.packaging) {
      newErrors.packaging = 'Please select packaging type';
    }
    
    if (!formData.cuisineType) {
      newErrors.cuisineType = 'Please select cuisine type';
    }
    
    if (formData.availableUntil <= formData.availableFrom) {
      newErrors.availableUntil = 'Expiry time must be after available time';
    }
    
    if (!formData.pickupLocation.address) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      updateFormData('image', result.assets[0].uri);
    }
  };
  
  const pickLunchBoxItemImage = async (itemId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      const updatedItems = formData.lunchBoxItems.map(item => {
        if (item.id === itemId) {
          return { ...item, image: result.assets[0].uri };
        }
        return item;
      });
      
      updateFormData('lunchBoxItems', updatedItems);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a listing');
      return;
    }

    // Check if user is eligible to post
    const eligibility = checkPostingEligibility();
    if (!eligibility.eligible) {
      Alert.alert(
        'Subscription Required',
        eligibility.message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Subscribe', onPress: () => setShowSubscriptionModal(true) }
        ]
      );
      return;
    }
    
    const quantity = parseInt(formData.quantity);
    
    const newListing = {
      sellerId: user.id,
      sellerName: user.name,
      sellerImage: user.profileImage,
      sellerRating: user.rating ?? 5, // Provide default rating of 5 if undefined
      dishName: formData.isLunchBox ? 'Lunch Box' : formData.dishName,
      description: formData.description,
      image: formData.isLunchBox 
        ? (formData.lunchBoxItems[0]?.image || '') 
        : formData.image,
      ingredients: [], // Empty array as default
      allergens: [], // Empty array as default
      availableQuantity: quantity,
      quantity: quantity,
      remainingQuantity: quantity, // Initialize with full quantity
      servings: parseInt(formData.servings),
      price: parseFloat(formData.price),
      packaging: formData.packaging,
      availableFrom: formData.availableFrom.toISOString(),
      availableUntil: formData.availableUntil.toISOString(),
      cuisineType: formData.cuisineType,
      subcuisineType: formData.subcuisineType,
      isVegetarian: formData.isVegetarian,
      isLunchBox: formData.isLunchBox,
      lunchBoxItems: formData.isLunchBox ? formData.lunchBoxItems : [],
      location: formData.pickupLocation,
    };
    
    const success = await addListing(newListing);
    
    if (success) {
      // Increment post count
      await incrementPostCount();
      
      Alert.alert('Success', 'Your listing has been created', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to create listing');
    }
  };
  
  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromPicker(false);
    if (selectedDate) {
      updateFormData('availableFrom', selectedDate);
    }
  };
  
  const handleUntilDateChange = (event: any, selectedDate?: Date) => {
    setShowUntilPicker(false);
    if (selectedDate) {
      updateFormData('availableUntil', selectedDate);
    }
  };
  
  const handleLocationSelect = (location: any) => {
    updateFormData('pickupLocation', location);
    setShowLocationPicker(false);
  };
  
  const toggleUseDefaultAddress = () => {
    const useDefault = !formData.useDefaultAddress;
    updateFormData('useDefaultAddress', useDefault);
    
    if (useDefault && user) {
      updateFormData('pickupLocation', {
        latitude: user.location?.latitude || 0,
        longitude: user.location?.longitude || 0,
        address: user.address || '',
      });
    }
  };
  
  const addLunchBoxItem = () => {
    if (formData.lunchBoxItems.length >= 4) {
      Alert.alert('Limit Reached', 'You can add a maximum of 4 items to a lunch box');
      return;
    }
    
    const newItem: LunchBoxItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: '',
      image: '',
    };
    
    updateFormData('lunchBoxItems', [...formData.lunchBoxItems, newItem]);
  };
  
  const removeLunchBoxItem = (itemId: string) => {
    const updatedItems = formData.lunchBoxItems.filter(item => item.id !== itemId);
    updateFormData('lunchBoxItems', updatedItems);
  };
  
  const updateLunchBoxItem = (itemId: string, field: string, value: string) => {
    const updatedItems = formData.lunchBoxItems.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    updateFormData('lunchBoxItems', updatedItems);
  };
  
  const toggleLunchBox = () => {
    const isLunchBox = !formData.isLunchBox;
    
    if (isLunchBox && formData.lunchBoxItems.length === 0) {
      // Add default lunch box items if switching to lunch box mode
      const defaultItems: LunchBoxItem[] = [
        {
          id: Date.now().toString(),
          name: 'Chapati',
          description: '',
          quantity: '2',
          image: '',
        }
      ];
      
      updateFormData('lunchBoxItems', defaultItems);
    }
    
    updateFormData('isLunchBox', isLunchBox);
  };

  const renderPostingLimits = () => {
    if (!user) return null;

    const eligibility = checkPostingEligibility();
    
    return (
      <View style={styles.postingLimitsContainer}>
        <View style={styles.postingLimitsHeader}>
          <AlertTriangle size={16} color={eligibility.eligible ? colors.success : colors.warning} />
          <Text style={[
            styles.postingLimitsTitle,
            { color: eligibility.eligible ? colors.success : colors.warning }
          ]}>
            Posting Status
          </Text>
        </View>
        <Text style={styles.postingLimitsText}>{eligibility.message}</Text>
        
        {!eligibility.eligible && (
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => setShowSubscriptionModal(true)}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderPostingLimits()}
        
        <View style={styles.listingTypeContainer}>
          <Text style={styles.sectionTitle}>Listing Type</Text>
          
          <View style={styles.listingTypeOptions}>
            <TouchableOpacity
              style={[
                styles.listingTypeOption,
                !formData.isLunchBox && styles.selectedListingType,
              ]}
              onPress={() => updateFormData('isLunchBox', false)}
            >
              <Utensils 
                size={24} 
                color={!formData.isLunchBox ? colors.white : colors.text} 
              />
              <Text 
                style={[
                  styles.listingTypeText,
                  !formData.isLunchBox && styles.selectedListingTypeText,
                ]}
              >
                Single Dish
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.listingTypeOption,
                formData.isLunchBox && styles.selectedListingType,
              ]}
              onPress={() => updateFormData('isLunchBox', true)}
            >
              {/* Using Image component with online URL instead of require */}
              <Image
                source={{ uri: LUNCHBOX_IMAGE_URL }}
                style={[
                  styles.lunchboxIcon,
                  formData.isLunchBox && styles.selectedLunchboxIcon,
                ]}
              />
              <Text 
                style={[
                  styles.listingTypeText,
                  formData.isLunchBox && styles.selectedListingTypeText,
                ]}
              >
                Lunch Box
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {!formData.isLunchBox ? (
          // Single dish form
          <>
            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
              {formData.image ? (
                <Image
                  source={{ uri: formData.image }}
                  style={styles.dishImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera size={32} color={colors.textLight} />
                  <Text style={styles.imagePlaceholderText}>Add Dish Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {errors.image && (
              <Text style={styles.errorText}>{errors.image}</Text>
            )}
            
            <View style={styles.form}>
              <Input
                label="Dish Name"
                placeholder="Enter the name of your dish"
                value={formData.dishName}
                onChangeText={(text) => updateFormData('dishName', text)}
                error={errors.dishName}
              />
              
              <Input
                label="Description (Optional)"
                placeholder="Describe your dish, ingredients, etc."
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.textArea}
              />
            </View>
          </>
        ) : (
          // Lunch box form
          <View style={styles.lunchBoxContainer}>
            <Text style={styles.lunchBoxTitle}>Lunch Box Items</Text>
            {errors.lunchBoxItems && (
              <Text style={styles.errorText}>{errors.lunchBoxItems}</Text>
            )}
            
            {formData.lunchBoxItems.map((item, index) => (
              <View key={item.id} style={styles.lunchBoxItemContainer}>
                <View style={styles.lunchBoxItemHeader}>
                  <Text style={styles.lunchBoxItemNumber}>Item {index + 1}</Text>
                  <TouchableOpacity 
                    style={styles.removeItemButton}
                    onPress={() => removeLunchBoxItem(item.id)}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.lunchBoxItemContent}>
                  <TouchableOpacity 
                    style={styles.lunchBoxImagePicker}
                    onPress={() => pickLunchBoxItemImage(item.id)}
                  >
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.lunchBoxItemImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.lunchBoxImagePlaceholder}>
                        <Camera size={24} color={colors.textLight} />
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.lunchBoxItemFields}>
                    <Input
                      label="Item Name"
                      placeholder="e.g., Chapati, Rice, Dal"
                      value={item.name}
                      onChangeText={(text) => updateLunchBoxItem(item.id, 'name', text)}
                      containerStyle={styles.lunchBoxInput}
                    />
                    
                    <Input
                      label="Quantity"
                      placeholder="e.g., 2 pieces, 1 cup"
                      value={item.quantity}
                      onChangeText={(text) => updateLunchBoxItem(item.id, 'quantity', text)}
                      containerStyle={styles.lunchBoxInput}
                    />
                  </View>
                </View>
                
                <Input
                  label="Description (Optional)"
                  placeholder="Brief description of this item"
                  value={item.description}
                  onChangeText={(text) => updateLunchBoxItem(item.id, 'description', text)}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addItemButton}
              onPress={addLunchBoxItem}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={styles.addItemText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Quantity"
                placeholder="Number of portions"
                value={formData.quantity}
                onChangeText={(text) => updateFormData('quantity', text)}
                keyboardType="number-pad"
                error={errors.quantity}
                helperText="Maximum 3 portions allowed"
              />
            </View>
            
            <View style={styles.halfInput}>
              <Input
                label="Servings per Portion"
                placeholder="Number of servings"
                value={formData.servings}
                onChangeText={(text) => updateFormData('servings', text)}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <Input
            label="Price (₹)"
            placeholder="Enter price in rupees"
            value={formData.price}
            onChangeText={(text) => updateFormData('price', text)}
            keyboardType="number-pad"
            error={errors.price}
          />
          
          <View style={styles.foodTypeContainer}>
            <Text style={styles.foodTypeLabel}>Food Type</Text>
            
            <View style={styles.foodTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.foodTypeOption,
                  formData.isVegetarian && styles.vegOption,
                ]}
                onPress={() => updateFormData('isVegetarian', true)}
              >
                <Leaf size={16} color={formData.isVegetarian ? colors.white : colors.success} />
                <Text 
                  style={[
                    styles.foodTypeText,
                    formData.isVegetarian && styles.selectedFoodTypeText,
                  ]}
                >
                  Vegetarian
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.foodTypeOption,
                  !formData.isVegetarian && styles.nonVegOption,
                ]}
                onPress={() => updateFormData('isVegetarian', false)}
              >
                <Utensils size={16} color={!formData.isVegetarian ? colors.white : colors.error} />
                <Text 
                  style={[
                    styles.foodTypeText,
                    !formData.isVegetarian && styles.selectedFoodTypeText,
                  ]}
                >
                  Non-Vegetarian
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Cuisine Type</Text>
            {errors.cuisineType && (
              <Text style={styles.errorText}>{errors.cuisineType}</Text>
            )}
            
            <View style={styles.tagsContainer}>
              {/* Regular cuisine types */}
              {CUISINE_TYPES.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.tag,
                    formData.cuisineType === cuisine && styles.selectedTag,
                  ]}
                  onPress={() => updateFormData('cuisineType', cuisine)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      formData.cuisineType === cuisine && styles.selectedTagText,
                    ]}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* South Indian main categories */}
              <TouchableOpacity
                style={[
                  styles.tag,
                  formData.cuisineType === 'South Indian' && styles.selectedTag,
                ]}
                onPress={() => updateFormData('cuisineType', 'South Indian')}
              >
                <Text
                  style={[
                    styles.tagText,
                    formData.cuisineType === 'South Indian' && styles.selectedTagText,
                  ]}
                >
                  South Indian
                </Text>
              </TouchableOpacity>
              
              {Object.keys(SOUTH_INDIAN_SUBCUISINES).map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.tag,
                    formData.cuisineType === cuisine && styles.selectedTag,
                  ]}
                  onPress={() => updateFormData('cuisineType', cuisine)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      formData.cuisineType === cuisine && styles.selectedTagText,
                    ]}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Show subcuisines if a South Indian main category is selected */}
          {showSubcuisines && availableSubcuisines.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sub-Cuisine Type (Optional)</Text>
              
              <View style={styles.tagsContainer}>
                {availableSubcuisines.map((subcuisine) => (
                  <TouchableOpacity
                    key={subcuisine}
                    style={[
                      styles.tag,
                      formData.subcuisineType === subcuisine && styles.selectedTag,
                    ]}
                    onPress={() => updateFormData('subcuisineType', subcuisine)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        formData.subcuisineType === subcuisine && styles.selectedTagText,
                      ]}
                    >
                      {subcuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Packaging</Text>
            {errors.packaging && (
              <Text style={styles.errorText}>{errors.packaging}</Text>
            )}
            
            <View style={styles.tagsContainer}>
              {PACKAGING_TYPES.map((packaging) => (
                <TouchableOpacity
                  key={packaging}
                  style={[
                    styles.tag,
                    formData.packaging === packaging && styles.selectedTag,
                  ]}
                  onPress={() => updateFormData('packaging', packaging)}
                >
                  <Text
                    style={[
                      styles.tagText,
                      formData.packaging === packaging && styles.selectedTagText,
                    ]}
                  >
                    {packaging}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.dateTimeContainer}>
            <Text style={styles.sectionTitle}>Availability</Text>
            
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowFromPicker(true)}
            >
              <Clock size={20} color={colors.primary} />
              <Text style={styles.dateTimeButtonText}>
                Available From: {formData.availableFrom.toLocaleString()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowUntilPicker(true)}
            >
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.dateTimeButtonText}>
                Available Until: {formData.availableUntil.toLocaleString()}
              </Text>
            </TouchableOpacity>
            
            {errors.availableUntil && (
              <Text style={styles.errorText}>{errors.availableUntil}</Text>
            )}
            
            {showFromPicker && (
              <DateTimePicker
                value={formData.availableFrom}
                mode="datetime"
                display="default"
                onChange={handleFromDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showUntilPicker && (
              <DateTimePicker
                value={formData.availableUntil}
                mode="datetime"
                display="default"
                onChange={handleUntilDateChange}
                minimumDate={new Date(formData.availableFrom.getTime() + 30 * 60 * 1000)} // At least 30 minutes after available from
              />
            )}
          </View>
          
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Use my default address</Text>
              <Switch
                value={formData.useDefaultAddress}
                onValueChange={toggleUseDefaultAddress}
                trackColor={{ false: colors.textLight, true: colors.primary }}
                thumbColor={formData.useDefaultAddress ? colors.white : colors.white}
              />
            </View>
            
            {formData.useDefaultAddress ? (
              <TouchableOpacity 
                style={styles.locationDisplay}
                onPress={() => setShowLocationPicker(true)}
              >
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.locationText}>
                  {formData.pickupLocation.address || 'Set Pickup Location'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => setShowLocationPicker(true)}
              >
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.locationButtonText}>
                  {formData.pickupLocation.address || 'Set Custom Pickup Location'}
                </Text>
              </TouchableOpacity>
            )}
            
            {errors.pickupLocation && (
              <Text style={styles.errorText}>{errors.pickupLocation}</Text>
            )}
          </View>
          
          <Button
            title="Create Listing"
            onPress={handleSubmit}
            style={styles.submitButton}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
      
      {showLocationPicker && (
        <LocationPicker
          initialLocation={formData.pickupLocation}
          onSelectLocation={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
        />
      )}

      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  postingLimitsContainer: {
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  postingLimitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  postingLimitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  postingLimitsText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  listingTypeContainer: {
    marginBottom: 16,
  },
  listingTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingTypeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedListingType: {
    backgroundColor: colors.primary,
  },
  listingTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
  },
  selectedListingTypeText: {
    color: colors.white,
  },
  lunchboxIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text,
  },
  selectedLunchboxIcon: {
    tintColor: colors.white,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dishImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  foodTypeContainer: {
    marginBottom: 16,
  },
  foodTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  foodTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  vegOption: {
    backgroundColor: colors.success,
  },
  nonVegOption: {
    backgroundColor: colors.error,
  },
  foodTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  selectedFoodTypeText: {
    color: colors.white,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateTimeButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 16,
  },
  locationSection: {
    marginBottom: 24,
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
    fontSize: 16,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  locationText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  lunchBoxContainer: {
    marginBottom: 16,
  },
  lunchBoxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  lunchBoxItemContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lunchBoxItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lunchBoxItemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  removeItemButton: {
    padding: 4,
  },
  lunchBoxItemContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  lunchBoxImagePicker: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  lunchBoxItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  lunchBoxImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  lunchBoxItemFields: {
    flex: 1,
  },
  lunchBoxInput: {
    marginBottom: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addItemText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});