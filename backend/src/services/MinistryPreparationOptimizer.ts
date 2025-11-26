/**
 * Ministry Preparation Optimizer Service
 * Optimizes content for calling-specific ministry preparation
 * 
 * This service adapts educational content to align with a student's specific calling,
 * ensuring they receive targeted preparation for their unique ministry path.
 */

import { PrismaClient } from '@prisma/client';
import AIGatewayService from './AIGatewayService';
import CallingDiscernmentService from './CallingDiscernmentService';
import ContentCreationService from './ContentCreationService';

const prisma = new PrismaClient();

export interface MinistryPreparationProfile {
  userId: string;
  calling: string;
  callingComponents: string[];
  ministryContext: {
    type: 'pastoral' | 'missions' | 'teaching' | 'evangelism' | 'counseling' | 'leadership' | 'marketplace' | 'creative' | 'other';
    setting: 'church' | 'parachurch' | 'marketplace' | 'education' | 'healthcare' | 'government' | 'arts' | 'other';
    geography: 'local' | 'regional' | 'national' | 'international';
    population: string[];
  };
  spiritualGifts: string[];
  currentPreparation: {
    biblical: number; // 0-100
    theological: number;
    practical: number;
    leadership: number;
    cultural: number;
  };
  preparationGaps: PreparationGap[];
  targetReadiness: Date;
}

export interface PreparationGap {
  area: string;
  currentLevel: number; // 0-100
  targetLevel: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  resources: string[];
}

export interface ContentOptimizationRequest {
  userId: string;
  contentId: string;
  contentType: 'lecture' | 'reading' | 'exercise' | 'assessment' | 'project';
  baseContent: string;
  learningObjectives: string[];
}

export interface OptimizedContent {
  originalContentId: string;
  optimizedContent: string;
  callingAlignment: number; // 0-100
  optimizations: ContentOptimization[];
  ministryApplications: MinistryApplication[];
  practicalExercises: PracticalExercise[];
  mentorshipRecommendations: string[];
  resourceRecommendations: string[];
  timestamp: Date;
}

export interface ContentOptimization {
  type: 'example' | 'application' | 'case-study' | 'exercise' | 'assessment' | 'resource';
  description: string;
  callingRelevance: string;
  implementationNotes: string;
}

export interface MinistryApplication {
  scenario: string;
  callingContext: string;
  applicationSteps: string[];
  expectedOutcome: string;
  reflectionQuestions: string[];
}

export interface PracticalExercise {
  title: string;
  description: string;
  callingAlignment: string;
  steps: string[];
  timeEstimate: string;
  deliverables: string[];
  assessmentCriteria: string[];
}

export interface OptimizationResponse {
  success: boolean;
  optimizedContent?: OptimizedContent;
  error?: string;
}

export default class MinistryPreparationOptimizer {
  private aiGateway: AIGatewayService;
  private callingDiscernment: CallingDiscernmentService;
  private contentCreation: ContentCreationService;

