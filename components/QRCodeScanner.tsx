import React, { useState, useEffect, useRef } from 'react';
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
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const router = useRouter();
  const cameraRef = useRef(null);

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      try {
        if (!permission) {
          console.log("Permission object is null, waiting...");
          return;
        }

        if (!permission.granted && !isRequestingPermission) {
          console.log("Camera permission not granted, requesting...");
          setIsRequestingPermission(true);
          
          const result = await requestPermission();
          console.log("Permission request result:", result);
          
          setIsRequestingPermission(false);
          
          if (!result.granted) {
            console.log("Camera permission denied");
            setHasError(true);
          }
        }
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        setIsRequestingPermission(false);
        setHasError(true);
      }
    };
    
    checkAndRequestPermission();
  }, [permission, requestPermission, isRequestingPermission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned && data) {
      console.log("Barcode scanned:", data);
      setScanned(true);
      try {
        // Add a slight delay to ensure UI updates before processing
        setTimeout(() => {
          onScan(data);
        }, 300);
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

  const handleRetryPermission = async () => {
    setHasError(false);
    setIsRequestingPermission(true);
    
    try {
      const result = await requestPermission();
      console.log("Retry permission result:", result);
      setIsRequestingPermission(false);
      
      if (!result.granted) {
        setHasError(true);
        Alert.alert(
          "Camera Permission Required",
          "Camera access is required to scan QR codes. Please enable camera permission in your device settings.",
          [
            { text: "OK" }
          ]
        );
      }
    } catch (error) {
      console.error("Error retrying permission:", error);
      setIsRequestingPermission(false);
      setHasError(true);
    }
  };

  // Show loading state while permission is being checked
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.text}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  // Show permission request state
  if (isRequestingPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.text}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  // Show permission denied state
  if (!permission.granted || hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Camera Permission</Text>
        </View>
        
        <View style={styles.centerContent}>
          <Text style={styles.text}>Camera access is required to scan QR codes</Text>
          <Text style={styles.subText}>
            The camera is used only to scan QR codes and is not stored or shared.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRetryPermission}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
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
            <View style={styles.scanCorners}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  scanCorners: {
    position: 'absolute',
    width: 250,
    height: 250,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.white,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
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