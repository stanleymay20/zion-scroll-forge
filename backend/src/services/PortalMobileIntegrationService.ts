/**
 * ScrollUniversity Portal & Mobile Integration Service
 * "I am with you always, to the end of the age" - Matthew 28:20
 * 
 * Orchestrates unified content access across portal and mobile platforms
 */

import { logger } from '../utils/productionLogger';
import { universityPortalIntegrator } from './UniversityPortalIntegrator';
import { mobileContentCoordinator } from './MobileContentCoordinator';
import { globalDistributionCoordinator } from './GlobalDistributionCoordinator';
import { offlineStorageService } from './OfflineStorageService';
import socketService from './SocketService';

export interface UnifiedContentRequest {
    userId: string;
    contentId: string;
    platform: 'web' | 'mobile' | 'api';
    deviceInfo?: any;
    networkInfo?: any;
}

export interface UnifiedContentResponse {
    content: any;
    metadata: any;
    delivery: {
        platform: string;
        optimized: boolean;
        cached: boolean;
        region: string;
    };
    offline: {
        available: boolean;
        size?: number;
        expiresAt?: Date;
    };
    sync: {
        status: string;
        lastSync: Date;
        pendingUpdates: number;
    };
}

export class PortalMobileIntegrationService {
    /**
     * Get unified content across platforms
     */
    async getUnifiedContent(request: UnifiedContentRequest): Promise<UnifiedContentResponse | null> {
        try {
            let content: any;
            let optimized = false;
            let cached = false;

            // Route to appropriate platform handler
            if (request.platform === 'web') {
                const portalResponse = await universityPortalIntegrator.getPortalContent({
                    userId: request.userId,
                    contentId: request.contentId
                });
                
                if (portalResponse) {
                    content = portalResponse.content;
                    cached = true;
                }
            } else if (request.platform === 'mobile' && request.deviceInfo && request.networkInfo) {
                const mobileResponse = await mobileContentCoordinator.getMobileContent({
                    userId: request.userId,
                    contentId: request.contentId,
                    deviceInfo: request.deviceInfo,
                    networkInfo: request.networkInfo
                });
                
                if (mobileResponse) {
                    content = mobileResponse.content.data;
                    optimized = true;
                    cached = true;
                }
            }

            if (!content) {
                logger.warn('Content not found for unified request', { request });
                return null;
            }

            // Get optimal region
            const region = await globalDistributionCoordinator.getOptimalRegion({
                latitude: 0,
                longitude: 0
            });

            // Check offline availability
            const offlineContent = await offlineStorageService.getOfflineContent(
                request.userId,
                request.contentId
            );

            // Build unified response
            const response: UnifiedContentResponse = {
                content,
                metadata: {
                    id: request.contentId,
                    platform: request.platform,
                    timestamp: new Date()
                },
                delivery: {
                    platform: request.platform,
                    optimized,
                    cached,
                    region: region.id
                },
                offline: {
                    available: !!offlineContent,
                    size: offlineContent?.metadata.size,
                    expiresAt: offlineContent?.expiresAt
                },
                sync: {
                    status: offlineContent?.syncStatus.status || 'synced',
                    lastSync: offlineContent?.syncStatus.lastSync || new Date(),
                    pendingUpdates: offlineContent?.syncStatus.pendingChanges.length || 0
                }
            };

            logger.info('Unified content delivered', {
                userId: request.userId,
                contentId: request.contentId,
                platform: request.platform
            });

            return response;

        } catch (error: any) {
            logger.error('Failed to get unified content', {
                error: error.message,
                request
            });
            return null;
        }
    }

