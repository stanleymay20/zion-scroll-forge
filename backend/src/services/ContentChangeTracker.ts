// Content Change Tracker Service
// "The Lord watches over you" - Psalm 121:5
// Tracks detailed revision history and provides accountability for all content changes

import { logger } from '../utils/logger';
import ContentVersionControl, { ContentChange, ContentVersion } from './ContentVersionControl';

/**
 * Revision History Entry
 */
export interface RevisionHistoryEntry {
  revisionId: string;
  contentId: string;
  versionNumber: number;
  timestamp: Date;
  author: string;
  authorRole: string;
  changeType: 'creation' | 'update' | 'approval' | 'publication' | 'rollback' | 'archive';
  changesSummary: string;
  changesDetail: ContentChange[];
  impactLevel: 'critical' | 'major' | 'minor' | 'trivial';
  reviewRequired: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
  metadata: RevisionMetadata;
}

export interface RevisionMetadata {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  workflowStage: string;
  approvalChain: string[];
  tags: string[];
  relatedRevisions: string[];
}

/**
 * Accountability Record
 */
export interface AccountabilityRecord {
  recordId: string;
  contentId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  timestamp: Date;
  details: any;
  auditTrail: AuditTrailEntry[];
}

export interface AuditTrailEntry {
  entryId: string;
  timestamp: Date;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  systemGenerated: boolean;
}

/**
 * Change Statistics
 */
export interface ChangeStatistics {
  contentId: string;
  totalRevisions: number;
  totalChanges: number;
  changesByType: Record<string, number>;
  changesByAuthor: Record<string, number>;
  changesByImpact: Record<string, number>;
  averageChangesPerRevision: number;
  mostActiveAuthors: AuthorActivity[];
  changeFrequency: ChangeFrequency;
  qualityTrend: QualityTrend;
}

export interface AuthorActivity {
  authorId: string;
  authorName: string;
  changesCount: number;
  lastActivity: Date;
  impactScore: number;
}

export interface ChangeFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface QualityTrend {
  direction: 'improving' | 'stable' | 'declining';
  currentScore: number;
  previousScore: number;
  changeRate: number;
}

/**
 * Content Change Tracker Service
 * Provides detailed revision history and accountability tracking
 */
export default class ContentChangeTracker {
  private versionControl: ContentVersionControl;
  private revisionHistory: Map<string, RevisionHistoryEntry[]> = new Map();
  private accountabilityRecords: Map<string, AccountabilityRecord[]> = new Map();
  private auditTrail: Map<string, AuditTrailEntry[]> = new Map();

  constructor(versionControl: ContentVersionControl) {
    this.versionControl = versionControl;
  }

  /**
   * Track content creation
   */
  async trackCreation(
    contentId: string,
    content: any,
    author: string,
    authorRole: string,
    metadata: Partial<RevisionMetadata> = {}
  ): Promise<RevisionHistoryEntry> {
    logger.info('Tracking content creation', { contentId, author });

    const revision: RevisionHistoryEntry = {
      revisionId: this.generateRevisionId(),
      contentId,
      versionNumber: 1,
      timestamp: new Date(),
      author,
      authorRole,
      changeType: 'creation',
      changesSummary: 'Initial content creation',
      changesDetail: [{
        changeId: this.generateChangeId(),
        field: 'entire_content',
        oldValue: null,
        newValue: content,
        changeType: 'addition',
        changedBy: author,
        changedAt: new Date()
      }],
      impactLevel: 'critical',
      reviewRequired: true,
      metadata: {
        workflowStage: 'draft',
        approvalChain: [],
        tags: metadata.tags || ['initial'],
        relatedRevisions: [],
        ...metadata
      }
    };

    // Store revision
    this.addRevision(contentId, revision);

    // Create accountability record
    await this.createAccountabilityRecord(
      contentId,
      author,
      author,
      authorRole,
      'content_created',
      { contentType: content.type, title: content.title }
    );

    // Add audit trail entry
    await this.addAuditTrailEntry(
      contentId,
      'content_created',
      author,
      authorRole,
      `Created new content: ${content.title || contentId}`,
      false
    );

    return revision;
  }

