import React, { lazy, Suspense, ComponentType } from 'react';
import { View, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';
import { lazyImport, platformImport } from '@/utils/bundleOptimization';

const LoadingFallback = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const withLazyLoading = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(importFn);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));
};

export const LazyQRCodeScanner = withLazyLoading(
  lazyImport(() => import('@/components/QRCodeScanner'))
);

export const LazyRouteMapView = withLazyLoading(
  platformImport(
    () => import('@/components/RouteMapView.native.web'),
    () => import('@/components/RouteMapView.native')
  )
);

export const LazyLocationPicker = withLazyLoading(
  platformImport(
    () => import('@/components/LocationPicker.web'),
    () => import('@/components/LocationPicker.native')
  )
);

export const LazyFilterModal = withLazyLoading(
  lazyImport(() => import('@/components/FilterModal'))
);

export const LazySubscriptionModal = withLazyLoading(
  lazyImport(() => import('@/components/SubscriptionModal'))
);

export const LazyNotifyMeModal = withLazyLoading(
  lazyImport(() => import('@/components/NotifyMeModal'))
);

export const LazyRouteSearchModal = withLazyLoading(
  lazyImport(() => import('@/components/RouteSearchModal'))
);

LazyQRCodeScanner.displayName = 'LazyQRCodeScanner';
LazyRouteMapView.displayName = 'LazyRouteMapView';
LazyLocationPicker.displayName = 'LazyLocationPicker';
LazyFilterModal.displayName = 'LazyFilterModal';
LazySubscriptionModal.displayName = 'LazySubscriptionModal';
LazyNotifyMeModal.displayName = 'LazyNotifyMeModal';
LazyRouteSearchModal.displayName = 'LazyRouteSearchModal';