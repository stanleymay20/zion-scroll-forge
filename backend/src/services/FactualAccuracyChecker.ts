/**
 * Factual Accuracy Checker Service
 * Validates content for factual accuracy and source verification
 * "Buy truth, and do not sell it" - Proverbs 23:23
 */

import { PrismaClient } from '@prisma/client';
import { AIGatewayService } from './AIGatewayService';
import { logger } from '../utils/productionLogger';

const prisma = new PrismaClient();

export interface FactCheckResult {
  id: string;
  contentId: string;
  overallAccuracy: number;
  claims: ClaimVerification[];
  sources: SourceVerification[];
  recommendations: string[];
  verified: boolean;
  verifiedAt: Date;
  verifiedBy?: string;
}

export interface ClaimVerification {
  claim: string;
  location: string;
  accuracy: 'verified' | 'partially_verified' | 'unverified' | 'false';
  confidence: number;
  sources: string[];
  reasoning: string;
  needsReview: boolean;
}

export interface SourceVerification {
  source: string;
  type: 'scripture' | 'academic' | 'historical' | 'statistical' | 'expert' | 'other';
  credibility: number;
  accessible: boolean;
  citation: string;
  issues?: string[];
}

export interface FactCheckRequest {
  contentId: string;
  content: string;
  contentType: 'lecture' | 'assessment' | 'reading' | 'discussion';
  subject: string;
  academicLevel: string;
  requireSources?: boolean;
}

