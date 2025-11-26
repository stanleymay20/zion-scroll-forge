// Content Version Control Service
// "Every word of God proves true" - Proverbs 30:5
// Manages content versioning, change tracking, and rollback capabilities

import { logger } from '../utils/logger';

/**
 * Content Version
 */
export interface ContentVersion {
  versionId: string;
  contentId: string;
  contentType: 'lecture' | 'module' | 'course' | 'assessment' | 'resource';
  versionNumber: number;
  content: any; // The actual content snapshot
  metadata: VersionMetadata;
  changes: ContentChange[];
  createdBy: string;
  createdAt: Date;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
}

export interface VersionMetadata {
  title: string;
  description?: string;
  tags: string[];
  pedagogyScore?: number;
  qualityScore?: number;
  spiritualAlignmentScore?: number;
  reviewStatus: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface ContentChange {
  changeId: string;
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'addition' | 'modification' | 'deletion';
  reason?: string;
  changedBy: string;
  changedAt: Date;
}

/**
 * Version Comparison Result
 */
export interface VersionComparison {
  version1: string;
  version2: string;
  differences: ContentDifference[];
  summary: ComparisonSummary;
}

export interface ContentDifference {
  field: string;
  type: 'added' | 'modified' | 'removed';
  oldValue?: any;
  newValue?: any;
  impact: 'major' | 'minor' | 'cosmetic';
}

export interface ComparisonSummary {
  totalChanges: number;
  majorChanges: number;
  minorChanges: number;
  cosmeticChanges: number;
  pedagogyImpact: string;
  qualityImpact: string;
}

/**
 * Rollback Request
 */
export interface RollbackRequest {
  contentId: string;
  targetVersionId: string;
  reason: string;
  requestedBy: string;
  preserveApprovals: boolean;
}

export interface RollbackResult {
  success: boolean;
  newVersionId: string;
  restoredVersion: number;
  message: string;
  warnings?: string[];
}

/**
 * Change Tracking
 */
export interface ChangeTrackingOptions {
  trackFieldLevel: boolean; // Track individual field changes
  trackMetadata: boolean; // Track metadata changes
  trackRelationships: boolean; // Track relationship changes
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
}

/**
 * Content Version Control Service
 * Manages versioning, change tracking, and rollback for all content
 */
export default class ContentVersionControl {
  private versions: Map<string, ContentVersion[]> = new Map();
  private changeHistory: Map<string, ContentChange[]> = new Map();

  /**
   * Create new version of content
   */
  async createVersion(
    contentId: string,
    contentType: 'lecture' | 'module' | 'course' | 'assessment' | 'resource',
    content: any,
    metadata: Partial<VersionMetadata>,
    createdBy: string,
    changes?: ContentChange[]
  ): Promise<ContentVersion> {
    logger.info('Creating new content version', { contentId, contentType, createdBy });

    // Get existing versions
    const existingVersions = this.versions.get(contentId) || [];
    const versionNumber = existingVersions.length + 1;

    // Detect changes if not provided
    const detectedChanges = changes || (existingVersions.length > 0 
      ? this.detectChanges(existingVersions[existingVersions.length - 1].content, content, createdBy)
      : []);

    const version: ContentVersion = {
      versionId: this.generateVersionId(contentId, versionNumber),
      contentId,
      contentType,
      versionNumber,
      content: this.deepClone(content), // Store snapshot
      metadata: {
        title: metadata.title || `Version ${versionNumber}`,
        description: metadata.description,
        tags: metadata.tags || [],
        pedagogyScore: metadata.pedagogyScore,
        qualityScore: metadata.qualityScore,
        spiritualAlignmentScore: metadata.spiritualAlignmentScore,
        reviewStatus: metadata.reviewStatus || 'draft'
      },
      changes: detectedChanges,
      createdBy,
      createdAt: new Date(),
      status: 'draft'
    };

    // Store version
    existingVersions.push(version);
    this.versions.set(contentId, existingVersions);

    // Update change history
    const history = this.changeHistory.get(contentId) || [];
    history.push(...detectedChanges);
    this.changeHistory.set(contentId, history);

    logger.info('Content version created', {
      versionId: version.versionId,
      versionNumber,
      changesCount: detectedChanges.length
    });

    return version;
  }

  /**
   * Get specific version
   */
  async getVersion(contentId: string, versionNumber: number): Promise<ContentVersion | null> {
    const versions = this.versions.get(contentId);
    if (!versions) return null;

    return versions.find(v => v.versionNumber === versionNumber) || null;
  }

  /**
   * Get latest version
   */
  async getLatestVersion(contentId: string): Promise<ContentVersion | null> {
    const versions = this.versions.get(contentId);
    if (!versions || versions.length === 0) return null;

    return versions[versions.length - 1];
  }

