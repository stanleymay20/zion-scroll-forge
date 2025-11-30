/**
 * Version Control Service
 * 
 * Provides Git-like versioning for all tool outputs with branching,
 * merging capabilities, and conflict resolution for collaborative work.
 */

import { PrismaClient } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { scrollCloudConfig } from '../config/scrollcloud-storage.config';
import {
  FileVersion,
  ScrollCloudFile,
  VersionControlOperation,
  MergeRequest,
  MergeResult,
  ConflictResolution,
  ScrollCloudError
} from '../types/scrollcloud-storage.types';
import crypto from 'crypto';
import { diff_match_patch } from 'diff-match-patch';

export class VersionControlService {
  private prisma: PrismaClient;
  private supabase: SupabaseClient;
  private dmp: diff_match_patch;
  private readonly bucketName: string;

  constructor() {
    this.prisma = new PrismaClient();
    
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName = scrollCloudConfig.providers.supabase.config.bucketName;
    
    this.dmp = new diff_match_patch();
    
    logger.info('Version Control Service initialized');
  }

  // ============================================================================
  // Version Management
  // ============================================================================

  /**
   * Create a new version of a file
   */
  async createVersion(
    fileId: string,
    userId: string,
    description: string,
    branchName?: string
  ): Promise<FileVersion> {
    try {
      logger.info('Creating new file version', {
        fileId,
        userId,
        description,
        branchName
      });

      // Get current file
      const file = await this.getFileById(fileId);
      if (!file) {
        throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
      }

      // Check permissions
      await this.checkVersionPermissions(file, userId);

      // Generate version number
      const versionNumber = this.generateVersionNumber(file.versions, branchName);
      
      // Create version storage path
      const versionPath = this.generateVersionPath(file.storagePath, versionNumber);

      // Copy current file to version path
      const { error: copyError } = await this.supabase.storage
        .from(this.bucketName)
        .copy(file.storagePath, versionPath);

      if (copyError) {
        throw new ScrollCloudError(
          `Failed to create version storage: ${copyError.message}`,
          'VERSION_STORAGE_ERROR'
        );
      }

      // Create version record
      const version: FileVersion = {
        id: crypto.randomUUID(),
        version: versionNumber,
        fileId,
        size: file.size,
        checksum: file.integrityHash,
        storagePath: versionPath,
        changeDescription: description,
        changedBy: userId,
        parentVersion: file.currentVersion,
        createdAt: new Date(),
        isActive: true,
        branchName
      };

      // Update file record
      file.versions.push(version);
      if (!branchName || branchName === 'main') {
        file.currentVersion = versionNumber;
      }
      file.updatedAt = new Date();

      // Save to database
      await this.updateFileRecord(file);
      await this.saveVersionRecord(version);

      // Log version creation
      await this.logVersionAction(fileId, userId, 'version_created', {
        version: versionNumber,
        description,
        branchName
      });

      logger.info('File version created successfully', {
        fileId,
        version: versionNumber,
        branchName
      });

      return version;

    } catch (error) {
      logger.error('Error creating file version:', error);
      if (error instanceof ScrollCloudError) {
        throw error;
      }
      throw new ScrollCloudError(
        `Failed to create version: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VERSION_CREATE_ERROR'
      );
    }
  }

  /**
   * Get all versions of a file
   */
  async getFileVersions(fileId: string, userId: string): Promise<FileVersion[]> {
    try {
      logger.info('Getting file versions', { fileId, userId });

      const file = await this.getFileById(fileId);
      if (!file) {
        throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
      }

      await this.checkVersionPermissions(file, userId);

      // Sort versions by creation date (newest first)
      const versions = file.versions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      logger.info('Retrieved file versions', {
        fileId,
        versionCount: versions.length
      });

      return versions;

    } catch (error) {
      logger.error('Error getting file versions:', error);
      if (error instanceof ScrollCloudError) {
        throw error;
      }
      throw new ScrollCloudError(
        `Failed to get versions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VERSION_GET_ERROR'
      );
    }
  }

