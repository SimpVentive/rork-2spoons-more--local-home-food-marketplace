import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Route, MapPin, Navigation, ArrowRight } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { RouteSearchParams } from '@/types';

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
  const [maxDetour, setMaxDetour] = useState(user?.detourPreference || 500);
  const [foodType, setFoodType] = useState<'vegetarian' | 'non-vegetarian' | 'both'>('both');
  const [dishName, setDishName] = useState('');
  
  const hasRouteSettings = !!user?.officeAddress && 
    ((routeType === 'homeToOffice' && user.homeToOfficeRoute && user.homeToOfficeRoute.length > 0) ||
     (routeType === 'officeToHome' && user.officeToHomeRoute && user.officeToHomeRoute.length > 0) ||
     (routeType === 'officeToHome' && user.routesSameAsHomeToOffice && user.homeToOfficeRoute && user.homeToOfficeRoute.length > 0));
  
  const handleApply = () => {
    if (!hasRouteSettings) {
      return;
    }
    
    const params: RouteSearchParams = {
      routeType,
      maxDetour,
      foodType,
    };
    
    if (dishName) {
      params.dishName = dishName;
    }
    
    onApply(params);
  };
  
  const goToRouteSettings = () => {
    onClose();
    // Use setTimeout to avoid navigation during render
    setTimeout(() => {
      // This will be handled by the parent component
      // router.push('/route-settings');
    }, 300);
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
          <View style={styles.header}>
            <Text style={styles.title}>Search Along Your Route</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {!hasRouteSettings ? (
              <View style={styles.noRouteContainer}>
                <View style={styles.noRouteIconContainer}>
                  <Route size={48} color={colors.primary} />
                </View>
                <Text style={styles.noRouteTitle}>Route Not Set Up</Text>
                <Text style={styles.noRouteDescription}>
                  You need to set up your commute route before you can search for food along it.
                </Text>
                <Button
                  title="Set Up Route"
                  onPress={goToRouteSettings}
                  style={styles.setupButton}
                />
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Route</Text>
                  <View style={styles.routeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.routeOption,
                        routeType === 'homeToOffice' && styles.activeRouteOption,
                      ]}
                      onPress={() => setRouteType('homeToOffice')}
                    >
                      <View style={styles.routeIconContainer}>
                        <Home size={20} color={routeType === 'homeToOffice' ? colors.white : colors.primary} />
                      </View>
                      <View style={styles.routeTextContainer}>
                        <Text 
                          style={[
                            styles.routeOptionTitle,
                            routeType === 'homeToOffice' && styles.activeRouteOptionText,
                          ]}
                        >
                          Home to Office
                        </Text>
                        <Text 
                          style={[
                            styles.routeOptionDescription,
                            routeType === 'homeToOffice' && styles.activeRouteOptionDescription,
                          ]}
                        >
                          Morning commute
                        </Text>
                      </View>
                      {routeType === 'homeToOffice' && (
                        <View style={styles.activeIndicator} />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.routeOption,
                        routeType === 'officeToHome' && styles.activeRouteOption,
                      ]}
                      onPress={() => setRouteType('officeToHome')}
                    >
                      <View style={styles.routeIconContainer}>
                        <Briefcase size={20} color={routeType === 'officeToHome' ? colors.white : colors.primary} />
                      </View>
                      <View style={styles.routeTextContainer}>
                        <Text 
                          style={[
                            styles.routeOptionTitle,
                            routeType === 'officeToHome' && styles.activeRouteOptionText,
                          ]}
                        >
                          Office to Home
                        </Text>
                        <Text 
                          style={[
                            styles.routeOptionDescription,
                            routeType === 'officeToHome' && styles.activeRouteOptionDescription,
                          ]}
                        >
                          Evening commute
                        </Text>
                      </View>
                      {routeType === 'officeToHome' && (
                        <View style={styles.activeIndicator} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Maximum Detour</Text>
                  <Text style={styles.sectionDescription}>
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
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Food Type</Text>
                  
                  <View style={styles.foodTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.foodTypeOption,
                        foodType === 'both' && styles.activeFoodTypeOption,
                      ]}
                      onPress={() => setFoodType('both')}
                    >
                      <View style={styles.foodTypeIcon}>
                        <View style={styles.bothFoodIcon}>
                          <View style={styles.vegDot} />
                          <View style={styles.nonVegDot} />
                        </View>
                      </View>
                      <Text 
                        style={[
                          styles.foodTypeText,
                          foodType === 'both' && styles.activeFoodTypeText,
                        ]}
                      >
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
                      <View style={styles.foodTypeIcon}>
                        <Leaf size={16} color={foodType === 'vegetarian' ? colors.white : colors.vegetarian} />
                      </View>
                      <Text 
                        style={[
                          styles.foodTypeText,
                          foodType === 'vegetarian' && styles.vegFoodTypeText,
                        ]}
                      >
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
                      <View style={styles.foodTypeIcon}>
                        <Utensils size={16} color={foodType === 'non-vegetarian' ? colors.white : colors.nonVegetarian} />
                      </View>
                      <Text 
                        style={[
                          styles.foodTypeText,
                          foodType === 'non-vegetarian' && styles.nonVegFoodTypeText,
                        ]}
                      >
                        Non-Veg
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Search"
              onPress={handleApply}
              style={styles.applyButton}
              disabled={!hasRouteSettings}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Import missing components
const Home = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <MapPin size={size} color={color} />
  </View>
);

const Briefcase = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Navigation size={size} color={color} />
  </View>
);

const Leaf = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size/2, height: size/2, borderRadius: size/4, backgroundColor: color }} />
  </View>
);

const Utensils = ({ size, color }: { size: number; color: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <ArrowRight size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  routeOptions: {
    marginTop: 8,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',
  },
  activeRouteOption: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  routeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  activeRouteOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  routeOptionDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  activeRouteOptionDescription: {
    color: colors.primary,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sliderContainer: {
    marginTop: 8,
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
  foodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  foodTypeOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    width: '31%',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bothFoodIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.vegetarian,
    marginRight: 3,
  },
  nonVegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.nonVegetarian,
  },
  foodTypeText: {
    fontSize: 12,
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
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 2,
  },
  noRouteContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noRouteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  noRouteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  noRouteDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    width: '100%',
  },
});