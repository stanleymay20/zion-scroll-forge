/**
 * ScrollUniversity Content Search Service
 * "Search the scriptures; for in them ye think ye have eternal life" - John 5:39
 * 
 * Provides powerful search across all content types and formats
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { vectorStoreService } from './VectorStoreService';
import { contentLibraryManager, ContentMetadata, SearchFilters } from './ContentLibraryManager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchQuery {
    text?: string;
    filters?: SearchFilters;
    facets?: string[];
    highlight?: boolean;
    fuzzy?: boolean;
    boost?: Record<string, number>;
}

export interface SearchResult {
    content: ContentMetadata;
    score: number;
    highlights?: string[];
    matchedFields?: string[];
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    facets?: Record<string, FacetResult[]>;
    suggestions?: string[];
    took: number; // milliseconds
}

export interface FacetResult {
    value: string;
    count: number;
}

export class ContentSearchService {
    /**
     * Perform comprehensive search across all content
     */
    async search(query: SearchQuery, options: {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}): Promise<SearchResponse> {
        const startTime = Date.now();

        try {
            const {
                page = 1,
                pageSize = 20,
                sortBy = 'relevance',
                sortOrder = 'desc'
            } = options;

            // Check cache
            const cacheKey = `search:${JSON.stringify({ query, options })}`;
            const cached = await cacheService.get<SearchResponse>(cacheKey);
            if (cached) {
                logger.debug('Search cache hit', { query: query.text?.substring(0, 50) });
                return cached;
            }

            let results: SearchResult[] = [];

            // Perform semantic search if text query provided
            if (query.text) {
                results = await this.semanticSearch(query.text, query.filters);
            } else {
                // Perform filtered search
                results = await this.filteredSearch(query.filters);
            }

            // Apply fuzzy matching if enabled
            if (query.fuzzy && query.text) {
                const fuzzyResults = await this.fuzzySearch(query.text, query.filters);
                results = this.mergeResults(results, fuzzyResults);
            }

            // Apply field boosting
            if (query.boost) {
                results = this.applyBoosting(results, query.boost);
            }

            // Generate highlights
            if (query.highlight && query.text) {
                results = this.addHighlights(results, query.text);
            }

            // Calculate facets
            let facets: Record<string, FacetResult[]> | undefined;
            if (query.facets && query.facets.length > 0) {
                facets = await this.calculateFacets(results, query.facets);
            }

            // Generate suggestions
            const suggestions = query.text ? await this.generateSuggestions(query.text) : undefined;

            // Sort results
            results = this.sortResults(results, sortBy, sortOrder);

            // Paginate
            const total = results.length;
            const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

            const response: SearchResponse = {
                results: paginatedResults,
                total,
                facets,
                suggestions,
                took: Date.now() - startTime
            };

            // Cache results
            await cacheService.set(cacheKey, response, {
                ttl: 600,
                tags: ['content-search']
            });

            logger.info('Search completed', {
                query: query.text?.substring(0, 50),
                resultsCount: total,
                took: response.took
            });

            return response;

        } catch (error: any) {
            logger.error('Search failed', {
                error: error.message,
                query: query.text
            });
            throw error;
        }
    }

    /**
     * Semantic search using vector embeddings
     */
    private async semanticSearch(text: string, filters?: SearchFilters): Promise<SearchResult[]> {
        try {
            const vectorResults = await vectorStoreService.search(text, {
                topK: 100,
                filter: this.buildVectorFilter(filters),
                minScore: 0.7
            });

            // Get full content metadata
            const contentIds = vectorResults.map(r => r.id);
            const contents = await prisma.generated_content.findMany({
                where: {
                    id: { in: contentIds }
                }
            });

            // Map to search results
            const results: SearchResult[] = contents.map(content => {
                const vectorResult = vectorResults.find(vr => vr.id === content.id);
                return {
                    content: this.mapToMetadata(content),
                    score: vectorResult?.score || 0,
                    matchedFields: ['content', 'title']
                };
            });

            return results;

        } catch (error: any) {
            logger.error('Semantic search failed', {
                error: error.message,
                text
            });
            return [];
        }
    }

    /**
     * Filtered search without text query
     */
    private async filteredSearch(filters?: SearchFilters): Promise<SearchResult[]> {
        try {
            const searchResults = await contentLibraryManager.searchContent({
                filters,
                sortBy: 'date',
                sortOrder: 'desc',
                pageSize: 100
            });

            return searchResults.items.map(content => ({
                content,
                score: 1.0,
                matchedFields: []
            }));

        } catch (error: any) {
            logger.error('Filtered search failed', {
                error: error.message
            });
            return [];
        }
    }

    /**
     * Fuzzy search for typo tolerance
     */
    private async fuzzySearch(text: string, filters?: SearchFilters): Promise<SearchResult[]> {
        try {
            // Simple fuzzy matching using Levenshtein distance
            const allContent = await contentLibraryManager.searchContent({
                filters,
                pageSize: 1000
            });

            const fuzzyResults: SearchResult[] = [];

            for (const content of allContent.items) {
                const searchText = `${content.title} ${content.description}`.toLowerCase();
                const queryText = text.toLowerCase();

                // Calculate similarity
                const similarity = this.calculateSimilarity(searchText, queryText);

                if (similarity > 0.6) {
                    fuzzyResults.push({
                        content,
                        score: similarity,
                        matchedFields: ['title', 'description']
                    });
                }
            }

            return fuzzyResults;

        } catch (error: any) {
            logger.error('Fuzzy search failed', {
                error: error.message,
                text
            });
            return [];
        }
    }

    /**
     * Merge multiple search result sets
     */
    private mergeResults(results1: SearchResult[], results2: SearchResult[]): SearchResult[] {
        const merged = new Map<string, SearchResult>();

        // Add first set
        for (const result of results1) {
            merged.set(result.content.id, result);
        }

        // Merge second set
        for (const result of results2) {
            const existing = merged.get(result.content.id);
            if (existing) {
                // Combine scores
                existing.score = Math.max(existing.score, result.score);
                existing.matchedFields = [
                    ...new Set([...(existing.matchedFields || []), ...(result.matchedFields || [])])
                ];
            } else {
                merged.set(result.content.id, result);
            }
        }

        return Array.from(merged.values());
    }

    /**
     * Apply field boosting to results
     */
    private applyBoosting(results: SearchResult[], boost: Record<string, number>): SearchResult[] {
        return results.map(result => {
            let boostedScore = result.score;

            for (const [field, boostValue] of Object.entries(boost)) {
                if (result.matchedFields?.includes(field)) {
                    boostedScore *= boostValue;
                }
            }

            return {
                ...result,
                score: boostedScore
            };
        });
    }

    /**
     * Add highlights to search results
     */
    private addHighlights(results: SearchResult[], query: string): SearchResult[] {
        const queryTerms = query.toLowerCase().split(/\s+/);

        return results.map(result => {
            const highlights: string[] = [];
            const text = `${result.content.title} ${result.content.description}`.toLowerCase();

            for (const term of queryTerms) {
                const index = text.indexOf(term);
                if (index !== -1) {
                    const start = Math.max(0, index - 50);
                    const end = Math.min(text.length, index + term.length + 50);
                    const snippet = text.substring(start, end);
                    highlights.push(`...${snippet}...`);
                }
            }

            return {
                ...result,
                highlights: highlights.slice(0, 3) // Limit to 3 highlights
            };
        });
    }

    /**
     * Calculate facets for filtering
     */
    private async calculateFacets(results: SearchResult[], facetFields: string[]): Promise<Record<string, FacetResult[]>> {
        const facets: Record<string, FacetResult[]> = {};

        for (const field of facetFields) {
            const counts = new Map<string, number>();

            for (const result of results) {
                let value: any;

                switch (field) {
                    case 'contentType':
                        value = result.content.contentType;
                        break;
                    case 'format':
                        value = result.content.format;
                        break;
                    case 'category':
                        value = result.content.category;
                        break;
                    case 'difficulty':
                        value = result.content.difficulty;
                        break;
                    case 'language':
                        value = result.content.language;
                        break;
                    case 'tags':
                        // Handle array values
                        for (const tag of result.content.tags) {
                            counts.set(tag, (counts.get(tag) || 0) + 1);
                        }
                        continue;
                }

                if (value) {
                    counts.set(value, (counts.get(value) || 0) + 1);
                }
            }

            // Convert to facet results
            facets[field] = Array.from(counts.entries())
                .map(([value, count]) => ({ value, count }))
                .sort((a, b) => b.count - a.count);
        }

        return facets;
    }

    /**
     * Generate search suggestions
     */
    private async generateSuggestions(query: string): Promise<string[]> {
        try {
            // Get popular searches from cache
            const popularSearches = await cacheService.get<string[]>('search:popular') || [];

            // Find similar queries
            const suggestions = popularSearches
                .filter(search => search.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);

            return suggestions;

        } catch (error: any) {
            logger.error('Failed to generate suggestions', {
                error: error.message,
                query
            });
            return [];
        }
    }

    /**
     * Sort search results
     */
    private sortResults(results: SearchResult[], sortBy: string, sortOrder: string): SearchResult[] {
        const sorted = [...results];

        sorted.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'relevance':
                    comparison = b.score - a.score;
                    break;
                case 'date':
                    comparison = a.content.createdAt.getTime() - b.content.createdAt.getTime();
                    break;
                case 'title':
                    comparison = a.content.title.localeCompare(b.content.title);
                    break;
                case 'popularity':
                    // Would use view count or engagement metrics
                    comparison = 0;
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
    }

    /**
     * Track search query for analytics
     */
    async trackSearch(query: string, resultsCount: number): Promise<void> {
        try {
            // Update popular searches
            const popularSearches = await cacheService.get<string[]>('search:popular') || [];
            if (!popularSearches.includes(query)) {
                popularSearches.unshift(query);
                await cacheService.set('search:popular', popularSearches.slice(0, 100), {
                    ttl: 86400,
                    tags: ['search-analytics']
                });
            }

            logger.debug('Search tracked', {
                query: query.substring(0, 50),
                resultsCount
            });

        } catch (error: any) {
            logger.error('Failed to track search', {
                error: error.message,
                query
            });
        }
    }

    // Helper methods

    private buildVectorFilter(filters?: SearchFilters): Record<string, any> {
        const filter: Record<string, any> = {};

        if (filters?.contentType && filters.contentType.length > 0) {
            filter.type = { $in: filters.contentType };
        }

        return filter;
    }

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
            difficulty: metadata.difficulty || 'intermediate',
            estimatedDuration: metadata.estimatedDuration,
            prerequisites: metadata.prerequisites,
            learningObjectives: metadata.learningObjectives,
            spiritualThemes: metadata.spiritualThemes,
            biblicalReferences: metadata.biblicalReferences,
            targetAudience: metadata.targetAudience,
            accessLevel: metadata.accessLevel || 'public',
            fileSize: metadata.fileSize,
            fileUrl: metadata.fileUrl,
            thumbnailUrl: metadata.thumbnailUrl
        };
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple Jaccard similarity
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }
}

// Singleton instance
export const contentSearchService = new ContentSearchService();