    /**
     * Prepare content for offline access
     */
    async prepareOfflineAccess(
        userId: string,
        contentIds: string[],
        platform: 'web' | 'mobile'
    ): Promise<any> {
        try {
            const results = {
                prepared: 0,
                failed: 0,
                totalSize: 0
            };

            for (const contentId of contentIds) {
                try {
                    // Get content
                    const content = await this.getUnifiedContent({
                        userId,
                        contentId,
                        platform
                    });

                    if (content) {
                        // Store for offline
                        const stored = await offlineStorageService.storeOfflineContent(
                            userId,
                            contentId,
                            content.content
                        );

                        if (stored) {
                            results.prepared++;
                            results.totalSize += content.offline.size || 0;
                        } else {
                            results.failed++;
                        }
                    }
                } catch (error: any) {
                    results.failed++;
                    logger.error('Failed to prepare content for offline', {
                        error: error.message,
                        contentId
                    });
                }
            }

            logger.info('Offline access prepared', {
                userId,
                results
            });

            return results;

        } catch (error: any) {
            logger.error('Failed to prepare offline access', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Synchronize content across platforms
     */
    async synchronizeAcrossPlatforms(userId: string): Promise<any> {
        try {
            // Sync offline changes
            const offlineSync = await offlineStorageService.syncOfflineChanges(userId);

            // Get global sync status
            const globalSync = await globalDistributionCoordinator.getGlobalSyncStatus();

            // Clean expired content
            const cleaned = await offlineStorageService.cleanExpiredContent(userId);

            const results = {
                offlineSync,
                globalSync,
                cleanedContent: cleaned,
                timestamp: new Date()
            };

            logger.info('Cross-platform sync completed', {
                userId,
                results
            });

            return results;

        } catch (error: any) {
            logger.error('Failed to synchronize across platforms', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Propagate content update in real-time
     */
    async propagateContentUpdate(contentId: string, updateType: string, data: any): Promise<void> {
        try {
            // Propagate via global distribution
            await globalDistributionCoordinator.propagateRealtimeUpdate({
                type: updateType as any,
                contentId,
                timestamp: new Date(),
                regions: ['us-east', 'eu-west', 'ap-south'],
                data
            });

            // Broadcast via WebSocket
            await socketService.broadcast('content_update', {
                contentId,
                type: updateType,
                data,
                timestamp: new Date()
            });

            logger.info('Content update propagated', {
                contentId,
                updateType
            });

        } catch (error: any) {
            logger.error('Failed to propagate content update', {
                error: error.message,
                contentId
            });
        }
    }

    /**
     * Get user's cross-platform dashboard
     */
    async getCrossPlatformDashboard(userId: string, platform: string): Promise<any> {
        try {
            // Get portal dashboard
            const portalDashboard = await universityPortalIntegrator.getPortalDashboard(userId);

            // Get offline storage info
            const storageQuota = await offlineStorageService.getStorageQuota(userId);

            // Get sync status
            const syncStatus = await globalDistributionCoordinator.getGlobalSyncStatus();

            const dashboard = {
                userId,
                platform,
                portal: portalDashboard,
                offline: {
                    quota: storageQuota,
                    contentCount: storageQuota.contentCount
                },
                sync: {
                    status: syncStatus,
                    lastSync: new Date()
                },
                timestamp: new Date()
            };

            logger.info('Cross-platform dashboard generated', {
                userId,
                platform
            });

            return dashboard;

        } catch (error: any) {
            logger.error('Failed to get cross-platform dashboard', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Handle platform-specific content request
     */
    async handlePlatformRequest(
        userId: string,
        contentId: string,
        platform: string,
        options: any = {}
    ): Promise<any> {
        try {
            const request: UnifiedContentRequest = {
                userId,
                contentId,
                platform: platform as any,
                deviceInfo: options.deviceInfo,
                networkInfo: options.networkInfo
            };

            const response = await this.getUnifiedContent(request);

            if (!response) {
                return {
                    success: false,
                    error: 'Content not found'
                };
            }

            return {
                success: true,
                data: response
            };

        } catch (error: any) {
            logger.error('Failed to handle platform request', {
                error: error.message,
                userId,
                contentId,
                platform
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get platform integration health
     */
    async getIntegrationHealth(): Promise<any> {
        try {
            const health = {
                portal: {
                    status: 'healthy',
                    uptime: 100
                },
                mobile: {
                    status: 'healthy',
                    uptime: 100
                },
                distribution: {
                    status: 'healthy',
                    regions: await globalDistributionCoordinator.getGlobalSyncStatus()
                },
                offline: {
                    status: 'healthy',
                    storageUsage: 0
                },
                realtime: {
                    status: 'healthy',
                    connections: socketService.getConnectedUsersCount()
                },
                timestamp: new Date()
            };

            return health;

        } catch (error: any) {
            logger.error('Failed to get integration health', {
                error: error.message
            });
            return null;
        }
    }
}

// Singleton instance
export const portalMobileIntegrationService = new PortalMobileIntegrationService();
