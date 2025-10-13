/**
 * Course Recommendation Engine
 * AI-powered course recommendations based on student profile analysis,
 * calling assessment, and prophetic guidance
 */

import {
  ScrollCourse,
  StudentProfile,
  CourseRecommendation,
  ReasoningFactor,
  RecommendationFactor,
  CallingAssessment,
  LearningHistory,
  SkillGap,
  CourseLevel,
  DeliveryMode,
  SupremeScrollFaculty,
  PropheticGuidance,
  KingdomImpact,
  PropheticAlignment,
  PrerequisiteStatus,
  Priority
} from '../types/curriculum-grid';

export interface RecommendationContext {
  studentProfile: StudentProfile;
  availableCourses: ScrollCourse[];
  completedCourses: Set<string>;
  currentEnrollments: Set<string>;
  propheticGuidance?: PropheticGuidance;
  urgentNeeds?: string[];
  careerGoals?: string[];
  ministryFocus?: string[];
}

export interface RecommendationWeights {
  callingAlignment: number;
  skillGapFilling: number;
  learningHistory: number;
  propheticGuidance: number;
  kingdomImpact: number;
  prerequisiteReadiness: number;
  culturalRelevance: number;
  deliveryModePreference: number;
  difficultyProgression: number;
  spiritualGrowth: number;
}

export interface RecommendationStrategy {
  name: string;
  description: string;
  weights: RecommendationWeights;
  filters: RecommendationFilters;
}

export interface RecommendationFilters {
  maxRecommendations: number;
  minRelevanceScore: number;
  excludeCompletedPrerequisites: boolean;
  respectLevelProgression: boolean;
  considerTimeConstraints: boolean;
  prioritizePropheticGuidance: boolean;
}

export class CourseRecommendationEngine {
  private defaultWeights: RecommendationWeights = {
    callingAlignment: 0.25,
    skillGapFilling: 0.20,
    learningHistory: 0.15,
    propheticGuidance: 0.15,
    kingdomImpact: 0.10,
    prerequisiteReadiness: 0.05,
    culturalRelevance: 0.05,
    deliveryModePreference: 0.03,
    difficultyProgression: 0.02,
    spiritualGrowth: 0.00 // Will be calculated separately
  };

  private strategies: Map<string, RecommendationStrategy> = new Map();

  constructor() {
    this.initializeRecommendationStrategies();
  }

  /**
   * Generate personalized course recommendations
   */
  async generateRecommendations(
    context: RecommendationContext,
    strategyName: string = 'balanced'
  ): Promise<CourseRecommendation[]> {
    const strategy = this.strategies.get(strategyName) || this.strategies.get('balanced')!;
    
    // Filter eligible courses
    const eligibleCourses = this.filterEligibleCourses(context, strategy.filters);
    
    // Calculate recommendations for each course
    const recommendations: CourseRecommendation[] = [];
    
    for (const course of eligibleCourses) {
      const recommendation = await this.calculateCourseRecommendation(
        course,
        context,
        strategy.weights
      );
      
      if (recommendation.relevanceScore >= strategy.filters.minRelevanceScore) {
        recommendations.push(recommendation);
      }
    }
    
    // Sort by relevance score and apply limits
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Apply diversity to avoid recommending too many similar courses
    const diversifiedRecommendations = this.applyDiversification(
      recommendations,
      strategy.filters.maxRecommendations
    );
    
    return diversifiedRecommendations;
  }

  /**
   * Get recommendations for specific learning path
   */
  async getPathwayRecommendations(
    studentProfile: StudentProfile,
    targetPathway: string,
    availableCourses: ScrollCourse[]
  ): Promise<CourseRecommendation[]> {
    const pathwayStrategy = this.createPathwayStrategy(targetPathway);
    
    const context: RecommendationContext = {
      studentProfile,
      availableCourses,
      completedCourses: new Set(studentProfile.completedCourses),
      currentEnrollments: new Set(studentProfile.inProgressCourses),
      careerGoals: [targetPathway]
    };
    
    return this.generateRecommendations(context, 'pathway');
  }

  /**
   * Get emergency/urgent recommendations based on prophetic guidance
   */
  async getUrgentRecommendations(
    studentProfile: StudentProfile,
    propheticGuidance: PropheticGuidance,
    availableCourses: ScrollCourse[]
  ): Promise<CourseRecommendation[]> {
    const urgentStrategy = this.strategies.get('prophetic')!;
    
    const context: RecommendationContext = {
      studentProfile,
      availableCourses,
      completedCourses: new Set(studentProfile.completedCourses),
      currentEnrollments: new Set(studentProfile.inProgressCourses),
      propheticGuidance,
      urgentNeeds: [propheticGuidance.guidance]
    };
    
    return this.generateRecommendations(context, 'prophetic');
  }

