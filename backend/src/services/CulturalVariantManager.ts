// Cultural Variant Manager Service
// "To the Jews I became like a Jew... to the weak I became weak" - 1 Corinthians 9:20-22
// Manages regional content versions with cultural adaptations

import { logger } from '../utils/logger';

/**
 * Cultural Variant
 */
export interface CulturalVariant {
  variantId: string;
  baseContentId: string;
  regionCode: string;
  languageCode: string;
  cultureCode: string;
  variantContent: string;
  adaptations: CulturalAdaptationDetail[];
  metadata: VariantMetadata;
  status: VariantStatus;
  approvalHistory: ApprovalRecord[];
}

export interface CulturalAdaptationDetail {
  adaptationId: string;
  type: AdaptationType;
  section: string;
  originalText: string;
  adaptedText: string;
  rationale: string;
  culturalContext: string;
  spiritualIntegrity: boolean;
  reviewedBy: string;
  reviewedAt: Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

export type AdaptationType = 
  | 'terminology'
  | 'example'
  | 'case_study'
  | 'cultural_reference'
  | 'spiritual_context'
  | 'idiom'
  | 'metaphor'
  | 'illustration'
  | 'application';

export type VariantStatus = 
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'needs_revision';

export interface VariantMetadata {
  createdAt: Date;
  lastModified: Date;
  createdBy: string;
  modifiedBy: string;
  version: number;
  baseVersion: number;
  divergencePercentage: number;
  culturalRelevanceScore: number;
  theologicalAlignmentScore: number;
  tags: string[];
}

export interface ApprovalRecord {
  recordId: string;
  approverRole: 'cultural_expert' | 'theological_reviewer' | 'elder' | 'content_manager';
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'needs_revision';
  comments: string;
  timestamp: Date;
  adaptationsReviewed: string[];
}

/**
 * Variant Creation Request
 */
export interface VariantCreationRequest {
  baseContentId: string;
  regionCode: string;
  languageCode: string;
  cultureCode: string;
  initialAdaptations?: CulturalAdaptationDetail[];
  createdBy: string;
}

/**
 * Variant Update Request
 */
export interface VariantUpdateRequest {
  variantId: string;
  adaptations?: CulturalAdaptationDetail[];
  status?: VariantStatus;
  modifiedBy: string;
}

/**
 * Variant Comparison Result
 */
export interface VariantComparison {
  baseVariantId: string;
  compareVariantId: string;
  differences: ContentDifference[];
  similarityScore: number;
  divergenceAreas: string[];
  recommendations: string[];
}

export interface ContentDifference {
  section: string;
  baseContent: string;
  variantContent: string;
  differenceType: 'adaptation' | 'translation' | 'structural' | 'omission' | 'addition';
  significance: 'minor' | 'moderate' | 'major';
}

/**
 * Cultural Variant Manager Service
 * Manages regional content versions with cultural adaptations
 */
export default class CulturalVariantManager {
  private variants: Map<string, CulturalVariant> = new Map();
  private variantsByRegion: Map<string, Set<string>> = new Map();
  private variantsByContent: Map<string, Set<string>> = new Map();

  /**
   * Create cultural variant
   */
  async createVariant(request: VariantCreationRequest): Promise<CulturalVariant> {
    logger.info('Creating cultural variant', {
      baseContentId: request.baseContentId,
      regionCode: request.regionCode,
      cultureCode: request.cultureCode
    });

    const variantId = this.generateVariantId(
      request.baseContentId,
      request.regionCode,
      request.cultureCode
    );

    const variant: CulturalVariant = {
      variantId,
      baseContentId: request.baseContentId,
      regionCode: request.regionCode,
      languageCode: request.languageCode,
      cultureCode: request.cultureCode,
      variantContent: '', // Will be populated with adapted content
      adaptations: request.initialAdaptations || [],
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        createdBy: request.createdBy,
        modifiedBy: request.createdBy,
        version: 1,
        baseVersion: 1,
        divergencePercentage: 0,
        culturalRelevanceScore: 0,
        theologicalAlignmentScore: 0,
        tags: [request.regionCode, request.cultureCode, request.languageCode]
      },
      status: 'draft',
      approvalHistory: []
    };

    // Calculate initial scores
    variant.metadata.divergencePercentage = this.calculateDivergence(variant);
    variant.metadata.culturalRelevanceScore = await this.assessCulturalRelevance(variant);
    variant.metadata.theologicalAlignmentScore = await this.assessTheologicalAlignment(variant);

    // Store variant
    this.variants.set(variantId, variant);

    // Index by region
    if (!this.variantsByRegion.has(request.regionCode)) {
      this.variantsByRegion.set(request.regionCode, new Set());
    }
    this.variantsByRegion.get(request.regionCode)!.add(variantId);

    // Index by content
    if (!this.variantsByContent.has(request.baseContentId)) {
      this.variantsByContent.set(request.baseContentId, new Set());
    }
    this.variantsByContent.get(request.baseContentId)!.add(variantId);

