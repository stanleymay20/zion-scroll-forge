/**
 * Critical Thinking API Routes
 * RESTful endpoints for ScrollCritical Thinking & Innovation Engine
 */

import express, { Request, Response } from 'express';
import CriticalThinkingService from '../services/CriticalThinkingService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const criticalThinkingService = new CriticalThinkingService();

// Get user's critical thinking profile
router.get('/profile/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const profile = await criticalThinkingService.getCriticalThinkingProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error('Error fetching critical thinking profile', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Get challenge by ID
router.get('/challenges/:challengeId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId } = req.params;
    const challenge = await criticalThinkingService.getChallengeById(challengeId);
    
    if (!challenge) {
      res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    logger.error('Error fetching challenge', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenge'
    });
  }
});

// Generate new challenge
router.post('/challenges/generate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, topic } = req.body;
    
    if (!level || !topic) {
      res.status(400).json({
        success: false,
        error: 'Level and topic are required'
      });
      return;
    }
    
    const challenge = await criticalThinkingService.generateChallenge(level, topic);
    
    res.json({
      success: true,
      data: challenge
    });
  } catch (error) {
    logger.error('Error generating challenge', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate challenge'
    });
  }
});

// Submit reasoning for evaluation
router.post('/evaluate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const submission = req.body;
    
    if (!submission.userId || !submission.challengeId || !submission.argument) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, challengeId, and argument are required'
      });
      return;
    }
    
    const assessment = await criticalThinkingService.evaluateReasoning(submission);
    
    res.json({
      success: true,
      data: assessment
    });
  } catch (error: any) {
    logger.error('Error evaluating reasoning', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate reasoning'
    });
  }
});

// Perform prophetic assessment
router.post('/prophetic-assessment', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, context } = req.body;
    
    if (!content || !context) {
      res.status(400).json({
        success: false,
        error: 'Content and context are required'
      });
      return;
    }
    
    const score = await criticalThinkingService.assessPropheticAlignment(content, context);
    
    res.json({
      success: true,
      data: score
    });
  } catch (error: any) {
    logger.error('Error performing prophetic assessment', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform assessment'
    });
  }
});

// Track discernment activity
router.post('/discernment', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, activity } = req.body;
    
    if (!userId || !activity) {
      res.status(400).json({
        success: false,
        error: 'User ID and activity are required'
      });
      return;
    }
    
    await criticalThinkingService.trackDiscernment(userId, activity);
    
    res.json({
      success: true,
      message: 'Discernment activity tracked successfully'
    });
  } catch (error) {
    logger.error('Error tracking discernment', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to track discernment'
    });
  }
});

// Get active challenges for user
router.get('/challenges/active/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const challenges = await criticalThinkingService.getActiveChallenges(userId);
    
    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    logger.error('Error fetching active challenges', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges'
    });
  }
});

// Update user profile
router.put('/profile/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { activity } = req.body;
    
    await criticalThinkingService.updateProfile(userId, activity);
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Error updating profile', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

export default router;
