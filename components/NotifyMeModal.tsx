import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Bell, X, MapPin, Navigation } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationsStore } from '@/store/notifications-store';
import Input from './Input';
import Button from './Button';
import colors from '@/constants/colors';
import { SOUTH_INDIAN_SUBCUISINES, SOUTH_INDIAN_CUISINES_FLAT } from '@/mocks/data';

interface NotifyMeModalProps {
  visible: boolean;
  onClose: () => void;
  initialDishName?: string;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  visible,
  onClose,
  initialDishName = '',
}) => {
  const { user } = useAuthStore();
  const { addDishNotification } = useNotificationsStore();
  
  const [dishName, setDishName] = useState(initialDishName);
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedSubCuisine, setSelectedSubCuisine] = useState<string | null>(null);
  const [routeType, setRouteType] = useState<'homeToOffice' | 'officeToHome' | null>(null);
  
  const handleSubmit = async () => {
    if (!dishName.trim() && !selectedCuisine) {
      Alert.alert('Error', 'Please enter a dish name or select a cuisine type');
      return;
    }
    
    if (!email.trim() && !phone.trim() && !user) {
      Alert.alert('Error', 'Please enter either email or phone number');
      return;
    }
    
    try {
      // Create notification
      await addDishNotification({
        userId: user?.id || 'guest',
        dishName: dishName.trim(),
        cuisineType: selectedCuisine || undefined,
        subcuisineType: selectedSubCuisine || undefined,
        location: location.trim() || undefined,
        routeType: routeType || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        isActive: true,
      });
      
      // Show success message
      Alert.alert(
        'Notification Set',
        `We'll notify you when ${dishName || selectedCuisine || 'matching dishes'} become${dishName ? 's' : ''} available${location ? ` in ${location}` : ''}${routeType ? ` on your ${routeType === 'homeToOffice' ? 'home to office' : 'office to home'} route` : ''}.`,
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to set notification. Please try again.');
    }
  };
  
  const handleClose = () => {
    // Reset form
    setDishName(initialDishName);
    setLocation('');
    setEmail('');
    setPhone('');
    setSelectedCuisine(null);
    setSelectedSubCuisine(null);
    setRouteType(null);
    onClose();
  };

  const handleCuisineSelect = (cuisine: string) => {
    if (selectedCuisine === cuisine) {
      setSelectedCuisine(null);
      setSelectedSubCuisine(null);
    } else {
      setSelectedCuisine(cuisine);
      setSelectedSubCuisine(null);
    }
  };

  const handleSubCuisineSelect = (subcuisine: string) => {
    if (selectedSubCuisine === subcuisine) {
      setSelectedSubCuisine(null);
    } else {
      setSelectedSubCuisine(subcuisine);
    }
  };

  const getAvailableSubcuisines = () => {
    if (!selectedCuisine) return [];
    
    // Check if the selected cuisine is a main category in South Indian subcuisines
    if (selectedCuisine in SOUTH_INDIAN_SUBCUISINES) {
      return SOUTH_INDIAN_SUBCUISINES[selectedCuisine as keyof typeof SOUTH_INDIAN_SUBCUISINES];
    }
    
    return [];
  };

  const hasRouteData = () => {
    if (!user) return false;
    
    if (routeType === 'homeToOffice') {
      return user.homeToOfficeRoute && user.homeToOfficeRoute.length > 0;
    } else if (routeType === 'officeToHome') {
      return user.officeToHomeRoute && user.officeToHomeRoute.length > 0;
    }
    
    return false;
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Bell size={24} color={colors.primary} />
                </View>
                <Text style={styles.title}>Notify Me</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.description}>
                Get notified when this dish or similar dishes become available in your area or on your route.
              </Text>
              
              <ScrollView style={styles.scrollContent}>
                <View style={styles.form}>
                  <Input
                    label="Dish Name (Optional if cuisine is selected)"
                    value={dishName}
                    onChangeText={setDishName}
                    placeholder="Enter dish name"
                    containerStyle={styles.inputContainer}
                  />
                  
                  <Text style={styles.sectionTitle}>South Indian Cuisine (Optional)</Text>
                  <View style={styles.cuisineContainer}>
                    {Object.keys(SOUTH_INDIAN_SUBCUISINES).map((cuisine) => (
                      <TouchableOpacity
                        key={cuisine}
                        style={[
                          styles.cuisineTag,
                          selectedCuisine === cuisine && styles.selectedCuisineTag
                        ]}
                        onPress={() => handleCuisineSelect(cuisine)}
                      >
                        <Text style={[
                          styles.cuisineTagText,
                          selectedCuisine === cuisine && styles.selectedCuisineTagText
                        ]}>
                          {cuisine}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {selectedCuisine && getAvailableSubcuisines().length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Sub-Cuisine (Optional)</Text>
                      <View style={styles.cuisineContainer}>
                        {getAvailableSubcuisines().map((subcuisine) => (
                          <TouchableOpacity
                            key={subcuisine}
                            style={[
                              styles.cuisineTag,
                              selectedSubCuisine === subcuisine && styles.selectedCuisineTag
                            ]}
                            onPress={() => handleSubCuisineSelect(subcuisine)}
                          >
                            <Text style={[
                              styles.cuisineTagText,
                              selectedSubCuisine === subcuisine && styles.selectedCuisineTagText
                            ]}>
                              {subcuisine}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                  
                  {user && (
                    <>
                      <Text style={styles.sectionTitle}>Notify me on my route (Optional)</Text>
                      <View style={styles.routeContainer}>
                        <TouchableOpacity
                          style={[
                            styles.routeOption,
                            routeType === 'homeToOffice' && styles.selectedRouteOption
                          ]}
                          onPress={() => setRouteType(routeType === 'homeToOffice' ? null : 'homeToOffice')}
                        >
                          <Navigation size={16} color={routeType === 'homeToOffice' ? colors.white : colors.primary} />
                          <Text style={[
                            styles.routeOptionText,
                            routeType === 'homeToOffice' && styles.selectedRouteOptionText
                          ]}>
                            Home to Office
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[
                            styles.routeOption,
                            routeType === 'officeToHome' && styles.selectedRouteOption
                          ]}
                          onPress={() => setRouteType(routeType === 'officeToHome' ? null : 'officeToHome')}
                        >
                          <Navigation size={16} color={routeType === 'officeToHome' ? colors.white : colors.primary} />
                          <Text style={[
                            styles.routeOptionText,
                            routeType === 'officeToHome' && styles.selectedRouteOptionText
                          ]}>
                            Office to Home
                          </Text>
                        </TouchableOpacity>
                      </View>
                      
                      {routeType && !hasRouteData() && (
                        <Text style={styles.routeWarning}>
                          You haven't set up your {routeType === 'homeToOffice' ? 'home to office' : 'office to home'} route yet. Please set it up in your profile settings.
                        </Text>
                      )}
                    </>
                  )}
                  
                  <Text style={styles.orText}>- OR -</Text>
                  
                  <Input
                    label="Location (Optional)"
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter your location"
                    containerStyle={styles.inputContainer}
                    leftIcon={<MapPin size={20} color={colors.textLight} />}
                  />
                  
                  {!user && (
                    <>
                      <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        containerStyle={styles.inputContainer}
                      />
                      
                      <Input
                        label="Phone Number (Optional)"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        containerStyle={styles.inputContainer}
                      />
                    </>
                  )}
                  
                  <Button
                    title="Notify Me"
                    onPress={handleSubmit}
                    style={styles.button}
                  />
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 450 : '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scrollContent: {
    maxHeight: 500,
  },
  form: {
    padding: 16,
    gap: 12,
  },
  inputContainer: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cuisineTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCuisineTag: {
    backgroundColor: colors.primary,
  },
  cuisineTagText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCuisineTagText: {
    color: colors.white,
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedRouteOption: {
    backgroundColor: colors.primary,
  },
  routeOptionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  selectedRouteOptionText: {
    color: colors.white,
  },
  routeWarning: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
    marginBottom: 8,
  },
  orText: {
    textAlign: 'center',
    color: colors.textLight,
    marginVertical: 8,
  },
  button: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
});

export default NotifyMeModal;