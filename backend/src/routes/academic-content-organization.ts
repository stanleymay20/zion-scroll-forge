/**
 * Academic Content Organization API Routes
 * Comprehensive API for managing 10,000+ courses across 396 degree programs
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AcademicContentOrganizationService } from '../services/AcademicContentOrganizationService';
import { Logger } from '../utils/logger';
import { CacheService } from '../services/CacheService';
import { AIGatewayService } from '../services/AIGatewayService';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const logger = new Logger('AcademicContentOrganization');
const cacheService = new CacheService();
const aiGateway = new AIGatewayService();

const academicService = new AcademicContentOrganizationService(
  prisma,
  logger,
  cacheService,
  aiGateway
);

// =====================================================
// FACULTY ROUTES
// =====================================================

/**
 * GET /api/academic/faculties
 * Get all faculties
 */
router.get('/faculties', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const faculties = await academicService.getAllFaculties();
    res.json({ success: true, data: faculties });
  } catch (error) {
    logger.error('Error fetching faculties:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch faculties' });
  }
});

/**
 * GET /api/academic/faculties/:id
 * Get faculty by ID
 */
router.get('/faculties/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await academicService.getFacultyById(req.params.id);
    if (!faculty) {
      res.status(404).json({ success: false, error: 'Faculty not found' });
      return;
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    logger.error('Error fetching faculty:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch faculty' });
  }
});

// =====================================================
// DEGREE PROGRAM ROUTES
// =====================================================

/**
 * POST /api/academic/degree-programs
 * Create a new degree program
 */
router.post('/degree-programs', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await academicService.createDegreeProgram(req.body);
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    logger.error('Error creating degree program:', error);
    res.status(500).json({ success: false, error: 'Failed to create degree program' });
  }
});

/**
 * GET /api/academic/degree-programs
 * Get degree programs with optional filters
 */
router.get('/degree-programs', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      facultyId: req.query.facultyId as string,
      degreeType: req.query.degreeType as string,
      status: req.query.status as string
    };
    const programs = await academicService.getDegreePrograms(filters);
    res.json({ success: true, data: programs });
  } catch (error) {
    logger.error('Error fetching degree programs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch degree programs' });
  }
});

// =====================================================
// COURSE ROUTES
// =====================================================

/**
 * POST /api/academic/courses
 * Create a new course
 */
router.post('/courses', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await academicService.createCourse(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({ success: false, error: 'Failed to create course' });
  }
});

/**
 * POST /api/academic/courses/generate
 * Generate course content using AI
 */
router.post('/courses/generate', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await academicService.generateCourseContent(req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (error) {
    logger.error('Error generating course content:', error);
    res.status(500).json({ success: false, error: 'Failed to generate course content' });
  }
});

/**
 * POST /api/academic/courses/bulk
 * Bulk create courses
 */
router.post('/courses/bulk', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await academicService.bulkCreateCourses(req.body.courses);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error bulk creating courses:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk create courses' });
  }
});

// =====================================================
// PROGRESS TRACKING ROUTES
// =====================================================

/**
 * POST /api/academic/progress
 * Update student progress
 */
router.post('/progress', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    await academicService.updateStudentProgress(req.body);
    res.json({ success: true, message: 'Progress updated successfully' });
  } catch (error) {
    logger.error('Error updating progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
});

// =====================================================
// SPIRITUAL FORMATION ROUTES
// =====================================================

/**
 * POST /api/academic/spiritual-activities
 * Create spiritual formation activity
 */
router.post('/spiritual-activities', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const activity = await academicService.createSpiritualFormationActivity(req.body);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    logger.error('Error creating spiritual activity:', error);
    res.status(500).json({ success: false, error: 'Failed to create spiritual activity' });
  }
});

// =====================================================
// ANALYTICS ROUTES
// =====================================================

/**
 * GET /api/academic/analytics/:contentType/:contentId
 * Get content analytics
 */
router.get('/analytics/:contentType/:contentId', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const analytics = await academicService.getContentAnalytics(
      req.params.contentType,
      req.params.contentId
    );
    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/academic/overview
 * Get system overview
 */
router.get('/overview', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const overview = await academicService.getSystemOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('Error fetching overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch overview' });
  }
});

export default router;
