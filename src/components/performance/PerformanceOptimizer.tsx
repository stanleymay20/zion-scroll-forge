/**
 * Performance Optimizer Component
 * Applies various performance optimizations to the application
 */

import React, { useEffect, lazy, Suspense } from 'react';
import { performanceMonitor } from '@/lib/performance-monitor';
import { initializeCDN } from '@/lib/cdn-integration';
import { apiCache } from '@/lib/api-cache';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  useEffect(() => {
    // Initialize CDN
    initializeCDN();

    // Start performance monitoring
    performanceMonitor.mark('app-start');

    // Start cache cleanup
    const cleanupInterval = apiCache.startAutoCleanup();

    // Report Web Vitals periodically
    const reportInterval = setInterval(() => {
      const vitals = performanceMonitor.reportWebVitals();
      console.log('Web Vitals:', vitals);
    }, 30000); // Every 30 seconds

    // Cleanup
    return () => {
      clearInterval(cleanupInterval);
      clearInterval(reportInterval);
    };
  }, []);

  return <>{children}</>;
}

/**
 * Lazy load wrapper with loading fallback
 */
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoad({ children, fallback }: LazyLoadProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * Code splitting helper for route-based lazy loading
 */
export function lazyLoadRoute(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) {
  return lazy(() => {
    const start = performance.now();
    return importFunc().then((module) => {
      const duration = performance.now() - start;
      performanceMonitor.recordMetric({
        name: 'route-load-time',
        value: duration,
        timestamp: Date.now(),
      });
      return module;
    });
  });
}

/**
 * Prefetch route component
 */
export function prefetchRoute(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) {
  // Prefetch on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      importFunc();
    });
  } else {
    setTimeout(() => {
      importFunc();
    }, 1);
  }
}

/**
 * Image component with optimization
 */
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazy?: boolean;
  responsive?: boolean;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  lazy = true,
  responsive = true,
  quality = 80,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              setIsLoaded(true);
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  return (
    <img
      ref={imgRef}
      data-src={lazy ? src : undefined}
      src={lazy ? undefined : src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      {...props}
    />
  );
}

/**
 * Debounced component re-render
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRun = React.useRef(Date.now());

  return React.useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Memoized component wrapper
 */
export function memo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  return React.memo(Component, propsAreEqual);
}
