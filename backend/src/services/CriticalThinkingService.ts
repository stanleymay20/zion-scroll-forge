/**
 * ScrollCritical Thinking Service
 * Core service for managing critical thinking frameworks, reasoning evaluation,
 * and spiritual discernment integration
 * 
 * Implements: "Come, let us reason together" (Isaiah 1:18)
 */

import {
  ThinkingLevel,
  ReasoningSubmission,
  ReasoningAssessment,
  CriticalThinkingChallenge,
  CriticalThinkingProfile,
  Evidence,
  AITool,
  ChallengeCategory,
  ChallengeQuestion,
  Resource,
  EvaluationCriteria,
  SkillMetrics,
  ChallengeCompletion,
  AssessmentContext,
  SpiritualScore,
  PropheticFeedback,
  CriticalThinkingError,
  CriticalThinkingErrorType
} from '../types/critical-thinking.types';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export default class CriticalThinkingService {
  /**
   * Evaluate a reasoning submission with both logical and spiritual assessment
   */
  async evaluateReasoning(submission: ReasoningSubmission): Promise<ReasoningAssessment> {
    try {
      logger.info('Evaluating reasoning submission', {
        userId: submission.userId,
        challengeId: submission.challengeId
      });

      // Validate submission has required components
      if (!submission.argument || submission.argument.length < 50) {
        throw this.createError(
          CriticalThinkingErrorType.REASONING_VALIDATION_FAILED,
          'Argument must be at least 50 characters',
          'Develop your reasoning more fully. Consider evidence, counterarguments, and spiritual insights.'
        );
      }

      // Evaluate logical consistency
      const logicalConsistency = await this.assessLogicalConsistency(
        submission.argument,
        submission.evidence
      );

      // Evaluate evidence quality
      const evidenceQuality = await this.assessEvidenceQuality(submission.evidence);

      // Evaluate spiritual alignment
      const spiritualAlignment = await this.assessSpiritualAlignment(
        submission.argument,
        submission.spiritualInsights
      );

      // Evaluate innovative thinking
      const innovativeThinking = await this.assessInnovativeThinking(
        submission.argument,
        submission.aiToolsUsed
      );

      // Evaluate kingdom impact potential
      const kingdomImpact = await this.assessKingdomImpact(
        submission.argument,
        submission.spiritualInsights
      );

      // Calculate ScrollXP reward based on performance
      const scrollXPAwarded = this.calculateScrollXP({
        logicalConsistency,
        evidenceQuality,
        spiritualAlignment,
        innovativeThinking,
        kingdomImpact
      });

      // Generate comprehensive feedback
      const feedback = await this.generateFeedback({
        logicalConsistency,
        evidenceQuality,
        spiritualAlignment,
        innovativeThinking,
        kingdomImpact
      });

      const assessment: ReasoningAssessment = {
        logicalConsistency,
        evidenceQuality,
        spiritualAlignment,
        innovativeThinking,
        kingdomImpact,
        feedback,
        scrollXPAwarded
      };

      // Store assessment in database
      await this.storeAssessment(submission, assessment);

      logger.info('Reasoning evaluation complete', {
        userId: submission.userId,
        scrollXPAwarded
      });

      return assessment;
    } catch (error) {
      logger.error('Error evaluating reasoning', { error, submission });
      throw error;
    }
  }

  /**
   * Track discernment activity for a user
   */
  async trackDiscernment(
    userId: string,
    activity: {
      type: string;
      description: string;
      evidence: string[];
      spiritualInsight: string;
    }
  ): Promise<void> {
    try {
      logger.info('Tracking discernment activity', { userId, activityType: activity.type });

      // Record the discernment activity
      await prisma.discernmentActivity.create({
        data: {
          userId,
          activityType: activity.type,
          description: activity.description,
          evidence: activity.evidence,
          spiritualInsight: activity.spiritualInsight,
          timestamp: new Date()
        }
      });

      // Update user's discernment score
      await this.updateDiscernmentScore(userId);

      logger.info('Discernment activity tracked successfully', { userId });
    } catch (error) {
      logger.error('Error tracking discernment', { error, userId });
      throw error;
    }
  }

  /**
   * Generate a critical thinking challenge based on level and topic
   */
  async generateChallenge(
    level: ThinkingLevel,
    topic: string
  ): Promise<CriticalThinkingChallenge> {
    try {
      logger.info('Generating critical thinking challenge', { level, topic });

      // Determine challenge parameters based on level
      const parameters = this.getChallengeParameters(level);

      // Generate challenge content
      const challenge: CriticalThinkingChallenge = {
        id: this.generateId(),
        title: await this.generateChallengeTitle(level, topic),
        description: await this.generateChallengeDescription(level, topic),
        level,
        category: this.determineChallengeCategory(topic),
        scenario: await this.generateScenario(level, topic),
        questions: await this.generateQuestions(level, topic, parameters.questionCount),
        resources: await this.gatherResources(topic),
        evaluationCriteria: this.defineEvaluationCriteria(level),
        scrollXPReward: parameters.xpReward,
        scrollGoldReward: parameters.goldReward,
        badgeUnlocked: parameters.badgeUnlocked,
        createdBy: 'system',
        difficulty: parameters.difficulty,
        estimatedTime: parameters.estimatedTime,
        prerequisites: this.determinePrerequisites(level),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store challenge in database
      await this.storeChallenge(challenge);

      logger.info('Challenge generated successfully', { challengeId: challenge.id });

      return challenge;
    } catch (error) {
      logger.error('Error generating challenge', { error, level, topic });
      throw error;
    }
  }

  /**
   * Assess prophetic alignment of content
   */
  async assessPropheticAlignment(
    content: string,
    context: AssessmentContext
  ): Promise<SpiritualScore> {
    try {
      logger.info('Assessing prophetic alignment', { context });

      // Assess scriptural alignment
      const scripturalAlignment = await this.assessScripturalAlignment(content);

      // Assess prophetic accuracy
      const propheticAccuracy = await this.assessPropheticAccuracy(content);

      // Assess kingdom relevance
      const kingdomRelevance = await this.assessKingdomRelevance(content);

      // Assess transformational potential
      const transformationalPotential = await this.assessTransformationalPotential(content);

      // Assess love and truth balance
      const loveAndTruthBalance = await this.assessLoveAndTruthBalance(content);

      // Calculate overall alignment
      const overallAlignment = (
        scripturalAlignment +
        propheticAccuracy +
        kingdomRelevance +
        transformationalPotential +
        loveAndTruthBalance
      ) / 5;

      // Generate prophetic feedback
      const feedback = await this.generatePropheticFeedback({
        scripturalAlignment,
        propheticAccuracy,
        kingdomRelevance,
        transformationalPotential,
        loveAndTruthBalance
      });

      // Check if alignment is too low
      if (overallAlignment < 0.6) {
        throw this.createError(
          CriticalThinkingErrorType.PROPHETIC_ALIGNMENT_LOW,
          'Content does not meet minimum prophetic alignment standards',
          'Seek deeper spiritual insight through prayer and Scripture meditation.'
        );
      }

      const spiritualScore: SpiritualScore = {
        scripturalAlignment,
        propheticAccuracy,
        kingdomRelevance,
        transformationalPotential,
        loveAndTruthBalance,
        overallAlignment,
        feedback
      };

      logger.info('Prophetic alignment assessed', { overallAlignment });

      return spiritualScore;
    } catch (error) {
      logger.error('Error assessing prophetic alignment', { error, context });
      throw error;
    }
  }

  /**
   * Get critical thinking profile for a user
   */
  async getCriticalThinkingProfile(userId: string): Promise<CriticalThinkingProfile> {
    try {
      logger.info('Fetching critical thinking profile', { userId });

      const profile = await prisma.criticalThinkingProfile.findUnique({
        where: { userId },
        include: {
          challengesCompleted: true,
          innovationProjects: true,
          debateParticipation: true,
          mentoringSessions: true
        }
      });

      if (!profile) {
        // Create new profile if doesn't exist
        return await this.createCriticalThinkingProfile(userId);
      }

      return profile as unknown as CriticalThinkingProfile;
    } catch (error) {
      logger.error('Error fetching critical thinking profile', { error, userId });
      throw error;
    }
  }

  /**
   * Update critical thinking profile based on activity
   */
  async updateProfile(
    userId: string,
    activity: {
      type: string;
      score: number;
      feedback: string;
    }
  ): Promise<void> {
    try {
      logger.info('Updating critical thinking profile', { userId, activityType: activity.type });

      const profile = await this.getCriticalThinkingProfile(userId);

      // Update relevant skill metrics based on activity type
      const updatedMetrics = await this.calculateUpdatedMetrics(profile, activity);

      // Update profile in database
      await prisma.criticalThinkingProfile.update({
        where: { userId },
        data: {
          ...updatedMetrics,
          updatedAt: new Date()
        }
      });

      logger.info('Profile updated successfully', { userId });
    } catch (error) {
      logger.error('Error updating profile', { error, userId });
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async assessLogicalConsistency(argument: string, evidence: Evidence[]): Promise<number> {
    // Analyze argument structure and coherence
    const hasIntroduction = argument.toLowerCase().includes('therefore') || 
                           argument.toLowerCase().includes('because');
    const hasConclusion = argument.split('.').length > 2;
    const evidenceSupport = evidence.length > 0 ? 0.3 : 0;
    
    let score = 0.4; // Base score
    if (hasIntroduction) score += 0.2;
    if (hasConclusion) score += 0.1;
    score += evidenceSupport;
    
    return Math.min(score, 1.0);
  }

  private async assessEvidenceQuality(evidence: Evidence[]): Promise<number> {
    if (evidence.length === 0) return 0.2;
    
    const avgCredibility = evidence.reduce((sum, e) => sum + e.credibility, 0) / evidence.length;
    const diverseSources = new Set(evidence.map(e => e.source)).size / evidence.length;
    
    return (avgCredibility * 0.7 + diverseSources * 0.3);
  }

  private async assessSpiritualAlignment(
    argument: string,
    spiritualInsights: string[]
  ): Promise<number> {
    const hasInsights = spiritualInsights.length > 0;
    const insightDepth = spiritualInsights.reduce((sum, insight) => 
      sum + (insight.length > 100 ? 0.3 : 0.1), 0
    );
    
    return Math.min(hasInsights ? 0.5 + insightDepth : 0.3, 1.0);
  }

  private async assessInnovativeThinking(argument: string, aiTools: AITool[]): Promise<number> {
    const usesAI = aiTools.length > 0 ? 0.3 : 0;
    const originalThinking = argument.toLowerCase().includes('propose') || 
                            argument.toLowerCase().includes('suggest') ? 0.4 : 0.2;
    
    return Math.min(usesAI + originalThinking, 1.0);
  }

  private async assessKingdomImpact(
    argument: string,
    spiritualInsights: string[]
  ): Promise<number> {
    const kingdomKeywords = ['transform', 'kingdom', 'gospel', 'ministry', 'disciple'];
    const hasKingdomFocus = kingdomKeywords.some(keyword => 
      argument.toLowerCase().includes(keyword)
    );
    
    return hasKingdomFocus ? 0.7 : 0.4;
  }

  private calculateScrollXP(scores: {
    logicalConsistency: number;
    evidenceQuality: number;
    spiritualAlignment: number;
    innovativeThinking: number;
    kingdomImpact: number;
  }): number {
    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 5;
    const baseXP = 10;
    const multiplier = avgScore * 5;
    
    return Math.round(baseXP * multiplier);
  }

  private async generateFeedback(scores: {
    logicalConsistency: number;
    evidenceQuality: number;
    spiritualAlignment: number;
    innovativeThinking: number;
    kingdomImpact: number;
  }): Promise<string> {
    const feedback: string[] = [];
    
    if (scores.logicalConsistency < 0.6) {
      feedback.push('Strengthen your logical structure with clearer premises and conclusions.');
    }
    if (scores.evidenceQuality < 0.6) {
      feedback.push('Provide more credible evidence from diverse sources.');
    }
    if (scores.spiritualAlignment < 0.6) {
      feedback.push('Deepen your spiritual insights through prayer and Scripture meditation.');
    }
    if (scores.innovativeThinking < 0.6) {
      feedback.push('Consider more creative approaches and novel solutions.');
    }
    if (scores.kingdomImpact < 0.6) {
      feedback.push('Connect your reasoning more explicitly to kingdom advancement.');
    }
    
    if (feedback.length === 0) {
      feedback.push('Excellent work! Your reasoning demonstrates strong critical thinking and spiritual discernment.');
    }
    
    return feedback.join(' ');
  }

  private async storeAssessment(
    submission: ReasoningSubmission,
    assessment: ReasoningAssessment
  ): Promise<void> {
    await prisma.reasoningAssessment.create({
      data: {
        userId: submission.userId,
        challengeId: submission.challengeId,
        argument: submission.argument,
        evidence: JSON.stringify(submission.evidence),
        spiritualInsights: submission.spiritualInsights,
        aiToolsUsed: JSON.stringify(submission.aiToolsUsed),
        logicalConsistency: assessment.logicalConsistency,
        evidenceQuality: assessment.evidenceQuality,
        spiritualAlignment: assessment.spiritualAlignment,
        innovativeThinking: assessment.innovativeThinking,
        kingdomImpact: assessment.kingdomImpact,
        feedback: assessment.feedback,
        scrollXPAwarded: assessment.scrollXPAwarded,
        submittedAt: submission.submittedAt,
        assessedAt: new Date()
      }
    });
  }

  private async updateDiscernmentScore(userId: string): Promise<void> {
    const activities = await prisma.discernmentActivity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10
    });
    
    const avgScore = activities.length > 0 ? 0.7 : 0.5; // Simplified calculation
    
    await prisma.criticalThinkingProfile.update({
      where: { userId },
      data: {
        discernmentScore: avgScore,
        updatedAt: new Date()
      }
    });
  }

  private getChallengeParameters(level: ThinkingLevel): {
    questionCount: number;
    xpReward: number;
    goldReward: number;
    badgeUnlocked?: string;
    difficulty: number;
    estimatedTime: number;
  } {
    const params = {
      [ThinkingLevel.FOUNDATION]: {
        questionCount: 3,
        xpReward: 10,
        goldReward: 5,
        difficulty: 1,
        estimatedTime: 30
      },
      [ThinkingLevel.INTERMEDIATE]: {
        questionCount: 5,
        xpReward: 20,
        goldReward: 10,
        difficulty: 3,
        estimatedTime: 60
      },
      [ThinkingLevel.ADVANCED]: {
        questionCount: 7,
        xpReward: 35,
        goldReward: 20,
        badgeUnlocked: 'advanced_thinker',
        difficulty: 5,
        estimatedTime: 90
      },
      [ThinkingLevel.PROPHETIC]: {
        questionCount: 10,
        xpReward: 50,
        goldReward: 35,
        badgeUnlocked: 'prophetic_reasoner',
        difficulty: 7,
        estimatedTime: 120
      },
      [ThinkingLevel.GOVERNMENTAL]: {
        questionCount: 12,
        xpReward: 75,
        goldReward: 50,
        badgeUnlocked: 'governmental_thinker',
        difficulty: 9,
        estimatedTime: 180
      }
    };
    
    return params[level];
  }

  private async generateChallengeTitle(level: ThinkingLevel, topic: string): Promise<string> {
    return `${level.charAt(0).toUpperCase() + level.slice(1)} Critical Thinking: ${topic}`;
  }

  private async generateChallengeDescription(level: ThinkingLevel, topic: string): Promise<string> {
    return `Engage in ${level}-level critical thinking on ${topic}. Apply prophetic reasoning combined with data discernment to examine evidence and spiritual roots.`;
  }

  private determineChallengeCategory(topic: string): ChallengeCategory {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes('theology') || topicLower.includes('doctrine')) {
      return ChallengeCategory.THEOLOGICAL;
    }
    if (topicLower.includes('ethics') || topicLower.includes('moral')) {
      return ChallengeCategory.ETHICAL;
    }
    if (topicLower.includes('science') || topicLower.includes('research')) {
      return ChallengeCategory.SCIENTIFIC;
    }
    if (topicLower.includes('society') || topicLower.includes('culture')) {
      return ChallengeCategory.SOCIAL;
    }
    if (topicLower.includes('technology') || topicLower.includes('ai')) {
      return ChallengeCategory.TECHNOLOGICAL;
    }
    return ChallengeCategory.PROPHETIC;
  }

  private async generateScenario(level: ThinkingLevel, topic: string): Promise<string> {
    return `You are presented with a complex situation involving ${topic}. Apply critical thinking to analyze the evidence, examine spiritual roots, and propose kingdom-aligned solutions.`;
  }

  private async generateQuestions(
    level: ThinkingLevel,
    topic: string,
    count: number
  ): Promise<ChallengeQuestion[]> {
    const questions: ChallengeQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: this.generateId(),
        question: `Question ${i + 1}: Analyze ${topic} from a ${level} perspective.`,
        type: 'essay',
        points: 10,
        rubric: [
          'Logical consistency',
          'Evidence quality',
          'Spiritual alignment',
          'Innovative thinking',
          'Kingdom impact'
        ]
      });
    }
    
    return questions;
  }

  private async gatherResources(topic: string): Promise<Resource[]> {
    return [
      {
        id: this.generateId(),
        title: `Introduction to ${topic}`,
        type: 'article',
        url: '#',
        description: `Foundational resource on ${topic}`
      }
    ];
  }

  private defineEvaluationCriteria(level: ThinkingLevel): EvaluationCriteria[] {
    return [
      {
        criterion: 'Logical Consistency',
        weight: 0.2,
        description: 'Coherent argument structure with clear premises and conclusions'
      },
      {
        criterion: 'Evidence Quality',
        weight: 0.2,
        description: 'Credible sources and diverse evidence'
      },
      {
        criterion: 'Spiritual Alignment',
        weight: 0.2,
        description: 'Biblical foundation and prophetic insight'
      },
      {
        criterion: 'Innovative Thinking',
        weight: 0.2,
        description: 'Creative approaches and novel solutions'
      },
      {
        criterion: 'Kingdom Impact',
        weight: 0.2,
        description: 'Transformational potential and kingdom advancement'
      }
    ];
  }

  private determinePrerequisites(level: ThinkingLevel): string[] {
    if (level === ThinkingLevel.FOUNDATION) return [];
    if (level === ThinkingLevel.INTERMEDIATE) return ['foundation_complete'];
    if (level === ThinkingLevel.ADVANCED) return ['intermediate_complete'];
    if (level === ThinkingLevel.PROPHETIC) return ['advanced_complete'];
    return ['prophetic_complete'];
  }

  private async storeChallenge(challenge: CriticalThinkingChallenge): Promise<void> {
    await prisma.criticalThinkingChallenge.create({
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        level: challenge.level,
        category: challenge.category,
        scenario: challenge.scenario,
        questions: JSON.stringify(challenge.questions),
        resources: JSON.stringify(challenge.resources),
        evaluationCriteria: JSON.stringify(challenge.evaluationCriteria),
        scrollXPReward: challenge.scrollXPReward,
        scrollGoldReward: challenge.scrollGoldReward,
        badgeUnlocked: challenge.badgeUnlocked,
        createdBy: challenge.createdBy,
        difficulty: challenge.difficulty,
        estimatedTime: challenge.estimatedTime,
        prerequisites: challenge.prerequisites,
        isActive: challenge.isActive,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt
      }
    });
  }

  private async assessScripturalAlignment(content: string): Promise<number> {
    const biblicalKeywords = ['scripture', 'bible', 'god', 'jesus', 'christ', 'holy spirit'];
    const hasAlignment = biblicalKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    return hasAlignment ? 0.8 : 0.5;
  }

  private async assessPropheticAccuracy(content: string): Promise<number> {
    return 0.7; // Simplified - would integrate with prophetic validation system
  }

  private async assessKingdomRelevance(content: string): Promise<number> {
    const kingdomKeywords = ['kingdom', 'transform', 'disciple', 'ministry'];
    const relevance = kingdomKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    ).length / kingdomKeywords.length;
    return Math.max(relevance, 0.5);
  }

  private async assessTransformationalPotential(content: string): Promise<number> {
    return 0.7; // Simplified - would analyze impact potential
  }

  private async assessLoveAndTruthBalance(content: string): Promise<number> {
    const hasLove = content.toLowerCase().includes('love') || 
                   content.toLowerCase().includes('compassion');
    const hasTruth = content.toLowerCase().includes('truth') || 
                    content.toLowerCase().includes('accurate');
    
    if (hasLove && hasTruth) return 0.9;
    if (hasLove || hasTruth) return 0.6;
    return 0.4;
  }

  private async generatePropheticFeedback(scores: {
    scripturalAlignment: number;
    propheticAccuracy: number;
    kingdomRelevance: number;
    transformationalPotential: number;
    loveAndTruthBalance: number;
  }): Promise<PropheticFeedback> {
    const strengths: string[] = [];
    const growthAreas: string[] = [];
    const scripturalGuidance: string[] = [];
    const nextSteps: string[] = [];
    
    if (scores.scripturalAlignment > 0.7) {
      strengths.push('Strong scriptural foundation');
    } else {
      growthAreas.push('Deepen scriptural understanding');
      scripturalGuidance.push('Study Isaiah 1:18 - "Come, let us reason together"');
    }
    
    if (scores.loveAndTruthBalance > 0.7) {
      strengths.push('Good balance of love and truth');
    } else {
      growthAreas.push('Balance love and truth more effectively');
      scripturalGuidance.push('Ephesians 4:15 - "Speaking the truth in love"');
    }
    
    nextSteps.push('Continue developing prophetic reasoning skills');
    nextSteps.push('Engage in prayer and worship for deeper revelation');
    
    return {
      strengths,
      growthAreas,
      scripturalGuidance,
      nextSteps
    };
  }

  private async createCriticalThinkingProfile(userId: string): Promise<CriticalThinkingProfile> {
    const profile = await prisma.criticalThinkingProfile.create({
      data: {
        userId,
        reasoningLevel: ThinkingLevel.FOUNDATION,
        discernmentScore: 0.5,
        innovationCapacity: 0.5,
        collaborationSkills: 0.5,
        propheticMaturity: 0.5,
        logicalReasoning: JSON.stringify(this.createInitialSkillMetrics()),
        evidenceEvaluation: JSON.stringify(this.createInitialSkillMetrics()),
        spiritualDiscernment: JSON.stringify(this.createInitialSkillMetrics()),
        ethicalAnalysis: JSON.stringify(this.createInitialSkillMetrics()),
        innovativeThinking: JSON.stringify(this.createInitialSkillMetrics()),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return profile as unknown as CriticalThinkingProfile;
  }

  private createInitialSkillMetrics(): SkillMetrics {
    return {
      currentLevel: 0.5,
      progressRate: 0,
      lastAssessment: new Date(),
      strengthAreas: [],
      growthAreas: []
    };
  }

  private async calculateUpdatedMetrics(
    profile: CriticalThinkingProfile,
    activity: { type: string; score: number; feedback: string }
  ): Promise<Partial<CriticalThinkingProfile>> {
    // Simplified metric calculation
    const improvement = activity.score > 0.7 ? 0.05 : 0.02;
    
    return {
      discernmentScore: Math.min(profile.discernmentScore + improvement, 1.0),
      innovationCapacity: Math.min(profile.innovationCapacity + improvement, 1.0)
    };
  }

  private generateId(): string {
    return `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createError(
    type: CriticalThinkingErrorType,
    message: string,
    scrollGuidance: string
  ): CriticalThinkingError {
    return {
      type,
      message,
      scrollGuidance,
      kingdomWisdom: 'Seek first the kingdom of God and His righteousness',
      recommendedActions: [
        'Pray for wisdom and discernment',
        'Study relevant Scripture passages',
        'Consult with a mentor or elder'
      ]
    };
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<CriticalThinkingChallenge | null> {
    try {
      const challenge = await prisma.criticalThinkingChallenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) return null;

      // Parse JSON fields safely
      const questionsData = typeof challenge.questions === 'string' 
        ? JSON.parse(challenge.questions) 
        : challenge.questions;
      const resourcesData = typeof challenge.resources === 'string'
        ? JSON.parse(challenge.resources)
        : challenge.resources;
      const criteriaData = typeof challenge.evaluationCriteria === 'string'
        ? JSON.parse(challenge.evaluationCriteria)
        : challenge.evaluationCriteria;

      return {
        ...challenge,
        questions: questionsData,
        resources: resourcesData,
        evaluationCriteria: criteriaData
      } as CriticalThinkingChallenge;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching challenge by ID', { error: errorMessage, challengeId });
      throw error;
    }
  }

  /**
   * Get active challenges for a user
   * Note: userId parameter reserved for future filtering by user access/permissions
   */
  async getActiveChallenges(userId: string): Promise<CriticalThinkingChallenge[]> {
    try {
      const challenges = await prisma.criticalThinkingChallenge.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      return challenges.map(challenge => {
        // Parse JSON fields safely
        const questionsData = typeof challenge.questions === 'string'
          ? JSON.parse(challenge.questions)
          : challenge.questions;
        const resourcesData = typeof challenge.resources === 'string'
          ? JSON.parse(challenge.resources)
          : challenge.resources;
        const criteriaData = typeof challenge.evaluationCriteria === 'string'
          ? JSON.parse(challenge.evaluationCriteria)
          : challenge.evaluationCriteria;

        return {
          ...challenge,
          questions: questionsData,
          resources: resourcesData,
          evaluationCriteria: criteriaData
        } as CriticalThinkingChallenge;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching active challenges', { error: errorMessage, userId });
      throw error;
    }
  }
}
