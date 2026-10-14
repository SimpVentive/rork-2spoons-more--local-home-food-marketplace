import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Clock, DollarSign, AlertCircle, Info } from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';
import { useThemeColors } from '@/utils/theme';
import { CODDetails } from '@/types';
import Button from './Button';

interface CODPaymentSetupProps {
  codDetails?: CODDetails;
  onSave: (codDetails: CODDetails) => void;
  onCancel: () => void;
}

export const CODPaymentSetup: React.FC<CODPaymentSetupProps> = ({
  codDetails,
  onSave,
  onCancel,
}) => {
  const colors = useThemeColors();
  const [codEnabled, setCodEnabled] = useState(codDetails?.enabled || false);
  const [timeWindowStart, setTimeWindowStart] = useState(
    codDetails?.pickupTimeWindowStart || '14:00'
  );
  const [timeWindowEnd, setTimeWindowEnd] = useState(codDetails?.pickupTimeWindowEnd || '14:30');
  const [confirmationTimeout, setConfirmationTimeout] = useState(
    codDetails?.confirmationTimeoutMinutes || 5
  );

  const handleSave = () => {
    if (codEnabled) {
      // Validate times
      const startTime = parseInt(timeWindowStart.replace(':', ''));
      const endTime = parseInt(timeWindowEnd.replace(':', ''));

      if (startTime >= endTime) {
        Alert.alert(
          'Invalid Time Window',
          'End time must be after start time. Please correct it.'
        );
        return;
      }

      if (confirmationTimeout < 1 || confirmationTimeout > 30) {
        Alert.alert(
          'Invalid Timeout',
          'Confirmation timeout must be between 1 and 30 minutes.'
        );
        return;
      }
    }

    const newCodDetails: CODDetails = {
      enabled: codEnabled,
      pickupTimeWindowStart: timeWindowStart,
      pickupTimeWindowEnd: timeWindowEnd,
      confirmationTimeoutMinutes: confirmationTimeout,
    };

    onSave(newCodDetails);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💳 Payment Options</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Enable Cash on Delivery payment method
        </Text>
      </View>

      {/* COD Toggle */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: codEnabled ? designTokens.colors.primary : colors.border,
            borderWidth: codEnabled ? 2 : 1,
          },
        ]}
      >
        <View style={styles.toggleHeader}>
          <View>
            <Text style={[styles.toggleTitle, { color: colors.text }]}>
              Cash on Delivery (COD)
            </Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textLight }]}>
              Buyers pay when picking up
            </Text>
          </View>
          <Switch
            value={codEnabled}
            onValueChange={setCodEnabled}
            trackColor={{ false: colors.border, true: designTokens.colors.secondary }}
            thumbColor={codEnabled ? designTokens.colors.primary : colors.textLight}
            accessible={true}
            accessibilityLabel="Enable Cash on Delivery"
            accessibilityRole="switch"
            accessibilityState={{ checked: codEnabled }}
          />
        </View>
      </View>

      {/* COD Configuration */}
      {codEnabled && (
        <View style={styles.configSection}>
          {/* Info Box */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: designTokens.colors.info,
                opacity: 0.1,
              },
            ]}
          >
            <Info size={16} color={designTokens.colors.info} />
            <Text style={[styles.infoText, { color: designTokens.colors.info }]}>
              After the pickup time window ends, you'll get a popup asking if the dish was sold.
            </Text>
          </View>

          {/* Pickup Time Window */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={designTokens.colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pickup Time Window
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textLight }]}>
              Set when customers can pick up the dish
            </Text>

            <View style={styles.timeContainer}>
              <View style={styles.timeField}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>Start Time</Text>
                <View
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.timeValue, { color: colors.text }]}>
                    {timeWindowStart}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: designTokens.colors.primary }]}
                  onPress={() => {
                    // Time picker - simplified for demo
                    const hours = Math.floor(Math.random() * 24)
                      .toString()
                      .padStart(2, '0');
                    const minutes = '00';
                    setTimeWindowStart(`${hours}:${minutes}`);
                  }}
                >
                  <Text style={styles.timeButtonText}>Set</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeField}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>End Time</Text>
                <View
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.timeValue, { color: colors.text }]}>{timeWindowEnd}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.timeButton, { backgroundColor: designTokens.colors.primary }]}
                  onPress={() => {
                    const hours = Math.floor(Math.random() * 24)
                      .toString()
                      .padStart(2, '0');
                    const minutes = '00';
                    setTimeWindowEnd(`${hours}:${minutes}`);
                  }}
                >
                  <Text style={styles.timeButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.hint, { color: colors.textLight }]}>
              Example: 2:00 PM - 2:30 PM for a 30-minute pickup window
            </Text>
          </View>

          {/* Confirmation Timeout */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={designTokens.colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Confirmation Timeout
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textLight }]}>
              Minutes after pickup time ends to show payment confirmation popup
            </Text>

            <View
              style={[
                styles.timeoutDisplay,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.minusButton}
                onPress={() => {
                  if (confirmationTimeout > 1) setConfirmationTimeout(confirmationTimeout - 1);
                }}
                disabled={confirmationTimeout <= 1}
              >
                <Text style={{ fontSize: 20, color: designTokens.colors.primary }}>−</Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.timeoutValue,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {confirmationTimeout} min
              </Text>

              <TouchableOpacity
                style={styles.plusButton}
                onPress={() => {
                  if (confirmationTimeout < 30) setConfirmationTimeout(confirmationTimeout + 1);
                }}
                disabled={confirmationTimeout >= 30}
              >
                <Text style={{ fontSize: 20, color: designTokens.colors.primary }}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.hint, { color: colors.textLight }]}>
              Default: 5 minutes (recommended)
            </Text>
          </View>

          {/* Workflow Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Workflow Preview</Text>

            <View style={styles.workflowSteps}>
              <WorkflowStep
                number="1"
                title="Pickup Window"
                description={`${timeWindowStart} - ${timeWindowEnd}`}
                colors={colors}
              />
              <View
                style={[
                  styles.workflowArrow,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />
              <WorkflowStep
                number="2"
                title="Wait"
                description={`${confirmationTimeout} minutes after window ends`}
                colors={colors}
              />
              <View
                style={[
                  styles.workflowArrow,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />
              <WorkflowStep
                number="3"
                title="Confirm"
                description="Popup: Did you receive payment?"
                colors={colors}
              />
              <View
                style={[
                  styles.workflowArrow,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />
              <WorkflowStep
                number="4"
                title="Credited"
                description="Amount added to wallet"
                colors={colors}
              />
            </View>
          </View>

          {/* Important Notes */}
          <View
            style={[
              styles.notesBox,
              {
                backgroundColor: designTokens.colors.warning,
                opacity: 0.1,
              },
            ]}
          >
            <AlertCircle size={16} color={designTokens.colors.warning} />
            <View>
              <Text style={[styles.noteTitle, { color: designTokens.colors.warning }]}>
                Important
              </Text>
              <Text style={[styles.noteText, { color: designTokens.colors.text }]}>
                • Only enable COD if you can collect payment at pickup{'\n'}
                • Be honest about whether the dish was sold{'\n'}
                • Confirm only if you received full payment
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <Button
          title="Save Payment Settings"
          onPress={handleSave}
          style={{ flex: 1 }}
          accessibilityLabel="Save payment settings"
        />
      </View>

      <View style={{ height: designTokens.spacing['2xl'] }} />
    </ScrollView>
  );
};

