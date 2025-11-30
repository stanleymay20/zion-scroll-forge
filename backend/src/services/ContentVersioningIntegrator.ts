// Content Versioning Integrator Service
// "I am the Alpha and the Omega" - Revelation 22:13
// Integrates version control, change tracking, and accountability into unified system

import { logger } from '../utils/logger';
import ContentVersionControl, { ContentVersion, RollbackRequest, RollbackResult, VersionComparison } from './ContentVersionControl';
import ContentChangeTracker, { RevisionHistoryEntry, AccountabilityRecord, ChangeStatistics } from './ContentChangeTracker';

/**
 * Unified Version Management Request
 */
export interface VersionManagementRequest {
  contentId: string;
  contentType: 'lecture' | 'module' | 'course' | 'assessment' | 'resource';
  content: any;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'update' | 'approve' | 'publish' | 'rollback' | 'archive';
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    comments?: string;
  };
  rollbackTarget?: {
    versionNumber: number;
    reason: string;
    preserveApprovals: boolean;
  };
}

/**
 * Unified Version Management Response
 */
export interface VersionManagementResponse {
  success: boolean;
  version: ContentVersion;
  revision: RevisionHistoryEntry;
  message: string;
  warnings?: string[];
}

/**
 * Content History Report
 */
export interface ContentHistoryReport {
  contentId: string;
  currentVersion: ContentVersion;
  versionHistory: ContentVersion[];
  revisionHistory: RevisionHistoryEntry[];
  accountabilityRecords: AccountabilityRecord[];
  statistics: ChangeStatistics;
  summary: HistorySummary;
}

export interface HistorySummary {
  totalVersions: number;
  totalRevisions: number;
  totalChanges: number;
  createdDate: Date;
  lastModifiedDate: Date;
  lastModifiedBy: string;
  currentStatus: string;
  reviewStatus: string;
  contributors: string[];
  approvers: string[];
}

/**
 * Content Versioning Integrator Service
 * Provides unified interface for version control and change tracking
 */
export class ContentVersioningIntegrator {
  private versionControl: ContentVersionControl;
  private changeTracker: ContentChangeTracker;

  constructor() {
    this.versionControl = new ContentVersionControl();
    this.changeTracker = new ContentChangeTracker(this.versionControl);
  }

  /**
   * Manage content version (unified interface)
   */
  async manageVersion(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    logger.info('Managing content version', {
      contentId: request.contentId,
      action: request.action,
      userId: request.userId
    });

    try {
      switch (request.action) {
        case 'create':
          return await this.handleCreate(request);
        case 'update':
          return await this.handleUpdate(request);
        case 'approve':
          return await this.handleApprove(request);
        case 'publish':
          return await this.handlePublish(request);
        case 'rollback':
          return await this.handleRollback(request);
        case 'archive':
          return await this.handleArchive(request);
        default:
          throw new Error(`Unknown action: ${request.action}`);
      }
    } catch (error) {
      logger.error('Version management failed', { error, request });
      throw error;
    }
  }

  /**
   * Get comprehensive content history report
   */
  async getContentHistoryReport(contentId: string): Promise<ContentHistoryReport> {
    logger.info('Generating content history report', { contentId });

    const [
      currentVersion,
      versionHistory,
      revisionHistory,
      accountabilityRecords,
      statistics
    ] = await Promise.all([
      this.versionControl.getLatestVersion(contentId),
      this.versionControl.getVersionHistory(contentId),
      this.changeTracker.getRevisionHistory(contentId),
      this.changeTracker.getAccountabilityRecords(contentId),
      this.changeTracker.getChangeStatistics(contentId)
    ]);

    if (!currentVersion) {
      throw new Error(`No versions found for content ${contentId}`);
    }

    const summary = this.generateHistorySummary(
      versionHistory,
      revisionHistory,
      accountabilityRecords
    );

    return {
      contentId,
      currentVersion,
      versionHistory,
      revisionHistory,
      accountabilityRecords,
      statistics,
      summary
    };
  }

  /**
   * Compare versions with full context
   */
  async compareVersionsWithContext(
    contentId: string,
    version1Number: number,
    version2Number: number
  ): Promise<{
    comparison: VersionComparison;
    version1Revision: RevisionHistoryEntry | null;
    version2Revision: RevisionHistoryEntry | null;
  }> {
    logger.info('Comparing versions with context', {
      contentId,
      version1Number,
      version2Number
    });

    const comparison = await this.versionControl.compareVersions(
      contentId,
      version1Number,
      version2Number
    );

    const revisionHistory = await this.changeTracker.getRevisionHistory(contentId);
    
    const version1Revision = revisionHistory.find(r => r.versionNumber === version1Number) || null;
    const version2Revision = revisionHistory.find(r => r.versionNumber === version2Number) || null;

    return {
      comparison,
      version1Revision,
      version2Revision
    };
  }

