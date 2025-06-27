import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import QRCodeScanner from '@/components/QRCodeScanner';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset error when component mounts
  useEffect(() => {
    setError(null);
  }, []);

  const handleScan = (data: string) => {
    console.log("QR Code scanned:", data); // Debug log
    setScanning(false);
    setResult(data);
    
    // Process the scanned data
    try {
      // Check if it's a valid URL or order ID
      if (data.startsWith('http') || data.startsWith('https')) {
        // It's a URL, extract relevant parts
        console.log("URL detected:", data);
        
        if (data.includes('/order/')) {
          // Extract order ID and navigate to order details
          const orderId = data.split('/order/')[1].split('?')[0].split('#')[0];
          console.log("Navigating to order:", orderId);
          router.push(`/order/${orderId}`);
        } else if (data.includes('/listing/')) {
          // Extract listing ID and navigate to listing details
          const listingId = data.split('/listing/')[1].split('?')[0].split('#')[0];
          console.log("Navigating to listing:", listingId);
          router.push(`/listing/${listingId}`);
        } else {
          // Generic URL, show alert
          Alert.alert(
            'External URL',
            `Detected URL: ${data}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Try Again', 
                onPress: () => {
                  setScanning(true);
                  setResult(null);
                }
              }
            ]
          );
        }
      } else if (data.startsWith('ORDER:')) {
        // It's an order ID
        const orderId = data.replace('ORDER:', '').trim();
        console.log("Order ID detected:", orderId);
        if (orderId) {
          router.push(`/order/${orderId}`);
        } else {
          throw new Error('Invalid order ID format');
        }
      } else if (data.startsWith('LISTING:')) {
        // It's a listing ID
        const listingId = data.replace('LISTING:', '').trim();
        console.log("Listing ID detected:", listingId);
        if (listingId) {
          router.push(`/listing/${listingId}`);
        } else {
          throw new Error('Invalid listing ID format');
        }
      } else {
        // Try to detect if it's a raw ID (without prefix)
        const idPattern = /^[a-zA-Z0-9-_]{4,}$/;
        if (idPattern.test(data)) {
          // It looks like an ID, try to navigate to both possibilities
          Alert.alert(
            'ID Detected',
            'What type of item is this?',
            [
              { 
                text: 'Order', 
                onPress: () => router.push(`/order/${data}`)
              },
              { 
                text: 'Listing', 
                onPress: () => router.push(`/listing/${data}`)
              },
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  setScanning(true);
                  setResult(null);
                }
              }
            ]
          );
        } else {
          // Unknown format
          setError('Unrecognized QR code format');
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
                  setError(null);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('QR code processing error:', error);
      setError('Failed to process QR code');
      Alert.alert(
        'Error',
        'Failed to process the QR code. Please try again.',
        [
          { text: 'OK' },
          { 
            text: 'Try Again', 
            onPress: () => {
              setScanning(true);
              setResult(null);
              setError(null);
            }
          }
        ]
      );
    }
  };

  const handleScanAgain = () => {
    setScanning(true);
    setResult(null);
    setError(null);
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
            <SafeAreaView style={styles.resultContainer}>
              <ScrollView contentContainerStyle={styles.resultContent}>
                <Text style={styles.resultTitle}>
                  {error ? 'Scan Error' : 'Scan Result'}
                </Text>
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : (
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultText}>{result}</Text>
                  </View>
                )}
                
                <View style={styles.buttonContainer}>
                  <Button
                    title="Scan Again"
                    onPress={handleScanAgain}
                    style={styles.scanAgainButton}
                  />
                  <Button
                    title="Go Back"
                    onPress={() => router.back()}
                    variant="outline"
                    style={styles.goBackButton}
                  />
                </View>
              </ScrollView>
            </SafeAreaView>
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
  },
  resultContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  resultTextContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: `${colors.error}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  scanAgainButton: {
    width: '100%',
  },
  goBackButton: {
    width: '100%',
  },
});