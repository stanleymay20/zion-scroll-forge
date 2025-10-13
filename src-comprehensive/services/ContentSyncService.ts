// Content Pre-caching and Synchronization Service
// Manages offline content and sync for ScrollUniversity
// Requirements: 2.1, 2.3, 2.5

import {
  ContentSyncManifest,
  CourseManifest,
  ResourceManifest,
  SyncItem,
  CachedCourse,
  CachedResource,
  LocalContentStore
} from '../types/global-accessibility';

export interface SyncPriority {
  level: number; // 1-10, 10 being highest
  reason: string;
  estimatedSize: number; // MB
  deadline?: Date;
}

export interface SyncProgress {
  itemId: string;
  progress: number; // 0-100
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'failed';
  error?: string;
  estimatedTimeRemaining: number; // seconds
}

export interface SyncStatistics {
  totalItems: number;
  completedItems: number;
  failedItems: number;
  totalDataSynced: number; // MB
  syncDuration: number; // seconds
  averageSpeed: number; // MB/s
}

export interface ConflictResolution {
  itemId: string;
  conflictType: 'version' | 'content' | 'metadata';
  localVersion: any;
  serverVersion: any;
  resolution: 'use_server' | 'use_local' | 'merge' | 'manual';
  resolvedData?: any;
}

export class ContentSyncService {
  private syncQueue: SyncItem[] = [];
  private activeSync: Map<string, SyncProgress> = new Map();
  private contentStore: LocalContentStore;
  private syncManifest: ContentSyncManifest | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private maxConcurrentSyncs: number = 3;

  constructor() {
    this.contentStore = this.initializeContentStore();
    this.setupEventListeners();
  }

  /**
   * Initialize content store
   */
  private initializeContentStore(): LocalContentStore {
    return {
      totalCapacity: 2048, // 2GB default
      usedCapacity: 0,
      cachedCourses: [],
      cachedResources: [],
      syncQueue: [],
      lastCleanup: new Date()
    };
  }

  /**
   * Setup event listeners for connectivity and storage
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.resumeSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.pauseSync();
    });

    // Listen for storage quota warnings
    window.addEventListener('storage-quota-warning', () => {
      this.performCleanup();
    });
  }

  /**
   * Initialize content synchronization
   */
  async initialize(): Promise<void> {
    try {
      // Load existing content store from IndexedDB
      await this.loadContentStore();
      
      // Download latest sync manifest
      await this.updateSyncManifest();
      
      // Process pending sync items
      await this.processPendingSyncItems();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      console.log('Content sync service initialized');
    } catch (error) {
      console.error('Failed to initialize content sync service:', error);
    }
  }

  /**
   * Load content store from persistent storage
   */
  private async loadContentStore(): Promise<void> {
    try {
      const stored = localStorage.getItem('scrollu_content_store');
      if (stored) {
        this.contentStore = JSON.parse(stored);
        this.contentStore.lastCleanup = new Date(this.contentStore.lastCleanup);
      }
    } catch (error) {
      console.error('Failed to load content store:', error);
    }
  }

  /**
   * Save content store to persistent storage
   */
  private async saveContentStore(): Promise<void> {
    try {
      localStorage.setItem('scrollu_content_store', JSON.stringify(this.contentStore));
    } catch (error) {
      console.error('Failed to save content store:', error);
    }
  }

  /**
   * Update sync manifest from server
   */
  private async updateSyncManifest(): Promise<void> {
    if (!this.isOnline) return;

    try {
      // In real implementation, fetch from server
      const response = await fetch('/api/sync/manifest');
      if (response.ok) {
        this.syncManifest = await response.json();
        console.log('Sync manifest updated');
      }
    } catch (error) {
      console.error('Failed to update sync manifest:', error);
      // Use cached manifest if available
      const cached = localStorage.getItem('scrollu_sync_manifest');
      if (cached) {
        this.syncManifest = JSON.parse(cached);
      }
    }
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: Omit<SyncItem, 'id' | 'lastAttempt'>): Promise<string> {
    const syncItem: SyncItem = {
      ...item,
      id: this.generateSyncId(),
      lastAttempt: new Date()
    };

    this.syncQueue.push(syncItem);
    this.contentStore.syncQueue = this.syncQueue;
    await this.saveContentStore();

    // Start sync if online
    if (this.isOnline) {
      this.processNextSyncItem();
    }

    return syncItem.id;
  }

