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
} from 'react-native';
import { Bell, X } from 'lucide-react-native';
import Input from './Input';
import Button from './Button';
import colors from '@/constants/colors';

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
  
  const handleSubmit = () => {
    if (!dishName.trim()) {
      Alert.alert('Error', 'Please enter a dish name');
      return;
    }
    
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Error', 'Please enter either email or phone number');
      return;
    }
    
    // In a real app, we would send this data to the server
    Alert.alert(
      'Notification Set',
      `We'll notify you when ${dishName} becomes available${location ? ` in ${location}` : ''}.`,
      [{ text: 'OK', onPress: handleClose }]
    );
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
                Get notified when this dish or similar dishes become available in your area.
              </Text>
              
              <View style={styles.form}>
                <Input
                  label="Dish Name"
                  value={dishName}
                  onChangeText={setDishName}
                  placeholder="Enter dish name"
                  containerStyle={styles.inputContainer}
                />
                
                <Input
                  label="Location (Optional)"
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter your location"
                  containerStyle={styles.inputContainer}
                />
                
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
                
                <Button
                  title="Notify Me"
                  onPress={handleSubmit}
                  style={styles.button}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 400 : '90%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    marginBottom: 0,
  },
  button: {
    marginTop: 8,
  },
});

export default NotifyMeModal;