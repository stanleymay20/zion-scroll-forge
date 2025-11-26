/**
 * Content Consistency Checker Service
 * Identifies contradictions and ensures consistency across course materials
 * "Let your 'Yes' be 'Yes,' and your 'No,' 'No'" - Matthew 5:37
 */

import { PrismaClient } from '@prisma/client';
import { AIGatewayService } from './AIGatewayService';
import { VectorStoreService } from './VectorStoreService';
import { logger } from '../utils/productionLogger';

const prisma = new PrismaClient();

export interface ConsistencyCheckResult {
  id: string;
  contentId: string;
  consistencyScore: number;
  contradictions: Contradiction[];
  inconsistencies: Inconsistency[];
  recommendations: string[];
  approved: boolean;
  checkedAt: Date;
}

export interface Contradiction {
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  type: 'factual' | 'conceptual' | 'terminological' | 'methodological';
  description: string;
  location1: ContentLocation;
  location2: ContentLocation;
  statement1: string;
  statement2: string;
  resolution: string;
}

export interface Inconsistency {
  type: 'terminology' | 'formatting' | 'style' | 'notation' | 'reference';
  description: string;
  locations: ContentLocation[];
  examples: string[];
  recommendation: string;
}

export interface ContentLocation {
  contentId: string;
  contentType: string;
  section?: string;
  paragraph?: number;
  line?: number;
}

export interface ConsistencyCheckRequest {
  contentId: string;
  content: string;
  contentType: 'lecture' | 'assessment' | 'reading' | 'module';
  courseId: string;
  moduleId?: string;
  relatedContentIds?: string[];
}

export default class ContentConsistencyChecker {
  private aiGateway: AIGatewayService;
  private vectorStore: VectorStoreService;
  private consistencyThreshold: number = 0.90;

  constructor() {
    this.aiGateway = new AIGatewayService();
    this.vectorStore = new VectorStoreService();
  }

  /**
   * Check content consistency
   */
  async checkConsistency(request: ConsistencyCheckRequest): Promise<ConsistencyCheckResult> {
    try {
      logger.info('Starting consistency check', {
        contentId: request.contentId,
        contentType: request.contentType,
        courseId: request.courseId,
      });

      // Get related content for comparison
      const relatedContent = await this.getRelatedContent(
        request.courseId,
        request.moduleId,
        request.relatedContentIds
      );

      // Check for contradictions
      const contradictions = await this.findContradictions(
        request.content,
        relatedContent,
        request
      );

      // Check for inconsistencies
      const inconsistencies = await this.findInconsistencies(
        request.content,
        relatedContent,
        request
      );

      // Calculate consistency score
      const consistencyScore = this.calculateConsistencyScore(
        contradictions,
        inconsistencies
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        contradictions,
        inconsistencies
      );

      // Determine if approved
      const approved =
        consistencyScore >= this.consistencyThreshold &&
        contradictions.filter(c => c.severity === 'critical').length === 0;

      const result: ConsistencyCheckResult = {
        id: `consistency_check_${Date.now()}`,
        contentId: request.contentId,
        consistencyScore,
        contradictions,
        inconsistencies,
        recommendations,
        approved,
        checkedAt: new Date(),
      };

      // Store result
      await this.storeConsistencyCheckResult(result);

      logger.info('Consistency check completed', {
        contentId: request.contentId,
        consistencyScore,
        approved,
        contradictionsCount: contradictions.length,
        inconsistenciesCount: inconsistencies.length,
      });

      return result;
    } catch (error) {
      logger.error('Error checking consistency', {
        error,
        contentId: request.contentId,
      });
      throw error;
    }
  }

  /**
   * Check consistency across entire course
   */
  async checkCourseConsistency(courseId: string): Promise<ConsistencyCheckResult[]> {
    try {
      logger.info('Starting course-wide consistency check', { courseId });

      // Get all course content
      const courseContent = await this.getCourseContent(courseId);

      // Check each content item
      const results = await Promise.all(
        courseContent.map(content =>
          this.checkConsistency({
            contentId: content.id,
            content: content.text,
            contentType: content.type,
            courseId,
            moduleId: content.moduleId,
          })
        )
      );

      return results;
    } catch (error) {
      logger.error('Error checking course consistency', { error, courseId });
      throw error;
    }
  }

