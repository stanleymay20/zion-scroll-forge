// Content Coherence Checker Service
// "Let all things be done decently and in order" - 1 Corinthians 14:40
// Ensures content coherence across modules and courses

import { logger } from '../utils/logger';
import { AIGatewayService } from './AIGatewayService';

/**
 * Coherence Check Result
 */
export interface CoherenceCheckResult {
  isCoherent: boolean;
  overallScore: number; // 0-100
  checks: {
    conceptualContinuity: CoherenceScore;
    learningProgression: CoherenceScore;
    terminologyConsistency: CoherenceScore;
    prerequisiteAlignment: CoherenceScore;
    spiritualIntegration: CoherenceScore;
  };
  issues: CoherenceIssue[];
  recommendations: string[];
}

export interface CoherenceScore {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  details: string;
}

export interface CoherenceIssue {
  type: 'conceptual_gap' | 'progression_jump' | 'terminology_conflict' | 'prerequisite_missing' | 'spiritual_disconnect';
  severity: 'critical' | 'major' | 'minor';
  location: string; // Where the issue occurs
  description: string;
  recommendation: string;
  affectedContent: string[];
}

/**
 * Content Relationship
 */
export interface ContentRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: 'prerequisite' | 'builds_on' | 'references' | 'complements' | 'contradicts';
  strength: number; // 0-1
  description: string;
}

/**
 * Learning Path
 */
export interface LearningPath {
  pathId: string;
  name: string;
  description: string;
  contentSequence: string[]; // Ordered list of content IDs
  prerequisites: Map<string, string[]>; // Content ID -> prerequisite IDs
  learningObjectives: string[];
  estimatedDuration: number; // Minutes
}

/**
 * Terminology Map
 */
export interface TerminologyMap {
  term: string;
  definition: string;
  aliases: string[];
  firstIntroduced: string; // Content ID where first introduced
  usageLocations: string[]; // All content IDs where used
  relatedTerms: string[];
}

/**
 * Content Coherence Checker Service
 * Validates coherence and consistency across modules and courses
 */
export class ContentCoherenceChecker {
  private aiGateway: AIGatewayService;
  private terminologyMaps: Map<string, TerminologyMap> = new Map();
  private contentRelationships: Map<string, ContentRelationship[]> = new Map();

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  /**
   * Check coherence across multiple content pieces
   */
  async checkCoherence(
    contentPieces: Array<{ id: string; type: string; content: any }>,
    context?: { courseId?: string; moduleId?: string }
  ): Promise<CoherenceCheckResult> {
    logger.info('Checking content coherence', {
      contentCount: contentPieces.length,
      context
    });

    const issues: CoherenceIssue[] = [];

    // Run all coherence checks
    const conceptualContinuity = await this.checkConceptualContinuity(contentPieces, issues);
    const learningProgression = await this.checkLearningProgression(contentPieces, issues);
    const terminologyConsistency = await this.checkTerminologyConsistency(contentPieces, issues);
    const prerequisiteAlignment = await this.checkPrerequisiteAlignment(contentPieces, issues);
    const spiritualIntegration = await this.checkSpiritualIntegration(contentPieces, issues);

    // Calculate overall score
    const scores = [
      conceptualContinuity.score,
      learningProgression.score,
      terminologyConsistency.score,
      prerequisiteAlignment.score,
      spiritualIntegration.score
    ];
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, {
      conceptualContinuity,
      learningProgression,
      terminologyConsistency,
      prerequisiteAlignment,
      spiritualIntegration
    });

    const result: CoherenceCheckResult = {
      isCoherent: overallScore >= 75 && issues.filter(i => i.severity === 'critical').length === 0,
      overallScore,
      checks: {
        conceptualContinuity,
        learningProgression,
        terminologyConsistency,
        prerequisiteAlignment,
        spiritualIntegration
      },
      issues,
      recommendations
    };

    logger.info('Coherence check complete', {
      isCoherent: result.isCoherent,
      overallScore: result.overallScore,
      issuesCount: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length
    });

