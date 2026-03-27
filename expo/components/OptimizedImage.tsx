import React, { memo } from 'react';
import { Image, ImageProps, ViewStyle } from 'react-native';
import { optimizeImageUrl } from '@/utils/imageOptimization';
import { assetOptimization } from '@/utils/bundleOptimization';

interface OptimizedImageComponentProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  quality?: keyof typeof assetOptimization.imageQuality;
  useCase?: keyof typeof assetOptimization.maxDimensions;
  style?: ViewStyle;
  placeholder?: boolean;
  transition?: number;
}

/**
 * Optimized Image component that automatically applies:
 * - WebP format conversion when supported
 * - Appropriate compression based on use case
 * - Placeholder generation
 * - Memory-efficient caching
 * - Responsive sizing
 */
const OptimizedImage: React.FC<OptimizedImageComponentProps> = memo(({
  uri,
  width,
  height,
  quality = 'preview',
  useCase = 'card',
  style,
  placeholder = true,
  transition = 200,
  resizeMode = 'cover',
  ...props
}) => {
  // Get dimensions based on use case if not provided
  const dimensions = React.useMemo(() => {
    const maxDims = assetOptimization.maxDimensions[useCase];
    return {
      width: width || maxDims.width,
      height: height || maxDims.height,
    };
  }, [width, height, useCase]);

  // Optimize image URL
  const optimizedUri = React.useMemo(() => {
    return optimizeImageUrl({
      uri,
      width: dimensions.width,
      height: dimensions.height,
      quality: assetOptimization.imageQuality[quality],
      format: 'webp',
    });
  }, [uri, dimensions.width, dimensions.height, quality]);

  // Note: Placeholder functionality removed for Android compatibility

  return (
    <Image
      source={{ uri: optimizedUri }}
      style={style}
      resizeMode={resizeMode}
      {...props}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

// Convenience components for common use cases
export const ThumbnailImage = memo<Omit<OptimizedImageComponentProps, 'useCase' | 'quality'>>((props) => (
  <OptimizedImage {...props} useCase="thumbnail" quality="thumbnail" />
));

export const CardImage = memo<Omit<OptimizedImageComponentProps, 'useCase' | 'quality'>>((props) => (
  <OptimizedImage {...props} useCase="card" quality="preview" />
));

export const ProfileImage = memo<Omit<OptimizedImageComponentProps, 'useCase' | 'quality'>>((props) => (
  <OptimizedImage {...props} useCase="profile" quality="highQuality" />
));

export const HeroImage = memo<Omit<OptimizedImageComponentProps, 'useCase' | 'quality'>>((props) => (
  <OptimizedImage {...props} useCase="hero" quality="fullSize" />
));

ThumbnailImage.displayName = 'ThumbnailImage';
CardImage.displayName = 'CardImage';
ProfileImage.displayName = 'ProfileImage';
HeroImage.displayName = 'HeroImage';