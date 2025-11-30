/**
 * Source Attribution Manager Service
 * Manages citations, references, and intellectual property compliance
 * "Give to everyone what you owe them" - Romans 13:7
 */

import { PrismaClient } from '@prisma/client';
import { AIGatewayService } from './AIGatewayService';
import { logger } from '../utils/productionLogger';

const prisma = new PrismaClient();

export interface AttributionCheckResult {
  id: string;
  contentId: string;
  attributionScore: number;
  citations: Citation[];
  missingAttributions: MissingAttribution[];
  ipIssues: IntellectualPropertyIssue[];
  recommendations: string[];
  compliant: boolean;
  checkedAt: Date;
}

export interface Citation {
  id: string;
  type: 'scripture' | 'book' | 'journal' | 'website' | 'video' | 'other';
  format: 'APA' | 'MLA' | 'Chicago' | 'Turabian' | 'custom';
  text: string;
  location: string;
  valid: boolean;
  issues?: string[];
  correctedFormat?: string;
}

export interface MissingAttribution {
  content: string;
  location: string;
  reason: string;
  suggestedSource?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IntellectualPropertyIssue {
  type: 'copyright' | 'trademark' | 'patent' | 'fair_use' | 'public_domain';
  description: string;
  content: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
  requiresLegalReview: boolean;
}

export interface AttributionCheckRequest {
  contentId: string;
  content: string;
  contentType: 'lecture' | 'assessment' | 'reading' | 'textbook';
  citationFormat?: 'APA' | 'MLA' | 'Chicago' | 'Turabian';
  requireAttribution?: boolean;
}

export interface CitationGenerationRequest {
  sourceType: 'scripture' | 'book' | 'journal' | 'website' | 'video' | 'other';
  format: 'APA' | 'MLA' | 'Chicago' | 'Turabian';
  sourceInfo: {
    title?: string;
    author?: string[];
    year?: number;
    publisher?: string;
    url?: string;
    doi?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    book?: string;
    chapter?: string;
    verse?: string;
    accessDate?: Date;
  };
}

export class SourceAttributionManager {
  private aiGateway: AIGatewayService;
  private attributionThreshold: number = 0.90;

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  /**
   * Check source attribution and citations
   */
  async checkAttribution(
    request: AttributionCheckRequest
  ): Promise<AttributionCheckResult> {
    try {
      logger.info('Starting attribution check', {
        contentId: request.contentId,
        contentType: request.contentType,
        citationFormat: request.citationFormat,
      });

      // Extract and validate citations
      const citations = await this.extractAndValidateCitations(
        request.content,
        request.citationFormat
      );

      // Identify missing attributions
      const missingAttributions = await this.identifyMissingAttributions(
        request.content,
        citations
      );

      // Check for intellectual property issues
      const ipIssues = await this.checkIntellectualProperty(request.content);

      // Calculate attribution score
      const attributionScore = this.calculateAttributionScore(
        citations,
        missingAttributions,
        ipIssues
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        citations,
        missingAttributions,
        ipIssues,
        request
      );

      // Determine compliance
      const compliant =
        attributionScore >= this.attributionThreshold &&
        missingAttributions.filter(m => m.severity === 'critical').length === 0 &&
        ipIssues.filter(i => i.severity === 'critical').length === 0;

      const result: AttributionCheckResult = {
        id: `attribution_check_${Date.now()}`,
        contentId: request.contentId,
        attributionScore,
        citations,
        missingAttributions,
        ipIssues,
        recommendations,
        compliant,
        checkedAt: new Date(),
      };

      // Store result
      await this.storeAttributionCheckResult(result);

      logger.info('Attribution check completed', {
        contentId: request.contentId,
        attributionScore,
        compliant,
        citationsCount: citations.length,
        missingCount: missingAttributions.length,
        ipIssuesCount: ipIssues.length,
      });

      return result;
    } catch (error) {
      logger.error('Error checking attribution', {
        error,
        contentId: request.contentId,
      });
      throw error;
    }
  }

