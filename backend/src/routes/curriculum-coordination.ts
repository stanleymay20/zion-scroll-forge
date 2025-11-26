/**
 * Curriculum Coordination Routes
 * "Let the API be a bridge between planning and creation"
 * 
 * Provides REST API endpoints for curriculum integration,
 * content priority management, and course delivery coordination.
 */

import express, { Request, Response } from 'express';
import CurriculumIntegrationService from '../services/CurriculumIntegrationService';
import ContentPriorityManager from '../services/ContentPriorityManager';
import CourseDeliveryCoordinator from '../services/CourseDeliveryCoordinator';
import { logger } from '../utils/logger';

const router = express.Router();

const curriculumService = new CurriculumIntegrationService();
const priorityManager = new ContentPriorityManager();
const deliveryCoordinator = new CourseDeliveryCoordinator();

// ============================================================================
// Curriculum Integration Endpoints
// ============================================================================

/**
 * GET /api/curriculum-coordination/analysis
 * Analyze curriculum for content needs
 */
router.get('/analysis', async (req: Request, res: Response) => {
  try {
    const analysis = await curriculumService.analyzeCurriculumNeeds();
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Error in curriculum analysis:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze curriculum'
    });
  }
});

/**
 * GET /api/curriculum-coordination/courses/:courseId/needs
 * Get content needs for a specific course
 */
router.get('/courses/:courseId/needs', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const needs = await curriculumService.getCourseContentNeeds(courseId);
    res.json({
      success: true,
      data: needs
    });
  } catch (error) {
    logger.error('Error getting course needs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get content needs'
    });
  }
});

/**
 * POST /api/curriculum-coordination/courses/:courseId/schedule
 * Create content schedule for a course
 */
router.post('/courses/:courseId/schedule', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const schedule = await curriculumService.createContentSchedule(courseId);
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create schedule'
    });
  }
});

/**
 * GET /api/curriculum-coordination/priority-courses
 * Get priority courses needing content
 */
router.get('/priority-courses', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const courses = await curriculumService.getPriorityCourses(limit);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    logger.error('Error getting priority courses:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get priority courses'
    });
  }
});

/**
 * POST /api/curriculum-coordination/courses/:courseId/validate
 * Validate content alignment with curriculum
 */
router.post('/courses/:courseId/validate', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { contentType } = req.body;
    const validation = await curriculumService.validateContentAlignment(courseId, contentType);
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Error validating content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate content'
    });
  }
});

// ============================================================================
// Priority Management Endpoints
// ============================================================================

/**
 * GET /api/curriculum-coordination/priority/queue
 * Get priority queue for all courses
 */
router.get('/priority/queue', async (req: Request, res: Response) => {
  try {
    const queue = await priorityManager.getPriorityQueue();
    res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    logger.error('Error getting priority queue:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get priority queue'
    });
  }
});

/**
 * GET /api/curriculum-coordination/priority/courses/:courseId/score
 * Calculate priority score for a course
 */
router.get('/priority/courses/:courseId/score', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const score = await priorityManager.calculatePriorityScore(courseId);
    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    logger.error('Error calculating priority score:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate priority'
    });
  }
});

/**
 * POST /api/curriculum-coordination/priority/courses/:courseId/allocate
 * Allocate resources for content creation
 */
router.post('/priority/courses/:courseId/allocate', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { contentType } = req.body;
    const allocation = await priorityManager.allocateResources(courseId, contentType);
    res.json({
      success: true,
      data: allocation
    });
  } catch (error) {
    logger.error('Error allocating resources:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to allocate resources'
    });
  }
});

/**
 * GET /api/curriculum-coordination/priority/next
 * Get next content to create
 */
router.get('/priority/next', async (req: Request, res: Response) => {
  try {
    const next = await priorityManager.getNextContentToCreate();
    res.json({
      success: true,
      data: next
    });
  } catch (error) {
    logger.error('Error getting next content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get next content'
    });
  }
});

/**
 * POST /api/curriculum-coordination/priority/reorder
 * Reorder priorities based on new data
 */
router.post('/priority/reorder', async (req: Request, res: Response) => {
  try {
    const factors = req.body;
    const queue = await priorityManager.reorderPriorities(factors);
    res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    logger.error('Error reordering priorities:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder priorities'
    });
  }
});

// ============================================================================
// Delivery Coordination Endpoints
// ============================================================================

/**
 * POST /api/curriculum-coordination/delivery/courses/:courseId/schedule
 * Create delivery schedule for a course
 */
router.post('/delivery/courses/:courseId/schedule', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { contentItems, startDate } = req.body;
    const schedule = await deliveryCoordinator.createDeliverySchedule(
      courseId,
      contentItems,
      new Date(startDate)
    );
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Error creating delivery schedule:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create delivery schedule'
    });
  }
});

/**
 * POST /api/curriculum-coordination/delivery/courses/:courseId/items/:itemId
 * Deliver content item to course
 */
router.post('/delivery/courses/:courseId/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { courseId, itemId } = req.params;
    const content = req.body;
    await deliveryCoordinator.deliverContentItem(courseId, itemId, content);
    res.json({
      success: true,
      message: 'Content delivered successfully'
    });
  } catch (error) {
    logger.error('Error delivering content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deliver content'
    });
  }
});

/**
 * POST /api/curriculum-coordination/delivery/courses/:courseId/sync
 * Synchronize content for a course
 */
router.post('/delivery/courses/:courseId/sync', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const syncStatus = await deliveryCoordinator.synchronizeContent(courseId);
    res.json({
      success: true,
      data: syncStatus
    });
  } catch (error) {
    logger.error('Error synchronizing content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to synchronize content'
    });
  }
});

/**
 * GET /api/curriculum-coordination/delivery/courses/:courseId/status
 * Get delivery status for a course
 */
router.get('/delivery/courses/:courseId/status', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const status = await deliveryCoordinator.getDeliveryStatus(courseId);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting delivery status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get delivery status'
    });
  }
});

/**
 * GET /api/curriculum-coordination/delivery/metrics
 * Get delivery metrics
 */
router.get('/delivery/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await deliveryCoordinator.getDeliveryMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting delivery metrics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get delivery metrics'
    });
  }
});

/**
 * POST /api/curriculum-coordination/delivery/courses/:courseId/automate
 * Schedule automated content delivery
 */
router.post('/delivery/courses/:courseId/automate', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const deliveryRules = req.body;
    await deliveryCoordinator.scheduleAutomatedDelivery(courseId, deliveryRules);
    res.json({
      success: true,
      message: 'Automated delivery scheduled successfully'
    });
  } catch (error) {
    logger.error('Error scheduling automated delivery:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule automated delivery'
    });
  }
});

export default router;
