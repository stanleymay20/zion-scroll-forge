/**
 * ScrollUniversity Global Distribution Coordinator
 * "The earth is the Lord's, and everything in it" - Psalm 24:1
 * 
 * Coordinates content synchronization across all platforms globally
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { contentDistributionManager, ChannelType } from './ContentDistributionManager';
import socketService from './SocketService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DistributionRegion {
    id: string;
    name: string;
    code: string;
    endpoints: RegionEndpoints;
    status: 'active' | 'maintenance' | 'offline';
    latency: number;
    load: number;
}

export interface RegionEndpoints {
    api: string;
    cdn: string;
    websocket: string;
}

export interface ContentSyncRequest {
    contentId: string;
    sourceRegion: string;
    targetRegions: string[];
    priority: number;
    immediate: boolean;
}

export interface SyncOperation {
    id: string;
    contentId: string;
    regions: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt: Date;
    completedAt?: Date;
    progress: number;
    errors: string[];
}

export interface GlobalSyncStatus {
    totalContent: number;
    syncedContent: number;
    pendingSync: number;
    failedSync: number;
    lastSync: Date;
    nextSync: Date;
    regions: RegionSyncStatus[];
}

export interface RegionSyncStatus {
    region: string;
    status: 'synced' | 'syncing' | 'out_of_sync';
    lastSync: Date;
    contentCount: number;
    pendingUpdates: number;
}

export interface RealtimeUpdate {
    type: 'content_update' | 'content_delete' | 'content_create';
    contentId: string;
    timestamp: Date;
    regions: string[];
    data: any;
}

export class GlobalDistributionCoordinator {
    private regions: Map<string, DistributionRegion> = new Map();
    private syncQueue: SyncOperation[] = [];

    constructor() {
        this.initializeRegions();
    }

    /**
     * Initialize distribution regions
     */
    private initializeRegions(): void {
        const regions: DistributionRegion[] = [
            {
                id: 'us-east',
                name: 'US East',
                code: 'USE',
                endpoints: {
                    api: 'https://api-us-east.scrolluniversity.com',
                    cdn: 'https://cdn-us-east.scrolluniversity.com',
                    websocket: 'wss://ws-us-east.scrolluniversity.com'
                },
                status: 'active',
                latency: 50,
                load: 0.6
            },
            {
                id: 'eu-west',
                name: 'Europe West',
                code: 'EUW',
                endpoints: {
                    api: 'https://api-eu-west.scrolluniversity.com',
                    cdn: 'https://cdn-eu-west.scrolluniversity.com',
                    websocket: 'wss://ws-eu-west.scrolluniversity.com'
                },
                status: 'active',
                latency: 80,
                load: 0.5
            },
            {
                id: 'ap-south',
                name: 'Asia Pacific South',
                code: 'APS',
                endpoints: {
                    api: 'https://api-ap-south.scrolluniversity.com',
                    cdn: 'https://cdn-ap-south.scrolluniversity.com',
                    websocket: 'wss://ws-ap-south.scrolluniversity.com'
                },
                status: 'active',
                latency: 120,
                load: 0.4
            }
        ];

        regions.forEach(region => this.regions.set(region.id, region));
    }

    /**
     * Synchronize content across regions
     */
    async synchronizeContent(request: ContentSyncRequest): Promise<SyncOperation> {
        try {
            const operation: SyncOperation = {
                id: `sync:${Date.now()}`,
                contentId: request.contentId,
                regions: request.targetRegions,
                status: 'pending',
                startedAt: new Date(),
                progress: 0,
                errors: []
            };

            // Add to sync queue
            this.syncQueue.push(operation);

            // Start sync immediately if requested
            if (request.immediate) {
                await this.executeSyncOperation(operation);
            } else {
                // Schedule for batch sync
                this.scheduleSyncOperation(operation);
            }

            logger.info('Content sync initiated', {
                operationId: operation.id,
                contentId: request.contentId,
                regions: request.targetRegions
            });

            return operation;

        } catch (error: any) {
            logger.error('Failed to synchronize content', {
                error: error.message,
                request
            });
            throw error;
        }
    }

    /**
     * Execute sync operation
     */
    private async executeSyncOperation(operation: SyncOperation): Promise<void> {
        try {
            operation.status = 'in_progress';

            // Get content from source
            const content = await contentDistributionManager.getContentForDelivery(
                operation.contentId,
                ChannelType.CDN
            );

            if (!content) {
                throw new Error('Content not found');
            }

            // Sync to each region
            const results = await Promise.allSettled(
                operation.regions.map(region => this.syncToRegion(operation.contentId, content, region))
            );

            // Calculate progress
            const successful = results.filter(r => r.status === 'fulfilled').length;
            operation.progress = (successful / operation.regions.length) * 100;

            // Collect errors
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    operation.errors.push(`${operation.regions[index]}: ${result.reason}`);
                }
            });

            // Update status
            operation.status = operation.errors.length === 0 ? 'completed' : 'failed';
            operation.completedAt = new Date();

            // Store operation result
            await cacheService.set(`sync:operation:${operation.id}`, operation, {
                ttl: 86400,
                tags: ['sync-operation']
            });

            logger.info('Sync operation completed', {
                operationId: operation.id,
                status: operation.status,
                progress: operation.progress
            });

        } catch (error: any) {
            operation.status = 'failed';
            operation.errors.push(error.message);
            logger.error('Sync operation failed', {
                error: error.message,
                operationId: operation.id
            });
        }
    }

    /**
     * Sync content to specific region
     */
    private async syncToRegion(contentId: string, content: any, regionId: string): Promise<void> {
        try {
            const region = this.regions.get(regionId);
            if (!region) {
                throw new Error(`Region ${regionId} not found`);
            }

            if (region.status !== 'active') {
                throw new Error(`Region ${regionId} is not active`);
            }

            // Store content in region cache
            await cacheService.set(`region:${regionId}:content:${contentId}`, content, {
                ttl: 0, // No expiration
                tags: ['regional-content', `region:${regionId}`]
            });

            // Update region sync status
            await this.updateRegionSyncStatus(regionId, contentId);

            logger.debug('Content synced to region', { contentId, regionId });

        } catch (error: any) {
            logger.error('Failed to sync to region', {
                error: error.message,
                contentId,
                regionId
            });
            throw error;
        }
    }

    /**
     * Propagate real-time updates
     */
    async propagateRealtimeUpdate(update: RealtimeUpdate): Promise<void> {
        try {
            // Broadcast to all connected clients via WebSocket
            await socketService.broadcast('content_update', update);

            // Sync to specified regions
            if (update.regions && update.regions.length > 0) {
                await this.synchronizeContent({
                    contentId: update.contentId,
                    sourceRegion: 'primary',
                    targetRegions: update.regions,
                    priority: 1,
                    immediate: true
                });
            }

            // Invalidate caches
            await this.invalidateRegionalCaches(update.contentId, update.regions);

            logger.info('Real-time update propagated', {
                type: update.type,
                contentId: update.contentId,
                regions: update.regions
            });

        } catch (error: any) {
            logger.error('Failed to propagate real-time update', {
                error: error.message,
                update
            });
        }
    }

    /**
     * Get global sync status
     */
    async getGlobalSyncStatus(): Promise<GlobalSyncStatus> {
        try {
            const regionStatuses: RegionSyncStatus[] = [];

            for (const [regionId, region] of this.regions) {
                const status = await this.getRegionSyncStatus(regionId);
                regionStatuses.push(status);
            }

            const totalContent = regionStatuses.reduce((sum, r) => sum + r.contentCount, 0);
            const pendingSync = regionStatuses.reduce((sum, r) => sum + r.pendingUpdates, 0);

            return {
                totalContent,
                syncedContent: totalContent - pendingSync,
                pendingSync,
                failedSync: 0,
                lastSync: new Date(),
                nextSync: new Date(Date.now() + 3600000), // 1 hour
                regions: regionStatuses
            };

        } catch (error: any) {
            logger.error('Failed to get global sync status', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get optimal region for user
     */
    async getOptimalRegion(userLocation: { latitude: number; longitude: number }): Promise<DistributionRegion> {
        try {
            // Simple implementation - in production would use geolocation and latency
            const activeRegions = Array.from(this.regions.values()).filter(r => r.status === 'active');
            
            // Return region with lowest load
            return activeRegions.reduce((best, current) => 
                current.load < best.load ? current : best
            );

        } catch (error: any) {
            logger.error('Failed to get optimal region', {
                error: error.message
            });
            // Return default region
            return this.regions.get('us-east')!;
        }
    }

    /**
     * Schedule batch sync
     */
    async scheduleBatchSync(contentIds: string[], targetRegions: string[]): Promise<void> {
        try {
            for (const contentId of contentIds) {
                await this.synchronizeContent({
                    contentId,
                    sourceRegion: 'primary',
                    targetRegions,
                    priority: 2,
                    immediate: false
                });
            }

            logger.info('Batch sync scheduled', {
                contentCount: contentIds.length,
                regions: targetRegions
            });

        } catch (error: any) {
            logger.error('Failed to schedule batch sync', {
                error: error.message
            });
        }
    }

    /**
     * Monitor region health
     */
    async monitorRegionHealth(): Promise<void> {
        try {
            for (const [regionId, region] of this.regions) {
                // Check region health
                const health = await this.checkRegionHealth(regionId);
                
                if (!health.healthy) {
                    logger.warn('Region health check failed', {
                        regionId,
                        reason: health.reason
                    });
                    
                    // Update region status
                    region.status = 'offline';
                }
            }

        } catch (error: any) {
            logger.error('Failed to monitor region health', {
                error: error.message
            });
        }
    }

    /**
     * Private helper methods
     */

    private scheduleSyncOperation(operation: SyncOperation): void {
        // In production, would use a job queue
        setTimeout(() => this.executeSyncOperation(operation), 5000);
    }

    private async updateRegionSyncStatus(regionId: string, contentId: string): Promise<void> {
        try {
            const statusKey = `region:${regionId}:sync:status`;
            const status = await cacheService.get<any>(statusKey) || {
                lastSync: new Date(),
                contentCount: 0,
                syncedContent: []
            };

            if (!status.syncedContent.includes(contentId)) {
                status.syncedContent.push(contentId);
                status.contentCount = status.syncedContent.length;
                status.lastSync = new Date();
            }

            await cacheService.set(statusKey, status, {
                ttl: 0,
                tags: ['region-sync-status']
            });

        } catch (error: any) {
            logger.error('Failed to update region sync status', { error: error.message });
        }
    }

    private async getRegionSyncStatus(regionId: string): Promise<RegionSyncStatus> {
        try {
            const statusKey = `region:${regionId}:sync:status`;
            const status = await cacheService.get<any>(statusKey);

            return {
                region: regionId,
                status: 'synced',
                lastSync: status?.lastSync || new Date(),
                contentCount: status?.contentCount || 0,
                pendingUpdates: 0
            };

        } catch (error: any) {
            return {
                region: regionId,
                status: 'out_of_sync',
                lastSync: new Date(),
                contentCount: 0,
                pendingUpdates: 0
            };
        }
    }

    private async invalidateRegionalCaches(contentId: string, regions: string[]): Promise<void> {
        try {
            for (const regionId of regions) {
                await cacheService.delete(`region:${regionId}:content:${contentId}`);
            }
        } catch (error: any) {
            logger.error('Failed to invalidate regional caches', { error: error.message });
        }
    }

    private async checkRegionHealth(regionId: string): Promise<{ healthy: boolean; reason?: string }> {
        try {
            const region = this.regions.get(regionId);
            if (!region) {
                return { healthy: false, reason: 'Region not found' };
            }

            // In production, would ping region endpoints
            return { healthy: true };

        } catch (error: any) {
            return { healthy: false, reason: error.message };
        }
    }
}

// Singleton instance
export const globalDistributionCoordinator = new GlobalDistributionCoordinator();
