/**
 * ScrollUniversity Content Lifecycle Manager
 * "To everything there is a season, and a time to every purpose under heaven" - Ecclesiastes 3:1
 * 
 * Manages content lifecycle from creation to retirement
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { contentArchivalService } from './ContentArchivalService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum ContentLifecycleStage {
    DRAFT = 'draft',
    REVIEW = 'review',
    APPROVED = 'approved',
    PUBLISHED = 'published',
    UPDATED = 'updated',
    DEPRECATED = 'deprecated',
    ARCHIVED = 'archived',
    RETIRED = 'retired'
}

export interface LifecycleTransition {
    id: string;
    contentId: string;
    fromStage: ContentLifecycleStage;
    toStage: ContentLifecycleStage;
    transitionedAt: Date;
    transitionedBy: string;
    reason?: string;
    metadata: {
        approvedBy?: string;
        reviewNotes?: string;
        deprecationReason?: string;
        replacementContentId?: string;
    };
}

export interface LifecyclePolicy {
    id: string;
    name: string;
    description: string;
    rules: LifecycleRule[];
    autoApply: boolean;
}

export interface LifecycleRule {
    condition: {
        stage: ContentLifecycleStage;
        daysInStage?: number;
        usageThreshold?: number;
        qualityScore?: number;
    };
    action: {
        transitionTo: ContentLifecycleStage;
        notify?: string[];
        requireApproval?: boolean;
    };
}

export class ContentLifecycleManager {
    /**
     * Transition content to new lifecycle stage
     */
    async transitionContent(data: {
        contentId: string;
        toStage: ContentLifecycleStage;
        transitionedBy: string;
        reason?: string;
        metadata?: any;
    }): Promise<LifecycleTransition> {
        try {
            // Get current content
            const content = await prisma.$queryRaw`SELECT * FROM generated_content WHERE id = ${data.contentId}` as any[];

            if (!content || content.length === 0) {
                throw new Error('Content not found');
            }

            const fromStage = content[0].status as ContentLifecycleStage;

            // Validate transition
            if (!this.isValidTransition(fromStage, data.toStage)) {
                throw new Error(`Invalid transition from ${fromStage} to ${data.toStage}`);
            }

            // Update content status
            await prisma.$executeRaw`UPDATE generated_content SET status = ${data.toStage}, updated_at = NOW() WHERE id = ${data.contentId}`;

            // Create transition record
            const transition: LifecycleTransition = {
                id: this.generateId(),
                contentId: data.contentId,
                fromStage,
                toStage: data.toStage,
                transitionedAt: new Date(),
                transitionedBy: data.transitionedBy,
                reason: data.reason,
                metadata: data.metadata || {}
            };

            // Handle special transitions
            if (data.toStage === ContentLifecycleStage.ARCHIVED) {
                await contentArchivalService.archiveContent(
                    data.contentId,
                    data.reason || 'Lifecycle transition',
                    data.transitionedBy
                );
            }

            // Invalidate cache
            await cacheService.invalidateByTags(['content-library']);
            await cacheService.delete(`content:${data.contentId}`);

            logger.info('Content lifecycle transition', {
                contentId: data.contentId,
                fromStage,
                toStage: data.toStage,
                transitionedBy: data.transitionedBy
            });

            return transition;

        } catch (error: any) {
            logger.error('Failed to transition content', {
                error: error.message,
                contentId: data.contentId,
                toStage: data.toStage
            });
            throw error;
        }
    }

    /**
     * Get lifecycle history for content
     */
    async getLifecycleHistory(contentId: string): Promise<LifecycleTransition[]> {
        try {
            // In production, would query from database
            // For now, return empty array
            return [];

        } catch (error: any) {
            logger.error('Failed to get lifecycle history', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    /**
     * Get content by lifecycle stage
     */
    async getContentByStage(stage: ContentLifecycleStage): Promise<any[]> {
        try {
            const content = await prisma.$queryRaw`
                SELECT * FROM generated_content 
                WHERE status = ${stage} 
                ORDER BY updated_at DESC
            ` as any[];

            return content;

        } catch (error: any) {
            logger.error('Failed to get content by stage', {
                error: error.message,
                stage
            });
            return [];
        }
    }

    /**
     * Deprecate content
     */
    async deprecateContent(data: {
        contentId: string;
        reason: string;
        replacementContentId?: string;
        deprecatedBy: string;
    }): Promise<boolean> {
        try {
            await this.transitionContent({
                contentId: data.contentId,
                toStage: ContentLifecycleStage.DEPRECATED,
                transitionedBy: data.deprecatedBy,
                reason: data.reason,
                metadata: {
                    deprecationReason: data.reason,
                    replacementContentId: data.replacementContentId
                }
            });

            logger.info('Content deprecated', {
                contentId: data.contentId,
                replacementContentId: data.replacementContentId
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to deprecate content', {
                error: error.message,
                contentId: data.contentId
            });
            return false;
        }
    }

    /**
     * Retire content permanently
     */
    async retireContent(contentId: string, retiredBy: string, reason: string): Promise<boolean> {
        try {
            // Transition to retired stage
            await this.transitionContent({
                contentId,
                toStage: ContentLifecycleStage.RETIRED,
                transitionedBy: retiredBy,
                reason
            });

            // Archive the content
            await contentArchivalService.archiveContent(
                contentId,
                `Retired: ${reason}`,
                retiredBy
            );

            logger.info('Content retired', {
                contentId,
                retiredBy,
                reason
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to retire content', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Create lifecycle policy
     */
    async createLifecyclePolicy(policy: Omit<LifecyclePolicy, 'id'>): Promise<LifecyclePolicy> {
        try {
            const newPolicy: LifecyclePolicy = {
                id: this.generateId(),
                ...policy
            };

            // Store policy
            await cacheService.set(`lifecycle:policy:${newPolicy.id}`, newPolicy, {
                ttl: 0,
                tags: ['lifecycle-policies']
            });

            logger.info('Lifecycle policy created', {
                policyId: newPolicy.id,
                name: policy.name
            });

            return newPolicy;

        } catch (error: any) {
            logger.error('Failed to create lifecycle policy', {
                error: error.message,
                name: policy.name
            });
            throw error;
        }
    }

    /**
     * Apply lifecycle policies
     */
    async applyLifecyclePolicies(): Promise<number> {
        try {
            let transitionsCount = 0;

            // Get all policies (in production, would query from database)
            const policyKeys: string[] = [];
            
            for (const key of policyKeys) {
                const policy = await cacheService.get<LifecyclePolicy>(key);
                if (policy && policy.autoApply) {
                    const count = await this.applyPolicy(policy);
                    transitionsCount += count;
                }
            }

            logger.info('Lifecycle policies applied', {
                transitionsCount
            });

            return transitionsCount;

        } catch (error: any) {
            logger.error('Failed to apply lifecycle policies', {
                error: error.message
            });
            return 0;
        }
    }

    /**
     * Apply single lifecycle policy
     */
    private async applyPolicy(policy: LifecyclePolicy): Promise<number> {
        try {
            let transitionsCount = 0;

            for (const rule of policy.rules) {
                // Find content matching rule conditions
                const candidates = await this.findPolicyCandidates(rule.condition);

                for (const content of candidates) {
                    if (!rule.action.requireApproval) {
                        await this.transitionContent({
                            contentId: content.id,
                            toStage: rule.action.transitionTo,
                            transitionedBy: 'system',
                            reason: `Auto-transitioned by policy: ${policy.name}`
                        });
                        transitionsCount++;
                    }
                }
            }

            return transitionsCount;

        } catch (error: any) {
            logger.error('Failed to apply policy', {
                error: error.message,
                policyId: policy.id
            });
            return 0;
        }
    }

    /**
     * Find content matching policy conditions
     */
    private async findPolicyCandidates(condition: LifecycleRule['condition']): Promise<any[]> {
        try {
            let query = `SELECT * FROM generated_content WHERE status = $1`;
            const params: any[] = [condition.stage];

            if (condition.daysInStage) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - condition.daysInStage);
                query += ` AND updated_at <= $${params.length + 1}`;
                params.push(cutoffDate);
            }

            if (condition.qualityScore) {
                query += ` AND quality_score <= $${params.length + 1}`;
                params.push(condition.qualityScore);
            }

            const candidates = await prisma.$queryRawUnsafe(query, ...params) as any[];

            return candidates;

        } catch (error: any) {
            logger.error('Failed to find policy candidates', {
                error: error.message,
                condition
            });
            return [];
        }
    }

    /**
     * Get lifecycle statistics
     */
    async getLifecycleStatistics(): Promise<any> {
        try {
            const byStage = await prisma.$queryRaw`
                SELECT status, COUNT(*) as count 
                FROM generated_content 
                GROUP BY status
            ` as any[];

            const totalResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM generated_content` as any[];
            const total = parseInt(totalResult[0]?.count || '0');

            return {
                total,
                byStage: byStage.map((s: any) => ({
                    stage: s.status,
                    count: parseInt(s.count)
                })),
                lastUpdated: new Date()
            };

        } catch (error: any) {
            logger.error('Failed to get lifecycle statistics', {
                error: error.message
            });
            return null;
        }
    }

    /**
     * Validate lifecycle transition
     */
    private isValidTransition(from: ContentLifecycleStage, to: ContentLifecycleStage): boolean {
        const validTransitions: Record<ContentLifecycleStage, ContentLifecycleStage[]> = {
            [ContentLifecycleStage.DRAFT]: [
                ContentLifecycleStage.REVIEW,
                ContentLifecycleStage.ARCHIVED
            ],
            [ContentLifecycleStage.REVIEW]: [
                ContentLifecycleStage.DRAFT,
                ContentLifecycleStage.APPROVED,
                ContentLifecycleStage.ARCHIVED
            ],
            [ContentLifecycleStage.APPROVED]: [
                ContentLifecycleStage.PUBLISHED,
                ContentLifecycleStage.DRAFT,
                ContentLifecycleStage.ARCHIVED
            ],
            [ContentLifecycleStage.PUBLISHED]: [
                ContentLifecycleStage.UPDATED,
                ContentLifecycleStage.DEPRECATED,
                ContentLifecycleStage.ARCHIVED
            ],
            [ContentLifecycleStage.UPDATED]: [
                ContentLifecycleStage.PUBLISHED,
                ContentLifecycleStage.DEPRECATED,
                ContentLifecycleStage.ARCHIVED
            ],
            [ContentLifecycleStage.DEPRECATED]: [
                ContentLifecycleStage.ARCHIVED,
                ContentLifecycleStage.RETIRED
            ],
            [ContentLifecycleStage.ARCHIVED]: [
                ContentLifecycleStage.PUBLISHED,
                ContentLifecycleStage.RETIRED
            ],
            [ContentLifecycleStage.RETIRED]: []
        };

        return validTransitions[from]?.includes(to) || false;
    }

    // Helper methods

    private generateId(): string {
        return `lc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
export const contentLifecycleManager = new ContentLifecycleManager();
