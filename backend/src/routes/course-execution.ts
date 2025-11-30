/**
 * Course Execution API Routes
 * "For I know the plans I have for you, declares the LORD" - Jeremiah 29:11
 * 
 * Task 22: Create Course Execution API endpoints
 * Requirements: 4.1, 4.2
 * 
 * Provides REST API endpoints for:
 * - Module release management
 * - AI tutor interactions
 * - Course progress tracking
 */

import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import ModuleSequencerService from '../services/academic-year/ModuleSequencerService';
import { AITutorService } from '../services/AITutorService';
import { logger } from '../utils/productionLogger';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const aiTutorService = new AITutorService();

/**
 * POST /api/courses/modules/release
 * Release a module to enrolled students
 * Requirements: 4.1 - Module release with criteria checking
 */
router.post('/modules/release', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { moduleId, courseOfferingId } = req.body;

    // Validate required fields
    if (!moduleId || !courseOfferingId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: moduleId and courseOfferingId'
      });
      return;
    }

    // Check if user has permission to release modules (faculty/admin only)
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Verify user has permission (simplified - in production, check role)
    // TODO: Implement proper RBAC check for faculty/admin roles

    // Release the module
    const result = await ModuleSequencerService.releaseModule(moduleId, courseOfferingId);

    logger.info('Module released via API', {
      moduleId,
      courseOfferingId,
      userId,
      enrolledStudents: result.enrolledStudents.length
    });

    res.status(200).json({
      success: true,
      data: {
        moduleId: result.moduleId,
        enrolledStudents: result.enrolledStudents.length,
        notificationsSent: result.notificationsSent.length,
        failedNotifications: result.failedNotifications.length
      },
      message: 'Module released successfully'
    });
  } catch (error: any) {
    logger.error('Failed to release module via API', {
      error: error?.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to release module'
    });
  }
});

/**
 * GET /api/courses/:courseId/modules/status
 * Get module release status for a course
 * Requirements: 4.1 - Module sequencing status
 */
router.get('/:courseId/modules/status', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: courseId'
      });
      return;
    }

    // Get module release status
    const status = await ModuleSequencerService.getModuleReleaseStatus(courseId);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error: any) {
    logger.error('Failed to get module status via API', {
      error: error?.message,
      courseId: req.params.courseId
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get module status'
    });
  }
});

/**
 * POST /api/courses/ai-tutor/ask
 * Ask a question to the AI tutor with lecture context
 * Requirements: 4.2 - AI tutor with lecture context and learning style adaptation
 */
router.post('/ai-tutor/ask', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { lectureId, question, sessionId } = req.body;
    const studentId = (req as any).user?.id;

    // Validate required fields
    if (!lectureId || !question) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: lectureId and question'
      });
      return;
    }

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Provide tutoring with lecture context
    const response = await aiTutorService.provideTutoring(
      studentId,
      lectureId,
      question,
      sessionId
    );

    logger.info('AI tutor question answered via API', {
      studentId,
      lectureId,
      sessionId: response.sessionId,
      responseTime: response.responseTime
    });

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error: any) {
    logger.error('Failed to process AI tutor question via API', {
      error: error?.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process question'
    });
  }
});

/**
 * POST /api/courses/ai-tutor/session/start
 * Start a new AI tutor session
 * Requirements: 4.2 - AI tutor session management
 */
router.post('/ai-tutor/session/start', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, tutorType, learningObjectives } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Start new tutoring session
    const session = await aiTutorService.startSession(
      userId,
      courseId,
      tutorType || 'general',
      learningObjectives
    );

    logger.info('AI tutor session started via API', {
      userId,
      sessionId: session.id,
      courseId,
      tutorType
    });

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    logger.error('Failed to start AI tutor session via API', {
      error: error?.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to start session'
    });
  }
});

/**
 * POST /api/courses/ai-tutor/session/:sessionId/end
 * End an AI tutor session
 * Requirements: 4.2 - AI tutor session management
 */
