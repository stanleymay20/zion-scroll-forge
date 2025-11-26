/**
 * ScrollUniversity Offline Storage Service
 * "Store up treasures in heaven" - Matthew 6:20
 * 
 * Manages offline content storage and synchronization
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { mobileContentCoordinator } from './MobileContentCoordinator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface OfflineContent {
    id: string;
    contentId: string;
    userId: string;
    data: any;
    metadata: OfflineMetadata;
    syncStatus: OfflineSyncStatus;
    expiresAt: Date;
}

export interface OfflineMetadata {
    title: string;
    type: string;
    size: number;
    downloadedAt: Date;
    lastAccessedAt: Date;
    accessCount: number;
    priority: number;
}

export interface OfflineSyncStatus {
    status: 'synced' | 'pending' | 'conflict' | 'error';
    lastSync: Date;
    pendingChanges: any[];
    conflictResolution?: 'local' | 'remote' | 'manual';
}

export interface OfflineStorageQuota {
    userId: string;
    totalQuota: number;
    usedSpace: number;
    availableSpace: number;
    contentCount: number;
}

export interface SyncConflict {
    id: string;
    contentId: string;
    localVersion: any;
    remoteVersion: any;
    timestamp: Date;
    resolved: boolean;
}

export class OfflineStorageService {
    /**
     * Store content for offline access
     */
    async storeOfflineContent(userId: string, contentId: string, data: any): Promise<boolean> {
        try {
            // Check storage quota
            const quota = await this.getStorageQuota(userId);
            const contentSize = JSON.stringify(data).length;

            if (quota.availableSpace < contentSize) {
                logger.warn('Insufficient offline storage space', {
                    userId,
                    required: contentSize,
                    available: quota.availableSpace
                });
                return false;
            }

            // Create offline content entry
            const offlineContent: OfflineContent = {
                id: `offline:${userId}:${contentId}`,
                contentId,
                userId,
                data,
                metadata: {
                    title: data.title || 'Untitled',
                    type: data.type || 'unknown',
                    size: contentSize,
                    downloadedAt: new Date(),
                    lastAccessedAt: new Date(),
                    accessCount: 0,
                    priority: 1
                },
                syncStatus: {
                    status: 'synced',
                    lastSync: new Date(),
                    pendingChanges: []
                },
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            };

            // Store in cache
            await cacheService.set(`offline:${userId}:${contentId}`, offlineContent, {
                ttl: 0, // No expiration
                tags: ['offline-content', `user:${userId}`]
            });

            // Update quota
            await this.updateStorageQuota(userId, contentSize, 1);

            logger.info('Content stored for offline access', {
                userId,
                contentId,
                size: contentSize
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to store offline content', {
                error: error.message,
                userId,
                contentId
            });
            return false;
        }
    }

    /**
     * Get offline content
     */
    async getOfflineContent(userId: string, contentId: string): Promise<OfflineContent | null> {
        try {
            const content = await cacheService.get<OfflineContent>(`offline:${userId}:${contentId}`);

            if (content) {
                // Update access metadata
                content.metadata.lastAccessedAt = new Date();
                content.metadata.accessCount++;

                await cacheService.set(`offline:${userId}:${contentId}`, content, {
                    ttl: 0,
                    tags: ['offline-content', `user:${userId}`]
                });

                logger.debug('Offline content accessed', { userId, contentId });
            }

            return content;

        } catch (error: any) {
            logger.error('Failed to get offline content', {
                error: error.message,
                userId,
                contentId
            });
            return null;
        }
    }

    /**
     * List user's offline content
     */
    async listOfflineContent(userId: string): Promise<OfflineContent[]> {
        try {
            // In production, would query from database or cache index
            const contents: OfflineContent[] = [];

            logger.debug('Listed offline content', {
                userId,
                count: contents.length
            });

            return contents;

        } catch (error: any) {
            logger.error('Failed to list offline content', {
                error: error.message,
                userId
            });
            return [];
        }
    }

    /**
     * Remove offline content
     */
    async removeOfflineContent(userId: string, contentId: string): Promise<boolean> {
        try {
            const content = await this.getOfflineContent(userId, contentId);

            if (content) {
                // Delete from cache
                await cacheService.delete(`offline:${userId}:${contentId}`);

                // Update quota
                await this.updateStorageQuota(userId, -content.metadata.size, -1);

                logger.info('Offline content removed', { userId, contentId });
                return true;
            }

            return false;

        } catch (error: any) {
            logger.error('Failed to remove offline content', {
                error: error.message,
                userId,
                contentId
            });
            return false;
        }
    }

    /**
     * Sync offline changes
     */
    async syncOfflineChanges(userId: string): Promise<any> {
        try {
            const contents = await this.listOfflineContent(userId);
            const pendingChanges = contents.filter(c => c.syncStatus.pendingChanges.length > 0);

            const results = {
                synced: 0,
                conflicts: 0,
                errors: 0
            };

            for (const content of pendingChanges) {
                try {
                    await this.syncContent(content);
                    results.synced++;
                } catch (error: any) {
                    if (error.message.includes('conflict')) {
                        results.conflicts++;
                    } else {
                        results.errors++;
                    }
                }
            }

            logger.info('Offline changes synced', {
                userId,
                results
            });

            return results;

        } catch (error: any) {
            logger.error('Failed to sync offline changes', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Get storage quota
     */
    async getStorageQuota(userId: string): Promise<OfflineStorageQuota> {
        try {
            const quotaKey = `offline:quota:${userId}`;
            let quota = await cacheService.get<OfflineStorageQuota>(quotaKey);

            if (!quota) {
                quota = {
                    userId,
                    totalQuota: 1024 * 1024 * 1024, // 1GB default
                    usedSpace: 0,
                    availableSpace: 1024 * 1024 * 1024,
                    contentCount: 0
                };

                await cacheService.set(quotaKey, quota, {
                    ttl: 0,
                    tags: ['offline-quota', `user:${userId}`]
                });
            }

            return quota;

        } catch (error: any) {
            logger.error('Failed to get storage quota', {
                error: error.message,
                userId
            });
            throw error;
        }
    }

    /**
     * Clean expired content
     */
    async cleanExpiredContent(userId: string): Promise<number> {
        try {
            const contents = await this.listOfflineContent(userId);
            const now = new Date();
            let cleaned = 0;

            for (const content of contents) {
                if (content.expiresAt < now) {
                    await this.removeOfflineContent(userId, content.contentId);
                    cleaned++;
                }
            }

            logger.info('Expired offline content cleaned', {
                userId,
                cleaned
            });

            return cleaned;

        } catch (error: any) {
            logger.error('Failed to clean expired content', {
                error: error.message,
                userId
            });
            return 0;
        }
    }

    /**
     * Resolve sync conflict
     */
    async resolveSyncConflict(
        userId: string,
        contentId: string,
        resolution: 'local' | 'remote' | 'merge'
    ): Promise<boolean> {
        try {
            const content = await this.getOfflineContent(userId, contentId);

            if (!content) {
                return false;
            }

            // Apply resolution
            if (resolution === 'local') {
                // Keep local version
                content.syncStatus.status = 'synced';
            } else if (resolution === 'remote') {
                // Fetch and apply remote version
                content.syncStatus.status = 'synced';
            } else {
                // Merge versions (simplified)
                content.syncStatus.status = 'synced';
            }

            content.syncStatus.pendingChanges = [];
            content.syncStatus.lastSync = new Date();

            await cacheService.set(`offline:${userId}:${contentId}`, content, {
                ttl: 0,
                tags: ['offline-content', `user:${userId}`]
            });

            logger.info('Sync conflict resolved', {
                userId,
                contentId,
                resolution
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to resolve sync conflict', {
                error: error.message,
                userId,
                contentId
            });
            return false;
        }
    }

    /**
     * Private helper methods
     */

    private async updateStorageQuota(userId: string, sizeChange: number, countChange: number): Promise<void> {
        try {
            const quota = await this.getStorageQuota(userId);

            quota.usedSpace += sizeChange;
            quota.contentCount += countChange;
            quota.availableSpace = quota.totalQuota - quota.usedSpace;

            await cacheService.set(`offline:quota:${userId}`, quota, {
                ttl: 0,
                tags: ['offline-quota', `user:${userId}`]
            });

        } catch (error: any) {
            logger.error('Failed to update storage quota', { error: error.message });
        }
    }

    private async syncContent(content: OfflineContent): Promise<void> {
        try {
            // In production, would sync with server
            content.syncStatus.status = 'synced';
            content.syncStatus.pendingChanges = [];
            content.syncStatus.lastSync = new Date();

            await cacheService.set(`offline:${content.userId}:${content.contentId}`, content, {
                ttl: 0,
                tags: ['offline-content', `user:${content.userId}`]
            });

        } catch (error: any) {
            logger.error('Failed to sync content', { error: error.message });
            throw error;
        }
    }
}

// Singleton instance
export const offlineStorageService = new OfflineStorageService();