  /**
   * Get skill-gap focused recommendations
   */
  async getSkillGapRecommendations(
    studentProfile: StudentProfile,
    prioritySkillGaps: SkillGap[],
    availableCourses: ScrollCourse[]
  ): Promise<CourseRecommendation[]> {
    const skillStrategy = this.strategies.get('skill-focused')!;
    
    const context: RecommendationContext = {
      studentProfile: {
        ...studentProfile,
        skillGaps: prioritySkillGaps
      },
      availableCourses,
      completedCourses: new Set(studentProfile.completedCourses),
      currentEnrollments: new Set(studentProfile.inProgressCourses)
    };
    
    return this.generateRecommendations(context, 'skill-focused');
  }

  // Private methods

  private initializeRecommendationStrategies(): void {
    // Balanced strategy - general recommendations
    this.strategies.set('balanced', {
      name: 'Balanced Recommendations',
      description: 'Well-rounded recommendations considering all factors',
      weights: this.defaultWeights,
      filters: {
        maxRecommendations: 10,
        minRelevanceScore: 60,
        excludeCompletedPrerequisites: true,
        respectLevelProgression: true,
        considerTimeConstraints: true,
        prioritizePropheticGuidance: false
      }
    });

    // Prophetic strategy - prioritizes divine guidance
    this.strategies.set('prophetic', {
      name: 'Prophetic Guidance',
      description: 'Prioritizes courses aligned with prophetic direction',
      weights: {
        ...this.defaultWeights,
        propheticGuidance: 0.40,
        callingAlignment: 0.30,
        kingdomImpact: 0.20,
        skillGapFilling: 0.10
      },
      filters: {
        maxRecommendations: 5,
        minRelevanceScore: 70,
        excludeCompletedPrerequisites: false,
        respectLevelProgression: false,
        considerTimeConstraints: false,
        prioritizePropheticGuidance: true
      }
    });

    // Skill-focused strategy
    this.strategies.set('skill-focused', {
      name: 'Skill Development',
      description: 'Focuses on filling identified skill gaps',
      weights: {
        ...this.defaultWeights,
        skillGapFilling: 0.50,
        learningHistory: 0.25,
        prerequisiteReadiness: 0.15,
        difficultyProgression: 0.10
      },
      filters: {
        maxRecommendations: 8,
        minRelevanceScore: 65,
        excludeCompletedPrerequisites: true,
        respectLevelProgression: true,
        considerTimeConstraints: true,
        prioritizePropheticGuidance: false
      }
    });

    // Career pathway strategy
    this.strategies.set('pathway', {
      name: 'Career Pathway',
      description: 'Optimized for specific career or ministry path',
      weights: {
        ...this.defaultWeights,
        callingAlignment: 0.35,
        skillGapFilling: 0.25,
        prerequisiteReadiness: 0.20,
        kingdomImpact: 0.15,
        difficultyProgression: 0.05
      },
      filters: {
        maxRecommendations: 12,
        minRelevanceScore: 55,
        excludeCompletedPrerequisites: true,
        respectLevelProgression: true,
        considerTimeConstraints: true,
        prioritizePropheticGuidance: false
      }
    });

    // Exploration strategy - for discovering new areas
    this.strategies.set('exploration', {
      name: 'Exploration & Discovery',
      description: 'Introduces new areas and diverse learning opportunities',
      weights: {
        ...this.defaultWeights,
        culturalRelevance: 0.20,
        kingdomImpact: 0.20,
        deliveryModePreference: 0.15,
        callingAlignment: 0.15,
        skillGapFilling: 0.10,
        learningHistory: 0.10,
        propheticGuidance: 0.10
      },
      filters: {
        maxRecommendations: 15,
        minRelevanceScore: 45,
        excludeCompletedPrerequisites: true,
        respectLevelProgression: false,
        considerTimeConstraints: true,
        prioritizePropheticGuidance: false
      }
    });
  }

