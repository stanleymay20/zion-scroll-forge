/**
 * Prerequisite Management API Routes
 * "Let knowledge build upon knowledge, wisdom upon wisdom"
 * 
 * Provides REST API endpoints for managing course prerequisites,
 * validating enrollment eligibility, and handling override requests.
 * 
 * Requirements: 3.1, 3.2, 3.5
 */

import express, { Request, Response } from 'express';
import PrerequisiteManagementService from '../services/PrerequisiteManagementService';
import PrerequisiteOverrideService from '../services/PrerequisiteOverrideService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/productionLogger';

const router = express.Router();
const prerequisiteService = new PrerequisiteManagementService();
const overrideService = new PrerequisiteOverrideService();

// ============================================================================
// Prerequisite Definition Routes
// ============================================================================

/**
 * Create a new prerequisite definition
 * POST /api/prerequisites
 * Requirement 3.1: WHEN defining prerequisites THEN the system SHALL support multiple prerequisite types and logic
 */
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const prerequisite = await prerequisiteService.createPrerequisite(req.body);
    res.status(201).json({
      success: true,
      data: prerequisite
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Create prerequisite error:', error);
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Get prerequisite definition for a course
 * GET /api/prerequisites/:courseId
 */
router.get('/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const prerequisite = await prerequisiteService.getPrerequisite(courseId);
    
    if (!prerequisite) {
      res.status(404).json({
        success: false,
        error: 'No prerequisites found for this course'
      });
      return;
    }

    res.json({
      success: true,
      data: prerequisite
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update prerequisite definition
 * PUT /api/prerequisites/:courseId
 */
router.put('/:courseId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const prerequisite = await prerequisiteService.updatePrerequisite(courseId, req.body);
    
    res.json({
      success: true,
      data: prerequisite
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get prerequisite chain for a course
 * GET /api/prerequisites/:courseId/chain
 */
router.get('/:courseId/chain', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const chain = await prerequisiteService.getPrerequisiteChain(courseId);
    
    res.json({
      success: true,
      data: {
        courseId,
        prerequisiteChain: chain
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Validation Routes
// ============================================================================

/**
 * Validate prerequisites for enrollment
 * POST /api/prerequisites/validate
 * Requirement 3.2: WHEN students enroll THEN the system SHALL enforce prerequisite requirements
 */
router.post('/validate', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = await prerequisiteService.validatePrerequisites(req.body);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Build dependency graph for all courses
 * GET /api/prerequisites/dependency-graph
 */
router.get('/dependency-graph', async (req: Request, res: Response): Promise<void> => {
  try {
    const graph = await prerequisiteService.buildDependencyGraph();
    
    res.json({
      success: true,
      data: {
        nodes: Array.from(graph.nodes.values()),
        edges: Array.from(graph.edges.entries()).map(([key, value]) => ({
          courseId: key,
          prerequisites: value
        })),
        hasCycle: graph.hasCycle,
        cycles: graph.cycles
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Detect circular dependencies
 * GET /api/prerequisites/circular-dependencies
 */
router.get('/circular-dependencies', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await prerequisiteService.detectCircularDependencies();
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Analyze prerequisite impact
 * POST /api/prerequisites/:courseId/impact-analysis
 */
router.post('/:courseId/impact-analysis', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { newPrerequisites } = req.body;
    
    const analysis = await prerequisiteService.analyzePrerequisiteImpact(
      courseId,
      newPrerequisites
    );
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// Override Request Routes
// ============================================================================

/**
 * Submit prerequisite override request
 * POST /api/prerequisites/overrides
 * Requirement 3.5: WHEN overriding prerequisites THEN the system SHALL require proper authorization and documentation
 */
router.post('/overrides', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const override = await overrideService.submitOverrideRequest(req.body);
    
    res.status(201).json({
      success: true,
      data: override
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get override requests for a student
 * GET /api/prerequisites/overrides/student/:userId
 */
router.get('/overrides/student/:userId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const overrides = await overrideService.getStudentOverrides(userId);
    
    res.json({
      success: true,
      data: overrides
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get pending override requests (admin)
 * GET /api/prerequisites/overrides/pending
 */
router.get('/overrides/pending', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const overrides = await overrideService.getPendingOverrides();
    
    res.json({
      success: true,
      data: overrides
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Process override request (approve/deny)
 * POST /api/prerequisites/overrides/:overrideId/process
 */
router.post('/overrides/:overrideId/process', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { overrideId } = req.params;
    const override = await overrideService.processOverrideRequest({
      overrideId,
      ...req.body
    });
    
    res.json({
      success: true,
      data: override
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Revoke an approved override
 * POST /api/prerequisites/overrides/:overrideId/revoke
 */
router.post('/overrides/:overrideId/revoke', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { overrideId } = req.params;
    const { revokedBy, reason } = req.body;
    
    const override = await overrideService.revokeOverride(overrideId, revokedBy, reason);
    
    res.json({
      success: true,
      data: override
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get override statistics
 * GET /api/prerequisites/overrides/statistics
 */
router.get('/overrides/statistics', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.query;
    const statistics = await overrideService.getOverrideStatistics(courseId as string);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get override audit log
 * GET /api/prerequisites/overrides/:overrideId/audit-log
 */
router.get('/overrides/:overrideId/audit-log', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { overrideId } = req.params;
    const auditLog = await overrideService.getOverrideAuditLog(overrideId);
    
    res.json({
      success: true,
      data: auditLog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate override documentation template
 * GET /api/prerequisites/overrides/documentation-template
 */
router.get('/overrides/documentation-template', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, courseId, prerequisiteId } = req.query;
    
    const template = overrideService.generateDocumentationTemplate(
      userId as string,
      courseId as string,
      prerequisiteId as string
    );
    
    res.json({
      success: true,
      data: {
        template
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
