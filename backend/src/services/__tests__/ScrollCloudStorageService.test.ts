/**
 * ScrollCloud Storage Service Tests
 * 
 * Unit tests for the ScrollCloud storage system functionality.
 */

import ScrollCloudStorageService from '../ScrollCloudStorageService';
import { FileUploadRequest } from '../../types/scrollcloud-storage.types';

// Mock Supabase
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

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({}))
}));

describe('ScrollCloudStorageService', () => {
  let storageService: ScrollCloudStorageService;

  beforeEach(() => {
    storageService = new ScrollCloudStorageService();
  });

  describe('uploadFile', () => {
    it('should upload a file successfully', async () => {
      const uploadRequest: FileUploadRequest = {
        name: 'test-file.txt',
        content: Buffer.from('test content'),
        mimeType: 'text/plain',
        createVersion: true,
        overwriteExisting: false
      };

      const userId = 'test-user-id';

      // Mock the private methods that would normally interact with the database
      jest.spyOn(storageService as any, 'validateFileUpload').mockResolvedValue(undefined);
      jest.spyOn(storageService as any, 'createFileRecord').mockResolvedValue({
        id: 'test-file-id',
        name: 'test-file.txt',
        path: 'test/path',
        size: 12,
        mimeType: 'text/plain',
        format: 'txt',
        toolOrigin: 'unknown',
        compatibleTools: [],
        ownerId: userId,
        currentVersion: '1.0.0',
        versions: [],
        sharedWith: [],
        isPublic: false,
        syncStatus: {
          status: 'synced',
          lastSyncAttempt: new Date(),
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
      });
      jest.spyOn(storageService as any, 'createFileVersion').mockResolvedValue({
        id: 'version-id',
        version: '1.0.0',
        fileId: 'test-file-id',
        size: 12,
        checksum: 'test-hash',
        storagePath: 'test/path.v1.0.0',
        changeDescription: 'Initial version',
        changedBy: userId,
        createdAt: new Date(),
        isActive: true
      });
      jest.spyOn(storageService as any, 'createSyncOperation').mockResolvedValue({
        id: 'sync-op-id',
        fileId: 'test-file-id',
        operation: 'upload',
        status: 'pending',
        progress: 0,
        bytesTransferred: 0,
        totalBytes: 12,
        startedAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        userId,
        deviceId: 'server'
      });

      const result = await storageService.uploadFile(uploadRequest, userId);

      expect(result).toBeDefined();
      expect(result.file).toBeDefined();
      expect(result.file.name).toBe('test-file.txt');
      expect(result.file.ownerId).toBe(userId);
      expect(result.syncOperation).toBeDefined();
    });

    it('should handle upload errors gracefully', async () => {
      const uploadRequest: FileUploadRequest = {
        name: 'test-file.txt',
        content: Buffer.from('test content'),
        mimeType: 'text/plain',
        createVersion: false,
        overwriteExisting: false
      };

      const userId = 'test-user-id';

      // Mock validation to throw an error
      jest.spyOn(storageService as any, 'validateFileUpload').mockRejectedValue(
        new Error('File too large')
      );

      await expect(storageService.uploadFile(uploadRequest, userId))
        .rejects
        .toThrow('Failed to upload file: File too large');
    });
  });

  describe('downloadFile', () => {
    it('should generate download URL successfully', async () => {
      const downloadRequest = {
        fileId: 'test-file-id'
      };

      const userId = 'test-user-id';

      // Mock the private methods
      jest.spyOn(storageService as any, 'getFileById').mockResolvedValue({
        id: 'test-file-id',
        name: 'test-file.txt',
        storagePath: 'test/path',
        ownerId: userId,
        versions: []
      });
      jest.spyOn(storageService as any, 'checkFilePermissions').mockResolvedValue(undefined);
      jest.spyOn(storageService as any, 'updateFileLastAccessed').mockResolvedValue(undefined);
      jest.spyOn(storageService as any, 'logFileAccess').mockResolvedValue(undefined);

      const result = await storageService.downloadFile(downloadRequest, userId);

      expect(result).toBeDefined();
      expect(result.downloadUrl).toBe('https://test.com/signed-url');
      expect(result.file).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('Service initialization', () => {
    it('should initialize without errors', () => {
      expect(() => new ScrollCloudStorageService()).not.toThrow();
    });
  });
});