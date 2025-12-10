/**
 * Performance Optimization Components
 * Export all performance-related components and utilities
 * Note: PerformanceOptimizer is not exported to avoid circular dependency issues
 */

export {
  LazyLoad,
  lazyLoadRoute,
  prefetchRoute,
  OptimizedImage,
  useDebouncedValue,
  useThrottledCallback,
  useIntersectionObserver,
  memo,
} from './PerformanceOptimizer';

export {
  VirtualList,
  VirtualGrid,
  InfiniteScroll,
} from './VirtualList';
