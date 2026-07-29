import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import colors from "@/constants/colors";
import Button from "./Button";

interface LocationPickerProps {
  visible: boolean;
  initialLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;

  onClose: () => void;
}

const libraries: ("places")[] = ["places"];

export default function LocationPickerWeb({
  visible,
  initialLocation,
  onLocationSelect,
  onClose,
}: LocationPickerProps) {
  const mapRef = useRef<google.maps.Map>();

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [location, setLocation] = useState({
    latitude: initialLocation?.latitude ?? 17.4123,
    longitude: initialLocation?.longitude ?? 78.2679,
    address: initialLocation?.address ?? "",
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map",
    googleMapsApiKey:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    if (!visible) return;

    if (!initialLocation) {
      getCurrentLocation();
    }
  }, [visible]);

  async function getCurrentLocation() {
    if (!navigator.geolocation) return;

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const address = await reverseGeocode(lat, lng);

        setLocation({
          latitude: lat,
          longitude: lng,
          address,
        });

        mapRef.current?.panTo({
          lat,
          lng,
        });

        setLoading(false);
      },
      () => setLoading(false)
    );
  }

  async function reverseGeocode(
    lat: number,
    lng: number
  ): Promise<string> {
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode(
        {
          location: {
            lat,
            lng,
          },
        },
        (results, status) => {
          if (
            status === "OK" &&
            results &&
            results.length > 0
          ) {
            resolve(results[0].formatted_address);
          } else {
            resolve(`${lat}, ${lng}`);
          }
        }
      );
    });
  }

  async function searchLocation() {
    if (!search.trim()) return;

    setLoading(true);

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode(
      {
        address: search,
      },
      async (results, status) => {
        setLoading(false);

        if (
          status !== "OK" ||
          !results ||
          results.length === 0
        )
          return;

        const place = results[0];

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setLocation({
          latitude: lat,
          longitude: lng,
          address: place.formatted_address,
        });

        mapRef.current?.panTo({
          lat,
          lng,
        });
      }
    );
  }

  async function mapClicked(
    e: google.maps.MapMouseEvent
  ) {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const address = await reverseGeocode(lat, lng);

    setLocation({
      latitude: lat,
      longitude: lng,
      address,
    });
  }

  async function markerDragged(
    e: google.maps.MapMouseEvent
  ) {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const address = await reverseGeocode(lat, lng);

    setLocation({
      latitude: lat,
      longitude: lng,
      address,
    });
  }
    if (!isLoaded) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}

          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 22 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}

          <View style={styles.searchRow}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search location..."
              style={styles.input}
              onSubmitEditing={searchLocation}
            />

            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchLocation}
            >
              <Text style={{ color: "#fff" }}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Map */}

          <View style={styles.mapContainer}>
            <GoogleMap
              mapContainerStyle={{
                width: "100%",
                height: "100%",
              }}
              zoom={15}
              center={{
                lat: location.latitude,
                lng: location.longitude,
              }}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              onClick={mapClicked}
              options={{
                fullscreenControl: false,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              <Marker
                draggable
                position={{
                  lat: location.latitude,
                  lng: location.longitude,
                }}
                onDragEnd={markerDragged}
              />
            </GoogleMap>

            {loading && (
              <View style={styles.loading}>
                <ActivityIndicator
                  color={colors.primary}
                  size="large"
                />
              </View>
            )}
          </View>

          {/* Address */}

          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>
              Selected Address
            </Text>

            <Text style={styles.address}>
              {location.address || "Tap anywhere on map"}
            </Text>
          </View>

          {/* Footer */}

          <View style={styles.footer}>
            <Button
              title="Current Location"
              variant="outline"
              onPress={getCurrentLocation}
              style={{ flex: 1, marginRight: 10 }}
            />

            <Button
              title="Confirm"
              onPress={() => onLocationSelect(location)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "92%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  searchRow: {
    flexDirection: "row",
    padding: 15,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 45,
  },

  searchButton: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  mapContainer: {
    flex: 1,
    position: "relative",
  },

  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,.6)",
  },

  addressBox: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  addressTitle: {
    fontWeight: "600",
    marginBottom: 5,
  },

  address: {
    color: "#555",
  },

  footer: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});