  private filterEligibleCourses(
    context: RecommendationContext,
    filters: RecommendationFilters
  ): ScrollCourse[] {
    return context.availableCourses.filter(course => {
      // Exclude completed courses
      if (context.completedCourses.has(course.id)) return false;
      
      // Exclude current enrollments
      if (context.currentEnrollments.has(course.id)) return false;
      
      // Check if course is published
      if (course.status !== 'published') return false;
      
      // Respect level progression if enabled
      if (filters.respectLevelProgression) {
        if (!this.isAppropriateLevel(course.level, context.studentProfile.currentLevel)) {
          return false;
        }
      }
      
      // Check prerequisites if enabled
      if (filters.excludeCompletedPrerequisites) {
        const prerequisiteStatus = this.checkPrerequisites(course, context.studentProfile);
        if (!prerequisiteStatus.allMet) return false;
      }
      
      return true;
    });
  }

  private async calculateCourseRecommendation(
    course: ScrollCourse,
    context: RecommendationContext,
    weights: RecommendationWeights
  ): Promise<CourseRecommendation> {
    const reasoningFactors: ReasoningFactor[] = [];
    let totalScore = 0;

    // Calling alignment
    const callingScore = this.calculateCallingAlignment(course, context.studentProfile.callingAssessment);
    reasoningFactors.push({
      factor: RecommendationFactor.CALLING_ALIGNMENT,
      weight: weights.callingAlignment,
      explanation: `Aligns with your calling in ${context.studentProfile.callingAssessment.primaryCalling}`
    });
    totalScore += callingScore * weights.callingAlignment;

    // Skill gap filling
    const skillGapScore = this.calculateSkillGapScore(course, context.studentProfile.skillGaps);
    reasoningFactors.push({
      factor: RecommendationFactor.SKILL_GAP,
      weight: weights.skillGapFilling,
      explanation: 'Addresses identified skill gaps in your profile'
    });
    totalScore += skillGapScore * weights.skillGapFilling;

    // Learning history
    const learningHistoryScore = this.calculateLearningHistoryScore(course, context.studentProfile.learningHistory);
    reasoningFactors.push({
      factor: RecommendationFactor.LEARNING_HISTORY,
      weight: weights.learningHistory,
      explanation: 'Matches your learning preferences and success patterns'
    });
    totalScore += learningHistoryScore * weights.learningHistory;

    // Prophetic guidance
    const propheticScore = this.calculatePropheticGuidanceScore(course, context.propheticGuidance);
    if (propheticScore > 0) {
      reasoningFactors.push({
        factor: RecommendationFactor.PROPHETIC_GUIDANCE,
        weight: weights.propheticGuidance,
        explanation: 'Aligns with received prophetic guidance'
      });
    }
    totalScore += propheticScore * weights.propheticGuidance;

    // Kingdom impact
    const kingdomImpactScore = course.kingdomImpact.impactScore / 100;
    reasoningFactors.push({
      factor: RecommendationFactor.KINGDOM_IMPACT,
      weight: weights.kingdomImpact,
      explanation: 'High potential for kingdom transformation and impact'
    });
    totalScore += kingdomImpactScore * weights.kingdomImpact;

    // Prerequisite readiness
    const prerequisiteStatus = this.checkPrerequisites(course, context.studentProfile);
    const prerequisiteScore = prerequisiteStatus.allMet ? 1.0 : 0.5;
    reasoningFactors.push({
      factor: RecommendationFactor.PREREQUISITE_READINESS,
      weight: weights.prerequisiteReadiness,
      explanation: prerequisiteStatus.allMet ? 'All prerequisites met' : 'Some prerequisites missing'
    });
    totalScore += prerequisiteScore * weights.prerequisiteReadiness;

    // Cultural relevance
    const culturalScore = this.calculateCulturalRelevance(course, context.studentProfile);
    reasoningFactors.push({
      factor: RecommendationFactor.CULTURAL_RELEVANCE,
      weight: weights.culturalRelevance,
      explanation: 'Culturally relevant to your background and context'
    });
    totalScore += culturalScore * weights.culturalRelevance;

    return {
      course,
      relevanceScore: Math.round(totalScore * 100),
      reasoningFactors,
      propheticAlignment: course.propheticAlignment.alignmentScore,
      callingAlignment: Math.round(callingScore * 100),
      prerequisiteStatus,
      estimatedCompletionTime: Math.ceil(course.estimatedHours / 10), // Assuming 10 hours per week
      kingdomImpactPotential: course.kingdomImpact.impactScore
    };
  }

