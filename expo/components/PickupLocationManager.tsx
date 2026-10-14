import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { MapPin, Clock, Plus, Edit3, Trash2, CheckCircle, MapIcon } from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';
import { useThemeColors } from '@/utils/theme';
import { PickupLocation } from '@/types';

interface PickupLocationManagerProps {
  locations: PickupLocation[];
  onAddLocation: (location: PickupLocation) => void;
  onEditLocation: (location: PickupLocation) => void;
  onDeleteLocation: (locationId: string) => void;
  onSetPrimary?: (locationId: string) => void;
  primaryLocationId?: string;
}

export const PickupLocationManager: React.FC<PickupLocationManagerProps> = ({
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onSetPrimary,
  primaryLocationId,
}) => {
  const colors = useThemeColors();
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDeleteLocation = (locationId: string) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to remove this pickup location?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => onDeleteLocation(locationId),
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditLocation = (location: PickupLocation) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      home: '🏠 Home',
      custom: '📍 Custom Location',
      restaurant: '🍽️ Restaurant',
      other: '📌 Other',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      home: designTokens.colors.primary,
      custom: designTokens.colors.secondary,
      restaurant: designTokens.colors.info,
      other: designTokens.colors.textLight,
    };
    return typeColors[type] || colors.primary;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>📍 Pickup Locations</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Add multiple pickup points for your listing
        </Text>
      </View>

      {/* Locations List */}
      {locations.length > 0 ? (
        <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
          {locations.map((location, index) => (
            <View
              key={location.id}
              style={[
                styles.locationCard,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    primaryLocationId === location.id ? designTokens.colors.primary : colors.border,
                  borderWidth: primaryLocationId === location.id ? 2 : 1,
                },
              ]}
            >
              {/* Primary Badge */}
              {primaryLocationId === location.id && (
                <View style={styles.primaryBadge}>
                  <CheckCircle size={14} color={designTokens.colors.white} />
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}

              {/* Location Type & Name */}
              <View style={styles.locationHeader}>
                <Text style={[styles.locationType, { color: getTypeColor(location.type) }]}>
                  {getTypeLabel(location.type)}
                </Text>
                <Text style={[styles.locationName, { color: colors.text }]}>{location.name}</Text>
              </View>

              {/* Address */}
              <View style={styles.infoRow}>
                <MapPin size={16} color={colors.textLight} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {location.address.fullAddress}
                </Text>
              </View>

              {/* Time Window */}
              <View style={styles.infoRow}>
                <Clock size={16} color={colors.textLight} />
                <Text style={[styles.infoText, { color: colors.text }]}>
                  {location.pickupTimeStart} - {location.pickupTimeEnd}
                </Text>
              </View>

              {/* Instructions (if any) */}
              {location.instructions && (
                <View style={styles.instructionsBox}>
                  <Text style={[styles.instructionsLabel, { color: colors.textLight }]}>
                    Instructions:
                  </Text>
                  <Text style={[styles.instructionsText, { color: colors.text }]}>
                    {location.instructions}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {onSetPrimary && primaryLocationId !== location.id && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.setAsPrimaryButton]}
                    onPress={() => onSetPrimary(location.id)}
                    accessible={true}
                    accessibilityLabel={`Set ${location.name} as primary`}
                  >
                    <Text style={styles.setAsPrimaryText}>Set as Primary</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditLocation(location)}
                  accessible={true}
                  accessibilityLabel={`Edit ${location.name}`}
                >
                  <Edit3 size={16} color={designTokens.colors.primary} />
                  <Text style={[styles.actionButtonText, { color: designTokens.colors.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteLocation(location.id)}
                  accessible={true}
                  accessibilityLabel={`Delete ${location.name}`}
                >
                  <Trash2 size={16} color={designTokens.colors.error} />
                  <Text style={[styles.actionButtonText, { color: designTokens.colors.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <MapIcon size={48} color={colors.textLight} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>
            No pickup locations added yet
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.textLight }]}>
            Add at least one location to enable orders
          </Text>
        </View>
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: designTokens.colors.primary }]}
        onPress={() => {
          setEditingLocation(null);
          setShowForm(true);
        }}
        accessible={true}
        accessibilityLabel="Add new pickup location"
        accessibilityRole="button"
      >
        <Plus size={20} color={designTokens.colors.white} />
        <Text style={styles.addButtonText}>Add Pickup Location</Text>
      </TouchableOpacity>

      {/* Form Modal (will be implemented separately) */}
      {showForm && (
        <Modal
          visible={showForm}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowForm(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowForm(false)}
          >
            <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {editingLocation ? 'Edit Pickup Location' : 'Add Pickup Location'}
                </Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={{ fontSize: 24, color: colors.text }}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Form content will go here - using PickupLocationForm component */}
              <View style={styles.formPlaceholder}>
                <Text style={[styles.placeholderText, { color: colors.textLight }]}>
                  Form component will be rendered here
                </Text>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.lg,
  },

  header: {
    marginBottom: designTokens.spacing.lg,
  },

  title: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  subtitle: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.normal,
  },

  locationsList: {
    marginBottom: designTokens.spacing.lg,
    maxHeight: 400,
  },

  locationCard: {
    borderRadius: designTokens.radius.lg,
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.md,
    ...designTokens.shadows.md,
  },

  primaryBadge: {
    position: 'absolute',
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    backgroundColor: designTokens.colors.primary,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },

  primaryBadgeText: {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.size.xs,
    fontWeight: designTokens.typography.weight.bold,
  },

  locationHeader: {
    marginBottom: designTokens.spacing.md,
    paddingRight: designTokens.spacing['2xl'],
  },

  locationType: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
    marginBottom: designTokens.spacing.xs,
  },

  locationName: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },

  infoText: {
    fontSize: designTokens.typography.size.sm,
    flex: 1,
  },

  instructionsBox: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: designTokens.spacing.md,
    borderRadius: designTokens.radius.md,
    marginTop: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },

  instructionsLabel: {
    fontSize: designTokens.typography.size.xs,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  instructionsText: {
    fontSize: designTokens.typography.size.sm,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.md,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.radius.md,
    gap: designTokens.spacing.xs,
  },

  editButton: {
    borderWidth: 1,
    borderColor: designTokens.colors.primary,
    backgroundColor: 'transparent',
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: designTokens.colors.error,
    backgroundColor: 'transparent',
  },

  setAsPrimaryButton: {
    backgroundColor: designTokens.colors.secondary,
  },

  actionButtonText: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
  },

  setAsPrimaryText: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
    color: designTokens.colors.white,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing['3xl'],
    marginVertical: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
  },

  emptyStateText: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.semibold,
    marginTop: designTokens.spacing.md,
  },

  emptyStateSubtext: {
    fontSize: designTokens.typography.size.sm,
    marginTop: designTokens.spacing.sm,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.lg,
    borderRadius: designTokens.radius.lg,
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.md,
  },

  addButtonText: {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  formContainer: {
    borderTopLeftRadius: designTokens.radius['2xl'],
    borderTopRightRadius: designTokens.radius['2xl'],
    paddingTop: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing['2xl'],
    minHeight: 400,
  },

  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
  },

  formTitle: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
  },

  formPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing['3xl'],
  },

  placeholderText: {
    fontSize: designTokens.typography.size.base,
  },
});

export default PickupLocationManager;
