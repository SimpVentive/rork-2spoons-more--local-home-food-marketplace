import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import { MapPin, Clock, Navigation, ChevronRight } from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';
import { useThemeColors } from '@/utils/theme';
import { PickupLocation } from '@/types';
import Button from './Button';

interface OrderPickupSelectionProps {
  locations: PickupLocation[];
  selectedLocationId?: string;
  onSelectLocation: (location: PickupLocation) => void;
  listingTitle?: string;
}

export const OrderPickupSelection: React.FC<OrderPickupSelectionProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  listingTitle = 'Order',
}) => {
  const colors = useThemeColors();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!locations || locations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <MapPin size={48} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Pickup Locations Available
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textLight }]}>
            The seller hasn't added any pickup locations yet
          </Text>
        </View>
      </View>
    );
  }

  const handleOpenMap = (location: PickupLocation) => {
    if (location.googleMapsUrl) {
      Linking.openURL(location.googleMapsUrl).catch(() =>
        Alert.alert('Error', 'Unable to open Google Maps')
      );
    }
  };

  const handleSelectLocation = (location: PickupLocation) => {
    onSelectLocation(location);
    Alert.alert('Success', `Selected: ${location.name}`);
  };

  const renderLocationCard = ({ item: location }: { item: PickupLocation }) => {
    const isSelected = selectedLocationId === location.id;
    const isExpanded = expandedId === location.id;
    const isPrimary = locations[0]?.id === location.id;

    return (
      <View
        style={[
          styles.locationCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? designTokens.colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedId(isExpanded ? null : location.id)}
          accessible={true}
          accessibilityLabel={`${location.name} location`}
          accessibilityRole="button"
          accessibilityState={{
            expanded: isExpanded,
            selected: isSelected,
          }}
          accessibilityHint={`${isExpanded ? 'Collapse' : 'Expand'} location details`}
        >
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: designTokens.colors.primary },
              ]}
            >
              <MapPin size={16} color={designTokens.colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.locationName, { color: colors.text }]}>
                  {location.name}
                </Text>
                {isPrimary && (
                  <View
                    style={[
                      styles.primaryBadge,
                      { backgroundColor: designTokens.colors.success },
                    ]}
                  >
                    <Text style={styles.badgeText}>Primary</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.locationType, { color: colors.textLight }]}>
                {location.type.charAt(0).toUpperCase() + location.type.slice(1)} Location
              </Text>
            </View>
          </View>
          <ChevronRight
            size={20}
            color={colors.textLight}
            style={{
              transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
            }}
          />
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={[styles.cardDetails, { borderTopColor: colors.border }]}>
            {/* Address */}
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                Address
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {location.address.fullAddress}
              </Text>
            </View>

            {/* Pickup Time Window */}
            <View style={styles.detailSection}>
              <View style={styles.labelRow}>
                <Clock size={14} color={colors.textLight} />
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Pickup Time Window
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {location.pickupTimeStart} - {location.pickupTimeEnd}
              </Text>
            </View>

            {/* Special Instructions */}
            {location.instructions && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailLabel, { color: colors.textLight }]}>
                  Special Instructions
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {location.instructions}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.mapButton,
                  { backgroundColor: designTokens.colors.primary },
                ]}
                onPress={() => handleOpenMap(location)}
                accessible={true}
                accessibilityLabel="View on Google Maps"
                accessibilityRole="button"
              >
                <Navigation size={16} color={designTokens.colors.white} />
                <Text style={styles.mapButtonText}>View Map</Text>
              </TouchableOpacity>

              <Button
                title={isSelected ? '✓ Selected' : 'Select Location'}
                onPress={() => handleSelectLocation(location)}
                variant={isSelected ? 'success' : 'primary'}
                style={{ flex: 1 }}
                accessibilityLabel={`${isSelected ? 'Selected' : 'Select'} ${location.name}`}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Choose Pickup Location
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textLight }]}>
          {locations.length} location{locations.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Locations List */}
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={renderLocationCard}
        scrollEnabled={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* Selection Summary */}
      {selectedLocationId && (
        <View
          style={[
            styles.summaryBox,
            {
              backgroundColor: designTokens.colors.success,
              opacity: 0.1,
              borderColor: designTokens.colors.success,
            },
          ]}
        >
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              ✓ Location Selected
            </Text>
            <Text style={[styles.summaryLocation, { color: designTokens.colors.success }]}>
              {locations.find((l) => l.id === selectedLocationId)?.name}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.lg,
  },

  header: {
    marginBottom: designTokens.spacing.lg,
  },

  headerTitle: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.sm,
  },

  headerSubtitle: {
    fontSize: designTokens.typography.size.sm,
  },

  list: {
    flex: 1,
  },

  listContent: {
    gap: designTokens.spacing.md,
  },

  locationCard: {
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: designTokens.spacing.md,
  },

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
  },

  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: designTokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.xs,
  },

  locationName: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
    flex: 1,
  },

  primaryBadge: {
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.radius.sm,
  },

  badgeText: {
    fontSize: designTokens.typography.size.xs,
    fontWeight: designTokens.typography.weight.bold,
    color: designTokens.colors.white,
  },

  locationType: {
    fontSize: designTokens.typography.size.sm,
  },

  cardDetails: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.lg,
    borderTopWidth: 1,
    gap: designTokens.spacing.lg,
  },

  detailSection: {
    gap: designTokens.spacing.sm,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  detailLabel: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
  },

  detailValue: {
    fontSize: designTokens.typography.size.base,
    lineHeight: 20,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.md,
  },

  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.radius.lg,
    gap: designTokens.spacing.sm,
  },

  mapButtonText: {
    color: designTokens.colors.white,
    fontWeight: designTokens.typography.weight.bold,
    fontSize: designTokens.typography.size.sm,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
  },

  emptyTitle: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: designTokens.typography.size.base,
    textAlign: 'center',
  },

  summaryBox: {
    borderWidth: 1,
    borderRadius: designTokens.radius.lg,
    padding: designTokens.spacing.md,
    marginTop: designTokens.spacing.lg,
  },

  summaryContent: {
    gap: designTokens.spacing.xs,
  },

  summaryLabel: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
  },

  summaryLocation: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },
});

export default OrderPickupSelection;
