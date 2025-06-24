import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import QRCodeScanner from '@/components/QRCodeScanner';
import colors from '@/constants/colors';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = (data: string) => {
    setScanning(false);
    setResult(data);
    
    // Process the scanned data
    try {
      // Check if it's a valid URL or order ID
      if (data.startsWith('http') || data.startsWith('https')) {
        // It's a URL, navigate to it or process it
        Alert.alert(
          'URL Detected',
          `Do you want to open: ${data}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open', 
              onPress: () => {
                // Handle URL navigation
                if (data.includes('/order/')) {
                  // Extract order ID and navigate to order details
                  const orderId = data.split('/order/')[1];
                  router.push(`/order/${orderId}`);
                } else if (data.includes('/listing/')) {
                  // Extract listing ID and navigate to listing details
                  const listingId = data.split('/listing/')[1];
                  router.push(`/listing/${listingId}`);
                } else {
                  // Generic URL, show alert
                  Alert.alert('External URL', 'Cannot open external URLs in the app');
                }
              }
            }
          ]
        );
      } else if (data.startsWith('ORDER:')) {
        // It's an order ID
        const orderId = data.replace('ORDER:', '');
        router.push(`/order/${orderId}`);
      } else if (data.startsWith('LISTING:')) {
        // It's a listing ID
        const listingId = data.replace('LISTING:', '');
        router.push(`/listing/${listingId}`);
      } else {
        // Unknown format
        Alert.alert(
          'Unrecognized QR Code',
          'The scanned QR code is not in a format recognized by this app.',
          [
            { text: 'OK' },
            { 
              text: 'Scan Again', 
              onPress: () => {
                setScanning(true);
                setResult(null);
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process the QR code');
      console.error('QR code processing error:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackTitle}>QR Code Scanning</Text>
            <Text style={styles.webFallbackText}>
              QR code scanning is currently only available on mobile devices.
            </Text>
          </View>
        ) : (
          scanning ? (
            <QRCodeScanner 
              onScan={handleScan} 
              onClose={() => router.back()}
            />
          ) : (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Scan Result</Text>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webFallbackTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  webFallbackText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    maxWidth: 400,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
});