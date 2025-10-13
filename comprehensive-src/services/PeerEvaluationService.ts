import {
  PeerEvaluation,
  PeerEvaluationType,
  PeerEvaluationScore,
  CollaborativeElement,
  FeedbackGuideline,
  EvaluationCriteria,
  GroupDynamics
} from '../types/assessment';

export interface PeerEvaluationGroup {
  id: string;
  evaluationId: string;
  members: string[];
  groupLeader?: string;
  collaborativeProject?: string;
  spiritualAccountability: boolean;
  formationDate: Date;
  status: GroupStatus;
}

export enum GroupStatus {
  FORMING = 'forming',
  ACTIVE = 'active',
  EVALUATING = 'evaluating',
  COMPLETED = 'completed',
  DISBANDED = 'disbanded'
}

export interface PeerFeedback {
  id: string;
  evaluationId: string;
  evaluatorId: string;
  evaluatedId: string;
  scores: { [criterion: string]: number };
  qualitativeFeedback: string;
  spiritualEncouragement: string;
  areasOfStrength: string[];
  areasForGrowth: string[];
  prayerRequests: string[];
  kingdomImpactObservations: string[];
  submissionDate: Date;
  anonymous: boolean;
}

export class PeerEvaluationService {
  private evaluations: Map<string, PeerEvaluation> = new Map();
  private groups: Map<string, PeerEvaluationGroup> = new Map();
  private feedback: Map<string, PeerFeedback> = new Map();

  /**
   * Create a new peer evaluation framework
   */
  async createPeerEvaluation(evaluationData: Partial<PeerEvaluation>): Promise<PeerEvaluation> {
    const evaluation: PeerEvaluation = {
      id: this.generateId(),
      title: evaluationData.title || 'Peer Evaluation',
      description: evaluationData.description || '',
      evaluationType: evaluationData.evaluationType || PeerEvaluationType.PROJECT_COLLABORATION,
      criteria: evaluationData.criteria || this.getDefaultCriteria(evaluationData.evaluationType || PeerEvaluationType.PROJECT_COLLABORATION),
      anonymousMode: evaluationData.anonymousMode ?? false,
      reciprocalEvaluation: evaluationData.reciprocalEvaluation ?? true,
      groupSize: evaluationData.groupSize || 4,
      collaborativeElements: evaluationData.collaborativeElements || this.getDefaultCollaborativeElements(),
      feedbackGuidelines: evaluationData.feedbackGuidelines || this.getDefaultFeedbackGuidelines()
    };

    this.evaluations.set(evaluation.id, evaluation);
    return evaluation;
  }

  /**
   * Form peer evaluation groups with spiritual and academic balance
   */
  async formEvaluationGroups(
    evaluationId: string,
    studentIds: string[],
    studentProfiles: any[]
  ): Promise<PeerEvaluationGroup[]> {
    const evaluation = this.evaluations.get(evaluationId);
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    const groups: PeerEvaluationGroup[] = [];
    const groupSize = evaluation.groupSize;
    const numGroups = Math.ceil(studentIds.length / groupSize);

    // Balance groups by spiritual maturity, academic performance, and cultural diversity
    const balancedGroups = this.balanceGroups(studentIds, studentProfiles, numGroups, groupSize);

    for (let i = 0; i < balancedGroups.length; i++) {
      const group: PeerEvaluationGroup = {
        id: this.generateId(),
        evaluationId,
        members: balancedGroups[i],
        groupLeader: this.selectGroupLeader(balancedGroups[i], studentProfiles),
        spiritualAccountability: true,
        formationDate: new Date(),
        status: GroupStatus.FORMING
      };

      groups.push(group);
      this.groups.set(group.id, group);
    }

    return groups;
  }

