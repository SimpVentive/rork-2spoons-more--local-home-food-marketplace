import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ArrowLeft, Scan } from 'lucide-react-native';
import colors from '@/constants/colors';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned && data) {
      console.log("Barcode scanned:", data); // Debug log
      setScanned(true);
      try {
        onScan(data);
      } catch (error) {
        console.error("Error in scan handler:", error);
        setHasError(true);
        Alert.alert(
          "Scan Error",
          "There was a problem processing the QR code. Please try again.",
          [
            {
              text: "OK",
              onPress: () => setScanned(false)
            }
          ]
        );
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setHasError(false);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to scan QR codes</Text>
        <Text style={styles.subText}>
          The camera is used only to scan QR codes and is not stored or shared.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleClose}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Scan QR Code</Text>
          </View>
          
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
          </View>
          
          <Text style={styles.instructions}>
            Position the QR code within the frame to scan
          </Text>
          
          {scanned && (
            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={handleScanAgain}
            >
              <Scan size={20} color={colors.white} />
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  instructions: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 40,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 40,
    alignSelf: 'center',
  },
  scanAgainText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  subText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default QRCodeScanner;