  constructor(
    aiGateway?: AIGatewayService,
    callingDiscernment?: CallingDiscernmentService,
    contentCreation?: ContentCreationService
  ) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.callingDiscernment = callingDiscernment || new CallingDiscernmentService();
    this.contentCreation = contentCreation || new ContentCreationService();
  }

  /**
   * Optimize content for a user's specific calling
   */
  async optimizeContent(request: ContentOptimizationRequest): Promise<OptimizationResponse> {
    try {
      // Get user's ministry preparation profile
      const profile = await this.getMinistryProfile(request.userId);

      if (!profile) {
        return {
          success: false,
          error: 'Ministry preparation profile not found'
        };
      }

      // Build optimization prompt
      const prompt = this.buildOptimizationPrompt(request, profile);

      // Get AI optimization
      const response = await this.aiGateway.chat({
        messages: [
          {
            role: 'system',
            content: `You are a ministry preparation specialist who adapts educational content for specific callings.
            Transform generic content into calling-specific preparation that directly equips students for their unique ministry path.
            Provide practical applications, relevant examples, and ministry-specific exercises.
            Maintain theological soundness while making content highly relevant to the calling.
            Format your response as JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        maxTokens: 4000
      });

      // Parse optimized content
      const optimizedContent = this.parseOptimizedContent(response.content, request);

      // Save optimization
      await this.saveOptimization(optimizedContent);

      return {
        success: true,
        optimizedContent
      };
    } catch (error) {
      console.error('Error optimizing content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize content'
      };
    }
  }

  /**
   * Get or create ministry preparation profile
   */
  async getMinistryProfile(userId: string): Promise<MinistryPreparationProfile | null> {
    try {
      // Check if profile exists
      let profile = await prisma.ministryPreparationProfile.findUnique({
        where: { userId }
      });

      if (!profile) {
        // Create profile from calling discernment
        profile = await this.createMinistryProfile(userId);
      }

      return this.mapProfileFromDb(profile);
    } catch (error) {
      console.error('Error getting ministry profile:', error);
      return null;
    }
  }

  /**
   * Update ministry preparation profile
   */
  async updateMinistryProfile(
    userId: string,
    updates: Partial<MinistryPreparationProfile>
  ): Promise<MinistryPreparationProfile> {
    try {
      const updated = await prisma.ministryPreparationProfile.update({
        where: { userId },
        data: {
          calling: updates.calling,
          callingComponents: updates.callingComponents as any,
          ministryContext: updates.ministryContext as any,
          spiritualGifts: updates.spiritualGifts as any,
          currentPreparation: updates.currentPreparation as any,
          preparationGaps: updates.preparationGaps as any,
          targetReadiness: updates.targetReadiness
        }
      });

      return this.mapProfileFromDb(updated);
    } catch (error) {
      console.error('Error updating ministry profile:', error);
      throw new Error('Failed to update ministry profile');
    }
  }

  /**
   * Get optimization history
   */
  async getOptimizationHistory(userId: string, limit: number = 10): Promise<OptimizedContent[]> {
    try {
      const optimizations = await prisma.contentOptimization.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return optimizations.map(this.mapOptimizationFromDb);
    } catch (error) {
      console.error('Error fetching optimization history:', error);
      throw new Error('Failed to fetch optimization history');
    }
  }

  // Private helper methods

  private async createMinistryProfile(userId: string): Promise<any> {
    try {
      // Get calling discernment
      const calling = await this.callingDiscernment.getLatestCalling(userId);

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          spiritualGifts: true,
          scrollCalling: true
        }
      });

      // Create profile
      const profile = await prisma.ministryPreparationProfile.create({
        data: {
          userId,
          calling: calling?.callingStatement || user?.scrollCalling || 'Seeking clarity',
          callingComponents: calling?.callingComponents || [],
          ministryContext: {
            type: 'other',
            setting: 'other',
            geography: 'local',
            population: []
          },
          spiritualGifts: user?.spiritualGifts || [],
          currentPreparation: {
            biblical: 50,
            theological: 50,
            practical: 50,
            leadership: 50,
            cultural: 50
          },
          preparationGaps: [],
          targetReadiness: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      });

      return profile;
    } catch (error) {
      console.error('Error creating ministry profile:', error);
      throw new Error('Failed to create ministry profile');
    }
  }

  private buildOptimizationPrompt(
    request: ContentOptimizationRequest,
    profile: MinistryPreparationProfile
  ): string {
    return `Optimize this educational content for calling-specific ministry preparation:

CALLING PROFILE:
Calling: ${profile.calling}
Calling Components: ${profile.callingComponents.join(', ')}
Ministry Context:
  - Type: ${profile.ministryContext.type}
  - Setting: ${profile.ministryContext.setting}
  - Geography: ${profile.ministryContext.geography}
  - Population: ${profile.ministryContext.population.join(', ')}
Spiritual Gifts: ${profile.spiritualGifts.join(', ')}

CURRENT PREPARATION LEVELS:
- Biblical: ${profile.currentPreparation.biblical}/100
- Theological: ${profile.currentPreparation.theological}/100
- Practical: ${profile.currentPreparation.practical}/100
- Leadership: ${profile.currentPreparation.leadership}/100
- Cultural: ${profile.currentPreparation.cultural}/100

PREPARATION GAPS:
${profile.preparationGaps.map(g => `- ${g.area} (${g.currentLevel} → ${g.targetLevel}): ${g.priority} priority`).join('\n')}

CONTENT TO OPTIMIZE:
Type: ${request.contentType}
Learning Objectives: ${request.learningObjectives.join(', ')}

Base Content:
${request.baseContent}

Provide comprehensive optimization including:

1. Optimized Content - rewritten with calling-specific examples, applications, and language
2. Calling Alignment Score (0-100)
3. Specific Optimizations Made (list each with type, description, relevance)
4. Ministry Applications (3-5 practical scenarios with steps and outcomes)
5. Practical Exercises (2-3 hands-on exercises aligned with calling)
6. Mentorship Recommendations (specific types of mentors needed)
7. Resource Recommendations (books, courses, experiences for this calling)

Make the content directly applicable to their specific ministry context.
Use examples from their ministry type and setting.
Address their preparation gaps.
Be practical and actionable.

Format as JSON.`;
  }

  private parseOptimizedContent(content: string, request: ContentOptimizationRequest): OptimizedContent {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        originalContentId: request.contentId,
        optimizedContent: parsed.optimizedContent || request.baseContent,
        callingAlignment: parsed.callingAlignment || 50,
        optimizations: parsed.optimizations || [],
        ministryApplications: parsed.ministryApplications || [],
        practicalExercises: parsed.practicalExercises || [],
        mentorshipRecommendations: parsed.mentorshipRecommendations || [],
        resourceRecommendations: parsed.resourceRecommendations || [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error parsing optimized content:', error);
      return {
        originalContentId: request.contentId,
        optimizedContent: request.baseContent,
        callingAlignment: 50,
        optimizations: [],
        ministryApplications: [],
        practicalExercises: [],
        mentorshipRecommendations: [],
        resourceRecommendations: [],
        timestamp: new Date()
      };
    }
  }

  private async saveOptimization(optimizedContent: OptimizedContent): Promise<void> {
    try {
      await prisma.contentOptimization.create({
        data: {
          originalContentId: optimizedContent.originalContentId,
          optimizedContent: optimizedContent.optimizedContent,
          callingAlignment: optimizedContent.callingAlignment,
          optimizations: optimizedContent.optimizations as any,
          ministryApplications: optimizedContent.ministryApplications as any,
          practicalExercises: optimizedContent.practicalExercises as any,
          mentorshipRecommendations: optimizedContent.mentorshipRecommendations,
          resourceRecommendations: optimizedContent.resourceRecommendations,
          timestamp: optimizedContent.timestamp
        }
      });
    } catch (error) {
      console.error('Error saving optimization:', error);
      throw new Error('Failed to save optimization');
    }
  }

  private mapProfileFromDb(dbProfile: any): MinistryPreparationProfile {
    return {
      userId: dbProfile.userId,
      calling: dbProfile.calling,
      callingComponents: dbProfile.callingComponents,
      ministryContext: dbProfile.ministryContext,
      spiritualGifts: dbProfile.spiritualGifts,
      currentPreparation: dbProfile.currentPreparation,
      preparationGaps: dbProfile.preparationGaps,
      targetReadiness: dbProfile.targetReadiness
    };
  }

  private mapOptimizationFromDb(dbOptimization: any): OptimizedContent {
    return {
      originalContentId: dbOptimization.originalContentId,
      optimizedContent: dbOptimization.optimizedContent,
      callingAlignment: dbOptimization.callingAlignment,
      optimizations: dbOptimization.optimizations,
      ministryApplications: dbOptimization.ministryApplications,
      practicalExercises: dbOptimization.practicalExercises,
      mentorshipRecommendations: dbOptimization.mentorshipRecommendations,
      resourceRecommendations: dbOptimization.resourceRecommendations,
      timestamp: dbOptimization.timestamp
    };
  }
}
