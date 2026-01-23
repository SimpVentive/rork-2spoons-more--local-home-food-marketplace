import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Camera, RotateCcw } from 'lucide-react-native';
import colors from '@/constants/colors';
import {
  loadCameraComponent,
  compressImage,
  optimizedQRScanner,
  WebCameraAPI,
  cameraMemoryManager,
  cameraPerformanceMonitor,
  LITE_CAMERA_CONFIG,
} from '@/utils/cameraOptimization';

interface OptimizedCameraProps {
  mode: 'qr' | 'photo';
  onCapture?: (uri: string) => void;
  onQRScan?: (data: string) => void;
  onClose?: () => void;
  style?: any;
}

const OptimizedCamera: React.FC<OptimizedCameraProps> = ({
  mode,
  onCapture,
  onQRScan,
  onClose,
  style,
}) => {
  const [cameraComponents, setCameraComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Web-specific refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load camera components dynamically
  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      try {
        cameraPerformanceMonitor.startTiming('Camera Initialization');
        
        const components = await loadCameraComponent();
        
        if (mounted) {
          setCameraComponents(components);
          
          if (Platform.OS === 'web') {
            // Request web camera permission
            const hasWebPermission = await WebCameraAPI.requestPermission();
            setHasPermission(hasWebPermission);
          } else if (components && !components.webCamera && components.useCameraPermissions) {
            try {
              const permissionHook = components.useCameraPermissions;
              if (typeof permissionHook === 'function') {
                const permResult = await permissionHook();
                if (permResult && typeof permResult === 'object' && 'granted' in permResult) {
                  setHasPermission(permResult.granted);
                } else {
                  setHasPermission(false);
                }
              }
            } catch (permErr) {
              console.error('Permission error:', permErr);
              setHasPermission(false);
            }
          }
          
          setLoading(false);
        }
        
        cameraPerformanceMonitor.endTiming('Camera Initialization');
      } catch (err) {
        console.error('Failed to load camera components:', err);
        if (mounted) {
          setError('Failed to initialize camera');
          setLoading(false);
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      // Cleanup
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (streamRef.current) {
        WebCameraAPI.stopCamera(streamRef.current);
      }
      cameraMemoryManager.cleanup();
    };
  }, []);

  // Web camera setup
  useEffect(() => {
    if (Platform.OS === 'web' && hasPermission && videoRef.current) {
      const setupWebCamera = async () => {
        try {
          const stream = await WebCameraAPI.startCamera(videoRef.current!);
          if (stream) {
            streamRef.current = stream;
            
            // Start QR scanning if in QR mode
            if (mode === 'qr') {
              startQRScanning();
            }
          }
        } catch (error) {
          console.error('Failed to start web camera:', error);
          setError('Failed to start camera');
        }
      };

      setupWebCamera();
    }
  }, [hasPermission, mode]);

  // QR scanning for web
  const startQRScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      if (videoRef.current && !isProcessing) {
        try {
          const imageData = WebCameraAPI.captureFrame(videoRef.current);
          // Here you would integrate with a QR code library for web
          // For now, we'll simulate QR detection
          if (Math.random() > 0.95) { // Simulate occasional QR detection
            const mockQRData = 'https://example.com/qr-code-data';
            const processed = optimizedQRScanner.processFrame(mockQRData);
            if (processed && onQRScan) {
              onQRScan(processed.data);
            }
          }
        } catch (error) {
          console.warn('QR scanning error:', error);
        }
      }
    }, optimizedQRScanner.scanInterval);
  }, [isProcessing, onQRScan]);

  // Handle photo capture
  const handleCapture = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    cameraPerformanceMonitor.startTiming('Photo Capture');

    try {
      let imageUri: string;

      if (Platform.OS === 'web' && videoRef.current) {
        // Web photo capture
        imageUri = WebCameraAPI.captureFrame(videoRef.current);
      } else if (cameraComponents && !cameraComponents.webCamera) {
        // Native photo capture would go here
        // This is a placeholder - actual implementation would use CameraView.takePictureAsync()
        imageUri = 'placeholder-native-capture';
      } else {
        throw new Error('Camera not available');
      }

      // Compress the image
      const dimensionKey = mode === 'photo' ? 'profile' : mode;
      const dimensions = (LITE_CAMERA_CONFIG.maxDimensions as Record<string, { width: number; height: number }>)[dimensionKey] || { width: 800, height: 600 };
      const compressedUri = await compressImage(imageUri, {
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
        quality: LITE_CAMERA_CONFIG.quality,
      });

      onCapture?.(compressedUri);
    } catch (error) {
      console.error('Photo capture failed:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsProcessing(false);
      cameraPerformanceMonitor.endTiming('Photo Capture');
    }
  }, [isProcessing, mode, onCapture, cameraComponents]);

  // Handle QR code scan (native)
  const handleQRScan = useCallback((event: { data: string }) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    cameraPerformanceMonitor.startTiming('QR Processing');

    try {
      const processed = optimizedQRScanner.processFrame(event.data);
      if (processed && onQRScan) {
        onQRScan(processed.data);
      }
    } catch (error) {
      console.error('QR processing failed:', error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        cameraPerformanceMonitor.endTiming('QR Processing');
      }, optimizedQRScanner.scanInterval);
    }
  }, [isProcessing, onQRScan]);

  // Toggle camera facing
  const toggleFacing = useCallback(() => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  }, []);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <Camera size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || hasPermission === false) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Camera Error</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Camera size={48} color={colors.textLight} />
          <Text style={styles.errorTitle}>Camera Unavailable</Text>
          <Text style={styles.errorSubtitle}>
            {error || 'Camera permission is required'}
          </Text>
        </View>
      </View>
    );
  }

  // Web camera view
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <ArrowLeft size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {mode === 'qr' ? 'QR Scanner' : 'Camera'}
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          <video
            ref={videoRef}
            style={styles.webVideo}
            autoPlay
            playsInline
            muted
          />
          
          {mode === 'qr' && (
            <View style={styles.qrOverlay}>
              <View style={styles.qrFrame} />
              <Text style={styles.qrInstructions}>
                Position QR code within the frame
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          {mode === 'photo' && (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={isProcessing}
            >
              <Camera size={32} color={colors.white} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
            <RotateCcw size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Native camera view
  if (cameraComponents && !cameraComponents.webCamera) {
    const { CameraView } = cameraComponents;
    
    return (
      <View style={[styles.container, style]}>
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={mode === 'qr' ? {
            barcodeTypes: optimizedQRScanner.barcodeTypes,
          } : undefined}
          onBarcodeScanned={mode === 'qr' ? handleQRScan : undefined}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <ArrowLeft size={24} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerText}>
                {mode === 'qr' ? 'QR Scanner' : 'Camera'}
              </Text>
            </View>

            {mode === 'qr' && (
              <View style={styles.qrOverlay}>
                <View style={styles.qrFrame} />
                <Text style={styles.qrInstructions}>
                  Position QR code within the frame
                </Text>
              </View>
            )}

            <View style={styles.controls}>
              {mode === 'photo' && (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleCapture}
                  disabled={isProcessing}
                >
                  <Camera size={32} color={colors.white} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
                <RotateCcw size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Fallback
  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorContainer}>
        <Camera size={48} color={colors.textLight} />
        <Text style={styles.errorTitle}>Camera Not Available</Text>
        <Text style={styles.errorSubtitle}>
          Camera functionality is not supported on this device
        </Text>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  webVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as any,
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  qrInstructions: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 32,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(OptimizedCamera);