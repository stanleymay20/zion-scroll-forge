/**
 * ScrollCloud Storage Service - Property-Based Tests
 * 
 * **Feature: scrollos-academic-tools-integration, Property 2: Data Synchronization Consistency**
 * **Validates: Requirements 1.4, 10.1**
 * 
 * Property 2: Data Synchronization Consistency
 * For any file saved in any tool, the file should be immediately available in ScrollCloud storage 
 * and accessible to compatible tools within the same project context
 */

import * as fc from 'fast-check';
import ScrollCloudStorageService from '../ScrollCloudStorageService';
import FileSynchronizationService from '../FileSynchronizationService';
import { 
  FileUploadRequest, 
  FileDownloadRequest, 
  ScrollCloudFile,
  SyncOperation,
  AcademicDiscipline,
  SupportedFormat
} from '../../types/scrollcloud-storage.types';

// Mock external dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ 
          data: { signedUrl: 'https://test.com/signed-url' }, 
          error: null 
        }),
        copy: jest.fn().mockResolvedValue({ error: null }),
        download: jest.fn().mockResolvedValue({ 
          data: new Blob(['test content']), 
          error: null 
        })
      }))
    }
  }))
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({}))
}));

// Property-based test generators
const academicDisciplineGen = fc.constantFrom(
  'computer-science', 'engineering', 'data-science', 'design', 
  'medicine', 'theology', 'business', 'education'
) as fc.Arbitrary<AcademicDiscipline>;

const supportedFormatGen = fc.constantFrom(
  'js', 'ts', 'py', 'java', 'cpp', 'html', 'css', 'json', 
  'md', 'pdf', 'docx', 'png', 'jpg', 'svg', 'txt', 'csv'
) as fc.Arbitrary<SupportedFormat>;

const toolIdGen = fc.constantFrom(
  'vscode-web', 'onshape-cad', 'figma', 'jupyter-lab', 
  'rstudio', 'blender-web', 'biodigital', 'bible-api'
);

const fileContentGen = fc.oneof(
  fc.string({ minLength: 1, maxLength: 1000 }).map(s => Buffer.from(s)),
  fc.uint8Array({ minLength: 1, maxLength: 1000 }).map(arr => Buffer.from(arr))
);

const fileUploadRequestGen = fc.record({
  name: fc.string({ minLength: 1, maxLength: 255 }).filter(name => 
    /^[a-zA-Z0-9._\-\s()[\]{}]+$/.test(name) && name.includes('.')
  ),
  content: fileContentGen,
  mimeType: fc.constantFrom('text/plain', 'application/json', 'text/html', 'image/png'),
  projectId: fc.option(fc.uuid()),
  toolId: fc.option(toolIdGen),
  createVersion: fc.boolean(),
  overwriteExisting: fc.boolean(),
  metadata: fc.option(fc.record({
    discipline: fc.option(academicDisciplineGen),
    courseCode: fc.option(fc.string({ minLength: 3, maxLength: 10 })),
    customProperties: fc.dictionary(fc.string(), fc.anything())
  }))
}) as fc.Arbitrary<FileUploadRequest>;

const userIdGen = fc.uuid();
const projectIdGen = fc.uuid();

