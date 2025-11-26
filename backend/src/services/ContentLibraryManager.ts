/**
 * ScrollUniversity Content Library Manager
 * "Every scribe instructed concerning the kingdom of heaven is like a householder
 * who brings out of his treasure things new and old." - Matthew 13:52
 * 
 * Manages comprehensive content library with searchable categorization and metadata
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { vectorStoreService } from './VectorStoreService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ContentMetadata {
    id: string;
    title: string;
    description: string;
    contentType: ContentType;
    format: ContentFormat;
    category: string;
    subcategory?: string;
    tags: string[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    status: ContentStatus;
    language: string;
    difficulty: DifficultyLevel;
    estimatedDuration?: number; // in minutes
    prerequisites?: string[];
    learningObjectives?: string[];
    spiritualThemes?: string[];
    biblicalReferences?: string[];
    targetAudience?: string[];
    accessLevel: AccessLevel;
    fileSize?: number;
    fileUrl?: string;
    thumbnailUrl?: string;
}

export enum ContentType {
    LECTURE = 'lecture',
    READING = 'reading',
    VIDEO = 'video',
    AUDIO = 'audio',
    ASSESSMENT = 'assessment',
    EXERCISE = 'exercise',
    RESOURCE = 'resource',
    MULTIMEDIA = 'multimedia'
}

export enum ContentFormat {
    TEXT = 'text',
    VIDEO = 'video',
    AUDIO = 'audio',
    PDF = 'pdf',
    INTERACTIVE = 'interactive',
    PRESENTATION = 'presentation'
}

export enum ContentStatus {
    DRAFT = 'draft',
    REVIEW = 'review',
    APPROVED = 'approved',
    PUBLISHED = 'published',
    ARCHIVED = 'archived'
}

export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

export enum AccessLevel {
    PUBLIC = 'public',
    ENROLLED = 'enrolled',
    PREMIUM = 'premium',
    RESTRICTED = 'restricted'
}

export interface SearchFilters {
    contentType?: ContentType[];
    format?: ContentFormat[];
    category?: string[];
    tags?: string[];
    status?: ContentStatus[];
    language?: string[];
    difficulty?: DifficultyLevel[];
    accessLevel?: AccessLevel[];
    dateFrom?: Date;
    dateTo?: Date;
    author?: string;
}

export interface SearchOptions {
    query?: string;
    filters?: SearchFilters;
    sortBy?: 'relevance' | 'date' | 'title' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
    includeArchived?: boolean;
}

export interface SearchResults {
    items: ContentMetadata[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export class ContentLibraryManager {
    /**
     * Add content to library with metadata
     */
    async addContent(metadata: Omit<ContentMetadata, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentMetadata> {
        try {
            // Create content record in database
            const content = await prisma.generated_content.create({
                data: {
                    request_id: metadata.id || '',
                    content_type: metadata.contentType,
                    format: metadata.format,
                    title: metadata.title,
                    content: metadata.description,
                    metadata: {
                        category: metadata.category,
                        subcategory: metadata.subcategory,
                        tags: metadata.tags,
                        author: metadata.author,
                        language: metadata.language,
                        difficulty: metadata.difficulty,
                        estimatedDuration: metadata.estimatedDuration,
                        prerequisites: metadata.prerequisites,
                        learningObjectives: metadata.learningObjectives,
                        spiritualThemes: metadata.spiritualThemes,
                        biblicalReferences: metadata.biblicalReferences,
                        targetAudience: metadata.targetAudience,
                        accessLevel: metadata.accessLevel,
                        fileSize: metadata.fileSize,
                        fileUrl: metadata.fileUrl,
                        thumbnailUrl: metadata.thumbnailUrl
                    },
                    scroll_alignment: 0.95,
                    quality_score: 0.90,
                    sources: [],
                    biblical_references: metadata.biblicalReferences || [],
                    spiritual_applications: [],
                    learning_objectives: metadata.learningObjectives || [],
                    assessment_hooks: [],
                    version: metadata.version,
                    status: metadata.status
                }
            });

            // Index in vector store for semantic search
            await vectorStoreService.ingestDocument({
                id: content.id,
                content: `${metadata.title} ${metadata.description}`,
                metadata: {
                    type: 'resource',
                    title: metadata.title,
                    author: metadata.author,
                    tags: metadata.tags,
                    date: new Date()
                }
            });

            // Invalidate cache
            await cacheService.invalidate(['content-library']);

            logger.info('Content added to library', {
                contentId: content.id,
                title: metadata.title,
                type: metadata.contentType
            });

            return this.mapToMetadata(content);

        } catch (error: any) {
            logger.error('Failed to add content to library', {
                error: error.message,
                title: metadata.title
            });
            throw error;
        }
    }

    /**
     * Update content metadata
     */
    async updateContent(id: string, updates: Partial<ContentMetadata>): Promise<ContentMetadata> {
        try {
            const content = await prisma.generated_content.update({
                where: { id },
                data: {
                    title: updates.title,
                    content: updates.description,
                    metadata: updates as any,
                    version: updates.version,
                    status: updates.status,
                    updated_at: new Date()
                }
            });

            // Update vector store
            if (updates.title || updates.description) {
                await vectorStoreService.updateDocument(id, {
                    id,
                    content: `${updates.title || ''} ${updates.description || ''}`,
                    metadata: {
                        type: 'resource',
                        title: updates.title || '',
                        author: updates.author || '',
                        tags: updates.tags || [],
                        date: new Date()
                    }
                });
            }

            // Invalidate cache
            await cacheService.invalidate(['content-library', `content:${id}`]);

            logger.info('Content updated in library', {
                contentId: id,
                updates: Object.keys(updates)
            });

            return this.mapToMetadata(content);

        } catch (error: any) {
            logger.error('Failed to update content', {
                error: error.message,
                contentId: id
            });
            throw error;
        }
    }

    /**
     * Get content by ID
     */
    async getContent(id: string): Promise<ContentMetadata | null> {
        try {
            // Check cache
            const cacheKey = `content:${id}`;
            const cached = await cacheService.get<ContentMetadata>(cacheKey);
            if (cached) {
                return cached;
            }

            const content = await prisma.generated_content.findUnique({
                where: { id }
            });

            if (!content) {
                return null;
            }

            const metadata = this.mapToMetadata(content);

            // Cache result
            await cacheService.set(cacheKey, metadata, {
                ttl: 3600,
                tags: ['content-library']
            });

            return metadata;

        } catch (error: any) {
            logger.error('Failed to get content', {
                error: error.message,
                contentId: id
            });
            return null;
        }
    }

    /**
     * Search content library
     */
    async searchContent(options: SearchOptions = {}): Promise<SearchResults> {
        try {
            const {
                query,
                filters = {},
                sortBy = 'relevance',
                sortOrder = 'desc',
                page = 1,
                pageSize = 20,
                includeArchived = false
            } = options;

            // Build cache key
            const cacheKey = `content:search:${JSON.stringify(options)}`;
            const cached = await cacheService.get<SearchResults>(cacheKey);
            if (cached) {
                return cached;
            }

            let results: ContentMetadata[] = [];

            // Use semantic search if query provided
            if (query) {
                const vectorResults = await vectorStoreService.search(query, {
                    topK: 100,
                    filter: this.buildVectorFilter(filters)
                });

                // Get full metadata for results
                const contentIds = vectorResults.map(r => r.id);
                const contents = await prisma.generated_content.findMany({
                    where: {
                        id: { in: contentIds }
                    }
                });

                results = contents.map(c => this.mapToMetadata(c));
            } else {
                // Use database search
                const where = this.buildDatabaseFilter(filters, includeArchived);
                
                const contents = await prisma.generated_content.findMany({
                    where,
                    orderBy: this.buildOrderBy(sortBy, sortOrder),
                    skip: (page - 1) * pageSize,
                    take: pageSize
                });

                results = contents.map(c => this.mapToMetadata(c));
            }

            // Apply filters
            results = this.applyFilters(results, filters);

            // Sort results
            results = this.sortResults(results, sortBy, sortOrder);

            // Paginate
            const total = results.length;
            const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

            const searchResults: SearchResults = {
                items: paginatedResults,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };

            // Cache results
            await cacheService.set(cacheKey, searchResults, {
                ttl: 600,
                tags: ['content-library']
            });

            logger.info('Content search completed', {
                query,
                resultsCount: total,
                page
            });

            return searchResults;

        } catch (error: any) {
            logger.error('Content search failed', {
                error: error.message,
                options
            });
            throw error;
        }
    }

    /**
     * Get content by category
     */
    async getByCategory(category: string, subcategory?: string): Promise<ContentMetadata[]> {
        try {
            const where: any = {
                metadata: {
                    path: ['category'],
                    equals: category
                },
                status: ContentStatus.PUBLISHED
            };

            if (subcategory) {
                where.metadata = {
                    path: ['subcategory'],
                    equals: subcategory
                };
            }

            const contents = await prisma.generated_content.findMany({
                where,
                orderBy: { created_at: 'desc' }
            });

            return contents.map(c => this.mapToMetadata(c));

        } catch (error: any) {
            logger.error('Failed to get content by category', {
                error: error.message,
                category,
                subcategory
            });
            return [];
        }
    }

    /**
     * Get content by tags
     */
    async getByTags(tags: string[]): Promise<ContentMetadata[]> {
        try {
            const contents = await prisma.generated_content.findMany({
                where: {
                    status: ContentStatus.PUBLISHED
                }
            });

            // Filter by tags
            const filtered = contents.filter(c => {
                const contentTags = (c.metadata as any)?.tags || [];
                return tags.some(tag => contentTags.includes(tag));
            });

            return filtered.map(c => this.mapToMetadata(c));

        } catch (error: any) {
            logger.error('Failed to get content by tags', {
                error: error.message,
                tags
            });
            return [];
        }
    }

    /**
     * Delete content from library
     */
    async deleteContent(id: string): Promise<boolean> {
        try {
            await prisma.generated_content.delete({
                where: { id }
            });

            // Remove from vector store
            await vectorStoreService.deleteDocument(id);

            // Invalidate cache
            await cacheService.invalidate(['content-library', `content:${id}`]);

            logger.info('Content deleted from library', { contentId: id });
            return true;

        } catch (error: any) {
            logger.error('Failed to delete content', {
                error: error.message,
                contentId: id
            });
            return false;
        }
    }

    /**
     * Archive content
     */
    async archiveContent(id: string): Promise<boolean> {
        try {
            await prisma.generated_content.update({
                where: { id },
                data: {
                    status: ContentStatus.ARCHIVED,
                    updated_at: new Date()
                }
            });

            await cacheService.invalidate(['content-library', `content:${id}`]);

            logger.info('Content archived', { contentId: id });
            return true;

        } catch (error: any) {
            logger.error('Failed to archive content', {
                error: error.message,
                contentId: id
            });
            return false;
        }
    }

    /**
     * Get library statistics
     */
    async getStatistics(): Promise<any> {
        try {
            const total = await prisma.generated_content.count();
            const byType = await prisma.generated_content.groupBy({
                by: ['content_type'],
                _count: true
            });
            const byStatus = await prisma.generated_content.groupBy({
                by: ['status'],
                _count: true
            });

            return {
                total,
                byType,
                byStatus,
                lastUpdated: new Date()
            };

        } catch (error: any) {
            logger.error('Failed to get library statistics', {
                error: error.message
            });
            return null;
        }
    }

    // Helper methods

    private mapToMetadata(content: any): ContentMetadata {
        const metadata = content.metadata || {};
        return {
            id: content.id,
            title: content.title,
            description: content.content,
            contentType: content.content_type,
            format: content.format,
            category: metadata.category || '',
            subcategory: metadata.subcategory,
            tags: metadata.tags || [],
            author: metadata.author || '',
            createdAt: content.created_at,
            updatedAt: content.updated_at,
            version: content.version,
            status: content.status,
            language: metadata.language || 'en',
            difficulty: metadata.difficulty || DifficultyLevel.INTERMEDIATE,
            estimatedDuration: metadata.estimatedDuration,
            prerequisites: metadata.prerequisites,
            learningObjectives: metadata.learningObjectives,
            spiritualThemes: metadata.spiritualThemes,
            biblicalReferences: metadata.biblicalReferences,
            targetAudience: metadata.targetAudience,
            accessLevel: metadata.accessLevel || AccessLevel.PUBLIC,
            fileSize: metadata.fileSize,
            fileUrl: metadata.fileUrl,
            thumbnailUrl: metadata.thumbnailUrl
        };
    }

    private buildVectorFilter(filters: SearchFilters): Record<string, any> {
        const filter: Record<string, any> = {};

        if (filters.contentType && filters.contentType.length > 0) {
            filter.type = { $in: filters.contentType };
        }

        return filter;
    }

    private buildDatabaseFilter(filters: SearchFilters, includeArchived: boolean): any {
        const where: any = {};

        if (!includeArchived) {
            where.status = { not: ContentStatus.ARCHIVED };
        }

        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status };
        }

        if (filters.contentType && filters.contentType.length > 0) {
            where.content_type = { in: filters.contentType };
        }

        if (filters.format && filters.format.length > 0) {
            where.format = { in: filters.format };
        }

        if (filters.dateFrom || filters.dateTo) {
            where.created_at = {};
            if (filters.dateFrom) {
                where.created_at.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.created_at.lte = filters.dateTo;
            }
        }

        return where;
    }

    private buildOrderBy(sortBy: string, sortOrder: string): any {
        const orderMap: Record<string, string> = {
            date: 'created_at',
            title: 'title',
            relevance: 'created_at'
        };

        const field = orderMap[sortBy] || 'created_at';
        return { [field]: sortOrder };
    }

    private applyFilters(results: ContentMetadata[], filters: SearchFilters): ContentMetadata[] {
        let filtered = results;

        if (filters.category && filters.category.length > 0) {
            filtered = filtered.filter(r => filters.category!.includes(r.category));
        }

        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(r => 
                filters.tags!.some(tag => r.tags.includes(tag))
            );
        }

        if (filters.difficulty && filters.difficulty.length > 0) {
            filtered = filtered.filter(r => filters.difficulty!.includes(r.difficulty));
        }

        if (filters.language && filters.language.length > 0) {
            filtered = filtered.filter(r => filters.language!.includes(r.language));
        }

        if (filters.accessLevel && filters.accessLevel.length > 0) {
            filtered = filtered.filter(r => filters.accessLevel!.includes(r.accessLevel));
        }

        if (filters.author) {
            filtered = filtered.filter(r => r.author === filters.author);
        }

        return filtered;
    }

    private sortResults(results: ContentMetadata[], sortBy: string, sortOrder: string): ContentMetadata[] {
        const sorted = [...results];

        sorted.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'date':
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'relevance':
                default:
                    comparison = 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }
}

// Singleton instance
export const contentLibraryManager = new ContentLibraryManager();
