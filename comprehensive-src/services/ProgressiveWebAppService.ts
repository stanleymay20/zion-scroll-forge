// Progressive Web App Service
// Optimizes ScrollUniversity for low-bandwidth environments
// Requirements: 2.3, 2.5

import {
  PWAConfiguration,
  OfflineCapability,
  CacheStrategy,
  CompressionSettings,
  SyncSettings
} from '../types/global-accessibility';

export interface ServiceWorkerMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface NetworkCondition {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

export interface ContentOptimization {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  optimizationType: string;
}

export class ProgressiveWebAppService {
  private config: PWAConfiguration;
  private serviceWorker: ServiceWorker | null = null;
  private networkCondition: NetworkCondition | null = null;
  private isLowBandwidthMode: boolean = false;

  constructor() {
    this.config = this.getDefaultConfiguration();
    this.detectNetworkConditions();
  }

  /**
   * Initialize Progressive Web App features
   */
  async initialize(): Promise<void> {
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Setup offline capabilities
      await this.setupOfflineCapabilities();
      
      // Configure caching strategies
      await this.configureCaching();
      
      // Setup background sync
      await this.setupBackgroundSync();
      
      // Monitor network conditions
      this.startNetworkMonitoring();
      
      console.log('Progressive Web App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA:', error);
    }
  }

  /**
   * Get default PWA configuration
   */
  private getDefaultConfiguration(): PWAConfiguration {
    return {
      offlineCapabilities: [
        {
          feature: 'course_viewing',
          isAvailable: true,
          fallbackStrategy: 'cached_content',
          dataRequirements: 50 // MB
        },
        {
          feature: 'ai_tutoring',
          isAvailable: true,
          fallbackStrategy: 'offline_ai_model',
          dataRequirements: 200 // MB
        },
        {
          feature: 'assessment_taking',
          isAvailable: true,
          fallbackStrategy: 'local_storage',
          dataRequirements: 5 // MB
        },
        {
          feature: 'progress_tracking',
          isAvailable: true,
          fallbackStrategy: 'local_sync',
          dataRequirements: 10 // MB
        },
        {
          feature: 'xr_experiences',
          isAvailable: false,
          fallbackStrategy: 'static_content',
          dataRequirements: 500 // MB
        }
      ],
      cacheStrategy: {
        maxCacheSize: 1024, // 1GB
        cacheExpiry: 168, // 1 week
        priorityRules: [
          {
            contentType: 'course_content',
            priority: 10,
            maxAge: 336, // 2 weeks
            conditions: ['user_enrolled']
          },
          {
            contentType: 'ai_models',
            priority: 9,
            maxAge: 720, // 1 month
            conditions: ['offline_mode_enabled']
          },
          {
            contentType: 'assessments',
            priority: 8,
            maxAge: 168, // 1 week
            conditions: ['course_active']
          }
        ],
        cleanupThreshold: 85 // percentage
      },
      compressionSettings: {
        videoQuality: 'adaptive',
        audioQuality: 'medium',
        imageCompression: 70,
        textCompression: true
      },
      syncSettings: {
        autoSync: true,
        syncInterval: 30, // minutes
        wifiOnlySync: false,
        backgroundSync: true,
        conflictResolution: 'server'
      },
      lowBandwidthMode: false
    };
  }

  /**
   * Register service worker for offline functionality
   */
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        registration.addEventListener('updatefound', () => {
          console.log('Service worker update found');
        });

        this.serviceWorker = registration.active;
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

        console.log('Service worker registered successfully');
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Setup offline capabilities based on configuration
   */
  private async setupOfflineCapabilities(): Promise<void> {
    for (const capability of this.config.offlineCapabilities) {
      if (capability.isAvailable) {
        await this.enableOfflineCapability(capability);
      }
    }
  }

  /**
   * Enable specific offline capability
   */
  private async enableOfflineCapability(capability: OfflineCapability): Promise<void> {
    switch (capability.feature) {
      case 'course_viewing':
        await this.setupOfflineCourseViewing();
        break;
      case 'ai_tutoring':
        await this.setupOfflineAITutoring();
        break;
      case 'assessment_taking':
        await this.setupOfflineAssessments();
        break;
      case 'progress_tracking':
        await this.setupOfflineProgressTracking();
        break;
      case 'xr_experiences':
        await this.setupOfflineXRExperiences();
        break;
    }
  }

  /**
   * Setup offline course viewing
   */
  private async setupOfflineCourseViewing(): Promise<void> {
    // Cache course content for offline viewing
    await this.sendToServiceWorker({
      type: 'CACHE_COURSES',
      payload: { strategy: 'precache_enrolled' },
      timestamp: new Date()
    });
  }

