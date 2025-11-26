/**
 * ScrollUniversity Course Content Management Service
 * "Store up treasures in heaven" - Matthew 6:20
 * 
 * Manages storage, versioning, search, permissions, and backup of all course materials
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/productionLogger';
import { vectorStoreService } from './VectorStoreService';
import { cacheService } from './CacheService';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

export interface Content {
    id: string;
    type: 'video' | 'notes' | 'assessment' | 'resource' | 'module' | 'course';
    title: string;
    description?: string;
    data: any;
    courseId: string;
    moduleId?: string;
    lectureId?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ContentMetadata {
    contentId: string;
    version: number;
    size: number;
    format: string;
    checksum: string;
    tags: string[];
    customFields: Record<string, any>;
}

export interface ContentVersion {
    id: string;
    contentId: string;
    version: number;
    data: any;
    changes: string;
    createdBy: string;
    createdAt: Date;
}

export interface SearchQuery {
    text?: string;
    type?: Content['type'];
    courseId?: string;
    moduleId?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    createdBy?: string;
}

export interface SearchResults {
    items: Content[];
    total: number;
    page: number;
    pageSize: number;
}

export interface Permissions {
    contentId: string;
    userId?: string;
    roleId?: string;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canShare: boolean;
}

export interface BackupStatus {
    contentId: string;
    locations: BackupLocation[];
    lastBackup: Date;
    status: 'success' | 'partial' | 'failed';
}

export interface BackupLocation {
    name: string;
    type: 'local' | 's3' | 'azure' | 'gcs';
    path: string;
    timestamp: Date;
    verified: boolean;
}

export class CourseContentManagementService {
    private readonly baseStoragePath: string;
    private readonly backupLocations: string[];

    constructor() {
        this.baseStoragePath = process.env.CONTENT_STORAGE_PATH || './storage/content';
        this.backupLocations = [
            process.env.BACKUP_LOCATION_1 || './storage/backup/location1',
            process.env.BACKUP_LOCATION_2 || './storage/backup/location2',
            process.env.BACKUP_LOCATION_3 || './storage/backup/location3'
        ];

        logger.info('Course Content Management Service initialized', {
            baseStoragePath: this.baseStoragePath,
            backupLocations: this.backupLocations.length
        });
    }

    /**
     * Store content with organized folder structure
     * Requirement 7.1: Organized folder structure by course and module
     */
    async storeContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>, metadata?: Partial<ContentMetadata>): Promise<Content> {
        try {
            const contentId = uuidv4();
            const now = new Date();

            // Create organized folder path: course/module/type
            const folderPath = this.buildFolderPath(content.courseId, content.moduleId, content.type);
            await this.ensureDirectoryExists(folderPath);

            // Store content in database
            const storedContent: Content = {
                id: contentId,
                ...content,
                createdAt: now,
                updatedAt: now
            };

            // Store in file system
            const filePath = path.join(folderPath, `${contentId}.json`);
            await fs.writeFile(filePath, JSON.stringify(storedContent, null, 2), 'utf-8');

            // Store metadata
            if (metadata) {
                const fullMetadata: ContentMetadata = {
                    contentId,
                    version: 1,
                    size: JSON.stringify(storedContent.data).length,
                    format: 'json',
                    checksum: this.calculateChecksum(storedContent.data),
                    tags: metadata.tags || [],
                    customFields: metadata.customFields || {}
                };

                const metadataPath = path.join(folderPath, `${contentId}.metadata.json`);
                await fs.writeFile(metadataPath, JSON.stringify(fullMetadata, null, 2), 'utf-8');
            }

            // Create initial version
            await this.createVersion(contentId, storedContent.data, 'Initial version', content.createdBy);

            // Index for semantic search
            await this.indexContentForSearch(storedContent);

            // Invalidate cache
            await this.invalidateContentCache(content.courseId, content.moduleId);

            logger.info('Content stored successfully', {
                contentId,
                type: content.type,
                courseId: content.courseId,
                moduleId: content.moduleId,
                folderPath
            });

            return storedContent;

        } catch (error: any) {
            logger.error('Failed to store content', {
                error: error.message,
                courseId: content.courseId,
                type: content.type
            });
            throw new Error(`Failed to store content: ${error.message}`);
        }
    }

    /**
     * Retrieve content with version support
     * Requirement 7.2: Version history with change tracking
     */
    async retrieveContent(contentId: string, version?: number): Promise<Content | null> {
        try {
            // Check cache first
            const cacheKey = `content:${contentId}:${version || 'latest'}`;
            const cached = await cacheService.get<Content>(cacheKey);
            if (cached) {
                logger.debug('Content cache hit', { contentId, version });
                return cached;
            }

            let content: Content | null = null;

            if (version) {
                // Retrieve specific version
                const versionData = await this.getVersion(contentId, version);
                if (versionData) {
                    // Get base content and merge with version data
                    const baseContent = await this.retrieveContent(contentId);
                    if (baseContent) {
                        content = {
                            ...baseContent,
                            data: versionData.data,
                            updatedAt: versionData.createdAt
                        };
                    }
                }
            } else {
                // Retrieve latest version from file system
                const contentPath = await this.findContentPath(contentId);
                if (contentPath) {
                    const fileContent = await fs.readFile(contentPath, 'utf-8');
                    content = JSON.parse(fileContent);
                }
            }

            if (content) {
                // Cache the result
                await cacheService.set(cacheKey, content, {
                    ttl: 3600,
                    tags: ['content', `course:${content.courseId}`]
                });
            }

            return content;

        } catch (error: any) {
            logger.error('Failed to retrieve content', {
                error: error.message,
                contentId,
                version
            });
            return null;
        }
    }

    /**
     * Search content with full-text search
     * Requirement 7.4: Full-text search across all material types
     */
    async searchContent(query: SearchQuery, page: number = 1, pageSize: number = 20): Promise<SearchResults> {
        try {
            const cacheKey = `search:${this.hashQuery(query)}:${page}:${pageSize}`;
            const cached = await cacheService.get<SearchResults>(cacheKey);
            if (cached) {
                logger.debug('Search cache hit', { query });
                return cached;
            }

            let items: Content[] = [];

            // Use semantic search if text query provided
            if (query.text) {
                const vectorResults = await vectorStoreService.search(query.text, {
                    topK: pageSize * 2, // Get more results for filtering
                    filter: this.buildVectorFilter(query),
                    minScore: 0.7
                });

                // Retrieve full content for each result
                const contentPromises = vectorResults.map(result => 
                    this.retrieveContent(result.id)
                );
                const contents = await Promise.all(contentPromises);
                items = contents.filter((c): c is Content => c !== null);
            } else {
                // File system search with filters
                items = await this.searchFileSystem(query);
            }

            // Apply additional filters
            items = this.applyFilters(items, query);

            // Pagination
            const total = items.length;
            const start = (page - 1) * pageSize;
            const paginatedItems = items.slice(start, start + pageSize);

            const results: SearchResults = {
                items: paginatedItems,
                total,
                page,
                pageSize
            };

            // Cache results
            await cacheService.set(cacheKey, results, {
                ttl: 1800,
                tags: ['search', 'content']
            });

            logger.info('Content search completed', {
                query,
                resultsCount: total,
                page,
                pageSize
            });

            return results;

        } catch (error: any) {
            logger.error('Content search failed', {
                error: error.message,
                query
            });
            throw new Error(`Content search failed: ${error.message}`);
        }
    }

    /**
     * Manage permissions with RBAC
     * Requirement 7.3: Role-based access control
     */
    async managePermissions(permissions: Permissions): Promise<void> {
        try {
            // Store permissions in file system
            const content = await this.retrieveContent(permissions.contentId);
            if (!content) {
                throw new Error('Content not found');
            }

            const permissionsPath = await this.getPermissionsPath(content);
            let existingPermissions: Permissions[] = [];

            // Load existing permissions
            try {
                const permissionsData = await fs.readFile(permissionsPath, 'utf-8');
                existingPermissions = JSON.parse(permissionsData);
            } catch (error) {
                // File doesn't exist yet, start with empty array
            }

            // Update or add permissions
            const index = existingPermissions.findIndex(p => 
                p.userId === permissions.userId && p.roleId === permissions.roleId
            );

            if (index >= 0) {
                existingPermissions[index] = permissions;
            } else {
                existingPermissions.push(permissions);
            }

            // Save updated permissions
            await fs.writeFile(permissionsPath, JSON.stringify(existingPermissions, null, 2), 'utf-8');

            // Invalidate permission cache
            await cacheService.delete(`permissions:${permissions.contentId}`);

            logger.info('Permissions updated', {
                contentId: permissions.contentId,
                userId: permissions.userId,
                roleId: permissions.roleId
            });

        } catch (error: any) {
            logger.error('Failed to manage permissions', {
                error: error.message,
                contentId: permissions.contentId
            });
            throw new Error(`Failed to manage permissions: ${error.message}`);
        }
    }

    /**
     * Check if user has permission
     */
    async checkPermission(contentId: string, userId: string, permission: 'read' | 'write' | 'delete' | 'share'): Promise<boolean> {
        try {
            const cacheKey = `permissions:${contentId}`;
            let permissions = await cacheService.get<Permissions[]>(cacheKey);

            if (!permissions) {
                const content = await this.retrieveContent(contentId);
                if (!content) {
                    return false;
                }

                const permissionsPath = await this.getPermissionsPath(content);
                try {
                    const permissionsData = await fs.readFile(permissionsPath, 'utf-8');
                    permissions = JSON.parse(permissionsData);
                    await cacheService.set(cacheKey, permissions, { ttl: 3600 });
                } catch (error) {
                    return false;
                }
            }

            // Check user-specific permissions
            if (permissions) {
                const userPermission = permissions.find(p => p.userId === userId);
                if (userPermission) {
                    switch (permission) {
                        case 'read': return userPermission.canRead;
                        case 'write': return userPermission.canWrite;
                        case 'delete': return userPermission.canDelete;
                        case 'share': return userPermission.canShare;
                    }
                }
            }

            return false;

        } catch (error: any) {
            logger.error('Permission check failed', {
                error: error.message,
                contentId,
                userId,
                permission
            });
            return false;
        }
    }

    /**
     * Backup content to multiple locations
     * Requirement 7.5: Multi-location backup
     */
    async backupContent(contentId: string): Promise<BackupStatus> {
        try {
            const content = await this.retrieveContent(contentId);
            if (!content) {
                throw new Error('Content not found');
            }

            const locations: BackupLocation[] = [];
            const now = new Date();

            // Backup to each configured location
            for (const backupPath of this.backupLocations) {
                try {
                    const backupFolderPath = this.buildFolderPath(
                        content.courseId,
                        content.moduleId,
                        content.type,
                        backupPath
                    );
                    await this.ensureDirectoryExists(backupFolderPath);

                    const backupFilePath = path.join(backupFolderPath, `${contentId}.json`);
                    await fs.writeFile(backupFilePath, JSON.stringify(content, null, 2), 'utf-8');

                    // Verify backup
                    const verified = await this.verifyBackup(backupFilePath, content);

                    locations.push({
                        name: path.basename(backupPath),
                        type: 'local',
                        path: backupFilePath,
                        timestamp: now,
                        verified
                    });

                    logger.debug('Content backed up to location', {
                        contentId,
                        location: backupPath,
                        verified
                    });

                } catch (error: any) {
                    logger.error('Backup to location failed', {
                        error: error.message,
                        contentId,
                        location: backupPath
                    });

                    locations.push({
                        name: path.basename(backupPath),
                        type: 'local',
                        path: backupPath,
                        timestamp: now,
                        verified: false
                    });
                }
            }

            const status: BackupStatus = {
                contentId,
                locations,
                lastBackup: now,
                status: locations.every(l => l.verified) ? 'success' :
                        locations.some(l => l.verified) ? 'partial' : 'failed'
            };

            logger.info('Content backup completed', {
                contentId,
                status: status.status,
                locationsCount: locations.length,
                verifiedCount: locations.filter(l => l.verified).length
            });

            return status;

        } catch (error: any) {
            logger.error('Content backup failed', {
                error: error.message,
                contentId
            });
            throw new Error(`Content backup failed: ${error.message}`);
        }
    }

    /**
     * Update existing content
     */
    async updateContent(contentId: string, updates: Partial<Content>, updatedBy: string, changes: string): Promise<Content> {
        try {
            const existing = await this.retrieveContent(contentId);
            if (!existing) {
                throw new Error('Content not found');
            }

            const now = new Date();
            const updated: Content = {
                ...existing,
                ...updates,
                id: contentId, // Preserve ID
                updatedAt: now
            };

            // Store updated content
            const folderPath = this.buildFolderPath(updated.courseId, updated.moduleId, updated.type);
            const filePath = path.join(folderPath, `${contentId}.json`);
            await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

            // Create new version
            await this.createVersion(contentId, updated.data, changes, updatedBy);

            // Update search index
            await this.indexContentForSearch(updated);

            // Invalidate cache
            await this.invalidateContentCache(updated.courseId, updated.moduleId);
            await cacheService.delete(`content:${contentId}:latest`);

            logger.info('Content updated', {
                contentId,
                changes,
                updatedBy
            });

            return updated;

        } catch (error: any) {
            logger.error('Failed to update content', {
                error: error.message,
                contentId
            });
            throw new Error(`Failed to update content: ${error.message}`);
        }
    }

    /**
     * Delete content
     */
    async deleteContent(contentId: string): Promise<boolean> {
        try {
            const content = await this.retrieveContent(contentId);
            if (!content) {
                return false;
            }

            // Delete from file system
            const contentPath = await this.findContentPath(contentId);
            if (contentPath) {
                await fs.unlink(contentPath);

                // Delete metadata
                const metadataPath = contentPath.replace('.json', '.metadata.json');
                try {
                    await fs.unlink(metadataPath);
                } catch (error) {
                    // Metadata file might not exist
                }

                // Delete permissions
                const permissionsPath = await this.getPermissionsPath(content);
                try {
                    await fs.unlink(permissionsPath);
                } catch (error) {
                    // Permissions file might not exist
                }
            }

            // Delete from vector store
            await vectorStoreService.deleteDocument(contentId);

            // Invalidate cache
            await this.invalidateContentCache(content.courseId, content.moduleId);
            await cacheService.delete(`content:${contentId}:latest`);

            logger.info('Content deleted', { contentId });
            return true;

        } catch (error: any) {
            logger.error('Failed to delete content', {
                error: error.message,
                contentId
            });
            return false;
        }
    }

    // Private helper methods

    private buildFolderPath(courseId: string, moduleId: string | undefined, type: string, basePath?: string): string {
        const base = basePath || this.baseStoragePath;
        if (moduleId) {
            return path.join(base, courseId, moduleId, type);
        }
        return path.join(base, courseId, type);
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error: any) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    private async createVersion(contentId: string, data: any, changes: string, createdBy: string): Promise<void> {
        try {
            const content = await this.retrieveContent(contentId);
            if (!content) {
                throw new Error('Content not found');
            }

            // Get current version count
            const versionsPath = await this.getVersionsPath(content);
            let versions: ContentVersion[] = [];

            try {
                const versionsData = await fs.readFile(versionsPath, 'utf-8');
                versions = JSON.parse(versionsData);
            } catch (error) {
                // Versions file doesn't exist yet
            }

            const newVersion: ContentVersion = {
                id: uuidv4(),
                contentId,
                version: versions.length + 1,
                data,
                changes,
                createdBy,
                createdAt: new Date()
            };

            versions.push(newVersion);

            await fs.writeFile(versionsPath, JSON.stringify(versions, null, 2), 'utf-8');

            logger.debug('Version created', {
                contentId,
                version: newVersion.version,
                changes
            });

        } catch (error: any) {
            logger.error('Failed to create version', {
                error: error.message,
                contentId
            });
            throw error;
        }
    }

    private async getVersion(contentId: string, version: number): Promise<ContentVersion | null> {
        try {
            const content = await this.retrieveContent(contentId);
            if (!content) {
                return null;
            }

            const versionsPath = await this.getVersionsPath(content);
            const versionsData = await fs.readFile(versionsPath, 'utf-8');
            const versions: ContentVersion[] = JSON.parse(versionsData);

            return versions.find(v => v.version === version) || null;

        } catch (error: any) {
            logger.error('Failed to get version', {
                error: error.message,
                contentId,
                version
            });
            return null;
        }
    }

    private async getVersionsPath(content: Content): Promise<string> {
        const folderPath = this.buildFolderPath(content.courseId, content.moduleId, content.type);
        return path.join(folderPath, `${content.id}.versions.json`);
    }

    private async getPermissionsPath(content: Content): Promise<string> {
        const folderPath = this.buildFolderPath(content.courseId, content.moduleId, content.type);
        return path.join(folderPath, `${content.id}.permissions.json`);
    }

    private async findContentPath(contentId: string): Promise<string | null> {
        try {
            // Search through storage directory
            const searchPath = async (dir: string): Promise<string | null> => {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        const result = await searchPath(fullPath);
                        if (result) return result;
                    } else if (entry.isFile() && entry.name === `${contentId}.json`) {
                        return fullPath;
                    }
                }

                return null;
            };

            return await searchPath(this.baseStoragePath);

        } catch (error: any) {
            logger.error('Failed to find content path', {
                error: error.message,
                contentId
            });
            return null;
        }
    }

    private async indexContentForSearch(content: Content): Promise<void> {
        try {
            // Create searchable text from content
            const searchableText = this.createSearchableText(content);

            await vectorStoreService.ingestDocument({
                id: content.id,
                content: searchableText,
                metadata: {
                    type: 'resource',
                    courseId: content.courseId,
                    moduleId: content.moduleId,
                    title: content.title,
                    date: content.createdAt,
                    tags: [content.type]
                }
            });

        } catch (error: any) {
            logger.error('Failed to index content for search', {
                error: error.message,
                contentId: content.id
            });
            // Don't throw - indexing failure shouldn't prevent content storage
        }
    }

    private createSearchableText(content: Content): string {
        const parts = [
            content.title,
            content.description || '',
            JSON.stringify(content.data)
        ];
        return parts.join(' ');
    }

    private buildVectorFilter(query: SearchQuery): Record<string, any> {
        const filter: Record<string, any> = {};

        if (query.courseId) {
            filter.courseId = query.courseId;
        }

        if (query.moduleId) {
            filter.moduleId = query.moduleId;
        }

        if (query.type) {
            filter.tags = { $in: [query.type] };
        }

        return filter;
    }

    private async searchFileSystem(query: SearchQuery): Promise<Content[]> {
        const results: Content[] = [];

        const searchDir = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        await searchDir(fullPath);
                    } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.includes('.metadata') && !entry.name.includes('.versions') && !entry.name.includes('.permissions')) {
                        try {
                            const fileContent = await fs.readFile(fullPath, 'utf-8');
                            const content: Content = JSON.parse(fileContent);
                            results.push(content);
                        } catch (error) {
                            // Skip invalid JSON files
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        };

        await searchDir(this.baseStoragePath);
        return results;
    }

    private applyFilters(items: Content[], query: SearchQuery): Content[] {
        return items.filter(item => {
            if (query.type && item.type !== query.type) return false;
            if (query.courseId && item.courseId !== query.courseId) return false;
            if (query.moduleId && item.moduleId !== query.moduleId) return false;
            if (query.createdBy && item.createdBy !== query.createdBy) return false;
            if (query.dateFrom && item.createdAt < query.dateFrom) return false;
            if (query.dateTo && item.createdAt > query.dateTo) return false;
            return true;
        });
    }

    private async verifyBackup(backupPath: string, originalContent: Content): Promise<boolean> {
        try {
            const backupData = await fs.readFile(backupPath, 'utf-8');
            const backupContent = JSON.parse(backupData);

            // Verify content matches
            return backupContent.id === originalContent.id &&
                   JSON.stringify(backupContent.data) === JSON.stringify(originalContent.data);

        } catch (error) {
            return false;
        }
    }

    private calculateChecksum(data: any): string {
        const content = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    private hashQuery(query: SearchQuery): string {
        const content = JSON.stringify(query);
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString();
    }

    private async invalidateContentCache(courseId: string, moduleId?: string): Promise<void> {
        await cacheService.invalidateByTags([`course:${courseId}`]);
        if (moduleId) {
            await cacheService.invalidateByTags([`module:${moduleId}`]);
        }
    }
}

// Singleton instance
export const courseContentManagementService = new CourseContentManagementService();
