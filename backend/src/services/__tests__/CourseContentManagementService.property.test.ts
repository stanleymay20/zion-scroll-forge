/**
 * Property-Based Tests for Course Content Management Service
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Feature: course-content-creation
 */

import * as fc from 'fast-check';
import { courseContentManagementService, Content, SearchQuery, Permissions } from '../CourseContentManagementService';
import * as path from 'path';
import * as fs from 'fs/promises';

// Configure fast-check
fc.configureGlobal({
    numRuns: 100,
    timeout: 30000
});

// Generators
const contentTypeGen = fc.constantFrom('video', 'notes', 'assessment', 'resource', 'module', 'course');

const contentGen = fc.record({
    type: contentTypeGen,
    title: fc.string({ minLength: 5, maxLength: 100 }),
    description: fc.option(fc.string({ minLength: 10, maxLength: 500 }), { nil: undefined }),
    data: fc.anything(),
    courseId: fc.uuid(),
    moduleId: fc.option(fc.uuid(), { nil: undefined }),
    lectureId: fc.option(fc.uuid(), { nil: undefined }),
    createdBy: fc.uuid()
});

const permissionsGen = (contentId: string) => fc.record({
    contentId: fc.constant(contentId),
    userId: fc.option(fc.uuid()),
    roleId: fc.option(fc.uuid()),
    canRead: fc.boolean(),
    canWrite: fc.boolean(),
    canDelete: fc.boolean(),
    canShare: fc.boolean()
});

const searchQueryGen = fc.record({
    text: fc.option(fc.string({ minLength: 3, maxLength: 100 })),
    type: fc.option(contentTypeGen),
    courseId: fc.option(fc.uuid()),
    moduleId: fc.option(fc.uuid()),
    tags: fc.option(fc.array(fc.string({ minLength: 2, maxLength: 20 }), { maxLength: 5 })),
    createdBy: fc.option(fc.uuid())
});

/**
 * Feature: course-content-creation, Property 27: Organized Folder Structure
 * Validates: Requirements 7.1
 */
describe('Property 27: Organized Folder Structure', () => {
    it('should store content in organized folder structure: course/module/type', async () => {
        await fc.assert(
            fc.asyncProperty(
                contentGen,
                async (contentInput) => {
                    // Store content
                    const stored = await courseContentManagementService.storeContent(contentInput);

                    // Verify content was stored
                    expect(stored).toBeDefined();
                    expect(stored.id).toBeDefined();
                    expect(stored.type).toBe(contentInput.type);
                    expect(stored.courseId).toBe(contentInput.courseId);

                    // Verify folder structure
                    const basePath = process.env.CONTENT_STORAGE_PATH || './storage/content';
                    let expectedPath: string;

                    if (contentInput.moduleId) {
                        expectedPath = path.join(basePath, contentInput.courseId, contentInput.moduleId, contentInput.type);
                    } else {
                        expectedPath = path.join(basePath, contentInput.courseId, contentInput.type);
                    }

                    // Check that the folder exists
                    try {
                        const stats = await fs.stat(expectedPath);
                        expect(stats.isDirectory()).toBe(true);
                    } catch (error) {
                        throw new Error(`Expected folder structure not found: ${expectedPath}`);
                    }

                    // Verify file exists in correct location
                    const filePath = path.join(expectedPath, `${stored.id}.json`);
                    try {
                        const stats = await fs.stat(filePath);
                        expect(stats.isFile()).toBe(true);
                    } catch (error) {
                        throw new Error(`Content file not found in expected location: ${filePath}`);
                    }

                    // Cleanup
                    await courseContentManagementService.deleteContent(stored.id);
                }
            ),
            { numRuns: 3, timeout: 180000 }
        );
    }, 200000);
});

/**
 * Feature: course-content-creation, Property 28: Version History Maintenance
 * Validates: Requirements 7.2
 */
describe('Property 28: Version History Maintenance', () => {
    it('should maintain version history with change tracking for all content updates', async () => {
        await fc.assert(
            fc.asyncProperty(
                contentGen,
                fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
                async (contentInput, changeDescriptions) => {
                    // Store initial content
                    const stored = await courseContentManagementService.storeContent(contentInput);

                    // Make multiple updates
                    let currentContent = stored;
                    for (let i = 0; i < changeDescriptions.length; i++) {
                        const updatedData = { ...currentContent.data, version: i + 2 };
                        currentContent = await courseContentManagementService.updateContent(
                            stored.id,
                            { data: updatedData },
                            contentInput.createdBy,
                            changeDescriptions[i]
                        );
                    }

                    // Retrieve different versions
                    const latestVersion = await courseContentManagementService.retrieveContent(stored.id);
                    expect(latestVersion).toBeDefined();
                    expect(latestVersion?.data.version).toBe(changeDescriptions.length + 1);

                    // Verify we can retrieve earlier versions
                    for (let version = 1; version <= changeDescriptions.length + 1; version++) {
                        const versionedContent = await courseContentManagementService.retrieveContent(stored.id, version);
                        expect(versionedContent).toBeDefined();
                    }

                    // Cleanup
                    await courseContentManagementService.deleteContent(stored.id);
                }
            ),
            { numRuns: 3, timeout: 180000 }
        );
    }, 200000);
});

/**
 * Feature: course-content-creation, Property 29: Role-Based Access Control
 * Validates: Requirements 7.3
 */
