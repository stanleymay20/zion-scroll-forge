/**
 * Grading Automation Service for Academic Year Automation System
 * "Whatever you do, work at it with all your heart" - Colossians 3:23
 * 
 * Integrates with ScrollExaminer agent to provide automated grading
 * with confidence scoring and human review flagging.
 * 
 * Requirements: 3.4 - Faculty Teaching Operations
 */

import { aiGatewayService } from '../AIGatewayService';
import { logger } from '../../utils/productionLogger';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface GradingRequest {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  courseId: string;
  submissionContent: string;
  rubric: GradingRubric;
  assignmentType: 'essay' | 'short_answer' | 'code' | 'project' | 'discussion';
  maxPoints: number;
}

export interface GradingRubric {
  criteria: RubricCriterion[];
  gradingScale: GradingScale;
}

export interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export interface GradingScale {
  type: 'percentage' | 'points' | 'letter';
  ranges: GradeRange[];
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
}

export interface GradingResult {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  score: number;
  maxPoints: number;
  percentage: number;
  letterGrade?: string;
  confidenceScore: number;
  needsHumanReview: boolean;
  criteriaScores: CriteriaScore[];
  feedback: string;
  detailedFeedback: DetailedFeedback[];
  gradedAt: Date;
  gradedBy: string;
  reviewReason?: string;
}

export interface CriteriaScore {
  criterionName: string;
  score: number;
  maxPoints: number;
  feedback: string;
  confidence: number;
}

export interface DetailedFeedback {
  section: string;
  comment: string;
  type: 'strength' | 'weakness' | 'suggestion';
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =====================================================
// GRADING AUTOMATION SERVICE
// =====================================================

export class GradingAutomationService {
  private aiGateway: typeof aiGatewayService;
  private readonly CONFIDENCE_THRESHOLD: number;
  private readonly HIGH_CONFIDENCE_THRESHOLD: number;
  private readonly AI_MODEL: string;
  private readonly AI_TEMPERATURE: number;

  constructor() {
    this.aiGateway = aiGatewayService;
    
    // Load configuration from environment with fallbacks
    this.CONFIDENCE_THRESHOLD = parseFloat(
      process.env.GRADING_CONFIDENCE_THRESHOLD || '0.75'
    );
    this.HIGH_CONFIDENCE_THRESHOLD = parseFloat(
      process.env.GRADING_HIGH_CONFIDENCE_THRESHOLD || '0.90'
    );
    this.AI_MODEL = process.env.GRADING_AI_MODEL || 'gpt-4';
    this.AI_TEMPERATURE = parseFloat(
      process.env.GRADING_AI_TEMPERATURE || '0.3'
    );
    
    logger.info('GradingAutomationService initialized for Academic Year Automation', {
      confidenceThreshold: this.CONFIDENCE_THRESHOLD,
      highConfidenceThreshold: this.HIGH_CONFIDENCE_THRESHOLD,
      aiModel: this.AI_MODEL
    });
  }