  private calculateCallingAlignment(course: ScrollCourse, callingAssessment: CallingAssessment): number {
    let alignmentScore = 0;

    // Check primary calling alignment
    const primaryCallingKeywords = callingAssessment.primaryCalling.toLowerCase().split(' ');
    const courseContent = `${course.title} ${course.description}`.toLowerCase();
    
    primaryCallingKeywords.forEach(keyword => {
      if (courseContent.includes(keyword)) {
        alignmentScore += 0.3;
      }
    });

    // Check secondary callings
    callingAssessment.secondaryCallings.forEach(calling => {
      const callingKeywords = calling.toLowerCase().split(' ');
      callingKeywords.forEach(keyword => {
        if (courseContent.includes(keyword)) {
          alignmentScore += 0.1;
        }
      });
    });

    // Check spiritual gifts alignment
    callingAssessment.spiritualGifts.forEach(gift => {
      if (course.spiritualObjectives.some(obj => 
        obj.description.toLowerCase().includes(gift.toLowerCase())
      )) {
        alignmentScore += 0.15;
      }
    });

    // Check ministry areas
    callingAssessment.ministryAreas.forEach(area => {
      if (courseContent.includes(area.toLowerCase())) {
        alignmentScore += 0.1;
      }
    });

    // Check kingdom vision alignment
    if (callingAssessment.kingdomVision) {
      const visionKeywords = callingAssessment.kingdomVision.toLowerCase().split(' ');
      visionKeywords.forEach(keyword => {
        if (courseContent.includes(keyword)) {
          alignmentScore += 0.05;
        }
      });
    }

    return Math.min(alignmentScore, 1.0);
  }

  private calculateSkillGapScore(course: ScrollCourse, skillGaps: SkillGap[]): number {
    if (skillGaps.length === 0) return 0.5; // Neutral score

    let gapScore = 0;
    const courseContent = `${course.title} ${course.description}`.toLowerCase();
    
    skillGaps.forEach(gap => {
      if (courseContent.includes(gap.skill.toLowerCase())) {
        const gapSeverity = (gap.targetLevel - gap.currentLevel) / 100;
        const priorityWeight = this.getPriorityWeight(gap.priority);
        gapScore += gapSeverity * priorityWeight;
      }
    });

    return Math.min(gapScore / skillGaps.length, 1.0);
  }

  private calculateLearningHistoryScore(course: ScrollCourse, learningHistory: LearningHistory): number {
    let historyScore = 0;

    // Check success in similar faculty courses
    const similarCourses = learningHistory.completedCourses.filter(completion => 
      completion.courseId.includes(course.faculty) // Simplified check
    );

    if (similarCourses.length > 0) {
      const averageGrade = similarCourses.reduce((sum, course) => sum + course.grade, 0) / similarCourses.length;
      historyScore += (averageGrade / 100) * 0.4;
    }

    // Check level appropriateness
    const levelScore = this.calculateLevelAppropriatenessScore(course.level, learningHistory);
    historyScore += levelScore * 0.3;

    // Check delivery mode preference (simplified)
    const preferredModes = ['online_portal', 'xr_mode']; // Would come from student profile
    const modeAlignment = course.deliveryModes.some(mode => preferredModes.includes(mode)) ? 0.3 : 0.1;
    historyScore += modeAlignment;

    return Math.min(historyScore, 1.0);
  }

  private calculatePropheticGuidanceScore(course: ScrollCourse, propheticGuidance?: PropheticGuidance): number {
    if (!propheticGuidance || !propheticGuidance.hasGuidance) return 0;

    const guidanceKeywords = propheticGuidance.guidance.toLowerCase().split(' ');
    const courseContent = `${course.title} ${course.description}`.toLowerCase();
    
    let guidanceScore = 0;
    guidanceKeywords.forEach(keyword => {
      if (courseContent.includes(keyword)) {
        guidanceScore += 0.2;
      }
    });

    // Check biblical references alignment
    propheticGuidance.biblicalReferences.forEach(reference => {
      // Simplified check - would need more sophisticated biblical text matching
      if (courseContent.includes(reference.toLowerCase())) {
        guidanceScore += 0.1;
      }
    });

    // Urgency multiplier
    const urgencyMultiplier = propheticGuidance.urgencyLevel === 'critical' ? 1.5 :
                             propheticGuidance.urgencyLevel === 'high' ? 1.2 : 1.0;

    return Math.min(guidanceScore * urgencyMultiplier, 1.0);
  }