  /**
   * Generate properly formatted citation
   */
  async generateCitation(request: CitationGenerationRequest): Promise<string> {
    try {
      logger.info('Generating citation', {
        sourceType: request.sourceType,
        format: request.format,
      });

      // Handle scripture citations specially
      if (request.sourceType === 'scripture') {
        return this.generateScriptureCitation(request.sourceInfo);
      }

      // Generate citation based on format
      const citation = await this.formatCitation(request);

      logger.info('Citation generated', {
        sourceType: request.sourceType,
        format: request.format,
      });

      return citation;
    } catch (error) {
      logger.error('Error generating citation', { error });
      throw error;
    }
  }

  /**
   * Batch generate citations
   */
  async batchGenerateCitations(
    requests: CitationGenerationRequest[]
  ): Promise<string[]> {
    try {
      logger.info('Batch generating citations', { count: requests.length });

      const citations = await Promise.all(
        requests.map(request => this.generateCitation(request))
      );

      return citations;
    } catch (error) {
      logger.error('Error batch generating citations', { error });
      throw error;
    }
  }

  /**
   * Validate citation format
   */
  async validateCitation(
    citation: string,
    format: 'APA' | 'MLA' | 'Chicago' | 'Turabian'
  ): Promise<{ valid: boolean; issues: string[]; correctedFormat?: string }> {
    try {
      const prompt = `You are a citation format expert. Validate the following citation against ${format} format standards.

CITATION:
${citation}

Provide validation result in JSON format:
{
  "valid": true|false,
  "issues": ["issue 1", "issue 2"],
  "correctedFormat": "Corrected citation if invalid"
}

Check for:
- Proper author name format
- Correct date format
- Title capitalization and formatting
- Publisher information
- URL and DOI format
- Punctuation and spacing`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert in ${format} citation format with comprehensive knowledge of academic citation standards.`,
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

      return {
        valid: result.valid,
        issues: result.issues || [],
        correctedFormat: result.correctedFormat,
      };
    } catch (error) {
      logger.error('Error validating citation', { error });
      return {
        valid: false,
        issues: ['Validation failed'],
      };
    }
  }

  /**
   * Get attribution check history
   */
  async getAttributionHistory(contentId: string): Promise<AttributionCheckResult[]> {
    try {
      logger.info('Retrieving attribution check history', { contentId });
      // In production, this would query from database
      return [];
    } catch (error) {
      logger.error('Error retrieving attribution history', { error, contentId });
      throw error;
    }
  }

  // Private helper methods

  /**
   * Extract and validate citations from content
   */
  private async extractAndValidateCitations(
    content: string,
    format?: 'APA' | 'MLA' | 'Chicago' | 'Turabian'
  ): Promise<Citation[]> {
    try {
      const citations: Citation[] = [];

      // Extract scripture references
      const scriptureRefs = this.extractScriptureReferences(content);
      citations.push(...scriptureRefs);

      // Extract academic citations
      const academicCitations = await this.extractAcademicCitations(content, format);
      citations.push(...academicCitations);

      // Validate each citation
      for (const citation of citations) {
        if (citation.format !== 'custom') {
          const validation = await this.validateCitation(citation.text, citation.format);
          citation.valid = validation.valid;
          citation.issues = validation.issues;
          citation.correctedFormat = validation.correctedFormat;
        }
      }

      return citations;
    } catch (error) {
      logger.error('Error extracting and validating citations', { error });
      return [];
    }
  }

  /**
   * Extract scripture references
   */
  private extractScriptureReferences(content: string): Citation[] {
    const citations: Citation[] = [];

    // Match patterns like "John 3:16", "1 Corinthians 13:4-7", "Genesis 1:1-2:3"
    const scriptureRegex = /\b(\d*\s*[A-Z][a-z]+)\s+(\d+):(\d+)(-(\d+:)?(\d+))?\b/g;
    let match;

    while ((match = scriptureRegex.exec(content)) !== null) {
      citations.push({
        id: `scripture_${citations.length}`,
        type: 'scripture',
        format: 'custom',
        text: match[0],
        location: `Position ${match.index}`,
        valid: true, // Scripture references are always valid if they match the pattern
      });
    }

    return citations;
  }

  /**
   * Extract academic citations
   */
  private async extractAcademicCitations(
    content: string,
    format?: 'APA' | 'MLA' | 'Chicago' | 'Turabian'
  ): Promise<Citation[]> {
    try {
      const prompt = `Extract all academic citations from the following content. Identify the citation format used.

CONTENT:
${content}

Return citations in JSON format:
{
  "citations": [
    {
      "type": "book|journal|website|video|other",
      "format": "APA|MLA|Chicago|Turabian|custom",
      "text": "Full citation text",
      "location": "Where it appears in content"
    }
  ]
}`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in academic citation formats and can identify citations in various formats.',
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

      return (result.citations || []).map((c: any, index: number) => ({
        id: `citation_${index}`,
        type: c.type,
        format: c.format,
        text: c.text,
        location: c.location,
        valid: false, // Will be validated separately
      }));
    } catch (error) {
      logger.error('Error extracting academic citations', { error });
      return [];
    }
  }

  /**
   * Identify missing attributions
   */
  private async identifyMissingAttributions(
    content: string,
    existingCitations: Citation[]
  ): Promise<MissingAttribution[]> {
    try {
      const prompt = `You are an academic integrity expert. Analyze the following content for statements that require attribution but lack proper citations.

CONTENT:
${content}

EXISTING CITATIONS:
${existingCitations.map(c => c.text).join('\n')}

Identify missing attributions in JSON format:
{
  "missingAttributions": [
    {
      "content": "The specific content needing attribution",
      "location": "Where it appears",
      "reason": "Why it needs attribution",
      "suggestedSource": "Suggested source type if known",
      "severity": "low|medium|high|critical"
    }
  ]
}

Look for:
- Direct quotes without citations
- Paraphrased ideas without attribution
- Statistical data without sources
- Specific theories or concepts without attribution
- Images, diagrams, or media without credits

Severity levels:
- Critical: Direct quotes or copyrighted material
- High: Specific theories, data, or unique ideas
- Medium: General concepts that should be attributed
- Low: Common knowledge that could benefit from a source`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in academic integrity and proper attribution standards.',
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

      return result.missingAttributions || [];
    } catch (error) {
      logger.error('Error identifying missing attributions', { error });
      return [];
    }
  }

  /**
   * Check for intellectual property issues
   */
  private async checkIntellectualProperty(
    content: string
  ): Promise<IntellectualPropertyIssue[]> {
    try {
      const prompt = `You are an intellectual property expert. Analyze the following content for potential copyright, trademark, or other IP issues.

CONTENT:
${content}

Identify IP issues in JSON format:
{
  "ipIssues": [
    {
      "type": "copyright|trademark|patent|fair_use|public_domain",
      "description": "Description of the issue",
      "content": "The specific content with the issue",
      "location": "Where it appears",
      "severity": "low|medium|high|critical",
      "resolution": "How to resolve the issue",
      "requiresLegalReview": true|false
    }
  ]
}

Check for:
- Copyrighted text, images, or media
- Trademark usage
- Patent-protected processes or inventions
- Fair use considerations
- Public domain status

Severity levels:
- Critical: Clear copyright violation
- High: Potential copyright issue requiring review
- Medium: Trademark or fair use concern
- Low: Minor attribution or permission issue`;

      const response = await this.aiGateway.generateCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert in intellectual property law with focus on educational fair use.',
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

      return result.ipIssues || [];
    } catch (error) {
      logger.error('Error checking intellectual property', { error });
      return [];
    }
  }

  /**
   * Calculate attribution score
   */
  private calculateAttributionScore(
    citations: Citation[],
    missingAttributions: MissingAttribution[],
    ipIssues: IntellectualPropertyIssue[]
  ): number {
    let score = 1.0;

    // Deduct for invalid citations
    const invalidCitations = citations.filter(c => !c.valid);
    score -= invalidCitations.length * 0.05;

    // Deduct for missing attributions based on severity
    for (const missing of missingAttributions) {
      switch (missing.severity) {
        case 'critical':
          score -= 0.20;
          break;
        case 'high':
          score -= 0.10;
          break;
        case 'medium':
          score -= 0.05;
          break;
        case 'low':
          score -= 0.02;
          break;
      }
    }

    // Deduct for IP issues based on severity
    for (const issue of ipIssues) {
      switch (issue.severity) {
        case 'critical':
          score -= 0.30;
          break;
        case 'high':
          score -= 0.15;
          break;
        case 'medium':
          score -= 0.08;
          break;
        case 'low':
          score -= 0.03;
          break;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    citations: Citation[],
    missingAttributions: MissingAttribution[],
    ipIssues: IntellectualPropertyIssue[],
    request: AttributionCheckRequest
  ): string[] {
    const recommendations: string[] = [];

    // Recommendations for invalid citations
    const invalidCitations = citations.filter(c => !c.valid);
    if (invalidCitations.length > 0) {
      recommendations.push(
        `${invalidCitations.length} citation(s) have formatting issues. Review and correct to match ${request.citationFormat || 'required'} format.`
      );
    }

    // Recommendations for missing attributions
    const criticalMissing = missingAttributions.filter(m => m.severity === 'critical');
    if (criticalMissing.length > 0) {
      recommendations.push(
        `CRITICAL: ${criticalMissing.length} item(s) require immediate attribution. Add proper citations to avoid plagiarism.`
      );
    }

    const highMissing = missingAttributions.filter(m => m.severity === 'high');
    if (highMissing.length > 0) {
      recommendations.push(
        `${highMissing.length} item(s) need attribution. Add citations for theories, data, and unique ideas.`
      );
    }

    // Recommendations for IP issues
    const criticalIP = ipIssues.filter(i => i.severity === 'critical');
    if (criticalIP.length > 0) {
      recommendations.push(
        `CRITICAL: ${criticalIP.length} intellectual property issue(s) found. Remove or obtain permission for copyrighted material.`
      );
    }

    const legalReviewIP = ipIssues.filter(i => i.requiresLegalReview);
    if (legalReviewIP.length > 0) {
      recommendations.push(
        `${legalReviewIP.length} issue(s) require legal review. Consult with legal counsel before publishing.`
      );
    }

    // General recommendations
    if (citations.length === 0 && request.requireAttribution) {
      recommendations.push(
        'No citations found. Add proper attributions for all referenced sources.'
      );
    }

    return recommendations;
  }

  /**
   * Generate scripture citation
   */
  private generateScriptureCitation(sourceInfo: any): string {
    const { book, chapter, verse } = sourceInfo;
    return `${book} ${chapter}:${verse}`;
  }

  /**
   * Format citation based on style
   */
  private async formatCitation(request: CitationGenerationRequest): Promise<string> {
    const { format, sourceType, sourceInfo } = request;

    // Use AI to generate properly formatted citation
    const prompt = `Generate a properly formatted ${format} citation for the following source:

SOURCE TYPE: ${sourceType}
SOURCE INFORMATION:
${JSON.stringify(sourceInfo, null, 2)}

Return only the formatted citation text, nothing else.`;

    const response = await this.aiGateway.generateCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert in ${format} citation format. Generate precise, properly formatted citations.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    return response.content.trim();
  }

  /**
   * Store attribution check result
   */
  private async storeAttributionCheckResult(
    result: AttributionCheckResult
  ): Promise<void> {
    try {
      // In production, this would store in database
      logger.debug('Storing attribution check result', {
        id: result.id,
        contentId: result.contentId,
        compliant: result.compliant,
      });
    } catch (error) {
      logger.error('Error storing attribution check result', { error });
    }
  }
}

export default SourceAttributionManager;