  /**
   * Get all versions for content
   */
  async getVersionHistory(contentId: string): Promise<ContentVersion[]> {
    return this.versions.get(contentId) || [];
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    contentId: string,
    version1Number: number,
    version2Number: number
  ): Promise<VersionComparison> {
    logger.info('Comparing versions', { contentId, version1Number, version2Number });

    const version1 = await this.getVersion(contentId, version1Number);
    const version2 = await this.getVersion(contentId, version2Number);

    if (!version1 || !version2) {
      throw new Error(`Version not found for comparison`);
    }

    const differences = this.computeDifferences(version1.content, version2.content);
    const summary = this.generateComparisonSummary(differences, version1, version2);

    return {
      version1: version1.versionId,
      version2: version2.versionId,
      differences,
      summary
    };
  }

  /**
   * Rollback to previous version
   */
  async rollbackToVersion(request: RollbackRequest): Promise<RollbackResult> {
    logger.info('Rolling back content', {
      contentId: request.contentId,
      targetVersionId: request.targetVersionId,
      requestedBy: request.requestedBy
    });

    try {
      // Get target version
      const versions = this.versions.get(request.contentId);
      if (!versions) {
        throw new Error(`No versions found for content ${request.contentId}`);
      }

      const targetVersion = versions.find(v => v.versionId === request.targetVersionId);
      if (!targetVersion) {
        throw new Error(`Target version ${request.targetVersionId} not found`);
      }

      // Create new version from target content
      const rollbackVersion = await this.createVersion(
        request.contentId,
        targetVersion.contentType,
        targetVersion.content,
        {
          title: `Rollback to v${targetVersion.versionNumber}`,
          description: `Rolled back from current version. Reason: ${request.reason}`,
          tags: [...targetVersion.metadata.tags, 'rollback'],
          reviewStatus: request.preserveApprovals ? targetVersion.metadata.reviewStatus : 'draft'
        },
        request.requestedBy,
        [{
          changeId: this.generateChangeId(),
          field: 'entire_content',
          oldValue: 'current_version',
          newValue: `version_${targetVersion.versionNumber}`,
          changeType: 'modification',
          reason: request.reason,
          changedBy: request.requestedBy,
          changedAt: new Date()
        }]
      );

      const warnings: string[] = [];
      if (!request.preserveApprovals) {
        warnings.push('Approvals were not preserved. Content requires re-review.');
      }

      logger.info('Rollback completed', {
        newVersionId: rollbackVersion.versionId,
        restoredVersion: targetVersion.versionNumber
      });

      return {
        success: true,
        newVersionId: rollbackVersion.versionId,
        restoredVersion: targetVersion.versionNumber,
        message: `Successfully rolled back to version ${targetVersion.versionNumber}`,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      logger.error('Rollback failed', { error, request });
      return {
        success: false,
        newVersionId: '',
        restoredVersion: 0,
        message: `Rollback failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get change history for content
   */
  async getChangeHistory(
    contentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      changedBy?: string;
      changeType?: 'addition' | 'modification' | 'deletion';
    }
  ): Promise<ContentChange[]> {
    let history = this.changeHistory.get(contentId) || [];

    // Apply filters
    if (options) {
      if (options.startDate) {
        history = history.filter(c => c.changedAt >= options.startDate!);
      }
      if (options.endDate) {
        history = history.filter(c => c.changedAt <= options.endDate!);
      }
      if (options.changedBy) {
        history = history.filter(c => c.changedBy === options.changedBy);
      }
      if (options.changeType) {
        history = history.filter(c => c.changeType === options.changeType);
      }
    }

    return history;
  }

  /**
   * Track changes between versions
   */
  async trackChanges(
    contentId: string,
    oldContent: any,
    newContent: any,
    changedBy: string,
    options: ChangeTrackingOptions = {
      trackFieldLevel: true,
      trackMetadata: true,
      trackRelationships: false,
      auditLevel: 'detailed'
    }
  ): Promise<ContentChange[]> {
    logger.info('Tracking content changes', { contentId, changedBy, options });

    const changes = this.detectChanges(oldContent, newContent, changedBy);

    // Store in change history
    const history = this.changeHistory.get(contentId) || [];
    history.push(...changes);
    this.changeHistory.set(contentId, history);

    return changes;
  }

  /**
   * Approve version
   */
  async approveVersion(
    contentId: string,
    versionNumber: number,
    approvedBy: string
  ): Promise<ContentVersion> {
    const version = await this.getVersion(contentId, versionNumber);
    if (!version) {
      throw new Error(`Version ${versionNumber} not found for content ${contentId}`);
    }

    version.status = 'approved';
    version.metadata.approvedBy = approvedBy;
    version.metadata.approvedAt = new Date();
    version.metadata.reviewStatus = 'approved';

    logger.info('Version approved', {
      versionId: version.versionId,
      approvedBy
    });

    return version;
  }

  /**
   * Publish version
   */
  async publishVersion(
    contentId: string,
    versionNumber: number
  ): Promise<ContentVersion> {
    const version = await this.getVersion(contentId, versionNumber);
    if (!version) {
      throw new Error(`Version ${versionNumber} not found for content ${contentId}`);
    }

    if (version.status !== 'approved') {
      throw new Error(`Version must be approved before publishing`);
    }

    version.status = 'published';

    logger.info('Version published', {
      versionId: version.versionId
    });

    return version;
  }

  /**
   * Archive version
   */
  async archiveVersion(
    contentId: string,
    versionNumber: number,
    reason: string
  ): Promise<ContentVersion> {
    const version = await this.getVersion(contentId, versionNumber);
    if (!version) {
      throw new Error(`Version ${versionNumber} not found for content ${contentId}`);
    }

    version.status = 'archived';
    version.metadata.description = `${version.metadata.description || ''}\nArchived: ${reason}`;

    logger.info('Version archived', {
      versionId: version.versionId,
      reason
    });

    return version;
  }

  /**
   * Helper: Detect changes between two content objects
   */
  private detectChanges(oldContent: any, newContent: any, changedBy: string): ContentChange[] {
    const changes: ContentChange[] = [];
    const now = new Date();

    // Compare top-level fields
    const allKeys = new Set([...Object.keys(oldContent || {}), ...Object.keys(newContent || {})]);

    for (const key of allKeys) {
      const oldValue = oldContent?.[key];
      const newValue = newContent?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        const changeType: 'addition' | 'modification' | 'deletion' = 
          oldValue === undefined ? 'addition' :
          newValue === undefined ? 'deletion' :
          'modification';

        changes.push({
          changeId: this.generateChangeId(),
          field: key,
          oldValue,
          newValue,
          changeType,
          changedBy,
          changedAt: now
        });
      }
    }

    return changes;
  }

  /**
   * Helper: Compute differences between versions
   */
  private computeDifferences(content1: any, content2: any): ContentDifference[] {
    const differences: ContentDifference[] = [];
    const allKeys = new Set([...Object.keys(content1 || {}), ...Object.keys(content2 || {})]);

    for (const key of allKeys) {
      const value1 = content1?.[key];
      const value2 = content2?.[key];

      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        const type: 'added' | 'modified' | 'removed' = 
          value1 === undefined ? 'added' :
          value2 === undefined ? 'removed' :
          'modified';

        const impact = this.assessChangeImpact(key, value1, value2);

        differences.push({
          field: key,
          type,
          oldValue: value1,
          newValue: value2,
          impact
        });
      }
    }

    return differences;
  }

  /**
   * Helper: Assess impact of a change
   */
  private assessChangeImpact(field: string, oldValue: any, newValue: any): 'major' | 'minor' | 'cosmetic' {
    // Major impact fields
    const majorFields = ['mainContent', 'learningObjectives', 'assessments', 'biblicalIntegration'];
    if (majorFields.includes(field)) return 'major';

    // Minor impact fields
    const minorFields = ['examples', 'caseStudies', 'discussionQuestions', 'keyTakeaways'];
    if (minorFields.includes(field)) return 'minor';

    // Cosmetic changes
    return 'cosmetic';
  }

  /**
   * Helper: Generate comparison summary
   */
  private generateComparisonSummary(
    differences: ContentDifference[],
    version1: ContentVersion,
    version2: ContentVersion
  ): ComparisonSummary {
    const majorChanges = differences.filter(d => d.impact === 'major').length;
    const minorChanges = differences.filter(d => d.impact === 'minor').length;
    const cosmeticChanges = differences.filter(d => d.impact === 'cosmetic').length;

    const pedagogyImpact = majorChanges > 0 ? 'Significant pedagogical changes detected' :
                          minorChanges > 0 ? 'Minor pedagogical adjustments' :
                          'No pedagogical impact';

    const qualityImpact = majorChanges > 2 ? 'Major quality revision' :
                         minorChanges > 3 ? 'Quality improvements' :
                         'Minimal quality changes';

    return {
      totalChanges: differences.length,
      majorChanges,
      minorChanges,
      cosmeticChanges,
      pedagogyImpact,
      qualityImpact
    };
  }

  /**
   * Helper: Deep clone object
   */
  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Helper: Generate version ID
   */
  private generateVersionId(contentId: string, versionNumber: number): string {
    return `${contentId}_v${versionNumber}_${Date.now()}`;
  }

  /**
   * Helper: Generate change ID
   */
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
