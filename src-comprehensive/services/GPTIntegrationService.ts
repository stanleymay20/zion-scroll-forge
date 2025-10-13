/**
 * ScrollUniversity GPT Integration Service
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Integrates with ScrollBuilderGPT for project analysis and assistance
 */

import { ScrollProjectSpec, MilestoneSpec } from '../types/scroll-projects';

export interface GPTSummaryRequest {
  projectId: string;
  summaryType: 'milestone' | 'project_completion' | 'marketplace' | 'mentor_review';
  context: {
    project: ScrollProjectSpec;
    milestone?: MilestoneSpec;
    additionalData?: Record<string, any>;
  };
}

export interface GPTSummaryResponse {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  scrollAlignment: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  technicalAssessment: {
    complexity: 'low' | 'medium' | 'high' | 'expert';
    innovation: number; // 1-10 scale
    marketability: number; // 1-10 scale
  };
  generatedAt: string;
}

export interface ProjectAnalysisRequest {
  project: ScrollProjectSpec;
  analysisType: 'quality' | 'completeness' | 'market_potential' | 'scroll_alignment';
  includeRecommendations: boolean;
}

export interface ProjectAnalysisResponse {
  overallScore: number;
  detailedScores: {
    technical: number;
    creativity: number;
    scrollAlignment: number;
    marketPotential: number;
    completeness: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
}

export interface MentorAssistanceRequest {
  projectId: string;
  studentId: string;
  mentorId: string;
  assistanceType: 'feedback_generation' | 'guidance' | 'resource_recommendation';
  context: {
    currentMilestone?: MilestoneSpec;
    studentQuestion?: string;
    specificArea?: string;
  };
}

export interface MentorAssistanceResponse {
  assistanceType: string;
  content: string;
  resources: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'course' | 'tool';
    relevance: number;
  }[];
  followUpQuestions: string[];
  estimatedTimeToComplete?: number;
}

export class GPTIntegrationService {
  private apiEndpoint: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private timeout: number = 30000; // 30 seconds

  constructor(apiEndpoint?: string, apiKey?: string) {
    this.apiEndpoint = apiEndpoint || process.env.SCROLL_BUILDER_GPT_ENDPOINT || 'https://api.scrollbuilder.gpt';
    this.apiKey = apiKey || process.env.SCROLL_BUILDER_GPT_API_KEY || '';
  }

