/**
 * ScrollUniversity Content Relationship Manager
 * "As iron sharpens iron, so one person sharpens another." - Proverbs 27:17
 * 
 * Manages dependencies and relationships between content items
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ContentRelationship {
    id: string;
    sourceId: string;
    targetId: string;
    relationshipType: RelationshipType;
    strength: number; // 0-1, how strong the relationship is
    metadata: {
        reason?: string;
        createdBy?: string;
        createdAt: Date;
        validated?: boolean;
    };
}

export enum RelationshipType {
    PREREQUISITE = 'prerequisite', // Target must be completed before source
    RELATED = 'related', // Similar or complementary content
    PART_OF = 'part_of', // Source is part of target (e.g., lecture in module)
    REFERENCES = 'references', // Source references target
    SUPERSEDES = 'supersedes', // Source replaces target (newer version)
    ALTERNATIVE = 'alternative', // Source is alternative to target
    RECOMMENDED = 'recommended' // Source recommends target
}

export interface DependencyGraph {
    nodes: {
        id: string;
        title: string;
        type: string;
    }[];
    edges: {
        source: string;
        target: string;
        type: RelationshipType;
    }[];
}

export class ContentRelationshipManager {
    private relationships: Map<string, ContentRelationship[]> = new Map();

    /**
     * Create relationship between content items
     */
    async createRelationship(data: {
        sourceId: string;
        targetId: string;
        relationshipType: RelationshipType;
        strength?: number;
        reason?: string;
        createdBy?: string;
    }): Promise<ContentRelationship> {
        try {
            // Validate that both content items exist
            const [source, target] = await Promise.all([
                prisma.generated_content.findUnique({ where: { id: data.sourceId } }),
                prisma.generated_content.findUnique({ where: { id: data.targetId } })
            ]);

            if (!source || !target) {
                throw new Error('Source or target content not found');
            }

            // Check for circular dependencies
            if (data.relationshipType === RelationshipType.PREREQUISITE) {
                const hasCircular = await this.checkCircularDependency(data.sourceId, data.targetId);
                if (hasCircular) {
                    throw new Error('Circular dependency detected');
                }
            }

            // Create relationship
            const relationship: ContentRelationship = {
                id: this.generateId(),
                sourceId: data.sourceId,
                targetId: data.targetId,
                relationshipType: data.relationshipType,
                strength: data.strength || 1.0,
                metadata: {
                    reason: data.reason,
                    createdBy: data.createdBy,
                    createdAt: new Date(),
                    validated: false
                }
            };

            // Store in memory (in production, would store in database)
            if (!this.relationships.has(data.sourceId)) {
                this.relationships.set(data.sourceId, []);
            }
            this.relationships.get(data.sourceId)!.push(relationship);

            // Invalidate cache
            await cacheService.invalidate([
                'content-relationships',
                `relationships:${data.sourceId}`,
                `relationships:${data.targetId}`
            ]);

            logger.info('Content relationship created', {
                relationshipId: relationship.id,
                sourceId: data.sourceId,
                targetId: data.targetId,
                type: data.relationshipType
            });

            return relationship;

        } catch (error: any) {
            logger.error('Failed to create content relationship', {
                error: error.message,
                sourceId: data.sourceId,
                targetId: data.targetId
            });
            throw error;
        }
    }

    /**
     * Get relationships for content
     */
    async getRelationships(contentId: string, type?: RelationshipType): Promise<ContentRelationship[]> {
        try {
            // Check cache
            const cacheKey = `relationships:${contentId}:${type || 'all'}`;
            const cached = await cacheService.get<ContentRelationship[]>(cacheKey);
            if (cached) {
                return cached;
            }

            // Get from memory
            let relationships = this.relationships.get(contentId) || [];

            // Filter by type if specified
            if (type) {
                relationships = relationships.filter(r => r.relationshipType === type);
            }

            // Also get relationships where this content is the target
            for (const [sourceId, rels] of this.relationships.entries()) {
                if (sourceId !== contentId) {
                    const targetRels = rels.filter(r => r.targetId === contentId);
                    if (type) {
                        relationships.push(...targetRels.filter(r => r.relationshipType === type));
                    } else {
                        relationships.push(...targetRels);
                    }
                }
            }

            // Cache result
            await cacheService.set(cacheKey, relationships, {
                ttl: 3600,
                tags: ['content-relationships']
            });

            return relationships;

        } catch (error: any) {
            logger.error('Failed to get content relationships', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    /**
     * Get prerequisites for content
     */
    async getPrerequisites(contentId: string): Promise<string[]> {
        try {
            const relationships = await this.getRelationships(contentId, RelationshipType.PREREQUISITE);
            return relationships.map(r => r.targetId);

        } catch (error: any) {
            logger.error('Failed to get prerequisites', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    /**
     * Get related content
     */
    async getRelatedContent(contentId: string, limit: number = 10): Promise<string[]> {
        try {
            const relationships = await this.getRelationships(contentId);
            
            // Sort by strength and get top results
            const sorted = relationships
                .filter(r => r.relationshipType === RelationshipType.RELATED || 
                           r.relationshipType === RelationshipType.RECOMMENDED)
                .sort((a, b) => b.strength - a.strength)
                .slice(0, limit);

            return sorted.map(r => r.sourceId === contentId ? r.targetId : r.sourceId);

        } catch (error: any) {
            logger.error('Failed to get related content', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    /**
     * Get dependency graph for content
     */
    async getDependencyGraph(contentId: string, depth: number = 3): Promise<DependencyGraph> {
        try {
            const visited = new Set<string>();
            const nodes: DependencyGraph['nodes'] = [];
            const edges: DependencyGraph['edges'] = [];

            await this.buildDependencyGraph(contentId, depth, visited, nodes, edges);

            return { nodes, edges };

        } catch (error: any) {
            logger.error('Failed to get dependency graph', {
                error: error.message,
                contentId
            });
            return { nodes: [], edges: [] };
        }
    }

    /**
     * Check if content has unmet prerequisites
     */
    async hasUnmetPrerequisites(contentId: string, completedContentIds: string[]): Promise<boolean> {
        try {
            const prerequisites = await this.getPrerequisites(contentId);
            return prerequisites.some(prereqId => !completedContentIds.includes(prereqId));

        } catch (error: any) {
            logger.error('Failed to check prerequisites', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    /**
     * Get learning path (ordered by prerequisites)
     */
    async getLearningPath(contentIds: string[]): Promise<string[]> {
        try {
            const graph = new Map<string, string[]>();

            // Build prerequisite graph
            for (const contentId of contentIds) {
                const prerequisites = await this.getPrerequisites(contentId);
                graph.set(contentId, prerequisites.filter(p => contentIds.includes(p)));
            }

            // Topological sort
            const sorted: string[] = [];
            const visited = new Set<string>();
            const visiting = new Set<string>();

            const visit = (id: string): void => {
                if (visited.has(id)) return;
                if (visiting.has(id)) {
                    throw new Error('Circular dependency detected');
                }

                visiting.add(id);
                const prerequisites = graph.get(id) || [];
                for (const prereq of prerequisites) {
                    visit(prereq);
                }
                visiting.delete(id);
                visited.add(id);
                sorted.push(id);
            };

            for (const contentId of contentIds) {
                visit(contentId);
            }

            return sorted;

        } catch (error: any) {
            logger.error('Failed to get learning path', {
                error: error.message,
                contentIds
            });
            return contentIds; // Return original order if sorting fails
        }
    }

    /**
     * Update relationship strength
     */
    async updateRelationshipStrength(relationshipId: string, strength: number): Promise<boolean> {
        try {
            // Find and update relationship
            for (const [sourceId, relationships] of this.relationships.entries()) {
                const relationship = relationships.find(r => r.id === relationshipId);
                if (relationship) {
                    relationship.strength = Math.max(0, Math.min(1, strength));
                    
                    await cacheService.invalidate([
                        'content-relationships',
                        `relationships:${sourceId}`,
                        `relationships:${relationship.targetId}`
                    ]);

                    logger.info('Relationship strength updated', {
                        relationshipId,
                        strength
                    });

                    return true;
                }
            }

            return false;

        } catch (error: any) {
            logger.error('Failed to update relationship strength', {
                error: error.message,
                relationshipId
            });
            return false;
        }
    }

    /**
     * Delete relationship
     */
    async deleteRelationship(relationshipId: string): Promise<boolean> {
        try {
            // Find and delete relationship
            for (const [sourceId, relationships] of this.relationships.entries()) {
                const index = relationships.findIndex(r => r.id === relationshipId);
                if (index !== -1) {
                    const relationship = relationships[index];
                    relationships.splice(index, 1);

                    await cacheService.invalidate([
                        'content-relationships',
                        `relationships:${sourceId}`,
                        `relationships:${relationship.targetId}`
                    ]);

                    logger.info('Relationship deleted', { relationshipId });
                    return true;
                }
            }

            return false;

        } catch (error: any) {
            logger.error('Failed to delete relationship', {
                error: error.message,
                relationshipId
            });
            return false;
        }
    }

    /**
     * Discover potential relationships using AI
     */
    async discoverRelationships(contentId: string): Promise<ContentRelationship[]> {
        try {
            // Get content
            const content = await prisma.generated_content.findUnique({
                where: { id: contentId }
            });

            if (!content) {
                return [];
            }

            // Find similar content
            const allContent = await prisma.generated_content.findMany({
                where: {
                    id: { not: contentId },
                    status: 'published'
                },
                take: 100
            });

            const discovered: ContentRelationship[] = [];

            // Simple similarity check (in production, would use AI)
            for (const other of allContent) {
                const similarity = this.calculateSimilarity(
                    content.title + ' ' + content.content,
                    other.title + ' ' + other.content
                );

                if (similarity > 0.7) {
                    discovered.push({
                        id: this.generateId(),
                        sourceId: contentId,
                        targetId: other.id,
                        relationshipType: RelationshipType.RELATED,
                        strength: similarity,
                        metadata: {
                            reason: 'Discovered by similarity analysis',
                            createdAt: new Date(),
                            validated: false
                        }
                    });
                }
            }

            logger.info('Relationships discovered', {
                contentId,
                count: discovered.length
            });

            return discovered;

        } catch (error: any) {
            logger.error('Failed to discover relationships', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    // Helper methods

    private async checkCircularDependency(sourceId: string, targetId: string): Promise<boolean> {
        const visited = new Set<string>();
        const queue = [targetId];

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current === sourceId) {
                return true; // Circular dependency found
            }

            if (visited.has(current)) {
                continue;
            }
            visited.add(current);

            const relationships = await this.getRelationships(current, RelationshipType.PREREQUISITE);
            for (const rel of relationships) {
                queue.push(rel.targetId);
            }
        }

        return false;
    }

    private async buildDependencyGraph(
        contentId: string,
        depth: number,
        visited: Set<string>,
        nodes: DependencyGraph['nodes'],
        edges: DependencyGraph['edges']
    ): Promise<void> {
        if (depth === 0 || visited.has(contentId)) {
            return;
        }

        visited.add(contentId);

        // Get content info
        const content = await prisma.generated_content.findUnique({
            where: { id: contentId }
        });

        if (content) {
            nodes.push({
                id: content.id,
                title: content.title,
                type: content.content_type
            });
        }

        // Get relationships
        const relationships = await this.getRelationships(contentId);

        for (const rel of relationships) {
            edges.push({
                source: rel.sourceId,
                target: rel.targetId,
                type: rel.relationshipType
            });

            // Recursively build graph for related content
            const nextId = rel.sourceId === contentId ? rel.targetId : rel.sourceId;
            await this.buildDependencyGraph(nextId, depth - 1, visited, nodes, edges);
        }
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple Jaccard similarity
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    private generateId(): string {
        return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
export const contentRelationshipManager = new ContentRelationshipManager();