    logger.info('Cultural variant created', {
      variantId,
      divergence: variant.metadata.divergencePercentage,
      culturalRelevance: variant.metadata.culturalRelevanceScore
    });

    return variant;
  }

  /**
   * Update variant
   */
  async updateVariant(request: VariantUpdateRequest): Promise<CulturalVariant> {
    logger.info('Updating cultural variant', { variantId: request.variantId });

    const variant = this.variants.get(request.variantId);
    if (!variant) {
      throw new Error(`Variant ${request.variantId} not found`);
    }

    // Update adaptations if provided
    if (request.adaptations) {
      variant.adaptations = request.adaptations;
      variant.metadata.divergencePercentage = this.calculateDivergence(variant);
      variant.metadata.culturalRelevanceScore = await this.assessCulturalRelevance(variant);
      variant.metadata.theologicalAlignmentScore = await this.assessTheologicalAlignment(variant);
    }

    // Update status if provided
    if (request.status) {
      variant.status = request.status;
    }

    // Update metadata
    variant.metadata.lastModified = new Date();
    variant.metadata.modifiedBy = request.modifiedBy;
    variant.metadata.version++;

    logger.info('Cultural variant updated', {
      variantId: request.variantId,
      version: variant.metadata.version,
      status: variant.status
    });

    return variant;
  }

  /**
   * Add adaptation to variant
   */
  async addAdaptation(
    variantId: string,
    adaptation: Omit<CulturalAdaptationDetail, 'adaptationId' | 'reviewedAt' | 'approvalStatus'>
  ): Promise<CulturalAdaptationDetail> {
    logger.info('Adding adaptation to variant', { variantId, type: adaptation.type });

    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new Error(`Variant ${variantId} not found`);
    }

    const fullAdaptation: CulturalAdaptationDetail = {
      ...adaptation,
      adaptationId: this.generateAdaptationId(),
      reviewedAt: new Date(),
      approvalStatus: 'pending'
    };

    variant.adaptations.push(fullAdaptation);
    variant.metadata.lastModified = new Date();
    variant.metadata.divergencePercentage = this.calculateDivergence(variant);

    logger.info('Adaptation added', {
      adaptationId: fullAdaptation.adaptationId,
      divergence: variant.metadata.divergencePercentage
    });