  /**
   * Pre-cache course content for offline access
   */
  async precacheCourse(courseId: string, priority: SyncPriority = { level: 5, reason: 'user_request', estimatedSize: 100 }): Promise<string> {
    // Check if course is already cached
    const existingCourse = this.contentStore.cachedCourses.find(c => c.courseId === courseId);
    if (existingCourse && existingCourse.syncStatus === 'synced') {
      console.log(`Course ${courseId} already cached`);
      return existingCourse.courseId;
    }

    // Add course to sync queue
    return await this.addToSyncQueue({
      type: 'course',
      action: 'download',
      priority: priority.level,
      retryCount: 0,
      data: { courseId, priority }
    });
  }

  /**
   * Pre-cache resource for offline access
   */
  async precacheResource(resourceId: string, resourceType: string, priority: SyncPriority = { level: 5, reason: 'user_request', estimatedSize: 10 }): Promise<string> {
    // Check if resource is already cached
    const existingResource = this.contentStore.cachedResources.find(r => r.resourceId === resourceId);
    if (existingResource && existingResource.syncStatus === 'synced') {
      console.log(`Resource ${resourceId} already cached`);
      return existingResource.resourceId;
    }

    // Add resource to sync queue
    return await this.addToSyncQueue({
      type: 'course',
      action: 'download',
      priority: priority.level,
      retryCount: 0,
      data: { resourceId, resourceType, priority }
    });
  }

  /**
   * Sync user progress to server
   */
  async syncProgress(progressData: any): Promise<string> {
    return await this.addToSyncQueue({
      type: 'progress',
      action: 'upload',
      priority: 7, // High priority for progress
      retryCount: 0,
      data: progressData
    });
  }

  /**
   * Sync assessment results
   */
  async syncAssessment(assessmentData: any): Promise<string> {
    return await this.addToSyncQueue({
      type: 'assessment',
      action: 'upload',
      priority: 9, // Very high priority for assessments
      retryCount: 0,
      data: assessmentData
    });
  }

  /**
   * Sync user profile updates
   */
  async syncProfile(profileData: any): Promise<string> {
    return await this.addToSyncQueue({
      type: 'profile',
      action: 'update',
      priority: 6,
      retryCount: 0,
      data: profileData
    });
  }

  /**
   * Process pending sync items from previous sessions
   */
  private async processPendingSyncItems(): Promise<void> {
    if (this.contentStore.syncQueue.length > 0) {
      this.syncQueue = [...this.contentStore.syncQueue];
      console.log(`Found ${this.syncQueue.length} pending sync items`);
      
      if (this.isOnline) {
        this.processNextSyncItem();
      }
    }
  }

  /**
   * Start periodic synchronization
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.syncQueue.length > 0) {
        await this.processNextSyncItem();
      }
      
      // Periodic cleanup
      if (this.shouldPerformCleanup()) {
        await this.performCleanup();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Process next item in sync queue
   */
  private async processNextSyncItem(): Promise<void> {
    if (!this.isOnline || this.activeSync.size >= this.maxConcurrentSyncs) {
      return;
    }

    // Sort queue by priority
    this.syncQueue.sort((a, b) => b.priority - a.priority);
    
    const nextItem = this.syncQueue.find(item => !this.activeSync.has(item.id));
    if (!nextItem) return;

    try {
      await this.processSyncItem(nextItem);
    } catch (error) {
      console.error(`Failed to process sync item ${nextItem.id}:`, error);
      await this.handleSyncFailure(nextItem, error as Error);
    }
  }

  /**
   * Process individual sync item
   */
  private async processSyncItem(item: SyncItem): Promise<void> {
    const progress: SyncProgress = {
      itemId: item.id,
      progress: 0,
      status: 'pending',
      estimatedTimeRemaining: 0
    };

    this.activeSync.set(item.id, progress);
    
    try {
      progress.status = 'downloading';
      this.activeSync.set(item.id, progress);

      switch (item.type) {
        case 'course':
          await this.syncCourse(item, progress);
          break;
        case 'progress':
          await this.syncProgressData(item, progress);
          break;
        case 'assessment':
          await this.syncAssessmentData(item, progress);
          break;
        case 'profile':
          await this.syncProfileData(item, progress);
          break;
      }

      progress.status = 'completed';
      progress.progress = 100;
      this.activeSync.set(item.id, progress);

      // Remove from queue
      this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      this.contentStore.syncQueue = this.syncQueue;
      await this.saveContentStore();

      console.log(`Sync completed for item ${item.id}`);
    } catch (error) {
      progress.status = 'failed';
      progress.error = (error as Error).message;
      this.activeSync.set(item.id, progress);
      throw error;
    } finally {
      // Clean up active sync after delay
      setTimeout(() => {
        this.activeSync.delete(item.id);
      }, 5000);
    }
  }

