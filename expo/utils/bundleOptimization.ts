import { Platform } from 'react-native';

/**
 * Bundle optimization utilities to reduce app size and improve performance
 */

/**
 * Lazy load components to reduce initial bundle size
 */
export const lazyImport = <T extends Record<string, any>>(
  importFn: () => Promise<T>
): (() => Promise<T>) => {
  let modulePromise: Promise<T> | null = null;
  
  return () => {
    if (!modulePromise) {
      modulePromise = importFn();
    }
    return modulePromise;
  };
};

/**
 * Platform-specific imports to avoid loading unnecessary code
 */
export const platformImport = <T>(
  webImport: () => Promise<T>,
  nativeImport: () => Promise<T>
): (() => Promise<T>) => {
  return Platform.OS === 'web' ? webImport : nativeImport;
};

/**
 * Conditional feature loading based on device capabilities
 */
export const conditionalImport = <T>(
  condition: boolean,
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> => {
  if (condition) {
    return importFn();
  }
  return Promise.resolve(fallback);
};

/**
 * Asset optimization settings
 */
export const assetOptimization = {
  // Image quality settings for different use cases
  imageQuality: {
    thumbnail: 70,
    preview: 80,
    fullSize: 85,
    highQuality: 90,
  },
  
  // Maximum dimensions for different image types
  maxDimensions: {
    thumbnail: { width: 150, height: 150 },
    card: { width: 400, height: 300 },
    hero: { width: 800, height: 600 },
    profile: { width: 200, height: 200 },
  },
  
  // Supported formats in order of preference
  supportedFormats: Platform.OS === 'web' 
    ? ['webp', 'jpeg', 'png'] 
    : ['jpeg', 'png'],
};

/**
 * Memory optimization settings
 */
export const memoryOptimization = {
  // Image cache settings
  imageCache: {
    maxMemorySize: Platform.OS === 'web' ? 50 * 1024 * 1024 : 100 * 1024 * 1024, // 50MB web, 100MB native
    maxDiskSize: Platform.OS === 'web' ? 100 * 1024 * 1024 : 200 * 1024 * 1024, // 100MB web, 200MB native
  },
  
  // List rendering optimization
  listOptimization: {
    initialNumToRender: 10,
    maxToRenderPerBatch: 5,
    windowSize: 10,
    removeClippedSubviews: Platform.OS !== 'web',
  },
};

/**
 * Network optimization settings
 */
export const networkOptimization = {
  // Request timeout settings
  timeouts: {
    image: 10000, // 10 seconds
    api: 15000,   // 15 seconds
    upload: 30000, // 30 seconds
  },
  
  // Retry settings
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 1.5,
    initialDelay: 1000,
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  // Measure component render time
  measureRender: (componentName: string, renderFn: () => void) => {
    if (__DEV__) {
      const startTime = Date.now();
      renderFn();
      const endTime = Date.now();
      console.log(`[Performance] ${componentName} render time: ${endTime - startTime}ms`);
    } else {
      renderFn();
    }
  },
  
  // Log memory usage (development only)
  logMemoryUsage: (context: string) => {
    if (__DEV__ && Platform.OS === 'web') {
      const memory = (performance as any).memory;
      if (memory) {
        console.log(`[Memory] ${context}:`, {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
        });
      }
    }
  },
};

/**
 * Bundle analysis utilities (development only)
 */
export const bundleAnalysis = {
  // Log bundle size information
  logBundleInfo: () => {
    if (__DEV__) {
      console.log('[Bundle] Optimization features enabled:', {
        imageOptimization: true,
        fontOptimization: true,
        lazyLoading: true,
        platformSpecific: true,
        memoryOptimization: true,
      });
    }
  },
};