import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import QRCodeScanner from '@/components/QRCodeScanner';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { parseQRCode } from '@/utils/qrCodeHelper';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Reset state when component mounts
  useEffect(() => {
    setError(null);
    setResult(null);
    setScanning(true);
    setProcessing(false);
  }, []);

  const handleScan = async (data: string) => {
    if (processing) return;
    
    console.log("QR Code scanned:", data);
    setProcessing(true);
    setScanning(false);
    setResult(data);
    
    try {
      // Parse the scanned data
      const parsedData = parseQRCode(data);
      console.log("Parsed QR data:", parsedData);
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (parsedData.type) {
        case 'order':
          if (parsedData.id) {
            console.log("Navigating to order:", parsedData.id);
            router.replace(`/order/${parsedData.id}`);
            return;
          } else {
            throw new Error('Invalid order ID');
          }
          
        case 'listing':
          if (parsedData.id) {
            console.log("Navigating to listing:", parsedData.id);
            router.replace(`/listing/${parsedData.id}`);
            return;
          } else {
            throw new Error('Invalid listing ID');
          }
          
        case 'url':
          Alert.alert(
            'External URL Detected',
            `URL: ${parsedData.url}\n\nThis app only supports scanning order and listing QR codes.`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Scan Again', 
                onPress: handleScanAgain
              }
            ]
          );
          break;
          
        case 'unknown':
          // Try to detect if it's a raw ID (without prefix)
          if (parsedData.id && /^[a-zA-Z0-9-_]+$/.test(parsedData.id)) {
            Alert.alert(
              'ID Detected',
              'What type of item is this?',
              [
                { 
                  text: 'Order', 
                  onPress: () => router.replace(`/order/${parsedData.id}`)
                },
                { 
                  text: 'Listing', 
                  onPress: () => router.replace(`/listing/${parsedData.id}`)
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: handleScanAgain
                }
              ]
            );
          } else {
            // Unknown format
            setError('Unrecognized QR code format');
            Alert.alert(
              'Unrecognized QR Code',
              'The scanned QR code is not in a format recognized by this app. Please scan a valid order or listing QR code.',
              [
                { text: 'OK' },
                { 
                  text: 'Scan Again', 
                  onPress: handleScanAgain
                }
              ]
            );
          }
          break;
      }
    } catch (error) {
      console.error('QR code processing error:', error);
      setError('Failed to process QR code');
      Alert.alert(
        'Scan Error',
        'There was a problem processing the QR code. Please try scanning again.',
        [
          { text: 'OK' },
          { 
            text: 'Try Again', 
            onPress: handleScanAgain
          }
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleScanAgain = () => {
    setScanning(true);
    setResult(null);
    setError(null);
    setProcessing(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <SafeAreaView style={styles.webFallback}>
            <Text style={styles.webFallbackTitle}>QR Code Scanning</Text>
            <Text style={styles.webFallbackText}>
              QR code scanning is currently only available on mobile devices.
            </Text>
            <Button
              title="Go Back"
              onPress={handleGoBack}
              style={styles.webBackButton}
            />
          </SafeAreaView>
        ) : (
          scanning ? (
            <QRCodeScanner 
              onScan={handleScan} 
              onClose={handleGoBack}
            />
          ) : (
            <SafeAreaView style={styles.resultContainer}>
              <ScrollView contentContainerStyle={styles.resultContent}>
                <Text style={styles.resultTitle}>
                  {processing ? 'Processing...' : error ? 'Scan Error' : 'Scan Complete'}
                </Text>
                
                {processing ? (
                  <View style={styles.processingContainer}>
                    <Text style={styles.processingText}>Processing QR code...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : (
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Scanned Data:</Text>
                    <Text style={styles.resultText}>{result}</Text>
                  </View>
                )}
                
                {!processing && (
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Scan Again"
                      onPress={handleScanAgain}
                      style={styles.scanAgainButton}
                    />
                    <Button
                      title="Go Back"
                      onPress={handleGoBack}
                      variant="outline"
                      style={styles.goBackButton}
                    />
                  </View>
                )}
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
    marginBottom: 32,
    lineHeight: 24,
  },
  webBackButton: {
    width: 200,
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
  processingContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  resultTextContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    fontWeight: '500',
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: `${colors.error}20`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: `${colors.error}40`,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '500',
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