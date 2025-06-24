// EditListingScreen.tsx
import Button from '@/components/Button';
import Input from '@/components/Input';
import LocationPicker from '@/components/LocationPicker';
import colors from '@/constants/colors';
import { CUISINE_TYPES, PACKAGING_TYPES } from '@/mocks/data';
import { useAuthStore } from '@/store/auth-store';
import { useListingsStore } from '@/store/listings-store';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Camera,
  Clock,
  Leaf,
  MapPin,
  Plus,
  Trash2,
  Utensils
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const LUNCHBOX_IMAGE_URL = 'https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?...';

interface LunchBoxItem {
  id: string;
  name: string;
  description: string;
  quantity: string;
  image: string;
}

export default function EditListingScreen() {
  const { id: listingId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { getListingById, updateListingEdit, isLoading } = useListingsStore();

  const [formData, setFormData] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getListingById(listingId as string);
      if (!data) {
        Alert.alert('Error', 'Listing not found', [{ text: 'OK', onPress: () => router.back() }]);
        return;
      }
      console.log(data);
      setFormData({
        dishName: data.dishName,
        description: data.description || '',
        image: data.image || '',
        quantity: String(data.remainingQuantity),
        servings: String(data.servings),
        price: String(data.price),
        packaging: data.packaging,
        cuisineType: data.cuisineType,
        isVegetarian: data.isVegetarian,
        isLunchBox: data.isLunchBox,
        lunchBoxItems: data.lunchBoxItems || [],
        availableFrom: new Date(data.availableFrom),
        availableUntil: new Date(data.availableUntil),
        pickupLocation: data.location || {},
        useDefaultAddress: false
      });
    }
    load();
  }, [listingId]);

  const updateFormData = (key: string, value: any) =>
    setFormData((prev: any) => ({ ...prev, [key]: value }));

  const validateForm = () => {
    const e: any = {};
    if (!formData.dishName.trim()) e.dishName = 'Required';
    if (!formData.image) e.image = 'Required';
    if (!formData.quantity.trim()) e.quantity = 'Required';
    if (!formData.price.trim()) e.price = 'Required';
    if (!formData.packaging) e.packaging = 'Required';
    if (!formData.cuisineType) e.cuisineType = 'Required';
    if (!formData.pickupLocation?.address) e.pickupLocation = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        requestAnimationFrame(() => {
          updateFormData('image', uri);
        });
      }
};


  const handleImagePick = async () => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!res.canceled) {
    updateFormData('image', res.assets[0].uri);
  }
};


  const addLunchBoxItem = () => {
    const newItem = { id: Date.now().toString(), name: '', quantity: '', description: '', image: '' };
    updateFormData('lunchBoxItems', [...formData.lunchBoxItems, newItem]);
  };

  const removeLunchBoxItem = (id: string) =>
    updateFormData('lunchBoxItems', formData.lunchBoxItems.filter((i: LunchBoxItem) => i.id !== id));

  const updateLunchBoxItem = (id: string, key: string, value: any) =>
    updateFormData('lunchBoxItems', formData.lunchBoxItems.map((i: any) =>
      i.id === id ? { ...i, [key]: value } : i
    ));

  const pickLunchBoxItemImage = async (id: string) => {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!res.canceled) {
    updateLunchBoxItem(id, 'image', res.assets[0].uri);
  }
};


  const toggleUseDefaultAddress = () => {
    const v = !formData.useDefaultAddress;
    updateFormData('useDefaultAddress', v);
    if (v && user?.address) {
      updateFormData('pickupLocation', user.location);
    }
  };

 
