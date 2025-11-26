/**
 * ScrollUniversity Content Archival Service
 * "Lay up for yourselves treasures in heaven" - Matthew 6:20
 * 
 * Manages historical materials and content archival
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ArchivalPolicy {
    id: string;
    name: string;
    description: string;
    criteria: ArchivalCriteria;
    retentionPeriod: number; // days
    autoArchive: boolean;
    autoDelete: boolean;
}

export interface ArchivalCriteria {
    inactivityDays?: number;
    status?: string[];
    contentType?: string[];
    lastAccessedBefore?: Date;
    createdBefore?: Date;
}

export interface ArchivalRecord {
    id: string;
    contentId: string;
    archivedAt: Date;
    archivedBy: string;
    reason: string;
    policyId?: string;
    metadata: {
        originalStatus: string;
        originalLocation: string;
        archiveLocation: string;
        size: number;
    };
}

export class ContentArchivalService {
    /**
     * Archive content
     */
    async archiveContent(contentId: string, reason: string, archivedBy: string): Promise<ArchivalRecord> {
        try {
            // Get content
            const content = await prisma.$queryRaw`SELECT * FROM generated_content WHERE id = ${contentId}` as any[];

            if (!content || content.length === 0) {
                throw new Error('Content not found');
            }

            // Update content status
            await prisma.$executeRaw`UPDATE generated_content SET status = 'archived', updated_at = NOW() WHERE id = ${contentId}`;

            // Create archival record
            const record: ArchivalRecord = {
                id: this.generateId(),
                contentId,
                archivedAt: new Date(),
                archivedBy,
                reason,
                metadata: {
                    originalStatus: content[0].status,
                    originalLocation: 'active',
                    archiveLocation: 'archive',
                    size: JSON.stringify(content[0]).length
                }
            };

            // Invalidate cache
            await cacheService.invalidateByTags(['content-library']);
            await cacheService.delete(`content:${contentId}`);

            logger.info('Content archived', {
                contentId,
                reason,
                archivedBy
            });

            return record;

        } catch (error: any) {
            logger.error('Failed to archive content', {
                error: error.message,
                contentId
            });
            throw error;
        }
    }

    /**
     * Restore archived content
     */
    async restoreContent(contentId: string, restoredBy: string): Promise<boolean> {
        try {
            // Get content
            const content = await prisma.$queryRaw`SELECT * FROM generated_content WHERE id = ${contentId}` as any[];

            if (!content || content.length === 0) {
                throw new Error('Content not found');
            }

            if (content[0].status !== 'archived') {
                throw new Error('Content is not archived');
            }

            // Restore content status
            await prisma.$executeRaw`UPDATE generated_content SET status = 'published', updated_at = NOW() WHERE id = ${contentId}`;

            // Invalidate cache
            await cacheService.invalidateByTags(['content-library']);
            await cacheService.delete(`content:${contentId}`);

            logger.info('Content restored', {
                contentId,
                restoredBy
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to restore content', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Get archived content
     */
    async getArchivedContent(filters: {
        archivedAfter?: Date;
        archivedBefore?: Date;
        archivedBy?: string;
        contentType?: string;
    } = {}): Promise<any[]> {
        try {
            let query = `SELECT * FROM generated_content WHERE status = 'archived'`;
            const params: any[] = [];

            if (filters.contentType) {
                query += ` AND content_type = $${params.length + 1}`;
                params.push(filters.contentType);
            }

            if (filters.archivedAfter) {
                query += ` AND updated_at >= $${params.length + 1}`;
                params.push(filters.archivedAfter);
            }

            if (filters.archivedBefore) {
                query += ` AND updated_at <= $${params.length + 1}`;
                params.push(filters.archivedBefore);
            }

            query += ` ORDER BY updated_at DESC`;

            const content = await prisma.$queryRawUnsafe(query, ...params) as any[];

            return content;

        } catch (error: any) {
            logger.error('Failed to get archived content', {
                error: error.message,
                filters
            });
            return [];
        }
    }

    /**
     * Create archival policy
     */
    async createArchivalPolicy(policy: Omit<ArchivalPolicy, 'id'>): Promise<ArchivalPolicy> {
        try {
            const newPolicy: ArchivalPolicy = {
                id: this.generateId(),
                ...policy
            };

            // Store policy (in production, would store in database)
            await cacheService.set(`archival:policy:${newPolicy.id}`, newPolicy, {
                ttl: 0, // No expiration
                tags: ['archival-policies']
            });

            logger.info('Archival policy created', {
                policyId: newPolicy.id,
                name: policy.name
            });

            return newPolicy;

        } catch (error: any) {
            logger.error('Failed to create archival policy', {
                error: error.message,
                name: policy.name
            });
            throw error;
        }
    }

    /**
     * Apply archival policy
     */
    async applyArchivalPolicy(policyId: string): Promise<number> {
        try {
            // Get policy
            const policy = await cacheService.get<ArchivalPolicy>(`archival:policy:${policyId}`);
            if (!policy) {
                throw new Error('Policy not found');
            }

            // Find content matching criteria
            const candidates = await this.findArchivalCandidates(policy.criteria);

            let archivedCount = 0;

            for (const content of candidates) {
                if (policy.autoArchive) {
                    await this.archiveContent(
                        content.id,
                        `Auto-archived by policy: ${policy.name}`,
                        'system'
                    );
                    archivedCount++;
                }
            }

            logger.info('Archival policy applied', {
                policyId,
                archivedCount
            });

            return archivedCount;

        } catch (error: any) {
            logger.error('Failed to apply archival policy', {
                error: error.message,
                policyId
            });
            return 0;
        }
    }

    /**
     * Find content eligible for archival
     */
    async findArchivalCandidates(criteria: ArchivalCriteria): Promise<any[]> {
        try {
            let query = `SELECT * FROM generated_content WHERE 1=1`;
            const params: any[] = [];

            if (criteria.status && criteria.status.length > 0) {
                query += ` AND status = ANY($${params.length + 1})`;
                params.push(criteria.status);
            }

            if (criteria.contentType && criteria.contentType.length > 0) {
                query += ` AND content_type = ANY($${params.length + 1})`;
                params.push(criteria.contentType);
            }

            if (criteria.createdBefore) {
                query += ` AND created_at <= $${params.length + 1}`;
                params.push(criteria.createdBefore);
            }

            if (criteria.inactivityDays) {
                const inactiveDate = new Date();
                inactiveDate.setDate(inactiveDate.getDate() - criteria.inactivityDays);
                query += ` AND updated_at <= $${params.length + 1}`;
                params.push(inactiveDate);
            }

            const candidates = await prisma.$queryRawUnsafe(query, ...params) as any[];

            return candidates;

        } catch (error: any) {
            logger.error('Failed to find archival candidates', {
                error: error.message,
                criteria
            });
            return [];
        }
    }

    /**
     * Delete archived content permanently
     */
    async deleteArchivedContent(contentId: string, deletedBy: string): Promise<boolean> {
        try {
            // Verify content is archived
            const content = await prisma.$queryRaw`SELECT * FROM generated_content WHERE id = ${contentId}` as any[];

            if (!content || content.length === 0) {
                throw new Error('Content not found');
            }

            if (content[0].status !== 'archived') {
                throw new Error('Content must be archived before deletion');
            }

            // Delete content
            await prisma.$executeRaw`DELETE FROM generated_content WHERE id = ${contentId}`;

            // Invalidate cache
            await cacheService.invalidateByTags(['content-library']);
            await cacheService.delete(`content:${contentId}`);

            logger.info('Archived content deleted', {
                contentId,
                deletedBy
            });

            return true;

        } catch (error: any) {
            logger.error('Failed to delete archived content', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Get archival statistics
     */
    async getArchivalStatistics(): Promise<any> {
        try {
            const totalResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM generated_content WHERE status = 'archived'` as any[];
            const total = parseInt(totalResult[0]?.count || '0');

            const byType = await prisma.$queryRaw`
                SELECT content_type, COUNT(*) as count 
                FROM generated_content 
                WHERE status = 'archived' 
                GROUP BY content_type
            ` as any[];

            return {
                total,
                byType,
                lastUpdated: new Date()
            };

        } catch (error: any) {
            logger.error('Failed to get archival statistics', {
                error: error.message
            });
            return null;
        }
    }

    /**
     * Export archived content
     */
    async exportArchivedContent(contentIds: string[]): Promise<any> {
        try {
            const content = await prisma.$queryRaw`
                SELECT * FROM generated_content 
                WHERE id = ANY(${contentIds}::uuid[]) AND status = 'archived'
            ` as any[];

            const exportData = {
                exportedAt: new Date(),
                count: content.length,
                content: content.map((c: any) => ({
                    id: c.id,
                    title: c.title,
                    content: c.content,
                    metadata: c.metadata,
                    archivedAt: c.updated_at
                }))
            };

            logger.info('Archived content exported', {
                count: content.length
            });

            return exportData;

        } catch (error: any) {
            logger.error('Failed to export archived content', {
                error: error.message,
                contentIds
            });
            return null;
        }
    }

    // Helper methods

    private generateId(): string {
        return `arch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
export const contentArchivalService = new ContentArchivalService();