  /**
   * Check consistency across module
   */
  async checkModuleConsistency(
    courseId: string,
    moduleId: string
  ): Promise<ConsistencyCheckResult[]> {
    try {
      logger.info('Starting module consistency check', { courseId, moduleId });

      // Get all module content
      const moduleContent = await this.getModuleContent(courseId, moduleId);

      // Check each content item
      const results = await Promise.all(
        moduleContent.map(content =>
          this.checkConsistency({
            contentId: content.id,
            content: content.text,
            contentType: content.type,
            courseId,
            moduleId,
          })
        )
      );

      return results;
    } catch (error) {
      logger.error('Error checking module consistency', {
        error,
        courseId,
        moduleId,
      });
      throw error;
    }
  }

  /**
   * Get consistency check history
   */
  async getConsistencyHistory(contentId: string): Promise<ConsistencyCheckResult[]> {
    try {
      logger.info('Retrieving consistency check history', { contentId });
      // In production, this would query from database
      return [];
    } catch (error) {
      logger.error('Error retrieving consistency history', { error, contentId });
      throw error;
    }
  }

  // Private helper methods

  /**
   * Get related content for comparison
   */
  private async getRelatedContent(
    courseId: string,
    moduleId?: string,
    relatedContentIds?: string[]
  ): Promise<Array<{ id: string; text: string; type: string }>> {
    try {
      // In production, this would query from database
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Error getting related content', { error, courseId });
      return [];
    }
  }

  /**
   * Find contradictions between content items
   */
  private async findContradictions(
    content: string,
    relatedContent: Array<{ id: string; text: string; type: string }>,
    request: ConsistencyCheckRequest
  ): Promise<Contradiction[]> {
    try {
      if (relatedContent.length === 0) {
        return [];
      }

      const contradictions: Contradiction[] = [];

      // Check against each related content item
      for (const related of relatedContent) {
        const prompt = `You are a content consistency expert. Compare the following two pieces of educational content and identify any contradictions.

CONTENT 1 (${request.contentType}):
${content}

CONTENT 2 (${related.type}):
${related.text}

Identify contradictions in JSON format:
{
  "contradictions": [
    {
      "severity": "minor|moderate|major|critical",
      "type": "factual|conceptual|terminological|methodological",
      "description": "Description of the contradiction",
      "statement1": "Statement from content 1",
      "statement2": "Contradicting statement from content 2",
      "resolution": "How to resolve this contradiction"
    }
  ]
}

Focus on:
- Factual contradictions (different facts or data)
- Conceptual contradictions (conflicting explanations)
- Terminological contradictions (same term used differently)
- Methodological contradictions (different approaches to same problem)

Only report genuine contradictions, not minor stylistic differences.`;

        const response = await this.aiGateway.generateCompletion({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in educational content consistency with attention to detail.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          responseFormat: { type: 'json_object' },
        });

        const result = JSON.parse(response.content);

        if (result.contradictions && result.contradictions.length > 0) {
          contradictions.push(
            ...result.contradictions.map((c: any) => ({
              severity: c.severity,
              type: c.type,
              description: c.description,
              location1: {
                contentId: request.contentId,
                contentType: request.contentType,
              },
              location2: {
                contentId: related.id,
                contentType: related.type,
              },
              statement1: c.statement1,
              statement2: c.statement2,
              resolution: c.resolution,
            }))
          );
        }
      }

      return contradictions;
    } catch (error) {
      logger.error('Error finding contradictions', { error });
      return [];
    }
  }