  /**
   * Track content update
   */
  async trackUpdate(
    contentId: string,
    versionNumber: number,
    changes: ContentChange[],
    author: string,
    authorRole: string,
    comments?: string,
    metadata: Partial<RevisionMetadata> = {}
  ): Promise<RevisionHistoryEntry> {
    logger.info('Tracking content update', { contentId, versionNumber, author, changesCount: changes.length });

    const impactLevel = this.assessImpactLevel(changes);
    const changesSummary = this.generateChangesSummary(changes);

    const revision: RevisionHistoryEntry = {
      revisionId: this.generateRevisionId(),
      contentId,
      versionNumber,
      timestamp: new Date(),
      author,
      authorRole,
      changeType: 'update',
      changesSummary,
      changesDetail: changes,
      impactLevel,
      reviewRequired: impactLevel === 'critical' || impactLevel === 'major',
      comments,
      metadata: {
        workflowStage: 'updated',
        approvalChain: [],
        tags: metadata.tags || ['update'],
        relatedRevisions: [],
        ...metadata
      }
    };

    // Store revision
    this.addRevision(contentId, revision);

    // Create accountability record
    await this.createAccountabilityRecord(
      contentId,
      author,
      author,
      authorRole,
      'content_updated',
      { versionNumber, changesCount: changes.length, impactLevel }
    );

    // Add audit trail entry
    await this.addAuditTrailEntry(
      contentId,
      'content_updated',
      author,
      authorRole,
      `Updated content (v${versionNumber}): ${changesSummary}`,
      false
    );

    return revision;
  }

  /**
   * Track content approval
   */
  async trackApproval(
    contentId: string,
    versionNumber: number,
    reviewer: string,
    reviewerRole: string,
    comments?: string
  ): Promise<RevisionHistoryEntry> {
    logger.info('Tracking content approval', { contentId, versionNumber, reviewer });

    const revision: RevisionHistoryEntry = {
      revisionId: this.generateRevisionId(),
      contentId,
      versionNumber,
      timestamp: new Date(),
      author: reviewer,
      authorRole: reviewerRole,
      changeType: 'approval',
      changesSummary: 'Content approved for publication',
      changesDetail: [],
      impactLevel: 'major',
      reviewRequired: false,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
      comments,
      metadata: {
        workflowStage: 'approved',
        approvalChain: [reviewer],
        tags: ['approved'],
        relatedRevisions: []
      }
    };

    // Store revision
    this.addRevision(contentId, revision);

    // Create accountability record
    await this.createAccountabilityRecord(
      contentId,
      reviewer,
      reviewer,
      reviewerRole,
      'content_approved',
      { versionNumber, comments }
    );

    // Add audit trail entry
    await this.addAuditTrailEntry(
      contentId,
      'content_approved',
      reviewer,
      reviewerRole,
      `Approved content version ${versionNumber}`,
      false
    );

    return revision;
  }

  /**
   * Track content publication
   */
  async trackPublication(
    contentId: string,
    versionNumber: number,
    publisher: string,
    publisherRole: string
  ): Promise<RevisionHistoryEntry> {
    logger.info('Tracking content publication', { contentId, versionNumber, publisher });

    const revision: RevisionHistoryEntry = {
      revisionId: this.generateRevisionId(),
      contentId,
      versionNumber,
      timestamp: new Date(),
      author: publisher,
      authorRole: publisherRole,
      changeType: 'publication',
      changesSummary: 'Content published to production',
      changesDetail: [],
      impactLevel: 'critical',
      reviewRequired: false,
      metadata: {
        workflowStage: 'published',
        approvalChain: [],
        tags: ['published', 'live'],
        relatedRevisions: []
      }
    };

    // Store revision
    this.addRevision(contentId, revision);

    // Create accountability record
    await this.createAccountabilityRecord(
      contentId,
      publisher,
      publisher,
      publisherRole,
      'content_published',
      { versionNumber }
    );

    // Add audit trail entry
    await this.addAuditTrailEntry(
      contentId,
      'content_published',
      publisher,
      publisherRole,
      `Published content version ${versionNumber} to production`,
      false
    );

    return revision;
  }

  /**
   * Track content rollback
   */
  async trackRollback(
    contentId: string,
    fromVersion: number,
    toVersion: number,
    initiator: string,
    initiatorRole: string,
    reason: string
  ): Promise<RevisionHistoryEntry> {
    logger.info('Tracking content rollback', { contentId, fromVersion, toVersion, initiator });

    const revision: RevisionHistoryEntry = {
      revisionId: this.generateRevisionId(),
      contentId,
      versionNumber: fromVersion + 1, // New version created by rollback
      timestamp: new Date(),
      author: initiator,
      authorRole: initiatorRole,
      changeType: 'rollback',
      changesSummary: `Rolled back from v${fromVersion} to v${toVersion}`,
      changesDetail: [{
        changeId: this.generateChangeId(),
        field: 'entire_content',
        oldValue: `version_${fromVersion}`,
        newValue: `version_${toVersion}`,
        changeType: 'modification',
        reason,
        changedBy: initiator,
        changedAt: new Date()
      }],
      impactLevel: 'critical',
      reviewRequired: true,
      comments: reason,
      metadata: {
        workflowStage: 'rolled_back',
        approvalChain: [],
        tags: ['rollback', 'requires_review'],
        relatedRevisions: []
      }
    };

    // Store revision
    this.addRevision(contentId, revision);

    // Create accountability record
    await this.createAccountabilityRecord(
      contentId,
      initiator,
      initiator,
      initiatorRole,
      'content_rolled_back',
      { fromVersion, toVersion, reason }
    );

    // Add audit trail entry
    await this.addAuditTrailEntry(
      contentId,
      'content_rolled_back',
      initiator,
      initiatorRole,
      `Rolled back content from v${fromVersion} to v${toVersion}. Reason: ${reason}`,
      false
    );

    return revision;
  }