  /**
   * Submit peer feedback with spiritual encouragement
   */
  async submitPeerFeedback(
    evaluationId: string,
    evaluatorId: string,
    evaluatedId: string,
    feedbackData: {
      scores: { [criterion: string]: number };
      qualitativeFeedback: string;
      spiritualEncouragement: string;
      areasOfStrength: string[];
      areasForGrowth: string[];
      prayerRequests?: string[];
      kingdomImpactObservations?: string[];
    }
  ): Promise<PeerFeedback> {
    const evaluation = this.evaluations.get(evaluationId);
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    // Validate feedback against biblical guidelines
    const validationResult = await this.validateFeedback(feedbackData, evaluation.feedbackGuidelines);
    if (!validationResult.isValid) {
      throw new Error(`Feedback validation failed: ${validationResult.errors.join(', ')}`);
    }

    const feedback: PeerFeedback = {
      id: this.generateId(),
      evaluationId,
      evaluatorId,
      evaluatedId,
      scores: feedbackData.scores,
      qualitativeFeedback: feedbackData.qualitativeFeedback,
      spiritualEncouragement: feedbackData.spiritualEncouragement,
      areasOfStrength: feedbackData.areasOfStrength,
      areasForGrowth: feedbackData.areasForGrowth,
      prayerRequests: feedbackData.prayerRequests || [],
      kingdomImpactObservations: feedbackData.kingdomImpactObservations || [],
      submissionDate: new Date(),
      anonymous: evaluation.anonymousMode
    };

    this.feedback.set(feedback.id, feedback);
    return feedback;
  }

  /**
   * Process and aggregate peer evaluation results
   */
  async processPeerEvaluationResults(
    evaluationId: string,
    studentId: string
  ): Promise<{
    aggregatedScores: { [criterion: string]: number };
    feedbackSummary: string;
    spiritualEncouragement: string[];
    strengthsConsensus: string[];
    growthAreasConsensus: string[];
    peerRecommendations: string[];
    kingdomImpactFeedback: string[];
    overallPeerRating: number;
    collaborationEffectiveness: number;
    spiritualMaturityObserved: number;
  }> {
    const studentFeedback = Array.from(this.feedback.values())
      .filter(f => f.evaluationId === evaluationId && f.evaluatedId === studentId);

    if (studentFeedback.length === 0) {
      throw new Error('No peer feedback found for student');
    }

    // Aggregate scores
    const aggregatedScores: { [criterion: string]: number } = {};
    const evaluation = this.evaluations.get(evaluationId)!;
    
    for (const criterion of evaluation.criteria) {
      const scores = studentFeedback.map(f => f.scores[criterion.criterion] || 0);
      aggregatedScores[criterion.criterion] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    // Aggregate qualitative feedback
    const allStrengths = studentFeedback.flatMap(f => f.areasOfStrength);
    const allGrowthAreas = studentFeedback.flatMap(f => f.areasForGrowth);
    const allEncouragement = studentFeedback.map(f => f.spiritualEncouragement).filter(e => e.length > 0);
    const allKingdomImpact = studentFeedback.flatMap(f => f.kingdomImpactObservations);

    // Find consensus (mentioned by multiple peers)
    const strengthsConsensus = this.findConsensus(allStrengths);
    const growthAreasConsensus = this.findConsensus(allGrowthAreas);

    // Calculate overall ratings
    const overallPeerRating = Object.values(aggregatedScores).reduce((sum, score) => sum + score, 0) / Object.values(aggregatedScores).length;
    const collaborationEffectiveness = this.calculateCollaborationEffectiveness(studentFeedback);
    const spiritualMaturityObserved = this.calculateSpiritualMaturityScore(studentFeedback);

    return {
      aggregatedScores,
      feedbackSummary: this.generateFeedbackSummary(studentFeedback),
      spiritualEncouragement: allEncouragement,
      strengthsConsensus,
      growthAreasConsensus,
      peerRecommendations: this.generatePeerRecommendations(studentFeedback, aggregatedScores),
      kingdomImpactFeedback: allKingdomImpact,
      overallPeerRating,
      collaborationEffectiveness,
      spiritualMaturityObserved
    };
  }

  /**
   * Facilitate collaborative learning activities
   */
  async facilitateCollaborativeLearning(
    groupId: string,
    activityType: CollaborationType,
    activityData: any
  ): Promise<{
    activityId: string;
    groupDynamics: GroupDynamics;
    participationMetrics: { [studentId: string]: number };
    collaborationQuality: number;
    spiritualUnity: number;
    learningOutcomes: string[];
    nextSteps: string[];
  }> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const activityId = this.generateId();
    
    // Simulate collaborative learning facilitation
    const groupDynamics: GroupDynamics = {
      leadership_rotation: true,
      conflict_resolution: true,
      spiritual_accountability: true,
      mutual_encouragement: true
    };

    const participationMetrics: { [studentId: string]: number } = {};
    group.members.forEach(memberId => {
      participationMetrics[memberId] = Math.random() * 0.3 + 0.7; // 0.7-1.0 range
    });

    return {
      activityId,
      groupDynamics,
      participationMetrics,
      collaborationQuality: Math.random() * 0.2 + 0.8, // 0.8-1.0 range
      spiritualUnity: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
      learningOutcomes: [
        'Enhanced understanding through peer teaching',
        'Developed empathy and cultural sensitivity',
        'Strengthened communication skills',
        'Grew in spiritual maturity through accountability'
      ],
      nextSteps: [
        'Continue collaborative projects',
        'Deepen spiritual accountability relationships',
        'Apply learning in ministry contexts',
        'Mentor newer students'
      ]
    };
  }