/*
const handleFromDateChange = (_event: any, selectedDate?: Date) => {
  if (Platform.OS === 'android') {
    setShowFromPicker(false); // close picker manually
    if (selectedDate) {
      updateFormData('availableFrom', selectedDate);
    }
  } else if (selectedDate) {
    updateFormData('availableFrom', selectedDate);
  }
};

const handleUntilDateChange = (_event: any, selectedDate?: Date) => {
  if (Platform.OS === 'android') {
    setShowUntilPicker(false); // close picker manually
    if (selectedDate) {
      updateFormData('availableUntil', selectedDate);
    }
  } else if (selectedDate) {
    updateFormData('availableUntil', selectedDate);
  }
};
*/


  const handleLocationSelect = (loc: any) => {
    updateFormData('pickupLocation', loc);
    setShowLocationPicker(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const payload = {
      ...formData,
      quantity: +formData.quantity,
      servings: +formData.servings,
      price: +formData.price,
      availableFrom: formData.availableFrom.toISOString(),
      availableUntil: formData.availableUntil.toISOString()
    };
    const ok = await updateListingEdit(listingId as string, payload);
    Alert.alert(ok ? 'Success' : 'Error', ok ? 'Updated' : 'Failed', [{ text: 'OK', onPress: () => ok && router.back() }]);
  };


  
  const [showFromPickerIOS, setShowFromPickerIOS] = useState(false);
  const [showUntilPickerIOS, setShowUntilPickerIOS] = useState(false);
  
  const handleFromDateChange = (event, selectedDate) => {
  if (selectedDate) {
  updateFormData('availableFrom', selectedDate);
  }
  if (Platform.OS === 'ios') setShowFromPickerIOS(false);
  };
  
  const handleUntilDateChange = (event, selectedDate) => {
  if (selectedDate) {
  if (selectedDate <= formData.availableFrom) {
  setErrors({ availableUntil: 'Must be after Available From' });
  } else {
  setErrors({ availableUntil: '' });
  updateFormData('availableUntil', selectedDate);
  }
  }
  if (Platform.OS === 'ios') setShowUntilPickerIOS(false);
  };
  
  const openFromPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
      value: formData.availableFrom,
      //onChange: handleFromDateChange,
      mode: 'datetime',
      is24Hour: true,
      minimumDate: new Date(),
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            // Step 2: After date selected, show Time Picker
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (_, selectedTime) => {
                if (selectedTime) {
                  // Merge date and time
                  const finalDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    selectedTime.getHours(),
                    selectedTime.getMinutes()
                  );
                  //setAvailableFrom(finalDate);
                  updateFormData('availableFrom', finalDate);
                }
              }
            });
          }
        }
      });
    } else {
      setShowFromPickerIOS(true);
    }
  };
  
  const openUntilPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
      value: formData.availableUntil,
      //onChange: handleUntilDateChange,
      mode: 'datetime',
      is24Hour: true,
      minimumDate: new Date(formData.availableFrom.getTime() + 30 * 60 * 1000),
      onChange: (_, selectedDate) => {
          if (selectedDate) {
            // Step 2: After date selected, show Time Picker
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              is24Hour: true,
              onChange: (_, selectedTime) => {
                if (selectedTime) {
                  // Merge date and time
                  const finalDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    selectedTime.getHours(),
                    selectedTime.getMinutes()
                  );
                  //setAvailableFrom(finalDate);
                  updateFormData('availableUntil', finalDate);
                }
              }
            });
          }
        }
      });
    } else {
    setShowUntilPickerIOS(true);
    }
  };

  if (!formData) return null;

  return (
    <KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>{formData.isLunchBox ? 'Edit Lunch Box' : 'Edit Dish'}</Text>

    {/* Listing Type Toggle */}
    <View style={styles.listingTypeContainer}>
      <View style={styles.listingTypeOptions}>
        <TouchableOpacity
          style={[
            styles.listingTypeOption,
            !formData.isLunchBox && styles.selectedListingType,
          ]}
          onPress={() => updateFormData('isLunchBox', false)}
        >
          <Utensils size={24} color={!formData.isLunchBox ? colors.white : colors.text} />
          <Text style={[
            styles.listingTypeText,
            !formData.isLunchBox && styles.selectedListingTypeText
          ]}>Single Dish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.listingTypeOption,
            formData.isLunchBox && styles.selectedListingType,
          ]}
          onPress={() => updateFormData('isLunchBox', true)}
        >
          <Image
            source={{ uri: LUNCHBOX_IMAGE_URL }}
            style={[
              styles.lunchboxIcon,
              formData.isLunchBox && styles.selectedLunchboxIcon,
            ]}
          />
          <Text style={[
            styles.listingTypeText,
            formData.isLunchBox && styles.selectedListingTypeText
          ]}>Lunch Box</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Image picker */}
    <TouchableOpacity onPress={handleImagePick} style={{ marginBottom: 16 }}>
      {formData.image ? (
        <Image source={{ uri: formData.image }} style={{ height: 200, borderRadius: 10 }} contentFit="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Camera size={32} color={colors.textLight} />
          <Text>Select Dish Image</Text>
        </View>
      )}
    </TouchableOpacity>
    {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

    {/* Dish or Lunch Box fields */}
    {!formData.isLunchBox ? (
      <>
        <Input
          label="Dish Name"
          value={formData.dishName}
          onChangeText={(text) => updateFormData('dishName', text)}
          error={errors.dishName}
        />
        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          multiline
        />
      </>
    ) : (
      <View style={styles.lunchBoxContainer}>
        <Text style={styles.lunchBoxTitle}>Lunch Box Items</Text>
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
                  placeholder="e.g., Rice"
                  value={item.name}
                  onChangeText={(text) => updateLunchBoxItem(item.id, 'name', text)}
                  containerStyle={styles.lunchBoxInput}
                />
                <Input
                  label="Quantity"
                  placeholder="e.g., 2 cups"
                  value={item.quantity}
                  onChangeText={(text) => updateLunchBoxItem(item.id, 'quantity', text)}
                  containerStyle={styles.lunchBoxInput}
                />
              </View>
            </View>

            <Input
              label="Description (Optional)"
              placeholder="Brief description"
              value={item.description}
              onChangeText={(text) => updateLunchBoxItem(item.id, 'description', text)}
              multiline
              numberOfLines={2}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addItemButton} onPress={addLunchBoxItem}>
          <Plus size={16} color={colors.primary} />
          <Text style={styles.addItemText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    )}

    {/* Quantity, servings, price */}
    <View style={styles.row}>
      <View style={styles.halfInput}>
        <Input
          label="Quantity"
          value={formData.quantity}
          onChangeText={(text) => updateFormData('quantity', text)}
          keyboardType="numeric"
          error={errors.quantity}
        />
      </View>
      <View style={styles.halfInput}>
        <Input
          label="Servings"
          value={formData.servings}
          onChangeText={(text) => updateFormData('servings', text)}
          keyboardType="numeric"
        />
      </View>
    </View>
    <Input
      label="Price (₹)"
      value={formData.price}
      onChangeText={(text) => updateFormData('price', text)}
      keyboardType="numeric"
      error={errors.price}
    />

    {/* Veg / Non-Veg */}
    <View style={styles.foodTypeContainer}>
      <Text style={styles.foodTypeLabel}>Food Type</Text>
      <View style={styles.foodTypeOptions}>
        <TouchableOpacity
          style={[styles.foodTypeOption, formData.isVegetarian && styles.vegOption]}
          onPress={() => updateFormData('isVegetarian', true)}
        >
          <Leaf size={16} color={formData.isVegetarian ? colors.white : colors.success} />
          <Text style={[
            styles.foodTypeText,
            formData.isVegetarian && styles.selectedFoodTypeText
          ]}>Vegetarian</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.foodTypeOption, !formData.isVegetarian && styles.nonVegOption]}
          onPress={() => updateFormData('isVegetarian', false)}
        >
          <Utensils size={16} color={!formData.isVegetarian ? colors.white : colors.error} />
          <Text style={[
            styles.foodTypeText,
            !formData.isVegetarian && styles.selectedFoodTypeText
          ]}>Non-Vegetarian</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Cuisine Types */}
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Cuisine Type</Text>
      <View style={styles.tagsContainer}>
        {CUISINE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tag, formData.cuisineType === type && styles.selectedTag]}
            onPress={() => updateFormData('cuisineType', type)}
          >
            <Text style={[
              styles.tagText,
              formData.cuisineType === type && styles.selectedTagText
            ]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Packaging Types */}
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Packaging</Text>
      <View style={styles.tagsContainer}>
        {PACKAGING_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.tag, formData.packaging === type && styles.selectedTag]}
            onPress={() => updateFormData('packaging', type)}
          >
            <Text style={[
              styles.tagText,
              formData.packaging === type && styles.selectedTagText
            ]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.dateTimeContainer}>
      <Text style={styles.sectionTitle}>Availability</Text>
      <TouchableOpacity style={styles.dateTimeButton} onPress={openFromPicker}>
        <Clock size={20} color="#007AFF" />
        <Text style={styles.dateTimeButtonText}>
          Available From: {formData.availableFrom.toLocaleString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateTimeButton} onPress={openUntilPicker}>
        <Calendar size={20} color="#007AFF" />
        <Text style={styles.dateTimeButtonText}>
          Available Until: {formData.availableUntil.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {errors.availableUntil && (
        <Text style={styles.errorText}>{errors.availableUntil}</Text>
      )}

      {/* iOS Only Pickers */}
      {Platform.OS === 'ios' && showFromPickerIOS && (
        <DateTimePicker
          value={formData.availableFrom}
          mode="datetime"
          display="spinner"
          onChange={handleFromDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'ios' && showUntilPickerIOS && (
        <DateTimePicker
          value={formData.availableUntil}
          mode="datetime"
          display="spinner"
          onChange={handleUntilDateChange}
          minimumDate={new Date(formData.availableFrom.getTime() + 30 * 60 * 1000)}
        />
      )}
    </View>
    {/* <View style={styles.dateTimeContainer}>
      <Text style={styles.sectionTitle}>Availability</Text>

     
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss();
          setShowFromPicker(true);
        }}
        style={styles.dateTimeButton}
      >
        <Clock size={20} color={colors.primary} />
        <Text style={styles.dateTimeButtonText}>
          From: {formData.availableFrom.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showFromPicker && !showUntilPicker && (
        <DateTimePicker
          value={formData.availableFrom}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShowFromPicker(false);
            if (selectedDate) updateFormData('availableFrom', selectedDate);
          }}
          minimumDate={new Date()}
        />
      )}

      
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss();
          setShowUntilPicker(true);
        }}
        style={styles.dateTimeButton}
      >
        <Calendar size={20} color={colors.primary} />
        <Text style={styles.dateTimeButtonText}>
          Until: {formData.availableUntil.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showUntilPicker && !showFromPicker && (
        <DateTimePicker
          value={formData.availableUntil}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShowUntilPicker(false);
            if (selectedDate) updateFormData('availableUntil', selectedDate);
          }}
          minimumDate={new Date(formData.availableFrom.getTime() + 30 * 60 * 1000)}
        />
      )}
    </View> */}

    {/* Location */}
    <View style={styles.locationSection}>
      <Text style={styles.sectionTitle}>Pickup Location</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Use my default address</Text>
        <Switch
          value={formData.useDefaultAddress}
          onValueChange={toggleUseDefaultAddress}
          trackColor={{ false: colors.textLight, true: colors.primary }}
        />
      </View>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setShowLocationPicker(true)}
      >
        <MapPin size={20} color={colors.primary} />
        <Text style={styles.locationButtonText}>
          {formData.pickupLocation?.address || 'Set Pickup Location'}
        </Text>
      </TouchableOpacity>
    </View>

    {/* Submit Button */}
    <Button
      title={isLoading ? 'Updating...' : 'Update Listing'}
      onPress={handleSubmit}
      style={styles.submitButton}
    />
  </ScrollView>

  {/* Location Picker Modal */}
  {showLocationPicker && (
    <LocationPicker
      initialLocation={formData.pickupLocation}
      onSelectLocation={handleLocationSelect}
      onClose={() => setShowLocationPicker(false)}
    />
  )}
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
