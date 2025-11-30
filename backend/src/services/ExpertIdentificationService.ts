/**
 * Expert Identification Service
 * Identifies and routes content to appropriate subject matter experts
 * based on content domain, complexity, and expertise requirements
 */

import { AIGatewayService } from './AIGatewayService';
import { VectorStoreService } from './VectorStoreService';
import { FacultyAssistantService } from './FacultyAssistantService';

interface ExpertProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  expertiseDomains: string[];
  subjectAreas: string[];
  academicCredentials: AcademicCredential[];
  industryExperience: IndustryExperience[];
  spiritualGifts: string[];
  availabilityStatus: AvailabilityStatus;
  workloadCapacity: number;
  currentWorkload: number;
  responseTimeAverage: number;
  qualityRating: number;
  specializations: Specialization[];
  languageCapabilities: string[];
  culturalExpertise: string[];
}

interface AcademicCredential {
  degree: string;
  field: string;
  institution: string;
  year: number;
  verified: boolean;
}

interface IndustryExperience {
  role: string;
  organization: string;
  field: string;
  yearsExperience: number;
  currentPosition: boolean;
}

interface Specialization {
  area: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  certifications: string[];
}

enum AvailabilityStatus {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
  ON_LEAVE = 'on_leave'
}

interface ExpertMatchRequest {
  contentId: string;
  contentType: string;
  subjectArea: string;
  academicLevel: string;
  requiredExpertise: string[];
  spiritualContext?: string;
  culturalContext?: string;
  language: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedWorkload: number;
  deadline?: Date;
}

interface ExpertMatch {
  expert: ExpertProfile;
  matchScore: number;
  matchReasons: string[];
  availability: boolean;
  estimatedResponseTime: number;
  confidence: number;
}

interface ExpertRoutingDecision {
  contentId: string;
  primaryExpert: ExpertMatch;
  backupExperts: ExpertMatch[];
  routingReason: string;
  routingTimestamp: Date;
  expectedCompletionDate: Date;
}