  private calculateCulturalRelevance(course: ScrollCourse, studentProfile: StudentProfile): number {
    // Check if course has cultural adaptations for student's background
    const studentCulture = studentProfile.culturalBackground;
    
    // Simplified cultural relevance calculation
    if (course.culturalContext.includes(studentCulture)) {
      return 1.0;
    }
    
    // Check language alignment
    if (studentProfile.languagePreferences.includes(course.language)) {
      return 0.8;
    }
    
    return 0.5; // Neutral score
  }

  private checkPrerequisites(course: ScrollCourse, studentProfile: StudentProfile): PrerequisiteStatus {
    const completedCourses = new Set(studentProfile.completedCourses);
    const missingPrerequisites = course.prerequisites.filter(prereq => !completedCourses.has(prereq));

    return {
      allMet: missingPrerequisites.length === 0,
      missingPrerequisites,
      recommendedPreparation: missingPrerequisites.length > 0 ? 
        [`Complete prerequisites: ${missingPrerequisites.join(', ')}`] : []
    };
  }

  private isAppropriateLevel(courseLevel: CourseLevel, studentLevel: any): boolean {
    const levelHierarchy = {
      [CourseLevel.CERTIFICATE]: 1,
      [CourseLevel.UNDERGRADUATE]: 2,
      [CourseLevel.GRADUATE]: 3,
      [CourseLevel.DOCTORAL]: 4,
      [CourseLevel.XR_SPECIALIZATION]: 2.5,
      [CourseLevel.RESEARCH_TRACK]: 3.5
    };

    const studentLevelMap = {
      'scroll_open': 1,
      'scroll_starter': 2,
      'scroll_degree': 3,
      'scroll_doctorate': 4,
      'scroll_scholarship': 4
    };

    const courseLevelNum = levelHierarchy[courseLevel] || 2;
    const studentLevelNum = studentLevelMap[studentLevel] || 2;

    // Allow courses at or slightly above student level
    return courseLevelNum <= studentLevelNum + 1;
  }

  private calculateLevelAppropriatenessScore(courseLevel: CourseLevel, learningHistory: LearningHistory): number {
    // Simplified calculation based on average performance
    const averageGrade = learningHistory.averageGrade;
    
    if (averageGrade >= 90) return 1.0; // Can handle any level
    if (averageGrade >= 80) return 0.8; // Can handle most levels
    if (averageGrade >= 70) return 0.6; // Should stick to appropriate level
    return 0.4; // May need easier courses
  }

  private getPriorityWeight(priority: Priority): number {
    switch (priority) {
      case Priority.CRITICAL: return 1.0;
      case Priority.HIGH: return 0.8;
      case Priority.MEDIUM: return 0.6;
      case Priority.LOW: return 0.4;
      default: return 0.5;
    }
  }

  private applyDiversification(
    recommendations: CourseRecommendation[],
    maxRecommendations: number
  ): CourseRecommendation[] {
    const diversified: CourseRecommendation[] = [];
    const facultyCount = new Map<SupremeScrollFaculty, number>();
    const levelCount = new Map<CourseLevel, number>();

    for (const recommendation of recommendations) {
      if (diversified.length >= maxRecommendations) break;

      const faculty = recommendation.course.faculty;
      const level = recommendation.course.level;
      
      const facultyCountCurrent = facultyCount.get(faculty) || 0;
      const levelCountCurrent = levelCount.get(level) || 0;

      // Limit recommendations per faculty and level to ensure diversity
      if (facultyCountCurrent < 3 && levelCountCurrent < 4) {
        diversified.push(recommendation);
        facultyCount.set(faculty, facultyCountCurrent + 1);
        levelCount.set(level, levelCountCurrent + 1);
      }
    }

    // Fill remaining slots if we haven't reached the limit
    for (const recommendation of recommendations) {
      if (diversified.length >= maxRecommendations) break;
      if (!diversified.includes(recommendation)) {
        diversified.push(recommendation);
      }
    }

    return diversified;
  }

  private createPathwayStrategy(targetPathway: string): RecommendationStrategy {
    // Create a custom strategy based on the target pathway
    return {
      name: `${targetPathway} Pathway`,
      description: `Optimized for ${targetPathway} career path`,
      weights: {
        ...this.defaultWeights,
        callingAlignment: 0.40,
        skillGapFilling: 0.30,
        prerequisiteReadiness: 0.20,
        kingdomImpact: 0.10
      },
      filters: {
        maxRecommendations: 8,
        minRelevanceScore: 65,
        excludeCompletedPrerequisites: true,
        respectLevelProgression: true,
        considerTimeConstraints: true,
        prioritizePropheticGuidance: false
      }
    };
  }
}