import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { Route } from 'lucide-react-native';
import colors from '@/constants/colors';

interface RouteMapViewNativeProps {
  routePoints: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;

  dishesOnRoute: Array<{
    latitude: number;
    longitude: number;
    dishName: string;
    availableUntil: string;
    sellerName: string;
  }>;

  onDishPress?: (dish: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function RouteMapViewNativeWeb({
  routePoints,
  dishesOnRoute,
  onDishPress,
}: RouteMapViewNativeProps) {

  const mapElementRef =
    useRef<HTMLDivElement | null>(null);

  const mapRef =
    useRef<any>(null);

  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  /**
   * Load Google Maps JS
   */
  const loadGoogleMaps = () => {

    return new Promise<void>((resolve, reject) => {

      if (window.google?.maps) {
        resolve();
        return;
      }

      const existingScript =
        document.querySelector(
          'script[data-google-maps]'
        );

      if (existingScript) {

        existingScript.addEventListener(
          'load',
          () => resolve()
        );

        return;
      }

      const script =
        document.createElement('script');

      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=routes`;

      script.async = true;
      script.defer = true;

      script.setAttribute(
        'data-google-maps',
        'true'
      );

      script.onload = () => resolve();

      script.onerror = () =>
        reject(
          new Error(
            'Failed to load Google Maps'
          )
        );

      document.head.appendChild(script);
    });
  };

  /**
   * Initialize map
   */
  useEffect(() => {

    if (!mapElementRef.current) {
      return;
    }

    if (!apiKey) {

      console.error(
        'Google Maps API key missing'
      );

      return;
    }

    let active = true;

    const initializeMap = async () => {

      try {

        await loadGoogleMaps();

        if (
          !active ||
          !mapElementRef.current
        ) {
          return;
        }

        /**
         * Default India location
         */
        let center = {
          lat: 20.5937,
          lng: 78.9629,
        };

        /**
         * Use first route point
         */
        if (routePoints.length > 0) {

          center = {
            lat: routePoints[0].latitude,
            lng: routePoints[0].longitude,
          };

        }

        const map =
          new window.google.maps.Map(
            mapElementRef.current,
            {
              center,
              zoom:
                routePoints.length > 0
                  ? 12
                  : 5,

              mapTypeControl: false,

              streetViewControl: false,

              fullscreenControl: true,
            }
          );

        mapRef.current = map;

        /**
         * Bounds
         */
        const bounds =
          new window.google.maps.LatLngBounds();

        /**
         * Route marker points
         */
        routePoints.forEach(
          (point, index) => {

            const position = {
              lat: point.latitude,
              lng: point.longitude,
            };

            bounds.extend(position);

            const marker =
              new window.google.maps.Marker({
                position,
                map,

                label: {
                  text:
                    String(index + 1),

                  color:
                    '#ffffff',

                  fontWeight:
                    'bold',
                },

                title:
                  point.name,
              });

            const infoWindow =
              new window.google.maps.InfoWindow({
                content: `
                    <div style="
                        padding:6px;
                        min-width:180px;
                    ">

                        <strong>
                            Stop ${index + 1}
                        </strong>

                        <br/>

                        ${escapeHtml(
                          point.name
                        )}

                    </div>
                `,
              });

            marker.addListener(
              'click',
              () => {

                infoWindow.open({
                  anchor: marker,
                  map,
                });

              }
            );

          }
        );

        /**
         * Dish markers
         */
        dishesOnRoute.forEach(
          dish => {

            const position = {
              lat:
                dish.latitude,

              lng:
                dish.longitude,
            };

            bounds.extend(position);

            const marker =
              new window.google.maps.Marker({

                position,

                map,

                title:
                  dish.dishName,

                icon: {
                  path:
                    window.google.maps
                      .SymbolPath.CIRCLE,

                  scale: 10,

                  fillColor:
                    '#ff7043',

                  fillOpacity: 1,

                  strokeColor:
                    '#ffffff',

                  strokeWeight: 3,
                },

              });

            const content = `
                <div style="
                    min-width:200px;
                    padding:8px;
                ">

                    <strong>
                        ${escapeHtml(
                          dish.dishName
                        )}
                    </strong>

                    <br/><br/>

                    <b>Seller:</b>

                    ${escapeHtml(
                      dish.sellerName
                    )}

                    <br/>

                    <b>
                        Available until:
                    </b>

                    ${escapeHtml(
                      dish.availableUntil
                    )}

                </div>
            `;

            const infoWindow =
              new window.google.maps
                .InfoWindow({
                  content,
                });

            marker.addListener(
              'click',
              () => {

                infoWindow.open({
                  anchor: marker,
                  map,
                });

                onDishPress?.(dish);

              }
            );

          }
        );

        /**
         * Draw actual driving route
         */
        if (
          routePoints.length >= 2
        ) {

          await drawRoute(
            map,
            routePoints
          );

        }

        /**
         * Fit map
         */
        if (
          routePoints.length > 0 ||
          dishesOnRoute.length > 0
        ) {

          map.fitBounds(
            bounds
          );

        }

      } catch (error) {

        console.error(
          'Google Map error:',
          error
        );

      }

    };

    initializeMap();

    return () => {

      active = false;

    };

  }, [
    routePoints,
    dishesOnRoute,
    apiKey,
  ]);

  return (

    <View style={styles.container}>

      {/* Header */}

      <View style={styles.header}>

        <Route
          size={20}
          color={colors.primary}
        />

        <View
          style={
            styles.headerContent
          }
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            Your Route Map
          </Text>

          <Text
            style={
              styles.routeStatsText
            }
          >

            {routePoints.length}
            {' '}stops •{' '}

            {dishesOnRoute.length}
            {' '}dishes available

          </Text>

        </View>

      </View>


      {/* Google Map */}

      <View
        style={
          styles.mapWrapper
        }
      >

        <div

          ref={
            mapElementRef
          }

          style={{
            width: '100%',
            height: '100%',
          }}

        />

      </View>


      {/* Summary */}

      <View
        style={
          styles.routeSummary
        }
      >

        <Text
          style={
            styles.routeSummaryTitle
          }
        >
          Route Summary
        </Text>


        <View
          style={
            styles.summaryRow
          }
        >

          <Text
            style={
              styles.summaryLabel
            }
          >
            Total Stops:
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            {routePoints.length}
          </Text>

        </View>


        <View
          style={
            styles.summaryRow
          }
        >

          <Text
            style={
              styles.summaryLabel
            }
          >
            Available Dishes:
          </Text>

          <Text
            style={
              styles.summaryValue
            }
          >
            {dishesOnRoute.length}
          </Text>

        </View>

      </View>

    </View>

  );
}


/**
 * Draw road-following route
 */
async function drawRoute(
  map: any,
  routePoints: RouteMapViewNativeProps['routePoints']
) {

  if (
    routePoints.length < 2
  ) {
    return;
  }

  /**
   * Using DirectionsService for compatibility.
   *
   * If you're already using Google's newer
   * Routes API, we can swap this to Route.computeRoutes().
   */

  const directionsService =
    new window.google.maps
      .DirectionsService();

  const directionsRenderer =
    new window.google.maps
      .DirectionsRenderer({

        map,

        suppressMarkers: true,

        polylineOptions: {

          strokeColor:
            colors.primary,

          strokeWeight:
            5,

          strokeOpacity:
            0.9,

        },

      });


  const origin =
    routePoints[0];

  const destination =
    routePoints[
      routePoints.length - 1
    ];


  const waypoints =
    routePoints
      .slice(1, -1)
      .map(point => ({

        location: {

          lat:
            point.latitude,

          lng:
            point.longitude,

        },

        stopover: true,

      }));


  const result =
    await directionsService.route({

      origin: {

        lat:
          origin.latitude,

        lng:
          origin.longitude,

      },

      destination: {

        lat:
          destination.latitude,

        lng:
          destination.longitude,

      },

      waypoints,

      travelMode:
        window.google.maps
          .TravelMode.DRIVING,

      optimizeWaypoints:
        false,

    });


  directionsRenderer.setDirections(
    result
  );

}


const escapeHtml = (
  value: string
) => {

  return value
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

};


const styles =
  StyleSheet.create({

    container: {

      flex: 1,

      backgroundColor:
        colors.background,

    },


    header: {

      flexDirection:
        'row',

      alignItems:
        'center',

      padding: 16,

      backgroundColor:
        colors.white,

      borderBottomWidth:
        1,

      borderBottomColor:
        colors.border,

    },


    headerContent: {

      marginLeft: 8,

    },


    headerTitle: {

      fontSize: 18,

      fontWeight:
        '600',

      color:
        colors.text,

    },


    routeStatsText: {

      fontSize: 14,

      color:
        colors.textLight,

      marginTop: 4,

    },


    mapWrapper: {

      flex: 1,

      minHeight: 450,

      margin: 16,

      borderRadius: 12,

      overflow:
        'hidden',

      backgroundColor:
        '#eeeeee',

    },


    routeSummary: {

      padding: 16,

      backgroundColor:
        colors.white,

      borderTopWidth: 1,

      borderTopColor:
        colors.border,

    },


    routeSummaryTitle: {

      fontSize: 16,

      fontWeight:
        '600',

      color:
        colors.text,

      marginBottom: 12,

    },


    summaryRow: {

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      paddingVertical: 4,

    },


    summaryLabel: {

      fontSize: 14,

      color:
        colors.textLight,

    },


    summaryValue: {

      fontSize: 14,

      fontWeight:
        '600',

      color:
        colors.text,

    },

  });
  /*import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin, Route } from 'lucide-react-native';
import colors from '@/constants/colors';

interface RouteMapViewNativeProps {
  routePoints: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
  dishesOnRoute: Array<{
    latitude: number;
    longitude: number;
    dishName: string;
    availableUntil: string;
    sellerName: string;
  }>;
  onDishPress?: (dish: any) => void;
}

export default function RouteMapViewNativeWeb({ routePoints, dishesOnRoute, onDishPress }: RouteMapViewNativeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Route size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>Your Route Map</Text>
        <View style={styles.routeStats}>
          <Text style={styles.routeStatsText}>
            {routePoints.length} stops • {dishesOnRoute.length} dishes available
          </Text>
        </View>
      </View>
      
      <View style={styles.webMapFallback}>
        <MapPin size={48} color={colors.textLight} />
        <Text style={styles.webMapText}>Map view is not available on web</Text>
        <Text style={styles.webMapSubtext}>Please use the mobile app for full map functionality</Text>
      </View>
      
      <View style={styles.routeSummary}>
        <Text style={styles.routeSummaryTitle}>Route Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Stops:</Text>
          <Text style={styles.summaryValue}>{routePoints.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Available Dishes:</Text>
          <Text style={styles.summaryValue}>{dishesOnRoute.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Distance:</Text>
          <Text style={styles.summaryValue}>
            {calculateTotalDistance(routePoints).toFixed(1)} km
          </Text>
        </View>
      </View>
    </View>
  );
}

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Calculate total route distance
const calculateTotalDistance = (points: Array<{latitude: number; longitude: number}>): number => {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
  }
  return totalDistance;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
    marginBottom: 4,
  },
  routeStats: {
    marginTop: 4,
  },
  routeStatsText: {
    fontSize: 14,
    color: colors.textLight,
  },
  routeSummary: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  routeSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 32,
  },
  webMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});*/