    return fullAdaptation;
  }

  /**
   * Approve adaptation
   */
  async approveAdaptation(
    variantId: string,
    adaptationId: string,
    approverId: string,
    approverName: string,
    approverRole: 'cultural_expert' | 'theological_reviewer' | 'elder' | 'content_manager',
    comments: string
  ): Promise<void> {
    logger.info('Approving adaptation', { variantId, adaptationId, approverRole });

    const variant = this.variants.get(variantId);
    if (!variant) {
      throw new Error(`Variant ${variantId} not found`);
    }

    const adaptation = variant.adaptations.find(a => a.adaptationId === adaptationId);
    if (!adaptation) {
      throw new Error(`Adaptation ${adaptationId} not found`);
    }

    adaptation.approvalStatus = 'approved';

    // Add approval record
    const approvalRecord: ApprovalRecord = {
      recordId: this.generateApprovalRecordId(),
      approverRole,
      approverId,
      approverName,
      decision: 'approved',
      comments,
      timestamp: new Date(),
      adaptationsReviewed: [adaptationId]
    };

    variant.approvalHistory.push(approvalRecord);

    logger.info('Adaptation approved', { adaptationId, approverRole });
  }

  /**
   * Get variant by ID
   */
  async getVariant(variantId: string): Promise<CulturalVariant | null> {
    return this.variants.get(variantId) || null;
  }

  /**
   * Get variants by region
   */
  async getVariantsByRegion(regionCode: string): Promise<CulturalVariant[]> {
    const variantIds = this.variantsByRegion.get(regionCode);
    if (!variantIds) return [];

    return Array.from(variantIds)
      .map(id => this.variants.get(id))
      .filter((v): v is CulturalVariant => v !== undefined);
  }

  /**
   * Get variants by content
   */
  async getVariantsByContent(baseContentId: string): Promise<CulturalVariant[]> {
    const variantIds = this.variantsByContent.get(baseContentId);
    if (!variantIds) return [];

    return Array.from(variantIds)
      .map(id => this.variants.get(id))
      .filter((v): v is CulturalVariant => v !== undefined);
  }

  /**
   * Compare variants
   */
  async compareVariants(
    baseVariantId: string,
    compareVariantId: string
  ): Promise<VariantComparison> {
    logger.info('Comparing variants', { baseVariantId, compareVariantId });

    const baseVariant = this.variants.get(baseVariantId);
    const compareVariant = this.variants.get(compareVariantId);

    if (!baseVariant || !compareVariant) {
      throw new Error('One or both variants not found');
    }

    const differences: ContentDifference[] = [];
    const divergenceAreas: string[] = [];

    // Compare adaptations
    for (const adaptation of compareVariant.adaptations) {
      differences.push({
        section: adaptation.section,
        baseContent: adaptation.originalText,
        variantContent: adaptation.adaptedText,
        differenceType: 'adaptation',
        significance: this.assessSignificance(adaptation)
      });

      if (!divergenceAreas.includes(adaptation.section)) {
        divergenceAreas.push(adaptation.section);
      }
    }

    // Calculate similarity score
    const similarityScore = this.calculateSimilarity(baseVariant, compareVariant);

    // Generate recommendations
    const recommendations = this.generateRecommendations(differences, similarityScore);

    return {
      baseVariantId,
      compareVariantId,
      differences,
      similarityScore,
      divergenceAreas,
      recommendations
    };
  }

  /**
   * Get variants needing approval
   */
  async getVariantsNeedingApproval(
    approverRole?: 'cultural_expert' | 'theological_reviewer' | 'elder' | 'content_manager'
  ): Promise<CulturalVariant[]> {
    const variants = Array.from(this.variants.values());

    return variants.filter(variant => {
      // Check if variant has pending adaptations
      const hasPendingAdaptations = variant.adaptations.some(
        a => a.approvalStatus === 'pending'
      );

      // Check if variant is in review status
      const isInReview = variant.status === 'in_review';

      return hasPendingAdaptations || isInReview;
    });
  }

  /**
   * Private helper methods
   */
  private calculateDivergence(variant: CulturalVariant): number {
    // Calculate divergence based on number and significance of adaptations
    if (variant.adaptations.length === 0) return 0;

    const significanceWeights = {
      'minor': 1,
      'moderate': 2,
      'major': 3
    };

    const totalWeight = variant.adaptations.reduce((sum, adaptation) => {
      const significance = this.assessSignificance(adaptation);
      return sum + significanceWeights[significance];
    }, 0);

    // Normalize to percentage (assuming 20 major adaptations = 100% divergence)
    return Math.min(100, (totalWeight / 60) * 100);
  }

  private async assessCulturalRelevance(variant: CulturalVariant): Promise<number> {
    // Assess how culturally relevant the adaptations are
    // In production, this would use AI/ML models
    
    if (variant.adaptations.length === 0) return 50; // Neutral score

    const relevantAdaptations = variant.adaptations.filter(a => 
      a.culturalContext && a.culturalContext.length > 0
    );

    return Math.min(100, (relevantAdaptations.length / variant.adaptations.length) * 100);
  }

  private async assessTheologicalAlignment(variant: CulturalVariant): Promise<number> {
    // Assess theological alignment of adaptations
    // In production, this would use TheologicalAlignmentService
    
    if (variant.adaptations.length === 0) return 100; // No changes = perfect alignment

    const alignedAdaptations = variant.adaptations.filter(a => a.spiritualIntegrity);

    return Math.min(100, (alignedAdaptations.length / variant.adaptations.length) * 100);
  }

  private assessSignificance(adaptation: CulturalAdaptationDetail): 'minor' | 'moderate' | 'major' {
    // Assess significance based on adaptation type and content length
    const majorTypes: AdaptationType[] = ['spiritual_context', 'case_study', 'application'];
    const moderateTypes: AdaptationType[] = ['example', 'cultural_reference', 'metaphor'];

    if (majorTypes.includes(adaptation.type)) return 'major';
    if (moderateTypes.includes(adaptation.type)) return 'moderate';
    return 'minor';
  }

  private calculateSimilarity(
    baseVariant: CulturalVariant,
    compareVariant: CulturalVariant
  ): number {
    // Calculate similarity score (0-100)
    const baseDivergence = baseVariant.metadata.divergencePercentage;
    const compareDivergence = compareVariant.metadata.divergencePercentage;

    const divergenceDifference = Math.abs(baseDivergence - compareDivergence);
    
    return Math.max(0, 100 - divergenceDifference);
  }

  private generateRecommendations(
    differences: ContentDifference[],
    similarityScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (similarityScore < 50) {
      recommendations.push('Consider reviewing major differences for consistency');
    }

    const majorDifferences = differences.filter(d => d.significance === 'major');
    if (majorDifferences.length > 5) {
      recommendations.push('High number of major differences - ensure theological alignment');
    }

    const structuralDifferences = differences.filter(d => d.differenceType === 'structural');
    if (structuralDifferences.length > 0) {
      recommendations.push('Structural differences detected - verify learning objectives are maintained');
    }

    return recommendations;
  }

  private generateVariantId(contentId: string, regionCode: string, cultureCode: string): string {
    return `variant_${contentId}_${regionCode}_${cultureCode}_${Date.now()}`;
  }

  private generateAdaptationId(): string {
    return `adaptation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateApprovalRecordId(): string {
    return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
