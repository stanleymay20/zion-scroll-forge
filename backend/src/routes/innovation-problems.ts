/**
 * ScrollProblem Identification API Routes
 * RESTful endpoints for problem database and assignment management
 */

import express, { Request, Response } from 'express';
import ScrollProblemIdentificationService from '../services/ScrollProblemIdentificationService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import { ProblemCategory, ProblemComplexity } from '../types/innovation.types';

const router = express.Router();
const problemService = new ScrollProblemIdentificationService();

// Get all problems
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const problems = await problemService.getAllProblems();
    
    res.json({
      success: true,
      data: problems
    });
  } catch (error) {
    logger.error('Error fetching all problems', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems'
    });
  }
});

// Get problem by ID
router.get('/:problemId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId } = req.params;
    const problem = await problemService.getProblemById(problemId);
    
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    logger.error('Error fetching problem', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problem'
    });
  }
});

// Get problems by category
router.get('/category/:category', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    
    if (!Object.values(ProblemCategory).includes(category as ProblemCategory)) {
      res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
      return;
    }
    
    const problems = await problemService.getProblemsByCategory(category as ProblemCategory);
    
    res.json({
      success: true,
      data: problems
    });
  } catch (error) {
    logger.error('Error fetching problems by category', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems'
    });
  }
});

// Create new problem
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const problemData = req.body;
    
    // Validate required fields
    if (!problemData.title || !problemData.description || !problemData.category) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, and category are required'
      });
      return;
    }
    
    const problem = await problemService.createProblem(problemData);
    
    res.status(201).json({
      success: true,
      data: problem
    });
  } catch (error) {
    logger.error('Error creating problem', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to create problem'
    });
  }
});

// Select problem for student
router.post('/select', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, criteria } = req.body;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }
    
    const problem = await problemService.selectProblemForStudent(userId, criteria || {});
    
    res.json({
      success: true,
      data: problem
    });
  } catch (error: any) {
    logger.error('Error selecting problem for student', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to select problem'
    });
  }
});

// Assign problem to student or team
router.post('/assign', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId, assigneeId, assigneeType, deadline } = req.body;
    
    if (!problemId || !assigneeId || !assigneeType || !deadline) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: problemId, assigneeId, assigneeType, and deadline are required'
      });
      return;
    }
    
    if (assigneeType !== 'student' && assigneeType !== 'team') {
      res.status(400).json({
        success: false,
        error: 'assigneeType must be either "student" or "team"'
      });
      return;
    }
    
    const assignment = await problemService.assignProblem(
      problemId,
      assigneeId,
      assigneeType,
      new Date(deadline)
    );
    
    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    logger.error('Error assigning problem', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to assign problem'
    });
  }
});

// Get problem analysis framework
router.get('/:problemId/analysis-framework', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemId } = req.params;
    const framework = await problemService.getProblemAnalysisFramework(problemId);
    
    res.json({
      success: true,
      data: framework
    });
  } catch (error: any) {
    logger.error('Error getting problem analysis framework', { error });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get analysis framework'
    });
  }
});

// Update assignment progress
router.put('/assignments/:assignmentId/progress', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId } = req.params;
    const { progress, notes } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100'
      });
      return;
    }
    
    await problemService.updateAssignmentProgress(assignmentId, progress, notes);
    
    res.json({
      success: true,
      message: 'Assignment progress updated successfully'
    });
  } catch (error) {
    logger.error('Error updating assignment progress', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment progress'
    });
  }
});

// Get student assignments
router.get('/assignments/student/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const assignments = await problemService.getStudentAssignments(userId);
    
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    logger.error('Error fetching student assignments', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
});

// Search problems by keywords
router.post('/search', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { keywords } = req.body;
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Keywords array is required'
      });
      return;
    }
    
    const problems = await problemService.searchProblems(keywords);
    
    res.json({
      success: true,
      data: problems
    });
  } catch (error) {
    logger.error('Error searching problems', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to search problems'
    });
  }
});

export default router;