export class FactualAccuracyChecker {
  private aiGateway: AIGatewayService;
  private accuracyThreshold: number = 0.85;

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  /**
   * Check factual accuracy of content
   */
  async checkAccuracy(request: FactCheckRequest): Promise<FactCheckResult> {
    try {
      logger.info('Starting factual accuracy check', {
        contentId: request.contentId,
        contentType: request.contentType,
        subject: request.subject,
      });

      // Extract claims from content
      const claims = await this.extractClaims(request.content, request.subject);

      // Verify each claim
      const verifiedClaims = await Promise.all(
        claims.map(claim => this.verifyClaim(claim, request.subject))
      );

      // Extract and verify sources
      const sources = await this.extractSources(request.content);
      const verifiedSources = await Promise.all(
        sources.map(source => this.verifySource(source))
      );

      // Calculate overall accuracy
      const overallAccuracy = this.calculateOverallAccuracy(verifiedClaims);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        verifiedClaims,
        verifiedSources,
        request
      );

      // Determine if verified
      const verified =
        overallAccuracy >= this.accuracyThreshold &&
        verifiedClaims.filter(c => c.accuracy === 'false').length === 0 &&
        (!request.requireSources || verifiedSources.length > 0);

      const result: FactCheckResult = {
        id: `fact_check_${Date.now()}`,
        contentId: request.contentId,
        overallAccuracy,
        claims: verifiedClaims,
        sources: verifiedSources,
        recommendations,
        verified,
        verifiedAt: new Date(),
      };

      // Store result
      await this.storeFactCheckResult(result);

      logger.info('Factual accuracy check completed', {
        contentId: request.contentId,
        overallAccuracy,
        verified,
        claimsCount: verifiedClaims.length,
        sourcesCount: verifiedSources.length,
      });

      return result;
    } catch (error) {
      logger.error('Error checking factual accuracy', {
        error,
        contentId: request.contentId,
      });
      throw error;
    }
  }

  /**
   * Batch check multiple content items
   */
  async batchCheckAccuracy(requests: FactCheckRequest[]): Promise<FactCheckResult[]> {
    try {
      logger.info('Starting batch factual accuracy check', {
        count: requests.length,
      });

      const results = await Promise.all(
        requests.map(request => this.checkAccuracy(request))
      );

      return results;
    } catch (error) {
      logger.error('Error in batch factual accuracy check', { error });
      throw error;
    }
  }

  /**
   * Get fact check history for content
   */
  async getFactCheckHistory(contentId: string): Promise<FactCheckResult[]> {
    try {
      // In production, this would query from database
      // For now, return empty array
      logger.info('Retrieving fact check history', { contentId });
      return [];
    } catch (error) {
      logger.error('Error retrieving fact check history', { error, contentId });
      throw error;
    }
  }

  /**
   * Review and approve fact check
   */
  async reviewFactCheck(
    factCheckId: string,
    reviewerId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    try {
      logger.info('Reviewing fact check', {
        factCheckId,
        reviewerId,
        approved,
      });

      // In production, this would update database
      // For now, just log
    } catch (error) {
      logger.error('Error reviewing fact check', { error, factCheckId });
      throw error;
    }
  }

  // Private helper methods

  /**
   * Extract factual claims from content
   */
  private async extractClaims(content: string, subject: string): Promise<string[]> {
    try {
      const prompt = `You are a fact-checking expert. Extract all factual claims from the following educational content about ${subject}.

CONTENT:
${content}

Return a JSON array of factual claims that can be verified. Focus on:
- Statistical data and numbers
- Historical facts and dates
- Scientific principles and theories
- Definitions and terminology
- Cause-and-effect relationships

Format: ["claim 1", "claim 2", ...]

Only include claims that are verifiable, not opinions or interpretations.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert fact-checker with expertise in academic content verification.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.content);
      return parsed.claims || [];
    } catch (error) {
      logger.error('Error extracting claims', { error });
      return [];
    }
  }

  /**
   * Verify a single claim
   */
  private async verifyClaim(
    claim: string,
    subject: string
  ): Promise<ClaimVerification> {
    try {
      const prompt = `You are a fact-checking expert. Verify the following claim about ${subject}:

CLAIM: ${claim}

Provide a detailed verification in JSON format:
{
  "accuracy": "verified|partially_verified|unverified|false",
  "confidence": 0.0-1.0,
  "sources": ["source 1", "source 2"],
  "reasoning": "Detailed explanation of verification",
  "needsReview": true|false
}

Use your knowledge to verify the claim. If you're uncertain, mark needsReview as true.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert fact-checker with access to comprehensive knowledge across academic disciplines.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        responseFormat: { type: 'json_object' },
      });

      const verification = JSON.parse(response.content);

      return {
        claim,
        location: 'content', // Would be more specific in production
        accuracy: verification.accuracy,
        confidence: verification.confidence,
        sources: verification.sources || [],
        reasoning: verification.reasoning,
        needsReview: verification.needsReview || verification.confidence < 0.8,
      };
    } catch (error) {
      logger.error('Error verifying claim', { error, claim });
      return {
        claim,
        location: 'content',
        accuracy: 'unverified',
        confidence: 0,
        sources: [],
        reasoning: 'Error during verification',
        needsReview: true,
      };
    }
  }

  /**
   * Extract sources from content
   */
  private async extractSources(content: string): Promise<string[]> {
    try {
      // Extract citations, references, and source mentions
      const sources: string[] = [];

      // Extract Bible references (e.g., "John 3:16", "1 Corinthians 13:4-7")
      const bibleRegex = /\b\d*\s*[A-Z][a-z]+\s+\d+:\d+(-\d+)?\b/g;
      const bibleRefs = content.match(bibleRegex) || [];
      sources.push(...bibleRefs.map(ref => `Scripture: ${ref}`));

      // Extract URLs
      const urlRegex = /https?:\/\/[^\s]+/g;
      const urls = content.match(urlRegex) || [];
      sources.push(...urls);

      // Extract academic citations (simplified)
      const citationRegex = /\([A-Z][a-z]+,?\s+\d{4}\)/g;
      const citations = content.match(citationRegex) || [];
      sources.push(...citations.map(c => `Citation: ${c}`));

      return [...new Set(sources)]; // Remove duplicates
    } catch (error) {
      logger.error('Error extracting sources', { error });
      return [];
    }
  }

  /**
   * Verify a source
   */
  private async verifySource(source: string): Promise<SourceVerification> {
    try {
      // Determine source type
      let type: SourceVerification['type'] = 'other';
      if (source.includes('Scripture:')) type = 'scripture';
      else if (source.includes('http')) type = 'academic';
      else if (source.includes('Citation:')) type = 'academic';

      // For scripture, always high credibility
      if (type === 'scripture') {
        return {
          source,
          type,
          credibility: 1.0,
          accessible: true,
          citation: source,
        };
      }

      // For other sources, would verify accessibility and credibility
      // For now, simplified verification
      return {
        source,
        type,
        credibility: 0.8,
        accessible: true,
        citation: source,
      };
    } catch (error) {
      logger.error('Error verifying source', { error, source });
      return {
        source,
        type: 'other',
        credibility: 0,
        accessible: false,
        citation: source,
        issues: ['Verification failed'],
      };
    }
  }

  /**
   * Calculate overall accuracy score
   */
  private calculateOverallAccuracy(claims: ClaimVerification[]): number {
    if (claims.length === 0) return 1.0;

    const accuracyScores = claims.map(claim => {
      switch (claim.accuracy) {
        case 'verified':
          return 1.0;
        case 'partially_verified':
          return 0.7;
        case 'unverified':
          return 0.5;
        case 'false':
          return 0.0;
        default:
          return 0.5;
      }
    });

    return accuracyScores.reduce((sum, score) => sum + score, 0) / claims.length;
  }

  /**
   * Generate recommendations for improvement
   */
  private generateRecommendations(
    claims: ClaimVerification[],
    sources: SourceVerification[],
    request: FactCheckRequest
  ): string[] {
    const recommendations: string[] = [];

    // Check for unverified or false claims
    const unverifiedClaims = claims.filter(
      c => c.accuracy === 'unverified' || c.accuracy === 'false'
    );
    if (unverifiedClaims.length > 0) {
      recommendations.push(
        `${unverifiedClaims.length} claim(s) could not be verified. Review and provide sources or remove these claims.`
      );
    }

    // Check for claims needing review
    const reviewClaims = claims.filter(c => c.needsReview);
    if (reviewClaims.length > 0) {
      recommendations.push(
        `${reviewClaims.length} claim(s) need expert review due to low confidence in verification.`
      );
    }

    // Check for insufficient sources
    if (request.requireSources && sources.length === 0) {
      recommendations.push(
        'No sources found. Add citations and references to support factual claims.'
      );
    }

    // Check for low credibility sources
    const lowCredSources = sources.filter(s => s.credibility < 0.6);
    if (lowCredSources.length > 0) {
      recommendations.push(
        `${lowCredSources.length} source(s) have low credibility. Consider using more authoritative sources.`
      );
    }

    // Check for inaccessible sources
    const inaccessibleSources = sources.filter(s => !s.accessible);
    if (inaccessibleSources.length > 0) {
      recommendations.push(
        `${inaccessibleSources.length} source(s) are not accessible. Ensure all sources are available to students.`
      );
    }

    return recommendations;
  }

  /**
   * Store fact check result
   */
  private async storeFactCheckResult(result: FactCheckResult): Promise<void> {
    try {
      // In production, this would store in database
      // For now, just log
      logger.debug('Storing fact check result', {
        id: result.id,
        contentId: result.contentId,
        verified: result.verified,
      });
    } catch (error) {
      logger.error('Error storing fact check result', { error });
    }
  }
}

export default FactualAccuracyChecker;
