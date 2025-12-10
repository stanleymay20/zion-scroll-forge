/**
 * Performance Monitoring Service
 * Tracks and reports performance metrics for the application
 * Uses lazy initialization to avoid circular dependencies
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceThresholds {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private initialized = false;
  private thresholds: PerformanceThresholds = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    ttfb: 600, // 600ms
  };

  // Lazy initialization - only init when first method is called
  private ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;
    
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        // Observe paint timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetricInternal({
              name: entry.name,
              value: entry.startTime,
              timestamp: Date.now(),
            });
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetricInternal({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            timestamp: Date.now(),
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any;
            this.recordMetricInternal({
              name: 'first-input-delay',
              value: fidEntry.processingStart - fidEntry.startTime,
              timestamp: Date.now(),
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Observe layout shifts
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
          this.recordMetricInternal({
            name: 'cumulative-layout-shift',
            value: clsValue,
            timestamp: Date.now(),
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.error('Failed to initialize performance observers:', error);
      }
    }

    // Monitor resource loading
    this.monitorResourceTiming();
  }

  private monitorResourceTiming() {
    if (typeof window !== 'undefined' && 'performance' in window && 'getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      resources.forEach((resource: any) => {
        this.recordMetricInternal({
          name: 'resource-load-time',
          value: resource.duration,
          timestamp: Date.now(),
          tags: {
            type: resource.initiatorType,
            name: resource.name,
          },
        });
      });
    }
  }

  // Internal method that doesn't trigger initialization
  private recordMetricInternal(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Check thresholds and log warnings
    this.checkThresholds(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      this.sendToAnalytics(metric);
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.ensureInitialized();
    this.recordMetricInternal(metric);
  }

  private checkThresholds(metric: PerformanceMetric) {
    const thresholdMap: Record<string, keyof PerformanceThresholds> = {
      'first-contentful-paint': 'fcp',
      'largest-contentful-paint': 'lcp',
      'first-input-delay': 'fid',
      'cumulative-layout-shift': 'cls',
    };

    const thresholdKey = thresholdMap[metric.name];
    if (thresholdKey && metric.value > this.thresholds[thresholdKey]) {
      console.warn(
        `Performance threshold exceeded for ${metric.name}: ${metric.value}ms (threshold: ${this.thresholds[thresholdKey]}ms)`
      );
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to backend analytics endpoint
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const data = JSON.stringify({
        type: 'performance',
        metric,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      navigator.sendBeacon('/api/analytics/performance', data);
    }
  }

  getMetrics(): PerformanceMetric[] {
    this.ensureInitialized();
    return [...this.metrics];
  }

  getAverageMetric(name: string): number {
    this.ensureInitialized();
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  // Mark custom performance points
  mark(name: string) {
    this.ensureInitialized();
    if (typeof window !== 'undefined' && 'performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  // Measure between two marks
  measure(name: string, startMark: string, endMark: string) {
    this.ensureInitialized();
    if (typeof window !== 'undefined' && 'performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.recordMetricInternal({
          name,
          value: measure.duration,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Failed to measure performance:', error);
      }
    }
  }

  // Get navigation timing
  getNavigationTiming() {
    this.ensureInitialized();
    if (typeof window !== 'undefined' && 'performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
      };
    }
    return null;
  }

  // Report Web Vitals
  reportWebVitals() {
    this.ensureInitialized();
    return {
      fcp: this.getAverageMetric('first-contentful-paint'),
      lcp: this.getAverageMetric('largest-contentful-paint'),
      fid: this.getAverageMetric('first-input-delay'),
      cls: this.getAverageMetric('cumulative-layout-shift'),
      navigation: this.getNavigationTiming(),
    };
  }
}

// Export singleton - now with lazy initialization
export const performanceMonitor = new PerformanceMonitor();