  /**
   * Setup offline AI tutoring
   */
  private async setupOfflineAITutoring(): Promise<void> {
    // Load lightweight AI model for offline tutoring
    await this.sendToServiceWorker({
      type: 'LOAD_OFFLINE_AI',
      payload: { model: 'scroll_tutor_lite' },
      timestamp: new Date()
    });
  }

  /**
   * Setup offline assessments
   */
  private async setupOfflineAssessments(): Promise<void> {
    // Cache assessment data and enable local storage
    await this.sendToServiceWorker({
      type: 'CACHE_ASSESSMENTS',
      payload: { includeAnswers: false },
      timestamp: new Date()
    });
  }

  /**
   * Setup offline progress tracking
   */
  private async setupOfflineProgressTracking(): Promise<void> {
    // Enable local progress storage with sync queue
    await this.sendToServiceWorker({
      type: 'ENABLE_OFFLINE_PROGRESS',
      payload: { syncOnReconnect: true },
      timestamp: new Date()
    });
  }

  /**
   * Setup offline XR experiences (limited)
   */
  private async setupOfflineXRExperiences(): Promise<void> {
    // Cache static XR content only
    await this.sendToServiceWorker({
      type: 'CACHE_XR_STATIC',
      payload: { quality: 'low' },
      timestamp: new Date()
    });
  }

  /**
   * Configure caching strategies
   */
  private async configureCaching(): Promise<void> {
    const cacheConfig = {
      strategies: this.config.cacheStrategy,
      compression: this.config.compressionSettings
    };

    await this.sendToServiceWorker({
      type: 'CONFIGURE_CACHE',
      payload: cacheConfig,
      timestamp: new Date()
    });
  }

