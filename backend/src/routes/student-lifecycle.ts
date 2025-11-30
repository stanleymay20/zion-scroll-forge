/**
 * Student Lifecycle API Routes
 * "The Lord will guide you always; he will satisfy your needs in a sun-scorched land" - Isaiah 58:11
 * 
 * Task 13: Create Student Lifecycle API endpoints
 * Provides REST API for admission, registration, and graduation operations
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */

import express, { Request, Response } from 'express';
import { AdmissionService } from '../services/academic-year/AdmissionService';
import RegistrationService from '../services/academic-year/RegistrationService';
import GraduationService from '../services/academic-year/GraduationService';
import { logger } from '../utils/productionLogger';

const router = express.Router();

// Initialize services
const admissionService = new AdmissionService();

/**
 * POST /api/admissions/applications
 * Submit a new admission application
 * Requirements: 2.1
 */
router.post('/admissions/applications', async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
      return;
    }

    logger.info('Processing admission application via API', { applicationId });

    const result = await admissionService.processApplication(applicationId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in POST /admissions/applications', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to process application: ${errorMessage}`
    });
  }
});

/**
 * GET /api/admissions/applications/:id
 * Get admission application status and details
 * Requirements: 2.1
 */
router.get('/admissions/applications/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('Fetching admission application', { applicationId: id });

    // In production, this would fetch from database
    // For now, return mock data
    res.status(200).json({
      success: true,
      data: {
        id,
        applicantId: `applicant_${id}`,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        programApplied: 'theology_masters',
        applicationDate: new Date().toISOString(),
        status: 'under_review',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /admissions/applications/:id', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to fetch application: ${errorMessage}`
    });
  }
});

/**
 * POST /api/registration/enroll
 * Register student for courses
 * Requirements: 2.2, 2.3
 */
router.post('/registration/enroll', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, courseIds, semesterId } = req.body;

    if (!studentId || !courseIds || !semesterId) {
      res.status(400).json({
        success: false,
        error: 'Student ID, course IDs, and semester ID are required'
      });
      return;
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Course IDs must be a non-empty array'
      });
      return;
    }

    logger.info('Processing course registration via API', { 
      studentId, 
      courseCount: courseIds.length,
      semesterId
    });

    const results = await RegistrationService.registerForCourses(
      studentId,
      courseIds,
      semesterId
    );

    const allSuccessful = results.every(r => r.status === 'enrolled');
    const statusCode = allSuccessful ? 200 : 207; // 207 Multi-Status for partial success

    res.status(statusCode).json({
      success: allSuccessful,
      data: results,
      message: allSuccessful 
        ? 'All courses registered successfully' 
        : 'Some courses could not be registered'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in POST /registration/enroll', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to process registration: ${errorMessage}`
    });
  }
});

/**
 * GET /api/students/:id/degree-audit
 * Get comprehensive degree audit for a student
 * Requirements: 2.5
 */
router.get('/students/:id/degree-audit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: studentId } = req.params;

    logger.info('Generating degree audit via API', { studentId });

    const audit = await GraduationService.generateDegreeAudit(studentId);

    res.status(200).json({
      success: true,
      data: audit
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /students/:id/degree-audit', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to generate degree audit: ${errorMessage}`
    });
  }
});

/**
 * POST /api/graduation/evaluate
 * Evaluate graduation eligibility for a student
 * Requirements: 2.5
 */
router.post('/graduation/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
      return;
    }

    logger.info('Evaluating graduation eligibility via API', { studentId });

    const evaluation = await GraduationService.evaluateGraduationEligibility(studentId);

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in POST /graduation/evaluate', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to evaluate graduation eligibility: ${errorMessage}`
    });
  }
});

/**
 * GET /api/registration/validation
 * Validate student eligibility for course registration
 * Requirements: 2.2, 2.3
 */
router.get('/registration/validation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, courseId, semesterId } = req.query;

    if (!studentId || !courseId || !semesterId) {
      res.status(400).json({
        success: false,
        error: 'Student ID, course ID, and semester ID are required'
      });
      return;
    }

    logger.info('Validating registration eligibility via API', { 
      studentId, 
      courseId,
      semesterId
    });

    const validation = await RegistrationService.validateRegistrationEligibility(
      studentId as string,
      courseId as string,
      semesterId as string
    );

    res.status(200).json({
      success: true,
      data: validation
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /registration/validation', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to validate registration: ${errorMessage}`
    });
  }
});

/**
 * GET /api/registration/waitlist
 * Get waitlist information for a student and course
 * Requirements: 2.3
 */
router.get('/registration/waitlist', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, courseId, semesterId } = req.query;

    if (!studentId || !courseId || !semesterId) {
      res.status(400).json({
        success: false,
        error: 'Student ID, course ID, and semester ID are required'
      });
      return;
    }

    logger.info('Fetching waitlist info via API', { 
      studentId, 
      courseId,
      semesterId
    });

    const waitlistInfo = await RegistrationService.getWaitlistInfo(
      studentId as string,
      courseId as string,
      semesterId as string
    );

    if (waitlistInfo) {
      res.status(200).json({
        success: true,
        data: waitlistInfo
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Student not found on waitlist for this course'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /registration/waitlist', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to fetch waitlist info: ${errorMessage}`
    });
  }
});

/**
 * GET /api/graduation/timeline
 * Get graduation timeline with milestones for a student
 * Requirements: 2.5
 */
router.get('/graduation/timeline/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    logger.info('Generating graduation timeline via API', { studentId });

    const timeline = await GraduationService.getGraduationTimeline(studentId);

    res.status(200).json({
      success: true,
      data: timeline
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /graduation/timeline/:studentId', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to generate graduation timeline: ${errorMessage}`
    });
  }
});

/**
 * GET /api/registration/capacity
 * Get course capacity information
 * Requirements: 2.3
 */
router.get('/registration/capacity', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, semesterId } = req.query;

    if (!courseId || !semesterId) {
      res.status(400).json({
        success: false,
        error: 'Course ID and semester ID are required'
      });
      return;
    }

    logger.info('Fetching course capacity via API', { courseId, semesterId });

    const capacity = await RegistrationService.getCourseCapacity(
      courseId as string,
      semesterId as string
    );

    res.status(200).json({
      success: true,
      data: capacity
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /registration/capacity', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to fetch course capacity: ${errorMessage}`
    });
  }
});

/**
 * POST /api/admissions/spiritual-evaluation
 * Add spiritual evaluation to an application
 * Requirements: 2.1
 */
router.post('/admissions/spiritual-evaluation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { applicationId, evaluation } = req.body;

    if (!applicationId || !evaluation) {
      res.status(400).json({
        success: false,
        error: 'Application ID and evaluation data are required'
      });
      return;
    }

    logger.info('Adding spiritual evaluation via API', { applicationId });

    const result = await admissionService.addSpiritualEvaluation(applicationId, evaluation);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in POST /admissions/spiritual-evaluation', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to add spiritual evaluation: ${errorMessage}`
    });
  }
});

/**
 * GET /api/admissions/statistics
 * Get admission statistics for an academic year
 * Requirements: 2.1
 */
router.get('/admissions/statistics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { academicYearId } = req.query;

    logger.info('Fetching admission statistics via API', { academicYearId });

    const result = await admissionService.getAdmissionStatistics(
      academicYearId as string | undefined
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in GET /admissions/statistics', { error: errorMessage });
    res.status(500).json({
      success: false,
      error: `Failed to fetch admission statistics: ${errorMessage}`
    });
  }
});

export default router;