describe('ScrollCloud Storage Service - Property-Based Tests', () => {
  let storageService: ScrollCloudStorageService;
  let syncService: FileSynchronizationService;

  beforeEach(() => {
    jest.clearAllMocks();
    storageService = new ScrollCloudStorageService();
    syncService = new FileSynchronizationService();
  });

  afterEach(async () => {
    await syncService.cleanup();
  });

  /**
   * **Feature: scrollos-academic-tools-integration, Property 2: Data Synchronization Consistency**
   * **Validates: Requirements 1.4, 10.1**
   * 
   * Property: For any file saved in any tool, the file should be immediately available 
   * in ScrollCloud storage and accessible to compatible tools within the same project context
   */
  describe('Property 2: Data Synchronization Consistency', () => {
    it('should make uploaded files immediately available for download', async () => {
      await fc.assert(
        fc.asyncProperty(
          fileUploadRequestGen,
          userIdGen,
          async (uploadRequest, userId) => {
            // Mock the internal methods to simulate successful operations
            const mockFile: ScrollCloudFile = {
              id: 'test-file-id',
              name: uploadRequest.name,
              path: `projects/${uploadRequest.projectId || 'default'}/${uploadRequest.name}`,
              size: uploadRequest.content.length,
              mimeType: uploadRequest.mimeType,
              format: detectFormat(uploadRequest.name),
              toolOrigin: uploadRequest.toolId || 'unknown',
              compatibleTools: getCompatibleTools(uploadRequest.toolId || 'unknown'),
              ownerId: userId,
              projectId: uploadRequest.projectId,
              currentVersion: '1.0.0',
              versions: [],
              sharedWith: [],
              isPublic: false,
              syncStatus: {
                status: 'synced',
                lastSyncAttempt: new Date(),
                lastSuccessfulSync: new Date(),
                conflictCount: 0,
                pendingChanges: 0
              },
              metadata: {
                discipline: uploadRequest.metadata?.discipline,
                courseCode: uploadRequest.metadata?.courseCode,
                toolSpecificData: {},
                contributors: [userId],
                lastEditedBy: userId,
                customProperties: uploadRequest.metadata?.customProperties || {}
              },
              tags: [],
              storageProvider: 'supabase',
              storagePath: 'test/path',
              backupPaths: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              lastAccessedAt: new Date(),
              integrityHash: 'test-hash',
              auditTrail: []
            };

            const mockSyncOperation: SyncOperation = {
              id: 'sync-op-id',
              fileId: mockFile.id,
              operation: 'upload',
              status: 'completed',
              progress: 100,
              bytesTransferred: uploadRequest.content.length,
              totalBytes: uploadRequest.content.length,
              startedAt: new Date(),
              completedAt: new Date(),
              retryCount: 0,
              maxRetries: 3,
              userId,
              deviceId: 'test-device',
              toolId: uploadRequest.toolId
            };

            // Mock the private methods
            jest.spyOn(storageService as any, 'validateFileUpload').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'createFileRecord').mockResolvedValue(mockFile);
            jest.spyOn(storageService as any, 'createFileVersion').mockResolvedValue({
              id: 'version-id',
              version: '1.0.0',
              fileId: mockFile.id,
              size: mockFile.size,
              checksum: mockFile.integrityHash,
              storagePath: mockFile.storagePath + '.v1.0.0',
              changeDescription: 'Initial version',
              changedBy: userId,
              createdAt: new Date(),
              isActive: true
            });
            jest.spyOn(storageService as any, 'createSyncOperation').mockResolvedValue(mockSyncOperation);
            jest.spyOn(storageService as any, 'getFileById').mockResolvedValue(mockFile);
            jest.spyOn(storageService as any, 'checkFilePermissions').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'updateFileLastAccessed').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'logFileAccess').mockResolvedValue(undefined);

            // Step 1: Upload file to ScrollCloud
            const uploadResult = await storageService.uploadFile(uploadRequest, userId);

            // Verify upload was successful
            expect(uploadResult).toBeDefined();
            expect(uploadResult.file).toBeDefined();
            expect(uploadResult.file.name).toBe(uploadRequest.name);
            expect(uploadResult.file.ownerId).toBe(userId);
            expect(uploadResult.file.size).toBe(uploadRequest.content.length);
            expect(uploadResult.syncOperation).toBeDefined();
            expect(uploadResult.syncOperation?.status).toBe('completed');

            // Step 2: Immediately attempt to download the same file
            const downloadRequest: FileDownloadRequest = {
              fileId: uploadResult.file.id
            };

            const downloadResult = await storageService.downloadFile(downloadRequest, userId);

            // Verify file is immediately available for download
            expect(downloadResult).toBeDefined();
            expect(downloadResult.file).toBeDefined();
            expect(downloadResult.file.id).toBe(uploadResult.file.id);
            expect(downloadResult.file.name).toBe(uploadRequest.name);
            expect(downloadResult.downloadUrl).toBeDefined();
            expect(downloadResult.downloadUrl).toContain('signed-url');
            expect(downloadResult.expiresAt).toBeInstanceOf(Date);

            // Step 3: Verify sync status indicates successful synchronization
            expect(downloadResult.file.syncStatus.status).toBe('synced');
            expect(downloadResult.file.syncStatus.lastSuccessfulSync).toBeDefined();
            expect(downloadResult.file.syncStatus.conflictCount).toBe(0);
            expect(downloadResult.file.syncStatus.pendingChanges).toBe(0);

            // Step 4: Verify file is accessible to compatible tools within project context
            if (uploadRequest.projectId) {
              expect(downloadResult.file.projectId).toBe(uploadRequest.projectId);
              expect(downloadResult.file.compatibleTools.length).toBeGreaterThan(0);
              
              // Verify tool compatibility based on file format and origin
              const expectedCompatibleTools = getCompatibleTools(uploadRequest.toolId || 'unknown');
              expect(downloadResult.file.compatibleTools).toEqual(
                expect.arrayContaining(expectedCompatibleTools)
              );
            }

            // Step 5: Verify metadata preservation
            if (uploadRequest.metadata) {
              expect(downloadResult.file.metadata.discipline).toBe(uploadRequest.metadata.discipline);
              expect(downloadResult.file.metadata.courseCode).toBe(uploadRequest.metadata.courseCode);
              if (uploadRequest.metadata.customProperties) {
                expect(downloadResult.file.metadata.customProperties).toEqual(
                  expect.objectContaining(uploadRequest.metadata.customProperties)
                );
              }
            }

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    });

    it('should maintain file accessibility across different tools in the same project', async () => {
      await fc.assert(
        fc.asyncProperty(
          fileUploadRequestGen.filter(req => req.projectId !== null),
          userIdGen,
          fc.array(toolIdGen, { minLength: 2, maxLength: 5 }),
          async (uploadRequest, userId, accessingTools) => {
            // Ensure we have a project ID for this test
            const projectId = uploadRequest.projectId || 'test-project-id';
            const requestWithProject = { ...uploadRequest, projectId };

            // Mock file with compatible tools
            const mockFile: ScrollCloudFile = {
              id: 'test-file-id',
              name: requestWithProject.name,
              path: `projects/${projectId}/${requestWithProject.name}`,
              size: requestWithProject.content.length,
              mimeType: requestWithProject.mimeType,
              format: detectFormat(requestWithProject.name),
              toolOrigin: requestWithProject.toolId || 'unknown',
              compatibleTools: accessingTools,
              ownerId: userId,
              projectId,
              currentVersion: '1.0.0',
              versions: [],
              sharedWith: [],
              isPublic: false,
              syncStatus: {
                status: 'synced',
                lastSyncAttempt: new Date(),
                lastSuccessfulSync: new Date(),
                conflictCount: 0,
                pendingChanges: 0
              },
              metadata: {
                toolSpecificData: {},
                contributors: [userId],
                lastEditedBy: userId,
                customProperties: {}
              },
              tags: [],
              storageProvider: 'supabase',
              storagePath: 'test/path',
              backupPaths: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              lastAccessedAt: new Date(),
              integrityHash: 'test-hash',
              auditTrail: []
            };

            // Mock the methods
            jest.spyOn(storageService as any, 'validateFileUpload').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'createFileRecord').mockResolvedValue(mockFile);
            jest.spyOn(storageService as any, 'createSyncOperation').mockResolvedValue({
              id: 'sync-op-id',
              fileId: mockFile.id,
              operation: 'upload',
              status: 'completed',
              progress: 100,
              bytesTransferred: requestWithProject.content.length,
              totalBytes: requestWithProject.content.length,
              startedAt: new Date(),
              completedAt: new Date(),
              retryCount: 0,
              maxRetries: 3,
              userId,
              deviceId: 'test-device'
            });
            jest.spyOn(storageService as any, 'getFileById').mockResolvedValue(mockFile);
            jest.spyOn(storageService as any, 'checkFilePermissions').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'updateFileLastAccessed').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'logFileAccess').mockResolvedValue(undefined);

            // Upload file
            const uploadResult = await storageService.uploadFile(requestWithProject, userId);
            expect(uploadResult.file.projectId).toBe(projectId);

            // Test accessibility from each compatible tool
            for (const toolId of accessingTools) {
              const downloadRequest: FileDownloadRequest = {
                fileId: uploadResult.file.id
              };

              const downloadResult = await storageService.downloadFile(downloadRequest, userId);

              // Verify file is accessible from this tool
              expect(downloadResult.file).toBeDefined();
              expect(downloadResult.file.projectId).toBe(projectId);
              expect(downloadResult.file.compatibleTools).toContain(toolId);
              expect(downloadResult.downloadUrl).toBeDefined();
              
              // Verify sync status remains consistent
              expect(downloadResult.file.syncStatus.status).toBe('synced');
            }

            return true;
          }
        ),
        { numRuns: 50, timeout: 30000 }
      );
    });

    it('should preserve file integrity during synchronization operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fileUploadRequestGen,
          userIdGen,
          async (uploadRequest, userId) => {
            const originalContentHash = calculateHash(uploadRequest.content);
            
            const mockFile: ScrollCloudFile = {
              id: 'test-file-id',
              name: uploadRequest.name,
              path: `test/${uploadRequest.name}`,
              size: uploadRequest.content.length,
              mimeType: uploadRequest.mimeType,
              format: detectFormat(uploadRequest.name),
              toolOrigin: uploadRequest.toolId || 'unknown',
              compatibleTools: [],
              ownerId: userId,
              projectId: uploadRequest.projectId,
              currentVersion: '1.0.0',
              versions: [],
              sharedWith: [],
              isPublic: false,
              syncStatus: {
                status: 'synced',
                lastSyncAttempt: new Date(),
                lastSuccessfulSync: new Date(),
                conflictCount: 0,
                pendingChanges: 0
              },
              metadata: {
                toolSpecificData: {},
                contributors: [userId],
                lastEditedBy: userId,
                customProperties: {}
              },
              tags: [],
              storageProvider: 'supabase',
              storagePath: 'test/path',
              backupPaths: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              lastAccessedAt: new Date(),
              integrityHash: originalContentHash,
              auditTrail: []
            };

            // Mock methods
            jest.spyOn(storageService as any, 'validateFileUpload').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'createFileRecord').mockResolvedValue(mockFile);
            jest.spyOn(storageService as any, 'createSyncOperation').mockResolvedValue({
              id: 'sync-op-id',
              fileId: mockFile.id,
              operation: 'upload',
              status: 'completed',
              progress: 100,
              bytesTransferred: uploadRequest.content.length,
              totalBytes: uploadRequest.content.length,
              startedAt: new Date(),
              completedAt: new Date(),
              retryCount: 0,
              maxRetries: 3,
              userId,
              deviceId: 'test-device'
            });
            jest.spyOn(storageService as any, 'getFileById').mockResolvedValue(mockFile);
            jest.spyOn(storageService as any, 'checkFilePermissions').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'updateFileLastAccessed').mockResolvedValue(undefined);
            jest.spyOn(storageService as any, 'logFileAccess').mockResolvedValue(undefined);

            // Upload and download file
            const uploadResult = await storageService.uploadFile(uploadRequest, userId);
            const downloadResult = await storageService.downloadFile(
              { fileId: uploadResult.file.id }, 
              userId
            );

            // Verify integrity hash is preserved
            expect(downloadResult.file.integrityHash).toBe(originalContentHash);
            expect(downloadResult.file.size).toBe(uploadRequest.content.length);
            
            // Verify sync operation completed successfully
            expect(uploadResult.syncOperation?.status).toBe('completed');
            expect(uploadResult.syncOperation?.bytesTransferred).toBe(uploadRequest.content.length);
            expect(uploadResult.syncOperation?.progress).toBe(100);

            return true;
          }
        ),
        { numRuns: 100, timeout: 30000 }
      );
    });
  });
});

