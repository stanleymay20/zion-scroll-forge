// Content Version Coordinator Service
// "There is a time for everything" - Ecclesiastes 3:1
// Coordinates content versions across global regions and languages

import { logger } from '../utils/logger';
import ContentVersionControl from './ContentVersionControl';

/**
 * Global Content Version
 */
export interface GlobalContentVersion {
  globalVersionId: string;
  baseContentId: string;
  baseVersion: number;
  regionalVersions: Map<string, RegionalVersion>;
  synchronizationStatus: SynchronizationStatus;
  metadata: GlobalVersionMetadata;
}

export interface RegionalVersion {
  regionCode: string;
  languageCode: string;
  versionId: string;
  contentId: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  lastSynchronized: Date;
  divergenceScore: number; // 0-100, how much it differs from base
  culturalAdaptations: CulturalAdaptation[];
}

export interface CulturalAdaptation {
  adaptationId: string;
  type: 'terminology' | 'example' | 'case_study' | 'cultural_reference' | 'spiritual_context';
  originalContent: string;
  adaptedContent: string;
  reason: string;
  approvedBy: string;
  approvedAt: Date;
}

export interface SynchronizationStatus {
  lastGlobalSync: Date;
  pendingSyncs: string[]; // Region codes
  conflictingRegions: string[];
  syncHealth: 'healthy' | 'needs_attention' | 'critical';
}

export interface GlobalVersionMetadata {
  createdAt: Date;
  lastModified: Date;
  totalRegions: number;
  publishedRegions: number;
  draftRegions: number;
  reviewRegions: number;
}

/**
 * Synchronization Request
 */
export interface SynchronizationRequest {
  globalVersionId: string;
  targetRegions: string[];
  syncMode: 'full' | 'incremental' | 'selective';
  preserveAdaptations: boolean;
  requireApproval: boolean;
}

export interface SynchronizationResult {
  success: boolean;
  syncedRegions: string[];
  failedRegions: Map<string, string>; // Region -> error message
  conflicts: SyncConflict[];
  summary: SyncSummary;
}

export interface SyncConflict {
  regionCode: string;
  conflictType: 'content_divergence' | 'approval_pending' | 'cultural_adaptation' | 'version_mismatch';
  description: string;
  resolution: 'manual' | 'auto' | 'pending';
}

export interface SyncSummary {
  totalRegions: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
  conflictsPending: number;
  processingTime: number;
}

/**
 * Content Version Coordinator Service
 * Manages global content synchronization across regions
 */
export default class ContentVersionCoordinator {
  private versionControl: ContentVersionControl;
  private globalVersions: Map<string, GlobalContentVersion> = new Map();

  constructor() {
    this.versionControl = new ContentVersionControl();
  }

  /**
   * Create global content version
   */
  async createGlobalVersion(
    baseContentId: string,
    baseVersion: number,
    initialRegions: string[]
  ): Promise<GlobalContentVersion> {
    logger.info('Creating global content version', {
      baseContentId,
      baseVersion,
      initialRegions
    });

    const globalVersionId = this.generateGlobalVersionId(baseContentId, baseVersion);
    const regionalVersions = new Map<string, RegionalVersion>();

    // Initialize regional versions
    for (const regionCode of initialRegions) {
      regionalVersions.set(regionCode, {
        regionCode,
        languageCode: this.getLanguageForRegion(regionCode),
        versionId: `${baseContentId}_${regionCode}_v${baseVersion}`,
        contentId: baseContentId,
        status: 'draft',
        lastSynchronized: new Date(),
        divergenceScore: 0,
        culturalAdaptations: []
      });
    }

    const globalVersion: GlobalContentVersion = {
      globalVersionId,
      baseContentId,
      baseVersion,
      regionalVersions,
      synchronizationStatus: {
        lastGlobalSync: new Date(),
        pendingSyncs: [],
        conflictingRegions: [],
        syncHealth: 'healthy'
      },
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        totalRegions: initialRegions.length,
        publishedRegions: 0,
        draftRegions: initialRegions.length,
        reviewRegions: 0
      }
    };