interface ExpertiseGap {
  contentArea: string;
  requiredExpertise: string;
  availableExperts: number;
  gapSeverity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export class ExpertIdentificationService {
  private aiGateway: AIGatewayService;
  private vectorStore: VectorStoreService;
  private facultyService: FacultyAssistantService;

  constructor() {
    this.aiGateway = new AIGatewayService();
    this.vectorStore = new VectorStoreService();
    this.facultyService = new FacultyAssistantService();
  }

  /**
   * Identify and match experts for content review/creation
   */
  async identifyExpertsForContent(
    request: ExpertMatchRequest
  ): Promise<ExpertRoutingDecision> {
    // Analyze content requirements
    const contentAnalysis = await this.analyzeContentRequirements(request);

    // Find matching experts
    const expertMatches = await this.findMatchingExperts(
      contentAnalysis,
      request
    );

    // Rank experts by suitability
    const rankedExperts = await this.rankExpertsBySuitability(
      expertMatches,
      request
    );

    // Check availability and workload
    const availableExperts = await this.filterByAvailability(
      rankedExperts,
      request
    );

    if (availableExperts.length === 0) {
      throw new Error('No available experts found for content requirements');
    }

    // Create routing decision
    const routingDecision: ExpertRoutingDecision = {
      contentId: request.contentId,
      primaryExpert: availableExperts[0],
      backupExperts: availableExperts.slice(1, 4),
      routingReason: this.generateRoutingReason(availableExperts[0], request),
      routingTimestamp: new Date(),
      expectedCompletionDate: this.calculateExpectedCompletion(
        availableExperts[0],
        request
      )
    };

    return routingDecision;
  }

  /**
   * Analyze content to determine expertise requirements
   */
  private async analyzeContentRequirements(
    request: ExpertMatchRequest
  ): Promise<any> {
    const prompt = `Analyze the following content requirements and identify the specific expertise needed:

Content Type: ${request.contentType}
Subject Area: ${request.subjectArea}
Academic Level: ${request.academicLevel}
Required Expertise: ${request.requiredExpertise.join(', ')}
Spiritual Context: ${request.spiritualContext || 'N/A'}
Cultural Context: ${request.culturalContext || 'N/A'}

Identify:
1. Primary subject matter expertise required
2. Secondary/supporting expertise areas
3. Spiritual/theological expertise needs
4. Cultural competency requirements
5. Academic credential requirements
6. Industry experience preferences`;

    const response = await this.aiGateway.generateCompletion({
      prompt,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000
    });

    return JSON.parse(response.content);
  }

  /**
   * Find experts matching the requirements
   */
  private async findMatchingExperts(
    contentAnalysis: any,
    request: ExpertMatchRequest
  ): Promise<ExpertMatch[]> {
    // In production, this would query the expert database
    // For now, return mock data structure
    const mockExperts: ExpertProfile[] = await this.getExpertProfiles();

    const matches: ExpertMatch[] = mockExperts.map(expert => {
      const matchScore = this.calculateMatchScore(expert, contentAnalysis, request);
      const matchReasons = this.generateMatchReasons(expert, contentAnalysis);
      
      return {
        expert,
        matchScore,
        matchReasons,
        availability: expert.availabilityStatus === AvailabilityStatus.AVAILABLE,
        estimatedResponseTime: expert.responseTimeAverage,
        confidence: matchScore / 100
      };
    });

    return matches;
  }

  /**
   * Calculate match score between expert and requirements
   */
  private calculateMatchScore(
    expert: ExpertProfile,
    contentAnalysis: any,
    request: ExpertMatchRequest
  ): number {
    let score = 0;

    // Subject area match (40 points)
    const subjectMatch = expert.subjectAreas.some(area =>
      request.subjectArea.toLowerCase().includes(area.toLowerCase())
    );
    if (subjectMatch) score += 40;

    // Expertise domain match (30 points)
    const expertiseMatch = request.requiredExpertise.some(req =>
      expert.expertiseDomains.some(domain =>
        domain.toLowerCase().includes(req.toLowerCase())
      )
    );
    if (expertiseMatch) score += 30;

    // Language capability (10 points)
    if (expert.languageCapabilities.includes(request.language)) {
      score += 10;
    }

    // Quality rating (10 points)
    score += expert.qualityRating;

    // Workload capacity (10 points)
    const capacityScore = Math.max(
      0,
      10 - (expert.currentWorkload / expert.workloadCapacity) * 10
    );
    score += capacityScore;

    return Math.min(100, score);
  }

  /**
   * Generate reasons for expert match
   */
  private generateMatchReasons(
    expert: ExpertProfile,
    contentAnalysis: any
  ): string[] {
    const reasons: string[] = [];

    if (expert.expertiseDomains.length > 0) {
      reasons.push(`Expertise in ${expert.expertiseDomains.join(', ')}`);
    }

    if (expert.academicCredentials.length > 0) {
      const credentials = expert.academicCredentials
        .map(c => `${c.degree} in ${c.field}`)
        .join(', ');
      reasons.push(`Academic credentials: ${credentials}`);
    }

    if (expert.industryExperience.length > 0) {
      reasons.push(`${expert.industryExperience.length} years industry experience`);
    }

    if (expert.qualityRating >= 8) {
      reasons.push(`High quality rating: ${expert.qualityRating}/10`);
    }

    return reasons;
  }

  /**
   * Rank experts by overall suitability
   */
  private async rankExpertsBySuitability(
    matches: ExpertMatch[],
    request: ExpertMatchRequest
  ): Promise<ExpertMatch[]> {
    // Sort by match score descending
    const ranked = matches.sort((a, b) => b.matchScore - a.matchScore);

    // Apply urgency weighting
    if (request.urgency === 'critical' || request.urgency === 'high') {
      // Prioritize experts with faster response times
      return ranked.sort((a, b) => {
        const scoreA = a.matchScore - a.estimatedResponseTime * 0.1;
        const scoreB = b.matchScore - b.estimatedResponseTime * 0.1;
        return scoreB - scoreA;
      });
    }

    return ranked;
  }

  /**
   * Filter experts by availability and workload
   */
  private async filterByAvailability(
    experts: ExpertMatch[],
    request: ExpertMatchRequest
  ): Promise<ExpertMatch[]> {
    return experts.filter(match => {
      const expert = match.expert;

      // Check availability status
      if (expert.availabilityStatus === AvailabilityStatus.UNAVAILABLE ||
          expert.availabilityStatus === AvailabilityStatus.ON_LEAVE) {
        return false;
      }

      // Check workload capacity
      const remainingCapacity = expert.workloadCapacity - expert.currentWorkload;
      if (remainingCapacity < request.estimatedWorkload) {
        return false;
      }

      // Check deadline feasibility
      if (request.deadline) {
        const estimatedCompletion = this.calculateExpectedCompletion(match, request);
        if (estimatedCompletion > request.deadline) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Calculate expected completion date
   */
  private calculateExpectedCompletion(
    match: ExpertMatch,
    request: ExpertMatchRequest
  ): Date {
    const baseTime = match.estimatedResponseTime;
    const workloadMultiplier = request.estimatedWorkload / 10;
    const urgencyMultiplier = request.urgency === 'critical' ? 0.5 :
                             request.urgency === 'high' ? 0.75 : 1.0;

    const estimatedHours = baseTime * workloadMultiplier * urgencyMultiplier;
    const completionDate = new Date();
    completionDate.setHours(completionDate.getHours() + estimatedHours);

    return completionDate;
  }

  /**
   * Generate routing reason explanation
   */
  private generateRoutingReason(
    match: ExpertMatch,
    request: ExpertMatchRequest
  ): string {
    return `Expert ${match.expert.name} selected with ${match.matchScore}% match score. ` +
           `Reasons: ${match.matchReasons.join('; ')}. ` +
           `Estimated response time: ${match.estimatedResponseTime} hours.`;
  }

  /**
   * Identify expertise gaps in the expert pool
   */
  async identifyExpertiseGaps(): Promise<ExpertiseGap[]> {
    // Analyze content creation needs vs available expertise
    const contentNeeds = await this.analyzeContentCreationNeeds();
    const availableExpertise = await this.analyzeAvailableExpertise();

    const gaps: ExpertiseGap[] = [];

    for (const need of contentNeeds) {
      const availableCount = availableExpertise.filter(
        exp => exp.area === need.area
      ).length;

      if (availableCount < need.requiredCount) {
        gaps.push({
          contentArea: need.area,
          requiredExpertise: need.expertise,
          availableExperts: availableCount,
          gapSeverity: this.calculateGapSeverity(availableCount, need.requiredCount),
          recommendations: this.generateGapRecommendations(need, availableCount)
        });
      }
    }

    return gaps;
  }

  /**
   * Calculate gap severity
   */
  private calculateGapSeverity(
    available: number,
    required: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = available / required;
    if (ratio >= 0.8) return 'low';
    if (ratio >= 0.5) return 'medium';
    if (ratio >= 0.25) return 'high';
    return 'critical';
  }

  /**
   * Generate recommendations for filling expertise gaps
   */
  private generateGapRecommendations(
    need: any,
    availableCount: number
  ): string[] {
    const recommendations: string[] = [];

    if (availableCount === 0) {
      recommendations.push('Recruit new experts in this area immediately');
      recommendations.push('Consider partnering with external institutions');
    } else {
      recommendations.push('Recruit additional experts to meet demand');
      recommendations.push('Provide training to expand existing expert capabilities');
    }

    recommendations.push('Prioritize content in areas with adequate expertise');
    recommendations.push('Consider AI-assisted content generation with human review');

    return recommendations;
  }

  /**
   * Get expert profiles (mock implementation)
   */
  private async getExpertProfiles(): Promise<ExpertProfile[]> {
    // In production, this would query the database
    return [];
  }

  /**
   * Analyze content creation needs (mock implementation)
   */
  private async analyzeContentCreationNeeds(): Promise<any[]> {
    // In production, this would analyze the content pipeline
    return [];
  }

  /**
   * Analyze available expertise (mock implementation)
   */
  private async analyzeAvailableExpertise(): Promise<any[]> {
    // In production, this would query expert availability
    return [];
  }

  /**
   * Route content to identified expert
   */
  async routeContentToExpert(
    contentId: string,
    expertId: string,
    routingReason: string
  ): Promise<void> {
    // In production, this would:
    // 1. Create expert assignment record
    // 2. Send notification to expert
    // 3. Update content status
    // 4. Track routing metrics
    console.log(`Routing content ${contentId} to expert ${expertId}: ${routingReason}`);
  }

  /**
   * Connect with industry experts for specialized content
   */
  async connectIndustryExpert(
    contentArea: string,
    industryField: string
  ): Promise<ExpertProfile[]> {
    // Find industry experts in the specified field
    const experts = await this.getExpertProfiles();
    
    return experts.filter(expert =>
      expert.industryExperience.some(exp =>
        exp.field.toLowerCase().includes(industryField.toLowerCase()) &&
        exp.currentPosition
      )
    );
  }
}

export default ExpertIdentificationService;
