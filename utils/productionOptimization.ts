import { Platform } from 'react-native';

/**
 * Production-specific optimizations for bundle size and performance
 */

/**
 * Remove debug code and console logs in production
 */
export const stripDebugCode = () => {
  if (!__DEV__) {
    // Override console methods in production
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    // Keep console.error for critical issues
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Only log critical errors in production
      if (args[0]?.includes?.('Error:') || args[0]?.includes?.('Warning:')) {
        originalError(...args);
      }
    };
  }
};

/**
 * Tree shaking configuration for unused code elimination
 */
export const treeShakingConfig = {
  // Mark side-effect-free modules
  sideEffects: false,
  
  // Modules that can be safely tree-shaken
  pureModules: [
    '@/utils/helpers',
    '@/constants/colors',
    '@/utils/imageOptimization',
    '@/utils/fontOptimization',
  ],
  
  // Modules to exclude from tree shaking (have side effects)
  preserveModules: [
    '@/store/*',
    '@/lib/trpc',
  ],
};

/**
 * Code splitting configuration
 */
export const codeSplittingConfig = {
  // Split vendor libraries
  vendor: [
    'react',
    'react-native',
    'expo-router',
    '@tanstack/react-query',
  ],
  
  // Split by feature
  features: {
    admin: ['app/(admin)/**/*'],
    auth: ['app/(auth)/**/*'],
    maps: ['components/*Map*', 'components/*Location*'],
    camera: ['components/QRCodeScanner', 'expo-camera'],
  },
  
  // Async chunks
  asyncChunks: [
    'components/LazyComponents',
    'utils/dataOptimization',
  ],
};

/**
 * Asset optimization for production
 */
export const assetOptimization = {
  // Image compression settings
  images: {
    quality: Platform.OS === 'web' ? 75 : 85,
    format: Platform.OS === 'web' ? 'webp' : 'jpeg',
    progressive: true,
    stripMetadata: true,
  },
  
  // Font optimization
  fonts: {
    preload: ['System'], // Only preload system fonts
    subset: true, // Remove unused characters
    display: 'swap', // Improve loading performance
  },
  
  // Icon optimization
  icons: {
    treeShake: true, // Only include used icons
    format: 'svg', // Use SVG for scalability
  },
};

/**
 * Network optimization for production
 */
export const networkOptimization = {
  // HTTP/2 server push resources
  preload: [
    { rel: 'preload', href: '/fonts/system.woff2', as: 'font', type: 'font/woff2' },
  ],
  
  // Resource hints
  prefetch: [
    '/api/listings',
    '/api/user/profile',
  ],
  
  // Compression
  compression: {
    gzip: true,
    brotli: Platform.OS === 'web',
  },
};

/**
 * Memory optimization for production
 */
export const memoryOptimization = {
  // Garbage collection hints
  gcHints: {
    lowMemoryWarning: 50 * 1024 * 1024, // 50MB
    criticalMemoryWarning: 100 * 1024 * 1024, // 100MB
  },
  
  // Cache limits
  cacheLimits: {
    images: Platform.OS === 'web' ? 25 * 1024 * 1024 : 50 * 1024 * 1024,
    data: 10 * 1024 * 1024,
    components: 5 * 1024 * 1024,
  },
  
  // Cleanup intervals
  cleanupIntervals: {
    images: 5 * 60 * 1000, // 5 minutes
    data: 10 * 60 * 1000, // 10 minutes
    unused: 15 * 60 * 1000, // 15 minutes
  },
};

/**
 * Performance monitoring for production
 */
export const performanceMonitoring = {
  // Core Web Vitals tracking
  webVitals: Platform.OS === 'web',
  
  // Bundle size tracking
  bundleSize: {
    threshold: 2 * 1024 * 1024, // 2MB warning threshold
    track: !__DEV__,
  },
  
  // Memory usage tracking
  memoryUsage: {
    interval: 30 * 1000, // 30 seconds
    threshold: 100 * 1024 * 1024, // 100MB warning
  },
};

/**
 * Initialize production optimizations
 */
export const initializeProductionOptimizations = () => {
  if (!__DEV__) {
    // Strip debug code
    stripDebugCode();
    
    // Set up memory monitoring
    if (performanceMonitoring.memoryUsage.track !== false) {
      setInterval(() => {
        if (Platform.OS === 'web' && (performance as any).memory) {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize > performanceMonitoring.memoryUsage.threshold) {
            // Trigger cleanup
            if (global.gc) {
              global.gc();
            }
          }
        }
      }, performanceMonitoring.memoryUsage.interval);
    }
    
    // Set up cache cleanup
    setInterval(() => {
      // Clear old cache entries
      if (typeof window !== 'undefined' && window.caches) {
        window.caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old-') || name.includes('temp-')) {
              window.caches.delete(name);
            }
          });
        });
      }
    }, memoryOptimization.cleanupIntervals.unused);
  }
};

/**
 * Bundle analysis utilities
 */
export const bundleAnalysis = {
  // Analyze bundle composition
  analyzeBundleSize: () => {
    if (!__DEV__ && Platform.OS === 'web') {
      // Use webpack-bundle-analyzer or similar tool
      return {
        total: 0,
        vendor: 0,
        app: 0,
        assets: 0,
      };
    }
    return null;
  },
  
  // Track unused dependencies
  trackUnusedDependencies: () => {
    if (!__DEV__) {
      // Implementation would analyze import usage
      return [];
    }
    return [];
  },
  
  // Performance recommendations
  getOptimizationRecommendations: () => {
    const recommendations: string[] = [];
    
    if (Platform.OS === 'web') {
      recommendations.push('Enable gzip compression');
      recommendations.push('Use WebP images');
      recommendations.push('Implement service worker caching');
    }
    
    recommendations.push('Use lazy loading for non-critical components');
    recommendations.push('Optimize image sizes for mobile screens');
    recommendations.push('Remove unused dependencies');
    
    return recommendations;
  },
};