  /**
   * Grade a submission using ScrollExaminer agent
   * Implements confidence scoring and human review flagging
   * 
   * Property 8: AI Grading Confidence Threshold
   * For any AI-graded submission with confidence score below threshold,
   * the submission must be flagged for human review.
   */
  async gradeSubmission(
    request: GradingRequest
  ): Promise<ServiceResponse<GradingResult>> {
    try {
      logger.info('Grading submission with ScrollExaminer agent', {
        submissionId: request.submissionId,
        studentId: request.studentId,
        assignmentId: request.assignmentId,
        assignmentType: request.assignmentType
      });

      // Build comprehensive grading prompt
      const prompt = this.buildGradingPrompt(request);

      // Generate grading using AI
      const aiResponse = await this.aiGateway.generateContent({
        model: this.AI_MODEL,
        prompt,
        systemPrompt: this.getScrollExaminerSystemPrompt(),
        maxTokens: 2000,
        temperature: this.AI_TEMPERATURE // Lower temperature for more consistent grading
      });

      // Parse AI response into structured grading result
      const gradingResult = this.parseGradingResponse(
        aiResponse.content,
        request
      );

      // Calculate confidence score
      gradingResult.confidenceScore = this.calculateConfidenceScore(
        gradingResult,
        request
      );

      // Flag for human review if confidence is below threshold
      gradingResult.needsHumanReview = this.shouldFlagForHumanReview(
        gradingResult
      );

      if (gradingResult.needsHumanReview) {
        gradingResult.reviewReason = this.getReviewReason(gradingResult);
        logger.info('Submission flagged for human review', {
          submissionId: request.submissionId,
          confidenceScore: gradingResult.confidenceScore,
          reason: gradingResult.reviewReason
        });
      }

      logger.info('Submission graded successfully', {
        submissionId: request.submissionId,
        score: gradingResult.score,
        maxPoints: gradingResult.maxPoints,
        percentage: gradingResult.percentage,
        confidenceScore: gradingResult.confidenceScore,
        needsHumanReview: gradingResult.needsHumanReview
      });

      return {
        success: true,
        data: gradingResult,
        message: gradingResult.needsHumanReview
          ? 'Submission graded - flagged for human review'
          : 'Submission graded successfully'
      };
    } catch (error) {
      logger.error('Error grading submission', {
        error: error instanceof Error ? error.message : 'Unknown error',
        submissionId: request.submissionId
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grade submission'
      };
    }
  }

  /**
   * Batch grade multiple submissions
   */
  async batchGradeSubmissions(
    requests: GradingRequest[]
  ): Promise<ServiceResponse<GradingResult[]>> {
    try {
      logger.info('Batch grading submissions', {
        count: requests.length
      });

      const results: GradingResult[] = [];
      const errors: string[] = [];

      for (const request of requests) {
        const result = await this.gradeSubmission(request);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          errors.push(`Failed to grade ${request.submissionId}: ${result.error}`);
        }
      }

      const flaggedCount = results.filter(r => r.needsHumanReview).length;

      logger.info('Batch grading completed', {
        total: requests.length,
        successful: results.length,
        failed: errors.length,
        flaggedForReview: flaggedCount
      });

      return {
        success: errors.length === 0,
        data: results,
        message: `Graded ${results.length}/${requests.length} submissions. ${flaggedCount} flagged for review.`,
        error: errors.length > 0 ? errors.join('; ') : undefined
      };
    } catch (error) {
      logger.error('Error in batch grading', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch grade submissions'
      };
    }
  }