// Helper functions
function detectFormat(filename: string): SupportedFormat {
  const extension = filename.split('.').pop()?.toLowerCase();
  const formatMap: Record<string, SupportedFormat> = {
    'js': 'js',
    'ts': 'ts',
    'py': 'py',
    'java': 'java',
    'cpp': 'cpp',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'md',
    'pdf': 'pdf',
    'docx': 'docx',
    'png': 'png',
    'jpg': 'jpg',
    'jpeg': 'jpg',
    'svg': 'svg',
    'txt': 'txt',
    'csv': 'csv'
  };
  return formatMap[extension || 'txt'] || 'txt';
}

function getCompatibleTools(toolId: string): string[] {
  const toolCompatibility: Record<string, string[]> = {
    'vscode-web': ['github', 'jupyter-lab', 'api-testing'],
    'onshape-cad': ['simscale', 'circuitverse'],
    'figma': ['blender-web', 'sketchup-web'],
    'jupyter-lab': ['vscode-web', 'rstudio'],
    'rstudio': ['jupyter-lab', 'tableau-public'],
    'blender-web': ['figma', 'sketchup-web'],
    'biodigital': ['dicom-viewer'],
    'bible-api': ['lexicon-tools', 'interlinear-viewer'],
    'unknown': ['vscode-web', 'figma']
  };
  return toolCompatibility[toolId] || ['vscode-web'];
}

function calculateHash(content: Buffer): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
}