/**
 * Learning Outcomes API Routes
 * "Let every course contribute to the complete formation of the student"
 * 
 * Provides REST API endpoints for learning outcome management,
 * coverage analysis, and accreditation reporting.
 * 
 * Requirements: 4.1, 4.3, 4.5
 */

import express, { Request, Response } from 'express';
import LearningOutcomeService from '../services/LearningOutcomeService';
import OutcomeAssessmentService from '../services/OutcomeAssessmentService';
import { authenticate as auth } from '../middleware/auth';

const router = express.Router();
const outcomeService = new LearningOutcomeService();
const assessmentService = new OutcomeAssessmentService();

// ============================================================================
// Outcome Definition Routes
// ============================================================================

/**
 * Create a new learning outcome
 * POST /api/learning-outcomes
 * Requirement 4.1: WHEN mapping outcomes THEN the system SHALL link courses to program learning outcomes
 */
router.post('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const outcome = await outcomeService.createOutcome(req.body);
    
    res.status(201).json({
      success: true,
      data: outcome
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get learning outcome by ID
 * GET /api/learning-outcomes/:outcomeId
 */
router.get('/:outcomeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const outcome = await outcomeService.getOutcomeById(outcomeId);
    
    if (!outcome) {
      res.status(404).json({
        success: false,
        error: 'Learning outcome not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: outcome
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update learning outcome
 * PUT /api/learning-outcomes/:outcomeId
 */
router.put('/:outcomeId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const outcome = await outcomeService.updateOutcome(outcomeId, req.body);
    
    res.json({
      success: true,
      data: outcome
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all outcomes for a program
 * GET /api/learning-outcomes/program/:programId
 */
router.get('/program/:programId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const outcomes = await outcomeService.getProgramOutcomes(programId);
    
    res.json({
      success: true,
      data: outcomes
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all outcomes for a course
 * GET /api/learning-outcomes/course/:courseId
 */
router.get('/course/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const outcomes = await outcomeService.getCourseOutcomes(courseId);
    
    res.json({
      success: true,
      data: outcomes
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Outcome Mapping Routes
// ============================================================================

/**
 * Create outcome mapping
 * POST /api/learning-outcomes/mappings
 * Requirement 4.1: Link courses to program learning outcomes
 */
router.post('/mappings', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const mapping = await outcomeService.createOutcomeMapping(req.body);
    
    res.status(201).json({
      success: true,
      data: mapping
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get outcome mappings for a program
 * GET /api/learning-outcomes/mappings/program/:programId
 */
router.get('/mappings/program/:programId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const mappings = await outcomeService.getProgramOutcomeMappings(programId);
    
    res.json({
      success: true,
      data: mappings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get outcome mappings for a course
 * GET /api/learning-outcomes/mappings/course/:courseId
 */
router.get('/mappings/course/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const mappings = await outcomeService.getCourseOutcomeMappings(courseId);
    
    res.json({
      success: true,
      data: mappings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get course coverage summary
 * GET /api/learning-outcomes/coverage/course/:courseId
 */
router.get('/coverage/course/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const summary = await outcomeService.getCourseCoverageSummary(courseId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Coverage Analysis Routes
// ============================================================================

/**
 * Analyze program outcome coverage
 * GET /api/learning-outcomes/coverage/program/:programId
 * Requirement 4.3: WHEN designing programs THEN the system SHALL ensure all outcomes are addressed
 */
router.get('/coverage/program/:programId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const analysis = await outcomeService.analyzeProgramOutcomeCoverage(programId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Validate program outcome coverage
 * GET /api/learning-outcomes/coverage/program/:programId/validate
 * Requirement 4.3: Ensure all outcomes are addressed
 */
router.get('/coverage/program/:programId/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const validation = await outcomeService.validateProgramOutcomeCoverage(programId);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get program outcome tracking
 * GET /api/learning-outcomes/tracking/program/:programId
 */
router.get('/tracking/program/:programId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const tracking = await outcomeService.getProgramOutcomeTracking(programId);
    
    res.json({
      success: true,
      data: tracking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Assessment and Achievement Routes
// ============================================================================

/**
 * Record outcome achievement
 * POST /api/learning-outcomes/achievements
 */
router.post('/achievements', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, outcomeId, courseId, assessmentScore, evidence } = req.body;
    
    const achievement = await assessmentService.recordOutcomeAchievement(
      studentId,
      outcomeId,
      courseId,
      assessmentScore,
      evidence
    );
    
    res.status(201).json({
      success: true,
      data: achievement
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get outcome achievement rate
 * GET /api/learning-outcomes/achievements/:outcomeId/rate
 */
router.get('/achievements/:outcomeId/rate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { outcomeId } = req.params;
    const { startDate, endDate } = req.query;
    
    const rate = await assessmentService.calculateOutcomeAchievementRate(
      outcomeId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({
      success: true,
      data: rate
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get program achievement rates
 * GET /api/learning-outcomes/achievements/program/:programId/rates
 */
router.get('/achievements/program/:programId/rates', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    const { startDate, endDate } = req.query;
    
    const rates = await assessmentService.calculateProgramAchievementRates(
      programId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get student outcome achievements
 * GET /api/learning-outcomes/achievements/student/:studentId/program/:programId
 */
router.get('/achievements/student/:studentId/program/:programId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, programId } = req.params;
    
    const achievements = await assessmentService.getStudentOutcomeAchievements(
      studentId,
      programId
    );
    
    res.json({
      success: true,
      data: achievements
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Reporting Routes
// ============================================================================

/**
 * Generate accreditation report
 * POST /api/learning-outcomes/reports/accreditation
 * Requirement 4.5: WHEN accrediting programs THEN the system SHALL generate outcome mapping reports
 */
router.post('/reports/accreditation', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId, startDate, endDate } = req.body;
    
    const report = await assessmentService.generateAccreditationReport(
      programId,
      new Date(startDate),
      new Date(endDate)
    );
    
    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Export accreditation report
 * POST /api/learning-outcomes/reports/accreditation/export
 * Requirement 4.5: Generate outcome mapping reports
 */
router.post('/reports/accreditation/export', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { report, format } = req.body;
    
    const exportPath = await assessmentService.exportAccreditationReport(
      report,
      format
    );
    
    res.json({
      success: true,
      data: {
        exportPath,
        format
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate outcome mapping visualization
 * GET /api/learning-outcomes/visualization/program/:programId
 * Requirement 4.5: Add outcome mapping visualization
 */
router.get('/visualization/program/:programId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId } = req.params;
    
    const visualization = await assessmentService.generateOutcomeMappingVisualization(programId);
    
    res.json({
      success: true,
      data: visualization
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
