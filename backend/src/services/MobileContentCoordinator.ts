/**
 * ScrollUniversity Mobile Content Coordinator
 * "Go into all the world" - Mark 16:15
 * 
 * Optimizes content delivery for mobile devices
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { contentDistributionManager, ChannelType } from './ContentDistributionManager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MobileContentRequest {
    userId: string;
    contentId: string;
    deviceInfo: DeviceInfo;
    networkInfo: NetworkInfo;
    offlineMode?: boolean;
}

export interface DeviceInfo {
    platform: 'ios' | 'android' | 'web';
    osVersion: string;
    appVersion: string;
    screenSize: ScreenSize;
    capabilities: DeviceCapabilities;
}

export interface ScreenSize {
    width: number;
    height: number;
    density: number;
}

export interface DeviceCapabilities {
    supportsVideo: boolean;
    supportsAudio: boolean;
    supportsOffline: boolean;
    maxVideoQuality: string;
    storageAvailable: number;
}

export interface NetworkInfo {
    type: 'wifi' | '4g' | '3g' | '2g' | 'offline';
    speed: number; // Mbps
    latency: number; // ms
    metered: boolean;
}

export interface MobileContentResponse {
    content: OptimizedContent;
    downloadInfo: DownloadInfo;
    offlineAvailable: boolean;
    syncStatus: SyncStatus;
}

export interface OptimizedContent {
    id: string;
    format: string;
    data: any;
    size: number;
    quality: string;
    compressionRatio: number;
    optimizations: string[];
}

export interface DownloadInfo {
    totalSize: number;
    downloadedSize: number;
    estimatedTime: number;
    canResume: boolean;
    priority: number;
}

export interface SyncStatus {
    lastSync: Date;
    pendingUpdates: number;
    syncInProgress: boolean;
    nextSync?: Date;
}

export interface OfflinePackage {
    id: string;
    contentIds: string[];
    totalSize: number;
    expiresAt: Date;
    priority: number;
    status: 'pending' | 'downloading' | 'ready' | 'expired';
}

export class MobileContentCoordinator {
    /**
     * Get optimized content for mobile device
     */
    async getMobileContent(request: MobileContentRequest): Promise<MobileContentResponse | null> {
        try {
            // Check cache for mobile-optimized version
            const cacheKey = `mobile:${request.deviceInfo.platform}:${request.contentId}`;
            const cached = await cacheService.get<MobileContentResponse>(cacheKey);
            
            if (cached && !this.needsReoptimization(cached, request)) {
                logger.debug('Mobile content served from cache', {
                    userId: request.userId,
                    contentId: request.contentId
                });
                return cached;
            }

            // Get base content
            const baseContent = await contentDistributionManager.getContentForDelivery(
                request.contentId,
                ChannelType.MOBILE
            );

            if (!baseContent) {
                logger.warn('Content not found for mobile', { contentId: request.contentId });
                return null;
            }

            // Optimize for device and network
            const optimizedContent = await this.optimizeForMobile(
                baseContent,
                request.deviceInfo,
                request.networkInfo
            );

            // Build response
            const response: MobileContentResponse = {
                content: optimizedContent,
                downloadInfo: this.calculateDownloadInfo(optimizedContent, request.networkInfo),
                offlineAvailable: await this.isOfflineAvailable(request.contentId),
                syncStatus: await this.getSyncStatus(request.userId, request.contentId)
            };

            // Cache optimized content
            await cacheService.set(cacheKey, response, {
                ttl: 3600,
                tags: ['mobile-content', `platform:${request.deviceInfo.platform}`]
            });

            logger.info('Mobile content delivered', {
                userId: request.userId,
                contentId: request.contentId,
                platform: request.deviceInfo.platform,
                size: optimizedContent.size
            });

            return response;

        } catch (error: any) {
            logger.error('Failed to get mobile content', {
                error: error.message,
                request
            });
            return null;
        }
    }

    /**
     * Prepare content for offline access
     */
    async prepareOfflineContent(userId: string, contentIds: string[], deviceInfo: DeviceInfo): Promise<OfflinePackage | null> {
        try {
            // Create offline package
            const packageId = `offline:${userId}:${Date.now()}`;
            
            let totalSize = 0;
            const optimizedContents: any[] = [];

            for (const contentId of contentIds) {
                const content = await contentDistributionManager.getContentForDelivery(
                    contentId,
                    ChannelType.OFFLINE
                );

                if (content) {
                    // Optimize for offline
                    const optimized = await this.optimizeForOffline(content, deviceInfo);
                    optimizedContents.push(optimized);
                    totalSize += optimized.size;
                }
            }

            // Check storage availability
            if (totalSize > deviceInfo.capabilities.storageAvailable) {
                logger.warn('Insufficient storage for offline package', {
                    required: totalSize,
                    available: deviceInfo.capabilities.storageAvailable
                });
                return null;
            }

            const offlinePackage: OfflinePackage = {
                id: packageId,
                contentIds,
                totalSize,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                priority: 1,
                status: 'ready'
            };

            // Store package info
            await cacheService.set(`offline:package:${packageId}`, offlinePackage, {
                ttl: 0, // No expiration
                tags: ['offline-package', `user:${userId}`]
            });

            // Store optimized contents
            for (let i = 0; i < contentIds.length; i++) {
                await cacheService.set(
                    `offline:content:${contentIds[i]}`,
                    optimizedContents[i],
                    {
                        ttl: 0,
                        tags: ['offline-content', `package:${packageId}`]
                    }
                );
            }

            logger.info('Offline package prepared', {
                userId,
                packageId,
                contentCount: contentIds.length,
                totalSize
            });

            return offlinePackage;

        } catch (error: any) {
            logger.error('Failed to prepare offline content', {
                error: error.message,
                userId,
                contentIds
            });
            return null;
        }
    }

    /**
     * Sync mobile content updates
     */
    async syncMobileContent(userId: string, deviceInfo: DeviceInfo, lastSync: Date): Promise<any> {
        try {
            // Get content updates since last sync
            const updates = await this.getContentUpdates(userId, lastSync);

            // Optimize updates for mobile
            const optimizedUpdates = await Promise.all(
                updates.map(update => this.optimizeForMobile(
                    update,
                    deviceInfo,
                    { type: 'wifi', speed: 10, latency: 50, metered: false }
                ))
            );

            // Update sync status
            await this.updateSyncStatus(userId, {
                lastSync: new Date(),
                pendingUpdates: 0,
                syncInProgress: false
            });

            logger.info('Mobile content synced', {
                userId,
                updateCount: updates.length
            });

            return {
                updates: optimizedUpdates,
                syncTimestamp: new Date(),
                nextSync: new Date(Date.now() + 3600000) // 1 hour
            };

        } catch (error: any) {
            logger.error('Failed to sync mobile content', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Get mobile app configuration
     */
    async getMobileAppConfig(platform: string, appVersion: string): Promise<any> {
        try {
            const cacheKey = `mobile:config:${platform}:${appVersion}`;
            const cached = await cacheService.get(cacheKey);
            
            if (cached) {
                return cached;
            }

            const config = {
                platform,
                appVersion,
                features: {
                    offlineMode: true,
                    videoStreaming: true,
                    pushNotifications: true,
                    backgroundSync: true
                },
                limits: {
                    maxOfflineContent: 100,
                    maxCacheSize: 1024 * 1024 * 1024, // 1GB
                    maxVideoQuality: '720p'
                },
                endpoints: {
                    api: process.env.API_URL || 'https://api.scrolluniversity.com',
                    cdn: process.env.CDN_URL || 'https://cdn.scrolluniversity.com',
                    websocket: process.env.WS_URL || 'wss://ws.scrolluniversity.com'
                }
            };

            await cacheService.set(cacheKey, config, {
                ttl: 86400,
                tags: ['mobile-config']
            });

            return config;

        } catch (error: any) {
            logger.error('Failed to get mobile app config', {
                error: error.message,
                platform
            });
            return null;
        }
    }

    /**
     * Track mobile analytics
     */
    async trackMobileAnalytics(userId: string, event: string, data: any): Promise<void> {
        try {
            const analyticsKey = `mobile:analytics:${userId}:${event}`;
            const existing = await cacheService.get<any[]>(analyticsKey) || [];
            
            existing.push({
                timestamp: new Date(),
                ...data
            });

            await cacheService.set(analyticsKey, existing, {
                ttl: 86400,
                tags: ['mobile-analytics', `user:${userId}`]
            });

            logger.debug('Mobile analytics tracked', { userId, event });

        } catch (error: any) {
            logger.error('Failed to track mobile analytics', {
                error: error.message,
                userId,
                event
            });
        }
    }

    /**
     * Private helper methods
     */

    private async optimizeForMobile(
        content: any,
        deviceInfo: DeviceInfo,
        networkInfo: NetworkInfo
    ): Promise<OptimizedContent> {
        try {
            const optimizations: string[] = [];
            let optimizedData = content;
            let compressionRatio = 1.0;

            // Optimize based on network conditions
            if (networkInfo.type === '3g' || networkInfo.type === '2g' || networkInfo.metered) {
                optimizations.push('low-bandwidth');
                compressionRatio = 0.5;
            }

            // Optimize based on screen size
            if (deviceInfo.screenSize.width < 768) {
                optimizations.push('mobile-layout');
            }

            // Optimize video quality
            if (content.type === 'video') {
                const quality = this.selectVideoQuality(deviceInfo, networkInfo);
                optimizations.push(`video-${quality}`);
            }

            // Optimize images
            if (content.type === 'image') {
                optimizations.push('image-compression');
                compressionRatio = 0.7;
            }

            const size = JSON.stringify(optimizedData).length * compressionRatio;

            return {
                id: content.id,
                format: content.format || 'mobile',
                data: optimizedData,
                size: Math.floor(size),
                quality: networkInfo.type === 'wifi' ? 'high' : 'medium',
                compressionRatio,
                optimizations
            };

        } catch (error: any) {
            logger.error('Failed to optimize for mobile', { error: error.message });
            throw error;
        }
    }

    private async optimizeForOffline(content: any, deviceInfo: DeviceInfo): Promise<OptimizedContent> {
        return this.optimizeForMobile(
            content,
            deviceInfo,
            { type: 'offline', speed: 0, latency: 0, metered: false }
        );
    }

    private selectVideoQuality(deviceInfo: DeviceInfo, networkInfo: NetworkInfo): string {
        if (networkInfo.type === 'wifi' && deviceInfo.capabilities.maxVideoQuality === '1080p') {
            return '1080p';
        } else if (networkInfo.type === '4g') {
            return '720p';
        } else {
            return '480p';
        }
    }

    private calculateDownloadInfo(content: OptimizedContent, networkInfo: NetworkInfo): DownloadInfo {
        const speedBps = networkInfo.speed * 1024 * 1024; // Convert Mbps to bps
        const estimatedTime = (content.size * 8) / speedBps; // seconds

        return {
            totalSize: content.size,
            downloadedSize: 0,
            estimatedTime: Math.ceil(estimatedTime),
            canResume: true,
            priority: 1
        };
    }

    private needsReoptimization(cached: MobileContentResponse, request: MobileContentRequest): boolean {
        // Check if network conditions have changed significantly
        return false; // Simplified for now
    }

    private async isOfflineAvailable(contentId: string): Promise<boolean> {
        try {
            const offlineContent = await cacheService.get(`offline:content:${contentId}`);
            return !!offlineContent;
        } catch (error: any) {
            return false;
        }
    }

    private async getSyncStatus(userId: string, contentId: string): Promise<SyncStatus> {
        try {
            const status = await cacheService.get<SyncStatus>(`sync:${userId}:${contentId}`);
            return status || {
                lastSync: new Date(),
                pendingUpdates: 0,
                syncInProgress: false
            };
        } catch (error: any) {
            return {
                lastSync: new Date(),
                pendingUpdates: 0,
                syncInProgress: false
            };
        }
    }

    private async getContentUpdates(userId: string, since: Date): Promise<any[]> {
        try {
            // In production, would query for content updates
            return [];
        } catch (error: any) {
            logger.error('Failed to get content updates', { error: error.message });
            return [];
        }
    }

    private async updateSyncStatus(userId: string, status: SyncStatus): Promise<void> {
        try {
            await cacheService.set(`sync:${userId}`, status, {
                ttl: 0,
                tags: ['sync-status', `user:${userId}`]
            });
        } catch (error: any) {
            logger.error('Failed to update sync status', { error: error.message });
        }
    }
}

// Singleton instance
export const mobileContentCoordinator = new MobileContentCoordinator();