  /**
   * Get revision history for content
   */
  async getRevisionHistory(
    contentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      author?: string;
      changeType?: RevisionHistoryEntry['changeType'];
      impactLevel?: RevisionHistoryEntry['impactLevel'];
      limit?: number;
    }
  ): Promise<RevisionHistoryEntry[]> {
    let history = this.revisionHistory.get(contentId) || [];

    // Apply filters
    if (options) {
      if (options.startDate) {
        history = history.filter(r => r.timestamp >= options.startDate!);
      }
      if (options.endDate) {
        history = history.filter(r => r.timestamp <= options.endDate!);
      }
      if (options.author) {
        history = history.filter(r => r.author === options.author);
      }
      if (options.changeType) {
        history = history.filter(r => r.changeType === options.changeType);
      }
      if (options.impactLevel) {
        history = history.filter(r => r.impactLevel === options.impactLevel);
      }
      if (options.limit) {
        history = history.slice(-options.limit);
      }
    }

    return history;
  }

  /**
   * Get accountability records
   */
  async getAccountabilityRecords(
    contentId: string,
    userId?: string
  ): Promise<AccountabilityRecord[]> {
    let records = this.accountabilityRecords.get(contentId) || [];

    if (userId) {
      records = records.filter(r => r.userId === userId);
    }

    return records;
  }

  /**
   * Get audit trail
   */
  async getAuditTrail(
    contentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      actor?: string;
      action?: string;
    }
  ): Promise<AuditTrailEntry[]> {
    let trail = this.auditTrail.get(contentId) || [];

    // Apply filters
    if (options) {
      if (options.startDate) {
        trail = trail.filter(e => e.timestamp >= options.startDate!);
      }
      if (options.endDate) {
        trail = trail.filter(e => e.timestamp <= options.endDate!);
      }
      if (options.actor) {
        trail = trail.filter(e => e.actor === options.actor);
      }
      if (options.action) {
        trail = trail.filter(e => e.action === options.action);
      }
    }

    return trail;
  }

  /**
   * Get change statistics
   */
  async getChangeStatistics(contentId: string): Promise<ChangeStatistics> {
    const history = await this.getRevisionHistory(contentId);
    
    if (history.length === 0) {
      return this.getEmptyStatistics(contentId);
    }

    const totalChanges = history.reduce((sum, r) => sum + r.changesDetail.length, 0);
    
    const changesByType: Record<string, number> = {};
    const changesByAuthor: Record<string, number> = {};
    const changesByImpact: Record<string, number> = {};

    history.forEach(revision => {
      // Count by type
      changesByType[revision.changeType] = (changesByType[revision.changeType] || 0) + 1;
      
      // Count by author
      changesByAuthor[revision.author] = (changesByAuthor[revision.author] || 0) + revision.changesDetail.length;
      
      // Count by impact
      changesByImpact[revision.impactLevel] = (changesByImpact[revision.impactLevel] || 0) + 1;
    });

    const mostActiveAuthors = this.calculateMostActiveAuthors(history);
    const changeFrequency = this.calculateChangeFrequency(history);
    const qualityTrend = this.calculateQualityTrend(history);

    return {
      contentId,
      totalRevisions: history.length,
      totalChanges,
      changesByType,
      changesByAuthor,
      changesByImpact,
      averageChangesPerRevision: totalChanges / history.length,
      mostActiveAuthors,
      changeFrequency,
      qualityTrend
    };
  }

  /**
   * Helper: Add revision to history
   */
  private addRevision(contentId: string, revision: RevisionHistoryEntry): void {
    const history = this.revisionHistory.get(contentId) || [];
    history.push(revision);
    this.revisionHistory.set(contentId, history);
  }

  /**
   * Helper: Create accountability record
   */
  private async createAccountabilityRecord(
    contentId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    details: any
  ): Promise<AccountabilityRecord> {
    const record: AccountabilityRecord = {
      recordId: this.generateRecordId(),
      contentId,
      userId,
      userName,
      userRole,
      action,
      timestamp: new Date(),
      details,
      auditTrail: []
    };

    const records = this.accountabilityRecords.get(contentId) || [];
    records.push(record);
    this.accountabilityRecords.set(contentId, records);

    return record;
  }

  /**
   * Helper: Add audit trail entry
   */
  private async addAuditTrailEntry(
    contentId: string,
    action: string,
    actor: string,
    actorRole: string,
    details: string,
    systemGenerated: boolean
  ): Promise<AuditTrailEntry> {
    const entry: AuditTrailEntry = {
      entryId: this.generateEntryId(),
      timestamp: new Date(),
      action,
      actor,
      actorRole,
      details,
      systemGenerated
    };

    const trail = this.auditTrail.get(contentId) || [];
    trail.push(entry);
    this.auditTrail.set(contentId, trail);

    return entry;
  }

  /**
   * Helper: Assess impact level of changes
   */
  private assessImpactLevel(changes: ContentChange[]): 'critical' | 'major' | 'minor' | 'trivial' {
    const criticalFields = ['mainContent', 'learningObjectives', 'biblicalIntegration', 'assessments'];
    const majorFields = ['examples', 'caseStudies', 'spiritualApplications'];
    
    const hasCriticalChanges = changes.some(c => criticalFields.includes(c.field));
    const hasMajorChanges = changes.some(c => majorFields.includes(c.field));
    
    if (hasCriticalChanges) return 'critical';
    if (hasMajorChanges) return 'major';
    if (changes.length > 5) return 'minor';
    return 'trivial';
  }

  /**
   * Helper: Generate changes summary
   */
  private generateChangesSummary(changes: ContentChange[]): string {
    if (changes.length === 0) return 'No changes';
    if (changes.length === 1) return `Modified ${changes[0].field}`;
    
    const fields = changes.map(c => c.field).slice(0, 3);
    const summary = fields.join(', ');
    
    return changes.length > 3 
      ? `${summary} and ${changes.length - 3} more fields`
      : summary;
  }

  /**
   * Helper: Calculate most active authors
   */
  private calculateMostActiveAuthors(history: RevisionHistoryEntry[]): AuthorActivity[] {
    const authorMap = new Map<string, AuthorActivity>();

    history.forEach(revision => {
      const existing = authorMap.get(revision.author);
      if (existing) {
        existing.changesCount += revision.changesDetail.length;
        existing.lastActivity = revision.timestamp > existing.lastActivity ? revision.timestamp : existing.lastActivity;
      } else {
        authorMap.set(revision.author, {
          authorId: revision.author,
          authorName: revision.author,
          changesCount: revision.changesDetail.length,
          lastActivity: revision.timestamp,
          impactScore: 0
        });
      }
    });

    return Array.from(authorMap.values())
      .sort((a, b) => b.changesCount - a.changesCount)
      .slice(0, 5);
  }

  /**
   * Helper: Calculate change frequency
   */
  private calculateChangeFrequency(history: RevisionHistoryEntry[]): ChangeFrequency {
    if (history.length === 0) {
      return { daily: 0, weekly: 0, monthly: 0, trend: 'stable' };
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const daily = history.filter(r => r.timestamp >= oneDayAgo).length;
    const weekly = history.filter(r => r.timestamp >= oneWeekAgo).length;
    const monthly = history.filter(r => r.timestamp >= oneMonthAgo).length;

    const trend = daily > weekly / 7 ? 'increasing' : daily < weekly / 7 ? 'decreasing' : 'stable';

    return { daily, weekly, monthly, trend };
  }

  /**
   * Helper: Calculate quality trend
   */
  private calculateQualityTrend(history: RevisionHistoryEntry[]): QualityTrend {
    // Simplified quality trend calculation
    // In production, this would analyze actual quality scores from versions
    
    const recentRevisions = history.slice(-5);
    const olderRevisions = history.slice(-10, -5);

    const recentCritical = recentRevisions.filter(r => r.impactLevel === 'critical').length;
    const olderCritical = olderRevisions.filter(r => r.impactLevel === 'critical').length;

    const direction = recentCritical < olderCritical ? 'improving' : 
                     recentCritical > olderCritical ? 'declining' : 'stable';

    return {
      direction,
      currentScore: 85, // Placeholder
      previousScore: 80, // Placeholder
      changeRate: 5 // Placeholder
    };
  }

  /**
   * Helper: Get empty statistics
   */
  private getEmptyStatistics(contentId: string): ChangeStatistics {
    return {
      contentId,
      totalRevisions: 0,
      totalChanges: 0,
      changesByType: {},
      changesByAuthor: {},
      changesByImpact: {},
      averageChangesPerRevision: 0,
      mostActiveAuthors: [],
      changeFrequency: { daily: 0, weekly: 0, monthly: 0, trend: 'stable' },
      qualityTrend: { direction: 'stable', currentScore: 0, previousScore: 0, changeRate: 0 }
    };
  }

  /**
   * Helper: Generate IDs
   */
  private generateRevisionId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChangeId(): string {
    return `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecordId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEntryId(): string {
    return `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