  /**
   * Restore a file to a specific version
   */
  async restoreVersion(
    fileId: string,
    versionId: string,
    userId: string,
    createBackup = true
  ): Promise<ScrollCloudFile> {
    try {
      logger.info('Restoring file version', {
        fileId,
        versionId,
        userId,
        createBackup
      });

      const file = await this.getFileById(fileId);
      if (!file) {
        throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
      }

      await this.checkVersionPermissions(file, userId);

      const version = file.versions.find(v => v.id === versionId);
      if (!version) {
        throw new ScrollCloudError('Version not found', 'VERSION_NOT_FOUND');
      }

      // Create backup of current version if requested
      if (createBackup) {
        await this.createVersion(
          fileId,
          userId,
          `Backup before restoring to version ${version.version}`
        );
      }

      // Copy version content to main file
      const { error: copyError } = await this.supabase.storage
        .from(this.bucketName)
        .copy(version.storagePath, file.storagePath);

      if (copyError) {
        throw new ScrollCloudError(
          `Failed to restore version: ${copyError.message}`,
          'VERSION_RESTORE_ERROR'
        );
      }

      // Update file metadata
      file.currentVersion = version.version;
      file.size = version.size;
      file.integrityHash = version.checksum;
      file.updatedAt = new Date();

      await this.updateFileRecord(file);

      // Log version restoration
      await this.logVersionAction(fileId, userId, 'version_restored', {
        restoredVersion: version.version,
        previousVersion: file.currentVersion
      });

      logger.info('File version restored successfully', {
        fileId,
        restoredVersion: version.version
      });

      return file;

    } catch (error) {
      logger.error('Error restoring file version:', error);
      if (error instanceof ScrollCloudError) {
        throw error;
      }
      throw new ScrollCloudError(
        `Failed to restore version: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'VERSION_RESTORE_ERROR'
      );
    }
  }

  // ============================================================================
  // Branching and Merging
  // ============================================================================

  /**
   * Create a new branch from a specific version
   */
  async createBranch(
    fileId: string,
    branchName: string,
    sourceVersion: string,
    userId: string
  ): Promise<FileVersion> {
    try {
      logger.info('Creating new branch', {
        fileId,
        branchName,
        sourceVersion,
        userId
      });

      const file = await this.getFileById(fileId);
      if (!file) {
        throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
      }

      await this.checkVersionPermissions(file, userId);

      // Check if branch already exists
      const existingBranch = file.versions.find(v => v.branchName === branchName);
      if (existingBranch) {
        throw new ScrollCloudError('Branch already exists', 'BRANCH_EXISTS');
      }

      // Find source version
      const sourceVersionObj = file.versions.find(v => v.version === sourceVersion);
      if (!sourceVersionObj) {
        throw new ScrollCloudError('Source version not found', 'VERSION_NOT_FOUND');
      }

      // Create branch version
      const branchVersion = await this.createVersion(
        fileId,
        userId,
        `Created branch '${branchName}' from version ${sourceVersion}`,
        branchName
      );

      logger.info('Branch created successfully', {
        fileId,
        branchName,
        branchVersion: branchVersion.version
      });

      return branchVersion;

    } catch (error) {
      logger.error('Error creating branch:', error);
      if (error instanceof ScrollCloudError) {
        throw error;
      }
      throw new ScrollCloudError(
        `Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BRANCH_CREATE_ERROR'
      );
    }
  }