  /**
   * Find inconsistencies within and across content
   */
  private async findInconsistencies(
    content: string,
    relatedContent: Array<{ id: string; text: string; type: string }>,
    request: ConsistencyCheckRequest
  ): Promise<Inconsistency[]> {
    try {
      const allContent = [
        { id: request.contentId, text: content, type: request.contentType },
        ...relatedContent,
      ];

      const prompt = `You are a content consistency expert. Analyze the following educational content for inconsistencies in terminology, formatting, style, notation, and references.

${allContent.map((c, i) => `CONTENT ${i + 1} (${c.type}):\n${c.text}`).join('\n\n')}

Identify inconsistencies in JSON format:
{
  "inconsistencies": [
    {
      "type": "terminology|formatting|style|notation|reference",
      "description": "Description of the inconsistency",
      "examples": ["example 1", "example 2"],
      "recommendation": "How to make it consistent"
    }
  ]
}

Focus on:
- Terminology: Same concept referred to with different terms
- Formatting: Inconsistent formatting of similar elements
- Style: Inconsistent writing style or tone
- Notation: Inconsistent mathematical or scientific notation
- Reference: Inconsistent citation or reference format

Only report significant inconsistencies that could confuse students.`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in educational content consistency and quality assurance.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.content);

      if (result.inconsistencies && result.inconsistencies.length > 0) {
        return result.inconsistencies.map((inc: any) => ({
          type: inc.type,
          description: inc.description,
          locations: allContent.map(c => ({
            contentId: c.id,
            contentType: c.type,
          })),
          examples: inc.examples || [],
          recommendation: inc.recommendation,
        }));
      }

      return [];
    } catch (error) {
      logger.error('Error finding inconsistencies', { error });
      return [];
    }
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(
    contradictions: Contradiction[],
    inconsistencies: Inconsistency[]
  ): number {
    let score = 1.0;

    // Deduct for contradictions based on severity
    for (const contradiction of contradictions) {
      switch (contradiction.severity) {
        case 'critical':
          score -= 0.25;
          break;
        case 'major':
          score -= 0.15;
          break;
        case 'moderate':
          score -= 0.08;
          break;
        case 'minor':
          score -= 0.03;
          break;
      }
    }

    // Deduct for inconsistencies
    score -= inconsistencies.length * 0.02;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    contradictions: Contradiction[],
    inconsistencies: Inconsistency[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommendations for contradictions
    const criticalContradictions = contradictions.filter(c => c.severity === 'critical');
    if (criticalContradictions.length > 0) {
      recommendations.push(
        `CRITICAL: ${criticalContradictions.length} critical contradiction(s) found. These must be resolved before content approval.`
      );
    }

    const majorContradictions = contradictions.filter(c => c.severity === 'major');
    if (majorContradictions.length > 0) {
      recommendations.push(
        `${majorContradictions.length} major contradiction(s) found. Review and resolve to ensure content accuracy.`
      );
    }

    // Recommendations for inconsistencies
    const terminologyIssues = inconsistencies.filter(i => i.type === 'terminology');
    if (terminologyIssues.length > 0) {
      recommendations.push(
        `${terminologyIssues.length} terminology inconsistency(ies) found. Standardize terminology across all content.`
      );
    }

    const formattingIssues = inconsistencies.filter(i => i.type === 'formatting');
    if (formattingIssues.length > 0) {
      recommendations.push(
        `${formattingIssues.length} formatting inconsistency(ies) found. Apply consistent formatting standards.`
      );
    }

    // General recommendations
    if (contradictions.length > 0 || inconsistencies.length > 0) {
      recommendations.push(
        'Review all flagged issues and update content to ensure consistency across the course.'
      );
    }

    return recommendations;
  }

  /**
   * Get all course content
   */
  private async getCourseContent(
    courseId: string
  ): Promise<Array<{ id: string; text: string; type: any; moduleId?: string }>> {
    try {
      // In production, this would query from database
      return [];
    } catch (error) {
      logger.error('Error getting course content', { error, courseId });
      return [];
    }
  }

  /**
   * Get all module content
   */
  private async getModuleContent(
    courseId: string,
    moduleId: string
  ): Promise<Array<{ id: string; text: string; type: any }>> {
    try {
      // In production, this would query from database
      return [];
    } catch (error) {
      logger.error('Error getting module content', { error, courseId, moduleId });
      return [];
    }
  }

  /**
   * Store consistency check result
   */
  private async storeConsistencyCheckResult(
    result: ConsistencyCheckResult
  ): Promise<void> {
    try {
      // In production, this would store in database
      logger.debug('Storing consistency check result', {
        id: result.id,
        contentId: result.contentId,
        approved: result.approved,
      });
    } catch (error) {
      logger.error('Error storing consistency check result', { error });
    }
  }
}