  /**
   * Setup background synchronization
   */
  private async setupBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      await this.sendToServiceWorker({
        type: 'SETUP_BACKGROUND_SYNC',
        payload: this.config.syncSettings,
        timestamp: new Date()
      });
    }
  }

  /**
   * Detect network conditions and adjust accordingly
   */
  private detectNetworkConditions(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.networkCondition = {
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false
      };

      // Enable low bandwidth mode for slow connections
      this.isLowBandwidthMode = this.shouldEnableLowBandwidthMode();
      this.config.lowBandwidthMode = this.isLowBandwidthMode;

      if (this.isLowBandwidthMode) {
        this.applyLowBandwidthOptimizations();
      }
    }
  }

  /**
   * Determine if low bandwidth mode should be enabled
   */
  private shouldEnableLowBandwidthMode(): boolean {
    if (!this.networkCondition) return false;

    return (
      this.networkCondition.effectiveType === 'slow-2g' ||
      this.networkCondition.effectiveType === '2g' ||
      this.networkCondition.downlink < 1.5 ||
      this.networkCondition.saveData
    );
  }

  /**
   * Apply optimizations for low bandwidth environments
   */
  private applyLowBandwidthOptimizations(): void {
    // Reduce video quality
    this.config.compressionSettings.videoQuality = 'low';
    this.config.compressionSettings.audioQuality = 'low';
    this.config.compressionSettings.imageCompression = 50;

    // Enable WiFi-only sync for large content
    this.config.syncSettings.wifiOnlySync = true;

    // Increase cache expiry to reduce network requests
    this.config.cacheStrategy.cacheExpiry = 336; // 2 weeks

    console.log('Low bandwidth mode enabled - optimizations applied');
  }

  /**
   * Start monitoring network conditions
   */
  private startNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      connection.addEventListener('change', () => {
        this.detectNetworkConditions();
        this.adaptToNetworkChange();
      });
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleOnlineStatusChange(false);
    });
  }

  /**
   * Adapt to network condition changes
   */
  private adaptToNetworkChange(): void {
    const wasLowBandwidth = this.isLowBandwidthMode;
    this.isLowBandwidthMode = this.shouldEnableLowBandwidthMode();

    if (this.isLowBandwidthMode && !wasLowBandwidth) {
      this.applyLowBandwidthOptimizations();
      this.sendToServiceWorker({
        type: 'ENABLE_LOW_BANDWIDTH_MODE',
        payload: this.config.compressionSettings,
        timestamp: new Date()
      });
    } else if (!this.isLowBandwidthMode && wasLowBandwidth) {
      this.removeOptimizations();
      this.sendToServiceWorker({
        type: 'DISABLE_LOW_BANDWIDTH_MODE',
        payload: {},
        timestamp: new Date()
      });
    }
  }

  /**
   * Remove bandwidth optimizations when connection improves
   */
  private removeOptimizations(): void {
    this.config.compressionSettings.videoQuality = 'adaptive';
    this.config.compressionSettings.audioQuality = 'medium';
    this.config.compressionSettings.imageCompression = 70;
    this.config.syncSettings.wifiOnlySync = false;
    
    console.log('Network improved - bandwidth optimizations removed');
  }

  /**
   * Handle online/offline status changes
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    if (isOnline) {
      console.log('Connection restored - initiating sync');
      this.sendToServiceWorker({
        type: 'SYNC_ON_RECONNECT',
        payload: {},
        timestamp: new Date()
      });
    } else {
      console.log('Connection lost - switching to offline mode');
      this.sendToServiceWorker({
        type: 'ENABLE_OFFLINE_MODE',
        payload: {},
        timestamp: new Date()
      });
    }

    // Emit event for application to handle
    window.dispatchEvent(new CustomEvent('connectivity-change', {
      detail: { isOnline, networkCondition: this.networkCondition }
    }));
  }

  /**
   * Send message to service worker
   */
  private async sendToServiceWorker(message: ServiceWorkerMessage): Promise<void> {
    if (this.serviceWorker) {
      this.serviceWorker.postMessage(message);
    } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(message: ServiceWorkerMessage): void {
    switch (message.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', message.payload);
        break;
      case 'SYNC_COMPLETED':
        console.log('Background sync completed:', message.payload);
        break;
      case 'OFFLINE_READY':
        console.log('Offline capabilities ready');
        break;
      case 'STORAGE_QUOTA_EXCEEDED':
        console.warn('Storage quota exceeded, cleaning cache');
        this.cleanupCache();
        break;
      default:
        console.log('Service worker message:', message);
    }
  }

  /**
   * Cleanup cache when storage is full
   */
  private async cleanupCache(): Promise<void> {
    await this.sendToServiceWorker({
      type: 'CLEANUP_CACHE',
      payload: { 
        threshold: this.config.cacheStrategy.cleanupThreshold,
        priorityRules: this.config.cacheStrategy.priorityRules
      },
      timestamp: new Date()
    });
  }

  /**
   * Optimize content for current network conditions
   */
  async optimizeContent(content: any, contentType: string): Promise<ContentOptimization> {
    const originalSize = this.calculateContentSize(content);
    let optimizedContent = content;
    let optimizationType = 'none';

    if (this.isLowBandwidthMode) {
      switch (contentType) {
        case 'video':
          optimizedContent = await this.compressVideo(content);
          optimizationType = 'video_compression';
          break;
        case 'image':
          optimizedContent = await this.compressImage(content);
          optimizationType = 'image_compression';
          break;
        case 'text':
          optimizedContent = await this.compressText(content);
          optimizationType = 'text_compression';
          break;
      }
    }

    const optimizedSize = this.calculateContentSize(optimizedContent);
    
    return {
      originalSize,
      optimizedSize,
      compressionRatio: optimizedSize / originalSize,
      optimizationType
    };
  }

  /**
   * Calculate content size
   */
  private calculateContentSize(content: any): number {
    // Simplified size calculation
    return JSON.stringify(content).length;
  }

  /**
   * Compress video content
   */
  private async compressVideo(video: any): Promise<any> {
    // In real implementation, this would use video compression libraries
    return {
      ...video,
      quality: 'low',
      bitrate: '500k',
      resolution: '480p'
    };
  }

  /**
   * Compress image content
   */
  private async compressImage(image: any): Promise<any> {
    // In real implementation, this would use image compression libraries
    return {
      ...image,
      quality: this.config.compressionSettings.imageCompression,
      format: 'webp'
    };
  }

  /**
   * Compress text content
   */
  private async compressText(text: any): Promise<any> {
    // In real implementation, this would use text compression algorithms
    return text; // Placeholder
  }

  /**
   * Get current PWA status
   */
  getStatus(): {
    isInitialized: boolean;
    isOfflineReady: boolean;
    networkCondition: NetworkCondition | null;
    isLowBandwidthMode: boolean;
    cacheUsage: number;
  } {
    return {
      isInitialized: this.serviceWorker !== null,
      isOfflineReady: this.config.offlineCapabilities.some(cap => cap.isAvailable),
      networkCondition: this.networkCondition,
      isLowBandwidthMode: this.isLowBandwidthMode,
      cacheUsage: 0 // Would be calculated from actual cache
    };
  }

  /**
   * Get offline capabilities
   */
  getOfflineCapabilities(): OfflineCapability[] {
    return this.config.offlineCapabilities;
  }

  /**
   * Update PWA configuration
   */
  updateConfiguration(newConfig: Partial<PWAConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Apply configuration changes
    this.sendToServiceWorker({
      type: 'UPDATE_CONFIG',
      payload: this.config,
      timestamp: new Date()
    });
  }
}