  /**
   * Sync course content
   */
  private async syncCourse(item: SyncItem, progress: SyncProgress): Promise<void> {
    const { courseId } = item.data;
    
    progress.status = 'downloading';
    progress.progress = 10;
    this.activeSync.set(item.id, progress);

    // Download course metadata
    const courseData = await this.downloadCourseData(courseId);
    
    progress.progress = 30;
    this.activeSync.set(item.id, progress);

    // Download course resources
    const resources = await this.downloadCourseResources(courseId, progress);
    
    progress.progress = 80;
    this.activeSync.set(item.id, progress);

    // Store in cache
    const cachedCourse: CachedCourse = {
      courseId,
      title: courseData.title,
      size: this.calculateCourseSize(courseData, resources),
      priority: item.data.priority?.level || 5,
      lastAccessed: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      syncStatus: 'synced'
    };

    this.contentStore.cachedCourses.push(cachedCourse);
    this.contentStore.usedCapacity += cachedCourse.size;

    progress.progress = 100;
    this.activeSync.set(item.id, progress);
  }

  /**
   * Download course data from server
   */
  private async downloadCourseData(courseId: string): Promise<any> {
    // In real implementation, fetch from API
    const response = await fetch(`/api/courses/${courseId}/content`);
    if (!response.ok) {
      throw new Error(`Failed to download course ${courseId}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Download course resources
   */
  private async downloadCourseResources(courseId: string, progress: SyncProgress): Promise<any[]> {
    // In real implementation, download videos, images, documents, etc.
    const resources = [];
    const resourceTypes = ['videos', 'documents', 'images', 'assessments'];
    
    for (let i = 0; i < resourceTypes.length; i++) {
      const resourceType = resourceTypes[i];
      
      try {
        const response = await fetch(`/api/courses/${courseId}/resources/${resourceType}`);
        if (response.ok) {
          const resourceData = await response.json();
          resources.push(...resourceData);
        }
      } catch (error) {
        console.warn(`Failed to download ${resourceType} for course ${courseId}:`, error);
      }

      // Update progress
      const resourceProgress = 30 + (i + 1) / resourceTypes.length * 50;
      progress.progress = resourceProgress;
      this.activeSync.set(progress.itemId, progress);
    }

    return resources;
  }

  /**
   * Calculate course size
   */
  private calculateCourseSize(courseData: any, resources: any[]): number {
    // Simplified size calculation
    let size = JSON.stringify(courseData).length / (1024 * 1024); // Convert to MB
    
    for (const resource of resources) {
      size += resource.size || 1; // Default 1MB if size not specified
    }

    return Math.round(size);
  }

  /**
   * Sync progress data to server
   */
  private async syncProgressData(item: SyncItem, progress: SyncProgress): Promise<void> {
    progress.status = 'downloading';
    progress.progress = 20;
    this.activeSync.set(item.id, progress);

    const response = await fetch('/api/progress/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync progress: ${response.statusText}`);
    }

    progress.progress = 100;
    this.activeSync.set(item.id, progress);
  }

  /**
   * Sync assessment data to server
   */
  private async syncAssessmentData(item: SyncItem, progress: SyncProgress): Promise<void> {
    progress.status = 'downloading';
    progress.progress = 20;
    this.activeSync.set(item.id, progress);

    const response = await fetch('/api/assessments/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync assessment: ${response.statusText}`);
    }

    progress.progress = 100;
    this.activeSync.set(item.id, progress);
  }

