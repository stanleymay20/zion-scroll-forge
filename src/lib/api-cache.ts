/**
 * API Response Caching Strategy
 * Implements intelligent caching for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  key?: string;
  tags?: string[];
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data or fetch if not available
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = this.defaultTTL,
      staleWhileRevalidate = true,
      tags = [],
    } = options;

    const cached = this.cache.get(key);
    const now = Date.now();

    // Return fresh cache
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    // Return stale cache while revalidating
    if (cached && staleWhileRevalidate) {
      this.revalidate(key, fetcher, ttl, tags);
      return cached.data;
    }

    // Deduplicate concurrent requests
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Fetch new data
    const promise = this.fetchAndCache(key, fetcher, ttl, tags);
    this.pendingRequests.set(key, promise);

    try {
      const data = await promise;
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Fetch data and store in cache
   */
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    tags: string[]
  ): Promise<T> {
    try {
      const data = await fetcher();
      const now = Date.now();

      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      });

      // Store tags for invalidation
      tags.forEach((tag) => {
        const tagKey = `tag:${tag}`;
        const taggedKeys = this.cache.get(tagKey)?.data || [];
        taggedKeys.push(key);
        this.cache.set(tagKey, {
          data: taggedKeys,
          timestamp: now,
          expiresAt: Infinity,
        });
      });

      return data;
    } catch (error) {
      // Return stale cache on error if available
      const cached = this.cache.get(key);
      if (cached) {
        console.warn(`Using stale cache for ${key} due to fetch error`);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Revalidate cache in background
   */
  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    tags: string[]
  ) {
    try {
      await this.fetchAndCache(key, fetcher, ttl, tags);
    } catch (error) {
      console.error(`Failed to revalidate cache for ${key}:`, error);
    }
  }

  /**
   * Set cache entry manually
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL) {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Invalidate cache by key
   */
  invalidate(key: string) {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache by tag
   */
  invalidateByTag(tag: string) {
    const tagKey = `tag:${tag}`;
    const taggedKeys = this.cache.get(tagKey)?.data || [];
    taggedKeys.forEach((key: string) => this.cache.delete(key));
    this.cache.delete(tagKey);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let fresh = 0;
    let stale = 0;
    let total = 0;

    this.cache.forEach((entry) => {
      if (entry.expiresAt === Infinity) return; // Skip tag entries
      total++;
      if (entry.expiresAt > now) {
        fresh++;
      } else {
        stale++;
      }
    });

    return {
      total,
      fresh,
      stale,
      hitRate: total > 0 ? fresh / total : 0,
    };
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.expiresAt !== Infinity && entry.expiresAt < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));

    return keysToDelete.length;
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup(interval: number = 60000) {
    return setInterval(() => {
      const deleted = this.cleanup();
      if (deleted > 0) {
        console.log(`Cleaned up ${deleted} expired cache entries`);
      }
    }, interval);
  }
}

export const apiCache = new APICache();

/**
 * Cache key generator
 */
export function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  if (!params) return endpoint;

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${JSON.stringify(params[key])}`)
    .join('&');

  return `${endpoint}?${sortedParams}`;
}

/**
 * React Query cache configuration
 */
export const queryCacheConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
};

/**
 * Cache tags for different resource types
 */
export const CacheTags = {
  COURSES: 'courses',
  USER: 'user',
  ENROLLMENTS: 'enrollments',
  ASSIGNMENTS: 'assignments',
  GRADES: 'grades',
  COMMUNITY: 'community',
  SCROLLCOIN: 'scrollcoin',
  BADGES: 'badges',
  ANALYTICS: 'analytics',
  SPIRITUAL: 'spiritual',
} as const;
