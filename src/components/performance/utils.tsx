/**
 * Performance Optimization Utilities
 * Simple utilities that don't cause circular dependencies
 */

import React, { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react';

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
  return lazy(importFunc);
}

/**
 * Prefetch route component
 */
export function prefetchRoute(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      importFunc();
    });
  } else if (typeof window !== 'undefined') {
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
}

export function OptimizedImage({
  src,
  alt,
  lazy = true,
  className = '',
  ...props
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      className={className}
      {...props}
    />
  );
}

/**
 * Debounced value hook
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
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
 * Intersection observer hook
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

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