  /**
   * Sync profile data to server
   */
  private async syncProfileData(item: SyncItem, progress: SyncProgress): Promise<void> {
    progress.status = 'downloading';
    progress.progress = 20;
    this.activeSync.set(item.id, progress);

    const response = await fetch('/api/profile/sync', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync profile: ${response.statusText}`);
    }

    progress.progress = 100;
    this.activeSync.set(item.id, progress);
  }

  /**
   * Handle sync failure
   */
  private async handleSyncFailure(item: SyncItem, error: Error): Promise<void> {
    item.retryCount++;
    item.lastAttempt = new Date();

    const maxRetries = 3;
    if (item.retryCount < maxRetries) {
      // Exponential backoff
      const delay = Math.pow(2, item.retryCount) * 1000;
      setTimeout(() => {
        if (this.isOnline) {
          this.processNextSyncItem();
        }
      }, delay);
    } else {
      console.error(`Sync failed permanently for item ${item.id}:`, error);
      // Remove from queue after max retries
      this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
      this.contentStore.syncQueue = this.syncQueue;
      await this.saveContentStore();
    }
  }

  /**
   * Resume sync when coming back online
   */
  private resumeSync(): void {
    console.log('Connection restored - resuming sync');
    if (this.syncQueue.length > 0) {
      this.processNextSyncItem();
    }
  }

  /**
   * Pause sync when going offline
   */
  private pauseSync(): void {
    console.log('Connection lost - pausing sync');
    // Active syncs will fail and be retried when online
  }

  /**
   * Check if cleanup should be performed
   */
  private shouldPerformCleanup(): boolean {
    const usagePercentage = (this.contentStore.usedCapacity / this.contentStore.totalCapacity) * 100;
    const timeSinceLastCleanup = Date.now() - this.contentStore.lastCleanup.getTime();
    const daysSinceCleanup = timeSinceLastCleanup / (24 * 60 * 60 * 1000);

    return usagePercentage > 85 || daysSinceCleanup > 7;
  }

  /**
   * Perform cache cleanup
   */
  private async performCleanup(): Promise<void> {
    console.log('Performing cache cleanup');

    // Remove expired courses
    const now = new Date();
    this.contentStore.cachedCourses = this.contentStore.cachedCourses.filter(course => {
      if (course.expiryDate < now) {
        this.contentStore.usedCapacity -= course.size;
        return false;
      }
      return true;
    });

    // Remove least recently accessed courses if still over capacity
    if (this.contentStore.usedCapacity > this.contentStore.totalCapacity * 0.8) {
      this.contentStore.cachedCourses.sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
      
      while (this.contentStore.usedCapacity > this.contentStore.totalCapacity * 0.7 && this.contentStore.cachedCourses.length > 0) {
        const removedCourse = this.contentStore.cachedCourses.shift()!;
        this.contentStore.usedCapacity -= removedCourse.size;
        console.log(`Removed course ${removedCourse.courseId} from cache`);
      }
    }

    this.contentStore.lastCleanup = new Date();
    await this.saveContentStore();
  }

  /**
   * Generate unique sync ID
   */
  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get sync progress for specific item
   */
  getSyncProgress(itemId: string): SyncProgress | null {
    return this.activeSync.get(itemId) || null;
  }

  /**
   * Get all active sync operations
   */
  getActiveSyncs(): SyncProgress[] {
    return Array.from(this.activeSync.values());
  }

  /**
   * Get sync queue status
   */
  getSyncQueueStatus(): {
    totalItems: number;
    pendingItems: number;
    activeItems: number;
    failedItems: number;
  } {
    const failedItems = Array.from(this.activeSync.values()).filter(p => p.status === 'failed').length;
    
    return {
      totalItems: this.syncQueue.length + this.activeSync.size,
      pendingItems: this.syncQueue.length,
      activeItems: this.activeSync.size,
      failedItems
    };
  }

  /**
   * Get content store statistics
   */
  getContentStoreStats(): {
    totalCapacity: number;
    usedCapacity: number;
    availableCapacity: number;
    usagePercentage: number;
    cachedCourses: number;
    cachedResources: number;
  } {
    const availableCapacity = this.contentStore.totalCapacity - this.contentStore.usedCapacity;
    const usagePercentage = (this.contentStore.usedCapacity / this.contentStore.totalCapacity) * 100;

    return {
      totalCapacity: this.contentStore.totalCapacity,
      usedCapacity: this.contentStore.usedCapacity,
      availableCapacity,
      usagePercentage,
      cachedCourses: this.contentStore.cachedCourses.length,
      cachedResources: this.contentStore.cachedResources.length
    };
  }

  /**
   * Check if content is available offline
   */
  isContentAvailableOffline(contentId: string, contentType: 'course' | 'resource'): boolean {
    if (contentType === 'course') {
      return this.contentStore.cachedCourses.some(c => 
        c.courseId === contentId && c.syncStatus === 'synced'
      );
    } else {
      return this.contentStore.cachedResources.some(r => 
        r.resourceId === contentId && r.syncStatus === 'synced'
      );
    }
  }

  /**
   * Force sync of specific content
   */
  async forceSyncContent(contentId: string, contentType: 'course' | 'resource'): Promise<string> {
    const priority: SyncPriority = {
      level: 10,
      reason: 'force_sync',
      estimatedSize: 50
    };

    if (contentType === 'course') {
      return await this.precacheCourse(contentId, priority);
    } else {
      return await this.precacheResource(contentId, 'unknown', priority);
    }
  }

  /**
   * Clear all cached content
   */
  async clearCache(): Promise<void> {
    this.contentStore.cachedCourses = [];
    this.contentStore.cachedResources = [];
    this.contentStore.usedCapacity = 0;
    this.contentStore.lastCleanup = new Date();
    
    await this.saveContentStore();
    console.log('Cache cleared');
  }

  /**
   * Shutdown content sync service
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.activeSync.clear();
    this.saveContentStore();
  }
}