    return result;
  }

  /**
   * Check conceptual continuity
   */
  private async checkConceptualContinuity(
    contentPieces: Array<{ id: string; type: string; content: any }>,
    issues: CoherenceIssue[]
  ): Promise<CoherenceScore> {
    let score = 100;
    const details: string[] = [];

    // Extract concepts from each content piece
    const conceptsByContent = new Map<string, Set<string>>();
    
    for (const piece of contentPieces) {
      const concepts = this.extractConcepts(piece.content);
      conceptsByContent.set(piece.id, concepts);
    }

    // Check for conceptual gaps
    for (let i = 1; i < contentPieces.length; i++) {
      const prevConcepts = conceptsByContent.get(contentPieces[i - 1].id) || new Set();
      const currConcepts = conceptsByContent.get(contentPieces[i].id) || new Set();

      // Check if current content references concepts not yet introduced
      const unreferencedConcepts = Array.from(currConcepts).filter(
        concept => !prevConcepts.has(concept) && !this.isBasicConcept(concept)
      );

      if (unreferencedConcepts.length > 0) {
        issues.push({
          type: 'conceptual_gap',
          severity: 'major',
          location: contentPieces[i].id,
          description: `References concepts not yet introduced: ${unreferencedConcepts.join(', ')}`,
          recommendation: 'Either introduce these concepts earlier or add prerequisite references',
          affectedContent: [contentPieces[i - 1].id, contentPieces[i].id]
        });
        score -= 15;
        details.push(`Conceptual gap in ${contentPieces[i].id}`);
      }
    }

    // Check for concept reinforcement
    const allConcepts = new Set<string>();
    contentPieces.forEach(piece => {
      const concepts = conceptsByContent.get(piece.id) || new Set();
      concepts.forEach(c => allConcepts.add(c));
    });

    const reinforcementRate = this.calculateReinforcementRate(conceptsByContent, allConcepts);
    if (reinforcementRate < 0.3) {
      details.push('Low concept reinforcement across content');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      status: this.getScoreStatus(score),
      details: details.length > 0 ? details.join('; ') : 'Concepts flow logically across content'
    };
  }

  /**
   * Check learning progression
   */
  private async checkLearningProgression(
    contentPieces: Array<{ id: string; type: string; content: any }>,
    issues: CoherenceIssue[]
  ): Promise<CoherenceScore> {
    let score = 100;
    const details: string[] = [];

    // Check difficulty progression
    const difficulties = contentPieces.map(piece => this.assessDifficulty(piece.content));
    
    for (let i = 1; i < difficulties.length; i++) {
      const jump = difficulties[i] - difficulties[i - 1];
      
      if (jump > 2) {
        issues.push({
          type: 'progression_jump',
          severity: 'major',
          location: contentPieces[i].id,
          description: `Difficulty jump too large (${difficulties[i - 1]} -> ${difficulties[i]})`,
          recommendation: 'Add intermediate content to smooth the learning curve',
          affectedContent: [contentPieces[i - 1].id, contentPieces[i].id]
        });
        score -= 20;
        details.push(`Large difficulty jump at ${contentPieces[i].id}`);
      } else if (jump < -1) {
        issues.push({
          type: 'progression_jump',
          severity: 'minor',
          location: contentPieces[i].id,
          description: `Difficulty regression (${difficulties[i - 1]} -> ${difficulties[i]})`,
          recommendation: 'Consider reordering content or adjusting difficulty',
          affectedContent: [contentPieces[i - 1].id, contentPieces[i].id]
        });
        score -= 10;
        details.push(`Difficulty regression at ${contentPieces[i].id}`);
      }
    }

    // Check learning objective alignment
    const objectivesCovered = new Set<string>();
    for (const piece of contentPieces) {
      const objectives = this.extractLearningObjectives(piece.content);
      objectives.forEach(obj => objectivesCovered.add(obj));
    }

    if (objectivesCovered.size < contentPieces.length * 0.5) {
      details.push('Limited learning objective coverage');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      status: this.getScoreStatus(score),
      details: details.length > 0 ? details.join('; ') : 'Learning progression is smooth and logical'
    };
  }

  /**
   * Check terminology consistency
   */
  private async checkTerminologyConsistency(
    contentPieces: Array<{ id: string; type: string; content: any }>,
    issues: CoherenceIssue[]
  ): Promise<CoherenceScore> {
    let score = 100;
    const details: string[] = [];

    // Build terminology map
    const termUsage = new Map<string, { definitions: Set<string>; locations: string[] }>();

    for (const piece of contentPieces) {
      const terms = this.extractTerminology(piece.content);
      
      for (const [term, definition] of terms) {
        if (!termUsage.has(term)) {
          termUsage.set(term, { definitions: new Set(), locations: [] });
        }
        const usage = termUsage.get(term)!;
        usage.definitions.add(definition);
        usage.locations.push(piece.id);
      }
    }

    // Check for inconsistent definitions
    for (const [term, usage] of termUsage) {
      if (usage.definitions.size > 1) {
        issues.push({
          type: 'terminology_conflict',
          severity: 'major',
          location: usage.locations.join(', '),
          description: `Term "${term}" has ${usage.definitions.size} different definitions`,
          recommendation: 'Standardize terminology and definitions across all content',
          affectedContent: usage.locations
        });
        score -= 15;
        details.push(`Inconsistent definition for "${term}"`);
      }
    }

    // Check for undefined terms
    const undefinedTerms = this.findUndefinedTerms(contentPieces);
    if (undefinedTerms.length > 0) {
      issues.push({
        type: 'terminology_conflict',
        severity: 'minor',
        location: 'multiple',
        description: `${undefinedTerms.length} terms used without definition`,
        recommendation: 'Add definitions for all technical terms',
        affectedContent: undefinedTerms
      });
      score -= 10;
      details.push(`${undefinedTerms.length} undefined terms`);
    }

    return {
      score: Math.max(0, score),
      status: this.getScoreStatus(score),
      details: details.length > 0 ? details.join('; ') : 'Terminology is consistent across content'
    };
  }

  /**
   * Check prerequisite alignment
   */
  private async checkPrerequisiteAlignment(
    contentPieces: Array<{ id: string; type: string; content: any }>,
    issues: CoherenceIssue[]
  ): Promise<CoherenceScore> {
    let score = 100;
    const details: string[] = [];

    // Build prerequisite map
    const prerequisites = new Map<string, string[]>();
    
    for (const piece of contentPieces) {
      const prereqs = this.extractPrerequisites(piece.content);
      if (prereqs.length > 0) {
        prerequisites.set(piece.id, prereqs);
      }
    }

    // Check if prerequisites are met
    const coveredContent = new Set<string>();
    
    for (const piece of contentPieces) {
      const prereqs = prerequisites.get(piece.id) || [];
      const missingPrereqs = prereqs.filter(prereq => !coveredContent.has(prereq));

      if (missingPrereqs.length > 0) {
        issues.push({
          type: 'prerequisite_missing',
          severity: 'critical',
          location: piece.id,
          description: `Missing prerequisites: ${missingPrereqs.join(', ')}`,
          recommendation: 'Reorder content or add prerequisite material',
          affectedContent: [piece.id, ...missingPrereqs]
        });
        score -= 25;
        details.push(`Missing prerequisites for ${piece.id}`);
      }

      coveredContent.add(piece.id);
    }

    return {
      score: Math.max(0, score),
      status: this.getScoreStatus(score),
      details: details.length > 0 ? details.join('; ') : 'All prerequisites are properly aligned'
    };
  }

  /**
   * Check spiritual integration coherence
   */
  private async checkSpiritualIntegration(
    contentPieces: Array<{ id: string; type: string; content: any }>,
    issues: CoherenceIssue[]
  ): Promise<CoherenceScore> {
    let score = 100;
    const details: string[] = [];

    // Check for spiritual integration in each piece
    let piecesWithIntegration = 0;
    const spiritualThemes = new Set<string>();

    for (const piece of contentPieces) {
      const integration = piece.content.biblicalIntegration;
      
      if (integration) {
        piecesWithIntegration++;
        
        // Extract spiritual themes
        if (integration.theologicalIntegration) {
          const themes = this.extractSpiritualThemes(integration.theologicalIntegration);
          themes.forEach(theme => spiritualThemes.add(theme));
        }
      } else {
        issues.push({
          type: 'spiritual_disconnect',
          severity: 'major',
          location: piece.id,
          description: 'Missing spiritual integration',
          recommendation: 'Add biblical perspective and spiritual application',
          affectedContent: [piece.id]
        });
        score -= 20;
      }
    }

    // Check integration rate
    const integrationRate = piecesWithIntegration / contentPieces.length;
    if (integrationRate < 0.8) {
      details.push(`Only ${Math.round(integrationRate * 100)}% of content has spiritual integration`);
      score -= 15;
    }

    // Check for thematic consistency
    if (spiritualThemes.size > 0 && spiritualThemes.size < 2) {
      details.push('Limited spiritual theme diversity');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      status: this.getScoreStatus(score),
      details: details.length > 0 ? details.join('; ') : 'Spiritual integration is consistent and meaningful'
    };
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(
    issues: CoherenceIssue[],
    scores: Record<string, CoherenceScore>
  ): string[] {
    const recommendations: string[] = [];

    // Critical issues first
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`CRITICAL: Address ${criticalIssues.length} critical coherence issues before proceeding`);
    }

    // Component-specific recommendations
    if (scores.conceptualContinuity.score < 75) {
      recommendations.push('Improve conceptual flow by adding bridging content between modules');
    }

    if (scores.learningProgression.score < 75) {
      recommendations.push('Smooth learning progression by adjusting difficulty levels or adding intermediate content');
    }

    if (scores.terminologyConsistency.score < 75) {
      recommendations.push('Create a terminology glossary and ensure consistent usage across all content');
    }

    if (scores.prerequisiteAlignment.score < 75) {
      recommendations.push('Review and reorder content to ensure prerequisites are met');
    }

    if (scores.spiritualIntegration.score < 75) {
      recommendations.push('Strengthen spiritual integration across all content pieces');
    }

    // General recommendations
    if (issues.length > 10) {
      recommendations.push('Consider comprehensive content review and restructuring');
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  private extractConcepts(content: any): Set<string> {
    const concepts = new Set<string>();
    
    // Extract from main content
    if (content.mainContent && Array.isArray(content.mainContent)) {
      content.mainContent.forEach((section: any) => {
        if (section.title) concepts.add(section.title.toLowerCase());
      });
    }

    // Extract from key takeaways
    if (content.keyTakeaways && Array.isArray(content.keyTakeaways)) {
      content.keyTakeaways.forEach((takeaway: string) => {
        const words = takeaway.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 5) concepts.add(word);
        });
      });
    }

    return concepts;
  }

  private isBasicConcept(concept: string): boolean {
    const basicConcepts = ['introduction', 'overview', 'summary', 'conclusion', 'example'];
    return basicConcepts.includes(concept.toLowerCase());
  }

  private calculateReinforcementRate(
    conceptsByContent: Map<string, Set<string>>,
    allConcepts: Set<string>
  ): number {
    let reinforcedCount = 0;
    
    for (const concept of allConcepts) {
      let occurrences = 0;
      for (const concepts of conceptsByContent.values()) {
        if (concepts.has(concept)) occurrences++;
      }
      if (occurrences > 1) reinforcedCount++;
    }

    return allConcepts.size > 0 ? reinforcedCount / allConcepts.size : 0;
  }

  private assessDifficulty(content: any): number {
    // Simple heuristic: 1-5 scale
    let difficulty = 1;

    if (content.mainContent && content.mainContent.length > 5) difficulty++;
    if (content.examples && content.examples.length > 3) difficulty++;
    if (content.caseStudies && content.caseStudies.length > 0) difficulty++;
    if (content.practiceProblems && content.practiceProblems.length > 5) difficulty++;

    return Math.min(5, difficulty);
  }

  private extractLearningObjectives(content: any): string[] {
    if (content.learningObjectives && Array.isArray(content.learningObjectives)) {
      return content.learningObjectives.map((obj: any) => 
        typeof obj === 'string' ? obj : obj.description || obj.id || ''
      );
    }
    return [];
  }

  private extractTerminology(content: any): Map<string, string> {
    const terms = new Map<string, string>();
    
    // Extract from main content
    if (content.mainContent && Array.isArray(content.mainContent)) {
      content.mainContent.forEach((section: any) => {
        if (section.title && section.content) {
          terms.set(section.title, section.content.substring(0, 200));
        }
      });
    }

    return terms;
  }

  private findUndefinedTerms(contentPieces: Array<{ id: string; type: string; content: any }>): string[] {
    // Simplified: return empty array for now
    return [];
  }

  private extractPrerequisites(content: any): string[] {
    if (content.prerequisites && Array.isArray(content.prerequisites)) {
      return content.prerequisites;
    }
    return [];
  }

  private extractSpiritualThemes(text: string): string[] {
    const themes: string[] = [];
    const keywords = ['faith', 'grace', 'redemption', 'kingdom', 'calling', 'transformation', 'stewardship'];
    
    keywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        themes.push(keyword);
      }
    });

    return themes;
  }

  private getScoreStatus(score: number): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'needs_improvement';
    return 'poor';
  }
}

export default ContentCoherenceChecker;
