import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
} from 'react-native';
import { 
  X, 
  Route, 
  Home, 
  Briefcase, 
  Leaf, 
  Utensils,
  Search,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import { RouteSearchParams } from '@/types';
import { CUISINE_TYPES } from '@/mocks/data';

interface RouteSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (params: RouteSearchParams) => void;
}

export const RouteSearchModal: React.FC<RouteSearchModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const { user } = useAuthStore();
  
  const [routeType, setRouteType] = useState<'homeToOffice' | 'officeToHome'>('homeToOffice');
  const [dishName, setDishName] = useState('');
  const [maxDetour, setMaxDetour] = useState(user?.detourPreference || 500);
  const [foodType, setFoodType] = useState<'vegetarian' | 'non-vegetarian' | 'both'>('both');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  
  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setRouteType('homeToOffice');
      setDishName('');
      setMaxDetour(user?.detourPreference || 500);
      setFoodType('both');
      setSelectedCuisines([]);
    }
  }, [visible, user]);
  
  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };
  
  const handleApply = () => {
    const params: RouteSearchParams = {
      routeType,
      maxDetour,
      foodType,
    };
    
    if (dishName.trim()) {
      params.dishName = dishName.trim();
    }
    
    if (selectedCuisines.length > 0) {
      params.cuisineTypes = selectedCuisines;
    }
    
    onApply(params);
  };
  
  const hasRouteData = () => {
    if (routeType === 'homeToOffice') {
      return user?.homeToOfficeRoute && user.homeToOfficeRoute.length > 0;
    } else {
      return user?.officeToHomeRoute && user.officeToHomeRoute.length > 0;
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Check on My Route</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Select Route</Text>
            
            <View style={styles.routeTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.routeTypeOption,
                  routeType === 'homeToOffice' && styles.activeRouteTypeOption,
                ]}
                onPress={() => setRouteType('homeToOffice')}
              >
                <View style={styles.routeTypeIcons}>
                  <Home size={16} color={routeType === 'homeToOffice' ? colors.white : colors.text} />
                  <View style={styles.routeArrow} />
                  <Briefcase size={16} color={routeType === 'homeToOffice' ? colors.white : colors.text} />
                </View>
                <Text 
                  style={[
                    styles.routeTypeText,
                    routeType === 'homeToOffice' && styles.activeRouteTypeText,
                  ]}
                >
                  Home to Office
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.routeTypeOption,
                  routeType === 'officeToHome' && styles.activeRouteTypeOption,
                ]}
                onPress={() => setRouteType('officeToHome')}
              >
                <View style={styles.routeTypeIcons}>
                  <Briefcase size={16} color={routeType === 'officeToHome' ? colors.white : colors.text} />
                  <View style={styles.routeArrow} />
                  <Home size={16} color={routeType === 'officeToHome' ? colors.white : colors.text} />
                </View>
                <Text 
                  style={[
                    styles.routeTypeText,
                    routeType === 'officeToHome' && styles.activeRouteTypeText,
                  ]}
                >
                  Office to Home
                </Text>
              </TouchableOpacity>
            </View>
            
            {!hasRouteData() && (
              <View style={styles.noRouteWarning}>
                <Text style={styles.noRouteWarningText}>
                  You haven't set up your {routeType === 'homeToOffice' ? 'Home to Office' : 'Office to Home'} route yet.
                </Text>
                <Button
                  title="Set Up Route"
                  onPress={() => {
                    onClose();
                    // Navigate to route settings
                    // This would be handled by the parent component
                  }}
                  style={styles.setupRouteButton}
                />
              </View>
            )}
            
            <Text style={styles.sectionTitle}>What are you looking for?</Text>
            <Input
              placeholder="Enter dish name (optional)"
              value={dishName}
              onChangeText={setDishName}
              leftIcon={<Search size={20} color={colors.textLight} />}
            />
            
            <Text style={styles.sectionTitle}>Food Type</Text>
            <View style={styles.foodTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.foodTypeOption,
                  foodType === 'both' && styles.activeFoodTypeOption,
                ]}
                onPress={() => setFoodType('both')}
              >
                <Text style={[
                  styles.foodTypeText,
                  foodType === 'both' && styles.activeFoodTypeText,
                ]}>
                  Both
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.foodTypeOption,
                  foodType === 'vegetarian' && styles.vegFoodTypeOption,
                ]}
                onPress={() => setFoodType('vegetarian')}
              >
                <Leaf size={16} color={foodType === 'vegetarian' ? colors.white : colors.vegetarian} style={styles.foodTypeIcon} />
                <Text style={[
                  styles.foodTypeText,
                  foodType === 'vegetarian' && styles.vegFoodTypeText,
                ]}>
                  Vegetarian
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.foodTypeOption,
                  foodType === 'non-vegetarian' && styles.nonVegFoodTypeOption,
                ]}
                onPress={() => setFoodType('non-vegetarian')}
              >
                <Utensils size={16} color={foodType === 'non-vegetarian' ? colors.white : colors.nonVegetarian} style={styles.foodTypeIcon} />
                <Text style={[
                  styles.foodTypeText,
                  foodType === 'non-vegetarian' && styles.nonVegFoodTypeText,
                ]}>
                  Non-Vegetarian
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionTitle}>Cuisine Types</Text>
            <View style={styles.cuisineContainer}>
              {CUISINE_TYPES.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.cuisineOption,
                    selectedCuisines.includes(cuisine) && styles.activeCuisineOption,
                  ]}
                  onPress={() => toggleCuisine(cuisine)}
                >
                  <Text style={[
                    styles.cuisineText,
                    selectedCuisines.includes(cuisine) && styles.activeCuisineText,
                  ]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Maximum Detour</Text>
            <Text style={styles.detourDescription}>
              How far are you willing to detour from your route?
            </Text>
            
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={5000}
                step={100}
                value={maxDetour}
                onValueChange={setMaxDetour}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinLabel}>100m</Text>
                <Text style={styles.sliderValueLabel}>{maxDetour}m</Text>
                <Text style={styles.sliderMaxLabel}>5km</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Search on Route"
              onPress={handleApply}
              style={styles.applyButton}
              disabled={!hasRouteData()}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    maxHeight: 600,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  routeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routeTypeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginHorizontal: 4,
  },
  activeRouteTypeOption: {
    backgroundColor: colors.primary,
  },
  routeTypeIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeArrow: {
    width: 20,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  routeTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeRouteTypeText: {
    color: colors.white,
  },
  noRouteWarning: {
    backgroundColor: `${colors.warning}20`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  noRouteWarningText: {
    fontSize: 14,
    color: colors.warning,
    marginBottom: 12,
  },
  setupRouteButton: {
    backgroundColor: colors.warning,
  },
  foodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  foodTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginHorizontal: 4,
  },
  activeFoodTypeOption: {
    backgroundColor: colors.primary,
  },
  vegFoodTypeOption: {
    backgroundColor: colors.vegetarian,
  },
  nonVegFoodTypeOption: {
    backgroundColor: colors.nonVegetarian,
  },
  foodTypeIcon: {
    marginRight: 6,
  },
  foodTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeFoodTypeText: {
    color: colors.white,
  },
  vegFoodTypeText: {
    color: colors.white,
  },
  nonVegFoodTypeText: {
    color: colors.white,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cuisineOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  activeCuisineOption: {
    backgroundColor: colors.primary,
  },
  cuisineText: {
    fontSize: 14,
    color: colors.text,
  },
  activeCuisineText: {
    color: colors.white,
  },
  detourDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
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