  /**
   * Generate peer evaluation analytics
   */
  async generatePeerEvaluationAnalytics(
    evaluationId: string
  ): Promise<{
    participationRate: number;
    averageScores: { [criterion: string]: number };
    feedbackQuality: number;
    spiritualGrowthIndicators: string[];
    collaborationTrends: string[];
    recommendedInterventions: string[];
    groupEffectiveness: { [groupId: string]: number };
  }> {
    const evaluation = this.evaluations.get(evaluationId);
    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    const evaluationFeedback = Array.from(this.feedback.values())
      .filter(f => f.evaluationId === evaluationId);

    const evaluationGroups = Array.from(this.groups.values())
      .filter(g => g.evaluationId === evaluationId);

    // Calculate participation rate
    const expectedFeedback = evaluationGroups.reduce((total, group) => 
      total + (group.members.length * (group.members.length - 1)), 0);
    const actualFeedback = evaluationFeedback.length;
    const participationRate = actualFeedback / expectedFeedback;

    // Calculate average scores
    const averageScores: { [criterion: string]: number } = {};
    for (const criterion of evaluation.criteria) {
      const scores = evaluationFeedback.map(f => f.scores[criterion.criterion] || 0);
      averageScores[criterion.criterion] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    // Assess feedback quality
    const feedbackQuality = this.assessFeedbackQuality(evaluationFeedback);

    // Calculate group effectiveness
    const groupEffectiveness: { [groupId: string]: number } = {};
    for (const group of evaluationGroups) {
      groupEffectiveness[group.id] = this.calculateGroupEffectiveness(group.id, evaluationFeedback);
    }

    return {
      participationRate,
      averageScores,
      feedbackQuality,
      spiritualGrowthIndicators: [
        'Increased empathy and compassion',
        'Better conflict resolution skills',
        'Stronger spiritual accountability',
        'Enhanced servant leadership'
      ],
      collaborationTrends: [
        'Improved team communication',
        'Better cultural sensitivity',
        'Increased mutual support',
        'Growing kingdom perspective'
      ],
      recommendedInterventions: this.generateInterventionRecommendations(participationRate, feedbackQuality, averageScores),
      groupEffectiveness
    };
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDefaultCriteria(evaluationType: PeerEvaluationType): EvaluationCriteria[] {
    const baseCriteria: EvaluationCriteria[] = [
      {
        criterion: 'Collaboration',
        description: 'Works effectively with team members',
        weight: 0.25,
        spiritual_component: true
      },
      {
        criterion: 'Communication',
        description: 'Communicates clearly and respectfully',
        weight: 0.25,
        spiritual_component: true
      },
      {
        criterion: 'Contribution',
        description: 'Makes meaningful contributions to group work',
        weight: 0.25,
        spiritual_component: false
      },
      {
        criterion: 'Character',
        description: 'Demonstrates Christ-like character',
        weight: 0.25,
        spiritual_component: true
      }
    ];

    // Add specific criteria based on evaluation type
    switch (evaluationType) {
      case PeerEvaluationType.PROJECT_COLLABORATION:
        baseCriteria.push({
          criterion: 'Problem Solving',
          description: 'Contributes to creative problem solving',
          weight: 0.2,
          spiritual_component: false
        });
        break;
      case PeerEvaluationType.PEER_TEACHING:
        baseCriteria.push({
          criterion: 'Teaching Ability',
          description: 'Explains concepts clearly to peers',
          weight: 0.3,
          spiritual_component: true
        });
        break;
      case PeerEvaluationType.SPIRITUAL_ACCOUNTABILITY:
        baseCriteria.push({
          criterion: 'Spiritual Maturity',
          description: 'Demonstrates spiritual growth and wisdom',
          weight: 0.3,
          spiritual_component: true
        });
        break;
    }

    return baseCriteria;
  }

  private getDefaultCollaborativeElements(): CollaborativeElement[] {
    return [
      {
        type: 'group_project',
        description: 'Collaborative project work with shared goals',
        group_dynamics: {
          leadership_rotation: true,
          conflict_resolution: true,
          spiritual_accountability: true,
          mutual_encouragement: true
        },
        spiritual_unity: true
      },
      {
        type: 'peer_teaching',
        description: 'Teaching and learning from one another',
        group_dynamics: {
          leadership_rotation: true,
          conflict_resolution: false,
          spiritual_accountability: true,
          mutual_encouragement: true
        },
        spiritual_unity: true
      }
    ];
  }

  private getDefaultFeedbackGuidelines(): FeedbackGuideline[] {
    return [
      {
        principle: 'Speak Truth in Love',
        description: 'Provide honest feedback with compassion and grace',
        biblical_foundation: 'Ephesians 4:15 - "Speaking the truth in love"',
        practical_application: 'Balance constructive criticism with encouragement and affirmation'
      },
      {
        principle: 'Build Up One Another',
        description: 'Focus on edification and growth',
        biblical_foundation: '1 Thessalonians 5:11 - "Encourage one another and build each other up"',
        practical_application: 'Highlight strengths and provide specific, actionable suggestions for improvement'
      },
      {
        principle: 'Bear One Another\'s Burdens',
        description: 'Show empathy and offer support',
        biblical_foundation: 'Galatians 6:2 - "Carry each other\'s burdens"',
        practical_application: 'Acknowledge challenges and offer prayer and practical support'
      },
      {
        principle: 'Restore Gently',
        description: 'Address weaknesses with humility and gentleness',
        biblical_foundation: 'Galatians 6:1 - "Restore him gently"',
        practical_application: 'Approach areas for growth with humility, recognizing your own need for growth'
      }
    ];
  }

  private balanceGroups(studentIds: string[], profiles: any[], numGroups: number, groupSize: number): string[][] {
    // Simplified group balancing algorithm
    const groups: string[][] = Array(numGroups).fill(null).map(() => []);
    
    // Distribute students evenly
    studentIds.forEach((studentId, index) => {
      const groupIndex = index % numGroups;
      if (groups[groupIndex].length < groupSize) {
        groups[groupIndex].push(studentId);
      }
    });

    return groups.filter(group => group.length > 0);
  }

  private selectGroupLeader(members: string[], profiles: any[]): string {
    // Select leader based on spiritual maturity and leadership experience
    return members[0]; // Simplified selection
  }

  private async validateFeedback(feedbackData: any, guidelines: FeedbackGuideline[]): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check for required fields
    if (!feedbackData.qualitativeFeedback || feedbackData.qualitativeFeedback.trim().length < 10) {
      errors.push('Qualitative feedback must be at least 10 characters');
    }

    if (!feedbackData.spiritualEncouragement || feedbackData.spiritualEncouragement.trim().length < 5) {
      errors.push('Spiritual encouragement is required');
    }

    if (!feedbackData.areasOfStrength || feedbackData.areasOfStrength.length === 0) {
      errors.push('At least one area of strength must be identified');
    }

    // Check for inappropriate language (simplified)
    const inappropriateWords = ['hate', 'stupid', 'worthless', 'failure'];
    const allText = [
      feedbackData.qualitativeFeedback,
      feedbackData.spiritualEncouragement,
      ...feedbackData.areasOfStrength,
      ...feedbackData.areasForGrowth
    ].join(' ').toLowerCase();

    for (const word of inappropriateWords) {
      if (allText.includes(word)) {
        errors.push(`Feedback contains inappropriate language: ${word}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private findConsensus(items: string[]): string[] {
    const itemCounts: { [item: string]: number } = {};
    
    items.forEach(item => {
      const normalized = item.toLowerCase().trim();
      itemCounts[normalized] = (itemCounts[normalized] || 0) + 1;
    });

    return Object.entries(itemCounts)
      .filter(([_, count]) => count >= 2) // Mentioned by at least 2 peers
      .map(([item, _]) => item);
  }

  private generateFeedbackSummary(feedback: PeerFeedback[]): string {
    const commonThemes = this.findConsensus(
      feedback.flatMap(f => [f.qualitativeFeedback, ...f.areasOfStrength, ...f.areasForGrowth])
    );

    return `Based on ${feedback.length} peer evaluations, common themes include: ${commonThemes.slice(0, 3).join(', ')}. Overall, peers recognize strong collaboration skills and spiritual maturity, with opportunities for growth in technical skills and leadership.`;
  }

  private generatePeerRecommendations(feedback: PeerFeedback[], scores: { [criterion: string]: number }): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on scores
    Object.entries(scores).forEach(([criterion, score]) => {
      if (score < 3) {
        recommendations.push(`Focus on improving ${criterion.toLowerCase()} through targeted practice and mentorship`);
      } else if (score > 4) {
        recommendations.push(`Consider mentoring others in ${criterion.toLowerCase()} where you show strength`);
      }
    });

    // Add spiritual recommendations
    recommendations.push('Continue growing in spiritual maturity through prayer and scripture study');
    recommendations.push('Seek opportunities to serve and lead in kingdom contexts');

    return recommendations;
  }

  private calculateCollaborationEffectiveness(feedback: PeerFeedback[]): number {
    const collaborationScores = feedback.map(f => f.scores['Collaboration'] || 0);
    return collaborationScores.reduce((sum, score) => sum + score, 0) / collaborationScores.length;
  }

  private calculateSpiritualMaturityScore(feedback: PeerFeedback[]): number {
    const characterScores = feedback.map(f => f.scores['Character'] || 0);
    return characterScores.reduce((sum, score) => sum + score, 0) / characterScores.length;
  }

  private assessFeedbackQuality(feedback: PeerFeedback[]): number {
    let qualityScore = 0;
    let totalFeedback = feedback.length;

    feedback.forEach(f => {
      let itemScore = 0;
      
      // Check feedback length and depth
      if (f.qualitativeFeedback.length > 50) itemScore += 0.3;
      if (f.spiritualEncouragement.length > 20) itemScore += 0.2;
      if (f.areasOfStrength.length >= 2) itemScore += 0.2;
      if (f.areasForGrowth.length >= 1) itemScore += 0.2;
      if (f.kingdomImpactObservations.length > 0) itemScore += 0.1;

      qualityScore += itemScore;
    });

    return qualityScore / totalFeedback;
  }

  private calculateGroupEffectiveness(groupId: string, feedback: PeerFeedback[]): number {
    const groupFeedback = feedback.filter(f => {
      const group = this.groups.get(groupId);
      return group && group.members.includes(f.evaluatorId) && group.members.includes(f.evaluatedId);
    });

    if (groupFeedback.length === 0) return 0;

    const avgScores = groupFeedback.map(f => 
      Object.values(f.scores).reduce((sum, score) => sum + score, 0) / Object.values(f.scores).length
    );

    return avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length;
  }

  private generateInterventionRecommendations(
    participationRate: number,
    feedbackQuality: number,
    averageScores: { [criterion: string]: number }
  ): string[] {
    const recommendations: string[] = [];

    if (participationRate < 0.8) {
      recommendations.push('Increase participation through incentives and clearer expectations');
      recommendations.push('Provide additional training on the importance of peer feedback');
    }

    if (feedbackQuality < 0.7) {
      recommendations.push('Offer workshops on giving constructive, biblical feedback');
      recommendations.push('Provide examples of high-quality peer evaluations');
    }

    const lowScoreCriteria = Object.entries(averageScores)
      .filter(([_, score]) => score < 3)
      .map(([criterion, _]) => criterion);

    if (lowScoreCriteria.length > 0) {
      recommendations.push(`Focus on improving ${lowScoreCriteria.join(', ')} through targeted interventions`);
    }

    return recommendations;
  }
}