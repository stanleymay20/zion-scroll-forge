/**
 * Conflict Resolution Service
 * Resolves conflicts between multiple contributor inputs
 * using AI-assisted analysis and merge strategies
 */

import { AIGatewayService } from './AIGatewayService';

interface ConflictResolutionRequest {
  conflictId: string;
  contentId: string;
  section: string;
  baseVersion: string;
  conflictingVersions: ConflictingVersion[];
  resolutionStrategy: ResolutionStrategy;
  contextInformation?: string;
}

interface ConflictingVersion {
  versionId: string;
  contributorId: string;
  contributorName: string;
  content: string;
  timestamp: Date;
  changeDescription: string;
  priority: number;
}

enum ResolutionStrategy {
  AUTOMATIC_MERGE = 'automatic_merge',
  AI_ASSISTED = 'ai_assisted',
  MANUAL_REVIEW = 'manual_review',
  PRIORITY_BASED = 'priority_based',
  CONSENSUS = 'consensus',
  EXPERT_DECISION = 'expert_decision'
}

interface ConflictResolutionResult {
  conflictId: string;
  resolvedContent: string;
  resolutionMethod: string;
  confidence: number;
  mergedElements: MergedElement[];
  discardedElements: DiscardedElement[];
  requiresManualReview: boolean;
  resolutionNotes: string;
  timestamp: Date;
}

interface MergedElement {
  source: string;
  contributorId: string;
  content: string;
  reason: string;
}

interface DiscardedElement {
  contributorId: string;
  content: string;
  reason: string;
}

interface ConflictAnalysis {
  conflictType: ConflictType;
  severity: ConflictSeverity;
  affectedSections: string[];
  semanticDifferences: string[];
  structuralDifferences: string[];
  recommendedStrategy: ResolutionStrategy;
}

enum ConflictType {
  CONTENT_OVERLAP = 'content_overlap',
  CONTRADICTORY_INFORMATION = 'contradictory_information',
  STRUCTURAL_DIFFERENCE = 'structural_difference',
  FORMATTING_CONFLICT = 'formatting_conflict',
  SEMANTIC_CONFLICT = 'semantic_conflict'
}

enum ConflictSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface FeedbackIntegrationRequest {
  contentId: string;
  baseContent: string;
  feedbackItems: FeedbackItem[];
  integrationStrategy: 'sequential' | 'parallel' | 'prioritized';
}

interface FeedbackItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  feedbackType: FeedbackType;
  section: string;
  originalContent: string;
  suggestedChange: string;
  priority: number;
  timestamp: Date;
}

enum FeedbackType {
  CORRECTION = 'correction',
  ENHANCEMENT = 'enhancement',
  CLARIFICATION = 'clarification',
  ADDITION = 'addition',
  DELETION = 'deletion',
  RESTRUCTURE = 'restructure'
}

interface RevisionTrackingRecord {
  revisionId: string;
  contentId: string;
  previousVersion: string;
  currentVersion: string;
  changes: ChangeRecord[];
  contributors: string[];
  timestamp: Date;
  approvalStatus: string;
}

interface ChangeRecord {
  changeId: string;
  changeType: string;
  section: string;
  oldValue: string;
  newValue: string;
  contributorId: string;
  reason: string;
  approved: boolean;
}

