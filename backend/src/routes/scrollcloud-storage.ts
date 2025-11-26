/**
 * ScrollCloud Storage API Routes
 * 
 * RESTful API endpoints for the unified storage system supporting
 * all academic tools with real-time synchronization and version control.
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import { logger } from '../utils/logger';
import ScrollCloudStorageService from '../services/ScrollCloudStorageService';
import FileSynchronizationService from '../services/FileSynchronizationService';
import VersionControlService from '../services/VersionControlService';
import {
  FileUploadRequest,
  FileDownloadRequest,
  FileSyncRequest,
  FileSearchRequest,
  VersionControlOperation,
  MergeRequest,
  ScrollCloudError
} from '../types/scrollcloud-storage.types';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Basic file validation
    if (file.size > 100 * 1024 * 1024) {
      cb(new Error('File too large'));
      return;
    }
    cb(null, true);
  }
});

// Initialize services
const storageService = new ScrollCloudStorageService();
const syncService = new FileSynchronizationService();
const versionService = new VersionControlService();

// ============================================================================
// File Upload and Management
// ============================================================================

/**
 * Upload a file to ScrollCloud storage
 * POST /api/scrollcloud/files/upload
 */
router.post('/files/upload', auth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const uploadRequest: FileUploadRequest = {
      name: req.file.originalname,
      content: req.file.buffer,
      mimeType: req.file.mimetype,
      projectId: req.body.projectId,
      folderId: req.body.folderId,
      toolId: req.body.toolId,
      createVersion: req.body.createVersion === 'true',
      overwriteExisting: req.body.overwriteExisting === 'true',
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : undefined,
      tags: req.body.tags ? JSON.parse(req.body.tags) : undefined
    };

    const result = await storageService.uploadFile(uploadRequest, userId);

    logger.info('File uploaded successfully', {
      fileId: result.file.id,
      userId,
      filename: result.file.name
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error uploading file:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Download a file from ScrollCloud storage
 * GET /api/scrollcloud/files/:fileId/download
 */
router.get('/files/:fileId/download', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const downloadRequest: FileDownloadRequest = {
      fileId: req.params.fileId,
      version: req.query.version as string,
      format: req.query.format as any
    };

    const result = await storageService.downloadFile(downloadRequest, userId);

    logger.info('File download requested', {
      fileId: req.params.fileId,
      userId,
      version: downloadRequest.version
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error downloading file:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get file information
 * GET /api/scrollcloud/files/:fileId
 */
router.get('/files/:fileId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // TODO: Implement get file info
    res.json({
      success: true,
      data: {
        message: 'Get file info endpoint - to be implemented'
      }
    });

  } catch (error) {
    logger.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Delete a file
 * DELETE /api/scrollcloud/files/:fileId
 */
router.delete('/files/:fileId', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // TODO: Implement file deletion
    res.json({
      success: true,
      data: {
        message: 'File deletion endpoint - to be implemented'
      }
    });

  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================================================
// File Synchronization
// ============================================================================

/**
 * Synchronize files
 * POST /api/scrollcloud/sync
 */
router.post('/sync', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const syncRequest: FileSyncRequest = {
      fileIds: req.body.fileIds || [],
      operation: req.body.operation || 'sync',
      resolveConflicts: req.body.resolveConflicts === true
    };

    const result = await syncService.synchronizeFiles(syncRequest, userId);

    logger.info('File synchronization completed', {
      userId,
      fileCount: syncRequest.fileIds.length,
      syncedFiles: result.summary.syncedFiles
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error synchronizing files:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Start real-time sync for a file
 * POST /api/scrollcloud/files/:fileId/sync/start
 */
router.post('/files/:fileId/sync/start', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await syncService.startRealTimeSync(
      req.params.fileId,
      userId,
      req.body.toolId
    );

    res.json({
      success: true,
      data: {
        message: 'Real-time sync started',
        fileId: req.params.fileId
      }
    });

  } catch (error) {
    logger.error('Error starting real-time sync:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Stop real-time sync for a file
 * POST /api/scrollcloud/files/:fileId/sync/stop
 */
router.post('/files/:fileId/sync/stop', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await syncService.stopRealTimeSync(req.params.fileId);

    res.json({
      success: true,
      data: {
        message: 'Real-time sync stopped',
        fileId: req.params.fileId
      }
    });

  } catch (error) {
    logger.error('Error stopping real-time sync:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================================================
// Version Control
// ============================================================================

/**
 * Create a new version of a file
 * POST /api/scrollcloud/files/:fileId/versions
 */
router.post('/files/:fileId/versions', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const version = await versionService.createVersion(
      req.params.fileId,
      userId,
      req.body.description || 'New version',
      req.body.branchName
    );

    logger.info('File version created', {
      fileId: req.params.fileId,
      version: version.version,
      userId
    });

    res.json({
      success: true,
      data: version
    });

  } catch (error) {
    logger.error('Error creating file version:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get all versions of a file
 * GET /api/scrollcloud/files/:fileId/versions
 */
router.get('/files/:fileId/versions', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const versions = await versionService.getFileVersions(req.params.fileId, userId);

    res.json({
      success: true,
      data: versions
    });

  } catch (error) {
    logger.error('Error getting file versions:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Restore a file to a specific version
 * POST /api/scrollcloud/files/:fileId/versions/:versionId/restore
 */
router.post('/files/:fileId/versions/:versionId/restore', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const file = await versionService.restoreVersion(
      req.params.fileId,
      req.params.versionId,
      userId,
      req.body.createBackup !== false
    );

    logger.info('File version restored', {
      fileId: req.params.fileId,
      versionId: req.params.versionId,
      userId
    });

    res.json({
      success: true,
      data: file
    });

  } catch (error) {
    logger.error('Error restoring file version:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Create a branch
 * POST /api/scrollcloud/files/:fileId/branches
 */
router.post('/files/:fileId/branches', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const branch = await versionService.createBranch(
      req.params.fileId,
      req.body.branchName,
      req.body.sourceVersion,
      userId
    );

    res.json({
      success: true,
      data: branch
    });

  } catch (error) {
    logger.error('Error creating branch:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Merge versions
 * POST /api/scrollcloud/files/:fileId/merge
 */
router.post('/files/:fileId/merge', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const mergeRequest: MergeRequest = {
      fileId: req.params.fileId,
      sourceVersion: req.body.sourceVersion,
      targetVersion: req.body.targetVersion,
      strategy: req.body.strategy || 'auto',
      conflictResolution: req.body.conflictResolution
    };

    const result = await versionService.mergeVersions(mergeRequest, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error merging versions:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get version diff
 * GET /api/scrollcloud/files/:fileId/diff
 */
router.get('/files/:fileId/diff', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const version1 = req.query.version1 as string;
    const version2 = req.query.version2 as string;

    if (!version1 || !version2) {
      return res.status(400).json({
        success: false,
        error: 'Both version1 and version2 parameters are required'
      });
    }

    const diff = await versionService.getVersionDiff(
      req.params.fileId,
      version1,
      version2,
      userId
    );

    res.json({
      success: true,
      data: diff
    });

  } catch (error) {
    logger.error('Error getting version diff:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================================================
// Search and Discovery
// ============================================================================

/**
 * Search files
 * POST /api/scrollcloud/search
 */
router.post('/search', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const searchRequest: FileSearchRequest = {
      query: req.body.query || '',
      filters: req.body.filters || {},
      pagination: {
        page: req.body.page || 1,
        limit: req.body.limit || 20
      },
      sortBy: req.body.sortBy || 'relevance',
      sortOrder: req.body.sortOrder || 'desc'
    };

    const result = await storageService.searchFiles(searchRequest, userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error searching files:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================================================
// Analytics and Reporting
// ============================================================================

/**
 * Get storage analytics
 * GET /api/scrollcloud/analytics
 */
router.get('/analytics', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const analytics = await storageService.getStorageAnalytics(userId);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error getting storage analytics:', error);
    
    if (error instanceof ScrollCloudError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============================================================================
// Health Check
// ============================================================================

/**
 * Health check endpoint
 * GET /api/scrollcloud/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          storage: 'operational',
          synchronization: 'operational',
          versionControl: 'operational'
        }
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Service unhealthy'
    });
  }
});

// Error handling middleware
router.use((error: Error, req: Request, res: Response, next: any) => {
  logger.error('ScrollCloud API error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        code: 'TOO_MANY_FILES'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default router;