import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, AlertTriangle, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useOrdersStore } from '@/store/orders-store';
import { useComplaintsStore } from '@/store/complaints-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';

const COMPLAINT_REASONS = [
  'Food quality issue',
  'Incorrect order',
  'Late delivery',
  'Hygiene concerns',
  'Quantity issues',
  'Packaging problems',
  'App technical issue',
  'Payment issue',
  'Seller behavior',
  'Other',
];

export default function FileComplaintScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { user } = useAuthStore();
  const { getOrderById, updateOrderStatus } = useOrdersStore();
  const { createComplaint } = useComplaintsStore();
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();
  
  const order = orderId ? getOrderById(orderId) : null;
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!reason) {
      newErrors.reason = 'Please select a reason for your complaint';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Please provide details about your complaint';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    try {
      await createComplaint({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        orderId: orderId || undefined,
        listingId: order?.listingId,
        sellerId: order?.sellerId,
        type: reason.toLowerCase().replace(/\s+/g, '_') as any,
        title: reason,
        description,
        priority: 'medium',
      });

      Alert.alert(
        'Complaint Submitted',
        'Your complaint has been submitted successfully. We will review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
      console.error('Complaint submission error:', error);
    }
  };
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to file a complaint</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>File a Complaint</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {order && (
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderInfoTitle}>Order Information</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Order ID:</Text>
            <Text style={styles.orderInfoValue}>{order.id}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Dish:</Text>
            <Text style={styles.orderInfoValue}>{order.listingSnapshot?.dishName || 'N/A'}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Seller:</Text>
            <Text style={styles.orderInfoValue}>{order.listingSnapshot?.sellerName || 'N/A'}</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderInfoLabel}>Date:</Text>
            <Text style={styles.orderInfoValue}>{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      )}
      
      {!order && (
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderInfoTitle}>General Complaint</Text>
          <Text style={styles.generalComplaintText}>
            You are filing a general complaint. Please provide details about your issue below.
          </Text>
        </View>
      )}
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Complaint Details</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reason for Complaint</Text>
          {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
          <View style={styles.reasonsContainer}>
            {COMPLAINT_REASONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.reasonItem,
                  reason === item && styles.selectedReasonItem,
                ]}
                onPress={() => setReason(item)}
              >
                <Text 
                  style={[
                    styles.reasonText,
                    reason === item && styles.selectedReasonText,
                  ]}
                >
                  {item}
                </Text>
                {reason === item && (
                  <Check size={16} color={colors.white} style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          <TextInput
            style={styles.descriptionInput}
            placeholder="Please provide details about your complaint..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            Please include specific details about the issue to help us resolve it quickly.
          </Text>
        </View>
        
        <View style={styles.warningContainer}>
          <AlertTriangle size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Filing false complaints may result in account restrictions. Please ensure all information is accurate.
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonsContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Submit Complaint"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
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
  orderInfoContainer: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  orderInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderInfoLabel: {
    width: 80,
    fontSize: 14,
    color: colors.textLight,
  },
  orderInfoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  formContainer: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedReasonItem: {
    backgroundColor: colors.primary,
  },
  reasonText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedReasonText: {
    color: colors.white,
  },
  checkIcon: {
    marginLeft: 4,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: `${colors.warning}10`,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 8,
  },
  backButton: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  generalComplaintText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});