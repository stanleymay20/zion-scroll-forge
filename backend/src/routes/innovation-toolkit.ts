/**
 * ScrollGPT Toolkit API Routes
 * RESTful endpoints for GPT integration and collaborative AI
 */

import express, { Request, Response } from 'express';
import ScrollGPTToolkitService from '../services/ScrollGPTToolkitService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import { GPTModel, ToolkitFeature } from '../types/innovation.types';

const router = express.Router();
const toolkitService = new ScrollGPTToolkitService();

// Create new toolkit
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, projectId, features } = req.body;
    
    if (!userId || !projectId) {
      res.status(400).json({
        success: false,
        error: 'User ID and project ID are required'
      });
      return;
    }
    
    const toolkit = await toolkitService.createToolkit(userId, projectId, features || []);
    
    res.status(201).json({
      success: true,
      data: toolkit
    });
  } catch (error) {
    logger.error('Error creating toolkit', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create toolkit'
    });
  }
});

// Get toolkit by ID
router.get('/:toolkitId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolkitId } = req.params;
    const toolkit = await toolkitService.getToolkitById(toolkitId);
    
    if (!toolkit) {
      res.status(404).json({
        success: false,
        error: 'Toolkit not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: toolkit
    });
  } catch (error) {
    logger.error('Error fetching toolkit', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch toolkit'
    });
  }
});

// Get toolkit for project
router.get('/project/:projectId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const toolkit = await toolkitService.getToolkitForProject(projectId);
    
    if (!toolkit) {
      res.status(404).json({
        success: false,
        error: 'Toolkit not found for this project'
      });
      return;
    }
    
    res.json({
      success: true,
      data: toolkit
    });
  } catch (error) {
    logger.error('Error fetching toolkit for project', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch toolkit'
    });
  }
});

// Send prompt to GPT
router.post('/:toolkitId/prompt', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolkitId } = req.params;
    const { prompt, context } = req.body;
    
    if (!prompt) {
      res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
      return;
    }
    
    const conversation = await toolkitService.sendPrompt(toolkitId, prompt, context);
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    logger.error('Error sending prompt', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send prompt'
    });
  }
});

// Switch GPT model
router.put('/:toolkitId/model', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolkitId } = req.params;
    const { model } = req.body;
    
    if (!model || !Object.values(GPTModel).includes(model)) {
      res.status(400).json({
        success: false,
        error: 'Valid model is required'
      });
      return;
    }
    
    await toolkitService.switchModel(toolkitId, model);
    
    res.json({
      success: true,
      message: 'Model switched successfully'
    });
  } catch (error) {
    logger.error('Error switching model', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to switch model'
    });
  }
});

// Analyze data
router.post('/:toolkitId/analyze', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolkitId } = req.params;
    const { data, analysisType } = req.body;
    
    if (!data || !analysisType) {
      res.status(400).json({
        success: false,
        error: 'Data and analysis type are required'
      });
      return;
    }
    
    const analysis = await toolkitService.analyzeData(toolkitId, data, analysisType);
    
    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error: any) {
    logger.error('Error analyzing data', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze data'
    });
  }
});

// Get research assistance
router.post('/:toolkitId/research', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolkitId } = req.params;
    const { topic, researchQuestions } = req.body;
    
    if (!topic || !researchQuestions || !Array.isArray(researchQuestions)) {
      res.status(400).json({
        success: false,
        error: 'Topic and research questions array are required'
      });
      return;
    }
    
    const resources = await toolkitService.getResearchAssistance(toolkitId, topic, researchQuestions);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error: any) {
    logger.error('Error getting research assistance', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get research assistance'
    });
  }
});

// Start design thinking session
router.post('/design-thinking/start', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, participants } = req.body;
    
    if (!projectId || !participants || !Array.isArray(participants)) {
      res.status(400).json({
        success: false,
        error: 'Project ID and participants array are required'
      });
      return;
    }
    
    const session = await toolkitService.startDesignThinkingSession(projectId, participants);
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    logger.error('Error starting design thinking session', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start session'
    });
  }
});

// Advance design thinking phase
router.post('/design-thinking/:sessionId/advance', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { insights } = req.body;
    
    if (!insights || !Array.isArray(insights)) {
      res.status(400).json({
        success: false,
        error: 'Insights array is required'
      });
      return;
    }
    
    const nextPhase = await toolkitService.advanceDesignThinkingPhase(sessionId, insights);
    
    res.json({
      success: true,
      data: { nextPhase }
    });
  } catch (error: any) {
    logger.error('Error advancing design thinking phase', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to advance phase'
    });
  }
});

// Create collaborative AI session
router.post('/collaborative/start', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, teamId, purpose } = req.body;
    
    if (!projectId || !teamId || !purpose) {
      res.status(400).json({
        success: false,
        error: 'Project ID, team ID, and purpose are required'
      });
      return;
    }
    
    const session = await toolkitService.createCollaborativeSession(projectId, teamId, purpose);
    
    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    logger.error('Error creating collaborative session', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session'
    });
  }
});

// Add AI contribution to collaborative session
router.post('/collaborative/:sessionId/contribute', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { model, contributionType, content } = req.body;
    
    if (!model || !contributionType || !content) {
      res.status(400).json({
        success: false,
        error: 'Model, contribution type, and content are required'
      });
      return;
    }
    
    const contribution = await toolkitService.addAIContribution(sessionId, model, contributionType, content);
    
    res.json({
      success: true,
      data: contribution
    });
  } catch (error: any) {
    logger.error('Error adding AI contribution', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add contribution'
    });
  }
});

// Enable collaboration mode
router.put('/:toolkitId/collaboration', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { toolkitId } = req.params;
    const { teamMembers } = req.body;
    
    if (!teamMembers || !Array.isArray(teamMembers)) {
      res.status(400).json({
        success: false,
        error: 'Team members array is required'
      });
      return;
    }
    
    await toolkitService.enableCollaboration(toolkitId, teamMembers);
    
    res.json({
      success: true,
      message: 'Collaboration mode enabled'
    });
  } catch (error: any) {
    logger.error('Error enabling collaboration', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enable collaboration'
    });
  }
});

export default router;
