/**
 * ScrollUniversity Portal Integrator
 * "Let your light shine before others" - Matthew 5:16
 * 
 * Provides unified content access through the university portal
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { contentDistributionManager, ChannelType } from './ContentDistributionManager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PortalContentRequest {
    userId: string;
    contentId: string;
    courseId?: string;
    moduleId?: string;
    format?: string;
    includeMetadata?: boolean;
}

export interface PortalContentResponse {
    content: any;
    metadata: ContentMetadata;
    accessInfo: AccessInfo;
    relatedContent: RelatedContent[];
    userProgress?: UserProgress;
}

export interface ContentMetadata {
    id: string;
    title: string;
    type: string;
    format: string;
    duration?: number;
    difficulty: string;
    scrollAlignment: number;
    qualityScore: number;
    lastUpdated: Date;
    version: number;
}

export interface AccessInfo {
    hasAccess: boolean;
    accessLevel: string;
    expiresAt?: Date;
    restrictions: string[];
}

export interface RelatedContent {
    id: string;
    title: string;
    type: string;
    relationship: string;
}

export interface UserProgress {
    contentId: string;
    userId: string;
    progress: number;
    completed: boolean;
    lastAccessed: Date;
    timeSpent: number;
}

export interface PortalDashboard {
    userId: string;
    recentContent: ContentMetadata[];
    recommendedContent: ContentMetadata[];
    inProgressContent: ContentMetadata[];
    upcomingDeadlines: Deadline[];
    achievements: Achievement[];
    notifications: Notification[];
}

export interface Deadline {
    contentId: string;
    title: string;
    type: string;
    dueDate: Date;
    priority: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    earnedDate: Date;
    icon: string;
}

export interface Notification {
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export class UniversityPortalIntegrator {
    /**
     * Get content for portal display
     */
    async getPortalContent(request: PortalContentRequest): Promise<PortalContentResponse | null> {
        try {
            // Check cache first
            const cacheKey = `portal:content:${request.userId}:${request.contentId}`;
            const cached = await cacheService.get<PortalContentResponse>(cacheKey);
            
            if (cached) {
                logger.debug('Portal content served from cache', { 
                    userId: request.userId, 
                    contentId: request.contentId 
                });
                return cached;
            }

            // Get content from distribution manager
            const content = await contentDistributionManager.getContentForDelivery(
                request.contentId,
                ChannelType.WEB
            );

            if (!content) {
                logger.warn('Content not found for portal', { contentId: request.contentId });
                return null;
            }

            // Check user access
            const hasAccess = await this.checkUserAccess(request.userId, request.contentId);
            if (!hasAccess) {
                logger.warn('User does not have access to content', {
                    userId: request.userId,
                    contentId: request.contentId
                });
                return null;
            }

            // Build response
            const response: PortalContentResponse = {
                content: content,
                metadata: await this.getContentMetadata(request.contentId),
                accessInfo: await this.getAccessInfo(request.userId, request.contentId),
                relatedContent: await this.getRelatedContent(request.contentId),
                userProgress: await this.getUserProgress(request.userId, request.contentId)
            };

            // Cache response
            await cacheService.set(cacheKey, response, {
                ttl: 1800, // 30 minutes
                tags: ['portal-content', `user:${request.userId}`]
            });

            // Track access
            await this.trackContentAccess(request.userId, request.contentId);

            logger.info('Portal content delivered', {
                userId: request.userId,
                contentId: request.contentId
            });

            return response;

        } catch (error: any) {
            logger.error('Failed to get portal content', {
                error: error.message,
                request
            });
            return null;
        }
    }

    /**
     * Get user's portal dashboard
     */
    async getPortalDashboard(userId: string): Promise<PortalDashboard | null> {
        try {
            // Check cache
            const cacheKey = `portal:dashboard:${userId}`;
            const cached = await cacheService.get<PortalDashboard>(cacheKey);
            
            if (cached) {
                return cached;
            }

            // Build dashboard
            const dashboard: PortalDashboard = {
                userId,
                recentContent: await this.getRecentContent(userId),
                recommendedContent: await this.getRecommendedContent(userId),
                inProgressContent: await this.getInProgressContent(userId),
                upcomingDeadlines: await this.getUpcomingDeadlines(userId),
                achievements: await this.getAchievements(userId),
                notifications: await this.getNotifications(userId)
            };

            // Cache dashboard
            await cacheService.set(cacheKey, dashboard, {
                ttl: 300, // 5 minutes
                tags: ['portal-dashboard', `user:${userId}`]
            });

            logger.info('Portal dashboard generated', { userId });

            return dashboard;

        } catch (error: any) {
            logger.error('Failed to get portal dashboard', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Search portal content
     */
    async searchPortalContent(userId: string, query: string, filters?: any): Promise<ContentMetadata[]> {
        try {
            // Build search query
            const searchResults: ContentMetadata[] = [];

            // In production, would use full-text search or Elasticsearch
            const contents = await prisma.$queryRaw`
                SELECT * FROM generated_content 
                WHERE title ILIKE ${`%${query}%`} 
                OR content ILIKE ${`%${query}%`}
                LIMIT 20
            ` as any[];

            for (const content of contents) {
                // Check access
                const hasAccess = await this.checkUserAccess(userId, content.id);
                if (hasAccess) {
                    searchResults.push(await this.getContentMetadata(content.id));
                }
            }

            logger.info('Portal content search completed', {
                userId,
                query,
                resultsCount: searchResults.length
            });

            return searchResults;

        } catch (error: any) {
            logger.error('Failed to search portal content', {
                error: error.message,
                userId,
                query
            });
            return [];
        }
    }

    /**
     * Update user progress
     */
    async updateUserProgress(userId: string, contentId: string, progress: number): Promise<boolean> {
        try {
            const progressData: UserProgress = {
                contentId,
                userId,
                progress,
                completed: progress >= 100,
                lastAccessed: new Date(),
                timeSpent: 0 // Would track actual time in production
            };

            // Store in cache
            await cacheService.set(`progress:${userId}:${contentId}`, progressData, {
                ttl: 0, // No expiration
                tags: ['user-progress', `user:${userId}`]
            });

            // Invalidate dashboard cache
            await cacheService.delete(`portal:dashboard:${userId}`);

            logger.info('User progress updated', {
                userId,
                contentId,
                progress
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to update user progress', {
                error: error.message,
                userId,
                contentId
            });
            return false;
        }
    }

    /**
     * Get content navigation structure
     */
    async getContentNavigation(userId: string, courseId: string): Promise<any> {
        try {
            const cacheKey = `portal:nav:${userId}:${courseId}`;
            const cached = await cacheService.get(cacheKey);
            
            if (cached) {
                return cached;
            }

            // Build navigation structure
            const navigation = {
                courseId,
                modules: [] as any[]
            };

            // In production, would query course structure
            // For now, return basic structure

            await cacheService.set(cacheKey, navigation, {
                ttl: 3600,
                tags: ['portal-navigation', `user:${userId}`]
            });

            return navigation;

        } catch (error: any) {
            logger.error('Failed to get content navigation', {
                error: error.message,
                userId,
                courseId
            });
            return null;
        }
    }

    /**
     * Private helper methods
     */

    private async checkUserAccess(userId: string, contentId: string): Promise<boolean> {
        try {
            // In production, would check enrollment, permissions, etc.
            return true;
        } catch (error: any) {
            logger.error('Failed to check user access', { error: error.message });
            return false;
        }
    }

    private async getContentMetadata(contentId: string): Promise<ContentMetadata> {
        try {
            const content = await prisma.$queryRaw`
                SELECT * FROM generated_content WHERE id = ${contentId}
            ` as any[];

            if (content && content.length > 0) {
                const c = content[0];
                return {
                    id: c.id,
                    title: c.title,
                    type: c.content_type,
                    format: c.format,
                    difficulty: 'intermediate',
                    scrollAlignment: c.scroll_alignment,
                    qualityScore: c.quality_score,
                    lastUpdated: c.updated_at,
                    version: c.version
                };
            }

            throw new Error('Content not found');

        } catch (error: any) {
            logger.error('Failed to get content metadata', { error: error.message });
            throw error;
        }
    }

    private async getAccessInfo(userId: string, contentId: string): Promise<AccessInfo> {
        return {
            hasAccess: true,
            accessLevel: 'full',
            restrictions: []
        };
    }

    private async getRelatedContent(contentId: string): Promise<RelatedContent[]> {
        return [];
    }

    private async getUserProgress(userId: string, contentId: string): Promise<UserProgress | undefined> {
        try {
            const progress = await cacheService.get<UserProgress>(`progress:${userId}:${contentId}`);
            return progress || undefined;
        } catch (error: any) {
            return undefined;
        }
    }

    private async trackContentAccess(userId: string, contentId: string): Promise<void> {
        try {
            const accessKey = `access:${userId}:${contentId}`;
            const accessCount = await cacheService.get<number>(accessKey) || 0;
            await cacheService.set(accessKey, accessCount + 1, {
                ttl: 86400,
                tags: ['content-access']
            });
        } catch (error: any) {
            logger.error('Failed to track content access', { error: error.message });
        }
    }

    private async getRecentContent(userId: string): Promise<ContentMetadata[]> {
        return [];
    }

    private async getRecommendedContent(userId: string): Promise<ContentMetadata[]> {
        return [];
    }

    private async getInProgressContent(userId: string): Promise<ContentMetadata[]> {
        return [];
    }

    private async getUpcomingDeadlines(userId: string): Promise<Deadline[]> {
        return [];
    }

    private async getAchievements(userId: string): Promise<Achievement[]> {
        return [];
    }

    private async getNotifications(userId: string): Promise<Notification[]> {
        return [];
    }
}

// Singleton instance
export const universityPortalIntegrator = new UniversityPortalIntegrator();
