import { Platform } from 'react-native';

export interface OptimizedImageProps {
  uri: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Optimizes image URLs for better performance and smaller bundle size
 * Converts images to WebP format when supported and applies compression
 */
export const optimizeImageUrl = ({
  uri,
  width,
  height,
  quality = 80,
  format = 'webp'
}: OptimizedImageProps): string => {
  // If it's a local asset, return as-is
  if (!uri.startsWith('http')) {
    return uri;
  }

  // For web, we can use WebP format for better compression
  if (Platform.OS === 'web') {
    // Check if the URL supports query parameters for optimization
    if (uri.includes('unsplash.com') || uri.includes('cloudinary.com')) {
      const params = new URLSearchParams();
      
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', quality.toString());
      params.append('fm', format);
      params.append('fit', 'crop');
      
      const separator = uri.includes('?') ? '&' : '?';
      return `${uri}${separator}${params.toString()}`;
    }
  }

  return uri;
};

/**
 * Get appropriate image dimensions for mobile screens
 */
export const getMobileImageDimensions = (originalWidth: number, originalHeight: number) => {
  const maxWidth = 400; // Max width for mobile screens
  const maxHeight = 300; // Max height for mobile screens
  
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
};

/**
 * Preload images for better performance
 */
export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  if (Platform.OS === 'web') {
    const promises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });
    });
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }
};

/**
 * Generate placeholder image URL with specified dimensions and color
 */
export const generatePlaceholder = (width: number, height: number, color = 'f0f0f0'): string => {
  return `https://via.placeholder.com/${width}x${height}/${color}/${color}`;
};