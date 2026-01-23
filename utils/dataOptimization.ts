import { Platform } from 'react-native';

/**
 * Data optimization utilities for reducing bundle size and improving performance
 */

/**
 * Lazy load large data sets from server instead of bundling them
 */
export const loadDataFromServer = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Progressive data loading - load essential data first, then secondary data
 */
export const loadDataProgressively = async <T>(
  essentialDataLoader: () => Promise<T>,
  secondaryDataLoader: () => Promise<Partial<T>>
): Promise<T> => {
  const essentialData = await essentialDataLoader();
  
  // Load secondary data in background
  setTimeout(async () => {
    try {
      const secondaryData = await secondaryDataLoader();
      // Merge secondary data with essential data
      if (essentialData && typeof essentialData === 'object') {
        Object.assign(essentialData as object, secondaryData);
      }
    } catch (error) {
      // Secondary data loading failed, but app continues with essential data
    }
  }, 100);
  
  return essentialData;
};

/**
 * Paginated data loading to reduce initial load
 */
export const loadPaginatedData = async <T>(
  endpoint: string,
  page: number = 1,
  limit: number = 20
): Promise<{ data: T[]; hasMore: boolean; nextPage: number }> => {
  const response = await fetch(`${endpoint}?page=${page}&limit=${limit}`);
  const result = await response.json();
  
  return {
    data: result.data || [],
    hasMore: result.hasMore || false,
    nextPage: result.nextPage || page + 1,
  };
};

/**
 * Cache management for optimized data loading
 */
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

export const dataCache = new DataCache();

/**
 * Optimized data loading with caching
 */
export const loadWithCache = async <T>(
  key: string,
  loader: () => Promise<T>,
  ttlMinutes: number = 30
): Promise<T> => {
  // Check cache first
  const cached = dataCache.get<T>(key);
  if (cached) {
    return cached;
  }
  
  // Load fresh data
  const data = await loader();
  dataCache.set(key, data, ttlMinutes);
  
  return data;
};

/**
 * Essential data that should be loaded immediately
 */
export const getEssentialData = () => ({
  // Only include absolutely necessary data for initial render
  cuisineTypes: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai'],
  paymentMethods: ['UPI', 'Card', 'Cash'],
  packagingTypes: ['Eco-friendly container', 'Reusable lunch box'],
});

/**
 * Secondary data that can be loaded after initial render
 */
export const getSecondaryData = async () => {
  // Simulate loading from server
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        extendedCuisineTypes: [
          'Japanese', 'American', 'Mediterranean', 'Middle Eastern',
          'Korean', 'Vietnamese', 'French', 'Spanish', 'Greek', 'Turkish'
        ],
        extendedPaymentMethods: ['Wallet', 'Net Banking'],
        extendedPackagingTypes: [
          'Disposable container', 'Glass container', 
          'Steel container', 'Biodegradable container'
        ],
      });
    }, 500);
  });
};

/**
 * Platform-specific data loading optimizations
 */
export const getPlatformOptimizedData = () => {
  const baseData = getEssentialData();
  
  if (Platform.OS === 'web') {
    // Web can handle slightly more data initially
    return {
      ...baseData,
      cuisineTypes: [...baseData.cuisineTypes, 'Japanese', 'American'],
    };
  }
  
  // Mobile gets minimal data initially
  return baseData;
};

/**
 * Memory-efficient data structures
 */
export const createOptimizedDataStructure = <T extends { id: string }>(
  items: T[]
): { byId: Map<string, T>; allIds: string[] } => {
  const byId = new Map<string, T>();
  const allIds: string[] = [];
  
  items.forEach(item => {
    byId.set(item.id, item);
    allIds.push(item.id);
  });
  
  return { byId, allIds };
};

/**
 * Cleanup utilities for memory management
 */
export const cleanupUnusedData = () => {
  // Clear old cache entries
  dataCache.clear();
  
  // Force garbage collection if available (development only)
  if (__DEV__ && global.gc) {
    global.gc();
  }
};