  /**
   * Merge two versions/branches
   */
  async mergeVersions(request: MergeRequest, userId: string): Promise<MergeResult> {
    try {
      logger.info('Merging versions', {
        fileId: request.fileId,
        sourceVersion: request.sourceVersion,
        targetVersion: request.targetVersion,
        strategy: request.strategy,
        userId
      });

      const file = await this.getFileById(request.fileId);
      if (!file) {
        throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
      }

      await this.checkVersionPermissions(file, userId);

      // Get source and target versions
      const sourceVersion = file.versions.find(v => v.version === request.sourceVersion);
      const targetVersion = file.versions.find(v => v.version === request.targetVersion);

      if (!sourceVersion || !targetVersion) {
        throw new ScrollCloudError('Version not found', 'VERSION_NOT_FOUND');
      }

      // Get file contents
      const sourceContent = await this.getVersionContent(sourceVersion);
      const targetContent = await this.getVersionContent(targetVersion);

      let mergeResult: MergeResult;

      switch (request.strategy) {
        case 'auto':
          mergeResult = await this.performAutoMerge(sourceContent, targetContent);
          break;
        case 'three_way':
          mergeResult = await this.performThreeWayMerge(
            sourceContent,
            targetContent,
            await this.findCommonAncestor(sourceVersion, targetVersion)
          );
          break;
        case 'manual':
          mergeResult = await this.performManualMerge(
            sourceContent,
            targetContent,
            request.conflictResolution
          );
          break;
        default:
          throw new ScrollCloudError('Invalid merge strategy', 'INVALID_MERGE_STRATEGY');
      }

      // If merge was successful, create new version
      if (mergeResult.success && mergeResult.mergedContent) {
        const newVersion = await this.createVersionFromContent(
          request.fileId,
          mergeResult.mergedContent,
          userId,
          `Merged ${request.sourceVersion} into ${request.targetVersion}`
        );
        
        mergeResult.newVersion = newVersion.version;
      }

      // Log merge operation
      await this.logVersionAction(request.fileId, userId, 'versions_merged', {
        sourceVersion: request.sourceVersion,
        targetVersion: request.targetVersion,
        strategy: request.strategy,
        success: mergeResult.success,
        newVersion: mergeResult.newVersion
      });

      logger.info('Version merge completed', {
        fileId: request.fileId,
        success: mergeResult.success,
        conflictCount: mergeResult.conflicts?.length || 0
      });

      return mergeResult;

    } catch (error) {
      logger.error('Error merging versions:', error);
      if (error instanceof ScrollCloudError) {
        throw error;
      }
      throw new ScrollCloudError(
        `Failed to merge versions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MERGE_ERROR'
      );
    }
  }

  /**
   * Get differences between two versions
   */
  async getVersionDiff(
    fileId: string,
    version1: string,
    version2: string,
    userId: string
  ): Promise<any> {
    try {
      logger.info('Getting version diff', {
        fileId,
        version1,
        version2,
        userId
      });

      const file = await this.getFileById(fileId);
      if (!file) {
        throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
      }

      await this.checkVersionPermissions(file, userId);

      // Get version objects
      const v1 = file.versions.find(v => v.version === version1);
      const v2 = file.versions.find(v => v.version === version2);

      if (!v1 || !v2) {
        throw new ScrollCloudError('Version not found', 'VERSION_NOT_FOUND');
      }

      // Get content for both versions
      const content1 = await this.getVersionContent(v1);
      const content2 = await this.getVersionContent(v2);

      // Calculate diff
      const diffs = this.dmp.diff_main(content1, content2);
      this.dmp.diff_cleanupSemantic(diffs);

      // Convert to structured format
      const structuredDiff = this.convertDiffToStructured(diffs);

      logger.info('Version diff calculated', {
        fileId,
        changeCount: structuredDiff.changes.length
      });

      return {
        fileId,
        version1,
        version2,
        diff: structuredDiff,
        summary: {
          additions: structuredDiff.changes.filter(c => c.type === 'addition').length,
          deletions: structuredDiff.changes.filter(c => c.type === 'deletion').length,
          modifications: structuredDiff.changes.filter(c => c.type === 'modification').length
        }
      };

    } catch (error) {
      logger.error('Error getting version diff:', error);
      if (error instanceof ScrollCloudError) {
        throw error;
      }
      throw new ScrollCloudError(
        `Failed to get version diff: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DIFF_ERROR'
      );
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private generateVersionNumber(versions: FileVersion[], branchName?: string): string {
    if (versions.length === 0) {
      return branchName && branchName !== 'main' ? `${branchName}-1.0.0` : '1.0.0';
    }

    // Filter versions for the specific branch
    const branchVersions = branchName 
      ? versions.filter(v => v.branchName === branchName)
      : versions.filter(v => !v.branchName || v.branchName === 'main');

    if (branchVersions.length === 0) {
      return branchName && branchName !== 'main' ? `${branchName}-1.0.0` : '1.0.0';
    }

    // Get latest version and increment
    const latestVersion = branchVersions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const versionPart = latestVersion.version.replace(`${branchName}-`, '');
    const parts = versionPart.split('.').map(Number);
    parts[2]++; // Increment patch version

    const newVersion = parts.join('.');
    return branchName && branchName !== 'main' ? `${branchName}-${newVersion}` : newVersion;
  }

  private generateVersionPath(originalPath: string, version: string): string {
    const pathParts = originalPath.split('.');
    const extension = pathParts.pop();
    const basePath = pathParts.join('.');
    
    return `${basePath}.v${version}.${extension}`;
  }

  private async getVersionContent(version: FileVersion): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(version.storagePath);

      if (error) {
        throw new ScrollCloudError(
          `Failed to download version content: ${error.message}`,
          'VERSION_DOWNLOAD_ERROR'
        );
      }

      return await data.text();

    } catch (error) {
      logger.error('Error getting version content:', error);
      throw error;
    }
  }

