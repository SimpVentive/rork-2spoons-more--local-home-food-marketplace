import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import { Search, MapPin, X, Route, Clock } from 'lucide-react-native';
import Input from '@/components/Input';
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
  const [routeType, setRouteType] = useState<'homeToOffice' | 'officeToHome'>('homeToOffice');
  const [maxDetour, setMaxDetour] = useState<number>(1000); // 1km default
  const [dishName, setDishName] = useState('');
  const [foodType, setFoodType] = useState<'vegetarian' | 'non-vegetarian' | 'both'>('both');
  const [isLoading, setIsLoading] = useState(false);

  const detourOptions = [
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' },
  ];

  const handleApply = async () => {
    setIsLoading(true);
    try {
      const params: RouteSearchParams = {
        routeType,
        maxDetour,
        dishName: dishName.trim() || undefined,
        foodType,
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onApply(params);
      handleClose();
    } catch (error) {
      console.error('Error applying route search:', error);
      Alert.alert('Error', 'Failed to search route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDishName('');
    setRouteType('homeToOffice');
    setMaxDetour(1000);
    setFoodType('both');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Search on My Route</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Route Type Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Route Type</Text>
                  <View style={styles.routeTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.routeTypeOption,
                        routeType === 'homeToOffice' && styles.activeRouteType,
                      ]}
                      onPress={() => setRouteType('homeToOffice')}
                    >
                      <Route size={20} color={routeType === 'homeToOffice' ? colors.white : colors.primary} />
                      <Text style={[
                        styles.routeTypeText,
                        routeType === 'homeToOffice' && styles.activeRouteTypeText,
                      ]}>
                        Home to Office
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.routeTypeOption,
                        routeType === 'officeToHome' && styles.activeRouteType,
                      ]}
                      onPress={() => setRouteType('officeToHome')}
                    >
                      <Route size={20} color={routeType === 'officeToHome' ? colors.white : colors.primary} />
                      <Text style={[
                        styles.routeTypeText,
                        routeType === 'officeToHome' && styles.activeRouteTypeText,
                      ]}>
                        Office to Home
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Max Detour Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Maximum Detour</Text>
                  <Text style={styles.sectionSubtitle}>
                    How far are you willing to go off your route?
                  </Text>
                  <View style={styles.detourContainer}>
                    {detourOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.detourOption,
                          maxDetour === option.value && styles.activeDetour,
                        ]}
                        onPress={() => setMaxDetour(option.value)}
                      >
                        <Text style={[
                          styles.detourText,
                          maxDetour === option.value && styles.activeDetourText,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dish Search */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Specific Dish (Optional)</Text>
                  <Input
                    value={dishName}
                    onChangeText={setDishName}
                    placeholder="e.g., Biryani, Pasta, Samosa..."
                    leftIcon={<Search size={20} color={colors.textLight} />}
                    style={styles.dishInput}
                  />
                </View>

                {/* Food Type Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Food Preference</Text>
                  <View style={styles.foodTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.foodTypeOption,
                        foodType === 'both' && styles.activeFoodType,
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
                        foodType === 'vegetarian' && styles.activeFoodType,
                      ]}
                      onPress={() => setFoodType('vegetarian')}
                    >
                      <Text style={[
                        styles.foodTypeText,
                        foodType === 'vegetarian' && styles.activeFoodTypeText,
                      ]}>
                        Vegetarian
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.foodTypeOption,
                        foodType === 'non-vegetarian' && styles.activeFoodType,
                      ]}
                      onPress={() => setFoodType('non-vegetarian')}
                    >
                      <Text style={[
                        styles.foodTypeText,
                        foodType === 'non-vegetarian' && styles.activeFoodTypeText,
                      ]}>
                        Non-Vegetarian
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Clock size={16} color={colors.info} />
                  <Text style={styles.infoText}>
                    We'll search for food available along your {routeType === 'homeToOffice' ? 'home to office' : 'office to home'} route within {maxDetour}m detour.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <Button
                  title="Cancel"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title={isLoading ? "Searching..." : "Search Route"}
                  onPress={handleApply}
                  disabled={isLoading}
                  style={styles.applyButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  routeTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  routeTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activeRouteType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  routeTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  activeRouteTypeText: {
    color: colors.white,
  },
  detourContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detourOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  activeDetour: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  detourText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeDetourText: {
    color: colors.white,
  },
  dishInput: {
    marginBottom: 0,
  },
  foodTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  foodTypeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  activeFoodType: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  foodTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeFoodTypeText: {
    color: colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});