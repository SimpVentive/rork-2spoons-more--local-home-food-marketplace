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
  TextInput,
} from 'react-native';
import { Bell, X, MapPin } from 'lucide-react-native';

const colors = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  background: '#F8F9FA',
  white: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#E9ECEF',
  card: '#FFFFFF',
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
};

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
  const [dishName, setDishName] = useState(initialDishName);
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = async () => {
    if (!dishName.trim()) {
      Alert.alert('Error', 'Please enter a dish name');
      return;
    }
    
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Error', 'Please enter either email or phone number');
      return;
    }
    
    try {
      // Show success message
      Alert.alert(
        'Notification Set',
        `We'll notify you when ${dishName} becomes available${location ? ` in ${location}` : ''}.`,
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
    onClose();
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
                Get notified when this dish becomes available in your area.
              </Text>
              
              <ScrollView style={styles.scrollContent}>
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Dish Name</Text>
                    <TextInput
                      style={styles.input}
                      value={dishName}
                      onChangeText={setDishName}
                      placeholder="Enter dish name"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Location (Optional)</Text>
                    <View style={styles.inputWithIcon}>
                      <MapPin size={20} color={colors.textLight} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.inputWithIconText]}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter your location"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone Number (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                  
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>Notify Me</Text>
                  </TouchableOpacity>
                  
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
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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