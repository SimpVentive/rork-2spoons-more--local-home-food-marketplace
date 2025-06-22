import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Switch,
  TextInput,
} from 'react-native';
import { X, Check, MapPin, Star, DollarSign, Clock, Users, Calendar } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { CUISINE_TYPES } from '@/mocks/data';
import colors from '@/constants/colors';
import Button from './Button';
import Input from './Input';
import { FilterOptions } from '@/types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || 0);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || 500);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    initialFilters.cuisineTypes || []
  );
  const [maxDistance, setMaxDistance] = useState<number>(
    initialFilters.maxDistance || 10
  );
  const [minServings, setMinServings] = useState<number>(
    initialFilters.minServings || 1
  );
  const [maxServings, setMaxServings] = useState<number>(
    initialFilters.maxServings || 10
  );
  const [availableNow, setAvailableNow] = useState<boolean>(
    initialFilters.availableNow || false
  );
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'distance' | 'availableUntil' | 'servings' | undefined>(
    initialFilters.sortBy
  );
  const [foodType, setFoodType] = useState<'vegetarian' | 'non-vegetarian' | 'both'>(
    initialFilters.foodType || 'both'
  );

  // Refs to prevent re-renders
  const minPriceRef = useRef(minPrice);
  const maxPriceRef = useRef(maxPrice);
  const maxDistanceRef = useRef(maxDistance);
  const minServingsRef = useRef(minServings);
  const maxServingsRef = useRef(maxServings);

  useEffect(() => {
    if (visible) {
      // Reset filters when modal opens with initialFilters
      setMinPrice(initialFilters.minPrice || 0);
      setMaxPrice(initialFilters.maxPrice || 500);
      setSelectedCuisines(initialFilters.cuisineTypes || []);
      setMaxDistance(initialFilters.maxDistance || 10);
      setMinServings(initialFilters.minServings || 1);
      setMaxServings(initialFilters.maxServings || 10);
      setAvailableNow(initialFilters.availableNow || false);
      setSortBy(initialFilters.sortBy);
      setFoodType(initialFilters.foodType || 'both');
      
      // Update refs
      minPriceRef.current = initialFilters.minPrice || 0;
      maxPriceRef.current = initialFilters.maxPrice || 500;
      maxDistanceRef.current = initialFilters.maxDistance || 10;
      minServingsRef.current = initialFilters.minServings || 1;
      maxServingsRef.current = initialFilters.maxServings || 10;
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    const filters: FilterOptions = {
      minPrice,
      maxPrice,
      cuisineTypes: selectedCuisines.length > 0 ? selectedCuisines : undefined,
      maxDistance,
      minServings,
      maxServings,
      availableNow,
      sortBy,
      foodType,
    };
    
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(500);
    setSelectedCuisines([]);
    setMaxDistance(10);
    setMinServings(1);
    setMaxServings(10);
    setAvailableNow(false);
    setSortBy(undefined);
    setFoodType('both');
    
    // Update refs
    minPriceRef.current = 0;
    maxPriceRef.current = 500;
    maxDistanceRef.current = 10;
    minServingsRef.current = 1;
    maxServingsRef.current = 10;
  };

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  // Handle slider value changes without causing re-renders
  const handleMinPriceChange = (value: number) => {
    const newMinPrice = Math.min(value, maxPriceRef.current - 50);
    minPriceRef.current = newMinPrice;
    setMinPrice(newMinPrice);
  };

  const handleMaxPriceChange = (value: number) => {
    const newMaxPrice = Math.max(value, minPriceRef.current + 50);
    maxPriceRef.current = newMaxPrice;
    setMaxPrice(newMaxPrice);
  };

  const handleDistanceChange = (value: number) => {
    maxDistanceRef.current = value;
    setMaxDistance(value);
  };

  const handleMinServingsChange = (value: number) => {
    const newMinServings = Math.min(value, maxServingsRef.current - 1);
    minServingsRef.current = newMinServings;
    setMinServings(newMinServings);
  };

  const handleMaxServingsChange = (value: number) => {
    const newMaxServings = Math.max(value, minServingsRef.current + 1);
    maxServingsRef.current = newMaxServings;
    setMaxServings(newMaxServings);
  };

  // Direct input handlers for servings
  const handleMinServingsInput = (text: string) => {
    const value = parseInt(text);
    if (!isNaN(value) && value >= 1) {
      const newMinServings = Math.min(value, maxServingsRef.current - 1);
      minServingsRef.current = newMinServings;
      setMinServings(newMinServings);
    }
  };

  const handleMaxServingsInput = (text: string) => {
    const value = parseInt(text);
    if (!isNaN(value) && value >= 2) {
      const newMaxServings = Math.max(value, minServingsRef.current + 1);
      maxServingsRef.current = newMaxServings;
      setMaxServings(newMaxServings);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>₹{minPrice}</Text>
                <Text style={styles.priceText}>₹{maxPrice}</Text>
              </View>
              
              {/* Min price slider */}
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Min: ₹{minPrice}</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min={0}
                    max={950}
                    step={50}
                    value={minPrice}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleMinPriceChange(value);
                    }}
                    style={{ 
                      width: '100%', 
                      height: 40,
                      accentColor: colors.primary,
                    }}
                  />
                ) : (
                  <Slider
                    value={minPrice}
                    onValueChange={handleMinPriceChange}
                    minimumValue={0}
                    maximumValue={950}
                    step={50}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                )}
              </View>
              
              {/* Max price slider */}
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Max: ₹{maxPrice}</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    value={maxPrice}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleMaxPriceChange(value);
                    }}
                    style={{ 
                      width: '100%', 
                      height: 40,
                      accentColor: colors.primary,
                    }}
                  />
                ) : (
                  <Slider
                    value={maxPrice}
                    onValueChange={handleMaxPriceChange}
                    minimumValue={50}
                    maximumValue={1000}
                    step={50}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
              <View style={styles.distanceContainer}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.distanceText}>{maxDistance} km</Text>
              </View>
              
              {/* Distance slider */}
              <View style={styles.sliderContainer}>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={maxDistance}
                    onChange={(e) => handleDistanceChange(parseInt(e.target.value))}
                    style={{ 
                      width: '100%', 
                      height: 40,
                      accentColor: colors.primary,
                    }}
                  />
                ) : (
                  <Slider
                    value={maxDistance}
                    onValueChange={handleDistanceChange}
                    minimumValue={1}
                    maximumValue={20}
                    step={1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Servings</Text>
              <View style={styles.servingsContainer}>
                <Users size={16} color={colors.primary} />
                <Text style={styles.servingsText}>
                  {minServings === maxServings 
                    ? `${minServings} servings` 
                    : `${minServings} - ${maxServings} servings`}
                </Text>
              </View>
              
              {/* Min servings input */}
              <View style={styles.servingsInputContainer}>
                <Text style={styles.servingsInputLabel}>Min Servings:</Text>
                <TextInput
                  style={styles.servingsInput}
                  value={minServings.toString()}
                  onChangeText={handleMinServingsInput}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              {/* Min servings slider */}
              <View style={styles.sliderContainer}>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={minServings}
                    onChange={(e) => handleMinServingsChange(parseInt(e.target.value))}
                    style={{ 
                      width: '100%', 
                      height: 40,
                      accentColor: colors.primary,
                    }}
                  />
                ) : (
                  <Slider
                    value={minServings}
                    onValueChange={handleMinServingsChange}
                    minimumValue={1}
                    maximumValue={9}
                    step={1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                )}
              </View>
              
              {/* Max servings input */}
              <View style={styles.servingsInputContainer}>
                <Text style={styles.servingsInputLabel}>Max Servings:</Text>
                <TextInput
                  style={styles.servingsInput}
                  value={maxServings.toString()}
                  onChangeText={handleMaxServingsInput}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              {/* Max servings slider */}
              <View style={styles.sliderContainer}>
                {Platform.OS === 'web' ? (
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={maxServings}
                    onChange={(e) => handleMaxServingsChange(parseInt(e.target.value))}
                    style={{ 
                      width: '100%', 
                      height: 40,
                      accentColor: colors.primary,
                    }}
                  />
                ) : (
                  <Slider
                    value={maxServings}
                    onValueChange={handleMaxServingsChange}
                    minimumValue={2}
                    maximumValue={10}
                    step={1}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.availabilityContainer}>
                <View style={styles.availabilityOption}>
                  <View style={styles.availabilityLabelContainer}>
                    <Calendar size={16} color={colors.primary} />
                    <Text style={styles.availabilityLabel}>Available Now</Text>
                  </View>
                  <Switch
                    value={availableNow}
                    onValueChange={setAvailableNow}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuisine Types</Text>
              <View style={styles.cuisineContainer}>
                {CUISINE_TYPES.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.cuisineTag,
                      selectedCuisines.includes(cuisine) && styles.selectedCuisine,
                    ]}
                    onPress={() => toggleCuisine(cuisine)}
                  >
                    <Text
                      style={[
                        styles.cuisineText,
                        selectedCuisines.includes(cuisine) && styles.selectedCuisineText,
                      ]}
                    >
                      {cuisine}
                    </Text>
                    {selectedCuisines.includes(cuisine) && (
                      <Check size={12} color={colors.white} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'rating' && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortBy('rating')}
                >
                  <Star
                    size={16}
                    color={sortBy === 'rating' ? colors.white : colors.primary}
                  />
                  <Text
                    style={[
                      styles.sortText,
                      sortBy === 'rating' && styles.selectedSortText,
                    ]}
                  >
                    Rating
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'price' && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortBy('price')}
                >
                  <DollarSign
                    size={16}
                    color={sortBy === 'price' ? colors.white : colors.primary}
                  />
                  <Text
                    style={[
                      styles.sortText,
                      sortBy === 'price' && styles.selectedSortText,
                    ]}
                  >
                    Price
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'distance' && styles.selectedSortOption,
                  ]}
                  onPress={() => setSortBy('distance')}
                >
                  <MapPin
                    size={16}
                    color={sortBy === 'distance' ? colors.white : colors.primary}
                  />
                  <Text
                    style={[
                      styles.sortText,
                      sortBy === 'distance' && styles.selectedSortText,
                    ]}
                  >
                    Distance
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortBy === 'availableUntil' && styles.selectedSortOption,
                ]}
                onPress={() => setSortBy('availableUntil')}
              >
                <Clock
                  size={16}
                  color={sortBy === 'availableUntil' ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.sortText,
                    sortBy === 'availableUntil' && styles.selectedSortText,
                  ]}
                >
                  Ending Soon
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortOption,
                  sortBy === 'servings' && styles.selectedSortOption,
                ]}
                onPress={() => setSortBy('servings')}
              >
                <Users
                  size={16}
                  color={sortBy === 'servings' ? colors.white : colors.primary}
                />
                <Text
                  style={[
                    styles.sortText,
                    sortBy === 'servings' && styles.selectedSortText,
                  ]}
                >
                  Servings
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Food Type</Text>
              <View style={styles.foodTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.foodTypeOption,
                    foodType === 'both' && styles.selectedFoodType,
                  ]}
                  onPress={() => setFoodType('both')}
                >
                  <Text
                    style={[
                      styles.foodTypeText,
                      foodType === 'both' && styles.selectedFoodTypeText,
                    ]}
                  >
                    Both
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.foodTypeOption,
                    foodType === 'vegetarian' && styles.selectedVegFoodType,
                  ]}
                  onPress={() => setFoodType('vegetarian')}
                >
                  <Text
                    style={[
                      styles.foodTypeText,
                      foodType === 'vegetarian' && styles.selectedFoodTypeText,
                    ]}
                    numberOfLines={1}
                  >
                    Veg
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.foodTypeOption,
                    foodType === 'non-vegetarian' && styles.selectedNonVegFoodType,
                  ]}
                  onPress={() => setFoodType('non-vegetarian')}
                >
                  <Text
                    style={[
                      styles.foodTypeText,
                      foodType === 'non-vegetarian' && styles.selectedFoodTypeText,
                    ]}
                    numberOfLines={1}
                  >
                    Non-Veg
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '90%', // Increased from 80% to 90%
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8, // Increased touch target
  },
  scrollView: {
    maxHeight: '70%',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: colors.text,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cuisineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCuisine: {
    backgroundColor: colors.primary,
  },
  cuisineText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCuisineText: {
    color: colors.white,
  },
  checkIcon: {
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  servingsText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  servingsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  servingsInputLabel: {
    fontSize: 14,
    color: colors.text,
  },
  servingsInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  availabilityContainer: {
    marginBottom: 8,
  },
  availabilityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  availabilityLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    width: '30%',
    justifyContent: 'center',
  },
  selectedSortOption: {
    backgroundColor: colors.primary,
  },
  sortText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  selectedSortText: {
    color: colors.white,
  },
  foodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    width: '31%',
    alignItems: 'center',
  },
  selectedFoodType: {
    backgroundColor: colors.primary,
  },
  selectedVegFoodType: {
    backgroundColor: colors.vegetarian,
  },
  selectedNonVegFoodType: {
    backgroundColor: colors.nonVegetarian,
  },
  foodTypeText: {
    fontSize: 13,
    color: colors.text,
  },
  selectedFoodTypeText: {
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resetButton: {
    flex: 1,
    marginRight: 12,
  },
  applyButton: {
    flex: 2,
  },
});