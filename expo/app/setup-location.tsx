import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import LocationPicker from '@/components/LocationPicker';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function SetupLocationScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(user?.location && user?.address ? {
    latitude: user.location.latitude,
    longitude: user.location.longitude,
    address: user.address,
  } : null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  const handleContinue = async () => {
    if (!selectedLocation) return;

    setIsLoading(true);
    try {
      await updateProfile({
        address: selectedLocation.address,
        location: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        },
      });

      setTimeout(() => {
        router.replace('/user-preference' as any);
      }, 100);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MapPin size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Set Your Location</Text>
          <Text style={styles.subtitle}>
            Help us find delicious food near you. You can always change this later.
          </Text>
        </View>

        <View style={styles.content}>
          {selectedLocation ? (
            <View style={styles.locationCard}>
              <View style={styles.addressIconContainer}>
                <MapPin size={24} color={colors.primary} />
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>Selected Location</Text>
                <Text style={styles.addressText}>{selectedLocation.address}</Text>
                <Text style={styles.coordinatesText}>
                  {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Tap below to select your location on the map
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <MapPin size={20} color={colors.white} />
            <Text style={styles.mapButtonText}>
              {selectedLocation ? 'Change Location' : 'Pick Location on Map'}
            </Text>
            <ArrowRight size={20} color={colors.white} />
          </TouchableOpacity>

          <LocationPicker
            visible={showLocationPicker}
            initialLocation={selectedLocation || undefined}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowLocationPicker(false)}
            title="Select Your Location"
            showRoute={false}
            routeStart={null}
            routeEnd={null}
          />
        </View>

        <View style={styles.footer}>
          <Button
            title={isLoading ? 'Saving...' : 'Continue'}
            onPress={handleContinue}
            disabled={!selectedLocation || isLoading}
            size="large"
          />
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loader}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  content: {
    marginBottom: spacing['3xl'],
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  addressIconContainer: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  coordinatesText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    fontWeight: typography.weights.medium,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    gap: spacing.md,
  },
  mapButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    marginBottom: spacing.lg,
  },
  loader: {
    marginTop: spacing.md,
  },
});
