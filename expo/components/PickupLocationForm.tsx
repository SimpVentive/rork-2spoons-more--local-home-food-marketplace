import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { X, MapPin, Clock } from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';
import { useThemeColors } from '@/utils/theme';
import { PickupLocation } from '@/types';
import Button from './Button';

interface PickupLocationFormProps {
  location?: PickupLocation;
  onSave: (location: PickupLocation) => void;
  onCancel: () => void;
}

const LOCATION_TYPES = [
  { id: 'home', label: '🏠 Home', description: 'Your residence' },
  { id: 'custom', label: '📍 Custom Location', description: 'Any custom address' },
  { id: 'restaurant', label: '🍽️ Restaurant', description: 'Restaurant or food court' },
  { id: 'other', label: '📌 Other', description: 'Other location' },
];

export const PickupLocationForm: React.FC<PickupLocationFormProps> = ({
  location,
  onSave,
  onCancel,
}) => {
  const colors = useThemeColors();
  const [selectedType, setSelectedType] = useState<string>(location?.type || 'home');
  const [name, setName] = useState(location?.name || '');
  const [street, setStreet] = useState(location?.address?.street || '');
  const [city, setCity] = useState(location?.address?.city || '');
  const [state, setState] = useState(location?.address?.state || '');
  const [zipCode, setZipCode] = useState(location?.address?.zipCode || '');
  const [country, setCountry] = useState(location?.address?.country || 'India');
  const [timeStart, setTimeStart] = useState(location?.pickupTimeStart || '09:00');
  const [timeEnd, setTimeEnd] = useState(location?.pickupTimeEnd || '18:00');
  const [instructions, setInstructions] = useState(location?.instructions || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Location name is required';
    if (!street.trim()) newErrors.street = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    // Validate times
    const startTime = parseInt(timeStart.replace(':', ''));
    const endTime = parseInt(timeEnd.replace(':', ''));
    if (startTime >= endTime) {
      newErrors.time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    const fullAddress = `${street}, ${city}, ${state} ${zipCode}, ${country}`;

    const newLocation: PickupLocation = {
      id: location?.id || `pickup_${Date.now()}`,
      listingId: location?.listingId || '',
      type: selectedType as 'home' | 'custom' | 'restaurant' | 'other',
      name,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
        fullAddress,
      },
      coordinates: location?.coordinates || { latitude: 0, longitude: 0 }, // Will be set by Google Maps
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`,
      pickupTimeStart: timeStart,
      pickupTimeEnd: timeEnd,
      instructions: instructions.trim() || undefined,
      isAvailable: location?.isAvailable !== false,
      createdAt: location?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newLocation);
  };

  const getLocationTypeObj = () => LOCATION_TYPES.find((t) => t.id === selectedType);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Type Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location Type</Text>
        <View style={styles.typeSelector}>
          {LOCATION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    selectedType === type.id ? designTokens.colors.primary : colors.card,
                  borderColor:
                    selectedType === type.id ? designTokens.colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
              accessible={true}
              accessibilityLabel={type.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedType === type.id }}
            >
              <Text
                style={[
                  styles.typeLabel,
                  {
                    color:
                      selectedType === type.id ? designTokens.colors.white : colors.text,
                  },
                ]}
              >
                {type.label}
              </Text>
              <Text
                style={[
                  styles.typeDescription,
                  {
                    color:
                      selectedType === type.id ? designTokens.colors.white : colors.textLight,
                  },
                ]}
              >
                {type.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location Name */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Location Name *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: errors.name ? designTokens.colors.error : colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g., My House, Downtown Office"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
          accessible={true}
          accessibilityLabel="Location name"
          accessibilityHint="Enter a descriptive name for this location"
        />
        {errors.name && (
          <Text style={[styles.errorText, { color: designTokens.colors.error }]}>
            {errors.name}
          </Text>
        )}
      </View>

      {/* Address Fields */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Address</Text>

        {/* Street */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Street Address *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: errors.street ? designTokens.colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Street address"
            placeholderTextColor={colors.textLight}
            value={street}
            onChangeText={setStreet}
          />
          {errors.street && (
            <Text style={[styles.errorText, { color: designTokens.colors.error }]}>
              {errors.street}
            </Text>
          )}
        </View>

        {/* City & State Row */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: designTokens.spacing.md }]}>
            <Text style={[styles.label, { color: colors.text }]}>City *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.city ? designTokens.colors.error : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="City"
              placeholderTextColor={colors.textLight}
              value={city}
              onChangeText={setCity}
            />
            {errors.city && (
              <Text style={[styles.errorText, { color: designTokens.colors.error }]}>
                {errors.city}
              </Text>
            )}
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.text }]}>State *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.state ? designTokens.colors.error : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="State"
              placeholderTextColor={colors.textLight}
              value={state}
              onChangeText={setState}
            />
            {errors.state && (
              <Text style={[styles.errorText, { color: designTokens.colors.error }]}>
                {errors.state}
              </Text>
            )}
          </View>
        </View>

        {/* ZIP Code */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>ZIP Code *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: errors.zipCode ? designTokens.colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder="PIN code / ZIP"
            placeholderTextColor={colors.textLight}
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
          />
          {errors.zipCode && (
            <Text style={[styles.errorText, { color: designTokens.colors.error }]}>
              {errors.zipCode}
            </Text>
          )}
        </View>

        {/* Country */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Country</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Country"
            placeholderTextColor={colors.textLight}
            value={country}
            onChangeText={setCountry}
          />
        </View>
      </View>

      {/* Time Window */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pickup Time Window</Text>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: designTokens.spacing.md }]}>
            <Text style={[styles.label, { color: colors.text }]}>Start Time</Text>
            <View style={styles.timeInputContainer}>
              <Clock size={16} color={colors.textLight} />
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                placeholder="09:00"
                placeholderTextColor={colors.textLight}
                value={timeStart}
                onChangeText={setTimeStart}
                maxLength={5}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.text }]}>End Time</Text>
            <View style={styles.timeInputContainer}>
              <Clock size={16} color={colors.textLight} />
              <TextInput
                style={[
                  styles.timeInput,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                  },
                ]}
                placeholder="18:00"
                placeholderTextColor={colors.textLight}
                value={timeEnd}
                onChangeText={setTimeEnd}
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {errors.time && (
          <Text style={[styles.errorText, { color: designTokens.colors.error }]}>
            {errors.time}
          </Text>
        )}

        <Text style={[styles.timeHint, { color: colors.textLight }]}>
          Format: HH:MM (24-hour format, e.g., 09:00 for 9 AM)
        </Text>
      </View>

      {/* Special Instructions */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Special Instructions (Optional)</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="e.g., Ring the doorbell twice, Park at back entrance"
          placeholderTextColor={colors.textLight}
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onCancel}
          accessible={true}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>

        <Button
          title={location ? 'Update Location' : 'Add Location'}
          onPress={handleSave}
          style={{ flex: 1 }}
          accessibilityLabel={location ? 'Update location' : 'Add new location'}
        />
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: designTokens.spacing['2xl'] }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: designTokens.spacing.lg,
  },

  section: {
    marginBottom: designTokens.spacing.lg,
  },

  sectionTitle: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.md,
  },

  label: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
    marginBottom: designTokens.spacing.sm,
  },

  typeSelector: {
    gap: designTokens.spacing.sm,
  },

  typeButton: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.radius.md,
    borderWidth: 2,
  },

  typeLabel: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  typeDescription: {
    fontSize: designTokens.typography.size.xs,
  },

  input: {
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    fontSize: designTokens.typography.size.base,
    minHeight: 44,
  },

  errorText: {
    fontSize: designTokens.typography.size.xs,
    marginTop: designTokens.spacing.xs,
    fontWeight: designTokens.typography.weight.semibold,
  },

  fieldGroup: {
    marginBottom: designTokens.spacing.md,
  },

  row: {
    flexDirection: 'row',
    marginBottom: designTokens.spacing.md,
  },

  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    paddingHorizontal: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },

  timeInput: {
    flex: 1,
    paddingVertical: designTokens.spacing.md,
    fontSize: designTokens.typography.size.base,
    minHeight: 44,
  },

  timeHint: {
    fontSize: designTokens.typography.size.xs,
    marginTop: designTokens.spacing.sm,
  },

  textArea: {
    borderWidth: 1,
    borderRadius: designTokens.radius.md,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    fontSize: designTokens.typography.size.base,
    minHeight: 100,
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

export default PickupLocationForm;