    this.globalVersions.set(globalVersionId, globalVersion);

    logger.info('Global content version created', {
      globalVersionId,
      regions: initialRegions.length
    });

    return globalVersion;
  }

  /**
   * Synchronize content across regions
   */
  async synchronizeContent(
    request: SynchronizationRequest
  ): Promise<SynchronizationResult> {
    const startTime = Date.now();
    logger.info('Starting content synchronization', {
      globalVersionId: request.globalVersionId,
      targetRegions: request.targetRegions,
      syncMode: request.syncMode
    });

    const globalVersion = this.globalVersions.get(request.globalVersionId);
    if (!globalVersion) {
      throw new Error(`Global version ${request.globalVersionId} not found`);
    }

    const syncedRegions: string[] = [];
    const failedRegions = new Map<string, string>();
    const conflicts: SyncConflict[] = [];

    // Synchronize each target region
    for (const regionCode of request.targetRegions) {
      try {
        const regionalVersion = globalVersion.regionalVersions.get(regionCode);
        
        if (!regionalVersion) {
          failedRegions.set(regionCode, 'Regional version not found');
          continue;
        }

        // Check for conflicts
        const regionConflicts = await this.detectConflicts(
          globalVersion,
          regionalVersion,
          request
        );

        if (regionConflicts.length > 0) {
          conflicts.push(...regionConflicts);
          
          // Auto-resolve if possible
          const resolved = await this.resolveConflicts(
            regionConflicts,
            request.preserveAdaptations
          );

          if (!resolved) {
            failedRegions.set(regionCode, 'Unresolved conflicts');
            continue;
          }
        }

        // Perform synchronization
        await this.syncRegion(
          globalVersion,
          regionalVersion,
          request.syncMode,
          request.preserveAdaptations
        );

        regionalVersion.lastSynchronized = new Date();
        regionalVersion.divergenceScore = 0;
        syncedRegions.push(regionCode);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to sync region ${regionCode}`, { error: errorMessage });
        failedRegions.set(regionCode, errorMessage);
      }
    }

    // Update synchronization status
    globalVersion.synchronizationStatus.lastGlobalSync = new Date();
    globalVersion.synchronizationStatus.pendingSyncs = Array.from(failedRegions.keys());
    globalVersion.synchronizationStatus.conflictingRegions = conflicts
      .filter(c => c.resolution === 'pending')
      .map(c => c.regionCode);
    globalVersion.synchronizationStatus.syncHealth = this.assessSyncHealth(
      syncedRegions.length,
      failedRegions.size,
      conflicts.filter(c => c.resolution === 'pending').length
    );

    const processingTime = Date.now() - startTime;

    const result: SynchronizationResult = {
      success: syncedRegions.length > 0,
      syncedRegions,
      failedRegions,
      conflicts,
      summary: {
        totalRegions: request.targetRegions.length,
        successfulSyncs: syncedRegions.length,
        failedSyncs: failedRegions.size,
        conflictsResolved: conflicts.filter(c => c.resolution === 'auto').length,
        conflictsPending: conflicts.filter(c => c.resolution === 'pending').length,
        processingTime
      }
    };

    logger.info('Content synchronization complete', {
      successful: result.summary.successfulSyncs,
      failed: result.summary.failedSyncs,
      conflicts: result.summary.conflictsPending,
      processingTime
    });

    return result;
  }

  /**
   * Add regional version
   */
  async addRegionalVersion(
    globalVersionId: string,
    regionCode: string,
    languageCode: string
  ): Promise<RegionalVersion> {
    logger.info('Adding regional version', { globalVersionId, regionCode, languageCode });

    const globalVersion = this.globalVersions.get(globalVersionId);
    if (!globalVersion) {
      throw new Error(`Global version ${globalVersionId} not found`);
    }

    const regionalVersion: RegionalVersion = {
      regionCode,
      languageCode,
      versionId: `${globalVersion.baseContentId}_${regionCode}_v${globalVersion.baseVersion}`,
      contentId: globalVersion.baseContentId,
      status: 'draft',
      lastSynchronized: new Date(),
      divergenceScore: 0,
      culturalAdaptations: []
    };

    globalVersion.regionalVersions.set(regionCode, regionalVersion);
    globalVersion.metadata.totalRegions++;
    globalVersion.metadata.draftRegions++;
    globalVersion.metadata.lastModified = new Date();

    return regionalVersion;
  }

  /**
   * Add cultural adaptation
   */
  async addCulturalAdaptation(
    globalVersionId: string,
    regionCode: string,
    adaptation: Omit<CulturalAdaptation, 'adaptationId' | 'approvedAt'>
  ): Promise<CulturalAdaptation> {
    logger.info('Adding cultural adaptation', { globalVersionId, regionCode, type: adaptation.type });

    const globalVersion = this.globalVersions.get(globalVersionId);
    if (!globalVersion) {
      throw new Error(`Global version ${globalVersionId} not found`);
    }

    const regionalVersion = globalVersion.regionalVersions.get(regionCode);
    if (!regionalVersion) {
      throw new Error(`Regional version for ${regionCode} not found`);
    }

    const fullAdaptation: CulturalAdaptation = {
      ...adaptation,
      adaptationId: this.generateAdaptationId(),
      approvedAt: new Date()
    };

    regionalVersion.culturalAdaptations.push(fullAdaptation);
    regionalVersion.divergenceScore = this.calculateDivergenceScore(regionalVersion);

    logger.info('Cultural adaptation added', {
      adaptationId: fullAdaptation.adaptationId,
      divergenceScore: regionalVersion.divergenceScore
    });

    return fullAdaptation;
  }

  /**
   * Get regional version
   */
  async getRegionalVersion(
    globalVersionId: string,
    regionCode: string
  ): Promise<RegionalVersion | null> {
    const globalVersion = this.globalVersions.get(globalVersionId);
    if (!globalVersion) return null;

    return globalVersion.regionalVersions.get(regionCode) || null;
  }

  /**
   * Get all regional versions
   */
  async getAllRegionalVersions(
    globalVersionId: string
  ): Promise<RegionalVersion[]> {
    const globalVersion = this.globalVersions.get(globalVersionId);
    if (!globalVersion) return [];

    return Array.from(globalVersion.regionalVersions.values());
  }

  /**
   * Update regional version status
   */
  async updateRegionalStatus(
    globalVersionId: string,
    regionCode: string,
    newStatus: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  ): Promise<void> {
    const globalVersion = this.globalVersions.get(globalVersionId);
    if (!globalVersion) {
      throw new Error(`Global version ${globalVersionId} not found`);
    }

    const regionalVersion = globalVersion.regionalVersions.get(regionCode);
    if (!regionalVersion) {
      throw new Error(`Regional version for ${regionCode} not found`);
    }

    const oldStatus = regionalVersion.status;
    regionalVersion.status = newStatus;

    // Update metadata counts
    this.updateMetadataCounts(globalVersion.metadata, oldStatus, newStatus);

    logger.info('Regional version status updated', {
      regionCode,
      oldStatus,
      newStatus
    });
  }

  /**
   * Get synchronization status
   */
  async getSynchronizationStatus(
    globalVersionId: string
  ): Promise<SynchronizationStatus | null> {
    const globalVersion = this.globalVersions.get(globalVersionId);
    return globalVersion?.synchronizationStatus || null;
  }

  /**
   * Private helper methods
   */
  private async detectConflicts(
    globalVersion: GlobalContentVersion,
    regionalVersion: RegionalVersion,
    request: SynchronizationRequest
  ): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = [];

    // Check for content divergence
    if (regionalVersion.divergenceScore > 50) {
      conflicts.push({
        regionCode: regionalVersion.regionCode,
        conflictType: 'content_divergence',
        description: `High divergence score: ${regionalVersion.divergenceScore}%`,
        resolution: 'manual'
      });
    }

    // Check for pending approvals
    if (regionalVersion.status === 'review' && request.requireApproval) {
      conflicts.push({
        regionCode: regionalVersion.regionCode,
        conflictType: 'approval_pending',
        description: 'Regional version pending approval',
        resolution: 'pending'
      });
    }

    // Check for cultural adaptations
    if (regionalVersion.culturalAdaptations.length > 0 && !request.preserveAdaptations) {
      conflicts.push({
        regionCode: regionalVersion.regionCode,
        conflictType: 'cultural_adaptation',
        description: `${regionalVersion.culturalAdaptations.length} cultural adaptations will be overwritten`,
        resolution: 'manual'
      });
    }

    return conflicts;
  }

  private async resolveConflicts(
    conflicts: SyncConflict[],
    preserveAdaptations: boolean
  ): Promise<boolean> {
    // Auto-resolve conflicts where possible
    for (const conflict of conflicts) {
      if (conflict.conflictType === 'cultural_adaptation' && preserveAdaptations) {
        conflict.resolution = 'auto';
      }
    }

    // Return true if all conflicts resolved
    return conflicts.every(c => c.resolution !== 'pending');
  }

  private async syncRegion(
    globalVersion: GlobalContentVersion,
    regionalVersion: RegionalVersion,
    syncMode: 'full' | 'incremental' | 'selective',
    preserveAdaptations: boolean
  ): Promise<void> {
    logger.info('Syncing region', {
      regionCode: regionalVersion.regionCode,
      syncMode,
      preserveAdaptations
    });

    // Implementation would sync content from base version to regional version
    // For now, just update the timestamp
    regionalVersion.lastSynchronized = new Date();

    if (!preserveAdaptations) {
      // Clear adaptations if not preserving
      regionalVersion.culturalAdaptations = [];
      regionalVersion.divergenceScore = 0;
    }
  }

  private calculateDivergenceScore(regionalVersion: RegionalVersion): number {
    // Simple calculation based on number of adaptations
    // In production, would analyze actual content differences
    const adaptationCount = regionalVersion.culturalAdaptations.length;
    return Math.min(100, adaptationCount * 10);
  }

  private assessSyncHealth(
    successCount: number,
    failureCount: number,
    pendingConflicts: number
  ): 'healthy' | 'needs_attention' | 'critical' {
    const totalRegions = successCount + failureCount;
    if (totalRegions === 0) return 'healthy';

    const successRate = successCount / totalRegions;

    if (successRate >= 0.9 && pendingConflicts === 0) return 'healthy';
    if (successRate >= 0.7 && pendingConflicts < 3) return 'needs_attention';
    return 'critical';
  }

  private updateMetadataCounts(
    metadata: GlobalVersionMetadata,
    oldStatus: string,
    newStatus: string
  ): void {
    // Decrement old status count
    if (oldStatus === 'draft') metadata.draftRegions--;
    else if (oldStatus === 'review') metadata.reviewRegions--;
    else if (oldStatus === 'published') metadata.publishedRegions--;

    // Increment new status count
    if (newStatus === 'draft') metadata.draftRegions++;
    else if (newStatus === 'review') metadata.reviewRegions++;
    else if (newStatus === 'published') metadata.publishedRegions++;

    metadata.lastModified = new Date();
  }

  private getLanguageForRegion(regionCode: string): string {
    // Map region codes to language codes
    const regionLanguageMap: Record<string, string> = {
      'US': 'en',
      'UK': 'en',
      'ES': 'es',
      'MX': 'es',
      'BR': 'pt',
      'FR': 'fr',
      'DE': 'de',
      'CN': 'zh',
      'JP': 'ja',
      'KR': 'ko',
      'IN': 'hi',
      'RU': 'ru',
      'AR': 'ar'
    };

    return regionLanguageMap[regionCode] || 'en';
  }

  private generateGlobalVersionId(contentId: string, version: number): string {
    return `global_${contentId}_v${version}_${Date.now()}`;
  }

  private generateAdaptationId(): string {
    return `adaptation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