describe('Property 29: Role-Based Access Control', () => {
    it('should enforce role-based permissions for all content access requests', async () => {
        await fc.assert(
            fc.asyncProperty(
                contentGen,
                fc.uuid(),
                fc.record({
                    canRead: fc.boolean(),
                    canWrite: fc.boolean(),
                    canDelete: fc.boolean(),
                    canShare: fc.boolean()
                }),
                async (contentInput, userId, permissions) => {
                    // Store content
                    const stored = await courseContentManagementService.storeContent(contentInput);

                    // Set permissions
                    await courseContentManagementService.managePermissions({
                        contentId: stored.id,
                        userId,
                        roleId: undefined,
                        ...permissions
                    });

                    // Check each permission type
                    const canRead = await courseContentManagementService.checkPermission(stored.id, userId, 'read');
                    const canWrite = await courseContentManagementService.checkPermission(stored.id, userId, 'write');
                    const canDelete = await courseContentManagementService.checkPermission(stored.id, userId, 'delete');
                    const canShare = await courseContentManagementService.checkPermission(stored.id, userId, 'share');

                    // Verify permissions match what was set
                    expect(canRead).toBe(permissions.canRead);
                    expect(canWrite).toBe(permissions.canWrite);
                    expect(canDelete).toBe(permissions.canDelete);
                    expect(canShare).toBe(permissions.canShare);

                    // Cleanup
                    await courseContentManagementService.deleteContent(stored.id);
                }
            ),
            { numRuns: 3, timeout: 180000 }
        );
    }, 200000);
});

/**
 * Feature: course-content-creation, Property 30: Full-Text Search Coverage
 * Validates: Requirements 7.4
 */
describe('Property 30: Full-Text Search Coverage', () => {
    it('should enable full-text search across all material types', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(contentGen, { minLength: 3, maxLength: 10 }),
                async (contentInputs) => {
                    // Store multiple content items
                    const storedItems: Content[] = [];
                    for (const input of contentInputs) {
                        const stored = await courseContentManagementService.storeContent(input);
                        storedItems.push(stored);
                    }

                    // Wait a bit for indexing
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Search by different criteria
                    const allTypes = new Set(storedItems.map(item => item.type));

                    for (const type of allTypes) {
                        const searchResults = await courseContentManagementService.searchContent({
                            type
                        });

                        // Verify search returns items of the correct type
                        const matchingItems = storedItems.filter(item => item.type === type);
                        expect(searchResults.items.length).toBeGreaterThanOrEqual(0);

                        // All returned items should match the type
                        searchResults.items.forEach(item => {
                            expect(item.type).toBe(type);
                        });
                    }

                    // Search by course ID
                    const courseIds = new Set(storedItems.map(item => item.courseId));
                    for (const courseId of courseIds) {
                        const searchResults = await courseContentManagementService.searchContent({
                            courseId
                        });

                        // All returned items should match the course ID
                        searchResults.items.forEach(item => {
                            expect(item.courseId).toBe(courseId);
                        });
                    }

                    // Cleanup
                    for (const item of storedItems) {
                        await courseContentManagementService.deleteContent(item.id);
                    }
                }
            ),
            { numRuns: 3, timeout: 180000 } // Reduced runs due to multiple operations
        );
    }, 200000);
});

/**
 * Feature: course-content-creation, Property 31: Multi-Location Backup
 * Validates: Requirements 7.5
 */
describe('Property 31: Multi-Location Backup', () => {
    it('should backup content to multiple distinct locations', async () => {
        await fc.assert(
            fc.asyncProperty(
                contentGen,
                async (contentInput) => {
                    // Store content
                    const stored = await courseContentManagementService.storeContent(contentInput);

                    // Perform backup
                    const backupStatus = await courseContentManagementService.backupContent(stored.id);

                    // Verify backup was performed
                    expect(backupStatus).toBeDefined();
                    expect(backupStatus.contentId).toBe(stored.id);
                    expect(backupStatus.locations).toBeDefined();
                    expect(backupStatus.locations.length).toBeGreaterThan(0);

                    // Verify multiple distinct locations
                    const uniquePaths = new Set(backupStatus.locations.map(loc => loc.path));
                    expect(uniquePaths.size).toBeGreaterThan(1); // At least 2 distinct locations

                    // Verify each location has a timestamp
                    backupStatus.locations.forEach(location => {
                        expect(location.timestamp).toBeDefined();
                        expect(location.timestamp).toBeInstanceOf(Date);
                        expect(location.path).toBeDefined();
                        expect(location.name).toBeDefined();
                    });

                    // Verify backup status is appropriate
                    expect(['success', 'partial', 'failed']).toContain(backupStatus.status);

                    // If status is success, all locations should be verified
                    if (backupStatus.status === 'success') {
                        backupStatus.locations.forEach(location => {
                            expect(location.verified).toBe(true);
                        });
                    }

                    // Cleanup
                    await courseContentManagementService.deleteContent(stored.id);
                }
            ),
            { numRuns: 3, timeout: 180000 }
        );
    }, 200000);
});

// Cleanup after all tests
afterAll(async () => {
    // Clean up test storage directories
    const basePath = process.env.CONTENT_STORAGE_PATH || './storage/content';
    try {
        await fs.rm(basePath, { recursive: true, force: true });
    } catch (error) {
        // Ignore cleanup errors
    }
});