  private async performAutoMerge(sourceContent: string, targetContent: string): Promise<MergeResult> {
    try {
      // Simple auto-merge using diff-match-patch
      const diffs = this.dmp.diff_main(targetContent, sourceContent);
      this.dmp.diff_cleanupSemantic(diffs);

      // Check for conflicts (overlapping changes)
      const hasConflicts = this.detectMergeConflicts(diffs);
      
      if (hasConflicts) {
        return {
          success: false,
          conflicts: await this.createMergeConflicts(diffs)
        };
      }

      // Apply patches
      const patches = this.dmp.patch_make(targetContent, diffs);
      const [mergedContent, results] = this.dmp.patch_apply(patches, targetContent);

      // Check if all patches applied successfully
      const allApplied = results.every(result => result === true);

      return {
        success: allApplied,
        mergedContent: allApplied ? mergedContent : undefined,
        conflicts: allApplied ? undefined : await this.createMergeConflicts(diffs)
      };

    } catch (error) {
      logger.error('Error in auto merge:', error);
      return {
        success: false,
        conflicts: []
      };
    }
  }

  private async performThreeWayMerge(
    sourceContent: string,
    targetContent: string,
    baseContent: string
  ): Promise<MergeResult> {
    try {
      // Three-way merge algorithm
      const sourceDiffs = this.dmp.diff_main(baseContent, sourceContent);
      const targetDiffs = this.dmp.diff_main(baseContent, targetContent);

      this.dmp.diff_cleanupSemantic(sourceDiffs);
      this.dmp.diff_cleanupSemantic(targetDiffs);

      // Detect conflicts between source and target changes
      const conflicts = this.detectThreeWayConflicts(sourceDiffs, targetDiffs);

      if (conflicts.length > 0) {
        return {
          success: false,
          conflicts: await this.createMergeConflicts(sourceDiffs)
        };
      }

      // Apply both sets of changes
      let mergedContent = baseContent;
      
      // Apply target changes first
      const targetPatches = this.dmp.patch_make(baseContent, targetDiffs);
      const [tempContent] = this.dmp.patch_apply(targetPatches, mergedContent);
      
      // Then apply source changes
      const sourcePatches = this.dmp.patch_make(baseContent, sourceDiffs);
      const [finalContent, results] = this.dmp.patch_apply(sourcePatches, tempContent);

      const allApplied = results.every(result => result === true);

      return {
        success: allApplied,
        mergedContent: allApplied ? finalContent : undefined
      };

    } catch (error) {
      logger.error('Error in three-way merge:', error);
      return {
        success: false,
        conflicts: []
      };
    }
  }

