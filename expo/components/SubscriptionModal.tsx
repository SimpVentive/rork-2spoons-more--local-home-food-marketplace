import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Check, CreditCard } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { SUBSCRIPTION_PLANS } from '@/mocks/data';
import Button from './Button';
import colors from '@/constants/colors';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ visible, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { updateSubscription } = useAuthStore();
  
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set expiry date to 1 year from now
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Update subscription in store
      await updateSubscription(selectedPlan, expiryDate.toISOString());
      
      Alert.alert(
        'Subscription Successful',
        `You have successfully subscribed to the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose a Subscription Plan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Upgrade your account to post more dishes and reach more customers
          </Text>
          
          <ScrollView style={styles.plansContainer}>
            {SUBSCRIPTION_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlanCard
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>
                      ₹{plan.price}/{plan.duration}
                    </Text>
                  </View>
                  
                  {selectedPlan === plan.id && (
                    <View style={styles.checkmark}>
                      <Check size={16} color={colors.white} />
                    </View>
                  )}
                </View>
                
                <Text style={styles.planDescription}>{plan.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <View style={styles.featureBullet}>
                        <Check size={12} color={colors.primary} />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.footer}>
            <Text style={styles.secureText}>
              <CreditCard size={14} color={colors.textLight} /> Secure payment processing
            </Text>
            
            <Button
              title={isProcessing ? "Processing..." : "Subscribe Now"}
              onPress={handleSubscribe}
              disabled={!selectedPlan || isProcessing}
              isLoading={isProcessing}
              style={styles.subscribeButton}
            />
            
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    width: Platform.OS === 'web' ? 500 : '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  plansContainer: {
    padding: 16,
    maxHeight: 400,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedPlanCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  secureText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeButton: {
    width: '100%',
    marginBottom: 12,
  },
  cancelText: {
    fontSize: 14,
    color: colors.textLight,
    padding: 8,
  },
});

export default SubscriptionModal;