export class ConflictResolutionService {
  private aiGateway: AIGatewayService;

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  /**
   * Analyze conflict to determine resolution strategy
   */
  async analyzeConflict(
    baseVersion: string,
    conflictingVersions: ConflictingVersion[]
  ): Promise<ConflictAnalysis> {
    const prompt = `Analyze the following content conflict:

Base Version:
${baseVersion}

Conflicting Versions:
${conflictingVersions.map((v, idx) => `
Version ${idx + 1} (by ${v.contributorName}):
${v.content}
Change Description: ${v.changeDescription}
`).join('\n')}

Analyze:
1. Type of conflict (content overlap, contradictory information, structural, etc.)
2. Severity of conflict (low, medium, high, critical)
3. Affected sections
4. Semantic differences between versions
5. Structural differences
6. Recommended resolution strategy

Provide analysis in JSON format.`;

    const response = await this.aiGateway.generateCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 1500
    });

    return JSON.parse(response.content);
  }

  /**
   * Resolve conflict using specified strategy
   */
  async resolveConflict(
    request: ConflictResolutionRequest
  ): Promise<ConflictResolutionResult> {
    switch (request.resolutionStrategy) {
      case ResolutionStrategy.AUTOMATIC_MERGE:
        return await this.automaticMerge(request);
      
      case ResolutionStrategy.AI_ASSISTED:
        return await this.aiAssistedResolution(request);
      
      case ResolutionStrategy.PRIORITY_BASED:
        return await this.priorityBasedResolution(request);
      
      case ResolutionStrategy.CONSENSUS:
        return await this.consensusBasedResolution(request);
      
      default:
        return await this.manualReviewRequired(request);
    }
  }

  /**
   * Automatic merge of non-conflicting changes
   */
  private async automaticMerge(
    request: ConflictResolutionRequest
  ): Promise<ConflictResolutionResult> {
    // Simple automatic merge - in production, use proper 3-way merge algorithm
    const mergedElements: MergedElement[] = [];
    const discardedElements: DiscardedElement[] = [];

    // Sort versions by timestamp
    const sortedVersions = request.conflictingVersions.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Take the latest version as base
    const latestVersion = sortedVersions[sortedVersions.length - 1];
    
    mergedElements.push({
      source: 'latest_version',
      contributorId: latestVersion.contributorId,
      content: latestVersion.content,
      reason: 'Most recent contribution'
    });

    // Mark earlier versions as discarded
    for (let i = 0; i < sortedVersions.length - 1; i++) {
      discardedElements.push({
        contributorId: sortedVersions[i].contributorId,
        content: sortedVersions[i].content,
        reason: 'Superseded by later version'
      });
    }

    return {
      conflictId: request.conflictId,
      resolvedContent: latestVersion.content,
      resolutionMethod: 'automatic_merge',
      confidence: 0.7,
      mergedElements,
      discardedElements,
      requiresManualReview: false,
      resolutionNotes: 'Automatically merged using latest version',
      timestamp: new Date()
    };
  }

  /**
   * AI-assisted conflict resolution
   */
  private async aiAssistedResolution(
    request: ConflictResolutionRequest
  ): Promise<ConflictResolutionResult> {
    const prompt = `Resolve the following content conflict by creating a unified version:

Base Version:
${request.baseVersion}

Conflicting Versions:
${request.conflictingVersions.map((v, idx) => `
Version ${idx + 1} (by ${v.contributorName}, priority ${v.priority}):
${v.content}
Change Description: ${v.changeDescription}
`).join('\n')}

Context: ${request.contextInformation || 'N/A'}

Task: Create a unified version that:
1. Preserves the best elements from each version
2. Resolves contradictions intelligently
3. Maintains coherence and flow
4. Respects contributor priorities
5. Ensures scroll alignment and spiritual integrity

Provide:
1. The resolved content
2. Explanation of which elements were merged from each version
3. Explanation of any discarded elements
4. Confidence level (0-1)
5. Whether manual review is recommended`;

    const response = await this.aiGateway.generateCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      maxTokens: 3000
    });

    // Parse AI response
    const result = this.parseAIResolutionResponse(response.content, request);
    
    return result;
  }

  /**
   * Priority-based resolution
   */
  private async priorityBasedResolution(
    request: ConflictResolutionRequest
  ): Promise<ConflictResolutionResult> {
    // Sort versions by priority (highest first)
    const sortedVersions = request.conflictingVersions.sort(
      (a, b) => b.priority - a.priority
    );

    const highestPriority = sortedVersions[0];
    
    const mergedElements: MergedElement[] = [{
      source: 'highest_priority',
      contributorId: highestPriority.contributorId,
      content: highestPriority.content,
      reason: `Highest priority (${highestPriority.priority})`
    }];

    const discardedElements: DiscardedElement[] = sortedVersions.slice(1).map(v => ({
      contributorId: v.contributorId,
      content: v.content,
      reason: `Lower priority (${v.priority})`
    }));

    return {
      conflictId: request.conflictId,
      resolvedContent: highestPriority.content,
      resolutionMethod: 'priority_based',
      confidence: 0.8,
      mergedElements,
      discardedElements,
      requiresManualReview: false,
      resolutionNotes: 'Resolved using priority-based selection',
      timestamp: new Date()
    };
  }

  /**
   * Consensus-based resolution
   */
  private async consensusBasedResolution(
    request: ConflictResolutionRequest
  ): Promise<ConflictResolutionResult> {
    // Find common elements across versions
    const commonElements = await this.findCommonElements(
      request.conflictingVersions
    );

    // Use AI to synthesize consensus
    const prompt = `Create a consensus version from the following contributions:

${request.conflictingVersions.map((v, idx) => `
Contributor ${idx + 1} (${v.contributorName}):
${v.content}
`).join('\n')}

Common elements identified:
${commonElements.join('\n')}

Create a version that represents the consensus while preserving unique valuable insights.`;

    const response = await this.aiGateway.generateCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 2000
    });

    return {
      conflictId: request.conflictId,
      resolvedContent: response.content,
      resolutionMethod: 'consensus',
      confidence: 0.75,
      mergedElements: [],
      discardedElements: [],
      requiresManualReview: true,
      resolutionNotes: 'Consensus-based resolution - manual review recommended',
      timestamp: new Date()
    };
  }

  /**
   * Flag for manual review
   */
  private async manualReviewRequired(
    request: ConflictResolutionRequest
  ): Promise<ConflictResolutionResult> {
    return {
      conflictId: request.conflictId,
      resolvedContent: request.baseVersion,
      resolutionMethod: 'manual_review_required',
      confidence: 0,
      mergedElements: [],
      discardedElements: [],
      requiresManualReview: true,
      resolutionNotes: 'Conflict requires manual expert review',
      timestamp: new Date()
    };
  }

  /**
   * Integrate multiple feedback items into content
   */
  async integrateFeedback(
    request: FeedbackIntegrationRequest
  ): Promise<string> {
    let currentContent = request.baseContent;

    // Sort feedback by priority if using prioritized strategy
    const sortedFeedback = request.integrationStrategy === 'prioritized'
      ? request.feedbackItems.sort((a, b) => b.priority - a.priority)
      : request.feedbackItems;

    for (const feedback of sortedFeedback) {
      currentContent = await this.applyFeedback(currentContent, feedback);
    }

    return currentContent;
  }

  /**
   * Apply single feedback item to content
   */
  private async applyFeedback(
    content: string,
    feedback: FeedbackItem
  ): Promise<string> {
    const prompt = `Apply the following feedback to the content:

Current Content:
${content}

Feedback (${feedback.feedbackType}):
Section: ${feedback.section}
Original: ${feedback.originalContent}
Suggested Change: ${feedback.suggestedChange}
Reviewer: ${feedback.reviewerName}

Apply the feedback while maintaining content coherence and quality.`;

    const response = await this.aiGateway.generateCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      maxTokens: 2000
    });

    return response.content;
  }

  /**
   * Track revision history
   */
  async trackRevision(
    contentId: string,
    previousVersion: string,
    currentVersion: string,
    changes: ChangeRecord[],
    contributors: string[]
  ): Promise<RevisionTrackingRecord> {
    const record: RevisionTrackingRecord = {
      revisionId: this.generateRevisionId(),
      contentId,
      previousVersion,
      currentVersion,
      changes,
      contributors,
      timestamp: new Date(),
      approvalStatus: 'pending'
    };

    // In production, this would be stored in database
    return record;
  }

  /**
   * Compare two versions and identify changes
   */
  async compareVersions(
    version1: string,
    version2: string
  ): Promise<ChangeRecord[]> {
    // Simple comparison - in production, use proper diff algorithm
    const changes: ChangeRecord[] = [];

    if (version1 !== version2) {
      changes.push({
        changeId: this.generateChangeId(),
        changeType: 'modification',
        section: 'content',
        oldValue: version1,
        newValue: version2,
        contributorId: 'system',
        reason: 'Content modified',
        approved: false
      });
    }

    return changes;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private parseAIResolutionResponse(
    response: string,
    request: ConflictResolutionRequest
  ): ConflictResolutionResult {
    // Parse AI response - in production, use structured output
    return {
      conflictId: request.conflictId,
      resolvedContent: response,
      resolutionMethod: 'ai_assisted',
      confidence: 0.85,
      mergedElements: [],
      discardedElements: [],
      requiresManualReview: false,
      resolutionNotes: 'AI-assisted resolution completed',
      timestamp: new Date()
    };
  }

  private async findCommonElements(
    versions: ConflictingVersion[]
  ): Promise<string[]> {
    // Simple common element detection
    // In production, use proper text analysis
    return ['Common element 1', 'Common element 2'];
  }

  private generateRevisionId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ConflictResolutionService;
