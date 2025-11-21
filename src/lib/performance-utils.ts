/**
 * Performance Utility Functions
 * Helper functions for performance optimization
 */

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  fn: () => T,
  label: string = 'Function'
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  label: string = 'Async Function'
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * Batch multiple operations
 */
export function batchOperations<T, R>(
  items: T[],
  operation: (item: T) => R,
  batchSize: number = 10
): R[] {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(operation);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Request idle callback wrapper
 */
export function runOnIdle(callback: () => void, timeout: number = 2000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Preload resource
 */
export function preloadResource(
  url: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Prefetch resource
 */
export function prefetchResource(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Check if browser supports feature
 */
export function supportsFeature(feature: string): boolean {
  const features: Record<string, () => boolean> = {
    'intersection-observer': () => 'IntersectionObserver' in window,
    'performance-observer': () => 'PerformanceObserver' in window,
    'service-worker': () => 'serviceWorker' in navigator,
    'web-workers': () => typeof Worker !== 'undefined',
    'webp': () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    },
    'avif': () => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    },
  };
  
  return features[feature]?.() || false;
}

/**
 * Get connection speed
 */
export function getConnectionSpeed(): 'slow' | 'medium' | 'fast' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow';
    }
    if (effectiveType === '3g') {
      return 'medium';
    }
  }
  
  return 'fast';
}

/**
 * Optimize for connection speed
 */
export function optimizeForConnection(): {
  imageQuality: number;
  enableLazyLoad: boolean;
  enablePrefetch: boolean;
} {
  const speed = getConnectionSpeed();
  
  switch (speed) {
    case 'slow':
      return {
        imageQuality: 60,
        enableLazyLoad: true,
        enablePrefetch: false,
      };
    case 'medium':
      return {
        imageQuality: 75,
        enableLazyLoad: true,
        enablePrefetch: true,
      };
    case 'fast':
    default:
      return {
        imageQuality: 90,
        enableLazyLoad: false,
        enablePrefetch: true,
      };
  }
}

/**
 * Get device memory
 */
export function getDeviceMemory(): number {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory || 4;
  }
  return 4; // Default to 4GB
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  const memory = getDeviceMemory();
  const cores = navigator.hardwareConcurrency || 2;
  
  return memory < 4 || cores < 4;
}

/**
 * Optimize for device capabilities
 */
export function optimizeForDevice(): {
  enableVirtualScrolling: boolean;
  maxConcurrentRequests: number;
  cacheSize: number;
} {
  const isLowEnd = isLowEndDevice();
  
  return {
    enableVirtualScrolling: isLowEnd,
    maxConcurrentRequests: isLowEnd ? 2 : 6,
    cacheSize: isLowEnd ? 50 : 200,
  };
}