  private async performManualMerge(
    sourceContent: string,
    targetContent: string,
    conflictResolution?: Record<string, any>
  ): Promise<MergeResult> {
    // Manual merge with user-provided conflict resolution
    if (!conflictResolution) {
      return {
        success: false,
        conflicts: []
      };
    }

    // Apply manual resolution
    const mergedContent = this.applyManualResolution(
      sourceContent,
      targetContent,
      conflictResolution
    );

    return {
      success: true,
      mergedContent
    };
  }

  private async createVersionFromContent(
    fileId: string,
    content: string,
    userId: string,
    description: string
  ): Promise<FileVersion> {
    // Upload merged content and create version
    const file = await this.getFileById(fileId);
    if (!file) {
      throw new ScrollCloudError('File not found', 'FILE_NOT_FOUND');
    }

    // Upload content to storage
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .update(file.storagePath, content);

    if (error) {
      throw new ScrollCloudError(
        `Failed to update file content: ${error.message}`,
        'CONTENT_UPDATE_ERROR'
      );
    }

    // Create new version
    return await this.createVersion(fileId, userId, description);
  }

  private detectMergeConflicts(diffs: any[]): boolean {
    // Simple conflict detection - in production would be more sophisticated
    return diffs.some(diff => diff[0] === -1 && diff[1].includes('<<<<<<< '));
  }

  private detectThreeWayConflicts(sourceDiffs: any[], targetDiffs: any[]): any[] {
    // Detect overlapping changes in three-way merge
    const conflicts: any[] = [];
    
    // This is a simplified implementation
    // In production, would need more sophisticated conflict detection
    
    return conflicts;
  }

  private async createMergeConflicts(diffs: any[]): Promise<ConflictResolution[]> {
    // Create conflict resolution objects from diffs
    const conflicts: ConflictResolution[] = [];
    
    // This would be implemented based on the specific diff format
    // and conflict detection logic
    
    return conflicts;
  }

  private applyManualResolution(
    sourceContent: string,
    targetContent: string,
    resolution: Record<string, any>
  ): string {
    // Apply user-provided manual resolution
    // This would be implemented based on the resolution format
    return sourceContent; // Placeholder
  }

  private convertDiffToStructured(diffs: any[]): any {
    const changes: any[] = [];
    
    for (const diff of diffs) {
      const [operation, text] = diff;
      
      let type: string;
      switch (operation) {
        case 1:
          type = 'addition';
          break;
        case -1:
          type = 'deletion';
          break;
        case 0:
          type = 'unchanged';
          break;
        default:
          type = 'unknown';
      }
      
      if (type !== 'unchanged') {
        changes.push({
          type,
          content: text,
          lineNumber: this.calculateLineNumber(text)
        });
      }
    }
    
    return { changes };
  }

  private calculateLineNumber(text: string): number {
    // Calculate line number for diff display
    return text.split('\n').length;
  }

  private async findCommonAncestor(version1: FileVersion, version2: FileVersion): Promise<string> {
    // Find common ancestor version for three-way merge
    // This would traverse the version tree to find the common base
    return ''; // Placeholder
  }

  private async checkVersionPermissions(file: ScrollCloudFile, userId: string): Promise<void> {
    // Check if user has permission to perform version operations
    if (file.ownerId !== userId) {
      // Check if user has write permissions through sharing
      const hasWritePermission = file.sharedWith.some(
        share => share.userId === userId && ['write', 'admin'].includes(share.permission)
      );
      
      if (!hasWritePermission) {
        throw new ScrollCloudError('Insufficient permissions', 'PERMISSION_DENIED');
      }
    }
  }

  private async getFileById(fileId: string): Promise<ScrollCloudFile | null> {
    // TODO: Implement database query
    return null;
  }

  private async updateFileRecord(file: ScrollCloudFile): Promise<void> {
    // TODO: Implement database update
  }

  private async saveVersionRecord(version: FileVersion): Promise<void> {
    // TODO: Implement database save
  }

  private async logVersionAction(
    fileId: string,
    userId: string,
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    // TODO: Implement audit logging
    logger.info('Version action logged', {
      fileId,
      userId,
      action,
      details
    });
  }
}

export default VersionControlService;