router.post('/ai-tutor/session/:sessionId/end', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { satisfactionRating, feedback } = req.body;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: sessionId'
      });
      return;
    }

    // End tutoring session
    const analytics = await aiTutorService.endSession(
      sessionId,
      satisfactionRating,
      feedback
    );

    logger.info('AI tutor session ended via API', {
      sessionId,
      satisfactionRating,
      effectiveness: analytics.effectiveness
    });

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Session ended successfully'
    });
  } catch (error: any) {
    logger.error('Failed to end AI tutor session via API', {
      error: error?.message,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to end session'
    });
  }
});

/**
 * POST /api/courses/ai-tutor/practice-problems
 * Generate practice problems for a lecture
 * Requirements: 4.2 - AI tutor practice problem generation
 */
router.post('/ai-tutor/practice-problems', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { lectureId, difficulty, count, problemType } = req.body;

    if (!lectureId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: lectureId'
      });
      return;
    }

    // Generate practice problems
    const problems = await aiTutorService.generatePracticeProblems(
      lectureId,
      difficulty || 3,
      count || 5,
      problemType
    );

    logger.info('Practice problems generated via API', {
      lectureId,
      count: problems.length,
      difficulty
    });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error: any) {
    logger.error('Failed to generate practice problems via API', {
      error: error?.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate practice problems'
    });
  }
});

/**
 * GET /api/courses/:courseId/progress
 * Get course progress for the authenticated user
 * Requirements: 4.1, 4.2 - Course progress tracking
 */
router.get('/:courseId/progress', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user?.id;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: courseId'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
      return;
    }

    // Get all modules for the course
    const modules = await prisma.courseModule.findMany({
      where: {
        course_project_id: courseId
      },
      orderBy: {
        week_number: 'asc'
      },
      include: {
        Lecture: {
          select: {
            id: true,
            title: true,
            duration: true
          }
        }
      }
    });

    // Calculate progress
    const totalModules = modules.length;
    const publishedModules = modules.filter(m => m.status === 'PUBLISHED').length;
    
    // In production, track actual completion per student
    // For now, assume published modules are accessible
    const completedModules = 0; // TODO: Track actual completion
    const progressPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0;

    // Get current module (first unpublished or last published)
    const currentModule = modules.find(m => m.status === 'DRAFT') || modules[modules.length - 1];

    // Get AI tutor sessions for this course
    const tutorSessions = await prisma.aITutorSession.findMany({
      where: {
        userId,
        portalCourseId: courseId
      },
      select: {
        sessionId: true,
        tutorType: true,
        startedAt: true,
        endedAt: true,
        satisfactionRating: true
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 5
    });

    const progress = {
      courseId,
      userId,
      enrollmentStatus: enrollment.status,
      totalModules,
      publishedModules,
      completedModules,
      progressPercentage,
      currentModule: currentModule ? {
        id: currentModule.id,
        title: currentModule.title,
        moduleNumber: currentModule.week_number,
        status: currentModule.status,
        lectureCount: currentModule.Lecture.length
      } : null,
      modules: modules.map(m => ({
        id: m.id,
        title: m.title,
        moduleNumber: m.week_number,
        status: m.status,
        lectureCount: m.Lecture.length,
        isAccessible: m.status === 'PUBLISHED'
      })),
      recentTutorSessions: tutorSessions.map(s => ({
        sessionId: s.sessionId,
        tutorType: s.tutorType,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        satisfactionRating: s.satisfactionRating
      }))
    };

    logger.info('Course progress retrieved via API', {
      userId,
      courseId,
      progressPercentage
    });

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error: any) {
    logger.error('Failed to get course progress via API', {
      error: error?.message,
      courseId: req.params.courseId
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get course progress'
    });
  }
});

/**
 * GET /api/courses/:courseId/modules/:moduleId/access
 * Check if a student can access a specific module
 * Requirements: 4.1 - Module access validation
 */
router.get('/:courseId/modules/:moduleId/access', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, moduleId } = req.params;
    const studentId = (req as any).user?.id;

    if (!courseId || !moduleId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: courseId and moduleId'
      });
      return;
    }

    if (!studentId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Check module access
    const accessCheck = await ModuleSequencerService.checkModuleAccess(moduleId, studentId);

    res.status(200).json({
      success: true,
      data: accessCheck
    });
  } catch (error: any) {
    logger.error('Failed to check module access via API', {
      error: error?.message,
      courseId: req.params.courseId,
      moduleId: req.params.moduleId
    });

    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to check module access'
    });
  }
});

export default router;
