# Performance Optimization Components

This directory contains all performance optimization components and utilities for ScrollUniversity.

## Components

### PerformanceOptimizer

Main wrapper component that applies performance optimizations to the entire application.

```tsx
import { PerformanceOptimizer } from '@/components/performance';

<PerformanceOptimizer>
  <App />
</PerformanceOptimizer>
```

### LazyLoad

Wrapper for lazy loading components with custom fallback.

```tsx
import { LazyLoad } from '@/components/performance';

<LazyLoad fallback={<LoadingSpinner />}>
  <HeavyComponent />
</LazyLoad>
```

### OptimizedImage

Image component with automatic optimization, lazy loading, and responsive images.

```tsx
import { OptimizedImage } from '@/components/performance';

<OptimizedImage
  src="/images/banner.jpg"
  alt="Banner"
  lazy={true}
  responsive={true}
  quality={80}
/>
```

### VirtualList

Efficiently renders large lists by only rendering visible items.

```tsx
import { VirtualList } from '@/components/performance';

<VirtualList
  items={courses}
  itemHeight={100}
  containerHeight={600}
  renderItem={(course, index) => (
    <CourseCard course={course} />
  )}
  onEndReached={loadMore}
/>
```

### VirtualGrid

Grid layout with virtual scrolling for large datasets.

```tsx
import { VirtualGrid } from '@/components/performance';

<VirtualGrid
  items={badges}
  itemWidth={200}
  itemHeight={250}
  containerWidth={1200}
  containerHeight={800}
  renderItem={(badge, index) => (
    <BadgeCard badge={badge} />
  )}
  gap={16}
/>
```

### InfiniteScroll

Infinite scrolling component with automatic load more.

```tsx
import { InfiniteScroll } from '@/components/performance';

<InfiniteScroll
  hasMore={hasMore}
  isLoading={isLoading}
  onLoadMore={loadMore}
  loader={<LoadingSpinner />}
  endMessage={<p>No more items</p>}
>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</InfiniteScroll>
```

## Utilities

### lazyLoadRoute

Helper for route-based lazy loading with performance tracking.

```tsx
import { lazyLoadRoute } from '@/components/performance';

const AdminDashboard = lazyLoadRoute(() => import('./pages/AdminDashboard'));
```

### prefetchRoute

Prefetch route component on idle.

```tsx
import { prefetchRoute } from '@/components/performance';

// Prefetch on hover
<Link 
  to="/admin"
  onMouseEnter={() => prefetchRoute(() => import('./pages/AdminDashboard'))}
>
  Admin
</Link>
```

### useDebouncedValue

Debounce value changes to reduce re-renders.

```tsx
import { useDebouncedValue } from '@/components/performance';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebouncedValue(searchTerm, 300);

// Use debouncedSearch for API calls
```

### useThrottledCallback

Throttle callback execution.

```tsx
import { useThrottledCallback } from '@/components/performance';

const handleScroll = useThrottledCallback((e) => {
  console.log('Scroll position:', e.target.scrollTop);
}, 100);
```

### useIntersectionObserver

Hook for intersection observer (lazy loading, infinite scroll).

```tsx
import { useIntersectionObserver } from '@/components/performance';

const ref = useRef(null);
const isVisible = useIntersectionObserver(ref, {
  threshold: 0.5,
  rootMargin: '50px',
});

<div ref={ref}>
  {isVisible && <HeavyComponent />}
</div>
```

### memo

Memoize components to prevent unnecessary re-renders.

```tsx
import { memo } from '@/components/performance';

const ExpensiveComponent = memo(({ data }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});
```

## Performance Libraries

### Performance Monitor

Track and report performance metrics.

```tsx
import { performanceMonitor } from '@/lib/performance-monitor';

// Mark custom points
performanceMonitor.mark('feature-start');
// ... feature code ...
performanceMonitor.mark('feature-end');
performanceMonitor.measure('feature-duration', 'feature-start', 'feature-end');

// Get Web Vitals
const vitals = performanceMonitor.reportWebVitals();
```

### Image Optimizer

Optimize images with lazy loading and responsive sets.

```tsx
import { imageOptimizer, useOptimizedImage } from '@/lib/image-optimizer';

// Preload critical images
await imageOptimizer.preloadImages([
  '/images/hero.jpg',
  '/images/logo.svg',
]);

// Use in component
const imageProps = useOptimizedImage('/images/banner.jpg', {
  lazy: true,
  responsive: true,
  quality: 80,
});

<img {...imageProps} alt="Banner" />
```

### API Cache

Cache API responses with intelligent strategies.

```tsx
import { apiCache, generateCacheKey, CacheTags } from '@/lib/api-cache';

// Cache API call
const data = await apiCache.get(
  generateCacheKey('/api/courses', { page: 1 }),
  () => fetchCourses(1),
  {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
    tags: [CacheTags.COURSES],
  }
);

// Invalidate cache
apiCache.invalidateByTag(CacheTags.COURSES);

// Get cache stats
const stats = apiCache.getStats();
```

### CDN Integration

Integrate with CDN for optimized asset delivery.

```tsx
import { cdnIntegration, useCDNAsset, initializeCDN } from '@/lib/cdn-integration';

// Initialize on app start
initializeCDN();

// Get CDN URL
const logoUrl = useCDNAsset('/images/logo.svg', {
  quality: 90,
  format: 'webp',
});

// Preload assets
cdnIntegration.preloadAssets([
  '/fonts/inter-var.woff2',
  '/images/hero.jpg',
]);
```

## Best Practices

### 1. Code Splitting
- Use `lazyLoadRoute` for all page components
- Split large components into separate chunks
- Prefetch routes on hover or idle

### 2. Image Optimization
- Always use `OptimizedImage` for images
- Enable lazy loading for below-the-fold images
- Provide responsive image sets
- Use modern formats (AVIF, WebP)

### 3. List Rendering
- Use `VirtualList` for lists with > 100 items
- Use `VirtualGrid` for grid layouts
- Implement `InfiniteScroll` for pagination

### 4. API Caching
- Cache frequently accessed data
- Use stale-while-revalidate for better UX
- Invalidate cache on mutations
- Monitor cache hit rates

### 5. Performance Monitoring
- Track Web Vitals
- Monitor custom metrics
- Set up alerts for slow operations
- Analyze performance reports

## Performance Targets

- **FCP (First Contentful Paint):** < 1.8s
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTFB (Time to First Byte):** < 600ms

## Troubleshooting

### Slow Initial Load
1. Check bundle size with visualizer
2. Verify code splitting is working
3. Enable CDN for static assets
4. Optimize images

### High Memory Usage
1. Check for memory leaks
2. Use virtual scrolling for large lists
3. Clear cache periodically
4. Optimize component re-renders

### Poor Cache Hit Rate
1. Increase TTL for stable data
2. Use stale-while-revalidate
3. Preload critical data
4. Monitor cache statistics

### Slow API Calls
1. Enable API caching
2. Use request deduplication
3. Implement pagination
4. Optimize database queries

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