  /**
   * Generate AI summary for project or milestone
   */
  async generateProjectSummary(request: GPTSummaryRequest): Promise<GPTSummaryResponse> {
    try {
      const prompt = this.buildSummaryPrompt(request);
      const response = await this.callGPTAPI('generate-summary', {
        prompt,
        projectId: request.projectId,
        summaryType: request.summaryType,
        maxTokens: 1000,
        temperature: 0.7
      });

      return this.parseSummaryResponse(response);
    } catch (error) {
      throw new Error(`Failed to generate project summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze project quality and provide recommendations
   */
  async analyzeProject(request: ProjectAnalysisRequest): Promise<ProjectAnalysisResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request);
      const response = await this.callGPTAPI('analyze-project', {
        prompt,
        projectId: request.project.project_id,
        analysisType: request.analysisType,
        maxTokens: 1500,
        temperature: 0.3 // Lower temperature for more consistent analysis
      });

      return this.parseAnalysisResponse(response);
    } catch (error) {
      throw new Error(`Failed to analyze project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Provide mentor assistance and guidance
   */
  async provideMentorAssistance(request: MentorAssistanceRequest): Promise<MentorAssistanceResponse> {
    try {
      const prompt = this.buildMentorAssistancePrompt(request);
      const response = await this.callGPTAPI('mentor-assistance', {
        prompt,
        projectId: request.projectId,
        assistanceType: request.assistanceType,
        maxTokens: 800,
        temperature: 0.6
      });

      return this.parseMentorAssistanceResponse(response);
    } catch (error) {
      throw new Error(`Failed to provide mentor assistance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate marketplace description for project
   */
  async generateMarketplaceDescription(project: ScrollProjectSpec): Promise<{
    title: string;
    description: string;
    tags: string[];
    features: string[];
    benefits: string[];
  }> {
    try {
      const prompt = this.buildMarketplacePrompt(project);
      const response = await this.callGPTAPI('generate-marketplace', {
        prompt,
        projectId: project.project_id,
        maxTokens: 600,
        temperature: 0.8 // Higher creativity for marketing content
      });

      return this.parseMarketplaceResponse(response);
    } catch (error) {
      throw new Error(`Failed to generate marketplace description: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate scroll alignment of project
   */
  async validateScrollAlignment(project: ScrollProjectSpec): Promise<{
    alignmentScore: number;
    kingdomImpact: number;
    spiritualRelevance: number;
    biblicalFoundation: number;
    recommendations: string[];
    scripturalReferences: string[];
  }> {
    try {
      const prompt = this.buildScrollAlignmentPrompt(project);
      const response = await this.callGPTAPI('validate-scroll-alignment', {
        prompt,
        projectId: project.project_id,
        maxTokens: 800,
        temperature: 0.4
      });

      return this.parseScrollAlignmentResponse(response);
    } catch (error) {
      throw new Error(`Failed to validate scroll alignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate learning resources for project improvement
   */
  async generateLearningResources(
    project: ScrollProjectSpec,
    skillGaps: string[]
  ): Promise<{
    courses: Array<{
      title: string;
      provider: string;
      url: string;
      duration: string;
      relevance: number;
    }>;
    articles: Array<{
      title: string;
      url: string;
      summary: string;
      readingTime: number;
    }>;
    tools: Array<{
      name: string;
      description: string;
      url: string;
      category: string;
    }>;
  }> {
    try {
      const prompt = this.buildLearningResourcesPrompt(project, skillGaps);
      const response = await this.callGPTAPI('generate-resources', {
        prompt,
        projectId: project.project_id,
        skillGaps,
        maxTokens: 1200,
        temperature: 0.5
      });

      return this.parseLearningResourcesResponse(response);
    } catch (error) {
      throw new Error(`Failed to generate learning resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Private methods for API communication
   */
  private async callGPTAPI(endpoint: string, payload: any): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.apiEndpoint}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Scroll-University': 'true'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`GPT API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to call GPT API after retries');
  }

  /**
   * Prompt building methods
   */
  private buildSummaryPrompt(request: GPTSummaryRequest): string {
    const { project, milestone } = request.context;
    
    let prompt = `As ScrollBuilderGPT, provide a comprehensive summary for this ScrollUniversity project:\n\n`;
    prompt += `Project: ${project.title}\n`;
    prompt += `Scroll Field: ${project.scroll_field}\n`;
    prompt += `Description: ${project.description}\n`;
    
    if (milestone) {
      prompt += `\nMilestone: ${milestone.title}\n`;
      prompt += `Stage: ${milestone.stage}\n`;
      prompt += `Completion: ${milestone.completion_percentage}%\n`;
    }

    switch (request.summaryType) {
      case 'milestone':
        prompt += `\nProvide a milestone completion summary focusing on progress, achievements, and next steps.`;
        break;
      case 'project_completion':
        prompt += `\nProvide a final project summary highlighting overall achievements, impact, and scroll alignment.`;
        break;
      case 'marketplace':
        prompt += `\nProvide a marketplace-ready summary that would attract potential users and showcase value.`;
        break;
      case 'mentor_review':
        prompt += `\nProvide a mentor review summary focusing on student growth, technical skills, and areas for improvement.`;
        break;
    }

    prompt += `\n\nEnsure the summary maintains ScrollUniversity's kingdom-focused perspective and spiritual alignment.`;
    
    return prompt;
  }

  private buildAnalysisPrompt(request: ProjectAnalysisRequest): string {
    const { project } = request;
    
    let prompt = `As ScrollBuilderGPT, analyze this ScrollUniversity project:\n\n`;
    prompt += `Project: ${project.title}\n`;
    prompt += `Scroll Field: ${project.scroll_field}\n`;
    prompt += `Description: ${project.description}\n`;
    prompt += `Status: ${project.status}\n`;
    
    if (project.milestones.length > 0) {
      prompt += `\nMilestones completed: ${project.milestones.filter(m => m.completed).length}/${project.milestones.length}\n`;
    }

    switch (request.analysisType) {
      case 'quality':
        prompt += `\nAnalyze the technical quality, code structure, and implementation excellence.`;
        break;
      case 'completeness':
        prompt += `\nAnalyze project completeness, milestone fulfillment, and deliverable quality.`;
        break;
      case 'market_potential':
        prompt += `\nAnalyze market potential, user value, and commercial viability.`;
        break;
      case 'scroll_alignment':
        prompt += `\nAnalyze alignment with ScrollUniversity's kingdom principles and spiritual mission.`;
        break;
    }

    if (request.includeRecommendations) {
      prompt += `\n\nProvide specific, actionable recommendations for improvement.`;
    }

    return prompt;
  }

  private buildMentorAssistancePrompt(request: MentorAssistanceRequest): string {
    let prompt = `As ScrollBuilderGPT providing mentor assistance:\n\n`;
    prompt += `Project ID: ${request.projectId}\n`;
    prompt += `Assistance Type: ${request.assistanceType}\n`;

    if (request.context.currentMilestone) {
      prompt += `Current Milestone: ${request.context.currentMilestone.title}\n`;
      prompt += `Milestone Stage: ${request.context.currentMilestone.stage}\n`;
    }

    if (request.context.studentQuestion) {
      prompt += `Student Question: ${request.context.studentQuestion}\n`;
    }

    if (request.context.specificArea) {
      prompt += `Focus Area: ${request.context.specificArea}\n`;
    }

    switch (request.assistanceType) {
      case 'feedback_generation':
        prompt += `\nGenerate constructive feedback that encourages growth while maintaining high standards.`;
        break;
      case 'guidance':
        prompt += `\nProvide step-by-step guidance to help the student progress effectively.`;
        break;
      case 'resource_recommendation':
        prompt += `\nRecommend specific learning resources, tools, and materials.`;
        break;
    }

    prompt += `\nMaintain ScrollUniversity's encouraging, kingdom-focused mentoring approach.`;

    return prompt;
  }

  private buildMarketplacePrompt(project: ScrollProjectSpec): string {
    let prompt = `Create compelling marketplace content for this ScrollUniversity project:\n\n`;
    prompt += `Project: ${project.title}\n`;
    prompt += `Scroll Field: ${project.scroll_field}\n`;
    prompt += `Description: ${project.description}\n`;
    
    if (project.metadata?.tags) {
      prompt += `Tags: ${project.metadata.tags.join(', ')}\n`;
    }

    prompt += `\nCreate marketplace content that:\n`;
    prompt += `- Highlights unique value and kingdom impact\n`;
    prompt += `- Appeals to ScrollUniversity community\n`;
    prompt += `- Emphasizes practical benefits\n`;
    prompt += `- Maintains professional yet spiritual tone\n`;

    return prompt;
  }

  private buildScrollAlignmentPrompt(project: ScrollProjectSpec): string {
    let prompt = `Evaluate the scroll alignment of this ScrollUniversity project:\n\n`;
    prompt += `Project: ${project.title}\n`;
    prompt += `Scroll Field: ${project.scroll_field}\n`;
    prompt += `Description: ${project.description}\n`;

    prompt += `\nEvaluate based on:\n`;
    prompt += `- Kingdom principles and biblical foundation\n`;
    prompt += `- Spiritual relevance and ministry potential\n`;
    prompt += `- Alignment with ScrollUniversity's mission\n`;
    prompt += `- Potential for advancing God's kingdom\n`;
    prompt += `- Integration of faith and learning\n`;

    prompt += `\nProvide scores (1-100) and specific recommendations for improvement.`;

    return prompt;
  }

  private buildLearningResourcesPrompt(project: ScrollProjectSpec, skillGaps: string[]): string {
    let prompt = `Generate learning resources for this ScrollUniversity project:\n\n`;
    prompt += `Project: ${project.title}\n`;
    prompt += `Scroll Field: ${project.scroll_field}\n`;
    prompt += `Skill Gaps: ${skillGaps.join(', ')}\n`;

    prompt += `\nRecommend resources that:\n`;
    prompt += `- Address specific skill gaps\n`;
    prompt += `- Align with ScrollUniversity's values\n`;
    prompt += `- Provide practical, applicable knowledge\n`;
    prompt += `- Include both technical and spiritual growth\n`;

    return prompt;
  }

  /**
   * Response parsing methods
   */
  private parseSummaryResponse(response: any): GPTSummaryResponse {
    return {
      summary: response.summary || '',
      keyPoints: response.keyPoints || [],
      recommendations: response.recommendations || [],
      scrollAlignment: response.scrollAlignment || {
        score: 0,
        strengths: [],
        improvements: []
      },
      technicalAssessment: response.technicalAssessment || {
        complexity: 'medium',
        innovation: 5,
        marketability: 5
      },
      generatedAt: new Date().toISOString()
    };
  }

  private parseAnalysisResponse(response: any): ProjectAnalysisResponse {
    return {
      overallScore: response.overallScore || 0,
      detailedScores: response.detailedScores || {
        technical: 0,
        creativity: 0,
        scrollAlignment: 0,
        marketPotential: 0,
        completeness: 0
      },
      strengths: response.strengths || [],
      weaknesses: response.weaknesses || [],
      recommendations: response.recommendations || [],
      nextSteps: response.nextSteps || []
    };
  }

  private parseMentorAssistanceResponse(response: any): MentorAssistanceResponse {
    return {
      assistanceType: response.assistanceType || '',
      content: response.content || '',
      resources: response.resources || [],
      followUpQuestions: response.followUpQuestions || [],
      estimatedTimeToComplete: response.estimatedTimeToComplete
    };
  }

  private parseMarketplaceResponse(response: any): any {
    return {
      title: response.title || '',
      description: response.description || '',
      tags: response.tags || [],
      features: response.features || [],
      benefits: response.benefits || []
    };
  }

  private parseScrollAlignmentResponse(response: any): any {
    return {
      alignmentScore: response.alignmentScore || 0,
      kingdomImpact: response.kingdomImpact || 0,
      spiritualRelevance: response.spiritualRelevance || 0,
      biblicalFoundation: response.biblicalFoundation || 0,
      recommendations: response.recommendations || [],
      scripturalReferences: response.scripturalReferences || []
    };
  }

  private parseLearningResourcesResponse(response: any): any {
    return {
      courses: response.courses || [],
      articles: response.articles || [],
      tools: response.tools || []
    };
  }
}