interface WorkflowStepProps {
  number: string;
  title: string;
  description: string;
  colors: any;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ number, title, description, colors }) => (
  <View style={styles.workflowStep}>
    <View style={[styles.stepNumber, { backgroundColor: designTokens.colors.primary }]}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.stepDescription, { color: colors.textLight }]}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: designTokens.spacing.lg,
  },

  header: {
    marginBottom: designTokens.spacing.lg,
  },

  title: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.sm,
  },

  subtitle: {
    fontSize: designTokens.typography.size.sm,
  },

  card: {
    borderRadius: designTokens.radius.lg,
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.lg,
    ...designTokens.shadows.md,
  },

  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  toggleTitle: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  toggleSubtitle: {
    fontSize: designTokens.typography.size.sm,
  },

  configSection: {
    marginBottom: designTokens.spacing.lg,
  },

  infoBox: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.radius.md,
    marginBottom: designTokens.spacing.lg,
  },

  infoText: {
    flex: 1,
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.medium,
  },

  section: {
    marginBottom: designTokens.spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  sectionTitle: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  label: {
    fontSize: designTokens.typography.size.sm,
    marginBottom: designTokens.spacing.md,
  },

  timeContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  timeField: {
    flex: 1,
    alignItems: 'center',
  },

  timeLabel: {
    fontSize: designTokens.typography.size.xs,
    fontWeight: designTokens.typography.weight.semibold,
    marginBottom: designTokens.spacing.sm,
  },

  timeInput: {
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
    width: '100%',
  },

  timeValue: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  timeButton: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.radius.md,
    width: '100%',
    alignItems: 'center',
  },

  timeButtonText: {
    color: designTokens.colors.white,
    fontWeight: designTokens.typography.weight.bold,
  },

  timeoutDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  minusButton: {
    padding: designTokens.spacing.sm,
  },

  plusButton: {
    padding: designTokens.spacing.sm,
  },

  timeoutValue: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
  },

  hint: {
    fontSize: designTokens.typography.size.xs,
    marginTop: designTokens.spacing.sm,
    fontStyle: 'italic',
  },

  workflowSteps: {
    alignItems: 'center',
  },

  workflowStep: {
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },

  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },

  stepNumberText: {
    color: designTokens.colors.white,
    fontWeight: designTokens.typography.weight.bold,
    fontSize: designTokens.typography.size.lg,
  },

  stepTitle: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.semibold,
  },

  stepDescription: {
    fontSize: designTokens.typography.size.sm,
    marginTop: designTokens.spacing.xs,
  },

  workflowArrow: {
    width: 2,
    height: 30,
    marginVertical: designTokens.spacing.sm,
  },

  notesBox: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.radius.md,
    marginTop: designTokens.spacing.lg,
  },

  noteTitle: {
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  noteText: {
    fontSize: designTokens.typography.size.sm,
    lineHeight: 20,
  },

  buttonGroup: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.lg,
  },

  cancelButton: {
    paddingVertical: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },

  cancelButtonText: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },
});

export default CODPaymentSetup;
