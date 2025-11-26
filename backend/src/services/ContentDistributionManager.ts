/**
 * ScrollUniversity Content Distribution Manager
 * "Go ye into all the world, and preach the gospel" - Mark 16:15
 * 
 * Manages content delivery and access control
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DistributionChannel {
    id: string;
    name: string;
    type: ChannelType;
    enabled: boolean;
    config: {
        endpoint?: string;
        apiKey?: string;
        region?: string;
        priority?: number;
    };
}

export enum ChannelType {
    WEB = 'web',
    MOBILE = 'mobile',
    API = 'api',
    CDN = 'cdn',
    EMAIL = 'email',
    OFFLINE = 'offline'
}

export interface AccessControl {
    contentId: string;
    accessLevel: AccessLevel;
    allowedRoles: string[];
    allowedUsers?: string[];
    restrictions: {
        geographicRestrictions?: string[];
        timeRestrictions?: {
            startDate?: Date;
            endDate?: Date;
        };
        deviceRestrictions?: string[];
    };
}

export enum AccessLevel {
    PUBLIC = 'public',
    AUTHENTICATED = 'authenticated',
    ENROLLED = 'enrolled',
    PREMIUM = 'premium',
    RESTRICTED = 'restricted'
}

export interface DistributionMetrics {
    contentId: string;
    channel: ChannelType;
    deliveries: number;
    successRate: number;
    averageLatency: number;
    bandwidth: number;
    lastDelivery: Date;
}

export class ContentDistributionManager {
    /**
     * Distribute content to channels
     */
    async distributeContent(contentId: string, channels: ChannelType[]): Promise<boolean> {
        try {
            // Get content
            const content = await prisma.$queryRaw`SELECT * FROM generated_content WHERE id = ${contentId}` as any[];

            if (!content || content.length === 0) {
                throw new Error('Content not found');
            }

            // Distribute to each channel
            const results = await Promise.all(
                channels.map(channel => this.distributeToChannel(contentId, content[0], channel))
            );

            const success = results.every(r => r);

            logger.info('Content distributed', {
                contentId,
                channels,
                success
            });

            return success;

        } catch (error: any) {
            logger.error('Failed to distribute content', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Distribute to specific channel
     */
    private async distributeToChannel(contentId: string, content: any, channel: ChannelType): Promise<boolean> {
        try {
            switch (channel) {
                case ChannelType.WEB:
                    return await this.distributeToWeb(contentId, content);
                case ChannelType.MOBILE:
                    return await this.distributeToMobile(contentId, content);
                case ChannelType.CDN:
                    return await this.distributeToCDN(contentId, content);
                case ChannelType.API:
                    return await this.distributeToAPI(contentId, content);
                case ChannelType.OFFLINE:
                    return await this.distributeToOffline(contentId, content);
                default:
                    return true;
            }

        } catch (error: any) {
            logger.error('Failed to distribute to channel', {
                error: error.message,
                contentId,
                channel
            });
            return false;
        }
    }

    /**
     * Distribute to web platform
     */
    private async distributeToWeb(contentId: string, content: any): Promise<boolean> {
        try {
            // Cache content for web delivery
            await cacheService.set(`web:content:${contentId}`, content, {
                ttl: 3600,
                tags: ['web-content']
            });

            logger.debug('Content distributed to web', { contentId });
            return true;

        } catch (error: any) {
            logger.error('Failed to distribute to web', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Distribute to mobile platform
     */
    private async distributeToMobile(contentId: string, content: any): Promise<boolean> {
        try {
            // Optimize content for mobile
            const mobileContent = {
                ...content,
                optimized: true,
                format: 'mobile'
            };

            await cacheService.set(`mobile:content:${contentId}`, mobileContent, {
                ttl: 3600,
                tags: ['mobile-content']
            });

            logger.debug('Content distributed to mobile', { contentId });
            return true;

        } catch (error: any) {
            logger.error('Failed to distribute to mobile', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Distribute to CDN
     */
    private async distributeToCDN(contentId: string, content: any): Promise<boolean> {
        try {
            // In production, would upload to CDN
            logger.debug('Content distributed to CDN', { contentId });
            return true;

        } catch (error: any) {
            logger.error('Failed to distribute to CDN', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Distribute to API
     */
    private async distributeToAPI(contentId: string, content: any): Promise<boolean> {
        try {
            // Make content available via API
            await cacheService.set(`api:content:${contentId}`, content, {
                ttl: 3600,
                tags: ['api-content']
            });

            logger.debug('Content distributed to API', { contentId });
            return true;

        } catch (error: any) {
            logger.error('Failed to distribute to API', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Distribute for offline access
     */
    private async distributeToOffline(contentId: string, content: any): Promise<boolean> {
        try {
            // Prepare content for offline sync
            const offlineContent = {
                ...content,
                offline: true,
                syncVersion: Date.now()
            };

            await cacheService.set(`offline:content:${contentId}`, offlineContent, {
                ttl: 86400, // 24 hours
                tags: ['offline-content']
            });

            logger.debug('Content distributed for offline', { contentId });
            return true;

        } catch (error: any) {
            logger.error('Failed to distribute for offline', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Set access control for content
     */
    async setAccessControl(accessControl: AccessControl): Promise<boolean> {
        try {
            // Store access control rules
            await cacheService.set(`access:${accessControl.contentId}`, accessControl, {
                ttl: 0, // No expiration
                tags: ['access-control']
            });

            logger.info('Access control set', {
                contentId: accessControl.contentId,
                accessLevel: accessControl.accessLevel
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to set access control', {
                error: error.message,
                contentId: accessControl.contentId
            });
            return false;
        }
    }

    /**
     * Check if user has access to content
     */
    async checkAccess(contentId: string, userId: string, userRoles: string[]): Promise<boolean> {
        try {
            // Get access control rules
            const accessControl = await cacheService.get<AccessControl>(`access:${contentId}`);
            
            if (!accessControl) {
                // No access control means public access
                return true;
            }

            // Check access level
            if (accessControl.accessLevel === AccessLevel.PUBLIC) {
                return true;
            }

            // Check role-based access
            const hasRole = accessControl.allowedRoles.some(role => userRoles.includes(role));
            if (hasRole) {
                return true;
            }

            // Check user-specific access
            if (accessControl.allowedUsers?.includes(userId)) {
                return true;
            }

            return false;

        } catch (error: any) {
            logger.error('Failed to check access', {
                error: error.message,
                contentId,
                userId
            });
            return false;
        }
    }

    /**
     * Get content for delivery
     */
    async getContentForDelivery(contentId: string, channel: ChannelType): Promise<any> {
        try {
            // Get from appropriate cache
            const cacheKey = `${channel}:content:${contentId}`;
            const content = await cacheService.get(cacheKey);

            if (content) {
                // Track delivery
                await this.trackDelivery(contentId, channel);
                return content;
            }

            // Fallback to database
            const dbContent = await prisma.$queryRaw`SELECT * FROM generated_content WHERE id = ${contentId}` as any[];

            if (dbContent && dbContent.length > 0) {
                // Distribute to channel
                await this.distributeToChannel(contentId, dbContent[0], channel);
                await this.trackDelivery(contentId, channel);
                return dbContent[0];
            }

            return null;

        } catch (error: any) {
            logger.error('Failed to get content for delivery', {
                error: error.message,
                contentId,
                channel
            });
            return null;
        }
    }

    /**
     * Track content delivery
     */
    private async trackDelivery(contentId: string, channel: ChannelType): Promise<void> {
        try {
            const metricsKey = `metrics:${contentId}:${channel}`;
            const metrics = await cacheService.get<DistributionMetrics>(metricsKey) || {
                contentId,
                channel,
                deliveries: 0,
                successRate: 1.0,
                averageLatency: 0,
                bandwidth: 0,
                lastDelivery: new Date()
            };

            metrics.deliveries++;
            metrics.lastDelivery = new Date();

            await cacheService.set(metricsKey, metrics, {
                ttl: 86400,
                tags: ['distribution-metrics']
            });

        } catch (error: any) {
            logger.error('Failed to track delivery', {
                error: error.message,
                contentId,
                channel
            });
        }
    }

    /**
     * Get distribution metrics
     */
    async getDistributionMetrics(contentId: string): Promise<DistributionMetrics[]> {
        try {
            const metrics: DistributionMetrics[] = [];

            for (const channel of Object.values(ChannelType)) {
                const metricsKey = `metrics:${contentId}:${channel}`;
                const channelMetrics = await cacheService.get<DistributionMetrics>(metricsKey);
                if (channelMetrics) {
                    metrics.push(channelMetrics);
                }
            }

            return metrics;

        } catch (error: any) {
            logger.error('Failed to get distribution metrics', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    /**
     * Invalidate distributed content
     */
    async invalidateContent(contentId: string, channels?: ChannelType[]): Promise<boolean> {
        try {
            const targetChannels = channels || Object.values(ChannelType);

            for (const channel of targetChannels) {
                await cacheService.delete(`${channel}:content:${contentId}`);
            }

            logger.info('Distributed content invalidated', {
                contentId,
                channels: targetChannels
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to invalidate content', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Get distribution statistics
     */
    async getDistributionStatistics(): Promise<any> {
        try {
            const stats: any = {
                byChannel: {},
                totalDeliveries: 0,
                lastUpdated: new Date()
            };

            for (const channel of Object.values(ChannelType)) {
                const channelStats = {
                    deliveries: 0,
                    uniqueContent: 0
                };

                // Would aggregate from metrics in production
                stats.byChannel[channel] = channelStats;
            }

            return stats;

        } catch (error: any) {
            logger.error('Failed to get distribution statistics', {
                error: error.message
            });
            return null;
        }
    }
}

// Singleton instance
export const contentDistributionManager = new ContentDistributionManager();
