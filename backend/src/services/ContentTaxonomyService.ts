/**
 * ScrollUniversity Content Taxonomy Service
 * "Let all things be done decently and in order." - 1 Corinthians 14:40
 * 
 * Manages content organization and classification
 */

import { logger } from '../utils/productionLogger';
import { cacheService } from './CacheService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TaxonomyNode {
    id: string;
    name: string;
    description: string;
    level: number;
    parentId?: string;
    children: TaxonomyNode[];
    contentCount: number;
    metadata: {
        icon?: string;
        color?: string;
        order?: number;
        keywords?: string[];
    };
}

export interface CategoryHierarchy {
    root: TaxonomyNode[];
    totalCategories: number;
    maxDepth: number;
}

export class ContentTaxonomyService {
    private taxonomyCache: Map<string, TaxonomyNode> = new Map();

    /**
     * Initialize taxonomy structure
     */
    async initializeTaxonomy(): Promise<void> {
        try {
            const defaultCategories = [
                {
                    name: 'Biblical Studies',
                    description: 'Study of Scripture and biblical theology',
                    children: [
                        { name: 'Old Testament', description: 'Hebrew Scriptures and theology' },
                        { name: 'New Testament', description: 'Christian Scriptures and theology' },
                        { name: 'Biblical Languages', description: 'Hebrew, Greek, and Aramaic' },
                        { name: 'Hermeneutics', description: 'Biblical interpretation methods' }
                    ]
                },
                {
                    name: 'Theology',
                    description: 'Systematic and practical theology',
                    children: [
                        { name: 'Systematic Theology', description: 'Organized study of Christian doctrine' },
                        { name: 'Historical Theology', description: 'Development of Christian thought' },
                        { name: 'Practical Theology', description: 'Application of theology to ministry' },
                        { name: 'Apologetics', description: 'Defense of Christian faith' }
                    ]
                },
                {
                    name: 'Ministry & Leadership',
                    description: 'Practical ministry and leadership training',
                    children: [
                        { name: 'Pastoral Ministry', description: 'Church leadership and pastoral care' },
                        { name: 'Worship & Arts', description: 'Worship leading and creative ministry' },
                        { name: 'Missions & Evangelism', description: 'Cross-cultural ministry and outreach' },
                        { name: 'Counseling', description: 'Biblical counseling and care' }
                    ]
                },
                {
                    name: 'Spiritual Formation',
                    description: 'Personal spiritual growth and discipleship',
                    children: [
                        { name: 'Prayer & Intercession', description: 'Prayer practices and intercession' },
                        { name: 'Spiritual Disciplines', description: 'Classical spiritual practices' },
                        { name: 'Character Development', description: 'Christlike character formation' },
                        { name: 'Prophetic Ministry', description: 'Prophetic gifts and ministry' }
                    ]
                },
                {
                    name: 'Kingdom Business',
                    description: 'Business and marketplace ministry',
                    children: [
                        { name: 'Entrepreneurship', description: 'Kingdom-focused business creation' },
                        { name: 'Leadership', description: 'Business and organizational leadership' },
                        { name: 'Ethics', description: 'Biblical business ethics' },
                        { name: 'Finance', description: 'Kingdom financial principles' }
                    ]
                },
                {
                    name: 'Technology & Innovation',
                    description: 'Technology for kingdom advancement',
                    children: [
                        { name: 'Software Development', description: 'Programming and software engineering' },
                        { name: 'AI & Machine Learning', description: 'Artificial intelligence applications' },
                        { name: 'Digital Ministry', description: 'Online and digital ministry tools' },
                        { name: 'Media Production', description: 'Video, audio, and content creation' }
                    ]
                }
            ];

            for (const category of defaultCategories) {
                await this.createCategory({
                    name: category.name,
                    description: category.description,
                    level: 1
                });

                for (const subcategory of category.children) {
                    await this.createCategory({
                        name: subcategory.name,
                        description: subcategory.description,
                        level: 2,
                        parentName: category.name
                    });
                }
            }

            logger.info('Taxonomy initialized successfully');

        } catch (error: any) {
            logger.error('Failed to initialize taxonomy', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Create new category
     */
    async createCategory(data: {
        name: string;
        description: string;
        level: number;
        parentName?: string;
        metadata?: any;
    }): Promise<TaxonomyNode> {
        try {
            // Check if category already exists
            const existing = await this.getCategoryByName(data.name);
            if (existing) {
                return existing;
            }

            // Find parent if specified
            let parentId: string | undefined;
            if (data.parentName) {
                const parent = await this.getCategoryByName(data.parentName);
                if (parent) {
                    parentId = parent.id;
                }
            }

            // Create category node
            const node: TaxonomyNode = {
                id: this.generateId(),
                name: data.name,
                description: data.description,
                level: data.level,
                parentId,
                children: [],
                contentCount: 0,
                metadata: data.metadata || {}
            };

            // Store in cache
            this.taxonomyCache.set(node.id, node);
            this.taxonomyCache.set(`name:${node.name}`, node);

            // Invalidate hierarchy cache
            await cacheService.invalidate(['taxonomy']);

            logger.info('Category created', {
                categoryId: node.id,
                name: data.name,
                level: data.level
            });

            return node;

        } catch (error: any) {
            logger.error('Failed to create category', {
                error: error.message,
                name: data.name
            });
            throw error;
        }
    }

    /**
     * Get category by ID
     */
    async getCategory(id: string): Promise<TaxonomyNode | null> {
        try {
            // Check cache
            if (this.taxonomyCache.has(id)) {
                return this.taxonomyCache.get(id)!;
            }

            // In production, this would query database
            return null;

        } catch (error: any) {
            logger.error('Failed to get category', {
                error: error.message,
                categoryId: id
            });
            return null;
        }
    }

    /**
     * Get category by name
     */
    async getCategoryByName(name: string): Promise<TaxonomyNode | null> {
        try {
            const cacheKey = `name:${name}`;
            if (this.taxonomyCache.has(cacheKey)) {
                return this.taxonomyCache.get(cacheKey)!;
            }

            return null;

        } catch (error: any) {
            logger.error('Failed to get category by name', {
                error: error.message,
                name
            });
            return null;
        }
    }

    /**
     * Get full category hierarchy
     */
    async getCategoryHierarchy(): Promise<CategoryHierarchy> {
        try {
            // Check cache
            const cacheKey = 'taxonomy:hierarchy';
            const cached = await cacheService.get<CategoryHierarchy>(cacheKey);
            if (cached) {
                return cached;
            }

            // Build hierarchy from cache
            const rootNodes: TaxonomyNode[] = [];
            let maxDepth = 0;

            for (const [key, node] of this.taxonomyCache.entries()) {
                if (!key.startsWith('name:') && !node.parentId) {
                    // This is a root node
                    const fullNode = await this.buildNodeWithChildren(node);
                    rootNodes.push(fullNode);
                    maxDepth = Math.max(maxDepth, this.calculateDepth(fullNode));
                }
            }

            const hierarchy: CategoryHierarchy = {
                root: rootNodes,
                totalCategories: this.taxonomyCache.size / 2, // Divided by 2 because we store by ID and name
                maxDepth
            };

            // Cache result
            await cacheService.set(cacheKey, hierarchy, {
                ttl: 3600,
                tags: ['taxonomy']
            });

            return hierarchy;

        } catch (error: any) {
            logger.error('Failed to get category hierarchy', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get categories by level
     */
    async getCategoriesByLevel(level: number): Promise<TaxonomyNode[]> {
        try {
            const categories: TaxonomyNode[] = [];

            for (const [key, node] of this.taxonomyCache.entries()) {
                if (!key.startsWith('name:') && node.level === level) {
                    categories.push(node);
                }
            }

            return categories;

        } catch (error: any) {
            logger.error('Failed to get categories by level', {
                error: error.message,
                level
            });
            return [];
        }
    }

    /**
     * Get child categories
     */
    async getChildCategories(parentId: string): Promise<TaxonomyNode[]> {
        try {
            const children: TaxonomyNode[] = [];

            for (const [key, node] of this.taxonomyCache.entries()) {
                if (!key.startsWith('name:') && node.parentId === parentId) {
                    children.push(node);
                }
            }

            return children;

        } catch (error: any) {
            logger.error('Failed to get child categories', {
                error: error.message,
                parentId
            });
            return [];
        }
    }

    /**
     * Update category
     */
    async updateCategory(id: string, updates: Partial<TaxonomyNode>): Promise<TaxonomyNode | null> {
        try {
            const category = await this.getCategory(id);
            if (!category) {
                return null;
            }

            const updated: TaxonomyNode = {
                ...category,
                ...updates,
                metadata: {
                    ...category.metadata,
                    ...updates.metadata
                }
            };

            // Update cache
            this.taxonomyCache.set(id, updated);
            this.taxonomyCache.set(`name:${updated.name}`, updated);

            // Invalidate hierarchy cache
            await cacheService.invalidate(['taxonomy']);

            logger.info('Category updated', {
                categoryId: id,
                updates: Object.keys(updates)
            });

            return updated;

        } catch (error: any) {
            logger.error('Failed to update category', {
                error: error.message,
                categoryId: id
            });
            return null;
        }
    }

    /**
     * Delete category
     */
    async deleteCategory(id: string): Promise<boolean> {
        try {
            const category = await this.getCategory(id);
            if (!category) {
                return false;
            }

            // Check if category has children
            const children = await this.getChildCategories(id);
            if (children.length > 0) {
                throw new Error('Cannot delete category with children');
            }

            // Remove from cache
            this.taxonomyCache.delete(id);
            this.taxonomyCache.delete(`name:${category.name}`);

            // Invalidate hierarchy cache
            await cacheService.invalidate(['taxonomy']);

            logger.info('Category deleted', { categoryId: id });
            return true;

        } catch (error: any) {
            logger.error('Failed to delete category', {
                error: error.message,
                categoryId: id
            });
            return false;
        }
    }

    /**
     * Classify content into categories
     */
    async classifyContent(contentId: string, content: string, metadata: any): Promise<string[]> {
        try {
            const categories: string[] = [];

            // Simple keyword-based classification
            const hierarchy = await this.getCategoryHierarchy();
            
            for (const rootNode of hierarchy.root) {
                if (this.matchesCategory(content, metadata, rootNode)) {
                    categories.push(rootNode.name);

                    // Check children
                    for (const child of rootNode.children) {
                        if (this.matchesCategory(content, metadata, child)) {
                            categories.push(child.name);
                        }
                    }
                }
            }

            logger.info('Content classified', {
                contentId,
                categories
            });

            return categories;

        } catch (error: any) {
            logger.error('Failed to classify content', {
                error: error.message,
                contentId
            });
            return [];
        }
    }

    /**
     * Get category path (breadcrumb)
     */
    async getCategoryPath(categoryId: string): Promise<TaxonomyNode[]> {
        try {
            const path: TaxonomyNode[] = [];
            let current = await this.getCategory(categoryId);

            while (current) {
                path.unshift(current);
                if (current.parentId) {
                    current = await this.getCategory(current.parentId);
                } else {
                    break;
                }
            }

            return path;

        } catch (error: any) {
            logger.error('Failed to get category path', {
                error: error.message,
                categoryId
            });
            return [];
        }
    }

    /**
     * Update content count for category
     */
    async updateContentCount(categoryId: string, delta: number): Promise<void> {
        try {
            const category = await this.getCategory(categoryId);
            if (!category) {
                return;
            }

            category.contentCount += delta;
            this.taxonomyCache.set(categoryId, category);

            // Update parent counts recursively
            if (category.parentId) {
                await this.updateContentCount(category.parentId, delta);
            }

            await cacheService.invalidate(['taxonomy']);

        } catch (error: any) {
            logger.error('Failed to update content count', {
                error: error.message,
                categoryId,
                delta
            });
        }
    }

    // Helper methods

    private async buildNodeWithChildren(node: TaxonomyNode): Promise<TaxonomyNode> {
        const children = await this.getChildCategories(node.id);
        const fullChildren = await Promise.all(
            children.map(child => this.buildNodeWithChildren(child))
        );

        return {
            ...node,
            children: fullChildren
        };
    }

    private calculateDepth(node: TaxonomyNode): number {
        if (node.children.length === 0) {
            return node.level;
        }

        const childDepths = node.children.map(child => this.calculateDepth(child));
        return Math.max(...childDepths);
    }

    private matchesCategory(content: string, metadata: any, category: TaxonomyNode): boolean {
        const searchText = `${content} ${JSON.stringify(metadata)}`.toLowerCase();
        const categoryKeywords = [
            category.name.toLowerCase(),
            category.description.toLowerCase(),
            ...(category.metadata.keywords || [])
        ];

        return categoryKeywords.some(keyword => searchText.includes(keyword));
    }

    private generateId(): string {
        return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
export const contentTaxonomyService = new ContentTaxonomyService();
