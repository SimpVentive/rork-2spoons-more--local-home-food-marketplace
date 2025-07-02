import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, AppState } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [isLoading, setIsLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCamera();

    const handleAppStateChange = (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log("App came to foreground, reinitializing camera");
        setScanned(false);
        setError(null);
        initializeCamera();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      console.log("Initializing camera...");
      setIsLoading(true);
      setError(null);
      setCameraReady(false);

      // Check permission status
      if (!permission) {
        console.log("Permission object not ready");
        setError("Camera permission not available");
        setIsLoading(false);
        return;
      }

      if (!permission.granted) {
        console.log("Requesting camera permission...");
        const result = await requestPermission();
        console.log("Permission result:", result);
        
        if (!result.granted) {
          setError("Camera permission denied");
          setIsLoading(false);
          return;
        }
      }

      // Small delay for Android to ensure camera is ready
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setCameraReady(true);
      setIsLoading(false);
      console.log("Camera initialized successfully");
    } catch (error) {
      console.error("Error initializing camera:", error);
      setError("Failed to initialize camera");
      setIsLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || !data || !cameraReady) {
      return;
    }
    
    console.log("QR Code scanned:", data);
    setScanned(true);
    
    // Add haptic feedback on mobile
    if (Platform.OS !== 'web') {
      try {
        const { Haptics } = require('expo-haptics');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log("Haptics not available:", error);
      }
    }
    
    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    // Process the scan with a small delay
    scanTimeoutRef.current = setTimeout(() => {
      onScan(data);
    }, 100);
  };

  const handleClose = () => {
    console.log("Closing QR scanner");
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleScanAgain = () => {
    console.log("Scanning again");
    setScanned(false);
    setError(null);
  };

  const handleRetryPermission = async () => {
    setError(null);
    await initializeCamera();
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerText}>QR Scanner</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.text}>Initializing camera...</Text>
          {Platform.OS === 'android' && (
            <Text style={styles.subText}>
              Please wait while we prepare the camera
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Camera Error</Text>
        </View>
        
        <View style={styles.centerContent}>
          <Text style={styles.text}>{error}</Text>
          <Text style={styles.subText}>
            {error.includes('permission') 
              ? "Camera access is required to scan QR codes"
              : "Please try again or restart the app"
            }
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRetryPermission}>
            <Text style={styles.buttonText}>
              {error.includes('permission') ? 'Grant Permission' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Permission denied state
  if (!permission?.granted) {
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

  // Main camera view
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        onCameraReady={() => {
          console.log("Camera ready callback triggered");
          setCameraReady(true);
        }}
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
            
            {/* Scanning indicator */}
            {!scanned && cameraReady && (
              <View style={styles.scanningIndicator}>
                <Text style={styles.scanningText}>Looking for QR code...</Text>
              </View>
            )}
            
            {!cameraReady && (
              <View style={styles.scanningIndicator}>
                <Text style={styles.scanningText}>Preparing camera...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              {scanned 
                ? "QR code detected! Processing..." 
                : "Position the QR code within the frame to scan"
              }
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
            
            {/* Debug info for development */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  Platform: {Platform.OS} | Ready: {cameraReady ? 'Yes' : 'No'} | Scanned: {scanned ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.debugText}>
                  Permission: {permission?.granted ? 'Granted' : 'Denied'}
                </Text>
              </View>
            )}
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  scanCorners: {
    position: 'absolute',
    width: 280,
    height: 280,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.white,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  scanningIndicator: {
    position: 'absolute',
    bottom: -50,
    alignItems: 'center',
  },
  scanningText: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  instructions: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  scanAgainText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  subText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  debugInfo: {
    marginTop: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  debugText: {
    color: colors.white,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default QRCodeScanner;