  /**
   * Generate comprehensive feedback for a submission
   */
  async generateFeedback(
    submissionContent: string,
    rubric: GradingRubric,
    assignmentType: string
  ): Promise<ServiceResponse<string>> {
    try {
      const prompt = `
Provide detailed, constructive feedback for the following ${assignmentType} submission:

**Submission:**
${submissionContent}

**Rubric:**
${JSON.stringify(rubric, null, 2)}

Please provide:
1. Overall assessment
2. Strengths identified
3. Areas for improvement
4. Specific suggestions for enhancement
5. Encouragement and next steps

Format the feedback in a supportive, constructive manner that helps the student grow.
      `.trim();

      const aiResponse = await this.aiGateway.generateContent({
        model: this.AI_MODEL,
        prompt,
        systemPrompt: this.getScrollExaminerSystemPrompt(),
        maxTokens: 1500,
        temperature: 0.7 // Higher temperature for more creative feedback
      });

      return {
        success: true,
        data: aiResponse.content,
        message: 'Feedback generated successfully'
      };
    } catch (error) {
      logger.error('Error generating feedback', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate feedback'
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private buildGradingPrompt(request: GradingRequest): string {
    return `
Grade the following student submission according to the provided rubric:

**Assignment Type:** ${request.assignmentType}
**Maximum Points:** ${request.maxPoints}

**Rubric:**
${this.formatRubric(request.rubric)}

**Student Submission:**
${request.submissionContent}

Please provide:
1. A score for each rubric criterion with justification
2. Total score and percentage
3. Detailed feedback highlighting strengths and areas for improvement
4. Specific suggestions for improvement
5. Your confidence level in this grading (0-100%)

Be fair, consistent, and constructive in your assessment.
Provide specific examples from the submission to support your scoring.
    `.trim();
  }

  private formatRubric(rubric: GradingRubric): string {
    let formatted = 'Grading Criteria:\n\n';
    
    rubric.criteria.forEach((criterion, index) => {
      formatted += `${index + 1}. ${criterion.name} (${criterion.maxPoints} points)\n`;
      formatted += `   ${criterion.description}\n`;
      formatted += '   Levels:\n';
      criterion.levels.forEach(level => {
        formatted += `   - ${level.level}: ${level.description} (${level.points} points)\n`;
      });
      formatted += '\n';
    });

    return formatted;
  }

  private getScrollExaminerSystemPrompt(): string {
    return `
You are ScrollExaminer, an AI agent specialized in fair, comprehensive grading for Christian education.
Your role is to:

1. Evaluate student work objectively against provided rubrics
2. Provide constructive, encouraging feedback
3. Identify both strengths and areas for improvement
4. Maintain consistent grading standards
5. Be transparent about your confidence level
6. Flag submissions that require human judgment

Grading Principles:
- Be fair and consistent across all submissions
- Provide specific, actionable feedback
- Recognize effort and growth
- Maintain high academic standards
- Support student learning and development
- Integrate grace and truth in assessment

Always include:
- Clear scoring with justification
- Specific examples from the submission
- Constructive suggestions for improvement
- Encouragement and affirmation
- Your confidence level in the grading

When uncertain about subjective elements, creative work, or complex reasoning,
indicate lower confidence and recommend human review.
    `.trim();
  }

  private parseGradingResponse(
    aiContent: string,
    request: GradingRequest
  ): GradingResult {
    // Parse AI response into structured grading result
    // Attempts to extract structured data from AI response
    
    const criteriaScores: CriteriaScore[] = [];
    let totalScore = 0;
    const detailedFeedback: DetailedFeedback[] = [];

    try {
      // Attempt to parse JSON if AI returned structured format
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Extract criteria scores from parsed JSON
        if (parsed.criteriaScores && Array.isArray(parsed.criteriaScores)) {
          parsed.criteriaScores.forEach((item: Record<string, unknown>) => {
            const score = typeof item.score === 'number' ? item.score : 0;
            criteriaScores.push({
              criterionName: String(item.criterionName || 'Unknown'),
              score,
              maxPoints: typeof item.maxPoints === 'number' ? item.maxPoints : 0,
              feedback: String(item.feedback || ''),
              confidence: typeof item.confidence === 'number' ? item.confidence : 0.85
            });
            totalScore += score;
          });
        }

        // Extract detailed feedback
        if (parsed.detailedFeedback && Array.isArray(parsed.detailedFeedback)) {
          parsed.detailedFeedback.forEach((item: Record<string, unknown>) => {
            detailedFeedback.push({
              section: String(item.section || 'General'),
              comment: String(item.comment || ''),
              type: (item.type === 'strength' || item.type === 'weakness' || item.type === 'suggestion') 
                ? item.type 
                : 'suggestion'
            });
          });
        }
      }
    } catch (parseError) {
      logger.warn('Failed to parse structured AI response, using fallback parsing', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      });
    }

    // Fallback: If parsing failed or no criteria scores extracted, use text-based extraction
    if (criteriaScores.length === 0) {
      request.rubric.criteria.forEach((criterion, index) => {
        // Try to extract score from text for this criterion
        const scorePattern = new RegExp(
          `${criterion.name}[:\\s]+(\\d+(?:\\.\\d+)?)\\s*(?:\\/|out of)\\s*${criterion.maxPoints}`,
          'i'
        );
        const match = aiContent.match(scorePattern);
        let score = match ? parseFloat(match[1]) : Math.floor(criterion.maxPoints * 0.7); // Default to 70%
        
        // Ensure score doesn't exceed max points for this criterion
        score = Math.min(score, criterion.maxPoints);

        criteriaScores.push({
          criterionName: `${criterion.name} ${index + 1}`, // Add index to handle duplicates
          score,
          maxPoints: criterion.maxPoints,
          feedback: this.extractCriterionFeedback(aiContent, criterion.name),
          confidence: match ? 0.85 : 0.65 // Lower confidence for fallback
        });
        totalScore += score;
      });
    } else if (criteriaScores.length < request.rubric.criteria.length) {
      // If we got some but not all criteria, fill in the missing ones
      const missingCount = request.rubric.criteria.length - criteriaScores.length;
      for (let i = 0; i < missingCount; i++) {
        const criterion = request.rubric.criteria[criteriaScores.length + i];
        let score = Math.floor(criterion.maxPoints * 0.7); // Default to 70%
        
        // Ensure score doesn't exceed max points for this criterion
        score = Math.min(score, criterion.maxPoints);
        
        criteriaScores.push({
          criterionName: `${criterion.name} ${criteriaScores.length + 1}`,
          score,
          maxPoints: criterion.maxPoints,
          feedback: this.extractCriterionFeedback(aiContent, criterion.name),
          confidence: 0.65 // Lower confidence for fallback
        });
        totalScore += score;
      }
    }

    // Ensure total score doesn't exceed max points
    if (totalScore > request.maxPoints) {
      // Proportionally reduce all criteria scores to fit within max points
      const scaleFactor = request.maxPoints / totalScore;
      criteriaScores.forEach(criteria => {
        criteria.score = Math.round(criteria.score * scaleFactor * 100) / 100; // Round to 2 decimal places
      });
      totalScore = request.maxPoints;
    }

    // Extract detailed feedback from text if not already parsed
    if (detailedFeedback.length === 0) {
      const strengthsMatch = aiContent.match(/strengths?[:\s]+(.*?)(?=\n\n|weaknesses?|areas for improvement|$)/is);
      if (strengthsMatch) {
        detailedFeedback.push({
          section: 'Strengths',
          comment: strengthsMatch[1].trim(),
          type: 'strength'
        });
      }

      const weaknessesMatch = aiContent.match(/(?:weaknesses?|areas for improvement)[:\s]+(.*?)(?=\n\n|suggestions?|$)/is);
      if (weaknessesMatch) {
        detailedFeedback.push({
          section: 'Areas for Improvement',
          comment: weaknessesMatch[1].trim(),
          type: 'weakness'
        });
      }

      const suggestionsMatch = aiContent.match(/suggestions?[:\s]+(.*?)(?=\n\n|$)/is);
      if (suggestionsMatch) {
        detailedFeedback.push({
          section: 'Suggestions',
          comment: suggestionsMatch[1].trim(),
          type: 'suggestion'
        });
      }
    }

    const percentage = (totalScore / request.maxPoints) * 100;
    const letterGrade = this.calculateLetterGrade(percentage, request.rubric.gradingScale);

    return {
      submissionId: request.submissionId,
      studentId: request.studentId,
      assignmentId: request.assignmentId,
      score: totalScore,
      maxPoints: request.maxPoints,
      percentage,
      letterGrade,
      confidenceScore: 0, // Will be calculated separately
      needsHumanReview: false, // Will be determined separately
      criteriaScores,
      feedback: aiContent,
      detailedFeedback,
      gradedAt: new Date(),
      gradedBy: 'ScrollExaminer-AI'
    };
  }

  /**
   * Extract feedback for a specific criterion from AI response text
   */
  private extractCriterionFeedback(aiContent: string, criterionName: string): string {
    const pattern = new RegExp(
      `${criterionName}[:\\s]+.*?([^\\n]+(?:\\n(?!\\d+\\.|[A-Z][a-z]+:)[^\\n]+)*)`,
      'is'
    );
    const match = aiContent.match(pattern);
    return match ? match[1].trim() : `Feedback for ${criterionName}`;
  }

  private calculateLetterGrade(percentage: number, gradingScale: GradingScale): string | undefined {
    if (gradingScale.type !== 'letter' && gradingScale.type !== 'percentage') {
      return undefined;
    }

    const range = gradingScale.ranges.find(
      r => percentage >= r.min && percentage <= r.max
    );

    return range?.grade;
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidenceScore(
    result: GradingResult,
    request: GradingRequest
  ): number {
    let confidence = 1.0;

    // Factor 1: Consistency of criteria scores
    const criteriaConfidences = result.criteriaScores.map(c => c.confidence);
    const avgCriteriaConfidence = criteriaConfidences.reduce((a, b) => a + b, 0) / criteriaConfidences.length;
    confidence *= avgCriteriaConfidence;

    // Factor 2: Assignment type complexity
    const typeComplexity: Record<string, number> = {
      'essay': 0.7,        // More subjective
      'short_answer': 0.85,
      'code': 0.95,        // More objective
      'project': 0.6,      // Very subjective
      'discussion': 0.75
    };
    confidence *= typeComplexity[request.assignmentType] || 0.8;

    // Factor 3: Score distribution (extreme scores may need review)
    if (result.percentage < 20 || result.percentage > 95) {
      confidence *= 0.85;
    }

    // Factor 4: Rubric clarity (more criteria = more confidence)
    const criteriaCount = request.rubric.criteria.length;
    if (criteriaCount >= 4) {
      confidence *= 1.0;
    } else if (criteriaCount >= 2) {
      confidence *= 0.95;
    } else {
      confidence *= 0.85;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Determine if submission should be flagged for human review
   * 
   * Property 8: AI Grading Confidence Threshold
   * Validates: Requirements 3.4
   */
  private shouldFlagForHumanReview(result: GradingResult): boolean {
    // Flag if confidence is below threshold
    if (result.confidenceScore < this.CONFIDENCE_THRESHOLD) {
      return true;
    }

    // Flag if any individual criterion has low confidence
    const hasLowConfidenceCriterion = result.criteriaScores.some(
      c => c.confidence < this.CONFIDENCE_THRESHOLD
    );
    if (hasLowConfidenceCriterion) {
      return true;
    }

    // Flag extreme scores (very low or very high)
    if (result.percentage < 20 || result.percentage > 95) {
      return true;
    }

    // Flag if score is near grade boundaries
    const isNearBoundary = this.isNearGradeBoundary(result.percentage);
    if (isNearBoundary) {
      return true;
    }

    return false;
  }

  private isNearGradeBoundary(percentage: number): boolean {
    const boundaries = [60, 70, 80, 90]; // Common grade boundaries
    const threshold = 2; // Within 2% of boundary

    return boundaries.some(boundary => 
      Math.abs(percentage - boundary) <= threshold
    );
  }

  private getReviewReason(result: GradingResult): string {
    const reasons: string[] = [];

    if (result.confidenceScore < this.CONFIDENCE_THRESHOLD) {
      reasons.push(`Low overall confidence (${(result.confidenceScore * 100).toFixed(1)}%)`);
    }

    const lowConfidenceCriteria = result.criteriaScores.filter(
      c => c.confidence < this.CONFIDENCE_THRESHOLD
    );
    if (lowConfidenceCriteria.length > 0) {
      reasons.push(`Low confidence in criteria: ${lowConfidenceCriteria.map(c => c.criterionName).join(', ')}`);
    }

    if (result.percentage < 20) {
      reasons.push('Very low score - verify accuracy');
    }

    if (result.percentage > 95) {
      reasons.push('Very high score - verify accuracy');
    }

    if (this.isNearGradeBoundary(result.percentage)) {
      reasons.push('Score near grade boundary');
    }

    return reasons.join('; ');
  }
}

export default GradingAutomationService;
