import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { CheckCircle, AlertCircle, DollarSign } from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';
import { useThemeColors } from '@/utils/theme';
import Button from './Button';

interface CODConfirmationPopupProps {
  visible: boolean;
  orderId: string;
  buyerName: string;
  dishName: string;
  amount: number;
  pickupLocation: string;
  onConfirm: (orderId: string, amount: number) => void;
  onDeny: (orderId: string, reason?: string) => void;
  onCancel?: () => void;
}

type Stage = 'question' | 'confirm' | 'deny';

export const CODConfirmationPopup: React.FC<CODConfirmationPopupProps> = ({
  visible,
  orderId,
  buyerName,
  dishName,
  amount,
  pickupLocation,
  onConfirm,
  onDeny,
  onCancel,
}) => {
  const colors = useThemeColors();
  const [stage, setStage] = useState<Stage>('question');
  const [denialReason, setDenialReason] = useState('');

  const handleConfirm = () => {
    onConfirm(orderId, amount);
    handleReset();
  };

  const handleDeny = () => {
    if (!denialReason.trim()) {
      Alert.alert('Reason Required', 'Please tell us why the dish was not sold');
      return;
    }
    onDeny(orderId, denialReason);
    handleReset();
  };

  const handleReset = () => {
    setStage('question');
    setDenialReason('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Question Stage */}
          {stage === 'question' && (
            <>
              {/* Header with Icon */}
              <View style={styles.iconContainer}>
                <AlertCircle size={48} color={designTokens.colors.warning} />
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: colors.text }]}>
                Pickup Complete?
              </Text>

              {/* Description */}
              <Text style={[styles.description, { color: colors.textLight }]}>
                Has the dish been picked up and payment received?
              </Text>

              {/* Order Details */}
              <View
                style={[
                  styles.detailsBox,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <DetailRow label="Dish" value={dishName} colors={colors} />
                <DetailRow label="Buyer" value={buyerName} colors={colors} />
                <DetailRow label="Location" value={pickupLocation} colors={colors} />
                <DetailRow
                  label="Amount"
                  value={`₹${amount}`}
                  colors={colors}
                  highlight={true}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.denyButton,
                    {
                      backgroundColor: designTokens.colors.error,
                      opacity: 0.1,
                      borderColor: designTokens.colors.error,
                    },
                  ]}
                  onPress={() => setStage('deny')}
                  accessible={true}
                  accessibilityLabel="Dish was not sold"
                  accessibilityRole="button"
                >
                  <Text style={[styles.denyButtonText, { color: designTokens.colors.error }]}>
                    ✕ Not Sold
                  </Text>
                </TouchableOpacity>

                <Button
                  title="✓ Sold & Paid"
                  onPress={() => setStage('confirm')}
                  variant="primary"
                  style={{ flex: 1 }}
                  accessibilityLabel="Dish was sold and payment received"
                />
              </View>
            </>
          )}

          {/* Confirm Stage */}
          {stage === 'confirm' && (
            <>
              <View style={styles.iconContainer}>
                <CheckCircle size={48} color={designTokens.colors.success} />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                Confirm Payment
              </Text>

              <Text style={[styles.description, { color: colors.textLight }]}>
                Please review the amount before confirming
              </Text>

              {/* Amount Display */}
              <View
                style={[
                  styles.amountBox,
                  {
                    backgroundColor: designTokens.colors.success,
                    opacity: 0.1,
                  },
                ]}
              >
                <DollarSign size={24} color={designTokens.colors.success} />
                <Text
                  style={[
                    styles.amountText,
                    {
                      color: designTokens.colors.success,
                    },
                  ]}
                >
                  ₹{amount}
                </Text>
              </View>

              <Text style={[styles.confirmNote, { color: colors.textLight }]}>
                This amount will be credited to your wallet upon confirmation.
              </Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setStage('question')}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    Go Back
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Confirm Payment"
                  onPress={handleConfirm}
                  variant="primary"
                  style={{ flex: 1 }}
                  accessibilityLabel="Confirm payment received"
                />
              </View>
            </>
          )}

          {/* Deny Stage */}
          {stage === 'deny' && (
            <>
              <View style={styles.iconContainer}>
                <AlertCircle size={48} color={designTokens.colors.error} />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                Why Wasn't It Sold?
              </Text>

              <Text style={[styles.description, { color: colors.textLight }]}>
                Please let us know why the dish wasn't sold
              </Text>

              {/* Reason Input */}
              <TextInput
                style={[
                  styles.reasonInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g., Buyer didn't show up, ran out of stock, etc."
                placeholderTextColor={colors.textLight}
                value={denialReason}
                onChangeText={setDenialReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessible={true}
                accessibilityLabel="Reason for not selling"
                accessibilityHint="Enter why the dish was not sold"
              />

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setStage('question')}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                    Go Back
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Submit"
                  onPress={handleDeny}
                  variant="danger"
                  style={{ flex: 1 }}
                  accessibilityLabel="Submit denial reason"
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  colors: any;
  highlight?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, colors, highlight }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: colors.textLight }]}>{label}</Text>
    <Text
      style={[
        styles.detailValue,
        {
          color: highlight ? designTokens.colors.primary : colors.text,
          fontWeight: highlight ? designTokens.typography.weight.bold : designTokens.typography.weight.normal,
        },
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: designTokens.spacing.lg,
  },

  container: {
    borderRadius: designTokens.radius['2xl'],
    padding: designTokens.spacing.lg,
    maxWidth: 400,
    width: '100%',
    ...designTokens.shadows.lg,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  title: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    textAlign: 'center',
    marginBottom: designTokens.spacing.md,
  },

  description: {
    fontSize: designTokens.typography.size.base,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  detailsBox: {
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    padding: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: designTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  detailLabel: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.medium,
  },

  detailValue: {
    fontSize: designTokens.typography.size.sm,
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
    marginBottom: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },

  amountText: {
    fontSize: designTokens.typography.size['2xl'],
    fontWeight: designTokens.typography.weight.bold,
  },

  confirmNote: {
    fontSize: designTokens.typography.size.sm,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    fontStyle: 'italic',
  },

  reasonInput: {
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    fontSize: designTokens.typography.size.base,
    minHeight: 100,
    marginBottom: designTokens.spacing.lg,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
  },

  denyButton: {
    flex: 1,
    paddingVertical: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  denyButtonText: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },
});

export default CODConfirmationPopup;
