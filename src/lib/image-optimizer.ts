/**
 * Image Optimization Utilities
 * Provides lazy loading, responsive images, and optimization features
 */

interface ImageOptimizationOptions {
  lazy?: boolean;
  responsive?: boolean;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  sizes?: string;
  placeholder?: 'blur' | 'empty';
}

interface ResponsiveImageSet {
  srcSet: string;
  sizes: string;
  src: string;
}

class ImageOptimizer {
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.initializeLazyLoading();
    }
  }

  private initializeLazyLoading() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
      this.loadedImages.add(src);
    }

    if (srcset) {
      img.srcset = srcset;
    }

    img.classList.remove('lazy');
    img.classList.add('loaded');
  }

  /**
   * Register an image for lazy loading
   */
  observeImage(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  /**
   * Generate responsive image srcset
   */
  generateResponsiveSet(
    baseUrl: string,
    widths: number[] = [320, 640, 768, 1024, 1280, 1536]
  ): ResponsiveImageSet {
    const srcSet = widths
      .map((width) => `${this.getOptimizedUrl(baseUrl, { width })} ${width}w`)
      .join(', ');

    const sizes = widths
      .map((width, index) => {
        if (index === widths.length - 1) {
          return `${width}px`;
        }
        return `(max-width: ${width}px) ${width}px`;
      })
      .join(', ');

    return {
      srcSet,
      sizes,
      src: this.getOptimizedUrl(baseUrl, { width: widths[0] }),
    };
  }

  /**
   * Get optimized image URL with parameters
   */
  getOptimizedUrl(
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    } = {}
  ): string {
    // If using a CDN, append optimization parameters
    const cdnUrl = process.env.VITE_CDN_URL;
    if (cdnUrl && url.startsWith('/')) {
      const params = new URLSearchParams();
      if (options.width) params.append('w', options.width.toString());
      if (options.height) params.append('h', options.height.toString());
      if (options.quality) params.append('q', options.quality.toString());
      if (options.format) params.append('f', options.format);

      return `${cdnUrl}${url}?${params.toString()}`;
    }

    return url;
  }

  /**
   * Generate blur placeholder data URL
   */
  generateBlurPlaceholder(width: number = 10, height: number = 10): string {
    // Create a tiny canvas for blur placeholder
    if (typeof document === 'undefined') return '';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Fill with a gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Preload critical images
   */
  preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedImages.has(url)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(url);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Preload multiple images
   */
  async preloadImages(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.preloadImage(url)));
  }

  /**
   * Check if image format is supported
   */
  supportsFormat(format: 'webp' | 'avif'): boolean {
    if (typeof document === 'undefined') return false;

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    if (format === 'webp') {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    if (format === 'avif') {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    }

    return false;
  }

  /**
   * Get best supported format
   */
  getBestFormat(): 'avif' | 'webp' | 'jpg' {
    if (this.supportsFormat('avif')) return 'avif';
    if (this.supportsFormat('webp')) return 'webp';
    return 'jpg';
  }

  /**
   * Cleanup observer
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedImages.clear();
  }
}

export const imageOptimizer = new ImageOptimizer();

/**
 * React hook for optimized images
 */
export function useOptimizedImage(
  src: string,
  options: ImageOptimizationOptions = {}
) {
  const {
    lazy = true,
    responsive = true,
    quality = 80,
    format,
    sizes,
    placeholder = 'blur',
  } = options;

  const bestFormat = format || imageOptimizer.getBestFormat();
  const optimizedSrc = imageOptimizer.getOptimizedUrl(src, {
    quality,
    format: bestFormat,
  });

  const responsiveSet = responsive
    ? imageOptimizer.generateResponsiveSet(src)
    : null;

  const blurPlaceholder =
    placeholder === 'blur' ? imageOptimizer.generateBlurPlaceholder() : '';

  return {
    src: lazy ? blurPlaceholder : optimizedSrc,
    'data-src': lazy ? optimizedSrc : undefined,
    srcSet: responsive && !lazy ? responsiveSet?.srcSet : undefined,
    'data-srcset': responsive && lazy ? responsiveSet?.srcSet : undefined,
    sizes: sizes || responsiveSet?.sizes,
    loading: lazy ? ('lazy' as const) : ('eager' as const),
    className: lazy ? 'lazy' : 'loaded',
  };
}
