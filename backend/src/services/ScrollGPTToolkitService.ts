/**
 * ScrollGPT Toolkit Service
 * Integrates GPT-4o, ScrollMentorGPT, and LabGPT for guided design thinking
 * 
 * Requirements: 2.2, 6.1, 6.5
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import AIGatewayService from './AIGatewayService';
import {
  ScrollGPTToolkit,
  GPTModel,
  ToolkitFeature,
  ToolkitConversation,
  DataAnalysisTool,
  ResearchResource,
  DesignThinkingSession,
  DesignThinkingPhase,
  CollaborativeAISession,
  AIContribution
} from '../types/innovation.types';

const prisma = new PrismaClient();

export default class ScrollGPTToolkitService {
  private aiGateway: AIGatewayService;

  constructor() {
    this.aiGateway = new AIGatewayService();
  }

  /**
   * Create a new toolkit instance for a user and project
   */
  async createToolkit(
    userId: string,
    projectId: string,
    features: ToolkitFeature[]
  ): Promise<ScrollGPTToolkit> {
    try {
      logger.info('Creating ScrollGPT Toolkit', { userId, projectId });

      const toolkit = await prisma.scrollGPTToolkit.create({
        data: {
          userId,
          projectId,
          availableModels: [GPTModel.GPT4O, GPTModel.SCROLL_MENTOR_GPT, GPTModel.LAB_GPT],
          activeModel: GPTModel.GPT4O,
          features: features,
          conversationHistory: JSON.stringify([]),
          dataAnalysisTools: JSON.stringify(this.getDefaultDataAnalysisTools()),
          researchResources: JSON.stringify([]),
          collaborationMode: false,
          teamMembers: []
        }
      });

      logger.info('Toolkit created successfully', { toolkitId: toolkit.id });

      return this.mapToolkitFromDb(toolkit);
    } catch (error) {
      logger.error('Error creating toolkit', { error, userId, projectId });
      throw new Error('Failed to create toolkit');
    }
  }

  /**
   * Get toolkit by ID
   */
  async getToolkitById(toolkitId: string): Promise<ScrollGPTToolkit | null> {
    try {
      const toolkit = await prisma.scrollGPTToolkit.findUnique({
        where: { id: toolkitId }
      });

      if (!toolkit) return null;

      return this.mapToolkitFromDb(toolkit);
    } catch (error) {
      logger.error('Error fetching toolkit', { error, toolkitId });
      throw new Error('Failed to fetch toolkit');
    }
  }

  /**
   * Get toolkit for a project
   */
  async getToolkitForProject(projectId: string): Promise<ScrollGPTToolkit | null> {
    try {
      const toolkit = await prisma.scrollGPTToolkit.findFirst({
        where: { projectId }
      });

      if (!toolkit) return null;

      return this.mapToolkitFromDb(toolkit);
    } catch (error) {
      logger.error('Error fetching toolkit for project', { error, projectId });
      throw new Error('Failed to fetch toolkit');
    }
  }

  /**
   * Send a prompt to the active GPT model
   */
  async sendPrompt(
    toolkitId: string,
    prompt: string,
    context?: string
  ): Promise<ToolkitConversation> {
    try {
      logger.info('Sending prompt to GPT', { toolkitId, promptLength: prompt.length });

      const toolkit = await this.getToolkitById(toolkitId);
      if (!toolkit) {
        throw new Error('Toolkit not found');
      }

      // Get AI response based on active model
      const response = await this.getAIResponse(toolkit.activeModel, prompt, context);

      // Create conversation record
      const conversation: ToolkitConversation = {
        id: this.generateId(),
        model: toolkit.activeModel,
        prompt,
        response,
        context: context || '',
        timestamp: new Date(),
        helpful: false,
        savedForReference: false
      };

      // Update conversation history
      await this.addConversationToHistory(toolkitId, conversation);

      logger.info('Prompt processed successfully', { toolkitId, conversationId: conversation.id });

      return conversation;
    } catch (error) {
      logger.error('Error sending prompt', { error, toolkitId });
      throw new Error('Failed to send prompt');
    }
  }

  /**
   * Switch active GPT model
   */
  async switchModel(toolkitId: string, model: GPTModel): Promise<void> {
    try {
      logger.info('Switching GPT model', { toolkitId, model });

      await prisma.scrollGPTToolkit.update({
        where: { id: toolkitId },
        data: {
          activeModel: model,
          updatedAt: new Date()
        }
      });

      logger.info('Model switched successfully', { toolkitId, model });
    } catch (error) {
      logger.error('Error switching model', { error, toolkitId, model });
      throw new Error('Failed to switch model');
    }
  }

  /**
   * Perform data analysis using AI
   */
  async analyzeData(
    toolkitId: string,
    data: any,
    analysisType: string
  ): Promise<string> {
    try {
      logger.info('Performing data analysis', { toolkitId, analysisType });

      const toolkit = await this.getToolkitById(toolkitId);
      if (!toolkit) {
        throw new Error('Toolkit not found');
      }

      // Prepare analysis prompt
      const prompt = this.buildDataAnalysisPrompt(data, analysisType);

      // Get AI analysis
      const analysis = await this.getAIResponse(GPTModel.LAB_GPT, prompt);

      logger.info('Data analysis completed', { toolkitId, analysisType });

      return analysis;
    } catch (error) {
      logger.error('Error analyzing data', { error, toolkitId, analysisType });
      throw new Error('Failed to analyze data');
    }
  }

  /**
   * Get research assistance
   */
  async getResearchAssistance(
    toolkitId: string,
    topic: string,
    researchQuestions: string[]
  ): Promise<ResearchResource[]> {
    try {
      logger.info('Getting research assistance', { toolkitId, topic });

      const toolkit = await this.getToolkitById(toolkitId);
      if (!toolkit) {
        throw new Error('Toolkit not found');
      }

      // Build research prompt
      const prompt = `Research topic: ${topic}\n\nResearch questions:\n${researchQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nProvide relevant research resources, papers, datasets, and APIs that would help answer these questions.`;

      // Get AI recommendations
      const response = await this.getAIResponse(GPTModel.SCROLL_MENTOR_GPT, prompt);

      // Parse response into research resources
      const resources = this.parseResearchResources(response);

      // Store resources in toolkit
      await this.addResearchResources(toolkitId, resources);

      logger.info('Research assistance provided', { toolkitId, resourceCount: resources.length });

      return resources;
    } catch (error) {
      logger.error('Error getting research assistance', { error, toolkitId, topic });
      throw new Error('Failed to get research assistance');
    }
  }

  /**
   * Start a design thinking session
   */
  async startDesignThinkingSession(
    projectId: string,
    participants: string[]
  ): Promise<DesignThinkingSession> {
    try {
      logger.info('Starting design thinking session', { projectId, participantCount: participants.length });

      const session = await prisma.designThinkingSession.create({
        data: {
          projectId,
          phase: DesignThinkingPhase.EMPATHIZE,
          facilitator: GPTModel.SCROLL_MENTOR_GPT,
          participants,
          insights: JSON.stringify([]),
          ideas: JSON.stringify([]),
          prototypes: JSON.stringify([]),
          feedback: JSON.stringify([]),
          startedAt: new Date()
        }
      });

      logger.info('Design thinking session started', { sessionId: session.id });

      return {
        id: session.id,
        projectId: session.projectId,
        phase: session.phase as DesignThinkingPhase,
        facilitator: session.facilitator as GPTModel,
        participants: session.participants,
        insights: this.parseJson(session.insights, []),
        ideas: this.parseJson(session.ideas, []),
        prototypes: this.parseJson(session.prototypes, []),
        feedback: this.parseJson(session.feedback, []),
        startedAt: session.startedAt,
        completedAt: session.completedAt || undefined
      };
    } catch (error) {
      logger.error('Error starting design thinking session', { error, projectId });
      throw new Error('Failed to start design thinking session');
    }
  }

  /**
   * Advance design thinking session to next phase
   */
  async advanceDesignThinkingPhase(
    sessionId: string,
    insights: string[]
  ): Promise<DesignThinkingPhase> {
    try {
      logger.info('Advancing design thinking phase', { sessionId });

      const session = await prisma.designThinkingSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const currentPhase = session.phase as DesignThinkingPhase;
      const nextPhase = this.getNextPhase(currentPhase);

      await prisma.designThinkingSession.update({
        where: { id: sessionId },
        data: {
          phase: nextPhase,
          insights: JSON.stringify([...this.parseJson(session.insights, []), ...insights])
        }
      });

      logger.info('Design thinking phase advanced', { sessionId, nextPhase });

      return nextPhase;
    } catch (error) {
      logger.error('Error advancing design thinking phase', { error, sessionId });
      throw new Error('Failed to advance phase');
    }
  }

  /**
   * Create collaborative AI session for team innovation
   */
  async createCollaborativeSession(
    projectId: string,
    teamId: string,
    purpose: string
  ): Promise<CollaborativeAISession> {
    try {
      logger.info('Creating collaborative AI session', { projectId, teamId });

      const session = await prisma.collaborativeAISession.create({
        data: {
          projectId,
          teamId,
          models: [GPTModel.GPT4O, GPTModel.SCROLL_MENTOR_GPT, GPTModel.LAB_GPT],
          purpose,
          sharedContext: '',
          contributions: JSON.stringify([]),
          synthesis: ''
        }
      });

      logger.info('Collaborative session created', { sessionId: session.id });

      return {
        id: session.id,
        projectId: session.projectId,
        teamId: session.teamId,
        models: session.models as GPTModel[],
        purpose: session.purpose,
        sharedContext: session.sharedContext,
        contributions: this.parseJson(session.contributions, []),
        synthesis: session.synthesis,
        createdAt: session.createdAt
      };
    } catch (error) {
      logger.error('Error creating collaborative session', { error, projectId, teamId });
      throw new Error('Failed to create collaborative session');
    }
  }

  /**
   * Add AI contribution to collaborative session
   */
  async addAIContribution(
    sessionId: string,
    model: GPTModel,
    contributionType: string,
    content: string
  ): Promise<AIContribution> {
    try {
      logger.info('Adding AI contribution', { sessionId, model, contributionType });

      const session = await prisma.collaborativeAISession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const contribution: AIContribution = {
        model,
        contributionType,
        content,
        timestamp: new Date(),
        votes: 0
      };

      const contributions = this.parseJson(session.contributions, []);
      contributions.push(contribution);

      await prisma.collaborativeAISession.update({
        where: { id: sessionId },
        data: {
          contributions: JSON.stringify(contributions)
        }
      });

      logger.info('AI contribution added', { sessionId, model });

      return contribution;
    } catch (error) {
      logger.error('Error adding AI contribution', { error, sessionId });
      throw new Error('Failed to add contribution');
    }
  }

  /**
   * Enable collaboration mode for toolkit
   */
  async enableCollaboration(toolkitId: string, teamMembers: string[]): Promise<void> {
    try {
      logger.info('Enabling collaboration mode', { toolkitId, memberCount: teamMembers.length });

      await prisma.scrollGPTToolkit.update({
        where: { id: toolkitId },
        data: {
          collaborationMode: true,
          teamMembers,
          updatedAt: new Date()
        }
      });

      logger.info('Collaboration mode enabled', { toolkitId });
    } catch (error) {
      logger.error('Error enabling collaboration', { error, toolkitId });
      throw new Error('Failed to enable collaboration');
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async getAIResponse(model: GPTModel, prompt: string, context?: string): Promise<string> {
    try {
      // Map our model enum to AI Gateway model names
      const modelMap: { [key in GPTModel]: string } = {
        [GPTModel.GPT4O]: 'gpt-4o',
        [GPTModel.SCROLL_MENTOR_GPT]: 'gpt-4o', // Use GPT-4o for mentor
        [GPTModel.LAB_GPT]: 'gpt-4o', // Use GPT-4o for lab
        [GPTModel.CLAUDE_3]: 'claude-3-opus-20240229',
        [GPTModel.GEMINI_PRO]: 'gemini-pro'
      };

      const systemPrompt = this.getSystemPrompt(model);
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;

      const response = await this.aiGateway.generateText(
        fullPrompt,
        {
          model: modelMap[model],
          systemPrompt,
          temperature: 0.7,
          maxTokens: 2000
        }
      );

      return response;
    } catch (error) {
      logger.error('Error getting AI response', { error, model });
      throw new Error('Failed to get AI response');
    }
  }

  private getSystemPrompt(model: GPTModel): string {
    const prompts: { [key in GPTModel]: string } = {
      [GPTModel.GPT4O]: 'You are a helpful AI assistant for ScrollUniversity innovation projects. Provide clear, actionable guidance.',
      [GPTModel.SCROLL_MENTOR_GPT]: 'You are ScrollMentorGPT, a wise mentor who combines technical expertise with spiritual wisdom. Guide students through innovation challenges with both practical and prophetic insight.',
      [GPTModel.LAB_GPT]: 'You are LabGPT, a specialized AI for data analysis and research. Provide rigorous, evidence-based analysis and recommendations.',
      [GPTModel.CLAUDE_3]: 'You are a thoughtful AI assistant focused on ethical reasoning and comprehensive analysis.',
      [GPTModel.GEMINI_PRO]: 'You are an advanced AI assistant with multimodal capabilities for complex problem-solving.'
    };

    return prompts[model];
  }

  private buildDataAnalysisPrompt(data: any, analysisType: string): string {
    return `Perform ${analysisType} analysis on the following data:\n\n${JSON.stringify(data, null, 2)}\n\nProvide insights, patterns, and recommendations based on the analysis.`;
  }

  private parseResearchResources(response: string): ResearchResource[] {
    // Simple parsing - in production, this would be more sophisticated
    const resources: ResearchResource[] = [];
    
    // Extract URLs and titles from response
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = response.match(urlRegex) || [];
    
    urls.forEach((url, index) => {
      resources.push({
        id: this.generateId(),
        title: `Research Resource ${index + 1}`,
        type: 'article',
        url,
        summary: 'AI-recommended resource',
        relevance: 0.8,
        addedAt: new Date()
      });
    });

    return resources;
  }

  private async addConversationToHistory(
    toolkitId: string,
    conversation: ToolkitConversation
  ): Promise<void> {
    const toolkit = await prisma.scrollGPTToolkit.findUnique({
      where: { id: toolkitId }
    });

    if (!toolkit) return;

    const history = this.parseJson(toolkit.conversationHistory, []);
    history.push(conversation);

    await prisma.scrollGPTToolkit.update({
      where: { id: toolkitId },
      data: {
        conversationHistory: JSON.stringify(history),
        updatedAt: new Date()
      }
    });
  }

  private async addResearchResources(
    toolkitId: string,
    resources: ResearchResource[]
  ): Promise<void> {
    const toolkit = await prisma.scrollGPTToolkit.findUnique({
      where: { id: toolkitId }
    });

    if (!toolkit) return;

    const existing = this.parseJson(toolkit.researchResources, []);
    const updated = [...existing, ...resources];

    await prisma.scrollGPTToolkit.update({
      where: { id: toolkitId },
      data: {
        researchResources: JSON.stringify(updated),
        updatedAt: new Date()
      }
    });
  }

  private getDefaultDataAnalysisTools(): DataAnalysisTool[] {
    return [
      {
        name: 'Statistical Analysis',
        type: 'statistical',
        description: 'Perform statistical analysis including mean, median, standard deviation, correlation',
        capabilities: ['descriptive statistics', 'hypothesis testing', 'regression analysis'],
        dataFormats: ['csv', 'json', 'excel']
      },
      {
        name: 'Data Visualization',
        type: 'visualization',
        description: 'Create charts, graphs, and visual representations of data',
        capabilities: ['bar charts', 'line graphs', 'scatter plots', 'heatmaps'],
        dataFormats: ['csv', 'json']
      },
      {
        name: 'Machine Learning',
        type: 'ml',
        description: 'Apply machine learning algorithms for prediction and classification',
        capabilities: ['classification', 'regression', 'clustering', 'anomaly detection'],
        dataFormats: ['csv', 'json']
      },
      {
        name: 'Natural Language Processing',
        type: 'nlp',
        description: 'Analyze text data for sentiment, topics, and patterns',
        capabilities: ['sentiment analysis', 'topic modeling', 'entity extraction'],
        dataFormats: ['text', 'json']
      }
    ];
  }

  private getNextPhase(currentPhase: DesignThinkingPhase): DesignThinkingPhase {
    const phases = [
      DesignThinkingPhase.EMPATHIZE,
      DesignThinkingPhase.DEFINE,
      DesignThinkingPhase.IDEATE,
      DesignThinkingPhase.PROTOTYPE,
      DesignThinkingPhase.TEST
    ];

    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;

    return phases[nextIndex];
  }

  private mapToolkitFromDb(dbToolkit: any): ScrollGPTToolkit {
    return {
      id: dbToolkit.id,
      userId: dbToolkit.userId,
      projectId: dbToolkit.projectId,
      availableModels: dbToolkit.availableModels as GPTModel[],
      activeModel: dbToolkit.activeModel as GPTModel,
      features: dbToolkit.features as ToolkitFeature[],
      conversationHistory: this.parseJson(dbToolkit.conversationHistory, []),
      dataAnalysisTools: this.parseJson(dbToolkit.dataAnalysisTools, []),
      researchResources: this.parseJson(dbToolkit.researchResources, []),
      collaborationMode: dbToolkit.collaborationMode,
      teamMembers: dbToolkit.teamMembers,
      createdAt: dbToolkit.createdAt,
      updatedAt: dbToolkit.updatedAt
    };
  }

  private parseJson(jsonString: any, defaultValue: any): any {
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString);
      } catch {
        return defaultValue;
      }
    }
    return jsonString || defaultValue;
  }

  private generateId(): string {
    return `toolkit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