  /**
   * Get accountability report for user
   */
  async getUserAccountabilityReport(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      contentIds?: string[];
    }
  ): Promise<{
    userId: string;
    totalActions: number;
    actionsByType: Record<string, number>;
    contentModified: string[];
    recentActivity: AccountabilityRecord[];
  }> {
    logger.info('Generating user accountability report', { userId, options });

    // This would typically query across all content
    // For now, we'll demonstrate with provided content IDs
    const contentIds = options?.contentIds || [];
    
    let allRecords: AccountabilityRecord[] = [];
    for (const contentId of contentIds) {
      const records = await this.changeTracker.getAccountabilityRecords(contentId, userId);
      allRecords = allRecords.concat(records);
    }

    // Apply date filters
    if (options?.startDate) {
      allRecords = allRecords.filter(r => r.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      allRecords = allRecords.filter(r => r.timestamp <= options.endDate!);
    }

    const actionsByType: Record<string, number> = {};
    const contentModified = new Set<string>();

    allRecords.forEach(record => {
      actionsByType[record.action] = (actionsByType[record.action] || 0) + 1;
      contentModified.add(record.contentId);
    });

    const recentActivity = allRecords
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      userId,
      totalActions: allRecords.length,
      actionsByType,
      contentModified: Array.from(contentModified),
      recentActivity
    };
  }

  /**
   * Rollback with full tracking
   */
  async rollbackWithTracking(
    contentId: string,
    targetVersionNumber: number,
    userId: string,
    userName: string,
    userRole: string,
    reason: string,
    preserveApprovals: boolean = false
  ): Promise<{
    rollbackResult: RollbackResult;
    revision: RevisionHistoryEntry;
  }> {
    logger.info('Rolling back with full tracking', {
      contentId,
      targetVersionNumber,
      userId,
      reason
    });

    // Get target version
    const targetVersion = await this.versionControl.getVersion(contentId, targetVersionNumber);
    if (!targetVersion) {
      throw new Error(`Target version ${targetVersionNumber} not found`);
    }

    const currentVersion = await this.versionControl.getLatestVersion(contentId);
    if (!currentVersion) {
      throw new Error(`No current version found for content ${contentId}`);
    }

    // Perform rollback
    const rollbackRequest: RollbackRequest = {
      contentId,
      targetVersionId: targetVersion.versionId,
      reason,
      requestedBy: userId,
      preserveApprovals
    };

    const rollbackResult = await this.versionControl.rollbackToVersion(rollbackRequest);

    // Track rollback
    const revision = await this.changeTracker.trackRollback(
      contentId,
      currentVersion.versionNumber,
      targetVersionNumber,
      userId,
      userRole,
      reason
    );

    return {
      rollbackResult,
      revision
    };
  }

  /**
   * Handle create action
   */
  private async handleCreate(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    // Create version
    const version = await this.versionControl.createVersion(
      request.contentId,
      request.contentType,
      request.content,
      {
        title: request.metadata?.title || 'Initial Version',
        description: request.metadata?.description,
        tags: request.metadata?.tags || ['initial'],
        reviewStatus: 'draft'
      },
      request.userId
    );

    // Track creation
    const revision = await this.changeTracker.trackCreation(
      request.contentId,
      request.content,
      request.userId,
      request.userRole,
      {
        tags: request.metadata?.tags,
        ipAddress: undefined,
        userAgent: undefined
      }
    );

    return {
      success: true,
      version,
      revision,
      message: 'Content created successfully'
    };
  }

  /**
   * Handle update action
   */
  private async handleUpdate(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    // Get previous version for change detection
    const previousVersion = await this.versionControl.getLatestVersion(request.contentId);
    
    const changes = previousVersion 
      ? await this.versionControl.trackChanges(
          request.contentId,
          previousVersion.content,
          request.content,
          request.userId
        )
      : [];

    // Create new version
    const version = await this.versionControl.createVersion(
      request.contentId,
      request.contentType,
      request.content,
      {
        title: request.metadata?.title || `Update ${Date.now()}`,
        description: request.metadata?.description,
        tags: request.metadata?.tags || ['update'],
        reviewStatus: 'draft'
      },
      request.userId,
      changes
    );

    // Track update
    const revision = await this.changeTracker.trackUpdate(
      request.contentId,
      version.versionNumber,
      changes,
      request.userId,
      request.userRole,
      request.metadata?.comments
    );

    return {
      success: true,
      version,
      revision,
      message: 'Content updated successfully'
    };
  }

  /**
   * Handle approve action
   */
  private async handleApprove(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    const currentVersion = await this.versionControl.getLatestVersion(request.contentId);
    if (!currentVersion) {
      throw new Error(`No version found for content ${request.contentId}`);
    }

    // Approve version
    const version = await this.versionControl.approveVersion(
      request.contentId,
      currentVersion.versionNumber,
      request.userId
    );

    // Track approval
    const revision = await this.changeTracker.trackApproval(
      request.contentId,
      currentVersion.versionNumber,
      request.userId,
      request.userRole,
      request.metadata?.comments
    );

    return {
      success: true,
      version,
      revision,
      message: 'Content approved successfully'
    };
  }

  /**
   * Handle publish action
   */
  private async handlePublish(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    const currentVersion = await this.versionControl.getLatestVersion(request.contentId);
    if (!currentVersion) {
      throw new Error(`No version found for content ${request.contentId}`);
    }

    // Publish version
    const version = await this.versionControl.publishVersion(
      request.contentId,
      currentVersion.versionNumber
    );

    // Track publication
    const revision = await this.changeTracker.trackPublication(
      request.contentId,
      currentVersion.versionNumber,
      request.userId,
      request.userRole
    );

    return {
      success: true,
      version,
      revision,
      message: 'Content published successfully'
    };
  }

  /**
   * Handle rollback action
   */
  private async handleRollback(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    if (!request.rollbackTarget) {
      throw new Error('Rollback target must be specified');
    }

    const result = await this.rollbackWithTracking(
      request.contentId,
      request.rollbackTarget.versionNumber,
      request.userId,
      request.userName,
      request.userRole,
      request.rollbackTarget.reason,
      request.rollbackTarget.preserveApprovals
    );

    const newVersion = await this.versionControl.getLatestVersion(request.contentId);
    if (!newVersion) {
      throw new Error('Failed to retrieve rolled back version');
    }

    return {
      success: result.rollbackResult.success,
      version: newVersion,
      revision: result.revision,
      message: result.rollbackResult.message,
      warnings: result.rollbackResult.warnings
    };
  }

  /**
   * Handle archive action
   */
  private async handleArchive(request: VersionManagementRequest): Promise<VersionManagementResponse> {
    const currentVersion = await this.versionControl.getLatestVersion(request.contentId);
    if (!currentVersion) {
      throw new Error(`No version found for content ${request.contentId}`);
    }

    // Archive version
    const version = await this.versionControl.archiveVersion(
      request.contentId,
      currentVersion.versionNumber,
      request.metadata?.description || 'Archived'
    );

    // Track as update with archive tag
    const revision = await this.changeTracker.trackUpdate(
      request.contentId,
      currentVersion.versionNumber,
      [],
      request.userId,
      request.userRole,
      'Content archived',
      { tags: ['archived'] }
    );

    return {
      success: true,
      version,
      revision,
      message: 'Content archived successfully'
    };
  }

  /**
   * Helper: Generate history summary
   */
  private generateHistorySummary(
    versionHistory: ContentVersion[],
    revisionHistory: RevisionHistoryEntry[],
    accountabilityRecords: AccountabilityRecord[]
  ): HistorySummary {
    const contributors = new Set<string>();
    const approvers = new Set<string>();

    revisionHistory.forEach(revision => {
      contributors.add(revision.author);
      if (revision.reviewedBy) {
        approvers.add(revision.reviewedBy);
      }
    });

    const sortedRevisions = [...revisionHistory].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const currentVersion = versionHistory[versionHistory.length - 1];
    const totalChanges = revisionHistory.reduce(
      (sum, r) => sum + r.changesDetail.length,
      0
    );

    return {
      totalVersions: versionHistory.length,
      totalRevisions: revisionHistory.length,
      totalChanges,
      createdDate: sortedRevisions[0]?.timestamp || new Date(),
      lastModifiedDate: sortedRevisions[sortedRevisions.length - 1]?.timestamp || new Date(),
      lastModifiedBy: sortedRevisions[sortedRevisions.length - 1]?.author || 'unknown',
      currentStatus: currentVersion?.status || 'unknown',
      reviewStatus: currentVersion?.metadata.reviewStatus || 'unknown',
      contributors: Array.from(contributors),
      approvers: Array.from(approvers)
    };
  }
}

export default ContentVersioningIntegrator;
